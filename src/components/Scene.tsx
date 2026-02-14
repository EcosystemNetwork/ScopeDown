import { useFrame } from '@react-three/fiber';
import { CameraController } from './CameraController';
import { Terrain } from './Terrain';
import { Units } from './Units';
import { Buildings } from './Buildings';
import { SelectionBox } from './SelectionBox';
import { Player } from './Player';
import { useGameStore } from '../store/gameStore';

export function Scene() {
  const tick = useGameStore((s) => s.tick);

  useFrame((_, delta) => {
    tick(delta);
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[20, 30, 10]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={100}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />
      <fog attach="fog" args={['#0a0a1a', 30, 80]} />

      <CameraController />
      <Terrain />
      <Player />
      <Units />
      <Buildings />
      <SelectionBox />
    </>
  );
}
