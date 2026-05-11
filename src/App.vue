<script setup lang="ts">
import type { GlobalThemeOverrides } from 'naive-ui'
import { dateZhCN, zhCN } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import { useLoginStore } from './store'

const theme: GlobalThemeOverrides = {
  common: {
    primaryColor: '#0d9488',
    primaryColorHover: '#0f766e',
    primaryColorPressed: '#115e59',
    primaryColorSuppl: '#14b8a6',
  },
}

const route = useRoute()
const router = useRouter()
const { currentRole } = useLoginStore()

const currentCheck = computed(() => `/${route.path.split('/')[1]}`)

function onSwitchEnd(path: string) {
  if (path !== currentCheck.value)
    router.push(path)
}

const pageList = [
  { path: '/home', name: '患者端' },
  { path: '/back', name: '管理端' },
]
</script>

<template>
  <n-config-provider :theme-overrides="theme" :locale="zhCN" :date-locale="dateZhCN">
    <n-message-provider>
      <n-dialog-provider>
        <n-radio-group
          v-if="currentRole === '管理员'"
          :value="currentCheck"
          class="fixed right-4 top-4 z-20"
          size="small"
          @update:value="onSwitchEnd"
        >
          <!-- <n-radio-button
            v-for="item of pageList"
            :key="item.path"
            :value="item.path"
            :label="item.name"
          /> -->
        </n-radio-group>
        <router-view />
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>
