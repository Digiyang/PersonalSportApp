import { Droplets } from 'lucide-react';
import { calculateWaterIntake } from '../utils/calculations';

export default function Hydration({ state, onLogWater }) {
  const { profile, waterLog } = state;
  if (!profile) return null;

  const waterGoalL = calculateWaterIntake(profile.weight, profile.activityLevel);
  const glassSize = 0.25;
  const totalGlasses = Math.ceil(waterGoalL / glassSize);

  const todayLogs = waterLog.filter(w => new Date(w.date).toDateString() === new Date().toDateString());
  const todayGlasses = todayLogs.reduce((sum, w) => sum + w.glasses, 0);
  const percentage = Math.min(100, (todayGlasses / totalGlasses) * 100);

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toDateString();
    const dayLogs = waterLog.filter(w => new Date(w.date).toDateString() === dateStr);
    const glasses = dayLogs.reduce((sum, w) => sum + w.glasses, 0);
    return {
      day: d.toLocaleDateString('en', { weekday: 'short' }),
      glasses,
      percentage: Math.min(100, (glasses / totalGlasses) * 100),
    };
  });

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Hydration</h1>
        <p>Stay hydrated! Your daily goal: {waterGoalL}L ({totalGlasses} glasses)</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="card">
          <div className="card-header">
            <h3>Today's Water Intake</h3>
            <span style={{ fontSize: 14, color: percentage >= 100 ? '#00cec9' : '#a29bfe', fontWeight: 600 }}>
              {percentage >= 100 ? 'Goal reached! 🎉' : `${Math.round(percentage)}%`}
            </span>
          </div>

          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <svg width="180" height="180" viewBox="0 0 180 180">
                <circle cx="90" cy="90" r="80" fill="none" stroke="#2a2a40" strokeWidth="10" />
                <circle
                  cx="90" cy="90" r="80"
                  fill="none"
                  stroke="url(#waterGrad)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${percentage * 5.03} ${503 - percentage * 5.03}`}
                  strokeDashoffset="125"
                  style={{ transition: 'stroke-dasharray 0.5s ease' }}
                />
                <defs>
                  <linearGradient id="waterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00cec9" />
                    <stop offset="100%" stopColor="#74b9ff" />
                  </linearGradient>
                </defs>
              </svg>
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Droplets size={24} color="#00cec9" />
                <div style={{ fontSize: 32, fontWeight: 800, marginTop: 4 }}>{todayGlasses}</div>
                <div style={{ fontSize: 12, color: '#8888a0' }}>of {totalGlasses} glasses</div>
              </div>
            </div>
          </div>

          <div className="water-glasses">
            {Array.from({ length: totalGlasses }, (_, i) => (
              <button
                key={i}
                className={`water-glass ${i < todayGlasses ? 'filled' : ''}`}
                onClick={() => {
                  if (i >= todayGlasses) onLogWater(1);
                }}
                title={i < todayGlasses ? 'Logged' : 'Click to log'}
              />
            ))}
          </div>

          <button className="btn btn-primary btn-full" style={{ marginTop: 16 }} onClick={() => onLogWater(1)}>
            <Droplets size={16} /> Log a Glass (250ml)
          </button>
        </div>

        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ marginBottom: 16 }}>Weekly Overview</h3>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 150 }}>
              {last7Days.map((day, i) => (
                <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{
                    height: `${Math.max(8, day.percentage * 1.2)}px`,
                    background: day.percentage >= 100
                      ? 'linear-gradient(180deg, #00cec9, #55efc4)'
                      : 'linear-gradient(180deg, #3b82f6, #74b9ff)',
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.5s ease',
                    marginBottom: 8,
                    opacity: day.percentage > 0 ? 1 : 0.3,
                  }} />
                  <div style={{ fontSize: 11, color: '#8888a0' }}>{day.day}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, marginTop: 2 }}>{day.glasses}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="tip-card" style={{ marginBottom: 12 }}>
            <span className="tip-icon">💧</span>
            <p><strong>Why hydrate?</strong> Water boosts metabolism, improves performance, aids muscle recovery, and helps with weight management.</p>
          </div>
          <div className="tip-card">
            <span className="tip-icon">⏰</span>
            <p><strong>Pro tip:</strong> Drink a glass of water right when you wake up, before each meal, and before & after workouts.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
