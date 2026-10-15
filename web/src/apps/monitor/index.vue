<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { api, schemaOf, show, type Prop, type Row } from '../../api'

type Today = { today: string; habits: Row[]; tasks: Row[]; learning: Row[] }

const data = ref<Today | null>(null)
const streak = ref<Row[]>([])
const streakCols = ref<Prop[]>([])
const err = ref('')
const notif = ref<string>(typeof Notification === 'undefined' ? 'unsupported' : Notification.permission)
const notifMsg = ref('')

const byStatus = computed(() => {
  const m: Record<string, number> = {}
  for (const h of data.value?.habits ?? []) m[h.props.Status ?? '—'] = (m[h.props.Status ?? '—'] ?? 0) + 1
  return m
})
const pct = computed(() => {
  const n = data.value?.habits.length ?? 0
  return n ? Math.round(((byStatus.value.Done ?? 0) / n) * 100) : 0
})
const overdue = computed(() => data.value?.tasks.filter((t) => t.props['Due Date']?.start?.slice(0, 10) < data.value!.today).length ?? 0)

onMounted(async () => {
  try {
    data.value = await api<Today>('/today')
    streakCols.value = (await schemaOf('streak')).filter((p) => p.type === 'formula')
    streak.value = (await api<{ rows: Row[] }>('/db/streak')).rows
  } catch (e: any) {
    err.value = e.message
  }
})

const b64ToBytes = (s: string) => Uint8Array.from(atob((s + '='.repeat((4 - (s.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0))

async function enablePush() {
  notifMsg.value = ''
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window))
      throw new Error('Browser tidak mendukung push. Di iPhone: Add to Home Screen dulu (iOS 16.4+).')
    notif.value = await Notification.requestPermission()
    if (notif.value !== 'granted') throw new Error('Izin notifikasi ditolak.')
    const reg = await navigator.serviceWorker.ready
    const { key } = await api<{ key: string }>('/vapid')
    const sub =
      (await reg.pushManager.getSubscription()) ??
      (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToBytes(key) }))
    const name = `${navigator.platform || 'Perangkat'} · ${new Date().toLocaleDateString('id-ID')}`
    const r = await api<{ created: boolean }>('/subscribe', 'POST', { subscription: sub.toJSON(), name })
    notifMsg.value = r.created ? 'Notifikasi aktif di perangkat ini.' : 'Perangkat ini sudah terdaftar.'
  } catch (e: any) {
    notifMsg.value = e.message
  }
}
</script>

<template>
  <section>
    <h1>Monitor</h1>
    <p v-if="err" class="error">{{ err }}</p>

    <div class="card stack">
      <strong>Notifikasi</strong>
      <button @click="enablePush">{{ notif === 'granted' ? 'Daftarkan ulang perangkat ini' : 'Aktifkan notifikasi' }}</button>
      <small v-if="notifMsg">{{ notifMsg }}</small>
    </div>

    <template v-if="data">
      <div class="stats">
        <div class="card"><b>{{ pct }}%</b><small>Habit selesai</small></div>
        <div class="card"><b>{{ data.tasks.length }}</b><small>Task terbuka</small></div>
        <div class="card"><b :class="{ error: overdue }">{{ overdue }}</b><small>Terlambat</small></div>
        <div class="card"><b>{{ data.learning.length }}</b><small>Review jatuh tempo</small></div>
      </div>
      <progress :value="pct" max="100" />
      <p class="chips">
        <small v-for="(n, s) in byStatus" :key="s" class="chip"><b>{{ s }}</b> {{ n }}</small>
      </p>
    </template>

    <template v-if="streak.length">
      <h2>Streak</h2>
      <ul class="list">
        <li v-for="r in streak" :key="r.id">
          <strong>{{ r.title }}</strong>
          <span class="chips">
            <template v-for="c in streakCols" :key="c.name">
              <small v-if="show(r.props[c.name], c.type)" class="chip"><b>{{ c.name }}</b> {{ show(r.props[c.name], c.type) }}</small>
            </template>
          </span>
        </li>
      </ul>
    </template>
  </section>
</template>
