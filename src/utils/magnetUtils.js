export const getMagnetDistance = (magnetMode) => {
  switch (magnetMode) {
    case 'small': return 8;
    case 'medium': return 15;
    case 'large': return 25;
    case 'off':
    default:
      return 0;
  }
};

export const applyMagnetSnap = (x, y, magnetMode, gridSize = 20) => {
  const magnetDistance = getMagnetDistance(magnetMode);
  
  if (magnetDistance === 0) {
    return { x, y };
  }

  const snapX = Math.round(x / gridSize) * gridSize;
  const snapY = Math.round(y / gridSize) * gridSize;

  const distanceX = Math.abs(x - snapX);
  const distanceY = Math.abs(y - snapY);

  return {
    x: distanceX <= magnetDistance ? snapX : x,
    y: distanceY <= magnetDistance ? snapY : y
  };
};