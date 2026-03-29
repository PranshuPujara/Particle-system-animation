/* ============================================================
   themes.js
   Branch: themes-and-config
   Commit: "feat: define all visual theme presets"

   Each theme is a plain object that overrides specific sections
   of CONFIG. ThemeManager merges these onto CONFIG when switching.

   DESIGN RULE:
     Themes are only data — no logic, no functions.
     All logic for applying a theme lives in ThemeManager.
     This means adding a new theme = adding one object here, nothing else.

   THEMES INCLUDED:
     default    — teal-green, balanced, clean starting point
     neon       — additive blend, glow, trail, electric colors
     fire       — upward anti-gravity, warm hues, easeIn opacity
     snow       — falling particles, slow speed, cool blues
     galaxy     — spiral motion, dark palette, deep space feel
     pastel     — soft colors, screen blend, gentle physics
   ============================================================ */

const THEMES = {

  /* ----------------------------------------------------------
     Default
     The engine baseline — what you see on first load.
     All effects off, teal-green color, clean flat circles.
     ---------------------------------------------------------- */
  default: {
    label: 'Default',
    color:        { h: 160, s: 70, l: 65 },
    colorVariance: 40,
    baseSpeed:     2.5,
    speedVariance: 1.5,
    baseSize:      4,
    sizeVariance:  3,
    baseLifetime:  120,

    mouse: {
      trailEnabled:    true,
      burstEnabled:    true,
      holdEnabled:     true,
      minMoveDistance: 4,
      burstSpeedMult:  2.8,
      holdSpreadAngle: Math.PI / 3,
    },

    physics: {
      gravityEnabled:  false,
      gravityStrength: 0.08,
      frictionEnabled: false,
      frictionAmount:  0.97,
      windEnabled:     false,
      windStrength:    0.04,
      spiralEnabled:   false,
      spiralSpeed:     0.04,
    },

    visuals: {
      trailEnabled:    false,
      trailAlpha:      0.18,
      glowEnabled:     false,
      glowBlur:        18,
      glowAlpha:       0.8,
      gradientEnabled: false,
      opacityCurve:    'linear',
      blendMode:       'source-over',
    },

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
  },


  /* ----------------------------------------------------------
     Neon
     Electric, additive, glowing.
     Particles add light where they overlap — white-hot centers.
     Best in dark rooms.
     ---------------------------------------------------------- */
  neon: {
    label: 'Neon',
    color:        { h: 195, s: 100, l: 60 },  // Electric cyan base
    colorVariance: 80,                          // Wide hue range: cyan → magenta
    baseSpeed:     3.0,
    speedVariance: 2.0,
    baseSize:      3,
    sizeVariance:  2,
    baseLifetime:  100,

    mouse: {
      trailEnabled:    true,
      burstEnabled:    true,
      holdEnabled:     true,
      minMoveDistance: 3,
      burstSpeedMult:  3.2,
      holdSpreadAngle: Math.PI / 4,
    },

    physics: {
      gravityEnabled:  false,
      gravityStrength: 0.08,
      frictionEnabled: true,
      frictionAmount:  0.98,   // Very light drag — trails linger
      windEnabled:     false,
      windStrength:    0.04,
      spiralEnabled:   false,
      spiralSpeed:     0.04,
    },

    visuals: {
      trailEnabled:    true,
      trailAlpha:      0.12,   // Long persistence trail
      glowEnabled:     true,
      glowBlur:        22,
      glowAlpha:       0.9,
      gradientEnabled: true,
      opacityCurve:    'easeIn',  // Stays bright, drops fast at end
      blendMode:       'lighter', // Additive — overlapping = white-hot
    },

    interactions: {
      attractEnabled:   false,
      attractRadius:    150,
      attractStrength:  0.15,
      repulseEnabled:   false,
      repulseRadius:    120,
      repulseStrength:  0.25,
      speedEmitEnabled: true,   // Fast flicks spray dense neon burst
      speedEmitMin:     2,
      speedEmitMax:     18,
      speedThreshold:   28,
    },
  },


  /* ----------------------------------------------------------
     Fire
     Upward-drifting, warm, alive.
     Anti-gravity + easeIn opacity + warm hues = convincing flame.
     ---------------------------------------------------------- */
  fire: {
    label: 'Fire',
    color:        { h: 25, s: 100, l: 55 },   // Orange base
    colorVariance: 30,                          // Orange → red range
    baseSpeed:     2.0,
    speedVariance: 1.2,
    baseSize:      5,
    sizeVariance:  3,
    baseLifetime:  90,

    mouse: {
      trailEnabled:    true,
      burstEnabled:    true,
      holdEnabled:     true,
      minMoveDistance: 3,
      burstSpeedMult:  2.0,
      holdSpreadAngle: Math.PI / 5,  // Narrow upward cone
    },

    physics: {
      gravityEnabled:  true,
      gravityStrength: -0.06,  // Negative = upward (anti-gravity)
      frictionEnabled: true,
      frictionAmount:  0.96,   // Slows down as it rises
      windEnabled:     true,
      windStrength:    0.015,  // Gentle side drift — flickering feel
      spiralEnabled:   false,
      spiralSpeed:     0.04,
    },

    visuals: {
      trailEnabled:    true,
      trailAlpha:      0.20,
      glowEnabled:     true,
      glowBlur:        14,
      glowAlpha:       0.7,
      gradientEnabled: true,
      opacityCurve:    'easeIn',   // Bright at birth, vanishes fast
      blendMode:       'lighter',  // Additive makes overlapping flames glow hot
    },

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
  },


  /* ----------------------------------------------------------
     Snow
     Slow, peaceful, falling.
     Gentle gravity + wind drift + wide spread = snowfall.
     ---------------------------------------------------------- */
  snow: {
    label: 'Snow',
    color:        { h: 210, s: 30, l: 90 },   // Near-white with cool tint
    colorVariance: 15,
    baseSpeed:     0.8,
    speedVariance: 0.5,
    baseSize:      3,
    sizeVariance:  2,
    baseLifetime:  200,   // Particles live longer — slow drift

    mouse: {
      trailEnabled:    true,
      burstEnabled:    true,
      holdEnabled:     true,
      minMoveDistance: 2,
      burstSpeedMult:  1.5,
      holdSpreadAngle: Math.PI * 2,  // Full circle — snowdrift on hold
    },

    physics: {
      gravityEnabled:  true,
      gravityStrength: 0.03,   // Very gentle fall
      frictionEnabled: true,
      frictionAmount:  0.99,   // Almost no drag — floats
      windEnabled:     true,
      windStrength:    0.008,  // Subtle side drift
      spiralEnabled:   false,
      spiralSpeed:     0.04,
    },

    visuals: {
      trailEnabled:    false,
      trailAlpha:      0.18,
      glowEnabled:     false,
      glowBlur:        8,
      glowAlpha:       0.5,
      gradientEnabled: true,    // Soft sphere look for snowflakes
      opacityCurve:    'easeOut',  // Fades in gently, lingers
      blendMode:       'screen',   // Soft blend — layered snow is bright
    },

    interactions: {
      attractEnabled:   false,
      attractRadius:    150,
      attractStrength:  0.15,
      repulseEnabled:   true,   // Cursor disturbs the snowfield
      repulseRadius:    80,
      repulseStrength:  0.10,   // Gentle — snow drifts away, not blasts
      speedEmitEnabled: false,
      speedEmitMin:     1,
      speedEmitMax:     20,
      speedThreshold:   30,
    },
  },


  /* ----------------------------------------------------------
     Galaxy
     Deep space. Spiral motion, dark palette, slow and vast.
     ---------------------------------------------------------- */
  galaxy: {
    label: 'Galaxy',
    color:        { h: 260, s: 60, l: 70 },   // Purple-blue base
    colorVariance: 60,                          // Blue → violet range
    baseSpeed:     1.8,
    speedVariance: 1.0,
    baseSize:      2,
    sizeVariance:  2,
    baseLifetime:  160,

    mouse: {
      trailEnabled:    true,
      burstEnabled:    true,
      holdEnabled:     true,
      minMoveDistance: 2,
      burstSpeedMult:  2.5,
      holdSpreadAngle: Math.PI * 2,
    },

    physics: {
      gravityEnabled:  false,
      gravityStrength: 0.08,
      frictionEnabled: true,
      frictionAmount:  0.99,   // Almost frictionless — particles glide far
      windEnabled:     false,
      windStrength:    0.04,
      spiralEnabled:   true,   // Spiral is the defining feature
      spiralSpeed:     0.025,  // Slow spiral — feels orbital
    },

    visuals: {
      trailEnabled:    true,
      trailAlpha:      0.08,   // Very long trail — star streaks
      glowEnabled:     true,
      glowBlur:        12,
      glowAlpha:       0.6,
      gradientEnabled: true,
      opacityCurve:    'linear',
      blendMode:       'screen',  // Stars layer softly
    },

    interactions: {
      attractEnabled:   true,   // Cursor acts as a gravitational center
      attractRadius:    200,
      attractStrength:  0.08,   // Gentle pull — orbit, don't collapse
      repulseEnabled:   false,
      repulseRadius:    120,
      repulseStrength:  0.25,
      speedEmitEnabled: false,
      speedEmitMin:     1,
      speedEmitMax:     20,
      speedThreshold:   30,
    },
  },


  /* ----------------------------------------------------------
     Pastel
     Soft, dreamy, gentle.
     Screen blend + gradient + easeOut = watercolor feel.
     ---------------------------------------------------------- */
  pastel: {
    label: 'Pastel',
    color:        { h: 320, s: 60, l: 80 },   // Soft pink base
    colorVariance: 120,                         // Full spectrum, all desaturated
    baseSpeed:     1.5,
    speedVariance: 1.0,
    baseSize:      6,
    sizeVariance:  4,
    baseLifetime:  150,

    mouse: {
      trailEnabled:    true,
      burstEnabled:    true,
      holdEnabled:     true,
      minMoveDistance: 3,
      burstSpeedMult:  2.0,
      holdSpreadAngle: Math.PI * 2,
    },

    physics: {
      gravityEnabled:  false,
      gravityStrength: 0.08,
      frictionEnabled: true,
      frictionAmount:  0.97,
      windEnabled:     false,
      windStrength:    0.04,
      spiralEnabled:   false,
      spiralSpeed:     0.04,
    },

    visuals: {
      trailEnabled:    true,
      trailAlpha:      0.15,
      glowEnabled:     false,
      glowBlur:        18,
      glowAlpha:       0.8,
      gradientEnabled: true,   // Large soft spheres = watercolor blobs
      opacityCurve:    'easeOut',
      blendMode:       'screen',  // Layered pastels stay light and airy
    },

    interactions: {
      attractEnabled:   false,
      attractRadius:    150,
      attractStrength:  0.15,
      repulseEnabled:   false,
      repulseRadius:    120,
      repulseStrength:  0.25,
      speedEmitEnabled: true,
      speedEmitMin:     1,
      speedEmitMax:     12,
      speedThreshold:   25,
    },
  },
};
