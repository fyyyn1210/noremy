<script setup lang="ts">
import { computed } from 'vue'
import Icon from '../../components/Icon.vue'
import HariIni from './hari-ini/index.vue'
import Kalender from './kalender/index.vue'
import Database from './database/index.vue'
import Catatan from './catatan/index.vue'
import Monitor from './monitor/index.vue'

const props = defineProps<{ tab: string }>()

const TABS = [
  { id: 'hari-ini', label: 'Hari ini', icon: 'home', comp: HariIni },
  { id: 'kalender', label: 'Kalender', icon: 'calendar', comp: Kalender },
  { id: 'database', label: 'Database', icon: 'db', comp: Database },
  { id: 'catatan', label: 'Catatan', icon: 'note', comp: Catatan },
  { id: 'monitor', label: 'Monitor', icon: 'chart', comp: Monitor },
]
const current = computed(() => TABS.find((t) => t.id === props.tab) ?? TABS[0])
</script>

<template>
  <KeepAlive>
    <component :is="current.comp" :key="current.id" />
  </KeepAlive>
  <nav class="tabbar" aria-label="Menu NoDaily">
    <div class="inner">
      <a
        v-for="t in TABS" :key="t.id" :href="`#/nodaily/${t.id}`"
        :class="{ active: t.id === current.id }" :aria-current="t.id === current.id ? 'page' : undefined"
      >
        <Icon :name="t.icon" :width="t.id === current.id ? 2.4 : 1.8" />{{ t.label }}
      </a>
    </div>
  </nav>
</template>
