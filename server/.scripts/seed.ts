/**
 * Seeder — data profile/work/education/skills/certificates/activities/
 * projects/posts untuk portfolio Rio Putra Pratama.
 *
 * Sumber kebenaran: web/src/data/resume.tsx (data live yang sebelumnya
 * dipakai statis di frontend) — bukan lagi tebakan dari CV/LinkedIn.
 * Deskripsi work & activity diambil dari terjemahan "en" di
 * web/src/lib/i18n/translations.ts (BE cuma nyimpen 1 bahasa per field;
 * translasi UI tetap di FE, lihat catatan di FE.md/percakapan).
 *
 * Jalankan: bun run db:seed   (atau: bun .scripts/seed.ts)
 *
 * PENTING:
 * - DESTRUCTIVE: tabel di bawah di-kosongkan dulu sebelum diisi ulang,
 *   supaya idempotent. Jangan run di production yang sudah ada data asli
 *   tanpa backup.
 * - logoUrl/avatarUrl/image masih placeholder `/uploads/...` — upload file
 *   asli lewat POST /upload lalu update lewat admin panel atau re-run
 *   seeder ini setelah isi path-nya.
 * - Tabel `settings` (auth.email / auth.password) SENGAJA TIDAK disentuh.
 */

import client from "#src/configs/database.config.js";
import {
  settingSchema,
  workSchema,
  educationSchema,
  skillCategorySchema,
  skillItemSchema,
  projectSchema,
  projectLinkSchema,
  postSchema,
  certificateSchema,
  activitySchema,
  freelanceServiceSchema,
  freelanceServicePackageSchema,
  freelanceTestimonialSchema,
  freelanceStatSchema,
  freelanceFaqSchema,
  freelanceWorkSchema,
} from "#src/drizzle/schemas/index.js";

async function setSetting(key: string, value: unknown) {
  const stringValue =
    typeof value === "object" && value !== null
      ? JSON.stringify(value)
      : typeof value !== "string"
        ? String(value)
        : value;

  await client
    .insert(settingSchema)
    .values({ key, value: stringValue })
    .onConflictDoUpdate({ target: settingSchema.key, set: { value: stringValue } });
}

async function seedProfile() {
  console.log("→ Seeding profile (settings table)...");

  await setSetting("profile.name", "Rio Putra Pratama");
  await setSetting("profile.initials", "wannen__");
  await setSetting("profile.url", "https://wannen.dev");
  await setSetting("profile.location", "Garut, West Java, Indonesia");
  await setSetting("profile.locationLink", "https://www.google.com/maps/place/Garut");
  await setSetting(
    "profile.description",
    "Full Stack Developer with several years of experience building real-world web applications."
  );
  await setSetting(
    "profile.summary",
    "I'm a software developer who loves exploring new technologies, reading, and solving complex problems. I've been building production-ready web applications across the full stack — from backend APIs and real-time systems to frontend interfaces — for companies ranging from startups to government institutions."
  );
  await setSetting("profile.avatarUrl", "/uploads/me.png");
  await setSetting("profile.contact", {
    email: "riosraskaa@gmail.com",
    tel: "+62877-4786-2147",
  });
  await setSetting("profile.socials", [
    { id: 1, name: "GitHub", url: "https://github.com/fyyyn1210", handle: "@fyyyn1210", showInNavbar: true },
    { id: 2, name: "LinkedIn", url: "https://linkedin.com/in/r-putera", handle: "r-putera", showInNavbar: true },
    { id: 3, name: "X", url: "https://x.com/wannen__", handle: "@wannen__", showInNavbar: false },
  ]);
}

async function seedWork() {
  console.log("→ Seeding work_experiences...");
  await client.delete(workSchema);

  await client.insert(workSchema).values([
    {
      company: "WBlue Indonesia",
      href: "#",
      badges: ["Contract", "Hybrid"],
      location: "Bandung, West Java, Indonesia",
      title: "Back End Developer",
      logoUrl: "/uploads/logos/wblue.png",
      start: "Oct 2025",
      end: null,
      description:
        "Started as Back End Developer (Oct 2025 – Mar 2026) building the backend architecture for Suruhkami — a GoFood-like food delivery platform — using Node.js, Socket.io for real-time order tracking, RabbitMQ for message queuing, and Xendit for payment.",
      order: 1,
    },
    {
      company: "muatmuat",
      href: "#",
      badges: ["Freelance", "On-site"],
      location: "Surabaya, East Java, Indonesia",
      title: "Back End Developer",
      logoUrl: "/uploads/logos/muatmuat.png",
      start: "Sep 2025",
      end: "Dec 2025",
      description:
        "Developed and maintained backend APIs for a logistics technology platform. Handled database management, third-party integrations including the AWS Translation, and contributed to system architecture improvements in a fast-paced startup environment.",
      order: 2,
    },
    {
      company: "Maxximum Tech",
      href: "#",
      badges: ["Full-time", "Remote"],
      location: "Cimahi, West Java, Indonesia",
      title: "Full Stack Developer",
      logoUrl: "/uploads/logos/maxximum.png",
      start: "2024",
      end: "2025",
      description:
        "Developed enterprise-grade web applications across the full stack using Laravel, React, Node.js, and PostgreSQL. Key projects: Paperless (PSrE-compliant digital signature with OpenSSL, LTV & TSA), ShelterCamp (online tent booking with Midtrans payment gateway). Also contributed to projects under PT Artristik Studio Bandung — an affiliated company under the same umbrella.",
      order: 3,
    },
    {
      company: "BBPPMPV-BMTI",
      href: "#",
      badges: ["Internship", "On-site"],
      location: "Cimahi, West Java, Indonesia",
      title: "Full Stack Developer (Internship)",
      logoUrl: "/uploads/logos/bbppmpv-bmti.png",
      start: "2023",
      end: "2023",
      description:
        "Built three web applications during internship at a government training center: a digital queue management system (my first real-world professional project), a food ordering clone using the MEEN stack, and a news portal — all using Laravel and Node.js.",
      order: 4,
    },
  ]);
}

