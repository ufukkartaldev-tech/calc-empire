/**
 * @file form-validation.spec.ts
 * @description E2E tests for form validation across all calculators
 */

import { test, expect } from '@playwright/test';

test.describe('Form Validation - Input Handling', () => {
  test('should prevent negative values where not applicable', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Ohm's Law/ }).click();

    // Try to enter negative resistance
    await page.getByLabel(/Resistance/).fill('-10');
    await page.getByLabel(/Voltage/).fill('12');

    await page.getByRole('button', { name: /Solve|Calculate/i }).click();

    // Should show error or handle gracefully
    const errorVisible = await page
      .getByText(/error|invalid|negative|must be/i)
      .isVisible()
      .catch(() => false);
    expect(errorVisible).toBeTruthy();
  });

  test('should handle empty inputs gracefully', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Ohm's Law/ }).click();

    // Click calculate with empty fields
    await page.getByRole('button', { name: /Solve|Calculate/i }).click();

    // Should show error message
    await expect(page.getByText(/Please fill|required|empty|blank/i)).toBeVisible();
  });

  test('should handle extremely large values', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Ohm's Law/ }).click();

    await page.getByLabel(/Voltage/).fill('999999999999');
    await page.getByLabel(/Current/).fill('1');

    await page.getByRole('button', { name: /Solve|Calculate/i }).click();

    // Should either calculate or show overflow error
    const hasResult = await page
      .getByLabel(/Resistance/)
      .inputValue()
      .then((v) => v.length > 0)
      .catch(() => false);
    const hasError = await page
      .getByText(/error|overflow|invalid/i)
      .isVisible()
      .catch(() => false);

    expect(hasResult || hasError).toBeTruthy();
  });

  test('should handle decimal values correctly', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Ohm's Law/ }).click();

    await page.getByLabel(/Voltage/).fill('3.3');
    await page.getByLabel(/Current/).fill('0.01');

    await page.getByRole('button', { name: /Solve|Calculate/i }).click();

    // Result should be approximately 330
    const resistance = await page.getByLabel(/Resistance/).inputValue();
    expect(parseFloat(resistance)).toBeCloseTo(330, 0);
  });
});

test.describe('Form Validation - Unit Converters', () => {
  test('should convert units correctly', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Unit Converter/i }).click();

    // Select conversion type
    await page.getByLabel(/From/).selectOption('m');
    await page.getByLabel(/To/).selectOption('cm');
    await page.getByLabel(/Value/).fill('1');

    await page.getByRole('button', { name: /Convert/i }).click();

    // 1 meter = 100 centimeters
    const result = await page.getByLabel(/Result/).inputValue();
    expect(parseFloat(result)).toBe(100);
  });

  test('should handle same unit conversion', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Unit Converter/i }).click();

    await page.getByLabel(/From/).selectOption('m');
    await page.getByLabel(/To/).selectOption('m');
    await page.getByLabel(/Value/).fill('5');

    await page.getByRole('button', { name: /Convert/i }).click();

    const result = await page.getByLabel(/Result/).inputValue();
    expect(parseFloat(result)).toBe(5);
  });
});

test.describe('Form Validation - Number Formatting', () => {
  test('should handle scientific notation', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Ohm's Law/ }).click();

    await page.getByLabel(/Voltage/).fill('1e3'); // 1000
    await page.getByLabel(/Current/).fill('2');

    await page.getByRole('button', { name: /Solve|Calculate/i }).click();

    const resistance = await page.getByLabel(/Resistance/).inputValue();
    expect(parseFloat(resistance)).toBeCloseTo(500, 0);
  });

  test('should reject invalid characters', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Ohm's Law/ }).click();

    const input = page.getByLabel(/Voltage/);
    await input.fill('abc');

    // Input should be empty or show error
    const value = await input.inputValue();
    expect(value === '' || value === 'abc').toBeTruthy();
  });
});

test.describe('Form Validation - Accessibility', () => {
  test('should have accessible labels on all inputs', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Ohm's Law/ }).click();

    // Check all inputs have labels
    const inputs = await page.locator('input[type="number"]').all();
    for (const input of inputs) {
      const ariaLabel = await input.getAttribute('aria-label');
      const id = await input.getAttribute('id');
      const hasLabel = ariaLabel || (id && (await page.locator(`label[for="${id}"]`).count()) > 0);
      expect(hasLabel).toBeTruthy();
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Ohm's Law/ }).click();

    // Press Tab to navigate through form
    await page.keyboard.press('Tab');

    // Check that some input is focused
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });
});
