/**
 * Previous Year Question Papers — 5th Std to TY across all streams
 * Handles: paper data, search, filtering by subject/year/semester/exam type,
 * paper card rendering, favorites, upload interactions
 */
(function () {
  "use strict";

  // 1. PAPER DATA

  const subjects = [
    { id: "all", label: "All Subjects" },
    { id: "math", label: "Mathematics" },
    { id: "physics", label: "Physics" },
    { id: "chemistry", label: "Chemistry" },
    { id: "biology", label: "Biology" },
    { id: "cs", label: "Computer Science" },
    { id: "english", label: "English" },
    { id: "hindi", label: "Hindi" },
    { id: "history", label: "History" },
    { id: "economics", label: "Economics" },
    { id: "commerce", label: "Commerce" },
    { id: "accounting", label: "Accounting" },
    { id: "engineering", label: "Engineering" },
  ];

  const examTypes = [
    { id: "all", label: "All Types" },
    { id: "midterm", label: "Midterm" },
    { id: "final", label: "Final Exam" },
    { id: "practical", label: "Practical" },
    { id: "quarterly", label: "Quarterly" },
    { id: "halfyearly", label: "Half-Yearly" },
    { id: "model", label: "Model Test" },
  ];

  const semesters = [
    "Semester 1", "Semester 2", "Semester 3", "Semester 4",
    "Semester 5", "Semester 6", "Semester 7", "Semester 8",
    "Annual"
  ];

  const universities = [
    "All Boards", "CBSE", "ICSE", "Maharashtra Board", "Uttar Pradesh Board",
    "Tamil Nadu Board", "Karnataka Board", "Gujarat Board", "Rajasthan Board",
    "West Bengal Board", "Bihar Board", "Mumbai University", "Delhi University",
    "Pune University", "Anna University", "VTU", "JNTU", "RGPV", "AKTU",
    "GTU", "Other"
  ];

  const years = ["2026", "2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018"];

  const coverColors = [
    "linear-gradient(135deg, #1a237e, #283593)",
    "linear-gradient(135deg, #004d40, #00695c)",
    "linear-gradient(135deg, #4a148c, #6a1b9a)",
    "linear-gradient(135deg, #b71c1c, #c62828)",
    "linear-gradient(135deg, #e65100, #ef6c00)",
    "linear-gradient(135deg, #01579b, #0277bd)",
    "linear-gradient(135deg, #33691e, #558b2f)",
    "linear-gradient(135deg, #4e342e, #5d4037)",
    "linear-gradient(135deg, #0d47a1, #1565c0)",
    "linear-gradient(135deg, #311b92, #4527a0)",
    "linear-gradient(135deg, #006064, #00838f)",
    "linear-gradient(135deg, #827717, #9e9d24)",
    "linear-gradient(135deg, #880e4f, #ad1457)",
    "linear-gradient(135deg, #37474f, #455a64)",
    "linear-gradient(135deg, #bf360c, #d84315)",
    "linear-gradient(135deg, #1b5e20, #2e7d32)",
  ];

  const coverIcons = [
    "📐", "🔬", "💻", "📖", "📜", "📊", "🎨", "🌍",
    "⚛️", "🧮", "🔭", "📝", "🏛️", "⚙️", "🧬", "💰",
    "📏", "🔭", "🧪", "📗"
  ];

// COMPREHENSIVE PAPER DATA
  const papers = (function () {
    try { return JSON.parse(localStorage.getItem("pypPapers")) || []; } catch (e) { return []; }
  })();
  function persistPapers() {
    try { localStorage.setItem("pypPapers", JSON.stringify(papers)); } catch (e) { /* quota */ }
  }

  // ============================================================
  // 2. STATE
  // ============================================================
  let state = {
    activeSubject: "all",
    activeExamType: "all",
    activeYear: "all",
    activeSemester: "all",
    activeUniversity: "all",
    searchQuery: "",
    viewMode: "grid",
    currentPage: 1,
    pageSize: 12,
    favorites: JSON.parse(localStorage.getItem("pypFavorites") || "[]"),
    recentlyViewed: JSON.parse(localStorage.getItem("pypRecently") || "[]"),
    uploadQueue: [],
  };

  // ============================================================
  // 3. UTILITY FUNCTIONS
  // ============================================================
  function getFilteredPapers() {
    let result = [...papers];

    // Subject filter
    if (state.activeSubject !== "all") {
      result = result.filter((p) => p.subjectId === state.activeSubject);
    }

    // Exam type filter
    if (state.activeExamType !== "all") {
      result = result.filter((p) => p.examType === state.activeExamType);
    }

    // Year filter
    if (state.activeYear !== "all") {
      result = result.filter((p) => p.year === state.activeYear);
    }

    // Semester filter
    if (state.activeSemester !== "all") {
      result = result.filter((p) => p.semester === state.activeSemester);
    }

    // University filter
    if (state.activeUniversity !== "all") {
      result = result.filter((p) => p.university === state.activeUniversity || p.board === state.activeUniversity);
    }

    // Search filter
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.subject.toLowerCase().includes(q) ||
          p.courseCode.toLowerCase().includes(q) ||
          p.university.toLowerCase().includes(q)
      );
    }

    return result;
  }

  function getPaginatedPapers(paperList) {
    const start = (state.currentPage - 1) * state.pageSize;
    const end = start + state.pageSize;
    return paperList.slice(start, end);
  }

  function getTotalPages(paperList) {
    return Math.ceil(paperList.length / state.pageSize);
  }

  function getCoverStyle(paper) {
    const idx = paper.colorIdx !== undefined ? paper.colorIdx : paper.id % coverColors.length;
    return coverColors[idx];
  }

  function getCoverIcon(paper) {
    return paper.icon || coverIcons[paper.id % coverIcons.length];
  }

  function isFavorited(paperId) {
    return state.favorites.includes(paperId);
  }

  function toggleFavorite(paperId) {
    const idx = state.favorites.indexOf(paperId);
    if (idx > -1) {
      state.favorites.splice(idx, 1);
    } else {
      state.favorites.push(paperId);
    }
    localStorage.setItem("pypFavorites", JSON.stringify(state.favorites));
    renderFavorites();
    renderPapers();
    showToast(isFavorited(paperId) ? "⭐ Added to favorites" : "🗑️ Removed from favorites", "success");
  }

  function addToRecentlyViewed(paper) {
    state.recentlyViewed = state.recentlyViewed.filter((id) => id !== paper.id);
    state.recentlyViewed.unshift(paper.id);
    if (state.recentlyViewed.length > 5) {
      state.recentlyViewed.pop();
    }
    localStorage.setItem("pypRecently", JSON.stringify(state.recentlyViewed));
    renderRecentlyViewed();
  }

