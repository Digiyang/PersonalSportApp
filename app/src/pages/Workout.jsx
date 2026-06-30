import { useState, useCallback } from 'react';
import { Shuffle, Check, Clock, Repeat, ChevronDown, ChevronUp, Minus, Plus, Timer } from 'lucide-react';
import { exercises, muscleGroups, equipmentList, generateWorkout, generateWarmup, splitTypes, generateSplitWorkout, getTodaySplit, getCurrentWeekNumber, getProgressionForWeek, buildWeeklyTemplate } from '../data/exercises';
import { getWorkoutTips, tipCategories } from '../data/tips';
import ExerciseVisual from '../components/ExerciseVisual';
import RestTimer from '../components/RestTimer';

function parseDurationSeconds(duration) {
  const match = duration.match(/(\d+)\s*s/i);
  if (match) return parseInt(match[1]);
  const repMatch = duration.match(/(\d+)\s*(reps|each|rep)/i);
  if (repMatch) return parseInt(repMatch[1]) * 3;
  return 30;
}

export default function Workout({ state, onLogWorkout }) {
  const { profile } = state;
  const weeklyPlan = profile?.weeklyPlan || [];
  const todaySplit = getTodaySplit(weeklyPlan);
  const hasWeeklyPlan = weeklyPlan.length > 0;
  const currentWeek = getCurrentWeekNumber(profile?.planStartDate);
  const progression = getProgressionForWeek(currentWeek);

  const [tab, setTab] = useState(hasWeeklyPlan ? 'plan' : 'generate');
  const [difficulty, setDifficulty] = useState('beginner');
  const [duration, setDuration] = useState('medium');
  const [focusMuscles, setFocusMuscles] = useState([]);
  const [workout, setWorkout] = useState(null);
  const [warmups, setWarmups] = useState(null);
  const [activeSplit, setActiveSplit] = useState(null);
  const [completedExercises, setCompletedExercises] = useState(new Set());
  const [completedWarmups, setCompletedWarmups] = useState(new Set());
  const [showTimer, setShowTimer] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [expandedExercise, setExpandedExercise] = useState(null);
  const [expandedWarmup, setExpandedWarmup] = useState(null);
  const [filterMuscle, setFilterMuscle] = useState(null);
  const [filterEquipment, setFilterEquipment] = useState(null);
  const [browsePage, setBrowsePage] = useState(0);
  const [exerciseLogs, setExerciseLogs] = useState({});
  const [warmupCollapsed, setWarmupCollapsed] = useState(false);

  const userEquipment = profile?.equipment || [];

  const startSplitWorkout = (splitType) => {
    const splitMuscles = {
      push: ['chest', 'shoulders', 'arms'],
      pull: ['back', 'arms'],
      legs_core: ['legs', 'glutes', 'core'],
    };
    const w = generateSplitWorkout(splitType, difficulty, currentWeek, userEquipment);
    const wu = generateWarmup(splitMuscles[splitType] || [], true);
    setWorkout(w);
    setWarmups(wu);
    setActiveSplit(splitType);
    setCompletedExercises(new Set());
    setCompletedWarmups(new Set());
    setExerciseLogs({});
    setExpandedExercise(null);
    setExpandedWarmup(null);

    const initialLogs = {};
    w.forEach(ex => {
      initialLogs[ex.id] = {
        sets: Array.from({ length: ex.sets }, () => ({
          reps: '',
          weight: '',
          completed: false,
        })),
      };
    });
    setExerciseLogs(initialLogs);
    setTab('session');
  };

  const handleGenerate = () => {
    const w = generateWorkout(difficulty, duration, focusMuscles, userEquipment);
    const wu = generateWarmup(focusMuscles, true);
    setWorkout(w);
    setWarmups(wu);
    setActiveSplit(null);
    setCompletedExercises(new Set());
    setCompletedWarmups(new Set());
    setExerciseLogs({});
    setExpandedExercise(null);
    setExpandedWarmup(null);

    const initialLogs = {};
    w.forEach(ex => {
      initialLogs[ex.id] = {
        sets: Array.from({ length: ex.sets }, () => ({
          reps: '',
          weight: '',
          completed: false,
        })),
      };
    });
    setExerciseLogs(initialLogs);
    setTab('session');
  };

  const toggleMuscle = (id) => {
    setFocusMuscles(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const toggleComplete = useCallback((exerciseId) => {
    setCompletedExercises(prev => {
      const next = new Set(prev);
      if (next.has(exerciseId)) next.delete(exerciseId);
      else next.add(exerciseId);
      return next;
    });
  }, []);

  const toggleWarmupComplete = useCallback((warmupId) => {
    setCompletedWarmups(prev => {
      const next = new Set(prev);
      if (next.has(warmupId)) next.delete(warmupId);
      else next.add(warmupId);
      return next;
    });
  }, []);

  const updateSetLog = (exerciseId, setIndex, field, value) => {
    setExerciseLogs(prev => {
      const logs = { ...prev };
      const exLog = { ...logs[exerciseId] };
      const sets = [...exLog.sets];
      sets[setIndex] = { ...sets[setIndex], [field]: value };
      exLog.sets = sets;
      logs[exerciseId] = exLog;
      return logs;
    });
  };

  const toggleSetComplete = (exerciseId, setIndex) => {
    setExerciseLogs(prev => {
      const logs = { ...prev };
      const exLog = { ...logs[exerciseId] };
      const sets = [...exLog.sets];
      sets[setIndex] = { ...sets[setIndex], completed: !sets[setIndex].completed };
      exLog.sets = sets;
      logs[exerciseId] = exLog;

      const allSetsComplete = sets.every(s => s.completed);
      if (allSetsComplete) {
        setCompletedExercises(prev => new Set([...prev, exerciseId]));
      } else {
        setCompletedExercises(prev => {
          const next = new Set(prev);
          next.delete(exerciseId);
          return next;
        });
      }

      return logs;
    });
  };

  const addSet = (exerciseId) => {
    setExerciseLogs(prev => {
      const logs = { ...prev };
      const exLog = { ...logs[exerciseId] };
      exLog.sets = [...exLog.sets, { reps: '', weight: '', completed: false }];
      logs[exerciseId] = exLog;
      return logs;
    });
  };

  const removeSet = (exerciseId) => {
    setExerciseLogs(prev => {
      const logs = { ...prev };
      const exLog = { ...logs[exerciseId] };
      if (exLog.sets.length > 1) {
        exLog.sets = exLog.sets.slice(0, -1);
        logs[exerciseId] = exLog;
      }
      return logs;
    });
  };

  const startRest = (seconds) => {
    setTimerSeconds(seconds);
    setShowTimer(true);
  };

  const finishWorkout = () => {
    if (workout) {
      onLogWorkout({
        exercises: workout.map(e => e.id),
        completed: [...completedExercises],
        logs: exerciseLogs,
        duration: workout.reduce((sum, e) => sum + (e.sets * 45 + e.sets * e.rest), 0),
        split: activeSplit || 'custom',
        week: currentWeek,
      });
      setWorkout(null);
      setWarmups(null);
      setActiveSplit(null);
      setCompletedExercises(new Set());
      setCompletedWarmups(new Set());
      setExerciseLogs({});
      setTab(hasWeeklyPlan ? 'plan' : 'generate');
    }
  };

  const allDone = workout && completedExercises.size === workout.length;

  const BROWSE_PAGE_SIZE = 20;
  const filteredExercises = exercises.filter(e => {
    if (filterMuscle && !e.muscles.includes(filterMuscle)) return false;
    if (filterEquipment && !e.equipment.includes(filterEquipment)) return false;
    return true;
  });
  const browseTotal = filteredExercises.length;
  const browsePages = Math.ceil(browseTotal / BROWSE_PAGE_SIZE);
  const browsedExercises = filteredExercises.slice(browsePage * BROWSE_PAGE_SIZE, (browsePage + 1) * BROWSE_PAGE_SIZE);

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Workout</h1>
        <p>{hasWeeklyPlan ? `Week ${currentWeek}${profile.goalWeeks ? ` of ${profile.goalWeeks}` : ''} — ${progression.label} Phase` : 'Full body workouts with your home equipment'}</p>
      </div>

      <div className="tabs">
        {hasWeeklyPlan && (
          <button className={`tab ${tab === 'plan' ? 'active' : ''}`} onClick={() => setTab('plan')}>
            Weekly Plan
          </button>
        )}
        <button className={`tab ${tab === 'generate' ? 'active' : ''}`} onClick={() => setTab('generate')}>
          Custom Workout
        </button>
        <button className={`tab ${tab === 'session' ? 'active' : ''}`} onClick={() => setTab('session')} disabled={!workout}>
          Active Session {workout ? `(${workout.length})` : ''}
        </button>
        <button className={`tab ${tab === 'browse' ? 'active' : ''}`} onClick={() => setTab('browse')}>
          Library
        </button>
      </div>

      {tab === 'plan' && hasWeeklyPlan && (
        <div className="fade-in">
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>This Week's Schedule</h3>
              <span className="badge" style={{ background: '#a29bfe20', color: '#a29bfe' }}>
                {progression.extraReps > 0 ? `+${progression.extraReps} reps` : 'Base'}{progression.extraSets > 0 ? ` · +${progression.extraSets} sets` : ''}
              </span>
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              {weeklyPlan.map(day => {
                const split = splitTypes[day.type];
                const isRest = day.type === 'rest';
                const isToday = new Date().getDay() === day.day;
                const todayLog = state.workoutLog.find(w => {
                  const d = new Date(w.date);
                  return d.toDateString() === new Date().toDateString() && w.split === day.type;
                });

                return (
                  <div key={day.day} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '12px 16px',
                    borderRadius: 12,
                    background: isToday
                      ? (isRest ? 'rgba(136,136,160,0.1)' : `${split.color}12`)
                      : 'rgba(255,255,255,0.02)',
                    border: isToday ? `2px solid ${split.color}` : '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <span style={{ fontSize: 22 }}>{split.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: isRest ? '#8888a0' : split.color }}>
                          {day.dayName}
                        </span>
                        <span style={{ fontSize: 13, color: '#8888a0' }}>—</span>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{split.name}</span>
                        {isToday && <span className="badge badge-beginner" style={{ fontSize: 9 }}>TODAY</span>}
                      </div>
                      <div style={{ fontSize: 11, color: '#8888a0', marginTop: 2 }}>{split.desc}</div>
                    </div>
                    {!isRest && isToday && !todayLog && (
                      <button className="btn btn-primary btn-sm" onClick={() => startSplitWorkout(day.type)}>
                        Start
                      </button>
                    )}
                    {!isRest && !isToday && (
                      <button className="btn btn-secondary btn-sm" onClick={() => startSplitWorkout(day.type)}>
                        Start
                      </button>
                    )}
                    {todayLog && (
                      <span style={{ fontSize: 12, color: '#00cec9', fontWeight: 600 }}>Done ✓</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {todaySplit && todaySplit.type === 'rest' && (
            <div className="tip-card" style={{ borderLeft: '3px solid #74b9ff' }}>
              <span className="tip-icon">😴</span>
              <div style={{ flex: 1 }}>
                <strong style={{ color: '#74b9ff', fontSize: 14 }}>Rest Day</strong>
                <p style={{ fontSize: 13, lineHeight: 1.5, marginTop: 4 }}>
                  Your muscles are recovering and growing today. Try light stretching, a walk, or yoga. Avoid intense training — your next workout will be better for it.
                </p>
              </div>
            </div>
          )}

          <div style={{ marginTop: 16 }}>
            <h3 style={{ marginBottom: 12, fontSize: 16 }}>Training & Recovery Tips</h3>
            <div style={{ display: 'grid', gap: 10 }}>
              {getWorkoutTips().filter(t => t.priority === 'high').slice(0, 3).map(tip => {
                const c = tipCategories[tip.category];
                return (
                  <div key={tip.id} className="tip-card" style={{ borderLeft: `3px solid ${c.color}` }}>
                    <span className="tip-icon">{c.icon}</span>
                    <div style={{ flex: 1 }}>
                      <strong style={{ color: c.color, fontSize: 13 }}>{tip.title}</strong>
                      <p style={{ fontSize: 12, lineHeight: 1.5, marginTop: 4 }}>{tip.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === 'generate' && (
        <div className="fade-in">
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 16 }}>Customize Your Workout</h3>

            <div className="form-group">
              <label>Difficulty</label>
              <div className="toggle-group">
                {['beginner', 'intermediate', 'advanced'].map(d => (
                  <button key={d} className={`toggle-option ${difficulty === d ? 'active' : ''}`} onClick={() => setDifficulty(d)}>
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Duration</label>
              <div className="toggle-group">
                {[
                  { id: 'short', label: 'Quick (20min)' },
                  { id: 'medium', label: 'Standard (40min)' },
                  { id: 'long', label: 'Full (60min)' },
                ].map(d => (
                  <button key={d.id} className={`toggle-option ${duration === d.id ? 'active' : ''}`} onClick={() => setDuration(d.id)}>
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Focus Muscles (optional - leave empty for full body)</label>
              <div className="muscle-map">
                {muscleGroups.map(m => (
                  <button
                    key={m.id}
                    className={`muscle-button ${focusMuscles.includes(m.id) ? 'selected' : ''}`}
                    onClick={() => toggleMuscle(m.id)}
                    style={focusMuscles.includes(m.id) ? { borderColor: m.color, color: m.color } : {}}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            </div>

            <button className="btn btn-primary btn-lg btn-full" onClick={handleGenerate}>
              <Shuffle size={20} /> Generate Workout
            </button>
          </div>

          <div style={{ marginTop: 8 }}>
            <h3 style={{ marginBottom: 12, fontSize: 16 }}>Training & Recovery Tips</h3>
            <div style={{ display: 'grid', gap: 10 }}>
              {getWorkoutTips().filter(t => t.priority === 'high').map(tip => {
                const c = tipCategories[tip.category];
                return (
                  <div key={tip.id} className="tip-card" style={{ borderLeft: `3px solid ${c.color}` }}>
                    <span className="tip-icon">{c.icon}</span>
                    <div style={{ flex: 1 }}>
                      <strong style={{ color: c.color, fontSize: 13 }}>{tip.title}</strong>
                      <p style={{ fontSize: 12, lineHeight: 1.5, marginTop: 4 }}>{tip.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === 'session' && workout && (
        <div className="fade-in">
          {/* WARM-UP SECTION */}
          {warmups && warmups.length > 0 && (
            <div className="workout-session" style={{ borderColor: '#fdcb6e40' }}>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => setWarmupCollapsed(!warmupCollapsed)}
              >
                <div>
                  <h3 style={{ marginBottom: 4, color: '#fdcb6e' }}>🔥 Warm-Up</h3>
                  <p style={{ fontSize: 13, color: '#8888a0' }}>
                    {completedWarmups.size}/{warmups.length} done — ~5 minutes
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {completedWarmups.size === warmups.length && (
                    <span style={{ fontSize: 12, color: '#00cec9', fontWeight: 600 }}>COMPLETED ✓</span>
                  )}
                  {warmupCollapsed ? <ChevronDown size={20} color="#8888a0" /> : <ChevronUp size={20} color="#8888a0" />}
                </div>
              </div>

              {!warmupCollapsed && (
                <div style={{ marginTop: 16 }}>
                  <div className="progress-bar" style={{ marginBottom: 16 }}>
                    <div className="progress-fill" style={{
                      width: `${(completedWarmups.size / warmups.length) * 100}%`,
                      background: completedWarmups.size === warmups.length ? 'var(--gradient-2)' : 'linear-gradient(90deg, #fdcb6e, #e17055)',
                    }} />
                  </div>

                  <div className="exercise-list">
                    {warmups.map((wu, idx) => {
                      const gifPath = wu.gifPath;
                      const isExpanded = expandedWarmup === wu.id;
                      const timerSec = parseDurationSeconds(wu.duration);

                      return (
                        <div key={wu.id}>
                          <div
                            className={`exercise-list-item ${completedWarmups.has(wu.id) ? 'completed' : ''}`}
                            onClick={() => setExpandedWarmup(isExpanded ? null : wu.id)}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="exercise-number" style={{ background: completedWarmups.has(wu.id) ? '#00cec9' : '#fdcb6e' }}>
                              {idx + 1}
                            </div>
                            <div className="exercise-list-details" style={{ flex: 1 }}>
                              <h4>{wu.name}</h4>
                              <p>{wu.duration} — {wu.category}</p>
                            </div>
                            <span className={`badge badge-${wu.category === 'cardio' ? 'intermediate' : 'beginner'}`} style={{ fontSize: 10 }}>
                              {wu.category}
                            </span>
                            {isExpanded ? <ChevronUp size={18} color="#8888a0" /> : <ChevronDown size={18} color="#8888a0" />}
                          </div>

                          {isExpanded && (
                            <div className="card fade-in" style={{ marginTop: 8, marginLeft: 48 }}>
                              {gifPath && (
                                <div className="exercise-visual" style={{ position: 'relative', overflow: 'hidden' }}>
                                  <img
                                    src={`/${gifPath}`}
                                    alt={wu.name}
                                    loading="lazy"
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'contain',
                                      borderRadius: 12,
                                      background: '#f5f5f5',
                                    }}
                                  />
                                </div>
                              )}
                              <div style={{ padding: '16px 0 0' }}>
                                <p style={{ fontSize: 13, color: '#8888a0', marginBottom: 12 }}>{wu.description}</p>
                                {wu.tips && wu.tips.length > 0 && (
                                  <div style={{ fontSize: 12, color: '#8888a0', marginBottom: 16 }}>
                                    <strong style={{ color: '#fdcb6e' }}>Tips:</strong>
                                    <ul style={{ marginTop: 4, paddingLeft: 16 }}>
                                      {wu.tips.map((tip, i) => <li key={i} style={{ marginBottom: 4 }}>{tip}</li>)}
                                    </ul>
                                  </div>
                                )}
                                <div style={{ display: 'flex', gap: 8 }}>
                                  <button className="btn btn-secondary btn-sm" onClick={() => startRest(timerSec)}>
                                    <Timer size={14} /> Start {timerSec}s Timer
                                  </button>
                                  <button
                                    className={`btn btn-sm ${completedWarmups.has(wu.id) ? 'btn-success' : 'btn-primary'}`}
                                    onClick={() => toggleWarmupComplete(wu.id)}
                                  >
                                    <Check size={14} /> {completedWarmups.has(wu.id) ? 'Done ✓' : 'Mark Done'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MAIN WORKOUT */}
          <div className="workout-session">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ marginBottom: 4 }}>
                  {activeSplit ? `${splitTypes[activeSplit].icon} ${splitTypes[activeSplit].name} Day` : 'Main Workout'}
                </h3>
                <p style={{ fontSize: 13, color: '#8888a0' }}>
                  {completedExercises.size}/{workout.length} exercises done
                  {activeSplit && ` · Week ${currentWeek} · ${progression.label}`}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => startRest(60)}>
                  <Clock size={14} /> Rest 1min
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => startRest(90)}>
                  <Clock size={14} /> Rest 1:30
                </button>
              </div>
            </div>

            <div className="progress-bar" style={{ marginBottom: 20 }}>
              <div className="progress-fill" style={{
                width: `${(completedExercises.size / workout.length) * 100}%`,
                background: allDone ? 'var(--gradient-2)' : 'var(--gradient-1)',
              }} />
            </div>

            <div className="exercise-list">
              {workout.map((exercise, idx) => {
                const log = exerciseLogs[exercise.id];
                const isExpanded = expandedExercise === exercise.id;

                return (
                  <div key={exercise.id}>
                    <div
                      className={`exercise-list-item ${completedExercises.has(exercise.id) ? 'completed' : ''}`}
                      onClick={() => setExpandedExercise(isExpanded ? null : exercise.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="exercise-number">{idx + 1}</div>
                      <div className="exercise-list-details" style={{ flex: 1 }}>
                        <h4>{exercise.name}</h4>
                        <p>{exercise.sets} sets × {exercise.reps} | Rest: {exercise.rest}s</p>
                      </div>
                      <div className="muscle-tags" style={{ marginBottom: 0 }}>
                        {exercise.muscles.map(m => {
                          const muscle = muscleGroups.find(mg => mg.id === m);
                          return (
                            <span key={m} className="muscle-tag" style={{ background: muscle.color + '20', color: muscle.color }}>
                              {muscle.name}
                            </span>
                          );
                        })}
                      </div>
                      {isExpanded ? <ChevronUp size={18} color="#8888a0" /> : <ChevronDown size={18} color="#8888a0" />}
                    </div>

                    {isExpanded && (
                      <div className="card fade-in" style={{ marginTop: 8, marginLeft: 48 }}>
                        <ExerciseVisual exercise={exercise} autoPlay />
                        <div style={{ padding: '16px 0 0' }}>
                          <p style={{ fontSize: 13, color: '#8888a0', marginBottom: 12 }}>{exercise.description}</p>
                          <div style={{ fontSize: 12, color: '#8888a0', marginBottom: 16 }}>
                            <strong style={{ color: '#a29bfe' }}>Tips:</strong>
                            <ul style={{ marginTop: 4, paddingLeft: 16 }}>
                              {exercise.tips.map((tip, i) => <li key={i} style={{ marginBottom: 4 }}>{tip}</li>)}
                            </ul>
                          </div>

                          {/* SET LOGGING TABLE */}
                          {log && (
                            <div style={{ marginBottom: 16 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                <label style={{ fontSize: 13, fontWeight: 600, color: '#a29bfe', margin: 0 }}>Log Your Sets</label>
                                <div style={{ display: 'flex', gap: 6 }}>
                                  <button
                                    className="btn btn-secondary btn-sm"
                                    style={{ padding: '4px 10px' }}
                                    onClick={() => removeSet(exercise.id)}
                                    disabled={log.sets.length <= 1}
                                  >
                                    <Minus size={14} />
                                  </button>
                                  <button
                                    className="btn btn-secondary btn-sm"
                                    style={{ padding: '4px 10px' }}
                                    onClick={() => addSet(exercise.id)}
                                  >
                                    <Plus size={14} />
                                  </button>
                                </div>
                              </div>

                              <div style={{
                                display: 'grid',
                                gridTemplateColumns: '40px 1fr 1fr 40px',
                                gap: '6px 8px',
                                alignItems: 'center',
                                fontSize: 12,
                              }}>
                                <div style={{ color: '#55556a', textAlign: 'center', fontWeight: 600 }}>Set</div>
                                <div style={{ color: '#55556a', fontWeight: 600 }}>Reps</div>
                                <div style={{ color: '#55556a', fontWeight: 600 }}>Weight / Band</div>
                                <div style={{ color: '#55556a', textAlign: 'center' }}>✓</div>

                                {log.sets.map((set, si) => (
                                  <SetRow
                                    key={si}
                                    setIndex={si}
                                    set={set}
                                    exerciseId={exercise.id}
                                    onUpdateSet={updateSetLog}
                                    onToggleComplete={toggleSetComplete}
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => startRest(exercise.rest)}>
                              <Timer size={14} /> Start {exercise.rest}s Rest
                            </button>
                            <button className="btn btn-secondary btn-sm" onClick={() => startRest(30)}>
                              <Clock size={14} /> 30s
                            </button>
                            <button className="btn btn-secondary btn-sm" onClick={() => startRest(60)}>
                              <Clock size={14} /> 60s
                            </button>
                            <button className="btn btn-secondary btn-sm" onClick={() => startRest(90)}>
                              <Clock size={14} /> 90s
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
              <button className="btn btn-secondary" onClick={handleGenerate} style={{ flex: 1 }}>
                <Shuffle size={16} /> New Workout
              </button>
              <button
                className={`btn ${allDone ? 'btn-success' : 'btn-primary'}`}
                onClick={finishWorkout}
                style={{ flex: 1 }}
              >
                <Check size={16} /> {allDone ? 'Complete! 🎉' : 'Finish Workout'}
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'browse' && (
        <div className="fade-in">
          <div className="muscle-map" style={{ marginBottom: 12 }}>
            <button
              className={`muscle-button ${!filterMuscle ? 'selected' : ''}`}
              onClick={() => { setFilterMuscle(null); setBrowsePage(0); }}
            >
              All Muscles
            </button>
            {muscleGroups.map(m => (
              <button
                key={m.id}
                className={`muscle-button ${filterMuscle === m.id ? 'selected' : ''}`}
                onClick={() => { setFilterMuscle(m.id); setBrowsePage(0); }}
                style={filterMuscle === m.id ? { borderColor: m.color, color: m.color } : {}}
              >
                {m.name}
              </button>
            ))}
          </div>

          <div className="muscle-map" style={{ marginBottom: 16 }}>
            <button
              className={`muscle-button ${!filterEquipment ? 'selected' : ''}`}
              onClick={() => { setFilterEquipment(null); setBrowsePage(0); }}
            >
              All Equipment
            </button>
            {equipmentList.map(eq => (
              <button
                key={eq.id}
                className={`muscle-button ${filterEquipment === eq.id ? 'selected' : ''}`}
                onClick={() => { setFilterEquipment(eq.id); setBrowsePage(0); }}
                style={filterEquipment === eq.id ? { borderColor: '#00cec9', color: '#00cec9' } : {}}
              >
                {eq.icon} {eq.name}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, fontSize: 13, color: '#8888a0' }}>
            <span>{browseTotal} exercises</span>
            <span>Page {browsePage + 1} / {browsePages}</span>
          </div>

          <div className="card-grid">
            {browsedExercises.map(exercise => (
              <div key={exercise.id} className="exercise-card">
                <ExerciseVisual exercise={exercise} />
                <div className="exercise-info">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <h3>{exercise.name}</h3>
                    <span className={`badge badge-${exercise.difficulty}`}>{exercise.difficulty}</span>
                  </div>
                  <div className="muscle-tags">
                    {exercise.muscles.map(m => {
                      const muscle = muscleGroups.find(mg => mg.id === m);
                      return muscle ? (
                        <span key={m} className="muscle-tag" style={{ background: muscle.color + '20', color: muscle.color }}>
                          {muscle.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                  <p>{exercise.description}</p>
                  <div className="exercise-meta">
                    <span><Repeat size={12} /> {exercise.sets} × {exercise.reps}</span>
                    <span><Clock size={12} /> {exercise.rest}s rest</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {browsePages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
              <button className="btn btn-secondary btn-sm" disabled={browsePage === 0} onClick={() => setBrowsePage(p => p - 1)}>
                ← Prev
              </button>
              {Array.from({ length: Math.min(browsePages, 7) }, (_, i) => {
                let page;
                if (browsePages <= 7) {
                  page = i;
                } else if (browsePage < 4) {
                  page = i;
                } else if (browsePage > browsePages - 5) {
                  page = browsePages - 7 + i;
                } else {
                  page = browsePage - 3 + i;
                }
                return (
                  <button
                    key={page}
                    className={`btn btn-sm ${browsePage === page ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setBrowsePage(page)}
                    style={{ minWidth: 36 }}
                  >
                    {page + 1}
                  </button>
                );
              })}
              <button className="btn btn-secondary btn-sm" disabled={browsePage >= browsePages - 1} onClick={() => setBrowsePage(p => p + 1)}>
                Next →
              </button>
            </div>
          )}
        </div>
      )}

      {showTimer && (
        <RestTimer
          seconds={timerSeconds}
          onComplete={() => setShowTimer(false)}
          onDismiss={() => setShowTimer(false)}
        />
      )}
    </div>
  );
}

function SetRow({ setIndex, set, exerciseId, onUpdateSet, onToggleComplete }) {
  return (
    <>
      <div style={{
        textAlign: 'center',
        fontWeight: 700,
        fontSize: 13,
        color: set.completed ? '#00cec9' : '#8888a0',
      }}>
        {setIndex + 1}
      </div>
      <input
        className="form-input"
        type="number"
        placeholder="12"
        value={set.reps}
        onChange={e => onUpdateSet(exerciseId, setIndex, 'reps', e.target.value)}
        style={{
          padding: '8px 10px',
          fontSize: 13,
          background: set.completed ? 'rgba(0,206,201,0.08)' : undefined,
        }}
      />
      <input
        className="form-input"
        type="text"
        placeholder="e.g. Red band"
        value={set.weight}
        onChange={e => onUpdateSet(exerciseId, setIndex, 'weight', e.target.value)}
        style={{
          padding: '8px 10px',
          fontSize: 13,
          background: set.completed ? 'rgba(0,206,201,0.08)' : undefined,
        }}
      />
      <button
        className={`check-btn ${set.completed ? 'checked' : ''}`}
        onClick={() => onToggleComplete(exerciseId, setIndex)}
        style={{ width: 32, height: 32 }}
      >
        <Check size={14} />
      </button>
    </>
  );
}
