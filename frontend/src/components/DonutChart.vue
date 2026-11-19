<script setup lang="ts">
import { computed } from 'vue'
import Highcharts from 'highcharts'
import { Chart as highcharts } from 'highcharts-vue'

const props = defineProps<{
  title?: string
  val1?: number
  val2?: number
  val1Title?: string
  val2Title?: string
  centerTitle?: string
  centerValue?: number | string
  colour1?: string
  colour2?: string
  val1Text?: string
  val2Text?: string
  val1Display?: string
  val2Display?: string
}>()

const centerValueText = computed(() =>
  props.centerValue === undefined ? '—' : `${props.centerValue}%`,
)

const chartOptions = computed<Highcharts.Options>(() => ({
  accessibility: {
    enabled: false,
  },
  chart: {
    type: 'pie',
    backgroundColor: 'transparent',
    borderWidth: 0,
    plotBorderWidth: 0,
    margin: [0, 0, 0, 0],
    spacing: [0, 0, 0, 0],
  },
  plotOptions: {
    pie: {
      borderWidth: 0,
      borderColor: 'transparent',
      shadow: false,
      animation: false, // matikan animasi ulang biar mulus saat update tiap 1 detik
      states: {
        hover: {
          halo: { size: 0 },
          borderWidth: 0,
        },
        select: {
          borderWidth: 0,
        },
      },
    },
  },
  title: {
    text: `${props.centerTitle ?? 'RAM Usage'}<br/><strong>${centerValueText.value}</strong>`,
    align: 'center',
    verticalAlign: 'middle',
    floating: true,
    y: 2,
    style: {
      color: 'var(--chart-text-color)',
      fontSize: '1em',
      textAlign: 'center',
    },
  },
  subtitle: { text: undefined },
  credits: { enabled: false },
  tooltip: {
    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b> ({point.y})',
  },
  legend: {
    enabled: false,
  },
  series: [
    {
      type: 'pie',
      name: props.title ?? 'Usage',
      innerSize: '75%',
      borderWidth: 0,
      borderColor: 'transparent',
      data: [
        { name: props.val1Title ?? 'Used', y: props.val1 ?? 0, color: props.colour1 ?? 'var(--chart-accent)' },
        { name: props.val2Title ?? 'Free', y: props.val2 ?? 0, color: props.colour2 ?? '#c7bca9' },
      ],
      allowPointSelect: true,
      cursor: 'pointer',
      borderRadius: 6,
      dataLabels: { enabled: false },
    },
  ],
}))
</script>

<template>
  <section
    class="rounded-2xl border border-subtle bg-elevated p-6"
  >
    <div class="mb-2">
      <h2 class="text-base font-semibold tracking-tight text-primary">{{ title }}</h2>
      <p class="mt-1 text-sm text-muted">{{ centerTitle }}</p>
    </div>
    <div class="h-56">
      <highcharts class="h-full w-full" :options="chartOptions" />
    </div>
    <div class="mt-4 grid grid-cols-2 gap-4 border-t border-subtle pt-5">
      <div>
        <p class="flex items-center gap-2 text-sm text-muted">
          <span
            class="size-2 rounded-full"
            :style="{ backgroundColor: colour1 ?? 'var(--chart-accent)' }"
          ></span>
          {{ val1Text ?? val1Title }}
        </p>
        <p class="mt-1 pl-4 text-base font-semibold text-primary tabular-nums">
          {{ val1Display ?? val1 ?? 0 }}
        </p>
      </div>
      <div>
        <p class="flex items-center gap-2 text-sm text-muted">
          <span
            class="size-2 rounded-full"
            :style="{ backgroundColor: colour2 ?? '#c7bca9' }"
          ></span>
          {{ val2Text ?? val2Title }}
        </p>
        <p class="mt-1 pl-4 text-base font-semibold text-primary tabular-nums">
          {{ val2Display ?? val2 ?? 0 }}
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
:deep(.highcharts-root) {
  stroke: none;
}
</style>
