// Physics configuration: tweak values here to change world behavior.
// Simple switches (true/false) and numbers are easiest to experiment with.

export const categories = {
  default: 0x0001,
  base: 0x0002,
  green: 0x0004,
  rain: 0x0008,
};

// Collision masks describe what each category collides with.
// If unsure, leave as-is and just toggle booleans below.
export const collide = {
  // Base cats collide with world boundaries and other base cats
  base: {
    withDefault: true,
    withBase: true,
    withGreen: false,
    withRain: false,
  },
  // Rain cats fall through world boundaries and base cats, can bounce with rain/green
  rain: {
    withDefault: false,
    withBase: false,
    withGreen: true,
    withRain: true,
  },
};

// Build bitmasks from booleans above
export function buildMasks() {
  const { default: DEF, base: BASE, green: GREEN, rain: RAIN } = categories;
  const baseMask =
    (collide.base.withDefault ? DEF : 0) |
    (collide.base.withBase ? BASE : 0) |
    (collide.base.withGreen ? GREEN : 0) |
    (collide.base.withRain ? RAIN : 0);
  const rainMask =
    (collide.rain.withDefault ? DEF : 0) |
    (collide.rain.withBase ? BASE : 0) |
    (collide.rain.withGreen ? GREEN : 0) |
    (collide.rain.withRain ? RAIN : 0);
  return { baseMask, rainMask };
}

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

export function pickInRange(range) {
  return range.min + Math.random() * (range.max - range.min);
}
