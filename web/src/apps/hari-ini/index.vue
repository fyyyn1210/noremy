<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { api, fmtDate, schemaOf, type Row } from '../../api'
import DbForm from '../../components/DbForm.vue'
import Icon from '../../components/Icon.vue'
import Ring from '../../components/Ring.vue'

type Today = { today: string; habits: Row[]; tasks: Row[]; learning: Row[]; modes: Row[] }
type Week = { today: string; days: { date: string; total: number; done: number }[]; streak: number }

const data = ref<Today | null>(null)
const week = ref<Week | null>(null)
const err = ref('')
const statuses = ref<string[]>([])
const editing = ref<{ key: string; row: Row | null; defaults?: Record<string, any> } | null>(null)

const minutes = (t?: string) => {
  const m = t?.match(/^(\d{1,2})[.:](\d{2})/)
  return m ? +m[1] * 60 + +m[2] : 9999
}
const habits = computed(() => [...(data.value?.habits ?? [])].sort((a, b) => minutes(a.props.Time) - minutes(b.props.Time)))
const doneCount = computed(() => habits.value.filter((h) => h.props.Status === 'Done').length)
const overdue = computed(() => data.value?.tasks.filter((t) => t.props['Due Date']?.start?.slice(0, 10) < data.value!.today).length ?? 0)

// Strip Senin–Minggu minggu ini.
const LABELS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
const strip = computed(() => {
  if (!week.value) return []
  const today = week.value.today
  const t = new Date(today + 'T00:00:00Z')
  const monday = new Date(t)
  monday.setUTCDate(t.getUTCDate() - ((t.getUTCDay() + 6) % 7))
  const byDate = new Map(week.value.days.map((d) => [d.date, d]))
  return LABELS.map((label, i) => {
    const d = new Date(monday)
    d.setUTCDate(monday.getUTCDate() + i)
    const date = d.toISOString().slice(0, 10)
    const s = byDate.get(date)
    const ratio = s?.total ? s.done / s.total : 0
    const cls = date > today ? 'future' : date === today ? 'now' : !s?.total ? '' : ratio >= 1 ? 'full' : ratio >= 0.5 ? 'half' : 'low'
    return { label, date, n: d.getUTCDate(), cls, today: date === today }
  })
})

const STATUS_CLASS: Record<string, string> = { Done: 'done', 'In Progress': 'prog', Missed: 'missed' }

async function load() {
  err.value = ''
  try {
    ;[data.value, week.value] = await Promise.all([api<Today>('/today'), api<Week>('/week')])
  } catch (e: any) {
    err.value = e.message
  }
}

