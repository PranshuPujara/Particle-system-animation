/* ============================================================
   config.js
   Updated in Branch: physics-effects
   Commit: "feat: add physics config block"
   ============================================================ */

const CONFIG = {

  /* ---- Particle limits ---- */
  maxParticles:     500,

  /* ---- Emission ---- */
  emitRate:         6,
  burstCount:       45,
  holdEmitRate:     3,

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

  /* ---- Mouse interaction ---- */
  mouse: {
    trailEnabled:     true,
    burstEnabled:     true,
    holdEnabled:      true,
    minMoveDistance:  4,
    burstSpeedMult:   2.8,
    holdSpreadAngle:  Math.PI / 3,
  },

  /* ---- Physics (NEW in Branch 3) ---- */
  physics: {

    // --- Gravity ---
    // Positive = pulls down, negative = floats up (anti-gravity)
    gravityEnabled:   false,
    gravityStrength:  0.08,   // Added to vy each frame

    // --- Friction / drag ---
    // Multiplies velocity each frame. 1.0 = no drag, 0.95 = gentle drag
    frictionEnabled:  false,
    frictionAmount:   0.97,

    // --- Wind ---
    // Constant horizontal acceleration (positive = rightward)
    windEnabled:      false,
    windStrength:     0.04,

    // --- Spiral ---
    // Rotates the velocity vector by a small angle each frame
    spiralEnabled:    false,
    spiralSpeed:      0.04,   // Radians per frame
  },
};


/* ============================================================
   Utility: rand(min, max)
   ============================================================ */
function rand(min, max) {
  return Math.random() * (max - min) + min;
}
