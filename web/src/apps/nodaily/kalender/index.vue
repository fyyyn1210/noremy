<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { api, DB_LABEL, todayWIB, type Row } from '../../../api'
import DbForm from '../../../components/DbForm.vue'
import Icon from '../../../components/Icon.vue'

type Item = { source: string; id: string; url: string; title: string; start: string; end: string | null }

const today = todayWIB()
const month = ref(today.slice(0, 7)) // "YYYY-MM"
const items = ref<Item[]>([])
const err = ref('')
const loading = ref(false)
const picked = ref(today)
const editing = ref<{ key: string; row: Row | null; defaults?: Record<string, any> } | null>(null)

const SOURCES = ['habits', 'tasks', 'learning', 'learningMode', 'english']
const WD = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
const ymd = (d: Date) => d.toISOString().slice(0, 10)

// 42 sel (6 minggu), mulai Senin. Dihitung di UTC supaya tidak terpengaruh zona perangkat.
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
// Satu titik per sumber per hari.
const dots = (d: string) => [...new Set((byDay.value[d] ?? []).map((i) => i.source))]

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
const pickedLabel = computed(() =>
  new Date(picked.value + 'T00:00:00Z').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }),
)
const timeOf = (s: string) =>
  s.includes('T') ? new Date(s).toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit' }) : 'Seharian'
</script>

<template>
  <main class="screen">
    <header class="head">
      <button class="icon-btn" aria-label="Bulan sebelumnya" @click="shift(-1)"><Icon name="left" :size="20" :width="2.2" /></button>
      <h1 style="font-size: 20px">{{ label }}</h1>
      <button class="icon-btn" aria-label="Bulan berikutnya" @click="shift(1)"><Icon name="right" :size="20" :width="2.2" /></button>
    </header>
    <p v-if="err" class="error" role="alert">{{ err }}</p>

    <section class="card lg cal-card" :style="{ opacity: loading ? 0.6 : 1 }">
      <div class="cal">
        <span v-for="w in WD" :key="w" class="wd">{{ w }}</span>
        <button
          v-for="d in cells" :key="d" class="day"
          :class="{ out: !d.startsWith(month), today: d === today, picked: d === picked }"
          :aria-label="`${d}, ${byDay[d]?.length ?? 0} item`" :aria-pressed="d === picked"
          @click="picked = d"
        >
          <span class="num">{{ +d.slice(8) }}</span>
          <span class="dots"><i v-for="s in dots(d)" :key="s" class="dot" :class="`src-${s}`" /></span>
        </button>
      </div>
    </section>

    <div class="legend">
      <span v-for="k in SOURCES" :key="k"><i class="dot" :class="`src-${k}`" />{{ DB_LABEL[k] }}</span>
    </div>

    <div class="section-head"><h2 style="text-transform: capitalize">{{ pickedLabel }}</h2></div>
    <p v-if="!byDay[picked]?.length" class="muted">Tidak ada jadwal.</p>
    <ul class="list">
      <li v-for="it in byDay[picked]" :key="it.id" class="item">
        <span class="bar" :class="`src-${it.source}`" />
        <button class="grow" style="all: unset; flex: 1; min-width: 0; cursor: pointer" @click="open(it)">
          <span class="title">{{ it.title || 'Tanpa judul' }}</span>
          <span class="sub">{{ DB_LABEL[it.source] }}</span>
        </button>
        <span class="small" style="font-weight: 700; color: var(--muted)">{{ timeOf(it.start) }}</span>
      </li>
    </ul>

    <button class="fab" aria-label="Tambah task di tanggal ini" @click="editing = { key: 'tasks', row: null, defaults: { 'Due Date': { start: picked, end: null } } }">
      <Icon name="plus" :size="24" :width="2.4" />
    </button>
    <DbForm v-if="editing" :db-key="editing.key" :row="editing.row" :defaults="editing.defaults" @close="editing = null" @saved="load" @deleted="load" />
  </main>
</template>
