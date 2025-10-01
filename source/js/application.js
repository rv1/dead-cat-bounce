import '@/css/application.scss'
import '@/js/modal.js'
import '@/js/wobbler.js'
import '@/js/decomp.js'
import '@/js/pathseg.js'
import Matter from 'matter-js'
import { PixiCatRenderer } from '@/js/pixiRenderer.js'

const cats = [
  require("@/img/cats/cat_1.png"),
  require("@/img/cats/cat_2.png"),
  require("@/img/cats/cat_3.png"),
  require("@/img/cats/cat_4.png"),
  require("@/img/cats/cat_5.png"),
  require("@/img/cats/cat_6.png")
];
const rainbow_cats = [
  require("@/img/rainbow/cat_1.png"),
  require("@/img/rainbow/cat_2.png"),
  require("@/img/rainbow/cat_3.png"),
  require("@/img/rainbow/cat_4.png"),
  require("@/img/rainbow/cat_5.png"),
  require("@/img/rainbow/cat_6.png")
];
const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Events = Matter.Events;
const Body = Matter.Body;
const Svg = Matter.Svg;
const Vertices = Matter.Vertices;
const Composites = Matter.Composites;
const MouseConstraint = Matter.MouseConstraint;
const Mouse = Matter.Mouse;
let engine = Engine.create();
const _restitution = 0.9;
const _friction = 0.2;
const _frictionAir = 0.001;
const _frictionStatic = 0.5;
const _density = 0.0025;
const mirain = $("#makeItRain");
const defaultCategory = 0x0001;
const redCategory = 0x0002;
const greenCategory = 0x0004;
const blueCategory = 0x0008;
const cArr = [];
let rainbow = false;
let isRaining = false;
let rainInterval = null;
let catRoundRobinIndex = 0;
let rainbowRoundRobinIndex = 0;
const RAIN_BATCH_SIZE = 8;

function setAnimatedButtonText(text, isContinuous) {
  const $txt = $('#makeItRain .txt');
  const chars = $.trim(text).split("");
  $txt.html(`<span>${chars.join('</span><span>')}</span>`);
  if (isContinuous) {
    $txt.removeClass('anim-text-flow-hover').addClass('anim-text-flow');
  } else {
    $txt.removeClass('anim-text-flow').addClass('anim-text-flow-hover');
  }
}
let width = $(window).width();
let height = $(window).height();
let sx = width >= 414 ? 1 : 0.5;
let sy = width >= 414 ? 1 : 0.5;
let count1 = 0;
let count2 = 0;
let pixiRenderer = null;
const getRandomArbitrary = (min, max) => Math.random() * (max - min) + min;
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const generateCats = function generateCats(arr) {
  const width = $(window).width();
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
const init = function init() {
  $("canvas").remove();
  if (pixiRenderer) {
    pixiRenderer.destroy();
    pixiRenderer = null;
  }
  const colorOne = `#${Math.random().toString(16).slice(2, 8).toUpperCase()}`;
  const colorTwo = "#fff";
  const orientation = "180deg";
  width = $(window).width();
  height = $(window).height();
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
  cats.forEach((i, v) => {
    const startX = (width / 7) * (v + 1);
    const baseRestitution = 0.65 + Math.random() * 0.25; // 0.65 - 0.90
    const baseFriction = 0.15 + Math.random() * 0.25;    // 0.15 - 0.40
    const baseFrictionAir = 0.0005 + Math.random() * 0.0015; // 0.0005 - 0.002
    const baseDensity = 0.0015 + Math.random() * 0.002;  // 0.0015 - 0.0035
    cArr[v] = Bodies.circle(startX, 150, 100, {
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
          xScale: sx,
          yScale: sy
        }
      }
    });
    World.add(engine.world, cArr[v]);
    Body.setVelocity(cArr[v], { x: 0, y: 2 });
  });
  const mouse = Mouse.create(pixiRenderer.app.view);
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
  Engine.run(engine);
  // Cleanup rain cats that fall below the screen
  Events.off(engine, 'afterUpdate');
  Events.on(engine, 'afterUpdate', () => {
    const h = $(window).height();
    engine.world.bodies
      .filter(b => b.label === 'rainCat' && b.position.y > h + 200)
      .forEach(b => World.remove(engine.world, b));
    // Nudge base cats if they get stuck near the floor with low vertical speed
    engine.world.bodies
      .filter(b => b.label === 'baseCat')
      .forEach(b => {
        if (b.position.y > h - 120 && Math.abs(b.velocity.y) < 1.5) {
          Body.setVelocity(b, { x: b.velocity.x, y: -18 - Math.random() * 6 });
          Body.setAngularVelocity(b, 0.02 * getRandomArbitrary(-5, 5));
        }
      });
    // Sync Pixi sprites with Matter bodies
    if (pixiRenderer) {
      pixiRenderer.syncBodies(
        engine.world.bodies,
        (body) => (body.render && body.render.sprite ? body.render.sprite.texture : null),
        (body) => (body.render && body.render.sprite ? { xScale: body.render.sprite.xScale || 1, yScale: body.render.sprite.yScale || 1 } : { xScale: 1, yScale: 1 })
      );
    }
  });
};
const spawnRainBatch = () => {
  const width = $(window).width();
  const sx = width >= 414 ? 1 : 0.5;
  const sy = width >= 414 ? 1 : 0.5;
  const bodies = [];
  for (let i = 0; i < RAIN_BATCH_SIZE; i++) {
    const useRainbow = Math.random() < 0.2;
    const texture = useRainbow
      ? rainbow_cats[(rainbowRoundRobinIndex++) % rainbow_cats.length]
      : cats[(catRoundRobinIndex++) % cats.length];
    const x = getRandomArbitrary(50, width - 50);
    const y = -200 - getRandomArbitrary(0, 200);
    const body = Bodies.circle(x, y, 100, {
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
          xScale: sx,
          yScale: sy
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
  rainbow = true;
  setAnimatedButtonText('Stop Rain', true);
  $('#makeItRain').addClass('raining');
  spawnRainBatch();
  rainInterval = setInterval(spawnRainBatch, 500);
};

const stopRain = () => {
  isRaining = false;
  rainbow = false;
  if (rainInterval) clearInterval(rainInterval);
  rainInterval = null;
  setAnimatedButtonText('Make It Rain', false);
  $('#makeItRain').removeClass('raining');
};

mirain.on('click', () => {
  if (isRaining) {
    stopRain();
  } else {
    startRain();
  }
});
// Spawn a single cat inside the current viewport using round-robin texture selection
const spawnOneCatInView = () => {
  const w = $(window).width();
  const h = $(window).height();
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
  const w = $(window).width();
  const h = $(window).height();
  const visibleCats = engine.world.bodies.filter(b =>
    (b.label === 'baseCat' || b.label === 'rainCat') &&
    b.position.x >= -20 && b.position.x <= w + 20 &&
    b.position.y >= -20 && b.position.y <= h + 20
  );
  if (!visibleCats.length) return;
  const idx = getRandomInt(0, visibleCats.length - 1);
  World.remove(engine.world, visibleCats[idx]);
};

$('#spawnCat').on('click', spawnOneCatInView);
$('#removeCat').on('click', removeOneCatInView);
$('.txt').html((i, html) => {
  const chars = $.trim(html).split("");
  return `<span>${chars.join('</span><span>')}</span>`;
});
init();
$(window).resize(() => {
  if (!isRaining) {
    init();
  }
  if (pixiRenderer) {
    pixiRenderer.resize($(window).width(), $(window).height());
  }
});
