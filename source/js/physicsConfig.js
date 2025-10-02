// Physics configuration: tweak values here to change world behavior.
// Simple switches (true/false) and numbers are easiest to experiment with.

// Collision masks describe what each category collides with.
// If unsure, leave as-is and just toggle booleans below.
export const collide = {
  // Base cats collide with world boundaries and other base cats
  baseCat: {
    withWorldBoundary: true,
    withBaseCat: true,
    withObstacle: false,
    withRainCat: true,
  },
  // Rain cats fall through world boundaries and base cats, can bounce with rain/obstacle
  rainCat: {
    withWorldBoundary: false,
    withBaseCat: true,
    withObstacle: true,
    withRainCat: true,
  },
};

// World/bodies tunables
export const tunables = {
  baseCat: {
    restitution: { min: 0.65, max: 0.9 },
    friction: { min: 0.15, max: 0.4 },
    frictionAir: { min: 0.0005, max: 0.002 },
    density: { min: 0.0015, max: 0.0035 },
    radius: {
      small: 60,
      medium: 80,
      large: 100,
    },
  },
  rainCat: {
    restitution: 0.9,
    friction: 0.2,
    frictionAir: 0.001,
    density: 0.0025,
  },
  rain: {
    batchMs: 500,
    hiddenBatchMs: 1200,
    spawnAngularVel: 0.02,
    spawnVelY: { min: 18, max: 30 },
    spawnVelX: { min: -2, max: 2 },
  },
};

// Build bitmasks from booleans above

export const categories = {
  worldBoundary: 0x0001,
  baseCat: 0x0002,
  obstacle: 0x0004,
  rainCat: 0x0008,
};

export function buildMasks() {
  const {
    worldBoundary: WORLD,
    baseCat: BASE,
    obstacle: OBST,
    rainCat: RAIN,
  } = categories;
  const baseCatMask =
    (collide.baseCat.withWorldBoundary ? WORLD : 0) |
    (collide.baseCat.withBaseCat ? BASE : 0) |
    (collide.baseCat.withObstacle ? OBST : 0) |
    (collide.baseCat.withRainCat ? RAIN : 0);
  const rainCatMask =
    (collide.rainCat.withWorldBoundary ? WORLD : 0) |
    (collide.rainCat.withBaseCat ? BASE : 0) |
    (collide.rainCat.withObstacle ? OBST : 0) |
    (collide.rainCat.withRainCat ? RAIN : 0);
  return { baseCatMask, rainCatMask };
}

export function pickInRange(range) {
  return range.min + Math.random() * (range.max - range.min);
}
