<script setup lang="ts">
import MainTemplate from '@/template/MainTemplate.vue'
import { ArrowLeft } from '@lucide/vue'
</script>
<template>
  <MainTemplate>
    <!-- create service -->
    <RouterLink to="/services" class="">
      <ArrowLeft
        class="bg-blue-600 rounded-full w-10 h-10 cursor-pointer hover:bg-blue-700 transition-all duration-200"
      />
    </RouterLink>
  </MainTemplate>
</template>
