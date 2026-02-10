import { useGameStore } from '../store/gameStore';

const MINIMAP_SIZE = 150;
const MAP_RANGE = 50; // world units covered by minimap

function worldToMinimap(
  x: number,
  z: number
): { left: number; top: number } {
  return {
    left: ((x + MAP_RANGE / 2) / MAP_RANGE) * MINIMAP_SIZE,
    top: ((z + MAP_RANGE / 2) / MAP_RANGE) * MINIMAP_SIZE,
  };
}

export function Minimap() {
  const units = useGameStore((s) => s.units);
  const buildings = useGameStore((s) => s.buildings);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        width: MINIMAP_SIZE,
        height: MINIMAP_SIZE,
        background: 'rgba(0,10,20,0.9)',
        border: '1px solid #1a3a4a',
        overflow: 'hidden',
      }}
    >
      {/* Grid overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(26,58,74,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(26,58,74,0.3) 1px, transparent 1px)',
          backgroundSize: `${MINIMAP_SIZE / 10}px ${MINIMAP_SIZE / 10}px`,
        }}
      />

      {/* Buildings */}
      {buildings.map((b) => {
        const pos = worldToMinimap(b.position[0], b.position[2]);
        return (
          <div
            key={b.id}
            style={{
              position: 'absolute',
              left: pos.left - 3,
              top: pos.top - 3,
              width: 6,
              height: 6,
              background: b.team === 'player' ? '#0088ff' : '#ff2222',
              border: '1px solid rgba(255,255,255,0.3)',
            }}
          />
        );
      })}

      {/* Units */}
      {units.map((u) => {
        const pos = worldToMinimap(u.position[0], u.position[2]);
        return (
          <div
            key={u.id}
            style={{
              position: 'absolute',
              left: pos.left - 2,
              top: pos.top - 2,
              width: 4,
              height: 4,
              borderRadius: '50%',
              background:
                u.team === 'player'
                  ? u.selected
                    ? '#00ffcc'
                    : '#00aaff'
                  : '#ff4444',
            }}
          />
        );
      })}

      {/* Label */}
      <div
        style={{
          position: 'absolute',
          top: 2,
          left: 4,
          fontSize: '8px',
          color: '#3a5a6a',
          fontFamily: '"Courier New", monospace',
          letterSpacing: '1px',
        }}
      >
        RADAR
      </div>
    </div>
  );
}
