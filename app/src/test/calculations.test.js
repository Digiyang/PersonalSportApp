import { describe, it, expect } from 'vitest';
import {
  calculateBMI,
  getBMICategory,
  calculateBMR,
  calculateTDEE,
  calculateMacros,
  calculateCalorieAdjustment,
  calculateWaterIntake,
  calculateWeeksToGoal,
  getBodyFatEstimate,
} from '../utils/calculations';

describe('calculateBMI', () => {
  it('calculates BMI correctly', () => {
    expect(calculateBMI(80, 180)).toBeCloseTo(24.69, 1);
  });

  it('handles edge cases', () => {
    expect(calculateBMI(50, 150)).toBeCloseTo(22.22, 1);
    expect(calculateBMI(120, 190)).toBeCloseTo(33.24, 1);
  });
});

describe('getBMICategory', () => {
  it('returns correct categories', () => {
    expect(getBMICategory(17).label).toBe('Underweight');
    expect(getBMICategory(22).label).toBe('Normal');
    expect(getBMICategory(27).label).toBe('Overweight');
    expect(getBMICategory(32).label).toBe('Obese');
  });
});

describe('calculateBMR', () => {
  it('calculates male BMR', () => {
    const bmr = calculateBMR(80, 180, 30, 'male');
    expect(bmr).toBeGreaterThan(1500);
    expect(bmr).toBeLessThan(2000);
  });

  it('calculates female BMR lower than male', () => {
    const male = calculateBMR(70, 170, 30, 'male');
    const female = calculateBMR(70, 170, 30, 'female');
    expect(female).toBeLessThan(male);
  });
});

describe('calculateTDEE', () => {
  it('applies activity multipliers', () => {
    const bmr = 1700;
    expect(calculateTDEE(bmr, 'sedentary')).toBe(bmr * 1.2);
    expect(calculateTDEE(bmr, 'active')).toBe(bmr * 1.725);
  });

  it('defaults to moderate', () => {
    const bmr = 1700;
    expect(calculateTDEE(bmr, 'unknown')).toBe(bmr * 1.55);
  });
});

describe('calculateMacros', () => {
  it('returns calories, protein, carbs, fat', () => {
    const macros = calculateMacros(2500, 'maintain', 80, 80, null);
    expect(macros.calories).toBeGreaterThan(1200);
    expect(macros.protein).toBeGreaterThan(0);
    expect(macros.carbs).toBeGreaterThan(0);
    expect(macros.fat).toBeGreaterThan(0);
  });

  it('creates deficit for weight loss', () => {
    const maintain = calculateMacros(2500, 'maintain', 80, 80, null);
    const lose = calculateMacros(2500, 'lose', 80, 70, 12);
    expect(lose.calories).toBeLessThan(maintain.calories);
  });

  it('creates surplus for muscle gain', () => {
    const maintain = calculateMacros(2500, 'maintain', 70, 70, null);
    const gain = calculateMacros(2500, 'gain', 70, 75, 20);
    expect(gain.calories).toBeGreaterThan(maintain.calories);
  });

  it('never goes below 1200 calories', () => {
    const macros = calculateMacros(1300, 'lose', 100, 60, 4);
    expect(macros.calories).toBeGreaterThanOrEqual(1200);
  });
});

describe('calculateCalorieAdjustment', () => {
  it('returns 0 when at target weight', () => {
    expect(calculateCalorieAdjustment(80, 80, 12)).toBe(0);
  });

  it('returns positive for weight loss', () => {
    expect(calculateCalorieAdjustment(90, 80, 20)).toBeGreaterThan(0);
  });

  it('caps adjustment', () => {
    const extreme = calculateCalorieAdjustment(120, 60, 4);
    expect(extreme).toBeLessThanOrEqual(1000);
  });
});

describe('calculateWaterIntake', () => {
  it('returns liters based on weight', () => {
    const water = calculateWaterIntake(80, 'moderate');
    expect(water).toBeGreaterThan(2);
    expect(water).toBeLessThan(4);
  });

  it('adds extra for active people', () => {
    const moderate = calculateWaterIntake(70, 'moderate');
    const active = calculateWaterIntake(70, 'active');
    expect(active).toBeGreaterThan(moderate);
  });
});

describe('calculateWeeksToGoal', () => {
  it('returns provided weeks if set', () => {
    expect(calculateWeeksToGoal(80, 75, 12)).toBe(12);
  });

  it('estimates weeks when not provided', () => {
    const weeks = calculateWeeksToGoal(80, 75, null);
    expect(weeks).toBeGreaterThan(0);
  });
});

describe('getBodyFatEstimate', () => {
  it('returns a percentage', () => {
    const bf = getBodyFatEstimate(24, 30, 'male');
    expect(bf).toBeGreaterThan(5);
    expect(bf).toBeLessThan(40);
  });
});
