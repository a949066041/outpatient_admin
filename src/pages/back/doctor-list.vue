<script setup lang="ts">
import type { Doctor } from '~/types/outpatient'
import { NButton, NTag } from 'naive-ui'
import ActionButton from '~/components/ActionButton.vue'
import BackCrudModal from '~/components/BackCrudModal.vue'
import { useDepartmentStore, useDoctorStore, useReviewStore } from '~/store'
import { nextNumericId } from '~/utils/outpatient'

const store = useDoctorStore()
const { dataList: departments } = useDepartmentStore()
const { avgScoreForDoctor } = useReviewStore()
const {
  dataList,
  removeData,
  openModalState,
  openModal,
  updateTitle,
  closeModal,
  changeModal,
  saveForm,
  updateDataIndex,
  isUpdate,
} = store

const searchKeyword = ref('')
const page = ref(1)
const pageSize = ref(8)

function deptName(id?: number) {
  if (!id)
    return '-'
  return departments.value.find(d => d.department_id === id)?.dept_name ?? '-'
}

const filteredDoctors = computed(() => {
  const q = searchKeyword.value.trim()
  if (!q)
    return dataList.value
  return dataList.value.filter(
    d => d.name.includes(q) || d.doctor_no.includes(q) || (d.phone?.includes(q) ?? false),
  )
})

const pageData = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredDoctors.value.slice(start, start + pageSize.value)
})

watch([searchKeyword, pageSize], () => {
  page.value = 1
})

function confirmSave() {
  if (!isUpdate.value) {
    changeModal.value.doctor_id = nextNumericId(dataList.value, 'doctor_id')
    changeModal.value.status = changeModal.value.status ?? 1
    changeModal.value.gender = changeModal.value.gender ?? 1
    changeModal.value.register_fee = changeModal.value.register_fee ?? 10
  }
  saveForm()
}

