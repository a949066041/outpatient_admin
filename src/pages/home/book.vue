<script setup lang="ts">
import type { Doctor, Registration } from '~/types/outpatient'
import dayjs from 'dayjs'
import { NButton } from 'naive-ui'
import { h } from 'vue'
import {
  useDepartmentStore,
  useDoctorStore,
  useLoginStore,
  usePatientStore,
  useRegistrationStore,
  useReviewStore,
  useScheduleStore,
} from '~/store'

const message = useMessage()
const { dataList: departments } = useDepartmentStore()
const { dataList: doctors } = useDoctorStore()
const { dataList: schedules } = useScheduleStore()
const { list: registrations, book, isSlotFull, hasConflict } = useRegistrationStore()
const { avgScoreForDoctor } = useReviewStore()
const { currentProfile, currentRole } = useLoginStore()
const patientRow = computed(() => {
  if (!currentProfile.value)
    return null
  const { dataList } = usePatientStore()
  return dataList.value.find(p => p.patient_id === currentProfile.value!.id) ?? null
})

/** 与论文患者端图 5.10 一致的一级分类（含中医科） */
const CATEGORY_ORDER = ['内科', '外科', '妇产科', '儿科', '五官科', '中医科'] as const

const step = ref<1 | 2>(1)
const deptId = ref<number | null>(null)
const pickDate = ref(dayjs().format('YYYY-MM-DD'))
const doctorId = ref<number | null>(null)
/** 勿用变量名 slot，避免与模板/SFC 语义冲突导致 v-model 不同步 */
const pickedTimeSlot = ref('')

/** 论文图 5.12：填写挂号信息弹窗 */
const showBookForm = ref(false)

/** 论文图 5.12：预约成功后展示挂号详情 */
const showSuccessDetail = ref(false)
const successDetail = ref<{
  register_no: string
  register_date: string
  time_slot: string
  location: string
  queue_no: number
  register_fee: number
} | null>(null)

function deptLocation(deptId: number) {
  return departments.value.find(d => d.department_id === deptId)?.location ?? '—'
}

/** 同日同时段同医生的排队序号（含本人） */
function queueNoFor(reg: Registration) {
  return registrations.value.filter(
    r =>
      r.register_date === reg.register_date
      && r.doctor_id === reg.doctor_id
      && r.time_slot === reg.time_slot
      && r.status !== 2
      && r.register_id <= reg.register_id,
  ).length
}

const selectedDeptName = computed(() =>
  departments.value.find(d => d.department_id === deptId.value)?.dept_name ?? '',
)

const selectedDoctor = computed(() =>
  doctorId.value == null ? null : doctors.value.find(d => d.doctor_id === doctorId.value) ?? null,
)

const departmentGroups = computed(() => {
  const groups: { title: string, items: typeof departments.value }[] = []
  for (const c of CATEGORY_ORDER) {
    const rows = departments.value.filter(d => d.status === 1 && d.category === c)
    if (rows.length)
      groups.push({ title: c, items: rows })
  }
  const rest = departments.value.filter(d => d.status === 1 && !d.category)
  if (rest.length)
    groups.push({ title: '其他', items: rest })
  return groups
})

/** 论文图 5.11：未来 7 天日期条 */
const dateStrip = computed(() => {
  const list: { label: string, full: string }[] = []
  for (let i = 0; i < 7; i++) {
    const d = dayjs().add(i, 'day')
    list.push({ label: d.format('MM-DD'), full: d.format('YYYY-MM-DD') })
  }
  return list
})

/** 当日、本科室、在排班表中有正常出诊记录的医生（动态号源） */
const doctorsOnDuty = computed(() => {
  if (!deptId.value || !pickDate.value)
    return []
  const onDutyIds = new Set(
    schedules.value
      .filter(
        s =>
          s.work_date === pickDate.value
          && s.department_id === deptId.value
          && s.status === 1,
      )
      .map(s => s.doctor_id),
  )
  return doctors.value.filter(
    d =>
      onDutyIds.has(d.doctor_id)
      && d.department_id === deptId.value
      && d.status === 1,
  )
})

