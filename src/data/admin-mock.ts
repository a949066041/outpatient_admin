/**
 * 管理员模块演示数据（对齐论文图 5.3–5.6 与表结构）
 */
import type {
  Bed,
  Doctor,
  ExamItem,
  Medicine,
  Patient,
  Registration,
  Review,
  Schedule,
} from '~/types/outpatient'
import dayjs from 'dayjs'
import { buildDoctorRegistrationExtras } from '~/data/doctor-mock'

export const MOCK_DOCTORS: Doctor[] = [
  { doctor_id: 1, doctor_no: '1000', password: '123456', name: '张三', gender: 1, age: 45, department_id: 1, title: '主任医师', phone: '13899999999', email: 'zhangsan@hospital.com', id_card: '210102197801011234', introduction: '从事神经内科临床工作二十余年，擅长脑血管病、帕金森病等。', status: 1, register_fee: 10 },
  { doctor_id: 2, doctor_no: '1001', password: '123456', name: '李华', gender: 0, age: 38, department_id: 5, title: '副主任医师', phone: '13912345678', email: 'lihua@hospital.com', id_card: '110101198505051234', introduction: '擅长冠心病、高血压、心力衰竭等心血管疾病诊治。', status: 1, register_fee: 30 },
  { doctor_id: 3, doctor_no: '1002', password: '123456', name: '王强', gender: 1, age: 42, department_id: 9, title: '主任医师', phone: '13788889999', email: 'wangqiang@hospital.com', id_card: '310101198010105678', introduction: '普外微创手术、胃肠肿瘤外科治疗经验丰富。', status: 1, register_fee: 15 },
  { doctor_id: 4, doctor_no: '1003', password: '123456', name: '赵敏', gender: 0, age: 35, department_id: 2, title: '主治医师', phone: '13600001111', email: 'zhaomin@hospital.com', id_card: '440101199003209876', introduction: '呼吸与危重症，擅长慢阻肺、支气管哮喘诊疗。', status: 1, register_fee: 20 },
  { doctor_id: 5, doctor_no: '1004', password: '123456', name: '周中医', gender: 1, age: 50, department_id: 24, title: '主任中医师', phone: '13511112222', email: 'zhouzy@hospital.com', id_card: '320101197503082468', introduction: '中医内科调理、脾胃病及亚健康辨证论治。', status: 1, register_fee: 25 },
  { doctor_id: 6, doctor_no: '1005', password: '123456', name: '陈静', gender: 0, age: 33, department_id: 15, title: '副主任医师', phone: '15877776666', email: 'chenjing@hospital.com', id_card: '510101199208124321', introduction: '妇科肿瘤、宫颈疾病及微创妇科手术。', status: 1, register_fee: 35 },
  { doctor_id: 7, doctor_no: '1006', password: '123456', name: '刘洋', gender: 1, age: 29, department_id: 17, title: '主治医师', phone: '15966665555', email: 'liuyang@qq.com', id_card: '210102199601011111', introduction: '儿童呼吸、消化及常见病多发病诊疗。', status: 1, register_fee: 12 },
  { doctor_id: 8, doctor_no: '1007', password: '123456', name: '孙丽', gender: 0, age: 41, department_id: 20, title: '副主任医师', phone: '13755554444', email: 'sunli@163.com', id_card: '110101198303033333', introduction: '白内障、青光眼及眼底病诊疗。', status: 1, register_fee: 28 },
  { doctor_id: 9, doctor_no: '1008', password: '123456', name: '吴刚', gender: 1, age: 46, department_id: 13, title: '主任医师', phone: '13644443333', email: 'wugang@hospital.com', id_card: '210102197901019999', introduction: '骨关节创伤、脊柱疾病与关节置换。', status: 1, register_fee: 18 },
  { doctor_id: 10, doctor_no: '1009', password: '123456', name: '郑伟', gender: 1, age: 37, department_id: 12, title: '主治医师', phone: '13833332222', email: 'zhengwei@sohu.com', id_card: '440101198808088888', introduction: '泌尿系结石、前列腺疾病微创治疗。', status: 1, register_fee: 22 },
  { doctor_id: 11, doctor_no: '1010', password: '123456', name: '钱芳', gender: 0, age: 44, department_id: 3, title: '主任医师', phone: '13922221111', email: 'qianfang@hospital.com', id_card: '210102198002021010', introduction: '糖尿病、甲状腺疾病及代谢综合征管理。', status: 1, register_fee: 32 },
  { doctor_id: 12, doctor_no: '1011', password: '123456', name: '冯磊', gender: 1, age: 31, department_id: 19, title: '住院医师', phone: '15811110000', email: 'fenglei@gmail.com', id_card: '110101199401015555', introduction: '鼻炎、中耳炎、咽喉疾病诊治。', status: 1, register_fee: 15 },
  { doctor_id: 13, doctor_no: '1012', password: '123456', name: '朱婷', gender: 0, age: 39, department_id: 4, title: '副主任医师', phone: '13700009999', email: 'zhuting@hospital.com', id_card: '320101198606066666', introduction: '胃肠肝病、内镜诊疗与消化道早癌筛查。', status: 1, register_fee: 26 },
  { doctor_id: 14, doctor_no: '1013', password: '123456', name: '马超', gender: 1, age: 48, department_id: 11, title: '主任医师', phone: '13699998888', email: 'machao@hospital.com', id_card: '210102197602026666', introduction: '颅脑外伤、脑肿瘤、脑血管病外科干预。', status: 1, register_fee: 40 },
  { doctor_id: 15, doctor_no: '1014', password: '123456', name: '林雪', gender: 0, age: 27, department_id: 16, title: '主治医师', phone: '13588887777', email: 'linxue@qq.com', id_card: '510101199801018888', introduction: '围产期保健、高危妊娠管理。', status: 0, register_fee: 20 },
]