async function seedEducation() {
  console.log("→ Seeding educations...");
  await client.delete(educationSchema);

  await client.insert(educationSchema).values([
    {
      school: "SMKN 1 Garut",
      href: "#",
      degree: "Software & Game Development",
      logoUrl: "/uploads/logos/smkn1-garut.png",
      start: "2020",
      end: "2024",
      order: 1,
    },
  ]);
}

async function seedCertificates() {
  console.log("→ Seeding certificates...");
  await client.delete(certificateSchema);

  await client.insert(certificateSchema).values([
    {
      title: "SQL (Advanced) Certificate",
      issuer: "HackerRank",
      href: "https://www.hackerrank.com/certificates/e2f16eaee77e",
      dates: "2024",
      logoUrl: "/uploads/logos/hackerrank.png",
      order: 1,
    },
    {
      title: "SQL (Intermediate) Certificate",
      issuer: "HackerRank",
      href: "https://www.hackerrank.com/certificates/78b453c7103e",
      dates: "2024",
      logoUrl: "/uploads/logos/hackerrank.png",
      order: 2,
    },
    {
      title: "Software Engineering",
      issuer: "BNSP",
      href: "#",
      dates: "2024",
      logoUrl: "/uploads/logos/bnsp.png",
      order: 3,
    },
  ]);
}

async function seedActivities() {
  console.log("→ Seeding activities...");
  await client.delete(activitySchema);

  await client.insert(activitySchema).values([
    {
      organization: "IT Club SMKN 1 Garut",
      role: "Wakil Divisi Web",
      start: "2020",
      end: "2022",
      logoUrl: "/uploads/logos/it-club-smkn1-garut.png",
      description:
        "Vice Lead of the web division of the school IT Club. Actively shared coding knowledge with classmates, took on the role of technical lead in group projects, and helped junior members understand web development fundamentals.",
      order: 1,
    },
  ]);
}

async function seedSkills() {
  console.log("→ Seeding skill_categories + skill_items...");
  await client.delete(skillItemSchema);
  await client.delete(skillCategorySchema);

  const categories: Array<{ category: string; order: number; items: Array<{ name: string; iconSlug: string }> }> = [
    {
      category: "Languages",
      order: 1,
      items: [
        { name: "TypeScript", iconSlug: "typescript" },
        { name: "JavaScript", iconSlug: "javascript" },
        { name: "PHP", iconSlug: "php" },
      ],
    },
    {
      category: "Frameworks",
      order: 2,
      items: [
        { name: "Laravel", iconSlug: "laravel" },
        { name: "React", iconSlug: "react" },
        { name: "Next.js", iconSlug: "nextdotjs" },
        { name: "Node.js", iconSlug: "nodedotjs" },
        { name: "Express", iconSlug: "express" },
      ],
    },
    {
      category: "Databases",
      order: 3,
      items: [
        { name: "PostgreSQL", iconSlug: "postgresql" },
        { name: "MySQL", iconSlug: "mysql" },
        { name: "Redis", iconSlug: "redis" },
        { name: "MongoDB", iconSlug: "mongodb" },
      ],
    },
    {
      category: "Tools & Libraries",
      order: 4,
      items: [
        { name: "Socket.io", iconSlug: "socketdotio" },
        { name: "RabbitMQ", iconSlug: "rabbitmq" },
        { name: "Redux", iconSlug: "redux" },
        { name: "Prisma", iconSlug: "prisma" },
        { name: "TailwindCSS", iconSlug: "tailwindcss" },
        { name: "Git / GitHub", iconSlug: "git" },
      ],
    },
  ];

  for (const cat of categories) {
    const [category] = await client
      .insert(skillCategorySchema)
      .values({ category: cat.category, order: cat.order })
      .returning();

    if (cat.items.length > 0) {
      await client.insert(skillItemSchema).values(
        cat.items.map((item) => ({ ...item, categoryId: category.id }))
      );
    }
  }
}

