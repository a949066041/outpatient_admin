<script setup lang="ts">
import type { PrescriptionDetail } from '~/types/outpatient'
import dayjs from 'dayjs'
import { useRoute, useRouter } from 'vue-router'
import { useDoctorContext } from '~/composables/useDoctorContext'
import {
  useExamApplicationStore,
  useExamItemStore,
  useHospitalizationStore,
  useLoginStore,
  useMedicineStore,
  usePrescriptionStore,
  useRegistrationStore,
} from '~/store'

const route = useRoute()
const router = useRouter()
const message = useMessage()

const { list, updateRegistration } = useRegistrationStore()
const { createPrescription } = usePrescriptionStore()
const { createApplication } = useExamApplicationStore()
const { applyHospital } = useHospitalizationStore()
const { dataList: medicines } = useMedicineStore()
const { dataList: examItems } = useExamItemStore()
const { currentProfile } = useLoginStore()
const {
  patientName,
  patientAccount,
  patientRow,
  examsForRegister,
  prescriptionsForRegister,
} = useDoctorContext()

const regId = computed(() => Number(route.query.id || 0))
const reg = computed(() => list.value.find(r => r.register_id === regId.value))

const symptom = ref('')
const diagnosis = ref('')

const medKeyword = ref('')
const examKeyword = ref('')

interface SelectedMed {
  medicine_id: number
  quantity: number
  usage: string
  dosage: string
  days: number
}

const selectedMeds = ref<SelectedMed[]>([])
const selectedExamIds = ref<number[]>([])
const examPurpose = ref('')

const showZy = ref(false)
const zyDiag = ref('')
const zyDays = ref(3)

watchEffect(() => {
  if (reg.value) {
    symptom.value = reg.value.symptom_desc || ''
    diagnosis.value = reg.value.diagnosis || ''
  }
})

const availableMeds = computed(() => {
  const q = medKeyword.value.trim().toLowerCase()
  return medicines.value.filter((m) => {
    if (m.status !== 1)
      return false
    if (!q)
      return true
    return m.name.toLowerCase().includes(q) || m.medicine_no.toLowerCase().includes(q)
  })
})

const availableExams = computed(() => {
  const q = examKeyword.value.trim().toLowerCase()
  return examItems.value.filter((e) => {
    if (e.status !== 1)
      return false
    if (!q)
      return true
    return e.item_name.toLowerCase().includes(q) || e.item_no.toLowerCase().includes(q)
  })
})

const medTotal = computed(() =>
  selectedMeds.value.reduce((sum, line) => {
    const med = medicines.value.find(m => m.medicine_id === line.medicine_id)
    return sum + (med?.price ?? 0) * line.quantity
  }, 0),
)

const examTotal = computed(() =>
  selectedExamIds.value.reduce((sum, id) => {
    const item = examItems.value.find(e => e.item_id === id)
    return sum + (item?.price ?? 0)
  }, 0),
)

function addMed(medicineId: number) {
  if (selectedMeds.value.some(m => m.medicine_id === medicineId))
    return
  const med = medicines.value.find(m => m.medicine_id === medicineId)
  selectedMeds.value.push({
    medicine_id: medicineId,
    quantity: 1,
    usage: '口服',
    dosage: med?.usage_dosage?.split('，')[0] ?? '遵医嘱',
    days: 3,
  })
}

function removeMed(medicineId: number) {
  selectedMeds.value = selectedMeds.value.filter(m => m.medicine_id !== medicineId)
}

function addExam(itemId: number) {
  if (!selectedExamIds.value.includes(itemId))
    selectedExamIds.value.push(itemId)
}

function removeExam(itemId: number) {
  selectedExamIds.value = selectedExamIds.value.filter(id => id !== itemId)
}

function persistChart() {
  if (!reg.value)
    return
  updateRegistration(reg.value.register_id, {
    symptom_desc: symptom.value,
    diagnosis: diagnosis.value,
  })
}

async function savePrescription() {
  if (!reg.value || !currentProfile.value)
    return
  persistChart()
  const details: Omit<PrescriptionDetail, 'detail_id' | 'amount'>[] = []
  for (const line of selectedMeds.value) {
    const med = medicines.value.find(m => m.medicine_id === line.medicine_id)
    details.push({
      medicine_id: line.medicine_id,
      quantity: line.quantity,
      unit_price: med?.price ?? 0,
      usage: line.usage,
      dosage: line.dosage,
      days: line.days,
    })
  }
  if (!details.length) {
    message.warning('请从左侧药品列表添加至少一种药品')
    return
  }
  const res = createPrescription({
    register_id: reg.value.register_id,
    doctor_id: currentProfile.value.id as number,
    patient_id: reg.value.patient_id,
    details,
  })
  if (!res.ok) {
    message.error(res.message || '处方保存失败')
    return
  }
  message.success(`处方已保存，单号 ${res.prescription.prescription_no}，共计 ${res.prescription.total_amount} 元`)
  selectedMeds.value = []
}

