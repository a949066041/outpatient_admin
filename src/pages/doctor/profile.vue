<script setup lang="ts">
import { useDoctorContext } from '~/composables/useDoctorContext'
import { useDoctorStore, useReviewStore } from '~/store'

const { currentProfile, deptName } = useDoctorContext()
const { dataList: doctors } = useDoctorStore()
const { avgScoreForDoctor } = useReviewStore()

const doctor = computed(() =>
  doctors.value.find(d => d.doctor_id === currentProfile.value?.id),
)
</script>

<template>
  <div>
    <h3 class="mb-4 text-lg font-medium text-slate-800">
      个人信息查询
    </h3>
    <n-empty v-if="!doctor" description="未找到当前医生档案" />
    <n-card v-else title="医师档案">
      <n-descriptions bordered :column="2" label-placement="left">
        <n-descriptions-item label="工号">
          {{ doctor.doctor_no }}
        </n-descriptions-item>
        <n-descriptions-item label="姓名">
          {{ doctor.name }}
        </n-descriptions-item>
        <n-descriptions-item label="性别">
          {{ doctor.gender === 1 ? '男' : '女' }}
        </n-descriptions-item>
        <n-descriptions-item label="年龄">
          {{ doctor.age }}
        </n-descriptions-item>
        <n-descriptions-item label="科室">
          {{ deptName(doctor.department_id) }}
        </n-descriptions-item>
        <n-descriptions-item label="职称">
          {{ doctor.title }}
        </n-descriptions-item>
        <n-descriptions-item label="联系电话">
          {{ doctor.phone }}
        </n-descriptions-item>
        <n-descriptions-item label="邮箱">
          {{ doctor.email }}
        </n-descriptions-item>
        <n-descriptions-item label="证件号">
          {{ doctor.id_card || '-' }}
        </n-descriptions-item>
        <n-descriptions-item label="挂号费">
          ¥{{ doctor.register_fee ?? 10 }}
        </n-descriptions-item>
        <n-descriptions-item label="患者评分">
          {{ avgScoreForDoctor(doctor.doctor_id) }} / 5
        </n-descriptions-item>
        <n-descriptions-item label="在职状态">
          <n-tag :type="doctor.status === 1 ? 'success' : 'default'" size="small">
            {{ doctor.status === 1 ? '在职' : '离职' }}
          </n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="简介" :span="2">
          {{ doctor.introduction || '暂无' }}
        </n-descriptions-item>
      </n-descriptions>
    </n-card>
  </div>
</template>
