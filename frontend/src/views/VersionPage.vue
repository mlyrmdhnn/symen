<script setup lang="ts">
import { computed, ref } from 'vue'
import MainTemplate from '@/template/MainTemplate.vue'
import useInvoke from '@/lib/http'
import { useAppUpdater } from '@/composables/useAppUpdater'

type UpdaterManifest = {
  version: string
  notes?: string | null
  pub_date?: string | null
  platforms: Record<string, { signature: string; url: string }>
}

type Release = {
  version: string
  releasedAt: string
  channel: string
  compatibility: string
  summary: string
  notes: string[]
  downloadUrl: string
}

const { data, pending, error: versionListError } = useInvoke<UpdaterManifest | null>('get_versions')
const {
  checking,
  available,
  checked,
  version: updateVersion,
  notes: updateNotes,
  date: updateDate,
  currentVersion,
  downloading,
  downloadedBytes,
  totalBytes,
  progress,
  error: updateError,
  checkForUpdates,
  installUpdate,
} = useAppUpdater()

const fallbackRelease: Release = {
  version: 'v2.0.0',
  releasedAt: 'November 21, 2026',
  channel: 'Stable',
  compatibility: 'Windows 10 or later (x64)',
  summary: 'Symen v2.0.0 stable release.',
  notes: [
    'Modern and cleaner user interface',
    'Added initial setup layer for faster onboarding',
    'Built-in one-click service downloader (PHP, Nginx, Apache, Node.js, MySQL, PostgreSQL)',
    'Up to 30x faster performance and much lighter memory usage than v1',
  ],
  downloadUrl: 'https://github.com/mlyrmdhnn/symen',
}

function normalizeVersion(ver: string): string {
  const trimmed = ver.trim()
  return trimmed.startsWith('v') ? trimmed : `v${trimmed}`
}

const releases = computed<[Release, ...Release[]]>(() => {
  const manifest = data.value
  if (!manifest) {
    return [fallbackRelease]
  }

  const version = normalizeVersion(manifest.version)
  const mapped: Release[] = [
    {
      version,
      releasedAt: manifest.pub_date ?? 'Date unavailable',
      channel: 'Stable',
      compatibility: 'Windows x86_64',
      summary: `Symen ${version} release for Windows x86_64.`,
      notes:
        manifest.notes
          ?.split(/\r?\n/)
          .map((note) => note.trim().replace(/^[-*]\s*/, ''))
          .filter(Boolean) ?? [],
      downloadUrl: manifest.platforms['windows-x86_64']?.url ?? '',
    },
  ]

  if (available.value && updateVersion.value) {
    const newVersion = normalizeVersion(updateVersion.value)
    const existing = mapped.find((release) => release.version === newVersion)
    const currentRelease: Release = existing ?? {
      ...fallbackRelease,
      version: newVersion,
      releasedAt: updateDate.value ?? 'Date unavailable',
      summary: `Symen ${newVersion} stable release.`,
      notes:
        updateNotes.value
          ?.split(/\r?\n/)
          .map((note) => note.trim().replace(/^[-*]\s*/, ''))
          .filter(Boolean) ?? [],
    }
    return [currentRelease, ...mapped.filter((release) => release.version !== newVersion)]
  }

  return [mapped[0]!, ...mapped.slice(1)]
})

const updateResult = ref<'latest' | 'installed' | null>(null)
const installedVersion = computed(() => normalizeVersion(currentVersion.value ?? '2.0.0'))
const selectedVersionId = ref<string | null>(null)

const selectedRelease = computed(
  () => releases.value.find((release) => release.version === selectedVersionId.value) ?? null,
)
const latestRelease = computed(() => releases.value[0])
const selectedCanInstall = computed(
  () =>
    selectedRelease.value !== null &&
    ((available.value &&
      normalizeVersion(updateVersion.value ?? '') === selectedRelease.value.version) ||
      (!checked.value &&
        selectedRelease.value.version === latestRelease.value.version &&
        selectedRelease.value.version !== installedVersion.value)),
)
const latestVersion = computed(() =>
  normalizeVersion(updateVersion.value ?? latestRelease.value.version),
)
const latestNotes = computed(
  () =>
    updateNotes.value
      ?.split(/\r?\n/)
      .map((note) => note.trim().replace(/^[-*]\s*/, ''))
      .filter(Boolean) ?? latestRelease.value.notes,
)
const actionLabel = computed(() =>
  selectedRelease.value ? `Install ${selectedRelease.value.version}` : 'Check for Updates',
)
const actionText = computed(() => {
  if (pending.value || checking.value) return 'Checking for Updates…'
  if (downloading.value) return `Downloading ${progress.value ?? 0}%…`
  return actionLabel.value
})
const actionDisabled = computed(
  () =>
    pending.value ||
    checking.value ||
    downloading.value ||
    (selectedRelease.value !== null && !selectedCanInstall.value),
)
const panelKey = computed(
  () =>
    selectedRelease.value?.version ??
    `status-${updateResult.value}-${available.value}-${Boolean(updateError.value)}`,
)

