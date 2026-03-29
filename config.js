/* ============================================================
   config.js
   Updated in Branch: optimization
   Commit: "feat: add optimization config block"
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

  /* ---- Interactions ---- */
  interactions: {
    attractEnabled:   false,
    attractRadius:    150,
    attractStrength:  0.15,
    repulseEnabled:   false,
    repulseRadius:    120,
    repulseStrength:  0.25,
    speedEmitEnabled: false,
    speedEmitMin:     1,
    speedEmitMax:     20,
    speedThreshold:   30,
  },

  /* ---- Optimization (NEW in Branch 6) ---- */
  optimization: {

    // --- Adaptive particle cap ---
    // Optimizer watches real FPS. If it drops below targetFPS,
    // it lowers the effective particle cap automatically.
    // When FPS recovers it raises the cap back up gradually.
    adaptiveEnabled:  true,
    targetFPS:        55,     // Try to stay at or above this

    // --- Gradient cache ---
    // createRadialGradient() is expensive. Without caching it runs
    // once per particle per frame (~500×/frame = 30,000×/sec).
    // The cache reuses gradient objects for particles with similar
    // size + hue, making it nearly free after the first few frames.
    gradientCacheEnabled: true,
    gradientCacheMax:     80,   // Max cached entries before eviction

    // --- Off-screen culling ---
    // Particles that have drifted outside the canvas are invisible.
    // No point running physics + interactions on them.
    // cullMargin lets edge-particles continue for a few px before being skipped.
    cullOffscreen:    true,
    cullMargin:       60,     // px outside canvas still considered "on screen"
  },
};


/* ============================================================
   Utility: rand(min, max)
   ============================================================ */
function rand(min, max) {
  return Math.random() * (max - min) + min;
}