onMounted(async () => {
  load()
  try {
    statuses.value = (await schemaOf('habits')).find((p) => p.name === 'Status')?.options ?? []
  } catch {}
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

const newTask = () => (editing.value = { key: 'tasks', row: null, defaults: { 'Due Date': { start: data.value?.today, end: null } } })
const dateRange = (r: Row) => fmtDate({ start: r.props['Start Date']?.start, end: r.props['End Date']?.start ?? null })
</script>

<template>
  <main class="screen">
    <header class="head">
      <div class="brand">
        <span class="mark"><Icon name="logo" :size="16" :width="2.6" /></span>Noremy
      </div>
      <div class="row">
        <span class="streak" :aria-label="`Streak ${week?.streak ?? 0} hari`"><Icon name="flame" :size="16" :width="2.2" />{{ week?.streak ?? '–' }}</span>
        <button class="icon-btn" aria-label="Muat ulang" @click="load"><Icon name="refresh" :size="18" /></button>
      </div>
    </header>

    <div class="week" aria-label="Minggu ini">
      <div v-for="d in strip" :key="d.date" class="day" :class="{ today: d.today }">
        {{ d.label }}
        <span class="num" :class="d.cls">{{ d.n }}</span>
      </div>
    </div>

    <p v-if="err" class="error" role="alert">{{ err }}</p>
    <p v-if="!data && !err" class="muted">Memuat…</p>

    <template v-if="data">
      <section class="card lg hero" style="margin: 0 -4px">
        <div class="stack" style="gap: 4px">
          <div><span class="n">{{ doneCount }}</span><span class="of">/{{ habits.length }}</span></div>
          <span class="muted" style="font-weight: 500">Habit selesai hari ini</span>
        </div>
        <Ring :value="habits.length ? doneCount / habits.length : 0" :size="104" :width="9">
          <Icon name="check" :size="26" :width="2.4" />
        </Ring>
      </section>

      <div class="minis">
        <div class="card mini">
          <div><b>{{ data.tasks.length }}</b><div class="small muted">Task terbuka<template v-if="overdue"> · <span class="error">{{ overdue }} telat</span></template></div></div>
          <Ring :value="data.tasks.length ? 1 - overdue / data.tasks.length : 1" color="var(--blue)"><Icon name="task" :size="18" style="color: var(--blue)" /></Ring>
        </div>
        <div class="card mini">
          <div><b>{{ data.learning.length }}</b><div class="small muted">Review belajar</div></div>
          <Ring :value="data.learning.length ? 0 : 1" color="var(--purple)"><Icon name="book" :size="18" style="color: var(--purple)" /></Ring>
        </div>
        <div class="card mini">
          <div><b>{{ week?.streak ?? 0 }}</b><span class="small muted"> hari</span><div class="small muted">Streak</div></div>
          <Ring :value="(week?.streak ?? 0) / 30" color="var(--orange)"><Icon name="flame" :size="18" style="color: var(--orange)" /></Ring>
        </div>
      </div>

      <section v-for="m in data.modes" :key="m.id" class="card dark stack" style="gap: 8px; cursor: pointer" @click="editing = { key: 'learningMode', row: m }">
        <div class="row small" style="font-weight: 700; letter-spacing: 0.4px; opacity: 0.75">
          <Icon name="book" :size="16" /><span class="grow">MODE BELAJAR</span><span>{{ m.props.Status }}</span>
        </div>
        <span style="font-size: 20px; font-weight: 800; letter-spacing: -0.3px">{{ m.title }}</span>
        <div class="row" style="flex-wrap: wrap; gap: 6px">
          <span v-for="mode in m.props.Mode" :key="mode" class="pill" style="background: rgb(255 255 255 / 0.14); color: inherit">{{ mode }}</span>
          <span v-if="m.props.Rule" class="pill" style="background: var(--on-ink); color: var(--ink)">{{ m.props.Rule }}</span>
        </div>
        <span v-if="m.props.Description" class="small" style="opacity: 0.8">{{ m.props.Description }}</span>
        <span class="small" style="opacity: 0.75">
          {{ dateRange(m) }}
          <template v-if="m.props['End Date']?.start < data.today"> · sudah lewat, perbarui Status/tanggal</template>
        </span>
      </section>

      <div class="section-head"><h2>Jadwal hari ini</h2></div>
      <p v-if="!habits.length" class="muted">Belum ada habit hari ini.</p>
      <ul class="list">
        <li v-for="h in habits" :key="h.id" class="item" :class="{ done: h.props.Status === 'Done' }">
          <span class="tile" :class="{ ink: h.props.Status === 'In Progress' }" :style="h.props.Status === 'Done' ? 'color: var(--faint)' : ''">{{ h.props.Time || '—' }}</span>
          <button class="grow" style="all: unset; flex: 1; min-width: 0; cursor: pointer" @click="editing = { key: 'habits', row: h }">
            <span class="title">{{ h.title }}</span>
            <span class="sub">{{ (h.props.Tags ?? []).join(' · ') || 'Habit' }}</span>
          </button>
          <select
            class="pill" :class="STATUS_CLASS[h.props.Status]" :value="h.props.Status" :aria-label="`Status ${h.title}`"
            @change="setStatus(h, ($event.target as HTMLSelectElement).value)"
          >
            <option v-for="s in statuses" :key="s">{{ s }}</option>
          </select>
        </li>
      </ul>

      <div class="section-head"><h2>Tasks</h2></div>
      <p v-if="!data.tasks.length" class="muted">Tidak ada task jatuh tempo.</p>
      <ul class="list">
        <li v-for="t in data.tasks" :key="t.id" class="item">
          <input type="checkbox" :aria-label="`Selesai: ${t.title}`" @change="done(t)" />
          <button class="grow" style="all: unset; flex: 1; min-width: 0; cursor: pointer" @click="editing = { key: 'tasks', row: t }">
            <span class="title">{{ t.title }}</span>
            <span class="sub" :class="{ error: t.props['Due Date']?.start?.slice(0, 10) < data.today }">{{ fmtDate(t.props['Due Date']) || 'Tanpa tanggal' }}<template v-if="t.props.Category"> · {{ t.props.Category }}</template></span>
          </button>
        </li>
      </ul>

      <template v-if="data.learning.length">
        <div class="section-head"><h2>Review belajar</h2></div>
        <ul class="list">
          <li v-for="l in data.learning" :key="l.id" class="item">
            <span class="bar src-learning" />
            <button class="grow" style="all: unset; flex: 1; min-width: 0; cursor: pointer" @click="editing = { key: 'learning', row: l }">
              <span class="title">{{ l.title }}</span>
              <span class="sub">{{ l.props.Subject }} · {{ fmtDate(l.props['Next Session']) }}</span>
            </button>
            <span class="pill prog">{{ l.props.Stage }}</span>
          </li>
        </ul>
      </template>
    </template>

    <button class="fab" aria-label="Tambah task hari ini" @click="newTask"><Icon name="plus" :size="24" :width="2.4" /></button>
    <DbForm v-if="editing" :db-key="editing.key" :row="editing.row" :defaults="editing.defaults" @close="editing = null" @saved="load" @deleted="load" />
  </main>
</template>
