# Beam Deflection Analysis

## Definition

Beam deflection refers to the displacement of a beam under load. It is a critical parameter in structural engineering design.

## Basic Formulas

### Simply Supported Beam (Center Load)

$$\delta_{max} = \frac{P L^3}{48 E I}$$

### Cantilever Beam (End Load)

$$\delta_{max} = \frac{P L^3}{3 E I}$$

Where:
- **δ** = Deflection (m)
- **P** = Load (N)
- **L** = Length (m)
- **E** = Elastic modulus (Pa)
- **I** = Moment of inertia (m⁴)

## Example Calculation

### Given:
- Load (P) = 1000 N
- Length (L) = 2 m
- Elastic Modulus (E) = 200 GPa
- Moment of Inertia (I) = 8.33 × 10⁻⁶ m⁴

### Find:
Maximum deflection for simply supported beam

### Solution:

$$\delta_{max} = \frac{1000 \times 2^3}{48 \times 200 \times 10^9 \times 8.33 \times 10^{-6}} = 0.005 \text{ m} = 5 \text{ mm}$$

## Safety Criteria

- Maximum deflection should not exceed L/360
- Check for buckling
- Verify material strength

## Practical Applications

- Building construction
- Bridge design
- Machine frames
- Aircraft structures
