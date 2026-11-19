<script setup lang="ts">
import { MessageSquareWarning, TriangleAlert } from '@lucide/vue'
const emit = defineEmits(['closeDeleteModal', 'confirmDelete'])
const props = defineProps({
  name: String,
  pid: Number,
})
</script>

<template>
  <div class="fixed inset-0 z-10 grid place-items-center bg-overlay p-4 backdrop-blur-md">
    <form
      class="w-full max-w-lg rounded-2xl border border-subtle bg-elevated p-6 text-primary shadow-dialog sm:p-8"
      @submit.prevent
    >
      <div class="flex items-start justify-between">
        <div>
          <p class="mb-2 text-xs font-bold tracking-[0.16em] text-muted">Delete Service</p>
          <h2 class="text-2xl font-semibold tracking-tight">Delete Service</h2>
        </div>
        <button
          @click="emit('closeDeleteModal')"
          class="grid size-9 place-items-center rounded-lg text-2xl text-muted hover:bg-soft hover:text-primary focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none"
          type="button"
          aria-label="Close dialog"
        >
          ×
        </button>
      </div>

      <div class="mx-auto mt-6 max-w-prose text-center">
        <div class="flex justify-center items-center">
          <TriangleAlert :size="40" class="text-amber-600 dark:text-amber-400" />
        </div>
        <p class="mt-4 text-base leading-relaxed text-muted">
          Are you sure want to delete <strong class="font-semibold text-primary">{{ name }}</strong>
          services?
        </p>
      </div>

      <div class="mt-6 flex justify-end gap-3 border-t border-subtle pt-5">
        <button
          class="rounded-lg border border-subtle px-4 py-3 text-sm font-semibold hover:bg-soft focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none"
          type="button"
          @click="emit('closeDeleteModal')"
        >
          Cancel
        </button>
        <button
          class="rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-500/40 focus-visible:outline-none"
          type="submit"
          @click="emit('confirmDelete')"
        >
          Confirm Delete
        </button>
      </div>
    </form>
  </div>
</template>
