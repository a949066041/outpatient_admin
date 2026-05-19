import type { ExamApplication } from '~/types/outpatient'
import { createGlobalState, useLocalStorage } from '@vueuse/core'
import dayjs from 'dayjs'
import { buildDoctorExamSeed } from '~/data/doctor-mock'
import { buildPatientExamExtras } from '~/data/patient-mock'
import { genNo, nextNumericId } from '~/utils/outpatient'

function examApplicationSeed(): ExamApplication[] {
  const done1 = dayjs().subtract(2, 'day').hour(10).minute(15).second(0).format('YYYY-MM-DD HH:mm:ss')
  const rep1 = dayjs().subtract(2, 'day').hour(10).minute(40).second(0).format('YYYY-MM-DD HH:mm:ss')
  const done2 = dayjs().subtract(1, 'day').hour(16).minute(0).second(0).format('YYYY-MM-DD HH:mm:ss')
  const rep2 = dayjs().subtract(1, 'day').hour(16).minute(20).second(0).format('YYYY-MM-DD HH:mm:ss')
  return [
    { application_id: 1, application_no: 'JC20260520001', register_id: 1, doctor_id: 1, patient_id: 1, item_id: 1, status: 0, is_paid: 1, check_result: '', check_time: null, report_time: null, purpose: '血常规复查' },
    { application_id: 2, application_no: 'JC20260520002', register_id: 2, doctor_id: 2, patient_id: 1, item_id: 2, status: 0, is_paid: 0, check_result: '', check_time: null, report_time: null, purpose: '胸闷排除心肺疾患' },
    { application_id: 3, application_no: 'JC20260520003', register_id: 3, doctor_id: 3, patient_id: 1, item_id: 3, status: 0, is_paid: 1, check_result: '', check_time: null, report_time: null, purpose: '术前心电图' },
    { application_id: 4, application_no: 'JC20260520004', register_id: 4, doctor_id: 4, patient_id: 1, item_id: 1, status: 1, is_paid: 1, check_result: '白细胞计数正常，血红蛋白 135g/L', check_time: done1, report_time: rep1, purpose: '感染筛查' },
    { application_id: 5, application_no: 'JC20260520005', register_id: 5, doctor_id: 5, patient_id: 1, item_id: 2, status: 0, is_paid: 0, check_result: '', check_time: null, report_time: null, purpose: '胸片初查' },
    { application_id: 6, application_no: 'JC20260520006', register_id: 7, doctor_id: 2, patient_id: 1, item_id: 3, status: 0, is_paid: 1, check_result: '', check_time: null, report_time: null, purpose: '心律评估' },
    { application_id: 7, application_no: 'JC20260520007', register_id: 8, doctor_id: 3, patient_id: 1, item_id: 1, status: 1, is_paid: 1, check_result: '血小板、肝肾功能未见异常', check_time: done2, report_time: rep2, purpose: '术后复查' },
    { application_id: 8, application_no: 'JC20260515001', register_id: 1, doctor_id: 1, patient_id: 1, item_id: 3, status: 2, is_paid: 0, check_result: '', check_time: null, report_time: null, purpose: '患者改约，申请作废' },
    ...buildDoctorExamSeed(),
    ...buildPatientExamExtras(),
  ]
}

export const useExamApplicationStore = createGlobalState(() => {
  const list = useLocalStorage<ExamApplication[]>('outpatient-exam-application-list-v3', examApplicationSeed())

  function createApplication(input: {
    register_id: number
    doctor_id: number
    patient_id: number
    item_id: number
    purpose?: string
  }) {
    const row: ExamApplication = {
      application_id: nextNumericId(list.value, 'application_id'),
      application_no: genNo('JC'),
      register_id: input.register_id,
      doctor_id: input.doctor_id,
      patient_id: input.patient_id,
      item_id: input.item_id,
      status: 0,
      is_paid: 0,
      check_result: '',
      check_time: null,
      report_time: null,
      purpose: input.purpose,
    }
    list.value = [...list.value, row]
    return row
  }

  function pay(applicationId: number) {
    const i = list.value.findIndex(x => x.application_id === applicationId)
    if (i < 0)
      return false
    const x = list.value[i]!
    list.value[i] = { ...x, is_paid: 1 }
    list.value = [...list.value]
    return true
  }

  function completeCheck(applicationId: number, result: string) {
    const i = list.value.findIndex(x => x.application_id === applicationId)
    if (i < 0)
      return
    const x = list.value[i]!
    list.value[i] = {
      ...x,
      status: 1,
      check_result: result,
      check_time: new Date().toISOString().slice(0, 19).replace('T', ' '),
      report_time: new Date().toISOString().slice(0, 19).replace('T', ' '),
    }
    list.value = [...list.value]
  }

  return { list, createApplication, pay, completeCheck }
})
