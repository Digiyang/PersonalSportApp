import { useState } from 'react';
import { TrendingUp, TrendingDown, Scale, Plus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { calculateBMI, getBMICategory } from '../utils/calculations';

export default function Progress({ state, onLogWeight }) {
  const { profile, weightLog, workoutLog } = state;
  const [newWeight, setNewWeight] = useState('');
  const [tab, setTab] = useState('weight');

  if (!profile) return null;

  const handleLogWeight = () => {
    if (newWeight) {
      onLogWeight(Number(newWeight));
      setNewWeight('');
    }
  };

  const weightData = weightLog.map(w => ({
    date: new Date(w.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    weight: w.weight,
    bmi: calculateBMI(w.weight, profile.height),
  }));

  if (weightData.length === 0) {
    weightData.push({
      date: new Date().toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      weight: profile.weight,
      bmi: calculateBMI(profile.weight, profile.height),
    });
  }

  const currentWeight = weightData[weightData.length - 1].weight;
  const startWeight = profile.weight;
  const weightChange = currentWeight - startWeight;
  const bmi = calculateBMI(currentWeight, profile.height);
  const bmiCat = getBMICategory(bmi);

  const workoutsByWeek = {};
  workoutLog.forEach(w => {
    const d = new Date(w.date);
    const week = `${d.toLocaleDateString('en', { month: 'short' })} W${Math.ceil(d.getDate() / 7)}`;
    workoutsByWeek[week] = (workoutsByWeek[week] || 0) + 1;
  });
  const workoutData = Object.entries(workoutsByWeek).map(([week, count]) => ({ week, workouts: count }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: '#1a1a2e',
          border: '1px solid #2a2a40',
          borderRadius: 8,
          padding: '10px 14px',
          fontSize: 13,
        }}>
          <p style={{ color: '#8888a0', marginBottom: 4 }}>{label}</p>
          {payload.map((p, i) => (
            <p key={i} style={{ color: p.color, fontWeight: 600 }}>
              {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Progress</h1>
        <p>Track your fitness journey over time</p>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(108, 92, 231, 0.15)' }}>
            <Scale color="#a29bfe" size={24} />
          </div>
          <div className="stat-content">
            <h4>{currentWeight} kg</h4>
            <p>Current Weight</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: weightChange <= 0 ? 'rgba(0, 206, 201, 0.15)' : 'rgba(255, 107, 107, 0.15)' }}>
            {weightChange <= 0
              ? <TrendingDown color="#00cec9" size={24} />
              : <TrendingUp color="#ff6b6b" size={24} />
            }
          </div>
          <div className="stat-content">
            <h4>{weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg</h4>
            <p>Since Start</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: bmiCat.color + '20' }}>
            <span style={{ color: bmiCat.color, fontSize: 16, fontWeight: 800 }}>{bmi.toFixed(0)}</span>
          </div>
          <div className="stat-content">
            <h4>{bmiCat.label}</h4>
            <p>BMI: {bmi.toFixed(1)}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(253, 203, 110, 0.15)' }}>
            <span style={{ fontSize: 20 }}>🎯</span>
          </div>
          <div className="stat-content">
            <h4>{Math.abs(currentWeight - profile.targetWeight).toFixed(1)} kg</h4>
            <p>To Goal ({profile.targetWeight} kg)</p>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <h3>Log Today's Weight</h3>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <input
            className="form-input"
            type="number"
            step="0.1"
            placeholder="e.g. 78.5"
            value={newWeight}
            onChange={e => setNewWeight(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogWeight()}
            style={{ flex: 1 }}
          />
          <button className="btn btn-primary" onClick={handleLogWeight} disabled={!newWeight}>
            <Plus size={16} /> Log Weight
          </button>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'weight' ? 'active' : ''}`} onClick={() => setTab('weight')}>Weight Trend</button>
        <button className={`tab ${tab === 'workouts' ? 'active' : ''}`} onClick={() => setTab('workouts')}>Workout Frequency</button>
      </div>

      {tab === 'weight' && (
        <div className="card fade-in">
          <h3 style={{ marginBottom: 16 }}>Weight Over Time</h3>
          <div className="chart-container" style={{ height: 300 }}>
            <ResponsiveContainer>
              <AreaChart data={weightData}>
                <defs>
                  <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6c5ce7" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#6c5ce7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a40" />
                <XAxis dataKey="date" stroke="#8888a0" fontSize={12} />
                <YAxis stroke="#8888a0" fontSize={12} domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="weight" stroke="#6c5ce7" fill="url(#weightGradient)" strokeWidth={2} name="Weight (kg)" />
                <Line type="monotone" dataKey="weight" stroke="#a29bfe" strokeWidth={0} dot={{ r: 4, fill: '#a29bfe' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {profile.targetWeight && (
            <div style={{ fontSize: 12, color: '#8888a0', textAlign: 'center', marginTop: 8 }}>
              Target: {profile.targetWeight} kg
            </div>
          )}
        </div>
      )}

      {tab === 'workouts' && (
        <div className="card fade-in">
          <h3 style={{ marginBottom: 16 }}>Weekly Workouts</h3>
          {workoutData.length > 0 ? (
            <div className="chart-container" style={{ height: 300 }}>
              <ResponsiveContainer>
                <AreaChart data={workoutData}>
                  <defs>
                    <linearGradient id="workoutGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00cec9" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#00cec9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a40" />
                  <XAxis dataKey="week" stroke="#8888a0" fontSize={12} />
                  <YAxis stroke="#8888a0" fontSize={12} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="workouts" stroke="#00cec9" fill="url(#workoutGradient)" strokeWidth={2} name="Workouts" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: '#8888a0' }}>
              <p>No workouts logged yet. Complete your first workout to see data here!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
