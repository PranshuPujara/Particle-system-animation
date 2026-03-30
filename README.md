# ✨ Sparkfield — Interactive Particle Engine

A beautiful, high-performance particle system built with vanilla JavaScript. Move your mouse, click, and watch the magic!

![Sparkfield](https://img.shields.io/badge/Status-Live-brightgreen) ![License](https://img.shields.io/badge/License-MIT-blue) ![Performance](https://img.shields.io/badge/Performance-Optimized-orange)

---

## 🎮 Try It Now

**[🚀 Launch Sparkfield](https://sparkfield.vercel.app/)**

## What You Can Do

- **Move mouse** - Flowing particle trails
- **Click** - Explosive bursts
- **Hold** - Continuous streams
- **Press keys** - Toggle physics (G/F/W/S/A), visuals (T/L/R/B/O), interactions (Q/E/X)
- **Press 1-6** - Switch themes

## 📚 Features

**Physics:** Gravity, Friction, Wind, Spiral  
**Visuals:** Trails, Glow, Gradients, Blend Modes, Opacity  
**Interactions:** Attraction, Repulsion, Speed-Based Emit  
**Themes:** Default, Neon, Fire, Snow, Galaxy, Pastel  
**Performance:** 500+ particles at 60 FPS, zero dependencies

---

## ⌨️ Controls

### Physics
| Key | Effect |
|-----|--------|
| **G** | Toggle Gravity |
| **F** | Toggle Friction |
| **W** | Toggle Wind |
| **S** | Toggle Spiral |
| **A** | Flip Gravity Direction |

### Visuals
| Key | Effect |
|-----|--------|
| **T** | Toggle Trail |
| **L** | Toggle Glow |
| **R** | Toggle Gradient Fill |
| **B** | Cycle Blend Mode |
| **O** | Cycle Opacity Curve |

### Interactions
| Key | Effect |
|-----|--------|
| **Q** | Toggle Attraction |
| **E** | Toggle Repulsion |
| **X** | Toggle Speed-Based Emit |

### Themes
| Key | Theme |
|-----|-------|
| **1** | Default |
| **2** | Neon |
| **3** | Fire |
| **4** | Snow |
| **5** | Galaxy |
| **6** | Pastel |

---

## 💡 Pro Tips

1. Start with Default theme
2. Try the Neon theme
3. Enable gravity + spiral + trail + glow (G + S + T + L)
4. Press G then E and click - explosive effects
5. Test on mobile

--- 

## 🎯 Use Cases

🎮 **Game Dev** - Explosions, spells, visual feedback  
🎬 **Web Animation** - Hero sections, landing pages  
📊 **Data Viz** - Datasets, dashboards  
🎨 **Creative Coding** - Generative art, installations  
🎓 **Learning** - Physics, optimization, game engines  

---

## 🎨 Customize

### Add Your Own Theme
Edit `themes.js` and add a new object:

```javascript
myTheme: {
  label: 'My Theme',
  color: { h: 200, s: 80, l: 50 },
  baseSpeed: 3,
  physics: { gravityEnabled: true, gravityStrength: 0.1 },
  visuals: { glowEnabled: true, trailEnabled: true }
}
```

### Tune Physics
Open `config.js` and adjust:
- `gravityStrength` - How strong gravity pulls
- `frictionAmount` - How much drag applies
- `windStrength` - Horizontal push force
- `spiralSpeed` - Rotation rate

### Adjust Particle Count
Modify `CONFIG.maxParticles` in `config.js`. The optimizer will respect your limit.



---

## 📊 Performance

| Metric | Value |
|--------|-------|
| Particles | 500+ |
| FPS Target | 60 (adaptive) |
| Gradient Cache | 80 entries |
| Dependencies | None |

---

## 🏗️ Architecture

The project is built with a clean, modular design:

```
config.js          ← Central configuration
  ↓
Particle.js        ← Individual particle class
  ↓
ParticlePool.js    ← Memory pooling (GC-free)
  ↓
Emitter.js         ← Particle spawning
  ↓
Physics.js         ← Environmental forces
  ↓
Interactions.js    ← Cursor forces
  ↓
Optimizer.js       ← Performance monitoring
  ↓
Renderer.js        ← Visual effects & drawing
  ↓
Engine.js          ← Main RAF loop
  ↓
InputHandler.js    ← Mouse/touch events
  ↓
ThemeManager.js    ← Theme switching
  ↓
main.js            ← Bootstrap & wiring
```

### Key Technologies
- **Vanilla JavaScript** - Zero dependencies
- **Canvas 2D** - Smooth, performant rendering
- **RequestAnimationFrame** - 60 FPS loop
- **Object Pooling** - Zero garbage collection lag
- **CSS Variables** - Dynamic theming system

---

## 📁 Project Structure

```
├── index.html       # Entry point
├── style.css        # Styling & themes
├── config.js        # Configuration
├── Particle.js      # Particle class
├── ParticlePool.js  # Object pooling
├── Emitter.js       # Spawning
├── Physics.js       # Forces
├── Interactions.js  # Cursor forces
├── Optimizer.js     # Performance
├── Renderer.js      # Drawing
├── Engine.js        # Main loop
├── InputHandler.js  # Input
├── ThemeManager.js  # Themes
├── themes.js        # Theme definitions
└── main.js          # Bootstrap
```

---

## 📄 License

MIT License - Feel free to use, modify, and share!

---

## 🙌 Enjoy!

**[🚀 Launch Sparkfield](https://sparkfield.vercel.app/)** and create something beautiful! ✨

Made with ❤️ and lots of particle effects.

---

## 👨‍💻 Author

**Created by [Pranshu Pujara](https://github.com/PranshuPujara)**