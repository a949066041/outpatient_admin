<script lang="ts" setup>
import type { MenuOption } from 'naive-ui'
import { RouterLink } from 'vue-router'
import { useLoginStore } from '~/store'

function renderIcon(icon: string) {
  return () => h('span', { class: icon })
}

const { currentProfile, logout } = useLoginStore()
const router = useRouter()

const menuOptions: MenuOption[] = [
  { label: () => h(RouterLink, { to: '/doctor' }, '首页'), key: 'doc-home', icon: renderIcon('icon-[icon-park-outline--home-two]') },
  { label: () => h(RouterLink, { to: '/doctor/queue' }, '今日挂号列表'), key: 'queue', icon: renderIcon('icon-[icon-park-outline--list]') },
  { label: () => h(RouterLink, { to: '/doctor/processed' }, '历史挂号列表'), key: 'processed', icon: renderIcon('icon-[icon-park-outline--folder-success]') },
  { label: () => h(RouterLink, { to: '/doctor/hospitalization' }, '住院申请管理'), key: 'hospital', icon: renderIcon('icon-[icon-park-outline--hospital-bed]') },
  { label: () => h(RouterLink, { to: '/doctor/profile' }, '个人信息查询'), key: 'profile', icon: renderIcon('icon-[icon-park-outline--user]') },
]

function handelLogout() {
  logout()
  router.push('/login')
}
</script>

<template>
  <n-layout has-sider class="min-h-screen">
    <n-layout-sider bordered collapse-mode="width" :collapsed-width="64" :width="220">
      <div class="px-4 py-5 text-lg font-bold text-teal-700">
        医院管理系统
      </div>
      <p class="px-4 -mt-3 mb-2 text-xs text-slate-500">
        医生工作站
      </p>
      <n-menu :options="menuOptions" :collapsed-width="64" :collapsed-icon-size="22" />
    </n-layout-sider>
    <n-layout>
      <div class="flex flex-col overflow-auto px-4 py-2">
        <header class="flex justify-between border-b border-slate-100 pb-2">
          <span class="text-slate-600">欢迎您，{{ currentProfile?.displayName }} 医生（工号 {{ currentProfile?.username }}）</span>
          <n-popconfirm @positive-click="handelLogout">
            <template #trigger>
              <n-button quaternary>
                退出
              </n-button>
            </template>
            确认退出？
          </n-popconfirm>
        </header>
        <div class="flex-1 py-4">
          <RouterView />
        </div>
      </div>
    </n-layout>
  </n-layout>
</template>
