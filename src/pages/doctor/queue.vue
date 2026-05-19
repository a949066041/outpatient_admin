<script setup lang="ts">
import type { Registration } from '~/types/outpatient'
import { NButton, NTag } from 'naive-ui'
import { h } from 'vue'
import { useRouter } from 'vue-router'
import { useDoctorContext } from '~/composables/useDoctorContext'
import { useRegistrationStore } from '~/store'

const router = useRouter()
const { updateRegistration } = useRegistrationStore()
const {
  registrations,
  doctorId,
  today,
  patientName,
  patientAccount,
  regTimeLabel,
} = useDoctorContext()

const keyword = ref('')

const rows = computed(() => {
  const q = keyword.value.trim()
  return registrations.value
    .filter(
      r =>
        r.doctor_id === doctorId.value
        && r.register_date === today
        && r.status === 0,
    )
    .filter((r) => {
      if (!q)
        return true
      return (
        r.register_no.includes(q)
        || String(r.patient_id).includes(q)
        || patientName(r.patient_id).includes(q)
        || patientAccount(r.patient_id).includes(q)
      )
    })
    .sort((a, b) => a.register_id - b.register_id)
})

function receive(r: Registration) {
  updateRegistration(r.register_id, { visiting: true })
  router.push({ path: '/doctor/consult', query: { id: String(r.register_id) } })
}
</script>

<template>
  <div>
    <h3 class="mb-1 text-lg font-medium text-slate-800">
      今日挂号列表
    </h3>

    <n-input
      v-model:value="keyword"
      class="mb-4 max-w-sm"
      clearable
      placeholder="请输入患者姓名 / 账号 / 挂号单号查询"
    >
      <template #prefix>
        <span class="icon-[icon-park-outline--search]" />
      </template>
    </n-input>

    <n-empty v-if="!rows.length" description="暂无待就诊挂号" />
    <n-data-table
      v-else
      :columns="[
        { title: '挂号单号', key: 'register_no', width: 140 },
        { title: '患者账号', key: 'acc', width: 110, render: (row: Registration) => patientAccount(row.patient_id) },
        { title: '患者姓名', key: 'name', width: 100, render: (row: Registration) => patientName(row.patient_id) },
        { title: '挂号时间', key: 'time', width: 180, render: (row: Registration) => regTimeLabel(row) },
        { title: '主诉', key: 'symptom_desc', ellipsis: { tooltip: true } },
        {
          title: '缴费',
          key: 'is_paid',
          width: 88,
          render: (row: Registration) =>
            h(NTag, { size: 'small', type: row.is_paid ? 'success' : 'warning' }, { default: () => (row.is_paid ? '已缴' : '未缴') }),
        },
        {
          title: '操作',
          key: 'op',
          width: 100,
          render: (row: Registration) =>
            h(NButton, { size: 'small', type: 'primary', onClick: () => receive(row) }, { default: () => '接诊' }),
        },
      ]"
      :data="rows"
      :pagination="{ pageSize: 8 }"
    />
  </div>
</template>
