/* ============================================================
   engine/InputHandler.js
   Updated in Branch: advanced-interactions
   Commit: "feat: track cursor speed, expose cursor state for Interactions"

   Changes from Branch 2:
     - Tracks _speed (px moved per move event)
     - Uses Interactions.speedBasedCount() for trail emit count
     - Exposes cursor getter returning { x, y, speed }
   Everything else is identical to Branch 2.
   ============================================================ */

class InputHandler {
  constructor(canvas, emitter) {
    this._canvas    = canvas;
    this._emitter   = emitter;

    this._x         = 0;
    this._y         = 0;
    this._prevX     = 0;
    this._prevY     = 0;
    this._moveAngle = 0;
    this._speed     = 0;      // ← NEW: distance moved since last event (px)
    this._isHeld    = false;
    this._downX     = 0;
    this._downY     = 0;
    this._holdRafId = null;

    this._bindEvents();
  }

  _bindEvents() {
    const c = this._canvas;

    c.addEventListener('mousemove',  e => this._onMove(e.clientX, e.clientY));
    c.addEventListener('mousedown',  e => this._onDown(e.clientX, e.clientY));
    c.addEventListener('mouseup',    e => this._onUp(e.clientX, e.clientY));
    c.addEventListener('mouseleave', ()  => this._onLeave());

    c.addEventListener('touchmove', e => {
      e.preventDefault();
      const t = e.touches[0];
      this._onMove(t.clientX, t.clientY);
    }, { passive: false });

    c.addEventListener('touchstart', e => {
      const t = e.touches[0];
      this._onDown(t.clientX, t.clientY);
    }, { passive: true });

    c.addEventListener('touchend', e => {
      const t = e.changedTouches[0];
      this._onUp(t.clientX, t.clientY);
    });
  }

  _onMove(x, y) {
    const dx   = x - this._prevX;
    const dy   = y - this._prevY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < CONFIG.mouse.minMoveDistance) return;

    // Update speed and direction
    this._speed     = dist;                    // ← NEW
    this._moveAngle = Math.atan2(dy, dx);

    this._prevX = this._x;
    this._prevY = this._y;
    this._x     = x;
    this._y     = y;

    if (CONFIG.mouse.trailEnabled) {
      // Use speed-based count if enabled, otherwise flat rate ← NEW
      const count = Interactions.speedBasedCount(this._speed);
      this._emitter.emit(x, y, count, Math.PI * 2, CONFIG.baseSpeed);
    }
  }

  _onDown(x, y) {
    this._isHeld = true;
    this._downX  = x;
    this._downY  = y;
    this._x      = x;
    this._y      = y;

    if (CONFIG.mouse.holdEnabled) this._startHoldLoop();
  }

  _onUp(x, y) {
    this._isHeld = false;
    this._stopHoldLoop();

    const dx   = x - this._downX;
    const dy   = y - this._downY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 10 && CONFIG.mouse.burstEnabled) {
      this._burst(x, y);
    }
  }

  _onLeave() {
    this._isHeld = false;
    this._speed  = 0;
    this._stopHoldLoop();
  }

  _burst(x, y) {
    this._emitter.emit(
      x, y,
      CONFIG.burstCount,
      Math.PI * 2,
      CONFIG.baseSpeed * CONFIG.mouse.burstSpeedMult
    );
  }

  _startHoldLoop() {
    if (this._holdRafId) return;

    const loop = () => {
      if (!this._isHeld) return;
      this._emitter.emitDirectional(
        this._x, this._y,
        CONFIG.holdEmitRate,
        this._moveAngle,
        CONFIG.mouse.holdSpreadAngle,
        CONFIG.baseSpeed * 1.4
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

  /* cursor getter — used by Engine to pass state to Interactions ← NEW */
  get cursor()     { return { x: this._x, y: this._y, speed: this._speed }; }
  get position()   { return { x: this._x, y: this._y }; }
  get isHeld()     { return this._isHeld; }
  get moveAngle()  { return this._moveAngle; }
  get speed()      { return this._speed; }
}
