export type CameraMode = 'first-person' | 'third-person' | 'top-down';

export type GameScreen = 'start' | 'playing';

export type GameStatus = 'playing' | 'won' | 'lost';

export interface Unit {
  id: string;
  position: [number, number, number];
  type: 'soldier' | 'tank' | 'mech' | 'harvester';
  health: number;
  maxHealth: number;
  speed: number;
  damage: number;
  attackRange: number;
  attackCooldown: number;
  lastAttackTime: number;
  selected: boolean;
  targetPosition: [number, number, number] | null;
  attackTargetId: string | null;
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

export type UnitType = Unit['type'];

export const UNIT_COSTS: Record<UnitType, number> = {
  soldier: 200,
  tank: 500,
  mech: 400,
  harvester: 300,
};

export const UNIT_STATS: Record<UnitType, { health: number; speed: number; damage: number; attackRange: number; attackCooldown: number }> = {
  soldier: { health: 100, speed: 3, damage: 10, attackRange: 5, attackCooldown: 1 },
  tank: { health: 250, speed: 2, damage: 25, attackRange: 8, attackCooldown: 2 },
  mech: { health: 200, speed: 1.5, damage: 20, attackRange: 6, attackCooldown: 1.5 },
  harvester: { health: 150, speed: 2, damage: 0, attackRange: 0, attackCooldown: 0 },
};

export interface PlayerState {
  position: [number, number, number];
  velocity: [number, number, number];
  isRunning: boolean;
  isJumping: boolean;
  isGrounded: boolean;
}

export interface GameState {
  gameScreen: GameScreen;
  cameraMode: CameraMode;
  units: Unit[];
  buildings: Building[];
  resources: GameResources;
  selectedUnitIds: string[];
  isPaused: boolean;
  gameStatus: GameStatus;
  gameTime: number;
  nextUnitId: number;
  player: PlayerState;
  setGameScreen: (screen: GameScreen) => void;
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
  produceUnit: (unitType: UnitType) => void;
  resetGame: () => void;
  updatePlayer: (partial: Partial<PlayerState>) => void;
}
