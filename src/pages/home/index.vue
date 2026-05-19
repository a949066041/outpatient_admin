<script setup lang="ts">
import { useRouter } from 'vue-router'
import { usePatientContext } from '~/composables/usePatientContext'
import { useExamApplicationStore, usePrescriptionStore } from '~/store'

const router = useRouter()
const { registrations, patientId, patientRow } = usePatientContext()
const { list: rxList } = usePrescriptionStore()
const { list: examList } = useExamApplicationStore()

const mine = computed(() =>
  registrations.value.filter(r => r.patient_id === patientId.value && r.status !== 2),
)

const pending = computed(() => mine.value.filter(r => r.status === 0))
const unpaidReg = computed(() => mine.value.filter(r => r.is_paid === 0 && r.status === 0))
const done = computed(() => mine.value.filter(r => r.status === 1))

const unpaidRx = computed(() =>
  rxList.value.filter(p => p.patient_id === patientId.value && p.status === 0),
)

const unpaidExam = computed(() =>
  examList.value.filter(e => e.patient_id === patientId.value && e.status === 0 && e.is_paid === 0),
)

const reportCount = computed(() =>
  examList.value.filter(e => e.patient_id === patientId.value && e.status === 1 && e.check_result).length,
)
</script>

<template>
  <div>
    <h2 class="mb-1 text-xl font-semibold text-slate-800">
      首页
    </h2>
    <p class="mb-6 text-slate-600">
      欢迎使用门诊管理系统患者端，{{ patientRow()?.real_name ?? '患者' }}。您可进行在线预约挂号、查看订单并缴费，就诊后导出检验报告单并评价医生。
    </p>
    <n-grid :cols="4" :x-gap="16" :y-gap="16" responsive="screen">
      <n-gi>
        <n-card title="待就诊预约" embedded>
          <div class="text-3xl font-semibold text-teal-600">
            {{ pending.length }}
          </div>
          <n-button class="mt-3" text type="primary" @click="router.push('/home/my-registers')">
            我的挂号
          </n-button>
        </n-card>
      </n-gi>
      <n-gi>
        <n-card title="待缴挂号费" embedded>
          <div class="text-3xl font-semibold text-amber-600">
            {{ unpaidReg.length }}
          </div>
          <n-button class="mt-3" text type="primary" @click="router.push('/home/my-registers')">
            去支付
          </n-button>
        </n-card>
      </n-gi>
      <n-gi>
        <n-card title="已就诊" embedded>
          <div class="text-3xl font-semibold text-emerald-600">
            {{ done.length }}
          </div>
          <n-button class="mt-3" text type="primary" @click="router.push('/home/review')">
            评价医生
          </n-button>
        </n-card>
      </n-gi>
      <n-gi>
        <n-card title="可导出报告" embedded>
          <div class="text-3xl font-semibold text-blue-600">
            {{ reportCount }}
          </div>
          <n-button class="mt-3" text type="primary" @click="router.push('/home/reports')">
            导出报告单
          </n-button>
        </n-card>
      </n-gi>
    </n-grid>

    <n-card class="mt-6" title="待缴费用摘要">
      <n-descriptions :column="2" label-placement="left" bordered size="small">
        <n-descriptions-item label="待缴处方">
          {{ unpaidRx.length }} 笔
        </n-descriptions-item>
        <n-descriptions-item label="待缴检查">
          {{ unpaidExam.length }} 笔
        </n-descriptions-item>
      </n-descriptions>
      <n-button class="mt-4" type="primary" @click="router.push('/home/book')">
        立即预约挂号
      </n-button>
    </n-card>
  </div>
</template>
