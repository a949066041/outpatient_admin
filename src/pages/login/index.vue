<script setup lang="ts">
import type { RoleType } from '~/types/outpatient'
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AUTH_PAGE_BG_URL } from '~/constants/auth-page-bg'
import { useLoginStore } from '~/store'

const router = useRouter()
const route = useRoute()
const message = useMessage()
const { login } = useLoginStore()

const form = reactive({
  role: '患者' as RoleType,
  account: '',
  password: '',
})
const loading = ref(false)

const accountPlaceholder = computed(() => {
  if (form.role === '医生')
    return '医生工号'
  if (form.role === '管理员')
    return '管理员用户名'
  return '患者用户名'
})

function handleLogin() {
  const a = form.account.trim()
  const p = form.password
  if (!a || !p) {
    message.warning('请输入账号和密码')
    return
  }
  loading.value = true
  setTimeout(() => {
    loading.value = false
    const res = login(form.role, a, p)
    if (!res.ok) {
      message.error(res.message || '用户名或密码错误')
      return
    }
    message.success('登录成功')
    const redirect = route.query.redirect as string | undefined
    if (redirect) {
      router.replace(redirect)
      return
    }
    if (form.role === '管理员')
      router.replace('/back')
    else if (form.role === '医生')
      router.replace('/doctor')
    else
      router.replace('/home')
  }, 200)
}
</script>

<template>
  <div
    class="relative flex min-h-screen items-center justify-end bg-slate-800 bg-cover bg-center bg-no-repeat px-4 py-10 sm:px-8 md:pr-16 lg:pr-24"
    :style="{ backgroundImage: `url(${AUTH_PAGE_BG_URL})` }"
  >
    <!-- 轻微压暗左侧，保证右侧登录区与背景层次接近论文效果图 -->
    <div class="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/45 via-black/20 to-transparent" />

    <div
      class="login relative z-10 w-full max-w-md rounded-2xl border border-white/50 bg-white/80 p-8 shadow-2xl backdrop-blur-md sm:p-10"
    >
      <h1 class="mb-2 text-center text-2xl font-semibold text-slate-800">
        门诊管理系统
      </h1>
      <p class="mb-6 text-center text-sm text-slate-600">
        多角色身份验证（管理员 / 医生 / 患者）
      </p>
      <n-space vertical :size="14">
        <div>
          <div class="mb-1 text-sm text-slate-600">
            登录身份
          </div>
          <n-radio-group v-model:value="form.role" name="role" class="w-full">
            <n-space>
              <n-radio value="患者">
                患者
              </n-radio>
              <n-radio value="医生">
                医生
              </n-radio>
              <n-radio value="管理员">
                管理员
              </n-radio>
            </n-space>
          </n-radio-group>
        </div>
        <n-input
          v-model:value="form.account"
          size="large"
          :placeholder="accountPlaceholder"
          @keydown.enter.prevent="handleLogin"
        >
          <template #prefix>
            <span class="icon-[icon-park-outline--user] text-lg text-slate-400" />
          </template>
        </n-input>
        <n-input
          v-model:value="form.password"
          size="large"
          type="password"
          show-password-on="click"
          placeholder="密码"
          @keydown.enter.prevent="handleLogin"
        >
          <template #prefix>
            <span class="icon-[icon-park-outline--lock] text-lg text-slate-400" />
          </template>
        </n-input>
        <n-space :size="12" class="w-full">
          <n-button type="primary" class="!flex-1" size="large" :loading="loading" @click="handleLogin">
            登录
          </n-button>
          <n-button class="!flex-1" size="large" secondary @click="router.push('/register')">
            <template #icon>
              <span class="icon-[icon-park-outline--plus]" />
            </template>
            注册新账号
          </n-button>
        </n-space>
        <div class="flex justify-center text-sm">
          <n-button text type="primary" @click="router.push('/forgot-password')">
            找回密码
          </n-button>
        </div>
      </n-space>
      <p class="mt-6 text-center text-xs leading-relaxed text-slate-500">
        演示：管理员 admin001 / 123456；医生工号 1000 / 123456；患者 patient001 / 123456
      </p>
    </div>
  </div>
</template>
