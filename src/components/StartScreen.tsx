import { useState, useEffect, useCallback, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';

type MenuPanel = 'main' | 'settings' | 'credits';

interface MenuItemDef {
  label: string;
  action: () => void;
  description: string;
}

/* Floating particle rendered in the background */
function Particle({ delay, left, size, duration }: { delay: number; left: number; size: number; duration: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '-10px',
        left: `${left}%`,
        width: `${size}px`,
        height: `${size}px`,
        background: 'rgba(0,255,204,0.4)',
        borderRadius: '50%',
        boxShadow: `0 0 ${size * 2}px rgba(0,255,204,0.3)`,
        animation: `particle-float ${duration}s linear ${delay}s infinite`,
        pointerEvents: 'none',
      }}
    />
  );
}

/* Generates stable particle configs so they don't re-randomize on re-render */
function useParticles(count: number) {
  return useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      key: i,
      delay: (i / count) * 12,
      left: (i * 7.3 + 3) % 100,
      size: 1 + (i % 3),
      duration: 8 + (i % 5) * 2,
    })),
    [count]
  );
}

export function StartScreen() {
  const setGameScreen = useGameStore((s) => s.setGameScreen);
  const [panel, setPanel] = useState<MenuPanel>('main');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  // Settings state (visual only — not wired to game engine)
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');
  const [masterVolume, setMasterVolume] = useState(80);
  const [sfxVolume, setSfxVolume] = useState(70);
  const [musicVolume, setMusicVolume] = useState(60);
  const [showFps, setShowFps] = useState(false);
  const [screenShake, setScreenShake] = useState(true);

  const particles = useParticles(30);

  useEffect(() => {
    setMounted(true);
  }, []);

  const menuItems: MenuItemDef[] = useMemo(() => [
    { label: 'NEW GAME', action: () => setGameScreen('playing'), description: 'Begin a new tactical operation' },
    { label: 'CONTINUE', action: () => setGameScreen('playing'), description: 'Resume your last session' },
    { label: 'SETTINGS', action: () => setPanel('settings'), description: 'Configure audio, display & controls' },
    { label: 'CREDITS', action: () => setPanel('credits'), description: 'View the development team' },
  ], [setGameScreen]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (panel !== 'main') {
        if (e.key === 'Escape' || e.key === 'Backspace') {
          setPanel('main');
        }
        return;
      }
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + menuItems.length) % menuItems.length);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % menuItems.length);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          menuItems[selectedIndex].action();
          break;
        case 'Escape':
          break;
      }
    },
    [panel, menuItems, selectedIndex]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Reset selected index when returning to main
  useEffect(() => {
    if (panel === 'main') {
      setSelectedIndex(0);
      setHoveredIndex(null);
    }
  }, [panel]);

  const activeIndex = hoveredIndex ?? selectedIndex;

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: 'radial-gradient(ellipse at 30% 50%, #0a1628 0%, #050a14 40%, #000000 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Courier New", monospace',
        color: '#00ffcc',
        overflow: 'hidden',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      {/* Ambient grid background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(0,255,204,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,204,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          pointerEvents: 'none',
        }}
      />

      {/* Diagonal accent line */}
      <div
        style={{
          position: 'absolute',
          top: '35%',
          left: '-10%',
          width: '120%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(0,255,204,0.2) 30%, rgba(0,255,204,0.4) 50%, rgba(0,255,204,0.2) 70%, transparent 100%)',
          transform: 'rotate(-2deg)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '-10%',
          width: '120%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(0,255,204,0.1) 30%, rgba(0,255,204,0.2) 50%, rgba(0,255,204,0.1) 70%, transparent 100%)',
          transform: 'rotate(-2deg)',
          top: '65%',
          pointerEvents: 'none',
        }}
      />

      {/* Scanning line overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '2px',
            background: 'linear-gradient(180deg, transparent, rgba(0,255,204,0.06), transparent)',
            animation: 'scanline 4s linear infinite',
          }}
        />
      </div>

      {/* Floating particles */}
      {particles.map((p) => (
        <Particle key={p.key} delay={p.delay} left={p.left} size={p.size} duration={p.duration} />
      ))}

      {/* Vignette overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Corner decorations */}
      <CornerDecoration position="top-left" />
      <CornerDecoration position="top-right" />
      <CornerDecoration position="bottom-left" />
      <CornerDecoration position="bottom-right" />

      {/* Main content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          animation: mounted ? 'fade-in 1s ease-out' : 'none',
          width: '100%',
          maxWidth: '800px',
          padding: '0 40px',
        }}
      >
        {/* Logo area */}
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          {/* Decorative top line */}
          <div
            style={{
              width: '60px',
              height: '2px',
              background: 'linear-gradient(90deg, transparent, #00ffcc, transparent)',
              margin: '0 auto 20px',
              animation: 'logo-line 1.5s ease-out',
            }}
          />

          {/* Title with glitch effect */}
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <div
              style={{
                fontSize: 'clamp(40px, 8vw, 80px)',
                fontWeight: 'bold',
                letterSpacing: '12px',
                animation: 'title-glow 3s ease-in-out infinite',
                color: '#00ffcc',
              }}
            >
              SCOPEDOWN
            </div>
            {/* Glitch layers */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                fontSize: 'clamp(40px, 8vw, 80px)',
                fontWeight: 'bold',
                letterSpacing: '12px',
                color: '#ff0040',
                animation: 'glitch-1 4s linear infinite',
                opacity: 0.7,
              }}
            >
              SCOPEDOWN
            </div>
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                fontSize: 'clamp(40px, 8vw, 80px)',
                fontWeight: 'bold',
                letterSpacing: '12px',
                color: '#00aaff',
                animation: 'glitch-2 4s linear 0.5s infinite',
                opacity: 0.7,
              }}
            >
              SCOPEDOWN
            </div>
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: '14px',
              color: '#4a6a7a',
              letterSpacing: '8px',
              marginTop: '8px',
              animation: mounted ? 'subtitle-reveal 1.2s ease-out' : 'none',
              textTransform: 'uppercase',
            }}
          >
            TACTICAL COMMAND
          </div>

          {/* Decorative bottom line */}
          <div
            style={{
              width: '200px',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(0,255,204,0.3), transparent)',
              margin: '16px auto 0',
            }}
          />
        </div>

        {/* Panel content area */}
        <div style={{ minHeight: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          {panel === 'main' && (
            <MainMenu
              items={menuItems}
              activeIndex={activeIndex}
              mounted={mounted}
              onHover={setHoveredIndex}
              onSelect={(idx) => menuItems[idx].action()}
            />
          )}
          {panel === 'settings' && (
            <SettingsPanel
              difficulty={difficulty}
              setDifficulty={setDifficulty}
              masterVolume={masterVolume}
              setMasterVolume={setMasterVolume}
              sfxVolume={sfxVolume}
              setSfxVolume={setSfxVolume}
              musicVolume={musicVolume}
              setMusicVolume={setMusicVolume}
              showFps={showFps}
              setShowFps={setShowFps}
              screenShake={screenShake}
              setScreenShake={setScreenShake}
              onBack={() => setPanel('main')}
            />
          )}
          {panel === 'credits' && (
            <CreditsPanel onBack={() => setPanel('main')} />
          )}
        </div>

        {/* Bottom controls info */}
        {panel === 'main' && (
          <div
            style={{
              fontSize: '10px',
              color: '#2a4a5a',
              textAlign: 'center',
              lineHeight: '2',
              letterSpacing: '2px',
              animation: mounted ? 'fade-in 1.5s ease-out 0.8s both' : 'none',
            }}
          >
            <div style={{ marginBottom: '8px', color: '#3a5a6a' }}>
              ▲ ▼ NAVIGATE &nbsp;&nbsp; ENTER SELECT &nbsp;&nbsp; ESC BACK
            </div>
          </div>
        )}
      </div>

      {/* Version info */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          right: '24px',
          fontSize: '9px',
          color: '#1a3a4a',
          letterSpacing: '1px',
          animation: 'hud-flicker 8s linear infinite',
        }}
      >
        v0.1.0 // BUILD 2026.02
      </div>

      {/* Status indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '24px',
          fontSize: '9px',
          color: '#1a3a4a',
          letterSpacing: '1px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <div
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#00ffcc',
            boxShadow: '0 0 6px rgba(0,255,204,0.6)',
            animation: 'pulse-dot 2s ease-in-out infinite',
          }}
        />
        SYSTEMS ONLINE
      </div>
    </div>
  );
}

/* ─── Sub-components ─── */

function CornerDecoration({ position }: { position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) {
  const isTop = position.startsWith('top');
  const isLeft = position.endsWith('left');
  return (
    <div
      style={{
        position: 'absolute',
        [isTop ? 'top' : 'bottom']: '20px',
        [isLeft ? 'left' : 'right']: '20px',
        width: '30px',
        height: '30px',
        borderColor: 'rgba(0,255,204,0.2)',
        borderStyle: 'solid',
        borderWidth: 0,
        [isTop ? 'borderTopWidth' : 'borderBottomWidth']: '1px',
        [isLeft ? 'borderLeftWidth' : 'borderRightWidth']: '1px',
        pointerEvents: 'none',
      }}
    />
  );
}

function MainMenu({
  items,
  activeIndex,
  mounted,
  onHover,
  onSelect,
}: {
  items: MenuItemDef[];
  activeIndex: number;
  mounted: boolean;
  onHover: (idx: number | null) => void;
  onSelect: (idx: number) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', width: '100%', maxWidth: '400px' }}>
      {items.map((item, i) => {
        const isActive = i === activeIndex;
        return (
          <button
            key={item.label}
            data-testid={`menu-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
            onClick={() => onSelect(i)}
            onMouseEnter={() => onHover(i)}
            onMouseLeave={() => onHover(null)}
            onFocus={() => onHover(i)}
            style={{
              width: '100%',
              background: isActive
                ? 'linear-gradient(90deg, rgba(0,255,204,0.15) 0%, rgba(0,255,204,0.05) 100%)'
                : 'transparent',
              border: 'none',
              borderLeft: isActive ? '3px solid #00ffcc' : '3px solid transparent',
              color: isActive ? '#00ffcc' : '#3a6a7a',
              padding: '14px 24px',
              fontSize: '16px',
              cursor: 'pointer',
              fontFamily: '"Courier New", monospace',
              letterSpacing: '4px',
              textAlign: 'left',
              transition: 'all 0.2s ease-out',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              animation: mounted ? `menu-slide-in 0.4s ease-out ${0.3 + i * 0.1}s both` : 'none',
              position: 'relative',
            }}
          >
            <span
              style={{
                fontSize: '10px',
                opacity: isActive ? 1 : 0.4,
                transition: 'opacity 0.2s',
                minWidth: '14px',
              }}
            >
              {isActive ? '▶' : '○'}
            </span>
            <span style={{ flex: 1 }}>{item.label}</span>
            {isActive && (
              <span
                style={{
                  fontSize: '10px',
                  color: '#2a5a6a',
                  letterSpacing: '1px',
                  fontStyle: 'italic',
                }}
              >
                {item.description}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function SettingsPanel({
  difficulty,
  setDifficulty,
  masterVolume,
  setMasterVolume,
  sfxVolume,
  setSfxVolume,
  musicVolume,
  setMusicVolume,
  showFps,
  setShowFps,
  screenShake,
  setScreenShake,
  onBack,
}: {
  difficulty: 'easy' | 'normal' | 'hard';
  setDifficulty: (d: 'easy' | 'normal' | 'hard') => void;
  masterVolume: number;
  setMasterVolume: (v: number) => void;
  sfxVolume: number;
  setSfxVolume: (v: number) => void;
  musicVolume: number;
  setMusicVolume: (v: number) => void;
  showFps: boolean;
  setShowFps: (v: boolean) => void;
  screenShake: boolean;
  setScreenShake: (v: boolean) => void;
  onBack: () => void;
}) {
  const difficulties: Array<'easy' | 'normal' | 'hard'> = ['easy', 'normal', 'hard'];

  return (
    <div style={{ width: '100%', maxWidth: '500px', animation: 'fade-in 0.3s ease-out' }}>
      <PanelHeader title="SETTINGS" onBack={onBack} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '0 10px' }}>
        {/* Difficulty */}
        <SettingRow label="DIFFICULTY">
          <div style={{ display: 'flex', gap: '8px' }}>
            {difficulties.map((d) => (
              <button
                key={d}
                data-testid={`difficulty-${d}`}
                onClick={() => setDifficulty(d)}
                style={{
                  background: difficulty === d ? 'rgba(0,255,204,0.2)' : 'rgba(0,20,40,0.5)',
                  border: `1px solid ${difficulty === d ? '#00ffcc' : '#1a3a4a'}`,
                  color: difficulty === d ? '#00ffcc' : '#3a5a6a',
                  padding: '6px 16px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  fontFamily: '"Courier New", monospace',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  transition: 'all 0.2s',
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </SettingRow>

        <Divider />

        {/* Volume controls */}
        <VolumeSlider label="MASTER VOLUME" value={masterVolume} onChange={setMasterVolume} testId="master-volume" />
        <VolumeSlider label="SFX VOLUME" value={sfxVolume} onChange={setSfxVolume} testId="sfx-volume" />
        <VolumeSlider label="MUSIC VOLUME" value={musicVolume} onChange={setMusicVolume} testId="music-volume" />

        <Divider />

        {/* Toggle options */}
        <ToggleSetting label="SHOW FPS" value={showFps} onChange={setShowFps} testId="show-fps" />
        <ToggleSetting label="SCREEN SHAKE" value={screenShake} onChange={setScreenShake} testId="screen-shake" />
      </div>
    </div>
  );
}

function CreditsPanel({ onBack }: { onBack: () => void }) {
  const credits = [
    { role: 'GAME DESIGN', name: 'SCOPEDOWN TEAM' },
    { role: 'PROGRAMMING', name: 'ENGINEERING DIVISION' },
    { role: 'ART DIRECTION', name: 'VISUAL SYSTEMS UNIT' },
    { role: 'SOUND DESIGN', name: 'AUDIO OPERATIONS' },
    { role: 'QA TESTING', name: 'TACTICAL VERIFICATION' },
    { role: 'BUILT WITH', name: 'REACT · THREE.JS · ZUSTAND' },
  ];

  return (
    <div style={{ width: '100%', maxWidth: '500px', animation: 'fade-in 0.3s ease-out' }}>
      <PanelHeader title="CREDITS" onBack={onBack} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '0 10px' }}>
        {credits.map((credit, i) => (
          <div
            key={credit.role}
            style={{
              animation: `menu-slide-in 0.3s ease-out ${i * 0.08}s both`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              gap: '20px',
            }}
          >
            <span style={{ fontSize: '10px', color: '#3a5a6a', letterSpacing: '2px', flexShrink: 0 }}>
              {credit.role}
            </span>
            <span
              style={{
                flex: 1,
                borderBottom: '1px dotted #1a3a4a',
                marginBottom: '3px',
              }}
            />
            <span style={{ fontSize: '12px', color: '#00ffcc', letterSpacing: '1px' }}>
              {credit.name}
            </span>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: '30px',
          textAlign: 'center',
          fontSize: '10px',
          color: '#2a4a5a',
          letterSpacing: '2px',
        }}
      >
        THANK YOU FOR PLAYING
      </div>
    </div>
  );
}

/* ─── Shared UI primitives ─── */

function PanelHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '24px',
        paddingBottom: '12px',
        borderBottom: '1px solid #1a3a4a',
      }}
    >
      <button
        data-testid="back-button"
        onClick={onBack}
        style={{
          background: 'none',
          border: '1px solid #1a3a4a',
          color: '#3a5a6a',
          padding: '6px 12px',
          fontSize: '11px',
          cursor: 'pointer',
          fontFamily: '"Courier New", monospace',
          letterSpacing: '1px',
          marginRight: '16px',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#00ffcc';
          e.currentTarget.style.color = '#00ffcc';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#1a3a4a';
          e.currentTarget.style.color = '#3a5a6a';
        }}
      >
        ◀ ESC
      </button>
      <span style={{ fontSize: '16px', letterSpacing: '4px', color: '#00ffcc' }}>{title}</span>
    </div>
  );
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '11px', color: '#4a6a7a', letterSpacing: '2px' }}>{label}</span>
      {children}
    </div>
  );
}

function VolumeSlider({ label, value, onChange, testId }: { label: string; value: number; onChange: (v: number) => void; testId: string }) {
  return (
    <SettingRow label={label}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <input
          data-testid={testId}
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            width: '120px',
            accentColor: '#00ffcc',
            cursor: 'pointer',
          }}
        />
        <span style={{ fontSize: '11px', color: '#00ffcc', minWidth: '30px', textAlign: 'right' }}>{value}%</span>
      </div>
    </SettingRow>
  );
}

function ToggleSetting({ label, value, onChange, testId }: { label: string; value: boolean; onChange: (v: boolean) => void; testId: string }) {
  return (
    <SettingRow label={label}>
      <button
        data-testid={testId}
        onClick={() => onChange(!value)}
        style={{
          background: value ? 'rgba(0,255,204,0.2)' : 'rgba(40,20,20,0.3)',
          border: `1px solid ${value ? '#00ffcc' : '#3a2a2a'}`,
          color: value ? '#00ffcc' : '#5a3a3a',
          padding: '4px 16px',
          fontSize: '11px',
          cursor: 'pointer',
          fontFamily: '"Courier New", monospace',
          letterSpacing: '2px',
          transition: 'all 0.2s',
          minWidth: '60px',
        }}
      >
        {value ? 'ON' : 'OFF'}
      </button>
    </SettingRow>
  );
}

function Divider() {
  return (
    <div
      style={{
        height: '1px',
        background: 'linear-gradient(90deg, transparent, #1a3a4a, transparent)',
        margin: '4px 0',
      }}
    />
  );
}
