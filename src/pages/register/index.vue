<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { AUTH_PAGE_BG_URL } from '~/constants/auth-page-bg'
import { usePatientStore } from '~/store'
import { nextNumericId } from '~/utils/outpatient'

const router = useRouter()
const message = useMessage()
const { dataList, addData } = usePatientStore()

const form = reactive({
  username: '',
  password: '',
  real_name: '',
  gender: 1 as 0 | 1,
  age: 18,
  id_card: '',
  phone: '',
  address: '',
  email: '',
  medical_history: '',
})

const loading = ref(false)

function submit() {
  if (!form.username.trim() || !form.password) {
    message.warning('请填写用户名和密码')
    return
  }
  if (dataList.value.some(p => p.username === form.username.trim())) {
    message.error('用户名已存在')
    return
  }
  loading.value = true
  setTimeout(() => {
    loading.value = false
    addData({
      patient_id: nextNumericId(dataList.value, 'patient_id'),
      username: form.username.trim(),
      password: form.password,
      real_name: form.real_name || form.username.trim(),
      gender: form.gender,
      age: Number(form.age) || 18,
      id_card: form.id_card || '-',
      phone: form.phone || '-',
      address: form.address || '-',
      email: form.email || '-',
      medical_history: form.medical_history || '无',
      status: 1,
    })
    message.success('注册成功，请使用患者身份登录')
    router.replace('/login')
  }, 200)
}
</script>

<template>
  <div
    class="relative flex min-h-screen items-center justify-end overflow-y-auto bg-slate-800 bg-cover bg-center bg-no-repeat px-4 py-10 sm:px-8 md:pr-16 lg:pr-24"
    :style="{ backgroundImage: `url(${AUTH_PAGE_BG_URL})` }"
  >
    <div class="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/45 via-black/20 to-transparent" />

    <div
      class="relative z-10 my-auto w-full max-w-lg max-h-[min(100vh-2rem,900px)] overflow-y-auto rounded-2xl border border-white/50 bg-white/80 p-8 shadow-2xl backdrop-blur-md sm:p-10"
    >
      <h1 class="mb-2 text-center text-xl font-semibold text-slate-800">
        患者注册
      </h1>
      <p class="mb-6 text-center text-sm text-slate-600">
        填写用户名、密码、真实姓名、性别、年龄、身份证号、联系电话、家庭住址等信息
      </p>
      <n-form label-placement="left" label-width="96">
        <n-form-item label="用户名">
          <n-input v-model:value="form.username" placeholder="登录用户名">
            <template #prefix>
              <span class="icon-[icon-park-outline--user] text-lg text-slate-400" />
            </template>
          </n-input>
        </n-form-item>
        <n-form-item label="密码">
          <n-input v-model:value="form.password" type="password" show-password-on="click">
            <template #prefix>
              <span class="icon-[icon-park-outline--lock] text-lg text-slate-400" />
            </template>
          </n-input>
        </n-form-item>
        <n-form-item label="真实姓名">
          <n-input v-model:value="form.real_name" />
        </n-form-item>
        <n-form-item label="性别">
          <n-radio-group v-model:value="form.gender">
            <n-radio :value="0">
              女
            </n-radio>
            <n-radio :value="1">
              男
            </n-radio>
          </n-radio-group>
        </n-form-item>
        <n-form-item label="年龄">
          <n-input-number v-model:value="form.age" class="w-full" :min="1" :max="120" />
        </n-form-item>
        <n-form-item label="身份证号">
          <n-input v-model:value="form.id_card" />
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
          <n-input v-model:value="form.medical_history" type="textarea" :rows="2" />
        </n-form-item>
        <n-space justify="space-between" class="mt-4">
          <n-button size="large" @click="router.push('/login')">
            返回登录
          </n-button>
          <n-button type="primary" size="large" :loading="loading" @click="submit">
            提交注册
          </n-button>
        </n-space>
      </n-form>
    </div>
  </div>
</template>
