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

const THIRD_PERSON_OFFSET = new Vector3(0, 8, 12);
const THIRD_PERSON_TARGET_SMOOTHNESS = 0.1;
const THIRD_PERSON_CAMERA_SMOOTHNESS = 0.05;

function applyCameraConfig(cam: PerspectiveCamera, config: { position: Vector3; fov: number }) {
  cam.position.copy(config.position);
  cam.fov = config.fov;
  cam.updateProjectionMatrix();
}

export function CameraController() {
  const cameraMode = useGameStore((s) => s.cameraMode);
  const player = useGameStore((s) => s.player);
  const threeState = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const targetRef = useRef(new Vector3(0, 0, 0));
  const targetCameraPosRef = useRef(new Vector3(0, 0, 0));

  useEffect(() => {
    const cam = threeState.camera;
    const config = CAMERA_CONFIGS[cameraMode];
    if (cam instanceof PerspectiveCamera) {
      applyCameraConfig(cam, config);
    }
    if (controlsRef.current) {
      // Initialize controls target to player position for first-person and third-person
      if (cameraMode === 'first-person' || cameraMode === 'third-person') {
        controlsRef.current.target.set(player.position[0], player.position[1], player.position[2]);
      } else {
        controlsRef.current.target.set(0, 0, 0);
      }
      controlsRef.current.update();
    }
  }, [cameraMode, threeState.camera, player.position]);

  useFrame(() => {
    // Follow player position in first-person and third-person modes
    if (cameraMode !== 'top-down') {
      const playerPos = player.position;
      targetRef.current.set(playerPos[0], playerPos[1], playerPos[2]);

      const cam = threeState.camera;
      if (cameraMode === 'first-person') {
        // First-person: camera positioned at player's eye level
        cam.position.set(playerPos[0], playerPos[1] + 1.6, playerPos[2]);
      } else if (cameraMode === 'third-person' && controlsRef.current) {
        // Third-person: smoothly follow player with orbit controls
        controlsRef.current.target.lerp(targetRef.current, THIRD_PERSON_TARGET_SMOOTHNESS);
        
        // Keep camera relative to player position
        targetCameraPosRef.current.set(
          playerPos[0] + THIRD_PERSON_OFFSET.x,
          playerPos[1] + THIRD_PERSON_OFFSET.y,
          playerPos[2] + THIRD_PERSON_OFFSET.z
        );
        cam.position.lerp(targetCameraPosRef.current, THIRD_PERSON_CAMERA_SMOOTHNESS);
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
