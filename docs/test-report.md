# 门诊管理系统 — 测试报告

| 项目 | 内容 |
|------|------|
| 报告日期 | 2026-05-12 |
| 依据文档 | 《基于 Spring Boot 的门诊管理系统的设计与实现》（赵春棚）— 与当前仓库**纯前端实现**对齐的用例说明见 [test-cases.md](./test-cases.md) |
| 被测版本 | 仓库当前 `main` / 工作区 |
| 执行环境 | Node + pnpm；Playwright Chromium；开发服务 `http://localhost:3333` |

---

## 1. 测试范围

| 类型 | 说明 |
|------|------|
| 自动化（E2E） | Playwright：`e2e/auth.spec.ts`、`e2e/back-admin.spec.ts`，共 **11** 条 |
| 手工 | 用例文档 [test-cases.md](./test-cases.md) 中挂号全流程、处方缴费、管理员 CRUD 全量等 |

---

## 2. 执行方式

```bash
# 首次需安装浏览器（仅需一次）
pnpm exec playwright install chromium

# 启动测试（会自动执行 pnpm dev；若 3333 已被占用则复用）
pnpm test:e2e
```

本次执行将控制台输出另存为：[test-run-output.txt](./test-run-output.txt)。

HTML 报告（若已生成）：在仓库根目录执行 `pnpm test:e2e` 后查看 `docs/playwright-report/index.html`（目录已加入 `.gitignore`，需本地生成）。

---

## 3. 执行结果摘要

| 指标 | 结果 |
|------|------|
| 用例总数 | 11 |
| 通过 | **11** |
| 失败 | **0** |
| 总耗时（本次） | 约 6.2 s |

### 3.1 已通过用例列表

| 编号 | 名称 |
|------|------|
| 1 | E2E-AUTH-01: 未登录访问 / 跳转登录 |
| 2 | E2E-AUTH-02: 未登录访问 /home 带 redirect |
| 3 | E2E-AUTH-03: 未登录访问 /back 带 redirect |
| 4 | E2E-LOGIN-02: 错误密码提示 |
| 5 | E2E-LOGIN-03: 患者登录进入患者端 |
| 6 | E2E-AUTH-04: 患者不可访问 /back |
| 7 | E2E-LOGIN-04 + E2E-BACK-01: 管理员登录管理端侧栏 |
| 8 | E2E-AUTH-06: 管理员可访问 /home |
| 9 | E2E-LOGIN-05: 医生登录进入医生端 |
| 10 | E2E-HOME-01 + E2E-HOME-04: 患者端顶栏与欢迎区 |
| 11 | E2E-BACK-SCHEDULE-01: 排班信息管理页可访问 |

---

## 4. 结论与说明

- **结论**：当前自动化回归 **全部通过**，核心鉴权、三角色登录、患者端壳、管理端排班入口行为正常。
- **登录页**：已去掉人为 `setTimeout(200)`，登录与路由跳转同步完成，利于 E2E 稳定。
- **路由守卫**：已使用 `readSessionSnapshot()` 与 `hydrateSessionFromStorage()` 组合，降低 `useLocalStorage` 首帧与整页导航的竞态风险。
- **未纳入自动化**：整页刷新停留在 `/back/...` 深链、完整预约挂号点击流、管理端各 CRUD 表单全字段校验等，见 [test-cases.md](./test-cases.md) 手工列。

---

## 5. 缺陷与改进建议

| 项 | 说明 |
|----|------|
| 深链整页打开 | 浏览器地址栏直接打开 `/back/子路径` 的行为建议在 CI 外做一次手工回归；E2E 对管理端子页采用「侧栏链接」进入更贴近真实操作。 |
| 论文 docx | 桌面 docx 未纳入仓库；若学校要求与原文逐条对照，可将章节截图或表格贴入 `docs/` 后再扩写用例 ID。 |
