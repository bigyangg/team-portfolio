const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
const lerp = (start, end, amount) => start + (end - start) * amount
const fract = (value) => value - Math.floor(value)
const seededNoise = (seed) => fract(Math.sin(seed * 12.9898) * 43758.5453123)

class ParticleEngine {
  constructor(canvas, options = {}) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d', { alpha: true })
    this.isMobile = Boolean(options.isMobile)
    this.particleCount = Number(options.particleCount) || (this.isMobile ? 60 : 120)
    this.reducedMotion = Boolean(options.reducedMotion)
    this.particles = []
    this.bonds = []
    this.width = 0
    this.height = 0
    this.dpr = 1
    this.centerX = 0
    this.centerY = 0
    this.time = 0
    this.flash = 0
    this.lastProgress = 0
    this.explosionTriggered = false
    this.mouseRadius = 150
    this.cursorX = -9999
    this.cursorY = -9999
  }

  init() {
    this.resize()
    this.particles = Array.from({ length: this.particleCount }, (_, index) => this.createParticle(index))
    this.updateFormationTargets()
    this.buildBonds()
  }

  createParticle(index) {
    const hue = 200 + ((index * 9) % 80)
    const angle = (index / this.particleCount) * Math.PI * 2
    const spawnRadius = this.isMobile ? 28 : 34
    const x = this.centerX + Math.cos(angle) * spawnRadius
    const y = this.centerY + Math.sin(angle) * spawnRadius

    return {
      id: index,
      x,
      y,
      vx: 0,
      vy: 0,
      targetX: x,
      targetY: y,
      radius: this.isMobile ? 1.3 + (index % 3) * 0.32 : 1.6 + (index % 4) * 0.52,
      baseRadius: this.isMobile ? 1.3 + (index % 3) * 0.32 : 1.6 + (index % 4) * 0.52,
      glowRadius: (this.isMobile ? 2.8 : 8) + (index % 4) * (this.isMobile ? 0.9 : 3.2),
      hue,
      saturation: 82 + (index % 3) * 6,
      lightness: 58 + (index % 4) * 5,
      alpha: index === 0 ? 1 : 0,
      pulsePhase: index * 0.25,
      mass: 0.9 + (index % 7) * 0.12,
      formationX: x,
      formationY: y,
      driftX: seededNoise(index * 1.91 + 3) * Math.PI * 2,
      driftY: seededNoise(index * 2.37 + 9) * Math.PI * 2,
      driftBand: this.isMobile ? 12 : 18,
    }
  }

  buildBonds() {
    this.bonds = []
    if (!this.particles.length) return
    if (this.isMobile) return

    const maxDistance = Math.min(this.width, this.height) * (this.isMobile ? 0.33 : 0.2)
    const neighborLimit = this.isMobile ? 3 : 3
    const seen = new Set()

    for (let index = 0; index < this.particles.length; index += 1) {
      const origin = this.particles[index]
      const neighbors = []

      for (let otherIndex = 0; otherIndex < this.particles.length; otherIndex += 1) {
        if (otherIndex === index) continue
        const other = this.particles[otherIndex]
        const distance = Math.hypot(other.formationX - origin.formationX, other.formationY - origin.formationY)
        neighbors.push([otherIndex, distance])
      }

      neighbors
        .sort((a, b) => a[1] - b[1])
        .slice(0, neighborLimit)
        .forEach(([otherIndex, distance]) => {
          if (distance > maxDistance) return
          const left = Math.min(index, otherIndex)
          const right = Math.max(index, otherIndex)
          const key = `${left}-${right}`
          if (seen.has(key)) return
          seen.add(key)
          this.bonds.push([left, right])
        })
    }
  }

  updateFormationTargets() {
    if (this.isMobile) {
      const marginX = this.width * 0.04
      const marginY = this.height * 0.04
      const columnWidth = this.width * 0.42
      const waveAmplitude = this.width * 0.1
      const waveFrequency = Math.PI * 2.4

      this.particles.forEach((particle, index) => {
        const ratio = (index + seededNoise(index * 1.31 + 1.7) * 0.35) / this.particleCount
        const yBase = lerp(marginY, this.height - marginY, ratio)
        const yNoise = (seededNoise(index * 2.61 + 4.3) - 0.5) * this.height * 0.14
        const y = clamp(yBase + yNoise, marginY, this.height - marginY)

        const centerBias = (seededNoise(index * 4.11 + 2.5) + seededNoise(index * 5.23 + 6.4)) * 0.5
        const spread = columnWidth * (0.55 + seededNoise(index * 6.43 + 3.1) * 0.35)
        const normalizedY = y / Math.max(this.height, 1)
        const wavePhase = normalizedY * waveFrequency + seededNoise(index * 3.07 + 8.2) * Math.PI * 2
        const waveOffset = Math.sin(wavePhase) * waveAmplitude
        const randomOffset = (seededNoise(index * 7.19 + 10.7) - 0.5) * this.width * 0.06
        const x = this.centerX + waveOffset + (centerBias - 0.5) * spread + randomOffset

        particle.formationX = clamp(x, marginX, this.width - marginX)
        particle.formationY = y
        particle.driftBand = 5 + seededNoise(index * 2.71 + 13) * 2.8
        particle.driftX = seededNoise(index * 3.11 + 17) * Math.PI * 2
        particle.driftY = seededNoise(index * 3.67 + 23) * Math.PI * 2
      })
      return
    }

    const marginX = this.width * (this.isMobile ? 0.09 : 0.07)
    const marginY = this.height * (this.isMobile ? 0.12 : 0.1)
    const centerVoid = Math.min(this.width, this.height) * (this.isMobile ? 0.18 : 0.23)

    this.particles.forEach((particle, index) => {
      const baseX = lerp(marginX, this.width - marginX, seededNoise(index * 1.17 + 2.9))
      const baseY = lerp(marginY, this.height - marginY, seededNoise(index * 1.73 + 7.1))

      let x = baseX
      let y = baseY
      const dx = x - this.centerX
      const dy = y - this.centerY
      const distance = Math.hypot(dx, dy) || 0.0001

      if (distance < centerVoid) {
        const pushed = centerVoid + (centerVoid - distance) * 0.32
        x = this.centerX + (dx / distance) * pushed
        y = this.centerY + (dy / distance) * pushed
      }

      particle.formationX = clamp(x, marginX, this.width - marginX)
      particle.formationY = clamp(y, marginY, this.height - marginY)
      particle.driftBand = (this.isMobile ? 4 : 12) + seededNoise(index * 2.71 + 13) * (this.isMobile ? 3 : 11)
      particle.driftX = seededNoise(index * 3.11 + 17) * Math.PI * 2
      particle.driftY = seededNoise(index * 3.67 + 23) * Math.PI * 2
    })
  }

  resize() {
    if (!this.canvas || !this.ctx) return
    const rect = this.canvas.getBoundingClientRect()
    this.width = rect.width || window.innerWidth
    this.height = rect.height || window.innerHeight
    this.dpr = clamp(window.devicePixelRatio || 1, 1, 2)

    this.canvas.width = Math.floor(this.width * this.dpr)
    this.canvas.height = Math.floor(this.height * this.dpr)
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    this.centerX = this.width / 2
    this.centerY = this.height / 2
    this.updateFormationTargets()
    this.buildBonds()
  }

  setReducedMotion(reducedMotion) {
    this.reducedMotion = Boolean(reducedMotion)
  }

  triggerExplosion() {
    this.particles.forEach((particle) => {
      const dx = particle.x - this.centerX
      const dy = particle.y - this.centerY
      const baseAngle = Math.atan2(dy, dx)
      const angle = baseAngle + (Math.random() - 0.5) * 0.48
      const distance = Math.hypot(dx, dy)
      const speed = 2.8 + Math.random() * 3.6 + distance * 0.008
      particle.vx = Math.cos(angle) * speed
      particle.vy = Math.sin(angle) * speed
    })
    this.flash = 1
    this.explosionTriggered = true
  }

  update(scrollProgress, mouseX, mouseY, deltaTime) {
    if (!this.ctx || !this.particles.length) return

    const dt = clamp(deltaTime || 0.016, 0.008, 0.05)
    const progress = this.reducedMotion ? 0.35 : clamp(scrollProgress, 0, 1)
    this.time += dt
    this.cursorX = mouseX
    this.cursorY = mouseY

    if (progress < 0.58) {
      this.explosionTriggered = false
    }
    if (!this.explosionTriggered && progress >= 0.62 && progress < 0.82) {
      this.triggerExplosion()
    }

    if (progress < 0.2) this.updateGenesis(progress)
    else if (progress < 0.4) this.updateFormation(progress)
    else if (progress < 0.6) this.updateIntelligence(progress)
    else if (progress < 0.8) this.updateFission(progress)
    else this.updateConvergence(progress)

    this.applyMouseForces(progress)
    this.flash = Math.max(0, this.flash - dt * 2.1)
    this.lastProgress = progress
  }

  updateGenesis(progress) {
    const local = clamp(progress / 0.2, 0, 1)
    const visibleCount = Math.max(1, Math.floor(lerp(1, Math.min(this.particleCount, 16), local)))

    this.particles.forEach((particle, index) => {
      if (index < visibleCount) {
        const orbit = index === 0 ? 0 : 10 + index * (this.isMobile ? 2.6 : 3.2)
        const angle = this.time * (0.9 + index * 0.013) + index * 0.5
        const tx = this.centerX + Math.cos(angle) * orbit
        const ty = this.centerY + Math.sin(angle) * orbit * 0.72
        particle.x = lerp(particle.x, tx, 0.08)
        particle.y = lerp(particle.y, ty, 0.08)
        particle.vx *= 0.86
        particle.vy *= 0.86
        particle.alpha = lerp(particle.alpha, 0.92, 0.12)
      } else {
        particle.alpha = lerp(particle.alpha, 0, 0.08)
      }
    })
  }

  updateFormation(progress) {
    const local = clamp((progress - 0.2) / 0.2, 0, 1)
    this.particles.forEach((particle, index) => {
      const drift = lerp(1, 0.34, local)
      const tx = particle.formationX + Math.sin(this.time * 0.52 + particle.driftX + index * 0.08) * particle.driftBand * drift
      const ty = particle.formationY + Math.cos(this.time * 0.44 + particle.driftY + index * 0.06) * particle.driftBand * 0.72 * drift
      particle.x = lerp(particle.x, tx, 0.06 + local * 0.04)
      particle.y = lerp(particle.y, ty, 0.06 + local * 0.04)
      particle.vx *= 0.84
      particle.vy *= 0.84
      particle.alpha = lerp(particle.alpha, 0.78, 0.08)
    })
  }

  updateIntelligence(progress) {
    const local = clamp((progress - 0.4) / 0.2, 0, 1)

    this.particles.forEach((particle, index) => {
      const driftMix = lerp(0.22, 0.12, local)
      const tx = particle.formationX + Math.sin(this.time * 0.9 + particle.driftX + index * 0.05) * particle.driftBand * driftMix
      const ty = particle.formationY + Math.cos(this.time * 0.84 + particle.driftY + index * 0.04) * particle.driftBand * driftMix
      particle.x = lerp(particle.x, tx, 0.08)
      particle.y = lerp(particle.y, ty, 0.08)
      particle.vx *= 0.88
      particle.vy *= 0.88
      const pulse = 0.5 + Math.sin(this.time * 5.2 + index * 0.35) * 0.5
      particle.alpha = lerp(particle.alpha, 0.68 + pulse * 0.14, 0.08)
      particle.radius = particle.baseRadius * (1 + pulse * 0.1)
    })
  }

  updateFission(progress) {
    const local = clamp((progress - 0.6) / 0.2, 0, 1)
    const centerPull = (1 - local) * 0.0008
    this.particles.forEach((particle) => {
      particle.vx += (this.centerX - particle.x) * centerPull
      particle.vy += (this.centerY - particle.y) * centerPull
      particle.x += particle.vx
      particle.y += particle.vy
      particle.vx *= 0.985
      particle.vy *= 0.985
      particle.alpha = lerp(particle.alpha, 0.8, 0.08)
      particle.radius = lerp(particle.radius, particle.baseRadius * 0.92, 0.08)
    })
  }

  updateConvergence(progress) {
    const local = clamp((progress - 0.8) / 0.2, 0, 1)
    const maxRadius = Math.max(this.width, this.height) * 0.32
    this.particles.forEach((particle, index) => {
      const phase = index / this.particleCount
      const orbit = lerp(maxRadius, this.isMobile ? 48 : 62, local)
      const spin = this.time * lerp(2.6, 7.5, local) + phase * Math.PI * 2
      const spiral = orbit * (1 - local * 0.78)
      const tx = this.centerX + Math.cos(spin) * spiral
      const ty = this.centerY + Math.sin(spin) * spiral * 0.74
      particle.x = lerp(particle.x, tx, 0.1 + local * 0.08)
      particle.y = lerp(particle.y, ty, 0.1 + local * 0.08)
      particle.vx *= 0.9
      particle.vy *= 0.9
      particle.alpha = lerp(particle.alpha, 0.94, 0.1)
      particle.radius = lerp(particle.radius, particle.baseRadius * 1.02, 0.08)
    })
  }

  applyMouseForces(progress) {
    if (!Number.isFinite(this.cursorX) || !Number.isFinite(this.cursorY)) return
    const attracting = progress >= 0.8

    this.particles.forEach((particle) => {
      const dx = particle.x - this.cursorX
      const dy = particle.y - this.cursorY
      const distance = Math.hypot(dx, dy)
      if (distance <= 0.01 || distance > this.mouseRadius) return

      const strength = (1 - distance / this.mouseRadius) * (attracting ? -0.52 : 0.7)
      const factor = strength / particle.mass
      particle.vx += (dx / distance) * factor
      particle.vy += (dy / distance) * factor
    })
  }

  render(ctx = this.ctx) {
    if (!ctx) return

    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1
    ctx.clearRect(0, 0, this.width, this.height)
    this.renderBackground(ctx)
    this.renderBonds(ctx)
    this.renderParticles(ctx)
    this.renderCursorHalo(ctx)
    this.renderFlash(ctx)
  }

  renderBackground(ctx) {
    ctx.save()
    ctx.fillStyle = this.isMobile ? '#081529' : '#030208'
    ctx.fillRect(0, 0, this.width, this.height)

    const t = this.time
    const g1x = this.width * (0.2 + Math.sin(t * 0.21) * 0.08)
    const g1y = this.height * (0.28 + Math.cos(t * 0.18) * 0.06)
    const g2x = this.width * (0.78 + Math.cos(t * 0.24) * 0.08)
    const g2y = this.height * (0.24 + Math.sin(t * 0.2) * 0.05)
    const g3x = this.width * (0.5 + Math.sin(t * 0.17) * 0.06)
    const g3y = this.height * (0.82 + Math.cos(t * 0.22) * 0.04)

    const g1 = ctx.createRadialGradient(g1x, g1y, 0, g1x, g1y, this.width * 0.55)
    g1.addColorStop(0, this.isMobile ? 'rgba(79, 70, 229, 0.4)' : 'rgba(79, 70, 229, 0.28)')
    g1.addColorStop(1, 'rgba(79, 70, 229, 0)')

    const g2 = ctx.createRadialGradient(g2x, g2y, 0, g2x, g2y, this.width * 0.48)
    g2.addColorStop(0, this.isMobile ? 'rgba(124, 58, 237, 0.35)' : 'rgba(124, 58, 237, 0.24)')
    g2.addColorStop(1, 'rgba(124, 58, 237, 0)')

    const g3 = ctx.createRadialGradient(g3x, g3y, 0, g3x, g3y, this.width * 0.5)
    g3.addColorStop(0, this.isMobile ? 'rgba(6, 182, 212, 0.28)' : 'rgba(6, 182, 212, 0.15)')
    g3.addColorStop(1, 'rgba(6, 182, 212, 0)')

    ctx.globalCompositeOperation = 'screen'
    ctx.fillStyle = g1
    ctx.fillRect(0, 0, this.width, this.height)
    ctx.fillStyle = g2
    ctx.fillRect(0, 0, this.width, this.height)
    ctx.fillStyle = g3
    ctx.fillRect(0, 0, this.width, this.height)

    const centerShade = ctx.createRadialGradient(this.centerX, this.centerY, 0, this.centerX, this.centerY, this.width * 0.46)
    centerShade.addColorStop(0, this.isMobile ? 'rgba(2, 6, 23, 0.2)' : 'rgba(2, 6, 23, 0.46)')
    centerShade.addColorStop(1, 'rgba(2, 6, 23, 0)')
    ctx.globalCompositeOperation = 'source-over'
    ctx.fillStyle = centerShade
    ctx.fillRect(0, 0, this.width, this.height)
    ctx.restore()
  }

  renderBonds(ctx) {
    if (this.isMobile) return
    const threshold = this.isMobile ? 92 : 132
    const progress = this.lastProgress
    if (progress < 0.1) return

    const intelligence = progress >= 0.4 && progress <= 0.6
    const breakFade = progress > 0.6 ? 1 - clamp((progress - 0.6) / 0.2, 0, 1) : 1

    ctx.save()
    ctx.lineWidth = this.isMobile ? 0.9 : 0.88
    ctx.globalCompositeOperation = 'screen'

    this.bonds.forEach(([aIndex, bIndex]) => {
      const a = this.particles[aIndex]
      const b = this.particles[bIndex]
      if (!a || !b || a.alpha < 0.03 || b.alpha < 0.03) return

      const dx = b.x - a.x
      const dy = b.y - a.y
      const distance = Math.hypot(dx, dy)
      if (distance > threshold) return

      const opacity = (1 - distance / threshold) ** 1.2 * ((this.isMobile ? 0.62 : 0.5) * breakFade)
      if (opacity < 0.02) return

      const gradient = ctx.createLinearGradient(a.x, a.y, b.x, b.y)
      gradient.addColorStop(0, `hsla(${a.hue}, 90%, 68%, ${opacity})`)
      gradient.addColorStop(1, `hsla(${b.hue}, 90%, 68%, ${opacity})`)

      ctx.strokeStyle = gradient
      ctx.beginPath()
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(b.x, b.y)
      ctx.stroke()

      if (intelligence) {
        const phase = (this.time * 0.6 + (a.id + b.id) * 0.05) % 1
        const pulseX = lerp(a.x, b.x, phase)
        const pulseY = lerp(a.y, b.y, phase)
        const pulseGlow = ctx.createRadialGradient(pulseX, pulseY, 0, pulseX, pulseY, 7)
        pulseGlow.addColorStop(0, 'rgba(240, 238, 255, 0.65)')
        pulseGlow.addColorStop(1, 'rgba(240, 238, 255, 0)')
        ctx.fillStyle = pulseGlow
        ctx.beginPath()
        ctx.arc(pulseX, pulseY, 7, 0, Math.PI * 2)
        ctx.fill()
      }
    })
    ctx.restore()
  }

  renderParticles(ctx) {
    ctx.save()
    ctx.globalCompositeOperation = 'screen'

    this.particles.forEach((particle) => {
      if (particle.alpha < 0.02) return

      const pulse = 0.5 + Math.sin(this.time * 6 + particle.pulsePhase) * 0.5
      const glow = particle.glowRadius * (1 + pulse * 0.12)
      const glowGradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, glow)
      glowGradient.addColorStop(0, `hsla(${particle.hue}, ${particle.saturation}%, ${particle.lightness}%, ${particle.alpha * (this.isMobile ? 0.34 : 0.24)})`)
      glowGradient.addColorStop(1, `hsla(${particle.hue}, ${particle.saturation}%, ${particle.lightness}%, 0)`)
      ctx.fillStyle = glowGradient
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, glow, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = `hsla(${particle.hue}, ${particle.saturation}%, ${Math.min(86, particle.lightness + 8)}%, ${particle.alpha})`
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
      ctx.fill()
    })
    ctx.restore()
  }

  renderCursorHalo(ctx) {
    if (!Number.isFinite(this.cursorX) || !Number.isFinite(this.cursorY)) return
    if (this.cursorX < 0 || this.cursorY < 0 || this.cursorX > this.width || this.cursorY > this.height) return

    ctx.save()
    const halo = ctx.createRadialGradient(this.cursorX, this.cursorY, 0, this.cursorX, this.cursorY, 96)
    halo.addColorStop(0, 'rgba(167, 139, 250, 0.12)')
    halo.addColorStop(1, 'rgba(167, 139, 250, 0)')
    ctx.fillStyle = halo
    ctx.beginPath()
    ctx.arc(this.cursorX, this.cursorY, 96, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  renderFlash(ctx) {
    if (this.flash <= 0.001) return
    ctx.save()
    ctx.fillStyle = `rgba(240, 238, 255, ${this.flash * 0.22})`
    ctx.fillRect(0, 0, this.width, this.height)
    ctx.restore()
  }

  destroy() {
    this.particles = []
    this.bonds = []
  }
}

export default ParticleEngine
