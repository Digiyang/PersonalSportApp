import { useState, useRef, useCallback } from 'react';

const warmupGifs = {
  warmup_jumping_jacks: 'videos/3224-1g5bPpA.gif',
  warmup_arm_circles: 'videos/2355-uWpxD4v.gif',
  warmup_high_knees: 'videos/3636-ealLwvX.gif',
  warmup_hip_circles: 'videos/1686-5BZHW9s.gif',
  warmup_leg_swings: 'videos/3470-kMzUs9Y.gif',
  warmup_torso_twist: 'videos/1686-5BZHW9s.gif',
  warmup_shoulder_rolls: 'videos/1271-Uto7l43.gif',
  warmup_bodyweight_squat: 'videos/3119-75Bgtjy.gif',
  warmup_inchworm: 'videos/1471-ZgsNQ6d.gif',
  warmup_band_pull_apart: 'videos/0993-sTfvVsG.gif',
};

export default function ExerciseVisual({ exercise, autoPlay = false }) {
  const gifPath = exercise.gifPath || warmupGifs[exercise.id];
  const gifUrl = gifPath ? `/${gifPath}` : null;
  const [playing, setPlaying] = useState(autoPlay);
  const [posterUrl, setPosterUrl] = useState(null);
  const canvasRef = useRef(null);

  const extractFrame = useCallback((img) => {
    if (posterUrl) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    try {
      setPosterUrl(canvas.toDataURL('image/jpeg', 0.8));
    } catch {}
  }, [posterUrl]);

  const muscleColors = {
    chest: '#ef4444', back: '#3b82f6', shoulders: '#8b5cf6',
    arms: '#f59e0b', core: '#22c55e', legs: '#ec4899', glutes: '#14b8a6',
  };

  return (
    <div
      className="exercise-visual"
      style={{ position: 'relative', overflow: 'hidden', cursor: gifUrl ? 'pointer' : 'default' }}
      onClick={() => gifUrl && setPlaying(p => !p)}
      onMouseEnter={() => gifUrl && setPlaying(true)}
      onMouseLeave={() => gifUrl && !autoPlay && setPlaying(false)}
    >
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {gifUrl ? (
        <>
          {playing ? (
            <img
              src={gifUrl}
              alt={exercise.name}
              loading="lazy"
              onLoad={(e) => extractFrame(e.target)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                borderRadius: 12,
                background: '#f5f5f5',
              }}
            />
          ) : (
            <img
              src={posterUrl || gifUrl}
              alt={exercise.name}
              loading="lazy"
              onLoad={(e) => !posterUrl && extractFrame(e.target)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                borderRadius: 12,
                background: '#f5f5f5',
              }}
            />
          )}
          {!playing && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 18,
              pointerEvents: 'none',
            }}>
              ▶
            </div>
          )}
        </>
      ) : (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
          borderRadius: 12,
          color: '#8888a0',
          fontSize: 14,
          textAlign: 'center',
          padding: 20,
        }}>
          <div>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🏋️</div>
            {exercise.name}
          </div>
        </div>
      )}
      <div style={{
        position: 'absolute',
        bottom: 8,
        left: 8,
        display: 'flex',
        gap: 4,
        flexWrap: 'wrap',
      }}>
        {(exercise.muscles || []).map(m => (
          <span key={m} style={{
            fontSize: 9,
            padding: '2px 6px',
            borderRadius: 8,
            background: (muscleColors[m] || '#666') + '40',
            color: muscleColors[m] || '#888',
            fontWeight: 600,
            backdropFilter: 'blur(4px)',
          }}>
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}
