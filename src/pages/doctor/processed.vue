<script setup lang="ts">
import type { Registration } from '~/types/outpatient'
import { NButton } from 'naive-ui'
import { h } from 'vue'
import { useRouter } from 'vue-router'
import { useDoctorContext } from '~/composables/useDoctorContext'
import { useRegistrationStore } from '~/store'

const router = useRouter()
const message = useMessage()
const { updateRegistration } = useRegistrationStore()
const {
  registrations,
  doctorId,
  currentProfile,
  patientName,
  regTimeLabel,
  prescriptionSummary,
  examsForRegister,
} = useDoctorContext()

const keyword = ref('')
const page = ref(1)
const pageSize = ref(8)

const rows = computed(() => {
  const q = keyword.value.trim()
  return registrations.value
    .filter(r => r.doctor_id === doctorId.value && r.status === 1)
    .filter((r) => {
      if (!q)
        return true
      return String(r.patient_id).includes(q) || patientName(r.patient_id).includes(q) || r.register_no.includes(q)
    })
    .sort((a, b) => (b.visit_end_time || '').localeCompare(a.visit_end_time || ''))
})

const pageData = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return rows.value.slice(start, start + pageSize.value)
})

watch(keyword, () => {
  page.value = 1
})

const showAdd = ref(false)
const addRow = ref<Registration | null>(null)
const addText = ref('')

function openAdd(r: Registration) {
  addRow.value = r
  addText.value = r.diagnosis || ''
  showAdd.value = true
}

function saveAdd() {
  if (!addRow.value)
    return
  updateRegistration(addRow.value.register_id, {
    diagnosis: addText.value,
  })
  message.success('追加诊断已保存')
  showAdd.value = false
}

function openDetail(r: Registration) {
  router.push({ path: '/doctor/consult', query: { id: String(r.register_id) } })
}
</script>

<template>
  <div>
    <h3 class="mb-1 text-lg font-medium text-slate-800">
      历史挂号列表
    </h3>

    <n-input
      v-model:value="keyword"
      class="mb-4 max-w-sm"
      clearable
      placeholder="请输入患者 id / 姓名 / 挂号单号查询"
    >
      <template #prefix>
        <span class="icon-[icon-park-outline--search]" />
      </template>
    </n-input>

    <n-empty v-if="!rows.length" description="暂无已就诊记录" />
    <n-data-table
      v-else
      :columns="[
        { title: '挂号单号', key: 'register_no', width: 130 },
        { title: '医生工号', key: 'doc', width: 88, render: () => currentProfile?.username ?? '-' },
        { title: '患者', key: 'patient_id', width: 120, render: (row: Registration) => `${patientName(row.patient_id)}（${row.patient_id}）` },
        { title: '挂号时间', key: 'time', width: 170, render: (row: Registration) => regTimeLabel(row) },
        { title: '结束时间', key: 'end', width: 160, render: (row: Registration) => row.visit_end_time || '-' },
        { title: '病因/诊断', key: 'diagnosis', ellipsis: { tooltip: true }, render: (row: Registration) => row.diagnosis || row.symptom_desc || '-' },
        { title: '药物/处方', key: 'rx', ellipsis: { tooltip: true }, render: (row: Registration) => prescriptionSummary(row.register_id) },
        {
          title: '检查报告',
          key: 'exam',
          width: 100,
          render: (row: Registration) => {
            const es = examsForRegister(row.register_id).filter(e => e.check_result)
            return es.length ? `${es.length} 份已出` : '-'
          },
        },
        {
          title: '操作',
          key: 'a',
          width: 150,
          render: (row: Registration) =>
            h('div', { class: 'flex flex-wrap gap-1' }, [
              h(NButton, { size: 'small', type: 'warning', tertiary: true, onClick: () => openAdd(row) }, { default: () => '追诊' }),
              h(NButton, { size: 'small', onClick: () => openDetail(row) }, { default: () => '详情' }),
            ]),
        },
      ]"
      :data="pageData"
      :pagination="false"
    />
    <div v-if="rows.length" class="mt-3 flex justify-end">
      <n-pagination v-model:page="page" v-model:page-size="pageSize" :item-count="rows.length" :page-sizes="[8, 16, 24]" show-size-picker />
    </div>

    <n-modal v-model:show="showAdd" preset="dialog" title="追加诊断">
      <n-input v-model:value="addText" type="textarea" :rows="4" placeholder="补充或修订诊断结果" />
      <template #action>
        <NButton @click="showAdd = false">
          取消
        </NButton>
        <NButton type="primary" @click="saveAdd">
          保存
        </NButton>
      </template>
    </n-modal>
  </div>
</template>