function exportCsv() {
  const header = ['账号', '姓名', '性别', '职位', '科室', '证件号', '手机号', '邮箱', '评分', '挂号费', '是否在职']
  const rows = filteredDoctors.value.map((d) => {
    const gender = d.gender === 1 ? '男' : '女'
    const status = d.status === 1 ? '在职' : '离职'
    return [
      d.doctor_no,
      d.name,
      gender,
      d.title,
      deptName(d.department_id),
      d.id_card ?? '',
      d.phone,
      d.email,
      String(avgScoreForDoctor(d.doctor_id)),
      String(d.register_fee ?? 10),
      status,
    ]
  })
  const csv = [header, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `医生信息_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}

function rowIndexInStore(row: Doctor) {
  return dataList.value.findIndex(d => d.doctor_id === row.doctor_id)
}

const columns = [
  { title: '账号', key: 'doctor_no', width: 88 },
  { title: '姓名', key: 'name', width: 88 },
  {
    title: '性别',
    key: 'gender',
    width: 64,
    render: (row: Doctor) => (row.gender === 1 ? '男' : '女'),
  },
  { title: '职位', key: 'title', width: 120, ellipsis: { tooltip: true } },
  { title: '科室', key: 'department_id', width: 140, ellipsis: { tooltip: true }, render: (row: Doctor) => deptName(row.department_id) },
  { title: '证件号', key: 'id_card', width: 168, ellipsis: { tooltip: true }, render: (row: Doctor) => row.id_card ?? '-' },
  { title: '手机号', key: 'phone', width: 120 },
  { title: '邮箱', key: 'email', width: 160, ellipsis: { tooltip: true } },
  {
    title: '评分/5分',
    key: 'rating',
    width: 88,
    render: (row: Doctor) => avgScoreForDoctor(row.doctor_id),
  },
  {
    title: '挂号费/元',
    key: 'register_fee',
    width: 96,
    render: (row: Doctor) => row.register_fee ?? 10,
  },
  {
    title: '是否在职',
    key: 'status',
    width: 96,
    render: (row: Doctor) =>
      h(NTag, { type: row.status === 1 ? 'success' : 'default', size: 'small', bordered: false }, { default: () => (row.status === 1 ? '在职' : '离职') }),
  },
  {
    title: '操作',
    key: 'action',
    width: 120,
    fixed: 'right' as const,
    render: (row: Doctor) => {
      const idx = rowIndexInStore(row)
      return h(ActionButton, {
        onDelete: () => removeData(idx),
        isDel: true,
        onEdit: () => openModal(row, idx),
      })
    },
  },
]
</script>

<template>
  <div>
    <h3 class="mb-4 text-lg font-semibold text-slate-800">
      医生信息管理
    </h3>
    <n-card size="small" :bordered="true">
      <div class="mb-4 flex flex-nowrap items-center justify-between gap-4">
        <n-input-group class="w-full max-w-md shrink-0">
          <n-input
            v-model:value="searchKeyword"
            clearable
            placeholder="请输入姓名查询"
            @keydown.enter="page = 1"
          />
          <NButton type="primary" @click="page = 1">
            <template #icon>
              <span class="icon-[icon-park-outline--search]" />
            </template>
          </NButton>
        </n-input-group>
        <n-space class="shrink-0" :wrap="false">
          <NButton type="primary" @click="openModal()">
            <template #icon>
              <span class="icon-[icon-park-outline--plus]" />
            </template>
            增加医生
          </NButton>
          <NButton secondary @click="exportCsv">
            批量导出
          </NButton>
        </n-space>
      </div>
      <n-data-table
        :columns="columns"
        :data="pageData"
        :bordered="true"
        :single-line="false"
        size="small"
        scroll-x="1200"
      />
      <div class="mt-3 flex flex-wrap items-center justify-end gap-4 text-sm text-slate-600">
        <span>共 {{ filteredDoctors.length }} 条</span>
        <n-pagination
          v-model:page="page"
          v-model:page-size="pageSize"
          :item-count="filteredDoctors.length"
          show-size-picker
          :page-sizes="[8, 10, 20]"
        />
      </div>
    </n-card>
    <BackCrudModal
      v-model:show="openModalState"
      :title="updateTitle"
      card-class="!max-w-[600px]"
      @confirm="confirmSave"
      @cancel="closeModal"
    >
      <n-form :model="changeModal" label-placement="left" label-width="96px">
        <n-form-item label="工号">
          <n-input v-model:value="changeModal.doctor_no" :disabled="updateDataIndex >= 0" />
        </n-form-item>
        <n-form-item label="登录密码">
          <n-input v-model:value="changeModal.password" type="password" show-password-on="click" />
        </n-form-item>
        <n-form-item label="姓名">
          <n-input v-model:value="changeModal.name" />
        </n-form-item>
        <n-form-item label="性别">
          <n-radio-group v-model:value="changeModal.gender">
            <n-radio :value="0">
              女
            </n-radio>
            <n-radio :value="1">
              男
            </n-radio>
          </n-radio-group>
        </n-form-item>
        <n-form-item label="年龄">
          <n-input-number v-model:value="changeModal.age" class="w-full" :min="18" :max="80" />
        </n-form-item>
        <n-form-item label="证件号">
          <n-input v-model:value="changeModal.id_card" maxlength="18" />
        </n-form-item>
        <n-form-item label="科室">
          <n-select
            v-model:value="changeModal.department_id"
            :options="departments.filter(d => d.status === 1).map(d => ({ label: d.dept_name, value: d.department_id }))"
          />
        </n-form-item>
        <n-form-item label="职称">
          <n-input v-model:value="changeModal.title" />
        </n-form-item>
        <n-form-item label="挂号费">
          <n-input-number v-model:value="changeModal.register_fee" class="w-full" :min="0" :precision="0" />
        </n-form-item>
        <n-form-item label="电话">
          <n-input v-model:value="changeModal.phone" />
        </n-form-item>
        <n-form-item label="邮箱">
          <n-input v-model:value="changeModal.email" />
        </n-form-item>
        <n-form-item label="简介">
          <n-input v-model:value="changeModal.introduction" type="textarea" :rows="2" />
        </n-form-item>
        <n-form-item label="状态">
          <n-select
            v-model:value="changeModal.status"
            :options="[
              { label: '在职', value: 1 },
              { label: '离职', value: 0 },
            ]"
          />
        </n-form-item>
      </n-form>
    </BackCrudModal>
  </div>
</template>
