import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene } from './components/Scene';
import { HUD } from './components/HUD';
import { Minimap } from './components/Minimap';
import { StartScreen } from './components/StartScreen';
import { getRendererInfo } from './utils/webgpu';
import { useGameStore } from './store/gameStore';

export default function App() {
  const rendererInfo = useMemo(() => getRendererInfo(), []);
  const gameScreen = useGameStore((s) => s.gameScreen);

  if (gameScreen === 'start') {
    return <StartScreen />;
  }

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Canvas
        shadows
        camera={{ position: [0, 30, 0.1], fov: 50 }}
        gl={{ antialias: true }}
        onCreated={({ gl }) => {
          gl.setClearColor('#0a0a1a');
        }}
      >
        <Scene />
      </Canvas>
      <HUD />
      <Minimap />
      <div
          style={{
            position: 'absolute',
            bottom: '5px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '9px',
            color: '#2a3a4a',
            fontFamily: '"Courier New", monospace',
          }}
        >
          Renderer: {rendererInfo.fallback} | WebGPU:{' '}
          {rendererInfo.webgpu ? 'Available' : 'Unavailable'}
        </div>
    </div>
  );
}
