<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { api, schemaOf, show, type Prop, type Row } from '../api'
import DbForm from './DbForm.vue'
import Icon from './Icon.vue'

const props = defineProps<{ dbKey: string; readOnly?: boolean }>()

const schema = ref<Prop[]>([])
const rows = ref<Row[]>([])
const next = ref<string | null>(null)
const loading = ref(false)
const err = ref('')
const q = ref('')
const editing = ref<Row | null | undefined>(undefined) // undefined = tutup, null = baru

// Chip ringkas: properti selain title yang punya nilai, maksimal 4.
const cols = computed(() => schema.value.filter((p) => p.type !== 'title'))
const chips = (r: Row) =>
  cols.value
    .map((c) => ({ name: c.name, v: show(r.props[c.name], c.type) }))
    .filter((c) => c.v)
    .slice(0, 4)
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
    try {
      schema.value = await schemaOf(k)
    } catch (e: any) {
      err.value = e.message
    }
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
  <div class="stack">
    <label class="input">
      <Icon name="search" :size="18" />
      <input v-model="q" type="search" placeholder="Cari judul" aria-label="Cari judul" />
    </label>
    <p v-if="err" class="error" role="alert">{{ err }}</p>
    <ul class="list">
      <li v-for="r in shown" :key="r.id" class="item">
        <button class="grow" style="all: unset; flex: 1; min-width: 0; cursor: pointer" @click="editing = r">
          <span class="title">{{ r.title || 'Tanpa judul' }}</span>
          <span class="chips">
            <small v-for="c in chips(r)" :key="c.name" class="chip"><b>{{ c.name }}</b> {{ c.v }}</small>
          </span>
        </button>
        <Icon name="right" :size="18" style="color: var(--faint)" />
      </li>
    </ul>
    <p v-if="!loading && !shown.length && !err" class="muted center">Kosong.</p>
    <p v-if="loading" class="muted center">Memuat…</p>
    <button v-else-if="next" class="btn outline" @click="load(true)">Muat lagi</button>
    <button v-if="!readOnly" class="fab" aria-label="Tambah baris" @click="editing = null"><Icon name="plus" :size="24" :width="2.4" /></button>
    <DbForm
      v-if="editing !== undefined"
      :db-key="dbKey"
      :row="editing"
      @close="editing = undefined"
      @saved="saved"
      @deleted="(id) => (rows = rows.filter((r) => r.id !== id))"
    />
  </div>
</template>
