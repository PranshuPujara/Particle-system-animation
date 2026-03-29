/* ============================================================
   config.js
   Updated in Branch: themes-and-config
   Commit: "feat: add activeTheme pointer to CONFIG"

   One addition: CONFIG.activeTheme
   ThemeManager reads this to know which preset is loaded.
   Everything else is the default theme values (identical to B6).
   ============================================================ */

const CONFIG = {

  /* ---- Active theme (NEW in Branch 7) ---- */
  // ThemeManager sets this when apply() is called.
  // Useful for saving/restoring state, analytics, or UI highlighting.
  activeTheme: 'default',

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

  /* ---- Optimization ---- */
  optimization: {
    adaptiveEnabled:      true,
    targetFPS:            55,
    gradientCacheEnabled: true,
    gradientCacheMax:     80,
    cullOffscreen:        true,
    cullMargin:           60,
  },
};


/* ============================================================
   Utility: rand(min, max)
   ============================================================ */
function rand(min, max) {
  return Math.random() * (max - min) + min;
}
