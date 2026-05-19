<script setup lang="ts">
import type { Patient } from '~/types/outpatient'
import ActionButton from '~/components/ActionButton.vue'
import BackCrudModal from '~/components/BackCrudModal.vue'
import ColorColumn from '~/components/ColorColumn.vue'
import { usePatientStore } from '~/store'
import { nextNumericId } from '~/utils/outpatient'

const store = usePatientStore()
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

const filteredPatients = computed(() => {
  const q = searchKeyword.value.trim()
  if (!q)
    return dataList.value
  return dataList.value.filter(
    p =>
      p.real_name.includes(q)
      || p.username.includes(q)
      || p.phone.includes(q)
      || p.id_card.includes(q),
  )
})

const pageData = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredPatients.value.slice(start, start + pageSize.value)
})

watch([searchKeyword, pageSize], () => {
  page.value = 1
})

function confirmSave() {
  if (!isUpdate.value) {
    changeModal.value.patient_id = nextNumericId(dataList.value, 'patient_id')
    changeModal.value.status = changeModal.value.status ?? 1
    changeModal.value.gender = changeModal.value.gender ?? 1
  }
  saveForm()
}

function rowIndex(row: Patient) {
  return dataList.value.findIndex(p => p.patient_id === row.patient_id)
}

const columns = [
  { title: '用户名', key: 'username', width: 110 },
  { title: '姓名', key: 'real_name', width: 88 },
  {
    title: '性别',
    key: 'gender',
    width: 64,
    render: (row: Patient) => (row.gender === 1 ? '男' : '女'),
  },
  { title: '年龄', key: 'age', width: 64 },
  { title: '身份证', key: 'id_card', width: 168, ellipsis: { tooltip: true } },
  { title: '电话', key: 'phone', width: 120 },
  { title: '住址', key: 'address', ellipsis: { tooltip: true } },
  {
    title: '状态',
    key: 'status',
    width: 80,
    render: (row: Patient) => h(ColorColumn, { text: row.status === 1 ? '正常' : '禁用', danger: row.status !== 1 }),
  },
  {
    title: '操作',
    key: 'action',
    width: 120,
    render: (row: Patient) =>
      h(ActionButton, {
        onDelete: () => removeData(rowIndex(row)),
        isDel: true,
        onEdit: () => openModal(row, rowIndex(row)),
      }),
  },
]
</script>

<template>
  <div>
    <h3 class="mb-4 text-lg font-semibold text-slate-800">
      患者信息管理
    </h3>
    <n-card size="small">
      <div class="mb-4 flex flex-nowrap items-center justify-between gap-4">
        <n-input-group class="w-full max-w-md shrink-0">
          <n-input
            v-model:value="searchKeyword"
            clearable
            placeholder="请输入姓名、用户名或手机号查询"
            @keydown.enter="page = 1"
          />
          <n-button type="primary" @click="page = 1">
            <template #icon>
              <span class="icon-[icon-park-outline--search]" />
            </template>
          </n-button>
        </n-input-group>
        <n-button class="shrink-0" type="primary" @click="openModal()">
          新增患者档案
        </n-button>
      </div>
      <n-data-table :columns="columns" :data="pageData" :bordered="true" size="small" />
      <div class="mt-3 flex justify-end gap-4 text-sm text-slate-600">
        <span>共 {{ filteredPatients.length }} 条</span>
        <n-pagination
          v-model:page="page"
          v-model:page-size="pageSize"
          :item-count="filteredPatients.length"
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
        <n-form-item label="用户名">
          <n-input v-model:value="changeModal.username" :disabled="updateDataIndex >= 0" />
        </n-form-item>
        <n-form-item label="密码">
          <n-input v-model:value="changeModal.password" type="password" show-password-on="click" />
        </n-form-item>
        <n-form-item label="真实姓名">
          <n-input v-model:value="changeModal.real_name" />
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
          <n-input-number v-model:value="changeModal.age" class="w-full" :min="1" :max="120" />
        </n-form-item>
        <n-form-item label="身份证号">
          <n-input v-model:value="changeModal.id_card" />
        </n-form-item>
        <n-form-item label="联系电话">
          <n-input v-model:value="changeModal.phone" />
        </n-form-item>
        <n-form-item label="住址">
          <n-input v-model:value="changeModal.address" />
        </n-form-item>
        <n-form-item label="邮箱">
          <n-input v-model:value="changeModal.email" />
        </n-form-item>
        <n-form-item label="既往病史">
          <n-input v-model:value="changeModal.medical_history" type="textarea" :rows="2" />
        </n-form-item>
        <n-form-item label="状态">
          <n-select
            v-model:value="changeModal.status"
            :options="[
              { label: '正常', value: 1 },
              { label: '禁用', value: 0 },
            ]"
          />
        </n-form-item>
      </n-form>
    </BackCrudModal>
  </div>
</template>