export const MOCK_PATIENTS: Patient[] = [
  { patient_id: 1, username: 'patient001', password: '123456', real_name: '赵患者', gender: 1, age: 28, id_card: '210102199701011234', phone: '13800002001', address: '沈阳市和平区文化路88号', email: 'patient001@qq.com', medical_history: '无', status: 1 },
  { patient_id: 2, username: 'wangxm', password: '123456', real_name: '王小明', gender: 1, age: 8, id_card: '210102201801012345', phone: '13800002002', address: '沈阳市沈河区青年大街120号', email: 'wangxm@qq.com', medical_history: '过敏性鼻炎', status: 1 },
  { patient_id: 3, username: 'lily99', password: '123456', real_name: '李丽', gender: 0, age: 35, id_card: '110101199001011111', phone: '13800002003', address: '大连市中山区人民路66号', email: 'lily99@163.com', medical_history: '高血压病史2年', status: 1 },
  { patient_id: 4, username: 'zhangwei', password: '123456', real_name: '张伟', gender: 1, age: 52, id_card: '210102197301013333', phone: '13800002004', address: '鞍山市铁东区胜利路18号', email: 'zhangwei@sohu.com', medical_history: '2型糖尿病', status: 1 },
  { patient_id: 5, username: 'chenfang', password: '123456', real_name: '陈芳', gender: 0, age: 67, id_card: '210102195801014444', phone: '13800002005', address: '抚顺市新抚区站前街9号', email: 'chenfang@126.com', medical_history: '冠心病支架术后', status: 1 },
  { patient_id: 6, username: 'liuqing', password: '123456', real_name: '刘青', gender: 0, age: 24, id_card: '210102200201015555', phone: '13800002006', address: '沈阳市浑南区创新路200号', email: 'liuqing@gmail.com', medical_history: '无', status: 1 },
  { patient_id: 7, username: 'sunhao', password: '123456', real_name: '孙浩', gender: 1, age: 41, id_card: '320101198401016666', phone: '13800002007', address: '本溪市平山区解放路55号', email: 'sunhao@qq.com', medical_history: '慢性胃炎', status: 1 },
  { patient_id: 8, username: 'zhoumin', password: '123456', real_name: '周敏', gender: 0, age: 19, id_card: '210102200701017777', phone: '13800002008', address: '锦州市古塔区中央大街33号', email: 'zhoumin@163.com', medical_history: '无', status: 1 },
  { patient_id: 9, username: 'wulei', password: '123456', real_name: '吴磊', gender: 1, age: 73, id_card: '210102195201018888', phone: '13800002009', address: '营口市站前区渤海大街12号', email: 'wulei@126.com', medical_history: '慢阻肺', status: 1 },
  { patient_id: 10, username: 'xuyan', password: '123456', real_name: '徐燕', gender: 0, age: 45, id_card: '440101198001019999', phone: '13800002010', address: '沈阳市铁西区建设大路168号', email: 'xuyan@qq.com', medical_history: '甲状腺结节随访', status: 1 },
  { patient_id: 11, username: 'hegang', password: '123456', real_name: '何刚', gender: 1, age: 56, id_card: '210102197001011010', phone: '13800002011', address: '丹东市振兴区锦山大街77号', email: 'hegang@sohu.com', medical_history: '高脂血症', status: 1 },
  { patient_id: 12, username: 'yangna', password: '123456', real_name: '杨娜', gender: 0, age: 31, id_card: '510101199501012020', phone: '13800002012', address: '沈阳市于洪区黄河北大街99号', email: 'yangna@gmail.com', medical_history: '无', status: 1 },
  { patient_id: 13, username: 'gaobo', password: '123456', real_name: '高博', gender: 1, age: 15, id_card: '210102201101013030', phone: '13800002013', address: '辽阳市白塔区民主路21号', email: 'gaobo@qq.com', medical_history: '哮喘', status: 1 },
  { patient_id: 14, username: 'majing', password: '123456', real_name: '马静', gender: 0, age: 82, id_card: '210102194301014040', phone: '13800002014', address: '铁岭市银州区南马路5号', email: 'majing@163.com', medical_history: '骨质疏松', status: 1 },
  { patient_id: 15, username: 'songjie', password: '123456', real_name: '宋杰', gender: 1, age: 38, id_card: '110101198801015050', phone: '13800002015', address: '朝阳市双塔区朝阳大街188号', email: 'songjie@126.com', medical_history: '无', status: 0 },
]