async function seedProjects() {
  console.log("→ Seeding projects + project_links...");
  await client.delete(projectLinkSchema);
  await client.delete(projectSchema);

  const projects: Array<{
    slug: string;
    title: string;
    href: string;
    dates: string;
    active: boolean;
    description: string;
    technologies: string[];
    image: string;
    kind: "project" | "package";
    content: string;
    company: string | null;
    role: string | null;
    logoUrl: string | null;
    links: Array<{ type: string; href: string }>;
  }> = [
    {
      slug: "wireselect",
      title: "WireSelect",
      href: "https://packagist.org/packages/fyyyn1210/wire-select",
      dates: "2025",
      active: true,
      description:
        "The best and most practical alternative to Select2 for Laravel Livewire. A native searchable select component with database integration and no jQuery dependency.",
      technologies: ["Laravel", "Livewire", "PHP", "Blade", "Open Source"],
      image: "/uploads/projects/wire-select.jpeg",
      kind: "package",
      company: 'Open Source',
      role: 'Creator & Lead Developer',
      logoUrl: null,
      content:
        "Beberapa waktu lalu, saya sering mengalami kesulitan saat mengintegrasikan Select2 di Livewire — mulai dari masalah validasi yang tidak muncul, penggunaan wire:ignore yang lumayan tricky, hingga penggunaannya di modal yang kurang mulus. Karena itu, saya memutuskan membuat sebuah package yang bisa menjadi alternatif Select2, khusus untuk Livewire.\n\nFitur utama: mendukung live search langsung ke database, bisa digunakan juga dengan data statis yang dikirim langsung ke komponen, integrasi yang simpel tanpa wire:ignore, dan mendukung validasi Livewire secara langsung.\n\nPackage ini saya beri nama WireSelect — dan saya pakai sendiri di beberapa project pribadi.",
      links: [
        { type: "Packagist", href: "https://packagist.org/packages/fyyyn1210/wire-select" },
        { type: "GitHub", href: "https://github.com/fyyyn1210/wire-select" },
      ],
    },
    {
      slug: "kursbi",
      title: "KursBI",
      href: "https://packagist.org/packages/fyyyn1210/kursbi",
      dates: "2025",
      active: true,
      description:
        "A lightweight PHP & Laravel library for fetching official exchange rate data from Bank Indonesia (BI). Features built-in caching, dynamic User-Agent rotation, and seamless Laravel integration.",
      technologies: ["PHP", "Laravel", "Guzzle", "Composer", "Open Source"],
      image: "/uploads/projects/kursbi.jpeg",
      kind: "package",
      company: 'Open Source',
      role: 'Creator & Lead Developer',
      logoUrl: null,
      content:
        "KursBI adalah library PHP yang digunakan untuk mengambil data kurs mata uang dari Bank Indonesia (BI), dan dapat digunakan di project Laravel maupun PHP biasa.\n\nFitur utama: mengambil kurs untuk satu atau beberapa mata uang, menentukan rentang tanggal pengambilan data, membatasi jumlah data hasil (limit), menghitung konversi berdasarkan kurs beli dan jual, mendukung cache (Laravel Cache), menggunakan User-Agent dinamis untuk request, dan penanganan error terintegrasi dengan Laravel.\n\nMendukung semua mata uang yang tersedia di API BI, seperti USD, EUR, JPY, GBP, SGD, AUD, CHF, CAD, HKD, CNY, dan lainnya. Kebutuhan sistem: PHP ≥ 7.4, Laravel ≥ 8, GuzzleHttp, Laravel Cache.",
      links: [
        { type: "Packagist", href: "https://packagist.org/packages/fyyyn1210/kursbi" },
        { type: "GitHub", href: "https://github.com/fyyyn1210/kursbi" },
      ],
    },
    {
      slug: "starter-toolkit",
      title: "Starter Toolkit",
      href: "https://www.npmjs.com/package/starter-toolkit",
      dates: "2025",
      active: true,
      description:
        "A high-performance CLI scaffolding tool that automates the generation of starter projects. Eliminates boilerplate setup time with interactive prompts and pre-configured tech stacks.",
      technologies: ["Node.js", "TypeScript", "Commander.js", "Handlebars", "NPM CLI"],
      image: "/uploads/projects/starter-toolkit.png",
      kind: "package",
      company: 'Personal Project',
      role: 'Creator & Lead Developer',
      logoUrl: null,
      content:
        "CLI scaffolding tool buat generate starter project dengan cepat — interactive prompts, pre-configured tech stacks, tanpa perlu setup boilerplate manual tiap mulai project baru.",
      links: [
        { type: "NPM", href: "https://www.npmjs.com/package/starter-toolkit" },
        { type: "GitHub", href: "https://github.com/fyyyn1210/starter-toolkit" },
      ],
    },
    {
      slug: "suruhkami-id",
      title: "suruhkami.id",
      href: "https://suruhkami.id",
      dates: "2026 – Present",
      active: true,
      description:
        "Led the architectural migration of an on-demand delivery ecosystem from Laravel 9 to high-performance Express.js. Designed real-time tracking systems and optimized logistical flows based on direct field research with active drivers.",
      technologies: ["Node.js", "Express.js", "Sequelize", "Socket.io", "RabbitMQ", "PostgreSQL", "Xendit"],
      image: "/uploads/projects/suruhkami.png",
      kind: "project",
      company: 'WBlue Indonesia',
      role: 'Lead Backend Developer',
      logoUrl: "/wblue.png",
      content:
        "Migrasi arsitektur platform food ordering/delivery on-demand dari Laravel 9 ke Express.js performa tinggi. Termasuk sistem real-time tracking dan optimasi alur logistik berbasis riset lapangan langsung bersama driver aktif.",
      links: [{ type: "Website", href: "https://suruhkami.id" }],
    },
    {
      slug: "paperless",
      title: "Paperless",
      href: "https://paperless.digitalisasiuntuknegeri.com",
      dates: "2025",
      active: true,
      description:
        "100% legal digital signature platform compliant with UU ITE Article 11 and supervised by Kominfo. Migrated the core system to a Public Key Infrastructure (PKI) architecture, enabling official PSRE-verified electronic signatures for individuals and enterprise clients.",
      technologies: ["Node.js", "Express", "React", "PostgreSQL", "OpenSSL", "PKI"],
      image: "/uploads/projects/paperless.png",
      kind: "project",
      company: 'Maxximum Tech / PT Artristik Studio',
      role: 'Lead Full Stack Developer',
      logoUrl: null,
      content:
        "Migrasi sistem tanda tangan elektronik existing ke solusi digital signature yang sepenuhnya PKI-compliant untuk Paperless — Digitalisasi Untuk Negeri. Mengimplementasikan mekanisme signing berbasis PKI yang terverifikasi oleh PSRE (otoritas sertifikasi elektronik resmi pemerintah Indonesia), termasuk key pair generation, certificate management, dan validasi tanda tangan.",
      links: [{ type: "Website", href: "https://paperless.digitalisasiuntuknegeri.com" }],
    },
    {
      slug: "queue-management-system",
      title: "Queue Management System",
      href: "#",
      dates: "2023",
      active: false,
      description:
        "Digital queue management system built during internship at BBPP MPV BMTI government training center. Replaced manual paper-based queuing with real-time digital display boards and an admin management panel.",
      technologies: ["Laravel", "PHP", "MySQL", "Bootstrap"],
      image: "",
      kind: "project",
      company: 'BBPPMPV-BMTI',
      role: 'Full Stack Developer (Internship)',
      logoUrl: "/bppmpvbmti.jpeg",
      content:
        "Sistem manajemen antrian digital full-stack menggunakan Laravel, terintegrasi dengan mesin printer thermal untuk pencetakan tiket otomatis. Arsitektur didesain ulang dari model yang selalu bergantung server/online menjadi solusi yang bisa dijalankan lokal, mengurangi beban server dan menghilangkan ketergantungan internet. Mendukung tunnel ngrok opsional untuk exposure online tanpa infrastruktur server khusus.",
      links: [],
    },
  ];

  for (const p of projects) {
    const { links, ...projectData } = p;
    const [project] = await client.insert(projectSchema).values(projectData).returning();

    if (links.length > 0) {
      await client.insert(projectLinkSchema).values(
        links.map((l) => ({ ...l, projectId: project.id }))
      );
    }
  }
}

