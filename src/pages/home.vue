<script lang="ts" setup>
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useLoginStore } from '~/store'

const route = useRoute()
const router = useRouter()
const { logout, currentProfile, isLogin } = useLoginStore()

/** 与论文用例图一致：首页、预约挂号、我的挂号、报告、住院、个人信息、评价 */
const pageList = [
  { name: '首页', path: '/home' },
  { name: '预约挂号', path: '/home/book' },
  { name: '我的挂号', path: '/home/my-registers' },
  { name: '导出报告单', path: '/home/reports' },
  { name: '住院信息', path: '/home/hospital' },
  { name: '个人信息', path: '/home/profile' },
  { name: '评价医生', path: '/home/review' },
]

const activePath = computed(() => route.path)

function handelLogout() {
  logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <div class="border-b border-slate-200 bg-white shadow-sm">
      <div class="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-4 py-3">
        <ul class="flex flex-wrap items-center gap-5">
          <span class="text-lg font-bold text-teal-700">门诊管理系统 · 患者端</span>
          <li v-for="item of pageList" :key="item.path">
            <RouterLink
              class="text-base text-slate-600 transition hover:text-teal-700"
              :class="{ '!font-semibold !text-teal-700': activePath === item.path }"
              :to="item.path"
            >
              {{ item.name }}
            </RouterLink>
          </li>
        </ul>
        <div class="flex items-center gap-3">
          <template v-if="isLogin">
            <n-text depth="2">
              欢迎您，{{ currentProfile?.displayName }}（{{ currentProfile?.username }}）
            </n-text>
            <n-button quaternary type="error" @click="handelLogout">
              退出登录
            </n-button>
          </template>
          <n-button v-else type="primary" @click="$router.push('/login')">
            登录
          </n-button>
        </div>
      </div>
    </div>

    <div class="mx-auto max-w-[1200px] min-h-[calc(100vh-80px)] px-4 py-6">
      <RouterView />
    </div>
  </div>
</template>