function submitExams() {
  if (!reg.value || !currentProfile.value)
    return
  persistChart()
  if (!selectedExamIds.value.length) {
    message.warning('请从左侧检查项目列表添加至少一项')
    return
  }
  for (const item_id of selectedExamIds.value) {
    createApplication({
      register_id: reg.value.register_id,
      doctor_id: currentProfile.value.id as number,
      patient_id: reg.value.patient_id,
      item_id,
      purpose: examPurpose.value,
    })
  }
  message.success('检查申请已生成，患者端可缴费后检查')
  selectedExamIds.value = []
  examPurpose.value = ''
}

function saveDiagnosisOnly() {
  if (!reg.value)
    return
  if (!diagnosis.value.trim()) {
    message.warning('请填写诊断意见')
    return
  }
  persistChart()
  message.success('诊断意见已保存')
}

function finishVisit() {
  if (!reg.value)
    return
  if (!diagnosis.value.trim()) {
    message.warning('完成接诊前请填写诊断结果')
    return
  }
  updateRegistration(reg.value.register_id, {
    symptom_desc: symptom.value,
    diagnosis: diagnosis.value,
    status: 1,
    visiting: false,
    visit_end_time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
  })
  message.success('接诊完成，已更新病历')
  router.replace('/doctor/processed')
}

function doHospital() {
  if (!reg.value || !currentProfile.value)
    return
  const r = applyHospital({
    register_id: reg.value.register_id,
    patient_id: reg.value.patient_id,
    doctor_id: currentProfile.value.id as number,
    diagnosis: zyDiag.value || diagnosis.value,
    expected_days: zyDays.value,
  })
  if (!r.ok) {
    message.error(r.message)
    return
  }
  message.success(r.message)
  showZy.value = false
}
</script>

