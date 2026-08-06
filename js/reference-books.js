/**
 * Reference Books — 5th Std to TY across all streams
 * Handles: book data, search, filtering by level/stream/standard,
 * book card rendering, favorites, recently viewed, recommendations
 */
(function () {
  "use strict";

  // 1. REFERENCE BOOK DATA

  const academicLevels = [
    { id: "all", label: "All Levels" },
    { id: "primary", label: "5th - 8th Std" },
    { id: "secondary", label: "9th - 10th Std" },
    { id: "hsc", label: "11th - 12th Std" },
    { id: "ug", label: "FY / SY / TY" },
  ];

  const streams = [
    { id: "all", label: "All Streams" },
    { id: "pcm", label: "PCM (Science)" },
    { id: "pcb", label: "PCB (Biology)" },
    { id: "commerce", label: "Commerce" },
    { id: "arts", label: "Arts / Humanities" },
    { id: "csit", label: "CS / IT" },
    { id: "engineering", label: "Engineering" },
  ];

  const standards = [
    "5th", "6th", "7th", "8th", "9th", "10th",
    "11th", "12th",
    "FY", "SY", "TY"
  ];

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
    "⚛️", "🧮", "🔭", "📝", "🏛️", "⚙️", "🧬", "💰"
  ];

  const books = (function () {
    try { return JSON.parse(localStorage.getItem("refBooks")) || []; } catch (e) { return []; }
  })();
  function persistRefBooks() {
    try { localStorage.setItem("refBooks", JSON.stringify(books)); } catch (e) { /* quota */ }
  }

  // 2. STATE
  let state = {
    activeLevel: "all",
    activeStream: "all",
    activeStandard: "all",
    searchQuery: "",
    viewMode: "grid",
    currentPage: 1,
    pageSize: 12,
    favorites: JSON.parse(localStorage.getItem("refFavorites") || "[]"),
    recentlyViewed: JSON.parse(localStorage.getItem("refRecently") || "[]"),
  };

  // 3. UTILITY FUNCTIONS
  function getFilteredBooks() {
    let result = [...books];
    if (state.activeLevel !== "all") {
      result = result.filter((b) => b.level === state.activeLevel);
    }
    if (state.activeStream !== "all") {
      result = result.filter((b) => b.stream === state.activeStream || b.stream === "all");
    }
    if (state.activeStandard !== "all") {
      result = result.filter((b) => b.standard === state.activeStandard);
    }
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.trim().toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.subject.toLowerCase().includes(q) ||
          b.isbn.includes(q) ||
          b.topics.some(t => t.toLowerCase().includes(q))
      );
    }
    return result;
  }

  function getPaginatedBooks(bookList) {
    const start = (state.currentPage - 1) * state.pageSize;
    const end = start + state.pageSize;
    return bookList.slice(start, end);
  }

  function getTotalPages(bookList) {
    return Math.ceil(bookList.length / state.pageSize);
  }

  function getCoverStyle(book) {
    const idx = book.colorIdx !== undefined ? book.colorIdx : book.id % coverColors.length;
    return coverColors[idx];
  }

  function getCoverIcon(book) {
    return book.icon || coverIcons[book.id % coverIcons.length];
  }

  function isFavorited(bookId) {
    return state.favorites.includes(bookId);
  }

  function toggleFavorite(bookId) {
    const idx = state.favorites.indexOf(bookId);
    if (idx > -1) {
      state.favorites.splice(idx, 1);
    } else {
      state.favorites.push(bookId);
    }
    localStorage.setItem("refFavorites", JSON.stringify(state.favorites));
    renderFavorites();
    renderBooks();
    showToast(isFavorited(bookId) ? "⭐ Added to favorites" : "🗑️ Removed from favorites", "success");
  }

  function addToRecentlyViewed(book) {
    state.recentlyViewed = state.recentlyViewed.filter((id) => id !== book.id);
    state.recentlyViewed.unshift(book.id);
    if (state.recentlyViewed.length > 5) {
      state.recentlyViewed.pop();
    }
    localStorage.setItem("refRecently", JSON.stringify(state.recentlyViewed));
    renderRecentlyViewed();
  }

