/* ============================================================
   config.js
   Branch: basic-engine
   Commit: "feat: central config object and rand() utility"

   Every tuneable number lives here — zero magic numbers in
   engine files. Branch 7 (themes-and-config) will expand
   this into a full theme/preset system.
   ============================================================ */

const CONFIG = {
  // ---- Particle limits ----
  maxParticles:    500,   // Hard cap on live particles at any time

  // ---- Emission ----
  emitRate:        8,     // Particles spawned per mousemove event
  burstCount:      40,    // Particles spawned on click

  // ---- Lifetime (frames) ----
  baseLifetime:    120,   // At 60fps this is ~2 seconds
  lifetimeVariance: 60,   // ± random range added to baseLifetime

  // ---- Speed ----
  baseSpeed:       2.5,   // Emission velocity magnitude
  speedVariance:   1.5,   // ± random range added to baseSpeed

  // ---- Size (radius in px) ----
  baseSize:        4,
  sizeVariance:    3,

  // ---- Color ----
  // HSL lets us shift hue easily for themes
  color: {
    h: 160,               // Hue   (160 = teal-green)
    s: 70,                // Saturation %
    l: 65,                // Lightness %
  },
  colorVariance: 40,      // ± hue shift per particle
};


/* ============================================================
   Utility: rand(min, max)
   Returns a random float in [min, max).
   Lives in config.js because every engine file needs it and
   it has no dependencies of its own.
   ============================================================ */
function rand(min, max) {
  return Math.random() * (max - min) + min;
}
