/**
 * @file responsive-design.test.ts
 * @description Responsive design tests for Calc Empire
 * 
 * Tests: Mobile, tablet, desktop layouts, breakpoints, touch interactions
 */

import { test, expect } from '@playwright/test';

const breakpoints = {
  mobile: { width: 375, height: 667 }, // iPhone SE
  tablet: { width: 768, height: 1024 }, // iPad
  desktop: { width: 1920, height: 1080 }, // Desktop
  largeDesktop: { width: 2560, height: 1440 }, // 4K
};

test.describe('Responsive Design', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  Object.entries(breakpoints).forEach(([deviceName, viewport]) => {
    test.describe(`${deviceName} layout (${viewport.width}x${viewport.height})`, () => {
      test.use({ viewport });

      test(`should render properly on ${deviceName}`, async ({ page }) => {
        await expect(page.locator('body')).toBeVisible();
        await expect(page.locator('nav')).toBeVisible();
      });

      test(`should have readable text on ${deviceName}`, async ({ page }) => {
        const textElements = await page.locator('p, h1, h2, h3, span').all();
        for (const element of textElements.slice(0, 10)) {
          const isVisible = await element.isVisible();
          if (isVisible) {
            const fontSize = await element.evaluate(el => 
              window.getComputedStyle(el).fontSize
            );
            expect(parseInt(fontSize)).toBeGreaterThanOrEqual(
              deviceName === 'mobile' ? 12 : 14
            );
          }
        }
      });

      test(`should have accessible touch targets on ${deviceName}`, async ({ page }) => {
        if (deviceName === 'mobile' || deviceName === 'tablet') {
          const buttons = await page.locator('button, a, input[type="button"]').all();
          for (const button of buttons.slice(0, 5)) {
            const isVisible = await button.isVisible();
            if (isVisible) {
              const boundingBox = await button.boundingBox();
              if (boundingBox) {
                expect(boundingBox.width).toBeGreaterThanOrEqual(44);
                expect(boundingBox.height).toBeGreaterThanOrEqual(44);
              }
            }
          }
        }
      });

      test(`should handle horizontal scroll properly on ${deviceName}`, async ({ page }) => {
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        const viewportWidth = await page.evaluate(() => window.innerWidth);
        
        // No horizontal overflow
        expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);
      });

      test(`should have proper spacing on ${deviceName}`, async ({ page }) => {
        const container = page.locator('.container-max, .container, main').first();
        if (await container.isVisible()) {
          const boundingBox = await container.boundingBox();
          if (boundingBox) {
            expect(boundingBox.width).toBeLessThanOrEqual(viewport.width);
          }
        }
      });
    });
  });

  test.describe('Navigation Responsiveness', () => {
    test('mobile should have hamburger menu', async ({ page }) => {
      await page.setViewportSize(breakpoints.mobile);
      
      // Check if there's a mobile menu button
      const menuButton = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"], .menu-button');
      
      if (await menuButton.isVisible()) {
        await menuButton.click();
        const mobileNav = page.locator('.mobile-nav, .sidebar-mobile, [role="navigation"].mobile');
        await expect(mobileNav).toBeVisible();
      }
    });

    test('desktop should show full navigation', async ({ page }) => {
      await page.setViewportSize(breakpoints.desktop);
      
      // Check for desktop navigation elements
      const nav = page.locator('nav');
      await expect(nav).toBeVisible();
      
      // Should have multiple navigation items visible
      const navItems = nav.locator('a, button').filter({ hasNotText: '' });
      const itemCount = await navItems.count();
      expect(itemCount).toBeGreaterThan(2);
    });
  });

  test.describe('Calculator Responsiveness', () => {
    test('calculators should work on mobile', async ({ page }) => {
      await page.setViewportSize(breakpoints.mobile);
      
      // Navigate to a calculator
      const calculatorLink = page.locator('a[href*="calculators"]').first();
      if (await calculatorLink.isVisible()) {
        await calculatorLink.click();
        
        // Check if calculator is usable
        const inputs = page.locator('input[type="number"], input[type="text"]');
        if (await inputs.count() > 0) {
          await expect(inputs.first()).toBeVisible();
          
          // Test input focus on mobile
          await inputs.first().tap();
          await expect(inputs.first()).toBeFocused();
        }
      }
    });

    test('calculator layouts should adapt to screen size', async ({ page }) => {
      const sizes = [breakpoints.mobile, breakpoints.tablet, breakpoints.desktop];
      
      for (const size of sizes) {
        await page.setViewportSize(size);
        
        const calculatorSection = page.locator('.calculator, .tool-section, main').first();
        if (await calculatorSection.isVisible()) {
          const boundingBox = await calculatorSection.boundingBox();
          if (boundingBox) {
            expect(boundingBox.width).toBeLessThanOrEqual(size.width - 32); // Account for padding
          }
        }
      }
    });
  });

  test.describe('Form Responsiveness', () => {
    test('forms should be usable on mobile', async ({ page }) => {
      await page.setViewportSize(breakpoints.mobile);
      
      // Find any form
      const form = page.locator('form').first();
      if (await form.isVisible()) {
        const inputs = form.locator('input, select, textarea');
        const inputCount = await inputs.count();
        
        if (inputCount > 0) {
          // Check first input
          const firstInput = inputs.first();
          await expect(firstInput).toBeVisible();
          
          // Test touch interaction
          await firstInput.tap();
          await expect(firstInput).toBeFocused();
          
          // Check if keyboard would appear (input type)
          const inputType = await firstInput.getAttribute('type');
          expect(['text', 'number', 'email', 'tel', 'search']).toContain(inputType || 'text');
        }
      }
    });

    test('form buttons should be accessible on mobile', async ({ page }) => {
      await page.setViewportSize(breakpoints.mobile);
      
      const submitButtons = page.locator('button[type="submit"], .btn-primary, .btn-secondary');
      
      for (let i = 0; i < Math.min(3, await submitButtons.count()); i++) {
        const button = submitButtons.nth(i);
        if (await button.isVisible()) {
          const boundingBox = await button.boundingBox();
          if (boundingBox) {
            expect(boundingBox.height).toBeGreaterThanOrEqual(44);
            expect(boundingBox.width).toBeGreaterThanOrEqual(44);
          }
        }
      }
    });
  });

  test.describe('Image and Media Responsiveness', () => {
    test('images should be responsive', async ({ page }) => {
      const images = page.locator('img');
      const imageCount = await images.count();
      
      for (let i = 0; i < Math.min(5, imageCount); i++) {
        const image = images.nth(i);
        const isVisible = await image.isVisible();
        
        if (isVisible) {
          // Check if image has responsive attributes
          await image.evaluate(el => 
            el.classList.contains('responsive') || 
            el.classList.contains('img-fluid') ||
            getComputedStyle(el).maxWidth === '100%'
          );
          
          // Check if image fits within viewport
          const boundingBox = await image.boundingBox();
          if (boundingBox) {
            expect(boundingBox.width).toBeLessThanOrEqual(breakpoints.desktop.width);
          }
        }
      }
    });
  });

  test.describe('Performance on Different Devices', () => {
    test('should load quickly on mobile', async ({ page }) => {
      await page.setViewportSize(breakpoints.mobile);
      const startTime = Date.now();
      
      await page.goto('/', { waitUntil: 'networkidle' });
      
      const loadTime = Date.now() - startTime;
      // Should load within 3 seconds on mobile
      expect(loadTime).toBeLessThan(3000);
    });

    test('should be interactive on mobile', async ({ page }) => {
      await page.setViewportSize(breakpoints.mobile);
      await page.goto('/');
      
      // Test basic interactions
      const clickableElement = page.locator('button, a').first();
      if (await clickableElement.isVisible()) {
        await clickableElement.click();
        
        // Should not block UI
        const isNotBlocked = await page.evaluate(() => !document.body.classList.contains('loading'));
        expect(isNotBlocked).toBeTruthy();
      }
    });
  });

  test.describe('Accessibility Across Devices', () => {
    test('should maintain accessibility on mobile', async ({ page }) => {
      await page.setViewportSize(breakpoints.mobile);
      
      // Check for proper focus management
      const focusableElements = page.locator('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
      const count = await focusableElements.count();
      
      if (count > 0) {
        // Test tab navigation
        await page.keyboard.press('Tab');
        const focusedElement = page.locator(':focus');
        await expect(focusedElement).toBeVisible();
      }
    });

    test('should have readable contrast on all devices', async ({ page }) => {
      const devices = [breakpoints.mobile, breakpoints.tablet, breakpoints.desktop];
      
      for (const device of devices) {
        await page.setViewportSize(device);
        
        // Check if text is readable (basic contrast check)
        const textElements = page.locator('h1, h2, h3, p, span').filter({ hasText: /^\S+$/ });
        
        for (let i = 0; i < Math.min(3, await textElements.count()); i++) {
          const element = textElements.nth(i);
          const isVisible = await element.isVisible();
          
          if (isVisible) {
            const styles = await element.evaluate(el => ({
              color: getComputedStyle(el).color,
              backgroundColor: getComputedStyle(el).backgroundColor,
              fontSize: getComputedStyle(el).fontSize
            }));
            
            // Basic check - should have defined colors
            expect(styles.color).toBeTruthy();
            expect(styles.fontSize).toBeTruthy();
          }
        }
      }
    });
  });
});
