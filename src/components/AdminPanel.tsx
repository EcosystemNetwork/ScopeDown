import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import type { UnitType } from '../types/game';

const panelStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  right: 0,
  width: '340px',
  height: '100vh',
  background: 'rgba(0,10,20,0.95)',
  border: '1px solid #1a3a4a',
  color: '#00ffcc',
  fontFamily: '"Courier New", monospace',
  fontSize: '11px',
  overflowY: 'auto',
  pointerEvents: 'auto',
  zIndex: 1000,
};

const sectionStyle: React.CSSProperties = {
  padding: '10px',
  borderBottom: '1px solid #1a3a4a',
};

const headerStyle: React.CSSProperties = {
  fontSize: '10px',
  letterSpacing: '2px',
  color: '#4a6a7a',
  marginBottom: '8px',
  textTransform: 'uppercase',
};

const inputStyle: React.CSSProperties = {
  background: 'rgba(0,20,40,0.8)',
  border: '1px solid #1a3a4a',
  color: '#00ffcc',
  padding: '4px 8px',
  fontSize: '11px',
  fontFamily: '"Courier New", monospace',
  width: '80px',
};

const buttonStyle: React.CSSProperties = {
  background: 'rgba(0,255,204,0.15)',
  border: '1px solid #1a3a4a',
  color: '#00ffcc',
  padding: '4px 10px',
  fontSize: '10px',
  cursor: 'pointer',
  fontFamily: '"Courier New", monospace',
  letterSpacing: '1px',
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '3px 0',
};

