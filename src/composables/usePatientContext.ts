import {
  useDepartmentStore,
  useDoctorStore,
  useExamApplicationStore,
  useLoginStore,
  usePatientStore,
  usePrescriptionStore,
  useRegistrationStore,
} from '~/store'

/** 患者端公共：当前患者、医生/科室名称、费用汇总 */
export function usePatientContext() {
  const { list: registrations } = useRegistrationStore()
  const { dataList: doctors } = useDoctorStore()
  const { dataList: departments } = useDepartmentStore()
  const { dataList: patients } = usePatientStore()
  const { list: prescriptions } = usePrescriptionStore()
  const { list: exams } = useExamApplicationStore()
  const { currentProfile } = useLoginStore()

  const patientId = computed(() => currentProfile.value?.id as number | undefined)

  function doctorName(id: number) {
    return doctors.value.find(d => d.doctor_id === id)?.name ?? String(id)
  }

  function doctorNo(id: number) {
    return doctors.value.find(d => d.doctor_id === id)?.doctor_no ?? String(id)
  }

  function deptLocation(id: number) {
    return departments.value.find(d => d.department_id === id)?.location ?? '—'
  }

  function patientRow(id?: number) {
    const pid = id ?? patientId.value
    if (!pid)
      return null
    return patients.value.find(p => p.patient_id === pid) ?? null
  }

  function regTimeLabel(r: { register_date: string, time_slot: string }) {
    return `${r.register_date} ${r.time_slot}`
  }

  function feeDue(r: { register_fee: number, is_paid: 0 | 1, status: 0 | 1 | 2 }) {
    if (r.status === 2)
      return 0
    return r.is_paid === 1 ? 0 : r.register_fee
  }

  function regStatusLabel(r: { status: 0 | 1 | 2, visiting?: boolean }) {
    if (r.status === 2)
      return '已取消'
    if (r.status === 1)
      return '已完成'
    if (r.visiting)
      return '就诊中'
    return '未完成'
  }

  function payStatusLabel(is_paid: 0 | 1) {
    return is_paid === 1 ? '已缴费' : '未缴费'
  }

  function examsForRegister(registerId: number) {
    return exams.value.filter(e => e.register_id === registerId && e.status === 1 && e.check_result)
  }

  return {
    registrations,
    patientId,
    currentProfile,
    patientRow,
    doctorName,
    doctorNo,
    deptLocation,
    regTimeLabel,
    feeDue,
    regStatusLabel,
    payStatusLabel,
    examsForRegister,
    prescriptions,
    exams,
  }
}
