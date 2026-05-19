import type { Medicine } from '~/types/outpatient'
import { createGlobalState } from '@vueuse/core'
import { MOCK_MEDICINES } from '~/data/admin-mock'
import { useCurd } from '~/hooks'

export const useMedicineStore = createGlobalState(() => {
  return useCurd<Medicine>({ key: 'outpatient-medicine-list-v2', initData: MOCK_MEDICINES })
})
