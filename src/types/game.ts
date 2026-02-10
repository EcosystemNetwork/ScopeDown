import { Vector3 } from 'three';

export type CameraMode = 'first-person' | 'third-person' | 'top-down';

export interface Unit {
  id: string;
  position: [number, number, number];
  type: 'soldier' | 'tank' | 'mech' | 'harvester';
  health: number;
  maxHealth: number;
  speed: number;
  selected: boolean;
  targetPosition: [number, number, number] | null;
  team: 'player' | 'enemy';
}

export interface Building {
  id: string;
  position: [number, number, number];
  type: 'base' | 'barracks' | 'factory' | 'power-plant' | 'refinery';
  health: number;
  maxHealth: number;
  team: 'player' | 'enemy';
}

export interface GameResources {
  credits: number;
  power: number;
  maxPower: number;
}

export interface GameState {
  cameraMode: CameraMode;
  units: Unit[];
  buildings: Building[];
  resources: GameResources;
  selectedUnitIds: string[];
  isPaused: boolean;
  setCameraMode: (mode: CameraMode) => void;
  selectUnits: (ids: string[]) => void;
  moveSelectedUnits: (target: [number, number, number]) => void;
  addUnit: (unit: Unit) => void;
  removeUnit: (id: string) => void;
  addBuilding: (building: Building) => void;
  updateUnitPosition: (id: string, position: [number, number, number]) => void;
  damageUnit: (id: string, amount: number) => void;
  togglePause: () => void;
  tick: (delta: number) => void;
}
