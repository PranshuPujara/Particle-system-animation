/* ============================================================
   engine/Emitter.js
   Updated in Branch: mouse-interaction
   Commit: "feat: add emitDirectional() for hold-stream and jets"

   New method added: emitDirectional()
   Everything else from Branch 1 is unchanged.
   ============================================================ */

class Emitter {
  constructor(pool, activeList) {
    this._pool        = pool;
    this._activeList  = activeList;
    this._totalEmitted = 0;
  }

  /* emit()
     Unchanged from Branch 1.
     Full-circle or cone emission centered at angle 0 (right).   */
  emit(x, y, count = 1, spreadAngle = Math.PI * 2, speed = null, options = {}) {
    if (this._activeList.length >= CONFIG.maxParticles) return;

    const spd = speed ?? CONFIG.baseSpeed;

    for (let i = 0; i < count; i++) {
      if (this._activeList.length >= CONFIG.maxParticles) break;

      const angle     = rand(-spreadAngle / 2, spreadAngle / 2);
      const magnitude = spd + rand(-CONFIG.speedVariance, CONFIG.speedVariance);

      const vx = Math.cos(angle) * magnitude;
      const vy = Math.sin(angle) * magnitude;

      const particle = this._pool.get(x, y, vx, vy, options);
      this._activeList.push(particle);
      this._totalEmitted++;
    }
  }

  /* emitDirectional()                          ← NEW in Branch 2
     Emits particles centered on a specific angle (radians).
     Used for:
       - Hold stream  (points in direction of mouse movement)
       - Fountain     (points straight up: -Math.PI / 2)
       - Jet / thruster (any fixed direction)

     @param direction  — center angle in radians
     @param spread     — cone width in radians (Math.PI/4 = 45°)   */
  emitDirectional(x, y, count = 1, direction = 0, spread = Math.PI / 4, speed = null, options = {}) {
    if (this._activeList.length >= CONFIG.maxParticles) return;

    const spd = speed ?? CONFIG.baseSpeed;

    for (let i = 0; i < count; i++) {
      if (this._activeList.length >= CONFIG.maxParticles) break;

      // Random angle within cone, centered on `direction`
      const angle     = direction + rand(-spread / 2, spread / 2);
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
