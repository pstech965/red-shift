import React, { useState, useEffect, useRef, useCallback } from 'react';
import Player from './components/Player';
import Enemy from './components/Enemy';
import Coin from './components/Coin';
import HUD from './components/HUD';
import StartScreen from './components/StartScreen';
import GameOver from './components/GameOver';
import './styles/game.css';

// Audio Synthesizers using native Web Audio API
const getAudioContext = () => {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  return AudioCtx ? new AudioCtx() : null;
};

const playCoinSound = (isMuted) => {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.07); // A5
    osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.14); // D6
    
    gain.gain.setValueAtTime(0.09, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.28);
  } catch {
    // Audio context may be restricted by autoplay policy before gesture
  }
};

const playLevelUpSound = (isMuted) => {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
      gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 0.15);
    });
  } catch {
    // Autoplay catch
  }
};

const playGameOverSound = (isMuted) => {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(45, ctx.currentTime + 0.6);
    
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch {
    // Autoplay catch
  }
};

function App() {
  const [gameState, setGameState] = useState('START'); // 'START' | 'PLAYING' | 'GAMEOVER'
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem('dont_touch_red_muted') === 'true';
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [shakeActive, setShakeActive] = useState(false);

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('dont_touch_red_highscore') || '0', 10);
  });
  const [level, setLevel] = useState(1);
  const [survivalTime, setSurvivalTime] = useState(0);

  // Entities state
  const [playerPos, setPlayerPos] = useState({ x: 380, y: 480 });
  const [enemies, setEnemies] = useState([]);
  const [coins, setCoins] = useState([]);
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [collectParticles, setCollectParticles] = useState([]);
  const [movingDir, setMovingDir] = useState(0); // -1: Left, 0: Center, 1: Right
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [flashActive, setFlashActive] = useState(false);
  const [bgParticles, setBgParticles] = useState([]);

  // Simulation Refs (to run loop at 60fps smoothly without state lag)
  const containerRef = useRef(null);
  const playerRef = useRef({ x: 380, y: 480, width: 40, height: 40 });
  const enemiesRef = useRef([]);
  const coinsRef = useRef([]);
  const floatingTextsRef = useRef([]);
  const collectParticlesRef = useRef([]);
  const scoreRef = useRef(0);
  const survivalTimeRef = useRef(0);
  const levelRef = useRef(1);
  const keysPressed = useRef({});
  const nextId = useRef(0);
  const isMutedRef = useRef(isMuted);

  // Timers
  const enemySpawnTimer = useRef(0);
  const coinSpawnTimer = useRef(0);

  // Keep mute ref updated for loop access
  useEffect(() => {
    isMutedRef.current = isMuted;
    localStorage.setItem('dont_touch_red_muted', isMuted ? 'true' : 'false');
  }, [isMuted]);

  // Track Fullscreen status
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  const togglePause = useCallback(() => {
    if (gameState === 'PLAYING') {
      setIsPaused(prev => !prev);
    }
  }, [gameState]);

  // Background star/particle field
  useEffect(() => {
    const temp = [];
    for (let i = 0; i < 28; i++) {
      temp.push({
        id: i,
        left: Math.random() * 100,
        size: Math.random() * 3 + 1.2,
        delay: Math.random() * 8,
        duration: Math.random() * 7 + 5,
        opacity: Math.random() * 0.4 + 0.15,
      });
    }
    setBgParticles(temp);
  }, []);

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'KeyP') {
        if (gameState === 'PLAYING') {
          e.preventDefault();
          togglePause();
        }
        return;
      }

      if (e.code === 'KeyM') {
        e.preventDefault();
        toggleMute();
        return;
      }

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space'].includes(e.code)) {
        e.preventDefault();
        keysPressed.current[e.code] = true;
      }
    };

    const handleKeyUp = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space'].includes(e.code)) {
        keysPressed.current[e.code] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, togglePause]);

  // Direct Screen Touch Drag Navigation
  const handleGameBoardTouch = (e) => {
    if (gameState !== 'PLAYING' || isPaused || !containerRef.current) return;
    const touch = e.touches[0];
    if (!touch) return;

    const rect = containerRef.current.getBoundingClientRect();
    const touchX = ((touch.clientX - rect.left) / rect.width) * 800;
    const touchY = ((touch.clientY - rect.top) / rect.height) * 600;

    const player = playerRef.current;
    const centerX = player.x + player.width / 2;
    const centerY = player.y + player.height / 2;

    const dx = touchX - centerX;
    const dy = touchY - centerY;

    // Set virtual directional presses based on relative touch drag vector
    const threshold = 15;
    keysPressed.current['ArrowLeft'] = dx < -threshold;
    keysPressed.current['ArrowRight'] = dx > threshold;
    keysPressed.current['ArrowUp'] = dy < -threshold;
    keysPressed.current['ArrowDown'] = dy > threshold;
  };

  const handleGameBoardTouchEnd = () => {
    keysPressed.current['ArrowLeft'] = false;
    keysPressed.current['ArrowRight'] = false;
    keysPressed.current['ArrowUp'] = false;
    keysPressed.current['ArrowDown'] = false;
  };

  // Touch Virtual D-Pad handlers
  const handleVirtualPress = (dirKey, e) => {
    if (e && e.cancelable) e.preventDefault();
    keysPressed.current[dirKey] = true;
  };

  const handleVirtualRelease = (dirKey, e) => {
    if (e && e.cancelable) e.preventDefault();
    keysPressed.current[dirKey] = false;
  };

  // Start / Restart Game Logic
  const startGame = () => {
    playerRef.current = { x: 380, y: 480, width: 40, height: 40 };
    enemiesRef.current = [];
    coinsRef.current = [
      { id: nextId.current++, x: Math.random() * 600 + 100, y: Math.random() * 250 + 150, size: 30 }
    ];
    floatingTextsRef.current = [];
    collectParticlesRef.current = [];
    scoreRef.current = 0;
    survivalTimeRef.current = 0;
    levelRef.current = 1;
    enemySpawnTimer.current = 0;
    coinSpawnTimer.current = 0;
    keysPressed.current = {};

    setPlayerPos({ x: 380, y: 480 });
    setEnemies([]);
    setCoins(coinsRef.current);
    setFloatingTexts([]);
    setCollectParticles([]);
    setMovingDir(0);
    setScore(0);
    setSurvivalTime(0);
    setLevel(1);
    setIsPaused(false);
    setIsNewHighScore(false);
    setShakeActive(false);
    setGameState('PLAYING');
  };

  // Core Game Loop
  useEffect(() => {
    if (gameState !== 'PLAYING' || isPaused) return;

    let lastTime = performance.now();
    let animId;

    const loop = (time) => {
      let dt = (time - lastTime) / 1000;
      if (dt > 0.1) dt = 0.1; // clamp delta to prevent giant teleports
      lastTime = time;

      // 1. Survival timer & level progression
      survivalTimeRef.current += dt;
      const secondsSurvived = Math.floor(survivalTimeRef.current);
      setSurvivalTime(secondsSurvived);

      // Level increases every 10 seconds
      const calculatedLevel = Math.floor(secondsSurvived / 10) + 1;
      if (calculatedLevel > levelRef.current) {
        levelRef.current = calculatedLevel;
        setLevel(calculatedLevel);
        setShowLevelUp(true);
        setFlashActive(true);
        playLevelUpSound(isMutedRef.current);
        setTimeout(() => setShowLevelUp(false), 1600);
        setTimeout(() => setFlashActive(false), 600);
      }

      // 2. Player Movement (WASD / Arrows / Virtual D-Pad)
      const playerSpeed = 360;
      let dx = 0;
      let dy = 0;
      if (keysPressed.current['ArrowLeft'] || keysPressed.current['KeyA']) dx -= 1;
      if (keysPressed.current['ArrowRight'] || keysPressed.current['KeyD']) dx += 1;
      if (keysPressed.current['ArrowUp'] || keysPressed.current['KeyW']) dy -= 1;
      if (keysPressed.current['ArrowDown'] || keysPressed.current['KeyS']) dy += 1;

      // Diagonal speed normalization
      if (dx !== 0 && dy !== 0) {
        dx *= 0.7071;
        dy *= 0.7071;
      }

      const mDir = dx < 0 ? -1 : dx > 0 ? 1 : 0;
      setMovingDir(mDir);

      const player = playerRef.current;
      player.x += dx * playerSpeed * dt;
      player.y += dy * playerSpeed * dt;

      // Bound player to arena coordinates (800 x 600)
      player.x = Math.max(0, Math.min(800 - player.width, player.x));
      player.y = Math.max(0, Math.min(600 - player.height, player.y));
      setPlayerPos({ x: player.x, y: player.y });

      // 3. Enemy Spawning & Updating
      const spawnFrequencyMultiplier = 1 + (levelRef.current - 1) * 0.11;
      const enemySpawnInterval = 1.0 / spawnFrequencyMultiplier;
      enemySpawnTimer.current += dt;

      if (enemySpawnTimer.current >= enemySpawnInterval) {
        enemySpawnTimer.current = 0;
        const size = 36;
        const x = Math.random() * (800 - size);
        const y = -size;
        
        const baseSpeed = Math.random() * 80 + 190;
        const speedMultiplier = Math.pow(1.14, levelRef.current - 1);
        const speed = baseSpeed * speedMultiplier;

        enemiesRef.current.push({
          id: nextId.current++,
          x,
          y,
          width: size,
          height: size,
          speed,
        });
      }

      enemiesRef.current = enemiesRef.current
        .map(enemy => ({ ...enemy, y: enemy.y + enemy.speed * dt }))
        .filter(enemy => enemy.y < 620);
      setEnemies([...enemiesRef.current]);

      // 4. Coin Spawning & Updating
      const coinIntervalMultiplier = 1 + (levelRef.current - 1) * 0.05;
      const coinSpawnInterval = 3.2 * coinIntervalMultiplier;
      coinSpawnTimer.current += dt;

      if ((coinSpawnTimer.current >= coinSpawnInterval && coinsRef.current.length < 3) || coinsRef.current.length === 0) {
        coinSpawnTimer.current = 0;
        const size = 28;
        const x = Math.random() * 700 + 50;
        const y = Math.random() * 320 + 120;

        const distToPlayer = Math.hypot(x - (player.x + player.width / 2), y - (player.y + player.height / 2));
        if (distToPlayer > 120) {
          coinsRef.current.push({
            id: nextId.current++,
            x,
            y,
            size,
          });
        }
      }
      setCoins([...coinsRef.current]);

      // 5. Collision Detection
      // Player vs Enemy (AABB)
      let gameOverTriggered = false;
      for (let i = 0; i < enemiesRef.current.length; i++) {
        const enemy = enemiesRef.current[i];
        if (
          player.x < enemy.x + enemy.width &&
          player.x + player.width > enemy.x &&
          player.y < enemy.y + enemy.height &&
          player.y + player.height > enemy.y
        ) {
          gameOverTriggered = true;
          break;
        }
      }

      if (gameOverTriggered) {
        playGameOverSound(isMutedRef.current);
        setShakeActive(true);
        setGameState('GAMEOVER');

        const finalScore = scoreRef.current;
        const savedHighScore = parseInt(localStorage.getItem('dont_touch_red_highscore') || '0', 10);
        if (finalScore > savedHighScore) {
          localStorage.setItem('dont_touch_red_highscore', finalScore.toString());
          setHighScore(finalScore);
          setIsNewHighScore(true);
        } else {
          setIsNewHighScore(false);
        }
        setTimeout(() => setShakeActive(false), 500);
        return;
      }

      // Player vs Energy Coin (Circle hit detection)
      const initialCoinCount = coinsRef.current.length;
      coinsRef.current = coinsRef.current.filter(coin => {
        const px = player.x + player.width / 2;
        const py = player.y + player.height / 2;
        const dist = Math.hypot(px - coin.x, py - coin.y);
        const hitDistance = 20 + 14;

        if (dist < hitDistance) {
          playCoinSound(isMutedRef.current);
          scoreRef.current += 10;
          setScore(scoreRef.current);

          floatingTextsRef.current.push({
            id: nextId.current++,
            x: coin.x,
            y: coin.y,
            text: '+10',
            life: 0.8,
          });

          // Burst particles
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + Math.random() * 0.4;
            const speed = Math.random() * 140 + 80;
            collectParticlesRef.current.push({
              id: nextId.current++,
              x: coin.x,
              y: coin.y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              size: Math.random() * 5 + 3,
              life: 0.55,
              maxLife: 0.55
            });
          }

          return false;
        }
        return true;
      });

      if (coinsRef.current.length !== initialCoinCount) {
        setCoins([...coinsRef.current]);
      }

      // 6. Floating texts & Particle updates
      floatingTextsRef.current = floatingTextsRef.current
        .map(ft => ({
          ...ft,
          y: ft.y - 50 * dt,
          life: ft.life - dt,
        }))
        .filter(ft => ft.life > 0);
      setFloatingTexts([...floatingTextsRef.current]);

      collectParticlesRef.current = collectParticlesRef.current
        .map(p => ({
          ...p,
          x: p.x + p.vx * dt,
          y: p.y + p.vy * dt,
          life: p.life - dt,
        }))
        .filter(p => p.life > 0);
      setCollectParticles([...collectParticlesRef.current]);

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, isPaused]);

  return (
    <div className="game-window">
      {/* Dynamic Starfield / Cyber Grid Background */}
      <div className="bg-particles" aria-hidden="true">
        {bgParticles.map(p => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              opacity: p.opacity,
            }}
          />
        ))}
        <div className="cyber-grid-overlay" />
      </div>

      {/* Main Responsive Game Board */}
      <div 
        ref={containerRef}
        className={`game-container ${flashActive ? 'level-up-flash' : ''} ${shakeActive ? 'screen-shake' : ''}`}
        onTouchStart={handleGameBoardTouch}
        onTouchMove={handleGameBoardTouch}
        onTouchEnd={handleGameBoardTouchEnd}
      >
        {/* HUD is persistent during gameplay and pause */}
        <HUD
          score={score}
          highScore={highScore}
          level={level}
          survivalTime={survivalTime}
          isPaused={isPaused}
          onTogglePause={togglePause}
          isMuted={isMuted}
          onToggleMute={toggleMute}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
        />

        {/* Level Up Pop Alert */}
        {showLevelUp && (
          <div className="level-up-banner">
            <span className="banner-sub">DIFFICULTY UP</span>
            <span className="banner-main">LEVEL {level}</span>
          </div>
        )}

        {/* Pause Screen Overlay */}
        {isPaused && gameState === 'PLAYING' && (
          <div className="pause-overlay">
            <div className="pause-card">
              <div className="pause-icon">⏸</div>
              <h2 className="pause-title">MISSION PAUSED</h2>
              <p className="pause-text">Press <strong>P</strong> or tap Resume to continue</p>
              <button 
                type="button" 
                className="btn-neon pulse-glow" 
                onClick={togglePause}
              >
                RESUME RUN
              </button>
            </div>
          </div>
        )}

        {/* Entities Rendering */}
        {gameState === 'PLAYING' && (
          <>
            <Player x={playerPos.x} y={playerPos.y} movingDir={movingDir} />
            
            {enemies.map(enemy => (
              <Enemy
                key={enemy.id}
                x={enemy.x}
                y={enemy.y}
                width={enemy.width}
                height={enemy.height}
              />
            ))}

            {coins.map(coin => (
              <Coin
                key={coin.id}
                x={coin.x}
                y={coin.y}
                size={coin.size}
              />
            ))}

            {collectParticles.map(p => (
              <div
                key={p.id}
                className="collect-particle"
                style={{
                  left: `${(p.x / 800) * 100}%`,
                  top: `${(p.y / 600) * 100}%`,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  opacity: p.life / p.maxLife,
                }}
              />
            ))}

            {floatingTexts.map(ft => (
              <div
                key={ft.id}
                className="score-pop"
                style={{
                  left: `${(ft.x / 800) * 100}%`,
                  top: `${(ft.y / 600) * 100}%`,
                  opacity: ft.life / 0.8,
                }}
              >
                {ft.text}
              </div>
            ))}
          </>
        )}

        {/* Start Screen Overlay */}
        {gameState === 'START' && (
          <StartScreen onStart={startGame} highScore={highScore} />
        )}

        {/* Game Over Screen Overlay */}
        {gameState === 'GAMEOVER' && (
          <GameOver
            score={score}
            highScore={highScore}
            level={level}
            survivalTime={survivalTime}
            isNewHighScore={isNewHighScore}
            onRestart={startGame}
          />
        )}
      </div>

      {/* Responsive Ergonomic Virtual Touch D-Pad for Mobile & Tablets */}
      {gameState === 'PLAYING' && (
        <nav className="mobile-controls-panel" aria-label="Mobile Touch Controls">
          <div className="dpad-cluster">
            <button 
              type="button"
              className="dpad-btn dpad-up"
              onTouchStart={(e) => handleVirtualPress('ArrowUp', e)}
              onTouchEnd={(e) => handleVirtualRelease('ArrowUp', e)}
              onMouseDown={(e) => handleVirtualPress('ArrowUp', e)}
              onMouseUp={(e) => handleVirtualRelease('ArrowUp', e)}
              aria-label="Move Up"
            >
              ▲
            </button>

            <button 
              type="button"
              className="dpad-btn dpad-left"
              onTouchStart={(e) => handleVirtualPress('ArrowLeft', e)}
              onTouchEnd={(e) => handleVirtualRelease('ArrowLeft', e)}
              onMouseDown={(e) => handleVirtualPress('ArrowLeft', e)}
              onMouseUp={(e) => handleVirtualRelease('ArrowLeft', e)}
              aria-label="Move Left"
            >
              ◀
            </button>

            <button 
              type="button"
              className="dpad-btn dpad-center"
              onClick={togglePause}
              aria-label="Pause"
            >
              {isPaused ? '▶' : '⏸'}
            </button>

            <button 
              type="button"
              className="dpad-btn dpad-right"
              onTouchStart={(e) => handleVirtualPress('ArrowRight', e)}
              onTouchEnd={(e) => handleVirtualRelease('ArrowRight', e)}
              onMouseDown={(e) => handleVirtualPress('ArrowRight', e)}
              onMouseUp={(e) => handleVirtualRelease('ArrowRight', e)}
              aria-label="Move Right"
            >
              ▶
            </button>

            <button 
              type="button"
              className="dpad-btn dpad-down"
              onTouchStart={(e) => handleVirtualPress('ArrowDown', e)}
              onTouchEnd={(e) => handleVirtualRelease('ArrowDown', e)}
              onMouseDown={(e) => handleVirtualPress('ArrowDown', e)}
              onMouseUp={(e) => handleVirtualRelease('ArrowDown', e)}
              aria-label="Move Down"
            >
              ▼
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}

export default App;