// Use shared.js showToast - delegate to global (already available via window.showToast)

  // ============================================================
  // 4. UPDATE COUNTS
  // ============================================================
  function updateFilterCounts() {
    subjects.forEach((sub) => {
      if (sub.id === "all") return;
      const count = papers.filter((p) => p.subjectId === sub.id).length;
      const el = document.getElementById(`count${sub.id.charAt(0).toUpperCase() + sub.id.slice(1)}`);
      if (el) el.textContent = count;
    });
    // All subjects count
    const allEl = document.getElementById("countAllSubjects");
    if (allEl) allEl.textContent = papers.length;
  }

  // ============================================================
  // 5. RENDER FUNCTIONS
  // ============================================================

  // Subject Tabs
  function renderSubjectTabs() {
    const container = document.getElementById("subjectTabs");
    if (!container) return;
    container.innerHTML = subjects
      .map(
        (s) => `
      <button class="pyp-subject-tab ${state.activeSubject === s.id ? "active" : ""}" data-subject="${s.id}">
        ${s.label}
      </button>
    `
      )
      .join("");

    container.querySelectorAll(".pyp-subject-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.activeSubject = btn.dataset.subject;
        state.currentPage = 1;
        renderSubjectTabs();
        renderPapers();
        updateResultsCount();
        updatePagination();
        syncSidebarFilters();
      });
    });
  }

  // Exam Type Tabs
  function renderExamTypeTabs() {
    const container = document.getElementById("examTypeTabs");
    if (!container) return;
    container.innerHTML = examTypes
      .map(
        (et) => `
      <button class="pyp-examtype-tab ${state.activeExamType === et.id ? "active" : ""}" data-examtype="${et.id}">
        ${et.label}
      </button>
    `
      )
      .join("");

    container.querySelectorAll(".pyp-examtype-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.activeExamType = btn.dataset.examtype;
        state.currentPage = 1;
        renderExamTypeTabs();
        renderPapers();
        updateResultsCount();
        updatePagination();
        syncSidebarFilters();
      });
    });
  }

  // Render Papers
  function renderPapers() {
    const container = document.getElementById("paperGrid");
    if (!container) return;
    const filtered = getFilteredPapers();
    const paginated = getPaginatedPapers(filtered);

    container.className = `pyp-paper-grid ${state.viewMode === "list" ? "list-view" : ""}`;

    if (paginated.length === 0) {
      container.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:60px 20px;">
          <span style="font-size:3rem; display:block; margin-bottom:12px;">📄</span>
          <h3 style="color:var(--text-primary); margin-bottom:6px;">No question papers found</h3>
          <p style="color:var(--text-secondary); font-size:0.85rem;">
            Try adjusting your filters or search query.
          </p>
        </div>
      `;
      return;
    }

    container.innerHTML = paginated
      .map(
        (paper) => `
      <div class="pyp-paper-card" data-id="${paper.id}">
        <div class="ppc-cover" style="background:${getCoverStyle(paper)}">
          ${getCoverIcon(paper)}
          <div class="ppc-cover-overlay">
            <a href="#" class="cover-action-btn preview-btn">👁️ Preview</a>
            <button class="cover-action-btn download-btn">⬇️ Download</button>
          </div>
        </div>
        <div class="ppc-body">
          <span class="ppc-title" title="${paper.title}">${paper.title}</span>
          <span class="ppc-subject">${paper.subject} • ${paper.courseCode}</span>
          <div class="ppc-meta">
            <span>${paper.year}</span>
            <span>${paper.semester}</span>
            <span>${paper.university}</span>
          </div>
          <p class="ppc-desc">${paper.description}</p>
          <div class="ppc-badges">
            ${paper.tags.slice(0, 3).map(t => `<span>${t}</span>`).join("")}
          </div>
          <div>
            <span class="ppc-examtype-badge">${examTypes.find(et => et.id === paper.examType)?.label || paper.examType}</span>
            <span class="ppc-semester-badge">${paper.semester}</span>
          </div>
          <div class="ppc-actions">
            <a href="#" class="ppc-action-primary">📖 View Paper</a>
            <button class="ppc-action-secondary download-paper-btn">⬇️ Download</button>
            <button class="ppc-action-icon bookmark-btn" title="${isFavorited(paper.id) ? "Remove from favorites" : "Add to favorites"}">
              ${isFavorited(paper.id) ? "⭐" : "🔖"}
            </button>
          </div>
        </div>
      </div>
    `
      )
      .join("");

    // Attach events
    container.querySelectorAll(".pyp-paper-card").forEach((card) => {
      const id = parseInt(card.dataset.id);
      const paper = papers.find((p) => p.id === id);
      if (!paper) return;

      // View
      card.querySelector(".ppc-action-primary")?.addEventListener("click", (e) => {
        e.preventDefault();
        addToRecentlyViewed(paper);
        showToast(`📖 Opening "${paper.title}" — ${paper.subject} ${paper.year}`, "info");
      });

      // Preview
      card.querySelector(".preview-btn")?.addEventListener("click", (e) => {
        e.preventDefault();
        showToast(`👁️ Previewing "${paper.title}"...`, "info");
      });

      // Download
      card.querySelectorAll(".download-btn, .download-paper-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          showToast(`⬇️ Downloading "${paper.title}" (${paper.year})...`, "success");
        });
      });

      // Bookmark / Favorite
      card.querySelector(".bookmark-btn")?.addEventListener("click", () => {
        toggleFavorite(paper.id);
      });
    });
  }

  // Results count
  function updateResultsCount() {
    const el = document.getElementById("resultsCount");
    if (!el) return;
    const count = getFilteredPapers().length;
    el.textContent = `Showing ${count} question paper${count !== 1 ? "s" : ""}`;
  }

  // Pagination
  function updatePagination() {
    const container = document.getElementById("pagination");
    if (!container) return;
    const total = getTotalPages(getFilteredPapers());

    if (total <= 1) {
      container.innerHTML = "";
      return;
    }

    let html = "";
    html += `<button class="page-prev" ${state.currentPage <= 1 ? "disabled" : ""}>‹</button>`;

    const start = Math.max(1, state.currentPage - 2);
    const end = Math.min(total, state.currentPage + 2);

    if (start > 1) {
      html += `<button data-page="1">1</button>`;
      if (start > 2) html += `<span class="page-info">...</span>`;
    }

    for (let i = start; i <= end; i++) {
      html += `<button data-page="${i}" class="${i === state.currentPage ? "active" : ""}">${i}</button>`;
    }

    if (end < total) {
      if (end < total - 1) html += `<span class="page-info">...</span>`;
      html += `<button data-page="${total}">${total}</button>`;
    }

    html += `<button class="page-next" ${state.currentPage >= total ? "disabled" : ""}>›</button>`;

    container.innerHTML = html;

    container.querySelectorAll("button[data-page]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.currentPage = parseInt(btn.dataset.page);
        renderPapers();
        updatePagination();
        window.scrollTo({ top: document.getElementById("paperGrid").offsetTop - 110, behavior: "smooth" });
      });
    });

    container.querySelector(".page-prev")?.addEventListener("click", () => {
      if (state.currentPage > 1) {
        state.currentPage--;
        renderPapers();
        updatePagination();
      }
    });

    container.querySelector(".page-next")?.addEventListener("click", () => {
      if (state.currentPage < total) {
        state.currentPage++;
        renderPapers();
        updatePagination();
      }
    });
  }

  // Favorites sidebar
  function renderFavorites() {
    const container = document.getElementById("favoritesList");
    if (!container) return;
    const favPapers = papers.filter((p) => state.favorites.includes(p.id));

    if (favPapers.length === 0) {
      container.innerHTML = `<p class="text-muted" style="font-size:0.78rem;">No favorites yet. Click 🔖 on any paper to add.</p>`;
      return;
    }

    container.innerHTML = favPapers
      .map(
        (paper) => `
      <div class="pyp-fav-item" data-id="${paper.id}">
        <span class="fav-icon">${getCoverIcon(paper)}</span>
        <div class="fav-info">
          <span class="fav-title">${paper.title}</span>
          <span class="fav-subject">${paper.subject} • ${paper.year}</span>
        </div>
        <button class="fav-remove" title="Remove">✕</button>
      </div>
    `
      )
      .join("");

    container.querySelectorAll(".fav-remove").forEach((btn) => {
      const item = btn.closest(".pyp-fav-item");
      const id = parseInt(item.dataset.id);
      btn.addEventListener("click", () => toggleFavorite(id));
    });

    container.querySelectorAll(".pyp-fav-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        if (e.target.closest(".fav-remove")) return;
        const id = parseInt(item.dataset.id);
        const paper = papers.find((p) => p.id === id);
        if (paper) showToast(`📖 Opening "${paper.title}"...`, "info");
      });
    });
  }

  // Recently viewed sidebar
  function renderRecentlyViewed() {
    const container = document.getElementById("recentlyViewed");
    if (!container) return;
    const recentPapers = state.recentlyViewed.map((id) => papers.find((p) => p.id === id)).filter(Boolean);

    if (recentPapers.length === 0) {
      container.innerHTML = `<p class="text-muted" style="font-size:0.78rem;">No recently viewed papers.</p>`;
      return;
    }

    container.innerHTML = recentPapers
      .map(
        (paper) => `
      <div class="pyp-recent-item" data-id="${paper.id}">
        <div class="recent-cover" style="background:${getCoverStyle(paper)}; font-size:0.7rem;">
          ${getCoverIcon(paper)}
        </div>
        <div class="recent-info">
          <span class="recent-title">${paper.title}</span>
          <span class="recent-time">${paper.year} • ${paper.semester}</span>
        </div>
      </div>
    `
      )
      .join("");

    container.querySelectorAll(".pyp-recent-item").forEach((item) => {
      item.addEventListener("click", () => {
        const id = parseInt(item.dataset.id);
        const paper = papers.find((p) => p.id === id);
        if (paper) showToast(`📖 Opening "${paper.title}"...`, "info");
      });
    });
  }

  // Recommendations sidebar
  function renderRecommendations() {
    const container = document.getElementById("recommendations");
    if (!container) return;
    const available = papers.filter((p) => !state.favorites.includes(p.id));
    const shuffled = [...available].sort(() => 0.5 - Math.random());
    const recs = shuffled.slice(0, 3);

    if (recs.length === 0) {
      container.innerHTML = `<p class="text-muted" style="font-size:0.78rem;">No recommendations right now.</p>`;
      return;
    }

    container.innerHTML = recs
      .map(
        (paper) => `
      <div class="pyp-recommend-item" data-id="${paper.id}">
        <div class="rec-cover" style="background:${getCoverStyle(paper)}; font-size:0.8rem;">
          ${getCoverIcon(paper)}
        </div>
        <div class="rec-info">
          <span class="rec-title">${paper.title}</span>
          <span class="rec-subject">${paper.subject} • ${paper.year}</span>
        </div>
      </div>
    `
      )
      .join("");

    container.querySelectorAll(".pyp-recommend-item").forEach((item) => {
      item.addEventListener("click", () => {
        const id = parseInt(item.dataset.id);
        const paper = papers.find((p) => p.id === id);
        if (paper) {
          addToRecentlyViewed(paper);
          showToast(`📖 Opening "${paper.title}"...`, "info");
        }
      });
    });
  }

  // ============================================================
  // 6. SEARCH
  // ============================================================
  function initSearch() {
    const input = document.getElementById("globalSearchInput");
    const btn = document.getElementById("globalSearchBtn");
    if (!input) return;

    function doSearch() {
      state.searchQuery = input.value;
      state.currentPage = 1;
      renderPapers();
      updateResultsCount();
      updatePagination();
    }

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") doSearch();
    });

    if (btn) {
      btn.addEventListener("click", doSearch);
    }
  }

  // ============================================================
  // 7. VIEW TOGGLE
  // ============================================================
  function initViewToggle() {
    const gridBtn = document.getElementById("viewGridBtn");
    const listBtn = document.getElementById("viewListBtn");
    if (!gridBtn || !listBtn) return;

    gridBtn.addEventListener("click", () => {
      state.viewMode = "grid";
      gridBtn.classList.add("active");
      listBtn.classList.remove("active");
      renderPapers();
    });

    listBtn.addEventListener("click", () => {
      state.viewMode = "list";
      listBtn.classList.add("active");
      gridBtn.classList.remove("active");
      renderPapers();
    });
  }

  // ============================================================
  // 8. SIDEBAR FILTERS
  // ============================================================
  function syncSidebarFilters() {
    // Subject filters
    document.querySelectorAll('#subjectFilters input[type="radio"]').forEach((radio) => {
      radio.checked = radio.value === state.activeSubject;
    });
    // Exam type filters
    document.querySelectorAll('#examTypeFilters input[type="radio"]').forEach((radio) => {
      radio.checked = radio.value === state.activeExamType;
    });
    // Year filters
    document.querySelectorAll('#yearFilters input[type="radio"]').forEach((radio) => {
      radio.checked = radio.value === state.activeYear;
    });
    // Semester filters
    document.querySelectorAll('#semesterFilters input[type="radio"]').forEach((radio) => {
      radio.checked = radio.value === state.activeSemester;
    });
    // University filters
    document.querySelectorAll('#universityFilters input[type="radio"]').forEach((radio) => {
      radio.checked = radio.value === state.activeUniversity;
    });
  }

  function generateUniversityFilters() {
    const container = document.getElementById("universityFilters");
    if (!container) return;
    container.innerHTML = universities
      .map(
        (u) => `
      <label class="pyp-filter-option">
        <input type="radio" name="universityFilter" value="${u}" ${state.activeUniversity === u ? "checked" : ""} />
        <span class="filter-label">${u}</span>
      </label>
    `
      )
      .join("");

    container.querySelectorAll('input[name="universityFilter"]').forEach((radio) => {
      radio.addEventListener("change", () => {
        if (radio.checked) {
          state.activeUniversity = radio.value;
          state.currentPage = 1;
          renderPapers();
          updateResultsCount();
          updatePagination();
        }
      });
    });
  }

  function generateYearFilters() {
    const container = document.getElementById("yearFilters");
    if (!container) return;
    container.innerHTML = `
      <label class="pyp-filter-option">
        <input type="radio" name="yearFilter" value="all" ${state.activeYear === "all" ? "checked" : ""} />
        <span class="filter-label">All Years</span>
      </label>
      ${years.map(
        (y) => `
      <label class="pyp-filter-option">
        <input type="radio" name="yearFilter" value="${y}" ${state.activeYear === y ? "checked" : ""} />
        <span class="filter-label">${y}</span>
      </label>
    `
      ).join("")}
    `;

    container.querySelectorAll('input[name="yearFilter"]').forEach((radio) => {
      radio.addEventListener("change", () => {
        if (radio.checked) {
          state.activeYear = radio.value;
          state.currentPage = 1;
          renderPapers();
          updateResultsCount();
          updatePagination();
        }
      });
    });
  }

  function generateSemesterFilters() {
    const container = document.getElementById("semesterFilters");
    if (!container) return;
    container.innerHTML = `
      <label class="pyp-filter-option">
        <input type="radio" name="semesterFilter" value="all" ${state.activeSemester === "all" ? "checked" : ""} />
        <span class="filter-label">All Semesters</span>
      </label>
      ${semesters.map(
        (s) => `
      <label class="pyp-filter-option">
        <input type="radio" name="semesterFilter" value="${s}" ${state.activeSemester === s ? "checked" : ""} />
        <span class="filter-label">${s}</span>
      </label>
    `
      ).join("")}
    `;

    container.querySelectorAll('input[name="semesterFilter"]').forEach((radio) => {
      radio.addEventListener("change", () => {
        if (radio.checked) {
          state.activeSemester = radio.value;
          state.currentPage = 1;
          renderPapers();
          updateResultsCount();
          updatePagination();
        }
      });
    });
  }

  function initSidebarFilters() {
    // Subject radios
    document.querySelectorAll('#subjectFilters input[type="radio"]').forEach((radio) => {
      radio.addEventListener("change", () => {
        if (radio.checked) {
          state.activeSubject = radio.value;
          state.currentPage = 1;
          renderSubjectTabs();
          renderPapers();
          updateResultsCount();
          updatePagination();
        }
      });
    });

    // Exam type radios
    document.querySelectorAll('#examTypeFilters input[type="radio"]').forEach((radio) => {
      radio.addEventListener("change", () => {
        if (radio.checked) {
          state.activeExamType = radio.value;
          state.currentPage = 1;
          renderExamTypeTabs();
          renderPapers();
          updateResultsCount();
          updatePagination();
        }
      });
    });

    // Clear filters
    document.querySelectorAll(".pyp-filter-clear").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.activeSubject = "all";
        state.activeExamType = "all";
        state.activeYear = "all";
        state.activeSemester = "all";
        state.activeUniversity = "all";
        state.currentPage = 1;
        syncSidebarFilters();
        renderSubjectTabs();
        renderExamTypeTabs();
        renderPapers();
        updateResultsCount();
        updatePagination();
        showToast("✕ Filters cleared", "info");
      });
    });
  }

  // ============================================================
  // 9. MOBILE FILTER TOGGLE
  // ============================================================
  function initMobileFilter() {
    const toggle = document.getElementById("mobileFilterToggle");
    const overlay = document.getElementById("mobileFilterOverlay");
    const close = document.getElementById("mobileFilterClose");
    if (!toggle || !overlay) return;

    toggle.addEventListener("click", () => overlay.classList.add("open"));
    if (close) close.addEventListener("click", () => overlay.classList.remove("open"));

    overlay.querySelectorAll('input[name="mSubjectFilter"]').forEach((radio) => {
      radio.addEventListener("change", () => {
        if (radio.checked) {
          state.activeSubject = radio.value;
          state.currentPage = 1;
          renderSubjectTabs();
          renderPapers();
          updateResultsCount();
          updatePagination();
          syncSidebarFilters();
          setTimeout(() => overlay.classList.remove("open"), 300);
        }
      });
    });

    overlay.querySelectorAll('input[name="mExamTypeFilter"]').forEach((radio) => {
      radio.addEventListener("change", () => {
        if (radio.checked) {
          state.activeExamType = radio.value;
          state.currentPage = 1;
          renderExamTypeTabs();
          renderPapers();
          updateResultsCount();
          updatePagination();
          syncSidebarFilters();
          setTimeout(() => overlay.classList.remove("open"), 300);
        }
      });
    });

    overlay.querySelectorAll(".pyp-filter-clear").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.activeSubject = "all";
        state.activeExamType = "all";
        state.activeYear = "all";
        state.activeSemester = "all";
        state.activeUniversity = "all";
        state.currentPage = 1;
        syncSidebarFilters();
        renderSubjectTabs();
        renderExamTypeTabs();
        renderPapers();
        updateResultsCount();
        updatePagination();
        setTimeout(() => overlay.classList.remove("open"), 300);
      });
    });
  }

  // ============================================================
  // 10. UPLOAD SECTION
  // ============================================================
  function initUpload() {
    const dropZone = document.getElementById("dropZone");
    const fileInput = document.getElementById("fileInput");
    const uploadForm = document.getElementById("uploadForm");
    const submitBtn = document.getElementById("submitUploadBtn");
    const previewBtn = document.getElementById("previewBtn");

    // Drag & Drop
    if (dropZone && fileInput) {
      dropZone.addEventListener("click", () => fileInput.click());

      dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZone.classList.add("drag-over");
      });

      dropZone.addEventListener("dragleave", () => {
        dropZone.classList.remove("drag-over");
      });

      dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropZone.classList.remove("drag-over");
        if (e.dataTransfer.files.length > 0) {
          const validFiles = Array.from(e.dataTransfer.files).filter((f) => {
            const ext = f.name.split(".").pop().toLowerCase();
            return ["pdf", "docx", "doc"].includes(ext);
          });
          if (validFiles.length === 0) {
            showToast("⚠️ Only PDF and DOCX files are supported.", "warning");
            return;
          }
          // Check sizes
          const oversized = validFiles.filter((f) => f.size > 50 * 1024 * 1024);
          if (oversized.length > 0) {
            showToast("⚠️ Some files exceed the 50 MB limit.", "warning");
            return;
          }
          // Check duplicates by name
          const duplicates = validFiles.filter((f) =>
            papers.some((p) => p.title.toLowerCase() === f.name.replace(/\.[^/.]+$/, "").toLowerCase())
          );
          if (duplicates.length > 0) {
            showToast(`⚠️ "${duplicates[0].name}" may be a duplicate.`, "warning");
          }
          fileInput.files = e.dataTransfer.files;
          state.uploadQueue = validFiles;
          showToast(`📎 ${validFiles.length} valid file(s) selected`, "success");
        }
      });

      fileInput.addEventListener("change", () => {
        if (fileInput.files.length > 0) {
          const validFiles = Array.from(fileInput.files).filter((f) => {
            const ext = f.name.split(".").pop().toLowerCase();
            return ["pdf", "docx", "doc"].includes(ext);
          });
          if (validFiles.length === 0) {
            showToast("⚠️ Please select PDF or DOCX files only.", "warning");
            return;
          }
          state.uploadQueue = validFiles;
          const names = validFiles.map((f) => f.name).join(", ");
          showToast(`📎 Uploaded: ${names}`, "success");
        }
      });
    }

    // Submit with validation
    if (submitBtn) {
      submitBtn.addEventListener("click", () => {
        const title = document.getElementById("uploadTitle")?.value.trim();
        const subjectId = document.getElementById("uploadSubject")?.value;
        const examType = document.getElementById("uploadExamType")?.value;
        const courseCode = document.getElementById("uploadCourseCode")?.value.trim();
        const year = document.getElementById("uploadYear")?.value;
        const semester = document.getElementById("uploadSemester")?.value;
        const university = document.getElementById("uploadUniversity")?.value;
        const copyrightChecked = document.getElementById("copyrightCheck")?.checked;

        if (!title) {
          showToast("⚠️ Please enter the exam/paper title.", "warning");
          return;
        }
        if (!subjectId) {
          showToast("⚠️ Please select a subject.", "warning");
          return;
        }
        if (!examType) {
          showToast("⚠️ Please select the exam type.", "warning");
          return;
        }
        if (!courseCode) {
          showToast("⚠️ Please enter the course code.", "warning");
          return;
        }
        if (!year) {
          showToast("⚠️ Please select the year.", "warning");
          return;
        }
        if (!semester) {
          showToast("⚠️ Please select the semester.", "warning");
          return;
        }
        if (!copyrightChecked) {
          showToast("⚠️ Please confirm copyright before submitting.", "warning");
          return;
        }

        const subject = subjects.find(s => s.id === subjectId)?.label || subjectId;
        const paper = {
          id: Date.now(),
          title,
          subject,
          subjectId,
          courseCode,
          examType,
          year,
          semester,
          university: university || "Other",
          board: university || "Other",
          tags: ["Community", year, subject],
          description: "Uploaded by the community. Practice with this previous year question paper.",
          colorIdx: papers.length % coverColors.length,
        };
        papers.unshift(paper);
        persistPapers();
        renderPapers();
        updateResultsCount();
        updatePagination();
        updateFilterCounts();
        showToast("📄 Question paper added to the library!", "success");
        if (uploadForm) uploadForm.reset();
        state.uploadQueue = [];
      });
    }

    // Preview
    if (previewBtn) {
      previewBtn.addEventListener("click", () => {
        showToast("👁️ Opening preview of your question paper...", "info");
      });
    }
  }

// ============================================================
  // 11. EXTRA FEATURES
  // ============================================================
  function initExtraFeatures() {
    document.querySelectorAll(".pyp-extra-card").forEach((card) => {
      card.addEventListener("click", () => {
        const title = card.querySelector(".ef-title")?.textContent || "Feature";
        showToast(`🚀 "${title}" — Coming soon!`, "info");
      });
    });
  }

// ============================================================
  // 13. INIT
  // ============================================================
  function init() {
    updateFilterCounts();
    renderSubjectTabs();
    renderExamTypeTabs();
    generateYearFilters();
    generateSemesterFilters();
    generateUniversityFilters();
    renderPapers();
    updateResultsCount();
    updatePagination();
    renderFavorites();
    renderRecentlyViewed();
    renderRecommendations();
    initSearch();
    initViewToggle();
    initSidebarFilters();
    initMobileFilter();
initExtraFeatures();
    // Use shared.js globals for scroll-to-top and atomic logo
if (window.initScrollTop) window.initScrollTop("scrollTopBtn");
    initUpload();
    if (window.initAtomicLogo) window.initAtomicLogo("headerAtomicCanvas", 100);

    // Initial search from URL param
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get("search");
    if (searchParam) {
      const searchInput = document.getElementById("globalSearchInput");
      if (searchInput) {
        searchInput.value = searchParam;
        state.searchQuery = searchParam;
        renderPapers();
        updateResultsCount();
        updatePagination();
      }
    }

    console.log("📄 Previous Year Question Papers initialized —", papers.length, "papers loaded");
  }

  // Run on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

