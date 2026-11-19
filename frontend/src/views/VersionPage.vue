<script setup lang="ts">
import { computed, ref } from 'vue'
import MainTemplate from '@/template/MainTemplate.vue'

type Release = {
  version: string
  releasedAt: string
  channel: string
  compatibility: string
  summary: string
  notes: string[]
}

type UpdateResult = 'available' | 'latest' | 'installed' | null

const releases: [Release, ...Release[]] = [
  {
    version: 'v2.2.0',
    releasedAt: 'November 12, 2026',
    channel: 'Stable',
    compatibility: 'Windows 10 or later · x64 / ARM64',
    summary: 'A faster, more flexible workspace for your local development tools.',
    notes: [
      'Added configurable startup profiles for local services.',
      'Improved process output filtering and search.',
      'Reduced workspace launch time and memory use.',
    ],
  },
  {
    version: 'v2.1.0',
    releasedAt: 'October 28, 2026',
    channel: 'Stable',
    compatibility: 'Windows 10 or later · x64',
    summary: 'Introduces service groups and a clearer process overview.',
    notes: [
      'Group related services into reusable workspaces.',
      'Added live process status indicators.',
      'Improved keyboard navigation across the app.',
    ],
  },
  {
    version: 'v2.0.4',
    releasedAt: 'October 10, 2026',
    channel: 'Stable',
    compatibility: 'Windows 10 or later · x64',
    summary: 'A maintenance release focused on stability and polish.',
    notes: [
      'Fixed service paths containing spaces.',
      'Resolved a theme preference issue on startup.',
      'Improved error messages for unavailable executables.',
    ],
  },
  {
    version: 'v2.0.1',
    releasedAt: 'September 30, 2026',
    channel: 'Stable',
    compatibility: 'Windows 10 or later · x64',
    summary: 'Small fixes following the Symen 2.0 release.',
    notes: [
      'Fixed an issue when editing a saved service.',
      'Improved layout behavior on narrow windows.',
    ],
  },
  {
    version: 'v2.0.0',
    releasedAt: 'September 24, 2026',
    channel: 'Stable',
    compatibility: 'Windows 10 or later · x64',
    summary: 'A refreshed Symen experience built for local development.',
    notes: [
      'Introduced the new workspace navigation and visual system.',
      'Added local service configuration and activity views.',
    ],
  },
]

const installedVersion = ref('v2.0.0')
const selectedVersionId = ref<string | null>(null)
const updateResult = ref<UpdateResult>(null)
const actionBusy = ref<'check' | 'install' | null>(null)

const selectedRelease = computed(
  () => releases.find((release) => release.version === selectedVersionId.value) ?? null,
)
const latestRelease = releases[0]
const actionLabel = computed(() =>
  selectedRelease.value ? `Install ${selectedRelease.value.version}` : 'Check for Updates',
)
const actionText = computed(() => {
  if (actionBusy.value === 'check') return 'Checking for Updates…'
  if (actionBusy.value === 'install') return `Installing ${selectedVersionId.value}…`
  return actionLabel.value
})
const panelKey = computed(() => selectedRelease.value?.version ?? `status-${updateResult.value}`)

function selectRelease(version: string) {
  selectedVersionId.value = selectedVersionId.value === version ? null : version
}

function wait(milliseconds: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds))
}

async function runPrimaryAction() {
  if (actionBusy.value) return

  if (selectedRelease.value) {
    const releaseToInstall = selectedRelease.value
    actionBusy.value = 'install'
    await wait(1200)
    installedVersion.value = releaseToInstall.version
    selectedVersionId.value = null
    updateResult.value = 'installed'
    actionBusy.value = null
    return
  }

  actionBusy.value = 'check'
  updateResult.value = null
  await wait(900)
  updateResult.value = installedVersion.value === latestRelease.version ? 'latest' : 'available'
  actionBusy.value = null
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

      <div class="grid gap-6 lg:grid-cols-[minmax(220px,0.8fr)_minmax(0,1.8fr)]">
        <nav class="space-y-2" aria-label="Available versions">
          <p class="mb-3 text-xs font-bold tracking-[0.12em] text-muted">AVAILABLE VERSIONS</p>
          <button
            v-for="release in releases"
            :key="release.version"
            type="button"
            :disabled="actionBusy !== null"
            :aria-pressed="selectedVersionId === release.version"
            :class="[
              'flex w-full items-center justify-between gap-3 rounded-xl border p-4 text-left transition-colors duration-200 hover:bg-soft focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none disabled:cursor-wait disabled:opacity-70',
              selectedVersionId === release.version
                ? 'border-accent bg-soft'
                : 'border-subtle bg-surface',
            ]"
            @click="selectRelease(release.version)"
          >
            <span>
              <strong class="block text-sm font-semibold text-primary">{{
                release.version
              }}</strong>
              <small class="mt-1 block text-xs text-muted">{{ release.releasedAt }}</small>
            </span>
            <span
              v-if="release.version === installedVersion"
              class="shrink-0 rounded-md bg-elevated px-2 py-1 text-[10px] font-bold text-muted"
            >
              CURRENT
            </span>
            <span
              v-else-if="release.version === latestRelease.version"
              class="shrink-0 rounded-md bg-accent px-2 py-1 text-[10px] font-bold text-accent-fg"
            >
              LATEST
            </span>
          </button>
          <p class="pt-2 text-xs leading-relaxed text-muted">
            Choosing an older release is available for compatibility testing.
          </p>
        </nav>

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
                <template v-if="updateResult === 'available'">
                  <span
                    class="inline-flex rounded-lg bg-soft px-3 py-2 text-xs font-semibold text-accent"
                  >
                    UPDATE AVAILABLE
                  </span>
                  <h3 class="mt-5 text-2xl font-semibold tracking-tight text-primary">
                    A new version {{ latestRelease.version }} is available
                  </h3>
                  <p class="mt-3 text-sm leading-relaxed text-muted">
                    You’re currently on {{ installedVersion }}. {{ latestRelease.summary }}
                  </p>
                  <h4 class="mt-6 text-sm font-semibold text-primary">Release highlights</h4>
                  <ul class="mt-3 space-y-3">
                    <li
                      v-for="note in latestRelease.notes"
                      :key="note"
                      class="flex gap-3 text-sm leading-relaxed text-muted"
                    >
                      <span class="mt-2 size-1.5 shrink-0 rounded-full bg-accent"></span>
                      {{ note }}
                    </li>
                  </ul>
                  <p class="mt-5 border-t border-subtle pt-4 text-xs text-muted">
                    Released {{ latestRelease.releasedAt }} · {{ latestRelease.compatibility }}
                  </p>
                </template>

                <template v-else-if="updateResult === 'latest'">
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
                    Symen {{ installedVersion }} is ready
                  </h3>
                  <p class="mt-3 text-sm leading-relaxed text-muted">
                    The selected version has been installed in this preview. Your release selection
                    is cleared, so you can check for updates or choose another version.
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
                  ? 'Install is simulated in this frontend preview.'
                  : 'Update checks use mock release data.'
              }}
            </p>
            <button
              class="inline-flex min-h-11 items-center justify-center rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-fg hover:opacity-90 focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none disabled:cursor-wait disabled:opacity-60"
              type="button"
              :disabled="actionBusy !== null"
              @click="runPrimaryAction"
            >
              <Transition name="button-label" mode="out-in">
                <span :key="actionText" class="inline-flex items-center gap-2">
                  <span
                    v-if="actionBusy"
                    class="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
                    aria-hidden="true"
                  ></span>
                  {{ actionText }}
                </span>
              </Transition>
            </button>
          </div>
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
