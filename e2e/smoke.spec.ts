import { test, expect } from '@playwright/test';

test.describe('Poisik E2E', () => {
  test('landing page loads', async ({ page }) => {
    await page.goto('/en/');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /Design and Passion/i })).toBeVisible();
  });

  test('retired /upload path redirects away', async ({ page }) => {
    await page.goto('/en/upload');
    await page.waitForLoadState('networkidle');
    await expect(page).not.toHaveURL(/\/en\/upload$/);
  });

  test('demo page loads', async ({ page }) => {
    await page.goto('/en/demo');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/Overall Design Score/i)).toBeVisible();
  });

  test('pricing page shows plans', async ({ page }) => {
    await page.goto('/en/pricing');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Free' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Pro' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Team' })).toBeVisible();
  });

  test('404 page shows not found', async ({ page }) => {
    await page.goto('/en/nonexistent');
    await expect(page.locator('text=404')).toBeVisible();
  });

  test('i18n switching to French', async ({ page }) => {
    await page.goto('/en/');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'FR' }).click();
    await page.waitForFunction(() => window.location.pathname.startsWith('/fr'));
    await expect(page.getByRole('heading', { name: /Design et passion/i })).toBeVisible();
  });

  test('retired /history path redirects away', async ({ page }) => {
    await page.goto('/en/history');
    await page.waitForLoadState('networkidle');
    await expect(page).not.toHaveURL(/\/en\/history$/);
  });
});
