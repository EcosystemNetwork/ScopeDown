import { useEffect, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import type { CameraMode, UnitType } from '../types/game';
import { UNIT_COSTS } from '../types/game';

const cameraModeLabels: Record<CameraMode, string> = {
  'first-person': '1ST PERSON',
  'third-person': '3RD PERSON',
  'top-down': 'TACTICAL',
};

const PRODUCIBLE_UNITS: { type: UnitType; label: string; key: string }[] = [
  { type: 'soldier', label: 'SOLDIER', key: 'Q' },
  { type: 'tank', label: 'TANK', key: 'W' },
  { type: 'mech', label: 'MECH', key: 'E' },
];

export function HUD() {
  const cameraMode = useGameStore((s) => s.cameraMode);
  const setCameraMode = useGameStore((s) => s.setCameraMode);
  const resources = useGameStore((s) => s.resources);
  const selectedUnitIds = useGameStore((s) => s.selectedUnitIds);
  const units = useGameStore((s) => s.units);
  const isPaused = useGameStore((s) => s.isPaused);
  const togglePause = useGameStore((s) => s.togglePause);
  const gameStatus = useGameStore((s) => s.gameStatus);
  const produceUnit = useGameStore((s) => s.produceUnit);
  const resetGame = useGameStore((s) => s.resetGame);
  const gameTime = useGameStore((s) => s.gameTime);
  const toggleAdminPanel = useGameStore((s) => s.toggleAdminPanel);
  const showAdminPanel = useGameStore((s) => s.showAdminPanel);

  const selectedUnits = units.filter((u) => selectedUnitIds.includes(u.id));

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === '`') {
        toggleAdminPanel();
        return;
      }
      if (gameStatus !== 'playing') {
        if (e.key === 'r' || e.key === 'R') {
          resetGame();
        }
        return;
      }
      switch (e.key) {
        case 'p':
        case 'P':
          togglePause();
          break;
        case '1':
          setCameraMode('top-down');
          break;
        case '2':
          setCameraMode('third-person');
          break;
        case '3':
          setCameraMode('first-person');
          break;
        case 'q':
        case 'Q':
          produceUnit('soldier');
          break;
        case 'w':
        case 'W':
          if (!e.ctrlKey && !e.metaKey) {
            produceUnit('tank');
          }
          break;
        case 'e':
        case 'E':
          produceUnit('mech');
          break;
      }
    },
    [gameStatus, togglePause, setCameraMode, produceUnit, resetGame, toggleAdminPanel]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const formatTime = (t: number) => {
    const mins = Math.floor(t / 60);
    const secs = Math.floor(t % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
          <span style={{ color: '#4a6a7a' }}>⏱ {formatTime(gameTime)}</span>
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
          (mode, i) => (
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
              [{i + 1}] {cameraModeLabels[mode]}
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
          {isPaused ? '▶ RESUME [P]' : '⏸ PAUSE [P]'}
        </button>
        <button
          onClick={toggleAdminPanel}
          style={{
            background: showAdminPanel
              ? 'rgba(255,204,0,0.3)'
              : 'rgba(0,20,40,0.7)',
            border: `1px solid ${showAdminPanel ? '#ffcc00' : '#1a3a4a'}`,
            color: showAdminPanel ? '#ffcc00' : '#4a6a7a',
            padding: '8px 16px',
            fontSize: '11px',
            cursor: 'pointer',
            fontFamily: '"Courier New", monospace',
            letterSpacing: '1px',
            marginTop: '5px',
          }}
        >
          ⚙ ADMIN [`]
        </button>
      </div>

      {/* Unit Production Panel */}
      <div
        style={{
          position: 'absolute',
          bottom: '180px',
          left: '20px',
          background: 'rgba(0,20,40,0.85)',
          border: '1px solid #1a3a4a',
          padding: '10px',
          pointerEvents: 'auto',
        }}
      >
        <div
          style={{
            fontSize: '10px',
            marginBottom: '8px',
            borderBottom: '1px solid #1a3a4a',
            paddingBottom: '4px',
            letterSpacing: '2px',
            color: '#4a6a7a',
          }}
        >
          PRODUCE UNITS
        </div>
        <div style={{ display: 'flex', gap: '5px' }}>
          {PRODUCIBLE_UNITS.map(({ type, label, key }) => (
            <button
              key={type}
              onClick={() => produceUnit(type)}
              disabled={resources.credits < UNIT_COSTS[type]}
              style={{
                background:
                  resources.credits >= UNIT_COSTS[type]
                    ? 'rgba(0,255,204,0.15)'
                    : 'rgba(40,40,40,0.5)',
                border: `1px solid ${resources.credits >= UNIT_COSTS[type] ? '#1a3a4a' : '#1a1a1a'}`,
                color:
                  resources.credits >= UNIT_COSTS[type] ? '#00ffcc' : '#333',
                padding: '6px 10px',
                fontSize: '10px',
                cursor:
                  resources.credits >= UNIT_COSTS[type]
                    ? 'pointer'
                    : 'not-allowed',
                fontFamily: '"Courier New", monospace',
                letterSpacing: '1px',
              }}
            >
              [{key}] {label}
              <br />
              <span style={{ fontSize: '9px', color: '#4a6a7a' }}>
                ⚡{UNIT_COSTS[type]}
              </span>
            </button>
          ))}
        </div>
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
                gap: '10px',
              }}
            >
              <span>{unit.type.toUpperCase()}</span>
              <span>
                HP: {unit.health}/{unit.maxHealth}
              </span>
              <span style={{ color: '#4a6a7a' }}>
                DMG: {unit.damage}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Controls help - moved to not overlap minimap */}
      <div
        style={{
          position: 'absolute',
          bottom: '180px',
          right: '20px',
          fontSize: '10px',
          color: '#3a5a6a',
          textAlign: 'right',
          lineHeight: '1.6',
        }}
      >
        {cameraMode === 'first-person' ? (
          <>
            <div>CLICK TO LOOK AROUND</div>
            <div>WASD - Move (Camera Relative)</div>
            <div>R - Run | SPACE - Jump</div>
            <div>ESC - Release Mouse</div>
            <div>P - Pause | 1/2/3 - Camera</div>
          </>
        ) : cameraMode === 'third-person' ? (
          <>
            <div>WASD - Move (Camera Relative)</div>
            <div>R - Run | SPACE - Jump</div>
            <div>SCROLL - Zoom</div>
            <div>MIDDLE/RIGHT MOUSE - Rotate</div>
            <div>Q/W/E - Produce Units</div>
            <div>P - Pause | 1/2/3 - Camera</div>
          </>
        ) : (
          <>
            <div>LEFT CLICK - Select Unit</div>
            <div>SHIFT+CLICK - Multi Select</div>
            <div>RIGHT CLICK - Move Units</div>
            <div>SCROLL - Zoom</div>
            <div>MIDDLE MOUSE - Rotate</div>
            <div>WASD - Move Player</div>
            <div>Q/W/E - Produce Units</div>
            <div>P - Pause | 1/2/3 - Camera</div>
          </>
        )}
      </div>

      {/* Pause overlay */}
      {isPaused && gameStatus === 'playing' && (
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

      {/* Game Over overlay */}
      {gameStatus !== 'playing' && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.7)',
            pointerEvents: 'auto',
          }}
        >
          <div
            style={{
              fontSize: '56px',
              fontWeight: 'bold',
              letterSpacing: '10px',
              color: gameStatus === 'won' ? '#00ffcc' : '#ff4400',
              textShadow: `0 0 30px ${gameStatus === 'won' ? 'rgba(0,255,204,0.5)' : 'rgba(255,68,0,0.5)'}`,
              marginBottom: '20px',
            }}
          >
            {gameStatus === 'won' ? 'VICTORY' : 'DEFEATED'}
          </div>
          <div style={{ fontSize: '14px', color: '#4a6a7a', marginBottom: '30px' }}>
            Time: {formatTime(gameTime)}
          </div>
          <button
            onClick={resetGame}
            style={{
              background: 'rgba(0,255,204,0.2)',
              border: '1px solid #00ffcc',
              color: '#00ffcc',
              padding: '12px 30px',
              fontSize: '16px',
              cursor: 'pointer',
              fontFamily: '"Courier New", monospace',
              letterSpacing: '3px',
            }}
          >
            [R] PLAY AGAIN
          </button>
        </div>
      )}
    </div>
  );
}
