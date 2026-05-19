import type { ExamItem } from '~/types/outpatient'
import { createGlobalState } from '@vueuse/core'
import { MOCK_EXAM_ITEMS } from '~/data/admin-mock'
import { useCurd } from '~/hooks'

export const useExamItemStore = createGlobalState(() => {
  return useCurd<ExamItem>({ key: 'outpatient-exam-item-list-v2', initData: MOCK_EXAM_ITEMS })
})