const doctorSchedules = computed(() => {
  if (!doctorId.value || !pickDate.value)
    return []
  return schedules.value.filter(
    s =>
      s.doctor_id === doctorId.value
      && s.work_date === pickDate.value
      && s.status === 1,
  )
})

/** 同一医生同日若存在重复排班记录，只保留一条时段，避免 v-for 同 value 导致单选状态错乱 */
const slotOptions = computed(() => {
  const seen = new Set<string>()
  const rows = doctorSchedules.value.filter((s) => {
    if (seen.has(s.time_slot))
      return false
    seen.add(s.time_slot)
    return true
  })
  return rows.map((s) => {
    const full = s.booked_count >= s.max_patients
    return {
      label: `${s.time_slot}（剩余 ${Math.max(0, s.max_patients - s.booked_count)} / ${s.max_patients}）`,
      value: s.time_slot,
      disabled: full,
    }
  })
})

function deptName(id: number) {
  return departments.value.find(d => d.department_id === id)?.dept_name ?? '-'
}

function regFee(d: Doctor) {
  return d.register_fee ?? 10
}

function pickDepartment(id: number) {
  deptId.value = id
  pickDate.value = dayjs().format('YYYY-MM-DD')
  doctorId.value = null
  pickedTimeSlot.value = ''
  step.value = 2
}

function goStep1() {
  step.value = 1
  deptId.value = null
  doctorId.value = null
  pickedTimeSlot.value = ''
}

function goStep2() {
  pickedTimeSlot.value = ''
  showBookForm.value = false
}

function pickDateBtn(full: string) {
  pickDate.value = full
  doctorId.value = null
  pickedTimeSlot.value = ''
}

function openSlotStep(row: Doctor) {
  doctorId.value = row.doctor_id
  pickedTimeSlot.value = ''
  showBookForm.value = true
}

function closeBookForm() {
  showBookForm.value = false
  pickedTimeSlot.value = ''
}

function confirmBook() {
  if (!currentProfile.value) {
    message.warning('登录已失效或未找到账号信息，请重新登录患者账号后再预约')
    return
  }
  if (currentRole.value !== '患者') {
    message.warning('当前为管理员等非患者身份，请使用患者账号登录后再预约挂号')
    return
  }
  if (!deptId.value || !doctorId.value) {
    message.warning('请选择科室与医生')
    return
  }
  if (!pickedTimeSlot.value) {
    message.warning('请选择时段')
    return
  }
  if (isSlotFull(doctorId.value, pickDate.value, pickedTimeSlot.value)) {
    message.error('该时段号源已满，请选择其他时段或医生')
    return
  }
  if (hasConflict(currentProfile.value.id as number, pickDate.value, pickedTimeSlot.value)) {
    message.error('您在该时段已有其他预约，请取消原预约后再试')
    return
  }
  const doc = doctors.value.find(d => d.doctor_id === doctorId.value)
  const fee = regFee(doc!)
  const res = book({
    patient_id: currentProfile.value.id as number,
    doctor_id: doctorId.value,
    department_id: deptId.value,
    register_date: pickDate.value,
    time_slot: pickedTimeSlot.value,
    register_fee: fee,
  })
  if (!res.ok) {
    message.error(res.message || '预约失败')
    return
  }
  const reg = res.registration!
  successDetail.value = {
    register_no: reg.register_no,
    register_date: reg.register_date,
    time_slot: reg.time_slot,
    location: deptLocation(deptId.value),
    queue_no: queueNoFor(reg),
    register_fee: fee,
  }
  showSuccessDetail.value = true
  showBookForm.value = false
  message.success('预约成功')
}

