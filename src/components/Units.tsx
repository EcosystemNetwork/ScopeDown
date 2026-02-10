import { useRef, useCallback } from 'react';
import { Mesh, Vector3 } from 'three';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { useGameStore } from '../store/gameStore';
import type { Unit } from '../types/game';

const UNIT_COLORS: Record<Unit['type'], string> = {
  soldier: '#00aaff',
  tank: '#44cc44',
  mech: '#ff8800',
  harvester: '#ffcc00',
};

const ENEMY_COLORS: Record<Unit['type'], string> = {
  soldier: '#ff2222',
  tank: '#cc4444',
  mech: '#ff4400',
  harvester: '#cc8800',
};

const UNIT_SIZES: Record<Unit['type'], [number, number, number]> = {
  soldier: [0.3, 0.8, 0.3],
  tank: [0.8, 0.4, 1.2],
  mech: [0.6, 1.2, 0.6],
  harvester: [1, 0.6, 1],
};

function UnitMesh({ unit }: { unit: Unit }) {
  const ref = useRef<Mesh>(null);
  const selectUnits = useGameStore((s) => s.selectUnits);
  const selectedUnitIds = useGameStore((s) => s.selectedUnitIds);
  const targetPos = useRef(new Vector3(...unit.position));

  useFrame(() => {
    if (ref.current) {
      targetPos.current.set(...unit.position);
      ref.current.position.lerp(targetPos.current, 0.1);

      // Bobbing animation for selected units
      if (unit.selected) {
        ref.current.position.y += Math.sin(Date.now() * 0.005) * 0.05;
      }
    }
  });

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      if (unit.team !== 'player') return;
      if (e.nativeEvent.shiftKey) {
        const newIds = selectedUnitIds.includes(unit.id)
          ? selectedUnitIds.filter((id) => id !== unit.id)
          : [...selectedUnitIds, unit.id];
        selectUnits(newIds);
      } else {
        selectUnits([unit.id]);
      }
    },
    [unit.id, unit.team, selectedUnitIds, selectUnits]
  );

  const color =
    unit.team === 'player'
      ? UNIT_COLORS[unit.type]
      : ENEMY_COLORS[unit.type];
  const size = UNIT_SIZES[unit.type];

  return (
    <group>
      <mesh
        ref={ref}
        position={unit.position}
        onClick={handleClick}
        castShadow
      >
        <boxGeometry args={size} />
        <meshStandardMaterial
          color={color}
          emissive={unit.selected ? '#ffffff' : color}
          emissiveIntensity={unit.selected ? 0.3 : 0.1}
        />
      </mesh>

      {/* Health bar */}
      {unit.team === 'player' && (
        <group position={[unit.position[0], unit.position[1] + size[1] + 0.3, unit.position[2]]}>
          <mesh>
            <planeGeometry args={[0.8, 0.08]} />
            <meshBasicMaterial color="#333333" />
          </mesh>
          <mesh position={[(unit.health / unit.maxHealth - 1) * 0.4, 0, 0.001]}>
            <planeGeometry args={[0.8 * (unit.health / unit.maxHealth), 0.08]} />
            <meshBasicMaterial
              color={unit.health / unit.maxHealth > 0.5 ? '#00ff00' : '#ff4400'}
            />
          </mesh>
        </group>
      )}

      {/* Selection ring */}
      {unit.selected && (
        <mesh
          position={[unit.position[0], 0.05, unit.position[2]]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.6, 0.7, 32]} />
          <meshBasicMaterial color="#00ffaa" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

export function Units() {
  const units = useGameStore((s) => s.units);

  return (
    <group>
      {units.map((unit) => (
        <UnitMesh key={unit.id} unit={unit} />
      ))}
    </group>
  );
}
