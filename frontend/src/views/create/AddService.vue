<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import MainTemplate from '@/template/MainTemplate.vue'
import { useServices } from '@/stores/services'

const router = useRouter()
const serviceStore = useServices()
serviceStore.setError('')
const form = reactive({
  name: '',
  serviceType: 'nginx',
  path: '',
  executableName: '',
  argumentsText: '',
})
const executableHint = computed(() => {
  const names: Record<string, string> = {
    nginx: 'nginx.exe',
    mysql: 'mysqld.exe',
    postgresql: 'postgres.exe',
    apache: 'httpd.exe',
    redis: 'redis-server.exe',
    php: 'php-cgi.exe',
    custom: 'Path to executable, relative to the selected folder',
  }
  return names[form.serviceType]
})

const browseFolder = async () => {
  try {
    const selectedPath = await window.electronAPI?.selectDirectory()
    if (selectedPath) form.path = selectedPath
  } catch (error) {
    serviceStore.setError(error instanceof Error ? error.message : String(error))
  }
}

const addService = async () => {
  try {
    await serviceStore.addService({
      name: form.name,
      serviceType: form.serviceType,
      path: form.path,
      executableName: form.executableName,
      arguments: form.argumentsText.split(/\r?\n/).filter((argument) => argument.length > 0),
    })
    await router.push('/services')
  } catch {
    // The store exposes the operation error in the form.
  }
}
</script>

<template>
  <MainTemplate>
    <div class="">
      <RouterLink
        to="/services"
        class="inline-flex items-center text-sm text-blue-400 hover:text-blue-300 mb-6"
      >
        Back to services
      </RouterLink>

      <h1 class="font-bold text-lg text-white">Link a local service</h1>
      <p class="mt-2 text-sm text-slate-400">
        Link an existing native installation. The service will run locally under your user account.
      </p>

      <form
        class="mt-6 rounded-lg border border-slate-800 bg-[#10151A] p-5 space-y-5"
        @submit.prevent="addService"
      >
        <label class="block">
          <span class="block text-sm text-slate-300 mb-2">Service name</span>
          <input
            v-model.trim="form.name"
            required
            maxlength="80"
            placeholder="e.g. Local Nginx"
            class="w-full rounded-md border border-slate-700 bg-[#080B0E] px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
          />
        </label>

        <label class="block">
          <span class="block text-sm text-slate-300 mb-2">Service type</span>
          <select
            v-model="form.serviceType"
            class="w-full rounded-md border border-slate-700 bg-[#080B0E] px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="nginx">Nginx</option>
            <option value="mysql">MySQL</option>
            <option value="postgresql">PostgreSQL</option>
            <option value="apache">Apache HTTP Server</option>
            <option value="redis">Redis</option>
            <option value="php">PHP CGI</option>
            <option value="custom">Custom executable</option>
          </select>
        </label>

        <div>
          <label for="service-path" class="block text-sm text-slate-300 mb-2">
            Installation folder
          </label>
          <div class="flex gap-2">
            <input
              id="service-path"
              v-model.trim="form.path"
              required
              placeholder="Choose the folder containing the service"
              class="min-w-0 flex-1 rounded-md border border-slate-700 bg-[#080B0E] px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
            <button
              type="button"
              class="rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
              @click="browseFolder"
            >
              Browse
            </button>
          </div>
        </div>

        <label class="block">
          <span class="block text-sm text-slate-300 mb-2">Executable (optional)</span>
          <input
            v-model.trim="form.executableName"
            :required="form.serviceType === 'custom'"
            :placeholder="executableHint"
            class="w-full rounded-md border border-slate-700 bg-[#080B0E] px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
          />
          <span class="mt-1 block text-xs text-slate-500">
            Leave blank to detect the usual executable in the selected folder or its bin folder. For
            Custom, enter a relative executable path.
          </span>
        </label>

        <label class="block">
          <span class="block text-sm text-slate-300 mb-2">Startup arguments (optional)</span>
          <textarea
            v-model="form.argumentsText"
            rows="3"
            placeholder="One argument per line"
            class="w-full resize-y rounded-md border border-slate-700 bg-[#080B0E] px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
          ></textarea>
          <span class="mt-1 block text-xs text-slate-500">
            Database services need an initialized data directory or config file. PostgreSQL commonly
            uses <code>-D</code> followed by its data directory. PHP-CGI commonly needs
            <code>-b 127.0.0.1:9000</code>.
          </span>
        </label>

        <p v-if="serviceStore.error" class="text-sm text-red-400" role="alert">
          {{ serviceStore.error }}
        </p>

        <div class="flex justify-end gap-3 border-t border-slate-800 pt-4">
          <button
            type="button"
            class="rounded-md px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
            @click="router.push('/services')"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="serviceStore.isWorking"
            class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {{ serviceStore.isWorking ? 'Linking...' : 'Link service' }}
          </button>
        </div>
      </form>
    </div>
  </MainTemplate>
</template>
