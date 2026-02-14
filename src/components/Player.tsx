import { useRef, useEffect, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
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
  const updatePlayer = useGameStore((s) => s.updatePlayer);
  const velocityRef = useRef(new Vector3(0, 0, 0));
  const lerpTarget = useRef(new Vector3(0, 0, 0));
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

    // Directional movement
    let dx = 0;
    let dz = 0;
    if (keysPressed.has('KeyW') || keysPressed.has('ArrowUp')) dz -= 1;
    if (keysPressed.has('KeyS') || keysPressed.has('ArrowDown')) dz += 1;
    if (keysPressed.has('KeyA') || keysPressed.has('ArrowLeft')) dx -= 1;
    if (keysPressed.has('KeyD') || keysPressed.has('ArrowRight')) dx += 1;

    // Normalize diagonal movement
    const len = Math.sqrt(dx * dx + dz * dz);
    if (len > 0) {
      dx = (dx / len) * speed;
      dz = (dz / len) * speed;
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

    updatePlayer({
      position: [clampedX, newY, clampedZ],
      velocity: [dx, velocityRef.current.y, dz],
      isRunning,
      isJumping,
      isGrounded: newGrounded,
    });

    // Smoothly interpolate mesh position
    if (ref.current) {
      lerpTarget.current.set(clampedX, newY, clampedZ);
      ref.current.position.lerp(lerpTarget.current, 0.3);
    }
  });

  return (
    <group>
      {/* Player body */}
      <mesh ref={ref} position={player.position} castShadow>
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
