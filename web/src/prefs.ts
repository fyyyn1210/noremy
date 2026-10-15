import { computed, ref, watch } from 'vue'

// Preferensi per perangkat (localStorage). Boleh hilang: semuanya punya nilai default.
const get = (k: string) => {
  try { return localStorage.getItem(k) } catch { return null }
}
const set = (k: string, v: string) => {
  try { localStorage.setItem(k, v) } catch {}
}

/* Tema: system | light | dark */
export type Theme = 'system' | 'light' | 'dark'
export const theme = ref<Theme>((get('theme') as Theme) || 'system')
watch(
  theme,
  (t) => {
    set('theme', t)
    const root = document.documentElement
    t === 'system' ? delete root.dataset.theme : (root.dataset.theme = t)
    // Warna bar status/browser ikut tema yang dipaksa; "system" kembali ke meta per media query.
    document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((m) => {
      m.content = t === 'dark' ? '#0f0f11' : t === 'light' ? '#f5f5f7' : m.dataset.default!
    })
  },
  { immediate: true },
)

// Tema efektif (sistem ikut berubah saat pengaturan OS berubah).
const mq = matchMedia('(prefers-color-scheme: dark)')
const systemDark = ref(mq.matches)
mq.addEventListener('change', (e) => (systemDark.value = e.matches))
export const isDark = computed(() => theme.value === 'dark' || (theme.value === 'system' && systemDark.value))
export const toggleTheme = () => (theme.value = isDark.value ? 'light' : 'dark')

/* Sub-app yang dipasang di Noremy */
const readInstalled = (): string[] => {
  try { return JSON.parse(get('apps') ?? '[]') } catch { return [] }
}
export const installed = ref<string[]>(readInstalled())
watch(installed, (v) => set('apps', JSON.stringify(v)), { deep: true })

/* Install PWA ke perangkat (Chrome/Edge/Android). iOS tidak punya prompt: Add to Home Screen manual. */
type PromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }
export const installPrompt = ref<PromptEvent | null>(null)
export const standalone = ref(
  matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true,
)
export const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)

addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  installPrompt.value = e as PromptEvent
})
addEventListener('appinstalled', () => {
  installPrompt.value = null
  standalone.value = true
})

/** Munculkan prompt install bila tersedia. Return true bila pengguna menerima. */
export async function installPWA() {
  const p = installPrompt.value
  if (!p) return false
  await p.prompt()
  const { outcome } = await p.userChoice
  installPrompt.value = null
  return outcome === 'accepted'
}
