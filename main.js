/* ============================================================
   main.js
   Updated in Branch: advanced-interactions
   Commit: "feat: wire setInput(), keyboard shortcuts for interactions"
   ============================================================ */


/* ---- 1. Boot ---- */
const canvas = document.getElementById('particleCanvas');
const engine = new Engine(canvas);
const input  = new InputHandler(canvas, engine.emitter);

// Give engine access to cursor state for Interactions each frame
engine.setInput(input);
engine.start();


/* ---- 2. Debug panel ---- */
const dbgCount    = document.getElementById('dbgCount');
const dbgFPS      = document.getElementById('dbgFPS');
const dbgDelta    = document.getElementById('dbgDelta');
const dbgPool     = document.getElementById('dbgPool');
const dbgTotal    = document.getElementById('dbgTotal');
const dbgHeld     = document.getElementById('dbgHeld');
const dbgSpeed    = document.getElementById('dbgSpeed');
const dbgPhysics  = document.getElementById('dbgPhysics');
const dbgVisuals  = document.getElementById('dbgVisuals');
const dbgBlend    = document.getElementById('dbgBlend');
const dbgCurve    = document.getElementById('dbgCurve');
const dbgInteract = document.getElementById('dbgInteract');

setInterval(() => {
  const s = engine.stats;
  dbgCount.textContent = s.activeCount;
  dbgFPS.textContent   = s.fps;
  dbgDelta.textContent = s.deltaTime;
  dbgPool.textContent  = s.poolSize;
  dbgTotal.textContent = s.totalEmitted;
  dbgHeld.textContent  = input.isHeld ? 'yes' : 'no';
  dbgSpeed.textContent = Math.round(input.speed) + ' px';

  const pc = CONFIG.physics;
  const physList = [];
  if (pc.gravityEnabled)  physList.push(pc.gravityStrength > 0 ? 'gravity' : 'anti-grav');
  if (pc.frictionEnabled) physList.push('friction');
  if (pc.windEnabled)     physList.push('wind');
  if (pc.spiralEnabled)   physList.push('spiral');
  dbgPhysics.textContent = physList.length ? physList.join(', ') : 'none';

  const vc = CONFIG.visuals;
  const visList = [];
  if (vc.trailEnabled)    visList.push('trail');
  if (vc.glowEnabled)     visList.push('glow');
  if (vc.gradientEnabled) visList.push('gradient');
  dbgVisuals.textContent = visList.length ? visList.join(', ') : 'none';
  dbgBlend.textContent   = vc.blendMode;
  dbgCurve.textContent   = vc.opacityCurve;

  const ic = CONFIG.interactions;
  const intList = [];
  if (ic.attractEnabled)   intList.push('attract');
  if (ic.repulseEnabled)   intList.push('repulse');
  if (ic.speedEmitEnabled) intList.push('speed-emit');
  dbgInteract.textContent = intList.length ? intList.join(', ') : 'none';
}, 80);


/* ---- 3. Keyboard shortcuts ---- */
window.addEventListener('keydown', (e) => {
  switch (e.key.toLowerCase()) {
    // Physics (Branch 3)
    case 'g': Physics.toggleGravity();  break;
    case 'f': Physics.toggleFriction(); break;
    case 'w': Physics.toggleWind();     break;
    case 's': Physics.toggleSpiral();   break;
    case 'a': Physics.flipGravity();    break;

    // Visuals (Branch 4)
    case 't': Renderer.toggleTrail();        break;
    case 'l': Renderer.toggleGlow();         break;
    case 'r': Renderer.toggleGradient();     break;
    case 'b': Renderer.cycleBlendMode();     break;
    case 'o': Renderer.cycleOpacityCurve();  break;

    // Interactions (Branch 5) ← NEW
    case 'q': Interactions.toggleAttract();   break;  // Q — attract
    case 'e': Interactions.toggleRepulse();   break;  // E — repulse
    case 'x': Interactions.toggleSpeedEmit(); break;  // X — speed emit
  }
});
