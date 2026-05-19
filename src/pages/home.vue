<script lang="ts" setup>
import type { MenuOption } from 'naive-ui'
import { RouterLink } from 'vue-router'
import { useLoginStore } from '~/store'

function renderIcon(icon: string) {
  return () => h('span', { class: icon })
}

const router = useRouter()
const { logout, currentProfile, isLogin } = useLoginStore()

/** 与论文图 5.10–5.13 患者端侧栏一致，并含导出报告单、评价医生 */
const menuOptions: MenuOption[] = [
  { label: () => h(RouterLink, { to: '/home' }, '首页'), key: 'home', icon: renderIcon('icon-[icon-park-outline--home-two]') },
  { label: () => h(RouterLink, { to: '/home/book' }, '预约挂号'), key: 'book', icon: renderIcon('icon-[icon-park-outline--calendar]') },
  { label: () => h(RouterLink, { to: '/home/my-registers' }, '我的挂号'), key: 'my-reg', icon: renderIcon('icon-[icon-park-outline--order]') },
  { label: () => h(RouterLink, { to: '/home/hospital' }, '住院信息'), key: 'hospital', icon: renderIcon('icon-[icon-park-outline--hospital-bed]') },
  { label: () => h(RouterLink, { to: '/home/profile' }, '个人信息'), key: 'profile', icon: renderIcon('icon-[icon-park-outline--user]') },
  { label: () => h(RouterLink, { to: '/home/reports' }, '导出报告单'), key: 'reports', icon: renderIcon('icon-[icon-park-outline--file-pdf]') },
  { label: () => h(RouterLink, { to: '/home/review' }, '评价医生'), key: 'review', icon: renderIcon('icon-[icon-park-outline--star]') },
]

function handelLogout() {
  logout()
  router.push('/login')
}
</script>

<template>
  <n-layout has-sider class="min-h-screen bg-slate-100">
    <n-layout-sider bordered collapse-mode="width" :collapsed-width="64" :width="200" class="!bg-white">
      <div class="px-4 py-5 text-lg font-bold text-teal-700">
        医院管理系统
      </div>
      <n-menu
        :options="menuOptions"
        :collapsed-width="64"
        :collapsed-icon-size="22"
      />
    </n-layout-sider>
    <n-layout>
      <header class="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
        <span class="text-slate-500">患者端</span>
        <div class="flex items-center gap-3">
          <template v-if="isLogin">
            <span class="text-slate-600">欢迎您，{{ currentProfile?.displayName }}</span>
            <n-popconfirm @positive-click="handelLogout">
              <template #trigger>
                <n-button type="error" size="small">
                  退出登录
                </n-button>
              </template>
              确认退出？
            </n-popconfirm>
          </template>
          <n-button v-else type="primary" size="small" @click="router.push('/login')">
            登录
          </n-button>
        </div>
      </header>
      <div class="p-6">
        <RouterView />
      </div>
    </n-layout>
  </n-layout>
</template>