async function seedPosts() {
  console.log("→ Seeding posts...");
  await client.delete(postSchema);

  await client.insert(postSchema).values([
    {
      slug: "silo-lahir-dari-rasa-capek",
      title: "Silo — Extension Kecil yang Lahir dari Rasa Capek",
      publishedAt: "2026-06-20T00:00:00.000Z",
      author: "Rio Putra Pratama",
      summary:
        "Cerita di balik Silo — extension Chrome untuk menyimpan dan mengelola tab/link dengan cepat, lahir dari kebutuhan personal saat sedang mencari kerja sampingan.",
      image: "/uploads/blog/silo-story.png",
      language: "id",
      content:
        "Kenalin, Silo — extension kecil yang lahir dari rasa capek.\n\nJuni lalu, saya sempat menganggur dan sedang cari kerja sampingan. Setiap pagi rutinitasnya sama: buka belasan portal job satu-satu, cek update, klik link yang menarik, buka tab baru, ulangi lagi di portal berikutnya. Kedengarannya sepele. Tapi coba lakukan setiap hari — lama-lama itu jadi kerjaan tersendiri sebelum kerjaan yang sebenarnya.\n\nSaya coba akali dengan bikin shortcut di desktop. Lumayan, tapi rasanya masih berantakan. Pindah ke bookmark browser, lebih rapi sedikit — tapi begitu jumlahnya mulai banyak, saya sadar ada satu kebutuhan yang belum terpenuhi: cara mengelolanya. Folder yang fleksibel, cara cepat nambah banyak link sekaligus, cara bedain mana yang masih relevan dan mana yang sudah basi.\n\nSaya coba cari extension yang pas. Beberapa mendekati, tapi tidak ada yang benar-benar pas dengan cara kerja saya. Jadi saya putuskan bikin sendiri.\n\nNamanya Silo — extension Chrome kecil untuk menyimpan dan mengelola tab/link dengan cara yang menurut saya paling masuk akal: menyimpan harus cepat, tapi tetap bisa dirapikan belakangan — folder, tag, sampai deteksi kalau ada link yang double.\n\nYang menarik, proyek ini lahir bukan dari niat bikin produk. Ini lahir dari kebutuhan yang sangat personal. Kadang solusi terbaik untuk masalah kecil sehari-hari itu bukan dicari, tapi dibangun sendiri.\n\nCobain: https://trysilo.vercel.app",
    },
    {
      slug: "silo-hadir-di-microsoft-edge",
      title: "Update Kecil tentang Silo: Sekarang Hadir di Microsoft Edge Add-ons",
      publishedAt: "2026-09-04T00:00:00.000Z",
      author: "Rio Putra Pratama",
      summary:
        "Silo yang sebelumnya cuma ada di Chrome, sekarang resmi hadir juga di Microsoft Edge Add-ons — bisa langsung diinstall tanpa cara manual lagi.",
      image: "/uploads/blog/silo-edge-update.png",
      language: "id",
      content:
        "Update kecil tentang Silo 🚀\n\nBeberapa waktu lalu saya share cerita soal Silo — extension kecil yang saya bangun karena capek buka tab job portal yang sama berulang-ulang setiap pagi.\n\nSekarang, setelah sebelumnya hanya tersedia di Chrome, Silo resmi hadir di Microsoft Edge Add-ons juga. Buat yang sehari-hari pakai Edge (termasuk banyak yang default-nya Edge di lingkungan kerja/kantor), sekarang bisa langsung install tanpa perlu cara manual lagi.\n\nFitur intinya tetap sama: simpan tab dengan cepat tanpa harus mikir dulu mau ditaruh di mana, rapikan belakangan pakai folder & tag, dan deteksi otomatis kalau ada link yang double.\n\nSilo lahir dari kebutuhan personal yang sederhana, tapi ternyata cukup relate buat banyak orang yang juga sering \"tenggelam\" di tab browser. Senang bisa terus mengembangkannya sedikit demi sedikit.\n\nCoba di sini: https://trysilo.vercel.app",
    },
    {
      slug: "day-1-web-scraping-puppeteer-cheerio-expressjs",
      title: "Day 1 Mencoba Web Scraping dengan Puppeteer + Cheerio + ExpressJS",
      publishedAt: "2025-05-10T00:00:00.000Z",
      author: "Rio Putra Pratama",
      summary:
        "Latihan pribadi scraping data putusan kasus korupsi dari situs resmi Mahkamah Agung menggunakan Puppeteer, Cheerio, dan ExpressJS.",
      image: "/uploads/blog/web-scraping-day1.png",
      language: "id",
      content:
        "Hari ini saya mencoba tantangan baru: scraping data menggunakan kombinasi Puppeteer, Cheerio, dan ExpressJS. Sebagai latihan awal, saya membuat API yang menampilkan daftar putusan kasus korupsi dari situs resmi Mahkamah Agung.\n\nAPI ini mengambil data seperti: nama terdakwa, penuntut umum, nomor & tanggal putusan, ringkasan kasus, dan denda yang dijatuhkan.\n\nDisclaimer: proyek ini bukan untuk kepentingan komersial, melainkan hanya sebagai percobaan/latihan pribadi menggunakan Node.js.",
    },
    {
      slug: "kursbi-exchange-rate-indonesia",
      title: "📦 KursBI – Exchange Rate Indonesia (BI)",
      publishedAt: "2025-07-15T00:00:00.000Z",
      author: "Rio Putra Pratama",
      summary:
        "KursBI adalah library PHP untuk mengambil data kurs mata uang dari Bank Indonesia (BI), bisa dipakai di project Laravel maupun PHP biasa.",
      image: "/uploads/blog/kursbi-release.png",
      language: "id",
      content:
        "KursBI adalah library PHP yang digunakan untuk mengambil data kurs mata uang dari Bank Indonesia (BI), dan dapat digunakan di project Laravel maupun PHP biasa.\n\nFitur utama: mengambil kurs untuk satu atau beberapa mata uang, menentukan rentang tanggal pengambilan data, membatasi jumlah data hasil (limit), menghitung konversi berdasarkan kurs beli dan jual, mendukung cache (Laravel Cache), menggunakan User-Agent dinamis untuk request, dan penanganan error terintegrasi dengan Laravel.\n\nMata uang yang didukung: semua mata uang yang tersedia di API BI, seperti USD, EUR, JPY, GBP, SGD, AUD, CHF, CAD, HKD, CNY, dan lainnya.\n\nKebutuhan sistem: PHP ≥ 7.4, Laravel ≥ 8, GuzzleHttp, Laravel Cache.",
    },
    {
      slug: "wireselect-alternatif-select2-livewire",
      title: "🔗 WireSelect — Alternatif Select2 untuk Livewire",
      publishedAt: "2025-08-20T00:00:00.000Z",
      author: "Rio Putra Pratama",
      summary:
        "Package Laravel Livewire yang jadi alternatif Select2 — mendukung live search ke database, integrasi simpel tanpa wire:ignore, dan validasi Livewire langsung.",
      image: "/uploads/blog/wireselect-release.png",
      language: "id",
      content:
        "Beberapa waktu lalu, saya sering mengalami kesulitan saat mengintegrasikan Select2 di Livewire — mulai dari masalah validasi yang tidak muncul, penggunaan wire:ignore yang lumayan tricky, hingga penggunaannya di modal yang kurang mulus. Karena itu, saya memutuskan membuat sebuah package yang bisa menjadi alternatif Select2, khusus untuk Livewire.\n\nFitur utama: mendukung live search langsung ke database, bisa digunakan juga dengan data statis yang dikirim langsung ke komponen, integrasi yang simpel tanpa wire:ignore, dan mendukung validasi Livewire secara langsung.\n\nPackage ini saya beri nama WireSelect — dan saya pakai sendiri di beberapa project pribadi.",
    },
  ]);
}


