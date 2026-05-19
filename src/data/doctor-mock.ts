/**
 * 医生模块演示数据（对齐论文图 5.7–5.9、表 6.3 医生处理挂号测试）
 */
import type { ExamApplication, Prescription, Registration } from '~/types/outpatient'
import dayjs from 'dayjs'

/** 演示医生张三（doctor_id=1，工号 1000）额外挂号记录 */
export function buildDoctorRegistrationExtras(): Omit<Registration, 'register_id' | 'register_no'>[] {
  const today = dayjs()
  const todayStr = today.format('YYYY-MM-DD')
  const now = today.format('YYYY-MM-DD HH:mm:ss')
  const past = Array.from({ length: 7 }, (_, i) => today.subtract(7 - i, 'day').format('YYYY-MM-DD'))

  return [
    { patient_id: 3, doctor_id: 1, department_id: 1, register_date: todayStr, time_slot: '上午', register_fee: 10, status: 0, is_paid: 1, pay_time: now, symptom_desc: '反复头晕伴恶心', diagnosis: '', visiting: false },
    { patient_id: 5, doctor_id: 1, department_id: 1, register_date: todayStr, time_slot: '上午', register_fee: 10, status: 0, is_paid: 1, pay_time: now, symptom_desc: '肢体麻木一周', diagnosis: '', visiting: false },
    { patient_id: 7, doctor_id: 1, department_id: 1, register_date: todayStr, time_slot: '下午', register_fee: 10, status: 0, is_paid: 0, pay_time: null, symptom_desc: '失眠、焦虑', diagnosis: '', visiting: false },
    { patient_id: 9, doctor_id: 1, department_id: 1, register_date: todayStr, time_slot: '下午', register_fee: 10, status: 0, is_paid: 1, pay_time: now, symptom_desc: '记忆力下降', diagnosis: '', visiting: false },
    { patient_id: 11, doctor_id: 1, department_id: 1, register_date: todayStr, time_slot: '下午', register_fee: 10, status: 0, is_paid: 1, pay_time: now, symptom_desc: '行走不稳', diagnosis: '', visiting: true },
    { patient_id: 4, doctor_id: 1, department_id: 1, register_date: past[3]!, time_slot: '上午', register_fee: 10, status: 1, is_paid: 1, pay_time: now, symptom_desc: '头痛伴视物旋转', diagnosis: '偏头痛', visit_end_time: `${past[3]} 11:20:00`, visiting: false },
    { patient_id: 5, doctor_id: 1, department_id: 1, register_date: past[4]!, time_slot: '下午', register_fee: 10, status: 1, is_paid: 1, pay_time: now, symptom_desc: '右侧肢体无力', diagnosis: '脑梗死恢复期，建议康复训练', visit_end_time: `${past[4]} 16:45:00`, visiting: false },
    { patient_id: 10, doctor_id: 1, department_id: 1, register_date: past[5]!, time_slot: '上午', register_fee: 10, status: 1, is_paid: 1, pay_time: now, symptom_desc: '手足麻木', diagnosis: '周围神经病（待查）', visit_end_time: `${past[5]} 10:38:00`, visiting: false },
    { patient_id: 13, doctor_id: 1, department_id: 1, register_date: past[6]!, time_slot: '下午', register_fee: 10, status: 1, is_paid: 1, pay_time: now, symptom_desc: '癫痫发作后复诊', diagnosis: '癫痫，调整抗癫痫方案', visit_end_time: `${past[6]} 15:22:00`, visiting: false },
    { patient_id: 14, doctor_id: 1, department_id: 1, register_date: past[2]!, time_slot: '上午', register_fee: 10, status: 1, is_paid: 1, pay_time: now, symptom_desc: '帕金森症状加重', diagnosis: '帕金森病，药物需加量', visit_end_time: `${past[2]} 09:55:00`, visiting: false },
    { patient_id: 2, doctor_id: 1, department_id: 1, register_date: past[1]!, time_slot: '下午', register_fee: 10, status: 1, is_paid: 1, pay_time: now, symptom_desc: '发热后抽搐一次', diagnosis: '热性惊厥，对症观察', visit_end_time: `${past[1]} 17:30:00`, visiting: false },
    { patient_id: 8, doctor_id: 1, department_id: 1, register_date: past[0]!, time_slot: '上午', register_fee: 10, status: 1, is_paid: 1, pay_time: now, symptom_desc: '晕厥一次', diagnosis: '血管迷走性晕厥', visit_end_time: `${past[0]} 11:05:00`, visiting: false },
  ]
}