export const MOCK_MEDICINES: Medicine[] = [
  { medicine_id: 1, medicine_no: 'M001', name: '阿莫西林胶囊', category: '抗生素', specification: '0.25g*24粒', manufacturer: '华北制药', price: 18.5, stock: 320, unit: '盒', usage_dosage: '口服，一次2粒，一日3次', status: 1 },
  { medicine_id: 2, medicine_no: 'M002', name: '布洛芬缓释胶囊', category: '解热镇痛', specification: '0.3g*20粒', manufacturer: '中美史克', price: 22, stock: 180, unit: '盒', usage_dosage: '口服，一次1粒，一日2次', status: 1 },
  { medicine_id: 3, medicine_no: 'M003', name: '连花清瘟胶囊', category: '中成药', specification: '0.35g*48粒', manufacturer: '以岭药业', price: 28, stock: 95, unit: '盒', usage_dosage: '口服，一次4粒，一日3次', status: 1 },
  { medicine_id: 4, medicine_no: 'M004', name: '硝苯地平缓释片', category: '心血管', specification: '20mg*30片', manufacturer: '拜耳医药', price: 45.8, stock: 120, unit: '盒', usage_dosage: '口服，一次1片，一日1次', status: 1 },
  { medicine_id: 5, medicine_no: 'M005', name: '二甲双胍片', category: '降糖药', specification: '0.5g*48片', manufacturer: '中美上海施贵宝', price: 32, stock: 200, unit: '盒', usage_dosage: '餐中或餐后服用，一日2次', status: 1 },
  { medicine_id: 6, medicine_no: 'M006', name: '奥美拉唑肠溶胶囊', category: '消化系统', specification: '20mg*14粒', manufacturer: '阿斯利康', price: 38.5, stock: 88, unit: '盒', usage_dosage: '早餐前30分钟口服', status: 1 },
  { medicine_id: 7, medicine_no: 'M007', name: '氯雷他定片', category: '抗过敏', specification: '10mg*6片', manufacturer: '先灵葆雅', price: 26, stock: 150, unit: '盒', usage_dosage: '口服，一日1次', status: 1 },
  { medicine_id: 8, medicine_no: 'M008', name: '氨溴索口服液', category: '呼吸系统', specification: '100ml', manufacturer: '勃林格殷格翰', price: 42, stock: 60, unit: '瓶', usage_dosage: '口服，一日2-3次', status: 1 },
]

