const allAchievements = [
  { id: 'first_workout', name: 'First Step', icon: '🎯', desc: 'Complete your first workout' },
  { id: 'ten_workouts', name: 'Getting Serious', icon: '💪', desc: 'Complete 10 workouts' },
  { id: 'fifty_workouts', name: 'Iron Will', icon: '🏆', desc: 'Complete 50 workouts' },
  { id: 'week_streak', name: 'Week Warrior', icon: '🔥', desc: 'Maintain a 7-day streak' },
  { id: 'month_streak', name: 'Unstoppable', icon: '⚡', desc: 'Maintain a 30-day streak' },
];

export default function Achievements({ state }) {
  const { achievements, workoutLog, streak } = state;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Achievements</h1>
        <p>Track your milestones and unlock badges</p>
      </div>

      <div className="stats-row" style={{ marginBottom: 32 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(253, 203, 110, 0.15)' }}>
            <span style={{ fontSize: 24 }}>🏅</span>
          </div>
          <div className="stat-content">
            <h4>{achievements.length}/{allAchievements.length}</h4>
            <p>Badges Unlocked</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(108, 92, 231, 0.15)' }}>
            <span style={{ fontSize: 24 }}>💪</span>
          </div>
          <div className="stat-content">
            <h4>{workoutLog.length}</h4>
            <p>Total Workouts</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(255, 107, 107, 0.15)' }}>
            <span style={{ fontSize: 24 }}>🔥</span>
          </div>
          <div className="stat-content">
            <h4>{streak}</h4>
            <p>Current Streak</p>
          </div>
        </div>
      </div>

      <div className="section">
        <h2 style={{ marginBottom: 16 }}>All Achievements</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {allAchievements.map(a => {
            const unlocked = achievements.includes(a.id);
            return (
              <div key={a.id} className={`achievement ${unlocked ? 'unlocked' : ''}`}>
                <div className="achievement-icon">
                  {unlocked ? a.icon : '🔒'}
                </div>
                <div className="achievement-info">
                  <h4>{a.name}</h4>
                  <p>{a.desc}</p>
                </div>
                {unlocked && (
                  <span style={{
                    marginLeft: 'auto',
                    fontSize: 12,
                    color: '#fdcb6e',
                    fontWeight: 600,
                  }}>
                    UNLOCKED ✨
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
