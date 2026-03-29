/* ============================================================
   main.js
   Updated in Branch: physics-effects
   Commit: "feat: keyboard shortcuts to toggle physics behaviors"

   Added: keyboard listener to toggle each physics behavior
   and display active physics in debug panel.
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
const dbgAngle   = document.getElementById('dbgAngle');
const dbgPhysics = document.getElementById('dbgPhysics');

setInterval(() => {
  const s = engine.stats;
  dbgCount.textContent = s.activeCount;
  dbgFPS.textContent   = s.fps;
  dbgDelta.textContent = s.deltaTime;
  dbgPool.textContent  = s.poolSize;
  dbgTotal.textContent = s.totalEmitted;
  dbgHeld.textContent  = input.isHeld ? 'yes' : 'no';
  dbgAngle.textContent = (input.moveAngle * (180 / Math.PI)).toFixed(1) + '°';

  // Show which physics behaviors are currently active
  const cfg = CONFIG.physics;
  const active = [];
  if (cfg.gravityEnabled)  active.push(cfg.gravityStrength > 0 ? 'gravity' : 'anti-grav');
  if (cfg.frictionEnabled) active.push('friction');
  if (cfg.windEnabled)     active.push('wind');
  if (cfg.spiralEnabled)   active.push('spiral');
  dbgPhysics.textContent = active.length ? active.join(', ') : 'none';
}, 80);


/* ---- 3. Keyboard shortcuts to toggle physics ---- */
// These let you hot-swap behaviors without touching config.js
window.addEventListener('keydown', (e) => {
  switch (e.key.toLowerCase()) {
    case 'g': Physics.toggleGravity();  break;  // G — gravity
    case 'f': Physics.toggleFriction(); break;  // F — friction
    case 'w': Physics.toggleWind();     break;  // W — wind
    case 's': Physics.toggleSpiral();   break;  // S — spiral
    case 'a': Physics.flipGravity();    break;  // A — flip gravity direction
  }
});
