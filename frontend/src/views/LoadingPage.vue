<script setup lang="ts">
import MainTemplate from '@/template/MainTemplate.vue'
import useInvoke from '@/lib/http'

const { data, execute, pending } = useInvoke('get_test', {})
const { data: post, error } = useInvoke('post_test', {
  payload: {
    message: 'Halooo semuanya',
  },
  immediate: true,
})
</script>

<template>
  <MainTemplate>
    {{ data }}
    {{ pending }}
    {{ post }}
    {{ error }}
  </MainTemplate>
</template>

<style scoped></style>
