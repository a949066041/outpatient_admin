<script setup lang="ts">
import type { Registration } from '~/types/outpatient'
import { NButton, NTag } from 'naive-ui'
import { h } from 'vue'
import { useDoctorContext } from '~/composables/useDoctorContext'
import { useHospitalizationStore, useLoginStore } from '~/store'

const message = useMessage()
const { list: hospitalizations, applyHospital } = useHospitalizationStore()
const { currentProfile } = useLoginStore()
const {
  registrations,
  doctorId,
  patientName,
  regTimeLabel,
  statusLabel,
} = useDoctorContext()

const keyword = ref('')
const page = ref(1)
const pageSize = ref(8)

const showZy = ref(false)
const activeReg = ref<Registration | null>(null)
const zyDiag = ref('')
const zyDays = ref(3)

const rows = computed(() => {
  const q = keyword.value.trim()
  const appliedIds = new Set(hospitalizations.value.map(h => h.register_id))
  return registrations.value
    .filter(r => r.doctor_id === doctorId.value && r.status === 1)
    .filter(r => !appliedIds.has(r.register_id))
    .filter((r) => {
      if (!q)
        return true
      return String(r.patient_id).includes(q) || patientName(r.patient_id).includes(q)
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

function openApply(r: Registration) {
  activeReg.value = r
  zyDiag.value = r.diagnosis || ''
  zyDays.value = 3
  showZy.value = true
}

function submitApply() {
  if (!activeReg.value || !currentProfile.value)
    return
  const r = applyHospital({
    register_id: activeReg.value.register_id,
    patient_id: activeReg.value.patient_id,
    doctor_id: currentProfile.value.id as number,
    diagnosis: zyDiag.value || activeReg.value.diagnosis,
    expected_days: zyDays.value,
  })
  if (!r.ok) {
    message.error(r.message)
    return
  }
  message.success(r.message)
  showZy.value = false
  activeReg.value = null
}
</script>

<template>
  <div>
    <h3 class="mb-1 text-lg font-medium text-slate-800">
      住院申请管理
    </h3>

    <n-input
      v-model:value="keyword"
      class="mb-4 max-w-sm"
      clearable
      placeholder="请输入患者 id 查询"
    >
      <template #prefix>
        <span class="icon-[icon-park-outline--search]" />
      </template>
    </n-input>

    <n-empty v-if="!rows.length" description="暂无可申请住院的已完成挂号" />
    <n-data-table
      v-else
      :columns="[
        { title: '挂号单号', key: 'register_no', width: 130 },
        { title: '患者', key: 'patient_id', width: 120, render: (row: Registration) => `${patientName(row.patient_id)}（${row.patient_id}）` },
        { title: '医生工号', key: 'd', width: 88, render: () => currentProfile?.username },
        { title: '挂号时间', key: 'time', width: 170, render: (row: Registration) => regTimeLabel(row) },
        { title: '结束时间', key: 'end', width: 160, render: (row: Registration) => row.visit_end_time || '-' },
        {
          title: '挂号状态',
          key: 'status',
          width: 96,
          render: () => h(NTag, { type: 'success', size: 'small' }, { default: () => statusLabel(1) }),
        },
        {
          title: '操作',
          key: 'op',
          width: 120,
          render: (row: Registration) =>
            h(NButton, { size: 'small', type: 'warning', onClick: () => openApply(row) }, { default: () => '申请住院' }),
        },
      ]"
      :data="pageData"
      :pagination="false"
    />
    <div v-if="rows.length" class="mt-3 flex justify-end">
      <n-pagination v-model:page="page" v-model:page-size="pageSize" :item-count="rows.length" :page-sizes="[4, 8, 16]" show-size-picker />
    </div>

    <n-modal v-model:show="showZy" preset="dialog" title="申请当天入院">
      <p v-if="activeReg" class="mb-3 text-sm text-slate-600">
        患者：{{ patientName(activeReg.patient_id) }} · 挂号单 {{ activeReg.register_no }}
      </p>
      <n-form label-placement="top">
        <n-form-item label="入院诊断">
          <n-input v-model:value="zyDiag" type="textarea" :rows="2" />
        </n-form-item>
        <n-form-item label="预计住院天数">
          <n-input-number v-model:value="zyDays" :min="1" :max="60" class="w-full" />
        </n-form-item>
      </n-form>
      <template #action>
        <NButton @click="showZy = false">
          取消
        </NButton>
        <NButton type="primary" @click="submitApply">
          提交
        </NButton>
      </template>
    </n-modal>
  </div>
</template>
