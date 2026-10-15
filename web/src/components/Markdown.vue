<script setup lang="ts">
import { computed } from 'vue'

// Render markdown sederhana dari server tanpa v-html (aman dari XSS).
const props = defineProps<{ text: string }>()
const emit = defineEmits<{ open: [string] }>()

type Block = { k: string; t: string; id?: string; checked?: boolean }

const blocks = computed<Block[]>(() =>
  props.text.split(/\n\n/).map((s): Block => {
    let m
    if (s.startsWith('```')) return { k: 'code', t: s.replace(/^```.*\n?/, '').replace(/\n?```$/, '') }
    if ((m = s.match(/^\[\[page:([^|]+)\|(.*)\]\]$/))) return { k: 'page', id: m[1], t: m[2] }
    if ((m = s.match(/^\[\[db:([^|]+)\|(.*)\]\]$/))) return { k: 'db', t: m[2] }
    if ((m = s.match(/^!\[\]\((.*)\)$/))) return { k: 'img', t: m[1] }
    if ((m = s.match(/^(#{1,3}) (.*)/))) return { k: 'h' + m[1].length, t: m[2] }
    if ((m = s.match(/^- \[([ x])\] (.*)/s))) return { k: 'todo', t: m[2], checked: m[1] === 'x' }
    if ((m = s.match(/^(- |1\. |▸ )(.*)/s))) return { k: 'li', t: m[2] }
    if ((m = s.match(/^> (.*)/s))) return { k: 'quote', t: m[1] }
    if (s === '---') return { k: 'hr', t: '' }
    return { k: 'p', t: s }
  }),
)
</script>

<template>
  <div class="md">
    <template v-for="(b, i) in blocks" :key="i">
      <h2 v-if="b.k === 'h1'">{{ b.t }}</h2>
      <h3 v-else-if="b.k === 'h2'">{{ b.t }}</h3>
      <h4 v-else-if="b.k === 'h3'">{{ b.t }}</h4>
      <p v-else-if="b.k === 'li'" class="li">• {{ b.t }}</p>
      <p v-else-if="b.k === 'todo'" class="li">{{ b.checked ? '☑' : '☐' }} {{ b.t }}</p>
      <blockquote v-else-if="b.k === 'quote'">{{ b.t }}</blockquote>
      <pre v-else-if="b.k === 'code'"><code>{{ b.t }}</code></pre>
      <hr v-else-if="b.k === 'hr'" />
      <p v-else-if="b.k === 'page'"><a href="#" @click.prevent="emit('open', b.id!)">📄 {{ b.t }}</a></p>
      <p v-else-if="b.k === 'db'" class="muted">🗃 {{ b.t }} (database, buka di Notion)</p>
      <img v-else-if="b.k === 'img'" :src="b.t" alt="" loading="lazy" />
      <p v-else>{{ b.t }}</p>
    </template>
  </div>
</template>
