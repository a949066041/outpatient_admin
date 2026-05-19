import type { Review } from '~/types/outpatient'
import { createGlobalState, useLocalStorage } from '@vueuse/core'
import { MOCK_REVIEWS } from '~/data/admin-mock'
import { nextNumericId } from '~/utils/outpatient'

export const useReviewStore = createGlobalState(() => {
  const list = useLocalStorage<Review[]>('outpatient-review-list-v2', MOCK_REVIEWS)

  /** 患者评价均分，无记录时按文档展示默认 5 分 */
  function avgScoreForDoctor(doctorId: number) {
    const rs = list.value.filter(r => r.doctor_id === doctorId)
    if (!rs.length)
      return 5
    return Math.round((rs.reduce((s, r) => s + r.score, 0) / rs.length) * 10) / 10
  }

  function addReview(input: Omit<Review, 'review_id'>) {
    const row: Review = {
      ...input,
      review_id: nextNumericId(list.value, 'review_id'),
    }
    list.value = [...list.value, row]
    return row
  }

  return { list, addReview, avgScoreForDoctor }
})
