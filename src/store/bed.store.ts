import type { Bed } from '~/types/outpatient'
import { createGlobalState } from '@vueuse/core'
import { MOCK_BEDS } from '~/data/admin-mock'
import { useCurd } from '~/hooks'

export const useBedStore = createGlobalState(() => {
  return useCurd<Bed>({ key: 'outpatient-bed-list-v2', initData: MOCK_BEDS })
})