const doctorColumns = [
  {
    title: '序号',
    key: 'idx',
    width: 64,
    render: (_row: Doctor, index: number) => index + 1,
  },
  { title: '工号', key: 'doctor_no', width: 88 },
  { title: '姓名', key: 'name', width: 88 },
  {
    title: '性别',
    key: 'gender',
    width: 64,
    render: (row: Doctor) => (row.gender === 1 ? '男' : '女'),
  },
  { title: '职位', key: 'title', ellipsis: { tooltip: true } },
  {
    title: '科室',
    key: 'dept',
    ellipsis: { tooltip: true },
    render: (row: Doctor) => deptName(row.department_id),
  },
  {
    title: '擅长领域',
    key: 'introduction',
    ellipsis: { tooltip: true },
  },
  {
    title: '挂号费用/元',
    key: 'fee',
    width: 110,
    render: (row: Doctor) => regFee(row),
  },
  {
    title: '评分/5分',
    key: 'score',
    width: 96,
    render: (row: Doctor) => avgScoreForDoctor(row.doctor_id),
  },
  {
    title: '操作',
    key: 'op',
    width: 100,
    render: (row: Doctor) =>
      h(
        NButton,
        {
          type: 'primary',
          size: 'small',
          onClick: () => openSlotStep(row),
        },
        { default: () => '挂号' },
      ),
  },
]
</script>

