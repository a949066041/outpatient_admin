<script setup lang="ts">
import { NButton, NSpace } from 'naive-ui'
import { useDepartmentStore, useDoctorStore, usePatientStore, useRegistrationStore } from '~/store'

const { list, cancelRegister, payRegister } = useRegistrationStore()
const { dataList: patients } = usePatientStore()
const { dataList: doctors } = useDoctorStore()
const { dataList: departments } = useDepartmentStore()
const message = useMessage()

const searchKeyword = ref('')
const filterStatus = ref<'all' | '0' | '1' | '2'>('all')
const page = ref(1)
const pageSize = ref(10)

function pname(id: number) {
  return patients.value.find(p => p.patient_id === id)?.real_name ?? String(id)
}
function dname(id: number) {
  return doctors.value.find(d => d.doctor_id === id)?.name ?? String(id)
}
function depname(id: number) {
  return departments.value.find(d => d.department_id === id)?.dept_name ?? String(id)
}

const filteredList = computed(() => {
  let rows = list.value.slice()
  if (filterStatus.value !== 'all')
    rows = rows.filter(r => String(r.status) === filterStatus.value)
  const q = searchKeyword.value.trim()
  if (q) {
    rows = rows.filter(
      r =>
        r.register_no.includes(q)
        || pname(r.patient_id).includes(q)
        || dname(r.doctor_id).includes(q),
    )
  }
  return rows.sort((a, b) => b.register_date.localeCompare(a.register_date) || b.register_id - a.register_id)
})

const pageData = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredList.value.slice(start, start + pageSize.value)
})

watch([searchKeyword, filterStatus, pageSize], () => {
  page.value = 1
})

const columns = [
  { title: '挂号单号', key: 'register_no', width: 140 },
  { title: '患者', key: 'patient_id', width: 88, render: (row: any) => pname(row.patient_id) },
  { title: '医生', key: 'doctor_id', width: 88, render: (row: any) => dname(row.doctor_id) },
  { title: '科室', key: 'department_id', width: 120, ellipsis: { tooltip: true }, render: (row: any) => depname(row.department_id) },
  { title: '日期', key: 'register_date', width: 112 },
  { title: '时段', key: 'time_slot', width: 72 },
  { title: '挂号费', key: 'register_fee', width: 88, render: (row: any) => `¥${row.register_fee}` },
  {
    title: '缴费',
    key: 'is_paid',
    width: 72,
    render: (row: any) => (row.is_paid ? '已缴' : '未缴'),
  },
  {
    title: '状态',
    key: 'status',
    width: 88,
    render: (row: any) => (row.status === 0 ? '待就诊' : row.status === 1 ? '已就诊' : '已取消'),
  },
  {
    title: '操作',
    key: 'actions',
    width: 160,
    render: (row: any) => {
      const btns: ReturnType<typeof h>[] = []
      if (row.is_paid === 0 && row.status !== 2) {
        btns.push(h(NButton, {
          size: 'small',
          type: 'primary',
          onClick: () => {
            payRegister(row.register_id)
            message.success('已标记缴费')
          },
        }, { default: () => '代缴费' }))
      }
      if (row.status !== 2) {
        btns.push(h(NButton, {
          size: 'small',
          tertiary: true,
          onClick: () => {
            cancelRegister(row.register_id)
            message.info('已取消并释放号源')
          },
        }, { default: () => '取消' }))
      }
      return h(NSpace, { size: 8 }, () => btns)
    },
  },
]
</script>

<template>
  <div>
    <h3 class="mb-4 text-lg font-semibold text-slate-800">
      挂号信息管理
    </h3>
    <n-card size="small">
      <div class="mb-4 flex flex-nowrap items-center gap-3">
        <n-input-group class="shrink-0" style="width: 320px">
          <n-input
            v-model:value="searchKeyword"
            clearable
            placeholder="挂号单号 / 患者 / 医生"
            @keydown.enter="page = 1"
          />
          <n-button type="primary" @click="page = 1">
            <template #icon>
              <span class="icon-[icon-park-outline--search]" />
            </template>
          </n-button>
        </n-input-group>
        <n-select
          v-model:value="filterStatus"
          class="shrink-0"
          style="width: 132px"
          :options="[
            { label: '全部状态', value: 'all' },
            { label: '待就诊', value: '0' },
            { label: '已就诊', value: '1' },
            { label: '已取消', value: '2' },
          ]"
        />
      </div>
      <n-data-table :columns="columns" :data="pageData" :bordered="true" size="small" />
      <div class="mt-3 flex justify-end gap-4 text-sm text-slate-600">
        <span>共 {{ filteredList.length }} 条</span>
        <n-pagination
          v-model:page="page"
          v-model:page-size="pageSize"
          :item-count="filteredList.length"
          show-size-picker
          :page-sizes="[10, 20, 50]"
        />
      </div>
    </n-card>
  </div>
</template>