/**
 * Seeder freelance — sumber data:
 *  - web-freelance/src/lib/translations.ts  → hero, testimonials, stats,
 *    faq, slug/name/tagline/packages tiap service (EN+ID sudah ada di sana).
 *  - web-freelance/src/lib/services.ts      → brandBg/brandChar per service
 *    (visual metadata, tidak dilokalisasi).
 *  - web-freelance/src/lib/projects.ts      → portfolio works (cuma EN,
 *    ID sementara disamakan dengan EN — silakan terjemahkan lewat admin).
 *  - web-freelance/src/lib/profile-data.ts  → kontak (email/WA/github, tidak dilokalisasi).
 *
 * CATATAN harga package: di translations.ts harga EN pakai USD ($130) dan
 * ID pakai IDR (Rp 2.000.000) — tapi kolom `price` di skema baru sengaja
 * TIDAK dilokalisasi (1 nilai buat semua bahasa, lihat rencana di project
 * docs). Seeder ini pakai harga IDR (Rp) sebagai nilai default karena target
 * klien utama Indonesia; ganti manual lewat admin kalau perlu ditampilkan
 * beda per bahasa.
 */
async function seedFreelanceHero() {
  console.log("→ Seeding freelance.hero (settings table)...");
  await setSetting("freelance.hero", {
    name: { en: "Wannen Works", id: "Wannen Works" },
    role: { en: "Freelance Web & Backend Developer", id: "Freelance Web & Backend Developer" },
    bioText1: {
      en: "I build ",
      id: "Saya membangun ",
    },
    bioHighlight: {
      en: "custom websites and systems",
      id: "website dan sistem custom",
    },
    bioText2: {
      en: " for your business, from SME websites to API integrations, and the source code is 100% yours.",
      id: " untuk bisnis Anda, dari website UMKM sampai integrasi API, dan source code-nya 100% milik Anda.",
    },
    bioText3: {
      en: "You talk directly to the developer: no middlemen, no hidden costs, with clear timelines from day one.",
      id: "Anda bicara langsung dengan developernya: tanpa perantara, tanpa biaya tersembunyi, dengan timeline yang jelas sejak awal.",
    },
  });
}

async function seedFreelanceContact() {
  console.log("→ Seeding freelance.contact (settings table)...");
  await setSetting("freelance.contact", {
    email: "contact@wannen.work",
    whatsapp: "+6281234567890",
    linkedin: "r-putera",
    githubPersonal: "fyyyn1210",
    githubOrg: "wannen-work",
  });
}