export function AdminPanel() {
  const showAdminPanel = useGameStore((s) => s.showAdminPanel);
  const units = useGameStore((s) => s.units);
  const buildings = useGameStore((s) => s.buildings);
  const resources = useGameStore((s) => s.resources);
  const player = useGameStore((s) => s.player);
  const gameStatus = useGameStore((s) => s.gameStatus);
  const gameTime = useGameStore((s) => s.gameTime);
  const isPaused = useGameStore((s) => s.isPaused);
  const cameraMode = useGameStore((s) => s.cameraMode);
  const toggleAdminPanel = useGameStore((s) => s.toggleAdminPanel);
  const setResources = useGameStore((s) => s.setResources);
  const setGameStatus = useGameStore((s) => s.setGameStatus);
  const updateUnit = useGameStore((s) => s.updateUnit);
  const updateBuilding = useGameStore((s) => s.updateBuilding);
  const updatePlayer = useGameStore((s) => s.updatePlayer);
  const togglePause = useGameStore((s) => s.togglePause);
  const removeUnit = useGameStore((s) => s.removeUnit);
  const produceUnit = useGameStore((s) => s.produceUnit);

  const [creditsInput, setCreditsInput] = useState('');
  const [powerInput, setPowerInput] = useState('');
  const [maxPowerInput, setMaxPowerInput] = useState('');

  if (!showAdminPanel) return null;

  const playerUnits = units.filter((u) => u.team === 'player');
  const enemyUnits = units.filter((u) => u.team === 'enemy');
  const playerBuildings = buildings.filter((b) => b.team === 'player');
  const enemyBuildings = buildings.filter((b) => b.team === 'enemy');

  const formatTime = (t: number) => {
    const mins = Math.floor(t / 60);
    const secs = Math.floor(t % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={panelStyle} data-testid="admin-panel">
      {/* Header */}
      <div
        style={{
          ...sectionStyle,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: '14px', letterSpacing: '3px', fontWeight: 'bold' }}>
          ⚙ ADMIN PANEL
        </span>
        <button onClick={toggleAdminPanel} style={buttonStyle}>
          ✕ CLOSE
        </button>
      </div>

      {/* Game Overview */}
      <div style={sectionStyle}>
        <div style={headerStyle}>GAME STATUS</div>
        <div style={rowStyle}>
          <span>Status:</span>
          <span style={{ color: gameStatus === 'playing' ? '#00ffcc' : gameStatus === 'won' ? '#00ff00' : '#ff4400' }}>
            {gameStatus.toUpperCase()}
          </span>
        </div>
        <div style={rowStyle}>
          <span>Time:</span>
          <span>{formatTime(gameTime)}</span>
        </div>
        <div style={rowStyle}>
          <span>Paused:</span>
          <span>{isPaused ? 'YES' : 'NO'}</span>
        </div>
        <div style={rowStyle}>
          <span>Camera:</span>
          <span>{cameraMode.toUpperCase()}</span>
        </div>
        <div style={{ display: 'flex', gap: '5px', marginTop: '6px', flexWrap: 'wrap' }}>
          <button onClick={togglePause} style={buttonStyle}>
            {isPaused ? '▶ RESUME' : '⏸ PAUSE'}
          </button>
          <button onClick={() => setGameStatus('playing')} style={buttonStyle}>
            SET PLAYING
          </button>
          <button onClick={() => setGameStatus('won')} style={{ ...buttonStyle, color: '#00ff00', borderColor: '#00ff00' }}>
            SET WON
          </button>
          <button onClick={() => setGameStatus('lost')} style={{ ...buttonStyle, color: '#ff4400', borderColor: '#ff4400' }}>
            SET LOST
          </button>
        </div>
      </div>

      {/* Resources */}
      <div style={sectionStyle}>
        <div style={headerStyle}>RESOURCES</div>
        <div style={rowStyle}>
          <span>⚡ Credits: {resources.credits}</span>
          <div style={{ display: 'flex', gap: '4px' }}>
            <input
              style={inputStyle}
              type="number"
              placeholder="amount"
              value={creditsInput}
              onChange={(e) => setCreditsInput(e.target.value)}
            />
            <button
              onClick={() => {
                const val = parseInt(creditsInput);
                if (!isNaN(val) && val >= 0) setResources({ credits: val });
                setCreditsInput('');
              }}
              style={buttonStyle}
            >
              SET
            </button>
          </div>
        </div>
        <div style={rowStyle}>
          <span>🔋 Power: {resources.power}/{resources.maxPower}</span>
          <div style={{ display: 'flex', gap: '4px' }}>
            <input
              style={{ ...inputStyle, width: '50px' }}
              type="number"
              placeholder="pwr"
              value={powerInput}
              onChange={(e) => setPowerInput(e.target.value)}
            />
            <input
              style={{ ...inputStyle, width: '50px' }}
              type="number"
              placeholder="max"
              value={maxPowerInput}
              onChange={(e) => setMaxPowerInput(e.target.value)}
            />
            <button
              onClick={() => {
                const p = parseInt(powerInput);
                const mp = parseInt(maxPowerInput);
                const update: Partial<{ power: number; maxPower: number }> = {};
                if (!isNaN(p) && p >= 0) update.power = p;
                if (!isNaN(mp) && mp >= 0) update.maxPower = mp;
                if (Object.keys(update).length > 0) setResources(update);
                setPowerInput('');
                setMaxPowerInput('');
              }}
              style={buttonStyle}
            >
              SET
            </button>
          </div>
        </div>
      </div>

      {/* Player */}
      <div style={sectionStyle}>
        <div style={headerStyle}>PLAYER</div>
        <div style={rowStyle}>
          <span>Position:</span>
          <span style={{ fontSize: '10px' }}>
            [{player.position[0].toFixed(1)}, {player.position[1].toFixed(1)}, {player.position[2].toFixed(1)}]
          </span>
        </div>
        <div style={rowStyle}>
          <span>Running: {player.isRunning ? 'YES' : 'NO'}</span>
          <span>Grounded: {player.isGrounded ? 'YES' : 'NO'}</span>
        </div>
        <div style={{ display: 'flex', gap: '5px', marginTop: '6px' }}>
          <button
            onClick={() => updatePlayer({ position: [0, 0.5, 5] })}
            style={buttonStyle}
          >
            RESET POS
          </button>
        </div>
      </div>

      {/* Spawn Units */}
      <div style={sectionStyle}>
        <div style={headerStyle}>SPAWN UNITS</div>
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          {(['soldier', 'tank', 'mech', 'harvester'] as UnitType[]).map((type) => (
            <button key={type} onClick={() => produceUnit(type)} style={buttonStyle}>
              + {type.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Units List */}
      <div style={sectionStyle}>
        <div style={headerStyle}>
          PLAYER UNITS ({playerUnits.length})
        </div>
        {playerUnits.map((unit) => (
          <div key={unit.id} style={{ ...rowStyle, flexWrap: 'wrap', gap: '4px', borderBottom: '1px solid rgba(26,58,74,0.3)', paddingBottom: '4px', marginBottom: '4px' }}>
            <span style={{ minWidth: '60px' }}>{unit.type.toUpperCase()}</span>
            <span style={{ fontSize: '10px' }}>
              HP: {unit.health}/{unit.maxHealth}
            </span>
            <div style={{ display: 'flex', gap: '3px' }}>
              <button
                onClick={() => updateUnit(unit.id, { health: unit.maxHealth })}
                style={{ ...buttonStyle, fontSize: '9px', padding: '2px 6px' }}
              >
                HEAL
              </button>
              <button
                onClick={() => removeUnit(unit.id)}
                style={{ ...buttonStyle, fontSize: '9px', padding: '2px 6px', color: '#ff4400', borderColor: '#ff4400' }}
              >
                DEL
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={sectionStyle}>
        <div style={headerStyle}>
          ENEMY UNITS ({enemyUnits.length})
        </div>
        {enemyUnits.map((unit) => (
          <div key={unit.id} style={{ ...rowStyle, flexWrap: 'wrap', gap: '4px', borderBottom: '1px solid rgba(26,58,74,0.3)', paddingBottom: '4px', marginBottom: '4px' }}>
            <span style={{ minWidth: '60px', color: '#ff6644' }}>{unit.type.toUpperCase()}</span>
            <span style={{ fontSize: '10px' }}>
              HP: {unit.health}/{unit.maxHealth}
            </span>
            <div style={{ display: 'flex', gap: '3px' }}>
              <button
                onClick={() => updateUnit(unit.id, { health: unit.maxHealth })}
                style={{ ...buttonStyle, fontSize: '9px', padding: '2px 6px' }}
              >
                HEAL
              </button>
              <button
                onClick={() => updateUnit(unit.id, { health: 0 })}
                style={{ ...buttonStyle, fontSize: '9px', padding: '2px 6px', color: '#ff4400', borderColor: '#ff4400' }}
              >
                KILL
              </button>
              <button
                onClick={() => removeUnit(unit.id)}
                style={{ ...buttonStyle, fontSize: '9px', padding: '2px 6px', color: '#ff4400', borderColor: '#ff4400' }}
              >
                DEL
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Buildings */}
      <div style={sectionStyle}>
        <div style={headerStyle}>
          BUILDINGS ({buildings.length})
        </div>
        {[...playerBuildings, ...enemyBuildings].map((building) => (
          <div key={building.id} style={{ ...rowStyle, flexWrap: 'wrap', gap: '4px', borderBottom: '1px solid rgba(26,58,74,0.3)', paddingBottom: '4px', marginBottom: '4px' }}>
            <span style={{ minWidth: '80px', color: building.team === 'player' ? '#00ffcc' : '#ff6644' }}>
              {building.type.toUpperCase()}
            </span>
            <span style={{ fontSize: '10px' }}>
              HP: {building.health}/{building.maxHealth}
            </span>
            <div style={{ display: 'flex', gap: '3px' }}>
              <button
                onClick={() => updateBuilding(building.id, { health: building.maxHealth })}
                style={{ ...buttonStyle, fontSize: '9px', padding: '2px 6px' }}
              >
                REPAIR
              </button>
              <button
                onClick={() => updateBuilding(building.id, { health: 0 })}
                style={{ ...buttonStyle, fontSize: '9px', padding: '2px 6px', color: '#ff4400', borderColor: '#ff4400' }}
              >
                DESTROY
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
