/**
 * @file homepage.spec.ts
 * @description E2E tests for the homepage
 */

import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'CalcEmpire' })).toBeVisible();
  });

  test('should display the subtitle', async ({ page }) => {
    await expect(page.getByText(/Professional engineering calculators/)).toBeVisible();
  });

  test('should display the search input', async ({ page }) => {
    await expect(page.getByPlaceholder(/Ara|Search/)).toBeVisible();
  });

  test('should display all categories', async ({ page }) => {
    const categories = [
      'Electrical Engineering',
      'Mechanical Engineering',
      'Statistics & Math',
      'Software',
      'Finance',
      'Civil',
      'Chemistry',
      'Fluid',
      'Mathematics',
      'Converters',
    ];

    for (const category of categories) {
      await expect(page.getByRole('button', { name: category })).toBeVisible();
    }
  });

  test('should display calculator cards', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Ohm's Law Calculator/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Resistor Color Codes/ })).toBeVisible();
  });

  test('should have working navigation links', async ({ page }) => {
    const navLinks = page.locator('nav a');
    await expect(navLinks).toHaveCount(2);
  });

  test('should have working language switcher', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Dil Seçimi|Select Language/ })).toBeVisible();
  });

  test('should have working theme toggle', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Theme Toggle/ })).toBeVisible();
  });
});

test.describe('Homepage - Dark Mode', () => {
  test('should toggle dark mode', async ({ page }) => {
    await page.goto('/');
    
    const themeToggle = page.getByRole('button', { name: /Theme Toggle/ });
    await themeToggle.click();
    
    await expect(page.locator('body')).toHaveClass(/dark/);
  });
});

test.describe('Homepage - Search', () => {
  test('should filter tools by search query', async ({ page }) => {
    await page.goto('/');
    
    await page.fill('input[type="text"]', 'ohm');
    
    await expect(page.getByRole('button', { name: /Ohm's Law Calculator/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Resistor Color Codes/ })).not.toBeVisible();
  });

  test('should show no results when no match found', async ({ page }) => {
    await page.goto('/');
    
    await page.fill('input[type="text"]', 'nonexistent-tool-xyz');
    
    await expect(page.getByText(/no results|bulunamadı/i)).toBeVisible();
  });
});

test.describe('Homepage - Category Filter', () => {
  test('should filter by electrical category', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('button', { name: 'Electrical Engineering' }).click();
    
    await expect(page.getByRole('button', { name: /Ohm's Law Calculator/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Beam Deflection/ })).not.toBeVisible();
  });

  test('should show all tools when clicking "All Tools"', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('button', { name: /Tüm Araçlar|All Tools/ }).click();
    
    await expect(page.getByRole('button', { name: /Ohm's Law Calculator/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Beam Deflection/ })).toBeVisible();
  });
});
