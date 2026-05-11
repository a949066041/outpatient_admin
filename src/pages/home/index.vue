<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useLoginStore, useRegistrationStore } from '~/store'

const router = useRouter()
const { list } = useRegistrationStore()
const { currentProfile } = useLoginStore()

const mine = computed(() =>
  list.value.filter(r => r.patient_id === currentProfile.value?.id && r.status !== 2),
)

const pending = computed(() => mine.value.filter(r => r.status === 0))
const unpaid = computed(() => mine.value.filter(r => r.is_paid === 0 && r.status === 0))
</script>

<template>
  <div>
    <n-h2 prefix="bar">
      首页
    </n-h2>
    <p class="mb-6 text-slate-600">
      欢迎使用门诊管理系统患者端。您可进行<strong>预约挂号</strong>、在<strong>我的挂号</strong>中查看订单并<strong>在线缴纳挂号费、药费、检查费</strong>，就诊后查看<strong>电子病历</strong>、<strong>导出报告单</strong>，查询<strong>住院信息</strong>并<strong>评价医生</strong>（与论文「患者模块」描述一致）。
    </p>
    <n-grid :cols="3" :x-gap="16" :y-gap="16" responsive="screen">
      <n-gi>
        <n-card title="待就诊预约" embedded>
          <div class="text-3xl font-semibold text-teal-600">
            {{ pending.length }}
          </div>
          <n-button class="mt-3" text type="primary" @click="router.push('/home/my-registers')">
            查看我的挂号
          </n-button>
        </n-card>
      </n-gi>
      <n-gi>
        <n-card title="待缴挂号费" embedded>
          <div class="text-3xl font-semibold text-amber-600">
            {{ unpaid.length }}
          </div>
          <n-button class="mt-3" text type="primary" @click="router.push('/home/my-registers')">
            去支付
          </n-button>
        </n-card>
      </n-gi>
      <n-gi>
        <n-card title="快捷入口" embedded>
          <n-space vertical>
            <n-button block secondary @click="router.push('/home/book')">
              预约挂号
            </n-button>
            <n-button block quaternary @click="router.push('/home/reports')">
              导出报告单
            </n-button>
          </n-space>
        </n-card>
      </n-gi>
    </n-grid>
  </div>
</template>