async function seedFreelanceServices() {
  console.log("→ Seeding freelance_services + freelance_service_packages...");
  await client.delete(freelanceServicePackageSchema);
  await client.delete(freelanceServiceSchema);

  const services: Array<{
    slug: string;
    name: { en: string; id: string };
    tagline: { en: string; id: string };
    category: string;
    brandBg: string;
    brandChar: string;
    order: number;
    packages: Array<{
      name: string;
      price: string | null;
      description: { en: string; id: string };
      features: { en: string[]; id: string[] };
      highlighted?: boolean;
      order: number;
    }>;
  }> = [
    {
      slug: "web-umkm",
      name: {
        en: "Digital Solutions for SMEs & Local Businesses",
        id: "Digital Solutions untuk UMKM & Bisnis Lokal",
      },
      tagline: {
        en: "Simple web and system solutions to help your business go digital.",
        id: "Website dan sistem sederhana untuk membantu usaha Anda go digital.",
      },
      category: "Pengembangan Web",
      brandBg: "oklch(0.55 0.15 145)",
      brandChar: "U",
      order: 1,
      packages: [
        {
          name: "Starter",
          price: "Rp 2.000.000",
          description: {
            en: "Business profile website with a simple product catalog.",
            id: "Website profil usaha dengan katalog produk sederhana.",
          },
          features: {
            en: ["SME Website Development", "Company Profile", "Landing Page", "E-commerce"],
            id: ["Website UMKM", "Company Profile", "Landing page", "E-commerce"],
          },
          order: 1,
        },
        {
          name: "Pro",
          price: "Rp 4.500.000",
          description: {
            en: "Website with online ordering system and a simple admin dashboard.",
            id: "Website dengan sistem pemesanan online dan panel admin sederhana.",
          },
          features: {
            en: [
              "All Starter features",
              "Online Ordering System (cart & checkout)",
              "Admin Dashboard to manage products & orders",
              "Order notifications sent via WhatsApp",
            ],
            id: [
              "Semua fitur paket Starter",
              "Sistem Pesan Online (keranjang & checkout)",
              "Dashboard Admin untuk kelola produk & pesanan",
              "Notifikasi Pesanan via WhatsApp",
            ],
          },
          highlighted: true,
          order: 2,
        },
      ],
    },
    {
      slug: "api-integration",
      name: {
        en: "Backend Development & System Integration Specialist",
        id: "Backend Development & System Integration Specialist",
      },
      tagline: {
        en: "Connecting your systems with payment gateways, third-party services, or other apps.",
        id: "Menghubungkan sistem Anda dengan payment gateway, layanan pihak ketiga, atau aplikasi lain.",
      },
      category: "Pengembangan Backend",
      brandBg: "oklch(0.55 0.15 30)",
      brandChar: "I",
      order: 2,
      packages: [
        {
          name: "Starter",
          price: "Rp 3.500.000",
          description: {
            en: "Integration of 1 third-party service into your existing system.",
            id: "Integrasi 1 layanan pihak ketiga ke sistem yang sudah ada.",
          },
          features: {
            en: [
              "API / Payment Gateway Integration",
              "Performance optimization (slow queries, heavy server load)",
              "Bug fixing / code review",
              "Legacy system migration to modern stack",
            ],
            id: [
              "Integrasi API / Payment Gateway",
              "Optimisasi (query lambat / server berat)",
              "Bug fixing",
              "Migrasi sistem lama ke stack baru",
            ],
          },
          order: 1,
        },
        {
          name: "Pro",
          price: "Rp 7.000.000",
          description: {
            en: "Multi-service integration with custom logging and basic monitoring.",
            id: "Integrasi multi-layanan dengan sistem logging dan monitoring.",
          },
          features: {
            en: [
              "All Starter features",
              "Up to 3 service integrations",
              "System Logging & Monitoring setup",
              "Technical consultation session",
            ],
            id: [
              "Semua fitur paket Starter",
              "Hingga 3 Integrasi Layanan",
              "Sistem Logging & Monitoring Dasar",
              "Sesi Konsultasi Teknis",
            ],
          },
          highlighted: true,
          order: 2,
        },
      ],
    },
    {
      slug: "backend-retainer",
      name: {
        en: "Dedicated Backend Developer for Long-term Partnership",
        id: "Dedicated Backend Developer for Long-term Partnership",
      },
      tagline: {
        en: "Ongoing backend development and support for your team or company.",
        id: "Dukungan pengembangan backend berkelanjutan untuk tim atau perusahaan Anda.",
      },
      category: "Kerjasama Jangka Panjang",
      brandBg: "oklch(0.45 0.12 280)",
      brandChar: "R",
      order: 3,
      packages: [
        {
          name: "Part-time",
          price: "Rp 6.000.000 /bulan",
          description: {
            en: "Limited hours for system maintenance and small feature updates.",
            id: "Alokasi waktu terbatas untuk maintenance dan pengembangan fitur kecil.",
          },
          features: {
            en: [
              "Long-term retainer partner (1-2 fixed clients)",
              "Team outsourcing (sprint-based development)",
              "Part-time / contract (e.g. 20 hours/week for 1 company)",
              "Maintenance & support (SLA, on-call for production systems)",
            ],
            id: ["Outsourcing", "Part-time / kontrak", "Maintenance & support"],
          },
          order: 1,
        },
        {
          name: "Dedicated",
          price: "Rp 12.000.000 /bulan",
          description: {
            en: "Larger allocation of hours for continuous product development.",
            id: "Alokasi waktu lebih besar untuk pengembangan fitur berkelanjutan.",
          },
          features: {
            en: [
              "All Part-time features",
              "Dedicated developer allocation",
              "Sprint-based team alignment",
              "Priority response & system SLA",
            ],
            id: [
              "Semua fitur paket Part-time",
              "Alokasi developer dedicated",
              "Penyelarasan tim berbasis sprint",
              "Respon prioritas & SLA sistem",
            ],
          },
          highlighted: true,
          order: 2,
        },
      ],
    },
  ];

  for (const s of services) {
    const { packages, ...serviceData } = s;
    const [service] = await client.insert(freelanceServiceSchema).values(serviceData).returning();

    if (packages.length > 0) {
      await client.insert(freelanceServicePackageSchema).values(
        packages.map((p) => ({
          serviceId: service.id,
          name: p.name,
          price: p.price,
          description: p.description,
          features: p.features,
          highlighted: p.highlighted ?? false,
          order: p.order,
        }))
      );
    }
  }
}

