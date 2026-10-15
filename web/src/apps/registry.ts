import { defineAsyncComponent, type Component } from 'vue'
import NoDailyLogo from '../components/NoDailyLogo.vue'

export type AppInfo = {
  id: string
  name: string
  desc: string
  icon: string // nama di components/Icon.vue (dipakai bila tidak ada logo)
  logo?: Component // logo khusus sub-app
  color: string // var(--…) untuk tile ikon
  home: string // tab awal
  comp?: Component // belum ada = "Segera"
}

// Sub-app baru = satu folder di apps/ + satu entri di sini.
export const APPS: AppInfo[] = [
  {
    id: 'nodaily',
    name: 'NoDaily',
    desc: 'Habit harian, to-do, kalender, catatan, dan monitor dari Daily Tracker.',
    icon: 'task',
    logo: NoDailyLogo,
    color: 'var(--fg)',
    home: 'hari-ini',
    comp: defineAsyncComponent(() => import('./nodaily/index.vue')),
  },
  { id: 'nofinance', name: 'NoFinance', desc: 'Keuangan & investasi.', icon: 'chart', color: 'var(--green)', home: '' },
  { id: 'nolearn', name: 'NoLearn', desc: 'Learning path, UTBK, spaced repetition.', icon: 'book', color: 'var(--purple)', home: '' },
  { id: 'nowork', name: 'NoWork', desc: 'Freelance, proyek, dan loker.', icon: 'db', color: 'var(--blue)', home: '' },
]