export const MOCK_EXAM_ITEMS: ExamItem[] = [
  { item_id: 1, item_no: 'E001', item_name: '血常规', category: '检验', price: 35, description: '全血细胞分析', location: '检验科1楼', status: 1 },
  { item_id: 2, item_no: 'E002', item_name: '胸部X光', category: '影像', price: 120, description: '正位片', location: '放射科2楼', status: 1 },
  { item_id: 3, item_no: 'E003', item_name: '心电图', category: '功能', price: 30, description: '十二导联', location: '功能科1楼', status: 1 },
  { item_id: 4, item_no: 'E004', item_name: '腹部B超', category: '影像', price: 90, description: '肝胆胰脾肾', location: '超声科3楼', status: 1 },
  { item_id: 5, item_no: 'E005', item_name: '肝功能', category: '检验', price: 68, description: '转氨酶、胆红素等', location: '检验科1楼', status: 1 },
  { item_id: 6, item_no: 'E006', item_name: '头颅CT', category: '影像', price: 280, description: '平扫', location: '放射科2楼', status: 1 },
  { item_id: 7, item_no: 'E007', item_name: '尿常规', category: '检验', price: 25, description: '尿液分析', location: '检验科1楼', status: 1 },
  { item_id: 8, item_no: 'E008', item_name: '糖化血红蛋白', category: '检验', price: 55, description: '糖尿病监测', location: '检验科1楼', status: 1 },
]

export const MOCK_BEDS: Bed[] = [
  { bed_id: 1, bed_no: 'B101-1', department_id: 1, room_no: '101', bed_type: '普通', price_per_day: 120, status: 1, patient_id: null },
  { bed_id: 2, bed_no: 'B101-2', department_id: 1, room_no: '101', bed_type: '普通', price_per_day: 120, status: 0, patient_id: 1 },
  { bed_id: 3, bed_no: 'B201-1', department_id: 2, room_no: '201', bed_type: '监护', price_per_day: 380, status: 1, patient_id: null },
  { bed_id: 4, bed_no: 'B201-2', department_id: 2, room_no: '201', bed_type: '普通', price_per_day: 150, status: 1, patient_id: null },
  { bed_id: 5, bed_no: 'B301-1', department_id: 5, room_no: '301', bed_type: '普通', price_per_day: 130, status: 0, patient_id: 4 },
  { bed_id: 6, bed_no: 'B301-2', department_id: 5, room_no: '301', bed_type: 'VIP', price_per_day: 480, status: 1, patient_id: null },
  { bed_id: 7, bed_no: 'B401-1', department_id: 9, room_no: '401', bed_type: '普通', price_per_day: 140, status: 1, patient_id: null },
  { bed_id: 8, bed_no: 'B401-2', department_id: 9, room_no: '401', bed_type: '普通', price_per_day: 140, status: 2, patient_id: null },
  { bed_id: 9, bed_no: 'B501-1', department_id: 15, room_no: '501', bed_type: '普通', price_per_day: 160, status: 1, patient_id: null },
  { bed_id: 10, bed_no: 'B501-2', department_id: 15, room_no: '501', bed_type: '监护', price_per_day: 420, status: 0, patient_id: 5 },
]

