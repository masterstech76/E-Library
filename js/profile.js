/**
 * Profile Page — ReVena E-Library
 * Handles: Student/College role switching, form validation,
 * avatar upload, document upload, profile search, atomic logo animation, and profile saving.
 */
(function () {
  "use strict";

  // ============================================================
  // 1. ATOMIC LOGO (simplified for sidebar canvas)
  // ============================================================
  const canvas = document.getElementById("profileAtomicCanvas");
  if (canvas) {
    const ctx = canvas.getContext("2d", { alpha: true });
    let W = 64, H = 64;

    function resize() {
      const dpr = Math.max(1, Math.min(2.5, window.devicePixelRatio || 1));
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const TAU = Math.PI * 2;
    const lerp = (a, b, t) => a + (b - a) * t;

    function glowCircle(x, y, r, color, glowColor) {
      ctx.globalCompositeOperation = "lighter";
      ctx.beginPath();
      ctx.fillStyle = glowColor || color;
      ctx.shadowColor = glowColor || color;
      ctx.shadowBlur = r * 1.5;
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
      pathFn(); ctx.stroke();
      ctx.globalCompositeOperation = "source-over";
      ctx.shadowBlur = 0;
      ctx.strokeStyle = ss;
      ctx.lineWidth = lw * 0.7;
      pathFn(); ctx.stroke();
      ctx.restore();
    }

    let t0 = performance.now();

    function drawFrame(t) {
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2;
      const tilt = 0.75;
      const cosT = Math.cos(tilt), sinT = Math.sin(tilt);

      // Orbits
      for (const r of [22, 32]) {
        strokeGlow(() => {
          ctx.beginPath();
          for (let i = 0; i <= 60; i++) {
            const a = (i / 60) * TAU;
            const ex = r * 0.55 * Math.cos(a);
            const ey = r * 0.35 * Math.sin(a);
            const py = ey * cosT + ey * sinT * 0.15;
            const persp = 1 - 0.12 * (Math.sin(a) * 0.5 + 0.5);
            ctx.lineTo(cx + ex * persp, cy + py);
          }
        },
        r === 22 ? "rgba(120,255,245,0.3)" : "rgba(210,180,255,0.25)",
        r === 22 ? "rgba(60,255,232,0.2)" : "rgba(150,110,255,0.2)",
        1.2, 5);
      }

      // Nucleus
      const pulse = 0.5 + 0.5 * Math.sin(t * 0.004);
      const nr = lerp(6, 8, pulse);
      glowCircle(cx, cy, nr, "#9ae6ff", "rgba(40,220,255,0.4)");

      // Electrons
      for (let i = 0; i < 2; i++) {
        const speed = i === 0 ? 0.003 : 0.002;
        const angle = t * speed + (i === 0 ? 0 : Math.PI / 2);
        const r = i === 0 ? 22 : 32;
        const ex = r * 0.55 * Math.cos(angle);
        const ey = r * 0.35 * Math.sin(angle);
        const py = ey * cosT + ey * sinT * 0.15;
        const persp = 1 - 0.12 * (Math.sin(angle) * 0.5 + 0.5);
        const px = ex * persp;
        const col = i === 0 ? { core: "#9bffea", glow: "rgba(64,255,232,0.5)" } : { core: "#b2a3ff", glow: "rgba(160,120,255,0.5)" };
        glowCircle(cx + px, cy + py, 3 + Math.sin(t * 0.01 + i) * 0.8, col.core, col.glow);
      }
    }

    function animate() {
      drawFrame(performance.now() - t0);
      requestAnimationFrame(animate);
    }

    resize();
    window.addEventListener("resize", resize);
    animate();
  }

  // ============================================================
  // 2. DOM REFS
  // ============================================================
  const form = document.getElementById("profileForm");
  const roleButtons = document.querySelectorAll(".role-btn");
  const studentFields = document.getElementById("studentFields");
  const collegeFields = document.getElementById("collegeFields");
  const sidebarName = document.getElementById("sidebarName");
  const sidebarRole = document.getElementById("sidebarRole");
  const fullNameInput = document.getElementById("fullName");
  const saveBtn = document.getElementById("saveBtn");
  const resetBtn = document.getElementById("resetBtn");

  let currentRole = "student";

  // Avatar upload
  const avatarUpload = document.getElementById("avatarUpload");
  const avatarUploadBtn = document.getElementById("avatarUploadBtn");
  const profileAvatar = document.getElementById("profileAvatar");

  // Toast container
  const toastContainer = document.getElementById("toastContainer");

  // ============================================================
  // 3. TOAST
  // ============================================================
  function showToast(message, type) {
    type = type || "info";
    const toast = document.createElement("div");
    toast.className = "toast " + type;
    const icons = { success: "✅", error: "❌", warning: "⚠️", info: "ℹ️" };
    toast.innerHTML = `<span>${icons[type] || "ℹ️"}</span> ${message}`;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }
  window.showToast = showToast;

  // ============================================================
  // 4. ROLE SWITCHING
  // ============================================================
  function setRole(role) {
    currentRole = role;

    roleButtons.forEach(btn => {
      btn.classList.toggle("active", btn.dataset.role === role);
    });

    if (studentFields) {
      studentFields.style.display = role === "student" ? "block" : "none";
    }
    if (collegeFields) {
      collegeFields.style.display = role === "college" ? "block" : "none";
    }

    if (sidebarRole) {
      sidebarRole.textContent = role === "student" ? "Student" : "College";
    }

    showToast(`Switched to ${role === "student" ? "🎓 Student" : "🏛️ College"} mode`, "info");
  }

  roleButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      setRole(btn.dataset.role);
    });
  });

  // ============================================================
  // 5. AVATAR UPLOAD
  // ============================================================
  if (avatarUploadBtn && avatarUpload) {
    avatarUploadBtn.addEventListener("click", () => {
      avatarUpload.click();
    });

    avatarUpload.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        profileAvatar.src = ev.target.result;
        showToast("📷 Profile picture updated!", "success");
        const photoStatus = document.getElementById("photoStatus");
        if (photoStatus) {
          photoStatus.textContent = `✅ ${file.name}`;
          photoStatus.className = "upload-status uploaded";
        }
      };
      reader.readAsDataURL(file);
    });
  }

  // ============================================================
  // 6. DOCUMENT UPLOAD
  // ============================================================
  document.querySelectorAll(".upload-trigger").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.target;
      const input = document.getElementById(targetId);
      if (input) input.click();
    });
  });

  document.querySelectorAll(".upload-input").forEach((input) => {
    input.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const statusId = input.id + "Status";
      const statusEl = document.getElementById(statusId);
      if (statusEl) {
        statusEl.textContent = `✅ ${file.name}`;
        statusEl.className = "upload-status uploaded";
      }

      showToast(`📎 ${file.name} uploaded successfully!`, "success");
    });
  });

  // ============================================================
  // 7. PROFILE SEARCH / FILTER
  // ============================================================
  const profileSearch = document.getElementById("profileSearch");
  if (profileSearch) {
    profileSearch.addEventListener("input", (e) => {
      const q = e.target.value.toLowerCase().trim();
      const sections = form ? form.querySelectorAll(".form-section") : [];

      sections.forEach((section) => {
        if (section.classList.contains("role-section") && section.dataset.role !== currentRole) {
          section.style.display = "none";
          return;
        }

        if (!q) {
          section.style.display = "block";
          return;
        }

        const labels = section.querySelectorAll("label");
        const inputs = section.querySelectorAll("input, select, textarea");
        let matched = section.textContent.toLowerCase().includes(q);

        labels.forEach((l) => {
          if (l.textContent.toLowerCase().includes(q)) matched = true;
        });
        inputs.forEach((inp) => {
          if (inp.placeholder && inp.placeholder.toLowerCase().includes(q)) matched = true;
        });

        section.style.display = matched ? "block" : "none";
      });
    });
  }

  // ============================================================
  // 8. VALIDATION
  // ============================================================
  const validators = {
    required: val => val.trim() !== "",
    email: val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
    phone: val => /^[+]?[\d\s()-]{7,15}$/.test(val),
  };

  function validateField(input) {
    const value = input.value;
    const rules = input.dataset.validate;
    const msgEl = input.parentElement.querySelector(".validation-msg");
    if (!rules) return true;

    const ruleList = rules.split(",").map(r => r.trim());
    let isValid = true;
    let errorMsg = "";

    for (const rule of ruleList) {
      if (rule === "required" && !validators.required(value)) {
        isValid = false;
        errorMsg = input.dataset.msgRequired || "This field is required";
        break;
      }
      if (rule === "email" && value && !validators.email(value)) {
        isValid = false;
        errorMsg = "Please enter a valid email";
        break;
      }
      if (rule === "phone" && value && !validators.phone(value)) {
        isValid = false;
        errorMsg = "Please enter a valid phone number";
        break;
      }
    }

    input.classList.toggle("error", !isValid && value !== "");
    input.classList.toggle("success", isValid && value !== "");
    if (msgEl) {
      msgEl.className = "validation-msg " + (isValid && value ? "success" : "error");
      msgEl.innerHTML = isValid
        ? value ? '<span class="icon">✓</span> Looks good!' : ""
        : '<span class="icon">✗</span> ' + errorMsg;
    }
    return isValid || value === "";
  }

  document.querySelectorAll("[data-validate]").forEach(input => {
    input.addEventListener("blur", () => validateField(input));
    input.addEventListener("input", () => {
      if (input.classList.contains("error") || input.classList.contains("success")) {
        validateField(input);
      }
    });
  });

  if (fullNameInput && sidebarName) {
    fullNameInput.addEventListener("input", () => {
      sidebarName.textContent = fullNameInput.value.trim() || "Tushar Chaudhari";
    });
  }

  // ============================================================
  // 9. SIDEBAR STATS UPDATE
  // ============================================================
  function updateSidebarStats() {
    const statEls = document.querySelectorAll(".sidebar-stats .stat-value");
    if (statEls.length < 3) return;

    // Count filled student fields as "Courses"
    let filledFields = 0;
    if (studentFields) {
      const inputs = studentFields.querySelectorAll("input, select");
      inputs.forEach(el => {
        if (el.value && el.value.trim() !== "") filledFields++;
      });
    }
    statEls[0].textContent = Math.min(filledFields, 10);

    // Count uploaded documents as "Resources"
    const uploaded = document.querySelectorAll(".upload-status.uploaded").length;
    statEls[1].textContent = uploaded;

    // Badges (hardcoded demo)
    statEls[2].textContent = "0";
  }

  // ============================================================
  // 10. SAVE PROFILE
  // ============================================================
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const requiredInputs = form.querySelectorAll("[data-validate]");
      let allValid = true;
      requiredInputs.forEach(input => {
        if (!validateField(input)) allValid = false;
      });

      if (!allValid) {
        showToast("Please fix the errors before saving.", "error");
        return;
      }

      saveBtn.disabled = true;
      saveBtn.innerHTML = '<span class="spinner"></span> Saving...';

      const formData = new FormData(form);
      const data = {};
      formData.forEach((val, key) => { data[key] = val; });
      data.role = currentRole;

      setTimeout(() => {
        saveBtn.disabled = false;
        saveBtn.innerHTML = "✅ Saved!";
        showToast("🎉 Profile saved successfully!", "success");
        console.log("📦 Profile Data:", data);
        console.log("📁 Uploaded Documents: ID, Certificate, Resume, Photo");

        // Update sidebar stats after save
        updateSidebarStats();

        setTimeout(() => {
          saveBtn.innerHTML = "💾 Save Profile";
        }, 2000);
      }, 1500);
    });
  }

  // ============================================================
  // 11. RESET CHANGES
  // ============================================================
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      form.reset();
      form.querySelectorAll(".form-control").forEach(el => {
        el.classList.remove("error", "success");
        const msg = el.parentElement.querySelector(".validation-msg");
        if (msg) {
          msg.className = "validation-msg";
          msg.innerHTML = "";
        }
      });
      document.querySelectorAll(".upload-status").forEach((el) => {
        el.textContent = "❌ Not uploaded";
        el.className = "upload-status";
      });
      sidebarName.textContent = "Tushar Chaudhari";
      profileAvatar.src = "https://ui-avatars.com/api/?name=User&background=9ae6ff&color=06070c&size=128";
      showToast("↺ Form and documents have been reset", "info");
      updateSidebarStats();
    });
  }

  // ============================================================
  // 12. DEMO AUTO-FILL
  // ============================================================
  function demoFill() {
    const fields = {
      fullName: "Tushar Chaudhari",
      email: "tushar@example.com",
      phone: "+91 (555) 123-4567",
      dob: "2002-05-15",
      address: "42 University Avenue, Tech City, CA 94016",
      studentId: "S2024001",
      department: "Computer Science",
      cgpa: "8.7",
      institution: "State University of Technology",
    };

    Object.entries(fields).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) {
        el.value = val;
        el.classList.add("success");
      }
    });

    const selEls = { course: "btech-cs", yearOfStudy: "3", semester: "6" };
    Object.entries(selEls).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) { el.value = val; el.classList.add("success"); }
    });

    sidebarName.textContent = fields.fullName;
    showToast("📋 Demo profile loaded. Edit as needed.", "info");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setTimeout(demoFill, 500));
  } else {
    setTimeout(demoFill, 500);
  }

  console.log("👤 Profile page initialized — Role:", currentRole);
})();
