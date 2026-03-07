# User Guide

**FOR EDUCATIONAL PRE-ASSESSMENT ONLY. NOT FOR FINAL CONSTRUCTION OR DESIGN APPROVAL.**

This guide defines the operational limits and methodologies of CalcEmpire tools. User input validation is strictly enforced to ensure physical consistency.

Below is an overview of the primary modules and their respective functionalities.

## Electrical & Electronics
- **Ohm's Law Calculator**: Implements the fundamental relationship `V = I × R`. The system requires two inputs and will automatically calculate the missing variable.
- **Resistor Color Codes**: Translates standard color band combinations (4, 5, or 6 bands) into exact resistance values and tolerance margins.
- **Kirchhoff's Laws**: Provides an interface for establishing and solving nodal and loop equations in an electrical circuit.
- **Bode Plot**: Visualizes the frequency response, calculating magnitude and phase margin for filter and system design.

## Civil & Structural
- **Concrete Section Analysis**: Evaluates the Moment Capacity ($M_r$) of sections under Ultimate Limit State (ULS). Upon entering the rebar area, steel yield strength, and concrete compressive strength, the tool computes the capacity and classifies the failure mode (ductile or brittle) with corresponding safety warnings.
- **Soil Mechanics**: Assists in effective stress analysis and geotechnical calculations to determine the load-bearing capacity of soils.

## Mechanical
- **Beam Deflection Analysis**: Performs deflection calculations for cantilever and simply supported beams under point and distributed loads. Visualization displays elastic curve based on $L/d$ ratios. Safety warnings trigger when deflection exceeds $L/360$ (or user-defined) limits.
- **Stress & Strain**: Analyzes the mechanical properties of a material undergoing tension or compression, determining elongation and the structural yield point.

## Statistics & Mathematics
- **Normal Distribution**: Generates a standard bell curve visualization based on user-provided standard deviation and mean values, presenting the probability density function.
- **Matrix Calculator**: Facilitates complex linear algebra operations such as matrix multiplication, inversion, and determinant solving.
- **Unit Converters**: Standardizes engineering conversions across imperial and metric systems, encompassing pressure, temperature, energy, distance, and weight.

## Software & Digital
- **Base Converter**: Translates numerical values across binary, hexadecimal, decimal, and octal bases, supporting visual bitwise operations.
- **JSON/YAML Formatter**: Parses, validates, and formats broken or unreadable JSON/YAML data structures.
- **Cron Parser**: Decodes and translates scheduled task syntax into a human-readable format.

All modules are engineered with strict input constraints to minimize human error. If incomplete or invalid data is provided, the relevant calculation will halt, and a guiding warning will be displayed.
