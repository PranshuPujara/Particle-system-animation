/* ============================================================
   engine/Particle.js
   Updated in Branch: physics-effects
   Commit: "feat: add spiralAngle to Particle for spiral motion"

   Only change from Branch 2:
     - spiralAngle property added (used by Physics.applySpiral)
   ============================================================ */

class Particle {
  constructor() {
    this.x           = 0;
    this.y           = 0;
    this.vx          = 0;
    this.vy          = 0;
    this.ax          = 0;
    this.ay          = 0;
    this.size        = 0;
    this.color       = '';
    this.opacity     = 1;
    this.lifetime    = 0;
    this.maxLifetime = 0;
    this.alive       = false;

    // NEW — tracks cumulative rotation for spiral motion
    // Reset each life so spiral starts fresh
    this.spiralAngle = 0;
  }

  reset(x = 0, y = 0, vx = 0, vy = 0, options = {}) {
    this.x  = x;
    this.y  = y;
    this.vx = vx;
    this.vy = vy;
    this.ax = 0;
    this.ay = 0;

    this.size = (options.size ?? CONFIG.baseSize)
              + rand(-CONFIG.sizeVariance, CONFIG.sizeVariance);

    const hueShift = rand(-CONFIG.colorVariance, CONFIG.colorVariance);
    this.color = options.color
      ?? `hsl(${CONFIG.color.h + hueShift}, ${CONFIG.color.s}%, ${CONFIG.color.l}%)`;

    this.opacity     = 1;
    this.lifetime    = CONFIG.baseLifetime + rand(-CONFIG.lifetimeVariance, CONFIG.lifetimeVariance);
    this.maxLifetime = this.lifetime;
    this.alive       = true;
    this.spiralAngle = 0;   // Reset spiral state on reuse

    return this;
  }

  update() {
    // Physics.apply() sets ax/ay before update() is called.
    // Friction (if enabled) multiplies vx/vy directly in Physics,
    // so we just integrate here normally.

    this.vx += this.ax;
    this.vy += this.ay;
    this.x  += this.vx;
    this.y  += this.vy;

    // Reset acceleration each frame — Physics re-applies it next frame.
    // This prevents acceleration from stacking infinitely.
    this.ax = 0;
    this.ay = 0;

    this.lifetime--;
    this.opacity = this.lifetime / this.maxLifetime;

    if (this.lifetime <= 0 || this.size <= 0) {
      this.alive = false;
    }
  }
}