// Use shared.js showToast - delegate to global (already available via window.showToast)

  function getLevelLabel(levelId) {
    const l = academicLevels.find(l => l.id === levelId);
    return l ? l.label : levelId;
  }

  function getStandardLabel(std) {
    if (std === "FY") return "First Year";
    if (std === "SY") return "Second Year";
    if (std === "TY") return "Third Year";
    return std + " Standard";
  }

  function getStreamLabel(streamId) {
    const s = streams.find(s => s.id === streamId);
    return s ? s.label : streamId;
  }

  // 4. UPDATE COUNTS
  function updateFilterCounts() {
    const all = books.length;
    const primary = books.filter(b => b.level === "primary").length;
    const secondary = books.filter(b => b.level === "secondary").length;
    const hsc = books.filter(b => b.level === "hsc").length;
    const ug = books.filter(b => b.level === "ug").length;

    document.getElementById("countAll").textContent = all;
    document.getElementById("countPrimary").textContent = primary;
    document.getElementById("countSecondary").textContent = secondary;
    document.getElementById("countHsc").textContent = hsc;
    document.getElementById("countUg").textContent = ug;

    const streamMap = { pcm: 0, pcb: 0, commerce: 0, arts: 0, csit: 0, engineering: 0 };
    books.forEach(b => {
      if (b.stream !== "all" && streamMap[b.stream] !== undefined) {
        streamMap[b.stream]++;
      }
    });
    document.getElementById("countStreamAll").textContent = books.filter(b => b.stream !== "all").length;
    document.getElementById("countPcm").textContent = streamMap.pcm;
    document.getElementById("countPcb").textContent = streamMap.pcb;
    document.getElementById("countCommerce").textContent = streamMap.commerce;
    document.getElementById("countArts").textContent = streamMap.arts;
    document.getElementById("countCsit").textContent = streamMap.csit;
    document.getElementById("countEngineering").textContent = streamMap.engineering;
  }

  // 5. RENDER FUNCTIONS

  // Render Level Tabs
  function renderLevelTabs() {
    const container = document.getElementById("levelTabs");
    if (!container) return;
    container.innerHTML = academicLevels
      .map(
        (l) => `
      <button class="ref-level-tab ${state.activeLevel === l.id ? "active" : ""}" data-level="${l.id}">
        ${l.label}
      </button>
    `
      )
      .join("");

    container.querySelectorAll(".ref-level-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.activeLevel = btn.dataset.level;
        state.activeStandard = "all";
        state.currentPage = 1;
        renderLevelTabs();
        updateStreamTabsVisibility();
        renderStandardFilters();
        renderBooks();
        updateResultsCount();
        updatePagination();
        syncSidebarFilters();
      });
    });
  }

  // Update Stream Tabs visibility
  function updateStreamTabsVisibility() {
    const container = document.getElementById("streamTabs");
    if (!container) return;
    const showStream = state.activeLevel === "hsc" || state.activeLevel === "ug";
    container.style.display = showStream ? "flex" : "none";
    if (showStream) renderStreamTabs();
  }

  // Render Stream Tabs
  function renderStreamTabs() {
    const container = document.getElementById("streamTabs");
    if (!container) return;
    container.innerHTML = streams
      .filter(s => s.id !== "all")
      .map(
        (s) => `
      <button class="ref-stream-tab ${state.activeStream === s.id ? "active" : ""}" data-stream="${s.id}">
        ${s.label}
      </button>
    `
      )
      .join("");

    container.querySelectorAll(".ref-stream-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.activeStream = btn.dataset.stream;
        state.currentPage = 1;
        renderStreamTabs();
        renderBooks();
        updateResultsCount();
        updatePagination();
        syncSidebarFilters();
      });
    });
  }

  // Render Standard Filters
  function renderStandardFilters() {
    const container = document.getElementById("standardFilters");
    if (!container) return;

    let availableStandards = [];
    if (state.activeLevel === "all" || state.activeLevel === "primary") {
      availableStandards = availableStandards.concat(["5th", "6th", "7th", "8th"]);
    }
    if (state.activeLevel === "all" || state.activeLevel === "secondary") {
      availableStandards = availableStandards.concat(["9th", "10th"]);
    }
    if (state.activeLevel === "all" || state.activeLevel === "hsc") {
      availableStandards = availableStandards.concat(["11th", "12th"]);
    }
    if (state.activeLevel === "all" || state.activeLevel === "ug") {
      availableStandards = availableStandards.concat(["FY", "SY", "TY"]);
    }

    if (state.activeLevel === "all") {
      availableStandards = [...standards];
    }

    container.innerHTML = `
      <label class="ref-filter-option">
        <input type="radio" name="standardFilter" value="all" ${state.activeStandard === "all" ? "checked" : ""} />
        <span class="filter-label">All Standards</span>
      </label>
      ${availableStandards.map(
        (s) => `
      <label class="ref-filter-option">
        <input type="radio" name="standardFilter" value="${s}" ${state.activeStandard === s ? "checked" : ""} />
        <span class="filter-label">${s === "FY" ? "First Year" : s === "SY" ? "Second Year" : s === "TY" ? "Third Year" : s + " Std"}</span>
      </label>
    `
      ).join("")}
    `;

    container.querySelectorAll('input[name="standardFilter"]').forEach((radio) => {
      radio.addEventListener("change", () => {
        if (radio.checked) {
          state.activeStandard = radio.value;
          state.currentPage = 1;
          renderBooks();
          updateResultsCount();
          updatePagination();
        }
      });
    });
  }

  // Render Books
  function renderBooks() {
    const container = document.getElementById("bookGrid");
    if (!container) return;
    const filtered = getFilteredBooks();
    const paginated = getPaginatedBooks(filtered);

    container.className = `ref-book-grid ${state.viewMode === "list" ? "list-view" : ""}`;

    if (paginated.length === 0) {
      container.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:60px 20px;">
          <span style="font-size:3rem; display:block; margin-bottom:12px;">📚</span>
          <h3 style="color:var(--text-primary); margin-bottom:6px;">No reference books found</h3>
          <p style="color:var(--text-secondary); font-size:0.85rem;">
            Try adjusting your filters or search query.
          </p>
        </div>
      `;
      return;
    }

    container.innerHTML = paginated
      .map(
        (book) => `
      <div class="ref-book-card" data-id="${book.id}">
        <div class="rbc-cover" style="background:${getCoverStyle(book)}">
          ${getCoverIcon(book)}
          <div class="rbc-cover-overlay">
            <a href="#" class="cover-action-btn preview-btn">👁️ Preview</a>
            <button class="cover-action-btn download-btn">⬇️ Download</button>
          </div>
        </div>
        <div class="rbc-body">
          <span class="rbc-title" title="${book.title}">${book.title}</span>
          <span class="rbc-author">${book.author}</span>
          <div class="rbc-meta">
            <span>${book.edition}</span>
            <span>${book.year}</span>
            <span>${book.isbn ? "ISBN: " + book.isbn : ""}</span>
          </div>
          <p class="rbc-desc">${book.description}</p>
          <div class="rbc-topics">
            ${book.topics.slice(0, 3).map(t => `<span>${t}</span>`).join("")}
          </div>
          <div>
            <span class="rbc-level-badge">${getLevelLabel(book.level)}</span>
            ${book.stream !== "all" ? `<span class="rbc-stream-badge">${getStreamLabel(book.stream)}</span>` : ""}
          </div>
          <div class="rbc-actions">
            <a href="#" class="rbc-action-primary">📖 Read Now</a>
            <button class="rbc-action-secondary borrow-btn">📋 Borrow</button>
            <button class="rbc-action-icon bookmark-btn" title="${isFavorited(book.id) ? "Remove from favorites" : "Add to favorites"}">
              ${isFavorited(book.id) ? "⭐" : "🔖"}
            </button>
          </div>
        </div>
      </div>
    `
      )
      .join("");

    container.querySelectorAll(".ref-book-card").forEach((card) => {
      const id = parseInt(card.dataset.id);
      const book = books.find((b) => b.id === id);
      if (!book) return;

      card.querySelector(".rbc-action-primary")?.addEventListener("click", (e) => {
        e.preventDefault();
        addToRecentlyViewed(book);
        showToast(`📖 Opening "${book.title}"...`, "info");
      });

      card.querySelector(".preview-btn")?.addEventListener("click", (e) => {
        e.preventDefault();
        showToast(`👁️ Previewing "${book.title}"...`, "info");
      });

      card.querySelector(".download-btn")?.addEventListener("click", () => {
        showToast(`⬇️ Downloading "${book.title}"...`, "success");
      });

      card.querySelector(".borrow-btn")?.addEventListener("click", () => {
        showToast(`📋 You borrowed "${book.title}" — due in 14 days`, "success");
      });

      card.querySelector(".bookmark-btn")?.addEventListener("click", () => {
        toggleFavorite(book.id);
      });
    });
  }

  // Results count
  function updateResultsCount() {
    const el = document.getElementById("resultsCount");
    if (!el) return;
    const count = getFilteredBooks().length;
    el.textContent = `Showing ${count} reference book${count !== 1 ? "s" : ""}`;
  }

  // Pagination
  function updatePagination() {
    const container = document.getElementById("pagination");
    if (!container) return;
    const total = getTotalPages(getFilteredBooks());

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
        renderBooks();
        updatePagination();
        window.scrollTo({ top: document.getElementById("bookGrid").offsetTop - 110, behavior: "smooth" });
      });
    });

    container.querySelector(".page-prev")?.addEventListener("click", () => {
      if (state.currentPage > 1) {
        state.currentPage--;
        renderBooks();
        updatePagination();
      }
    });

    container.querySelector(".page-next")?.addEventListener("click", () => {
      if (state.currentPage < total) {
        state.currentPage++;
        renderBooks();
        updatePagination();
      }
    });
  }

  // Favorites sidebar
  function renderFavorites() {
    const container = document.getElementById("favoritesList");
    if (!container) return;
    const favBooks = books.filter((b) => state.favorites.includes(b.id));

    if (favBooks.length === 0) {
      container.innerHTML = `<p class="text-muted" style="font-size:0.78rem;">No favorites yet. Click 🔖 on any book to add.</p>`;
      return;
    }

    container.innerHTML = favBooks
      .map(
        (book) => `
      <div class="ref-fav-item" data-id="${book.id}">
        <span class="fav-icon">${getCoverIcon(book)}</span>
        <div class="fav-info">
          <span class="fav-title">${book.title}</span>
          <span class="fav-author">${book.author}</span>
        </div>
        <button class="fav-remove" title="Remove">✕</button>
      </div>
    `
      )
      .join("");

    container.querySelectorAll(".fav-remove").forEach((btn) => {
      const item = btn.closest(".ref-fav-item");
      const id = parseInt(item.dataset.id);
      btn.addEventListener("click", () => toggleFavorite(id));
    });

    container.querySelectorAll(".ref-fav-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        if (e.target.closest(".fav-remove")) return;
        const id = parseInt(item.dataset.id);
        const book = books.find((b) => b.id === id);
        if (book) showToast(`📖 Opening "${book.title}"...`, "info");
      });
    });
  }

  // Recently viewed sidebar
  function renderRecentlyViewed() {
    const container = document.getElementById("recentlyViewed");
    if (!container) return;
    const recentBooks = state.recentlyViewed.map((id) => books.find((b) => b.id === id)).filter(Boolean);

    if (recentBooks.length === 0) {
      container.innerHTML = `<p class="text-muted" style="font-size:0.78rem;">No recently viewed books.</p>`;
      return;
    }

    container.innerHTML = recentBooks
      .map(
        (book) => `
      <div class="ref-recent-item" data-id="${book.id}">
        <div class="recent-cover" style="background:${getCoverStyle(book)}; font-size:0.7rem;">
          ${getCoverIcon(book)}
        </div>
        <div class="recent-info">
          <span class="recent-title">${book.title}</span>
          <span class="recent-time">${book.edition} • ${book.year}</span>
        </div>
      </div>
    `
      )
      .join("");

    container.querySelectorAll(".ref-recent-item").forEach((item) => {
      item.addEventListener("click", () => {
        const id = parseInt(item.dataset.id);
        const book = books.find((b) => b.id === id);
        if (book) showToast(`📖 Opening "${book.title}"...`, "info");
      });
    });
  }

  // Recommendations sidebar
  function renderRecommendations() {
    const container = document.getElementById("recommendations");
    if (!container) return;
    const available = books.filter((b) => !state.favorites.includes(b.id));
    const shuffled = [...available].sort(() => 0.5 - Math.random());
    const recs = shuffled.slice(0, 3);

    if (recs.length === 0) {
      container.innerHTML = `<p class="text-muted" style="font-size:0.78rem;">No recommendations right now.</p>`;
      return;
    }

    container.innerHTML = recs
      .map(
        (book) => `
      <div class="ref-recommend-item" data-id="${book.id}">
        <div class="rec-cover" style="background:${getCoverStyle(book)}; font-size:0.8rem;">
          ${getCoverIcon(book)}
        </div>
        <div class="rec-info">
          <span class="rec-title">${book.title}</span>
          <span class="rec-author">${book.author}</span>
        </div>
      </div>
    `
      )
      .join("");

    container.querySelectorAll(".ref-recommend-item").forEach((item) => {
      item.addEventListener("click", () => {
        const id = parseInt(item.dataset.id);
        const book = books.find((b) => b.id === id);
        if (book) {
          addToRecentlyViewed(book);
          showToast(`📖 Opening "${book.title}"...`, "info");
        }
      });
    });
  }

  // 6. SEARCH
  function initSearch() {
    const input = document.getElementById("globalSearchInput");
    const btn = document.getElementById("globalSearchBtn");
    if (!input) return;

    function doSearch() {
      state.searchQuery = input.value;
      state.currentPage = 1;
      renderBooks();
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

  // 7. VIEW TOGGLE
  function initViewToggle() {
    const gridBtn = document.getElementById("viewGridBtn");
    const listBtn = document.getElementById("viewListBtn");
    if (!gridBtn || !listBtn) return;

    gridBtn.addEventListener("click", () => {
      state.viewMode = "grid";
      gridBtn.classList.add("active");
      listBtn.classList.remove("active");
      renderBooks();
    });

    listBtn.addEventListener("click", () => {
      state.viewMode = "list";
      listBtn.classList.add("active");
      gridBtn.classList.remove("active");
      renderBooks();
    });
  }

  // 8. SIDEBAR FILTERS
  function syncSidebarFilters() {
    document.querySelectorAll('#levelFilters input[type="radio"]').forEach((radio) => {
      radio.checked = radio.value === state.activeLevel;
    });
    document.querySelectorAll('#streamFilters input[type="radio"]').forEach((radio) => {
      radio.checked = radio.value === state.activeStream;
    });
    document.querySelectorAll('#standardFilters input[type="radio"]').forEach((radio) => {
      radio.checked = radio.value === state.activeStandard;
    });
  }

  function initSidebarFilters() {
    document.querySelectorAll('#levelFilters input[type="radio"]').forEach((radio) => {
      radio.addEventListener("change", () => {
        if (radio.checked) {
          state.activeLevel = radio.value;
          state.activeStandard = "all";
          state.currentPage = 1;
          renderLevelTabs();
          updateStreamTabsVisibility();
          renderStandardFilters();
          renderBooks();
          updateResultsCount();
          updatePagination();
        }
      });
    });

    document.querySelectorAll('#streamFilters input[type="radio"]').forEach((radio) => {
      radio.addEventListener("change", () => {
        if (radio.checked) {
          state.activeStream = radio.value;
          state.currentPage = 1;
          renderStreamTabs();
          renderBooks();
          updateResultsCount();
          updatePagination();
        }
      });
    });

    document.querySelectorAll("#standardFilters").forEach((container) => {
      container.addEventListener("change", (e) => {
        if (e.target.name === "standardFilter" && e.target.checked) {
          state.activeStandard = e.target.value;
          state.currentPage = 1;
          renderBooks();
          updateResultsCount();
          updatePagination();
        }
      });
    });

    document.querySelectorAll(".ref-filter-clear").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.activeLevel = "all";
        state.activeStream = "all";
        state.activeStandard = "all";
        state.currentPage = 1;
        syncSidebarFilters();
        renderLevelTabs();
        updateStreamTabsVisibility();
        renderStandardFilters();
        renderBooks();
        updateResultsCount();
        updatePagination();
        showToast("✕ Filters cleared", "info");
      });
    });
  }

  // 9. MOBILE FILTER TOGGLE
  function initMobileFilter() {
    const toggle = document.getElementById("mobileFilterToggle");
    const overlay = document.getElementById("mobileFilterOverlay");
    const close = document.getElementById("mobileFilterClose");
    if (!toggle || !overlay) return;

    toggle.addEventListener("click", () => overlay.classList.add("open"));
    if (close) close.addEventListener("click", () => overlay.classList.remove("open"));

    overlay.querySelectorAll('input[name="mLevelFilter"]').forEach((radio) => {
      radio.addEventListener("change", () => {
        if (radio.checked) {
          state.activeLevel = radio.value;
          state.activeStandard = "all";
          state.currentPage = 1;
          renderLevelTabs();
          updateStreamTabsVisibility();
          renderStandardFilters();
          renderBooks();
          updateResultsCount();
          updatePagination();
          syncSidebarFilters();
          setTimeout(() => overlay.classList.remove("open"), 300);
        }
      });
    });

    overlay.querySelectorAll('input[name="mStreamFilter"]').forEach((radio) => {
      radio.addEventListener("change", () => {
        if (radio.checked) {
          state.activeStream = radio.value;
          state.currentPage = 1;
          renderStreamTabs();
          renderBooks();
          updateResultsCount();
          updatePagination();
          syncSidebarFilters();
          setTimeout(() => overlay.classList.remove("open"), 300);
        }
      });
    });

    overlay.querySelectorAll(".ref-filter-clear").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.activeLevel = "all";
        state.activeStream = "all";
        state.activeStandard = "all";
        state.currentPage = 1;
        syncSidebarFilters();
        renderLevelTabs();
        updateStreamTabsVisibility();
        renderStandardFilters();
        renderBooks();
        updateResultsCount();
        updatePagination();
        setTimeout(() => overlay.classList.remove("open"), 300);
      });
    });
  }

  // 10. EXTRA FEATURES
  function initExtraFeatures() {
    document.querySelectorAll(".ref-extra-card").forEach((card) => {
      card.addEventListener("click", () => {
        const title = card.querySelector(".ef-title")?.textContent || "Feature";
        showToast(`🚀 "${title}" — Coming soon!`, "info");
      });
    });
  }

  // 11. UPLOAD SECTION
  function initUpload() {
    const dropZone = document.getElementById("dropZone");
    const fileInput = document.getElementById("fileInput");
    const uploadForm = document.getElementById("uploadForm");
    const submitBtn = document.getElementById("submitUploadBtn");
    const previewBtn = document.getElementById("previewBtn");

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
          fileInput.files = e.dataTransfer.files;
          showToast(`📎 ${e.dataTransfer.files.length} file(s) selected`, "success");
        }
      });

      fileInput.addEventListener("change", () => {
        if (fileInput.files.length > 0) {
          const names = Array.from(fileInput.files)
            .map((f) => f.name)
            .join(", ");
          showToast(`📎 Uploaded: ${names}`, "success");
        }
      });
    }

    if (submitBtn) {
      submitBtn.addEventListener("click", () => {
        const copyrightChecked = document.getElementById("copyrightCheck")?.checked;
        if (!copyrightChecked) {
          showToast("⚠️ Please confirm copyright & license before submitting.", "warning");
          return;
        }
        const title = document.getElementById("uploadTitle")?.value.trim();
        const author = document.getElementById("uploadAuthor")?.value.trim();
        if (!title || !author) {
          showToast("⚠️ Please enter the title and author.", "warning");
          return;
        }
        const level = document.getElementById("uploadLevel")?.value || "secondary";
        const book = {
          id: Date.now(),
          title,
          author,
          edition: document.getElementById("uploadEdition")?.value.trim() || "1st Edition",
          year: String(new Date().getFullYear()),
          level,
          stream: document.getElementById("uploadStream")?.value || "all",
          standard: document.getElementById("uploadStandard")?.value || "",
          subject: document.getElementById("uploadSubject")?.value.trim() || "General",
          isbn: document.getElementById("uploadIsbn")?.value.trim() || "",
          topics: document.getElementById("uploadTags")?.value.trim() ? document.getElementById("uploadTags").value.trim().split(",").map(t => t.trim()).filter(Boolean).slice(0, 4) : ["Community"],
          description: "Uploaded by the community. Review this reference book and add your own notes and highlights.",
          colorIdx: books.length % coverColors.length,
        };
        books.unshift(book);
        persistRefBooks();
        renderBooks();
        updateResultsCount();
        updatePagination();
        updateFilterCounts();
        renderLevelTabs();
        renderStandardFilters();
        showToast("📤 Reference book added to the library!", "success");
        if (uploadForm) uploadForm.reset();
      });
    }

    if (previewBtn) {
      previewBtn.addEventListener("click", () => {
        showToast("👁️ Opening preview of your reference book...", "info");
      });
    }
  }

  // 12. INIT
  function init() {
    updateFilterCounts();
    renderLevelTabs();
    updateStreamTabsVisibility();
    renderStandardFilters();
    renderBooks();
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
    initUpload();
    if (window.ReVenaShared && window.ReVenaShared.initScrollTop) {
      window.ReVenaShared.initScrollTop("scrollTopBtn");
    }
    if (window.ReVenaShared && window.ReVenaShared.initAtomicLogo) {
      window.ReVenaShared.initAtomicLogo("headerAtomicCanvas", 100);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get("search");
    if (searchParam) {
      const searchInput = document.getElementById("globalSearchInput");
      if (searchInput) {
        searchInput.value = searchParam;
        state.searchQuery = searchParam;
        renderBooks();
        updateResultsCount();
        updatePagination();
      }
    }

    console.log("📚 Reference Books initialized —", books.length, "books loaded across 5th Std to TY");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
