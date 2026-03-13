/**
 * @file i18n.spec.ts
 * @description E2E tests for internationalization
 */

import { test, expect } from '@playwright/test';

test.describe('Internationalization', () => {
  test('should display English by default', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.getByRole('heading', { name: 'CalcEmpire' })).toBeVisible();
    await expect(page.getByText(/Professional engineering calculators/)).toBeVisible();
  });

  test('should switch to Turkish', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('button', { name: 'English' }).click();
    await page.getByRole('option', { name: 'Türkçe' }).click();
    
    await expect(page.getByRole('heading', { name: 'CalcEmpire' })).toBeVisible();
    await expect(page.getByText(/Mühendislik hesaplayıcı/)).toBeVisible();
  });

  test('should switch to Spanish', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('button', { name: 'English' }).click();
    await page.getByRole('option', { name: 'Español' }).click();
    
    await expect(page.getByRole('heading', { name: 'CalcEmpire' })).toBeVisible();
  });

  test('should switch to German', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('button', { name: 'English' }).click();
    await page.getByRole('option', { name: 'Deutsch' }).click();
    
    await expect(page.getByRole('heading', { name: 'CalcEmpire' })).toBeVisible();
  });

  test('should switch to French', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('button', { name: 'English' }).click();
    await page.getByRole('option', { name: 'Français' }).click();
    
    await expect(page.getByRole('heading', { name: 'CalcEmpire' })).toBeVisible();
  });

  test('should switch to Japanese', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('button', { name: 'English' }).click();
    await page.getByRole('option', { name: '日本語' }).click();
    
    await expect(page.getByRole('heading', { name: 'CalcEmpire' })).toBeVisible();
  });

  test('should switch to Arabic (RTL)', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('button', { name: 'English' }).click();
    await page.getByRole('option', { name: 'العربية' }).click();
    
    await expect(page.getByRole('heading', { name: 'CalcEmpire' })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  });

  test('should search in Turkish', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('button', { name: 'English' }).click();
    await page.getByRole('option', { name: 'Türkçe' }).click();
    
    await page.fill('input[type="text"]', 'ohm');
    
    await expect(page.getByRole('button', { name: /Ohm'un Kanunu/ })).toBeVisible();
  });

  test('should search in Spanish', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('button', { name: 'English' }).click();
    await page.getByRole('option', { name: 'Español' }).click();
    
    await page.fill('input[type="text"]', 'ohm');
    
    await expect(page.getByRole('button', { name: /Ley de Ohm/ })).toBeVisible();
  });
});

test.describe('Internationalization - Language Switcher', () => {
  test('should show all supported languages', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('button', { name: 'English' }).click();
    
    const languages = [
      'English',
      'Türkçe',
      'Español',
      'Français',
      'Deutsch',
      'Italiano',
      'Português',
      'Nederlands',
      'Polski',
      'Русский',
      '中文',
      '日本語',
      '한국어',
      'हिन्दी',
      'العربية',
      'Indonesia',
    ];

    for (const language of languages) {
      await expect(page.getByRole('option', { name: language })).toBeVisible();
    }
  });

  test('should filter languages by search', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('button', { name: 'English' }).click();
    
    await page.fill('input[placeholder="Dil ara|Search..."]', 'turk');
    
    await expect(page.getByRole('option', { name: 'Türkçe' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'English' })).not.toBeVisible();
  });
});
