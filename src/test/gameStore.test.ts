import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../store/gameStore';

describe('gameStore', () => {
  beforeEach(() => {
    // Reset the store to its initial state before each test
    useGameStore.setState(useGameStore.getInitialState());
  });

  describe('initial state', () => {
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
        selected: false,
        targetPosition: null,
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
});
