import React from 'react';

const HUD = ({ 
  score, 
  highScore, 
  level, 
  survivalTime, 
  isPaused, 
  onTogglePause, 
  isMuted, 
  onToggleMute,
  onToggleFullscreen,
  isFullscreen
}) => {
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60).toString().padStart(2, '0');
    const seconds = (timeInSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  return (
    <header className="hud-container" aria-label="Game Heads-up Display">
      {/* Left stats: Score & Level */}
      <div className="hud-group">
        <div className="hud-badge score-badge">
          <span className="hud-icon">💎</span>
          <div className="hud-info">
            <span className="hud-label">Score</span>
            <span key={score} className="hud-value success score-pop-hud">{score}</span>
          </div>
        </div>
        
        <div className="hud-badge level-badge">
          <span className="hud-icon">⚡</span>
          <div className="hud-info">
            <span className="hud-label">Level</span>
            <span className="hud-value level-highlight">{level}</span>
          </div>
        </div>
      </div>
      
      {/* Center stats: Survival Time */}
      <div className="hud-group center-group">
        <div className="hud-badge time-badge">
          <span className="hud-icon">⏱️</span>
          <div className="hud-info">
            <span className="hud-label">Time</span>
            <span className="hud-value">{formatTime(survivalTime)}</span>
          </div>
        </div>
      </div>

      {/* Right stats & action controls */}
      <div className="hud-group right-group">
        <div className="hud-badge best-badge">
          <span className="hud-icon">👑</span>
          <div className="hud-info">
            <span className="hud-label">Best</span>
            <span className="hud-value best-highlight">{highScore}</span>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="hud-actions">
          <button 
            type="button"
            className={`hud-btn ${isMuted ? 'active-alert' : ''}`}
            onClick={onToggleMute}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>

          <button 
            type="button"
            className={`hud-btn ${isPaused ? 'active-pause' : ''}`}
            onClick={onTogglePause}
            title={isPaused ? 'Resume Game (P)' : 'Pause Game (P)'}
            aria-label={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? '▶' : '⏸'}
          </button>

          {onToggleFullscreen && (
            <button 
              type="button"
              className="hud-btn desktop-only-btn"
              onClick={onToggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              aria-label="Toggle Fullscreen"
            >
              {isFullscreen ? '⤓' : '⛶'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default HUD;
