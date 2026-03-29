/* ============================================================
   main.js
   Branch: basic-engine
   Commit: "feat: bootstrap engine, wire mouse events and debug panel"

   Depends on: all engine files + config.js (loaded before this)

   This file's only jobs:
     1. Instantiate the Engine
     2. Attach input events → emitter calls
     3. Keep the debug panel live
   No particle logic, no rendering logic lives here.
   ============================================================ */


/* ---- 1. Boot the engine ---- */

const canvas = document.getElementById('particleCanvas');
const engine = new Engine(canvas);
engine.start();


/* ---- 2. Debug panel — live stats ---- */

const dbgCount = document.getElementById('dbgCount');
const dbgFPS   = document.getElementById('dbgFPS');
const dbgDelta = document.getElementById('dbgDelta');
const dbgPool  = document.getElementById('dbgPool');
const dbgTotal = document.getElementById('dbgTotal');

// Update debug overlay ~12 times/sec (no need to do it every frame)
setInterval(() => {
  const s = engine.stats;
  dbgCount.textContent = s.activeCount;
  dbgFPS.textContent   = s.fps;
  dbgDelta.textContent = s.deltaTime;
  dbgPool.textContent  = s.poolSize;
  dbgTotal.textContent = s.totalEmitted;
}, 80);


/* ---- 3. Mouse events ---- */

// mousemove — continuous trail
canvas.addEventListener('mousemove', (e) => {
  engine.emitter.emit(
    e.clientX,
    e.clientY,
    CONFIG.emitRate,        // count
    Math.PI * 2,            // full-circle spread
    CONFIG.baseSpeed        // speed
  );
});

// click — burst explosion (faster, bigger burst)
canvas.addEventListener('click', (e) => {
  engine.emitter.emit(
    e.clientX,
    e.clientY,
    CONFIG.burstCount,
    Math.PI * 2,
    CONFIG.baseSpeed * 2.5
  );
});


/* ---- 4. Touch events (mobile support) ---- */

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();  // Stop page scrolling while drawing
  const touch = e.touches[0];
  engine.emitter.emit(touch.clientX, touch.clientY, CONFIG.emitRate);
}, { passive: false });

canvas.addEventListener('touchstart', (e) => {
  const touch = e.touches[0];
  engine.emitter.emit(
    touch.clientX,
    touch.clientY,
    CONFIG.burstCount,
    Math.PI * 2,
    CONFIG.baseSpeed * 2.5
  );
});
