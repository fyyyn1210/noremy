<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { api, type Row } from '../../../api'
import Icon from '../../../components/Icon.vue'

type Today = { today: string; habits: Row[]; tasks: Row[]; learning: Row[] }
type Week = { today: string; days: { date: string; total: number; done: number }[]; streak: number }

const data = ref<Today | null>(null)
const week = ref<Week | null>(null)
const err = ref('')
const notif = ref<string>(typeof Notification === 'undefined' ? 'unsupported' : Notification.permission)
const notifMsg = ref('')

// 7 hari terakhir (termasuk hari ini) dan 7 hari sebelumnya untuk perbandingan.
const last7 = computed(() => week.value?.days.slice(-7) ?? [])
const prev7 = computed(() => week.value?.days.slice(-14, -7) ?? [])
const sum = (ds: { total: number; done: number }[]) => ds.reduce((a, d) => ({ total: a.total + d.total, done: a.done + d.done }), { total: 0, done: 0 })
const now = computed(() => sum(last7.value))
const pct = computed(() => (now.value.total ? Math.round((now.value.done / now.value.total) * 100) : 0))
const delta = computed(() => {
  const p = sum(prev7.value)
  return p.total && now.value.total ? pct.value - Math.round((p.done / p.total) * 100) : null
})
const bars = computed(() =>
  last7.value.map((d, i) => ({
    ...d,
    label: new Date(d.date + 'T00:00:00Z').toLocaleDateString('id-ID', { weekday: 'short', timeZone: 'UTC' }),
    h: d.total ? Math.max(6, Math.round((d.done / d.total) * 96)) : 6,
    now: i === last7.value.length - 1,
  })),
)
const overdue = computed(() => data.value?.tasks.filter((t) => t.props['Due Date']?.start?.slice(0, 10) < data.value!.today).length ?? 0)

onMounted(async () => {
  try {
    ;[data.value, week.value] = await Promise.all([api<Today>('/today'), api<Week>('/week')])
  } catch (e: any) {
    err.value = e.message
  }
})

const b64ToBytes = (s: string) =>
  Uint8Array.from(atob((s + '='.repeat((4 - (s.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0))

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
  <main class="screen">
    <header class="head"><h1>Monitor</h1></header>
    <p v-if="err" class="error" role="alert">{{ err }}</p>
    <p v-if="!week && !err" class="muted">Memuat…</p>

    <template v-if="week">
      <div class="duo">
        <section class="card stack" style="gap: 8px">
          <span class="small muted" style="font-weight: 600">Habit 7 hari</span>
          <span class="big">{{ now.done }}<span class="small muted" style="font-size: 15px">/{{ now.total }}</span></span>
          <div class="meter" role="img" :aria-label="`${pct}% selesai`"><i :style="{ width: pct + '%' }" /></div>
          <span class="small muted">{{ pct }}% selesai</span>
        </section>
        <section class="card stack center" style="gap: 6px; align-items: center">
          <Icon name="flame" :size="34" :width="1.8" style="color: var(--orange)" />
          <span style="font-size: 18px; font-weight: 800; color: var(--orange-ink)">{{ week.streak }} hari streak</span>
          <div class="row" style="gap: 4px">
            <span v-for="d in last7" :key="d.date" class="dot" :style="{ width: '12px', height: '12px', background: d.done ? 'var(--orange)' : 'var(--track)' }" />
          </div>
        </section>
      </div>

      <section class="card lg stack" style="gap: 12px">
        <div class="row">
          <h2 class="grow" style="font-size: 16px">Konsistensi habit</h2>
          <span v-if="delta !== null" class="pill" :class="delta >= 0 ? 'done' : 'missed'">{{ delta >= 0 ? '+' : '' }}{{ delta }}% vs minggu lalu</span>
        </div>
        <div class="bars" role="img" :aria-label="bars.map((b) => `${b.label} ${b.done}/${b.total}`).join(', ')">
          <div v-for="b in bars" :key="b.date" class="col">
            <span v-if="b.now" class="tip">{{ b.done }}/{{ b.total }}</span>
            <div class="b" :class="b.now ? 'now' : b.total ? 'past' : ''" :style="{ height: b.h + 'px' }" />
            {{ b.label }}
          </div>
        </div>
      </section>
    </template>

    <div v-if="data" class="duo">
      <section class="card stat"><b :style="{ color: overdue ? 'var(--red)' : 'inherit' }">{{ overdue }}</b><span class="small muted" style="font-weight: 600">Task terlambat</span></section>
      <section class="card stat"><b style="color: var(--purple-ink)">{{ data.learning.length }}</b><span class="small muted" style="font-weight: 600">Review jatuh tempo</span></section>
    </div>

    <section class="card row">
      <span class="tile" style="width: 44px; height: 44px"><Icon name="bell" :size="22" /></span>
      <div class="grow">
        <b style="display: block">Notifikasi</b>
        <span class="small muted">{{ notifMsg || (notif === 'granted' ? 'Izin sudah diberikan' : 'Belum aktif di perangkat ini') }}</span>
      </div>
      <button class="btn" style="min-height: 44px; padding: 0 16px" @click="enablePush">{{ notif === 'granted' ? 'Daftar ulang' : 'Aktifkan' }}</button>
    </section>
  </main>
</template>
