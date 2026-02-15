import { neon } from '@neondatabase/serverless';
import type { GameState, PlayerState, Unit, Building } from '../types/game';

// Database client - will be initialized when a valid connection string is provided
let sql: ReturnType<typeof neon> | null = null;

// Initialize database connection
export function initDatabase() {
  const dbUrl = import.meta.env.VITE_DATABASE_URL;
  
  if (dbUrl && dbUrl.trim()) {
    try {
      sql = neon(dbUrl);
      console.log('Database connection initialized');
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  } else {
    console.warn('No database URL configured. Using local storage only.');
  }
}

// Check if database is available
export function isDatabaseAvailable(): boolean {
  return sql !== null;
}

// Create tables if they don't exist
export async function initializeTables() {
  if (!sql) return;

  try {
    // Create game_saves table
    await sql`
      CREATE TABLE IF NOT EXISTS game_saves (
        id SERIAL PRIMARY KEY,
        save_slot INTEGER NOT NULL DEFAULT 1,
        player_state JSONB NOT NULL,
        game_status TEXT NOT NULL,
        camera_mode TEXT NOT NULL,
        resources JSONB NOT NULL,
        units JSONB NOT NULL,
        buildings JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(save_slot)
      )
    `;

    console.log('Database tables initialized');
  } catch (error) {
    console.error('Failed to initialize tables:', error);
  }
}

// Save game state to database
export async function saveGameState(gameState: Partial<GameState>, slot: number = 1): Promise<boolean> {
  if (!sql) {
    console.warn('Database not available, saving to localStorage');
    saveToLocalStorage(gameState, slot);
    return true;
  }

  try {
    const {
      player,
      gameStatus,
      cameraMode,
      resources,
      units,
      buildings,
    } = gameState;

    await sql`
      INSERT INTO game_saves (
        save_slot,
        player_state,
        game_status,
        camera_mode,
        resources,
        units,
        buildings,
        updated_at
      )
      VALUES (
        ${slot},
        ${JSON.stringify(player)},
        ${gameStatus},
        ${cameraMode},
        ${JSON.stringify(resources)},
        ${JSON.stringify(units)},
        ${JSON.stringify(buildings)},
        CURRENT_TIMESTAMP
      )
      ON CONFLICT (save_slot)
      DO UPDATE SET
        player_state = EXCLUDED.player_state,
        game_status = EXCLUDED.game_status,
        camera_mode = EXCLUDED.camera_mode,
        resources = EXCLUDED.resources,
        units = EXCLUDED.units,
        buildings = EXCLUDED.buildings,
        updated_at = CURRENT_TIMESTAMP
    `;

    console.log('Game state saved to database');
    return true;
  } catch (error) {
    console.error('Failed to save game state:', error);
    // Fallback to localStorage
    saveToLocalStorage(gameState, slot);
    return false;
  }
}

// Load game state from database
export async function loadGameState(slot: number = 1): Promise<Partial<GameState> | null> {
  if (!sql) {
    console.warn('Database not available, loading from localStorage');
    return loadFromLocalStorage(slot);
  }

  try {
    const result: any = await sql`
      SELECT 
        player_state,
        game_status,
        camera_mode,
        resources,
        units,
        buildings
      FROM game_saves
      WHERE save_slot = ${slot}
      LIMIT 1
    `;

    if (!result || result.length === 0) {
      console.log('No saved game found in database');
      // Try localStorage as fallback
      return loadFromLocalStorage(slot);
    }

    const save = result[0];
    
    return {
      player: save.player_state as PlayerState,
      gameStatus: save.game_status as GameState['gameStatus'],
      cameraMode: save.camera_mode as GameState['cameraMode'],
      resources: save.resources as GameState['resources'],
      units: save.units as Unit[],
      buildings: save.buildings as Building[],
    };
  } catch (error) {
    console.error('Failed to load game state:', error);
    // Fallback to localStorage
    return loadFromLocalStorage(slot);
  }
}

// Delete a saved game
export async function deleteSaveGame(slot: number = 1): Promise<boolean> {
  if (!sql) {
    deleteFromLocalStorage(slot);
    return true;
  }

  try {
    await sql`DELETE FROM game_saves WHERE save_slot = ${slot}`;
    deleteFromLocalStorage(slot);
    console.log('Save game deleted');
    return true;
  } catch (error) {
    console.error('Failed to delete save game:', error);
    return false;
  }
}

// List all saved games
export async function listSavedGames(): Promise<Array<{ slot: number; updatedAt: Date }>> {
  if (!sql) {
    return listFromLocalStorage();
  }

  try {
    const result: any = await sql`
      SELECT save_slot, updated_at
      FROM game_saves
      ORDER BY save_slot
    `;

    return result.map((row: any) => ({
      slot: row.save_slot as number,
      updatedAt: new Date(row.updated_at as string),
    }));
  } catch (error) {
    console.error('Failed to list saved games:', error);
    return listFromLocalStorage();
  }
}

// ============ LocalStorage Fallback Functions ============

function saveToLocalStorage(gameState: Partial<GameState>, slot: number) {
  try {
    const key = `scopedown_save_${slot}`;
    localStorage.setItem(key, JSON.stringify({
      ...gameState,
      savedAt: new Date().toISOString(),
    }));
    console.log('Game state saved to localStorage');
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

function loadFromLocalStorage(slot: number): Partial<GameState> | null {
  try {
    const key = `scopedown_save_${slot}`;
    const data = localStorage.getItem(key);
    
    if (!data) {
      return null;
    }

    const parsed = JSON.parse(data);
    delete parsed.savedAt; // Remove metadata
    return parsed;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return null;
  }
}

function deleteFromLocalStorage(slot: number) {
  try {
    const key = `scopedown_save_${slot}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to delete from localStorage:', error);
  }
}

function listFromLocalStorage(): Array<{ slot: number; updatedAt: Date }> {
  const saves: Array<{ slot: number; updatedAt: Date }> = [];
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('scopedown_save_')) {
        const slot = parseInt(key.replace('scopedown_save_', ''), 10);
        const data = localStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          saves.push({
            slot,
            updatedAt: new Date(parsed.savedAt || Date.now()),
          });
        }
      }
    }
  } catch (error) {
    console.error('Failed to list from localStorage:', error);
  }

  return saves.sort((a, b) => a.slot - b.slot);
}
