# Kirchhoff's Laws

## Definition

Kirchhoff's Laws consist of two fundamental principles for electrical circuit analysis:

### Kirchhoff's Current Law (KCL)

The sum of currents entering a node equals the sum of currents leaving the node.

$$\sum I_{in} = \sum I_{out}$$

### Kirchhoff's Voltage Law (KVL)

The sum of all voltages around a closed loop is zero.

$$\sum V = 0$$

## Basic Formulas

### KCL at Node:

$$I_1 + I_2 = I_3 + I_4$$

### KVL for Loop:

$$V_1 - I R_1 - I R_2 = 0$$

## Example Calculation

### Given:

- V1 = 12 V
- V2 = 6 V
- R1 = 4 Ω
- R2 = 2 Ω
- R3 = 3 Ω

### Find:

Mesh currents I1 and I2

### Solution:

Mesh 1: $$I_1(R_1 + R_3) + I_2(R_3) = V_1$$
Mesh 2: $$I_1(R_3) + I_2(R_2 + R_3) = V_2$$

Solving:
$$I_1 = 2.14 \text{ A}, I_2 = 0.71 \text{ A}$$

## Practical Applications

- Complex circuit analysis
- Power system analysis
- Signal processing
- Control systems
