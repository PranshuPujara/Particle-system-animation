/* ============================================================
   engine/Particle.js
   Branch: basic-engine
   Commit: "feat: Particle class with all core properties"

   Depends on: config.js (CONFIG, rand)
   ============================================================ */

class Particle {
  constructor() {
    // Allocate once — reset() fills in real values before use.
    // This pattern is required for the object pool to work.
    this.x          = 0;
    this.y          = 0;
    this.vx         = 0;   // velocity x
    this.vy         = 0;   // velocity y
    this.ax         = 0;   // acceleration x (gravity/wind plug in here — Branch 3)
    this.ay         = 0;   // acceleration y
    this.size       = 0;
    this.color      = '';
    this.opacity    = 1;
    this.lifetime   = 0;
    this.maxLifetime = 0;
    this.alive      = false;
  }

  /* reset()
     Prepares this particle for a fresh "life".
     Called once at creation AND every time it's reused from the pool.
     options can override size and color per-emission. */
  reset(x = 0, y = 0, vx = 0, vy = 0, options = {}) {
    this.x  = x;
    this.y  = y;
    this.vx = vx;
    this.vy = vy;

    // Acceleration starts at zero each life.
    // Branch 3 (physics) will set ax/ay from behavior rules.
    this.ax = 0;
    this.ay = 0;

    // Size — base ± random variance
    this.size = (options.size ?? CONFIG.baseSize)
              + rand(-CONFIG.sizeVariance, CONFIG.sizeVariance);

    // Color — hue-shifted variant of the base color
    const hueShift = rand(-CONFIG.colorVariance, CONFIG.colorVariance);
    this.color = options.color
      ?? `hsl(${CONFIG.color.h + hueShift}, ${CONFIG.color.s}%, ${CONFIG.color.l}%)`;

    this.opacity     = 1;

    // Lifetime — countdown in frames
    this.lifetime    = CONFIG.baseLifetime + rand(-CONFIG.lifetimeVariance, CONFIG.lifetimeVariance);
    this.maxLifetime = this.lifetime;

    this.alive = true;

    return this; // allows chaining: pool.get().reset(...)
  }

  /* update()
     Called once per frame by the Engine.
     Applies acceleration → velocity → position, then ages the particle. */
  update() {
    // 1. Acceleration updates velocity
    this.vx += this.ax;
    this.vy += this.ay;

    // 2. Velocity updates position
    this.x  += this.vx;
    this.y  += this.vy;

    // 3. Count down
    this.lifetime--;

    // 4. Fade opacity linearly from 1 → 0 over the particle's full life
    this.opacity = this.lifetime / this.maxLifetime;

    // 5. Die when time is up (or size has shrunk to nothing)
    if (this.lifetime <= 0 || this.size <= 0) {
      this.alive = false;
    }
  }
}
