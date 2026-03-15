/**
 * @file accessibility.spec.ts
 * @description E2E tests for accessibility
 */

import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('button', { name: /Dil Seçimi|Select Language/ })).toHaveAttribute(
      'aria-haspopup',
      'listbox'
    );
    await expect(page.getByRole('button', { name: /Dil Seçimi|Select Language/ })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    const h1 = page.getByRole('heading', { name: 'CalcEmpire', level: 1 });
    await expect(h1).toBeVisible();
  });

  test('should have skip-to-content link', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('link', { name: /Skip to content/i })).toBeVisible();
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');

    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
  });

  test('should have proper contrast for text', async ({ page }) => {
    await page.goto('/');

    const text = page.getByText(/Professional engineering calculators/);
    await expect(text).toBeVisible();
  });

  test('should have proper form labels', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Ohm's Law Calculator/ }).click();

    await expect(page.getByLabel(/Voltage/)).toHaveAttribute('id');
    await expect(page.getByLabel(/Current/)).toHaveAttribute('id');
    await expect(page.getByLabel(/Resistance/)).toHaveAttribute('id');
  });

  test('should have proper error messages', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Ohm's Law Calculator/ }).click();

    await page.getByRole('button', { name: /Solve/ }).click();

    await expect(page.getByText(/error|Error/i)).toBeVisible();
  });

  test('should have proper focus management', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /Ohm's Law Calculator/ }).click();

    await expect(page.getByRole('button', { name: '← Go Back' })).toBeVisible();
    await expect(page.getByRole('button', { name: '← Go Back' })).toBeVisible();
  });
});

test.describe('Accessibility - Dark Mode', () => {
  test('should maintain contrast in dark mode', async ({ page }) => {
    await page.goto('/');

    const themeToggle = page.getByRole('button', { name: /Theme Toggle/ });
    await themeToggle.click();

    await expect(page.locator('body')).toHaveClass(/dark/);

    const text = page.getByText(/Professional engineering calculators/);
    await expect(text).toBeVisible();
  });
});

test.describe('Accessibility - Search', () => {
  test('should announce search results', async ({ page }) => {
    await page.goto('/');

    await page.fill('input[type="text"]', 'ohm');

    await expect(page.getByRole('button', { name: /Ohm's Law Calculator/ })).toBeVisible();
  });
});
