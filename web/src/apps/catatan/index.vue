<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { api, type Row } from '../../api'
import Markdown from '../../components/Markdown.vue'
import DbForm from '../../components/DbForm.vue'
import Icon from '../../components/Icon.vue'

type Page = { id: string; url: string; title: string; markdown: string }
type Child = { id: string; type: string; title: string }

const tab = ref<'pages' | 'db'>('pages')
const rootId = ref('')
const children = ref<Child[]>([])
const stack = ref<Page[]>([]) // halaman yang sedang dibuka (kosong = daftar 📓 Notes)
const err = ref('')
const loading = ref(false)
const q = ref('')
const append = ref('')
const draft = ref<{ title: string; text: string } | null>(null)
const dbRows = ref<Row[]>([])
const editing = ref<Row | null | undefined>(undefined)

// Terakhir dibuka: kenyamanan per perangkat, boleh hilang.
const readLast = () => {
  try { return JSON.parse(localStorage.getItem('lastNote') ?? 'null') as { id: string; title: string } | null } catch { return null }
}
const last = ref(readLast())

const current = computed(() => stack.value[stack.value.length - 1])
const filtered = computed(() =>
  children.value.filter((c) => c.type === 'child_page' && c.title.toLowerCase().includes(q.value.toLowerCase())),
)
const TINTS = ['orange', 'blue', 'purple', 'green', 'pink']
const tint = (i: number) => `background: color-mix(in srgb, var(--${TINTS[i % 5]}) 15%, transparent); color: var(--${TINTS[i % 5]}${TINTS[i % 5] === 'pink' ? '' : '-ink'})`

async function run(fn: () => Promise<void>) {
  loading.value = true
  err.value = ''
  try {
    await fn()
  } catch (e: any) {
    err.value = e.message
  } finally {
    loading.value = false
  }
}

const open = (id: string) =>
  run(async () => {
    const p = await api<Page>(`/pages/${id}`)
    stack.value = [...stack.value, p]
    append.value = ''
    draft.value = null
    last.value = { id: p.id, title: p.title }
    try { localStorage.setItem('lastNote', JSON.stringify(last.value)) } catch {}
  })

const reload = () =>
  run(async () => {
    if (current.value) stack.value.splice(-1, 1, await api<Page>(`/pages/${current.value.id}`))
    else children.value = await api<Child[]>(`/pages/${rootId.value}/children`)
  })

onMounted(() =>
  run(async () => {
    rootId.value = (await api<{ id: string }>('/pages/notes')).id
    children.value = await api<Child[]>(`/pages/${rootId.value}/children`)
  }),
)

const addText = () =>
  run(async () => {
    if (!append.value.trim() || !current.value) return
    await api(`/pages/${current.value.id}`, 'PATCH', { text: append.value })
    append.value = ''
    stack.value.splice(-1, 1, await api<Page>(`/pages/${current.value.id}`))
  })

const createPage = () =>
  run(async () => {
    if (!draft.value?.title.trim()) return
    const parent = current.value?.id ?? rootId.value
    const { id } = await api<{ id: string }>(`/pages/${parent}/children`, 'POST', draft.value)
    draft.value = null
    if (!current.value) children.value = await api<Child[]>(`/pages/${rootId.value}/children`)
    await open(id)
  })

async function showDb() {
  tab.value = 'db'
  if (!dbRows.value.length) await run(async () => void (dbRows.value = (await api<{ rows: Row[] }>('/db/notesDb')).rows))
}
function openDbRow(r: Row) {
  tab.value = 'pages'
  open(r.id)
}
function fab() {
  if (tab.value === 'db') editing.value = null
  else draft.value = { title: '', text: '' }
}
</script>

