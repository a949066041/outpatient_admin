<script setup lang="ts">
import { NButton } from 'naive-ui'
import { h } from 'vue'
import { usePatientContext } from '~/composables/usePatientContext'
import { useExamItemStore } from '~/store'

const { exams, patientId } = usePatientContext()
const { dataList: items } = useExamItemStore()

const keyword = ref('')
const page = ref(1)
const pageSize = ref(8)

const mine = computed(() =>
  exams.value
    .filter(a => a.patient_id === patientId.value && a.status === 1 && a.check_result)
    .sort((a, b) => (b.report_time || '').localeCompare(a.report_time || '')),
)

const filtered = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  if (!q)
    return mine.value
  return mine.value.filter((a) => {
    const name = itemName(a.item_id).toLowerCase()
    return a.application_no.toLowerCase().includes(q) || name.includes(q)
  })
})

const pageData = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value)
})

watch(keyword, () => {
  page.value = 1
})

function itemName(id: number) {
  return items.value.find(i => i.item_id === id)?.item_name ?? String(id)
}

function exportTxt(row: import('~/types/outpatient').ExamApplication) {
  const text = [
    '检验报告单',
    '────────────────',
    `申请单号：${row.application_no}`,
    `检查项目：${itemName(row.item_id)}`,
    `检查目的：${row.purpose || '—'}`,
    `检查结果：${row.check_result || '—'}`,
    `报告时间：${row.report_time || '—'}`,
    '────────────────',
    '（演示导出为文本，正式环境可生成 PDF）',
  ].join('\n')
  const blob = new Blob([`\uFEFF${text}`], { type: 'text/plain;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${row.application_no}_报告.txt`
  a.click()
  URL.revokeObjectURL(a.href)
}
</script>

<template>
  <div>
    <h2 class="mb-1 text-xl font-semibold text-slate-800">
      导出报告单
    </h2>
    <p class="mb-4 text-sm text-slate-500">
      就诊完成且检查已出报告后，可在此查看并下载检验报告（论文：PDF/文本导出）
    </p>

    <n-input
      v-model:value="keyword"
      class="mb-4 max-w-sm"
      clearable
      placeholder="请输入单号或项目名称查询"
    />

    <n-empty v-if="!filtered.length" description="暂无已出报告的检查，请先完成就诊与检查" />
    <template v-else>
      <n-data-table
        size="small"
        :columns="[
          { title: '申请单号', key: 'application_no', width: 140 },
          { title: '检查项目', key: 'item', render: (row: any) => itemName(row.item_id) },
          { title: '报告时间', key: 'report_time', width: 160 },
          { title: '检查结果', key: 'check_result', ellipsis: { tooltip: true } },
          {
            title: '操作',
            key: 'op',
            width: 120,
            render: (row: any) =>
              h(NButton, { size: 'small', type: 'primary', onClick: () => exportTxt(row) }, { default: () => '导出' }),
          },
        ]"
        :data="pageData"
        :pagination="false"
      />
      <div class="mt-3 flex justify-end">
        <n-pagination v-model:page="page" v-model:page-size="pageSize" :item-count="filtered.length" :page-sizes="[8, 16]" show-size-picker />
      </div>
    </template>
  </div>
</template>
