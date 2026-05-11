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
    label: '医生管理',
    key: 'doctor',
    icon: renderIcon('icon-[icon-park-outline--stethoscope]'),
    children: [
      { label: () => h(RouterLink, { to: '/back/doctor-list' }, '医生信息管理'), key: 'doctor-list' },
    ],
  },
  {
    label: '患者与挂号',
    key: 'patient-reg',
    icon: renderIcon('icon-[icon-park-outline--peoples]'),
    children: [
      { label: () => h(RouterLink, { to: '/back/patient-list' }, '患者管理'), key: 'patient-list' },
      { label: () => h(RouterLink, { to: '/back/registration-list' }, '挂号管理'), key: 'registration-list' },
    ],
  },
  {
    label: '药品与检查',
    key: 'med-exam',
    icon: renderIcon('icon-[icon-park-outline--experiment]'),
    children: [
      { label: () => h(RouterLink, { to: '/back/medicine-list' }, '药物管理'), key: 'medicine-list' },
      { label: () => h(RouterLink, { to: '/back/exam-item-list' }, '检查项目管理'), key: 'exam-item-list' },
      { label: () => h(RouterLink, { to: '/back/exam-apply-list' }, '检查申请执行'), key: 'exam-apply-list' },
    ],
  },
  {
    label: '病床与排班',
    key: 'bed-sch',
    icon: renderIcon('icon-[icon-park-outline--building-four]'),
    children: [
      { label: () => h(RouterLink, { to: '/back/bed-list' }, '病床管理'), key: 'bed-list' },
      { label: () => h(RouterLink, { to: '/back/department-list' }, '科室管理'), key: 'department-list' },
      { label: () => h(RouterLink, { to: '/back/schedule-manage' }, '排班信息管理'), key: 'schedule-manage' },
    ],
  },
  {
    label: '运营分析',
    key: 'stats',
    icon: renderIcon('icon-[icon-park-outline--chart-line]'),
    children: [
      { label: () => h(RouterLink, { to: '/back/stats' }, '数据统计'), key: 'stats-page' },
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
          门诊管理后台
        </div>
        <div class="mt-1 text-xs leading-snug text-slate-500">
          （三）管理员模块：人员与基础数据、业务办理、排班与资源、统计分析
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
