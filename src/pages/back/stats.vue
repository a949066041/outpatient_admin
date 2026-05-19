<script setup lang="ts">
import dayjs from 'dayjs'
import * as echarts from 'echarts'
import { usePatientStore, useRegistrationStore } from '~/store'

const trendRef = ref<HTMLDivElement | null>(null)
const pieRef = ref<HTMLDivElement | null>(null)
const ageRef = ref<HTMLDivElement | null>(null)

const { list: registrations } = useRegistrationStore()
const { dataList: patients } = usePatientStore()

const AGE_BUCKETS = [
  { label: '0-9岁', min: 0, max: 9 },
  { label: '10-19岁', min: 10, max: 19 },
  { label: '20-29岁', min: 20, max: 29 },
  { label: '30-39岁', min: 30, max: 39 },
  { label: '40-49岁', min: 40, max: 49 },
  { label: '50-59岁', min: 50, max: 59 },
  { label: '60-69岁', min: 60, max: 69 },
  { label: '70-79岁', min: 70, max: 79 },
  { label: '80-89岁', min: 80, max: 89 },
  { label: '90-99岁', min: 90, max: 99 },
]

function countAgeBucket(min: number, max: number) {
  return patients.value.filter(p => p.age >= min && p.age <= max).length
}

onMounted(() => {
  const days = Array.from({ length: 14 }, (_, i) => dayjs().subtract(13 - i, 'day').format('YYYY-MM-DD'))
  const dayLabels = days.map(d => dayjs(d).format('MM-DD'))
  const counts = days.map(d => registrations.value.filter(r => r.register_date === d && r.status !== 2).length)
  const todayCount = registrations.value.filter(
    r => r.register_date === dayjs().format('YYYY-MM-DD') && r.status !== 2,
  ).length

  if (trendRef.value) {
    const chart = echarts.init(trendRef.value)
    chart.setOption({
      title: { text: `近14日门诊预约量（今日 ${todayCount} 人次）`, left: 'center', textStyle: { fontSize: 14 } },
      tooltip: { trigger: 'axis' },
      grid: { left: 48, right: 24, bottom: 32, top: 48 },
      xAxis: { type: 'category', data: dayLabels, boundaryGap: false },
      yAxis: { type: 'value', minInterval: 1 },
      series: [{
        type: 'line',
        smooth: true,
        data: counts,
        areaStyle: { color: 'rgba(13, 148, 136, 0.15)' },
        itemStyle: { color: '#0d9488' },
        lineStyle: { width: 2 },
      }],
    })
  }

  const male = patients.value.filter(p => p.gender === 1).length
  const female = patients.value.filter(p => p.gender === 0).length
  if (pieRef.value) {
    const chart = echarts.init(pieRef.value)
    chart.setOption({
      title: { text: '患者性别比例', left: 'center', textStyle: { fontSize: 14 } },
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: { bottom: 8 },
      color: ['#5470c6', '#ee6666'],
      series: [{
        type: 'pie',
        radius: '58%',
        data: [
          { value: male, name: '男' },
          { value: female, name: '女' },
        ],
        label: { formatter: '{b}\n{d}%' },
      }],
    })
  }

  if (ageRef.value) {
    const ageData = AGE_BUCKETS.map(b => ({ name: b.label, value: countAgeBucket(b.min, b.max) }))
    const chart = echarts.init(ageRef.value)
    chart.setOption({
      title: { text: '患者年龄段分布', left: 'center', textStyle: { fontSize: 14 } },
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: { type: 'scroll', bottom: 0, left: 'center' },
      series: [{
        type: 'pie',
        radius: ['38%', '62%'],
        center: ['50%', '45%'],
        data: ageData.filter(d => d.value > 0),
        label: { show: true, formatter: '{b}\n{c}人' },
      }],
    })
  }
})
</script>

<template>
  <div>
    <h3 class="mb-2 text-lg font-semibold text-slate-800">
      数据统计分析
    </h3>
    <div ref="trendRef" class="mb-4 h-[320px] w-full rounded-lg border border-slate-200 bg-white p-2 shadow-sm" />
    <n-grid :cols="2" :x-gap="16" :y-gap="16" responsive="screen">
      <n-gi>
        <div ref="pieRef" class="h-[360px] w-full rounded-lg border border-slate-200 bg-white p-2 shadow-sm" />
      </n-gi>
      <n-gi>
        <div ref="ageRef" class="h-[360px] w-full rounded-lg border border-slate-200 bg-white p-2 shadow-sm" />
      </n-gi>
    </n-grid>
  </div>
</template>
