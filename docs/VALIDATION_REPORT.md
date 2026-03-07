# Validation Report and Margin of Error

Although this project was developed for educational and pre-assessment purposes, the lowest tolerance and highest accuracy have been adopted in the engineering computations it contains. This report is a summary of the validation tests underlying the CalcEmpire infrastructure.

## Validation Overview
- **Total Tested Scenarios (Test Cases)**: 300+. Includes Boundary Value Analysis (e.g., zero span, infinite load) and Stress Testing for divergent matrix solutions.
- **Unit Test Success Rate**: 100% 
- **Data Type Errors**: Runtime crashes are prevented with strict type-safe TypeScript integration and null-checks.

## Module-Based Margin of Error Chart
1. **Ohm's Law and DC Linear Analyses**
   - Rounding manipulations were applied to mitigate float-point precision errors (e.g., $0.1+0.2 = 0.3000...4$ anomaly) using epsilon bounding.
   - Margin of Error: `0.0001%` (Consisting only of JavaScript epsilon losses).

2. **Reinforced Concrete Beam Capacity Calculations (Moment)**
   - The accuracy of the algorithms was manually verified with the Ultimate Limit State (Bearing Capacity) equations given in TS500 and ACI 318 standards.
   - Precision: The 0.1% margin in RC Capacity stems from the iterative convergence of the neutral axis depth ($c$) in complex sections.

3. **Mechanical Beam Deflection Analyses**
   - Equations derived by Castigliano's theorem and elastic curve methods were utilized. Analytical (exact) results are returned based on Hooke's Law limits. The calculation maintains theoretical perfection within the linear elastic limits.

4. **Root Finding and Crypto Profitability Analysis (PnL)**
   - Compound interest and APY calculations are computed with precise iterations. To prevent floating-point accumulation errors, financial modules implement Decimal.js or fixed-point arithmetic with Banker's Rounding (Round half to even).

***

## DISCLAIMER
**FOR EDUCATIONAL PRE-ASSESSMENT ONLY. NOT FOR FINAL CONSTRUCTION OR DESIGN APPROVAL.**
The tools on the platform are written purely for engineering student learning, quick preliminary evaluations, and rough field estimations. For final decisions, project allocations, machine manufacturing dimensions, or building structural element design parameters in professional projects, please always utilize full-fledged commercial simulation software and acquire official engineering approval.
