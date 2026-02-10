import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Vector3, PerspectiveCamera } from 'three';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useGameStore } from '../store/gameStore';
import type { CameraMode } from '../types/game';

const CAMERA_CONFIGS: Record<CameraMode, { position: Vector3; fov: number }> = {
  'first-person': { position: new Vector3(0, 1.6, 0), fov: 75 },
  'third-person': { position: new Vector3(0, 8, 12), fov: 60 },
  'top-down': { position: new Vector3(0, 30, 0.1), fov: 50 },
};

function applyCameraConfig(cam: PerspectiveCamera, config: { position: Vector3; fov: number }) {
  cam.position.copy(config.position);
  cam.fov = config.fov;
  cam.updateProjectionMatrix();
}

export function CameraController() {
  const cameraMode = useGameStore((s) => s.cameraMode);
  const selectedUnitIds = useGameStore((s) => s.selectedUnitIds);
  const units = useGameStore((s) => s.units);
  const threeState = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const targetRef = useRef(new Vector3(0, 0, 0));

  useEffect(() => {
    const cam = threeState.camera;
    const config = CAMERA_CONFIGS[cameraMode];
    if (cam instanceof PerspectiveCamera) {
      applyCameraConfig(cam, config);
    }
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  }, [cameraMode, threeState.camera]);

  useFrame(() => {
    if (selectedUnitIds.length > 0 && cameraMode !== 'top-down') {
      const selectedUnits = units.filter((u) => selectedUnitIds.includes(u.id));
      if (selectedUnits.length > 0) {
        const avg = selectedUnits.reduce(
          (acc, u) => {
            acc.x += u.position[0];
            acc.y += u.position[1];
            acc.z += u.position[2];
            return acc;
          },
          { x: 0, y: 0, z: 0 }
        );
        avg.x /= selectedUnits.length;
        avg.y /= selectedUnits.length;
        avg.z /= selectedUnits.length;
        targetRef.current.set(avg.x, avg.y, avg.z);

        const cam = threeState.camera;
        if (cameraMode === 'first-person') {
          cam.position.set(avg.x, avg.y + 1.6, avg.z);
        }
        if (controlsRef.current && cameraMode === 'third-person') {
          controlsRef.current.target.lerp(targetRef.current, 0.05);
        }
      }
    }
  });

  const orbitProps =
    cameraMode === 'top-down'
      ? {
          enableRotate: false,
          minDistance: 10,
          maxDistance: 60,
          minPolarAngle: 0,
          maxPolarAngle: 0.1,
        }
      : cameraMode === 'third-person'
      ? {
          enableRotate: true,
          minDistance: 5,
          maxDistance: 25,
          minPolarAngle: 0.2,
          maxPolarAngle: Math.PI / 2.5,
        }
      : {
          enableRotate: true,
          minDistance: 0,
          maxDistance: 0.1,
          minPolarAngle: 0,
          maxPolarAngle: Math.PI,
        };

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enablePan={cameraMode === 'top-down'}
      enableZoom={true}
      mouseButtons={{
        LEFT: undefined,
        MIDDLE: 2,
        RIGHT: 2,
      }}
      {...orbitProps}
    />
  );
}
