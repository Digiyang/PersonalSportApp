import { useState } from 'react';
import { Save } from 'lucide-react';
import { calculateBMI, getBMICategory, calculateBMR, calculateTDEE, getBodyFatEstimate } from '../utils/calculations';
import { buildWeeklyTemplate, splitTypes, equipmentList } from '../data/exercises';

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Profile({ state, onUpdateProfile }) {
  const { profile } = state;
  const [form, setForm] = useState({ ...profile });
  const [saved, setSaved] = useState(false);

  if (!profile) return null;

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const toggleWorkoutDay = (dayIndex) => {
    setForm(prev => {
      const days = (prev.workoutDays || [1, 3, 5]);
      const updated = days.includes(dayIndex)
        ? days.filter(d => d !== dayIndex)
        : [...days, dayIndex].sort((a, b) => a - b);
      return { ...prev, workoutDays: updated };
    });
    setSaved(false);
  };

  const toggleEquipment = (eqId) => {
    if (eqId === 'bodyweight') return;
    setForm(prev => {
      const eq = (prev.equipment || ['bodyweight']);
      const updated = eq.includes(eqId)
        ? eq.filter(e => e !== eqId)
        : [...eq, eqId];
      return { ...prev, equipment: updated };
    });
    setSaved(false);
  };

  const handleSave = () => {
    const workoutDays = form.workoutDays || [1, 3, 5];
    const weeklyPlan = buildWeeklyTemplate(workoutDays);
    onUpdateProfile({
      ...form,
      age: Number(form.age),
      height: Number(form.height),
      weight: Number(form.weight),
      targetWeight: Number(form.targetWeight),
      goalWeeks: form.goalWeeks ? Number(form.goalWeeks) : null,
      equipment: form.equipment || ['bodyweight'],
      workoutDays,
      weeklyPlan,
      planStartDate: form.planStartDate || new Date().toISOString(),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const bmi = calculateBMI(profile.weight, profile.height);
  const bmiCat = getBMICategory(bmi);
  const bmr = calculateBMR(profile.weight, profile.height, profile.age, profile.gender);
  const tdee = calculateTDEE(bmr, profile.activityLevel);
  const bodyFat = getBodyFatEstimate(bmi, profile.age, profile.gender);

  const userEquipment = form.equipment || ['bodyweight'];

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Profile</h1>
        <p>Manage your personal information and goals</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Personal Info</h3>
          <div className="form-group">
            <label>Name</label>
            <input className="form-input" value={form.name} onChange={e => update('name', e.target.value)} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Age</label>
              <input className="form-input" type="number" value={form.age} onChange={e => update('age', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select className="form-select" value={form.gender} onChange={e => update('gender', e.target.value)}>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Height (cm)</label>
            <input className="form-input" type="number" value={form.height} onChange={e => update('height', e.target.value)} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Current Weight (kg)</label>
              <input className="form-input" type="number" value={form.weight} onChange={e => update('weight', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Target Weight (kg)</label>
              <input className="form-input" type="number" value={form.targetWeight} onChange={e => update('targetWeight', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Activity Level</label>
              <select className="form-select" value={form.activityLevel} onChange={e => update('activityLevel', e.target.value)}>
                <option value="sedentary">Sedentary</option>
                <option value="light">Lightly Active</option>
                <option value="moderate">Moderately Active</option>
                <option value="active">Active</option>
                <option value="very_active">Very Active</option>
              </select>
            </div>
            <div className="form-group">
              <label>Goal Timeline (weeks)</label>
              <input className="form-input" type="number" min="4" max="104" placeholder="e.g. 12" value={form.goalWeeks || ''} onChange={e => update('goalWeeks', e.target.value ? Number(e.target.value) : null)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Goal</label>
              <select className="form-select" value={form.fitnessGoal} onChange={e => update('fitnessGoal', e.target.value)}>
                <option value="lose">Lose Weight</option>
                <option value="maintain">Maintain</option>
                <option value="gain">Build Muscle</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: 4 }}>
            <label>Training Days</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
              {dayNames.map((name, idx) => {
                const days = form.workoutDays || [1, 3, 5];
                const selected = days.includes(idx);
                return (
                  <button
                    key={idx}
                    onClick={() => toggleWorkoutDay(idx)}
                    style={{
                      padding: '8px 2px',
                      borderRadius: 8,
                      border: `2px solid ${selected ? '#a29bfe' : 'rgba(255,255,255,0.08)'}`,
                      background: selected ? 'rgba(162,155,254,0.12)' : 'transparent',
                      color: selected ? '#a29bfe' : '#8888a0',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          </div>

          <button className={`btn ${saved ? 'btn-success' : 'btn-primary'} btn-full`} onClick={handleSave}>
            <Save size={16} /> {saved ? 'Saved! ✓' : 'Save Changes'}
          </button>
        </div>

        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ marginBottom: 16 }}>Body Analysis</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ padding: 16, background: '#12121a', borderRadius: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: bmiCat.color }}>{bmi.toFixed(1)}</div>
                <div style={{ fontSize: 12, color: '#8888a0', marginTop: 4 }}>BMI</div>
                <span className="badge" style={{ marginTop: 8, background: bmiCat.color + '20', color: bmiCat.color }}>
                  {bmiCat.label}
                </span>
              </div>
              <div style={{ padding: 16, background: '#12121a', borderRadius: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#a29bfe' }}>{Math.round(bmr)}</div>
                <div style={{ fontSize: 12, color: '#8888a0', marginTop: 4 }}>BMR (kcal/day)</div>
                <div style={{ fontSize: 11, color: '#55556a', marginTop: 4 }}>Basal Metabolic Rate</div>
              </div>
              <div style={{ padding: 16, background: '#12121a', borderRadius: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#00cec9' }}>{Math.round(tdee)}</div>
                <div style={{ fontSize: 12, color: '#8888a0', marginTop: 4 }}>TDEE (kcal/day)</div>
                <div style={{ fontSize: 11, color: '#55556a', marginTop: 4 }}>Total Daily Energy</div>
              </div>
              <div style={{ padding: 16, background: '#12121a', borderRadius: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#fdcb6e' }}>{bodyFat.toFixed(1)}%</div>
                <div style={{ fontSize: 12, color: '#8888a0', marginTop: 4 }}>Est. Body Fat</div>
                <div style={{ fontSize: 11, color: '#55556a', marginTop: 4 }}>Approximate</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 16 }}>Your Equipment</h3>
            <p style={{ fontSize: 12, color: '#8888a0', marginBottom: 12 }}>
              Toggle equipment you own. Workouts adapt to your gear.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {equipmentList.map(eq => {
                const selected = userEquipment.includes(eq.id);
                const isBodyweight = eq.id === 'bodyweight';
                return (
                  <div
                    key={eq.id}
                    onClick={() => toggleEquipment(eq.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 14px', background: '#12121a', borderRadius: 10,
                      border: selected ? '1px solid rgba(0,206,201,0.3)' : '1px solid transparent',
                      cursor: isBodyweight ? 'default' : 'pointer',
                      opacity: isBodyweight ? 0.7 : 1,
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{eq.icon}</span>
                    <span style={{ fontSize: 14, flex: 1 }}>{eq.name}</span>
                    {selected && (
                      <span style={{ color: '#00cec9', fontSize: 12, fontWeight: 600 }}>
                        {isBodyweight ? 'Always' : 'Available'}
                      </span>
                    )}
                    {!selected && !isBodyweight && (
                      <span style={{ color: '#55556a', fontSize: 12 }}>Not owned</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
