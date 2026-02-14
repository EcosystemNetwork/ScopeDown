import { memo, useRef } from 'react';
import { Mesh, DoubleSide } from 'three';
import { useFrame } from '@react-three/fiber';

function GridFloor() {
  return (
    <gridHelper args={[100, 100, '#1a3a4a', '#0d2030']} position={[0, 0.01, 0]} />
  );
}

const TerrainDecoration = memo(function TerrainDecoration({ position }: { position: [number, number, number] }) {
  const ref = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <mesh ref={ref} position={position}>
      <octahedronGeometry args={[0.3, 0]} />
      <meshStandardMaterial
        color="#00ffcc"
        emissive="#00ffcc"
        emissiveIntensity={0.5}
        transparent
        opacity={0.7}
      />
    </mesh>
  );
});

const decorations: [number, number, number][] = [
  [10, 0.3, 10],
  [-12, 0.3, 8],
  [15, 0.3, -5],
  [-8, 0.3, -12],
  [20, 0.3, 20],
  [-20, 0.3, 15],
  [5, 0.3, -18],
  [-15, 0.3, -20],
];

export function Terrain() {
  return (
    <group>
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#0a1628" side={DoubleSide} />
      </mesh>

      <GridFloor />

      {/* Sci-fi decorative crystals */}
      {decorations.map((pos, i) => (
        <TerrainDecoration key={i} position={pos} />
      ))}

      {/* Ambient light pillars */}
      <pointLight position={[15, 5, 15]} intensity={2} color="#0088ff" distance={20} />
      <pointLight position={[-15, 5, -15]} intensity={2} color="#ff4400" distance={20} />
      <pointLight position={[15, 5, -15]} intensity={1} color="#00ff88" distance={15} />
      <pointLight position={[-15, 5, 15]} intensity={1} color="#8800ff" distance={15} />
    </group>
  );
}
