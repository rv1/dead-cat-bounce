import * as PIXI from "pixi.js";

const DEBUG = false;

export class PixiCatRenderer {
  constructor({ width, height, textures }) {
    this.app = new PIXI.Application({
      width,
      height,
      backgroundAlpha: 0,
      antialias: true, // set to false if you still see perf drops on mobile
      powerPreference: "high-performance",
      resolution: Math.min(1.5, window.devicePixelRatio || 1),
      autoDensity: true,
    });
    document.body.appendChild(this.app.view);
    this.stage = this.app.stage;
    this.stage.sortableChildren = true;
    this.textures = textures;
    this.bodyIdToSprite = new Map();
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    // Debug overlay to visualize clickable (physics) areas
    this.debugEnabled = !!DEBUG;
    this.debugGraphics = null;
    if (this.debugEnabled) {
      this.debugGraphics = new PIXI.Graphics();
      this.debugGraphics.alpha = 0.9;
      this.debugGraphics.zIndex = 9999;
      this.stage.addChild(this.debugGraphics);
    }
    this.resize(width, height);
  }

  resize(width, height) {
    this.app.renderer.resize(width, height);
  }

  setDebugEnabled(enabled) {
    const on = !!enabled;
    if (on === this.debugEnabled) return;
    this.debugEnabled = on;
    if (on) {
      if (!this.debugGraphics) {
        this.debugGraphics = new PIXI.Graphics();
        this.debugGraphics.alpha = 0.9;
      } else {
        this.debugGraphics.clear();
        this.debugGraphics.visible = true;
      }
      this.stage.addChild(this.debugGraphics);
    } else if (this.debugGraphics) {
      this.stage.removeChild(this.debugGraphics);
      this.debugGraphics.destroy();
      this.debugGraphics = null;
    }
  }

  ensureSpriteForBody(body, textureUrl) {
    if (this.bodyIdToSprite.has(body.id))
      return this.bodyIdToSprite.get(body.id);
    if (!textureUrl) return null;
    const sprite = new PIXI.Sprite(PIXI.Texture.from(textureUrl));
    sprite.anchor.set(0.5);
    // Ensure consistent layering: rain cats behind base cats
    sprite.zIndex = body.label === "rainCat" ? 0 : 1;
    // Cache last sizing to avoid redundant writes each frame
    sprite.__lastDiameter = -1;
    sprite.__lastScaleX = -1;
    sprite.__lastScaleY = -1;
    this.stage.addChild(sprite);
    this.bodyIdToSprite.set(body.id, sprite);
    return sprite;
  }

  syncBodies(bodies, getTextureForBody, getScaleForBody) {
    const seen = new Set();
    for (const body of bodies) {
      if (!body.render || !body.render.sprite) continue;
      const texture = getTextureForBody(body);
      if (!texture) continue;
      const { xScale, yScale } = getScaleForBody(body);
      const sprite = this.ensureSpriteForBody(body, texture);
      if (!sprite) continue;
      // Size only when needed
      const diameter = (body.circleRadius || 50) * 2;
      const sx = xScale || 1;
      const sy = yScale || 1;
      if (
        sprite.__lastDiameter !== diameter ||
        sprite.__lastScaleX !== sx ||
        sprite.__lastScaleY !== sy
      ) {
        sprite.width = diameter * sx;
        sprite.height = diameter * sy;
        sprite.__lastDiameter = diameter;
        sprite.__lastScaleX = sx;
        sprite.__lastScaleY = sy;
      }
      // Keep zIndex consistent in case labels change dynamically
      const desiredZ = body.label === "rainCat" ? 0 : 1;
      if (sprite.zIndex !== desiredZ) sprite.zIndex = desiredZ;
      sprite.position.set(body.position.x, body.position.y);
      sprite.rotation = body.angle;
      seen.add(body.id);
      if (this.debugEnabled && this.debugGraphics && body.circleRadius) {
        const color = body.label === "rainCat" ? 0xff00ff : 0x00ff00;
        this.debugGraphics.lineStyle(2, color, 0.9);
        this.debugGraphics.drawCircle(
          body.position.x,
          body.position.y,
          body.circleRadius,
        );
      }
    }
    // remove sprites for bodies no longer present
    for (const [id, sprite] of this.bodyIdToSprite.entries()) {
      if (!seen.has(id)) {
        this.stage.removeChild(sprite);
        sprite.destroy({ texture: false, baseTexture: false });
        this.bodyIdToSprite.delete(id);
      }
    }
  }

  destroy() {
    for (const [, sprite] of this.bodyIdToSprite.entries()) {
      sprite.destroy({ texture: false, baseTexture: false });
    }
    this.bodyIdToSprite.clear();
    if (this.debugGraphics) {
      this.debugGraphics.destroy();
      this.debugGraphics = null;
    }
    this.app.destroy(true, {
      children: true,
      texture: false,
      baseTexture: false,
    });
  }
}