<template>
  <main class="screen">
    <!-- Halaman terbuka -->
    <template v-if="tab === 'pages' && current">
      <header class="head">
        <button class="icon-btn" aria-label="Kembali" @click="stack.pop()"><Icon name="left" :size="20" :width="2.2" /></button>
        <a class="btn outline" style="min-height: 40px" :href="current.url" target="_blank" rel="noopener"><Icon name="external" :size="16" />Notion</a>
      </header>
      <h1>{{ current.title }}</h1>
      <p v-if="err" class="error" role="alert">{{ err }}</p>
      <article class="card md"><Markdown :text="current.markdown" @open="open" /></article>
      <form class="card stack" @submit.prevent="addText">
        <label class="field">
          <span>Tambah ke halaman ini</span>
          <textarea v-model="append" class="box" rows="3" placeholder="# judul, - list, - [ ] todo" />
        </label>
        <button class="btn" :disabled="!append.trim() || loading">Tambahkan</button>
      </form>
    </template>

    <!-- Daftar -->
    <template v-else>
      <header class="head"><h1>Catatan</h1></header>
      <label v-if="tab === 'pages'" class="input">
        <Icon name="search" :size="18" />
        <input v-model="q" type="search" placeholder="Cari catatan" aria-label="Cari catatan" />
      </label>
      <div class="seg" role="tablist">
        <button role="tab" :aria-selected="tab === 'pages'" @click="tab = 'pages'">Notes</button>
        <button role="tab" :aria-selected="tab === 'db'" @click="showDb">Notes DB</button>
      </div>
      <p v-if="err" class="error" role="alert">{{ err }}</p>

      <template v-if="tab === 'pages'">
        <section v-if="last && !q" class="card dark stack" style="border-radius: 24px; padding: 18px">
          <span class="small" style="font-weight: 700; letter-spacing: 0.4px; opacity: 0.7">TERAKHIR DIBUKA</span>
          <span style="font-size: 20px; font-weight: 800; letter-spacing: -0.3px">{{ last.title }}</span>
          <button class="btn" style="align-self: flex-end; min-height: 40px; background: var(--on-ink); color: var(--ink)" @click="open(last.id)">
            Lanjut baca <Icon name="right" :size="14" :width="2.4" />
          </button>
        </section>
        <div class="section-head"><h2>Semua halaman</h2></div>
        <p v-if="loading && !children.length" class="muted">Memuat…</p>
        <ul class="list">
          <li v-for="(c, i) in filtered" :key="c.id">
            <button class="item" style="width: 100%; border: 0; text-align: left; cursor: pointer; font: inherit; color: inherit" @click="open(c.id)">
              <span class="tile sm" :style="tint(i)">{{ c.title.charAt(0) || '?' }}</span>
              <span class="grow title" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ c.title || 'Tanpa judul' }}</span>
              <Icon name="right" :size="18" style="color: var(--faint)" />
            </button>
          </li>
        </ul>
      </template>

      <template v-else>
        <ul class="list">
          <li v-for="r in dbRows" :key="r.id" class="item">
            <button class="grow" style="all: unset; flex: 1; min-width: 0; cursor: pointer" @click="openDbRow(r)">
              <span class="title">{{ r.title || 'Tanpa judul' }}</span>
              <span class="sub">{{ new Date(r.props['Created time']).toLocaleDateString('id-ID', { dateStyle: 'medium' }) }}</span>
            </button>
            <button class="icon-btn" style="box-shadow: none; background: var(--soft)" :aria-label="`Properti ${r.title}`" @click="editing = r">
              <Icon name="db" :size="18" />
            </button>
          </li>
        </ul>
        <p v-if="loading" class="muted">Memuat…</p>
      </template>
    </template>

    <!-- Catatan baru (sub-halaman dari halaman terbuka, atau di 📓 Notes) -->
    <form v-if="draft" class="card stack" @submit.prevent="createPage">
      <h2>Catatan baru{{ current ? ` di ${current.title}` : '' }}</h2>
      <label class="field"><span>Judul</span><input v-model="draft.title" required /></label>
      <label class="field"><span>Isi</span><textarea v-model="draft.text" class="box" rows="5" /></label>
      <div class="row">
        <button type="button" class="btn outline grow" @click="draft = null">Batal</button>
        <button class="btn grow" :disabled="loading">Buat</button>
      </div>
    </form>

    <button v-if="!draft" class="fab" :aria-label="tab === 'db' ? 'Tambah ke Notes DB' : 'Catatan baru'" @click="fab"><Icon name="plus" :size="24" :width="2.4" /></button>
    <DbForm
      v-if="editing !== undefined"
      db-key="notesDb"
      :row="editing"
      @close="editing = undefined"
      @saved="dbRows = []; showDb()"
      @deleted="(id) => (dbRows = dbRows.filter((r) => r.id !== id))"
    />
  </main>
</template>
