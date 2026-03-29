/* ============================================================
   config.js
   Updated in Branch: advanced-interactions
   Commit: "feat: add interactions config block"
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

  /* ---- Mouse ---- */
  mouse: {
    trailEnabled:     true,
    burstEnabled:     true,
    holdEnabled:      true,
    minMoveDistance:  4,
    burstSpeedMult:   2.8,
    holdSpreadAngle:  Math.PI / 3,
  },

  /* ---- Physics ---- */
  physics: {
    gravityEnabled:   false,
    gravityStrength:  0.08,
    frictionEnabled:  false,
    frictionAmount:   0.97,
    windEnabled:      false,
    windStrength:     0.04,
    spiralEnabled:    false,
    spiralSpeed:      0.04,
  },

  /* ---- Visuals ---- */
  visuals: {
    trailEnabled:     false,
    trailAlpha:       0.18,
    glowEnabled:      false,
    glowBlur:         18,
    glowAlpha:        0.8,
    gradientEnabled:  false,
    opacityCurve:     'linear',
    blendMode:        'source-over',
  },

  /* ---- Interactions (NEW in Branch 5) ---- */
  interactions: {

    // --- Attraction ---
    // Particles within radius are pulled toward the cursor.
    attractEnabled:   false,
    attractRadius:    150,    // px — how far the force reaches
    attractStrength:  0.15,   // Force magnitude (higher = snappier pull)

    // --- Repulsion ---
    // Particles within radius are pushed away from the cursor.
    repulseEnabled:   false,
    repulseRadius:    120,    // px
    repulseStrength:  0.25,   // Higher = more explosive push

    // --- Speed-based emission ---
    // Emit MORE particles when mouse moves fast, fewer when slow.
    // Replaces the flat CONFIG.emitRate for trail emission.
    speedEmitEnabled: false,
    speedEmitMin:     1,      // Minimum particles when mouse barely moves
    speedEmitMax:     20,     // Maximum particles at full speed
    speedThreshold:   30,     // px/move considered "maximum speed"
  },
};


/* ============================================================
   Utility: rand(min, max)
   ============================================================ */
function rand(min, max) {
  return Math.random() * (max - min) + min;
}
