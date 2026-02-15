import { useRef, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Mesh, Vector3 } from 'three';
import { useGameStore } from '../store/gameStore';

const WALK_SPEED = 5;
const RUN_SPEED = 10;
const JUMP_FORCE = 8;
const GRAVITY = -20;
const GROUND_Y = 0.5;

export function Player() {
  const ref = useRef<Mesh>(null);
  const player = useGameStore((s) => s.player);
  const cameraMode = useGameStore((s) => s.cameraMode);
  const updatePlayer = useGameStore((s) => s.updatePlayer);
  const { camera } = useThree();
  const velocityRef = useRef(new Vector3(0, 0, 0));
  const lerpTarget = useRef(new Vector3(0, 0, 0));
  const forwardRef = useRef(new Vector3());
  const rightRef = useRef(new Vector3());
  const keysPressedRef = useRef(new Set<string>());

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    keysPressedRef.current.add(e.code);
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    keysPressedRef.current.delete(e.code);
  }, []);

  useEffect(() => {
    const keys = keysPressedRef.current;
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      keys.clear();
    };
  }, [handleKeyDown, handleKeyUp]);

  useFrame((_, delta) => {
    const keysPressed = keysPressedRef.current;
    const clampedDelta = Math.min(delta, 0.05);

    const isRunning = keysPressed.has('KeyR');
    const speed = isRunning ? RUN_SPEED : WALK_SPEED;

    // Raw input axes
    let inputX = 0;
    let inputZ = 0;
    if (keysPressed.has('KeyW') || keysPressed.has('ArrowUp')) inputZ += 1;
    if (keysPressed.has('KeyS') || keysPressed.has('ArrowDown')) inputZ -= 1;
    if (keysPressed.has('KeyA') || keysPressed.has('ArrowLeft')) inputX -= 1;
    if (keysPressed.has('KeyD') || keysPressed.has('ArrowRight')) inputX += 1;

    // Normalize diagonal input
    const inputLen = Math.sqrt(inputX * inputX + inputZ * inputZ);

    let dx = 0;
    let dz = 0;

    if (inputLen > 0) {
      const normX = inputX / inputLen;
      const normZ = inputZ / inputLen;

      if (cameraMode === 'first-person' || cameraMode === 'third-person') {
        // Camera-relative movement: transform input based on camera's horizontal facing
        // Get camera forward direction projected onto XZ plane
        camera.getWorldDirection(forwardRef.current);
        forwardRef.current.y = 0;
        forwardRef.current.normalize();

        // Right vector is perpendicular to forward on XZ plane
        rightRef.current.set(-forwardRef.current.z, 0, forwardRef.current.x);

        // Combine: W/S maps to forward/back along camera direction
        // A/D maps to strafe left/right perpendicular to camera direction
        dx = (rightRef.current.x * normX + forwardRef.current.x * normZ) * speed;
        dz = (rightRef.current.z * normX + forwardRef.current.z * normZ) * speed;
      } else {
        // Top-down: world-axis-aligned movement (negate Z so W=up moves toward -Z on screen)
        dx = normX * speed;
        dz = -normZ * speed;
      }
    }

    // Jump
    const isGrounded = player.position[1] <= GROUND_Y;
    if (keysPressed.has('Space') && isGrounded) {
      velocityRef.current.y = JUMP_FORCE;
    }

    // Apply gravity
    velocityRef.current.y += GRAVITY * clampedDelta;

    // Calculate new position
    const newX = player.position[0] + dx * clampedDelta;
    let newY = player.position[1] + velocityRef.current.y * clampedDelta;
    const newZ = player.position[2] + dz * clampedDelta;

    // Ground collision
    if (newY <= GROUND_Y) {
      newY = GROUND_Y;
      velocityRef.current.y = 0;
    }

    const newGrounded = newY <= GROUND_Y;
    const isJumping = !newGrounded;

    // Clamp to terrain boundaries
    const clampedX = Math.max(-48, Math.min(48, newX));
    const clampedZ = Math.max(-48, Math.min(48, newZ));

    // Calculate player rotation from movement direction (for third-person facing)
    let rotation = player.rotation;
    if (inputLen > 0 && cameraMode === 'third-person') {
      rotation = Math.atan2(dx, dz);
    }

    updatePlayer({
      position: [clampedX, newY, clampedZ],
      velocity: [dx, velocityRef.current.y, dz],
      rotation,
      isRunning,
      isJumping,
      isGrounded: newGrounded,
    });

    // Smoothly interpolate mesh position and rotation
    if (ref.current) {
      lerpTarget.current.set(clampedX, newY, clampedZ);
      ref.current.position.lerp(lerpTarget.current, 0.3);

      if (cameraMode === 'third-person') {
        // Smoothly rotate mesh to face movement direction
        const angleDiff = rotation - ref.current.rotation.y;
        const wrappedDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
        ref.current.rotation.y += wrappedDiff * 0.15;
      }
    }
  });

  // Hide player mesh in first-person mode (camera is at eye level)
  const isVisible = cameraMode !== 'first-person';

  return (
    <group>
      {/* Player body */}
      <mesh ref={ref} position={player.position} castShadow visible={isVisible}>
        <capsuleGeometry args={[0.3, 0.8, 4, 16]} />
        <meshStandardMaterial
          color={player.isRunning ? '#ff8800' : '#00ffcc'}
          emissive={player.isRunning ? '#ff4400' : '#00ffcc'}
          emissiveIntensity={0.3}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>

      {/* Player indicator light */}
      <pointLight
        position={[player.position[0], player.position[1] + 1.5, player.position[2]]}
        intensity={1}
        color={player.isRunning ? '#ff8800' : '#00ffcc'}
        distance={8}
      />
    </group>
  );
}
