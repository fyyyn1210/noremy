<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { api, schemaOf, show, fmtDate, toLocalInput, fromLocalInput, DB_LABEL, type Prop, type Row } from '../api'
import Icon from './Icon.vue'

const props = defineProps<{ dbKey: string; row?: Row | null; defaults?: Record<string, any> }>()
const emit = defineEmits<{ close: []; saved: [Row]; deleted: [string] }>()

const dlg = ref<HTMLDialogElement>()
const schema = ref<Prop[]>([])
const vals = reactive<Record<string, any>>({})
const dates = reactive<Record<string, { time: boolean; start: string; end: string }>>({})
const busy = ref(false)
const err = ref('')

// Snapshot awal per properti, supaya hanya yang berubah yang dikirim (format teks lain tidak tertimpa).
let original: Record<string, string> = {}

const titleProp = computed(() => schema.value.find((p) => p.type === 'title'))
const fields = computed(() => schema.value.filter((p) => p.type !== 'title'))
// Kartu menonjol: tanggal pertama yang terisi (jatuh tempo, sesi berikutnya, dst.).
const hero = computed(() => {
  const p = schema.value.find((p) => p.type === 'date' && props.row?.props[p.name]?.start)
  if (!p) return null
  const v = props.row!.props[p.name]
  const time = v.start.includes('T')
    ? new Date(v.start).toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit' })
    : null
  return { name: p.name, big: time ?? fmtDate({ start: v.start, end: null }), sub: time ? fmtDate({ start: v.start.slice(0, 10), end: null }) : '' }
})

onMounted(async () => {
  dlg.value?.showModal()
  schema.value = await schemaOf(props.dbKey)
  const src = props.row?.props ?? props.defaults ?? {}
  for (const p of schema.value) {
    const v = src[p.name] ?? (p.type === 'multi_select' ? [] : p.type === 'checkbox' ? false : null)
    vals[p.name] = Array.isArray(v) ? [...v] : v
    if (p.type === 'date') {
      const time = !!v?.start?.includes('T')
      const conv = (s?: string | null) => (!s ? '' : time ? toLocalInput(s) : s)
      dates[p.name] = { time, start: conv(v?.start), end: conv(v?.end) }
    }
  }
  // Baris baru: semua nilai awal (termasuk defaults) ikut terkirim.
  original = props.row ? Object.fromEntries(schema.value.map((p) => [p.name, JSON.stringify(collect(p))])) : {}
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

// Tutup saat klik backdrop (di atas sheet), bukan padding sheet.
function backdrop(e: MouseEvent) {
  if (e.target === dlg.value && e.clientY < dlg.value!.getBoundingClientRect().top) dlg.value!.close()
}
</script>

<template>
  <dialog ref="dlg" class="sheet" :aria-label="row ? `Edit ${row.title}` : `Baru di ${DB_LABEL[dbKey] ?? dbKey}`" @close="emit('close')" @click="backdrop">
    <form @submit.prevent="save">
      <span class="grabber" />
      <div class="row small muted">
        <Icon name="db" :size="16" />
        <span class="grow">{{ DB_LABEL[dbKey] ?? dbKey }}</span>
        <button v-if="row" type="button" class="btn danger" :disabled="busy" @click="remove">Hapus</button>
      </div>

      <p v-if="!schema.length" class="muted">Memuat…</p>
      <input
        v-if="titleProp"
        v-model="vals[titleProp.name]"
        :aria-label="titleProp.name"
        placeholder="Judul"
        style="border: 0; background: transparent; outline: none; font-size: 24px; font-weight: 800; letter-spacing: -0.4px; padding: 0; width: 100%"
      />

      <div v-if="hero" class="float-card">
        <span class="tile"><Icon name="clock" :size="24" :width="2.2" /></span>
        <div class="grow">
          <span class="small muted" style="font-weight: 600">{{ hero.name }}</span>
          <div class="big">{{ hero.big }}</div>
        </div>
        <span v-if="hero.sub" class="small muted" style="font-weight: 700; text-align: right">{{ hero.sub }}</span>
      </div>

      <label v-for="p in fields" :key="p.name" class="field">
        <span>{{ p.name }}</span>
        <output v-if="p.readOnly">{{ show(row?.props[p.name], p.type) || '—' }}</output>
        <input v-else-if="p.type === 'rich_text'" v-model="vals[p.name]" />
        <input v-else-if="p.type === 'number'" v-model="vals[p.name]" type="number" step="any" />
        <span v-else-if="p.type === 'checkbox'" class="row" style="min-height: 46px">
          <input v-model="vals[p.name]" type="checkbox" />
          <b style="font-size: 15px">{{ vals[p.name] ? 'Ya' : 'Belum' }}</b>
        </span>
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
        <span v-else-if="p.type === 'date'" class="stack" style="gap: 6px">
          <span class="row">
            <input v-model="dates[p.name].start" :type="dates[p.name].time ? 'datetime-local' : 'date'" :aria-label="`${p.name} mulai`" />
            <button type="button" class="btn outline" style="min-height: 46px; padding: 0 12px; flex: none" @click="toggleTime(p.name)">
              {{ dates[p.name].time ? 'Tanpa jam' : '+ Jam' }}
            </button>
          </span>
          <input v-model="dates[p.name].end" :type="dates[p.name].time ? 'datetime-local' : 'date'" :aria-label="`${p.name} sampai (opsional)`" placeholder="Sampai" />
        </span>
      </label>

      <p v-if="err" class="error" role="alert">{{ err }}</p>
      <div class="sheet-actions">
        <a v-if="row" class="btn outline" :href="row.url" target="_blank" rel="noopener"><Icon name="external" :size="16" />Notion</a>
        <button v-else type="button" class="btn outline" @click="dlg?.close()">Batal</button>
        <button type="submit" class="btn" :disabled="busy">Simpan</button>
      </div>
    </form>
  </dialog>
</template>
