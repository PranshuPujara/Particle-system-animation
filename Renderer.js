/* ============================================================
   engine/Renderer.js
   Branch: visual-enhancements
   Commit: "feat: Renderer — trails, glow, gradients, blend modes, opacity curves"

   Depends on: config.js

   WHY A SEPARATE RENDERER:
   In Branches 1-3, rendering was a private method on Engine.
   That worked for basic circles. Now we need:
     - Different clear strategies (full clear vs trail fade)
     - Per-particle gradient construction
     - shadowBlur glow that must wrap each draw call
     - Blend mode switching
     - Opacity curves
   All of that in Engine._render() would bloat it badly.
   Renderer owns the "how to draw" — Engine owns "when to draw".

   HOW IT PLUGS IN:
     Engine calls renderer.clear() then renderer.drawAll(active)
     each frame. Renderer reads CONFIG.visuals for everything.
   ============================================================ */

class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
  }

  /* ----------------------------------------------------------
     clear()
     Called once at the start of every frame.
     Two strategies depending on config:

     FULL CLEAR — ctx.clearRect()
       Every pixel reset to transparent black.
       Particles appear as isolated dots with no trail.

     TRAIL FADE — semi-transparent black rect over the whole canvas
       Instead of erasing, we paint a near-opaque black layer.
       Old particles dim slightly each frame, creating a "ghost" trail.
       trailAlpha controls how fast the trail fades:
         0.05 = very long trail (frames linger a long time)
         0.25 = short trail (frames disappear in ~4 paints)
         1.00 = same as full clear (instant erase)
     ---------------------------------------------------------- */
  clear() {
    const { width: W, height: H } = this.canvas;
    const ctx = this.ctx;

    if (CONFIG.visuals.trailEnabled) {
      // Save then restore so this rect doesn't inherit blend mode
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = CONFIG.visuals.trailAlpha;
      ctx.fillStyle   = '#0a0a0f';   // Match body background color
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    } else {
      ctx.clearRect(0, 0, W, H);
    }
  }

  /* ----------------------------------------------------------
     drawAll()
     Iterates active particles and draws each one.
     Sets blend mode once before the loop (cheaper than per-particle).
     ---------------------------------------------------------- */
  drawAll(particles) {
    const ctx = this.ctx;
    const cfg = CONFIG.visuals;

    // Set blend mode for the entire batch
    // 'lighter' = additive blending — bright where particles overlap
    // 'screen'  = softer additive — great for neon/pastel effects
    ctx.globalCompositeOperation = cfg.blendMode;

    for (const p of particles) {
      this._drawParticle(p);
    }

    // Always reset blend mode after drawing particles
    // so UI elements (debug panel etc.) render normally
    ctx.globalCompositeOperation = 'source-over';
  }

  /* ----------------------------------------------------------
     _drawParticle()
     Draws a single particle using all enabled visual effects.
     Order: opacity curve → glow setup → fill style → arc → stroke glow
     ---------------------------------------------------------- */
  _drawParticle(p) {
    const ctx = this.ctx;
    const cfg = CONFIG.visuals;

    ctx.save();

    // 1. Compute opacity from the chosen curve
    const opacity = this._computeOpacity(p);
    ctx.globalAlpha = Math.max(0, Math.min(1, opacity));

    // 2. Apply glow (shadowBlur) if enabled
    //    Must be set BEFORE the draw call to take effect
    if (cfg.glowEnabled) {
      ctx.shadowColor = p.color;
      ctx.shadowBlur  = cfg.glowBlur;
    }

    // 3. Choose fill style: gradient or flat color
    ctx.fillStyle = cfg.gradientEnabled
      ? this._buildGradient(p)
      : p.color;

    // 4. Draw the particle circle
    ctx.beginPath();
    ctx.arc(p.x, p.y, Math.max(0.1, p.size), 0, Math.PI * 2);
    ctx.fill();

    // 5. Second glow pass — draws the particle again at lower opacity
    //    layering a softer outer halo. Optional but makes glow richer.
    if (cfg.glowEnabled) {
      ctx.globalAlpha = Math.max(0, opacity * cfg.glowAlpha * 0.4);
      ctx.shadowBlur  = cfg.glowBlur * 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /* ----------------------------------------------------------
     _computeOpacity()
     Returns a [0, 1] opacity value based on the chosen curve.

     progress = how far through lifetime (0 = just born, 1 = dead)
     The curves shape how opacity changes over that progress.

     linear  — steady fade: opacity = 1 - progress
     easeIn  — stays bright, drops suddenly near end
     easeOut — fades fast at start, holds longer near end
     pulse   — oscillates using a sine wave (flickering effect)
     ---------------------------------------------------------- */
  _computeOpacity(p) {
    // progress goes from 0 (just born) → 1 (about to die)
    const progress = 1 - (p.lifetime / p.maxLifetime);

    switch (CONFIG.visuals.opacityCurve) {
      case 'easeIn':
        // Cubic ease in — stays bright for most of lifetime, drops fast
        // Formula: 1 - progress³ keeps it near 1 until the very end
        return 1 - (progress * progress * progress);

      case 'easeOut':
        // Square root — fades fast at start, levels out near end
        // Inverted: sqrt of remaining life fraction
        return Math.sqrt(1 - progress);

      case 'pulse':
        // Sine wave riding on top of a linear fade
        // Creates a flickering / pulsing brightness as particle ages
        const fade = 1 - progress;
        const pulse = 0.5 + 0.5 * Math.sin(progress * Math.PI * 6);
        return fade * pulse;

      case 'linear':
      default:
        return p.opacity; // Uses the value already computed in Particle.update()
    }
  }

  /* ----------------------------------------------------------
     _buildGradient()
     Creates a radial gradient for a single particle.
     Center: full color at full opacity
     Edge:   same color at zero opacity (transparent)

     This gives particles a soft, glowing sphere look
     rather than hard flat circles.

     NOTE: createRadialGradient is called per-particle per-frame.
     This is fine for 500 particles but Branch 6 (optimization)
     will cache gradients for frequently reused sizes.
     ---------------------------------------------------------- */
  _buildGradient(p) {
    const ctx = this.ctx;
    const r   = Math.max(0.1, p.size);

    // createRadialGradient(x0, y0, r0,  x1, y1, r1)
    //   inner circle: center point, radius 0
    //   outer circle: same center, radius = particle size
    const gradient = ctx.createRadialGradient(
      p.x, p.y, 0,
      p.x, p.y, r * 2   // Gradient extends to 2× size for softness
    );

    // Parse the HSL color to inject alpha stops
    // p.color is always "hsl(H, S%, L%)" from Particle.reset()
    const colorSolid = p.color;
    const colorFade  = p.color.replace('hsl(', 'hsla(').replace(')', ', 0)');

    gradient.addColorStop(0,    colorSolid);  // Bright center
    gradient.addColorStop(0.4,  colorSolid);  // Hold color partway
    gradient.addColorStop(1,    colorFade);   // Fade to transparent edge

    return gradient;
  }

  /* ----------------------------------------------------------
     Toggle helpers (called from main.js keyboard shortcuts)
     ---------------------------------------------------------- */
  static toggleTrail()    { CONFIG.visuals.trailEnabled    = !CONFIG.visuals.trailEnabled;    }
  static toggleGlow()     { CONFIG.visuals.glowEnabled     = !CONFIG.visuals.glowEnabled;     }
  static toggleGradient() { CONFIG.visuals.gradientEnabled = !CONFIG.visuals.gradientEnabled; }

  static cycleBlendMode() {
    const modes = ['source-over', 'lighter', 'screen'];
    const current = modes.indexOf(CONFIG.visuals.blendMode);
    CONFIG.visuals.blendMode = modes[(current + 1) % modes.length];
  }

  static cycleOpacityCurve() {
    const curves = ['linear', 'easeIn', 'easeOut', 'pulse'];
    const current = curves.indexOf(CONFIG.visuals.opacityCurve);
    CONFIG.visuals.opacityCurve = curves[(current + 1) % curves.length];
  }
}
