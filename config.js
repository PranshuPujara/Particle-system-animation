/* ============================================================
   config.js
   Updated in Branch: mouse-interaction
   Commit: "feat: add mouse interaction config settings"
   ============================================================ */

const CONFIG = {

  /* ---- Particle limits ---- */
  maxParticles:     500,

  /* ---- Emission ---- */
  emitRate:         6,      // Particles per mousemove event (trail)
  burstCount:       45,     // Particles on click
  holdEmitRate:     3,      // Particles per frame while mouse held down

  /* ---- Lifetime (frames at 60fps) ---- */
  baseLifetime:     120,
  lifetimeVariance: 60,

  /* ---- Speed ---- */
  baseSpeed:        2.5,
  speedVariance:    1.5,

  /* ---- Size (radius px) ---- */
  baseSize:         4,
  sizeVariance:     3,

  /* ---- Color ---- */
  color: { h: 160, s: 70, l: 65 },
  colorVariance: 40,

  /* ---- Mouse interaction (NEW in Branch 2) ---- */
  mouse: {
    trailEnabled:     true,   // mousemove  → particle trail
    burstEnabled:     true,   // click      → burst explosion
    holdEnabled:      true,   // mousedown  → continuous stream

    // Minimum px mouse must move before emitting trail particles.
    // Prevents particle flood when mouse is nearly still.
    minMoveDistance:  4,

    // Burst speed multiplier relative to baseSpeed
    burstSpeedMult:   2.8,

    // Hold stream: narrow cone pointing away from movement direction
    holdSpreadAngle:  Math.PI / 3,   // 60° cone
  },
};


/* ============================================================
   Utility: rand(min, max) — float in [min, max)
   ============================================================ */
function rand(min, max) {
  return Math.random() * (max - min) + min;
}
