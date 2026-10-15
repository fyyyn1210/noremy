<script setup lang="ts">
import { computed, ref } from 'vue'
import Icon from '../components/Icon.vue'
import Logo from '../components/Logo.vue'
import { APPS, type AppInfo } from './registry'
import { installed, installPrompt, installPWA, isIOS, standalone, theme, type Theme } from '../prefs'

const mine = computed(() => APPS.filter((a) => installed.value.includes(a.id)))
const msg = ref('')

// Pasang = tambahkan ke Noremy; sekalian tawarkan install PWA ke perangkat bila belum.
async function pasang(a: AppInfo) {
  if (!installed.value.includes(a.id)) installed.value.push(a.id)
  msg.value = `${a.name} terpasang.`
  if (!standalone.value && installPrompt.value) {
    if (await installPWA()) msg.value = `${a.name} terpasang, Noremy ditambahkan ke perangkat.`
  }
}
function lepas(a: AppInfo) {
  if (!confirm(`Lepas ${a.name} dari Noremy? Data di Notion tidak terhapus.`)) return
  installed.value = installed.value.filter((id) => id !== a.id)
}

const THEMES: { id: Theme; label: string; icon: string }[] = [
  { id: 'system', label: 'Sistem', icon: 'monitor' },
  { id: 'light', label: 'Terang', icon: 'sun' },
  { id: 'dark', label: 'Gelap', icon: 'moon' },
]
const tileStyle = (a: AppInfo) => `background: color-mix(in srgb, ${a.color} ${a.logo ? 6 : 16}%, var(--card)); color: ${a.color}`
</script>

<template>
  <main class="screen">
    <header class="head">
      <div class="brand">
        <Logo :size="32" />Noremy
      </div>
    </header>

    <!-- Install PWA ke perangkat -->
    <section v-if="!standalone" class="card dark stack" style="border-radius: 24px; padding: 18px; gap: 8px">
      <span class="small" style="font-weight: 700; letter-spacing: 0.4px; opacity: 0.7">PASANG DI PERANGKAT</span>
      <span style="font-size: 18px; font-weight: 800">Buka Noremy seperti aplikasi biasa</span>
      <span v-if="isIOS" class="small" style="opacity: 0.8">Di iPhone: ketuk tombol Bagikan di Safari, lalu "Add to Home Screen".</span>
      <span v-else-if="!installPrompt" class="small" style="opacity: 0.8">Buka menu browser (⋮) lalu pilih "Install app" / "Instal Noremy".</span>
      <button v-if="installPrompt" class="btn" style="align-self: flex-start; background: var(--on-ink); color: var(--ink)" @click="installPWA">
        <Icon name="download" :size="18" />Pasang Noremy
      </button>
    </section>

    <p v-if="msg" class="small" role="status" style="font-weight: 600">{{ msg }}</p>

    <template v-if="mine.length">
      <div class="section-head"><h2>Aplikasi saya</h2></div>
      <div class="app-grid">
        <a v-for="a in mine" :key="a.id" :href="`#/${a.id}/${a.home}`" class="app-tile">
          <span class="app-icon" :style="tileStyle(a)"><component :is="a.logo" v-if="a.logo" :size="44" /><Icon v-else :name="a.icon" :size="30" :width="2" /></span>
          {{ a.name }}
        </a>
      </div>
    </template>

    <div class="section-head"><h2>Semua aplikasi</h2></div>
    <ul class="list">
      <li v-for="a in APPS" :key="a.id" class="item" style="align-items: flex-start">
        <span class="tile" :style="tileStyle(a)"><component :is="a.logo" v-if="a.logo" :size="34" /><Icon v-else :name="a.icon" :size="24" /></span>
        <div class="grow">
          <span class="title">{{ a.name }}</span>
          <span class="sub">{{ a.desc }}</span>
          <button v-if="installed.includes(a.id)" class="btn text small" style="min-height: 32px; padding: 0" @click="lepas(a)">Lepas</button>
        </div>
        <span v-if="!a.comp" class="pill">Segera</span>
        <a v-else-if="installed.includes(a.id)" class="btn outline" style="min-height: 38px; padding: 0 16px" :href="`#/${a.id}/${a.home}`">Buka</a>
        <button v-else class="btn" style="min-height: 38px; padding: 0 16px" @click="pasang(a)">Pasang</button>
      </li>
    </ul>

    <div class="section-head"><h2>Tampilan</h2></div>
    <div class="seg" role="radiogroup" aria-label="Tema">
      <button v-for="t in THEMES" :key="t.id" role="radio" :aria-checked="theme === t.id" :aria-selected="theme === t.id" @click="theme = t.id">
        <span class="row" style="justify-content: center; gap: 6px"><Icon :name="t.icon" :size="16" />{{ t.label }}</span>
      </button>
    </div>
  </main>
</template>
