<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { api, fmtDate, schemaOf, type Row } from '../../api'
import DbForm from '../../components/DbForm.vue'

type Today = { today: string; habits: Row[]; tasks: Row[]; learning: Row[] }

const data = ref<Today | null>(null)
const err = ref('')
const statuses = ref<string[]>([])
const newTask = ref('')
const editing = ref<{ key: string; row: Row } | null>(null)

const minutes = (t?: string) => {
  const m = t?.match(/^(\d{1,2})[.:](\d{2})/)
  return m ? +m[1] * 60 + +m[2] : 9999
}
const habits = computed(() => [...(data.value?.habits ?? [])].sort((a, b) => minutes(a.props.Time) - minutes(b.props.Time)))

async function load() {
  err.value = ''
  try {
    data.value = await api<Today>('/today')
  } catch (e: any) {
    err.value = e.message
  }
}

onMounted(async () => {
  load()
  statuses.value = (await schemaOf('habits')).find((p) => p.name === 'Status')?.options ?? []
})

async function setStatus(h: Row, v: string) {
  const old = h.props.Status
  h.props.Status = v
  try {
    await api(`/db/habits/${h.id}`, 'PATCH', { Status: v })
  } catch (e: any) {
    h.props.Status = old
    err.value = e.message
  }
}

async function done(t: Row) {
  try {
    await api(`/db/tasks/${t.id}`, 'PATCH', { Done: true })
    data.value!.tasks = data.value!.tasks.filter((x) => x.id !== t.id)
  } catch (e: any) {
    err.value = e.message
  }
}

async function addTask() {
  if (!newTask.value.trim()) return
  try {
    const row = await api<Row>('/db/tasks', 'POST', {
      Name: newTask.value.trim(),
      'Due Date': { start: data.value?.today, end: null },
    })
    data.value?.tasks.push(row)
    newTask.value = ''
  } catch (e: any) {
    err.value = e.message
  }
}

function saved(r: Row) {
  if (!editing.value || !data.value) return
  const list = editing.value.key === 'habits' ? data.value.habits : editing.value.key === 'tasks' ? data.value.tasks : data.value.learning
  const i = list.findIndex((x) => x.id === r.id)
  if (i >= 0) list.splice(i, 1, r)
}
</script>

<template>
  <section>
    <div class="row">
      <h1 class="grow">Hari ini</h1>
      <button class="ghost" @click="load">↻</button>
    </div>
    <p v-if="err" class="error">{{ err }}</p>
    <p v-if="!data && !err" class="muted">Memuat…</p>

    <template v-if="data">
      <h2>Habit</h2>
      <p v-if="!habits.length" class="muted">Belum ada habit hari ini.</p>
      <ul class="list">
        <li v-for="h in habits" :key="h.id" class="row" :class="{ done: h.props.Status === 'Done' }">
          <span class="time">{{ h.props.Time || '—' }}</span>
          <span class="grow" @click="editing = { key: 'habits', row: h }">{{ h.title }}</span>
          <select :value="h.props.Status" @change="setStatus(h, ($event.target as HTMLSelectElement).value)">
            <option v-for="s in statuses" :key="s">{{ s }}</option>
          </select>
        </li>
      </ul>

      <h2>Tasks</h2>
      <form class="row" @submit.prevent="addTask">
        <input v-model="newTask" placeholder="Tambah task hari ini…" class="grow" />
        <button>+</button>
      </form>
      <ul class="list">
        <li v-for="t in data.tasks" :key="t.id" class="row">
          <input type="checkbox" :aria-label="`Selesai: ${t.title}`" @change="done(t)" />
          <span class="grow" @click="editing = { key: 'tasks', row: t }">{{ t.title }}</span>
          <small :class="{ error: t.props['Due Date']?.start?.slice(0, 10) < data.today }">{{ fmtDate(t.props['Due Date']) }}</small>
        </li>
      </ul>

      <template v-if="data.learning.length">
        <h2>Review belajar</h2>
        <ul class="list">
          <li v-for="l in data.learning" :key="l.id" class="row" @click="editing = { key: 'learning', row: l }">
            <span class="grow">{{ l.title }}</span>
            <small class="chip">{{ l.props.Stage }}</small>
            <small>{{ fmtDate(l.props['Next Session']) }}</small>
          </li>
        </ul>
      </template>
    </template>

    <DbForm v-if="editing" :db-key="editing.key" :row="editing.row" @close="editing = null" @saved="saved" @deleted="load" />
  </section>
</template>
