import { create } from 'zustand';
import type { GameState, GameStatus, Unit, UnitType } from '../types/game';
import { UNIT_COSTS, UNIT_STATS } from '../types/game';

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

function distance(a: [number, number, number], b: [number, number, number]): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const dz = a[2] - b[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function findNearestEnemy(unit: Unit, allUnits: Unit[]): Unit | null {
  let nearest: Unit | null = null;
  let nearestDist = Infinity;
  for (const other of allUnits) {
    if (other.team === unit.team || other.health <= 0) continue;
    const d = distance(unit.position, other.position);
    if (d < nearestDist) {
      nearestDist = d;
      nearest = other;
    }
  }
  return nearest;
}

const initialUnits: Unit[] = [
  {
    id: 'unit-1',
    position: [2, 0, 2],
    type: 'soldier',
    health: 100,
    maxHealth: 100,
    speed: 3,
    damage: 10,
    attackRange: 5,
    attackCooldown: 1,
    lastAttackTime: 0,
    selected: false,
    targetPosition: null,
    attackTargetId: null,
    team: 'player',
  },
  {
    id: 'unit-2',
    position: [4, 0, 2],
    type: 'soldier',
    health: 100,
    maxHealth: 100,
    speed: 3,
    damage: 10,
    attackRange: 5,
    attackCooldown: 1,
    lastAttackTime: 0,
    selected: false,
    targetPosition: null,
    attackTargetId: null,
    team: 'player',
  },
  {
    id: 'unit-3',
    position: [3, 0, 4],
    type: 'tank',
    health: 250,
    maxHealth: 250,
    speed: 2,
    damage: 25,
    attackRange: 8,
    attackCooldown: 2,
    lastAttackTime: 0,
    selected: false,
    targetPosition: null,
    attackTargetId: null,
    team: 'player',
  },
  {
    id: 'unit-4',
    position: [-5, 0, -5],
    type: 'mech',
    health: 200,
    maxHealth: 200,
    speed: 1.5,
    damage: 20,
    attackRange: 6,
    attackCooldown: 1.5,
    lastAttackTime: 0,
    selected: false,
    targetPosition: null,
    attackTargetId: null,
    team: 'player',
  },
  {
    id: 'enemy-1',
    position: [-8, 0, -8],
    type: 'soldier',
    health: 100,
    maxHealth: 100,
    speed: 3,
    damage: 10,
    attackRange: 5,
    attackCooldown: 1,
    lastAttackTime: 0,
    selected: false,
    targetPosition: null,
    attackTargetId: null,
    team: 'enemy',
  },
  {
    id: 'enemy-2',
    position: [-10, 0, -10],
    type: 'tank',
    health: 250,
    maxHealth: 250,
    speed: 2,
    damage: 25,
    attackRange: 8,
    attackCooldown: 2,
    lastAttackTime: 0,
    selected: false,
    targetPosition: null,
    attackTargetId: null,
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
  gameStatus: 'playing',
  gameTime: 0,
  nextUnitId: 100,

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
        u.selected ? { ...u, targetPosition: target, attackTargetId: null } : u
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

  produceUnit: (unitType: UnitType) => {
    const state = get();
    if (state.gameStatus !== 'playing') return;
    const cost = UNIT_COSTS[unitType];
    if (state.resources.credits < cost) return;

    // Find barracks for spawn position
    const barracks = state.buildings.find(
      (b) => b.type === 'barracks' && b.team === 'player'
    );
    if (!barracks) return;

    const stats = UNIT_STATS[unitType];
    const spawnPos: [number, number, number] = [
      barracks.position[0] + (Math.random() - 0.5) * 3,
      0,
      barracks.position[2] + 3,
    ];

    const newUnit: Unit = {
      id: `unit-${state.nextUnitId}`,
      position: spawnPos,
      type: unitType,
      health: stats.health,
      maxHealth: stats.health,
      speed: stats.speed,
      damage: stats.damage,
      attackRange: stats.attackRange,
      attackCooldown: stats.attackCooldown,
      lastAttackTime: 0,
      selected: false,
      targetPosition: null,
      attackTargetId: null,
      team: 'player',
    };

    set({
      units: [...state.units, newUnit],
      resources: { ...state.resources, credits: state.resources.credits - cost },
      nextUnitId: state.nextUnitId + 1,
    });
  },

  resetGame: () => {
    set(useGameStore.getInitialState());
  },

  tick: (delta) => {
    const state = get();
    if (state.isPaused || state.gameStatus !== 'playing') return;

    const gameTime = state.gameTime + delta;

    // Resource income: +50 credits per refinery per 5 seconds, +25 base per 5 seconds
    let creditsIncome = 0;
    const incomeInterval = 5;
    const prevInterval = Math.floor(state.gameTime / incomeInterval);
    const curInterval = Math.floor(gameTime / incomeInterval);
    if (curInterval > prevInterval) {
      creditsIncome = 25; // base income
      const refineries = state.buildings.filter(
        (b) => b.type === 'refinery' && b.team === 'player' && b.health > 0
      );
      creditsIncome += refineries.length * 50;
    }

    // Process units: movement, combat, enemy AI
    let updated = state.units.map((unit) => {
      // Skip dead units
      if (unit.health <= 0) return unit;

      const newUnit = { ...unit };

      // Enemy AI: find nearest player unit and attack/chase
      if (unit.team === 'enemy' && !unit.targetPosition && !unit.attackTargetId) {
        const nearest = findNearestEnemy(unit, state.units);
        if (nearest) {
          const d = distance(unit.position, nearest.position);
          if (d <= unit.attackRange) {
            newUnit.attackTargetId = nearest.id;
          } else if (d < 20) {
            // Chase if within detection range
            newUnit.targetPosition = nearest.position;
            newUnit.attackTargetId = nearest.id;
          }
        }
      }

      // Combat: attack target if in range and cooldown is ready
      if (newUnit.attackTargetId && newUnit.damage > 0) {
        const target = state.units.find((u) => u.id === newUnit.attackTargetId);
        if (!target || target.health <= 0) {
          newUnit.attackTargetId = null;
        } else {
          const d = distance(newUnit.position, target.position);
          if (d <= newUnit.attackRange) {
            // In range - stop moving and attack if cooldown allows
            newUnit.targetPosition = null;
            if (gameTime - newUnit.lastAttackTime >= newUnit.attackCooldown) {
              newUnit.lastAttackTime = gameTime;
              // Damage applied below in a second pass
            }
          } else {
            // Chase the target
            newUnit.targetPosition = target.position;
          }
        }
      }

      // Movement
      if (newUnit.targetPosition) {
        const newPos = moveToward(
          newUnit.position,
          newUnit.targetPosition,
          newUnit.speed,
          delta
        );
        const reached =
          newPos[0] === newUnit.targetPosition[0] &&
          newPos[1] === newUnit.targetPosition[1] &&
          newPos[2] === newUnit.targetPosition[2];
        newUnit.position = newPos;
        if (reached) {
          newUnit.targetPosition = null;
        }
      }

      return newUnit;
    });

    // Apply combat damage in a second pass
    const damageMap = new Map<string, number>();
    for (const unit of updated) {
      if (unit.health <= 0 || !unit.attackTargetId || unit.damage <= 0) continue;
      const target = updated.find((u) => u.id === unit.attackTargetId);
      if (!target || target.health <= 0) continue;
      const d = distance(unit.position, target.position);
      if (d <= unit.attackRange && unit.lastAttackTime === gameTime) {
        damageMap.set(target.id, (damageMap.get(target.id) ?? 0) + unit.damage);
      }
    }

    if (damageMap.size > 0) {
      updated = updated.map((unit) => {
        const dmg = damageMap.get(unit.id);
        if (dmg) {
          return { ...unit, health: Math.max(0, unit.health - dmg) };
        }
        return unit;
      });
    }

    // Remove dead units
    const alive = updated.filter((u) => u.health > 0);

    // Clear attack targets referencing dead units
    const aliveIds = new Set(alive.map((u) => u.id));
    const finalUnits = alive.map((u) => {
      if (u.attackTargetId && !aliveIds.has(u.attackTargetId)) {
        return { ...u, attackTargetId: null };
      }
      return u;
    });

    // Check win/lose conditions
    const playerBase = state.buildings.find(
      (b) => b.type === 'base' && b.team === 'player'
    );
    const enemyBase = state.buildings.find(
      (b) => b.type === 'base' && b.team === 'enemy'
    );
    const enemyUnitsAlive = finalUnits.filter((u) => u.team === 'enemy').length;
    const playerUnitsAlive = finalUnits.filter((u) => u.team === 'player').length;

    let gameStatus: GameStatus = state.gameStatus;
    if (playerBase && playerBase.health <= 0) {
      gameStatus = 'lost';
    } else if (enemyBase && enemyBase.health <= 0) {
      gameStatus = 'won';
    } else if (enemyUnitsAlive === 0 && !state.buildings.some((b) => b.team === 'enemy' && b.health > 0)) {
      gameStatus = 'won';
    } else if (playerUnitsAlive === 0 && !state.buildings.some((b) => b.team === 'player' && b.health > 0)) {
      gameStatus = 'lost';
    }

    set({
      units: finalUnits,
      selectedUnitIds: state.selectedUnitIds.filter((id) => aliveIds.has(id)),
      gameTime,
      gameStatus,
      resources: {
        ...state.resources,
        credits: state.resources.credits + creditsIncome,
      },
    });
  },
}));
