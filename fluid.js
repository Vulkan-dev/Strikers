// ==========================================================================
// Minimalist Matte Liquid Fluid Background Animation
// Pure achromatic dark fluid simulation with gentle interactive ripples
// ==========================================================================

(function () {
  const canvas = document.getElementById('fluidCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height, dpr;

  // Mouse interaction state
  const mouse = {
    x: -1000,
    y: -1000,
    targetX: -1000,
    targetY: -1000,
    vx: 0,
    vy: 0,
    radius: 180,
    active: false
  };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
  }

  window.addEventListener('resize', resize);
  resize();

  window.addEventListener('mousemove', (e) => {
    mouse.targetX = e.clientX;
    mouse.targetY = e.clientY;
    mouse.active = true;
  });

  window.addEventListener('mouseleave', () => {
    mouse.active = false;
  });

  // Fluid wave parameters (Matte dark liquid layers)
  const layers = [
    {
      baseYRatio: 0.65,
      amplitude: 55,
      frequency: 0.0016,
      speed: 0.0007,
      color: 'rgba(16, 16, 16, 0.85)',
      phase: 0
    },
    {
      baseYRatio: 0.72,
      amplitude: 70,
      frequency: 0.0013,
      speed: 0.0009,
      color: 'rgba(22, 22, 22, 0.65)',
      phase: 1.8
    },
    {
      baseYRatio: 0.80,
      amplitude: 85,
      frequency: 0.0011,
      speed: 0.0006,
      color: 'rgba(28, 28, 28, 0.45)',
      phase: 3.4
    },
    {
      baseYRatio: 0.88,
      amplitude: 100,
      frequency: 0.0009,
      speed: 0.0008,
      color: 'rgba(34, 34, 34, 0.3)',
      phase: 5.1
    }
  ];

  let time = 0;

  function render() {
    time += 1;

    // Smooth mouse position damping
    if (mouse.active) {
      mouse.vx = (mouse.targetX - mouse.x) * 0.08;
      mouse.vy = (mouse.targetY - mouse.y) * 0.08;
      mouse.x += mouse.vx;
      mouse.y += mouse.vy;
    } else {
      mouse.x += (width * 0.5 - mouse.x) * 0.02;
      mouse.y += (height * 0.5 - mouse.y) * 0.02;
    }

    // Clear with matte base background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    // Draw subtle fluid waves from back to front
    layers.forEach((layer) => {
      ctx.beginPath();
      ctx.moveTo(0, height);

      const baseY = height * layer.baseYRatio;
      const step = 20;

      for (let x = 0; x <= width + step; x += step) {
        // Multi-frequency harmonic liquid displacement
        const sine1 = Math.sin(x * layer.frequency + time * layer.speed + layer.phase);
        const sine2 = Math.sin(x * (layer.frequency * 2.3) - time * (layer.speed * 0.7));
        const sine3 = Math.cos((x + time) * (layer.frequency * 0.5));

        let y = baseY + (sine1 * 0.55 + sine2 * 0.3 + sine3 * 0.15) * layer.amplitude;

        // Subtle interactive mouse displacement
        const dx = x - mouse.x;
        const dy = y - mouse.y;
        const distSq = dx * dx + dy * dy;
        const radiusSq = mouse.radius * mouse.radius;

        if (distSq < radiusSq) {
          const factor = (1 - Math.sqrt(distSq) / mouse.radius);
          y += Math.sin(factor * Math.PI) * 28;
        }

        if (x === 0) {
          ctx.lineTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.lineTo(width, height);
      ctx.closePath();

      ctx.fillStyle = layer.color;
      ctx.fill();
    });

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
})();
