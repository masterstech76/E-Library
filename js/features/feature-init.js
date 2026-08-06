/**
 * Feature Sub-pages — Shared initialization
 * Handles: atomic logo, breadcrumb, smooth scroll, etc.
 */
(function () {
  "use strict";

  // Atomic logo for sidebar (small)
  const canvas = document.getElementById("featureAtomicCanvas");
  if (canvas) {
    const ctx = canvas.getContext("2d", { alpha: true });
    let W = 120, H = 120;

    function resize() {
      const dpr = Math.max(1, Math.min(2.5, window.devicePixelRatio || 1));
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const TAU = Math.PI * 2;
    const lerp = (a, b, t) => a + (b - a) * t;

    function glowCircle(x, y, r, color, glowColor, gs) {
      gs = gs || 1;
      ctx.globalCompositeOperation = "lighter";
      ctx.beginPath();
      ctx.fillStyle = glowColor;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = r * 1.2 * gs;
      ctx.arc(x, y, r, 0, TAU);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, r * 0.55, 0, TAU);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
    }

    function strokeGlow(pathFn, ss, gs, lw, gb) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = gs;
      ctx.lineWidth = lw;
      ctx.shadowColor = gs;
      ctx.shadowBlur = gb;
      pathFn();
      ctx.stroke();
      ctx.globalCompositeOperation = "source-over";
      ctx.shadowBlur = 0;
      ctx.strokeStyle = ss;
      ctx.lineWidth = lw * 0.72;
      pathFn();
      ctx.stroke();
      ctx.restore();
    }

    function ellipsePath(ctx, rx, ry, x, y, tilt) {
      const cosT = Math.cos(tilt), sinT = Math.sin(tilt);
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

    const nucColor = "#9ae6ff";
    const nucGlow = "rgba(40, 220, 255, 0.55)";
    const eColors = [
      { core: "#9bffea", glow: "rgba(64, 255, 232, 0.75)" },
      { core: "#b2a3ff", glow: "rgba(160, 120, 255, 0.75)" },
    ];

    let t0 = performance.now();

    function drawFrame(t) {
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2;

      // Orbits
      const tilt = 0.75;
      strokeGlow(() => ellipsePath(ctx, 40, 25, cx, cy, tilt), "rgba(120,255,245,0.35)", "rgba(60,255,232,0.28)", 1.5, 8);
      strokeGlow(() => ellipsePath(ctx, 58, 30, cx, cy, tilt), "rgba(210,180,255,0.30)", "rgba(150,110,255,0.26)", 1.5, 8);

      // Nucleus
      const pulse = 0.5 + 0.5 * Math.sin(t * 0.004);
      const nr = lerp(11, 13, pulse);
      strokeGlow(() => { ctx.beginPath(); ctx.arc(cx, cy, nr, 0, TAU); }, "rgba(155,230,255,0.85)", "rgba(20,190,255,0.65)", 2, 6);
      glowCircle(cx, cy, nr, nucColor, nucGlow, 1.1);

      // Electrons
      for (let i = 0; i < 2; i++) {
        const speed = i === 0 ? 0.0029 : 0.0022;
        const angle = t * speed + (i === 0 ? 0 : Math.PI / 2);
        const rx = i === 0 ? 40 : 58;
        const ry = i === 0 ? 25 : 30;
        const ex = rx * Math.cos(angle);
        const ey = ry * Math.sin(angle);
        const cosT = Math.cos(tilt), sinT = Math.sin(tilt);
        const persp = 1 - 0.12 * (Math.sin(angle) * 0.5 + 0.5);
        const px = ex * persp;
        const py = ey * cosT + ey * sinT * 0.15;
        const pos = { x: cx + px, y: cy + py };
        const col = eColors[i];
        const wob = 0.6 + 0.4 * Math.sin(t * 0.01 + i * 2);
        const r = 4 * (0.85 + 0.35 * wob);
        glowCircle(pos.x, pos.y, r, col.core, col.glow, 1.0);
      }

      // Shimmer
      const shimmer = 0.5 + 0.5 * Math.sin(t * 0.014);
      glowCircle(cx, cy, 2 + shimmer * 2, "#d6fbff", "rgba(40,220,255,0.35)", 1.15);
    }

    function animate() {
      drawFrame(performance.now() - t0);
      requestAnimationFrame(animate);
    }

    resize();
    window.addEventListener("resize", resize);
    animate();
  }

  // Toast notifications
  window.showToast = function (message, type) {
    type = type || "info";
    const container = document.getElementById("toastContainer");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = "toast " + type;
    const iconMap = { success: "✅", error: "❌", warning: "⚠️", info: "ℹ️" };
    toast.innerHTML = `<span>${iconMap[type] || "ℹ️"}</span> ${message}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  };

  // File upload handler — wires quick-action buttons with data-upload attribute to hidden file inputs
  document.querySelectorAll(".quick-action-btn[data-upload]").forEach((btn) => {
    btn.addEventListener("click", function () {
      const uploadId = this.dataset.upload;
      const input = document.getElementById(uploadId);
      if (input) {
        input.click();
      }
    });
  });

  // Handle file selection across all hidden file inputs on feature pages
  document.querySelectorAll(".file-upload-input").forEach((input) => {
    input.addEventListener("change", function (e) {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      const names = Array.from(files).map((f) => f.name).join(", ");
      showToast(`📎 Uploaded: ${names}`, "success");
      console.log("📁 Uploaded files:", files);
      // Reset so the same file can be re-uploaded
      this.value = "";
    });
  });

  // Demo interaction handlers (for buttons without data-upload)
  document.querySelectorAll(".quick-action-btn:not([data-upload])").forEach((btn) => {
    btn.addEventListener("click", function () {
      const action = this.dataset.action || "demo";
      showToast(`🚀 ${action} — Feature demo coming soon!`, "info");
    });
  });

  console.log("✅ Feature page initialized");
})();

