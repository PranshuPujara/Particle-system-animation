/* ============================================================
   engine/Physics.js
   Branch: physics-effects
   Commit: "feat: Physics — gravity, friction, wind, spiral"

   Depends on: config.js

   DESIGN PRINCIPLE — Pure behavior functions:
     Physics doesn't own any state. Each method takes a particle
     and mutates its velocity or acceleration for that frame.
     This makes behaviors:
       - Independently toggleable (just check config flags)
       - Combinable (run gravity + wind + friction together)
       - Easy to add later (Branch 5 adds attraction/repulsion here)

   HOW IT PLUGS IN:
     Engine._update() calls Physics.apply(particle) on every
     live particle before particle.update() runs.
     So the order each frame is:
       1. Physics.apply(p)  → sets p.ax, p.ay, modifies p.vx/vy
       2. p.update()        → integrates acceleration into velocity
                              and velocity into position
   ============================================================ */

const Physics = {

  /* apply()
     Master method — runs all enabled behaviors on one particle.
     Engine calls this once per particle per frame.              */
  apply(particle) {
    const cfg = CONFIG.physics;

    if (cfg.gravityEnabled)  Physics.applyGravity(particle);
    if (cfg.windEnabled)     Physics.applyWind(particle);
    if (cfg.frictionEnabled) Physics.applyFriction(particle);
    if (cfg.spiralEnabled)   Physics.applySpiral(particle);
  },


  /* ----------------------------------------------------------
     Gravity
     Adds a constant downward acceleration every frame.
     Positive gravityStrength pulls down (normal gravity).
     Negative gravityStrength makes particles float upward
     (anti-gravity — useful for fire / smoke effects).
     ---------------------------------------------------------- */
  applyGravity(p) {
    // We set ay (not vy) so it accumulates through acceleration,
    // then particle.update() integrates it into velocity.
    // This is the correct physics model: F → a → v → x
    p.ay += CONFIG.physics.gravityStrength;
  },


  /* ----------------------------------------------------------
     Wind
     Constant horizontal push. Positive = rightward drift.
     Combine with gravity for a realistic falling + drifting effect.
     ---------------------------------------------------------- */
  applyWind(p) {
    p.ax += CONFIG.physics.windStrength;
  },


  /* ----------------------------------------------------------
     Friction / Drag
     Multiplies velocity by a factor < 1 each frame.
     This simulates air resistance — particles slow down over time.

     frictionAmount = 0.97 → lose 3% speed per frame
     frictionAmount = 0.90 → lose 10% speed per frame (heavy drag)
     frictionAmount = 1.00 → no drag at all

     NOTE: We modify vx/vy directly (not ax/ay) because friction
     is a damping force proportional to current velocity, not a
     constant force. Applying it via acceleration would be wrong.
     ---------------------------------------------------------- */
  applyFriction(p) {
    p.vx *= CONFIG.physics.frictionAmount;
    p.vy *= CONFIG.physics.frictionAmount;
  },


  /* ----------------------------------------------------------
     Spiral
     Rotates the velocity vector by a small angle each frame.
     This makes particles curve in a spiral path outward.

     How it works:
       The velocity vector (vx, vy) has a magnitude (speed) and
       a direction (angle). We increment the angle by spiralSpeed
       radians, then reconstruct vx/vy from the new angle while
       keeping the same speed (magnitude).

       speed = √(vx² + vy²)
       newAngle = atan2(vy, vx) + spiralSpeed
       vx = cos(newAngle) * speed
       vy = sin(newAngle) * speed

     Positive spiralSpeed → clockwise spiral
     Negative spiralSpeed → counter-clockwise spiral
     ---------------------------------------------------------- */
  applySpiral(p) {
    const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    if (speed < 0.001) return; // Skip near-stationary particles

    p.spiralAngle += CONFIG.physics.spiralSpeed;

    const currentAngle = Math.atan2(p.vy, p.vx);
    const newAngle     = currentAngle + CONFIG.physics.spiralSpeed;

    p.vx = Math.cos(newAngle) * speed;
    p.vy = Math.sin(newAngle) * speed;
  },


  /* ----------------------------------------------------------
     Toggle helpers
     Convenient methods for keyboard shortcuts in main.js
     ---------------------------------------------------------- */
  toggleGravity()  { CONFIG.physics.gravityEnabled  = !CONFIG.physics.gravityEnabled;  },
  toggleWind()     { CONFIG.physics.windEnabled      = !CONFIG.physics.windEnabled;      },
  toggleFriction() { CONFIG.physics.frictionEnabled  = !CONFIG.physics.frictionEnabled;  },
  toggleSpiral()   { CONFIG.physics.spiralEnabled    = !CONFIG.physics.spiralEnabled;    },

  /* flipGravity() — switches between normal and anti-gravity */
  flipGravity() {
    CONFIG.physics.gravityStrength *= -1;
  },
};
