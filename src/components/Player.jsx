import React from 'react';

const Player = ({ x, y, width = 40, height = 40, movingDir = 0 }) => {
  // Determine lean angle based on movement direction
  const rotation = movingDir === -1 ? -8 : movingDir === 1 ? 8 : 0;

  const style = {
    left: `${(x / 800) * 100}%`,
    top: `${(y / 600) * 100}%`,
    width: `${(width / 800) * 100}%`,
    height: `${(height / 600) * 100}%`,
    transform: rotation ? `rotate(${rotation}deg)` : 'none',
  };

  return (
    <div 
      className="entity player" 
      style={style} 
      id="player"
      aria-label="Player Character"
    >
      <div className="player-inner-core"></div>
      <div className="player-visor"></div>
      <div className="player-thruster-left"></div>
      <div className="player-thruster-right"></div>
    </div>
  );
};

export default Player;
