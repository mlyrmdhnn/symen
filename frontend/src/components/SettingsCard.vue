<script setup lang="ts">
const props = defineProps({
  tittle: String,
})
</script>
<template>
  <section class="border border-slate-800 rounded-md p-4 bg-[#10151A]">
    <h2 class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
      {{ props.tittle }}
    </h2>
    <slot></slot>
  </section>
</template>
