/**
 * @file visual.spec.ts
 * @description E2E tests for visual regression
 */

import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('should have consistent layout', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('.ce-app')).toBeVisible();
    await expect(page.locator('.ce-main')).toBeVisible();
    await expect(page.locator('.ce-hero')).toBeVisible();
  });

  test('should have consistent navbar', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('nav').getByRole('link', { name: 'CalcEmpire' })).toBeVisible();
  });

  test('should have consistent sidebar', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('aside')).toBeVisible();
    await expect(page.locator('aside input[type="text"]')).toBeVisible();
  });

  test('should have consistent footer', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('footer')).toBeVisible();
    await expect(page.locator('footer').getByText(/CalcEmpire/)).toBeVisible();
  });

  test('should have consistent calculator card', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.getByRole('button', { name: /Ohm's Law Calculator/ })).toHaveCSS('border-radius', '24px');
    await expect(page.getByRole('button', { name: /Ohm's Law Calculator/ })).toHaveCSS('padding', /16px/);
  });

  test('should have consistent dark mode', async ({ page }) => {
    await page.goto('/');
    
    const themeToggle = page.getByRole('button', { name: /Theme Toggle/ });
    await themeToggle.click();
    
    await expect(page.locator('body')).toHaveClass(/dark/);
    await expect(page.locator('body')).toHaveCSS('background-color', /020617/);
  });

  test('should have consistent responsive layout', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    await expect(page.locator('.ce-app')).toBeVisible();
    await expect(page.locator('aside')).toBeVisible();
  });

  test('should have consistent mobile layout', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    await expect(page.locator('.ce-app')).toBeVisible();
  });
});

test.describe('Visual Regression - Animations', () => {
  test('should have smooth transitions', async ({ page }) => {
    await page.goto('/');
    
    const button = page.getByRole('button', { name: /Ohm's Law Calculator/ });
    await button.hover();
    
    await expect(button).toHaveCSS('transform', /scale/);
  });

  test('should have smooth category switch', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('button', { name: 'Electrical Engineering' }).click();
    
    await expect(page.locator('div[aria-hidden="true"]')).not.toHaveCSS('opacity', '0');
  });
});
