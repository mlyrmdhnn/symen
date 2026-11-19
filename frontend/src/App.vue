<script setup lang="ts">
import StartingLayer from './components/StartingLayer.vue'
import ToastCard from './components/ToastCard.vue'
import { onMounted, ref } from 'vue'
import useInvoke from './lib/http.ts'
import { useWorkspaceStore } from './stores/workspace'
import useToast from './composables/useToast'
import router from './router/index.ts'

const { data, error, execute } = useInvoke<{ name?: string } | null>('get_name', {
  immediate: false,
})

const workspace = useWorkspaceStore()
const { showToast } = useToast()
const showStarting = ref(true)
const isNameExists = ref(true)

workspace.applyTheme()

onMounted(async () => {
  await execute()

  if (error.value) {
    showToast('danger', 'Unable to load your name', 'You can try setting it again.')
    isNameExists.value = true
    /**
     *
     */
    return
  }

  const name = data.value?.name?.trim() ?? ''
  workspace.setUserName(name)
  isNameExists.value = Boolean(name)

  if (name) {
    setTimeout(() => {
      showStarting.value = false
    }, 3800)
  }
})

function handleNameSaved(name: string) {
  workspace.setUserName(name)
  router.push('/setup')
  showStarting.value = false
}
</script>

<template>
  <RouterView />
  <ToastCard />
  <Transition name="fade">
    <StartingLayer
      v-if="showStarting"
      :is-name-exists="isNameExists"
      @success="handleNameSaved"
      class="absolute top-0"
    />
  </Transition>
</template>

<style scoped>
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-leave-to {
  opacity: 0;
}
</style>
