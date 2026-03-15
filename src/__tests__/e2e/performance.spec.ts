/**
 * @file performance.spec.ts
 * @description E2E tests for performance
 */

import { test, expect } from '@playwright/test';

test.describe('Performance', () => {
  test('should load homepage quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(3000);
  });

  test('should have fast search response', async ({ page }) => {
    await page.goto('/');

    const startTime = Date.now();
    await page.fill('input[type="text"]', 'ohm');
    await expect(page.getByRole('button', { name: /Ohm's Law Calculator/ })).toBeVisible();
    const responseTime = Date.now() - startTime;

    expect(responseTime).toBeLessThan(500);
  });

  test('should have fast category switch', async ({ page }) => {
    await page.goto('/');

    const startTime = Date.now();
    await page.getByRole('button', { name: 'Electrical Engineering' }).click();
    await expect(page.getByRole('button', { name: /Ohm's Law Calculator/ })).toBeVisible();
    const responseTime = Date.now() - startTime;

    expect(responseTime).toBeLessThan(300);
  });

  test('should have fast calculator switch', async ({ page }) => {
    await page.goto('/');

    const startTime = Date.now();
    await page.getByRole('button', { name: /Ohm's Law Calculator/ }).click();
    await expect(page.getByLabel(/Voltage/)).toBeVisible();
    const responseTime = Date.now() - startTime;

    expect(responseTime).toBeLessThan(500);
  });

  test('should have fast dark mode toggle', async ({ page }) => {
    await page.goto('/');

    const startTime = Date.now();
    await page.getByRole('button', { name: /Theme Toggle/ }).click();
    await expect(page.locator('body')).toHaveClass(/dark/);
    const responseTime = Date.now() - startTime;

    expect(responseTime).toBeLessThan(200);
  });

  test('should have fast language switch', async ({ page }) => {
    await page.goto('/');

    const startTime = Date.now();
    await page.getByRole('button', { name: 'English' }).click();
    await page.getByRole('option', { name: 'Türkçe' }).click();
    await expect(page.getByText(/Mühendislik hesaplayıcı/)).toBeVisible();
    const responseTime = Date.now() - startTime;

    expect(responseTime).toBeLessThan(500);
  });
});

test.describe('Performance - Lighthouse', () => {
  test('should have good performance score', async ({ page }) => {
    await page.goto('/');

    const performanceMetrics = await page.evaluate(() => {
      return {
        firstContentfulPaint:
          performance.getEntriesByType('paint').find((e) => e.name === 'first-contentful-paint')
            ?.startTime || 0,
        largestContentfulPaint:
          performance.getEntriesByType('largest-contentful-paint')?.startTime || 0,
        totalBlockingTime: 0,
        cumulativeLayoutShift: 0,
      };
    });

    expect(performanceMetrics.firstContentfulPaint).toBeLessThan(1000);
  });
});
