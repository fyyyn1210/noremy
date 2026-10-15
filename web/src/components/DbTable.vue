<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { api, schemaOf, show, type Prop, type Row } from '../api'
import DbForm from './DbForm.vue'

const props = defineProps<{ dbKey: string }>()

const schema = ref<Prop[]>([])
const rows = ref<Row[]>([])
const next = ref<string | null>(null)
const loading = ref(false)
const err = ref('')
const q = ref('')
const editing = ref<Row | null | undefined>(undefined) // undefined = tutup, null = baru

// Kolom ringkas: semua kecuali title, yang ada nilainya ditampilkan sebagai chip.
const cols = computed(() => schema.value.filter((p) => p.type !== 'title'))
const shown = computed(() =>
  q.value ? rows.value.filter((r) => r.title.toLowerCase().includes(q.value.toLowerCase())) : rows.value,
)

async function load(more = false) {
  loading.value = true
  err.value = ''
  try {
    const r = await api<{ rows: Row[]; next: string | null }>(
      `/db/${props.dbKey}` + (more && next.value ? `?cursor=${next.value}` : ''),
    )
    rows.value = more ? [...rows.value, ...r.rows] : r.rows
    next.value = r.next
  } catch (e: any) {
    err.value = e.message
  } finally {
    loading.value = false
  }
}

watch(
  () => props.dbKey,
  async (k) => {
    rows.value = []
    schema.value = await schemaOf(k)
    load()
  },
  { immediate: true },
)

function saved(r: Row) {
  const i = rows.value.findIndex((x) => x.id === r.id)
  i >= 0 ? rows.value.splice(i, 1, r) : rows.value.unshift(r)
}
</script>

<template>
  <section>
    <div class="row">
      <input v-model="q" type="search" placeholder="Cari judul…" class="grow" />
      <button @click="editing = null">+ Baru</button>
    </div>
    <p v-if="err" class="error">{{ err }}</p>
    <ul class="list">
      <li v-for="r in shown" :key="r.id" @click="editing = r">
        <strong>{{ r.title || 'Tanpa judul' }}</strong>
        <span class="chips">
          <template v-for="c in cols" :key="c.name">
            <small v-if="show(r.props[c.name], c.type)" class="chip">
              <b>{{ c.name }}</b> {{ show(r.props[c.name], c.type) }}
            </small>
          </template>
        </span>
      </li>
    </ul>
    <p v-if="loading" class="muted">Memuat…</p>
    <button v-else-if="next" class="ghost" @click="load(true)">Muat lagi</button>
    <DbForm
      v-if="editing !== undefined"
      :db-key="dbKey"
      :row="editing"
      @close="editing = undefined"
      @saved="saved"
      @deleted="(id) => (rows = rows.filter((r) => r.id !== id))"
    />
  </section>
</template>
