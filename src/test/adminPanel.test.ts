import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../store/gameStore';

describe('admin panel state', () => {
  beforeEach(() => {
    useGameStore.setState(useGameStore.getInitialState());
  });

  it('should start with admin panel hidden', () => {
    expect(useGameStore.getState().showAdminPanel).toBe(false);
  });

  it('should toggle admin panel visibility', () => {
    useGameStore.getState().toggleAdminPanel();
    expect(useGameStore.getState().showAdminPanel).toBe(true);
    useGameStore.getState().toggleAdminPanel();
    expect(useGameStore.getState().showAdminPanel).toBe(false);
  });

  it('should set resources via setResources', () => {
    useGameStore.getState().setResources({ credits: 9999 });
    expect(useGameStore.getState().resources.credits).toBe(9999);
    expect(useGameStore.getState().resources.power).toBe(100); // unchanged
  });

  it('should set multiple resources at once', () => {
    useGameStore.getState().setResources({ credits: 1000, power: 200, maxPower: 300 });
    const { resources } = useGameStore.getState();
    expect(resources.credits).toBe(1000);
    expect(resources.power).toBe(200);
    expect(resources.maxPower).toBe(300);
  });

  it('should set game status via setGameStatus', () => {
    useGameStore.getState().setGameStatus('won');
    expect(useGameStore.getState().gameStatus).toBe('won');
    useGameStore.getState().setGameStatus('lost');
    expect(useGameStore.getState().gameStatus).toBe('lost');
    useGameStore.getState().setGameStatus('playing');
    expect(useGameStore.getState().gameStatus).toBe('playing');
  });

  it('should update a unit via updateUnit', () => {
    useGameStore.getState().updateUnit('unit-1', { health: 50 });
    const unit = useGameStore.getState().units.find((u) => u.id === 'unit-1');
    expect(unit?.health).toBe(50);
  });

  it('should heal a unit to max health via updateUnit', () => {
    useGameStore.getState().damageUnit('unit-1', 30);
    const unit = useGameStore.getState().units.find((u) => u.id === 'unit-1')!;
    useGameStore.getState().updateUnit('unit-1', { health: unit.maxHealth });
    const healed = useGameStore.getState().units.find((u) => u.id === 'unit-1');
    expect(healed?.health).toBe(100);
  });

  it('should update a building via updateBuilding', () => {
    useGameStore.getState().updateBuilding('building-1', { health: 500 });
    const building = useGameStore.getState().buildings.find((b) => b.id === 'building-1');
    expect(building?.health).toBe(500);
  });

  it('should destroy a building via updateBuilding', () => {
    useGameStore.getState().updateBuilding('building-1', { health: 0 });
    const building = useGameStore.getState().buildings.find((b) => b.id === 'building-1');
    expect(building?.health).toBe(0);
  });

  it('should repair a building via updateBuilding', () => {
    useGameStore.getState().updateBuilding('building-1', { health: 100 });
    useGameStore.getState().updateBuilding('building-1', { health: 1000 });
    const building = useGameStore.getState().buildings.find((b) => b.id === 'building-1');
    expect(building?.health).toBe(1000);
  });

  it('should reset admin panel on resetGame', () => {
    useGameStore.getState().toggleAdminPanel();
    expect(useGameStore.getState().showAdminPanel).toBe(true);
    useGameStore.getState().resetGame();
    expect(useGameStore.getState().showAdminPanel).toBe(false);
  });
});
