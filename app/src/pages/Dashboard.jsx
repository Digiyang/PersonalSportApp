import { Flame, Target, Droplets, TrendingUp, Dumbbell, Calendar } from 'lucide-react';
import { calculateBMI, getBMICategory, calculateBMR, calculateTDEE, calculateMacros, calculateWeeksToGoal, calculateWaterIntake } from '../utils/calculations';
import { getDailyTip, getRandomTips, tipCategories } from '../data/tips';
import { splitTypes, getCurrentWeekNumber, getProgressionForWeek } from '../data/exercises';

export default function Dashboard({ state, onNavigate }) {
  const { profile, workoutLog, streak, waterLog } = state;
  if (!profile) return null;

  const bmi = calculateBMI(profile.weight, profile.height);
  const bmiCat = getBMICategory(bmi);
  const bmr = calculateBMR(profile.weight, profile.height, profile.age, profile.gender);
  const tdee = calculateTDEE(bmr, profile.activityLevel);
  const macros = calculateMacros(tdee, profile.fitnessGoal, profile.weight, profile.targetWeight, profile.goalWeeks);
  const weeksToGoal = calculateWeeksToGoal(profile.weight, profile.targetWeight, profile.goalWeeks);
  const waterGoal = calculateWaterIntake(profile.weight, profile.activityLevel);
  const todayWater = waterLog.filter(w => new Date(w.date).toDateString() === new Date().toDateString())
    .reduce((sum, w) => sum + w.glasses, 0);

  const today = new Date();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());

  const weeklyPlan = profile.weeklyPlan || [];
  const currentWeek = getCurrentWeekNumber(profile.planStartDate);
  const progression = getProgressionForWeek(currentWeek);
  const totalWeeks = profile.goalWeeks || null;

  const weekData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const dateStr = d.toDateString();
    const planDay = weeklyPlan.find(p => p.day === i);
    return {
      name: weekDays[i],
      date: d.getDate(),
      isToday: dateStr === today.toDateString(),
      hasWorkout: workoutLog.some(w => new Date(w.date).toDateString() === dateStr),
      splitType: planDay ? planDay.type : 'rest',
    };
  });

  const goalLabel = profile.fitnessGoal === 'lose' ? 'Lose Weight' : profile.fitnessGoal === 'gain' ? 'Build Muscle' : 'Maintain';

  const motivationalQuotes = [
    "The only bad workout is the one that didn't happen.",
    "Your body can stand almost anything. It's your mind you have to convince.",
    "Fitness is not about being better than someone else. It's about being better than you used to be.",
    "The pain you feel today will be the strength you feel tomorrow.",
    "Don't stop when you're tired. Stop when you're done.",
  ];
  const quote = motivationalQuotes[today.getDate() % motivationalQuotes.length];

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Welcome back, {profile.name}!</h1>
        <p>{quote}</p>
      </div>

      {weeklyPlan.length > 0 && (
        <div className="card" style={{ marginBottom: 20, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: 16, margin: 0 }}>Week {currentWeek}{totalWeeks ? ` of ${totalWeeks}` : ''} — {progression.label} Phase</h3>
            <span className="badge" style={{ background: '#a29bfe20', color: '#a29bfe', fontSize: 11 }}>
              {progression.extraReps > 0 ? `+${progression.extraReps} reps` : 'Base'}{progression.extraSets > 0 ? ` · +${progression.extraSets} sets` : ''}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
            {weekData.map((day, i) => {
              const split = splitTypes[day.splitType];
              const isRest = day.splitType === 'rest';
              return (
                <div key={i} style={{
                  textAlign: 'center',
                  padding: '8px 4px',
                  borderRadius: 10,
                  background: day.isToday
                    ? (isRest ? 'rgba(136,136,160,0.12)' : `${split.color}18`)
                    : (isRest ? 'transparent' : `${split.color}08`),
                  border: day.isToday ? `2px solid ${split.color}` : '1px solid transparent',
                  position: 'relative',
                }}>
                  <div style={{ fontSize: 10, color: '#8888a0', fontWeight: 600, marginBottom: 2 }}>{day.name}</div>
                  <div style={{ fontSize: 16 }}>{split.icon}</div>
                  <div style={{ fontSize: 9, color: split.color, fontWeight: 600, marginTop: 2 }}>
                    {isRest ? 'Rest' : split.name}
                  </div>
                  {day.hasWorkout && (
                    <div style={{
                      position: 'absolute', top: 4, right: 4,
                      width: 6, height: 6, borderRadius: '50%',
                      background: '#00cec9',
                    }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!weeklyPlan.length && (
        <div className="week-calendar">
          {weekData.map((day, i) => (
            <div key={i} className={`day-cell ${day.isToday ? 'today' : ''} ${day.hasWorkout ? 'has-workout' : ''}`}>
              <div className="day-name">{day.name}</div>
              <div className="day-number">{day.date}</div>
            </div>
          ))}
        </div>
      )}

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(108, 92, 231, 0.15)' }}>
            <Flame color="#a29bfe" size={24} />
          </div>
          <div className="stat-content">
            <h4>{macros.calories}</h4>
            <p>Daily Calories Target</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(0, 206, 201, 0.15)' }}>
            <Dumbbell color="#00cec9" size={24} />
          </div>
          <div className="stat-content">
            <h4>{workoutLog.length}</h4>
            <p>Total Workouts</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(253, 203, 110, 0.15)' }}>
            <Target color="#fdcb6e" size={24} />
          </div>
          <div className="stat-content">
            <h4>{streak} 🔥</h4>
            <p>Day Streak</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(116, 185, 255, 0.15)' }}>
            <Droplets color="#74b9ff" size={24} />
          </div>
          <div className="stat-content">
            <h4>{todayWater}/{Math.round(waterGoal / 0.25)}🥛</h4>
            <p>Water Today</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <div className="card">
          <div className="card-header">
            <h3>Body Stats</h3>
            <span className="badge" style={{ background: bmiCat.color + '20', color: bmiCat.color }}>
              {bmiCat.label}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, color: '#8888a0', marginBottom: 4 }}>BMI</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{bmi.toFixed(1)}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#8888a0', marginBottom: 4 }}>BMR</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{Math.round(bmr)}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#8888a0', marginBottom: 4 }}>Current</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{profile.weight} kg</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#8888a0', marginBottom: 4 }}>Target</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{profile.targetWeight} kg</div>
            </div>
          </div>
          <div className="progress-bar" style={{ marginTop: 16 }}>
            <div className="progress-fill" style={{
              width: `${Math.min(100, Math.max(0, profile.fitnessGoal === 'lose'
                ? ((profile.weight - profile.targetWeight) / (profile.weight - profile.targetWeight + 0.001)) * 100
                : 50))}%`,
              background: 'var(--gradient-1)',
            }} />
          </div>
          <div style={{ fontSize: 12, color: '#8888a0', marginTop: 4 }}>
            ~{weeksToGoal} weeks to reach your goal
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Daily Macros Target</h3>
            <span className="badge badge-intermediate">{goalLabel}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: '#a29bfe' }}>Protein</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{macros.protein}g</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${(macros.protein / (macros.protein + macros.carbs + macros.fat)) * 100}%`, background: '#a29bfe' }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: '#fdcb6e' }}>Carbs</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{macros.carbs}g</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${(macros.carbs / (macros.protein + macros.carbs + macros.fat)) * 100}%`, background: '#fdcb6e' }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: '#ff6b6b' }}>Fat</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{macros.fat}g</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${(macros.fat / (macros.protein + macros.carbs + macros.fat)) * 100}%`, background: '#ff6b6b' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <button
          className="card"
          style={{ cursor: 'pointer', textAlign: 'center', border: '2px dashed var(--accent)', background: 'rgba(108,92,231,0.05)' }}
          onClick={() => onNavigate('workout')}
        >
          <Dumbbell size={40} color="#a29bfe" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: 18, marginBottom: 4 }}>
            {(() => {
              const todayPlan = weeklyPlan.find(d => d.day === today.getDay());
              if (todayPlan && todayPlan.type !== 'rest') {
                const s = splitTypes[todayPlan.type];
                return `${s.icon} ${s.name} Day`;
              }
              return 'Start Workout';
            })()}
          </h3>
          <p style={{ fontSize: 13, color: '#8888a0' }}>
            {(() => {
              const todayPlan = weeklyPlan.find(d => d.day === today.getDay());
              if (todayPlan && todayPlan.type === 'rest') return 'Rest day — recovery & light stretching';
              if (todayPlan) return splitTypes[todayPlan.type].desc;
              return 'Generate a workout with your equipment';
            })()}
          </p>
        </button>

        <button
          className="card"
          style={{ cursor: 'pointer', textAlign: 'center', border: '2px dashed var(--success)', background: 'rgba(0,206,201,0.05)' }}
          onClick={() => onNavigate('nutrition')}
        >
          <Calendar size={40} color="#00cec9" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: 18, marginBottom: 4 }}>Meal Plan</h3>
          <p style={{ fontSize: 13, color: '#8888a0' }}>View your personalized nutrition plan</p>
        </button>
      </div>

      <DailyTips />
    </div>
  );
}

function DailyTips() {
  const today = new Date();
  const dailyTip = getDailyTip(today);
  const extraTips = getRandomTips(2, [dailyTip.id]);
  const allTips = [dailyTip, ...extraTips];
  const cat = tipCategories[dailyTip.category];

  return (
    <div>
      <h3 style={{ marginBottom: 16, fontSize: 18 }}>Daily Tips</h3>
      <div style={{ display: 'grid', gap: 12 }}>
        {allTips.map((tip, i) => {
          const c = tipCategories[tip.category];
          return (
            <div key={tip.id} className="tip-card" style={{
              borderLeft: `3px solid ${c.color}`,
              background: i === 0 ? `${c.color}08` : undefined,
            }}>
              <span className="tip-icon">{c.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <strong style={{ color: c.color, fontSize: 14 }}>{tip.title}</strong>
                  <span style={{
                    fontSize: 9,
                    padding: '2px 8px',
                    borderRadius: 8,
                    background: c.color + '20',
                    color: c.color,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                  }}>
                    {c.label}
                  </span>
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.5 }}>{tip.content}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