/** 处方演示数据（关联张三医生历史挂号） */
export function buildPrescriptionSeed(): Prescription[] {
  return [
    {
      prescription_id: 1,
      prescription_no: 'CF20260515001',
      register_id: 15,
      doctor_id: 1,
      patient_id: 1,
      total_amount: 56.5,
      status: 1,
      details: [
        { detail_id: 1, medicine_id: 2, quantity: 1, unit_price: 22, amount: 22, usage: '口服', dosage: '一次1粒', days: 5 },
        { detail_id: 2, medicine_id: 4, quantity: 1, unit_price: 45.8, amount: 45.8, usage: '口服', dosage: '一次1片', days: 7 },
      ],
    },
    {
      prescription_id: 2,
      prescription_no: 'CF20260518001',
      register_id: 24,
      doctor_id: 1,
      patient_id: 6,
      total_amount: 40,
      status: 1,
      details: [
        { detail_id: 1, medicine_id: 2, quantity: 1, unit_price: 22, amount: 22, usage: '口服', dosage: '一次1粒', days: 3 },
        { detail_id: 2, medicine_id: 7, quantity: 1, unit_price: 26, amount: 26, usage: '口服', dosage: '一日1次', days: 5 },
      ],
    },
    {
      prescription_id: 3,
      prescription_no: 'CF20260512001',
      register_id: 33,
      doctor_id: 1,
      patient_id: 4,
      total_amount: 50,
      status: 1,
      details: [
        { detail_id: 1, medicine_id: 1, quantity: 2, unit_price: 18.5, amount: 37, usage: '口服', dosage: '一次2粒', days: 5 },
        { detail_id: 2, medicine_id: 3, quantity: 1, unit_price: 28, amount: 28, usage: '口服', dosage: '一次4粒', days: 3 },
      ],
    },
    {
      prescription_id: 4,
      prescription_no: 'CF20260513001',
      register_id: 34,
      doctor_id: 1,
      patient_id: 5,
      total_amount: 67.8,
      status: 0,
      details: [
        { detail_id: 1, medicine_id: 4, quantity: 1, unit_price: 45.8, amount: 45.8, usage: '口服', dosage: '一次1片', days: 14 },
        { detail_id: 2, medicine_id: 8, quantity: 1, unit_price: 42, amount: 42, usage: '口服', dosage: '一日3次', days: 5 },
      ],
    },
    {
      prescription_id: 5,
      prescription_no: 'CF20260514001',
      register_id: 35,
      doctor_id: 1,
      patient_id: 10,
      total_amount: 26,
      status: 1,
      details: [
        { detail_id: 1, medicine_id: 7, quantity: 1, unit_price: 26, amount: 26, usage: '口服', dosage: '一日1次', days: 7 },
      ],
    },
    {
      prescription_id: 6,
      prescription_no: 'CF20260516001',
      register_id: 36,
      doctor_id: 1,
      patient_id: 13,
      total_amount: 74,
      status: 1,
      details: [
        { detail_id: 1, medicine_id: 5, quantity: 1, unit_price: 32, amount: 32, usage: '口服', dosage: '餐中服用', days: 30 },
        { detail_id: 2, medicine_id: 6, quantity: 1, unit_price: 38.5, amount: 38.5, usage: '口服', dosage: '早餐前', days: 14 },
      ],
    },
    {
      prescription_id: 7,
      prescription_no: 'CF20260517001',
      register_id: 37,
      doctor_id: 1,
      patient_id: 14,
      total_amount: 18.5,
      status: 2,
      details: [
        { detail_id: 1, medicine_id: 1, quantity: 1, unit_price: 18.5, amount: 18.5, usage: '口服', dosage: '一次2粒', days: 7 },
      ],
    },
    {
      prescription_id: 8,
      prescription_no: 'CF20260511001',
      register_id: 38,
      doctor_id: 1,
      patient_id: 2,
      total_amount: 28,
      status: 1,
      details: [
        { detail_id: 1, medicine_id: 3, quantity: 1, unit_price: 28, amount: 28, usage: '口服', dosage: '一次4粒', days: 5 },
      ],
    },
    {
      prescription_id: 9,
      prescription_no: 'CF20260510001',
      register_id: 39,
      doctor_id: 1,
      patient_id: 8,
      total_amount: 22,
      status: 1,
      details: [
        { detail_id: 1, medicine_id: 2, quantity: 1, unit_price: 22, amount: 22, usage: '口服', dosage: '一次1粒', days: 3 },
      ],
    },
  ]
}

/** 检查申请演示（含已出报告，供追加诊断） */
export function buildDoctorExamSeed(): ExamApplication[] {
  const done = dayjs().subtract(2, 'day').format('YYYY-MM-DD HH:mm:ss')
  const rep = dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss')
  return [
    { application_id: 101, application_no: 'JC20260520011', register_id: 15, doctor_id: 1, patient_id: 1, item_id: 6, status: 1, is_paid: 1, check_result: '未见明显颅内占位，脑萎缩轻度', check_time: done, report_time: rep, purpose: '头晕查因' },
    { application_id: 102, application_no: 'JC20260520012', register_id: 34, doctor_id: 1, patient_id: 5, item_id: 3, status: 1, is_paid: 1, check_result: '窦性心律，心率 78 次/分', check_time: done, report_time: rep, purpose: '肢体无力评估' },
    { application_id: 103, application_no: 'JC20260520013', register_id: 35, doctor_id: 1, patient_id: 10, item_id: 1, status: 1, is_paid: 1, check_result: '血常规未见明显异常', check_time: done, report_time: rep, purpose: '麻木查因' },
    { application_id: 104, application_no: 'JC20260520014', register_id: 1, doctor_id: 1, patient_id: 1, item_id: 1, status: 0, is_paid: 1, check_result: '', check_time: null, report_time: null, purpose: '今日头痛复查血常规' },
  ]
}
