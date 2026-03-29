/* ============================================================
   engine/Interactions.js
   Branch: advanced-interactions
   Commit: "feat: Interactions — attraction, repulsion, speed-based emit"

   Depends on: config.js

   HOW IT PLUGS IN:
     Engine._update() calls Interactions.apply(particle, cursor)
     on every live particle — AFTER Physics.apply(), BEFORE p.update().

     Order each frame:
       1. Physics.apply(p)             — gravity, wind, friction, spiral
       2. Interactions.apply(p, cur)   — cursor attraction / repulsion
       3. p.update()                   — integrate all forces → position

   WHY AFTER PHYSICS:
     Physics sets base acceleration from environment.
     Interactions layer cursor forces on top.
     Both get integrated together in p.update() — clean and additive.
   ============================================================ */

const Interactions = {

  /* apply()
     Master method — runs all enabled interactions on one particle.
     `cursor` is { x, y, speed } — provided by InputHandler each frame. */
  apply(particle, cursor) {
    const cfg = CONFIG.interactions;

    // Repulsion runs before attraction.
    // If both are on simultaneously you get a turbulent border zone
    // — particles orbit around the edge of the repulsion radius.
    if (cfg.repulseEnabled) Interactions.applyRepulsion(particle, cursor);
    if (cfg.attractEnabled) Interactions.applyAttraction(particle, cursor);
  },


  /* ----------------------------------------------------------
     Attraction
     Pulls particles toward the cursor.

     Force direction : particle → cursor
     Force magnitude : strength × (1 - distance / radius)
       — Full strength at cursor center
       — Zero at the radius boundary
       — No effect beyond radius

     Linear falloff creates a smooth "gravity well" effect.
     ---------------------------------------------------------- */
  applyAttraction(p, cursor) {
    const cfg = CONFIG.interactions;

    const dx   = cursor.x - p.x;   // vector: particle → cursor
    const dy   = cursor.y - p.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > cfg.attractRadius || dist < 0.001) return;

    // Normalize to unit vector
    const nx = dx / dist;
    const ny = dy / dist;

    // Linear falloff from center to edge
    const falloff = 1 - (dist / cfg.attractRadius);
    const force   = cfg.attractStrength * falloff;

    // Add to acceleration — p.update() integrates this
    p.ax += nx * force;
    p.ay += ny * force;
  },


  /* ----------------------------------------------------------
     Repulsion
     Pushes particles away from the cursor.

     Force direction : cursor → particle (opposite of attraction)
     Force magnitude : strength × (1 - dist/radius)²

     Squared falloff makes it feel like a physical shockwave:
     very strong close up, drops off sharply with distance.
     ---------------------------------------------------------- */
  applyRepulsion(p, cursor) {
    const cfg = CONFIG.interactions;

    const dx   = p.x - cursor.x;   // vector: cursor → particle (away)
    const dy   = p.y - cursor.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > cfg.repulseRadius || dist < 0.001) return;

    // Normalize to unit vector
    const nx = dx / dist;
    const ny = dy / dist;

    // Squared falloff = explosive near cursor, gentle at edge
    const falloff = 1 - (dist / cfg.repulseRadius);
    const force   = cfg.repulseStrength * falloff * falloff;

    p.ax += nx * force;
    p.ay += ny * force;
  },


  /* ----------------------------------------------------------
     speedBasedCount()
     Maps current mouse speed → how many particles to emit.

     Uses linear interpolation between speedEmitMin and speedEmitMax:
       speed = 0         → emit speedEmitMin
       speed ≥ threshold → emit speedEmitMax
       speed in between  → lerp proportionally

     Result: slow careful strokes = sparse dots.
             fast flicks = dense particle spray.

     Called by InputHandler._onMove() instead of CONFIG.emitRate.
     ---------------------------------------------------------- */
  speedBasedCount(mouseSpeed) {
    const cfg = CONFIG.interactions;

    // If disabled, fall back to the flat global rate
    if (!cfg.speedEmitEnabled) return CONFIG.emitRate;

    // Clamp speed into [0, threshold]
    const clamped = Math.min(mouseSpeed, cfg.speedThreshold);

    // Linear interpolation
    const t = clamped / cfg.speedThreshold;
    return Math.round(cfg.speedEmitMin + t * (cfg.speedEmitMax - cfg.speedEmitMin));
  },


  /* ---- Toggle helpers (called from main.js keyboard shortcuts) ---- */
  toggleAttract()   { CONFIG.interactions.attractEnabled   = !CONFIG.interactions.attractEnabled;   },
  toggleRepulse()   { CONFIG.interactions.repulseEnabled   = !CONFIG.interactions.repulseEnabled;   },
  toggleSpeedEmit() { CONFIG.interactions.speedEmitEnabled = !CONFIG.interactions.speedEmitEnabled; },
};
