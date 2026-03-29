/* ============================================================
   engine/Optimizer.js
   Branch: optimization
   Commit: "feat: Optimizer — FPS monitor, adaptive cap, gradient cache"

   Depends on: config.js

   THREE SYSTEMS IN THIS FILE:

   1. FPS Monitor
      Tracks real frame rate using a rolling average over 60 frames.
      More accurate than a simple "frames this second" counter because
      it smooths out spikes and gives a stable reading.

   2. Adaptive Cap
      Watches actual FPS and adjusts the effective particle limit:
        - FPS drops below target × 0.85  → reduce cap by 10%
        - FPS exceeds target × 0.95      → raise cap by 5%
      A cooldown of 90 frames (~1.5s) between adjustments prevents
      thrashing (cap toggling up/down every few frames).

   3. Gradient Cache
      createRadialGradient() is called inside _drawParticle() in Renderer.
      Without caching: 500 calls per frame = ~30,000 gradient objects/sec.
      With caching: Map lookup per particle, new gradient only on cache miss.

      Cache key = bucketed size + bucketed hue.
      Small rounding (5px size, 5° hue) means visually identical
      particles share a gradient — nobody notices the tiny mismatch.
   ============================================================ */

class Optimizer {
  constructor() {

    /* ---- FPS tracking ---- */
    this._samples       = [];    // Rolling window of recent delta times (ms)
    this._maxSamples    = 60;    // Average over last 60 frames
    this._lastTimestamp = 0;
    this._currentFPS    = 60;    // Assume 60 until we have real data

    /* ---- Adaptive cap ---- */
    // Start at the configured max — reduce only if FPS demands it
    this._effectiveCap  = CONFIG.maxParticles;
    this._cooldown      = 0;     // Frames remaining before next adjustment

    /* ---- Gradient cache ---- */
    // Map<string, CanvasGradient>
    // Key format: "size_hue" (both bucketed)
    this._cache         = new Map();
    this._hits          = 0;
    this._misses        = 0;
  }


  /* ==========================================================
     1. FPS MONITOR
     ========================================================== */

  /* recordFrame()
     Call once per animation frame with the RAF timestamp.
     Updates the rolling average FPS reading.                   */
  recordFrame(timestamp) {
    if (this._lastTimestamp === 0) {
      this._lastTimestamp = timestamp;
      return;
    }

    const delta         = timestamp - this._lastTimestamp;
    this._lastTimestamp = timestamp;

    // Rolling window — drop oldest sample when full
    this._samples.push(delta);
    if (this._samples.length > this._maxSamples) {
      this._samples.shift();
    }

    // Average delta → FPS
    const avg          = this._samples.reduce((a, b) => a + b, 0) / this._samples.length;
    this._currentFPS   = Math.round(1000 / avg);
  }


  /* ==========================================================
     2. ADAPTIVE CAP
     ========================================================== */

  /* getEffectiveCap()
     Returns the current particle limit the engine should respect.
     Adjusts the cap based on measured FPS each call.

     WHY NOT USE CONFIG.maxParticles DIRECTLY?
       Emitter.emit() checks against CONFIG.maxParticles.
       Instead of mutating CONFIG (which could confuse other systems),
       Optimizer maintains its own _effectiveCap and Engine uses it
       to override the emitter's check when needed.               */
  getEffectiveCap() {
    if (!CONFIG.optimization.adaptiveEnabled) return CONFIG.maxParticles;

    // Cooldown between adjustments — prevents thrashing
    if (this._cooldown > 0) {
      this._cooldown--;
      return this._effectiveCap;
    }

    // Need enough samples for a reliable reading
    if (this._samples.length < this._maxSamples / 2) return this._effectiveCap;

    const fps    = this._currentFPS;
    const target = CONFIG.optimization.targetFPS;

    if (fps < target * 0.85 && this._effectiveCap > 50) {
      // Struggling — reduce cap by 10%, minimum 50 particles
      this._effectiveCap = Math.max(50, Math.floor(this._effectiveCap * 0.90));
      this._cooldown     = 90;   // Wait ~1.5s before adjusting again

    } else if (fps > target * 0.95 && this._effectiveCap < CONFIG.maxParticles) {
      // Headroom — increase cap by 5%, up to the configured maximum
      this._effectiveCap = Math.min(CONFIG.maxParticles, Math.floor(this._effectiveCap * 1.05));
      this._cooldown     = 90;
    }

    return this._effectiveCap;
  }


  /* ==========================================================
     3. GRADIENT CACHE
     ========================================================== */

  /* getGradient()
     Returns a cached CanvasGradient for this particle,
     or creates and stores one on a cache miss.

     Note: gradients are created at origin (0,0) and translated
     via ctx.translate() in Renderer before drawing. This means
     the same gradient object works for any particle position —
     which is what makes caching possible.

     @param ctx  — CanvasRenderingContext2D
     @param p    — Particle instance
     @returns    — CanvasGradient | null (null = cache disabled)  */
  getGradient(ctx, p) {
    if (!CONFIG.optimization.gradientCacheEnabled) return null;

    // Build bucket key — small rounding groups similar particles together
    const sizeKey = Math.round(p.size / 2) * 2;           // 2px buckets
    const hueMatch = p.color.match(/hsl\((\d+(?:\.\d+)?)/);
    const hueKey  = hueMatch
      ? Math.round(parseFloat(hueMatch[1]) / 5) * 5       // 5° buckets
      : 0;
    const key = `${sizeKey}_${hueKey}`;

    if (this._cache.has(key)) {
      this._hits++;
      return this._cache.get(key);
    }

    // Cache miss — build gradient at origin (Renderer translates to p.x, p.y)
    this._misses++;
    const r        = Math.max(0.1, p.size);
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 2);

    // Build a transparent version of the color for the outer stop
    const colorFade = p.color
      .replace('hsl(', 'hsla(')
      .replace(')', ', 0)');

    gradient.addColorStop(0,   p.color);
    gradient.addColorStop(0.4, p.color);
    gradient.addColorStop(1,   colorFade);

    // Evict oldest entry if at capacity
    if (this._cache.size >= CONFIG.optimization.gradientCacheMax) {
      const oldest = this._cache.keys().next().value;
      this._cache.delete(oldest);
    }

    this._cache.set(key, gradient);
    return gradient;
  }

  /* clearCache() — call when color config changes (Branch 7 themes) */
  clearCache() {
    this._cache.clear();
    this._hits   = 0;
    this._misses = 0;
  }


  /* ==========================================================
     Public getters — used by main.js debug panel
     ========================================================== */

  get fps()          { return this._currentFPS; }
  get effectiveCap() { return this._effectiveCap; }

  get cacheHitRate() {
    const total = this._hits + this._misses;
    return total > 0 ? Math.round((this._hits / total) * 100) : 0;
  }

  get cacheSize()    { return this._cache.size; }
}
