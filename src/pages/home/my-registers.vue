<script setup lang="ts">
import type { Registration } from '~/types/outpatient'
import { NButton, NTag } from 'naive-ui'
import { h } from 'vue'
import { useRouter } from 'vue-router'
import { usePatientContext } from '~/composables/usePatientContext'
import {
  useExamApplicationStore,
  usePrescriptionStore,
  useRegistrationStore,
} from '~/store'

const router = useRouter()
const message = useMessage()
const { payRegister, cancelRegister } = useRegistrationStore()
const { payPrescription } = usePrescriptionStore()
const { pay: payExam } = useExamApplicationStore()
const {
  registrations,
  patientId,
  patientRow,
  doctorName,
  doctorNo,
  regTimeLabel,
  feeDue,
  regStatusLabel,
  payStatusLabel,
  examsForRegister,
  prescriptions,
  exams,
} = usePatientContext()

const tab = ref<'all' | '0' | '1' | '2'>('all')
const keyword = ref('')
const page = ref(1)
const pageSize = ref(8)

const mine = computed(() =>
  registrations.value
    .filter(r => r.patient_id === patientId.value)
    .sort((a, b) => b.register_id - a.register_id),
)

const filtered = computed(() => {
  const q = keyword.value.trim()
  let rows = mine.value
  if (tab.value !== 'all')
    rows = rows.filter(r => String(r.status) === tab.value)
  if (!q)
    return rows
  return rows.filter(
    r =>
      r.register_no.includes(q)
      || doctorName(r.doctor_id).includes(q)
      || String(r.patient_id).includes(q),
  )
})

const pageData = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value)
})

watch([tab, keyword], () => {
  page.value = 1
})

const myRx = computed(() =>
  prescriptions.value.filter(p => p.patient_id === patientId.value && p.status === 0),
)

const myExams = computed(() =>
  exams.value.filter(p => p.patient_id === patientId.value && p.status === 0 && p.is_paid === 0),
)

function pay(r: Registration) {
  payRegister(r.register_id)
  message.success('挂号费已支付（演示）')
}

function cancel(r: Registration) {
  cancelRegister(r.register_id)
  message.info('已取消预约并释放号源')
}

function payRx(id: number) {
  payPrescription(id)
  message.success('药费已支付（演示）')
}

function payEx(id: number) {
  payExam(id)
  message.success('检查费已支付（演示）')
}

function viewReports(r: Registration) {
  if (examsForRegister(r.register_id).length)
    router.push('/home/reports')
  else
    message.info('该挂号暂无已出报告的检查')
}
</script>

