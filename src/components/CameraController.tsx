import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Vector3, PerspectiveCamera, Euler } from 'three';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useGameStore } from '../store/gameStore';
import type { CameraMode } from '../types/game';

const CAMERA_CONFIGS: Record<CameraMode, { position: Vector3; fov: number }> = {
  'first-person': { position: new Vector3(0, 1.6, 0), fov: 75 },
  'third-person': { position: new Vector3(0, 8, 12), fov: 60 },
  'top-down': { position: new Vector3(0, 30, 0.1), fov: 50 },
};

const THIRD_PERSON_OFFSET_Y = 8;
const THIRD_PERSON_OFFSET_DIST = 12;
const THIRD_PERSON_TARGET_SMOOTHNESS = 0.1;
const THIRD_PERSON_CAMERA_SMOOTHNESS = 0.05;

const FIRST_PERSON_SENSITIVITY = 0.002;

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
  const fpEulerRef = useRef(new Euler(0, 0, 0, 'YXZ'));
  const isPointerLockedRef = useRef(false);

  // First-person mouse look via pointer lock
  useEffect(() => {
    if (cameraMode !== 'first-person') {
      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
      isPointerLockedRef.current = false;
      return;
    }

    const canvas = threeState.gl.domElement;

    const handleClick = () => {
      if (cameraMode === 'first-person' && !document.pointerLockElement) {
        canvas.requestPointerLock();
      }
    };

    const handlePointerLockChange = () => {
      isPointerLockedRef.current = document.pointerLockElement === canvas;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isPointerLockedRef.current) return;

      fpEulerRef.current.y += e.movementX * FIRST_PERSON_SENSITIVITY;
      fpEulerRef.current.x -= e.movementY * FIRST_PERSON_SENSITIVITY;

      // Clamp vertical look to avoid flipping
      fpEulerRef.current.x = Math.max(
        -Math.PI / 2 + 0.01,
        Math.min(Math.PI / 2 - 0.01, fpEulerRef.current.x)
      );
    };

    canvas.addEventListener('click', handleClick);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      canvas.removeEventListener('click', handleClick);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      document.removeEventListener('mousemove', handleMouseMove);
      if (document.pointerLockElement === canvas) {
        document.exitPointerLock();
      }
    };
  }, [cameraMode, threeState.gl.domElement]);

  useEffect(() => {
    const cam = threeState.camera;
    const config = CAMERA_CONFIGS[cameraMode];
    if (cam instanceof PerspectiveCamera) {
      applyCameraConfig(cam, config);
    }

    if (cameraMode === 'first-person') {
      // Reset first-person euler to default forward (-Z direction)
      fpEulerRef.current.set(0, 0, 0, 'YXZ');
    }

    if (controlsRef.current) {
      // Initialize controls target to player position for third-person
      if (cameraMode === 'third-person') {
        controlsRef.current.target.set(player.position[0], player.position[1], player.position[2]);
      } else if (cameraMode === 'top-down') {
        controlsRef.current.target.set(0, 0, 0);
      }
      controlsRef.current.update();
    }
  }, [cameraMode, threeState.camera, player.position]);

  useFrame(() => {
    const playerPos = player.position;

    if (cameraMode === 'first-person') {
      // First-person: position at player eye level, rotation from mouse look
      const cam = threeState.camera;
      cam.position.set(playerPos[0], playerPos[1] + 1.6, playerPos[2]);
      cam.rotation.copy(fpEulerRef.current);
    } else if (cameraMode === 'third-person') {
      // Third-person: smoothly follow player, camera behind player based on rotation
      targetRef.current.set(playerPos[0], playerPos[1], playerPos[2]);

      const cam = threeState.camera;
      if (controlsRef.current) {
        controlsRef.current.target.lerp(targetRef.current, THIRD_PERSON_TARGET_SMOOTHNESS);

        // Position camera behind player using player's Y-axis rotation (radians)
        const rot = player.rotation;
        targetCameraPosRef.current.set(
          playerPos[0] - Math.sin(rot) * THIRD_PERSON_OFFSET_DIST,
          playerPos[1] + THIRD_PERSON_OFFSET_Y,
          playerPos[2] - Math.cos(rot) * THIRD_PERSON_OFFSET_DIST
        );
        cam.position.lerp(targetCameraPosRef.current, THIRD_PERSON_CAMERA_SMOOTHNESS);
      }
    }
    // Top-down: no player following needed
  });

  // In first-person, we don't use OrbitControls - mouse look is handled via pointer lock
  if (cameraMode === 'first-person') {
    return null;
  }

  const orbitProps =
    cameraMode === 'top-down'
      ? {
          enableRotate: false,
          minDistance: 10,
          maxDistance: 60,
          minPolarAngle: 0,
          maxPolarAngle: 0.1,
        }
      : {
          enableRotate: true,
          minDistance: 5,
          maxDistance: 25,
          minPolarAngle: 0.2,
          maxPolarAngle: Math.PI / 2.5,
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
