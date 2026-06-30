import {
  Home, Dumbbell, UtensilsCrossed, TrendingUp, Trophy, User, Settings, Droplets
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', icon: Home, label: 'Dashboard' },
  { id: 'workout', icon: Dumbbell, label: 'Workout' },
  { id: 'nutrition', icon: UtensilsCrossed, label: 'Nutrition' },
  { id: 'hydration', icon: Droplets, label: 'Hydration' },
  { id: 'progress', icon: TrendingUp, label: 'Progress' },
  { id: 'achievements', icon: Trophy, label: 'Achievements' },
  { id: 'profile', icon: User, label: 'Profile' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ activePage, onNavigate }) {
  return (
    <nav className="sidebar">
      <div className="sidebar-logo" onClick={() => onNavigate('dashboard')}>
        F
      </div>
      <div className="sidebar-nav">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <item.icon size={20} />
            <span className="tooltip">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
