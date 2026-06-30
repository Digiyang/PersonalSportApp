import { describe, it, expect } from 'vitest';
import {
  generateMealPlan,
  generateWeeklyMealPlan,
  generateWeeklyShoppingList,
  mealDatabase,
  getReplacementsFor,
} from '../data/meals';

describe('mealDatabase', () => {
  it('has all meal categories', () => {
    expect(mealDatabase.breakfast.length).toBeGreaterThan(0);
    expect(mealDatabase.lunch.length).toBeGreaterThan(0);
    expect(mealDatabase.dinner.length).toBeGreaterThan(0);
    expect(mealDatabase.snack.length).toBeGreaterThan(0);
  });

  it('every meal has required fields', () => {
    for (const category of ['breakfast', 'lunch', 'dinner', 'snack']) {
      for (const meal of mealDatabase[category]) {
        expect(meal.name).toBeTruthy();
        expect(meal.calories).toBeGreaterThan(0);
        expect(meal.protein).toBeGreaterThanOrEqual(0);
        expect(meal.carbs).toBeGreaterThanOrEqual(0);
        expect(meal.fat).toBeGreaterThanOrEqual(0);
        expect(meal.ingredients).toBeInstanceOf(Array);
        expect(meal.instructions).toBeInstanceOf(Array);
      }
    }
  });
});

describe('generateMealPlan', () => {
  it('generates a day plan with 4 meals', () => {
    const plan = generateMealPlan(2000, 'maintain', []);
    expect(plan.breakfast).toBeTruthy();
    expect(plan.lunch).toBeTruthy();
    expect(plan.dinner).toBeTruthy();
    expect(plan.snack).toBeTruthy();
    expect(plan.totalCalories).toBeGreaterThan(0);
  });

  it('excludes foods when specified', () => {
    const plan = generateMealPlan(2000, 'maintain', ['eggs']);
    const allIngredients = [
      ...plan.breakfast.ingredients,
      ...plan.lunch.ingredients,
      ...plan.dinner.ingredients,
      ...plan.snack.ingredients,
    ].join(' ').toLowerCase();
    expect(allIngredients).not.toContain('eggs');
  });
});

describe('generateWeeklyMealPlan', () => {
  it('generates 7 different days', () => {
    const week = generateWeeklyMealPlan(2000, 'maintain', []);
    expect(week.length).toBe(7);
    for (const day of week) {
      expect(day.breakfast).toBeTruthy();
      expect(day.totalCalories).toBeGreaterThan(0);
    }
  });
});

describe('generateWeeklyShoppingList', () => {
  it('returns categorized items', () => {
    const week = generateWeeklyMealPlan(2000, 'maintain', []);
    const list = generateWeeklyShoppingList(week, []);
    expect(typeof list).toBe('object');
    const totalItems = Object.values(list).reduce((sum, items) => sum + items.length, 0);
    expect(totalItems).toBeGreaterThan(0);
  });
});

describe('getReplacementsFor', () => {
  it('returns replacement options', () => {
    const replacements = getReplacementsFor('chicken');
    expect(replacements).toBeInstanceOf(Array);
  });
});
