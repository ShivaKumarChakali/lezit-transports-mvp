import { expect, test } from '@playwright/test';

test('register page offers only non-admin roles', async ({ page }) => {
  await page.goto('/register');
  await expect(page.getByRole('heading', { name: 'Register' })).toBeVisible();
  const options = page.locator('select#role option');
  await expect(options).toHaveCount(4);
  await expect(page.locator('select#role option', { hasText: 'Super Admin' })).toHaveCount(0);
  await expect(page.locator('select#role option', { hasText: 'LEZIT Admin' })).toHaveCount(0);
  await expect(page.locator('select#role option', { hasText: 'Vehicle Owner' })).toHaveCount(1);
  await expect(page.locator('select#role option', { hasText: 'Driver' })).toHaveCount(1);
});
