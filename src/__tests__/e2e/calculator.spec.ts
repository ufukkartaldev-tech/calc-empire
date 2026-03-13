/**
 * @file calculator.spec.ts
 * @description E2E tests for calculator components
 */

import { test, expect } from '@playwright/test';

test.describe('Calculator - Ohm', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Ohm's Law Calculator/ }).click();
  });

  test('should display calculator form', async ({ page }) => {
    await expect(page.getByLabel(/Voltage/)).toBeVisible();
    await expect(page.getByLabel(/Current/)).toBeVisible();
    await expect(page.getByLabel(/Resistance/)).toBeVisible();
  });

  test('should solve for voltage when I and R are provided', async ({ page }) => {
    await page.fill('input[placeholder="e.g. 0.5"]', '2');
    await page.fill('input[placeholder="e.g. 100"]', '50');
    await page.getByRole('button', { name: /Solve/ }).click();
    
    await expect(page.getByLabel(/Voltage/)).toHaveValue('100');
  });

  test('should solve for current when V and R are provided', async ({ page }) => {
    await page.fill('input[placeholder="e.g. 12"]', '12');
    await page.fill('input[placeholder="e.g. 100"]', '4');
    await page.getByRole('button', { name: /Solve/ }).click();
    
    await expect(page.getByLabel(/Current/)).toHaveValue('3');
  });

  test('should solve for resistance when V and I are provided', async ({ page }) => {
    await page.fill('input[placeholder="e.g. 12"]', '12');
    await page.fill('input[placeholder="e.g. 0.5"]', '2');
    await page.getByRole('button', { name: /Solve/ }).click();
    
    await expect(page.getByLabel(/Resistance/)).toHaveValue('6');
  });

  test('should show error when all fields are filled', async ({ page }) => {
    await page.fill('input[placeholder="e.g. 12"]', '12');
    await page.fill('input[placeholder="e.g. 0.5"]', '2');
    await page.fill('input[placeholder="e.g. 100"]', '50');
    await page.getByRole('button', { name: /Solve/ }).click();
    
    await expect(page.getByText(/Leave exactly one field blank/)).toBeVisible();
  });

  test('should show error when too many fields are empty', async ({ page }) => {
    await page.getByRole('button', { name: /Solve/ }).click();
    
    await expect(page.getByText(/Please fill in all but one field/)).toBeVisible();
  });

  test('should support unit conversion', async ({ page }) => {
    await page.fill('input[placeholder="e.g. 12"]', '1');
    await page.selectOption('select', 'kV');
    await page.fill('input[placeholder="e.g. 0.5"]', '1000');
    await page.fill('input[placeholder="e.g. 100"]', '1');
    await page.getByRole('button', { name: /Solve/ }).click();
    
    await expect(page.getByLabel(/Voltage/)).toHaveValue('1000');
  });

  test('should reset form correctly', async ({ page }) => {
    await page.fill('input[placeholder="e.g. 12"]', '12');
    await page.getByRole('button', { name: /Reset/ }).click();
    
    await expect(page.getByLabel(/Voltage/)).toHaveValue('');
  });

  test('should have back button', async ({ page }) => {
    await expect(page.getByRole('button', { name: '← Go Back' })).toBeVisible();
  });
});

test.describe('Calculator - Resistor Color Codes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Resistor Color Codes/ }).click();
  });

  test('should display color bands', async ({ page }) => {
    await expect(page.getByText(/Number of Bands/)).toBeVisible();
  });

  test('should calculate resistance for 4-band resistor', async ({ page }) => {
    await expect(page.getByText(/Result/)).toBeVisible();
  });

  test('should have back button', async ({ page }) => {
    await expect(page.getByRole('button', { name: '← Go Back' })).toBeVisible();
  });
});

test.describe('Calculator - Beam Deflection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Beam Deflection/ }).click();
  });

  test('should display beam type tabs', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Cantilever/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Simply Supported/ })).toBeVisible();
  });

  test('should display input fields', async ({ page }) => {
    await expect(page.getByLabel(/Length/)).toBeVisible();
    await expect(page.getByLabel(/Load/)).toBeVisible();
    await expect(page.getByLabel(/Elastic Mod/)).toBeVisible();
    await expect(page.getByLabel(/Moment of Inertia/)).toBeVisible();
  });

  test('should calculate deflection', async ({ page }) => {
    await expect(page.getByText(/Max Deflection/)).toBeVisible();
  });

  test('should have safety status', async ({ page }) => {
    await expect(page.getByText(/Safety Status/)).toBeVisible();
  });

  test('should have back button', async ({ page }) => {
    await expect(page.getByRole('button', { name: '← Go Back' })).toBeVisible();
  });
});

test.describe('Calculator - Normal Distribution', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Normal Distribution/ }).click();
  });

  test('should display distribution inputs', async ({ page }) => {
    await expect(page.getByLabel(/Mean/)).toBeVisible();
    await expect(page.getByLabel(/Std Deviation/)).toBeVisible();
  });

  test('should display chart', async ({ page }) => {
    await expect(page.locator('svg')).toBeVisible();
  });

  test('should have back button', async ({ page }) => {
    await expect(page.getByRole('button', { name: '← Go Back' })).toBeVisible();
  });
});
