/* ============================================================
   main.js
   Updated in Branch: mouse-interaction
   Commit: "feat: replace inline events with InputHandler"

   Branch 1 had raw event listeners inline here.
   Now we just instantiate InputHandler and it owns all input.
   main.js stays clean — only bootstrap + debug wiring.
   ============================================================ */


/* ---- 1. Boot engine ---- */
const canvas  = document.getElementById('particleCanvas');
const engine  = new Engine(canvas);

/* ---- 2. Wire input (NEW in Branch 2) ---- */
// InputHandler attaches all mouse + touch events internally
const input = new InputHandler(canvas, engine.emitter);

/* ---- 3. Start the loop ---- */
engine.start();


/* ---- 4. Debug panel ---- */
const dbgCount = document.getElementById('dbgCount');
const dbgFPS   = document.getElementById('dbgFPS');
const dbgDelta = document.getElementById('dbgDelta');
const dbgPool  = document.getElementById('dbgPool');
const dbgTotal = document.getElementById('dbgTotal');
const dbgHeld  = document.getElementById('dbgHeld');
const dbgAngle = document.getElementById('dbgAngle');

setInterval(() => {
  const s = engine.stats;
  dbgCount.textContent = s.activeCount;
  dbgFPS.textContent   = s.fps;
  dbgDelta.textContent = s.deltaTime;
  dbgPool.textContent  = s.poolSize;
  dbgTotal.textContent = s.totalEmitted;

  // New in Branch 2 — show hold state and movement angle
  dbgHeld.textContent  = input.isHeld ? 'yes' : 'no';
  dbgAngle.textContent = (input.moveAngle * (180 / Math.PI)).toFixed(1) + '°';
}, 80);
