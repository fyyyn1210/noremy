/**
 * Migrasi PHASE A: gabungkan tabel `projects` (portfolio, single-language)
 * dan `freelance_works` (freelance, dwibahasa) jadi satu tabel `projects`
 * dwibahasa dengan kolom `visibility`.
 *
 * Jalankan: bun .scripts/migrate-unify-projects.ts
 *
 * Urutan yang aman:
 * 1) Jalankan script ini (Phase A) — SEBELUM update kode server ke versi
 *    baru kalau server lama masih jalan, karena ini cuma mengubah tipe
 *    kolom title/description/content jadi JSONB & menambah kolom baru
 *    (additive + type-change terkontrol, `freelance_works` TIDAK disentuh/
 *    dihapus di sini, cuma dibaca).
 * 2) Deploy kode server yang baru (modul project & freelance yang sudah
 *    disesuaikan), cek admin panel — pastikan semua project (termasuk yang
 *    tadinya freelance work) muncul benar dengan visibility yang benar.
 * 3) SETELAH yakin datanya benar, baru jalankan `bun run db:push` — drizzle
 *    akan mendeteksi tabel `freelance_works` sudah tidak ada di schema
 *    (sudah dihapus dari kode) dan akan MEMINTA KONFIRMASI buat men-drop-
 *    nya. Baru di titik itu tabel lama boleh dihapus.
 *
 * String lama di title/description/content dibungkus to_jsonb() apa
 * adanya (jadi JSON scalar string, BUKAN object {en,id}) — ini SENGAJA,
 * karena pickLocalized() di server sudah menangani nilai string biasa
 * (dikembalikan sama persis buat kedua bahasa) sampai nanti diterjemahkan
 * manual lewat admin panel. Idempotent: aman dijalankan ulang.
 */

import { sql } from "drizzle-orm";
import client from "#src/configs/database.config.js";

const STATEMENTS: { label: string; query: string }[] = [
  {
    label: "Ubah title jadi jsonb",
    query: `ALTER TABLE projects ALTER COLUMN title TYPE jsonb USING to_jsonb(title);`,
  },
  {
    label: "Ubah description jadi jsonb",
    query: `ALTER TABLE projects ALTER COLUMN description TYPE jsonb USING to_jsonb(description);`,
  },
  {
    label: "Ubah content jadi jsonb",
    query: `ALTER TABLE projects ALTER COLUMN content TYPE jsonb USING to_jsonb(content);`,
  },
  {
    label: "Tambah kolom scope",
    query: `ALTER TABLE projects ADD COLUMN IF NOT EXISTS scope jsonb NOT NULL DEFAULT '[]'::jsonb;`,
  },
  {
    label: "Tambah kolom category",
    query: `ALTER TABLE projects ADD COLUMN IF NOT EXISTS category varchar(255);`,
  },
  {
    label: "Tambah kolom gradient",
    query: `ALTER TABLE projects ADD COLUMN IF NOT EXISTS gradient varchar(255);`,
  },
  {
    label: "Tambah kolom brand_bg",
    query: `ALTER TABLE projects ADD COLUMN IF NOT EXISTS brand_bg varchar(255);`,
  },
  {
    label: "Tambah kolom brand_char",
    query: `ALTER TABLE projects ADD COLUMN IF NOT EXISTS brand_char varchar(10);`,
  },
  {
    label: "Tambah kolom visibility",
    query: `ALTER TABLE projects ADD COLUMN IF NOT EXISTS visibility jsonb NOT NULL DEFAULT '["portfolio"]'::jsonb;`,
  },
  {
    label: "Migrasikan baris freelance_works -> projects (visibility=freelance)",
    query: `
      INSERT INTO projects (
          slug, title, href, dates, active, description, content,
          technologies, scope, image, kind, category, company,
          gradient, brand_bg, brand_char, visibility, "order", show_in_cv
      )
      SELECT
          fw.slug,
          jsonb_build_object('en', fw.name, 'id', fw.name),
          COALESCE(fw.discover_url, '#'),
          fw.year,
          false,
          fw.overview,
          fw.description,
          fw.tags,
          fw.scope,
          fw.image,
          'project',
          fw.category,
          fw.client,
          fw.gradient,
          fw.brand_bg,
          fw.brand_char,
          '["freelance"]'::jsonb,
          fw."order",
          false
      FROM freelance_works fw
      ON CONFLICT (slug) DO NOTHING;
    `,
  },
];

async function main() {
  console.log("=== Migrasi unifikasi projects + freelance_works (Phase A) ===\n");

  for (const { label, query } of STATEMENTS) {
    console.log(`→ ${label}...`);
    try {
      await client.execute(sql.raw(query));
      console.log("  OK");
    } catch (err) {
      console.error(`  GAGAL: ${label}`);
      console.error(err);
      console.error("\nBerhenti di sini — perbaiki error di atas lalu jalankan ulang script ini (aman diulang).");
      process.exit(1);
    }
  }

  console.log("\n✅ Phase A selesai. `freelance_works` BELUM dihapus (sengaja).");
  console.log("Cek dulu hasilnya di admin panel, baru jalankan `bun run db:push` buat konfirmasi drop tabel lama.");
  process.exit(0);
}

main();
