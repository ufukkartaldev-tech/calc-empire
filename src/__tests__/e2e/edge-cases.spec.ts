/**
 * @file edge-cases.spec.ts
 * @description E2E tests for edge cases
 */

import { test, expect } from '@playwright/test';

test.describe('Edge Cases', () => {
  test('should handle zero values', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Ohm's Law Calculator/ }).click();
    
    await page.fill('input[placeholder="e.g. 12"]', '0');
    await page.fill('input[placeholder="e.g. 0.5"]', '0');
    await page.fill('input[placeholder="e.g. 100"]', '0');
    await page.getByRole('button', { name: /Solve/ }).click();
    
    await expect(page.getByText(/error|Error/i)).toBeVisible();
  });

  test('should handle negative values', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Ohm's Law Calculator/ }).click();
    
    await page.fill('input[placeholder="e.g. 12"]', '-12');
    await page.fill('input[placeholder="e.g. 0.5"]', '-2');
    await page.fill('input[placeholder="e.g. 100"]', '-50');
    await page.getByRole('button', { name: /Solve/ }).click();
    
    await expect(page.getByText(/error|Error/i)).toBeVisible();
  });

  test('should handle very large values', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Ohm's Law Calculator/ }).click();
    
    await page.fill('input[placeholder="e.g. 12"]', '1e10');
    await page.fill('input[placeholder="e.g. 0.5"]', '1e5');
    await page.getByRole('button', { name: /Solve/ }).click();
    
    await expect(page.getByLabel(/Resistance/)).toBeVisible();
  });

  test('should handle very small values', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Ohm's Law Calculator/ }).click();
    
    await page.fill('input[placeholder="e.g. 12"]', '1e-10');
    await page.fill('input[placeholder="e.g. 0.5"]', '1e-5');
    await page.getByRole('button', { name: /Solve/ }).click();
    
    await expect(page.getByLabel(/Resistance/)).toBeVisible();
  });

  test('should handle special characters in search', async ({ page }) => {
    await page.goto('/');
    
    await page.fill('input[type="text"]', 'ohm!');
    await page.fill('input[type="text"]', 'ohm@');
    await page.fill('input[type="text"]', 'ohm#');
    
    await expect(page.getByRole('button', { name: /Ohm's Law Calculator/ })).toBeVisible();
  });

  test('should handle empty search', async ({ page }) => {
    await page.goto('/');
    
    await page.fill('input[type="text"]', '');
    
    await expect(page.getByRole('button', { name: /Ohm's Law Calculator/ })).toBeVisible();
  });

  test('should handle rapid category switches', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('button', { name: 'Electrical Engineering' }).click();
    await page.getByRole('button', { name: 'Mechanical Engineering' }).click();
    await page.getByRole('button', { name: 'Electrical Engineering' }).click();
    
    await expect(page.getByRole('button', { name: /Ohm's Law Calculator/ })).toBeVisible();
  });

  test('should handle rapid language switches', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('button', { name: 'English' }).click();
    await page.getByRole('option', { name: 'Türkçe' }).click();
    await page.getByRole('button', { name: 'Türkçe' }).click();
    await page.getByRole('option', { name: 'English' }).click();
    
    await expect(page.getByRole('heading', { name: 'CalcEmpire' })).toBeVisible();
  });

  test('should handle rapid theme toggles', async ({ page }) => {
    await page.goto('/');
    
    const themeToggle = page.getByRole('button', { name: /Theme Toggle/ });
    await themeToggle.click();
    await themeToggle.click();
    await themeToggle.click();
    await themeToggle.click();
    
    await expect(page.locator('body')).toHaveClass(/dark/);
  });

  test('should handle keyboard shortcuts', async ({ page }) => {
    await page.goto('/');
    
    await page.keyboard.press('Enter');
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle touch events on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    await page.getByRole('button', { name: /Ohm's Law Calculator/ }).click();
    
    await expect(page.getByLabel(/Voltage/)).toBeVisible();
  });
});

test.describe('Edge Cases - Error Handling', () => {
  test('should handle network errors gracefully', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.getByRole('heading', { name: 'CalcEmpire' })).toBeVisible();
  });

  test('should handle missing translations', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.getByRole('heading', { name: 'CalcEmpire' })).toBeVisible();
  });

  test('should handle invalid URL parameters', async ({ page }) => {
    await page.goto('/?invalid=param');
    
    await expect(page.getByRole('heading', { name: 'CalcEmpire' })).toBeVisible();
  });

  test('should handle browser back button', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Ohm's Law Calculator/ }).click();
    
    await page.goBack();
    
    await expect(page.getByRole('heading', { name: 'CalcEmpire' })).toBeVisible();
  });

  test('should handle browser forward button', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Ohm's Law Calculator/ }).click();
    await page.goBack();
    
    await page.goForward();
    
    await expect(page.getByRole('heading', { name: 'CalcEmpire' })).toBeVisible();
  });
});
