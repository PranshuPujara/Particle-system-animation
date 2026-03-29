/* ============================================================
   engine/InputHandler.js
   Branch: mouse-interaction
   Commit: "feat: InputHandler — trail, burst, hold, direction tracking"

   Depends on: config.js, Emitter.js

   WHY A SEPARATE CLASS:
   In Branch 1, mouse events were inline in main.js — fine for
   a quick demo, but messy to extend. InputHandler owns ALL
   input logic so main.js stays clean and each behavior is
   individually toggleable.

   Behaviours handled here:
     1. Trail       — particles follow cursor on mousemove
     2. Burst       — explosion on click (mousedown + mouseup same spot)
     3. Hold        — continuous stream while mouse button is held
     4. Direction   — burst/hold particles face movement direction
     5. Touch       — mirrors all of the above for mobile
   ============================================================ */

class InputHandler {
  constructor(canvas, emitter) {
    this._canvas  = canvas;
    this._emitter = emitter;

    /* ---- Tracked state ---- */

    // Current cursor position
    this._x = 0;
    this._y = 0;

    // Previous cursor position (used for distance check + direction)
    this._prevX = 0;
    this._prevY = 0;

    // Movement direction angle in radians (updated each mousemove)
    // Default: pointing right (0 radians)
    this._moveAngle = 0;

    // Is the mouse button currently held down?
    this._isHeld = false;

    // Position where mousedown happened (to distinguish click vs drag)
    this._downX = 0;
    this._downY = 0;

    // RAF ID for the hold-emission loop
    this._holdRafId = null;

    this._bindEvents();
  }

  /* ============================================================
     Event binding
     ============================================================ */
  _bindEvents() {
    const c = this._canvas;

    // --- Mouse ---
    c.addEventListener('mousemove',  e => this._onMove(e.clientX, e.clientY));
    c.addEventListener('mousedown',  e => this._onDown(e.clientX, e.clientY));
    c.addEventListener('mouseup',    e => this._onUp(e.clientX, e.clientY));
    c.addEventListener('mouseleave', ()  => this._onLeave());

    // --- Touch (mirrors mouse behaviour) ---
    c.addEventListener('touchmove', e => {
      e.preventDefault();    // Stop page scroll while drawing
      const t = e.touches[0];
      this._onMove(t.clientX, t.clientY);
    }, { passive: false });

    c.addEventListener('touchstart', e => {
      const t = e.touches[0];
      this._onDown(t.clientX, t.clientY);
    }, { passive: true });

    c.addEventListener('touchend', e => {
      // Use changedTouches because touches[0] is gone on touchend
      const t = e.changedTouches[0];
      this._onUp(t.clientX, t.clientY);
    });
  }

  /* ============================================================
     Core handlers
     ============================================================ */

  /* _onMove()
     Fires on every mousemove / touchmove.
     1. Checks minimum movement distance (avoids particle flood)
     2. Updates direction angle from prev → current position
     3. Emits trail particles                                    */
  _onMove(x, y) {
    const dx = x - this._prevX;
    const dy = y - this._prevY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Skip if barely moved — prevents burst of particles on tiny jitter
    if (dist < CONFIG.mouse.minMoveDistance) return;

    // Update direction — atan2 gives angle of movement vector
    this._moveAngle = Math.atan2(dy, dx);

    // Store previous position BEFORE updating current
    this._prevX = this._x;
    this._prevY = this._y;
    this._x = x;
    this._y = y;

    // Emit trail if enabled
    if (CONFIG.mouse.trailEnabled) {
      this._emitter.emit(
        x, y,
        CONFIG.emitRate,
        Math.PI * 2,      // Full circle — trail spreads in all directions
        CONFIG.baseSpeed
      );
    }
  }

  /* _onDown()
     Fires on mousedown / touchstart.
     Records position and starts the hold-emission loop.          */
  _onDown(x, y) {
    this._isHeld = true;
    this._downX  = x;
    this._downY  = y;
    this._x      = x;
    this._y      = y;

    if (CONFIG.mouse.holdEnabled) {
      this._startHoldLoop();
    }
  }

  /* _onUp()
     Fires on mouseup / touchend.
     Stops hold loop. If mouse barely moved since down → it's a click → burst.  */
  _onUp(x, y) {
    this._isHeld = false;
    this._stopHoldLoop();

    // Treat as a click only if the cursor didn't travel far (< 10px)
    // This way dragging doesn't also trigger a burst
    const dx   = x - this._downX;
    const dy   = y - this._downY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 10 && CONFIG.mouse.burstEnabled) {
      this._burst(x, y);
    }
  }

  /* _onLeave()
     Mouse left the canvas — stop everything cleanly.             */
  _onLeave() {
    this._isHeld = false;
    this._stopHoldLoop();
  }

  /* ============================================================
     Burst — directional explosion on click
     ============================================================ */

  /* _burst()
     Emits a full-circle explosion. The speed is higher than trail.
     Branch 5 will add directional bursts (cursor movement angle). */
  _burst(x, y) {
    this._emitter.emit(
      x, y,
      CONFIG.burstCount,
      Math.PI * 2,                                    // Full circle
      CONFIG.baseSpeed * CONFIG.mouse.burstSpeedMult  // Faster than trail
    );
  }

  /* ============================================================
     Hold loop — continuous emission while button held
     ============================================================ */

  /* _startHoldLoop()
     Uses its own requestAnimationFrame loop (separate from Engine).
     Each frame: emit a small stream of particles in the direction
     the mouse was last moving.                                    */
  _startHoldLoop() {
    if (this._holdRafId) return; // Already running

    const loop = () => {
      if (!this._isHeld) return; // Stop if button released

      // Emit a narrow directional stream pointing in move direction
      this._emitter.emitDirectional(
        this._x,
        this._y,
        CONFIG.holdEmitRate,
        this._moveAngle,              // Angle of last mouse movement
        CONFIG.mouse.holdSpreadAngle, // Narrow spread cone
        CONFIG.baseSpeed * 1.4        // Slightly faster than trail
      );

      this._holdRafId = requestAnimationFrame(loop);
    };

    this._holdRafId = requestAnimationFrame(loop);
  }

  _stopHoldLoop() {
    if (this._holdRafId) {
      cancelAnimationFrame(this._holdRafId);
      this._holdRafId = null;
    }
  }

  /* ============================================================
     Public: expose cursor position for debug panel / future use
     ============================================================ */
  get position() {
    return { x: this._x, y: this._y };
  }

  get isHeld() {
    return this._isHeld;
  }

  get moveAngle() {
    return this._moveAngle;
  }
}
