/* ============================================================
   engine/Engine.js
   Updated in Branch: advanced-interactions
   Commit: "feat: run Interactions.apply() per particle, wire setInput()"

   Changes from Branch 4:
     - Adds setInput() so Engine can read cursor state each frame
     - Calls Interactions.apply(p, cursor) after Physics, before p.update()
   Everything else is identical to Branch 4.
   ============================================================ */

class Engine {
  constructor(canvas) {
    this.canvas   = canvas;
    this.ctx      = canvas.getContext('2d');

    this.pool     = new ParticlePool(CONFIG.maxParticles);
    this.active   = [];
    this.emitter  = new Emitter(this.pool, this.active);
    this.renderer = new Renderer(canvas);

    // Set after construction via engine.setInput(input)
    // Avoids circular dependency — InputHandler needs emitter,
    // Engine needs input — so neither can own the other at construction.
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

  /* setInput() — called from main.js after both objects are created */
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
    // Fetch cursor state once per frame — not once per particle
    const cursor = this._input
      ? this._input.cursor
      : { x: -9999, y: -9999, speed: 0 };

    for (let i = 0; i < this.active.length; i++) {
      const p = this.active[i];

      Physics.apply(p);              // 1. Environmental forces (gravity, wind…)
      Interactions.apply(p, cursor); // 2. Cursor forces ← NEW in Branch 5
      p.update();                    // 3. Integrate everything → position
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
      activeCount:  this.active.length,
      fps:          this._fps,
      deltaTime:    Math.round(this._deltaTime),
      poolSize:     this.pool.size,
      totalEmitted: this.emitter.totalEmitted,
    };
  }
}
