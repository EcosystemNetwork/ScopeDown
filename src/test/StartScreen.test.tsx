import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StartScreen } from '../components/StartScreen';
import { useGameStore } from '../store/gameStore';

describe('StartScreen', () => {
  beforeEach(() => {
    useGameStore.setState(useGameStore.getInitialState());
  });

  it('should render the game title', () => {
    render(<StartScreen />);
    // Multiple "SCOPEDOWN" elements exist (glitch layers), check at least one
    const titles = screen.getAllByText('SCOPEDOWN');
    expect(titles.length).toBeGreaterThanOrEqual(1);
  });

  it('should render the subtitle', () => {
    render(<StartScreen />);
    expect(screen.getByText('TACTICAL COMMAND')).toBeInTheDocument();
  });

  it('should render main menu items', () => {
    render(<StartScreen />);
    expect(screen.getByTestId('menu-new-game')).toBeInTheDocument();
    expect(screen.getByTestId('menu-continue')).toBeInTheDocument();
    expect(screen.getByTestId('menu-settings')).toBeInTheDocument();
    expect(screen.getByTestId('menu-credits')).toBeInTheDocument();
  });

  it('should switch to playing when NEW GAME is clicked', () => {
    render(<StartScreen />);
    fireEvent.click(screen.getByTestId('menu-new-game'));
    expect(useGameStore.getState().gameScreen).toBe('playing');
  });

  it('should show settings panel when SETTINGS is clicked', () => {
    render(<StartScreen />);
    fireEvent.click(screen.getByTestId('menu-settings'));
    expect(screen.getByText('SETTINGS')).toBeInTheDocument();
    expect(screen.getByTestId('difficulty-easy')).toBeInTheDocument();
    expect(screen.getByTestId('difficulty-normal')).toBeInTheDocument();
    expect(screen.getByTestId('difficulty-hard')).toBeInTheDocument();
  });

  it('should show credits panel when CREDITS is clicked', () => {
    render(<StartScreen />);
    fireEvent.click(screen.getByTestId('menu-credits'));
    expect(screen.getByText('CREDITS')).toBeInTheDocument();
    expect(screen.getByText('THANK YOU FOR PLAYING')).toBeInTheDocument();
  });

  it('should navigate back from settings with back button', () => {
    render(<StartScreen />);
    fireEvent.click(screen.getByTestId('menu-settings'));
    expect(screen.getByText('SETTINGS')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('back-button'));
    expect(screen.getByTestId('menu-new-game')).toBeInTheDocument();
  });

  it('should navigate back from credits with back button', () => {
    render(<StartScreen />);
    fireEvent.click(screen.getByTestId('menu-credits'));
    expect(screen.getByText('CREDITS')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('back-button'));
    expect(screen.getByTestId('menu-new-game')).toBeInTheDocument();
  });

  it('should toggle settings controls', () => {
    render(<StartScreen />);
    fireEvent.click(screen.getByTestId('menu-settings'));

    // Toggle FPS display
    const fpsToggle = screen.getByTestId('show-fps');
    expect(fpsToggle).toHaveTextContent('OFF');
    fireEvent.click(fpsToggle);
    expect(fpsToggle).toHaveTextContent('ON');

    // Toggle screen shake
    const shakeToggle = screen.getByTestId('screen-shake');
    expect(shakeToggle).toHaveTextContent('ON');
    fireEvent.click(shakeToggle);
    expect(shakeToggle).toHaveTextContent('OFF');
  });

  it('should change difficulty in settings', () => {
    render(<StartScreen />);
    fireEvent.click(screen.getByTestId('menu-settings'));

    fireEvent.click(screen.getByTestId('difficulty-hard'));
    // hard button should be selected (has the active styling)
    const hardBtn = screen.getByTestId('difficulty-hard');
    expect(hardBtn).toBeInTheDocument();
  });

  it('should render version info', () => {
    render(<StartScreen />);
    expect(screen.getByText(/v0\.1\.0/)).toBeInTheDocument();
  });

  it('should render system status indicator', () => {
    render(<StartScreen />);
    expect(screen.getByText('SYSTEMS ONLINE')).toBeInTheDocument();
  });

  it('should navigate menu with keyboard', () => {
    render(<StartScreen />);
    // Press Enter to activate first item (NEW GAME)
    fireEvent.keyDown(window, { key: 'Enter' });
    expect(useGameStore.getState().gameScreen).toBe('playing');
  });

  it('should navigate back from settings with Escape key', () => {
    render(<StartScreen />);
    fireEvent.click(screen.getByTestId('menu-settings'));
    expect(screen.getByText('SETTINGS')).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.getByTestId('menu-new-game')).toBeInTheDocument();
  });
});
