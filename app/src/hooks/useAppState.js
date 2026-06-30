import { useState, useEffect, useCallback } from 'react';
import { loadData, saveData } from '../utils/storage';

const defaultState = {
  profile: null,
  workoutLog: [],
  mealLog: [],
  waterLog: [],
  weightLog: [],
  achievements: [],
  streak: 0,
  lastWorkoutDate: null,
  settings: {
    darkMode: true,
    notifications: true,
    units: 'metric',
  },
};

export function useAppState() {
  const [state, setState] = useState(() => {
    const saved = loadData();
    return saved || defaultState;
  });

  useEffect(() => {
    saveData(state);
  }, [state]);

  const updateProfile = useCallback((profile) => {
    setState(prev => ({ ...prev, profile }));
  }, []);

  const logWorkout = useCallback((workout) => {
    setState(prev => {
      const today = new Date().toDateString();
      const lastDate = prev.lastWorkoutDate;
      const yesterday = new Date(Date.now() - 86400000).toDateString();

      let streak = prev.streak;
      if (lastDate === yesterday) {
        streak += 1;
      } else if (lastDate !== today) {
        streak = 1;
      }

      const newAchievements = [...prev.achievements];
      const totalWorkouts = prev.workoutLog.length + 1;

      if (totalWorkouts === 1 && !newAchievements.includes('first_workout')) {
        newAchievements.push('first_workout');
      }
      if (totalWorkouts === 10 && !newAchievements.includes('ten_workouts')) {
        newAchievements.push('ten_workouts');
      }
      if (totalWorkouts === 50 && !newAchievements.includes('fifty_workouts')) {
        newAchievements.push('fifty_workouts');
      }
      if (streak >= 7 && !newAchievements.includes('week_streak')) {
        newAchievements.push('week_streak');
      }
      if (streak >= 30 && !newAchievements.includes('month_streak')) {
        newAchievements.push('month_streak');
      }

      return {
        ...prev,
        workoutLog: [...prev.workoutLog, { ...workout, date: new Date().toISOString() }],
        lastWorkoutDate: today,
        streak,
        achievements: newAchievements,
      };
    });
  }, []);

  const logMeal = useCallback((meal) => {
    setState(prev => ({
      ...prev,
      mealLog: [...prev.mealLog, { ...meal, date: new Date().toISOString() }],
    }));
  }, []);

  const unlogMeal = useCallback((mealName, mealType) => {
    setState(prev => {
      const todayStr = new Date().toDateString();
      const idx = prev.mealLog.findIndex(m =>
        m.name === mealName && m.type === mealType && new Date(m.date).toDateString() === todayStr
      );
      if (idx === -1) return prev;
      const updated = [...prev.mealLog];
      updated.splice(idx, 1);
      return { ...prev, mealLog: updated };
    });
  }, []);

  const clearTodayMeals = useCallback(() => {
    setState(prev => {
      const todayStr = new Date().toDateString();
      return {
        ...prev,
        mealLog: prev.mealLog.filter(m => new Date(m.date).toDateString() !== todayStr),
      };
    });
  }, []);

  const logWater = useCallback((glasses) => {
    setState(prev => ({
      ...prev,
      waterLog: [...prev.waterLog, { glasses, date: new Date().toISOString() }],
    }));
  }, []);

  const logWeight = useCallback((weight) => {
    setState(prev => ({
      ...prev,
      weightLog: [...prev.weightLog, { weight, date: new Date().toISOString() }],
    }));
  }, []);

  const updateSettings = useCallback((newSettings) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings },
    }));
  }, []);

  const resetApp = useCallback(() => {
    setState(defaultState);
  }, []);

  return {
    state,
    updateProfile,
    logWorkout,
    logMeal,
    unlogMeal,
    clearTodayMeals,
    logWater,
    logWeight,
    updateSettings,
    resetApp,
  };
}
