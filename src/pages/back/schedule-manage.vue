<script setup lang="ts">
import type { Doctor, Schedule } from '~/types/outpatient'
import dayjs from 'dayjs'
import { NButton } from 'naive-ui'
import { useDepartmentStore, useDoctorStore, useScheduleStore } from '~/store'
import { nextNumericId } from '~/utils/outpatient'

const message = useMessage()
const dialog = useDialog()
const { dataList, updateData, addData, removeData } = useScheduleStore()
const { dataList: doctors } = useDoctorStore()
const { dataList: departments } = useDepartmentStore()

/** 与论文图 5.4 及患者端一致，含中医科 */
const CATEGORY_ORDER = ['内科', '外科', '妇产科', '儿科', '五官科', '中医科'] as const

const dateOptions = computed(() => {
  const list: { label: string, full: string }[] = []
  for (let i = 0; i < 25; i++) {
    const d = dayjs().add(i, 'day')
    list.push({ label: d.format('MM-DD'), full: d.format('YYYY-MM-DD') })
  }
  return list
})

const selectedDateFull = ref(dayjs().format('YYYY-MM-DD'))
const step = ref<'dept' | 'doctor'>('dept')
const selectedDepartmentId = ref<number | null>(null)
const searchName = ref('')
const docPage = ref(1)
const docPageSize = ref(10)

/** 排班记录查询（论文：排班信息查询与维护） */
const recordFilterDate = ref<string | null>(null)
const recordFilterDeptId = ref<number | null>(null)
const recordFilterStatus = ref<'all' | '1' | '0'>('all')
const recordSearchDoctor = ref('')