async function seedFreelanceTestimonials() {
  console.log("→ Seeding freelance_testimonials...");
  await client.delete(freelanceTestimonialSchema);

  await client.insert(freelanceTestimonialSchema).values([
    {
      quote: {
        en: "Wannen Works is someone who genuinely cares about the quality of the work. They are proactive, quick to understand requirements, and always deliver clean and maintainable code. A pleasure to work with.",
        id: "Wannen Works adalah mitra yang benar-benar peduli dengan kualitas pekerjaannya. Mereka proaktif, cepat memahami kebutuhan, dan selalu menghasilkan kode yang bersih dan mudah dipelihara. Menyenangkan bekerja bersamanya.",
      },
      name: "Nama Rekan Kerja",
      role: { en: "Backend Developer · WBlue Indonesia", id: "Backend Developer · WBlue Indonesia" },
      order: 1,
    },
    {
      quote: {
        en: "What impressed me most is the curiosity — they don't just implement what's asked, they understand the why behind it and often come up with better solutions. Great engineer to have on the team.",
        id: "Yang paling mengesankan dari mereka adalah rasa ingin tahunya — mereka tidak hanya mengimplementasikan apa yang diminta, mereka memahami alasan di baliknya dan sering mengusulkan solusi yang lebih baik. Developer yang hebat untuk dimiliki di tim.",
      },
      name: "Nama Rekan Kerja",
      role: { en: "Full Stack Developer · Maxximum Tech", id: "Full Stack Developer · Maxximum Tech" },
      order: 2,
    },
  ]);
}

async function seedFreelanceStats() {
  console.log("→ Seeding freelance_stats...");
  await client.delete(freelanceStatSchema);
  // Sengaja kosong: angka placeholder (500+ UMKM, 4.9/5, dst.) dihapus karena
  // tidak nyata. Section "Dalam angka" otomatis tersembunyi selama tabel ini
  // kosong; isi lewat admin begitu ada angka asli (jumlah proyek, tahun, dll).
}

async function seedFreelanceFaqs() {
  console.log("→ Seeding freelance_faqs...");
  await client.delete(freelanceFaqSchema);

  await client.insert(freelanceFaqSchema).values([
    {
      question: { en: "What kind of projects do you take on?", id: "Proyek seperti apa yang Anda terima?" },
      answer: {
        en: "Websites and web apps, backend systems, REST APIs, and integrations (payment gateways, third-party services) for SMEs, startups, and teams that need production-ready code.",
        id: "Website dan web app, sistem backend, REST API, serta integrasi (payment gateway, layanan pihak ketiga) untuk UMKM, startup, dan tim yang butuh kode siap produksi.",
      },
      order: 1,
    },
    {
      question: { en: "Do you build mobile apps?", id: "Apakah menerima pembuatan aplikasi mobile?" },
      answer: {
        en: "Not at the moment. I focus on web and backend. Every website I build is fully responsive on phones, and if you already have a mobile app, I can build its backend/API.",
        id: "Untuk saat ini belum. Saya fokus di web dan backend. Website yang saya buat sudah responsif di HP, dan kalau Anda sudah punya aplikasi mobile, saya bisa bantu membangun backend/API-nya.",
      },
      order: 2,
    },
    {
      question: { en: "How long does a project take?", id: "Berapa lama pengerjaan proyek?" },
      answer: {
        en: "Small features can be done in 24–48 hours. Full projects are scoped per requirements, but I always communicate timelines upfront.",
        id: "Fitur kecil bisa selesai dalam 24–48 jam. Proyek penuh disesuaikan dengan kebutuhan, tapi timeline selalu dikomunikasikan di awal.",
      },
      order: 3,
    },
    {
      question: { en: "Do I own the source code?", id: "Apakah source code jadi milik saya?" },
      answer: {
        en: "Yes. After final payment, the source code, server access, and documentation are fully handed over. No lock-in.",
        id: "Ya. Setelah pelunasan, source code, akses server, dan dokumentasi diserahkan penuh. Tidak ada lock-in.",
      },
      order: 4,
    },
    {
      question: { en: "How does payment work?", id: "Bagaimana sistem pembayarannya?" },
      answer: {
        en: "Usually a 50% down payment upfront and the rest on handover. Larger projects can be split into milestones.",
        id: "Umumnya DP 50% di awal dan pelunasan saat serah terima. Proyek besar bisa dibagi per tahap (milestone).",
      },
      order: 5,
    },
    {
      question: { en: "Do you offer revisions?", id: "Apakah ada revisi?" },
      answer: {
        en: "Yes. Each stage includes 2 rounds of revisions within the agreed scope. Changes outside the scope are discussed and estimated separately.",
        id: "Ada. Setiap tahap mendapat 2 kali revisi sesuai scope yang disepakati. Perubahan di luar scope dibahas dan diestimasi terpisah.",
      },
      order: 6,
    },
    {
      question: { en: "What happens after launch?", id: "Bagaimana setelah website live?" },
      answer: {
        en: "There's a support period for bug fixes after launch. For ongoing maintenance or new features, monthly maintenance packages are available.",
        id: "Ada masa support untuk perbaikan bug setelah peluncuran. Untuk pemeliharaan rutin atau fitur baru, tersedia paket maintenance bulanan.",
      },
      order: 7,
    },
    {
      question: { en: "How do we get started?", id: "Bagaimana cara mulainya?" },
      answer: {
        en: "Just reach out via WhatsApp or email. I'll ask a few questions, scope the work, and send a quote.",
        id: "Hubungi via WhatsApp atau email. Saya akan tanya beberapa hal, tentukan scope pekerjaan, lalu kirimkan penawaran.",
      },
      order: 8,
    },
    {
      question: { en: "What's your preferred tech stack?", id: "Tech stack apa yang Anda gunakan?" },
      answer: {
        en: "Node.js / Express, Laravel, React — but I adapt to what's already in your project.",
        id: "Node.js / Express, Laravel, React — tapi saya menyesuaikan dengan apa yang sudah ada di proyek Anda.",
      },
      order: 9,
    },
  ]);
}