const ACTIVE_DOCTOR_DEPTS = [
  { doctor_id: 1, department_id: 1 },
  { doctor_id: 2, department_id: 5 },
  { doctor_id: 3, department_id: 9 },
  { doctor_id: 4, department_id: 2 },
  { doctor_id: 5, department_id: 24 },
  { doctor_id: 6, department_id: 15 },
  { doctor_id: 7, department_id: 17 },
  { doctor_id: 8, department_id: 20 },
  { doctor_id: 9, department_id: 13 },
  { doctor_id: 10, department_id: 12 },
  { doctor_id: 11, department_id: 3 },
  { doctor_id: 12, department_id: 19 },
  { doctor_id: 13, department_id: 4 },
  { doctor_id: 14, department_id: 11 },
]

export function buildScheduleSeed(): Schedule[] {
  const list: Schedule[] = []
  let sid = 1
  for (let d = 0; d < 30; d++) {
    const work_date = dayjs().add(d, 'day').format('YYYY-MM-DD')
    for (const doc of ACTIVE_DOCTOR_DEPTS) {
      for (const time_slot of ['上午', '下午']) {
        let booked = 0
        if (d === 0 && doc.doctor_id === 1 && time_slot === '上午')
          booked = 12
        if (d === 1 && doc.doctor_id === 2 && time_slot === '下午')
          booked = 18
        if (d === 2 && doc.doctor_id === 3 && time_slot === '上午')
          booked = 20
        const status = (d === 5 && doc.doctor_id === 4 && time_slot === '上午') ? 0 as const : 1 as const
        list.push({
          schedule_id: sid++,
          doctor_id: doc.doctor_id,
          department_id: doc.department_id,
          work_date,
          time_slot,
          max_patients: 20,
          booked_count: booked,
          status,
        })
      }
    }
  }
  return list
}

