<script setup lang="ts">
import { useExamApplicationStore, useExamItemStore, useLoginStore } from '~/store'

const { list } = useExamApplicationStore()
const { dataList: items } = useExamItemStore()
const { currentProfile } = useLoginStore()

const mine = computed(() =>
  list.value.filter(a => a.patient_id === currentProfile.value?.id && a.status === 1),
)

function itemName(id: number) {
  return items.value.find(i => i.item_id === id)?.item_name ?? id
}

function exportTxt(row: import('~/types/outpatient').ExamApplication) {
  const text = `检查报告单\n申请单号：${row.application_no}\n项目：${itemName(row.item_id)}\n结果：${row.check_result || '—'}\n报告时间：${row.report_time || '—'}`
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${row.application_no}_报告.txt`
  a.click()
  URL.revokeObjectURL(a.href)
}
</script>

<template>
  <div>
    <n-h2 prefix="bar">
      导出报告单
    </n-h2>
    <n-empty v-if="!mine.length" description="暂无已出报告的检查" />
    <n-list v-else bordered>
      <n-list-item v-for="a in mine" :key="a.application_id">
        <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <strong>{{ itemName(a.item_id) }}</strong>
            <div class="mt-1 text-sm text-slate-600">
              单号 {{ a.application_no }} · 报告时间 {{ a.report_time || '—' }}
            </div>
            <p class="mt-2 text-sm text-slate-700">
              {{ a.check_result || '（无结果文本）' }}
            </p>
          </div>
          <n-button size="small" @click="exportTxt(a)">
            导出报告单
          </n-button>
        </div>
      </n-list-item>
    </n-list>
  </div>
</template>
