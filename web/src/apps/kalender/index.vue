<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { api, DB_LABEL, todayWIB, type Row } from '../../api'
import DbForm from '../../components/DbForm.vue'

type Item = { source: string; id: string; url: string; title: string; start: string; end: string | null }

const today = todayWIB()
const month = ref(today.slice(0, 7)) // "YYYY-MM"
const items = ref<Item[]>([])
const err = ref('')
const loading = ref(false)
const picked = ref<string | null>(null)
const editing = ref<{ key: string; row: Row } | null>(null)

const ymd = (d: Date) => d.toISOString().slice(0, 10)
// 42 sel (6 minggu), mulai Senin. Hitung di UTC supaya tidak terpengaruh zona perangkat.
const cells = computed(() => {
  const first = new Date(month.value + '-01T00:00:00Z')
  const start = new Date(first)
  start.setUTCDate(1 - ((first.getUTCDay() + 6) % 7))
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start)
    d.setUTCDate(start.getUTCDate() + i)
    return ymd(d)
  })
})

// Item tampil di setiap hari dalam rentangnya.
const byDay = computed(() => {
  const m: Record<string, Item[]> = {}
  for (const it of items.value) {
    const s = it.start.slice(0, 10)
    const e = (it.end ?? it.start).slice(0, 10)
    for (const d of cells.value) if (d >= s && d <= e) (m[d] ??= []).push(it)
  }
  return m
})

async function load() {
  loading.value = true
  err.value = ''
  try {
    items.value = await api<Item[]>(`/calendar?from=${cells.value[0]}&to=${cells.value[41]}`)
  } catch (e: any) {
    err.value = e.message
  } finally {
    loading.value = false
  }
}
watch(month, load, { immediate: true })

function shift(n: number) {
  const d = new Date(month.value + '-01T00:00:00Z')
  d.setUTCMonth(d.getUTCMonth() + n)
  month.value = ymd(d).slice(0, 7)
  picked.value = null
}

async function open(it: Item) {
  try {
    editing.value = { key: it.source, row: await api<Row>(`/db/${it.source}/${it.id}`) }
  } catch (e: any) {
    err.value = e.message
  }
}

const label = computed(() =>
  new Date(month.value + '-01T00:00:00Z').toLocaleDateString('id-ID', { month: 'long', year: 'numeric', timeZone: 'UTC' }),
)
</script>

<template>
  <section>
    <div class="row">
      <button class="ghost" aria-label="Bulan sebelumnya" @click="shift(-1)">‹</button>
      <h1 class="grow center">{{ label }}</h1>
      <button class="ghost" aria-label="Bulan berikutnya" @click="shift(1)">›</button>
    </div>
    <p v-if="err" class="error">{{ err }}</p>
    <div class="cal" :class="{ loading }">
      <b v-for="d in ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']" :key="d">{{ d }}</b>
      <button
        v-for="d in cells"
        :key="d"
        class="day"
        :class="{ out: !d.startsWith(month), today: d === today, picked: d === picked }"
        @click="picked = d"
      >
        <span>{{ +d.slice(8) }}</span>
        <i v-for="it in (byDay[d] ?? []).slice(0, 4)" :key="it.id" :class="`dot src-${it.source}`" />
      </button>
    </div>
    <p class="legend">
      <span v-for="k in ['habits', 'tasks', 'learning', 'learningMode', 'english']" :key="k">
        <i :class="`dot src-${k}`" /> {{ DB_LABEL[k] }}
      </span>
    </p>
    <template v-if="picked">
      <h2>{{ new Date(picked + 'T00:00:00Z').toLocaleDateString('id-ID', { dateStyle: 'full', timeZone: 'UTC' }) }}</h2>
      <p v-if="!byDay[picked]?.length" class="muted">Kosong.</p>
      <ul class="list">
        <li v-for="it in byDay[picked]" :key="it.id" class="row" @click="open(it)">
          <i :class="`dot src-${it.source}`" />
          <span class="grow">{{ it.title || 'Tanpa judul' }}</span>
          <small v-if="it.start.includes('T')">{{ new Date(it.start).toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', timeStyle: 'short' }) }}</small>
          <small class="muted">{{ DB_LABEL[it.source] }}</small>
        </li>
      </ul>
    </template>
    <DbForm v-if="editing" :db-key="editing.key" :row="editing.row" @close="editing = null" @saved="load" @deleted="load" />
  </section>
</template>
