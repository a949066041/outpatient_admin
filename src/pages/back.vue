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
  {
    label: () => h(RouterLink, { to: '/back' }, '首页'),
    key: 'back-home',
    icon: renderIcon('icon-[icon-park-outline--home]'),
  },
  {
    label: () => h(RouterLink, { to: '/back/doctor-list' }, '医生信息管理'),
    key: 'doctor-list',
    icon: renderIcon('icon-[icon-park-outline--stethoscope]'),
  },
  {
    label: () => h(RouterLink, { to: '/back/patient-list' }, '患者信息管理'),
    key: 'patient-list',
    icon: renderIcon('icon-[icon-park-outline--peoples]'),
  },
  {
    label: () => h(RouterLink, { to: '/back/registration-list' }, '挂号信息管理'),
    key: 'registration-list',
    icon: renderIcon('icon-[icon-park-outline--transaction-order]'),
  },
  {
    label: () => h(RouterLink, { to: '/back/medicine-list' }, '药物信息管理'),
    key: 'medicine-list',
    icon: renderIcon('icon-[icon-park-outline--experiment]'),
  },
  {
    label: () => h(RouterLink, { to: '/back/exam-item-list' }, '检查项目管理'),
    key: 'exam-item-list',
    icon: renderIcon('icon-[icon-park-outline--experiment]'),
  },
  {
    label: () => h(RouterLink, { to: '/back/bed-list' }, '病床信息管理'),
    key: 'bed-list',
    icon: renderIcon('icon-[icon-park-outline--building-four]'),
  },
  {
    label: () => h(RouterLink, { to: '/back/schedule-manage' }, '排班信息管理'),
    key: 'schedule-manage',
    icon: renderIcon('icon-[icon-park-outline--calendar]'),
  },
  {
    label: () => h(RouterLink, { to: '/back/stats' }, '数据统计分析'),
    key: 'stats-page',
    icon: renderIcon('icon-[icon-park-outline--chart-line]'),
  },
  {
    label: '基础维护',
    key: 'base',
    icon: renderIcon('icon-[icon-park-outline--setting]'),
    children: [
      { label: () => h(RouterLink, { to: '/back/department-list' }, '科室管理'), key: 'department-list' },
      { label: () => h(RouterLink, { to: '/back/exam-apply-list' }, '检查申请执行'), key: 'exam-apply-list' },
    ],
  },
]

function handelLogout() {
  logout()
  router.push('/login')
}
</script>

<template>
  <n-layout has-sider class="min-h-screen">
    <n-layout-sider bordered collapse-mode="width" :collapsed-width="64" :width="240">
      <div class="px-4 py-5">
        <div class="text-lg font-bold text-teal-700">
          医院管理系统
        </div>
      </div>
      <n-menu
        :collapsed-width="64"
        :collapsed-icon-size="22"
        :options="menuOptions"
      />
    </n-layout-sider>
    <n-layout>
      <div class="flex flex-col overflow-auto px-4 py-2">
        <header class="flex justify-end border-b border-slate-100 pb-2">
          <n-popconfirm @positive-click="handelLogout">
            <template #trigger>
              <n-button quaternary>
                {{ currentProfile?.displayName }}（退出）
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
