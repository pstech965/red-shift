import React, { useEffect } from 'react';

const GameOver = ({ score, highScore, survivalTime, level = 1, isNewHighScore = false, onRestart }) => {
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60).toString().padStart(2, '0');
    const seconds = (timeInSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  // Listen for Spacebar or Enter key to quickly restart
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        onRestart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRestart]);

  return (
    <div className="screen-overlay game-over-overlay">
      <div className="cyber-decor-line danger-decor top-decor"></div>

      {isNewHighScore && (
        <div className="new-record-badge">
          <span>🏆</span> NEW ALL-TIME RECORD!
        </div>
      )}

      <h1 className="screen-title danger cyber-glitch" data-text="SYSTEM CRITICAL">
        GAME OVER
      </h1>

      <p className="screen-subtitle danger-sub">
        Runner intercepted by red hazard. Mission failed.
      </p>

      {/* Stats Telemetry Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Final Score</div>
          <div className="stat-value text-success">{score}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Max Level</div>
          <div className="stat-value text-purple">{level}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Time Survived</div>
          <div className="stat-value text-cyan">{formatTime(survivalTime)}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Personal Best</div>
          <div className="stat-value text-gold">{highScore}</div>
        </div>
      </div>

      <button 
        type="button"
        className="btn-neon danger pulse-glow" 
        onClick={onRestart}
        autoFocus
      >
        <span className="btn-text">REBOOT RUNNER</span>
        <span className="btn-arrow">↺</span>
      </button>

      <p className="restart-hint">
        Press <strong>Space</strong> / <strong>Enter</strong> or Tap button to restart
      </p>

      <div className="cyber-decor-line danger-decor bottom-decor"></div>
    </div>
  );
};

export default GameOver;
