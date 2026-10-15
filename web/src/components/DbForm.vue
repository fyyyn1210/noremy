<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { api, schemaOf, show, toLocalInput, fromLocalInput, type Prop, type Row } from '../api'

const props = defineProps<{ dbKey: string; row?: Row | null }>()
const emit = defineEmits<{ close: []; saved: [Row]; deleted: [string] }>()

const dlg = ref<HTMLDialogElement>()
const schema = ref<Prop[]>([])
const vals = reactive<Record<string, any>>({})
const dates = reactive<Record<string, { time: boolean; start: string; end: string }>>({})
const busy = ref(false)
const err = ref('')

// Snapshot awal per properti, supaya hanya yang berubah yang dikirim (format teks lain tidak tertimpa).
let original: Record<string, string> = {}

onMounted(async () => {
  dlg.value?.showModal()
  schema.value = await schemaOf(props.dbKey)
  for (const p of schema.value) {
    const v = props.row?.props[p.name] ?? (p.type === 'multi_select' ? [] : p.type === 'checkbox' ? false : null)
    vals[p.name] = Array.isArray(v) ? [...v] : v
    if (p.type === 'date') {
      const time = !!v?.start?.includes('T')
      const conv = (s?: string | null) => (!s ? '' : time ? toLocalInput(s) : s)
      dates[p.name] = { time, start: conv(v?.start), end: conv(v?.end) }
    }
  }
  original = Object.fromEntries(schema.value.map((p) => [p.name, JSON.stringify(collect(p))]))
})

function collect(p: Prop) {
  if (p.type !== 'date') return vals[p.name]
  const d = dates[p.name]
  if (!d.start) return null
  const conv = (s: string) => (!s ? null : d.time ? fromLocalInput(s) : s.slice(0, 10))
  return { start: conv(d.start), end: conv(d.end) }
}

function toggleTime(name: string) {
  const d = dates[name]
  d.time = !d.time
  const conv = (s: string) => (!s ? '' : d.time ? `${s.slice(0, 10)}T09:00` : s.slice(0, 10))
  d.start = conv(d.start)
  d.end = conv(d.end)
}

async function save() {
  busy.value = true
  err.value = ''
  try {
    const body: Record<string, any> = {}
    for (const p of schema.value) {
      if (p.readOnly) continue
      const v = collect(p)
      if (JSON.stringify(v) !== original[p.name]) body[p.name] = v
    }
    const row = props.row
      ? await api<Row>(`/db/${props.dbKey}/${props.row.id}`, 'PATCH', body)
      : await api<Row>(`/db/${props.dbKey}`, 'POST', body)
    emit('saved', row)
    dlg.value?.close()
  } catch (e: any) {
    err.value = e.message
  } finally {
    busy.value = false
  }
}

async function remove() {
  if (!props.row || !confirm(`Hapus "${props.row.title}"? (masuk Trash Notion)`)) return
  busy.value = true
  try {
    await api(`/db/${props.dbKey}/${props.row.id}`, 'DELETE')
    emit('deleted', props.row.id)
    dlg.value?.close()
  } catch (e: any) {
    err.value = e.message
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <dialog ref="dlg" @close="emit('close')">
    <form method="dialog" @submit.prevent="save">
      <header class="row">
        <strong>{{ row ? 'Edit' : 'Baru' }}</strong>
        <a v-if="row" :href="row.url" target="_blank" rel="noopener" class="muted">Notion ↗</a>
      </header>
      <p v-if="!schema.length" class="muted">Memuat…</p>
      <label v-for="p in schema" :key="p.name" class="field">
        <span>{{ p.name }}</span>
        <output v-if="p.readOnly">{{ show(row?.props[p.name], p.type) || '—' }}</output>
        <input v-else-if="p.type === 'title' || p.type === 'rich_text'" v-model="vals[p.name]" />
        <input v-else-if="p.type === 'number'" v-model="vals[p.name]" type="number" step="any" />
        <input v-else-if="p.type === 'checkbox'" v-model="vals[p.name]" type="checkbox" />
        <input v-else-if="p.type === 'url'" v-model="vals[p.name]" type="url" />
        <input v-else-if="p.type === 'email'" v-model="vals[p.name]" type="email" />
        <input v-else-if="p.type === 'phone_number'" v-model="vals[p.name]" type="tel" />
        <select v-else-if="p.type === 'select' || p.type === 'status'" v-model="vals[p.name]">
          <option :value="null">—</option>
          <option v-for="o in p.options" :key="o" :value="o">{{ o }}</option>
        </select>
        <select v-else-if="p.type === 'multi_select'" v-model="vals[p.name]" multiple>
          <option v-for="o in p.options" :key="o" :value="o">{{ o }}</option>
        </select>
        <span v-else-if="p.type === 'date'" class="row wrap">
          <input v-model="dates[p.name].start" :type="dates[p.name].time ? 'datetime-local' : 'date'" />
          <input v-model="dates[p.name].end" :type="dates[p.name].time ? 'datetime-local' : 'date'" aria-label="Sampai" />
          <button type="button" class="ghost" @click="toggleTime(p.name)">{{ dates[p.name].time ? 'Tanpa jam' : '+ Jam' }}</button>
        </span>
      </label>
      <p v-if="err" class="error">{{ err }}</p>
      <footer class="row">
        <button v-if="row" type="button" class="danger" :disabled="busy" @click="remove">Hapus</button>
        <span class="grow" />
        <button type="button" class="ghost" @click="dlg?.close()">Batal</button>
        <button type="submit" :disabled="busy">Simpan</button>
      </footer>
    </form>
  </dialog>
</template>
