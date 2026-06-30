import { describe, it, expect } from 'vitest';
import {
  exercises,
  equipmentList,
  splitTypes,
  muscleGroups,
  warmupExercises,
  getExercisesByMuscle,
  getExercisesByEquipment,
  generateSplitWorkout,
  generateWorkout,
  generateWarmup,
  buildWeeklyTemplate,
  getProgressionForWeek,
  getCurrentWeekNumber,
} from '../data/exercises';

describe('exercises data', () => {
  it('has 1324 exercises', () => {
    expect(exercises.length).toBe(1324);
  });

  it('every exercise has required fields', () => {
    for (const e of exercises) {
      expect(e.id).toBeTruthy();
      expect(e.name).toBeTruthy();
      expect(e.equipment).toBeInstanceOf(Array);
      expect(e.equipment.length).toBeGreaterThan(0);
      expect(e.muscles).toBeInstanceOf(Array);
      expect(['push', 'pull', 'legs_core']).toContain(e.split);
      expect(['beginner', 'intermediate', 'advanced']).toContain(e.difficulty);
      expect(e.sets).toBeGreaterThan(0);
      expect(e.reps).toBeTruthy();
      expect(e.rest).toBeGreaterThan(0);
      expect(e.gifPath).toBeTruthy();
    }
  });

  it('covers all three splits', () => {
    const splits = new Set(exercises.map(e => e.split));
    expect(splits.has('push')).toBe(true);
    expect(splits.has('pull')).toBe(true);
    expect(splits.has('legs_core')).toBe(true);
  });

  it('every equipment ID maps to equipmentList', () => {
    const validIds = new Set(equipmentList.map(eq => eq.id));
    for (const e of exercises) {
      for (const eq of e.equipment) {
        expect(validIds.has(eq)).toBe(true);
      }
    }
  });
});

describe('equipmentList', () => {
  it('includes bodyweight', () => {
    expect(equipmentList.some(eq => eq.id === 'bodyweight')).toBe(true);
  });

  it('each item has id, name, icon', () => {
    for (const eq of equipmentList) {
      expect(eq.id).toBeTruthy();
      expect(eq.name).toBeTruthy();
      expect(eq.icon).toBeTruthy();
    }
  });
});

describe('warmupExercises', () => {
  it('has exercises', () => {
    expect(warmupExercises.length).toBeGreaterThan(0);
  });

  it('each warmup has required fields', () => {
    for (const w of warmupExercises) {
      expect(w.id).toBeTruthy();
      expect(w.name).toBeTruthy();
      expect(w.duration).toBeTruthy();
      expect(w.category).toBeTruthy();
    }
  });
});

describe('getExercisesByMuscle', () => {
  it('filters by muscle', () => {
    const chest = getExercisesByMuscle('chest');
    expect(chest.length).toBeGreaterThan(0);
    expect(chest.every(e => e.muscles.includes('chest'))).toBe(true);
  });
});

describe('getExercisesByEquipment', () => {
  it('filters by equipment', () => {
    const bw = getExercisesByEquipment('bodyweight');
    expect(bw.length).toBeGreaterThan(0);
    expect(bw.every(e => e.equipment.includes('bodyweight'))).toBe(true);
  });
});

describe('generateSplitWorkout', () => {
  it('generates push workout', () => {
    const workout = generateSplitWorkout('push', 'beginner', 1, ['bodyweight']);
    expect(workout.length).toBeGreaterThan(0);
    expect(workout.length).toBeLessThanOrEqual(6);
    expect(workout.every(e => e.split === 'push')).toBe(true);
  });

  it('respects equipment filter', () => {
    const workout = generateSplitWorkout('pull', 'beginner', 1, ['bodyweight']);
    expect(workout.every(e => e.equipment.every(eq => ['bodyweight'].includes(eq)))).toBe(true);
  });

  it('applies progression', () => {
    const w1 = generateSplitWorkout('push', 'beginner', 1, ['bodyweight', 'dumbbells']);
    const w5 = generateSplitWorkout('push', 'beginner', 5, ['bodyweight', 'dumbbells']);
    expect(w5[0]._weekProgression).toBe('Progressing');
  });
});

describe('generateWorkout', () => {
  it('generates workout with focus muscles', () => {
    const workout = generateWorkout('beginner', 'medium', ['chest'], ['bodyweight']);
    expect(workout.length).toBeGreaterThan(0);
  });
});

describe('generateWarmup', () => {
  it('returns warmup exercises', () => {
    const warmup = generateWarmup(['chest'], true);
    expect(warmup.length).toBeGreaterThan(0);
  });
});

describe('buildWeeklyTemplate', () => {
  it('builds 7-day plan', () => {
    const plan = buildWeeklyTemplate([1, 3, 5]);
    expect(plan.length).toBe(7);
    expect(plan[1].type).toBe('push');
    expect(plan[3].type).toBe('pull');
    expect(plan[5].type).toBe('legs_core');
    expect(plan[0].type).toBe('rest');
  });
});

describe('getProgressionForWeek', () => {
  it('starts at Foundation', () => {
    expect(getProgressionForWeek(1).label).toBe('Foundation');
  });

  it('progresses over time', () => {
    expect(getProgressionForWeek(5).label).toBe('Progressing');
    expect(getProgressionForWeek(9).label).toBe('Peak');
  });
});

describe('getCurrentWeekNumber', () => {
  it('returns 1 with no start date', () => {
    expect(getCurrentWeekNumber(null)).toBe(1);
  });

  it('returns 1 for today', () => {
    expect(getCurrentWeekNumber(new Date().toISOString())).toBe(1);
  });
});