function selectRelease(version: string) {
  selectedVersionId.value = selectedVersionId.value === version ? null : version
}

async function runPrimaryAction() {
  if (pending.value || checking.value || downloading.value) return

  if (selectedRelease.value) {
    if (!selectedCanInstall.value) return

    if (!available.value) {
      const foundUpdate = await checkForUpdates()
      if (!foundUpdate || !selectedCanInstall.value) {
        if (!foundUpdate && !updateError.value) updateResult.value = 'latest'
        return
      }
    }

    if (await installUpdate()) {
      updateResult.value = 'installed'
      selectedVersionId.value = null
    }
    return
  }

  updateResult.value = null
  const foundUpdate = await checkForUpdates()
  if (!updateError.value) updateResult.value = foundUpdate ? null : 'latest'
}
</script>

<template>
  <MainTemplate>
    <section class="mb-8">
      <p class="mb-3 flex items-center gap-2 text-xs font-bold tracking-[0.16em] text-muted">
        <span class="h-0.5 w-4 bg-accent"></span> SYMEN UPDATER
      </p>
      <h1 class="text-3xl font-semibold leading-tight tracking-tight text-primary">
        Version management
      </h1>
      <p class="mt-3 max-w-prose text-base leading-relaxed text-muted">
        Review release notes, check for updates, and choose a version for Symen.
      </p>
    </section>

    <section class="rounded-2xl border border-subtle bg-elevated p-6">
      <div
        class="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-subtle pb-5"
      >
        <div>
          <h2 class="text-base font-semibold tracking-tight">Symen releases</h2>
          <p class="mt-1 text-sm text-muted">Select a release to review its details.</p>
        </div>
        <span class="rounded-lg bg-soft px-3 py-2 text-xs font-semibold text-accent">
          Installed {{ installedVersion }}
        </span>
      </div>

      <div class="">
        <div class="min-w-0">
          <Transition name="version-panel" mode="out-in">
            <div
              :key="panelKey"
              class="min-h-[350px] rounded-xl border border-subtle bg-surface p-5 sm:p-6"
            >
              <template v-if="selectedRelease">
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p class="text-xs font-bold tracking-[0.12em] text-muted">RELEASE DETAILS</p>
                    <h3 class="mt-2 text-2xl font-semibold tracking-tight text-primary">
                      {{ selectedRelease.version }}
                    </h3>
                  </div>
                  <span class="rounded-lg bg-soft px-3 py-2 text-xs font-semibold text-accent">
                    {{ selectedRelease.channel }}
                  </span>
                </div>

                <p class="mt-4 text-sm leading-relaxed text-muted">
                  {{ selectedRelease.summary }}
                </p>

                <div class="mt-6 grid gap-3 sm:grid-cols-2">
                  <div class="rounded-xl border border-subtle bg-elevated p-4">
                    <p class="text-xs font-semibold text-muted">Release date</p>
                    <p class="mt-2 text-sm font-semibold text-primary">
                      {{ selectedRelease.releasedAt }}
                    </p>
                  </div>
                  <div class="rounded-xl border border-subtle bg-elevated p-4">
                    <p class="text-xs font-semibold text-muted">Compatibility</p>
                    <p class="mt-2 text-sm font-semibold text-primary">
                      {{ selectedRelease.compatibility }}
                    </p>
                  </div>
                </div>

                <div class="mt-6">
                  <h4 class="text-sm font-semibold text-primary">What’s new</h4>
                  <ul class="mt-3 space-y-3">
                    <li
                      v-for="note in selectedRelease.notes"
                      :key="note"
                      class="flex gap-3 text-sm leading-relaxed text-muted"
                    >
                      <span class="mt-2 size-1.5 shrink-0 rounded-full bg-accent"></span>
                      {{ note }}
                    </li>
                  </ul>
                </div>
              </template>

              <template v-else>
                <template v-if="updateError">
                  <span
                    class="inline-flex rounded-lg bg-soft px-3 py-2 text-xs font-semibold text-accent"
                  >
                    UPDATE CHECK FAILED
                  </span>
                  <h3 class="mt-5 text-2xl font-semibold tracking-tight text-primary">
                    Unable to check for updates
                  </h3>
                  <p class="mt-3 break-words text-sm leading-relaxed text-muted">
                    {{ updateError }}
                  </p>
                </template>

                <template v-else-if="available && updateResult !== 'installed'">
                  <span
                    class="inline-flex rounded-lg bg-soft px-3 py-2 text-xs font-semibold text-accent"
                  >
                    UPDATE AVAILABLE
                  </span>
                  <h3 class="mt-5 text-2xl font-semibold tracking-tight text-primary">
                    A new version {{ latestVersion }} is available
                  </h3>
                  <p class="mt-3 text-sm leading-relaxed text-muted">
                    You’re currently on {{ installedVersion }}.
                    {{ latestRelease.summary }}
                  </p>
                  <h4 class="mt-6 text-sm font-semibold text-primary">Release highlights</h4>
                  <ul class="mt-3 space-y-3">
                    <li
                      v-for="note in latestNotes"
                      :key="note"
                      class="flex gap-3 text-sm leading-relaxed text-muted"
                    >
                      <span class="mt-2 size-1.5 shrink-0 rounded-full bg-accent"></span>
                      {{ note }}
                    </li>
                  </ul>
                  <p class="mt-5 border-t border-subtle pt-4 text-xs text-muted">
                    Released {{ updateDate ?? latestRelease.releasedAt }} ·
                    {{ latestRelease.compatibility }}
                  </p>
                </template>

                <template
                  v-else-if="updateResult === 'latest' || (checked && !available && !updateError)"
                >
                  <span
                    class="inline-flex rounded-lg bg-soft px-3 py-2 text-xs font-semibold text-accent"
                  >
                    UP TO DATE
                  </span>
                  <h3 class="mt-5 text-2xl font-semibold tracking-tight text-primary">
                    You’re on the latest version
                  </h3>
                  <p class="mt-3 text-sm leading-relaxed text-muted">
                    Symen {{ installedVersion }} is the newest stable release. Check back later for
                    new features and improvements.
                  </p>
                </template>

                <template v-else-if="updateResult === 'installed'">
                  <span
                    class="inline-flex rounded-lg bg-soft px-3 py-2 text-xs font-semibold text-accent"
                  >
                    INSTALL COMPLETE
                  </span>
                  <h3 class="mt-5 text-2xl font-semibold tracking-tight text-primary">
                    Symen {{ latestVersion }} is ready
                  </h3>
                  <p class="mt-3 text-sm leading-relaxed text-muted">
                    The signed update was installed. Symen is restarting to finish applying the
                    update.
                  </p>
                </template>

                <template v-else>
                  <span
                    class="inline-flex rounded-lg bg-soft px-3 py-2 text-xs font-semibold text-accent"
                  >
                    INSTALLED VERSION
                  </span>
                  <h3 class="mt-5 text-2xl font-semibold tracking-tight text-primary">
                    Symen {{ installedVersion }}
                  </h3>
                  <p class="mt-3 max-w-xl text-sm leading-relaxed text-muted">
                    This is the version currently installed on your device. Check for the latest
                    stable release, or select a version from the list to review its release notes.
                  </p>
                  <div class="mt-6 rounded-xl border border-subtle bg-elevated p-4">
                    <p class="text-xs font-semibold text-muted">Update channel</p>
                    <p class="mt-2 text-sm font-semibold text-primary">Stable releases</p>
                  </div>
                </template>
              </template>
            </div>
          </Transition>

          <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p class="text-xs text-muted">
              {{
                selectedRelease
                  ? selectedCanInstall
                    ? 'Install uses the signed updater package for this release.'
                    : 'Only the latest signed release can be installed; older releases are shown for reference.'
                  : 'Update checks use the configured Cloudflare updater manifest.'
              }}
            </p>
            <button
              class="inline-flex min-h-11 items-center justify-center rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-fg hover:opacity-90 focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none disabled:cursor-wait disabled:opacity-60"
              type="button"
              :disabled="actionDisabled"
              @click="runPrimaryAction"
            >
              <Transition name="button-label" mode="out-in">
                <span :key="actionText" class="inline-flex items-center gap-2">
                  <span
                    v-if="checking || downloading"
                    class="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
                    aria-hidden="true"
                  ></span>
                  {{ actionText }}
                </span>
              </Transition>
            </button>
          </div>
          <div
            v-if="downloading"
            class="mt-4 rounded-xl border border-subtle bg-surface p-4"
            role="status"
            aria-live="polite"
          >
            <div class="flex items-center justify-between gap-3 text-xs">
              <span class="font-semibold text-primary">Downloading update</span>
              <span class="font-mono text-muted">
                {{
                  progress === null ? `${downloadedBytes.toLocaleString()} bytes` : `${progress}%`
                }}
              </span>
            </div>
            <div class="mt-3 h-2 overflow-hidden rounded-full bg-soft">
              <div
                class="h-full rounded-full bg-accent transition-[width] duration-150"
                :class="progress === null ? 'w-1/3 animate-pulse' : ''"
                :style="progress === null ? undefined : { width: `${progress}%` }"
              ></div>
            </div>
            <p v-if="totalBytes" class="mt-2 text-right font-mono text-[10px] text-muted">
              {{ downloadedBytes.toLocaleString() }} / {{ totalBytes.toLocaleString() }} bytes
            </p>
          </div>
          <p
            v-if="versionListError && !pending"
            class="mt-3 break-words text-xs text-muted"
            role="status"
          >
            Release notes could not be loaded: {{ versionListError }}
          </p>
        </div>
      </div>
    </section>
  </MainTemplate>
</template>

<style scoped>
.version-panel-enter-active,
.version-panel-leave-active,
.button-label-enter-active,
.button-label-leave-active {
  transition:
    opacity 160ms ease,
    transform 160ms ease;
}

.version-panel-enter-from,
.version-panel-leave-to,
.button-label-enter-from,
.button-label-leave-to {
  transform: translateY(6px);
  opacity: 0;
}
</style>