<template>
  <div v-if="reg">
    <n-page-header title="处理挂号" @back="router.replace('/doctor/queue')">
      <template #subtitle>
        挂号单号 {{ reg.register_no }}
      </template>
      <template #extra>
        <n-space>
          <n-button type="primary" @click="saveDiagnosisOnly">
            诊断意见
          </n-button>
          <n-button type="success" @click="finishVisit">
            提交
          </n-button>
        </n-space>
      </template>
    </n-page-header>

    <n-card class="mt-4" title="患者与挂号信息" size="small">
      <n-descriptions :column="3" label-placement="left" bordered size="small">
        <n-descriptions-item label="挂号单号">
          {{ reg.register_no }}
        </n-descriptions-item>
        <n-descriptions-item label="患者账号">
          {{ patientAccount(reg.patient_id) }}
        </n-descriptions-item>
        <n-descriptions-item label="患者姓名">
          {{ patientName(reg.patient_id) }}
        </n-descriptions-item>
        <n-descriptions-item label="性别">
          {{ patientRow(reg.patient_id)?.gender === 1 ? '男' : '女' }}
        </n-descriptions-item>
        <n-descriptions-item label="联系方式">
          {{ patientRow(reg.patient_id)?.phone ?? '-' }}
        </n-descriptions-item>
        <n-descriptions-item label="医生姓名">
          {{ currentProfile?.displayName }}
        </n-descriptions-item>
      </n-descriptions>
    </n-card>

    <n-card class="mt-4" title="主诉与诊断">
      <n-form label-placement="top">
        <n-form-item label="症状描述 / 主诉">
          <n-input v-model:value="symptom" type="textarea" :rows="3" placeholder="录入患者主诉与临床症状信息" @blur="persistChart" />
        </n-form-item>
        <n-form-item label="诊断结果 / 诊断意见">
          <n-input v-model:value="diagnosis" type="textarea" :rows="2" placeholder="填写初步或最终诊断" @blur="persistChart" />
        </n-form-item>
      </n-form>
    </n-card>

    <n-card v-if="prescriptionsForRegister(reg.register_id).length || examsForRegister(reg.register_id).length" class="mt-4" title="本次挂号已有记录">
      <n-space vertical>
        <div v-for="p in prescriptionsForRegister(reg.register_id)" :key="p.prescription_id">
          <n-tag type="info" size="small">
            处方 {{ p.prescription_no }}
          </n-tag>
          <span class="ml-2 text-sm text-slate-600">金额 ¥{{ p.total_amount }}</span>
        </div>
        <div v-for="e in examsForRegister(reg.register_id)" :key="e.application_id">
          <n-tag type="warning" size="small">
            检查 {{ e.application_no }}
          </n-tag>
          <span v-if="e.check_result" class="ml-2 text-sm text-slate-600">{{ e.check_result }}</span>
        </div>
      </n-space>
    </n-card>

    <n-card class="mt-4" title="药品处方">
      <n-grid :cols="2" :x-gap="16">
        <n-gi>
          <n-input v-model:value="medKeyword" clearable placeholder="请输入名称查询" class="mb-2">
            <template #prefix>
              <span class="icon-[icon-park-outline--search]" />
            </template>
          </n-input>
          <n-table :single-line="false" size="small">
            <thead>
              <tr>
                <th>编号</th>
                <th>名称</th>
                <th>库存</th>
                <th>单价</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in availableMeds" :key="m.medicine_id">
                <td>{{ m.medicine_no }}</td>
                <td>{{ m.name }}</td>
                <td>{{ m.stock }}{{ m.unit }}</td>
                <td>¥{{ m.price }}</td>
                <td>
                  <n-button size="tiny" type="primary" :disabled="selectedMeds.some(s => s.medicine_id === m.medicine_id)" @click="addMed(m.medicine_id)">
                    增加
                  </n-button>
                </td>
              </tr>
            </tbody>
          </n-table>
        </n-gi>
        <n-gi>
          <div class="mb-2 font-medium text-slate-700">
            已选药品
          </div>
          <n-table :single-line="false" size="small">
            <thead>
              <tr>
                <th>名称</th>
                <th>数量</th>
                <th>小计</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="line in selectedMeds" :key="line.medicine_id">
                <td>{{ medicines.find(m => m.medicine_id === line.medicine_id)?.name }}</td>
                <td style="width: 90px">
                  <n-input-number v-model:value="line.quantity" :min="1" size="small" />
                </td>
                <td>
                  ¥{{ ((medicines.find(m => m.medicine_id === line.medicine_id)?.price ?? 0) * line.quantity).toFixed(2) }}
                </td>
                <td>
                  <n-button size="tiny" type="error" @click="removeMed(line.medicine_id)">
                    移除
                  </n-button>
                </td>
              </tr>
            </tbody>
          </n-table>
          <div class="mt-2 text-right text-teal-700 font-medium">
            共计：¥{{ medTotal.toFixed(2) }}
          </div>
          <n-button class="mt-3" type="primary" @click="savePrescription">
            保存处方
          </n-button>
        </n-gi>
      </n-grid>
    </n-card>

    <n-card class="mt-4" title="申请检查">
      <n-grid :cols="2" :x-gap="16">
        <n-gi>
          <n-input v-model:value="examKeyword" clearable placeholder="请输入名称查询" class="mb-2" />
          <n-table :single-line="false" size="small">
            <thead>
              <tr>
                <th>编号</th>
                <th>项目</th>
                <th>价格</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="e in availableExams" :key="e.item_id">
                <td>{{ e.item_no }}</td>
                <td>{{ e.item_name }}</td>
                <td>¥{{ e.price }}</td>
                <td>
                  <n-button size="tiny" type="primary" :disabled="selectedExamIds.includes(e.item_id)" @click="addExam(e.item_id)">
                    增加
                  </n-button>
                </td>
              </tr>
            </tbody>
          </n-table>
        </n-gi>
        <n-gi>
          <div class="mb-2 font-medium text-slate-700">
            已选检查
          </div>
          <n-table :single-line="false" size="small">
            <thead>
              <tr>
                <th>项目</th>
                <th>价格</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="id in selectedExamIds" :key="id">
                <td>{{ examItems.find(e => e.item_id === id)?.item_name }}</td>
                <td>¥{{ examItems.find(e => e.item_id === id)?.price }}</td>
                <td>
                  <n-button size="tiny" type="error" @click="removeExam(id)">
                    移除
                  </n-button>
                </td>
              </tr>
            </tbody>
          </n-table>
          <div class="mt-2 text-right text-teal-700 font-medium">
            共计：¥{{ examTotal.toFixed(2) }}
          </div>
          <n-form-item class="mt-3" label="检查目的">
            <n-input v-model:value="examPurpose" type="textarea" :rows="2" />
          </n-form-item>
          <n-button type="primary" @click="submitExams">
            提交检查申请
          </n-button>
        </n-gi>
      </n-grid>
    </n-card>

    <n-card class="mt-4" title="住院申请">
      <n-space>
        <n-button type="warning" @click="showZy = true">
          申请当天入院
        </n-button>
        <n-button @click="router.push('/doctor/hospitalization')">
          住院申请管理
        </n-button>
      </n-space>
    </n-card>

    <n-modal v-model:show="showZy" preset="dialog" title="申请当天入院">
      <n-form label-placement="top">
        <n-form-item label="入院诊断">
          <n-input v-model:value="zyDiag" type="textarea" :rows="2" :placeholder="diagnosis || '填写入院诊断'" />
        </n-form-item>
        <n-form-item label="预计住院天数">
          <n-input-number v-model:value="zyDays" :min="1" :max="60" />
        </n-form-item>
      </n-form>
      <template #action>
        <n-button @click="showZy = false">
          取消
        </n-button>
        <n-button type="primary" @click="doHospital">
          提交
        </n-button>
      </template>
    </n-modal>
  </div>
  <n-result v-else status="404" title="未找到挂号记录" description="请从今日挂号列表进入" />
</template>
