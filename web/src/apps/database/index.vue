<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { api, DB_LABEL } from '../../api'
import DbTable from '../../components/DbTable.vue'

const keys = ref<string[]>([])
const key = ref('tasks')
const err = ref('')

onMounted(async () => {
  try {
    keys.value = (await api<string[]>('/db')).filter((k) => k !== 'notesDb') // notesDb ada di menu Catatan
  } catch (e: any) {
    err.value = e.message
  }
})
</script>

<template>
  <main class="screen">
    <div class="head"><h1>Database</h1></div>
    <p v-if="err" class="error" role="alert">{{ err }}</p>
    <nav class="pills" aria-label="Pilih database">
      <button v-for="k in keys" :key="k" :class="{ active: k === key }" :aria-pressed="k === key" @click="key = k">
        {{ DB_LABEL[k] ?? k }}
      </button>
    </nav>
    <DbTable :db-key="key" :read-only="key === 'streak'" />
  </main>
</template>
