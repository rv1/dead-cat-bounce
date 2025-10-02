import '@/css/application.scss'
import '@/js/modal.js'
import Matter from 'matter-js'
import { PixiCatRenderer } from '@/js/pixiRenderer.js'

import cat_1 from '@/img/cats/cat_1.png'
import cat_2 from '@/img/cats/cat_2.png'
import cat_3 from '@/img/cats/cat_3.png'
import cat_4 from '@/img/cats/cat_4.png'
import cat_5 from '@/img/cats/cat_5.png'
import cat_6 from '@/img/cats/cat_6.png'
import rcat_1 from '@/img/rainbow/cat_1.png'
import rcat_2 from '@/img/rainbow/cat_2.png'
import rcat_3 from '@/img/rainbow/cat_3.png'
import rcat_4 from '@/img/rainbow/cat_4.png'
import rcat_5 from '@/img/rainbow/cat_5.png'
import rcat_6 from '@/img/rainbow/cat_6.png'

const cats = [cat_1, cat_2, cat_3, cat_4, cat_5, cat_6];
const rainbow_cats = [rcat_1, rcat_2, rcat_3, rcat_4, rcat_5, rcat_6];
const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;
// const Events = Matter.Events;
const Body = Matter.Body;
// const Composites = Matter.Composites;
const MouseConstraint = Matter.MouseConstraint;
const Mouse = Matter.Mouse;
let engine = Engine.create();
const _restitution = 0.9;
const _friction = 0.2;
const _frictionAir = 0.001;
const _frictionStatic = 0.5;
const _density = 0.0025;
const mirain = document.getElementById('makeItRain');
const defaultCategory = 0x0001;
const redCategory = 0x0002;
const greenCategory = 0x0004;
const blueCategory = 0x0008;
const cArr = [];
// Track rainbow mode if needed later (currently unused)
// let rainbow = false;
let isRaining = false;
let spawnAccumulator = 0;
const FIXED_MS = 1000 / 60;
let lastMS = performance.now();
let catRoundRobinIndex = 0;
let rainbowRoundRobinIndex = 0;
// const RAIN_BATCH_SIZE = 8;
// const MAX_RAIN_BODIES = 160;

