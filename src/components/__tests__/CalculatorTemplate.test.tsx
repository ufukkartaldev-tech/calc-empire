import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import CalculatorTemplate from '../CalculatorTemplate';
import { ohmConfig } from '@/lib/calculators/ohm';
import { useCalculatorStore } from '@/stores/calculatorStore';

// Mock the solver registry since it's used in handleSolve
vi.mock('@/lib/calculators/registry', () => ({
  SOLVER_REGISTRY: {
    ohm: (values: Record<string, { value: number | null; unit?: string }>) => {
      // Simple Ohm's Law mock logic for testing
      const v = values.voltage?.value;
      const i = values.current?.value;
      const r = values.resistance?.value;

      if (v !== null && r !== null && i === null) return { current: v / r };
      if (v !== null && i !== null && r === null) return { resistance: v / i };
      if (i !== null && r !== null && v === null) return { voltage: i * r };
      return {};
    },
  },
  ASYNC_SOLVER_REGISTRY: {},
}));

describe('CalculatorTemplate', () => {
  beforeEach(() => {
    // Reset store before each test to ensure isolation
    useCalculatorStore.setState({
      calculators: new Map(),
      isHydrated: true,
    });
  });

  it('renders all fields from config', () => {
    render(<CalculatorTemplate config={ohmConfig} />);

    // Check if labels are rendered (mocked translations return the key)
    expect(screen.getByText('OhmCalculator.voltage')).toBeInTheDocument();
    expect(screen.getByText('OhmCalculator.current')).toBeInTheDocument();
    expect(screen.getByText('OhmCalculator.resistance')).toBeInTheDocument();
  });

  it('calculates result when inputs are provided and solve is clicked', async () => {
    render(<CalculatorTemplate config={ohmConfig} />);

    // Ohm's Law: V = I * R. To find I, we need V and R.
    const inputs = screen.getAllByRole('spinbutton');
    const voltageInput = inputs[0]; // voltage
    const currentInput = inputs[1]; // current (unknown)
    const resistanceInput = inputs[2]; // resistance

    const solveButton = screen.getByText('CalculatorTemplate.solveButton');

    // Enter values: V=10, R=2 -> expected I=5
    fireEvent.change(voltageInput, { target: { value: '10' } });
    fireEvent.change(resistanceInput, { target: { value: '2' } });

    fireEvent.click(solveButton);

    // Wait for the result to be calculated and displayed in the 'current' field
    await waitFor(() => {
      expect(currentInput).toHaveValue(5);
    });
  });

  it('resets all fields when reset button is clicked', async () => {
    render(<CalculatorTemplate config={ohmConfig} />);

    const inputs = screen.getAllByRole('spinbutton');
    const voltageInput = inputs[0];
    const resetButton = screen.getByText('CalculatorTemplate.resetButton');

    // Fill an input
    fireEvent.change(voltageInput, { target: { value: '10' } });
    expect(voltageInput).toHaveValue(10);

    // Click reset
    fireEvent.click(resetButton);

    // Field should be empty (null for number input in RTL/Jest-DOM usually)
    expect(voltageInput).toHaveValue(null);
  });
});
