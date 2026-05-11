<script setup lang="ts">
import dayjs from 'dayjs'
import { RouterLink } from 'vue-router'
import { useDepartmentStore, usePatientStore, useRegistrationStore } from '~/store'

const { list: registrations } = useRegistrationStore()
const { dataList: departments } = useDepartmentStore()
const { dataList: patients } = usePatientStore()

const today = dayjs().format('YYYY-MM-DD')

const todayRegs = computed(() =>
  registrations.value.filter(r => r.register_date === today && r.status !== 2),
)

const stats = computed(() => ({
  departments: departments.value.filter(d => d.status === 1).length,
  patients: patients.value.length,
  todayAppointments: todayRegs.value.length,
  pendingPay: registrations.value.filter(r => r.status === 0 && r.is_paid === 0).length,
}))
</script>

<template>
  <div>
    <h2 class="mb-2 text-xl font-semibold text-slate-800">
      管理员工作台
    </h2>
    <p class="mb-6 max-w-4xl text-sm text-slate-600">
      本后台对应论文<strong>（三）管理员模块</strong>：涵盖医生与科室等基础信息维护、患者与挂号业务、药品与检查项目、病床资源，以及<strong>排班信息管理</strong>（按日期—科室—医生维护出诊时段与号源，并支持查询与停诊处理）与运营数据统计。
    </p>
    <n-card title="常用入口" size="small" class="mb-6" embedded>
      <n-space wrap>
        <RouterLink v-slot="{ navigate }" to="/back/schedule-manage" custom>
          <n-button type="primary" secondary @click="navigate">
            排班信息管理
          </n-button>
        </RouterLink>
        <RouterLink v-slot="{ navigate }" to="/back/department-list" custom>
          <n-button secondary @click="navigate">
            科室管理
          </n-button>
        </RouterLink>
        <RouterLink v-slot="{ navigate }" to="/back/doctor-list" custom>
          <n-button secondary @click="navigate">
            医生信息管理
          </n-button>
        </RouterLink>
        <RouterLink v-slot="{ navigate }" to="/back/registration-list" custom>
          <n-button secondary @click="navigate">
            挂号管理
          </n-button>
        </RouterLink>
        <RouterLink v-slot="{ navigate }" to="/back/stats" custom>
          <n-button secondary @click="navigate">
            数据统计
          </n-button>
        </RouterLink>
      </n-space>
    </n-card>
    <n-grid :cols="4" :x-gap="16" :y-gap="16" responsive="screen">
      <n-gi>
        <n-card title="启用科室">
          <div class="text-3xl font-bold text-teal-600">
            {{ stats.departments }}
          </div>
        </n-card>
      </n-gi>
      <n-gi>
        <n-card title="患者档案数">
          <div class="text-3xl font-bold text-teal-600">
            {{ stats.patients }}
          </div>
        </n-card>
      </n-gi>
      <n-gi>
        <n-card title="今日预约量">
          <div class="text-3xl font-bold text-teal-600">
            {{ stats.todayAppointments }}
          </div>
        </n-card>
      </n-gi>
      <n-gi>
        <n-card title="待缴挂号费">
          <div class="text-3xl font-bold text-amber-600">
            {{ stats.pendingPay }}
          </div>
        </n-card>
      </n-gi>
    </n-grid>
    <n-card class="mt-6" title="今日挂号动态">
      <n-empty v-if="!todayRegs.length" description="今日暂无挂号记录" />
      <n-list v-else bordered>
        <n-list-item v-for="r in todayRegs" :key="r.register_id">
          <div class="flex flex-wrap gap-2 text-sm">
            <n-tag>{{ r.register_no }}</n-tag>
            <span>时段 {{ r.time_slot }}</span>
            <n-tag :type="r.is_paid ? 'success' : 'warning'">
              {{ r.is_paid ? '已缴费' : '未缴费' }}
            </n-tag>
            <n-tag :type="r.status === 1 ? 'info' : 'default'">
              {{ r.status === 0 ? '待就诊' : r.status === 1 ? '已就诊' : '已取消' }}
            </n-tag>
          </div>
        </n-list-item>
      </n-list>
    </n-card>
  </div>
</template>
