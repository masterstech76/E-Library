/**
 * Home Page — Smart Exam E-Library (ReVena)
 * Handles: shrink header, atomic logo on header/hero/footer,
 * scroll animations, counter stats, mobile menu, scroll-to-top.
 */
(function () {
  "use strict";

  // ============================================================
  // 1. ATOMIC LOGO — REUSABLE CANVAS ANIMATION
  // ============================================================
  function initAtomicLogo(canvasId, size) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });

    let W = size || 600,
      H = size || 600;

    function resize() {
      const dpr = Math.max(1, Math.min(2.5, window.devicePixelRatio || 1));
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const TAU = Math.PI * 2;
    const lerp$ = (a, b, t) => a + (b - a) * t;

    function glowCircle(x, y, r, color, glowColor, glowStrength) {
      glowStrength = glowStrength || 1;
      ctx.globalCompositeOperation = "lighter";
      ctx.beginPath();
      ctx.fillStyle = glowColor;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = r * 1.2 * glowStrength;
      ctx.arc(x, y, r, 0, TAU);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, r * 0.55, 0, TAU);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
    }

    function strokeGlow(pathFn, strokeStyle, glowStyle, lineWidth, glowBlur) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = glowStyle;
      ctx.lineWidth = lineWidth;
      ctx.shadowColor = glowStyle;
      ctx.shadowBlur = glowBlur;
      pathFn();
      ctx.stroke();
      ctx.globalCompositeOperation = "source-over";
      ctx.shadowBlur = 0;
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = lineWidth * 0.72;
      pathFn();
      ctx.stroke();
      ctx.restore();
    }

    const orbitR = { r1: Math.round(size * 0.2), r2: Math.round(size * 0.29) };
    const electronCount = 2;
    const nucColor = "#9ae6ff";
    const nucGlow = "rgba(40, 220, 255, 0.55)";
    const eColors = [
      { core: "#9bffea", glow: "rgba(64, 255, 232, 0.75)" },
      { core: "#b2a3ff", glow: "rgba(160, 120, 255, 0.75)" },
    ];

    let t0 = performance.now();

    function drawNucleus(t) {
      const x = W / 2,
        y = H / 2;
      const pulse = 0.5 + 0.5 * Math.sin(t * 0.004);
      const r = lerp$(Math.round(size * 0.053), Math.round(size * 0.063), pulse);
      strokeGlow(
        () => {
          ctx.beginPath();
          ctx.arc(x, y, r, 0, TAU);
        },
        "rgba(155, 230, 255, 0.85)",
        "rgba(20, 190, 255, 0.65)",
        Math.max(2, Math.round(size * 0.007)),
        Math.round(size * 0.02)
      );
      glowCircle(x, y, r, nucColor, nucGlow, 1.1);
    }

    function drawOrbits(t) {
      const x = W / 2,
        y = H / 2;
      const tilt = 0.75;
      const cosT = Math.cos(tilt),
        sinT = Math.sin(tilt);

      function ellipsePath(rx, ry) {
        ctx.beginPath();
        const steps = 120;
        for (let i = 0; i <= steps; i++) {
          const a = (i / steps) * TAU;
          const ex = rx * Math.cos(a);
          const ey = ry * Math.sin(a);
          const px = ex;
          const py = ey * cosT;
          const persp = 1 - 0.12 * (Math.sin(a) * 0.5 + 0.5);
          ctx.lineTo(x + px * persp, y + py + ey * sinT * 0.15);
        }
      }

      strokeGlow(
        () => ellipsePath(orbitR.r1, orbitR.r1 * 0.62),
        "rgba(120, 255, 245, 0.35)",
        "rgba(60, 255, 232, 0.28)",
        1.5,
        8
      );
      strokeGlow(
        () => ellipsePath(orbitR.r2, orbitR.r2 * 0.52),
        "rgba(210, 180, 255, 0.30)",
        "rgba(150, 110, 255, 0.26)",
        1.5,
        8
      );
    }

    function electronPos(t, orbitIndex) {
      const x = W / 2,
        y = H / 2;
      const speed = orbitIndex === 0 ? 0.0029 : 0.0022;
      const base = t * speed;
      const angle = base + (orbitIndex === 0 ? 0 : Math.PI / 2);
      const rx = orbitIndex === 0 ? orbitR.r1 : orbitR.r2;
      const ry = orbitIndex === 0 ? orbitR.r1 * 0.62 : orbitR.r2 * 0.52;
      const tilt = 0.75;
      const cosT = Math.cos(tilt),
        sinT = Math.sin(tilt);
      const ex = rx * Math.cos(angle);
      const ey = ry * Math.sin(angle);
      const persp = 1 - 0.12 * (Math.sin(angle) * 0.5 + 0.5);
      const px = ex * persp;
      const py = ey * cosT + ey * sinT * 0.15;
      return { x: x + px, y: y + py };
    }

    function drawElectrons(t) {
      const rBase = Math.round(size * 0.017);
      for (let i = 0; i < electronCount; i++) {
        const pos = electronPos(t, i);
        const col = eColors[i];
        const wobble = 0.6 + 0.4 * Math.sin(t * 0.01 + i * 2);
        const r = rBase * (0.85 + 0.35 * wobble);
        glowCircle(pos.x, pos.y, r, col.core, col.glow, 1.0);
        ctx.globalCompositeOperation = "lighter";
        ctx.strokeStyle = col.glow;
        ctx.lineWidth = 1.5;
        ctx.shadowColor = col.glow;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, r * 1.25, 0, Math.PI * 0.65);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.globalCompositeOperation = "source-over";
      }
    }

    function drawOctogram(t) {
      const x = W / 2,
        y = H / 2;

      function nodeOnCircle(radius, angle, sz, colCore, colGlow) {
        const wob = 1 + 0.12 * Math.sin(angle * 3 + t * 0.01);
        const px = x + radius * Math.cos(angle);
        const py = y + radius * Math.sin(angle);
        glowCircle(px, py, sz * wob, colCore, colGlow, 1.0);
      }

      function arcTrail(radius, angleCenter, span, colGlow, width, blur, alpha) {
        width = width || 1.5;
        blur = blur || 10;
        alpha = alpha || 0.7;
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.strokeStyle = colGlow;
        ctx.lineWidth = width;
        ctx.shadowColor = colGlow;
        ctx.shadowBlur = blur;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(x, y, radius, angleCenter - span / 2, angleCenter + span / 2);
        ctx.stroke();
        ctx.restore();
      }

      const w1 = t * 0.0024;
      const w2 = -t * 0.0019;

      const rings = [
        { r: Math.round(size * 0.167), c: eColors[0].core, g: eColors[0].glow, w: w1 },
        { r: Math.round(size * 0.242), c: eColors[1].core, g: eColors[1].glow, w: w2 },
        { r: Math.round(size * 0.28), c: eColors[0].core, g: eColors[0].glow, w: w1 + 1.1 },
      ];

      const k = 8;
      for (const ring of rings) {
        for (let i = 0; i < k; i++) {
          const base = ring.w + i * (TAU / k);
          const sz = Math.round(size * 0.01) + (i % 2) * Math.round(size * 0.003);
          nodeOnCircle(ring.r, base + 0.18 * Math.sin(t * 0.001 + i), sz, ring.c, ring.g);
          if (i % 2 === 0) {
            arcTrail(ring.r, base, 0.5, ring.g);
          }
        }
      }

      arcTrail(
        Math.round(size * 0.205),
        w1 + 0.7,
        0.8,
        "rgba(64, 255, 232, 0.65)",
        1.5,
        12
      );
      arcTrail(
        Math.round(size * 0.253),
        w2 + 2.1,
        0.9,
        "rgba(160, 120, 255, 0.55)",
        1.5,
        12
      );

      const shimmer = 0.5 + 0.5 * Math.sin(t * 0.014);
      glowCircle(x, y, Math.round(size * 0.007) + shimmer * Math.round(size * 0.007), "#d6fbff", "rgba(40,220,255,0.35)", 1.15);
    }

    function drawFrame(t) {
      ctx.clearRect(0, 0, W, H);
      drawOrbits(t);
      drawNucleus(t);
      drawOctogram(t);
      drawElectrons(t);
    }

    function animate() {
      const t = performance.now() - t0;
      drawFrame(t);
      requestAnimationFrame(animate);
    }

    resize();
    window.addEventListener("resize", resize);
    animate();
  }

  // Init logos (header and hero only — no logo in footer)
  initAtomicLogo("headerAtomicCanvas", 120);
  initAtomicLogo("heroAtomicCanvas", 700);

  // ============================================================
  // 2. SHRINK HEADER ON SCROLL
  // ============================================================
  const header = document.getElementById("siteHeader");
  let lastScrollY = 0;

  function handleHeaderScroll() {
    const scrollY = window.scrollY;
    if (scrollY > 60) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
    lastScrollY = scrollY;
  }

  window.addEventListener("scroll", handleHeaderScroll, { passive: true });

  // ============================================================
  // 3. MOBILE MENU TOGGLE
  // ============================================================
  const mobileToggle = document.getElementById("mobileMenuToggle");
  const mobileMenu = document.getElementById("mobileMenu");
  const mobileClose = document.getElementById("mobileMenuClose");

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener("click", () => {
      mobileMenu.classList.toggle("open");
    });
    if (mobileClose) {
      mobileClose.addEventListener("click", () => {
        mobileMenu.classList.remove("open");
      });
    }
    // Close on nav link click
    mobileMenu.querySelectorAll("nav a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenu.classList.remove("open");
      });
    });
  }

  // ============================================================
  // 4. SCROLL-TRIGGERED FEATURE CARD ANIMATIONS
  // ============================================================
  const featureCards = document.querySelectorAll(".feature-card");

  function checkCardVisibility() {
    const windowH = window.innerHeight;
    const threshold = 100;

    featureCards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      if (rect.top < windowH - threshold && rect.bottom > 0) {
        // Staggered delay
        const delay = parseInt(card.dataset.delay) || 0;
        setTimeout(() => {
          card.classList.add("visible");
        }, delay * 60);
      }
    });
  }

  // Run on load and scroll
  window.addEventListener("load", checkCardVisibility);
  window.addEventListener("scroll", checkCardVisibility, { passive: true });
  window.addEventListener("resize", checkCardVisibility);

  // ============================================================
  // 5. COUNTER ANIMATION FOR STATS
  // ============================================================
  const statNumbers = document.querySelectorAll(".stat-number");
  let countersAnimated = false;

  function animateCounters() {
    if (countersAnimated) return;
    const heroSection = document.querySelector(".hero");
    if (!heroSection) return;
    const rect = heroSection.getBoundingClientRect();
    if (rect.bottom < 0) return; // off screen upwards

    countersAnimated = true;

    statNumbers.forEach((el) => {
      const target = parseInt(el.dataset.count) || 0;
      const duration = 2000;
      const startTime = performance.now();

      function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(eased * target);
        el.textContent = current;

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          el.textContent = target + "+";
        }
      }
      requestAnimationFrame(updateCounter);
    });
  }

  // Trigger counter when hero is visible
  function checkCounterVisibility() {
    if (countersAnimated) return;
    const heroSection = document.querySelector(".hero");
    if (!heroSection) return;
    const rect = heroSection.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) {
      animateCounters();
    }
  }

  window.addEventListener("load", checkCounterVisibility);
  window.addEventListener("scroll", checkCounterVisibility, { passive: true });

  // ============================================================
  // 6. SCROLL TO TOP BUTTON
  // ============================================================
  const scrollTopBtn = document.getElementById("scrollTopBtn");

  function handleScrollTopVisibility() {
    if (!scrollTopBtn) return;
    if (window.scrollY > 400) {
      scrollTopBtn.classList.add("visible");
    } else {
      scrollTopBtn.classList.remove("visible");
    }
  }

  window.addEventListener("scroll", handleScrollTopVisibility, { passive: true });

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // ============================================================
  // 7. SMOOTH SCROLL FOR NAV LINKS
  // ============================================================
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const targetId = anchor.getAttribute("href");
      if (targetId === "#") return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      }
    });
  });

  // ============================================================
  // 8. LOG CONFIRMATION
  // ============================================================
  console.log("🚀 ReVena Homepage — 50+ features loaded");
})();

