# Normal Distribution

## Definition

The normal distribution, also known as the Gaussian distribution, is a continuous probability distribution that is symmetric about the mean.

## Basic Formula

### Probability Density Function (PDF)

$$f(x) = \frac{1}{\sigma \sqrt{2\pi}} e^{-\frac{1}{2} \left( \frac{x - \mu}{\sigma} \right)^2}$$

### Cumulative Distribution Function (CDF)

$$F(x) = \frac{1}{2} \left[ 1 + \text{erf} \left( \frac{x - \mu}{\sigma \sqrt{2}} \right) \right]$$

Where:

- **μ** = Mean
- **σ** = Standard deviation
- **erf** = Error function

## Example Calculation

### Given:

- Mean (μ) = 100
- Standard Deviation (σ) = 15
- Value (x) = 115

### Find:

Probability P(X ≤ 115)

### Solution:

$$z = \frac{x - \mu}{\sigma} = \frac{115 - 100}{15} = 1$$

$$P(X \leq 115) = \Phi(1) = 0.8413$$

## Empirical Rule

- 68% of data within ±1σ
- 95% of data within ±2σ
- 99.7% of data within ±3σ

## Practical Applications

- Quality control
- Statistical analysis
- Risk assessment
- Hypothesis testing
