/* ============================================================
   engine/Engine.js
   Branch: basic-engine
   Commit: "feat: Engine — RAF loop, update, render, cleanup"

   Depends on: ParticlePool.js, Emitter.js, config.js

   This is the ONLY place requestAnimationFrame lives.
   One loop, one update pass, one render pass — in that order.
   ============================================================ */

class Engine {
  constructor(canvas) {
    this.canvas  = canvas;
    this.ctx     = canvas.getContext('2d');

    // Core systems
    this.pool    = new ParticlePool(CONFIG.maxParticles);
    this.active  = [];                            // Live particles this frame
    this.emitter = new Emitter(this.pool, this.active);

    // FPS / timing state
    this._lastTimestamp = 0;
    this._deltaTime     = 0;
    this._fps           = 0;
    this._frameCount    = 0;
    this._fpsAccum      = 0;    // Accumulated ms for FPS averaging

    // Loop control
    this._running = false;
    this._rafId   = null;

    // Size canvas to window, re-size on resize
    this._resize();
    window.addEventListener('resize', () => this._resize());
  }

  /* ---- Public API ---- */

  start() {
    if (this._running) return;
    this._running = true;
    this._rafId   = requestAnimationFrame(ts => this._loop(ts));
  }

  stop() {
    this._running = false;
    cancelAnimationFrame(this._rafId);
  }

  /* ---- Private: sizing ---- */

  _resize() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  /* ---- Private: main loop ---- */

  /* _loop()
     Called by requestAnimationFrame every ~16ms (at 60fps).
     Order is always: measure time → update → render → schedule next. */
  _loop(timestamp) {
    if (!this._running) return;

    // --- 1. Timing ---
    this._deltaTime      = timestamp - this._lastTimestamp;
    this._lastTimestamp  = timestamp;

    // Average FPS over ~500ms windows
    this._frameCount++;
    this._fpsAccum += this._deltaTime;
    if (this._fpsAccum >= 500) {
      this._fps        = Math.round(this._frameCount / (this._fpsAccum / 1000));
      this._frameCount = 0;
      this._fpsAccum   = 0;
    }

    // --- 2. Update simulation ---
    this._update();

    // --- 3. Render frame ---
    this._render();

    // --- 4. Schedule next frame ---
    this._rafId = requestAnimationFrame(ts => this._loop(ts));
  }

  /* _update()
     Advance every live particle by one frame, then remove dead ones.

     CLEANUP STRATEGY — swap-and-pop:
       Standard array.splice(i, 1) is O(n) because it shifts all
       elements after the removed index. At 500 particles that's
       expensive every frame. Instead:
         1. Swap dead[i] with the last element
         2. Pop the last element (O(1))
         3. Re-check index i (it now holds the swapped element)
       This keeps cleanup O(1) per dead particle.              */
  _update() {
    // Update all live particles
    for (let i = 0; i < this.active.length; i++) {
      this.active[i].update();
    }

    // Remove dead particles using swap-and-pop
    let i = 0;
    while (i < this.active.length) {
      if (!this.active[i].alive) {
        // Overwrite dead slot with the last particle
        this.active[i] = this.active[this.active.length - 1];
        this.active.pop();
        // Do NOT increment i — re-evaluate this index
      } else {
        i++;
      }
    }
  }

  /* _render()
     Draws all live particles.
     Branch 4 (visual-enhancements) will add glow, trails, blend modes. */
  _render() {
    const ctx = this.ctx;
    const W   = this.canvas.width;
    const H   = this.canvas.height;

    // Clear the entire canvas (Branch 4 will change this for motion trails)
    ctx.clearRect(0, 0, W, H);

    for (const p of this.active) {
      ctx.save();

      ctx.globalAlpha = Math.max(0, Math.min(1, p.opacity));  // Clamp [0,1]
      ctx.fillStyle   = p.color;

      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.1, p.size), 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  /* ---- Public: expose stats for debug panel ---- */

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
