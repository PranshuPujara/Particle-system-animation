/* ============================================================
   main.js
   Updated in Branch: visual-enhancements
   Commit: "feat: keyboard shortcuts for visual effects toggles"
   ============================================================ */


/* ---- 1. Boot ---- */
const canvas = document.getElementById('particleCanvas');
const engine = new Engine(canvas);
const input  = new InputHandler(canvas, engine.emitter);
engine.start();


/* ---- 2. Debug panel ---- */
const dbgCount   = document.getElementById('dbgCount');
const dbgFPS     = document.getElementById('dbgFPS');
const dbgDelta   = document.getElementById('dbgDelta');
const dbgPool    = document.getElementById('dbgPool');
const dbgTotal   = document.getElementById('dbgTotal');
const dbgHeld    = document.getElementById('dbgHeld');
const dbgPhysics = document.getElementById('dbgPhysics');
const dbgVisuals = document.getElementById('dbgVisuals');
const dbgBlend   = document.getElementById('dbgBlend');
const dbgCurve   = document.getElementById('dbgCurve');

setInterval(() => {
  const s = engine.stats;
  dbgCount.textContent = s.activeCount;
  dbgFPS.textContent   = s.fps;
  dbgDelta.textContent = s.deltaTime;
  dbgPool.textContent  = s.poolSize;
  dbgTotal.textContent = s.totalEmitted;
  dbgHeld.textContent  = input.isHeld ? 'yes' : 'no';

  const pc = CONFIG.physics;
  const physActive = [];
  if (pc.gravityEnabled)  physActive.push(pc.gravityStrength > 0 ? 'gravity' : 'anti-grav');
  if (pc.frictionEnabled) physActive.push('friction');
  if (pc.windEnabled)     physActive.push('wind');
  if (pc.spiralEnabled)   physActive.push('spiral');
  dbgPhysics.textContent = physActive.length ? physActive.join(', ') : 'none';

  const vc = CONFIG.visuals;
  const visActive = [];
  if (vc.trailEnabled)    visActive.push('trail');
  if (vc.glowEnabled)     visActive.push('glow');
  if (vc.gradientEnabled) visActive.push('gradient');
  dbgVisuals.textContent = visActive.length ? visActive.join(', ') : 'none';
  dbgBlend.textContent   = vc.blendMode;
  dbgCurve.textContent   = vc.opacityCurve;
}, 80);


/* ---- 3. Keyboard shortcuts ---- */
window.addEventListener('keydown', (e) => {
  switch (e.key.toLowerCase()) {
    // Physics (from Branch 3)
    case 'g': Physics.toggleGravity();  break;
    case 'f': Physics.toggleFriction(); break;
    case 'w': Physics.toggleWind();     break;
    case 's': Physics.toggleSpiral();   break;
    case 'a': Physics.flipGravity();    break;

    // Visuals (NEW in Branch 4)
    case 't': Renderer.toggleTrail();       break;  // T — trail
    case 'l': Renderer.toggleGlow();        break;  // L — glow (L for gLow)
    case 'r': Renderer.toggleGradient();    break;  // R — gradient (R for Radial)
    case 'b': Renderer.cycleBlendMode();    break;  // B — blend mode cycle
    case 'o': Renderer.cycleOpacityCurve(); break;  // O — opacity curve cycle
  }
});
