import { useState, useMemo } from 'react';
import { RefreshCw, Clock, Plus, ShoppingCart, X, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { calculateBMR, calculateTDEE, calculateMacros } from '../utils/calculations';
import { generateWeeklyMealPlan, mealDatabase, generateWeeklyShoppingList, getReplacementsFor } from '../data/meals';
import { getNutritionTips, tipCategories } from '../data/tips';

const categoryLabels = {
  protein: { label: 'Meat & Protein', icon: '🥩' },
  dairy: { label: 'Dairy', icon: '🥛' },
  grains: { label: 'Grains & Bread', icon: '🌾' },
  produce: { label: 'Fruits & Vegetables', icon: '🥬' },
  pantry: { label: 'Pantry & Condiments', icon: '🫙' },
  'nuts & seeds': { label: 'Nuts & Seeds', icon: '🥜' },
  other: { label: 'Other', icon: '📦' },
};

export default function Nutrition({ state, onLogMeal, onUnlogMeal, onClearTodayMeals, onUpdateProfile }) {
  const { profile } = state;
  const [tab, setTab] = useState('plan');
  const excludedFoods = profile?.excludedFoods || [];

  const bmr = profile ? calculateBMR(profile.weight, profile.height, profile.age, profile.gender) : 0;
  const tdee = profile ? calculateTDEE(bmr, profile.activityLevel) : 0;
  const macros = profile ? calculateMacros(tdee, profile.fitnessGoal, profile.weight, profile.targetWeight, profile.goalWeeks) : { calories: 0 };

  const [weekPlan, setWeekPlan] = useState(() => {
    if (!profile) return null;
    return generateWeeklyMealPlan(macros.calories, profile.fitnessGoal, excludedFoods);
  });

  const [checkedItems, setCheckedItems] = useState(new Set());
  const [excludeInput, setExcludeInput] = useState('');
  const [selectedDay, setSelectedDay] = useState(() => new Date().getDay());
  const [expandedMeal, setExpandedMeal] = useState(null);

  if (!profile) return null;

  const refreshPlan = () => {
    setWeekPlan(generateWeeklyMealPlan(macros.calories, profile.fitnessGoal, excludedFoods));
    setCheckedItems(new Set());
  };

  const shoppingList = useMemo(() => {
    return generateWeeklyShoppingList(weekPlan, excludedFoods);
  }, [weekPlan, excludedFoods]);

  const toggleChecked = (itemName) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemName)) next.delete(itemName);
      else next.add(itemName);
      return next;
    });
  };

  const addExclusion = (food) => {
    if (!food.trim()) return;
    const lower = food.trim().toLowerCase();
    if (excludedFoods.includes(lower)) return;
    const updated = [...excludedFoods, lower];
    onUpdateProfile({ ...profile, excludedFoods: updated });
    setExcludeInput('');
    setWeekPlan(generateWeeklyMealPlan(macros.calories, profile.fitnessGoal, updated));
    setCheckedItems(new Set());
  };

  const removeExclusion = (food) => {
    const updated = excludedFoods.filter(f => f !== food);
    onUpdateProfile({ ...profile, excludedFoods: updated });
    setWeekPlan(generateWeeklyMealPlan(macros.calories, profile.fitnessGoal, updated));
    setCheckedItems(new Set());
  };

  const totalShoppingItems = Object.values(shoppingList).reduce((sum, items) => sum + items.length, 0);
  const checkedCount = checkedItems.size;

  const todayPlan = weekPlan ? weekPlan[selectedDay] : null;

  const weekTotalCals = weekPlan ? Math.round(weekPlan.reduce((s, d) => s + d.totalCalories, 0) / 7) : 0;

  const todayStr = new Date().toDateString();
  const todayMeals = state.mealLog.filter(m => new Date(m.date).toDateString() === todayStr);
  const todayLogged = {
    calories: todayMeals.reduce((s, m) => s + (m.calories || 0), 0),
    protein: todayMeals.reduce((s, m) => s + (m.protein || 0), 0),
    carbs: todayMeals.reduce((s, m) => s + (m.carbs || 0), 0),
    fat: todayMeals.reduce((s, m) => s + (m.fat || 0), 0),
    count: todayMeals.length,
  };

  const MealCard = ({ meal, mealType, showLog }) => {
    const isExpanded = expandedMeal === `${mealType}-${selectedDay}`;
    const toggleExpand = () => setExpandedMeal(isExpanded ? null : `${mealType}-${selectedDay}`);

    return (
      <div className="meal-card">
        <div className="meal-header">
          <div>
            <div style={{ fontSize: 11, color: '#8888a0', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
              {mealType}
            </div>
            <h4>{meal.name}</h4>
          </div>
          <div className="meal-calories">{meal.calories} kcal</div>
        </div>
        {meal.portions && meal.portions !== 1 && (
          <div style={{ fontSize: 11, color: '#fdcb6e', marginBottom: 6, fontWeight: 600 }}>
            {meal.portions}x portion to match your calorie target
          </div>
        )}
        <div className="meal-macros">
          <span className="macro-pill macro-protein">P: {meal.protein}g</span>
          <span className="macro-pill macro-carbs">C: {meal.carbs}g</span>
          <span className="macro-pill macro-fat">F: {meal.fat}g</span>
        </div>
        <ul className="meal-ingredients">
          {meal.ingredients.map((ing, i) => {
            const isExcluded = excludedFoods.some(ex => ing.toLowerCase().includes(ex));
            const replacements = isExcluded ? getReplacementsFor(ing) : null;
            return (
              <li key={i} style={{ color: isExcluded ? '#ff6b6b' : undefined }}>
                {ing}
                {isExcluded && replacements && (
                  <div style={{ fontSize: 11, color: '#fdcb6e', marginTop: 2 }}>
                    Try: {replacements.slice(0, 2).join(', ')}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <span style={{ fontSize: 12, color: '#8888a0', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={12} /> {meal.prepTime} min
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            {meal.instructions && (
              <button className="btn btn-sm btn-secondary" onClick={toggleExpand}>
                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {isExpanded ? ' Hide' : ' How to'}
              </button>
            )}
            {showLog && (() => {
              const mealKey = `${mealType}-${meal.name}`;
              const isLogged = todayMeals.some(m => m.name === meal.name && m.type === mealType);
              return isLogged ? (
                <button className="btn btn-sm btn-success" onClick={() => {
                  onUnlogMeal(meal.name, mealType);
                }}>
                  <Check size={14} /> Logged
                </button>
              ) : (
                <button className="btn btn-sm btn-secondary" onClick={() => {
                  onLogMeal({ ...meal, type: mealType });
                }}>
                  <Plus size={14} /> Log
                </button>
              );
            })()}
          </div>
        </div>
        {isExpanded && meal.instructions && (
          <div style={{
            marginTop: 12, padding: '12px 14px', borderRadius: 10,
            background: 'rgba(162,155,254,0.06)', border: '1px solid rgba(162,155,254,0.15)',
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#a29bfe', marginBottom: 8 }}>Preparation</div>
            <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13, lineHeight: 1.7, color: '#c0c0d0' }}>
              {meal.instructions.map((step, i) => (
                <li key={i} style={{ marginBottom: 4 }}>{step}</li>
              ))}
            </ol>
          </div>
        )}
      </div>
    );
  };

  const shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Nutrition</h1>
        <p>Weekly meal plan — {macros.calories} kcal/day target</p>
      </div>

      {todayLogged.count > 0 && (
        <div className="card" style={{ marginBottom: 16, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h3 style={{ margin: 0, fontSize: 15 }}>Today's Intake</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, color: '#8888a0' }}>{todayLogged.count} meal{todayLogged.count > 1 ? 's' : ''} logged</span>
              <button className="btn btn-sm btn-secondary" style={{ fontSize: 11, padding: '4px 10px' }} onClick={onClearTodayMeals}>
                <X size={12} /> Reset
              </button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: todayLogged.calories >= macros.calories ? '#00cec9' : '#a29bfe' }}>
                {todayLogged.calories}
              </div>
              <div style={{ fontSize: 10, color: '#8888a0' }}>/ {macros.calories} kcal</div>
              <div className="progress-bar" style={{ marginTop: 4, height: 4 }}>
                <div className="progress-fill" style={{ width: `${Math.min(100, (todayLogged.calories / macros.calories) * 100)}%`, background: '#a29bfe' }} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#a29bfe' }}>{todayLogged.protein}g</div>
              <div style={{ fontSize: 10, color: '#8888a0' }}>/ {macros.protein}g P</div>
              <div className="progress-bar" style={{ marginTop: 4, height: 4 }}>
                <div className="progress-fill" style={{ width: `${Math.min(100, (todayLogged.protein / macros.protein) * 100)}%`, background: '#a29bfe' }} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#fdcb6e' }}>{todayLogged.carbs}g</div>
              <div style={{ fontSize: 10, color: '#8888a0' }}>/ {macros.carbs}g C</div>
              <div className="progress-bar" style={{ marginTop: 4, height: 4 }}>
                <div className="progress-fill" style={{ width: `${Math.min(100, (todayLogged.carbs / macros.carbs) * 100)}%`, background: '#fdcb6e' }} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#ff6b6b' }}>{todayLogged.fat}g</div>
              <div style={{ fontSize: 10, color: '#8888a0' }}>/ {macros.fat}g F</div>
              <div className="progress-bar" style={{ marginTop: 4, height: 4 }}>
                <div className="progress-fill" style={{ width: `${Math.min(100, (todayLogged.fat / macros.fat) * 100)}%`, background: '#ff6b6b' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="tabs">
        <button className={`tab ${tab === 'plan' ? 'active' : ''}`} onClick={() => setTab('plan')}>Week Plan</button>
        <button className={`tab ${tab === 'shopping' ? 'active' : ''}`} onClick={() => setTab('shopping')}>
          Shopping List
        </button>
        <button className={`tab ${tab === 'exclude' ? 'active' : ''}`} onClick={() => setTab('exclude')}>
          Food Preferences
        </button>
        <button className={`tab ${tab === 'browse' ? 'active' : ''}`} onClick={() => setTab('browse')}>Browse</button>
        <button className={`tab ${tab === 'guide' ? 'active' : ''}`} onClick={() => setTab('guide')}>Guide</button>
      </div>

      {tab === 'plan' && weekPlan && (
        <div className="fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <span style={{ fontSize: 14, fontWeight: 600 }}>
                Avg: {weekTotalCals} kcal/day
              </span>
              <span style={{ fontSize: 13, color: macros.calories - weekTotalCals > 100 ? '#ff6b6b' : weekTotalCals - macros.calories > 100 ? '#fdcb6e' : '#00cec9', marginLeft: 12 }}>
                ({weekTotalCals >= macros.calories ? '+' : ''}{weekTotalCals - macros.calories} vs target)
              </span>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={refreshPlan}>
              <RefreshCw size={14} /> New Week
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 20 }}>
            {shortDays.map((name, idx) => {
              const dayPlan = weekPlan[idx];
              const isSelected = selectedDay === idx;
              const isToday = new Date().getDay() === idx;
              return (
                <button
                  key={idx}
                  onClick={() => { setSelectedDay(idx); setExpandedMeal(null); }}
                  style={{
                    padding: '10px 4px',
                    borderRadius: 10,
                    border: isSelected ? '2px solid #a29bfe' : isToday ? '2px solid rgba(162,155,254,0.3)' : '1px solid rgba(255,255,255,0.06)',
                    background: isSelected ? 'rgba(162,155,254,0.12)' : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, color: isSelected ? '#a29bfe' : '#8888a0' }}>{name}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: isSelected ? '#fff' : '#8888a0', marginTop: 4 }}>
                    {dayPlan.totalCalories}
                  </div>
                  <div style={{ fontSize: 9, color: '#55556a' }}>kcal</div>
                </button>
              );
            })}
          </div>

          {todayPlan && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 16 }}>
                  {todayPlan.dayName}{new Date().getDay() === selectedDay ? ' (Today)' : ''}
                </h3>
                <span style={{ fontSize: 13, color: '#8888a0' }}>
                  {todayPlan.totalCalories} kcal · P: {todayPlan.totalProtein}g · C: {todayPlan.totalCarbs}g · F: {todayPlan.totalFat}g
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                <MealCard meal={todayPlan.breakfast} mealType="Breakfast" showLog />
                <MealCard meal={todayPlan.lunch} mealType="Lunch" showLog />
                <MealCard meal={todayPlan.dinner} mealType="Dinner" showLog />
                <MealCard meal={todayPlan.snack} mealType="Snack" showLog />
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'shopping' && weekPlan && (
        <div className="fade-in">
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShoppingCart size={20} /> Weekly Shopping List
                </h3>
                <p style={{ fontSize: 13, color: '#8888a0', marginTop: 4 }}>
                  Based on your 7-day meal plan · {totalShoppingItems} items
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: checkedCount === totalShoppingItems ? '#00cec9' : '#a29bfe' }}>
                  {checkedCount}/{totalShoppingItems}
                </div>
                <div style={{ fontSize: 11, color: '#8888a0' }}>checked off</div>
              </div>
            </div>
            <div className="progress-bar" style={{ marginTop: 12 }}>
              <div className="progress-fill" style={{
                width: totalShoppingItems ? `${(checkedCount / totalShoppingItems) * 100}%` : '0%',
                background: checkedCount === totalShoppingItems ? 'var(--gradient-2)' : 'var(--gradient-1)',
              }} />
            </div>
          </div>

          {Object.entries(shoppingList).sort(([a], [b]) => a.localeCompare(b)).map(([category, items]) => {
            const cat = categoryLabels[category] || categoryLabels.other;
            return (
              <div key={category} style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 15, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>{cat.icon}</span> {cat.label}
                  <span style={{ fontSize: 11, color: '#8888a0', fontWeight: 400 }}>({items.length})</span>
                </h3>
                <div style={{ display: 'grid', gap: 6 }}>
                  {items.map(item => {
                    const isChecked = checkedItems.has(item.name);
                    const replacements = item.isExcluded ? getReplacementsFor(item.name) : null;
                    return (
                      <div key={item.name}>
                        <div
                          onClick={() => toggleChecked(item.name)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '10px 14px',
                            borderRadius: 10,
                            background: isChecked ? 'rgba(0,206,201,0.06)' : item.isExcluded ? 'rgba(255,107,107,0.06)' : 'rgba(255,255,255,0.02)',
                            border: `1px solid ${isChecked ? 'rgba(0,206,201,0.2)' : item.isExcluded ? 'rgba(255,107,107,0.2)' : 'rgba(255,255,255,0.06)'}`,
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                          }}
                        >
                          <div style={{
                            width: 24, height: 24, borderRadius: 6,
                            border: `2px solid ${isChecked ? '#00cec9' : '#55556a'}`,
                            background: isChecked ? '#00cec9' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            {isChecked && <Check size={14} color="#0a0a12" />}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{
                              fontSize: 14,
                              textDecoration: isChecked ? 'line-through' : 'none',
                              color: isChecked ? '#55556a' : item.isExcluded ? '#ff6b6b' : undefined,
                            }}>
                              {item.name}
                              {item.isExcluded && <span style={{ fontSize: 10, marginLeft: 6 }}>excluded</span>}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: isChecked ? '#55556a' : '#a29bfe' }}>
                              {item.weeklyAmount % 1 === 0 ? item.weeklyAmount : item.weeklyAmount.toFixed(1)}{item.unit ? ` ${item.unit}` : 'x'}
                            </div>
                            <div style={{ fontSize: 10, color: '#55556a' }}>
                              per week
                            </div>
                          </div>
                        </div>
                        {item.isExcluded && replacements && (
                          <div style={{
                            marginLeft: 36, marginTop: 4, padding: '6px 12px',
                            fontSize: 12, color: '#fdcb6e', background: 'rgba(253,203,110,0.06)',
                            borderRadius: 8, border: '1px solid rgba(253,203,110,0.15)',
                          }}>
                            Replace with: {replacements.slice(0, 3).join(', ')}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div className="tip-card" style={{ marginTop: 8 }}>
            <span className="tip-icon">💡</span>
            <p>Quantities are aggregated from your full 7-day plan with varied meals each day. Adjust based on packaging sizes you find in store.</p>
          </div>
        </div>
      )}

      {tab === 'exclude' && (
        <div className="fade-in" style={{ maxWidth: 700 }}>
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 4 }}>Foods I Don't Eat</h3>
            <p style={{ fontSize: 13, color: '#8888a0', marginBottom: 16 }}>
              Add foods you want to avoid. Meal plans will exclude these and suggest replacements.
            </p>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input
                className="form-input"
                placeholder="e.g. oats, shrimp, avocado..."
                value={excludeInput}
                onChange={e => setExcludeInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addExclusion(excludeInput)}
                style={{ flex: 1 }}
              />
              <button className="btn btn-primary btn-sm" onClick={() => addExclusion(excludeInput)} disabled={!excludeInput.trim()}>
                <Plus size={14} /> Add
              </button>
            </div>

            {excludedFoods.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {excludedFoods.map(food => (
                  <span key={food} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 12px', borderRadius: 20,
                    background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.25)',
                    color: '#ff6b6b', fontSize: 13, fontWeight: 600,
                  }}>
                    {food}
                    <button
                      onClick={() => removeExclusion(food)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
                    >
                      <X size={14} color="#ff6b6b" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: '#55556a', fontStyle: 'italic' }}>No excluded foods yet. All meals are available.</p>
            )}
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 4 }}>Quick Exclude</h3>
            <p style={{ fontSize: 13, color: '#8888a0', marginBottom: 16 }}>Common foods people avoid — tap to exclude.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {['oats', 'milk', 'eggs', 'shrimp', 'salmon', 'beef', 'peanut butter', 'avocado', 'soy sauce', 'cheese', 'honey', 'gluten'].map(food => {
                const isExcluded = excludedFoods.includes(food);
                return (
                  <button
                    key={food}
                    onClick={() => isExcluded ? removeExclusion(food) : addExclusion(food)}
                    style={{
                      padding: '8px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                      border: `1px solid ${isExcluded ? 'rgba(255,107,107,0.3)' : 'rgba(255,255,255,0.1)'}`,
                      background: isExcluded ? 'rgba(255,107,107,0.1)' : 'rgba(255,255,255,0.03)',
                      color: isExcluded ? '#ff6b6b' : '#c0c0d0',
                      cursor: 'pointer',
                    }}
                  >
                    {isExcluded ? '✕ ' : ''}{food}
                  </button>
                );
              })}
            </div>
          </div>

          {excludedFoods.length > 0 && (
            <div className="card">
              <h3 style={{ marginBottom: 12 }}>Replacement Suggestions</h3>
              <div style={{ display: 'grid', gap: 10 }}>
                {excludedFoods.map(food => {
                  const replacements = getReplacementsFor(food);
                  return (
                    <div key={food} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 12,
                      padding: '12px 14px', borderRadius: 10,
                      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                    }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 700,
                        background: 'rgba(255,107,107,0.1)', color: '#ff6b6b',
                        whiteSpace: 'nowrap',
                      }}>
                        {food}
                      </span>
                      <div style={{ flex: 1 }}>
                        {replacements ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {replacements.map(r => (
                              <span key={r} style={{
                                padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600,
                                background: 'rgba(0,206,201,0.08)', color: '#00cec9',
                                border: '1px solid rgba(0,206,201,0.15)',
                              }}>
                                {r}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: '#8888a0' }}>No specific replacements found — use similar foods from the same category</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'browse' && (
        <div className="fade-in">
          {['breakfast', 'lunch', 'dinner', 'snack'].map(type => (
            <div key={type} className="section">
              <div className="section-header">
                <h2 style={{ textTransform: 'capitalize' }}>{type} Options</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                {mealDatabase[type].map((meal, i) => (
                  <MealCard key={i} meal={meal} mealType={type} showLog />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'guide' && (
        <div className="fade-in" style={{ maxWidth: 700 }}>
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ marginBottom: 12 }}>Your Daily Targets</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#a29bfe' }}>{macros.calories}</div>
                <div style={{ fontSize: 12, color: '#8888a0' }}>Calories</div>
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#a29bfe' }}>{macros.protein}g</div>
                <div style={{ fontSize: 12, color: '#8888a0' }}>Protein</div>
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#fdcb6e' }}>{macros.carbs}g</div>
                <div style={{ fontSize: 12, color: '#8888a0' }}>Carbs</div>
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#ff6b6b' }}>{macros.fat}g</div>
                <div style={{ fontSize: 12, color: '#8888a0' }}>Fat</div>
              </div>
            </div>
          </div>

          <div className="tip-card" style={{ marginBottom: 12 }}>
            <span className="tip-icon">🥩</span>
            <p><strong>Protein:</strong> Essential for muscle repair. Aim for lean sources like chicken, fish, eggs, Greek yogurt, and legumes. Try to include protein in every meal.</p>
          </div>
          <div className="tip-card" style={{ marginBottom: 12 }}>
            <span className="tip-icon">🍚</span>
            <p><strong>Carbs:</strong> Your main energy source. Focus on complex carbs: oats, brown rice, sweet potatoes, whole grain bread. Time heavier carb meals around your workouts.</p>
          </div>
          <div className="tip-card" style={{ marginBottom: 12 }}>
            <span className="tip-icon">🥑</span>
            <p><strong>Fats:</strong> Vital for hormones. Choose healthy fats: avocado, nuts, olive oil, fatty fish. Avoid trans fats and limit saturated fats.</p>
          </div>
          <div className="tip-card" style={{ marginBottom: 12 }}>
            <span className="tip-icon">⏰</span>
            <p><strong>Meal Timing:</strong> Eat within 1-2 hours of waking up. Have a protein-rich meal within 30-60 minutes after workout. Don't skip meals — it leads to overeating later.</p>
          </div>
          <div className="tip-card" style={{ marginBottom: 12 }}>
            <span className="tip-icon">🛒</span>
            <p><strong>Shopping Tip:</strong> Shop the perimeter of the grocery store — that's where fresh produce, meats, and dairy are. Avoid processed foods in the center aisles.</p>
          </div>

          <h3 style={{ marginTop: 24, marginBottom: 12 }}>Meal Timing & Hydration</h3>
          <div style={{ display: 'grid', gap: 10 }}>
            {getNutritionTips().map(tip => {
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
      )}
    </div>
  );
}
