<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { api, type Row } from '../../api'
import Markdown from '../../components/Markdown.vue'
import DbForm from '../../components/DbForm.vue'

type Page = { id: string; url: string; title: string; markdown: string }

const tab = ref<'pages' | 'db'>('pages')
const stack = ref<Page[]>([]) // riwayat halaman yang dibuka; [0] = 📓 Notes
const err = ref('')
const loading = ref(false)
const append = ref('')
const draft = ref<{ title: string; text: string } | null>(null)
const dbRows = ref<Row[]>([])
const editing = ref<Row | null | undefined>(undefined)

const current = () => stack.value[stack.value.length - 1]

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

const open = (id: string, reset = false) =>
  run(async () => {
    const p = await api<Page>(`/pages/${id}`)
    stack.value = reset ? [p] : [...stack.value, p]
    append.value = ''
  })

const reload = () =>
  run(async () => {
    stack.value.splice(-1, 1, await api<Page>(`/pages/${current().id}`))
  })

onMounted(async () => {
  const { id } = await api<{ id: string }>('/pages/notes')
  open(id, true)
})

const addText = () =>
  run(async () => {
    if (!append.value.trim()) return
    await api(`/pages/${current().id}`, 'PATCH', { text: append.value })
    append.value = ''
    await reload()
  })

const createPage = () =>
  run(async () => {
    if (!draft.value?.title.trim()) return
    const { id } = await api<{ id: string }>(`/pages/${current().id}/children`, 'POST', draft.value)
    draft.value = null
    await reload()
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
</script>

<template>
  <section>
    <nav class="pills">
      <button :class="{ active: tab === 'pages' }" @click="tab = 'pages'">📓 Notes</button>
      <button :class="{ active: tab === 'db' }" @click="showDb">Notes DB</button>
    </nav>
    <p v-if="err" class="error">{{ err }}</p>
    <p v-if="loading" class="muted">Memuat…</p>

    <template v-if="tab === 'pages' && current()">
      <div class="row">
        <button v-if="stack.length > 1" class="ghost" @click="stack.pop()">‹ Kembali</button>
        <h1 class="grow">{{ current().title }}</h1>
        <a :href="current().url" target="_blank" rel="noopener" class="muted">Notion ↗</a>
      </div>
      <Markdown :text="current().markdown" @open="open" />

      <form class="stack" @submit.prevent="addText">
        <textarea v-model="append" rows="3" placeholder="Tambah ke halaman ini (# judul, - list, - [ ] todo)…" />
        <div class="row">
          <button type="button" class="ghost" @click="draft = { title: '', text: '' }">+ Sub-halaman</button>
          <span class="grow" />
          <button :disabled="!append.trim()">Tambahkan</button>
        </div>
      </form>

      <form v-if="draft" class="stack card" @submit.prevent="createPage">
        <input v-model="draft.title" placeholder="Judul catatan baru" required />
        <textarea v-model="draft.text" rows="5" placeholder="Isi…" />
        <div class="row">
          <span class="grow" />
          <button type="button" class="ghost" @click="draft = null">Batal</button>
          <button>Buat</button>
        </div>
      </form>
    </template>

    <template v-if="tab === 'db'">
      <div class="row">
        <h1 class="grow">Notes DB</h1>
        <button @click="editing = null">+ Baru</button>
      </div>
      <ul class="list">
        <li v-for="r in dbRows" :key="r.id" class="row">
          <span class="grow" @click="openDbRow(r)">{{ r.title || 'Tanpa judul' }}</span>
          <small class="muted">{{ new Date(r.props['Created time']).toLocaleDateString('id-ID') }}</small>
          <button class="ghost" @click="editing = r">✎</button>
        </li>
      </ul>
      <DbForm
        v-if="editing !== undefined"
        db-key="notesDb"
        :row="editing"
        @close="editing = undefined"
        @saved="dbRows = []; showDb()"
        @deleted="(id) => (dbRows = dbRows.filter((r) => r.id !== id))"
      />
    </template>
  </section>
</template>
