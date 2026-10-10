import React from 'react';

const Enemy = ({ x, y, width = 40, height = 40 }) => {
  const style = {
    left: `${(x / 800) * 100}%`,
    top: `${(y / 600) * 100}%`,
    width: `${(width / 800) * 100}%`,
    height: `${(height / 600) * 100}%`,
  };

  return (
    <div 
      className="entity enemy" 
      style={style} 
      aria-label="Hazard Block"
    >
      <div className="enemy-core"></div>
      <div className="enemy-warning-glow"></div>
      <div className="enemy-tail"></div>
    </div>
  );
};

export default Enemy;
