<script setup lang="ts">
import { usePatientContext } from '~/composables/usePatientContext'
import { useBedStore, useHospitalizationStore } from '~/store'

const { patientId } = usePatientContext()
const { list } = useHospitalizationStore()
const { dataList: beds } = useBedStore()

const mine = computed(() =>
  list.value.filter(h => h.patient_id === patientId.value).sort((a, b) => b.hospitalization_id - a.hospitalization_id),
)

function bedNo(id: number) {
  return beds.value.find(b => b.bed_id === id)?.bed_no ?? id
}
</script>

<template>
  <div>
    <h2 class="mb-1 text-xl font-semibold text-slate-800">
      住院信息
    </h2>
    <p class="mb-4 text-sm text-slate-500">
      查看本人住院记录、床位与费用（论文：查看住院）
    </p>
    <n-empty v-if="!mine.length" description="暂无住院记录" />
    <n-data-table
      v-else
      size="small"
      :columns="[
        { title: '住院号', key: 'hospital_no', width: 130 },
        { title: '床位', key: 'bed', width: 100, render: (row: any) => bedNo(row.bed_id) },
        { title: '入院日期', key: 'admission_date', width: 110 },
        { title: '出院日期', key: 'discharge_date', width: 110, render: (row: any) => row.discharge_date || '—' },
        { title: '入院诊断', key: 'diagnosis', ellipsis: { tooltip: true } },
        { title: '状态', key: 'status', width: 88, render: (row: any) => (row.status === 0 ? '住院中' : '已出院') },
        { title: '费用/元', key: 'total_cost', width: 96 },
        { title: '预计天数', key: 'expected_days', width: 88, render: (row: any) => row.expected_days ?? '—' },
      ]"
      :data="mine"
      :pagination="{ pageSize: 8 }"
    />
  </div>
</template>
