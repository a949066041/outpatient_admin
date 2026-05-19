<script setup lang="ts">
import { useLoginStore, usePatientStore } from '~/store'

const message = useMessage()
const { dataList, updateData } = usePatientStore()
const { currentProfile } = useLoginStore()

const idx = computed(() =>
  dataList.value.findIndex(p => p.patient_id === currentProfile.value?.id),
)

const patient = computed(() => (idx.value >= 0 ? dataList.value[idx.value]! : null))

const form = reactive({
  real_name: '',
  phone: '',
  address: '',
  email: '',
  medical_history: '',
})

watchEffect(() => {
  const p = patient.value
  if (p) {
    form.real_name = p.real_name
    form.phone = p.phone
    form.address = p.address
    form.email = p.email
    form.medical_history = p.medical_history
  }
})

function save() {
  if (idx.value < 0)
    return
  const p = dataList.value[idx.value]!
  updateData(idx.value, {
    ...p,
    real_name: form.real_name,
    phone: form.phone,
    address: form.address,
    email: form.email,
    medical_history: form.medical_history,
  })
  message.success('资料已保存')
}
</script>

<template>
  <div>
    <h2 class="mb-4 text-xl font-semibold text-slate-800">
      个人信息
    </h2>
    <n-card v-if="patient" title="个人档案">
      <n-descriptions bordered :column="2" label-placement="left" class="mb-6">
        <n-descriptions-item label="用户名">
          {{ patient.username }}
        </n-descriptions-item>
        <n-descriptions-item label="患者ID">
          {{ patient.patient_id }}
        </n-descriptions-item>
        <n-descriptions-item label="身份证号">
          {{ patient.id_card }}
        </n-descriptions-item>
        <n-descriptions-item label="性别">
          {{ patient.gender === 1 ? '男' : '女' }}
        </n-descriptions-item>
        <n-descriptions-item label="年龄">
          {{ patient.age }}
        </n-descriptions-item>
        <n-descriptions-item label="账号状态">
          <n-tag :type="patient.status === 1 ? 'success' : 'default'" size="small">
            {{ patient.status === 1 ? '正常' : '禁用' }}
          </n-tag>
        </n-descriptions-item>
      </n-descriptions>

      <n-form label-placement="left" label-width="96" class="max-w-xl">
        <n-form-item label="真实姓名">
          <n-input v-model:value="form.real_name" />
        </n-form-item>
        <n-form-item label="联系电话">
          <n-input v-model:value="form.phone" />
        </n-form-item>
        <n-form-item label="家庭住址">
          <n-input v-model:value="form.address" />
        </n-form-item>
        <n-form-item label="邮箱">
          <n-input v-model:value="form.email" />
        </n-form-item>
        <n-form-item label="既往病史">
          <n-input v-model:value="form.medical_history" type="textarea" :rows="3" />
        </n-form-item>
        <n-button type="primary" @click="save">
          保存
        </n-button>
      </n-form>
    </n-card>
    <n-empty v-else description="未找到患者档案" />
  </div>
</template>
