/* ============================================================
   engine/Engine.js
   Updated in Branch: visual-enhancements
   Commit: "feat: delegate rendering to Renderer class"

   Changes from Branch 3:
     - Instantiates Renderer
     - _render() replaced with two calls: renderer.clear() + renderer.drawAll()
     - Engine no longer touches ctx directly for drawing
   Everything else is identical to Branch 3.
   ============================================================ */

class Engine {
  constructor(canvas) {
    this.canvas   = canvas;
    this.ctx      = canvas.getContext('2d');

    this.pool     = new ParticlePool(CONFIG.maxParticles);
    this.active   = [];
    this.emitter  = new Emitter(this.pool, this.active);
    this.renderer = new Renderer(canvas);   // ← NEW in Branch 4

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
    this._render();   // ← now delegates to Renderer
    this._rafId = requestAnimationFrame(ts => this._loop(ts));
  }

  _update() {
    for (let i = 0; i < this.active.length; i++) {
      const p = this.active[i];
      Physics.apply(p);
      p.update();
    }

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

  /* _render()
     Engine no longer knows HOW to draw — it just triggers the Renderer.
     This keeps Engine focused purely on the loop and simulation. */
  _render() {
    this.renderer.clear();              // Handles trail vs full clear
    this.renderer.drawAll(this.active); // Draws all live particles
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
