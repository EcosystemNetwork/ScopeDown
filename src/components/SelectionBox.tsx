import { useCallback, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { Raycaster, Vector2, Plane, Vector3 } from 'three';
import { useGameStore } from '../store/gameStore';

const groundPlane = new Plane(new Vector3(0, 1, 0), 0);

export function SelectionBox() {
  const { camera, gl } = useThree();
  const moveSelectedUnits = useGameStore((s) => s.moveSelectedUnits);
  const raycaster = useRef(new Raycaster());
  const mouse = useRef(new Vector2());

  const getGroundPoint = useCallback(
    (event: MouseEvent): [number, number, number] | null => {
      const rect = gl.domElement.getBoundingClientRect();
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.current.setFromCamera(mouse.current, camera);
      const intersection = new Vector3();
      const hit = raycaster.current.ray.intersectPlane(groundPlane, intersection);
      if (hit) {
        return [intersection.x, 0, intersection.z];
      }
      return null;
    },
    [camera, gl]
  );

  const handleContextMenu = useCallback(
    (event: MouseEvent) => {
      event.preventDefault();
      const point = getGroundPoint(event);
      if (point) {
        moveSelectedUnits(point);
      }
    },
    [getGroundPoint, moveSelectedUnits]
  );

  // Attach listeners to the canvas
  useThree(({ gl }) => {
    const canvas = gl.domElement;
    canvas.addEventListener('contextmenu', handleContextMenu);
    return () => {
      canvas.removeEventListener('contextmenu', handleContextMenu);
    };
  });

  return null;
}