<template>
  <div class="book-page text-slate-800">
    <n-h2 prefix="bar">
      预约挂号
    </n-h2>

    <!-- 论文：科室选择 > 日期选择 > 挂号 -->
    <div class="mb-6 flex flex-wrap items-center gap-1 text-sm text-slate-600">
      <span
        class="cursor-pointer font-medium text-teal-700 hover:underline"
        @click="goStep1"
      >科室选择</span>
      <span class="text-slate-300">></span>
      <span
        class="cursor-pointer"
        :class="step >= 2 ? 'font-medium text-teal-700 hover:underline' : ''"
        @click="undefined"
      >日期选择</span>
      <span class="text-slate-300">></span>
      <span class="text-slate-400">挂号</span>
    </div>

    <!-- 第一步：图 5.10 全院科室列表及各科室简介 -->
    <section v-show="step === 1">
      <p class="mb-4 text-sm text-slate-600">
        请选择目标就诊科室；鼠标悬停可查看科室简介，辅助您合理选择。
      </p>
      <div v-for="grp in departmentGroups" :key="grp.title" class="mb-5">
        <h3 class="mb-2 border-b border-slate-200 pb-1 text-sm font-bold text-slate-800">
          {{ grp.title }}
        </h3>
        <div class="flex flex-wrap gap-2">
          <n-tooltip v-for="d in grp.items" :key="d.department_id" trigger="hover">
            <template #trigger>
              <NButton
                secondary
                class="!border-blue-200 !text-blue-800 hover:!border-blue-400"
                @click="pickDepartment(d.department_id)"
              >
                {{ d.dept_name }}
              </NButton>
            </template>
            <div class="max-w-xs text-sm">
              <div class="font-medium">
                {{ d.dept_name }}
              </div>
              <div class="mt-1 text-slate-200">
                {{ d.description || '（暂无简介）' }}
              </div>
              <div class="mt-1 text-xs opacity-90">
                位置：{{ d.location }}
              </div>
            </div>
          </n-tooltip>
        </div>
      </div>
    </section>

    <!-- 第二步：图 5.11 日期 + 动态值班医生（职称、擅长、评价） -->
    <section v-show="step === 2 && deptId">
      <p class="mb-2 text-sm text-slate-600">
        当前科室：<span class="font-semibold text-slate-800">{{ selectedDeptName }}</span>
        <span class="mx-2 text-slate-300">|</span>
        <span>{{ departments.find(x => x.department_id === deptId)?.description }}</span>
      </p>
      <h3 class="mb-3 text-base font-semibold text-slate-700">
        请选择你要挂号的日期：
      </h3>
      <div class="mb-6 flex flex-wrap gap-2">
        <button
          v-for="opt in dateStrip"
          :key="opt.full"
          type="button"
          class="min-w-[3.75rem] rounded-md px-3 py-2 text-sm font-medium text-white shadow transition focus:outline-none focus:ring-2 focus:ring-blue-400"
          :class="opt.full === pickDate ? 'bg-blue-800 ring-2 ring-blue-300 ring-offset-1' : 'bg-blue-600 hover:bg-blue-700'"
          @click="pickDateBtn(opt.full)"
        >
          {{ opt.label }}
        </button>
      </div>

      <n-empty
        v-if="!doctorsOnDuty.length"
        description="当日该科室暂无出诊医生或号源未开放，请更换日期或返回选择其他科室"
        class="my-8"
      />
      <template v-else>
        <h3 class="mb-3 flex items-center gap-2 text-base font-semibold text-slate-800">
          <span class="icon-[icon-park-outline--stethoscope] text-teal-600" />
          {{ selectedDeptName }}医生列表
        </h3>
        <n-data-table
          :columns="doctorColumns"
          :data="doctorsOnDuty"
          :bordered="true"
          :single-line="false"
          size="small"
          :pagination="{ pageSize: 8 }"
        />
      </template>

      <NButton class="mt-6" @click="goStep1">
        返回选择科室
      </NButton>
    </section>

    <!-- 图 5.12：填写挂号信息 -->
    <n-modal
      v-model:show="showBookForm"
      preset="dialog"
      title="填写挂号信息"
      :mask-closable="false"
      style="width: 520px; max-width: 95vw"
    >
      <n-form label-placement="left" label-width="110">
        <n-form-item label="挂号时间段" required>
          <n-select
            v-model:value="pickedTimeSlot"
            placeholder="请选择时段"
            :options="slotOptions.map(o => ({ label: o.disabled ? `${o.label}（已满）` : o.label, value: o.value, disabled: o.disabled }))"
          />
        </n-form-item>
        <n-form-item label="挂号日期">
          <n-input :value="pickDate" readonly />
        </n-form-item>
        <n-form-item label="医生工号">
          <n-input :value="selectedDoctor?.doctor_no ?? ''" readonly />
        </n-form-item>
        <n-form-item label="医生姓名">
          <n-input :value="selectedDoctor?.name ?? ''" readonly />
        </n-form-item>
        <n-form-item label="患者姓名">
          <n-input :value="patientRow?.real_name ?? currentProfile?.displayName ?? ''" readonly />
        </n-form-item>
        <n-form-item label="患者身份证号">
          <n-input :value="patientRow?.id_card ?? ''" readonly />
        </n-form-item>
        <n-form-item label="挂号费用">
          <n-input :value="`¥${selectedDoctor ? regFee(selectedDoctor) : 0}`" readonly />
        </n-form-item>
      </n-form>
      <template #action>
        <NButton @click="closeBookForm">
          取消
        </NButton>
        <NButton
          type="primary"
          :disabled="!pickedTimeSlot || !!slotOptions.find(o => o.value === pickedTimeSlot && o.disabled) || currentRole !== '患者'"
          @click="confirmBook"
        >
          确定
        </NButton>
      </template>
    </n-modal>

    <n-modal
      v-model:show="showSuccessDetail"
      preset="dialog"
      title="挂号详情"
      positive-text="完成"
      @positive-click="() => { showSuccessDetail = false; goStep1() }"
    >
      <template v-if="successDetail">
        <n-descriptions :column="1" label-placement="left" bordered size="small">
          <n-descriptions-item label="挂号单号">
            {{ successDetail.register_no }}
          </n-descriptions-item>
          <n-descriptions-item label="就诊时间">
            {{ successDetail.register_date }} {{ successDetail.time_slot }}
          </n-descriptions-item>
          <n-descriptions-item label="就诊地点">
            {{ successDetail.location }}
          </n-descriptions-item>
          <n-descriptions-item label="排队序号">
            第 {{ successDetail.queue_no }} 号（同医生同日上午/下午序）
          </n-descriptions-item>
          <n-descriptions-item label="挂号费用">
            ¥{{ successDetail.register_fee }}（请至「我的挂号」在线支付）
          </n-descriptions-item>
        </n-descriptions>
        <p class="mt-3 text-xs text-slate-500">
          请提前 15 分钟到达诊区候诊，携带有效证件。
        </p>
      </template>
    </n-modal>
  </div>
</template>
