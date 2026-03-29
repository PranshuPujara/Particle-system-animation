/* ============================================================
   engine/Engine.js
   Updated in Branch: physics-effects
   Commit: "feat: run Physics.apply() on each particle in update loop"

   One line changed in _update():
     Physics.apply(p) is called before p.update()
   Everything else is identical to Branch 2.
   ============================================================ */

class Engine {
  constructor(canvas) {
    this.canvas  = canvas;
    this.ctx     = canvas.getContext('2d');

    this.pool    = new ParticlePool(CONFIG.maxParticles);
    this.active  = [];
    this.emitter = new Emitter(this.pool, this.active);

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

    this._deltaTime      = timestamp - this._lastTimestamp;
    this._lastTimestamp  = timestamp;

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
    for (let i = 0; i < this.active.length; i++) {
      const p = this.active[i];

      // ← NEW in Branch 3: apply physics before integrating position
      // Physics sets ax/ay (and may directly modify vx/vy for friction).
      // Then p.update() integrates everything and resets ax/ay to 0.
      Physics.apply(p);

      p.update();
    }

    // Swap-and-pop cleanup (unchanged)
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
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (const p of this.active) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, p.opacity));
      ctx.fillStyle   = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.1, p.size), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  get stats() {
    return {
      activeCount:  this.active.length,
      fps:          this._fps,
      deltaTime:    Math.round(this._deltaTime),
      poolSize:     this.pool.size,
      totalEmitted: this.emitter.totalEmitted,
    };
  }
}
