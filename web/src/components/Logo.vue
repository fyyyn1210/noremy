<script setup lang="ts">
// Logo Noremy: tiga daun (ikut warna teks/tema) + bintang biru. Dekoratif: selalu didampingi teks.
withDefaults(defineProps<{ size?: number }>(), { size: 30 })
</script>

<template>
  <svg :width="size" :height="size" viewBox="350 346 555 555" aria-hidden="true">
    <g fill="currentColor">
      <path d="M400 410H507A110 110 0 0 1 617 520V611A20 20 0 0 1 597 631H500A120 120 0 0 1 380 511V430A20 20 0 0 1 400 410Z" />
      <path d="M500 661H595A18 18 0 0 1 613 679V761A115 115 0 0 1 498 876H398A18 18 0 0 1 380 858V781A120 120 0 0 1 500 661Z" />
      <path d="M748 620H853A18 18 0 0 1 871 638V747A115 115 0 0 1 756 862H748A110 110 0 0 1 638 752V730A110 110 0 0 1 748 620Z" />
    </g>
    <path fill="#5B5EF4" d="M777 372Q795 456 877 474Q795 492 777 576Q759 492 677 474Q759 456 777 372Z" />
  </svg>
</template>
