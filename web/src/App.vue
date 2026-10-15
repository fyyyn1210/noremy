<script setup lang="ts">
import { computed, ref } from 'vue'
import { setToken, token } from './api'
import HariIni from './apps/hari-ini/index.vue'
import Kalender from './apps/kalender/index.vue'
import Database from './apps/database/index.vue'
import Catatan from './apps/catatan/index.vue'
import Monitor from './apps/monitor/index.vue'

// Menu baru = satu folder di apps/ + satu baris di sini.
const TABS = [
  { id: 'hari-ini', label: 'Hari ini', icon: '☀', comp: HariIni },
  { id: 'kalender', label: 'Kalender', icon: '▦', comp: Kalender },
  { id: 'database', label: 'Database', icon: '☰', comp: Database },
  { id: 'catatan', label: 'Catatan', icon: '✎', comp: Catatan },
  { id: 'monitor', label: 'Monitor', icon: '◔', comp: Monitor },
]

const hash = ref(location.hash.slice(2))
addEventListener('hashchange', () => (hash.value = location.hash.slice(2)))
const tab = computed(() => TABS.find((t) => t.id === hash.value) ?? TABS[0])

const input = ref('')
</script>

<template>
  <form v-if="!token" class="login stack" @submit.prevent="setToken(input.trim())">
    <h1>Noremy</h1>
    <label class="field">
      <span>Token aplikasi</span>
      <input v-model="input" type="password" autocomplete="current-password" required />
    </label>
    <button>Masuk</button>
  </form>
  <template v-else>
    <main>
      <KeepAlive>
        <component :is="tab.comp" :key="tab.id" />
      </KeepAlive>
    </main>
    <nav class="tabbar">
      <a v-for="t in TABS" :key="t.id" :href="`#/${t.id}`" :class="{ active: t.id === tab.id }" :aria-current="t.id === tab.id ? 'page' : undefined">
        <span aria-hidden="true">{{ t.icon }}</span>{{ t.label }}
      </a>
    </nav>
  </template>
</template>
