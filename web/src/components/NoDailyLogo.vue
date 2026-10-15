<script setup lang="ts">
// Logo NoDaily: kalender (ikut warna teks/tema) + bintang biru. Dekoratif: selalu didampingi teks.
withDefaults(defineProps<{ size?: number }>(), { size: 30 })
</script>

<template>
  <svg :width="size" :height="size" viewBox="390 397 520 520" aria-hidden="true">
    <g fill="currentColor">
      <rect x="428" y="449" width="349" height="70" rx="35" />
      <rect x="428" y="579" width="89" height="89" rx="26" />
      <rect x="558" y="579" width="89" height="89" rx="26" />
      <rect x="688" y="579" width="89" height="89" rx="26" />
      <rect x="428" y="709" width="89" height="89" rx="26" />
      <rect x="558" y="709" width="89" height="89" rx="26" />
    </g>
    <path fill="#5B5EF4" d="M787 693Q804 761 873 779Q804 797 787 866Q770 797 701 779Q770 761 787 693Z" />
  </svg>
</template>