export function buildRegistrationSeed(): Registration[] {
  const today = dayjs()
  const dates = Array.from({ length: 14 }, (_, i) => today.add(i, 'day').format('YYYY-MM-DD'))
  const past = Array.from({ length: 7 }, (_, i) => today.subtract(7 - i, 'day').format('YYYY-MM-DD'))
  const allDates = [...past, ...dates]
  const now = today.format('YYYY-MM-DD HH:mm:ss')

  const templates: Omit<Registration, 'register_id' | 'register_no'>[] = [
    { patient_id: 1, doctor_id: 1, department_id: 1, register_date: dates[0]!, time_slot: '上午', register_fee: 10, status: 0, is_paid: 1, pay_time: now, symptom_desc: '头痛、乏力三天', diagnosis: '', visiting: false },
    { patient_id: 2, doctor_id: 7, department_id: 17, register_date: dates[0]!, time_slot: '下午', register_fee: 12, status: 0, is_paid: 1, pay_time: now, symptom_desc: '咳嗽发热', diagnosis: '', visiting: false },
    { patient_id: 3, doctor_id: 2, department_id: 5, register_date: dates[0]!, time_slot: '下午', register_fee: 30, status: 0, is_paid: 0, pay_time: null, symptom_desc: '胸闷气短', diagnosis: '', visiting: false },
    { patient_id: 4, doctor_id: 11, department_id: 3, register_date: dates[1]!, time_slot: '上午', register_fee: 32, status: 0, is_paid: 1, pay_time: now, symptom_desc: '血糖控制不佳', diagnosis: '', visiting: false },
    { patient_id: 5, doctor_id: 2, department_id: 5, register_date: dates[1]!, time_slot: '上午', register_fee: 30, status: 0, is_paid: 1, pay_time: now, symptom_desc: '心悸复查', diagnosis: '', visiting: false },
    { patient_id: 6, doctor_id: 5, department_id: 24, register_date: dates[2]!, time_slot: '上午', register_fee: 25, status: 0, is_paid: 0, pay_time: null, symptom_desc: '失眠、食欲差', diagnosis: '', visiting: false },
    { patient_id: 7, doctor_id: 13, department_id: 4, register_date: dates[2]!, time_slot: '下午', register_fee: 26, status: 0, is_paid: 1, pay_time: now, symptom_desc: '上腹隐痛', diagnosis: '', visiting: false },
    { patient_id: 8, doctor_id: 4, department_id: 2, register_date: dates[3]!, time_slot: '上午', register_fee: 20, status: 0, is_paid: 1, pay_time: now, symptom_desc: '咽痛咳嗽', diagnosis: '', visiting: false },
    { patient_id: 9, doctor_id: 4, department_id: 2, register_date: past[5]!, time_slot: '下午', register_fee: 20, status: 1, is_paid: 1, pay_time: now, symptom_desc: '咳嗽有痰', diagnosis: '急性支气管炎', visiting: false },
    { patient_id: 10, doctor_id: 8, department_id: 20, register_date: dates[4]!, time_slot: '下午', register_fee: 28, status: 0, is_paid: 0, pay_time: null, symptom_desc: '视物模糊', diagnosis: '', visiting: false },
    { patient_id: 11, doctor_id: 9, department_id: 13, register_date: dates[5]!, time_slot: '上午', register_fee: 18, status: 0, is_paid: 1, pay_time: now, symptom_desc: '腰痛活动受限', diagnosis: '', visiting: false },
    { patient_id: 12, doctor_id: 6, department_id: 15, register_date: dates[6]!, time_slot: '上午', register_fee: 35, status: 0, is_paid: 1, pay_time: now, symptom_desc: '月经不调', diagnosis: '', visiting: false },
    { patient_id: 1, doctor_id: 3, department_id: 9, register_date: dates[1]!, time_slot: '上午', register_fee: 15, status: 0, is_paid: 1, pay_time: now, symptom_desc: '上腹隐痛一周', diagnosis: '', visiting: false },
    { patient_id: 4, doctor_id: 3, department_id: 9, register_date: past[6]!, time_slot: '下午', register_fee: 15, status: 1, is_paid: 1, pay_time: now, symptom_desc: '术后换药', diagnosis: '伤口愈合良好', visiting: false },
    { patient_id: 1, doctor_id: 1, department_id: 1, register_date: past[4]!, time_slot: '上午', register_fee: 10, status: 1, is_paid: 1, pay_time: now, symptom_desc: '头晕', diagnosis: '椎基底动脉供血不足（轻度）', visit_end_time: `${past[4]} 10:38:00`, visiting: false },
    { patient_id: 1, doctor_id: 2, department_id: 5, register_date: past[5]!, time_slot: '下午', register_fee: 30, status: 1, is_paid: 1, pay_time: now, symptom_desc: '活动后心悸', diagnosis: '窦性心动过速', visiting: false },
    { patient_id: 1, doctor_id: 5, department_id: 24, register_date: past[6]!, time_slot: '下午', register_fee: 25, status: 1, is_paid: 1, pay_time: now, symptom_desc: '胃脘胀满', diagnosis: '脾虚湿困', visiting: false },
    { patient_id: 13, doctor_id: 7, department_id: 17, register_date: dates[0]!, time_slot: '上午', register_fee: 12, status: 0, is_paid: 1, pay_time: now, symptom_desc: '哮喘复诊', diagnosis: '', visiting: false },
    { patient_id: 14, doctor_id: 9, department_id: 13, register_date: dates[7]!, time_slot: '下午', register_fee: 18, status: 0, is_paid: 0, pay_time: null, symptom_desc: '膝关节痛', diagnosis: '', visiting: false },
    { patient_id: 1, doctor_id: 1, department_id: 1, register_date: dates[2]!, time_slot: '下午', register_fee: 10, status: 2, is_paid: 1, pay_time: now, symptom_desc: '复查', diagnosis: '', visiting: false },
    { patient_id: 3, doctor_id: 10, department_id: 12, register_date: dates[8]!, time_slot: '上午', register_fee: 22, status: 0, is_paid: 1, pay_time: now, symptom_desc: '尿频', diagnosis: '', visiting: false },
    { patient_id: 7, doctor_id: 12, department_id: 19, register_date: dates[9]!, time_slot: '下午', register_fee: 15, status: 0, is_paid: 0, pay_time: null, symptom_desc: '耳鸣', diagnosis: '', visiting: false },
    { patient_id: 11, doctor_id: 14, department_id: 11, register_date: dates[10]!, time_slot: '上午', register_fee: 40, status: 0, is_paid: 1, pay_time: now, symptom_desc: '头痛呕吐', diagnosis: '', visiting: false },
    { patient_id: 6, doctor_id: 1, department_id: 1, register_date: allDates[3]!, time_slot: '下午', register_fee: 10, status: 1, is_paid: 1, pay_time: now, symptom_desc: '偏头痛', diagnosis: '紧张型头痛', visit_end_time: `${allDates[3]} 16:20:00`, visiting: false },
    { patient_id: 8, doctor_id: 8, department_id: 20, register_date: allDates[2]!, time_slot: '上午', register_fee: 28, status: 1, is_paid: 1, pay_time: now, symptom_desc: '结膜炎', diagnosis: '过敏性结膜炎', visiting: false },
    { patient_id: 9, doctor_id: 4, department_id: 2, register_date: allDates[1]!, time_slot: '上午', register_fee: 20, status: 1, is_paid: 1, pay_time: now, symptom_desc: '气促', diagnosis: '慢阻肺急性加重', visiting: false },
    { patient_id: 10, doctor_id: 11, department_id: 3, register_date: allDates[4]!, time_slot: '下午', register_fee: 32, status: 1, is_paid: 1, pay_time: now, symptom_desc: '甲状腺复查', diagnosis: '甲功正常，继续观察', visiting: false },
    { patient_id: 12, doctor_id: 6, department_id: 15, register_date: allDates[5]!, time_slot: '下午', register_fee: 35, status: 1, is_paid: 1, pay_time: now, symptom_desc: '备孕咨询', diagnosis: '孕前检查已完成', visiting: false },
  ]

  const extras = buildDoctorRegistrationExtras()
  const all = [...templates, ...extras]
  return all.map((t, i) => ({
    ...t,
    register_id: i + 1,
    register_no: `GH${today.format('YYYYMMDD')}${String(i + 1).padStart(4, '0')}`,
  }))
}

export const MOCK_REVIEWS: Review[] = [
  { review_id: 1, register_id: 9, patient_id: 9, doctor_id: 4, score: 5, content: '医生讲解清楚，用药交代细致。' },
  { review_id: 2, register_id: 14, patient_id: 4, doctor_id: 3, score: 4, content: '伤口处理专业，候诊略久。' },
  { review_id: 3, register_id: 16, patient_id: 1, doctor_id: 2, score: 5, content: '心血管随诊很满意，会按时复查。' },
  { review_id: 4, register_id: 15, patient_id: 1, doctor_id: 1, score: 5, content: '诊断明确，态度亲切。' },
  { review_id: 5, register_id: 17, patient_id: 1, doctor_id: 5, score: 4, content: '中药调理有效，建议坚持服药。' },
  { review_id: 6, register_id: 24, patient_id: 6, doctor_id: 1, score: 5, content: '头痛明显缓解。' },
  { review_id: 7, register_id: 25, patient_id: 8, doctor_id: 8, score: 4, content: '眼科检查细致。' },
  { review_id: 8, register_id: 26, patient_id: 9, doctor_id: 4, score: 5, content: '慢阻肺用药指导到位。' },
]
