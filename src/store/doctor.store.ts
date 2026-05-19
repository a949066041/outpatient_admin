import type { Doctor } from '~/types/outpatient'
import { createGlobalState } from '@vueuse/core'
import { MOCK_DOCTORS } from '~/data/admin-mock'
import { useCurd } from '~/hooks'

export const useDoctorStore = createGlobalState(() => {
  return useCurd<Doctor>({ key: 'outpatient-doctor-list-v5', initData: MOCK_DOCTORS })
})
