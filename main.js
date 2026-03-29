/* ============================================================
   main.js
   Updated in Branch: themes-and-config
   Commit: "feat: wire ThemeManager, build theme switcher UI"
   ============================================================ */


/* ---- 1. Boot ---- */
const canvas  = document.getElementById('particleCanvas');
const engine  = new Engine(canvas);
const input   = new InputHandler(canvas, engine.emitter);
const themes  = new ThemeManager(engine.optimizer);   // ← NEW

engine.setInput(input);
engine.start();


/* ---- 2. Build theme switcher buttons dynamically ---- */
const switcherEl = document.getElementById('themeSwitcher');

ThemeManager.themeNames().forEach(name => {
  const btn = document.createElement('button');
  btn.className    = 'theme-btn';
  btn.dataset.theme = name;
  btn.textContent  = THEMES[name].label;

  btn.addEventListener('click', () => {
    themes.apply(name);
  });

  switcherEl.appendChild(btn);
});

// Highlight whichever theme is active when themechange fires
window.addEventListener('themechange', (e) => {
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === e.detail.theme);
  });
});

// Highlight default on load
document.querySelector('[data-theme="default"]')?.classList.add('active');


/* ---- 3. Debug panel ---- */
const dbgCount     = document.getElementById('dbgCount');
const dbgFPS       = document.getElementById('dbgFPS');
const dbgDelta     = document.getElementById('dbgDelta');
const dbgPool      = document.getElementById('dbgPool');
const dbgTotal     = document.getElementById('dbgTotal');
const dbgHeld      = document.getElementById('dbgHeld');
const dbgSpeed     = document.getElementById('dbgSpeed');
const dbgPhysics   = document.getElementById('dbgPhysics');
const dbgVisuals   = document.getElementById('dbgVisuals');
const dbgBlend     = document.getElementById('dbgBlend');
const dbgCurve     = document.getElementById('dbgCurve');
const dbgInteract  = document.getElementById('dbgInteract');
const dbgEffCap    = document.getElementById('dbgEffCap');
const dbgRealFPS   = document.getElementById('dbgRealFPS');
const dbgCacheHit  = document.getElementById('dbgCacheHit');
const dbgCacheSize = document.getElementById('dbgCacheSize');
const dbgTheme     = document.getElementById('dbgTheme');

setInterval(() => {
  const s = engine.stats;
  dbgCount.textContent   = s.activeCount;
  dbgFPS.textContent     = s.fps;
  dbgDelta.textContent   = s.deltaTime;
  dbgPool.textContent    = s.poolSize;
  dbgTotal.textContent   = s.totalEmitted;
  dbgHeld.textContent    = input.isHeld ? 'yes' : 'no';
  dbgSpeed.textContent   = Math.round(input.speed) + ' px';

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

  dbgEffCap.textContent    = s.effectiveCap;
  dbgRealFPS.textContent   = s.realFPS;
  dbgCacheHit.textContent  = s.cacheHitRate + '%';
  dbgCacheSize.textContent = s.cacheSize;
  dbgTheme.textContent     = themes.activeTheme;   // ← NEW
}, 80);


/* ---- 4. Keyboard shortcuts ---- */
window.addEventListener('keydown', (e) => {
  switch (e.key.toLowerCase()) {
    // Physics
    case 'g': Physics.toggleGravity();  break;
    case 'f': Physics.toggleFriction(); break;
    case 'w': Physics.toggleWind();     break;
    case 's': Physics.toggleSpiral();   break;
    case 'a': Physics.flipGravity();    break;
    // Visuals
    case 't': Renderer.toggleTrail();        break;
    case 'l': Renderer.toggleGlow();         break;
    case 'r': Renderer.toggleGradient();     break;
    case 'b': Renderer.cycleBlendMode();     break;
    case 'o': Renderer.cycleOpacityCurve();  break;
    // Interactions
    case 'q': Interactions.toggleAttract();   break;
    case 'e': Interactions.toggleRepulse();   break;
    case 'x': Interactions.toggleSpeedEmit(); break;
    // Themes via number keys ← NEW
    case '1': themes.apply('default'); break;
    case '2': themes.apply('neon');    break;
    case '3': themes.apply('fire');    break;
    case '4': themes.apply('snow');    break;
    case '5': themes.apply('galaxy');  break;
    case '6': themes.apply('pastel');  break;
  }
});
