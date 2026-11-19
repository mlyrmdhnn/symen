<script setup lang="ts">
import { computed } from 'vue'
import { useWorkspaceStore } from '@/stores/workspace'

defineProps<{ title: string }>()

const workspace = useWorkspaceStore()
const userInitial = computed(() => workspace.userName.charAt(0).toUpperCase() || 'U')
</script>

<template>
  <header
    class="flex h-16 shrink-0 items-center justify-between border-b border-subtle bg-elevated px-6 sm:px-8"
  >
    <div class="flex items-center gap-2 text-sm text-muted">
      <strong class="font-semibold tracking-tight text-primary">{{ title }}</strong>
    </div>
    <div class="flex items-center gap-3">
      <button
        class="grid size-9 place-items-center rounded-full border border-subtle bg-soft text-xs font-bold text-primary"
        aria-label="User menu"
      >
        {{ userInitial }}
      </button>
      <span class="text-sm font-medium text-primary">
        {{ workspace.userName || 'User' }}
      </span>
    </div>
  </header>
</template>
