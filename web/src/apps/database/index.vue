<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { api, DB_LABEL } from '../../api'
import DbTable from '../../components/DbTable.vue'

const keys = ref<string[]>([])
const key = ref('tasks')

onMounted(async () => {
  keys.value = (await api<string[]>('/db')).filter((k) => k !== 'notesDb') // notesDb ada di menu Catatan
})
</script>

<template>
  <section>
    <h1>Database</h1>
    <nav class="pills">
      <button v-for="k in keys" :key="k" :class="{ active: k === key }" @click="key = k">{{ DB_LABEL[k] ?? k }}</button>
    </nav>
    <DbTable :db-key="key" />
  </section>
</template>