function setAnimatedButtonText(text, isContinuous) {
  const txt = document.querySelector('#makeItRain .txt');
  if (!txt) return;
  if (txt.__lastText !== text) {
    const chars = (text || '').trim().split("");
    txt.innerHTML = `<span>${chars.join('</span><span>')}</span>`;
    txt.__lastText = text;
  }
  txt.classList.toggle('anim-text-flow', !!isContinuous);
  txt.classList.toggle('anim-text-flow-hover', !isContinuous);
}
let width = window.innerWidth;
let height = window.innerHeight;
let sx = width >= 414 ? 1 : 0.5;
let sy = width >= 414 ? 1 : 0.5;
// legacy counters (unused)
let pixiRenderer = null;
const getRandomArbitrary = (min, max) => Math.random() * (max - min) + min;
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
// Mobile-aware sizing helpers
const getCatRadius = () => {
  const w = window.innerWidth;
  if (w < 400) return 60;
  if (w < 768) return 80;
  return 100;
};
const getRainBatchSize = () => {
  const w = window.innerWidth;
  if (w < 400) return 4;
  if (w < 768) return 6;
  return 8;
};
const getMaxRainBodies = () => {
  const w = window.innerWidth;
  if (w < 400) return 80;
  if (w < 768) return 120;
  return 160;
};
/* Unused: generator kept for reference
const generateCats = function generateCats(arr) {
  const width = window.innerWidth;
  const sx = width >= 414 ? 1 : 0.5;
  const sy = width >= 414 ? 1 : 0.5;
  let index = 0;
  const stack = Composites.stack(0, 50, 10, 1, 10, 0, (x, y) => {
    const texture = arr[index];
    index = (index + 1) % arr.length;
    return Bodies.circle(x, y, 100, {
      restitution: _restitution,
      friction: _friction,
      frictionAir: _frictionAir,
      frictionStatic: _frictionStatic,
      density: _density,
      collisionFilter: {
        // Rain cats should not collide with default world boundaries (floor/walls)
        category: blueCategory,
        mask: redCategory | greenCategory | blueCategory
      },
      label: 'rainCat',
      render: {
        sprite: {
          texture,
          xScale: sx,
          yScale: sy
        }
      }
    });
  });
  return stack;
};
*/
const init = function init() {
  document.querySelectorAll('canvas').forEach((el) => el.remove());
  if (pixiRenderer) {
    pixiRenderer.destroy();
    pixiRenderer = null;
  }
  const colorOne = `#${Math.random().toString(16).slice(2, 8).toUpperCase()}`;
  const colorTwo = "#fff";
  const orientation = "180deg";
  width = window.innerWidth;
  height = window.innerHeight;
  sx = width >= 414 ? 1 : 0.5
  sy = width >= 414 ? 1 : 0.5
  World.clear(engine.world);
  Engine.clear(engine);
  engine = Engine.create({
    positionIterations: 4,
    velocityIterations: 6,
    constraintIterations: 2
  });
  engine.timing.timeScale = 1
  // Create high-performance Pixi renderer for sprites
  pixiRenderer = new PixiCatRenderer({ width, height, textures: { cats, rainbow_cats } });
  document.body.style.backgroundImage = `linear-gradient(${orientation}, ${colorOne}, ${colorTwo})`;
  World.add(engine.world, [
    Bodies.rectangle(width / 2, height + 50, width, 100, {
      isStatic: true
    }),
    Bodies.rectangle(width / 2, -50, width, 100, {
      isStatic: true
    }),
    Bodies.rectangle(-100, height / 2, 200, height, {
      isStatic: true
    }),
    Bodies.rectangle(width + 100, height / 2, 200, height, {
      isStatic: true
    })
  ]);
  const baseRadius = getCatRadius();
  cats.forEach((i, v) => {
    const startX = (width / 7) * (v + 1);
    const baseRestitution = 0.65 + Math.random() * 0.25; // 0.65 - 0.90
    const baseFriction = 0.15 + Math.random() * 0.25;    // 0.15 - 0.40
    const baseFrictionAir = 0.0005 + Math.random() * 0.0015; // 0.0005 - 0.002
    const baseDensity = 0.0015 + Math.random() * 0.002;  // 0.0015 - 0.0035
    cArr[v] = Bodies.circle(startX, 150, baseRadius, {
      label: 'baseCat',
      restitution: baseRestitution,
      friction: baseFriction,
      frictionAir: baseFrictionAir,
      frictionStatic: 0.2,
      density: baseDensity,
      collisionFilter: {
        category: redCategory,
        mask: defaultCategory | redCategory // collide with walls and other base cats
      },
      render: {
        sprite: {
          texture: i,
          xScale: 1,
          yScale: 1
        }
      }
    });
    World.add(engine.world, cArr[v]);
    Body.setVelocity(cArr[v], { x: 0, y: 2 });
  });
  const mouse = Mouse.create(pixiRenderer.app.view);
  // Match Pixi renderer resolution to avoid click/touch offset on high-DPR screens
  mouse.pixelRatio = pixiRenderer.app.renderer.resolution || 1;
  const mouseConstraint = MouseConstraint.create(engine, {
    mouse,
    constraint: {
      stiffness: 0.2,
      render: {
        visible: false
      }
    }
  });
  World.add(engine.world, mouseConstraint);
  // Install Pixi-driven fixed timestep loop once
  if (pixiRenderer?.app && !pixiRenderer.__loopInstalled) {
    pixiRenderer.__loopInstalled = true;
    pixiRenderer.app.ticker.add(() => {
      const now = performance.now();
      let dt = now - lastMS;
      lastMS = now;
      let acc = dt;
      const hidden = document.hidden;
      const targetRainMs = hidden ? 1200 : 500;
      // snapshot previous state for interpolation
      const bodies = engine.world.bodies;
      for (let i = 0; i < bodies.length; i++) {
        const b = bodies[i];
        if (!b.render) b.render = {};
        b.render.__prev = { x: b.position.x, y: b.position.y, angle: b.angle };
      }
      while (acc >= FIXED_MS) {
        Engine.update(engine, FIXED_MS);
        if (isRaining) {
          spawnAccumulator += FIXED_MS;
          if (spawnAccumulator >= targetRainMs) {
            spawnRainBatch();
            spawnAccumulator = 0;
          }
        }
        acc -= FIXED_MS;
      }
      // compute interpolation factor from remainder
      const alpha = acc / FIXED_MS;
      const h = window.innerHeight;
      const w = window.innerWidth;
      engine.world.bodies
        .filter(b => b.label === 'rainCat' && (b.position.y > h + 120 || b.position.x < -150 || b.position.x > w + 150))
        .forEach(b => World.remove(engine.world, b));
      engine.world.bodies
        .filter(b => b.label === 'baseCat')
        .forEach(b => {
          if (b.position.y > h - 120 && Math.abs(b.velocity.y) < 1.5) {
            Body.setVelocity(b, { x: b.velocity.x, y: -18 - Math.random() * 6 });
            Body.setAngularVelocity(b, 0.02 * getRandomArbitrary(-5, 5));
          }
        });
      // write interpolated positions for renderer
      for (let i = 0; i < bodies.length; i++) {
        const b = bodies[i];
        const p = b.render && b.render.__prev ? b.render.__prev : { x: b.position.x, y: b.position.y, angle: b.angle };
        if (!b.render) b.render = {};
        b.render.__interp = {
          x: p.x + (b.position.x - p.x) * alpha,
          y: p.y + (b.position.y - p.y) * alpha,
          angle: p.angle + (b.angle - p.angle) * alpha
        };
      }
      if (pixiRenderer) {
        pixiRenderer.syncBodies(
          engine.world.bodies,
          (body) => (body.render && body.render.sprite ? body.render.sprite.texture : null),
          (body) => (body.render && body.render.sprite ? { xScale: body.render.sprite.xScale || 1, yScale: body.render.sprite.yScale || 1 } : { xScale: 1, yScale: 1 })
        );
      }
    });
  }
};
const spawnRainBatch = () => {
  const width = window.innerWidth;
  const currentRain = engine.world.bodies.reduce((n, b) => n + (b.label === 'rainCat' ? 1 : 0), 0);
  const maxRain = getMaxRainBodies();
  if (currentRain >= maxRain) return;
  const remaining = maxRain - currentRain;
  const targetBatch = getRainBatchSize();
  const toSpawn = Math.min(targetBatch, Math.max(0, remaining));
  const bodies = [];
  for (let i = 0; i < toSpawn; i++) {
    const useRainbow = Math.random() < 0.2;
    const texture = useRainbow
      ? rainbow_cats[(rainbowRoundRobinIndex++) % rainbow_cats.length]
      : cats[(catRoundRobinIndex++) % cats.length];
    const x = getRandomArbitrary(50, width - 50);
    const y = -200 - getRandomArbitrary(0, 200);
    const body = Bodies.circle(x, y, getCatRadius(), {
      restitution: _restitution,
      friction: _friction,
      frictionAir: _frictionAir,
      frictionStatic: _frictionStatic,
      density: _density,
      collisionFilter: {
        category: blueCategory,
        mask: redCategory | greenCategory | blueCategory
      },
      label: 'rainCat',
      render: {
        sprite: {
          texture,
          xScale: 1,
          yScale: 1
        }
      }
    });
    bodies.push(body);
  }
  World.add(engine.world, bodies);
  bodies.forEach((body) => {
    Body.setAngularVelocity(body, 0.02 * getRandomArbitrary(-5, 5));
    Body.setVelocity(body, { x: getRandomArbitrary(-2, 2), y: getRandomArbitrary(18, 30) });
  });
};

