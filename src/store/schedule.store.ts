import type { Schedule } from '~/types/outpatient'
import { createGlobalState } from '@vueuse/core'
import { buildScheduleSeed } from '~/data/admin-mock'
import { useCurd } from '~/hooks'

export const useScheduleStore = createGlobalState(() => {
  return useCurd<Schedule>({ key: 'outpatient-schedule-list-v4', initData: buildScheduleSeed() })
})
