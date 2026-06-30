export function calculateBMI(weightKg, heightCm) {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

export function getBMICategory(bmi) {
  if (bmi < 18.5) return { label: 'Underweight', color: '#3b82f6' };
  if (bmi < 25) return { label: 'Normal', color: '#22c55e' };
  if (bmi < 30) return { label: 'Overweight', color: '#f59e0b' };
  return { label: 'Obese', color: '#ef4444' };
}

export function calculateBMR(weightKg, heightCm, age, gender) {
  if (gender === 'male') {
    return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  }
  return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
}

export function calculateTDEE(bmr, activityLevel) {
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  return bmr * (multipliers[activityLevel] || 1.55);
}

export function calculateCalorieAdjustment(currentWeight, targetWeight, goalWeeks) {
  if (!goalWeeks || goalWeeks <= 0 || currentWeight === targetWeight) return 0;
  const totalKg = currentWeight - targetWeight;
  const kgPerWeek = totalKg / goalWeeks;
  const caloriesPerKg = 7700;
  const dailyAdjustment = (kgPerWeek * caloriesPerKg) / 7;
  return Math.round(Math.max(-1000, Math.min(700, dailyAdjustment)));
}

export function calculateMacros(calories, goal, currentWeight, targetWeight, goalWeeks) {
  let adjustment;
  if (goalWeeks && goalWeeks > 0 && currentWeight && targetWeight) {
    adjustment = calculateCalorieAdjustment(currentWeight, targetWeight, goalWeeks);
  } else if (goal === 'lose') {
    adjustment = 500;
  } else if (goal === 'gain') {
    adjustment = -300;
  } else {
    adjustment = 0;
  }

  const adjustedCalories = Math.max(1200, calories - adjustment);

  if (goal === 'lose') {
    return {
      calories: Math.round(adjustedCalories),
      protein: Math.round((adjustedCalories * 0.35) / 4),
      carbs: Math.round((adjustedCalories * 0.35) / 4),
      fat: Math.round((adjustedCalories * 0.30) / 9),
      deficit: adjustment,
    };
  }
  if (goal === 'gain') {
    return {
      calories: Math.round(adjustedCalories),
      protein: Math.round((adjustedCalories * 0.30) / 4),
      carbs: Math.round((adjustedCalories * 0.45) / 4),
      fat: Math.round((adjustedCalories * 0.25) / 9),
      surplus: -adjustment,
    };
  }
  return {
    calories: Math.round(adjustedCalories),
    protein: Math.round((adjustedCalories * 0.30) / 4),
    carbs: Math.round((adjustedCalories * 0.40) / 4),
    fat: Math.round((adjustedCalories * 0.30) / 9),
    deficit: 0,
  };
}

export function calculateWeeksToGoal(currentWeight, targetWeight, goalWeeks) {
  if (goalWeeks && goalWeeks > 0) return goalWeeks;
  const diff = Math.abs(currentWeight - targetWeight);
  const ratePerWeek = currentWeight > targetWeight ? 0.5 : 0.3;
  return Math.ceil(diff / ratePerWeek);
}

export function getBodyFatEstimate(bmi, age, gender) {
  if (gender === 'male') {
    return (1.20 * bmi) + (0.23 * age) - 16.2;
  }
  return (1.20 * bmi) + (0.23 * age) - 5.4;
}

export function calculateWaterIntake(weightKg, activityLevel) {
  let base = weightKg * 0.033;
  if (activityLevel === 'active' || activityLevel === 'very_active') {
    base += 0.5;
  }
  return Math.round(base * 10) / 10;
}
