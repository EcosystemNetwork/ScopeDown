import { create } from 'zustand';
import type { GameState, Unit } from '../types/game';

function moveToward(
  current: [number, number, number],
  target: [number, number, number],
  speed: number,
  delta: number
): [number, number, number] {
  const dx = target[0] - current[0];
  const dy = target[1] - current[1];
  const dz = target[2] - current[2];
  const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
  if (dist < 0.1) return target;
  const step = Math.min(speed * delta, dist);
  const ratio = step / dist;
  return [
    current[0] + dx * ratio,
    current[1] + dy * ratio,
    current[2] + dz * ratio,
  ];
}

const initialUnits: Unit[] = [
  {
    id: 'unit-1',
    position: [2, 0, 2],
    type: 'soldier',
    health: 100,
    maxHealth: 100,
    speed: 3,
    selected: false,
    targetPosition: null,
    team: 'player',
  },
  {
    id: 'unit-2',
    position: [4, 0, 2],
    type: 'soldier',
    health: 100,
    maxHealth: 100,
    speed: 3,
    selected: false,
    targetPosition: null,
    team: 'player',
  },
  {
    id: 'unit-3',
    position: [3, 0, 4],
    type: 'tank',
    health: 250,
    maxHealth: 250,
    speed: 2,
    selected: false,
    targetPosition: null,
    team: 'player',
  },
  {
    id: 'unit-4',
    position: [-5, 0, -5],
    type: 'mech',
    health: 200,
    maxHealth: 200,
    speed: 1.5,
    selected: false,
    targetPosition: null,
    team: 'player',
  },
  {
    id: 'enemy-1',
    position: [-8, 0, -8],
    type: 'soldier',
    health: 100,
    maxHealth: 100,
    speed: 3,
    selected: false,
    targetPosition: null,
    team: 'enemy',
  },
  {
    id: 'enemy-2',
    position: [-10, 0, -10],
    type: 'tank',
    health: 250,
    maxHealth: 250,
    speed: 2,
    selected: false,
    targetPosition: null,
    team: 'enemy',
  },
];

export const useGameStore = create<GameState>((set, get) => ({
  cameraMode: 'top-down',
  units: initialUnits,
  buildings: [
    {
      id: 'building-1',
      position: [0, 0, 0],
      type: 'base',
      health: 1000,
      maxHealth: 1000,
      team: 'player',
    },
    {
      id: 'building-2',
      position: [5, 0, -2],
      type: 'barracks',
      health: 500,
      maxHealth: 500,
      team: 'player',
    },
    {
      id: 'building-3',
      position: [-3, 0, -1],
      type: 'power-plant',
      health: 300,
      maxHealth: 300,
      team: 'player',
    },
    {
      id: 'building-4',
      position: [-15, 0, -15],
      type: 'base',
      health: 1000,
      maxHealth: 1000,
      team: 'enemy',
    },
  ],
  resources: { credits: 5000, power: 100, maxPower: 150 },
  selectedUnitIds: [],
  isPaused: false,

  setCameraMode: (mode) => set({ cameraMode: mode }),

  selectUnits: (ids) =>
    set((state) => ({
      selectedUnitIds: ids,
      units: state.units.map((u) => ({
        ...u,
        selected: ids.includes(u.id),
      })),
    })),

  moveSelectedUnits: (target) =>
    set((state) => ({
      units: state.units.map((u) =>
        u.selected ? { ...u, targetPosition: target } : u
      ),
    })),

  addUnit: (unit) => set((state) => ({ units: [...state.units, unit] })),

  removeUnit: (id) =>
    set((state) => ({
      units: state.units.filter((u) => u.id !== id),
      selectedUnitIds: state.selectedUnitIds.filter((uid) => uid !== id),
    })),

  addBuilding: (building) =>
    set((state) => ({ buildings: [...state.buildings, building] })),

  updateUnitPosition: (id, position) =>
    set((state) => ({
      units: state.units.map((u) => (u.id === id ? { ...u, position } : u)),
    })),

  damageUnit: (id, amount) =>
    set((state) => ({
      units: state.units.map((u) =>
        u.id === id ? { ...u, health: Math.max(0, u.health - amount) } : u
      ),
    })),

  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),

  tick: (delta) => {
    const state = get();
    if (state.isPaused) return;
    const updated = state.units.map((unit) => {
      if (!unit.targetPosition) return unit;
      const newPos = moveToward(
        unit.position,
        unit.targetPosition,
        unit.speed,
        delta
      );
      const reached =
        newPos[0] === unit.targetPosition[0] &&
        newPos[1] === unit.targetPosition[1] &&
        newPos[2] === unit.targetPosition[2];
      return {
        ...unit,
        position: newPos,
        targetPosition: reached ? null : unit.targetPosition,
      };
    });
    set({ units: updated });
  },
}));
