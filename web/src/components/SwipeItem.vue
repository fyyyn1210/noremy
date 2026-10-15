<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import Icon from './Icon.vue'

// Geser ke kanan melewati 35% lebar = emit "swipe". Gerak vertikal tetap scroll halaman.
withDefaults(defineProps<{ label?: string; undo?: boolean }>(), { label: 'Selesai', undo: false })
const emit = defineEmits<{ swipe: [] }>()

const el = ref<HTMLElement>()
const dx = ref(0)
const anim = ref(false)
let x0 = 0, y0 = 0, active = false, dragging = false, moved = false
let timer = 0

function down(e: PointerEvent) {
  if (e.button) return
  x0 = e.clientX
  y0 = e.clientY
  active = true
  dragging = moved = false
  anim.value = false
}
function move(e: PointerEvent) {
  if (!active) return
  const x = e.clientX - x0, y = e.clientY - y0
  if (!dragging) {
    if (Math.abs(y) > 10) return void (active = false) // scroll vertikal
    if (x < 10 || x < Math.abs(y)) return
    dragging = moved = true
    el.value!.setPointerCapture(e.pointerId)
  }
  dx.value = Math.max(0, x)
}
function up() {
  active = false
  if (!dragging) return
  dragging = false
  anim.value = true
  const w = el.value!.offsetWidth
  if (dx.value > w * 0.35) {
    dx.value = w
    timer = window.setTimeout(() => {
      emit('swipe')
      // Kalau induk tidak menghapus baris (mis. gagal simpan), kembalikan posisinya.
      timer = window.setTimeout(() => (dx.value = 0), 1200)
    }, 180)
  } else dx.value = 0
}
// Setelah menggeser, klik bawaan jangan membuka detail.
function click(e: MouseEvent) {
  if (!moved) return
  e.stopPropagation()
  e.preventDefault()
  moved = false
}
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <div class="swipe" :class="{ undo }">
    <div class="swipe-bg" :style="{ opacity: Math.min(1, dx / 80) }" aria-hidden="true">
      <Icon :name="undo ? 'refresh' : 'check'" :size="20" :width="2.6" />{{ label }}
    </div>
    <div
      ref="el" class="swipe-fg"
      :style="{ transform: `translateX(${dx}px)`, transition: anim ? 'transform 0.18s ease' : 'none' }"
      @pointerdown="down" @pointermove="move" @pointerup="up" @pointercancel="up" @click.capture="click"
    >
      <slot />
    </div>
  </div>
</template>
