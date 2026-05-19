import type { Patient } from '~/types/outpatient'
import { createGlobalState } from '@vueuse/core'
import { MOCK_PATIENTS } from '~/data/admin-mock'
import { useCurd } from '~/hooks'

export const usePatientStore = createGlobalState(() => {
  return useCurd<Patient>({ key: 'outpatient-patient-list-v2', initData: MOCK_PATIENTS })
})
