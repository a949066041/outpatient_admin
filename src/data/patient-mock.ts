/**
 * 患者模块演示数据（对齐论文图 5.10–5.13、表 6.4 患者预约挂号测试）
 * 演示账号：patient001 / 赵患者（patient_id=1）
 */
import type { ExamApplication, Prescription, Registration } from '~/types/outpatient'
import dayjs from 'dayjs'

/** 赵患者额外挂号记录 */
export function buildPatientRegistrationExtras(): Omit<Registration, 'register_id' | 'register_no'>[] {
  const today = dayjs()
  const todayStr = today.format('YYYY-MM-DD')
  const now = today.format('YYYY-MM-DD HH:mm:ss')
  const dates = Array.from({ length: 7 }, (_, i) => today.add(i, 'day').format('YYYY-MM-DD'))
  const past = Array.from({ length: 10 }, (_, i) => today.subtract(10 - i, 'day').format('YYYY-MM-DD'))

  return [
    { patient_id: 1, doctor_id: 1, department_id: 1, register_date: dates[4]!, time_slot: '上午', register_fee: 10, status: 0, is_paid: 0, pay_time: null, symptom_desc: '复查血压', diagnosis: '', visiting: false },
    { patient_id: 1, doctor_id: 4, department_id: 2, register_date: dates[5]!, time_slot: '下午', register_fee: 20, status: 0, is_paid: 0, pay_time: null, symptom_desc: '咳嗽一周', diagnosis: '', visiting: false },
    { patient_id: 1, doctor_id: 1, department_id: 1, register_date: past[0]!, time_slot: '上午', register_fee: 10, status: 1, is_paid: 1, pay_time: now, symptom_desc: '头痛、恶心', diagnosis: '偏头痛', visit_end_time: `${past[0]} 11:15:00`, visiting: false },
    { patient_id: 1, doctor_id: 1, department_id: 1, register_date: past[1]!, time_slot: '下午', register_fee: 10, status: 1, is_paid: 1, pay_time: now, symptom_desc: '失眠多梦', diagnosis: '神经衰弱', visit_end_time: `${past[1]} 16:40:00`, visiting: false },
    { patient_id: 1, doctor_id: 2, department_id: 5, register_date: past[2]!, time_slot: '上午', register_fee: 30, status: 1, is_paid: 1, pay_time: now, symptom_desc: '胸闷', diagnosis: '冠心病稳定期', visit_end_time: `${past[2]} 10:20:00`, visiting: false },
    { patient_id: 1, doctor_id: 1, department_id: 1, register_date: past[3]!, time_slot: '上午', register_fee: 10, status: 1, is_paid: 1, pay_time: now, symptom_desc: '头晕伴耳鸣', diagnosis: '梅尼埃病待排', visit_end_time: `${past[3]} 09:50:00`, visiting: false },
    { patient_id: 1, doctor_id: 8, department_id: 20, register_date: past[7]!, time_slot: '下午', register_fee: 28, status: 1, is_paid: 1, pay_time: now, symptom_desc: '双眼干涩', diagnosis: '干眼症', visit_end_time: `${past[7]} 15:10:00`, visiting: false },
    { patient_id: 1, doctor_id: 11, department_id: 3, register_date: past[8]!, time_slot: '上午', register_fee: 32, status: 1, is_paid: 1, pay_time: now, symptom_desc: '口渴多尿', diagnosis: '2型糖尿病，血糖控制尚可', visit_end_time: `${past[8]} 11:30:00`, visiting: false },
    { patient_id: 1, doctor_id: 1, department_id: 1, register_date: todayStr, time_slot: '下午', register_fee: 10, status: 0, is_paid: 0, pay_time: null, symptom_desc: '下午加号复诊', diagnosis: '', visiting: false },
  ]
}

/** 赵患者处方（含待缴费） */
export function buildPatientPrescriptionExtras(): Prescription[] {
  return [
    {
      prescription_id: 101,
      prescription_no: 'CF20260519001',
      register_id: 15,
      doctor_id: 1,
      patient_id: 1,
      total_amount: 40.5,
      status: 0,
      details: [
        { detail_id: 1, medicine_id: 1, quantity: 1, unit_price: 18.5, amount: 18.5, usage: '口服', dosage: '一次2粒', days: 7 },
        { detail_id: 2, medicine_id: 2, quantity: 1, unit_price: 22, amount: 22, usage: '口服', dosage: '一次1粒', days: 5 },
      ],
    },
    {
      prescription_id: 102,
      prescription_no: 'CF20260517002',
      register_id: 42,
      doctor_id: 1,
      patient_id: 1,
      total_amount: 28,
      status: 1,
      details: [
        { detail_id: 1, medicine_id: 3, quantity: 1, unit_price: 28, amount: 28, usage: '口服', dosage: '一次4粒', days: 5 },
      ],
    },
    {
      prescription_id: 103,
      prescription_no: 'CF20260516003',
      register_id: 43,
      doctor_id: 1,
      patient_id: 1,
      total_amount: 67.8,
      status: 1,
      details: [
        { detail_id: 1, medicine_id: 4, quantity: 1, unit_price: 45.8, amount: 45.8, usage: '口服', dosage: '一次1片', days: 14 },
        { detail_id: 2, medicine_id: 7, quantity: 1, unit_price: 26, amount: 26, usage: '口服', dosage: '一日1次', days: 7 },
      ],
    },
    {
      prescription_id: 104,
      prescription_no: 'CF20260514004',
      register_id: 44,
      doctor_id: 2,
      patient_id: 1,
      total_amount: 45.8,
      status: 1,
      details: [
        { detail_id: 1, medicine_id: 4, quantity: 1, unit_price: 45.8, amount: 45.8, usage: '口服', dosage: '一次1片', days: 30 },
      ],
    },
  ]
}

/** 赵患者检查申请（含已出报告） */
export function buildPatientExamExtras(): ExamApplication[] {
  const done = dayjs().subtract(3, 'day').format('YYYY-MM-DD HH:mm:ss')
  const rep = dayjs().subtract(2, 'day').format('YYYY-MM-DD HH:mm:ss')
  return [
    { application_id: 201, application_no: 'JC20260518001', register_id: 15, doctor_id: 1, patient_id: 1, item_id: 6, status: 1, is_paid: 1, check_result: '未见明显颅内占位，脑萎缩轻度', check_time: done, report_time: rep, purpose: '头晕查因' },
    { application_id: 202, application_no: 'JC20260517002', register_id: 42, doctor_id: 1, patient_id: 1, item_id: 1, status: 1, is_paid: 1, check_result: '白细胞 6.2×10⁹/L，血红蛋白 142g/L', check_time: done, report_time: rep, purpose: '头痛筛查' },
    { application_id: 203, application_no: 'JC20260516003', register_id: 43, doctor_id: 1, patient_id: 1, item_id: 3, status: 1, is_paid: 1, check_result: '窦性心律，心率 72 次/分', check_time: done, report_time: rep, purpose: '失眠相关检查' },
    { application_id: 204, application_no: 'JC20260515004', register_id: 44, doctor_id: 2, patient_id: 1, item_id: 2, status: 1, is_paid: 1, check_result: '双肺纹理增粗，心影不大', check_time: done, report_time: rep, purpose: '胸闷查因' },
    { application_id: 205, application_no: 'JC20260520005', register_id: 1, doctor_id: 1, patient_id: 1, item_id: 5, status: 0, is_paid: 0, check_result: '', check_time: null, report_time: null, purpose: '肝功能复查' },
  ]
}
