import { useGameStore } from '../store/gameStore';

export function StartScreen() {
  const setGameScreen = useGameStore((s) => s.setGameScreen);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: 'radial-gradient(ellipse at center, #0a1628 0%, #000000 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Courier New", monospace',
        color: '#00ffcc',
      }}
    >
      {/* Title */}
      <div
        style={{
          fontSize: '64px',
          fontWeight: 'bold',
          letterSpacing: '12px',
          textShadow: '0 0 40px rgba(0,255,204,0.5), 0 0 80px rgba(0,255,204,0.2)',
          marginBottom: '20px',
        }}
      >
        SCOPEDOWN
      </div>

      {/* Subtitle */}
      <div
        style={{
          fontSize: '14px',
          color: '#4a6a7a',
          letterSpacing: '6px',
          marginBottom: '60px',
        }}
      >
        TACTICAL COMMAND
      </div>

      {/* Start button */}
      <button
        onClick={() => setGameScreen('playing')}
        style={{
          background: 'rgba(0,255,204,0.1)',
          border: '2px solid #00ffcc',
          color: '#00ffcc',
          padding: '16px 48px',
          fontSize: '18px',
          cursor: 'pointer',
          fontFamily: '"Courier New", monospace',
          letterSpacing: '4px',
          transition: 'all 0.3s',
          textTransform: 'uppercase',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(0,255,204,0.25)';
          e.currentTarget.style.boxShadow = '0 0 30px rgba(0,255,204,0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(0,255,204,0.1)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        START GAME
      </button>

      {/* Controls info */}
      <div
        style={{
          marginTop: '60px',
          fontSize: '11px',
          color: '#3a5a6a',
          textAlign: 'center',
          lineHeight: '2',
          letterSpacing: '2px',
        }}
      >
        <div>W A S D — MOVE</div>
        <div>SPACE — JUMP</div>
        <div>R — RUN</div>
      </div>
    </div>
  );
}
