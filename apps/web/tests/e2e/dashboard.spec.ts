import { expect, test } from '@playwright/test';

test('dashboard redirects unauthenticated users to login', async ({ page }) => {
  await page.goto('/dashboard/admin');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();
});

test('home page loads and links to login', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'LEZIT Transports' })).toBeVisible();
  await page.getByRole('link', { name: 'Log in' }).first().click();
  await expect(page).toHaveURL(/\/login$/);
});
