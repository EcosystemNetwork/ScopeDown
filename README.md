# ScopeDown

A sci-fi real-time strategy game inspired by Command & Conquer, built with **Three.js**, **React Three Fiber**, and **WebGPU**.

## Tech Stack

- **Three.js** — 3D rendering engine
- **React Three Fiber** — React renderer for Three.js
- **React Three Drei** — Useful helpers for R3F
- **WebGPU** — Next-gen GPU API (with WebGL2 fallback)
- **Zustand** — Lightweight state management
- **Vite** — Fast build tooling
- **TypeScript** — Type-safe development
- **Vitest** — Unit testing

## Camera Modes

Switch between three camera perspectives at any time:

| Mode | Description |
|------|-------------|
| **Top-Down (Tactical)** | Classic RTS overhead view with pan and zoom |
| **Third-Person** | Over-the-shoulder view following selected units |
| **First-Person** | Ground-level view from selected unit's perspective |

## Controls

| Input | Action |
|-------|--------|
| Left Click | Select unit |
| Shift + Click | Multi-select units |
| Right Click | Move selected units |
| Scroll Wheel | Zoom in/out |
| Middle Mouse | Rotate camera |

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

## Project Structure

```
src/
├── components/
│   ├── Buildings.tsx        # Building structures with health bars
│   ├── CameraController.tsx # Multi-mode camera system
│   ├── HUD.tsx              # Heads-up display overlay
│   ├── Minimap.tsx          # Radar minimap
│   ├── Scene.tsx            # Main 3D scene composition
│   ├── SelectionBox.tsx     # RTS right-click movement
│   ├── Terrain.tsx          # Sci-fi terrain with grid and decorations
│   └── Units.tsx            # Unit rendering with selection and health
├── store/
│   └── gameStore.ts         # Zustand game state management
├── types/
│   └── game.ts              # TypeScript type definitions
├── utils/
│   └── webgpu.ts            # WebGPU detection and renderer info
├── test/
│   ├── setup.ts             # Test setup
│   ├── gameStore.test.ts    # Game store unit tests
│   └── webgpu.test.ts       # WebGPU utility tests
├── App.tsx                  # Root component with R3F Canvas
├── main.tsx                 # Entry point
└── index.css                # Global styles
```

## Game Features

- **Unit Types**: Soldiers, Tanks, Mechs, Harvesters — each with unique stats
- **Buildings**: Base, Barracks, Factory, Power Plant, Refinery
- **Resource System**: Credits and power management
- **Selection System**: Click and shift-click unit selection with visual indicators
- **Movement System**: Right-click to command selected units
- **Health System**: Health bars and damage mechanics
- **Minimap**: Radar overview showing all units and buildings
- **Pause System**: Pause and resume gameplay
