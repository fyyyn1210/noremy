<script setup lang="ts">
import { computed, ref } from 'vue'
import { api, setToken, token } from './api'
import Icon from './components/Icon.vue'
import HariIni from './apps/hari-ini/index.vue'
import Kalender from './apps/kalender/index.vue'
import Database from './apps/database/index.vue'
import Catatan from './apps/catatan/index.vue'
import Monitor from './apps/monitor/index.vue'

// Menu baru = satu folder di apps/ + satu baris di sini.
const TABS = [
  { id: 'hari-ini', label: 'Hari ini', icon: 'home', comp: HariIni },
  { id: 'kalender', label: 'Kalender', icon: 'calendar', comp: Kalender },
  { id: 'database', label: 'Database', icon: 'db', comp: Database },
  { id: 'catatan', label: 'Catatan', icon: 'note', comp: Catatan },
  { id: 'monitor', label: 'Monitor', icon: 'chart', comp: Monitor },
]

const hash = ref(location.hash.slice(2))
addEventListener('hashchange', () => (hash.value = location.hash.slice(2)))
const tab = computed(() => TABS.find((t) => t.id === hash.value) ?? TABS[0])

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
  <template v-else>
    <KeepAlive>
      <component :is="tab.comp" :key="tab.id" />
    </KeepAlive>
    <nav class="tabbar" aria-label="Menu utama">
      <div class="inner">
        <a
          v-for="t in TABS" :key="t.id" :href="`#/${t.id}`"
          :class="{ active: t.id === tab.id }" :aria-current="t.id === tab.id ? 'page' : undefined"
        >
          <Icon :name="t.icon" :width="t.id === tab.id ? 2.4 : 1.8" />{{ t.label }}
        </a>
      </div>
    </nav>
  </template>
</template>