const selectedDepartment = computed(() =>
  departments.value.find(d => d.department_id === selectedDepartmentId.value) ?? null,
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

watch(selectedDepartmentId, () => {
  docPage.value = 1
  searchName.value = ''
})

watch(step, (s) => {
  if (s === 'dept')
    selectedDepartmentId.value = null
})

/** 科室被删或 id 失效时，避免仍停留在医生步且 selectedDepartment 为 null 导致渲染异常 */
watch(selectedDepartment, (d) => {
  if (step.value === 'doctor' && !d)
    step.value = 'dept'
})

const filteredDoctors = computed(() => {
  if (!selectedDepartmentId.value)
    return []
  let list = doctors.value.filter(
    d => d.department_id === selectedDepartmentId.value && d.status === 1,
  )
  const q = searchName.value.trim()
  if (q)
    list = list.filter(d => d.name.includes(q) || d.doctor_no.includes(q))
  return list
})

const docPageData = computed(() => {
  const start = (docPage.value - 1) * docPageSize.value
  return filteredDoctors.value.slice(start, start + docPageSize.value)
})

const docTotal = computed(() => filteredDoctors.value.length)

watch(docPageSize, () => {
  docPage.value = 1
})

/** 当前所选日期 + 科室下已有排班（图 5.5：便于管理员查看与维护） */
const schedulesCurrentDeptDay = computed(() => {
  if (!selectedDepartmentId.value || !selectedDateFull.value)
    return []
  return dataList.value
    .filter(
      s =>
        s.work_date === selectedDateFull.value
        && s.department_id === selectedDepartmentId.value,
    )
    .slice()
    .sort((a, b) => {
      const na = docName(a.doctor_id).localeCompare(docName(b.doctor_id), 'zh')
      if (na !== 0)
        return na
      return a.time_slot.localeCompare(b.time_slot, 'zh')
    })
})

const filteredScheduleRecords = computed(() => {
  let rows = dataList.value.slice()
  if (recordFilterDate.value)
    rows = rows.filter(s => s.work_date === recordFilterDate.value)
  if (recordFilterDeptId.value != null)
    rows = rows.filter(s => s.department_id === recordFilterDeptId.value)
  if (recordFilterStatus.value !== 'all')
    rows = rows.filter(s => String(s.status) === recordFilterStatus.value)
  const q = recordSearchDoctor.value.trim()
  if (q) {
    rows = rows.filter((s) => {
      const name = docName(s.doctor_id)
      const no = doctors.value.find(d => d.doctor_id === s.doctor_id)?.doctor_no ?? ''
      return name.includes(q) || no.includes(q)
    })
  }
  return rows.sort((a, b) => {
    const c = b.work_date.localeCompare(a.work_date)
    if (c !== 0)
      return c
    return a.schedule_id - b.schedule_id
  })
})

function pickDate(full: string) {
  selectedDateFull.value = full
  step.value = 'dept'
  selectedDepartmentId.value = null
}

function pickDepartment(deptId: number) {
  selectedDepartmentId.value = deptId
  step.value = 'doctor'
}

function backToDepartments() {
  step.value = 'dept'
  selectedDepartmentId.value = null
}

const showScheduleModal = ref(false)
/** 正在编辑的排班；为空表示新增 */
const editingSchedule = ref<Schedule | null>(null)
const scheduleForm = reactive({
  doctor_id: null as number | null,
  time_slot: '上午',
  max_patients: 20,
})

const modalTitle = computed(() =>
  editingSchedule.value ? '修改排班' : '新增排班',
)

const modalWorkDate = computed(() =>
  editingSchedule.value?.work_date ?? selectedDateFull.value,
)

const modalDeptName = computed(() => {
  const id = editingSchedule.value?.department_id ?? selectedDepartmentId.value
  return id != null ? deptName(id) : '-'
})

function openScheduleModal(row: Doctor) {
  editingSchedule.value = null
  scheduleForm.doctor_id = row.doctor_id
  scheduleForm.time_slot = '上午'
  scheduleForm.max_patients = 20
  showScheduleModal.value = true
}

function openEditScheduleModal(row: Schedule) {
  editingSchedule.value = row
  scheduleForm.doctor_id = row.doctor_id
  scheduleForm.time_slot = row.time_slot
  scheduleForm.max_patients = row.max_patients
  showScheduleModal.value = true
}

function onScheduleModalLeave() {
  editingSchedule.value = null
}

function saveSchedule() {
  const workDate = modalWorkDate.value
  const deptId = editingSchedule.value?.department_id ?? selectedDepartmentId.value

  if (!workDate || deptId == null || !scheduleForm.doctor_id) {
    message.warning('请完善排班信息')
    return
  }

  if (scheduleForm.max_patients < 1) {
    message.warning('最大接诊人数须至少为 1')
    return
  }

  if (editingSchedule.value) {
    const old = editingSchedule.value
    if (scheduleForm.max_patients < old.booked_count) {
      message.error(`号源上限不能小于已预约人数（当前已约 ${old.booked_count} 人）`)
      return
    }
    const dup = dataList.value.some(
      s =>
        s.doctor_id === scheduleForm.doctor_id
        && s.work_date === workDate
        && s.time_slot === scheduleForm.time_slot
        && s.schedule_id !== old.schedule_id,
    )
    if (dup) {
      message.error('该医生在该日该时段已存在其他排班记录')
      return
    }
    const i = dataList.value.findIndex(s => s.schedule_id === old.schedule_id)
    if (i < 0)
      return
    const cur = dataList.value[i]!
    updateData(i, {
      ...cur,
      time_slot: scheduleForm.time_slot,
      max_patients: scheduleForm.max_patients,
    })
    message.success('排班已更新')
    showScheduleModal.value = false
    editingSchedule.value = null
    return
  }

  const dup = dataList.value.some(
    s =>
      s.doctor_id === scheduleForm.doctor_id
      && s.work_date === workDate
      && s.time_slot === scheduleForm.time_slot,
  )
  console.log('dup', dup, dataList.value)
  if (dup) {
    message.error('该医生在该日该时段已存在排班')
    return
  }
  addData({
    schedule_id: nextNumericId(dataList.value, 'schedule_id'),
    doctor_id: scheduleForm.doctor_id,
    department_id: deptId,
    work_date: workDate,
    time_slot: scheduleForm.time_slot,
    max_patients: scheduleForm.max_patients,
    booked_count: 0,
    status: 1,
  })
  message.success('排班已保存')
  showScheduleModal.value = false
}

function toggleScheduleStatus(row: Schedule) {
  const i = dataList.value.findIndex(s => s.schedule_id === row.schedule_id)
  if (i < 0)
    return
  const cur = dataList.value[i]!
  const next = cur.status === 1 ? 0 : 1
  updateData(i, { ...cur, status: next as 0 | 1 })
  message.success(next === 1 ? '已恢复出诊' : '已设为停诊')
}

function delRow(row: Schedule) {
  if (row.booked_count > 0) {
    message.error(`已有 ${row.booked_count} 人预约，无法删除。可先设为停诊，待患者退号后再删。`)
    return
  }
  dialog.warning({
    title: '删除排班',
    content: `确定删除「${docName(row.doctor_id)}」在 ${row.work_date} ${row.time_slot} 的排班吗？`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: () => {
      const i = dataList.value.findIndex(s => s.schedule_id === row.schedule_id)
      if (i >= 0)
        removeData(i)
      message.success('已删除')
    },
  })
}

function deptName(id: number) {
  return departments.value.find(d => d.department_id === id)?.dept_name ?? '-'
}
function docName(id: number) {
  return doctors.value.find(d => d.doctor_id === id)?.name ?? '-'
}

function scheduleActions(row: Schedule) {
  return h('div', { class: 'flex flex-wrap gap-1' }, [
    h(
      NButton,
      { size: 'small', tertiary: true, onClick: () => openEditScheduleModal(row) },
      { default: () => '编辑' },
    ),
    h(
      NButton,
      {
        size: 'small',
        tertiary: true,
        type: row.status === 1 ? 'warning' : 'success',
        onClick: () => toggleScheduleStatus(row),
      },
      { default: () => (row.status === 1 ? '停诊' : '恢复出诊') },
    ),
    h(
      NButton,
      { size: 'small', type: 'error', quaternary: true, onClick: () => delRow(row) },
      { default: () => '删除' },
    ),
  ])
}

const sliceColumns = [
  { title: '医生', key: 'doctor_id', width: 100, render: (row: Schedule) => docName(row.doctor_id) },
  { title: '时段', key: 'time_slot', width: 88 },
  { title: '号源', key: 'booked_count', render: (row: Schedule) => `${row.booked_count}/${row.max_patients}` },
  {
    title: '状态',
    key: 'status',
    width: 80,
    render: (row: Schedule) => (row.status === 1 ? '正常' : '停诊'),
  },
  { title: '操作', key: 'a', width: 220, render: (row: Schedule) => scheduleActions(row) },
]

const recordColumns = [
  { title: '日期', key: 'work_date', width: 112 },
  { title: '科室', key: 'department_id', render: (row: Schedule) => deptName(row.department_id) },
  { title: '医生', key: 'doctor_id', render: (row: Schedule) => docName(row.doctor_id) },
  { title: '时段', key: 'time_slot', width: 88 },
  { title: '号源', key: 'booked_count', render: (row: Schedule) => `${row.booked_count}/${row.max_patients}` },
  {
    title: '状态',
    key: 'status',
    width: 80,
    render: (row: Schedule) => (row.status === 1 ? '正常' : '停诊'),
  },
  { title: '操作', key: 'a', width: 240, render: (row: Schedule) => scheduleActions(row) },
]

const doctorColumns = [
  { title: '工号', key: 'doctor_no', width: 100 },
  { title: '姓名', key: 'name', width: 100 },
  {
    title: '性别',
    key: 'gender',
    width: 72,
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
    title: '操作',
    key: 'op',
    width: 100,
    render: (row: Doctor) =>
      h(
        NButton,
        {
          size: 'small',
          type: 'success',
          onClick: () => openScheduleModal(row),
        },
        { default: () => '排班' },
      ),
  },
]

const deptFilterOptions = computed(() =>
  departments.value
    .filter(d => d.status === 1)
    .map(d => ({ label: d.dept_name, value: d.department_id })),
)
</script>

<template>
  <div class="schedule-manage text-slate-800">
    <n-h2 prefix="bar">
      排班信息管理
    </n-h2>
    <p class="mb-6 max-w-3xl text-sm text-slate-600">
      对应论文管理员模块中的<strong>排班信息管理</strong>：先选择<strong>值班日期</strong>，再按一级分类选择<strong>科室</strong>，在医生列表中为医生设置<strong>上午/下午</strong>时段与<strong>号源上限</strong>；支持对已有排班进行<strong>修改、停诊/恢复、删除</strong>（已有预约的排班不可删除），并在下方进行<strong>全院排班记录查询与维护</strong>。
    </p>

    <!-- 图 5.4：日期条 -->
    <section class="mb-6">
      <h3 class="mb-2 text-base font-semibold text-slate-700">
        第一步：选择值班日期
      </h3>
      <p class="mb-3 text-xs text-slate-500">
        切换日期后将返回「科室选择」，避免误操作其他日期的科室。
      </p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="opt in dateOptions"
          :key="opt.full"
          type="button"
          class="min-w-[4.5rem] rounded-md px-3 py-2 text-sm font-medium text-white shadow transition focus:outline-none focus:ring-2 focus:ring-blue-400"
          :class="opt.full === selectedDateFull
            ? 'bg-blue-800 ring-2 ring-blue-300 ring-offset-1'
            : 'bg-blue-600 hover:bg-blue-700'"
          @click="pickDate(opt.full)"
        >
          {{ opt.label }}
        </button>
      </div>
    </section>

    <!-- 图 5.4：科室分类 -->
    <section v-show="step === 'dept'" class="mb-6">
      <h3 class="mb-3 text-base font-semibold text-slate-700">
        第二步：选择科室（按内科/外科等分类展示）
      </h3>
      <div v-for="grp in departmentGroups" :key="grp.title" class="mb-5">
        <h4 class="mb-2 border-b border-slate-200 pb-1 text-sm font-bold text-slate-800">
          {{ grp.title }}
        </h4>
        <div class="flex flex-wrap gap-2">
          <NButton
            v-for="d in grp.items"
            :key="d.department_id"
            secondary
            class="!border-blue-200 !text-blue-800 hover:!border-blue-400"
            @click="pickDepartment(d.department_id)"
          >
            {{ d.dept_name }}
          </NButton>
        </div>
      </div>
    </section>

    <!-- 图 5.5：医生列表 + 当日本科室已定排班 -->
    <section
      v-if="step === 'doctor' && selectedDepartment"
      class="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
    >
      <h3 class="mb-3 text-base font-semibold text-slate-700">
        第三步：维护当日排班并可为医生新增时段
      </h3>
      <div class="mb-4 flex flex-wrap items-center gap-2 text-sm">
        <NButton text type="primary" @click="backToDepartments">
          返回科室
        </NButton>
        <span class="text-slate-400">></span>
        <span class="font-medium text-slate-800">{{ selectedDepartment?.dept_name ?? '—' }}</span>
        <span class="text-slate-400">|</span>
        <span class="text-slate-600">日期 {{ selectedDateFull }}</span>
      </div>

      <n-card v-if="schedulesCurrentDeptDay.length" class="mb-6" title="当日本科室已定排班" size="small" embedded>
        <n-data-table
          :columns="sliceColumns"
          :data="schedulesCurrentDeptDay"
          :bordered="false"
          size="small"
        />
      </n-card>
      <n-alert v-else type="info" class="mb-6" title="当日该科室尚无排班">
        可在下表选择医生点击「排班」新增上午或下午号源。
      </n-alert>

      <h4 class="mb-3 text-sm font-semibold text-slate-700">
        本科室医生列表（新增排班）
      </h4>
      <div class="mb-4 flex max-w-md gap-2">
        <n-input
          v-model:value="searchName"
          clearable
          placeholder="按姓名或工号查询"
          @keydown.enter.prevent
        />
        <NButton type="primary" secondary @click="docPage = 1">
          <template #icon>
            <span class="icon-[icon-park-outline--search]" />
          </template>
        </NButton>
      </div>
      <n-data-table
        :columns="doctorColumns"
        :data="docPageData"
        :bordered="true"
        :single-line="false"
        size="small"
      />
      <div class="mt-3 flex items-center justify-end gap-4 text-sm text-slate-600">
        <span>共 {{ docTotal }} 条</span>
        <n-pagination
          v-model:page="docPage"
          v-model:page-size="docPageSize"
          :item-count="docTotal"
          show-size-picker
          :page-sizes="[10, 20, 50]"
        />
      </div>
    </section>

    <!-- 新增 / 编辑排班 -->
    <n-modal
      v-model:show="showScheduleModal"
      preset="card"
      :title="modalTitle"
      class="max-w-md"
      @after-leave="onScheduleModalLeave"
    >
      <n-form label-placement="left" label-width="96">
        <n-form-item label="值班日期">
          <n-text>{{ modalWorkDate }}</n-text>
        </n-form-item>
        <n-form-item label="科室">
          <n-text>{{ modalDeptName }}</n-text>
        </n-form-item>
        <n-form-item label="医生">
          <n-text>{{ scheduleForm.doctor_id != null ? docName(scheduleForm.doctor_id) : '-' }}</n-text>
        </n-form-item>
        <n-form-item label="时段">
          <n-select
            v-model:value="scheduleForm.time_slot"
            :options="[
              { label: '上午', value: '上午' },
              { label: '下午', value: '下午' },
            ]"
          />
        </n-form-item>
        <n-form-item label="号源上限">
          <n-input-number v-model:value="scheduleForm.max_patients" class="w-full" :min="1" :max="200" />
          <n-text v-if="editingSchedule" depth="3" class="mt-1 block text-xs">
            已预约 {{ editingSchedule.booked_count }} 人，上限不可低于该人数。
          </n-text>
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <NButton @click="showScheduleModal = false">
            取消
          </NButton>
          <NButton type="primary" @click="saveSchedule">
            保存
          </NButton>
        </n-space>
      </template>
    </n-modal>

    <!-- 全院排班查询与维护 -->
    <n-card title="全院排班记录查询与维护" class="mt-2">
      <div class="mb-4 flex flex-wrap gap-3">
        <n-date-picker
          v-model:formatted-value="recordFilterDate"
          value-format="yyyy-MM-dd"
          type="date"
          clearable
          placeholder="筛选日期（空为全部）"
          class="min-w-[200px]"
        />
        <n-select
          v-model:value="recordFilterDeptId"
          :options="deptFilterOptions"
          placeholder="全部科室"
          class="min-w-[160px]"
          clearable
        />
        <n-select
          v-model:value="recordFilterStatus"
          class="min-w-[120px]"
          :options="[
            { label: '全部状态', value: 'all' },
            { label: '正常出诊', value: '1' },
            { label: '停诊', value: '0' },
          ]"
        />
        <n-input
          v-model:value="recordSearchDoctor"
          clearable
          placeholder="医生姓名或工号"
          class="min-w-[160px]"
        />
      </div>
      <n-data-table
        :columns="recordColumns"
        :data="filteredScheduleRecords"
        :bordered="true"
        :single-line="false"
        size="small"
        :pagination="{ pageSize: 12 }"
      />
    </n-card>
  </div>
</template>

<style scoped>
.schedule-manage :deep(.n-data-table-th) {
  background: #f8fafc;
  font-weight: 600;
}
</style>
