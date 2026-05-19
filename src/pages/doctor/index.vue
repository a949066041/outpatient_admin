<script setup lang="ts">
import type { Registration } from '~/types/outpatient'
import { NButton } from 'naive-ui'
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
  regTimeLabel,
  statusLabel,
} = useDoctorContext()

const myToday = computed(() =>
  registrations.value
    .filter(r => r.doctor_id === doctorId.value && r.register_date === today && r.status !== 2)
    .sort((a, b) => a.register_id - b.register_id),
)

const stats = computed(() => ({
  total: myToday.value.length,
  pending: myToday.value.filter(r => r.status === 0 && !r.visiting).length,
  visiting: myToday.value.filter(r => r.visiting).length,
  done: myToday.value.filter(r => r.status === 1).length,
}))

const pendingQueue = computed(() => myToday.value.filter(r => r.status === 0))

function receive(r: Registration) {
  updateRegistration(r.register_id, { visiting: true })
  router.push({ path: '/doctor/consult', query: { id: String(r.register_id) } })
}
</script>

<template>
  <div>
    <h2 class="mb-1 text-xl font-semibold text-slate-800">
      当日预约患者统计
    </h2>
    <n-grid :cols="4" :x-gap="12" responsive="screen">
      <n-gi>
        <n-statistic label="今日预约总数" :value="stats.total" />
      </n-gi>
      <n-gi>
        <n-statistic label="待接诊" :value="stats.pending" />
      </n-gi>
      <n-gi>
        <n-statistic label="就诊中" :value="stats.visiting" />
      </n-gi>
      <n-gi>
        <n-statistic label="已完成" :value="stats.done" />
      </n-gi>
    </n-grid>

    <n-card class="mt-6" title="按挂号顺序的待诊队列">
      <template #header-extra>
        <NButton text type="primary" @click="router.push('/doctor/queue')">
          查看今日挂号列表 →
        </NButton>
      </template>
      <n-empty v-if="!pendingQueue.length" description="暂无待就诊患者" />
      <n-data-table
        v-else
        size="small"
        :columns="[
          { title: '序号', key: 'register_id', width: 72 },
          { title: '挂号单号', key: 'register_no', width: 140 },
          { title: '患者', key: 'patient', render: (row: Registration) => patientName(row.patient_id) },
          { title: '时段', key: 'time', render: (row: Registration) => regTimeLabel(row) },
          { title: '主诉', key: 'symptom_desc', ellipsis: { tooltip: true } },
          {
            title: '缴费',
            key: 'is_paid',
            width: 88,
            render: (row: Registration) => (row.is_paid ? '已缴' : '未缴'),
          },
          {
            title: '操作',
            key: 'op',
            width: 100,
            render: (row: Registration) =>
              h(NButton, { size: 'small', type: 'primary', onClick: () => receive(row) }, { default: () => '接诊' }),
          },
        ]"
        :data="pendingQueue"
        :pagination="false"
      />
    </n-card>

    <n-card class="mt-4" title="今日全部预约">
      <n-data-table
        size="small"
        :columns="[
          { title: '挂号单号', key: 'register_no', width: 140 },
          { title: '患者', key: 'p', render: (row: Registration) => patientName(row.patient_id) },
          { title: '时段', key: 't', render: (row: Registration) => regTimeLabel(row) },
          {
            title: '状态',
            key: 's',
            render: (row: Registration) => (row.visiting ? '就诊中' : statusLabel(row.status)),
          },
        ]"
        :data="myToday"
        :pagination="{ pageSize: 8 }"
      />
    </n-card>
  </div>
</template>
