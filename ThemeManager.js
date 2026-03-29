/* ============================================================
   engine/ThemeManager.js
   Branch: themes-and-config
   Commit: "feat: ThemeManager — apply presets, deep merge onto CONFIG"

   Depends on: config.js, themes.js

   WHAT IT DOES:
     ThemeManager.apply(themeName) takes a theme object from
     THEMES and deep-merges it onto CONFIG. Every engine system
     reads CONFIG, so changing CONFIG is all it takes to switch
     the entire engine's behaviour in one call.

   DEEP MERGE vs SHALLOW:
     CONFIG has nested objects (physics, visuals, interactions…).
     A shallow Object.assign would overwrite the whole nested
     object, losing any keys the theme doesn't explicitly set.
     Deep merge walks each nested key individually so themes
     only need to specify what they change — the rest stays.

   AFTER APPLYING:
     - optimizer.clearCache() flushes stale gradient objects
       (color changed, so old gradients are wrong)
     - The UI theme switcher panel updates to show active theme
   ============================================================ */

class ThemeManager {
  constructor(optimizer) {
    this._optimizer   = optimizer;
    this._activeTheme = 'default';
  }

  /* apply()
     Switches the engine to the named theme.
     Safe to call at any time — even mid-animation.           */
  apply(themeName) {
    const theme = THEMES[themeName];
    if (!theme) {
      console.warn(`ThemeManager: unknown theme "${themeName}"`);
      return;
    }

    // Deep-merge theme values onto CONFIG
    ThemeManager._deepMerge(CONFIG, theme);

    // Flush gradient cache — old gradients used the previous color
    this._optimizer.clearCache();

    this._activeTheme = themeName;

    // Dispatch a custom event so the UI can react (highlight active button)
    window.dispatchEvent(new CustomEvent('themechange', {
      detail: { theme: themeName, label: theme.label }
    }));
  }

  get activeTheme() {
    return this._activeTheme;
  }

  /* _deepMerge()
     Recursively merges `source` into `target`.
     Only plain objects are recursed — primitives and arrays
     are assigned directly.

     Example:
       target = { physics: { gravityEnabled: false, gravityStrength: 0.08 } }
       source = { physics: { gravityEnabled: true } }
       result = { physics: { gravityEnabled: true, gravityStrength: 0.08 } }
                                                   ↑ preserved — not overwritten
  */
  static _deepMerge(target, source) {
    for (const key of Object.keys(source)) {
      const srcVal = source[key];
      const tgtVal = target[key];

      const srcIsPlainObj = srcVal !== null
        && typeof srcVal === 'object'
        && !Array.isArray(srcVal);

      const tgtIsPlainObj = tgtVal !== null
        && typeof tgtVal === 'object'
        && !Array.isArray(tgtVal);

      if (srcIsPlainObj && tgtIsPlainObj) {
        // Both sides are objects — recurse
        ThemeManager._deepMerge(tgtVal, srcVal);
      } else {
        // Primitive or array — assign directly
        target[key] = srcVal;
      }
    }
  }

  /* themeNames() — returns list of available theme keys */
  static themeNames() {
    return Object.keys(THEMES);
  }
}
