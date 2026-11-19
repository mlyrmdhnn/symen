<script setup lang="ts">
import { ref } from 'vue'
import useService from '@/composables/useService'
const { updatedPayload, cancel, updateData } = useService()
const isSubmitting = ref(false)
const errorMessage = ref('')

function selectDirectory(event: Event) {
  const input = event.currentTarget
  if (!(input instanceof HTMLInputElement)) return

  const selectedFile = input.files?.[0]
  const directoryName = selectedFile?.webkitRelativePath.split('/')[0]
  if (directoryName) updatedPayload.value.path = directoryName
  input.value = ''
}

async function submitService() {
  errorMessage.value = ''
  isSubmitting.value = true
  try {
    await updateData()
    emit('serviceEditted', { ...updatedPayload })
    emit('closeModal')
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : String(error)
  } finally {
    isSubmitting.value = false
  }
}

const emit = defineEmits(['closeModal', 'serviceEditted'])

const setCancel = () => {
  emit('closeModal')
  cancel()
}
</script>

<template>
  <div class="fixed inset-0 z-10 grid place-items-center bg-overlay p-4 backdrop-blur-md">
    <form
      class="w-full max-w-lg rounded-2xl border border-subtle bg-elevated p-6 text-primary shadow-dialog sm:p-8"
      @submit.prevent="submitService"
    >
      <div class="flex items-start justify-between">
        <div>
          <p class="mb-2 text-xs font-bold tracking-[0.16em] text-muted">ADD NEW SERVICE</p>
          <h2 class="text-2xl font-semibold tracking-tight">Add Service</h2>
        </div>
        <button
          @click="emit('closeModal')"
          class="grid size-9 place-items-center rounded-lg text-2xl text-muted hover:bg-soft hover:text-primary focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none"
          type="button"
          aria-label="Close dialog"
        >
          ×
        </button>
      </div>

      <p class="mb-6 mt-2 max-w-prose text-sm leading-relaxed text-muted">
        Configure a local executable and its working directory.
      </p>

      <label class="mb-4 grid gap-2 text-sm font-medium">
        Service name
        <input
          v-model="updatedPayload.name"
          required
          maxlength="48"
          placeholder="e.g. Nginx Web Server"
          class="h-11 rounded-lg border border-subtle bg-surface px-3 text-sm font-normal transition-colors focus:border-accent focus-visible:ring-2 focus-visible:ring-accent/20 focus-visible:outline-none"
        />
      </label>

      <label class="mb-4 grid gap-2 text-sm font-medium">
        Executable
        <input
          v-model="updatedPayload.executable"
          required
          placeholder="e.g. nginx.exe"
          class="h-11 rounded-lg border border-subtle bg-surface px-3 text-sm font-normal transition-colors focus:border-accent focus-visible:ring-2 focus-visible:ring-accent/20 focus-visible:outline-none"
        />
      </label>

      <div class="mb-4 grid gap-2 text-sm font-medium">
        <label for="directory-path">Directory path</label>
        <span class="flex gap-2">
          <input
            v-model="updatedPayload.path"
            id="directory-path"
            required
            placeholder="e.g. C:\tools\nginx"
            class="h-11 min-w-0 flex-1 rounded-lg border border-subtle bg-surface px-3 text-sm font-normal transition-colors focus:border-accent focus-visible:ring-2 focus-visible:ring-accent/20 focus-visible:outline-none"
          />
          <button
            class="h-11 shrink-0 rounded-lg border border-subtle px-4 text-sm font-semibold transition-colors hover:bg-soft focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none"
            type="button"
            @click="
              (
                ($event.currentTarget as HTMLButtonElement)
                  .nextElementSibling as HTMLInputElement | null
              )?.click()
            "
          >
            Browse
          </button>
          <input class="hidden" type="file" webkitdirectory @change="selectDirectory" />
        </span>
        <span class="text-xs font-normal text-muted">
          Folder selection fills its name; enter the full path manually if needed.
        </span>
      </div>

      <label class="mb-4 grid gap-2 text-sm font-medium">
        Command
        <input
          v-model="updatedPayload.optional_command"
          placeholder="e.g. --save dev"
          class="h-11 rounded-lg border border-subtle bg-surface px-3 text-sm font-normal transition-colors focus:border-accent focus-visible:ring-2 focus-visible:ring-accent/20 focus-visible:outline-none"
        />
      </label>

      <p v-if="errorMessage" class="mb-4 text-sm text-red-600" role="alert">
        Could not add service: {{ errorMessage }}
      </p>

      <div class="mt-6 flex justify-end gap-3 border-t border-subtle pt-5">
        <button
          class="rounded-lg border border-subtle px-4 py-3 text-sm font-semibold hover:bg-soft focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none"
          type="button"
          @click="setCancel"
        >
          Cancel
        </button>
        <button
          class="rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-accent-fg hover:opacity-90 focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          type="submit"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? 'Editting…' : 'Update Service' }}
        </button>
      </div>
    </form>
  </div>
</template>
