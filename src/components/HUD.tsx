import { useGameStore } from '../store/gameStore';
import type { CameraMode } from '../types/game';

const cameraModeLabels: Record<CameraMode, string> = {
  'first-person': '1ST PERSON',
  'third-person': '3RD PERSON',
  'top-down': 'TACTICAL',
};

export function HUD() {
  const cameraMode = useGameStore((s) => s.cameraMode);
  const setCameraMode = useGameStore((s) => s.setCameraMode);
  const resources = useGameStore((s) => s.resources);
  const selectedUnitIds = useGameStore((s) => s.selectedUnitIds);
  const units = useGameStore((s) => s.units);
  const isPaused = useGameStore((s) => s.isPaused);
  const togglePause = useGameStore((s) => s.togglePause);

  const selectedUnits = units.filter((u) => selectedUnitIds.includes(u.id));

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        fontFamily: '"Courier New", monospace',
        color: '#00ffcc',
      }}
    >
      {/* Top bar - Resources */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 20px',
          background: 'linear-gradient(180deg, rgba(0,20,40,0.9) 0%, rgba(0,10,20,0) 100%)',
        }}
      >
        <div style={{ display: 'flex', gap: '30px', fontSize: '14px' }}>
          <span>⚡ CREDITS: {resources.credits}</span>
          <span>
            🔋 POWER: {resources.power}/{resources.maxPower}
          </span>
        </div>
        <div style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '3px' }}>
          SCOPEDOWN
        </div>
        <div style={{ fontSize: '12px', opacity: 0.7 }}>
          {cameraModeLabels[cameraMode]} VIEW
        </div>
      </div>

      {/* Camera mode buttons */}
      <div
        style={{
          position: 'absolute',
          top: '50px',
          right: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
          pointerEvents: 'auto',
        }}
      >
        {(['top-down', 'third-person', 'first-person'] as CameraMode[]).map(
          (mode) => (
            <button
              key={mode}
              onClick={() => setCameraMode(mode)}
              style={{
                background:
                  cameraMode === mode
                    ? 'rgba(0,255,204,0.3)'
                    : 'rgba(0,20,40,0.7)',
                border: `1px solid ${cameraMode === mode ? '#00ffcc' : '#1a3a4a'}`,
                color: cameraMode === mode ? '#00ffcc' : '#4a6a7a',
                padding: '8px 16px',
                fontSize: '11px',
                cursor: 'pointer',
                fontFamily: '"Courier New", monospace',
                letterSpacing: '1px',
                transition: 'all 0.2s',
              }}
            >
              {cameraModeLabels[mode]}
            </button>
          )
        )}
        <button
          onClick={togglePause}
          style={{
            background: isPaused
              ? 'rgba(255,68,0,0.3)'
              : 'rgba(0,20,40,0.7)',
            border: `1px solid ${isPaused ? '#ff4400' : '#1a3a4a'}`,
            color: isPaused ? '#ff4400' : '#4a6a7a',
            padding: '8px 16px',
            fontSize: '11px',
            cursor: 'pointer',
            fontFamily: '"Courier New", monospace',
            letterSpacing: '1px',
            marginTop: '10px',
          }}
        >
          {isPaused ? '▶ RESUME' : '⏸ PAUSE'}
        </button>
      </div>

      {/* Selected units panel */}
      {selectedUnits.length > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            background: 'rgba(0,20,40,0.85)',
            border: '1px solid #1a3a4a',
            padding: '15px',
            minWidth: '200px',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              marginBottom: '10px',
              borderBottom: '1px solid #1a3a4a',
              paddingBottom: '5px',
              letterSpacing: '2px',
            }}
          >
            SELECTED ({selectedUnits.length})
          </div>
          {selectedUnits.map((unit) => (
            <div
              key={unit.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '11px',
                padding: '3px 0',
                color: '#88aacc',
              }}
            >
              <span>{unit.type.toUpperCase()}</span>
              <span>
                HP: {unit.health}/{unit.maxHealth}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Controls help */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          fontSize: '10px',
          color: '#3a5a6a',
          textAlign: 'right',
          lineHeight: '1.6',
        }}
      >
        <div>LEFT CLICK - Select Unit</div>
        <div>SHIFT+CLICK - Multi Select</div>
        <div>RIGHT CLICK - Move Units</div>
        <div>SCROLL - Zoom</div>
        <div>MIDDLE MOUSE - Rotate</div>
      </div>

      {/* Pause overlay */}
      {isPaused && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '48px',
            fontWeight: 'bold',
            letterSpacing: '10px',
            color: '#ff4400',
            textShadow: '0 0 20px rgba(255,68,0,0.5)',
          }}
        >
          PAUSED
        </div>
      )}
    </div>
  );
}
