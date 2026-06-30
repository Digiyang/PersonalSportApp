import { useState, useEffect, useRef } from 'react';

export default function RestTimer({ seconds, onComplete, onDismiss }) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [seconds, onComplete]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const progress = ((seconds - timeLeft) / seconds) * 100;

  return (
    <div className="modal-overlay" onClick={onDismiss}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>Rest Timer</h3>
        <div className="timer-display">
          <div className="timer-value">
            {mins}:{secs.toString().padStart(2, '0')}
          </div>
          <div className="timer-label">remaining</div>
        </div>
        <div className="progress-bar" style={{ marginTop: 20 }}>
          <div
            className="progress-fill"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #6c5ce7, #00cec9)',
            }}
          />
        </div>
        <div className="timer-controls">
          <button className="btn btn-secondary btn-sm" onClick={onDismiss}>
            Skip
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => {
            clearInterval(intervalRef.current);
            setTimeLeft(seconds);
            intervalRef.current = setInterval(() => {
              setTimeLeft(prev => {
                if (prev <= 1) {
                  clearInterval(intervalRef.current);
                  onComplete();
                  return 0;
                }
                return prev - 1;
              });
            }, 1000);
          }}>
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
