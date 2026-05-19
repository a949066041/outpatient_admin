/** 与论文表结构一致的前端领域类型（数据存于 localStorage） */

export type RoleType = '管理员' | '医生' | '患者'

export interface Admin {
  admin_id: number
  username: string
  password: string
  real_name: string
  email: string
  phone: string
  status: 0 | 1
}

export interface Department {
  department_id: number
  dept_name: string
  dept_code: string
  description: string
  location: string
  status: 0 | 1
  /** 排班界面一级分类：内科 / 外科 / 妇产科 / 儿科 / 五官科 */
  category?: string
}

export interface Doctor {
  doctor_id: number
  doctor_no: string
  password: string
  name: string
  gender: 0 | 1
  age: number
  department_id: number
  title: string
  phone: string
  email: string
  /** 证件号（论文医生信息管理列表展示） */
  id_card?: string
  introduction: string
  status: 0 | 1
  /** 挂号费（元），论文示例 10 元 */
  register_fee?: number
}

export interface Patient {
  patient_id: number
  username: string
  password: string
  real_name: string
  gender: 0 | 1
  age: number
  id_card: string
  phone: string
  address: string
  email: string
  medical_history: string
  status: 0 | 1
}

export interface Medicine {
  medicine_id: number
  medicine_no: string
  name: string
  category: string
  specification: string
  manufacturer: string
  price: number
  stock: number
  unit: string
  usage_dosage: string
  status: 0 | 1
}

export interface ExamItem {
  item_id: number
  item_no: string
  item_name: string
  category: string
  price: number
  description: string
  location: string
  status: 0 | 1
}

export interface Bed {
  bed_id: number
  bed_no: string
  department_id: number
  room_no: string
  bed_type: string
  price_per_day: number
  status: 0 | 1 | 2
  patient_id: number | null
}

/** 排班：上午/下午，号源联动 */
export interface Schedule {
  schedule_id: number
  doctor_id: number
  department_id: number
  work_date: string
  time_slot: string
  max_patients: number
  booked_count: number
  status: 0 | 1
}

/** 挂号：0待就诊 1已就诊 2已取消；就诊中可用 symptom 非空表示 */
export interface Registration {
  register_id: number
  register_no: string
  patient_id: number
  doctor_id: number
  department_id: number
  register_date: string
  time_slot: string
  register_fee: number
  status: 0 | 1 | 2
  is_paid: 0 | 1
  pay_time: string | null
  symptom_desc: string
  diagnosis: string
  /** 医生接诊中 */
  visiting?: boolean
  /** 完成接诊时间（历史挂号列表展示） */
  visit_end_time?: string | null
}

export interface PrescriptionDetail {
  detail_id: number
  medicine_id: number
  quantity: number
  unit_price: number
  amount: number
  usage: string
  dosage: string
  days: number
}

export interface Prescription {
  prescription_id: number
  prescription_no: string
  register_id: number
  doctor_id: number
  patient_id: number
  total_amount: number
  status: 0 | 1 | 2
  details: PrescriptionDetail[]
}

export interface ExamApplication {
  application_id: number
  application_no: string
  register_id: number
  doctor_id: number
  patient_id: number
  item_id: number
  status: 0 | 1 | 2
  is_paid: 0 | 1
  check_result: string
  check_time: string | null
  report_time: string | null
  purpose?: string
}

export interface Hospitalization {
  hospitalization_id: number
  hospital_no: string
  register_id: number
  patient_id: number
  doctor_id: number
  bed_id: number
  admission_date: string
  discharge_date: string | null
  diagnosis: string
  status: 0 | 1
  total_cost: number
  expected_days?: number
}

export interface Review {
  review_id: number
  register_id: number
  patient_id: number
  doctor_id: number
  score: number
  content: string
}

export interface LoginSession {
  role: RoleType
  /** 管理员 username / 患者 username / 医生 doctor_no */
  account: string
  token: string
}
