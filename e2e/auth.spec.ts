import { expect, test } from '@playwright/test'

async function loginAs(
  page: import('@playwright/test').Page,
  role: '管理员' | '医生' | '患者',
  account: string,
  password: string,
  opts?: { expectErrorMessage?: string },
) {
  await page.goto('/login')
  await page.getByRole('radio', { name: role }).click()
  const ph = role === '医生' ? '医生工号' : role === '管理员' ? '管理员用户名' : '患者用户名'
  await page.getByPlaceholder(ph).fill(account)
  await page.getByPlaceholder('密码').fill(password)
  await page.getByRole('button', { name: '登录' }).click()
  if (opts?.expectErrorMessage) {
    await expect(page.getByText(opts.expectErrorMessage)).toBeVisible({ timeout: 15_000 })
    return
  }
  const urlPat = role === '管理员' ? /\/back/ : role === '医生' ? /\/doctor/ : /\/home/
  await expect(page).toHaveURL(urlPat, { timeout: 15_000 })
}

test.describe('E2E-AUTH / E2E-LOGIN', () => {
  test('E2E-AUTH-01: 未登录访问 / 跳转登录', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login/)
  })

  test('E2E-AUTH-02: 未登录访问 /home 带 redirect', async ({ page }) => {
    await page.goto('/home')
    await expect(page).toHaveURL(/\/login/)
    const u = new URL(page.url())
    expect(u.searchParams.get('redirect')).toContain('/home')
  })

  test('E2E-AUTH-03: 未登录访问 /back 带 redirect', async ({ page }) => {
    await page.goto('/back/schedule-manage')
    await expect(page).toHaveURL(/\/login/)
    const u = new URL(page.url())
    expect(u.searchParams.get('redirect')).toContain('/back')
  })

  test('E2E-LOGIN-02: 错误密码提示', async ({ page }) => {
    await loginAs(page, '患者', 'patient001', 'wrong-password', { expectErrorMessage: '用户名或密码错误' })
  })

  test('E2E-LOGIN-03: 患者登录进入患者端', async ({ page }) => {
    await loginAs(page, '患者', 'patient001', '123456')
    await expect(page).toHaveURL(/\/home/)
    await expect(page.getByText('门诊管理系统 · 患者端')).toBeVisible()
  })

  test('E2E-AUTH-04: 患者不可访问 /back', async ({ page }) => {
    await loginAs(page, '患者', 'patient001', '123456')
    await expect(page).toHaveURL(/\/home/)
    await page.goto('/back')
    await expect(page).toHaveURL(/\/home(?:\/|$)/)
  })

  test('E2E-LOGIN-04 + E2E-BACK-01: 管理员登录管理端侧栏', async ({ page }) => {
    await loginAs(page, '管理员', 'admin001', '123456')
    await expect(page).toHaveURL(/\/back/)
    await expect(page.getByText('门诊管理后台')).toBeVisible()
  })

  test('E2E-AUTH-06: 管理员可访问 /home', async ({ page }) => {
    await loginAs(page, '管理员', 'admin001', '123456')
    await expect(page).toHaveURL(/\/back/)
    await page.goto('/home')
    await expect(page).toHaveURL(/\/home/)
    await expect(page.getByText('门诊管理系统 · 患者端')).toBeVisible()
  })

  test('E2E-LOGIN-05: 医生登录进入医生端', async ({ page }) => {
    await loginAs(page, '医生', '1000', '123456')
    await expect(page).toHaveURL(/\/doctor/)
  })
})

test.describe('E2E-HOME', () => {
  test('E2E-HOME-01 + E2E-HOME-04: 患者端顶栏与欢迎区', async ({ page }) => {
    await loginAs(page, '患者', 'patient001', '123456')
    await expect(page.getByText('赵患者')).toBeVisible()
    await expect(page.getByText('欢迎使用门诊管理系统患者端')).toBeVisible()
  })
})
