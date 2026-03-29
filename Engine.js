/* ============================================================
   engine/Engine.js
   Updated in Branch: optimization
   Commit: "feat: wire Optimizer — frame recording, adaptive cap, offscreen cull"

   Changes from Branch 5:
     - Instantiates Optimizer
     - Passes optimizer to Renderer (for gradient cache)
     - Records each frame timestamp to Optimizer
     - Reads effective cap from Optimizer in _update()
     - Skips physics + interactions for off-screen particles (cull)
   ============================================================ */

class Engine {
  constructor(canvas) {
    this.canvas    = canvas;
    this.ctx       = canvas.getContext('2d');

    this.optimizer = new Optimizer();                       // ← NEW
    this.pool      = new ParticlePool(CONFIG.maxParticles);
    this.active    = [];
    this.emitter   = new Emitter(this.pool, this.active);
    this.renderer  = new Renderer(canvas, this.optimizer); // ← pass optimizer

    this._input = null;

    this._lastTimestamp = 0;
    this._deltaTime     = 0;
    this._fps           = 0;
    this._frameCount    = 0;
    this._fpsAccum      = 0;

    this._running = false;
    this._rafId   = null;

    this._resize();
    window.addEventListener('resize', () => this._resize());
  }

  setInput(inputHandler) {
    this._input = inputHandler;
  }

  start() {
    if (this._running) return;
    this._running = true;
    this._rafId   = requestAnimationFrame(ts => this._loop(ts));
  }

  stop() {
    this._running = false;
    cancelAnimationFrame(this._rafId);
  }

  _resize() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  _loop(timestamp) {
    if (!this._running) return;

    // Record frame time to Optimizer FIRST — before any work this frame
    this.optimizer.recordFrame(timestamp);    // ← NEW

    this._deltaTime     = timestamp - this._lastTimestamp;
    this._lastTimestamp = timestamp;

    this._frameCount++;
    this._fpsAccum += this._deltaTime;
    if (this._fpsAccum >= 500) {
      this._fps        = Math.round(this._frameCount / (this._fpsAccum / 1000));
      this._frameCount = 0;
      this._fpsAccum   = 0;
    }

    this._update();
    this._render();
    this._rafId = requestAnimationFrame(ts => this._loop(ts));
  }

  _update() {
    const cursor = this._input
      ? this._input.cursor
      : { x: -9999, y: -9999, speed: 0 };

    // Ask Optimizer for the current safe particle cap ← NEW
    const cap = this.optimizer.getEffectiveCap();

    // Off-screen cull bounds ← NEW
    const cfg    = CONFIG.optimization;
    const margin = cfg.cullMargin;
    const W      = this.canvas.width;
    const H      = this.canvas.height;

    for (let i = 0; i < this.active.length; i++) {
      const p = this.active[i];

      // Off-screen culling — skip expensive work for invisible particles.
      // The particle still ages (p.update() runs) so it dies on schedule,
      // but we skip physics + interactions to save CPU.
      const offscreen = cfg.cullOffscreen && (
        p.x < -margin || p.x > W + margin ||
        p.y < -margin || p.y > H + margin
      );

      if (!offscreen) {
        Physics.apply(p);
        Interactions.apply(p, cursor);
      }

      p.update();   // Always runs — particle must age even off-screen

      // Hard-kill particles that exceed the adaptive cap
      // This prevents cap reduction from leaving phantom over-cap particles
      if (i >= cap) {
        p.alive = false;
      }
    }

    // Swap-and-pop cleanup
    let i = 0;
    while (i < this.active.length) {
      if (!this.active[i].alive) {
        this.active[i] = this.active[this.active.length - 1];
        this.active.pop();
      } else {
        i++;
      }
    }
  }

  _render() {
    this.renderer.clear();
    this.renderer.drawAll(this.active);
  }

  get stats() {
    return {
      activeCount:   this.active.length,
      fps:           this._fps,
      deltaTime:     Math.round(this._deltaTime),
      poolSize:      this.pool.size,
      totalEmitted:  this.emitter.totalEmitted,
      effectiveCap:  this.optimizer.effectiveCap,      // ← NEW
      realFPS:       this.optimizer.fps,               // ← NEW
      cacheHitRate:  this.optimizer.cacheHitRate,      // ← NEW
      cacheSize:     this.optimizer.cacheSize,         // ← NEW
    };
  }
}
