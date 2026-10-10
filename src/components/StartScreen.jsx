import React from 'react';

const StartScreen = ({ onStart, highScore }) => {
  return (
    <div className="screen-overlay start-screen-overlay">
      <div className="cyber-decor-line top-decor"></div>
      
      <div className="screen-hero">
        <div className="game-badge">NEON CYBER RUNNER</div>
        <h1 className="screen-title cyber-glitch" data-text="DON'T TOUCH RED">
          DON'T TOUCH RED
        </h1>
        <p className="screen-subtitle">
          Hyper-speed arcade survival. Test your reflexes against falling hazards.
        </p>
      </div>

      {/* Rules / Visual Guides */}
      <div className="rules-grid">
        <div className="rule-card player-rule">
          <div className="rule-symbol-box player-box">
            <div className="mini-player"></div>
          </div>
          <div className="rule-details">
            <div className="rule-name">YOU</div>
            <div className="rule-desc">Dodge hazards with WASD, Arrows, or D-Pad</div>
          </div>
        </div>

        <div className="rule-card danger-rule">
          <div className="rule-symbol-box danger-box">
            <div className="mini-danger"></div>
          </div>
          <div className="rule-details">
            <div className="rule-name">RED HAZARDS</div>
            <div className="rule-desc">Don't touch! Falling speed scales every 10s</div>
          </div>
        </div>

        <div className="rule-card bonus-rule">
          <div className="rule-symbol-box bonus-box">
            <div className="mini-coin"></div>
          </div>
          <div className="rule-details">
            <div className="rule-name">ENERGY CORES</div>
            <div className="rule-desc">Collect for +10 score & spark bonus</div>
          </div>
        </div>
      </div>

      {highScore > 0 && (
        <div className="high-score-banner">
          <span className="trophy-icon">🏆</span> Current High Score: <strong>{highScore}</strong>
        </div>
      )}

      {/* Primary Action Button */}
      <button 
        type="button" 
        className="btn-neon pulse-glow" 
        onClick={onStart}
        autoFocus
      >
        <span className="btn-text">START MISSION</span>
        <span className="btn-arrow">▶</span>
      </button>

      <div className="controls-hint">
        <span className="desktop-hint">⌨️ <strong>WASD / Arrows</strong> to Move • <strong>P</strong> to Pause</span>
        <span className="mobile-hint">📱 Touch virtual D-Pad or swipe screen to guide runner</span>
      </div>

      <div className="cyber-decor-line bottom-decor"></div>
    </div>
  );
};

export default StartScreen;
