export const tipCategories = {
  nutrition_timing: {
    label: 'Meal Timing',
    icon: '⏰',
    color: '#fdcb6e',
  },
  rest_recovery: {
    label: 'Rest & Recovery',
    icon: '😴',
    color: '#74b9ff',
  },
  training: {
    label: 'Training',
    icon: '💪',
    color: '#a29bfe',
  },
  hydration: {
    label: 'Hydration',
    icon: '💧',
    color: '#00cec9',
  },
  motivation: {
    label: 'Motivation',
    icon: '🔥',
    color: '#ff6b6b',
  },
  sleep: {
    label: 'Sleep',
    icon: '🌙',
    color: '#6c5ce7',
  },
};

export const tips = [
  // NUTRITION TIMING
  {
    id: 1,
    category: 'nutrition_timing',
    title: 'Pre-Workout Meal',
    content: 'Eat a meal rich in complex carbs and moderate protein 2-3 hours before training. Good options: oatmeal with banana, rice with chicken, or a whole grain sandwich. This fuels your workout without feeling heavy.',
    priority: 'high',
  },
  {
    id: 2,
    category: 'nutrition_timing',
    title: 'Pre-Workout Snack',
    content: 'If you train within 1 hour, have a light snack: a banana, a handful of dates, or a small energy bar. Avoid fats and fiber close to training — they slow digestion and can cause discomfort.',
    priority: 'high',
  },
  {
    id: 3,
    category: 'nutrition_timing',
    title: 'Post-Workout Window',
    content: 'Eat within 30-60 minutes after training. Your muscles are most receptive to nutrients right after exercise. Aim for 20-40g protein + fast carbs: Greek yogurt with fruit, a protein shake with banana, or eggs with toast.',
    priority: 'high',
  },
  {
    id: 4,
    category: 'nutrition_timing',
    title: 'Don\'t Train on Empty',
    content: 'Fasted training can work for light cardio, but resistance training needs fuel. Training on empty leads to muscle breakdown, lower performance, and increased injury risk. At minimum, have a banana or juice.',
    priority: 'medium',
  },
  {
    id: 5,
    category: 'nutrition_timing',
    title: 'Evening Protein',
    content: 'Have a protein-rich snack before bed: cottage cheese, Greek yogurt, or a casein shake. Slow-digesting protein supports overnight muscle repair and reduces morning muscle soreness.',
    priority: 'medium',
  },
  {
    id: 6,
    category: 'nutrition_timing',
    title: 'Rest Day Nutrition',
    content: 'Don\'t starve on rest days — your muscles are still recovering and growing. Keep protein high (same as training days) but you can slightly reduce carbs since energy demands are lower.',
    priority: 'medium',
  },

  // REST & RECOVERY
  {
    id: 10,
    category: 'rest_recovery',
    title: 'Rest Days Are Mandatory',
    content: 'Take at least 1-2 rest days per week. Muscles grow during rest, not during training. Overtraining leads to plateaus, injuries, and burnout. Listen to your body — if you feel exhausted, take an extra day.',
    priority: 'high',
  },
  {
    id: 11,
    category: 'rest_recovery',
    title: 'The 48-Hour Rule',
    content: 'Wait at least 48 hours before training the same muscle group again. If you did push-ups Monday, don\'t do chest exercises until Wednesday. This gives muscle fibers time to repair and grow stronger.',
    priority: 'high',
  },
  {
    id: 12,
    category: 'rest_recovery',
    title: 'Active Recovery',
    content: 'On rest days, light activity helps recovery: a 20-minute walk, gentle stretching, or yoga. This increases blood flow to muscles without adding training stress. Avoid sitting all day on rest days.',
    priority: 'medium',
  },
  {
    id: 13,
    category: 'rest_recovery',
    title: 'Deload Every 4-6 Weeks',
    content: 'Every 4-6 weeks, reduce your training intensity by 40-50% for one week. This "deload" prevents overtraining, lets joints recover, and often leads to strength gains the following week.',
    priority: 'medium',
  },
  {
    id: 14,
    category: 'rest_recovery',
    title: 'Soreness vs. Pain',
    content: 'Muscle soreness (DOMS) 24-48 hours after training is normal and safe to train through lightly. Sharp pain, joint pain, or pain that doesn\'t improve is a warning sign — rest and consult a professional.',
    priority: 'high',
  },
  {
    id: 15,
    category: 'rest_recovery',
    title: 'Stretch After, Not Before',
    content: 'Static stretching before training can reduce strength. Save deep stretches for after your workout when muscles are warm. Before training, do dynamic warm-ups (arm circles, leg swings, light cardio).',
    priority: 'medium',
  },

  // TRAINING
  {
    id: 20,
    category: 'training',
    title: 'Progressive Overload',
    content: 'To keep progressing, gradually increase difficulty: add reps, use a stronger resistance band, slow down the tempo, or reduce rest time. Your body adapts — you must keep challenging it.',
    priority: 'high',
  },
  {
    id: 21,
    category: 'training',
    title: 'Form Over Ego',
    content: 'Perfect form with a lighter band beats sloppy form with a heavy one. Bad form doesn\'t build muscle — it builds injuries. If you can\'t maintain form, drop the resistance.',
    priority: 'high',
  },
  {
    id: 22,
    category: 'training',
    title: 'Mind-Muscle Connection',
    content: 'Focus on the muscle you\'re working. During a bicep curl, think about your bicep contracting. This mental focus activates 20-30% more muscle fibers and significantly improves results.',
    priority: 'medium',
  },
  {
    id: 23,
    category: 'training',
    title: 'Tempo Matters',
    content: 'Try a 3-1-2 tempo: 3 seconds lowering, 1 second pause, 2 seconds lifting. Slow eccentrics (lowering phase) cause more muscle growth than fast reps. Don\'t rush through sets.',
    priority: 'medium',
  },
  {
    id: 24,
    category: 'training',
    title: 'Warm Up Properly',
    content: 'Never skip warm-ups. 5-10 minutes of light cardio and dynamic stretching prepares joints, increases blood flow, and reduces injury risk by up to 50%. Cold muscles tear more easily.',
    priority: 'high',
  },
  {
    id: 25,
    category: 'training',
    title: 'Band Resistance Tip',
    content: 'Resistance bands get harder as they stretch. Stand on more of the band for more resistance, or use a thinner band for less. Color-code your bands and track which you use for each exercise.',
    priority: 'medium',
  },
  {
    id: 26,
    category: 'training',
    title: 'Consistency Over Intensity',
    content: '3 moderate workouts per week for a year beats 7 intense workouts for 2 weeks then quitting. Build a sustainable habit first. You can always increase intensity later.',
    priority: 'high',
  },

  // HYDRATION
  {
    id: 30,
    category: 'hydration',
    title: 'Drink Before You\'re Thirsty',
    content: 'By the time you feel thirsty, you\'re already 1-2% dehydrated — enough to reduce strength by 10%. Drink 500ml water 2 hours before training and sip throughout your workout.',
    priority: 'high',
  },
  {
    id: 31,
    category: 'hydration',
    title: 'Post-Workout Hydration',
    content: 'Drink 500-700ml of water within 30 minutes after training. Add a pinch of salt to your water if you sweated heavily — you lose electrolytes (sodium, potassium) through sweat.',
    priority: 'medium',
  },
  {
    id: 32,
    category: 'hydration',
    title: 'Morning Hydration',
    content: 'Drink a full glass of water first thing in the morning. After 7-8 hours of sleep, your body is dehydrated. This kickstarts your metabolism and improves energy levels for the day.',
    priority: 'medium',
  },

  // SLEEP
  {
    id: 40,
    category: 'sleep',
    title: 'Sleep Is When You Grow',
    content: 'Aim for 7-9 hours of sleep. Growth hormone — essential for muscle repair — is released primarily during deep sleep. Poor sleep = poor recovery = poor results, no matter how hard you train.',
    priority: 'high',
  },
  {
    id: 41,
    category: 'sleep',
    title: 'Don\'t Train Late',
    content: 'Finish intense workouts at least 2-3 hours before bed. Exercise raises cortisol and body temperature, making it harder to fall asleep. If you must train late, keep it light and stretch afterward.',
    priority: 'medium',
  },
  {
    id: 42,
    category: 'sleep',
    title: 'Consistent Sleep Schedule',
    content: 'Go to bed and wake up at the same time every day — even weekends. Your body\'s recovery processes are regulated by your circadian rhythm. Irregular sleep disrupts hormone production.',
    priority: 'medium',
  },

  // MOTIVATION
  {
    id: 50,
    category: 'motivation',
    title: 'Track Everything',
    content: 'Log your workouts, meals, and weight. What gets measured gets managed. Looking back at your progress — even small wins — is the best motivation to keep going on tough days.',
    priority: 'medium',
  },
  {
    id: 51,
    category: 'motivation',
    title: 'The 2-Minute Rule',
    content: 'Don\'t feel like working out? Commit to just 2 minutes. Put on your shoes, do one set. 90% of the time, you\'ll keep going. The hardest part is starting — momentum does the rest.',
    priority: 'medium',
  },
  {
    id: 52,
    category: 'motivation',
    title: 'Progress Photos',
    content: 'Take a progress photo every 2 weeks, same lighting and angle. The mirror lies because changes are gradual. Side-by-side photos after 8 weeks will blow your mind.',
    priority: 'medium',
  },
];

export function getDailyTip(date) {
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
  return tips[dayOfYear % tips.length];
}

export function getTipsByCategory(category) {
  return tips.filter(t => t.category === category);
}

export function getHighPriorityTips() {
  return tips.filter(t => t.priority === 'high');
}

export function getRandomTips(count, excludeIds = []) {
  const available = tips.filter(t => !excludeIds.includes(t.id));
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getWorkoutTips() {
  return tips.filter(t => ['training', 'rest_recovery'].includes(t.category));
}

export function getNutritionTips() {
  return tips.filter(t => ['nutrition_timing', 'hydration'].includes(t.category));
}
