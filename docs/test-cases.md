# 门诊管理系统 — 测试用例说明

> **依据说明**：本用例对齐《基于 Spring Boot 的门诊管理系统的设计与实现》（赵春棚）中**多角色门诊业务**与当前仓库**纯前端 + localStorage** 实现；论文 docx 未纳入版本库，溯源以本仓库页面与 store 为准。

## 文档与代码溯源

| 模块（论文常见划分） | 主要实现路径 |
|---------------------|-------------|
| 登录 / 注册 / 找回密码 | `src/pages/login/index.vue`、`register/index.vue`、`forgot-password/index.vue` |
| 路由与鉴权 | `src/setup/auth.setup.ts`、`src/store/login.store.ts` |
| （五）患者端 | `src/pages/home.vue` 及 `src/pages/home/**` |
| （三）管理员端 | `src/pages/back.vue` 及 `src/pages/back/**` |
| 医生端 | `src/pages/doctor.vue` 及 `src/pages/doctor/**` |
| 排班信息管理 | `src/pages/back/schedule-manage.vue`、`src/store/schedule.store.ts` |
| 开发服务端口 | `rsbuild.config.ts` → `3333` |

---

## 演示账号（登录页底部说明一致）

| 角色 | 账号 | 密码 | 登录后默认落地 |
|------|------|------|----------------|
| 患者 | `patient001` | `123456` | `/home` |
| 医生 | 工号 `1000` | `123456` | `/doctor` |
| 管理员 | `admin001` | `123456` | `/back` |

---

## 1. 环境与构建

| ID | 前置 | 步骤 | 预期 |
|----|------|------|------|
| ENV-01 | 已安装 Node、pnpm | 项目根目录执行 `pnpm install` | 安装成功 |
| ENV-02 | 依赖就绪 | 执行 `pnpm dev` | 可访问 `http://localhost:3333` |
| ENV-03 | 依赖就绪 | 执行 `pnpm build` | 构建成功 |
| ENV-04 | 依赖就绪 | 执行 `pnpm test:e2e` | Playwright 启动 dev 并执行自动化用例 |

---

## 2. 路由与鉴权

| ID | 前置 | 步骤 | 预期 |
|----|------|------|------|
| AUTH-01 | 无会话 | 访问 `/` | 跳转 `/login` |
| AUTH-02 | 无会话 | 访问 `/home` | 跳转 `/login`，`redirect` 含 `/home` |
| AUTH-03 | 无会话 | 访问 `/back` | 跳转 `/login`，`redirect` 含 `/back` |
| AUTH-04 | 患者已登录 | 访问 `/back` | 重定向至 `/home` 前缀 |
| AUTH-05 | 医生已登录 | 访问 `/back` | 重定向至 `/doctor` |
| AUTH-06 | 管理员已登录 | 访问 `/home` | 允许进入患者端 |
| AUTH-07 | 管理员已登录 | 侧栏进入「排班信息管理」后 **F5 整页刷新** | 仍为排班页、角色为管理员；自动化以侧栏进入为主（见 E2E-BACK-SCHEDULE-01），刷新建议手工复测 |

---

## 3. 登录 / 注册 / 找回密码

| ID | 前置 | 步骤 | 预期 |
|----|------|------|------|
| LOGIN-01 | 在登录页 | 账号密码为空点「登录」 | 提示「请输入账号和密码」 |
| LOGIN-02 | 在登录页 | 患者身份错误密码 | 「用户名或密码错误」 |
| LOGIN-03 | 在登录页 | 患者 `patient001` / `123456` | 成功进入 `/home`，顶栏含「门诊管理系统 · 患者端」 |
| LOGIN-04 | 在登录页 | 管理员 `admin001` / `123456` | 成功进入 `/back`，侧栏「门诊管理后台」 |
| LOGIN-05 | 在登录页 | 医生 `1000` / `123456` | 成功进入 `/doctor` |
| LOGIN-06 | 未登录 | 带 `redirect` 登录成功 | 跳回 `redirect` 指定路径 |
| REG-01 | 注册页 | 按表单填写并提交 | 成功提示并可登录（以当前注册逻辑为准） |
| PWD-01 | 找回密码页 | 按角色与账号重置 | 成功提示（以当前页逻辑为准） |

---

## 4. （五）患者模块

