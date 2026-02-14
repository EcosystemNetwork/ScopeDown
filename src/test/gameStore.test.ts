import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../store/gameStore';

describe('gameStore', () => {
  beforeEach(() => {
    // Reset the store to its initial state before each test
    useGameStore.setState(useGameStore.getInitialState());
  });

  describe('initial state', () => {
    it('should start on the start screen', () => {
      expect(useGameStore.getState().gameScreen).toBe('start');
    });

    it('should start with top-down camera mode', () => {
      expect(useGameStore.getState().cameraMode).toBe('top-down');
    });

    it('should start with player and enemy units', () => {
      const { units } = useGameStore.getState();
      expect(units.length).toBeGreaterThan(0);
      expect(units.some((u) => u.team === 'player')).toBe(true);
      expect(units.some((u) => u.team === 'enemy')).toBe(true);
    });

    it('should start with buildings', () => {
      const { buildings } = useGameStore.getState();
      expect(buildings.length).toBeGreaterThan(0);
      expect(buildings.some((b) => b.type === 'base')).toBe(true);
    });

    it('should start with initial resources', () => {
      const { resources } = useGameStore.getState();
      expect(resources.credits).toBe(5000);
      expect(resources.power).toBe(100);
      expect(resources.maxPower).toBe(150);
    });

    it('should start unpaused', () => {
      expect(useGameStore.getState().isPaused).toBe(false);
    });

    it('should start with playing status', () => {
      expect(useGameStore.getState().gameStatus).toBe('playing');
    });

    it('should have combat stats on units', () => {
      const { units } = useGameStore.getState();
      const soldier = units.find((u) => u.type === 'soldier' && u.team === 'player');
      expect(soldier).toBeDefined();
      expect(soldier!.damage).toBeGreaterThan(0);
      expect(soldier!.attackRange).toBeGreaterThan(0);
      expect(soldier!.attackCooldown).toBeGreaterThan(0);
    });
  });

  describe('setCameraMode', () => {
    it('should switch to first-person mode', () => {
      useGameStore.getState().setCameraMode('first-person');
      expect(useGameStore.getState().cameraMode).toBe('first-person');
    });

    it('should switch to third-person mode', () => {
      useGameStore.getState().setCameraMode('third-person');
      expect(useGameStore.getState().cameraMode).toBe('third-person');
    });

    it('should switch to top-down mode', () => {
      useGameStore.getState().setCameraMode('first-person');
      useGameStore.getState().setCameraMode('top-down');
      expect(useGameStore.getState().cameraMode).toBe('top-down');
    });
  });

  describe('selectUnits', () => {
    it('should select a single unit', () => {
      useGameStore.getState().selectUnits(['unit-1']);
      const state = useGameStore.getState();
      expect(state.selectedUnitIds).toEqual(['unit-1']);
      const selected = state.units.find((u) => u.id === 'unit-1');
      expect(selected?.selected).toBe(true);
    });

    it('should select multiple units', () => {
      useGameStore.getState().selectUnits(['unit-1', 'unit-2']);
      const state = useGameStore.getState();
      expect(state.selectedUnitIds).toEqual(['unit-1', 'unit-2']);
      expect(state.units.filter((u) => u.selected).length).toBe(2);
    });

    it('should deselect all when given empty array', () => {
      useGameStore.getState().selectUnits(['unit-1']);
      useGameStore.getState().selectUnits([]);
      const state = useGameStore.getState();
      expect(state.selectedUnitIds).toEqual([]);
      expect(state.units.every((u) => !u.selected)).toBe(true);
    });
  });

  describe('moveSelectedUnits', () => {
    it('should set target position for selected units', () => {
      useGameStore.getState().selectUnits(['unit-1']);
      useGameStore.getState().moveSelectedUnits([10, 0, 10]);
      const unit = useGameStore.getState().units.find((u) => u.id === 'unit-1');
      expect(unit?.targetPosition).toEqual([10, 0, 10]);
    });

    it('should not move unselected units', () => {
      useGameStore.getState().selectUnits(['unit-1']);
      useGameStore.getState().moveSelectedUnits([10, 0, 10]);
      const unit2 = useGameStore.getState().units.find((u) => u.id === 'unit-2');
      expect(unit2?.targetPosition).toBeNull();
    });

    it('should clear attack target when issuing move command', () => {
      // Set an attack target first
      useGameStore.setState((state) => ({
        units: state.units.map((u) =>
          u.id === 'unit-1' ? { ...u, selected: true, attackTargetId: 'enemy-1' } : u
        ),
        selectedUnitIds: ['unit-1'],
      }));
      useGameStore.getState().moveSelectedUnits([10, 0, 10]);
      const unit = useGameStore.getState().units.find((u) => u.id === 'unit-1');
      expect(unit?.attackTargetId).toBeNull();
    });
  });

  describe('addUnit', () => {
    it('should add a new unit', () => {
      const initialCount = useGameStore.getState().units.length;
      useGameStore.getState().addUnit({
        id: 'new-unit',
        position: [0, 0, 0],
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
      });
      expect(useGameStore.getState().units.length).toBe(initialCount + 1);
    });
  });

  describe('removeUnit', () => {
    it('should remove a unit by id', () => {
      const initialCount = useGameStore.getState().units.length;
      useGameStore.getState().removeUnit('unit-1');
      expect(useGameStore.getState().units.length).toBe(initialCount - 1);
      expect(useGameStore.getState().units.find((u) => u.id === 'unit-1')).toBeUndefined();
    });

    it('should remove unit from selected ids if selected', () => {
      useGameStore.getState().selectUnits(['unit-1', 'unit-2']);
      useGameStore.getState().removeUnit('unit-1');
      expect(useGameStore.getState().selectedUnitIds).toEqual(['unit-2']);
    });
  });

  describe('damageUnit', () => {
    it('should reduce unit health', () => {
      useGameStore.getState().damageUnit('unit-1', 30);
      const unit = useGameStore.getState().units.find((u) => u.id === 'unit-1');
      expect(unit?.health).toBe(70);
    });

    it('should not reduce health below 0', () => {
      useGameStore.getState().damageUnit('unit-1', 200);
      const unit = useGameStore.getState().units.find((u) => u.id === 'unit-1');
      expect(unit?.health).toBe(0);
    });
  });

  describe('togglePause', () => {
    it('should toggle pause state', () => {
      expect(useGameStore.getState().isPaused).toBe(false);
      useGameStore.getState().togglePause();
      expect(useGameStore.getState().isPaused).toBe(true);
      useGameStore.getState().togglePause();
      expect(useGameStore.getState().isPaused).toBe(false);
    });
  });

  describe('tick', () => {
    it('should move units toward their target', () => {
      useGameStore.getState().selectUnits(['unit-1']);
      useGameStore.getState().moveSelectedUnits([20, 0, 20]);
      const before = useGameStore.getState().units.find((u) => u.id === 'unit-1')!;
      const startX = before.position[0];

      useGameStore.getState().tick(1);

      const after = useGameStore.getState().units.find((u) => u.id === 'unit-1')!;
      // Unit should have moved closer to target
      expect(after.position[0]).toBeGreaterThan(startX);
    });

    it('should not move units when paused', () => {
      useGameStore.getState().selectUnits(['unit-1']);
      useGameStore.getState().moveSelectedUnits([20, 0, 20]);
      useGameStore.getState().togglePause();
      const before = useGameStore.getState().units.find((u) => u.id === 'unit-1')!;

      useGameStore.getState().tick(1);

      const after = useGameStore.getState().units.find((u) => u.id === 'unit-1')!;
      expect(after.position).toEqual(before.position);
    });

    it('should clear target when unit reaches destination', () => {
      useGameStore.getState().selectUnits(['unit-1']);
      // Move to current position + tiny offset
      const unit = useGameStore.getState().units.find((u) => u.id === 'unit-1')!;
      useGameStore.getState().moveSelectedUnits([
        unit.position[0] + 0.01,
        unit.position[1],
        unit.position[2] + 0.01,
      ]);

      // Tick enough to arrive
      for (let i = 0; i < 10; i++) {
        useGameStore.getState().tick(1);
      }

      const after = useGameStore.getState().units.find((u) => u.id === 'unit-1')!;
      expect(after.targetPosition).toBeNull();
    });

    it('should increment game time', () => {
      useGameStore.getState().tick(1);
      expect(useGameStore.getState().gameTime).toBeGreaterThan(0);
    });

    it('should remove dead units (health <= 0)', () => {
      useGameStore.getState().damageUnit('unit-1', 200);
      const beforeCount = useGameStore.getState().units.length;
      useGameStore.getState().tick(0.016);
      const afterCount = useGameStore.getState().units.length;
      expect(afterCount).toBe(beforeCount - 1);
    });
  });

  describe('produceUnit', () => {
    it('should create a new unit and deduct credits', () => {
      const initialCount = useGameStore.getState().units.length;
      const initialCredits = useGameStore.getState().resources.credits;
      useGameStore.getState().produceUnit('soldier');
      const state = useGameStore.getState();
      expect(state.units.length).toBe(initialCount + 1);
      expect(state.resources.credits).toBe(initialCredits - 200);
    });

    it('should not produce a unit if credits are insufficient', () => {
      useGameStore.setState({ resources: { credits: 50, power: 100, maxPower: 150 } });
      const initialCount = useGameStore.getState().units.length;
      useGameStore.getState().produceUnit('soldier');
      expect(useGameStore.getState().units.length).toBe(initialCount);
    });

    it('should not produce a unit without a barracks', () => {
      useGameStore.setState((state) => ({
        buildings: state.buildings.filter((b) => b.type !== 'barracks'),
      }));
      const initialCount = useGameStore.getState().units.length;
      useGameStore.getState().produceUnit('soldier');
      expect(useGameStore.getState().units.length).toBe(initialCount);
    });
  });

  describe('resetGame', () => {
    it('should reset the game to initial state', () => {
      useGameStore.getState().selectUnits(['unit-1']);
      useGameStore.getState().togglePause();
      useGameStore.getState().resetGame();
      const state = useGameStore.getState();
      expect(state.isPaused).toBe(false);
      expect(state.selectedUnitIds).toEqual([]);
      expect(state.gameStatus).toBe('playing');
      expect(state.gameTime).toBe(0);
    });
  });

  describe('addBuilding', () => {
    it('should add a new building', () => {
      const initialCount = useGameStore.getState().buildings.length;
      useGameStore.getState().addBuilding({
        id: 'new-building',
        position: [10, 0, 10],
        type: 'factory',
        health: 400,
        maxHealth: 400,
        team: 'player',
      });
      expect(useGameStore.getState().buildings.length).toBe(initialCount + 1);
    });
  });

  describe('resource income', () => {
    it('should generate base income every 5 seconds', () => {
      const initialCredits = useGameStore.getState().resources.credits;
      // Tick past the 5 second mark
      useGameStore.getState().tick(5.1);
      expect(useGameStore.getState().resources.credits).toBeGreaterThan(initialCredits);
    });
  });

  describe('game over conditions', () => {
    it('should set status to won when all enemy units and buildings are destroyed', () => {
      // Remove all enemy units
      useGameStore.setState((state) => ({
        units: state.units.filter((u) => u.team === 'player'),
        buildings: state.buildings.map((b) =>
          b.team === 'enemy' ? { ...b, health: 0 } : b
        ),
      }));
      useGameStore.getState().tick(0.016);
      expect(useGameStore.getState().gameStatus).toBe('won');
    });
  });

  describe('setGameScreen', () => {
    it('should switch from start to playing', () => {
      expect(useGameStore.getState().gameScreen).toBe('start');
      useGameStore.getState().setGameScreen('playing');
      expect(useGameStore.getState().gameScreen).toBe('playing');
    });

    it('should switch back to start', () => {
      useGameStore.getState().setGameScreen('playing');
      useGameStore.getState().setGameScreen('start');
      expect(useGameStore.getState().gameScreen).toBe('start');
    });
  });

  describe('player state', () => {
    it('should start with initial player state', () => {
      const { player } = useGameStore.getState();
      expect(player.position).toEqual([0, 0.5, 5]);
      expect(player.velocity).toEqual([0, 0, 0]);
      expect(player.rotation).toBe(0);
      expect(player.isRunning).toBe(false);
      expect(player.isJumping).toBe(false);
      expect(player.isGrounded).toBe(true);
    });

    it('should update player position', () => {
      useGameStore.getState().updatePlayer({ position: [5, 1, 3] });
      expect(useGameStore.getState().player.position).toEqual([5, 1, 3]);
    });

    it('should update player running state', () => {
      useGameStore.getState().updatePlayer({ isRunning: true });
      expect(useGameStore.getState().player.isRunning).toBe(true);
    });

    it('should update player jumping state', () => {
      useGameStore.getState().updatePlayer({ isJumping: true, isGrounded: false });
      const { player } = useGameStore.getState();
      expect(player.isJumping).toBe(true);
      expect(player.isGrounded).toBe(false);
    });

    it('should preserve other player fields on partial update', () => {
      useGameStore.getState().updatePlayer({ isRunning: true });
      const { player } = useGameStore.getState();
      expect(player.position).toEqual([0, 0.5, 5]);
      expect(player.isRunning).toBe(true);
    });

    it('should reset player state on resetGame', () => {
      useGameStore.getState().updatePlayer({ position: [10, 5, 10], isRunning: true });
      useGameStore.getState().resetGame();
      const { player } = useGameStore.getState();
      expect(player.position).toEqual([0, 0.5, 5]);
      expect(player.isRunning).toBe(false);
    });

    it('should update player rotation', () => {
      useGameStore.getState().updatePlayer({ rotation: Math.PI / 4 });
      expect(useGameStore.getState().player.rotation).toBe(Math.PI / 4);
    });

    it('should reset player rotation on resetGame', () => {
      useGameStore.getState().updatePlayer({ rotation: 1.5 });
      useGameStore.getState().resetGame();
      expect(useGameStore.getState().player.rotation).toBe(0);
    });

    it('should preserve rotation on other partial updates', () => {
      useGameStore.getState().updatePlayer({ rotation: Math.PI });
      useGameStore.getState().updatePlayer({ isRunning: true });
      const { player } = useGameStore.getState();
      expect(player.rotation).toBe(Math.PI);
      expect(player.isRunning).toBe(true);
    });
  });
});
