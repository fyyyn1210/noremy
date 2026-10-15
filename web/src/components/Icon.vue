<script setup lang="ts">
// Ikon garis inline (currentColor), satu path per nama.
const PATHS: Record<string, string> = {
  home: 'M4 10.5L12 4l8 6.5V20h-5.5v-5h-5v5H4z',
  calendar: 'M7 5h10a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3zM4 10h16M9 3v4M15 3v4',
  db: 'M5 6c0-1.4 3.1-2.5 7-2.5s7 1.1 7 2.5-3.1 2.5-7 2.5S5 7.4 5 6zM5 6v12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6M5 12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5',
  note: 'M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h5',
  chart: 'M5 20V12M10 20V6M15 20v-9M20 20V9',
  plus: 'M12 5v14M5 12h14',
  flame: 'M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-4 2.5-5 .3 1.6 1.2 2.6 2.5 3 0-3-1-5.5 0-8z',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  task: 'M8 4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4zM8.5 12l2.5 2.5 4.5-5',
  book: 'M4 6.5A2.5 2.5 0 0 1 6.5 4H20v14H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5V6.5',
  left: 'M15 5l-7 7 7 7',
  right: 'M9 5l7 7-7 7',
  search: 'M11 4.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13zM20 20l-4.2-4.2',
  clock: 'M12 4a8 8 0 1 1 0 16 8 8 0 0 1 0-16zM12 8v4.5l3 2',
  external: 'M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
  bell: 'M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0',
  refresh: 'M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6',
  logo: 'M6 19V5l12 14V5',
}
withDefaults(defineProps<{ name: string; size?: number; width?: number }>(), { size: 22, width: 2 })
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" :stroke-width="width" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path :d="PATHS[name]" />
  </svg>
</template>