| ID | 前置 | 步骤 | 预期 |
|----|------|------|------|
| PAT-01 | 患者已登录 | `/home` 首页 | 可见欢迎文案（含预约挂号、我的挂号、缴费、病历、报告、住院、评价等说明） |
| PAT-02 | 患者已登录 | 顶栏导航依次存在 | 首页、预约挂号、我的挂号、导出报告单、住院信息、个人信息、评价医生 |
| PAT-03 | 患者已登录 | `/home/book` | 三步：科室 → 日期 → 挂号；可选科室、日期条、有排班医生表 |
| PAT-04 | 患者已登录 | 预约流程选医生与时段后确认 | 成功弹窗含挂号单号、时间、地点、排队序号、费用说明 |
| PAT-05 | 患者已登录 | `/home/my-registers` | Tab：全部/待就诊/已就诊/已取消；已就诊可展开电子病历 |
| PAT-06 | 患者已登录 | `/home/reports` | 标题「导出报告单」 |
| PAT-07 | 患者已登录 | `/home/profile` | 标题「个人信息」 |
| PAT-08 | 患者已登录 | 点「退出登录」 | 回到 `/login` |

---

## 5. （三）管理员模块（含排班信息管理）

| ID | 前置 | 步骤 | 预期 |
|----|------|------|------|
| ADM-01 | 管理员已登录 | `/back` | 工作台与常用入口；侧栏含医生/患者与挂号/药品检查/病床与排班/统计等 |
| ADM-02 | 管理员已登录 | `/back/schedule-manage` | 标题「排班信息管理」；日期 → 科室 → 医生；全院排班查询筛选 |
| ADM-03 | 管理员已登录 | 排班页选日期、科室、医生点「排班」 | 弹窗可保存上午/下午与号源上限 |
| ADM-04 | 管理员已登录 | 已有预约的排班点「删除」 | 提示不可删；无预约可确认删除 |
| ADM-05 | 管理员已登录 | 其他 CRUD 子页（科室、医生、患者等） | 列表加载、弹窗表单与 naive 交互正常 |

---

## 6. 医生端（简要）

| ID | 前置 | 步骤 | 预期 |
|----|------|------|------|
| DOC-01 | 医生已登录 | `/doctor` | 医生端布局与菜单可访问 |
| DOC-02 | 医生已登录 | 队列/接诊/已处理等子页 | 与当前种子数据展示一致 |

---

## 7. 自动化用例（Playwright）映射

| 文档 ID | Playwright 描述 | 文件 |
|---------|-----------------|------|
| AUTH-01 | E2E-AUTH-01 | `e2e/auth.spec.ts` |
| AUTH-02 | E2E-AUTH-02 | `e2e/auth.spec.ts` |
| AUTH-03 | E2E-AUTH-03 | `e2e/auth.spec.ts` |
| AUTH-03 | E2E-AUTH-03 | `e2e/auth.spec.ts` |
| AUTH-04 | E2E-AUTH-04 | `e2e/auth.spec.ts` |
| AUTH-07 | 手工（整页刷新） | — |
| LOGIN-02 | E2E-LOGIN-02 | `e2e/auth.spec.ts` |
| LOGIN-03 | E2E-LOGIN-03 | `e2e/auth.spec.ts` |
| LOGIN-04 / ADM-01 | E2E-LOGIN-04 | `e2e/auth.spec.ts` |
| LOGIN-05 | E2E-LOGIN-05 | `e2e/auth.spec.ts` |
| AUTH-06 | E2E-AUTH-06 | `e2e/auth.spec.ts` |
| PAT-01 | E2E-HOME-01 | `e2e/auth.spec.ts` |
| ADM-02 | E2E-BACK-SCHEDULE-01 | `e2e/back-admin.spec.ts` |

**首次在本机跑 E2E 前**请执行：`pnpm exec playwright install chromium`（下载浏览器二进制）。

**执行命令**（会自动 `pnpm dev` 拉起 `3333`；若本机已占用 3333 则复用已有进程）：

```bash
pnpm test:e2e
```

HTML 报告目录（生成后）：`docs/playwright-report/index.html`（见 `playwright.config.ts`）。

---

## 8. 修订记录

| 日期 | 说明 |
|------|------|
| 2026-05-12 | 补充 Playwright 用例与 `docs/test-report.md`；路由守卫增加 `readSessionSnapshot`；登录页去掉延迟跳转 |