async function seedFreelanceWorks() {
  console.log("→ Seeding freelance_works...");
  await client.delete(freelanceWorkSchema);

  // Sumber: web-freelance/src/lib/projects.ts — cuma tersedia dalam EN,
  // ID sementara disamakan dengan EN (belum ada terjemahan resmi).
  await client.insert(freelanceWorkSchema).values([
    {
      slug: "suruhkami",
      name: "suruhkami.id — Food Delivery Platform",
      year: "2025 – Present",
      client: "WBlue Indonesia",
      category: "FoodTech",
      gradient: "linear-gradient(90deg, oklch(0.65 0.18 145), oklch(0.5 0.15 120))",
      tags: ["Node.js", "Express.js", "Socket.io", "RabbitMQ", "PostgreSQL", "Xendit"],
      image: "",
      brandBg: "oklch(0.55 0.18 145)",
      brandChar: "S",
      overview: {
        en: "Led the architectural migration of an on-demand food delivery ecosystem from Laravel 8 to high-performance Express.js. Implemented real-time order tracking using Socket.io, message queuing with RabbitMQ, and integrated Xendit as the payment gateway.",
        id: "Led the architectural migration of an on-demand food delivery ecosystem from Laravel 8 to high-performance Express.js. Implemented real-time order tracking using Socket.io, message queuing with RabbitMQ, and integrated Xendit as the payment gateway.",
      },
      description: {
        en: "suruhkami.id is an on-demand food delivery platform serving restaurant management, customer ordering, and driver assignment in a single unified platform. The legacy Laravel 8 system suffered from performance bottlenecks. We migrated the entire backend core into Express.js, added AMQP-based order processing via RabbitMQ, integrated Xendit callbacks for instant transaction confirmation, and leveraged Socket.io for live driver tracking on the map.",
        id: "suruhkami.id is an on-demand food delivery platform serving restaurant management, customer ordering, and driver assignment in a single unified platform. The legacy Laravel 8 system suffered from performance bottlenecks. We migrated the entire backend core into Express.js, added AMQP-based order processing via RabbitMQ, integrated Xendit callbacks for instant transaction confirmation, and leveraged Socket.io for live driver tracking on the map.",
      },
      scope: ["Backend Migration", "Real-time Gateway", "Message Queuing"],
      discoverUrl: "https://suruhkami.id",
      order: 1,
    },
    {
      slug: "paperless-freelance",
      name: "Paperless — Digital Signature Platform",
      year: "2024 – 2025",
      client: "Maxximum Tech",
      category: "GovTech",
      gradient: "linear-gradient(90deg, oklch(0.55 0.15 250), oklch(0.4 0.1 270))",
      tags: ["Node.js", "Express.js", "React", "PostgreSQL", "OpenSSL", "PKI"],
      image: "",
      brandBg: "oklch(0.5 0.15 250)",
      brandChar: "P",
      overview: {
        en: "Built the backend for a PSrE-compliant digital signature platform using OpenSSL cryptography and Public Key Infrastructure (PKI). Implemented Long-Term Validation (LTV) and Timestamp Authority (TSA) integration.",
        id: "Built the backend for a PSrE-compliant digital signature platform using OpenSSL cryptography and Public Key Infrastructure (PKI). Implemented Long-Term Validation (LTV) and Timestamp Authority (TSA) integration.",
      },
      description: {
        en: "Paperless is a legally-binding electronic document signing platform matching Indonesia's national electronic certification authority (PSrE) standards. The system handles secure PDF signing using X.509 certificates, integrates with TSA servers to seal signature timing, and supports LTV to maintain validity even when the signing certificate expires.",
        id: "Paperless is a legally-binding electronic document signing platform matching Indonesia's national electronic certification authority (PSrE) standards. The system handles secure PDF signing using X.509 certificates, integrates with TSA servers to seal signature timing, and supports LTV to maintain validity even when the signing certificate expires.",
      },
      scope: ["Cryptography", "PKI Infrastructure", "PDF Digitizer"],
      discoverUrl: null,
      order: 2,
    },
  ]);
}

async function seedFreelance() {
  console.log("=== Seeding Freelance (web-freelance) ===");
  await seedFreelanceHero();
  await seedFreelanceContact();
  await seedFreelanceServices();
  await seedFreelanceTestimonials();
  await seedFreelanceStats();
  await seedFreelanceFaqs();
  await seedFreelanceWorks();
}

async function main() {
  console.log("=== Seeding Portfolio DB ===");
  await seedProfile();
  await seedWork();
  await seedEducation();
  await seedCertificates();
  await seedActivities();
  await seedSkills();
  await seedProjects();
  await seedPosts();
  await seedFreelance();
  console.log("=== Selesai. ===");
  console.log(
    "Data sekarang sinkron dengan web/src/data/resume.tsx. Ganti logoUrl/avatarUrl/image dari /uploads/... lewat POST /upload + admin panel."
  );
  process.exit(0);
}

main().catch((err) => {
  console.error("Seeding gagal:", err);
  process.exit(1);
});