<template>
  <div>
    <h2 class="mb-1 text-xl font-semibold text-slate-800">
      我的挂号
    </h2>
    <p class="mb-4 text-sm text-slate-500">
      查看历史与当前预约，在线缴纳挂号费、药费、检查费；就诊完成后可查看电子病历并导出报告单（图 5.13）
    </p>

    <n-tabs v-model:value="tab" type="line" class="mb-4">
      <n-tab-pane name="all" tab="全部" />
      <n-tab-pane name="0" tab="待就诊" />
      <n-tab-pane name="1" tab="已就诊" />
      <n-tab-pane name="2" tab="已取消" />
    </n-tabs>

    <n-input
      v-model:value="keyword"
      class="mb-4 max-w-sm"
      clearable
      placeholder="请输入挂号单号 / 医生姓名查询"
    />

    <n-empty v-if="!filtered.length" description="暂无符合条件的挂号记录" />
    <template v-else>
      <n-data-table
        size="small"
        :columns="[
          { title: '挂号单号', key: 'register_no', width: 130 },
          { title: '本人id', key: 'pid', width: 72, render: (row: Registration) => patientRow()?.patient_id ?? row.patient_id },
          { title: '姓名', key: 'name', width: 88, render: () => patientRow()?.real_name ?? '—' },
          { title: '医生id', key: 'did', width: 72, render: (row: Registration) => doctorNo(row.doctor_id) },
          { title: '医生姓名', key: 'dname', width: 88, render: (row: Registration) => doctorName(row.doctor_id) },
          { title: '挂号时间', key: 'time', width: 170, render: (row: Registration) => regTimeLabel(row) },
          { title: '结束时间', key: 'end', width: 160, render: (row: Registration) => row.visit_end_time || '—' },
          { title: '需交费用/元', key: 'fee', width: 100, render: (row: Registration) => feeDue(row) },
          {
            title: '缴费状态',
            key: 'pay',
            width: 88,
            render: (row: Registration) =>
              h(NTag, { size: 'small', type: row.is_paid ? 'success' : 'warning' }, { default: () => payStatusLabel(row.is_paid) }),
          },
          {
            title: '挂号状态',
            key: 'status',
            width: 88,
            render: (row: Registration) => {
              const done = row.status === 1
              return h(NTag, { size: 'small', type: done ? 'success' : row.status === 0 ? 'warning' : 'default' }, { default: () => regStatusLabel(row) })
            },
          },
          {
            title: '报告单',
            key: 'report',
            width: 100,
            render: (row: Registration) =>
              row.status === 1 && examsForRegister(row.register_id).length
                ? h(NButton, { size: 'small', type: 'primary', onClick: () => viewReports(row) }, { default: () => '查看' })
                : '—',
          },
          {
            title: '操作',
            key: 'op',
            width: 160,
            render: (row: Registration) => {
              const btns = []
              if (row.status === 0 && row.is_paid === 0)
                btns.push(h(NButton, { size: 'tiny', type: 'primary', onClick: () => pay(row) }, { default: () => '缴费' }))
              if (row.status === 0)
                btns.push(h(NButton, { size: 'tiny', onClick: () => cancel(row) }, { default: () => '取消' }))
              return h('div', { class: 'flex flex-wrap gap-1' }, btns)
            },
          },
        ]"
        :data="pageData"
        :pagination="false"
      />
      <div class="mt-3 flex justify-end">
        <n-pagination v-model:page="page" v-model:page-size="pageSize" :item-count="filtered.length" :page-sizes="[8, 16, 24]" show-size-picker />
      </div>
    </template>

    <n-divider />

    <h3 class="mb-3 text-base font-semibold text-slate-800">
      待缴处方
    </h3>
    <n-empty v-if="!myRx.length" description="暂无待缴费处方" />
    <n-data-table
      v-else
      size="small"
      :columns="[
        { title: '处方单号', key: 'prescription_no' },
        { title: '金额/元', key: 'total_amount', width: 100 },
        {
          title: '操作',
          key: 'op',
          width: 100,
          render: (row: { prescription_id: number, total_amount: number }) =>
            h(NButton, { size: 'small', type: 'primary', onClick: () => payRx(row.prescription_id) }, { default: () => '支付药费' }),
        },
      ]"
      :data="myRx"
      :pagination="false"
    />

    <n-divider />

    <h3 class="mb-3 text-base font-semibold text-slate-800">
      待缴检查费
    </h3>
    <n-empty v-if="!myExams.length" description="暂无待缴检查申请" />
    <n-data-table
      v-else
      size="small"
      :columns="[
        { title: '申请单号', key: 'application_no' },
        {
          title: '操作',
          key: 'op',
          width: 100,
          render: (row: { application_id: number }) =>
            h(NButton, { size: 'small', type: 'primary', onClick: () => payEx(row.application_id) }, { default: () => '支付' }),
        },
      ]"
      :data="myExams"
      :pagination="false"
    />

    <n-collapse v-if="mine.some(r => r.status === 1)" class="mt-6">
      <n-collapse-item title="电子病历（已就诊挂号）" name="emr">
        <n-list bordered>
          <n-list-item v-for="r in mine.filter(x => x.status === 1)" :key="r.register_id">
            <p class="text-sm font-medium">
              {{ r.register_no }} · {{ doctorName(r.doctor_id) }}
            </p>
            <p class="mt-1 text-sm text-slate-600">
              主诉：{{ r.symptom_desc || '—' }}
            </p>
            <p class="mt-1 text-sm text-slate-600">
              诊断：{{ r.diagnosis || '—' }}
            </p>
          </n-list-item>
        </n-list>
      </n-collapse-item>
    </n-collapse>
  </div>
</template>
