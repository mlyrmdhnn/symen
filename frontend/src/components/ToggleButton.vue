<script setup lang="ts">
const isTrue = defineModel({ default: false })
defineProps<{ disabled?: boolean }>()
</script>
<template>
  <label
    class="flex select-none items-center space-x-2"
    :class="disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'"
  >
    <input
      type="checkbox"
      v-model="isTrue"
      class="sr-only peer"
      :checked="isTrue"
      :disabled="disabled"
    />
    <div
      class="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 relative"
    ></div>
  </label>
</template>
