<script setup lang="ts">
import type { Registration } from '~/types/outpatient'
import { useRouter } from 'vue-router'
import {
  useDepartmentStore,
  useDoctorStore,
  useExamApplicationStore,
  useLoginStore,
  usePrescriptionStore,
  useRegistrationStore,
} from '~/store'

const router = useRouter()
const message = useMessage()
const { list, payRegister, cancelRegister } = useRegistrationStore()
const { dataList: doctors } = useDoctorStore()
const { dataList: departments } = useDepartmentStore()
const { currentProfile } = useLoginStore()
const { list: rxList, payPrescription } = usePrescriptionStore()
const { list: examList, pay: payExam } = useExamApplicationStore()

const tab = ref<'all' | '0' | '1' | '2'>('all')

const mine = computed(() =>
  list.value.filter(r => r.patient_id === currentProfile.value?.id).sort((a, b) => b.register_id - a.register_id),
)

const filtered = computed(() => {
  if (tab.value === 'all')
    return mine.value
  return mine.value.filter(r => String(r.status) === tab.value)
})

const myRx = computed(() =>
  rxList.value.filter(p => p.patient_id === currentProfile.value?.id && p.status === 0),
)

const myExams = computed(() =>
  examList.value.filter(p => p.patient_id === currentProfile.value?.id && p.status === 0 && p.is_paid === 0),
)

function dname(id: number) {
  return doctors.value.find(d => d.doctor_id === id)?.name ?? id
}

function depLoc(reg: Registration) {
  return departments.value.find(d => d.department_id === reg.department_id)?.location ?? '—'
}

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

function hasMedicalRecord(r: Registration) {
  return r.status === 1 && !!(r.symptom_desc || r.diagnosis)
}
</script>

<template>
  <div>
    <n-h2 prefix="bar">
      我的挂号
    </n-h2>

    <n-tabs v-model:value="tab" type="line" class="mb-4">
      <n-tab-pane name="all" tab="全部" />
      <n-tab-pane name="0" tab="待就诊" />
      <n-tab-pane name="1" tab="已就诊" />
      <n-tab-pane name="2" tab="已取消" />
    </n-tabs>

    <n-empty v-if="!filtered.length" description="暂无符合条件的挂号记录" />
    <n-list v-else bordered>
      <n-list-item v-for="r in filtered" :key="r.register_id">
        <div class="flex flex-col gap-3">
          <div class="flex flex-wrap items-center gap-2">
            <n-tag type="info">
              {{ r.register_no }}
            </n-tag>
            <span class="text-slate-700">{{ r.register_date }} {{ r.time_slot }}</span>
            <span class="text-slate-600">医生：{{ dname(r.doctor_id) }}</span>
            <span class="text-sm text-slate-500">地点：{{ depLoc(r) }}</span>
            <n-tag size="small" :type="r.status === 0 ? 'warning' : r.status === 1 ? 'success' : 'default'">
              {{ r.status === 0 ? '待就诊' : r.status === 1 ? '已就诊' : '已取消' }}
            </n-tag>
            <n-tag size="small" :type="r.is_paid ? 'success' : 'error'">
              {{ r.is_paid ? '已缴费' : '未缴费' }}
            </n-tag>
          </div>
          <n-space v-if="r.status !== 2">
            <n-button v-if="r.is_paid === 0 && r.status === 0" size="small" type="primary" @click="pay(r)">
              支付挂号费 ¥{{ r.register_fee }}
            </n-button>
            <n-button v-if="r.status === 0" size="small" tertiary @click="cancel(r)">
              取消预约
            </n-button>
          </n-space>
          <!-- 论文：就诊完成后查看电子病历 -->
          <n-collapse v-if="r.status === 1" class="!mt-0">
            <n-collapse-item title="电子病历（主诉与诊断）" :name="`emr-${r.register_id}`">
              <template v-if="hasMedicalRecord(r)">
                <p class="text-sm">
                  <strong>主诉 / 症状：</strong>{{ r.symptom_desc || '—' }}
                </p>
                <p class="mt-2 text-sm">
                  <strong>诊断：</strong>{{ r.diagnosis || '—' }}
                </p>
              </template>
              <n-empty v-else description="医生尚未录入病历内容" size="small" />
              <n-button class="mt-2" size="tiny" quaternary type="primary" @click="router.push('/home/reports')">
                导出检验报告单
              </n-button>
            </n-collapse-item>
          </n-collapse>
        </div>
      </n-list-item>
    </n-list>

    <n-divider />

    <n-h3 prefix="bar">
      待缴处方
    </n-h3>
    <n-empty v-if="!myRx.length" description="暂无待缴费处方" />
    <n-list v-else bordered>
      <n-list-item v-for="p in myRx" :key="p.prescription_id">
        <div class="flex items-center justify-between gap-2">
          <span>{{ p.prescription_no }} · 合计 ¥{{ p.total_amount }}</span>
          <n-button size="small" type="primary" @click="payRx(p.prescription_id)">
            支付药费
          </n-button>
        </div>
      </n-list-item>
    </n-list>

    <n-divider />

    <n-h3 prefix="bar">
      待缴检查费
    </n-h3>
    <n-empty v-if="!myExams.length" description="暂无待缴检查申请" />
    <n-list v-else bordered>
      <n-list-item v-for="e in myExams" :key="e.application_id">
        <div class="flex items-center justify-between gap-2">
          <span>{{ e.application_no }}</span>
          <n-button size="small" type="primary" @click="payEx(e.application_id)">
            支付检查费
          </n-button>
        </div>
      </n-list-item>
    </n-list>
  </div>
</template>
