import { useState } from 'react';
import { buildWeeklyTemplate, splitTypes, equipmentList } from '../data/exercises';

const bodyShapes = [
  { id: 'lean', icon: '🏃', label: 'Lean & Toned' },
  { id: 'athletic', icon: '💪', label: 'Athletic' },
  { id: 'muscular', icon: '🏋️', label: 'Muscular' },
];

const activityLevels = [
  { id: 'sedentary', label: 'Sedentary', desc: 'Desk job, little exercise' },
  { id: 'light', label: 'Lightly Active', desc: '1-2 workouts/week' },
  { id: 'moderate', label: 'Moderately Active', desc: '3-4 workouts/week' },
  { id: 'active', label: 'Active', desc: '5+ workouts/week' },
];

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    age: '',
    gender: 'male',
    height: '',
    weight: '',
    targetWeight: '',
    goalWeeks: '',
    bodyShape: 'athletic',
    activityLevel: 'moderate',
    fitnessGoal: 'maintain',
    equipment: ['bodyweight'],
    workoutDays: [1, 3, 5],
  });

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const totalSteps = 5;

  const canProceed = () => {
    if (step === 1) return form.name && form.age && form.gender;
    if (step === 2) return form.height && form.weight && form.targetWeight;
    if (step === 3) return form.bodyShape && form.activityLevel;
    if (step === 4) return form.equipment.length >= 1;
    if (step === 5) return form.workoutDays.length >= 3 && form.workoutDays.length <= 6;
    return true;
  };

  const toggleEquipment = (eqId) => {
    setForm(prev => {
      const eq = prev.equipment.includes(eqId)
        ? prev.equipment.filter(e => e !== eqId)
        : [...prev.equipment, eqId];
      if (eqId === 'bodyweight') return prev;
      return { ...prev, equipment: eq };
    });
  };

  const toggleWorkoutDay = (dayIndex) => {
    setForm(prev => {
      const days = prev.workoutDays.includes(dayIndex)
        ? prev.workoutDays.filter(d => d !== dayIndex)
        : [...prev.workoutDays, dayIndex].sort((a, b) => a - b);
      return { ...prev, workoutDays: days };
    });
  };

  const previewTemplate = buildWeeklyTemplate(form.workoutDays);

  const handleSubmit = () => {
    const weeklyPlan = buildWeeklyTemplate(form.workoutDays);
    onComplete({
      ...form,
      age: Number(form.age),
      height: Number(form.height),
      weight: Number(form.weight),
      targetWeight: Number(form.targetWeight),
      goalWeeks: form.goalWeeks ? Number(form.goalWeeks) : null,
      equipment: form.equipment,
      workoutDays: form.workoutDays,
      weeklyPlan,
      planStartDate: new Date().toISOString(),
    });
  };

  return (
    <div className="onboarding">
      <div className="onboarding-card fade-in">
        <h1>FitForge</h1>
        <p className="subtitle">Your Personal Fitness Companion</p>

        <div className="onboarding-step">Step {step} of {totalSteps}</div>

        <div className="progress-bar" style={{ marginBottom: 28 }}>
          <div
            className="progress-fill"
            style={{
              width: `${(step / totalSteps) * 100}%`,
              background: 'linear-gradient(90deg, #6c5ce7, #a29bfe)',
            }}
          />
        </div>

        {step === 1 && (
          <div className="fade-in">
            <div className="form-group">
              <label>Your Name</label>
              <input
                className="form-input"
                placeholder="What should we call you?"
                value={form.name}
                onChange={e => update('name', e.target.value)}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Age</label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="25"
                  value={form.age}
                  onChange={e => update('age', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select
                  className="form-select"
                  value={form.gender}
                  onChange={e => update('gender', e.target.value)}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="fade-in">
            <div className="form-group">
              <label>Height (cm)</label>
              <input
                className="form-input"
                type="number"
                placeholder="175"
                value={form.height}
                onChange={e => update('height', e.target.value)}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Current Weight (kg)</label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="80"
                  value={form.weight}
                  onChange={e => update('weight', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Target Weight (kg)</label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="75"
                  value={form.targetWeight}
                  onChange={e => update('targetWeight', e.target.value)}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Goal</label>
                <select
                  className="form-select"
                  value={form.fitnessGoal}
                  onChange={e => update('fitnessGoal', e.target.value)}
                >
                  <option value="lose">Lose Weight</option>
                  <option value="maintain">Maintain Weight</option>
                  <option value="gain">Build Muscle</option>
                </select>
              </div>
              {form.fitnessGoal !== 'maintain' && (
                <div className="form-group">
                  <label>Timeline (weeks)</label>
                  <input
                    className="form-input"
                    type="number"
                    placeholder="e.g. 12"
                    min="4"
                    max="104"
                    value={form.goalWeeks}
                    onChange={e => update('goalWeeks', e.target.value)}
                  />
                </div>
              )}
            </div>
            {form.fitnessGoal !== 'maintain' && form.goalWeeks && form.weight && form.targetWeight && (
              <div className="tip-card" style={{ marginTop: -8 }}>
                <span className="tip-icon">📊</span>
                <p>
                  That's <strong>{(Math.abs(Number(form.weight) - Number(form.targetWeight)) / Number(form.goalWeeks)).toFixed(2)} kg/week</strong>.
                  {(Math.abs(Number(form.weight) - Number(form.targetWeight)) / Number(form.goalWeeks)) > 1
                    ? ' This is aggressive — consider a longer timeline for sustainable results.'
                    : (Math.abs(Number(form.weight) - Number(form.targetWeight)) / Number(form.goalWeeks)) > 0.5
                      ? ' A solid pace — challenging but achievable with consistency!'
                      : ' A healthy, sustainable pace. Great choice!'
                  }
                </p>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="fade-in">
            <div className="form-group">
              <label>Target Body Shape</label>
              <div className="body-shape-options">
                {bodyShapes.map(shape => (
                  <button
                    key={shape.id}
                    className={`body-shape-option ${form.bodyShape === shape.id ? 'selected' : ''}`}
                    onClick={() => update('bodyShape', shape.id)}
                  >
                    <div className="icon">{shape.icon}</div>
                    <div className="label">{shape.label}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Activity Level</label>
              {activityLevels.map(level => (
                <button
                  key={level.id}
                  className={`body-shape-option ${form.activityLevel === level.id ? 'selected' : ''}`}
                  onClick={() => update('activityLevel', level.id)}
                  style={{ marginBottom: 8, textAlign: 'left', width: '100%' }}
                >
                  <div className="label" style={{ fontSize: 14, fontWeight: 600 }}>{level.label}</div>
                  <div style={{ fontSize: 12, color: '#8888a0', marginTop: 2 }}>{level.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="fade-in">
            <div className="form-group">
              <label>What equipment do you have?</label>
              <p style={{ fontSize: 12, color: '#8888a0', marginTop: -4, marginBottom: 12 }}>
                Select all equipment available to you. Workouts will be tailored to what you own.
              </p>
              <div style={{ display: 'grid', gap: 8 }}>
                {equipmentList.map(eq => {
                  const selected = form.equipment.includes(eq.id);
                  const isBodyweight = eq.id === 'bodyweight';
                  return (
                    <button
                      key={eq.id}
                      className={`body-shape-option ${selected ? 'selected' : ''}`}
                      onClick={() => !isBodyweight && toggleEquipment(eq.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        textAlign: 'left',
                        width: '100%',
                        opacity: isBodyweight ? 0.7 : 1,
                        cursor: isBodyweight ? 'default' : 'pointer',
                      }}
                    >
                      <span style={{ fontSize: 22 }}>{eq.icon}</span>
                      <span style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>{eq.name}</span>
                      {isBodyweight && <span style={{ fontSize: 11, color: '#8888a0' }}>Always included</span>}
                      {selected && !isBodyweight && <span style={{ color: '#00cec9', fontSize: 12, fontWeight: 700 }}>Selected</span>}
                    </button>
                  );
                })}
              </div>
              <p style={{ fontSize: 12, color: '#8888a0', marginTop: 8 }}>
                {form.equipment.length} items selected
              </p>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="fade-in">
            <div className="form-group">
              <label>Which days do you want to train? (pick 3-6)</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginTop: 8 }}>
                {dayNames.map((name, idx) => (
                  <button
                    key={idx}
                    className={`body-shape-option ${form.workoutDays.includes(idx) ? 'selected' : ''}`}
                    onClick={() => toggleWorkoutDay(idx)}
                    style={{
                      padding: '12px 4px',
                      textAlign: 'center',
                      borderColor: form.workoutDays.includes(idx) ? '#a29bfe' : undefined,
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{name}</div>
                  </button>
                ))}
              </div>
              <p style={{ fontSize: 12, color: '#8888a0', marginTop: 8 }}>
                {form.workoutDays.length} days selected
                {form.workoutDays.length < 3 && ' — select at least 3'}
                {form.workoutDays.length > 6 && ' — max 6 days (you need rest!)'}
              </p>
            </div>

            <div className="form-group" style={{ marginTop: 20 }}>
              <label>Your Weekly Plan Preview</label>
              <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
                {previewTemplate.map(day => {
                  const split = splitTypes[day.type];
                  const isRest = day.type === 'rest';
                  return (
                    <div key={day.day} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 14px',
                      borderRadius: 10,
                      background: isRest ? 'rgba(136,136,160,0.06)' : `${split.color}10`,
                      border: `1px solid ${isRest ? 'rgba(136,136,160,0.15)' : split.color + '30'}`,
                    }}>
                      <span style={{ fontSize: 18 }}>{split.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: isRest ? '#8888a0' : split.color }}>
                          {day.dayName} — {split.name}
                        </div>
                        <div style={{ fontSize: 11, color: '#8888a0' }}>{split.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="tip-card" style={{ marginTop: 12 }}>
              <span className="tip-icon">💡</span>
              <p>Your plan uses a <strong>Push / Pull / Legs+Core</strong> split. Each muscle group gets 48+ hours to recover before being trained again. The plan repeats weekly and gets progressively harder.</p>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          {step > 1 && (
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(s => s - 1)}>
              Back
            </button>
          )}
          {step < totalSteps ? (
            <button
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
            >
              Continue
            </button>
          ) : (
            <button
              className="btn btn-primary btn-lg"
              style={{ flex: 1 }}
              onClick={handleSubmit}
              disabled={!canProceed()}
            >
              Start Your Journey
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
