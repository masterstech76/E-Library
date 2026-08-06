/**
 * Textbook Library — E-Textbook Library Page
 * Handles: book data, search, filtering, featured carousel,
 * book card rendering, favorites, upload interactions, admin tools
 */
(function () {
  "use strict";

  // ============================================================
  // 1. SAMPLE BOOK DATA
  // ============================================================
  const subjects = [
    { id: "all", label: "All Subjects" },
    { id: "math", label: "Mathematics" },
    { id: "science", label: "Science" },
    { id: "cs", label: "Computer Science" },
    { id: "language", label: "Languages" },
    { id: "history", label: "History & Civics" },
    { id: "commerce", label: "Commerce" },
    { id: "arts", label: "Arts & Humanities" },
  ];

  const grades = ["Grade 9", "Grade 10", "Grade 11", "Grade 12", "Undergraduate"];
  const languages = ["English", "Hindi", "Bengali", "Tamil", "Telugu", "Marathi"];
  const years = ["2026", "2025", "2024", "2023", "2022"];

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
  ];

  const coverIcons = ["📐", "🔬", "💻", "📖", "📜", "📊", "🎨", "🌍", "⚛️", "🧮", "🔭", "📝"];

  const books = [
    {
      id: 1,
      title: "Advanced Mathematics",
      author: "Dr. R. Sharma",
      subject: "math",
      grade: "Grade 11",
      language: "English",
      year: "2025",
      edition: "4th",
      isbn: "978-81-234-5678-9",
      pages: 876,
      progress: 72,
      description: "Comprehensive coverage of algebra, calculus, trigonometry, and statistics for senior secondary students.",
      featured: true,
      icon: "📐",
      colorIdx: 0,
      downloads: 12450,
    },
    {
      id: 2,
      title: "Physics: Principles & Problems",
      author: "Prof. A. Kumar",
      subject: "science",
      grade: "Grade 11",
      language: "English",
      year: "2025",
      edition: "3rd",
      isbn: "978-81-234-5679-6",
      pages: 720,
      progress: 45,
      description: "Mechanics, thermodynamics, waves, optics, and modern physics with solved examples.",
      featured: true,
      icon: "⚛️",
      colorIdx: 1,
      downloads: 9820,
    },
    {
      id: 3,
      title: "Introduction to Python Programming",
      author: "Ms. S. Patel",
      subject: "cs",
      grade: "Grade 12",
      language: "English",
      year: "2026",
      edition: "2nd",
      isbn: "978-81-234-5680-2",
      pages: 540,
      progress: 30,
      description: "Learn Python from scratch — data types, OOP, file handling, and real-world projects.",
      featured: true,
      icon: "💻",
      colorIdx: 2,
      downloads: 15300,
    },
    {
      id: 4,
      title: "English Literature Reader",
      author: "Dr. M. Johnson",
      subject: "language",
      grade: "Grade 10",
      language: "English",
      year: "2024",
      edition: "5th",
      isbn: "978-81-234-5681-9",
      pages: 380,
      progress: 88,
      description: "Prose, poetry, drama, and grammar exercises aligned with CBSE curriculum.",
      featured: true,
      icon: "📖",
      colorIdx: 3,
      downloads: 21100,
    },
    {
      id: 5,
      title: "World History: Modern Era",
      author: "Prof. S. Verma",
      subject: "history",
      grade: "Grade 12",
      language: "English",
      year: "2025",
      edition: "3rd",
      isbn: "978-81-234-5682-6",
      pages: 640,
      progress: 15,
      description: "World wars, cold war, decolonization, and contemporary global issues.",
      featured: true,
      icon: "📜",
      colorIdx: 4,
      downloads: 7650,
    },
    {
      id: 6,
      title: "Chemistry: The Molecular Nature",
      author: "Dr. P. Desai",
      subject: "science",
      grade: "Grade 11",
      language: "English",
      year: "2025",
      edition: "4th",
      isbn: "978-81-234-5683-3",
      pages: 680,
      progress: 55,
      description: "Atomic structure, chemical bonding, thermodynamics, and organic chemistry fundamentals.",
      featured: false,
      icon: "🔬",
      colorIdx: 5,
      downloads: 11300,
    },
    {
      id: 7,
      title: "Business Studies for Class 12",
      author: "Dr. N. Agarwal",
      subject: "commerce",
      grade: "Grade 12",
      language: "English",
      year: "2025",
      edition: "3rd",
      isbn: "978-81-234-5684-0",
      pages: 520,
      progress: 10,
      description: "Principles of management, marketing, finance, and business environment.",
      featured: false,
      icon: "📊",
      colorIdx: 6,
      downloads: 8900,
    },
    {
      id: 8,
      title: "Data Structures & Algorithms",
      author: "Prof. K. Singh",
      subject: "cs",
      grade: "Undergraduate",
      language: "English",
      year: "2026",
      edition: "2nd",
      isbn: "978-81-234-5685-7",
      pages: 780,
      progress: 25,
      description: "Arrays, linked lists, trees, graphs, sorting, searching, and dynamic programming.",
      featured: false,
      icon: "🧮",
      colorIdx: 7,
      downloads: 18700,
    },
    {
      id: 9,
      title: "Hindi Sahitya Sangam",
      author: "Dr. V. Tiwari",
      subject: "language",
      grade: "Grade 10",
      language: "Hindi",
      year: "2024",
      edition: "6th",
      isbn: "978-81-234-5686-4",
      pages: 340,
      progress: 60,
      description: "Collection of Hindi prose, poetry, and grammar for secondary students.",
      featured: false,
      icon: "📖",
      colorIdx: 8,
      downloads: 14200,
    },
    {
      id: 10,
      title: "Biology: The Living World",
      author: "Dr. L. Mehta",
      subject: "science",
      grade: "Grade 11",
      language: "English",
      year: "2025",
      edition: "4th",
      isbn: "978-81-234-5687-1",
      pages: 760,
      progress: 35,
      description: "Cell biology, genetics, evolution, ecology, and human physiology.",
      featured: false,
      icon: "🔭",
      colorIdx: 9,
      downloads: 13100,
    },
    {
      id: 11,
      title: "Calculus for Engineers",
      author: "Prof. R. N. Rao",
      subject: "math",
      grade: "Undergraduate",
      language: "English",
      year: "2026",
      edition: "3rd",
      isbn: "978-81-234-5688-8",
      pages: 620,
      progress: 0,
      description: "Limits, derivatives, integrals, series, and multivariable calculus with applications.",
      featured: false,
      icon: "📐",
      colorIdx: 10,
      downloads: 9400,
    },
    {
      id: 12,
      title: "Indian Art & Culture",
      author: "Dr. S. Banerjee",
      subject: "arts",
      grade: "Grade 12",
      language: "English",
      year: "2024",
      edition: "2nd",
      isbn: "978-81-234-5689-5",
      pages: 440,
      progress: 42,
      description: "Indian painting, sculpture, architecture, music, dance, and cultural heritage.",
      featured: false,
      icon: "🎨",
      colorIdx: 11,
      downloads: 5600,
    },
    {
      id: 13,
      title: "Algebraic Structures",
      author: "Prof. A. Gupta",
      subject: "math",
      grade: "Undergraduate",
      language: "English",
      year: "2025",
      edition: "2nd",
      isbn: "978-81-234-5690-1",
      pages: 480,
      progress: 5,
      description: "Groups, rings, fields, vector spaces, and linear algebra with proofs.",
      featured: false,
      icon: "🧮",
      colorIdx: 0,
      downloads: 7200,
    },
    {
      id: 14,
      title: "Environmental Science",
      author: "Dr. M. Chaudhary",
      subject: "science",
      grade: "Grade 10",
      language: "English",
      year: "2024",
      edition: "3rd",
      isbn: "978-81-234-5691-8",
      pages: 320,
      progress: 78,
      description: "Ecosystems, biodiversity, pollution, climate change, and sustainable development.",
      featured: false,
      icon: "🌍",
      colorIdx: 1,
      downloads: 10500,
    },
    {
      id: 15,
      title: "Sanskrit Praveshika",
      author: "Dr. G. Shastri",
      subject: "language",
      grade: "Grade 9",
      language: "Hindi",
      year: "2024",
      edition: "7th",
      isbn: "978-81-234-5692-5",
      pages: 280,
      progress: 90,
      description: "Basic Sanskrit grammar, translations, and introductory prose & poetry.",
      featured: false,
      icon: "📖",
      colorIdx: 2,
      downloads: 8100,
    },
    {
      id: 16,
      title: "Database Management Systems",
      author: "Prof. S. K. Jain",
      subject: "cs",
      grade: "Undergraduate",
      language: "English",
      year: "2026",
      edition: "4th",
      isbn: "978-81-234-5693-2",
      pages: 590,
      progress: 12,
      description: "ER models, SQL, normalization, transaction processing, and NoSQL databases.",
      featured: false,
      icon: "💻",
      colorIdx: 3,
      downloads: 12300,
    },
  ];

  // ============================================================
  // 2. STATE
  // ============================================================
  let state = {
    activeSubject: "all",
    searchQuery: "",
    viewMode: "grid", // 'grid' or 'list'
    currentPage: 1,
    pageSize: 12,
    favorites: JSON.parse(localStorage.getItem("tlfavorites") || "[]"),
    recentlyViewed: JSON.parse(localStorage.getItem("tlrecently") || "[]"),
  };

  // ============================================================
  // 3. UTILITY FUNCTIONS
  // ============================================================
  function getFilteredBooks() {
    let result = [...books];

    // Subject filter
    if (state.activeSubject !== "all") {
      result = result.filter((b) => b.subject === state.activeSubject);
    }

    // Search filter
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.trim().toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.subject.toLowerCase().includes(q) ||
          b.isbn.includes(q)
      );
    }

    return result;
  }

  function getFeaturedBooks() {
    return books.filter((b) => b.featured);
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
    const idx = book.colorIdx !== undefined ? book.colorIdx : book.id % coverIcons.length;
    return book.icon || coverIcons[idx];
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
    localStorage.setItem("tlfavorites", JSON.stringify(state.favorites));
    renderFavorites();
    renderBooks(); // re-render to update bookmark icons
    showToast(isFavorited(bookId) ? "⭐ Added to favorites" : "🗑️ Removed from favorites", "success");
  }

  function addToRecentlyViewed(book) {
    state.recentlyViewed = state.recentlyViewed.filter((id) => id !== book.id);
    state.recentlyViewed.unshift(book.id);
    if (state.recentlyViewed.length > 5) {
      state.recentlyViewed.pop();
    }
    localStorage.setItem("tlrecently", JSON.stringify(state.recentlyViewed));
    renderRecentlyViewed();
  }

  function showToast(message, type) {
    type = type || "info";
    const container = document.getElementById("toastContainer");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = "toast " + type;
    const iconMap = { success: "✅", error: "❌", warning: "⚠️", info: "ℹ️" };
    toast.innerHTML = `<span>${iconMap[type] || "ℹ️"}</span> ${message}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  // ============================================================
  // 4. RENDER FUNCTIONS
  // ============================================================

  // Featured Carousel
  function renderFeatured() {
    const slider = document.getElementById("featuredSlider");
    if (!slider) return;
    const featured = getFeaturedBooks();
    slider.innerHTML = featured
      .map(
        (book) => `
      <div class="featured-slide" data-id="${book.id}">
        <div class="fs-cover" style="background:${getCoverStyle(book)}">
          ${getCoverIcon(book)}
        </div>
        <div class="fs-info">
          <span class="fs-title">${book.title}</span>
          <span class="fs-author">${book.author}</span>
          <span class="fs-meta">${book.edition} • ${book.year} • ${book.pages} pages</span>
          <span class="fs-badge">${subjects.find((s) => s.id === book.subject)?.label || book.subject}</span>
        </div>
      </div>
    `
      )
      .join("");

    // Click to open
    slider.querySelectorAll(".featured-slide").forEach((el) => {
      el.addEventListener("click", () => {
        const id = parseInt(el.dataset.id);
        const book = books.find((b) => b.id === id);
        if (book) {
          addToRecentlyViewed(book);
          showToast(`📖 Opening "${book.title}"...`, "info");
        }
      });
    });
  }

  // Subject Tabs
  function renderSubjectTabs() {
    const container = document.getElementById("subjectTabs");
    if (!container) return;
    container.innerHTML = subjects
      .map(
        (s) => `
      <button class="subject-tab ${state.activeSubject === s.id ? "active" : ""}" data-subject="${s.id}">
        ${s.label}
      </button>
    `
      )
      .join("");

    container.querySelectorAll(".subject-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.activeSubject = btn.dataset.subject;
        state.currentPage = 1;
        renderSubjectTabs();
        renderBooks();
        updateResultsCount();
        updatePagination();
      });
    });
  }

  // Book Grid
  function renderBooks() {
    const container = document.getElementById("bookGrid");
    if (!container) return;
    const filtered = getFilteredBooks();
    const paginated = getPaginatedBooks(filtered);

    container.className = `book-grid ${state.viewMode === "list" ? "list-view" : ""}`;

    if (paginated.length === 0) {
      container.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:60px 20px;">
          <span style="font-size:3rem; display:block; margin-bottom:12px;">📚</span>
          <h3 style="color:var(--text-primary); margin-bottom:6px;">No textbooks found</h3>
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
      <div class="book-card" data-id="${book.id}">
        <div class="bc-cover" style="background:${getCoverStyle(book)}">
          ${getCoverIcon(book)}
          <div class="bc-cover-overlay">
            <a href="#" class="cover-action-btn preview-btn">👁️ Preview</a>
            <button class="cover-action-btn download-btn">⬇️ Download</button>
          </div>
        </div>
        <div class="bc-body">
          <span class="bc-title" title="${book.title}">${book.title}</span>
          <span class="bc-author">${book.author}</span>
          <div class="bc-meta">
            <span>${book.edition}</span>
            <span>${book.year}</span>
            <span>${book.pages}p</span>
          </div>
          <p class="bc-desc">${book.description}</p>
          <div class="bc-progress">
            <div class="progress-track">
              <div class="progress-fill" style="width:${book.progress}%"></div>
            </div>
            <span class="progress-label">${book.progress}%</span>
          </div>
          <div class="bc-actions">
            <a href="#" class="bc-action-primary">📖 Read Now</a>
            <button class="bc-action-secondary borrow-btn">📋 Borrow</button>
            <button class="bc-action-icon bookmark-btn" title="${isFavorited(book.id) ? "Remove from favorites" : "Add to favorites"}">
              ${isFavorited(book.id) ? "⭐" : "🔖"}
            </button>
          </div>
        </div>
      </div>
    `
      )
      .join("");

    // Attach events
    container.querySelectorAll(".book-card").forEach((card) => {
      const id = parseInt(card.dataset.id);
      const book = books.find((b) => b.id === id);
      if (!book) return;

      // Read
      card.querySelector(".bc-action-primary")?.addEventListener("click", (e) => {
        e.preventDefault();
        addToRecentlyViewed(book);
        showToast(`📖 Opening "${book.title}" in reader...`, "info");
      });

      // Preview
      card.querySelector(".preview-btn")?.addEventListener("click", (e) => {
        e.preventDefault();
        showToast(`👁️ Previewing "${book.title}"...`, "info");
      });

      // Download
      card.querySelector(".download-btn")?.addEventListener("click", () => {
        showToast(`⬇️ Downloading "${book.title}"...`, "success");
      });

      // Borrow
      card.querySelector(".borrow-btn")?.addEventListener("click", () => {
        showToast(`📋 You borrowed "${book.title}" — due in 14 days`, "success");
      });

      // Bookmark / Favorite
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
    el.textContent = `Showing ${count} textbook${count !== 1 ? "s" : ""}`;
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
      <div class="fav-item" data-id="${book.id}">
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
      const item = btn.closest(".fav-item");
      const id = parseInt(item.dataset.id);
      btn.addEventListener("click", () => toggleFavorite(id));
    });

    container.querySelectorAll(".fav-item").forEach((item) => {
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
      <div class="recent-item" data-id="${book.id}">
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

    container.querySelectorAll(".recent-item").forEach((item) => {
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
    // Simple recommendation: random 3 books not in favorites
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
      <div class="recommend-item" data-id="${book.id}">
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

    container.querySelectorAll(".recommend-item").forEach((item) => {
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

  // ============================================================
  // 5. SEARCH
  // ============================================================
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

  // ============================================================
  // 6. VIEW TOGGLE
  // ============================================================
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

  // ============================================================
  // 7. FEATURED CAROUSEL NAV
  // ============================================================
  function initCarouselNav() {
    const prev = document.getElementById("carouselPrev");
    const next = document.getElementById("carouselNext");
    const slider = document.getElementById("featuredSlider");
    if (!prev || !next || !slider) return;

    const scrollAmount = 320;
    prev.addEventListener("click", () => {
      slider.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    });
    next.addEventListener("click", () => {
      slider.scrollBy({ left: scrollAmount, behavior: "smooth" });
    });
  }

  // ============================================================
  // 8. UPLOAD SECTION
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

    // Submit
    if (submitBtn) {
      submitBtn.addEventListener("click", () => {
        const copyrightChecked = document.getElementById("copyrightCheck")?.checked;
        if (!copyrightChecked) {
          showToast("⚠️ Please confirm copyright & license before submitting.", "warning");
          return;
        }
        showToast("📤 Textbook submitted for approval! Admin will review shortly.", "success");
        if (uploadForm) uploadForm.reset();
      });
    }

    // Preview
    if (previewBtn) {
      previewBtn.addEventListener("click", () => {
        showToast("👁️ Opening preview of your textbook...", "info");
      });
    }
  }

  // ============================================================
  // 9. ADMIN TOOLS
  // ============================================================
  function initAdminTools() {
    document.querySelectorAll(".admin-tool-card").forEach((card) => {
      card.addEventListener("click", () => {
        const label = card.querySelector(".at-label")?.textContent || "Tool";
        showToast(`🚀 "${label}" — Admin feature coming soon!`, "info");
      });
    });
  }

  // ============================================================
  // 10. EXTRA FEATURES
  // ============================================================
  function initExtraFeatures() {
    document.querySelectorAll(".extra-feature-card").forEach((card) => {
      card.addEventListener("click", () => {
        const title = card.querySelector(".ef-title")?.textContent || "Feature";
        showToast(`🚀 "${title}" — Coming soon!`, "info");
      });
    });
  }

  // ============================================================
  // 11. SIDEBAR FILTER RADIOS
  // ============================================================
  function initSidebarFilters() {
    // Wire subject filter radios in the sidebar
    document.querySelectorAll('#subjectFilters input[type="radio"]').forEach((radio) => {
      radio.addEventListener("change", () => {
        if (radio.checked) {
          state.activeSubject = radio.value;
          state.currentPage = 1;
          renderSubjectTabs();
          renderBooks();
          updateResultsCount();
          updatePagination();
        }
      });
    });

    // Wire clear filters button
    document.querySelectorAll(".filter-clear").forEach((btn) => {
      btn.addEventListener("click", () => {
        // Reset subject to "all"
        document.querySelectorAll('#subjectFilters input[type="radio"]').forEach((r) => {
          if (r.value === "all") r.checked = true;
        });
        state.activeSubject = "all";
        state.currentPage = 1;
        renderSubjectTabs();
        renderBooks();
        updateResultsCount();
        updatePagination();
        showToast("✕ Filters cleared", "info");
      });
    });
  }

  // ============================================================
  // 12. MOBILE FILTER TOGGLE
  // ============================================================
  function initMobileFilter() {
    const toggle = document.getElementById("mobileFilterToggle");
    const overlay = document.getElementById("mobileFilterOverlay");
    const close = document.getElementById("mobileFilterClose");
    if (!toggle || !overlay) return;

    toggle.addEventListener("click", () => overlay.classList.add("open"));
    if (close) close.addEventListener("click", () => overlay.classList.remove("open"));

    // Wire mobile overlay subject radios
    overlay.querySelectorAll('input[name="mSubjectFilter"]').forEach((radio) => {
      radio.addEventListener("change", () => {
        if (radio.checked) {
          state.activeSubject = radio.value;
          state.currentPage = 1;
          renderSubjectTabs();
          renderBooks();
          updateResultsCount();
          updatePagination();
          // Sync the sidebar radio too
          document.querySelectorAll('#subjectFilters input[type="radio"]').forEach((r) => {
            if (r.value === radio.value) r.checked = true;
          });
          setTimeout(() => overlay.classList.remove("open"), 300);
        }
      });
    });

    overlay.querySelectorAll(".filter-clear").forEach((btn) => {
      btn.addEventListener("click", () => {
        overlay.querySelectorAll('input[name="mSubjectFilter"]').forEach((r) => {
          if (r.value === "all") r.checked = true;
        });
        document.querySelectorAll('#subjectFilters input[type="radio"]').forEach((r) => {
          if (r.value === "all") r.checked = true;
        });
        state.activeSubject = "all";
        state.currentPage = 1;
        renderSubjectTabs();
        renderBooks();
        updateResultsCount();
        updatePagination();
        setTimeout(() => overlay.classList.remove("open"), 300);
      });
    });
  }

  // ============================================================
  // 13. ATOMIC LOGO — for header & footer canvases
  // ============================================================
  function initAtomicLogo(canvasId, size) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });

    let W = size || 100, H = size || 100;

    function resize() {
      const dpr = Math.max(1, Math.min(2.5, window.devicePixelRatio || 1));
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const TAU = Math.PI * 2;
    const lerp = (a, b, t) => a + (b - a) * t;
    const eColors = [
      { core: "#9bffea", glow: "rgba(64, 255, 232, 0.75)" },
      { core: "#b2a3ff", glow: "rgba(160, 120, 255, 0.75)" },
    ];
    const nucColor = "#9ae6ff";
    const nucGlow = "rgba(40, 220, 255, 0.55)";

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

    let t0 = performance.now();

    function drawFrame(t) {
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2;
      const tilt = 0.75;
      const r1 = Math.round(size * 0.33), r2 = Math.round(size * 0.48);

      strokeGlow(() => ellipsePath(ctx, r1, Math.round(r1 * 0.62), cx, cy, tilt), "rgba(120,255,245,0.35)", "rgba(60,255,232,0.28)", 1.5, 8);
      strokeGlow(() => ellipsePath(ctx, r2, Math.round(r2 * 0.52), cx, cy, tilt), "rgba(210,180,255,0.30)", "rgba(150,110,255,0.26)", 1.5, 8);

      const pulse = 0.5 + 0.5 * Math.sin(t * 0.004);
      const nr = lerp(Math.round(size * 0.09), Math.round(size * 0.11), pulse);
      strokeGlow(() => { ctx.beginPath(); ctx.arc(cx, cy, nr, 0, TAU); }, "rgba(155,230,255,0.85)", "rgba(20,190,255,0.65)", 2, 6);
      glowCircle(cx, cy, nr, nucColor, nucGlow, 1.1);

      for (let i = 0; i < 2; i++) {
        const speed = i === 0 ? 0.0029 : 0.0022;
        const angle = t * speed + (i === 0 ? 0 : Math.PI / 2);
        const rx = i === 0 ? r1 : r2;
        const ry = i === 0 ? Math.round(r1 * 0.62) : Math.round(r2 * 0.52);
        const ex = rx * Math.cos(angle);
        const ey = ry * Math.sin(angle);
        const cosT = Math.cos(tilt), sinT = Math.sin(tilt);
        const persp = 1 - 0.12 * (Math.sin(angle) * 0.5 + 0.5);
        const px = ex * persp;
        const py = ey * cosT + ey * sinT * 0.15;
        const col = eColors[i];
        const wob = 0.6 + 0.4 * Math.sin(t * 0.01 + i * 2);
        const r = Math.round(size * 0.035) * (0.85 + 0.35 * wob);
        glowCircle(cx + px, cy + py, r, col.core, col.glow, 1.0);
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
  // 14. SCROLL TO TOP
  // ============================================================
  function initScrollToTop() {
    const btn = document.getElementById("scrollTopBtn");
    if (!btn) return;

    window.addEventListener("scroll", () => {
      if (window.scrollY > 400) {
        btn.classList.add("visible");
      } else {
        btn.classList.remove("visible");
      }
    }, { passive: true });

    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // ============================================================
  // 15. INIT
  // ============================================================
  function init() {
    renderSubjectTabs();
    renderFeatured();
    renderBooks();
    updateResultsCount();
    updatePagination();
    renderFavorites();
    renderRecentlyViewed();
    renderRecommendations();
    initSearch();
    initViewToggle();
    initCarouselNav();
    initUpload();
    initAdminTools();
    initExtraFeatures();
    initMobileFilter();
    initSidebarFilters();
    initAtomicLogo("headerAtomicCanvas", 100);
    initScrollToTop();

    // Initial search from URL param (optional)
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

    console.log("📚 Textbook Library initialized —", books.length, "textbooks loaded");
  }

  // Run on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

