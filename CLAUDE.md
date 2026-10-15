# Proyek: Aplikasi kecil di atas Notion + push notifikasi

> Nama platform: **Noremy** (induk). Sub-app bernama No<Fungsi>: **NoDaily** (yang pertama), lalu NoFinance, NoLearn, NoWork, dst.
> Satu PWA Noremy berisi launcher `#/apps`; sub-app dipasang/dilepas per perangkat. Jangan memakai kata "Notion" di nama produk (merek dagang).

## Tujuan

Notion terlalu berat untuk dipakai langsung. Notion dijadikan **database saja**. Tampilan dan fitur (to-do list, dll.) dibuat sendiri sebagai PWA yang ringan, bisa di-install di HP dan desktop. Ke depan bisa dijadikan jasa.

Fitur inti pertama: **notifikasi push** dari database Notion milik pengguna yang entrinya dibuat otomatis (harian, dll.) dan punya properti jam.

## Stack

- Server: **Elysia** di **Bun** (TypeScript)
- Frontend: **Vue 3 + Vite + vite-plugin-pwa**
- Hosting: **Render** (server Node/Bun) dan cron external yang memanggil `/tick` tiap menit
- Data: **Notion API** (token integration dari notion.so/my-integrations)
- Push: **Web Push** dengan VAPID keys
- Lokasi proyek: `D:\laragon\www\Development\` (nama folder akan mengikuti nama produk)

## Alur notifikasi

1. Cron external memanggil `GET/POST /tick` tiap menit (dilindungi `TICK_SECRET`).
2. Server query database Notion: entri hari ini yang jamnya sudah tiba (jendela wajar, misalnya sampai 30 menit terlewat), belum selesai, dan `Notified` belum tercentang.
3. Kirim web push ke semua perangkat terdaftar (HP dan desktop).
4. Tandai entri `Notified = true` di Notion supaya tidak terkirim dua kali.

## Aturan penting

- **Server stateless.** Disk Render (paket gratis) tidak permanen. Jangan simpan state di file lokal.
  - Pencegah notifikasi ganda: properti checkbox `Notified` di database entri.
  - Langganan push per perangkat: database Notion kecil bernama `Devices` (endpoint, keys, nama perangkat, waktu daftar).
- Token Notion, VAPID private key, dan `TICK_SECRET` hanya di environment variable. Jangan di-commit dan jangan masuk kode frontend.
- Browser tidak bisa memanggil API Notion langsung (CORS), jadi frontend selalu lewat server (proxy).
- Zona waktu selalu **Asia/Jakarta (WIB, UTC+7)**. Baca dan bandingkan jam dengan zona ini secara eksplisit.
- Batas Notion sekitar 3 request/detik. Satu query per menit sudah aman. Tangani respons 429 dengan retry.
- Paket gratis Render tidur setelah sekitar 15 menit tanpa traffic; ping `/tick` tiap menit mencegahnya. Cek batas jam gratis bulanan di halaman harga Render.

## Batasan platform notifikasi

- Android (Chrome): push berjalan baik.
- iPhone: PWA harus di-"Add to Home Screen" dulu (iOS 16.4+), izin notifikasi diminta dari dalam aplikasi.
- Desktop: PWA di Chrome/Edge, notifikasi muncul selama browser masih berjalan di latar belakang.
- Notifikasi bisa terlambat beberapa detik sampai menit. Ini pengingat, bukan alarm presisi.
- Tidak bisa mengambil kotak masuk notifikasi bawaan Notion (API tidak membukanya). Notifikasi dibuat dari isi database.

## Kerangka folder

```
Noremy/
├── server/                 Bun + Elysia, stateless
│   └── src/
│       ├── index.ts        auth (Bearer APP_TOKEN; /tick pakai TICK_SECRET), error map
│       ├── routes/         db.ts (CRUD generik), views.ts (/today, /calendar), pages.ts (catatan), push.ts (/vapid, /subscribe, /tick)
│       └── lib/            notion.ts (whitelist DBS, simplify/toNotion), push.ts, time.ts, lib.test.ts
├── web/                    Vue 3 + TS + vite-plugin-pwa (injectManifest)
│   └── src/
│       ├── apps/           index.vue (launcher #/apps), registry.ts (daftar sub-app), nodaily/ (tab: hari-ini, kalender, database, catatan, monitor)
│       ├── prefs.ts        tema (sistem/terang/gelap), sub-app terpasang, prompt install PWA
│       ├── components/     DbTable, DbForm (form dari skema Notion), Markdown
│       ├── api.ts          fetch + token + helper tanggal WIB
│       └── sw.ts           service worker (precache, cache API, push)
└── CLAUDE.md
```

## Database Notion yang dipakai (workspace "Riosras Kaa's Notion")

| key | Database | Catatan |
|---|---|---|
| habits | Habit Database (Daily Tracker) | entri harian otomatis; `Time` teks "20.00"; `Status`; `Notified` |
| tasks | Tasks Database (Daily Tracker) | `Name`, `Due Date` (bisa berjam), `Done`, `Done At` (diisi server saat Done berubah), `Priority` (angka, 1 = paling penting), `Notified` |
| learningMode | Learning Mode | Start/End Date |
| english | Daily English Tracker | Start Date |
| learning | Learning Progress (Spaced Repetition) | `Next Session`, `Stage` |
| streak | Streak Counter | formula, read-only |
| notesDb | Notes Database (Work) | |
| devices | Devices (Daily Tracker) | langganan push |
| NOTES_PAGE_ID | halaman 📓 Notes | sub-page biasa |

Data source ID ada di `server/.env.example`. Integration Notion harus di-share ke halaman Daily Tracker, Work, dan 📓 Notes.

## Environment variable

Lihat `server/.env.example` dan `web/.env.example`. Nama properti untuk `/tick` di-hardcode sesuai tabel di atas.

## Urutan pengerjaan

1. Setup proyek: Bun + Elysia (`server/`), Vue + Vite + vite-plugin-pwa (`web/`), generate VAPID keys.
2. Klien Notion (`lib/notion.ts`): query entri, update properti, baca/tulis `Devices`.
3. PWA to-do pertama: daftar tugas dari Notion, tambah, centang selesai. Bisa di-install, offline sederhana.
4. Push: endpoint `/subscribe`, service worker, tombol aktifkan notifikasi di PWA.
5. Endpoint `/tick` dengan logika jendela waktu + `Notified`, uji manual lalu pasang cron external.
6. Deploy ke Render, set environment variable, uji di Android, iPhone (Add to Home Screen), dan desktop.
7. Tambah aplikasi berikutnya (menyalin satu folder di `web/src/apps/`).

## Yang belum diputuskan

- Satu PWA dengan banyak menu (disarankan, mulai dari ini) atau banyak PWA terpisah dengan ikon masing-masing.
- Struktur database auto-create di Notion: nama database, nama properti jam (tipe Date dengan waktu atau teks "09:00"), apakah tiap entri sudah berisi tanggal hari itu, dan apakah ada properti status selesai. Isi nilai `PROP_*` di atas setelah dicek.
- Jika nanti dijadikan jasa untuk banyak pengguna: perlu OAuth Notion publik dan penyimpanan multi-tenant. Itu di luar versi pertama yang untuk pemakaian pribadi.

## Catatan untuk Claude Code

- Mulai dari langkah 1 di atas. Tanyakan struktur database Notion (atau minta pengguna menyalin nama properti dan tipenya) sebelum menulis logika `/tick`.
- Untuk versi pribadi, token integration tunggal di env sudah cukup.
- Bahasa komunikasi dengan pengguna: Indonesia.
