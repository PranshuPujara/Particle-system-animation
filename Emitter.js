/* ============================================================
   engine/Emitter.js
   Branch: basic-engine
   Commit: "feat: Emitter with configurable spread and speed"

   Depends on: ParticlePool.js, config.js

   The Emitter knows HOW to create particles but knows nothing
   about rendering or physics. It only calls pool.get() and
   pushes results into the engine's active list.

   Branch 2 will add directional / burst / continuous modes.
   Branch 3 will let emit() pass physics options to particles.
   ============================================================ */

class Emitter {
  constructor(pool, activeList) {
    this._pool        = pool;        // ParticlePool instance
    this._activeList  = activeList;  // Reference to Engine.active array
    this._totalEmitted = 0;
  }

  /* emit()
     Spawns `count` particles at canvas position (x, y).

     @param x, y         — spawn position
     @param count        — number of particles to emit
     @param spreadAngle  — cone width in radians
                           Math.PI * 2  → full circle (default, for trails)
                           Math.PI / 4  → narrow 45° cone (for jets)
     @param speed        — velocity magnitude (null = use CONFIG.baseSpeed)
     @param options      — forwarded to Particle.reset() (size, color overrides)
  */
  emit(x, y, count = 1, spreadAngle = Math.PI * 2, speed = null, options = {}) {
    // Never exceed the global particle cap
    if (this._activeList.length >= CONFIG.maxParticles) return;

    const spd = speed ?? CONFIG.baseSpeed;

    for (let i = 0; i < count; i++) {
      if (this._activeList.length >= CONFIG.maxParticles) break;

      // Pick a random angle within the spread cone
      // Centered at 0 (pointing right) — callers can rotate externally
      const angle     = rand(-spreadAngle / 2, spreadAngle / 2);
      const magnitude = spd + rand(-CONFIG.speedVariance, CONFIG.speedVariance);

      const vx = Math.cos(angle) * magnitude;
      const vy = Math.sin(angle) * magnitude;

      const particle = this._pool.get(x, y, vx, vy, options);
      this._activeList.push(particle);
      this._totalEmitted++;
    }
  }

  get totalEmitted() {
    return this._totalEmitted;
  }
}
