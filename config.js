/* ============================================================
   config.js
   Updated in Branch: visual-enhancements
   Commit: "feat: add visuals config block"
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

  /* ---- Visuals (NEW in Branch 4) ---- */
  visuals: {

    // --- Motion trail ---
    // Instead of clearing canvas fully, paint a semi-transparent
    // black rect each frame — old particles "ghost" into a trail.
    // trailAlpha: 1.0 = full clear (no trail), 0.1 = long trail
    trailEnabled:     false,
    trailAlpha:       0.18,

    // --- Glow ---
    // Uses canvas shadowBlur to paint a soft halo around each particle.
    glowEnabled:      false,
    glowBlur:         18,       // shadowBlur radius in px
    glowAlpha:        0.8,      // Glow opacity (separate from particle opacity)

    // --- Gradient fill ---
    // Each particle is filled with a radial gradient instead of flat color.
    // Center: full color. Edge: transparent.
    gradientEnabled:  false,

    // --- Opacity curve ---
    // 'linear'  — default, fades steadily
    // 'easeIn'  — stays bright, drops fast at end
    // 'easeOut' — fades fast at start, holds near end
    // 'pulse'   — oscillates opacity over lifetime
    opacityCurve:     'linear',

    // --- Blend mode ---
    // 'source-over' = normal (default)
    // 'lighter'     = additive — particles add light where they overlap
    // 'screen'      = like lighter but softer — great for neon
    blendMode:        'source-over',
  },
};


/* ============================================================
   Utility: rand(min, max)
   ============================================================ */
function rand(min, max) {
  return Math.random() * (max - min) + min;
}
