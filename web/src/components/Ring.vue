<script setup lang="ts">
import { computed } from 'vue'

const p = withDefaults(defineProps<{ value: number; size?: number; width?: number; color?: string }>(), {
  size: 58,
  width: 6,
  color: 'var(--ink)',
})
const r = computed(() => (p.size - p.width) / 2 - 1)
const c = computed(() => 2 * Math.PI * r.value)
const dash = computed(() => `${Math.max(0, Math.min(1, p.value || 0)) * c.value} ${c.value}`)
</script>

<template>
  <div class="ring" :style="{ width: size + 'px', height: size + 'px' }">
    <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`" aria-hidden="true">
      <circle :cx="size / 2" :cy="size / 2" :r="r" fill="none" stroke="var(--track)" :stroke-width="width" />
      <circle
        :cx="size / 2" :cy="size / 2" :r="r" fill="none" :stroke="color" :stroke-width="width"
        stroke-linecap="round" :stroke-dasharray="dash" :transform="`rotate(-90 ${size / 2} ${size / 2})`"
      />
    </svg>
    <div class="ring-center"><slot /></div>
  </div>
</template>
