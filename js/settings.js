/**
 * Settings Page — ReVena E-Library
 * Handles: sidebar navigation, search, toggle interactions, atomic logo
 */
(function () {
  "use strict";

  // ===== TOAST NOTIFICATIONS =====
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

  // ===== SIDEBAR NAVIGATION =====
  const sidebarLinks = document.querySelectorAll(".sidebar-link");
  const sections = document.querySelectorAll(".settings-section");
  let currentSection = "profile";

  function navigateToSection(sectionId) {
    // Update sidebar
    sidebarLinks.forEach((link) => {
      link.classList.toggle("active", link.dataset.section === sectionId);
    });

    // Update sections
    sections.forEach((sec) => {
      sec.classList.toggle("active", sec.id === "section-" + sectionId);
    });

    currentSection = sectionId;
  }

  sidebarLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const section = link.dataset.section;
      if (section) {
        navigateToSection(section);
        // Close mobile sidebar if open
        document.querySelector(".settings-sidebar")?.classList.remove("open");
      }
    });
  });

  // ===== SETTINGS SEARCH =====
  const searchInput = document.getElementById("settingsSearch");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      const query = this.value.toLowerCase().trim();

      if (!query) {
        // Reset — show all groups
        document.querySelectorAll(".sidebar-group").forEach((g) => (g.style.display = ""));
        sidebarLinks.forEach((l) => (l.style.display = ""));
        return;
      }

      sidebarLinks.forEach((link) => {
        const text = link.textContent.toLowerCase();
        const match = text.includes(query);
        link.style.display = match ? "" : "none";
      });

      // Hide empty groups
      document.querySelectorAll(".sidebar-group").forEach((group) => {
        const visibleLinks = group.querySelectorAll(
          '.sidebar-link[style*="display: block"], .sidebar-link:not([style*="display: none"])'
        );
        group.style.display = visibleLinks.length > 0 ? "" : "none";
      });
    });
  }

  // ===== CLOSE SETTINGS =====
  const closeBtn = document.getElementById("closeSettingsBtn");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }

  // ===== THEME SELECTOR =====
  document.querySelectorAll('input[name="theme"]').forEach((radio) => {
    radio.addEventListener("change", function () {
      if (this.checked) {
        showToast(`Theme changed to ${this.value}`, "success");
      }
    });
  });

  // ===== TOGGLE SWITCHES =====
  document.querySelectorAll(".toggle-switch input[type='checkbox']").forEach((toggle) => {
    toggle.addEventListener("change", function () {
      const label = this.closest(".setting-row")?.querySelector(".setting-info h3");
      const name = label ? label.textContent.trim() : "Setting";
      const state = this.checked ? "enabled" : "disabled";
      showToast(`${name} ${state}`, this.checked ? "success" : "info");
    });
  });

  // ===== FONT SIZE CONTROLS =====
  const fontSizeDisplay = document.querySelector(".font-size-display");
  const fontSizeBtns = document.querySelectorAll(".font-size-control .btn-sm");
  if (fontSizeDisplay && fontSizeBtns.length) {
    let currentSize = 100;
    fontSizeBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.textContent.includes("−") && currentSize > 60) {
          currentSize -= 10;
        } else if (btn.textContent.includes("+") && currentSize < 200) {
          currentSize += 10;
        }
        fontSizeDisplay.textContent = currentSize + "%";
        showToast(`Font size set to ${currentSize}%`, "info");
      });
    });
  }

  // ===== FAVORITE REMOVE =====
  document.querySelectorAll(".fav-remove").forEach((btn) => {
    btn.addEventListener("click", function () {
      const item = this.closest(".favorite-item");
      const title = item?.querySelector(".fav-title")?.textContent || "Item";
      item?.remove();
      showToast(`Removed "${title}" from favorites`, "warning");
    });
  });

  // ===== DOWNLOAD ACTIONS =====
  document.querySelectorAll(".dl-action").forEach((btn) => {
    btn.addEventListener("click", function () {
      const action = this.textContent.trim();
      const item = this.closest(".download-item");
      const title = item?.querySelector(".dl-title")?.textContent || "File";

      if (action === "📁") {
        showToast(`Opening "${title}" location`, "info");
      } else if (action === "⏸️") {
        showToast(`Paused "${title}"`, "warning");
      } else if (action === "🔄 Retry") {
        showToast(`Retrying "${title}" download`, "info");
      }
    });
  });

  // ===== TAB GROUP EXPAND =====
  document.querySelectorAll(".tg-expand").forEach((btn) => {
    btn.addEventListener("click", function () {
      const tabs = this.closest(".tabgroup-item")?.querySelector(".tg-tabs");
      if (tabs) {
        const isHidden = tabs.style.display === "none";
        tabs.style.display = isHidden ? "flex" : "none";
        this.textContent = isHidden ? "▼" : "▶";
      }
    });
  });

  // ===== SPLIT LAYOUT SELECTION =====
  document.querySelectorAll(".split-layout-option").forEach((opt) => {
    opt.addEventListener("click", function () {
      document.querySelectorAll(".split-layout-option").forEach((o) => o.classList.remove("active"));
      this.classList.add("active");
      const layout = this.dataset.layout;
      showToast(`Split screen layout: ${layout}`, "info");
    });
  });

  // ===== SCREENSHOT OPTIONS =====
  document.querySelectorAll(".screenshot-option").forEach((opt) => {
    opt.addEventListener("click", function () {
      document.querySelectorAll(".screenshot-option").forEach((o) => o.classList.remove("active"));
      this.classList.add("active");
      const mode = this.querySelector("span:last-child")?.textContent || "Capture";
      showToast(`Screenshot mode: ${mode}`, "info");
    });
  });

  // ===== TRANSLATE SWAP =====
  const translateSwap = document.querySelector(".translate-swap");
  if (translateSwap) {
    translateSwap.addEventListener("click", () => {
      const from = document.getElementById("translateFrom");
      const to = document.getElementById("translateTo");
      if (from && to) {
        const temp = from.value;
        from.value = to.value;
        to.value = temp;
        showToast("Languages swapped", "info");
      }
    });
  }

  // ===== CLEAR DATA =====
  const clearDataBtn = document.querySelector(".btn-danger");
  if (clearDataBtn) {
    clearDataBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to clear all selected data? This cannot be undone.")) {
        showToast("Browsing data cleared successfully! 🗑️", "success");
      }
    });
  }

  // ===== PRINT =====
  const printBtn = document.querySelector(".print-options .btn-primary");
  if (printBtn) {
    printBtn.addEventListener("click", () => {
      showToast("🖨️ Print preview opening...", "info");
      setTimeout(() => window.print(), 500);
    });
  }

  // ===== TAKE SCREENSHOT =====
  const screenshotBtn = document.querySelector(".screenshot-options + .btn-primary, .settings-card .btn-primary:contains('Screenshot')");
  document.querySelectorAll(".settings-card .btn-primary").forEach((btn) => {
    if (btn.textContent.includes("Screenshot")) {
      btn.addEventListener("click", () => {
        showToast("📷 Screenshot taken! Saved to Downloads.", "success");
      });
    }
  });

  // ===== FEEDBACK SEND =====
  const feedbackBtn = document.querySelector(".feedback-box .btn-primary");
  if (feedbackBtn) {
    feedbackBtn.addEventListener("click", () => {
      const textarea = feedbackBtn.closest(".feedback-box")?.querySelector("textarea");
      const text = textarea?.value.trim();
      if (!text) {
        showToast("Please write some feedback first", "warning");
        return;
      }
      showToast("📤 Feedback sent! Thank you!", "success");
      textarea.value = "";
    });
  }

  // ===== EXPORT/IMPORT BOOKMARKS =====
  document.querySelectorAll(".bookmark-toolbar .btn-secondary").forEach((btn) => {
    btn.addEventListener("click", function () {
      const action = this.textContent.trim();
      if (action.includes("Import")) {
        showToast("📂 Import bookmarks dialog opening...", "info");
      } else if (action.includes("Export")) {
        showToast("📤 Bookmarks exported successfully!", "success");
      }
    });
  });

  // ===== PASSWORD GENERATE =====
  document.querySelectorAll(".btn-secondary").forEach((btn) => {
    if (btn.textContent.includes("Generate")) {
      btn.addEventListener("click", () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
        let pw = "";
        for (let i = 0; i < 16; i++) {
          pw += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        showToast(`🔑 Generated password: ${pw}`, "success");
        navigator.clipboard?.writeText(pw).catch(() => {});
      });
    }
  });

  // ===== HELP / MORE TOOLS =====
  document.querySelectorAll(".tool-item, .help-link").forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      const label = this.querySelector(".ti-label")?.textContent ||
                    this.querySelector(".hl-text")?.textContent ||
                    "Tool";
      showToast(`🚀 Opening: ${label}`, "info");
    });
  });

  // ===== FIND ON PAGE =====
  const findInput = document.getElementById("findInput");
  const findPrevBtn = document.getElementById("findPrevBtn");
  const findNextBtn = document.getElementById("findNextBtn");
  if (findInput) {
    findInput.addEventListener("input", function () {
      const query = this.value.trim();
      if (query) {
        showToast(`Searching for "${query}"...`, "info");
      }
    });
  }
  if (findPrevBtn) {
    findPrevBtn.addEventListener("click", () => showToast("Previous match", "info"));
  }
  if (findNextBtn) {
    findNextBtn.addEventListener("click", () => showToast("Next match", "info"));
  }

  // ===== ADD BOOKMARK / FAVORITE =====
  document.querySelectorAll(".btn-primary").forEach((btn) => {
    if (btn.textContent.includes("Add Bookmark")) {
      btn.addEventListener("click", () => {
        showToast("🔖 Bookmark added!", "success");
      });
    }
    if (btn.textContent.includes("Add Current Page")) {
      btn.addEventListener("click", () => {
        showToast("⭐ Current page added to favorites!", "success");
      });
    }
    if (btn.textContent.includes("New Tab Group")) {
      btn.addEventListener("click", () => {
        showToast("📑 New tab group created!", "success");
      });
    }
    if (btn.textContent.includes("Open Split View")) {
      btn.addEventListener("click", () => {
        showToast("🖥️ Split view opened!", "success");
      });
    }
    if (btn.textContent.includes("Edit Profile")) {
      btn.addEventListener("click", () => {
        showToast("✏️ Profile editing mode", "info");
      });
    }
  });

  // ===== SAVE PROFILE =====
  document.querySelectorAll(".settings-actions .btn-primary").forEach((btn) => {
    btn.addEventListener("click", () => {
      showToast("✅ Profile changes saved!", "success");
    });
  });

  // ===== INIT =====
  console.log("⚙️ ReVena Settings page initialized");
})();
