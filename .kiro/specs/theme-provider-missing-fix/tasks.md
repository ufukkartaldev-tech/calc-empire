# Implementation Plan

- [-] 1. Write bug condition exploration test
  - **Property 1: Fault Condition** - ThemeProvider Context Missing
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface the "useTheme must be used within a ThemeProvider" error on unfixed code
  - **Scoped PBT Approach**: Scope the property to the concrete failing case — render `<Navbar />` (or `<ThemeToggle />`) without a `ThemeProvider` ancestor
  - Test that rendering `<ThemeToggle />` without `ThemeProvider` throws `Error: useTheme must be used within a ThemeProvider` (from Fault Condition in design: `hasThemeToggleInTree AND NOT hasThemeProviderAncestor`)
  - Also test that rendering `<Navbar />` without `ThemeProvider` throws the same error
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS / throws (this is correct - it proves the bug exists)
  - Document counterexamples found (e.g., `renderWithoutProvider(<ThemeToggle />) throws "useTheme must be used within a ThemeProvider"`)
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - NextIntlClientProvider and Existing Functionality Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: `NextIntlClientProvider` supplies translation messages correctly on unfixed code (when ThemeToggle is absent or mocked)
  - Observe: `Navbar` renders logo, links, language switcher correctly on unfixed code (when ThemeToggle is mocked to avoid crash)
  - Observe: `notFound()` triggers for invalid locales on unfixed code
  - Observe: `dir="rtl"` is applied for Arabic locale on unfixed code
  - Write property-based tests: for all valid locales and message objects, `NextIntlClientProvider` passes messages through correctly after fix (from Preservation Requirements in design)
  - Write property-based tests: for all valid locales, Navbar navigation elements render correctly after fix
  - Verify tests PASS on UNFIXED code (with ThemeToggle mocked to isolate preservation behavior)
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 3. Fix for missing ThemeProvider in LocaleLayout
  - [ ] 3.1 Implement the fix in `src/app/[locale]/layout.tsx`
    - Add import: `import { ThemeProvider } from '@/components/ui/theme-provider'`
    - Wrap `NextIntlClientProvider` (and its children) with `ThemeProvider` inside the `ErrorBoundary`:
      ```tsx
      <ErrorBoundary>
        <ThemeProvider>
          <NextIntlClientProvider messages={messages}>
            <Navbar />
            <div className="flex-1">{children}</div>
          </NextIntlClientProvider>
        </ThemeProvider>
      </ErrorBoundary>
      ```
    - No other changes needed — `ThemeProvider` works correctly with default props
    - _Bug_Condition: `hasThemeToggleInTree(input.componentTree) AND NOT hasThemeProviderAncestor(input.componentTree, ThemeToggle)` from design_
    - _Expected_Behavior: any component calling `useTheme()` receives a valid theme context and renders without error_
    - _Preservation: `NextIntlClientProvider`, Navbar rendering, locale routing, RTL direction, ErrorBoundary, Analytics, SpeedInsights must remain unchanged_
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4_

  - [ ] 3.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - ThemeProvider Context Available to All Consumers
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior: `ThemeToggle` renders without throwing when `ThemeProvider` is present
    - Run bug condition exploration test from step 1 on FIXED code
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed — `useTheme()` no longer throws)
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - NextIntlClientProvider and Existing Functionality Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2 on FIXED code
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions in i18n, navigation, routing, RTL)
    - Confirm all tests still pass after fix (no regressions)

- [ ] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
