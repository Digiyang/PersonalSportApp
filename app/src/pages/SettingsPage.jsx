import { useRef } from 'react';
import { RotateCcw, Download, Upload } from 'lucide-react';

export default function SettingsPage({ state, onUpdateSettings, onReset, onImport }) {
  const fileInputRef = useRef(null);

  const handleExport = () => {
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitforge-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data.profile && !data.workoutLog && !data.settings) {
          alert('Invalid backup file.');
          return;
        }
        if (window.confirm('This will replace all current data. Continue?')) {
          onImport(data);
        }
      } catch {
        alert('Could not read file. Make sure it is a valid FitForge backup.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };
  const { settings } = state;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Customize your app experience</p>
      </div>

      <div style={{ maxWidth: 600 }}>
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 20 }}>Preferences</h3>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Units</div>
              <div style={{ fontSize: 12, color: '#8888a0' }}>Choose metric or imperial</div>
            </div>
            <div className="toggle-group">
              <button
                className={`toggle-option ${settings.units === 'metric' ? 'active' : ''}`}
                onClick={() => onUpdateSettings({ units: 'metric' })}
              >
                Metric
              </button>
              <button
                className={`toggle-option ${settings.units === 'imperial' ? 'active' : ''}`}
                onClick={() => onUpdateSettings({ units: 'imperial' })}
              >
                Imperial
              </button>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 16 }}>About</h3>
          <div style={{ fontSize: 13, color: '#8888a0', lineHeight: 1.8 }}>
            <p><strong style={{ color: '#f0f0f5' }}>FitForge</strong> - Your Personal Fitness Companion</p>
            <p>Version 1.0.0</p>
            <p>All data is stored locally on your device.</p>
            <p>Exercises are designed for your home equipment.</p>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 8 }}>Data Backup</h3>
          <p style={{ fontSize: 13, color: '#8888a0', marginBottom: 16 }}>
            Export your data as a JSON file or restore from a previous backup.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" onClick={handleExport}>
              <Download size={16} /> Export Data
            </button>
            <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
              <Upload size={16} /> Import Data
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleImport}
            />
          </div>
        </div>

        <div className="card" style={{ borderColor: '#ff6b6b40' }}>
          <h3 style={{ marginBottom: 8, color: '#ff6b6b' }}>Danger Zone</h3>
          <p style={{ fontSize: 13, color: '#8888a0', marginBottom: 16 }}>
            Reset all data including profile, workout history, and progress. This cannot be undone.
          </p>
          <button className="btn btn-danger" onClick={() => {
            if (window.confirm('Are you sure? This will delete all your data and cannot be undone.')) {
              onReset();
            }
          }}>
            <RotateCcw size={16} /> Reset All Data
          </button>
        </div>
      </div>
    </div>
  );
}
