# Technical API & Formula Reference

This document summarizes the mathematics and methodologies underlying the system infrastructure. The following outlines the exact assumptions, empirical equations, and academic references utilized within the computational modules.

## 1. Electrical and Electronics Module
- **Ohm's Law**: $V = I \cdot R$ (Linear functionality of Voltage, Current, Resistance)
- **Electrical Power Calculation**: $P = V \cdot I \cdot \cos(\varphi)$ 
  - *Note*: For AC power analyses, apparent power and active power are separated. The default power factor $\cos(\varphi)$ is taken as 1.0 (ideal resistive load) for DC calculations.
- **Kirchhoff's Node and Loop Laws**:
  - The sum of currents entering is equal to the sum of currents leaving ($\sum I_{in} = \sum I_{out}$).
  - System solves nodal equations using LU Decomposition for numerical stability (IEEE 754 compliant).

## 2. Civil Engineering
- **Reinforced Concrete Beam Capacity**: 
  (Assuming singly reinforced rectangular section members)
  - Compression Block Depth (Whitney Equivalent Stress Block): 
    $$a = \frac{A_s \cdot f_{yd}}{0.85 \cdot f_{cd} \cdot b_w}$$ 
  - Bearing Capacity (Design Moment Formula): 
    $$M_r = A_s \cdot f_{yd} \cdot \left(d - \frac{a}{2}\right)$$
  - *References*: The basic coefficients of the system are based on the fundamental principles of TS500 (Turkish Standards) and ACI 318 moment calculation theorems. Safety factors applied: $\gamma_{mc}=1.5, \gamma_{ms}=1.15$ (TS500/Eurocode 2 standard). The module throws a "Brittle Failure" warning in case of an excessive reinforcement ratio in the section.

## 3. Mechanical & Strength Analysis
- **Simply Supported Beam Deflection Calculation** (Point Load at Center):
  $$\delta_{max} = \frac{P \cdot L^3}{48 \cdot E \cdot I}$$
- **Cantilever Beam Deflection Calculation** (Point Load at Free End):
  $$\delta_{max} = \frac{P \cdot L^3}{3 \cdot E \cdot I}$$
  - *Reference*: The exact differential equations in the solutions are calculated based on "R. C. Hibbeler - Mechanics of Materials (10th Edition)" with the assumption of linear elastic material. Valid for small deflections within the linear elastic range (Hooke’s Law).
- **Stress**:
  Measurements are designed globally in MPa or PSI metric/imperial basis with the mechanics of $\sigma = \frac{F}{A}$.

## 4. Probability, Statistics, and Fluids
- **Normal Distribution (Bell Curve)**: 
  Continuous Probability Density Function (PDF):
  $$f(x) = \frac{1}{\sigma\sqrt{2\pi}} e^{-\frac{1}{2}\left(\frac{x-\mu}{\sigma}\right)^2}$$
  - While extracting analytical data from the curve, it is integrated with computational libraries to visualize the empirical rule (68%, 95%, 99.7%) over the standard deviation.
- **Fluid Mechanics**:
  - Ideal flow uses Bernoulli equation:
    $$P_1 + \frac{1}{2} \rho v_1^2 + \rho g h_1 = P_2 + \frac{1}{2} \rho v_2^2 + \rho g h_2$$
  - Real-pipe friction loss uses Darcy-Weisbach equation where $f$ is solved via Colebrook-White iteration.
