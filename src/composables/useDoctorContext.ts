import dayjs from 'dayjs'
import {
  useDepartmentStore,
  useExamApplicationStore,
  useLoginStore,
  usePatientStore,
  useMedicineStore,
  usePrescriptionStore,
  useRegistrationStore,
} from '~/store'

/** 医生工作站公共：当前医生、患者/科室名称、处方与检查摘要 */
export function useDoctorContext() {
  const { list: registrations } = useRegistrationStore()
  const { dataList: patients } = usePatientStore()
  const { dataList: departments } = useDepartmentStore()
  const { list: prescriptions } = usePrescriptionStore()
  const { list: exams } = useExamApplicationStore()
  const { dataList: medicines } = useMedicineStore()
  const { currentProfile } = useLoginStore()

  const doctorId = computed(() => currentProfile.value?.id as number | undefined)
  const today = dayjs().format('YYYY-MM-DD')

  function patientName(id: number) {
    return patients.value.find(p => p.patient_id === id)?.real_name ?? String(id)
  }

  function patientAccount(id: number) {
    return patients.value.find(p => p.patient_id === id)?.username ?? String(id)
  }

  function patientRow(id: number) {
    return patients.value.find(p => p.patient_id === id)
  }

  function deptName(id: number) {
    return departments.value.find(d => d.department_id === id)?.dept_name ?? '-'
  }

  function regTimeLabel(r: { register_date: string, time_slot: string }) {
    return `${r.register_date} ${r.time_slot}`
  }

  function prescriptionsForRegister(registerId: number) {
    return prescriptions.value.filter(p => p.register_id === registerId)
  }

  function prescriptionSummary(registerId: number) {
    const ps = prescriptionsForRegister(registerId)
    if (!ps.length)
      return '-'
    return ps.map((p) => {
      const meds = p.details.map((d) => {
        const name = medicines.value.find(m => m.medicine_id === d.medicine_id)?.name ?? `药品#${d.medicine_id}`
        return `${name}×${d.quantity}`
      }).join('、')
      return `${meds}，总价${p.total_amount}元`
    }).join('；')
  }

  function examsForRegister(registerId: number) {
    return exams.value.filter(e => e.register_id === registerId)
  }

  function statusLabel(status: 0 | 1 | 2) {
    if (status === 0)
      return '待就诊'
    if (status === 1)
      return '已完成'
    return '已取消'
  }

  return {
    registrations,
    doctorId,
    today,
    currentProfile,
    patientName,
    patientAccount,
    patientRow,
    deptName,
    regTimeLabel,
    prescriptionsForRegister,
    prescriptionSummary,
    examsForRegister,
    statusLabel,
  }
}
