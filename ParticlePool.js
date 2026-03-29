/* ============================================================
   engine/ParticlePool.js
   Branch: basic-engine
   Commit: "feat: ParticlePool — GC-free particle recycling"

   Depends on: Particle.js, config.js

   WHY THIS EXISTS:
   Without pooling, creating ~60 new Particle objects per second
   and letting the GC clean up dead ones causes periodic frame
   drops (jank). With pooling, all memory is allocated once at
   startup and dead particles are simply reset() and reused.
   ============================================================ */

class ParticlePool {
  constructor(initialSize = 200) {
    // Pre-allocate a fixed set of Particle objects upfront.
    // These are "dead" by default — reset() activates them.
    this._pool = Array.from({ length: initialSize }, () => new Particle());

    // Optional: track pool stats for the debug panel
    this._totalCreated = initialSize;
    this._totalReused  = 0;
  }

  /* get()
     Returns a ready-to-use Particle, either recycled or newly allocated.
     Passes all arguments straight through to Particle.reset(). */
  get(x, y, vx, vy, options) {
    // Scan the pool for any dead particle to recycle
    const recycled = this._pool.find(p => !p.alive);

    if (recycled) {
      this._totalReused++;
      return recycled.reset(x, y, vx, vy, options);
    }

    // Pool is fully active — grow it by allocating a new Particle.
    // The pool grows dynamically and never shrinks. This keeps the
    // working set stable after the first few seconds.
    const fresh = new Particle();
    this._pool.push(fresh);
    this._totalCreated++;

    return fresh.reset(x, y, vx, vy, options);
  }

  /* size — current pool capacity (live + dead) */
  get size() {
    return this._pool.length;
  }

  /* stats — for debugging */
  get stats() {
    return {
      total:   this._totalCreated,
      reused:  this._totalReused,
      dead:    this._pool.filter(p => !p.alive).length,
    };
  }
}
