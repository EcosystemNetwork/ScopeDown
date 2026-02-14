import { memo } from 'react';
import { useGameStore } from '../store/gameStore';
import type { Building } from '../types/game';

const BUILDING_CONFIGS: Record<
  Building['type'],
  { size: [number, number, number]; color: string; emissive: string }
> = {
  base: { size: [3, 2, 3], color: '#446688', emissive: '#0044ff' },
  barracks: { size: [2, 1.5, 2], color: '#448844', emissive: '#00ff44' },
  factory: { size: [2.5, 1.8, 3], color: '#886644', emissive: '#ff8800' },
  'power-plant': { size: [1.5, 2.5, 1.5], color: '#664488', emissive: '#8800ff' },
  refinery: { size: [2.5, 1.2, 2.5], color: '#888844', emissive: '#ffff00' },
};

const BuildingMesh = memo(function BuildingMesh({ building }: { building: Building }) {
  const config = BUILDING_CONFIGS[building.type];
  const teamColor = building.team === 'player' ? config.color : '#882222';
  const teamEmissive = building.team === 'player' ? config.emissive : '#ff0000';

  return (
    <group position={building.position}>
      {/* Main structure */}
      <mesh position={[0, config.size[1] / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={config.size} />
        <meshStandardMaterial
          color={teamColor}
          emissive={teamEmissive}
          emissiveIntensity={0.15}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>

      {/* Building base platform */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[config.size[0] + 0.5, 0.1, config.size[2] + 0.5]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Antenna/beacon on top */}
      <mesh position={[0, config.size[1] + 0.3, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.6, 8]} />
        <meshStandardMaterial color="#aaaaaa" metalness={0.9} />
      </mesh>
      <pointLight
        position={[0, config.size[1] + 0.7, 0]}
        intensity={0.5}
        color={teamEmissive}
        distance={5}
      />

      {/* Health bar */}
      <group position={[0, config.size[1] + 1, 0]}>
        <mesh>
          <planeGeometry args={[config.size[0], 0.15]} />
          <meshBasicMaterial color="#333333" />
        </mesh>
        <mesh
          position={[
            ((building.health / building.maxHealth - 1) * config.size[0]) / 2,
            0,
            0.001,
          ]}
        >
          <planeGeometry
            args={[config.size[0] * (building.health / building.maxHealth), 0.15]}
          />
          <meshBasicMaterial
            color={
              building.health / building.maxHealth > 0.5 ? '#00ff00' : '#ff4400'
            }
          />
        </mesh>
      </group>
    </group>
  );
});

export function Buildings() {
  const buildings = useGameStore((s) => s.buildings);

  return (
    <group>
      {buildings.map((b) => (
        <BuildingMesh key={b.id} building={b} />
      ))}
    </group>
  );
}
