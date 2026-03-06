# CalcEmpire - Global Engineering Toolbox

CalcEmpire is a professional-grade engineering calculator suite designed for engineers, students, and technical professionals. It provides a comprehensive range of calculation tools, interactive visualizers, and unit converters within a high-performance, multilingual environment.

## Key Features

### Interactive Engineering Visualizers
*   **Resistor Color Code Calculator**: Real-time calculation supporting 4, 5, and 6 band resistors.
*   **Beam Deflection Analyzer**: Dynamic structural analysis for cantilever and simply supported beams.
*   **Normal Distribution Visualizer**: Interactive statistical modeling with adjustable mean and standard deviation parameters.

### Core Calculation Categories
*   **Electrical Engineering**: Ohm's Law (Voltage, Current, Resistance, Power), Series/Parallel circuits, LED resistor sizing, RC time constants, and AC power analysis.
*   **Mechanical Engineering**: Beam deflection, Gear ratios, Torque/Power relationships, and Thermal expansion.
*   **Fluid Mechanics**: Reynolds number and Darcy-Weisbach pressure loss calculations.
*   **Statistics**: Descriptive statistics, Confidence intervals, Z-score calculations, and Normal Distribution functions.
*   **Geometry**: Volumetric and surface area calculations for complex solids (Sphere, Torus, Cone, Cylinder).
*   **Material Science**: Hardness conversion, Stress-strain analysis, and Material weight calculations.

### Technical Infrastructure
*   **Framework**: Next.js 16 (App Router) with React 19.
*   **Styling**: Tailwind CSS v4 for optimized, responsive utility-first styling.
*   **Language**: Strict TypeScript for type-safe engineering logic.
*   **Internationalization**: Next-intl implementation with automated translation pipeline.
*   **Testing**: Comprehensive test coverage using Vitest and React Testing Library (300+ validated test cases).

## Getting Started

### Prerequisites
*   Node.js 18.x or higher
*   NPM 9.x or higher

### Installation
1. Install project dependencies:
   ```bash
   npm install
   ```

2. Launch the development server:
   ```bash
   npm run dev
   ```

3. Execute documentation and logic tests:
   ```bash
   npm test
   ```

4. Generate production build:
   ```bash
   npm run build
   ```

## Supported Languages
The application currently supports the following locales:
*   English (Default)
*   Turkish
*   Russian
*   Hindi
*   Japanese

## Project Architecture
The codebase is structured for modularity and scalability:
*   `src/app/[locale]/`: Internationalized routing and page layouts.
*   `src/components/`: Modular UI components categorized into Dashboard, Visualizers, and Atomic UI.
*   `src/lib/formulas/`: Pure, tested engineering logic and mathematical models.
*   `src/__tests__/`: Extensive TDD contract tests ensuring calculation accuracy.
*   `scripts/`: Automated translation utilities utilizing OpenAI API.

## Educational Disclaimer
These tools are intended for educational and preliminary analytical purposes. For critical engineering applications, always verify results using certified professional software and manual calculation methods.

## License
This project is licensed under the MIT License - see the LICENSE file for details.
