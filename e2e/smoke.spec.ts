import { test, expect } from '@playwright/test';

test.describe('Poisik E2E', () => {
  test('landing page loads', async ({ page }) => {
    await page.goto('/en/');
    await expect(page.locator('text=Design and Passion')).toBeVisible();
  });

  test('upload page loads', async ({ page }) => {
    await page.goto('/en/upload');
    await expect(page.locator('text=Analyze Interface')).toBeVisible();
  });

  test('demo page loads', async ({ page }) => {
    await page.goto('/en/demo');
    await expect(page.locator('text=Overall Design Score')).toBeVisible();
  });

  test('pricing page shows plans', async ({ page }) => {
    await page.goto('/en/pricing');
    await expect(page.locator('text=Pro')).toBeVisible();
    await expect(page.locator('text=Team')).toBeVisible();
  });

  test('404 page shows not found', async ({ page }) => {
    await page.goto('/en/nonexistent');
    await expect(page.locator('text=404')).toBeVisible();
  });

  test('i18n switching to French', async ({ page }) => {
    await page.goto('/en/');
    await page.click('text=FR');
    await expect(page).toHaveURL(/\/fr\//);
    await expect(page.locator('text=Design et passion')).toBeVisible();
  });

  test('history page empty state', async ({ page }) => {
    await page.goto('/en/history');
    await expect(page.locator('text=No analyses yet')).toBeVisible();
  });
});
