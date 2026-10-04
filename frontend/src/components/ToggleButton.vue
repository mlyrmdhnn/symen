<script setup lang="ts">
import { ref } from 'vue'
const isTrue = defineModel({ default: false })
</script>
<template>
  <label class="flex items-center space-x-2 cursor-pointer select-none">
    <input type="checkbox" v-model="isTrue" class="sr-only peer" />
    <div
      class="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 relative"
    ></div>
  </label>
</template>
