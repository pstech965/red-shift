import React from 'react';

const Coin = ({ x, y, size = 30 }) => {
  const style = {
    left: `${(x / 800) * 100}%`,
    top: `${(y / 600) * 100}%`,
    width: `${(size / 800) * 100}%`,
    aspectRatio: '1 / 1',
  };

  return (
    <div 
      className="entity coin" 
      style={style} 
      aria-label="Energy Core"
    >
      <div className="coin-ring"></div>
      <div className="coin-core"></div>
      <div className="coin-glint"></div>
    </div>
  );
};

export default Coin;
