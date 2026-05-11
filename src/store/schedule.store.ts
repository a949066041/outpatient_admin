import type { Schedule } from '~/types/outpatient'
import { createGlobalState } from '@vueuse/core'
import dayjs from 'dayjs'
import { useCurd } from '~/hooks'

function seed(): Schedule[] {
  const list: Schedule[] = []
  let sid = 1
  for (let d = 0; d < 14; d++) {
    const work_date = dayjs().add(d, 'day').format('YYYY-MM-DD')
    for (const doc of [
      { doctor_id: 1, department_id: 1 },
      { doctor_id: 2, department_id: 5 },
      { doctor_id: 3, department_id: 9 },
      { doctor_id: 4, department_id: 2 },
      { doctor_id: 5, department_id: 24 },
    ]) {
      for (const time_slot of ['上午', '下午']) {
        list.push({
          schedule_id: sid++,
          doctor_id: doc.doctor_id,
          department_id: doc.department_id,
          work_date,
          time_slot,
          max_patients: 20,
          booked_count: d === 0 && doc.doctor_id === 1 && time_slot === '上午' ? 18 : 0,
          status: 1,
        })
      }
    }
  }
  return list
}

const initData: Schedule[] = seed()

export const useScheduleStore = createGlobalState(() => {
  return useCurd<Schedule>({ key: 'outpatient-schedule-list-v3', initData })
})