const startRain = () => {
  if (isRaining) return;
  isRaining = true;
  // rainbow = true;
  setAnimatedButtonText('Stop Rain', true);
  document.getElementById('makeItRain')?.classList.add('raining');
  spawnAccumulator = 9999; // trigger immediate first batch in loop
};

const stopRain = () => {
  isRaining = false;
  // rainbow = false;
  setAnimatedButtonText('Make It Rain', false);
  document.getElementById('makeItRain')?.classList.remove('raining');
};

mirain?.addEventListener('click', () => {
  if (isRaining) {
    stopRain();
  } else {
    startRain();
  }
});
// Spawn a single cat inside the current viewport using round-robin texture selection
const spawnOneCatInView = () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const useRainbow = Math.random() < 0.2;
  const texture = useRainbow
    ? rainbow_cats[(rainbowRoundRobinIndex++) % rainbow_cats.length]
    : cats[(catRoundRobinIndex++) % cats.length];
  const x = getRandomArbitrary(80, w - 80);
  const y = getRandomArbitrary(120, h - 220);
  const body = Bodies.circle(x, y, 100, {
    label: 'baseCat',
    restitution: 0.65 + Math.random() * 0.25,
    friction: 0.15 + Math.random() * 0.25,
    frictionAir: 0.0005 + Math.random() * 0.0015,
    frictionStatic: 0.2,
    density: 0.0015 + Math.random() * 0.002,
    collisionFilter: {
      category: redCategory,
      mask: defaultCategory | redCategory
    },
    render: {
      sprite: {
        texture,
        xScale: sx,
        yScale: sy
      }
    }
  });
  World.add(engine.world, body);
  Body.setAngularVelocity(body, 0.02 * getRandomArbitrary(-5, 5));
  Body.setVelocity(body, { x: getRandomArbitrary(-2, 2), y: getRandomArbitrary(-3, 3) });
};

// Remove a random cat currently visible within the viewport
const removeOneCatInView = () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const visibleCats = engine.world.bodies.filter(b =>
    (b.label === 'baseCat' || b.label === 'rainCat') &&
    b.position.x >= -20 && b.position.x <= w + 20 &&
    b.position.y >= -20 && b.position.y <= h + 20
  );
  if (!visibleCats.length) return;
  const idx = getRandomInt(0, visibleCats.length - 1);
  World.remove(engine.world, visibleCats[idx]);
};

document.querySelector('.js-spawn-cat')?.addEventListener('click', spawnOneCatInView);
document.querySelector('.js-remove-cat')?.addEventListener('click', removeOneCatInView);
document.querySelectorAll('.txt').forEach((el) => {
  const chars = (el.textContent || '').trim().split("");
  el.innerHTML = `<span>${chars.join('</span><span>')}</span>`;
});
init();
window.addEventListener('resize', () => {
  if (!isRaining) {
    init();
  }
  if (pixiRenderer) {
    pixiRenderer.resize(window.innerWidth, window.innerHeight);
  }
});

// Visibility-aware performance tuning
document.addEventListener('visibilitychange', () => {
  const hidden = document.hidden;
  engine.timing.timeScale = hidden ? 0.7 : 1;
});
