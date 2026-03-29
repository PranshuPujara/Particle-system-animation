/* ============================================================
   engine/Renderer.js
   Updated in Branch: optimization
   Commit: "feat: use Optimizer gradient cache, translate-based gradient draw"

   Change from Branch 4:
     - Accepts optimizer reference in constructor
     - _drawParticle() uses ctx.save/translate/restore so gradient
       objects built at origin (0,0) work for any particle position
     - Falls back to inline gradient creation if cache is disabled
   Everything else is identical to Branch 4.
   ============================================================ */

class Renderer {
  constructor(canvas, optimizer = null) {
    this.canvas    = canvas;
    this.ctx       = canvas.getContext('2d');
    this._optimizer = optimizer;   // ← NEW: injected by Engine
  }

  clear() {
    const { width: W, height: H } = this.canvas;
    const ctx = this.ctx;

    if (CONFIG.visuals.trailEnabled) {
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = CONFIG.visuals.trailAlpha;
      ctx.fillStyle   = '#0a0a0f';
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    } else {
      ctx.clearRect(0, 0, W, H);
    }
  }

  drawAll(particles) {
    const ctx = this.ctx;
    ctx.globalCompositeOperation = CONFIG.visuals.blendMode;

    for (const p of particles) {
      this._drawParticle(p);
    }

    ctx.globalCompositeOperation = 'source-over';
  }

  _drawParticle(p) {
    const ctx = this.ctx;
    const cfg = CONFIG.visuals;

    ctx.save();

    const opacity = this._computeOpacity(p);
    ctx.globalAlpha = Math.max(0, Math.min(1, opacity));

    if (cfg.glowEnabled) {
      ctx.shadowColor = p.color;
      ctx.shadowBlur  = cfg.glowBlur;
    }

    // --- Gradient fill with cache support ---
    if (cfg.gradientEnabled) {
      // Translate to particle position so gradient built at (0,0) aligns correctly.
      // This is what makes gradient caching work — one gradient object,
      // used at any position via translation. ← KEY CHANGE IN BRANCH 6
      ctx.translate(p.x, p.y);
      const gradient = this._optimizer
        ? this._optimizer.getGradient(ctx, p)   // Try cache first
        : this._buildGradient(p);               // Fallback: build inline

      ctx.fillStyle = gradient ?? p.color;
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(0.1, p.size), 0, Math.PI * 2);
      ctx.fill();

      if (cfg.glowEnabled) {
        ctx.globalAlpha = Math.max(0, opacity * cfg.glowAlpha * 0.4);
        ctx.shadowBlur  = cfg.glowBlur * 2;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Flat color — no translation needed
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.1, p.size), 0, Math.PI * 2);
      ctx.fill();

      if (cfg.glowEnabled) {
        ctx.globalAlpha = Math.max(0, opacity * cfg.glowAlpha * 0.4);
        ctx.shadowBlur  = cfg.glowBlur * 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  /* Inline gradient builder — used only when cache is disabled */
  _buildGradient(p) {
    const ctx = this.ctx;
    const r   = Math.max(0.1, p.size);

    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 2);
    const colorFade = p.color.replace('hsl(', 'hsla(').replace(')', ', 0)');

    gradient.addColorStop(0,   p.color);
    gradient.addColorStop(0.4, p.color);
    gradient.addColorStop(1,   colorFade);

    return gradient;
  }

  _computeOpacity(p) {
    const progress = 1 - (p.lifetime / p.maxLifetime);

    switch (CONFIG.visuals.opacityCurve) {
      case 'easeIn':  return 1 - (progress * progress * progress);
      case 'easeOut': return Math.sqrt(1 - progress);
      case 'pulse': {
        const fade  = 1 - progress;
        const pulse = 0.5 + 0.5 * Math.sin(progress * Math.PI * 6);
        return fade * pulse;
      }
      default: return p.opacity;
    }
  }

  static toggleTrail()    { CONFIG.visuals.trailEnabled    = !CONFIG.visuals.trailEnabled;    }
  static toggleGlow()     { CONFIG.visuals.glowEnabled     = !CONFIG.visuals.glowEnabled;     }
  static toggleGradient() { CONFIG.visuals.gradientEnabled = !CONFIG.visuals.gradientEnabled; }

  static cycleBlendMode() {
    const modes   = ['source-over', 'lighter', 'screen'];
    const current = modes.indexOf(CONFIG.visuals.blendMode);
    CONFIG.visuals.blendMode = modes[(current + 1) % modes.length];
  }

  static cycleOpacityCurve() {
    const curves  = ['linear', 'easeIn', 'easeOut', 'pulse'];
    const current = curves.indexOf(CONFIG.visuals.opacityCurve);
    CONFIG.visuals.opacityCurve = curves[(current + 1) % curves.length];
  }
}
