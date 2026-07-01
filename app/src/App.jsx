import { useState } from 'react';
import { useAppState } from './hooks/useAppState';
import Sidebar from './components/Sidebar';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Workout from './pages/Workout';
import Nutrition from './pages/Nutrition';
import Hydration from './pages/Hydration';
import Progress from './pages/Progress';
import Achievements from './pages/Achievements';
import Profile from './pages/Profile';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  const {
    state,
    updateProfile,
    logWorkout,
    logMeal,
    unlogMeal,
    clearTodayMeals,
    logWater,
    logWeight,
    updateSettings,
    resetApp,
    importData,
  } = useAppState();

  const [page, setPage] = useState('dashboard');

  if (!state.profile) {
    return <Onboarding onComplete={updateProfile} />;
  }

  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return <Dashboard state={state} onNavigate={setPage} />;
      case 'workout':
        return <Workout state={state} onLogWorkout={logWorkout} />;
      case 'nutrition':
        return <Nutrition state={state} onLogMeal={logMeal} onUnlogMeal={unlogMeal} onClearTodayMeals={clearTodayMeals} onUpdateProfile={updateProfile} />;
      case 'hydration':
        return <Hydration state={state} onLogWater={logWater} />;
      case 'progress':
        return <Progress state={state} onLogWeight={logWeight} />;
      case 'achievements':
        return <Achievements state={state} />;
      case 'profile':
        return <Profile state={state} onUpdateProfile={updateProfile} />;
      case 'settings':
        return <SettingsPage state={state} onUpdateSettings={updateSettings} onReset={resetApp} onImport={importData} />;
      default:
        return <Dashboard state={state} onNavigate={setPage} />;
    }
  };

  return (
    <div className="app">
      <Sidebar activePage={page} onNavigate={setPage} />
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}
