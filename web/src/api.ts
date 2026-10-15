import { ref } from 'vue'

export type Row = { id: string; url: string; title: string; props: Record<string, any> }
export type Prop = { name: string; type: string; options?: string[]; readOnly: boolean }

const BASE = import.meta.env.VITE_API_URL as string

const read = () => {
  try { return localStorage.getItem('token') ?? '' } catch { return '' }
}
export const token = ref(read())
export function setToken(t: string) {
  token.value = t
  try { t ? localStorage.setItem('token', t) : localStorage.removeItem('token') } catch {}
}

export async function api<T = any>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const r = await fetch(BASE + path, {
    method,
    headers: { Authorization: `Bearer ${token.value}`, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (r.status === 401) {
    setToken('')
    throw new Error('Token salah')
  }
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? r.statusText)
  return r.json()
}

const schemas = new Map<string, Promise<Prop[]>>()
export const schemaOf = (key: string) => {
  if (!schemas.has(key)) schemas.set(key, api<Prop[]>(`/db/${key}/schema`))
  return schemas.get(key)!
}

export const DB_LABEL: Record<string, string> = {
  habits: 'Habit',
  tasks: 'Tasks',
  learningMode: 'Learning Mode',
  english: 'Daily English',
  learning: 'Spaced Repetition',
  streak: 'Streak',
  notesDb: 'Notes DB',
}

const TZ = 'Asia/Jakarta'
/** "YYYY-MM-DD" di WIB. */
export const todayWIB = (d = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(d)
/** ISO Notion -> nilai <input type="datetime-local"> di WIB. */
export const toLocalInput = (iso: string) =>
  new Date(iso).toLocaleString('sv-SE', { timeZone: TZ }).slice(0, 16).replace(' ', 'T')
/** Nilai datetime-local (WIB) -> ISO dengan offset. */
export const fromLocalInput = (v: string) => `${v}:00+07:00`

export function fmtDate(d: { start: string; end: string | null } | null | undefined) {
  if (!d?.start) return ''
  const one = (s: string) =>
    s.includes('T')
      ? new Date(s).toLocaleString('id-ID', { timeZone: TZ, dateStyle: 'medium', timeStyle: 'short' })
      : new Date(s + 'T00:00:00').toLocaleDateString('id-ID', { dateStyle: 'medium' })
  return d.end ? `${one(d.start)} – ${one(d.end)}` : one(d.start)
}

/** Nilai properti -> teks pendek untuk daftar. */
export function show(v: any, type: string): string {
  if (v == null || v === '' || (Array.isArray(v) && !v.length)) return ''
  if (type === 'date') return fmtDate(v)
  if (type === 'checkbox') return v ? '✓' : ''
  if (type === 'relation') return `${v.length} relasi`
  if (Array.isArray(v)) return v.join(', ')
  if (typeof v === 'boolean') return v ? '✓' : '✗'
  return String(v)
}
