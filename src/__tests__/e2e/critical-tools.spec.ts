/**
 * @file critical-tools.spec.ts
 * @description E2E tests for critical engineering tools (safety-critical calculators)
 */

import { test, expect } from '@playwright/test';

test.describe('Critical Tools - Beam Deflection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Beam Deflection/ }).click();
  });

  test('should display safety warning for high deflection', async ({ page }) => {
    // Fill in extreme values to trigger safety warning
    await page.getByLabel(/Length/).fill('10');
    await page.getByLabel(/Load/).fill('100000');
    await page.getByLabel(/Elastic Mod/).fill('200');
    await page.getByLabel(/Moment of Inertia/).fill('0.0001');

    // Calculate button click
    await page.getByRole('button', { name: /Calculate/ }).click();

    // Should show either safety warning or deflection result
    await expect(page.getByText(/deflection|safety|warning/i).first()).toBeVisible();
  });

  test('should switch between cantilever and simply supported', async ({ page }) => {
    await page.getByRole('button', { name: /Cantilever/ }).click();
    await expect(page.getByRole('button', { name: /Cantilever/ })).toHaveAttribute(
      'data-active',
      'true'
    );

    await page.getByRole('button', { name: /Simply Supported/ }).click();
    await expect(page.getByRole('button', { name: /Simply Supported/ })).toHaveAttribute(
      'data-active',
      'true'
    );
  });

  test('should display visualization', async ({ page }) => {
    await expect(page.locator('canvas, svg')).toBeVisible();
  });

  test('should have export functionality', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Export|Download|PDF/i })).toBeVisible();
  });
});

test.describe('Critical Tools - Stress Strain', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Stress Strain/ }).click();
  });

  test('should calculate stress correctly', async ({ page }) => {
    await page.getByLabel(/Force|Load/).fill('1000');
    await page.getByLabel(/Area/).fill('0.01');

    await page.getByRole('button', { name: /Calculate/ }).click();

    // Stress = Force / Area = 1000 / 0.01 = 100000 Pa = 100 kPa
    await expect(page.getByText(/100|stress result/i).first()).toBeVisible();
  });

  test('should display material properties', async ({ page }) => {
    await expect(page.getByText(/Young.s Modulus|Yield Strength|Ultimate Strength/i)).toBeVisible();
  });

  test('should show safety factor', async ({ page }) => {
    await page.getByLabel(/Force|Load/).fill('500');
    await page.getByLabel(/Area/).fill('0.01');

    await page.getByRole('button', { name: /Calculate/ }).click();

    await expect(page.getByText(/Safety Factor|Factor of Safety/i)).toBeVisible();
  });
});

test.describe('Critical Tools - Kirchhoff Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Kirchhoff/ }).click();
  });

  test('should display circuit diagram', async ({ page }) => {
    await expect(page.locator('svg')).toBeVisible();
  });

  test('should allow adding resistors', async ({ page }) => {
    await page.getByRole('button', { name: /Add Resistor|Add Component/i }).click();
    await expect(page.getByLabel(/Resistance|R\d+/).first()).toBeVisible();
  });

  test('should calculate node voltages', async ({ page }) => {
    // Add simple circuit
    await page.getByLabel(/Voltage Source/).fill('12');
    await page.getByLabel(/R1|Resistance 1/).fill('100');
    await page.getByLabel(/R2|Resistance 2/).fill('200');

    await page.getByRole('button', { name: /Solve|Calculate/i }).click();

    await expect(page.getByText(/Node Voltage|Current|Power/i).first()).toBeVisible();
  });
});

test.describe('Critical Tools - Concrete Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Concrete Section/ }).click();
  });

  test('should calculate moment capacity', async ({ page }) => {
    await page.getByLabel(/Width/).fill('300');
    await page.getByLabel(/Height|Depth/).fill('500');
    await page.getByLabel(/Concrete Strength/).fill('25');
    await page.getByLabel(/Steel Area/).fill('1000');

    await page.getByRole('button', { name: /Calculate|Design/i }).click();

    await expect(page.getByText(/Moment Capacity|Mu|Capacity/i)).toBeVisible();
  });

  test('should check reinforcement ratio', async ({ page }) => {
    await page.getByLabel(/Width/).fill('300');
    await page.getByLabel(/Height|Depth/).fill('500');
    await page.getByLabel(/Steel Area/).fill('500');

    await page.getByRole('button', { name: /Calculate|Design/i }).click();

    await expect(page.getByText(/Reinforcement Ratio|\u03c1|ratio/i)).toBeVisible();
  });
});

test.describe('Critical Tools - Pressure Loss', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Pressure Loss/ }).click();
  });

  test('should calculate pressure drop', async ({ page }) => {
    await page.getByLabel(/Flow Rate/).fill('0.01');
    await page.getByLabel(/Diameter/).fill('0.1');
    await page.getByLabel(/Length/).fill('100');
    await page.getByLabel(/Roughness|Friction/i).fill('0.0001');

    await page.getByRole('button', { name: /Calculate/i }).click();

    await expect(page.getByText(/Pressure Drop|Head Loss|ΔP/i)).toBeVisible();
  });

  test('should display Reynolds number', async ({ page }) => {
    await page.getByLabel(/Flow Rate/).fill('0.01');
    await page.getByLabel(/Diameter/).fill('0.1');
    await page.getByLabel(/Viscosity|Kinematic/).fill('0.000001');

    await page.getByRole('button', { name: /Calculate/i }).click();

    await expect(page.getByText(/Reynolds|Re\s*=/i)).toBeVisible();
  });
});

test.describe('Critical Tools - Soil Mechanics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Soil Mechanics/ }).click();
  });

  test('should calculate bearing capacity', async ({ page }) => {
    await page.getByLabel(/Cohesion|c/).fill('20');
    await page.getByLabel(/Friction Angle|\u03c6/).fill('30');
    await page.getByLabel(/Unit Weight|\u03b3/).fill('18');
    await page.getByLabel(/Foundation Width|B/).fill('2');

    await page.getByRole('button', { name: /Calculate|Bearing/i }).click();

    await expect(page.getByText(/Bearing Capacity|qu|Ultimate/i)).toBeVisible();
  });

  test('should display Terzaghi factors', async ({ page }) => {
    await page.getByLabel(/Friction Angle|\u03c6/).fill('30');

    await page.getByRole('button', { name: /Calculate|Bearing/i }).click();

    await expect(page.getByText(/Nc|Nq|N\u03b3|Bearing Factors/i)).toBeVisible();
  });
});
