import { describe, it, expect } from 'vitest'
import { ohm } from '../lib/formulas'

describe('Ohm\'s Law Formulas', () => {
    describe('Basic Calculations', () => {
        it('should calculate resistance (R = V / I)', () => {
            // V = 10V, I = 2A => R = 5Ω
            expect(ohm({ voltage: 10, current: 2 }).resistance).toBe(5)
        })

        it('should calculate voltage (V = I * R)', () => {
            // I = 0.5A, R = 100Ω => V = 50V
            expect(ohm({ current: 0.5, resistance: 100 }).voltage).toBe(50)
        })

        it('should calculate current (I = V / R)', () => {
            // V = 12V, R = 4Ω => I = 3A
            expect(ohm({ voltage: 12, resistance: 4 }).current).toBe(3)
        })
    })

    describe('Error Handling', () => {
        it('should throw error for zero or negative values', () => {
            expect(() => ohm({ voltage: 0, current: 2 })).toThrow('Invalid value: must be greater than 0')
            expect(() => ohm({ voltage: 10, resistance: -5 })).toThrow('Invalid value: must be greater than 0')
        })

        it('should throw "Missing value" for insufficient parameters', () => {
            // @ts-ignore - testing runtime error for missing values
            expect(() => ohm({ voltage: 10 })).toThrow('Missing value')
        })
    })

    describe('Unit Conversion', () => {
        it('should handle "kilo" (k) prefix correctly', () => {
            // R = 1kΩ = 1000Ω, I = 2mA = 0.002A => V = 2V
            // We expect the library to handle strings with units or a separate unit field.
            // Let's assume the API handles value and unit as objects or strings.
            // For TDD, let's go with an object approach: { value: 1, unit: 'k' }
            expect(ohm({
                resistance: { value: 1, unit: 'k' }, // 1000
                current: { value: 2, unit: 'm' }     // 0.002
            }).voltage).toBe(2)
        })
    })
})
