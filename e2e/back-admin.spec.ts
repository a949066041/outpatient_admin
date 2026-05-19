import { expect, test } from '@playwright/test'

async function loginAsAdmin(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.getByRole('radio', { name: '管理员' }).click()
  await page.getByPlaceholder('管理员用户名').fill('admin001')
  await page.getByPlaceholder('密码').fill('123456')
  await page.getByRole('button', { name: '登录' }).click()
  await expect(page).toHaveURL(/\/back/, { timeout: 15_000 })
}

async function openScheduleManageViaMenu(page: import('@playwright/test').Page) {
  await page.getByRole('link', { name: '排班信息管理' }).click()
  await expect(page).toHaveURL(/\/back\/schedule-manage/, { timeout: 15_000 })
}

test('E2E-BACK-SCHEDULE-01: 排班信息管理页可访问', async ({ page }) => {
  await loginAsAdmin(page)
  await openScheduleManageViaMenu(page)
  await expect(page.getByText('排班信息管理').first()).toBeVisible({ timeout: 15_000 })
  await expect(page.getByText('请选择值班日期')).toBeVisible()
})
