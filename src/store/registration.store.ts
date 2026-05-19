import type { Registration } from '~/types/outpatient'
import { createGlobalState, useLocalStorage } from '@vueuse/core'
import dayjs from 'dayjs'
import { buildRegistrationSeed } from '~/data/admin-mock'
import { genNo, nextNumericId } from '~/utils/outpatient'
import { useScheduleStore } from './schedule.store'

export const useRegistrationStore = createGlobalState(() => {
  const list = useLocalStorage<Registration[]>('outpatient-registration-list-v2', buildRegistrationSeed())
  const { dataList: schedules, updateData: updateSchedule } = useScheduleStore()

  function findSchedule(doctorId: number, workDate: string, timeSlot: string) {
    return schedules.value.findIndex(
      s => s.doctor_id === doctorId && s.work_date === workDate && s.time_slot === timeSlot && s.status === 1,
    )
  }

  /** 号源是否已满 */
  function isSlotFull(doctorId: number, workDate: string, timeSlot: string) {
    const i = findSchedule(doctorId, workDate, timeSlot)
    if (i < 0)
      return true
    const s = schedules.value[i]!
    return s.booked_count >= s.max_patients
  }

  /** 同一患者同日同时段冲突 */
  function hasConflict(patientId: number, workDate: string, timeSlot: string, excludeRegisterId?: number) {
    return list.value.some(
      r =>
        r.patient_id === patientId
        && r.register_date === workDate
        && r.time_slot === timeSlot
        && r.status !== 2
        && r.register_id !== excludeRegisterId,
    )
  }

  function book(params: {
    patient_id: number
    doctor_id: number
    department_id: number
    register_date: string
    time_slot: string
    register_fee: number
  }) {
    const si = findSchedule(params.doctor_id, params.register_date, params.time_slot)
    if (si < 0)
      return { ok: false, message: '该医生当日未排班或已停诊' }
    const s = schedules.value[si]!
    if (s.booked_count >= s.max_patients)
      return { ok: false, message: '该时段号源已满，请选择其他时段或医生' }
    if (hasConflict(params.patient_id, params.register_date, params.time_slot))
      return { ok: false, message: '您在该时段已有其他预约，请取消原预约后再试' }

    const reg: Registration = {
      register_id: nextNumericId(list.value, 'register_id'),
      register_no: genNo('GH'),
      patient_id: params.patient_id,
      doctor_id: params.doctor_id,
      department_id: params.department_id,
      register_date: params.register_date,
      time_slot: params.time_slot,
      register_fee: params.register_fee,
      status: 0,
      is_paid: 0,
      pay_time: null,
      symptom_desc: '',
      diagnosis: '',
      visiting: false,
    }
    list.value = [...list.value, reg]
    updateSchedule(si, { ...s, booked_count: s.booked_count + 1 })
    return { ok: true, message: '预约成功', registration: reg }
  }

  function payRegister(registerId: number) {
    const i = list.value.findIndex(r => r.register_id === registerId)
    if (i < 0)
      return false
    const r = list.value[i]!
    if (r.is_paid === 1)
      return true
    list.value[i] = { ...r, is_paid: 1, pay_time: dayjs().format('YYYY-MM-DD HH:mm:ss') }
    list.value = [...list.value]
    return true
  }

  function cancelRegister(registerId: number) {
    const i = list.value.findIndex(r => r.register_id === registerId)
    if (i < 0)
      return
    const r = list.value[i]!
    if (r.status === 2)
      return
    const si = findSchedule(r.doctor_id, r.register_date, r.time_slot)
    if (si >= 0) {
      const s = schedules.value[si]!
      updateSchedule(si, { ...s, booked_count: Math.max(0, s.booked_count - 1) })
    }
    list.value[i] = { ...r, status: 2 }
    list.value = [...list.value]
  }

  function updateRegistration(registerId: number, patch: Partial<Registration>) {
    const i = list.value.findIndex(r => r.register_id === registerId)
    if (i < 0)
      return
    list.value[i] = { ...list.value[i]!, ...patch }
    list.value = [...list.value]
  }

  return {
    list,
    book,
    payRegister,
    cancelRegister,
    updateRegistration,
    isSlotFull,
    hasConflict,
    findSchedule,
  }
})
