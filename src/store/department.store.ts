import type { Department } from '~/types/outpatient'
import { createGlobalState } from '@vueuse/core'
import { useCurd } from '~/hooks'

/** 与论文图 5.10 一致：各科室含简介 description，便于患者端展示 */
const initData: Department[] = [
  { department_id: 1, dept_name: '神经内科', dept_code: 'NK-SJ', description: '脑血管病、帕金森、癫痫等神经系统疾病诊疗。', location: '门诊楼2层A区', status: 1, category: '内科' },
  { department_id: 2, dept_name: '呼吸与危重症医学科', dept_code: 'NK-HX', description: '慢阻肺、哮喘、肺部感染及呼吸危重症救治。', location: '门诊楼2层B区', status: 1, category: '内科' },
  { department_id: 3, dept_name: '内分泌科', dept_code: 'NK-NF', description: '糖尿病、甲状腺疾病及代谢性疾病管理。', location: '门诊楼2层C区', status: 1, category: '内科' },
  { department_id: 4, dept_name: '消化内科', dept_code: 'NK-XH', description: '胃肠肝病、内镜诊疗与消化道早癌筛查。', location: '门诊楼2层D区', status: 1, category: '内科' },
  { department_id: 5, dept_name: '心血管内科', dept_code: 'NK-XG', description: '冠心病、高血压、心衰、心律失常介入与药物管理。', location: '门诊楼2层E区', status: 1, category: '内科' },
  { department_id: 6, dept_name: '肾内科', dept_code: 'NK-SZ', description: '肾炎、肾衰竭、透析相关慢性肾病全程管理。', location: '门诊楼2层F区', status: 1, category: '内科' },
  { department_id: 22, dept_name: '血液内科', dept_code: 'NK-XY', description: '贫血、白血病、淋巴瘤等血液系统疾病诊治。', location: '门诊楼2层G区', status: 1, category: '内科' },
  { department_id: 7, dept_name: '发热门诊', dept_code: 'NK-FR', description: '发热筛查、呼吸道传染病初诊与分流。', location: '门诊楼1层东侧', status: 1, category: '内科' },
  { department_id: 8, dept_name: '手足外科', dept_code: 'WK-SZ', description: '手足创伤、畸形矫正与显微外科修复。', location: '门诊楼3层A区', status: 1, category: '外科' },
  { department_id: 9, dept_name: '普通外科', dept_code: 'WK-PT', description: '胃肠肝胆、疝与甲状腺等普外常见病微创手术。', location: '门诊楼3层B区', status: 1, category: '外科' },
  { department_id: 10, dept_name: '肛肠外科', dept_code: 'WK-GC', description: '痔瘘裂、结直肠良恶性疾病外科治疗。', location: '门诊楼3层C区', status: 1, category: '外科' },
  { department_id: 11, dept_name: '神经外科', dept_code: 'WK-SJ', description: '颅脑外伤、脑肿瘤、脑血管病外科干预。', location: '门诊楼3层D区', status: 1, category: '外科' },
  { department_id: 12, dept_name: '泌尿外科', dept_code: 'WK-MN', description: '结石、前列腺疾病及泌尿系肿瘤微创治疗。', location: '门诊楼3层E区', status: 1, category: '外科' },
  { department_id: 13, dept_name: '骨科', dept_code: 'WK-GK', description: '骨关节创伤、脊柱疾病与关节置换。', location: '门诊楼3层F区', status: 1, category: '外科' },
  { department_id: 14, dept_name: '综合普外科', dept_code: 'WK-ZH', description: '普外综合门诊与术前评估、术后随访。', location: '门诊楼3层G区', status: 1, category: '外科' },
  { department_id: 23, dept_name: '烧伤整形外科', dept_code: 'WK-SS', description: '烧伤救治、创面修复与医学美容整形。', location: '门诊楼3层H区', status: 1, category: '外科' },
  { department_id: 15, dept_name: '妇科', dept_code: 'FC-FK', description: '妇科肿瘤、月经病、宫颈疾病及微创妇科。', location: '门诊楼4层A区', status: 1, category: '妇产科' },
  { department_id: 16, dept_name: '产科', dept_code: 'FC-CK', description: '围产期保健、高危妊娠与分娩指导。', location: '门诊楼4层B区', status: 1, category: '妇产科' },
  { department_id: 17, dept_name: '儿科', dept_code: 'EK-EK', description: '儿童呼吸、消化及常见病多发病诊疗。', location: '门诊楼1层儿科诊区', status: 1, category: '儿科' },
  { department_id: 18, dept_name: '儿童保健科', dept_code: 'EK-BJ', description: '生长发育评估、营养指导与预防接种咨询。', location: '门诊楼1层保健区', status: 1, category: '儿科' },
  { department_id: 19, dept_name: '耳鼻咽喉科', dept_code: 'WG-EB', description: '鼻炎、中耳炎、咽喉疾病及听力筛查。', location: '门诊楼5层A区', status: 1, category: '五官科' },
  { department_id: 20, dept_name: '眼科', dept_code: 'WG-YK', description: '屈光、白内障、青光眼及眼底病诊疗。', location: '门诊楼5层B区', status: 1, category: '五官科' },
  { department_id: 21, dept_name: '口腔科', dept_code: 'WG-KQ', description: '牙体牙髓、修复正畸及口腔黏膜病。', location: '门诊楼5层C区', status: 1, category: '五官科' },
  { department_id: 24, dept_name: '中医内科', dept_code: 'ZY-ZN', description: '中医辨证调理、脾胃病及亚健康干预。', location: '门诊楼6层A区', status: 1, category: '中医科' },
  { department_id: 25, dept_name: '针灸推拿科', dept_code: 'ZY-ZJ', description: '针灸、推拿及颈肩腰腿痛保守治疗。', location: '门诊楼6层B区', status: 1, category: '中医科' },
]

export const useDepartmentStore = createGlobalState(() => {
  return useCurd<Department>({ key: 'outpatient-department-list-v4', initData })
})
