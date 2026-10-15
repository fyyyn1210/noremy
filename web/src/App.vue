<script setup lang="ts">
import { computed, ref } from 'vue'
import { api, setToken, token } from './api'
import { installed } from './prefs'
import { APPS } from './apps/registry'
import Launcher from './apps/index.vue'
import Icon from './components/Icon.vue'

// Rute hash: #/apps = katalog Noremy, #/<app>/<tab> = sub-app terpasang.
const hash = ref(location.hash)
addEventListener('hashchange', () => (hash.value = location.hash))
const route = computed(() => {
  const [appId = '', tab = ''] = hash.value.replace(/^#\/?/, '').split('/')
  const app = APPS.find((a) => a.id === appId && a.comp && installed.value.includes(a.id))
  if (app) return { app, tab: tab || app.home }
  if (appId === 'apps') return null
  // Tanpa rute: buka sub-app pertama yang terpasang, kalau ada.
  const first = !appId && APPS.find((a) => a.comp && installed.value.includes(a.id))
  return first ? { app: first, tab: first.home } : null
})

const input = ref('')
const loginErr = ref('')
async function login() {
  loginErr.value = ''
  setToken(input.value.trim())
  try {
    await api('/db') // 401 menghapus token lagi -> tetap di layar login
  } catch (e: any) {
    loginErr.value = e.message === 'Token salah' ? 'Token salah. Pakai APP_TOKEN, bukan token Notion.' : e.message
  }
}
</script>

<template>
  <form v-if="!token || loginErr" class="login" @submit.prevent="login">
    <div class="brand">
      <span class="mark"><Icon name="logo" :size="16" :width="2.6" /></span>Noremy
    </div>
    <p class="muted">Masukkan token aplikasi (<code>APP_TOKEN</code> dari server), bukan token Notion.</p>
    <label class="field">
      <span>Token aplikasi</span>
      <input v-model="input" type="password" autocomplete="current-password" required />
    </label>
    <p v-if="loginErr" class="error" role="alert">{{ loginErr }}</p>
    <button class="btn">Masuk</button>
  </form>
  <KeepAlive v-else>
    <component :is="route.app.comp" v-if="route" :key="route.app.id" :tab="route.tab" />
    <Launcher v-else />
  </KeepAlive>
</template>
