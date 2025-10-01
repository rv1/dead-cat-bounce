import * as PIXI from 'pixi.js'

export class PixiCatRenderer {
  constructor({ width, height, textures }) {
    this.app = new PIXI.Application({
      width,
      height,
      backgroundAlpha: 0,
      antialias: true,
      powerPreference: 'high-performance',
      resolution: Math.min(2, window.devicePixelRatio || 1),
      autoDensity: true
    })
    document.body.appendChild(this.app.view)
    this.stage = this.app.stage
    this.textures = textures
    this.bodyIdToSprite = new Map()
    this.dpr = Math.min(2, window.devicePixelRatio || 1)
    this.resize(width, height)
  }

  resize(width, height) {
    this.app.renderer.resize(width, height)
  }

  ensureSpriteForBody(body, textureUrl, scaleX, scaleY) {
    if (this.bodyIdToSprite.has(body.id)) return this.bodyIdToSprite.get(body.id)
    if (!textureUrl) return null
    const baseTexture = PIXI.Texture.from(textureUrl)
    const sprite = new PIXI.Sprite(baseTexture)
    sprite.anchor.set(0.5)
    // Size sprite to match the Matter circle's diameter, adjusted by provided scale
    const diameter = (body.circleRadius || 50) * 2
    sprite.width = diameter * (scaleX || 1)
    sprite.height = diameter * (scaleY || 1)
    this.stage.addChild(sprite)
    this.bodyIdToSprite.set(body.id, sprite)
    return sprite
  }

  syncBodies(bodies, getTextureForBody, getScaleForBody) {
    const seen = new Set()
    for (const body of bodies) {
      if (!body.render || !body.render.sprite) continue
      const texture = getTextureForBody(body)
      if (!texture) continue
      const { xScale, yScale } = getScaleForBody(body)
      const sprite = this.ensureSpriteForBody(body, texture, xScale, yScale)
      if (!sprite) continue
      // Ensure size stays in sync (useful if scale changes across resize thresholds)
      const diameter = (body.circleRadius || 50) * 2
      sprite.width = diameter * (xScale || 1)
      sprite.height = diameter * (yScale || 1)
      sprite.position.set(body.position.x, body.position.y)
      sprite.rotation = body.angle
      seen.add(body.id)
    }
    // remove sprites for bodies no longer present
    for (const [id, sprite] of this.bodyIdToSprite.entries()) {
      if (!seen.has(id)) {
        this.stage.removeChild(sprite)
        sprite.destroy({ texture: false, baseTexture: false })
        this.bodyIdToSprite.delete(id)
      }
    }
  }

  destroy() {
    for (const [, sprite] of this.bodyIdToSprite.entries()) {
      sprite.destroy({ texture: false, baseTexture: false })
    }
    this.bodyIdToSprite.clear()
    this.app.destroy(true, { children: true, texture: false, baseTexture: false })
  }
}
