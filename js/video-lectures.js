/**
 * Classroom Video Lectures — Complete YouTube-style E-Library Player
 * Features: Browse, Live, Upload, Analytics, Admin, Player Controls,
 * Notes, Comments, Q&A, Favorites, Bookmarks, Share, Notifications, Accessibility
 */
(function () {
  "use strict";

  // ============================================================
  // SAMPLE DATA
  // ============================================================
  const subjects = [
    { id: "all", label: "All Subjects", icon: "🎯" },
    { id: "math", label: "Mathematics", icon: "📐" },
    { id: "science", label: "Science", icon: "🔬" },
    { id: "cs", label: "Computer Science", icon: "💻" },
    { id: "language", label: "Languages", icon: "📖" },
    { id: "history", label: "History & Civics", icon: "📜" },
    { id: "commerce", label: "Commerce", icon: "📊" },
    { id: "arts", label: "Arts & Humanities", icon: "🎨" },
  ];

  const lectures = [
    { id: 1, title: "Newton's Laws of Motion", lecturer: "Prof. A. Kumar", subject: "science", duration: "42:15", views: 15420, progress: 72, grade: "11", description: "Comprehensive explanation of Newton's three laws with real-world examples and problem-solving techniques.", colorIdx: 0, topic: "Physics", tags: ["mechanics", "physics", "NCERT"] },
    { id: 2, title: "Calculus — Limits & Continuity", lecturer: "Dr. R. Sharma", subject: "math", duration: "55:30", views: 12300, progress: 45, grade: "12", description: "Introduction to limits, continuity, and the foundation of differential calculus.", colorIdx: 1, topic: "Calculus", tags: ["calculus", "limits", "math"] },
    { id: 3, title: "Python Programming Basics", lecturer: "Ms. S. Patel", subject: "cs", duration: "38:20", views: 21300, progress: 30, grade: "ug", description: "Learn Python from scratch — variables, data types, loops, and functions.", colorIdx: 2, topic: "Programming", tags: ["python", "coding", "beginner"] },
    { id: 4, title: "Shakespeare's Hamlet — Analysis", lecturer: "Dr. M. Johnson", subject: "language", duration: "48:10", views: 8700, progress: 88, grade: "11", description: "Deep analysis of Hamlet's themes, characters, and literary devices.", colorIdx: 3, topic: "Literature", tags: ["shakespeare", "literature", "drama"] },
    { id: 5, title: "World War II — Causes & Consequences", lecturer: "Prof. S. Verma", subject: "history", duration: "61:45", views: 11200, progress: 15, grade: "12", description: "Detailed overview of WWII causes, major events, and global impact.", colorIdx: 4, topic: "Modern History", tags: ["history", "WWII", "world war"] },
    { id: 6, title: "Chemical Bonding — VSEPR Theory", lecturer: "Dr. P. Desai", subject: "science", duration: "44:00", views: 9800, progress: 55, grade: "11", description: "Molecular geometry, VSEPR theory, and bond angles explained.", colorIdx: 5, topic: "Chemistry", tags: ["chemistry", "bonding", "VSEPR"] },
    { id: 7, title: "Linear Algebra — Matrices", lecturer: "Prof. A. Gupta", subject: "math", duration: "52:30", views: 13500, progress: 25, grade: "ug", description: "Matrix operations, determinants, eigenvalues, and applications.", colorIdx: 6, topic: "Algebra", tags: ["algebra", "matrices", "linear"] },
    { id: 8, title: "Data Structures — Trees & Graphs", lecturer: "Prof. K. Singh", subject: "cs", duration: "67:20", views: 18700, progress: 12, grade: "ug", description: "Binary trees, BST, graph traversals, and shortest path algorithms.", colorIdx: 7, topic: "Data Structures", tags: ["DSA", "trees", "graphs"] },
    { id: 9, title: "French Grammar — Le Passé Composé", lecturer: "Mme. L. Blanc", subject: "language", duration: "32:15", views: 5400, progress: 60, grade: "10", description: "Learn the passé composé tense with conjugation rules and examples.", colorIdx: 8, topic: "Grammar", tags: ["french", "grammar", "language"] },
    { id: 10, title: "Cell Biology — Mitosis & Meiosis", lecturer: "Dr. L. Mehta", subject: "science", duration: "46:40", views: 12100, progress: 35, grade: "11", description: "Cell division processes, phases of mitosis and meiosis, and comparison.", colorIdx: 9, topic: "Biology", tags: ["biology", "cell", "mitosis"] },
    { id: 11, title: "Indian Constitution — Fundamental Rights", lecturer: "Prof. S. Verma", subject: "history", duration: "39:50", views: 7600, progress: 42, grade: "12", description: "Fundamental rights, duties, and constitutional amendments.", colorIdx: 10, topic: "Civics", tags: ["constitution", "civics", "rights"] },
    { id: 12, title: "Marketing Management Essentials", lecturer: "Dr. N. Agarwal", subject: "commerce", duration: "41:10", views: 8900, progress: 10, grade: "12", description: "4Ps of marketing, market segmentation, branding, and consumer behavior.", colorIdx: 11, topic: "Business", tags: ["marketing", "commerce", "business"] },
    { id: 13, title: "Renaissance Art & Architecture", lecturer: "Dr. S. Banerjee", subject: "arts", duration: "53:25", views: 6300, progress: 78, grade: "ug", description: "Italian Renaissance, Michelangelo, Da Vinci, and architectural marvels.", colorIdx: 0, topic: "Art History", tags: ["renaissance", "art", "architecture"] },
  ];

  const liveLectures = [
    { id: "l1", title: "Live: Calculus Revision — Derivatives", lecturer: "Dr. R. Sharma", subject: "math", viewers: 342, status: "live", startTime: null },
    { id: "l2", title: "Python OOP Concepts Live", lecturer: "Ms. S. Patel", subject: "cs", viewers: 189, status: "live", startTime: null },
    { id: "l3", title: "Cell Biology Q&A Session", lecturer: "Dr. L. Mehta", subject: "science", viewers: 256, status: "live", startTime: null },
    { id: "l4", title: "Shakespeare — Macbeth Analysis", lecturer: "Dr. M. Johnson", subject: "language", viewers: 0, status: "upcoming", startTime: "Tomorrow 10:00 AM" },
    { id: "l5", title: "Matrix Operations Deep Dive", lecturer: "Prof. A. Gupta", subject: "math", viewers: 0, status: "upcoming", startTime: "Fri 2:00 PM" },
    { id: "l6", title: "Indian Economy Overview", lecturer: "Dr. N. Agarwal", subject: "commerce", viewers: 0, status: "upcoming", startTime: "Mon 11:30 AM" },
  ];

  const chapters = {
    1: [
      { title: "Introduction to Forces", time: "0:00" },
      { title: "Newton's First Law", time: "8:30" },
      { title: "Second Law & F=ma", time: "18:45" },
      { title: "Third Law — Action/Reaction", time: "30:00" },
      { title: "Problem Solving", time: "38:00" },
    ],
    2: [
      { title: "What is a Limit?", time: "0:00" },
      { title: "Limit Laws", time: "12:20" },
      { title: "Continuity", time: "28:00" },
      { title: "Intermediate Value Theorem", time: "42:00" },
    ],
  };

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

  const thumbIcons = ["⚛️", "📐", "💻", "📖", "📜", "🔬", "🧮", "🔭", "🗼", "🧬", "🏛️", "📊", "🎨"];

  const sampleComments = [
    { author: "Student_A", text: "This lecture was incredibly helpful! The examples made it so clear.", time: "2 days ago" },
    { author: "MathLover99", text: "Could you please cover more practice problems in the next session?", time: "1 day ago" },
    { author: "exam_prep_2026", text: "I've been stuck on this topic for weeks. Thank you for this!", time: "12 hours ago" },
  ];

  const sampleQnA = [
    { question: "Is there a PDF of the slides available?", answer: "Yes, check the resources section below the video.", author: "Student_X", time: "1 day ago" },
    { question: "Can you explain the third law again?", answer: null, author: "CuriousLearner", time: "5 hours ago" },
  ];

  // ============================================================
  // STATE
  // ============================================================
  let state = {
    activeSection: "browse",
    activeSubject: "all",
    activeGrade: "all",
    searchQuery: "",
    currentLecture: null,
    favorites: JSON.parse(localStorage.getItem("vlfavorites") || "[]"),
    recentlyWatched: JSON.parse(localStorage.getItem("vlrecently") || "[]"),
    bookmarks: JSON.parse(localStorage.getItem("vlbookmarks") || "[]"),
    comments: JSON.parse(localStorage.getItem("vlcomments") || JSON.stringify(sampleComments)),
    qna: JSON.parse(localStorage.getItem("vlqna") || JSON.stringify(sampleQnA)),
    isPlaying: false,
    currentTime: 0,
    totalTime: 0,
    speed: 1,
    volume: 1,
    liked: {},
    likeCounts: JSON.parse(localStorage.getItem("vllikes") || "{}"),
    pendingUploads: JSON.parse(localStorage.getItem("vlpending") || "[]"),
    auditLogs: JSON.parse(localStorage.getItem("vlaudit") || "[]"),
    notifications: JSON.parse(localStorage.getItem("vlnotifs") || JSON.stringify([
      { id: "n1", icon: "🎬", title: "New lecture uploaded: Python OOP", time: "2 hours ago", read: false },
      { id: "n2", icon: "✅", title: "Your upload 'Calculus Review' was approved", time: "1 day ago", read: false },
      { id: "n3", icon: "🔴", title: "Live session: Calculus Revision starting now", time: "3 hours ago", read: true },
    ])),
    analyticsViews: parseInt(localStorage.getItem("vlanalyticsViews") || "152340"),
    analyticsEngagement: parseInt(localStorage.getItem("vlanalyticsEng") || "78"),
    accessFontSize: 16,
    highContrast: false,
    captionsOn: false,
    ttsOn: false,
  };

  // ============================================================
  // HELPERS
  // ============================================================
  function getFilteredLectures() {
    let result = [...lectures];
    if (state.activeSubject !== "all") {
      result = result.filter((l) => l.subject === state.activeSubject);
    }
    if (state.activeGrade !== "all") {
      result = result.filter((l) => l.grade === state.activeGrade);
    }
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.trim().toLowerCase();
      result = result.filter((l) =>
        l.title.toLowerCase().includes(q) ||
        l.lecturer.toLowerCase().includes(q) ||
        l.subject.toLowerCase().includes(q) ||
        l.topic.toLowerCase().includes(q) ||
        l.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return result;
  }

  function getSubjectLabel(id) {
    const s = subjects.find((s) => s.id === id);
    return s ? s.label : id;
  }

  function getSubjectIcon(id) {
    const s = subjects.find((s) => s.id === id);
    return s ? s.icon : "📚";
  }

  function getColor(idx) {
    return coverColors[idx % coverColors.length];
  }

  function getIcon(idx) {
    return thumbIcons[idx % thumbIcons.length];
  }

  function isFav(id) {
    return state.favorites.includes(id);
  }

  function isBookmarked(id) {
    return state.bookmarks.includes(id);
  }

  function showToast(msg, type) {
    type = type || "info";
    const c = document.getElementById("toastContainer");
    if (!c) return;
    const t = document.createElement("div");
    t.className = "toast " + type;
    const icons = { success: "✅", error: "❌", warning: "⚠️", info: "ℹ️" };
    t.innerHTML = `<span>${icons[type] || "ℹ️"}</span> ${msg}`;
    c.appendChild(t);
    setTimeout(() => t.remove(), 4000);
  }

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
  }

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  // ============================================================
  // SECTION TABS
  // ============================================================
  function initSectionTabs() {
    document.querySelectorAll(".vl-section-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".vl-section-tab").forEach((t) => t.classList.remove("active"));
        document.querySelectorAll(".vl-section-content").forEach((s) => s.style.display = "none");
        tab.classList.add("active");
        const section = document.getElementById("section" + tab.dataset.section.charAt(0).toUpperCase() + tab.dataset.section.slice(1));
        if (section) section.style.display = "block";
        state.activeSection = tab.dataset.section;
        if (state.activeSection === "live") renderLiveLectures();
        if (state.activeSection === "analytics") renderAnalytics();
        if (state.activeSection === "admin") renderAdmin();
      });
    });
  }

  // ============================================================
  // SUBJECT & GRADE FILTERS
  // ============================================================
  function initFilters() {
    const sel = document.getElementById("subjectDropdown");
    if (sel) {
      sel.addEventListener("change", () => {
        state.activeSubject = sel.value;
        state.currentLecture = null;
        resetPlayer();
        renderPlaylist();
        updateResultsCount();
      });
    }

    document.querySelectorAll(".vl-filter-tag").forEach((tag) => {
      tag.addEventListener("click", () => {
        document.querySelectorAll(".vl-filter-tag").forEach((t) => t.classList.remove("active"));
        tag.classList.add("active");
        state.activeGrade = tag.dataset.grade;
        state.currentLecture = null;
        resetPlayer();
        renderPlaylist();
        updateResultsCount();
      });
    });
  }

  function updateResultsCount() {
    const el = document.getElementById("resultsCount");
    if (!el) return;
    const count = getFilteredLectures().length;
    const sub = getSubjectLabel(state.activeSubject);
    el.textContent = count + " lecture" + (count !== 1 ? "s" : "") + " in " + sub;
  }

  // ============================================================
  // SEARCH
  // ============================================================
  function initSearch() {
    const input = document.getElementById("globalSearchInput");
    const btn = document.getElementById("globalSearchBtn");
    if (!input) return;
    function doSearch() {
      state.searchQuery = input.value;
      state.currentLecture = null;
      resetPlayer();
      renderPlaylist();
      updateResultsCount();
    }
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") doSearch(); });
    if (btn) btn.addEventListener("click", doSearch);
  }

  // ============================================================
  // RESET PLAYER
  // ============================================================
  function resetPlayer() {
    const player = document.getElementById("videoPlayerContainer");
    if (player) {
      player.innerHTML = `
        <div class="vl-player-placeholder">
          <span class="vpp-icon">🎬</span>
          <span class="vpp-title">Select a lecture to watch</span>
          <span class="vpp-sub">Choose from the playlist on the right</span>
        </div>
      `;
      player.style.cursor = "default";
      player.onclick = null;
    }
    if (intervalId) { clearInterval(intervalId); intervalId = null; }
    state.isPlaying = false;
    const pp = document.getElementById("playPauseBtn");
    if (pp) pp.textContent = "▶";
    const pf = document.getElementById("progressFillVideo");
    if (pf) pf.style.width = "0%";
    const td = document.getElementById("timeDisplay");
    if (td) td.textContent = "00:00 / 00:00";
    document.getElementById("videoTitle").textContent = "Select a Lecture";
    document.getElementById("videoLecturer").textContent = "👨‍🏫 —";
    document.getElementById("videoSubject").textContent = "📚 —";
    document.getElementById("videoDuration").textContent = "⏱️ —";
    document.getElementById("videoViews").textContent = "👁️ —";
    document.getElementById("videoGrade").textContent = "🎓 —";
    document.getElementById("videoDescription").textContent = "Choose a lecture from the playlist to start learning.";
    const cc = document.getElementById("chaptersContainer");
    if (cc) cc.style.display = "none";
  }

  // ============================================================
  // RENDER PLAYLIST
  // ============================================================
  function renderPlaylist() {
    const container = document.getElementById("playlistContainer");
    if (!container) return;
    const filtered = getFilteredLectures();
    const count = document.getElementById("playlistCount");
    if (count) count.textContent = filtered.length + " video" + (filtered.length !== 1 ? "s" : "");

    if (filtered.length === 0) {
      container.innerHTML = `<p class="vl-muted" style="padding:16px;text-align:center;">No lectures match your search.</p>`;
      return;
    }

    container.innerHTML = filtered.map((lec) => {
      const active = state.currentLecture && state.currentLecture.id === lec.id ? "active" : "";
      const pct = lec.progress || 0;
      return `
        <div class="vl-playlist-item ${active}" data-id="${lec.id}">
          <div class="vl-playlist-thumb" style="background:${getColor(lec.colorIdx)}">
            ${getIcon(lec.colorIdx)}
            <span class="pl-duration">${lec.duration}</span>
            ${isFav(lec.id) ? '<span class="pl-badge">⭐</span>' : ""}
          </div>
          <div class="vl-playlist-info">
            <span class="pl-title">${lec.title}</span>
            <span class="pl-lecturer">${lec.lecturer}</span>
            <span class="pl-meta">${lec.views.toLocaleString()} views • ${getSubjectLabel(lec.subject)}</span>
            <div class="pl-progress">
              <div class="pl-bar"><div class="pl-fill" style="width:${pct}%"></div></div>
              <span class="pl-pct">${pct}%</span>
            </div>
          </div>
        </div>
      `;
    }).join("");

    container.querySelectorAll(".vl-playlist-item").forEach((el) => {
      el.addEventListener("click", () => {
        const id = parseInt(el.dataset.id);
        const lec = lectures.find((l) => l.id === id);
        if (lec) selectLecture(lec);
      });
    });
  }

  // ============================================================
  // SELECT LECTURE
  // ============================================================
  function selectLecture(lec) {
    state.currentLecture = lec;
    state.isPlaying = false;
    state.currentTime = lec.progress ? Math.floor((lec.progress / 100) * getDurationSeconds(lec.duration)) : 0;
    const pp = document.getElementById("playPauseBtn");
    if (pp) pp.textContent = "▶";

    // Recently watched
    state.recentlyWatched = state.recentlyWatched.filter((id) => id !== lec.id);
    state.recentlyWatched.unshift(lec.id);
    if (state.recentlyWatched.length > 5) state.recentlyWatched.pop();
    localStorage.setItem("vlrecently", JSON.stringify(state.recentlyWatched));

    // Update info
    document.getElementById("videoTitle").textContent = lec.title;
    document.getElementById("videoLecturer").textContent = "👨‍🏫 " + lec.lecturer;
    document.getElementById("videoSubject").textContent = getSubjectIcon(lec.subject) + " " + lec.topic;
    document.getElementById("videoDuration").textContent = "⏱️ " + lec.duration;
    document.getElementById("videoViews").textContent = "👁️ " + lec.views.toLocaleString();
    document.getElementById("videoGrade").textContent = "🎓 Grade " + (lec.grade === "ug" ? "Undergrad" : lec.grade);
    document.getElementById("videoDescription").textContent = lec.description;

    // Like count
    const lc = document.getElementById("likeCount");
    if (lc) {
      lc.textContent = state.likeCounts[lec.id] || state.likeCounts[lec.id] === 0 ? state.likeCounts[lec.id] : Math.floor(lec.views * 0.015);
    }

    // Total duration
    state.totalTime = getDurationSeconds(lec.duration);

    // Chapters
    renderChapters(lec);

    // Player
    renderPlayer(lec);

    // Progress
    const pct = lec.progress || 0;
    const pf = document.getElementById("progressFillVideo");
    if (pf) pf.style.width = pct + "%";
    const td = document.getElementById("timeDisplay");
    if (td) td.textContent = formatTime(state.currentTime) + " / " + lec.duration;

    // Load notes
    loadNotes();

    // Render everything
    renderPlaylist();
    renderRecentlyWatched();
    renderRecommendations();
    updateFavBtn();
    updateBookmarkBtn();
    updateResultsCount();

    // Track views
    state.analyticsViews += 1;
    localStorage.setItem("vlanalyticsViews", state.analyticsViews);
  }

  function getDurationSeconds(dur) {
    const parts = dur.split(":");
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  }

  function renderPlayer(lec) {
    const player = document.getElementById("videoPlayerContainer");
    const pct = lec.progress || 0;
    player.innerHTML = `
      <div class="vl-player-placeholder" style="position:relative;background:linear-gradient(45deg,rgba(0,0,0,0.9),rgba(10,10,20,0.9));">
        <span class="vpp-icon" style="font-size:4rem;opacity:0.5;">🎬</span>
        <span class="vpp-title" style="font-size:1.1rem;color:#fff;">${lec.title}</span>
        <span class="vpp-sub" style="font-size:0.82rem;color:rgba(255,255,255,0.5);">Click to play • ${lec.duration}</span>
        ${pct > 0 ? `<div style="position:absolute;bottom:0;left:0;height:3px;background:var(--primary);width:${pct}%;transition:width 0.3s;" id="simProgress"></div>` : ""}
      </div>
    `;
    player.style.cursor = "pointer";
    player.onclick = () => togglePlay();
  }

  function renderChapters(lec) {
    const cc = document.getElementById("chaptersContainer");
    if (!cc) return;
    const ch = chapters[lec.id];
    if (ch && ch.length > 0) {
      cc.style.display = "flex";
      cc.innerHTML = ch.map((c, i) => `
        <button class="vl-chapter-btn" data-time="${c.time}">${i + 1}. ${c.title} (${c.time})</button>
      `).join("");
      cc.querySelectorAll(".vl-chapter-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const time = btn.dataset.time;
          const parts = time.split(":");
          state.currentTime = parseInt(parts[0]) * 60 + parseInt(parts[1]);
          showToast(`⏩ Jumped to: ${btn.textContent.trim()}`, "info");
          updateProgressDisplay();
        });
      });
    } else {
      cc.style.display = "none";
    }
  }

  // ============================================================
  // PLAYER SIMULATION
  // ============================================================
  let intervalId = null;

  function togglePlay() {
    if (!state.currentLecture) {
      showToast("🎬 Select a lecture first", "info");
      return;
    }
    state.isPlaying = !state.isPlaying;
    const pp = document.getElementById("playPauseBtn");
    if (pp) pp.textContent = state.isPlaying ? "⏸" : "▶";

    if (state.isPlaying) {
      const player = document.getElementById("videoPlayerContainer");
      player.innerHTML = `
        <div class="vl-player-placeholder" style="position:relative;background:linear-gradient(45deg,rgba(0,0,0,0.9),rgba(10,10,20,0.9));">
          <span class="vpp-icon" style="font-size:4rem;opacity:0.4;">🎬</span>
          <span class="vpp-title" style="font-size:1.1rem;color:#fff;">▶ ${state.currentLecture.title}</span>
          <span class="vpp-sub" style="font-size:0.82rem;color:rgba(255,255,255,0.5);">Playing...</span>
          <div style="position:absolute;bottom:0;left:0;height:3px;background:var(--primary);width:${(state.currentTime / state.totalTime) * 100}%;transition:width 0.5s;" id="simProgress"></div>
        </div>
      `;
      player.onclick = () => togglePlay();
      player.style.cursor = "pointer";

      intervalId = setInterval(() => {
        state.currentTime += 1 * state.speed;
        if (state.currentTime >= state.totalTime) {
          state.isPlaying = false;
          const pp = document.getElementById("playPauseBtn");
          if (pp) pp.textContent = "▶";
          clearInterval(intervalId);
          intervalId = null;
          state.currentTime = state.totalTime;
          showToast("✅ Lecture playback complete!", "success");
          if (state.currentLecture) {
            state.currentLecture.progress = Math.min(100, (state.currentLecture.progress || 0) + 5);
            renderPlaylist();
          }
        }
        updateProgressDisplay();
      }, 1000);
    } else {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    }
  }

  function updateProgressDisplay() {
    const pct = state.totalTime > 0 ? (state.currentTime / state.totalTime) * 100 : 0;
    const pf = document.getElementById("progressFillVideo");
    if (pf) pf.style.width = Math.min(pct, 100) + "%";
    const simBar = document.getElementById("simProgress");
    if (simBar) simBar.style.width = Math.min(pct, 100) + "%";
    const td = document.getElementById("timeDisplay");
    if (td) td.textContent = formatTime(state.currentTime) + " / " + (state.currentLecture ? state.currentLecture.duration : "00:00");

    // Update progress in lecture data
    if (state.currentLecture) {
      state.currentLecture.progress = Math.round(pct);
    }
  }

  // ============================================================
  // NAVIGATION (Prev/Next)
  // ============================================================
  function initNavigation() {
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        const filtered = getFilteredLectures();
        if (!state.currentLecture || filtered.length === 0) return;
        const idx = filtered.findIndex((l) => l.id === state.currentLecture.id);
        if (idx > 0) selectLecture(filtered[idx - 1]);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        const filtered = getFilteredLectures();
        if (!state.currentLecture || filtered.length === 0) return;
        const idx = filtered.findIndex((l) => l.id === state.currentLecture.id);
        if (idx < filtered.length - 1) selectLecture(filtered[idx + 1]);
      });
    }
  }

  // ============================================================
  // RECENTLY WATCHED
  // ============================================================
  function renderRecentlyWatched() {
    const container = document.getElementById("recentlyWatched");
    if (!container) return;
    const recent = state.recentlyWatched.map((id) => lectures.find((l) => l.id === id)).filter(Boolean);
    if (recent.length === 0) {
      container.innerHTML = `<p class="vl-muted">None yet.</p>`;
      return;
    }
    container.innerHTML = recent.map((l) => `
      <div class="vl-rec-item" data-id="${l.id}">
        <div class="vl-rec-thumb" style="background:${getColor(l.colorIdx)}">${getIcon(l.colorIdx)}</div>
        <div class="vl-rec-info">
          <span class="rec-title">${l.title}</span>
          <span class="rec-meta">${l.duration} • ${l.lecturer}</span>
        </div>
      </div>
    `).join("");
    container.querySelectorAll(".vl-rec-item").forEach((el) => {
      el.addEventListener("click", () => {
        const id = parseInt(el.dataset.id);
        const l = lectures.find((l) => l.id === id);
        if (l) selectLecture(l);
      });
    });
  }

  // ============================================================
  // RECOMMENDATIONS
  // ============================================================
  function renderRecommendations() {
    const container = document.getElementById("recommendations");
    if (!container) return;
    let recs = lectures.filter((l) => !state.favorites.includes(l.id));
    if (state.currentLecture) {
      const sameSubject = lectures.filter((l) => l.subject === state.currentLecture.subject && l.id !== state.currentLecture.id);
      if (sameSubject.length >= 2) recs = sameSubject;
    }
    const shuffled = [...recs].sort(() => 0.5 - Math.random());
    const items = shuffled.slice(0, 3);
    if (items.length === 0) {
      container.innerHTML = `<p class="vl-muted">Check back later.</p>`;
      return;
    }
    container.innerHTML = items.map((l) => `
      <div class="vl-rec-item" data-id="${l.id}">
        <div class="vl-rec-thumb" style="background:${getColor(l.colorIdx)}">${getIcon(l.colorIdx)}</div>
        <div class="vl-rec-info">
          <span class="rec-title">${l.title}</span>
          <span class="rec-meta">${l.lecturer}</span>
        </div>
      </div>
    `).join("");
    container.querySelectorAll(".vl-rec-item").forEach((el) => {
      el.addEventListener("click", () => {
        const id = parseInt(el.dataset.id);
        const l = lectures.find((l) => l.id === id);
        if (l) selectLecture(l);
      });
    });
  }

  // ============================================================
  // FAVORITES
  // ============================================================
  function updateFavBtn() {
    const btn = document.getElementById("favBtn");
    if (!btn || !state.currentLecture) return;
    btn.textContent = isFav(state.currentLecture.id) ? "⭐ Favorited" : "☆ Favorite";
  }

  function initFav() {
    const btn = document.getElementById("favBtn");
    if (!btn) return;
    btn.addEventListener("click", () => {
      if (!state.currentLecture) { showToast("🎬 Select a lecture first", "info"); return; }
      const id = state.currentLecture.id;
      const idx = state.favorites.indexOf(id);
      if (idx > -1) state.favorites.splice(idx, 1);
      else state.favorites.push(id);
      localStorage.setItem("vlfavorites", JSON.stringify(state.favorites));
      updateFavBtn();
      renderPlaylist();
      showToast(isFav(id) ? "⭐ Added to favorites" : "🗑️ Removed from favorites", "success");
    });
  }

  // ============================================================
  // BOOKMARKS
  // ============================================================
  function updateBookmarkBtn() {
    const btn = document.getElementById("bookmarkBtn");
    if (!btn || !state.currentLecture) return;
    btn.textContent = isBookmarked(state.currentLecture.id) ? "🔖 Bookmarked" : "🔖 Bookmark";
  }

  function initBookmark() {
    const btn = document.getElementById("bookmarkBtn");
    if (!btn) return;
    btn.addEventListener("click", () => {
      if (!state.currentLecture) { showToast("🎬 Select a lecture first", "info"); return; }
      const id = state.currentLecture.id;
      const idx = state.bookmarks.indexOf(id);
      if (idx > -1) state.bookmarks.splice(idx, 1);
      else state.bookmarks.push(id);
      localStorage.setItem("vlbookmarks", JSON.stringify(state.bookmarks));
      updateBookmarkBtn();
      showToast(isBookmarked(id) ? "🔖 Bookmarked!" : "🗑️ Bookmark removed", "success");
    });
  }

  // ============================================================
  // LIKE
  // ============================================================
  function initLike() {
    const btn = document.getElementById("likeBtn");
    if (!btn) return;
    btn.addEventListener("click", () => {
      if (!state.currentLecture) { showToast("🎬 Select a lecture first", "info"); return; }
      const id = state.currentLecture.id;
      const span = document.getElementById("likeCount");
      if (!span) return;
      state.likeCounts[id] = (state.likeCounts[id] || Math.floor(state.currentLecture.views * 0.015)) + 1;
      localStorage.setItem("vllikes", JSON.stringify(state.likeCounts));
      span.textContent = state.likeCounts[id];
      showToast("👍 Liked!", "success");
    });
  }

  // ============================================================
  // SHARE
  // ============================================================
  function initShare() {
    const btn = document.getElementById("shareBtn");
    if (!btn) return;
    btn.addEventListener("click", () => {
      if (!state.currentLecture) { showToast("🎬 Select a lecture first", "info"); return; }
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href + "?lecture=" + state.currentLecture.id).then(() => {
          showToast("🔗 Link copied to clipboard!", "success");
        }).catch(() => showToast("Could not copy link", "error"));
      } else {
        showToast("🔗 Share feature is available", "info");
      }
    });
  }

  // ============================================================
  // DOWNLOAD
  // ============================================================
  function initDownload() {
    const btn = document.getElementById("downloadBtn");
    if (!btn) return;
    btn.addEventListener("click", () => {
      if (!state.currentLecture) { showToast("🎬 Select a lecture first", "info"); return; }
      showToast("⬇️ Downloading '" + state.currentLecture.title + "'...", "success");
      addNotification("⬇️", `Download started: ${state.currentLecture.title}`, "Just now");
    });
  }

  // ============================================================
  // NOTES
  // ============================================================
  function loadNotes() {
    const ta = document.getElementById("notesTextarea");
    if (!ta || !state.currentLecture) return;
    const saved = localStorage.getItem("vlnotes_" + state.currentLecture.id);
    ta.value = saved || "";
  }

  function initNotes() {
    const ta = document.getElementById("notesTextarea");
    const saveBtn = document.getElementById("saveNotesBtn");
    const clearBtn = document.getElementById("clearNotesBtn");
    const dlBtn = document.getElementById("downloadNotesBtn");
    if (ta) {
      ta.addEventListener("input", () => {
        if (state.currentLecture) {
          localStorage.setItem("vlnotes_" + state.currentLecture.id, ta.value);
        }
      });
    }
    if (saveBtn) {
      saveBtn.addEventListener("click", () => {
        if (!state.currentLecture) { showToast("🎬 Select a lecture first", "info"); return; }
        if (ta) localStorage.setItem("vlnotes_" + state.currentLecture.id, ta.value);
        showToast("💾 Notes saved!", "success");
      });
    }
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        if (!state.currentLecture) { showToast("🎬 Select a lecture first", "info"); return; }
        if (ta) { ta.value = ""; localStorage.removeItem("vlnotes_" + state.currentLecture.id); }
        showToast("🗑️ Notes cleared", "info");
      });
    }
    if (dlBtn) {
      dlBtn.addEventListener("click", () => {
        if (!state.currentLecture) { showToast("🎬 Select a lecture first", "info"); return; }
        const content = ta ? ta.value : "";
        if (!content) { showToast("📝 No notes to download", "warning"); return; }
        const blob = new Blob([`Notes for: ${state.currentLecture.title}\n\n${content}`], { type: "text/plain" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `notes_${state.currentLecture.id}.txt`;
        a.click();
        showToast("📄 Notes downloaded!", "success");
      });
    }
  }

  // ============================================================
  // COMMENTS
  // ============================================================
  function renderComments() {
    const container = document.getElementById("commentsList");
    if (!container) return;
    if (state.comments.length === 0) {
      container.innerHTML = `<p class="vl-muted">No comments yet.</p>`;
      return;
    }
    container.innerHTML = state.comments.map((c) => `
      <div class="vl-comment-item">
        <div class="vl-comment-avatar">${c.author[0]}</div>
        <div class="vl-comment-body">
          <span class="vl-comment-author">${c.author}</span>
          <span class="vl-comment-time">${c.time}</span>
          <div class="vl-comment-text">${c.text}</div>
        </div>
      </div>
    `).join("");
  }

  function initComments() {
    const input = document.getElementById("commentInput");
    const btn = document.getElementById("postCommentBtn");
    if (!input || !btn) return;
    btn.addEventListener("click", () => {
      const text = input.value.trim();
      if (!text) return;
      state.comments.unshift({ author: "You", text: text, time: "Just now" });
      localStorage.setItem("vlcomments", JSON.stringify(state.comments));
      input.value = "";
      renderComments();
      showToast("💬 Comment posted!", "success");
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") btn.click();
    });
  }

  // ============================================================
  // Q&A
  // ============================================================
  function renderQnA() {
    const container = document.getElementById("qaList");
    if (!container) return;
    if (state.qna.length === 0) {
      container.innerHTML = `<p class="vl-muted">No questions yet.</p>`;
      return;
    }
    container.innerHTML = state.qna.map((q) => `
      <div class="vl-qna-item">
        <div class="vl-qna-question">❓ ${q.question}</div>
        ${q.answer ? `<div class="vl-qna-answer">💡 ${q.answer}</div>` : `<div class="vl-qna-answer" style="color:var(--text-muted);border-left-color:var(--text-muted);">⏳ Awaiting answer</div>`}
        <div style="font-size:0.68rem;color:var(--text-muted);margin-top:4px;">${q.author} • ${q.time}</div>
      </div>
    `).join("");
  }

  function initQnA() {
    const input = document.getElementById("qaInput");
    const btn = document.getElementById("postQaBtn");
    if (!input || !btn) return;
    btn.addEventListener("click", () => {
      const text = input.value.trim();
      if (!text) return;
      state.qna.unshift({ question: text, answer: null, author: "You", time: "Just now" });
      localStorage.setItem("vlqna", JSON.stringify(state.qna));
      input.value = "";
      renderQnA();
      showToast("❓ Question posted!", "success");
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") btn.click();
    });
  }

  // ============================================================
  // TABS (Notes / Comments / Q&A)
  // ============================================================
  function initTabs() {
    document.querySelectorAll(".vl-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".vl-tab").forEach((t) => t.classList.remove("active"));
        document.querySelectorAll(".vl-tab-content").forEach((c) => c.classList.remove("active"));
        tab.classList.add("active");
        const target = document.getElementById(tab.dataset.tab + "Tab");
        if (target) target.classList.add("active");
      });
    });
  }

  // ============================================================
  // PLAYER CONTROLS
  // ============================================================
  function initPlayerControls() {
    const playBtn = document.getElementById("playPauseBtn");
    if (playBtn) playBtn.addEventListener("click", togglePlay);

    const speedSel = document.getElementById("speedSelect");
    if (speedSel) {
      speedSel.addEventListener("change", () => {
        state.speed = parseFloat(speedSel.value);
        showToast("⏩ Speed: " + state.speed + "x", "info");
      });
    }

    const fullBtn = document.getElementById("fullscreenBtn");
    if (fullBtn) {
      fullBtn.addEventListener("click", () => {
        const el = document.getElementById("videoPlayerContainer");
        if (!el) return;
        if (document.fullscreenElement) document.exitFullscreen();
        else el.requestFullscreen().catch(() => {});
      });
    }

    const volBtn = document.getElementById("volumeBtn");
    const volSlider = document.getElementById("volumeSlider");
    if (volBtn && volSlider) {
      volBtn.addEventListener("click", () => {
        state.volume = state.volume > 0 ? 0 : 1;
        volSlider.value = state.volume;
        volBtn.textContent = state.volume > 0 ? "🔊" : "🔇";
      });
      volSlider.addEventListener("input", () => {
        state.volume = parseFloat(volSlider.value);
        volBtn.textContent = state.volume > 0 ? "🔊" : "🔇";
      });
    }

    const qualitySel = document.getElementById("qualitySelect");
    if (qualitySel) {
      qualitySel.addEventListener("change", () => {
        showToast("🎬 Quality: " + qualitySel.value, "info");
      });
    }

    const captionsBtn = document.getElementById("captionsBtn");
    if (captionsBtn) {
      captionsBtn.addEventListener("click", () => {
        state.captionsOn = !state.captionsOn;
        captionsBtn.classList.toggle("active");
        showToast(state.captionsOn ? "CC: On" : "CC: Off", "info");
      });
    }

    // Progress bar click
    const progressTrack = document.getElementById("progressTrackVideo");
    if (progressTrack) {
      progressTrack.addEventListener("click", (e) => {
        if (!state.currentLecture) return;
        const rect = progressTrack.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        state.currentTime = Math.floor(pct * state.totalTime);
        updateProgressDisplay();
        showToast("⏩ Seeking...", "info");
      });
    }
  }

  // ============================================================
  // LIVE LECTURES
  // ============================================================
  function renderLiveLectures() {
    const container = document.getElementById("liveGrid");
    if (!container) return;

    container.innerHTML = liveLectures.map((l) => {
      const isLive = l.status === "live";
      return `
        <div class="vl-live-card" data-id="${l.id}">
          <div class="vl-live-thumb">
            <span style="font-size:2.5rem;">${isLive ? "🔴" : "📺"}</span>
            ${isLive ? `<span class="live-badge"><span class="vl-live-dot"></span> LIVE</span>` : `<span class="live-badge" style="background:#ffc107;color:#000;">⏰ Scheduled</span>`}
            <span class="live-count">${isLive ? `👁️ ${l.viewers} watching` : ""}</span>
            ${!isLive ? `<span class="live-schedule">🗓️ ${l.startTime}</span>` : ""}
          </div>
          <div class="vl-live-info">
            <span class="ll-title">${l.title}</span>
            <span class="ll-lecturer">${l.lecturer}</span>
            <div class="ll-meta">
              <span>${getSubjectIcon(l.subject)} ${getSubjectLabel(l.subject)}</span>
              <span>${isLive ? "🔴 Live now" : "⏰ Upcoming"}</span>
            </div>
          </div>
        </div>
      `;
    }).join("");

    container.querySelectorAll(".vl-live-card").forEach((el) => {
      el.addEventListener("click", () => {
        const id = el.dataset.id;
        const live = liveLectures.find((l) => l.id === id);
        if (live) {
          showToast(`🔴 Joining: ${live.title}`, "success");
          addNotification("🔴", `Joined live session: ${live.title}`, "Just now");
        }
      });
    });
  }

  // ============================================================
  // UPLOAD
  // ============================================================
  let uploadFiles = [];
  let uploadLinks = [];

  function initUpload() {
    const dropZone = document.getElementById("dropZoneVideo");
    const fileInput = document.getElementById("videoFileInput");
    const submitBtn = document.getElementById("submitVideoBtn");
    const previewBtn = document.getElementById("previewVideoBtn");
    const addLinkBtn = document.getElementById("addLinkBtn");
    const thumbUpload = document.getElementById("thumbUpload");
    const thumbFileInput = document.getElementById("thumbFileInput");

    // Drag & drop
    if (dropZone && fileInput) {
      dropZone.addEventListener("click", () => fileInput.click());
      dropZone.addEventListener("dragover", (e) => { e.preventDefault(); dropZone.classList.add("drag-over"); });
      dropZone.addEventListener("dragleave", () => dropZone.classList.remove("drag-over"));
      dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropZone.classList.remove("drag-over");
        if (e.dataTransfer.files.length > 0) {
          handleFiles(e.dataTransfer.files);
        }
      });
      fileInput.addEventListener("change", () => {
        if (fileInput.files.length > 0) handleFiles(fileInput.files);
      });
    }

    function handleFiles(files) {
      const validFormats = ["mp4", "webm", "mov", "avi", "mkv"];
      const maxSize = 500 * 1024 * 1024; // 500MB
      const queue = document.getElementById("uploadQueue");
      if (!queue) return;

      Array.from(files).forEach((file) => {
        const ext = file.name.split(".").pop().toLowerCase();
        const valid = validFormats.includes(ext);
        const sizeOk = file.size <= maxSize;
        const isDuplicate = uploadFiles.some(f => f.name === file.name && f.size === file.size);

        const item = document.createElement("div");
        item.className = "vl-queue-item";
        const status = valid && sizeOk && !isDuplicate ? "valid" : "invalid";
        const statusText = isDuplicate ? "Duplicate" : !valid ? "Invalid format" : !sizeOk ? "Too large" : "Ready";
        item.innerHTML = `
          <span class="qi-icon">${valid ? "🎬" : "❌"}</span>
          <span class="qi-name">${file.name}</span>
          <span class="qi-status ${status}">${statusText}</span>
        `;
        queue.appendChild(item);

        if (status === "valid") {
          uploadFiles.push(file);
        }
      });

      const msg = document.getElementById("fileValidationMsg");
      if (msg) {
        const validCount = uploadFiles.length;
        msg.style.display = "flex";
        msg.className = "vl-validation-msg success";
        msg.innerHTML = `✅ ${validCount} file(s) ready for upload`;
      }

      fileInput.value = "";
    }

    // Thumbnail
    if (thumbUpload && thumbFileInput) {
      thumbUpload.addEventListener("click", () => thumbFileInput.click());
      thumbFileInput.addEventListener("change", () => {
        if (thumbFileInput.files.length > 0) {
          const file = thumbFileInput.files[0];
          const reader = new FileReader();
          reader.onload = (e) => {
            const preview = document.getElementById("thumbPreview");
            if (preview) {
              preview.innerHTML = `<img src="${e.target.result}" alt="Thumbnail" />`;
            }
          };
          reader.readAsDataURL(file);
          showToast("🖼️ Thumbnail uploaded!", "success");
        }
      });
    }

    // External link
    if (addLinkBtn) {
      const linkInput = document.getElementById("externalLinkInput");
      const linkQueue = document.getElementById("linkQueue");
      addLinkBtn.addEventListener("click", () => {
        if (linkInput && linkInput.value.trim()) {
          const url = linkInput.value.trim();
          uploadLinks.push(url);
          if (linkQueue) {
            const item = document.createElement("div");
            item.className = "vl-queue-item";
            item.innerHTML = `<span class="qi-icon">🔗</span><span class="qi-name">${url}</span><span class="qi-status valid">Added</span>`;
            linkQueue.appendChild(item);
          }
          linkInput.value = "";
          showToast("🔗 External link added!", "success");
        }
      });
    }

    // Preview
    if (previewBtn) {
      previewBtn.addEventListener("click", () => {
        const title = document.getElementById("uploadTitle").value.trim();
        if (!title) { showToast("⚠️ Enter a title first", "warning"); return; }
        showToast("👁️ Opening preview for: " + title, "info");
      });
    }

    // Submit
    if (submitBtn) {
      submitBtn.addEventListener("click", () => {
        const title = document.getElementById("uploadTitle").value.trim();
        const lecturer = document.getElementById("uploadLecturer").value.trim();
        const subject = document.getElementById("uploadSubject").value;
        const cc = document.getElementById("copyrightCheckVideo");

        if (!title) { showToast("⚠️ Title is required", "warning"); document.getElementById("uploadTitle").focus(); return; }
        if (!lecturer) { showToast("⚠️ Lecturer name is required", "warning"); document.getElementById("uploadLecturer").focus(); return; }
        if (!subject) { showToast("⚠️ Please select a subject", "warning"); return; }
        if (cc && !cc.checked) { showToast("⚠️ Please confirm copyright", "warning"); return; }
        if (uploadFiles.length === 0 && uploadLinks.length === 0) { showToast("⚠️ Add at least one video file or link", "warning"); return; }

        const upload = {
          id: generateId(),
          title,
          lecturer,
          subject,
          topic: document.getElementById("uploadTopic").value.trim(),
          grade: document.getElementById("uploadGrade").value,
          duration: document.getElementById("uploadDuration").value.trim() || "00:00",
          series: document.getElementById("uploadSeries").value.trim(),
          version: document.getElementById("uploadVersion").value.trim(),
          tags: document.getElementById("uploadTags").value.trim(),
          description: document.getElementById("uploadDescription").value.trim(),
          files: uploadFiles.length,
          links: uploadLinks.length,
          status: "pending",
          timestamp: new Date().toISOString(),
        };

        state.pendingUploads.push(upload);
        localStorage.setItem("vlpending", JSON.stringify(state.pendingUploads));

        // Audit log
        state.auditLogs.unshift({
          id: generateId(),
          action: "upload",
          item: title,
          user: "Teacher",
          timestamp: new Date().toISOString(),
        });
        localStorage.setItem("vlaudit", JSON.stringify(state.auditLogs));

        showToast("📤 Lecture submitted for admin approval!", "success");
        addNotification("📤", `New lecture submitted: ${title}`, "Just now");

        // Reset form
        document.getElementById("uploadTitle").value = "";
        document.getElementById("uploadLecturer").value = "";
        document.getElementById("uploadSubject").value = "";
        document.getElementById("uploadTopic").value = "";
        document.getElementById("uploadGrade").value = "";
        document.getElementById("uploadDuration").value = "";
        document.getElementById("uploadSeries").value = "";
        document.getElementById("uploadVersion").value = "";
        document.getElementById("uploadTags").value = "";
        document.getElementById("uploadDescription").value = "";
        if (cc) cc.checked = false;
        uploadFiles = [];
        uploadLinks = [];
        const queue = document.getElementById("uploadQueue");
        if (queue) queue.innerHTML = "";
        const lq = document.getElementById("linkQueue");
        if (lq) lq.innerHTML = "";
        const msg = document.getElementById("fileValidationMsg");
        if (msg) msg.style.display = "none";
        const preview = document.getElementById("thumbPreview");
        if (preview) preview.innerHTML = "🖼️";
        if (thumbFileInput) thumbFileInput.value = "";

        // Show workflow status
        const ws = document.getElementById("workflowStatus");
        if (ws) {
          ws.style.display = "flex";
          ws.className = "vl-workflow-status pending";
          ws.innerHTML = "⏳ Submitted — Pending Admin Approval";
        }
      });
    }
  }

  // ============================================================
  // NOTIFICATIONS
  // ============================================================
  function addNotification(icon, title, time) {
    state.notifications.unshift({ id: generateId(), icon, title, time, read: false });
    localStorage.setItem("vlnotifs", JSON.stringify(state.notifications));
    updateNotifBadge();
    renderNotifications();
  }

  function updateNotifBadge() {
    const badge = document.getElementById("notifBadge");
    if (!badge) return;
    const unread = state.notifications.filter((n) => !n.read).length;
    if (unread > 0) {
      badge.style.display = "flex";
      badge.textContent = unread;
    } else {
      badge.style.display = "none";
    }
  }

  function renderNotifications() {
    const list = document.getElementById("notifList");
    if (!list) return;
    if (state.notifications.length === 0) {
      list.innerHTML = `<p class="vl-muted" style="padding:16px;text-align:center;">No notifications.</p>`;
      return;
    }
    list.innerHTML = state.notifications.map((n) => `
      <div class="vl-notif-item ${n.read ? "" : "unread"}" data-id="${n.id}" style="${n.read ? "opacity:0.6;" : ""}">
        <span class="ni-icon">${n.icon}</span>
        <div class="ni-content">
          <div class="ni-title">${n.title}</div>
          <span class="ni-time">${n.time}</span>
        </div>
      </div>
    `).join("");
    list.querySelectorAll(".vl-notif-item").forEach((el) => {
      el.addEventListener("click", () => {
        const id = el.dataset.id;
        const notif = state.notifications.find((n) => n.id === id);
        if (notif && !notif.read) {
          notif.read = true;
          localStorage.setItem("vlnotifs", JSON.stringify(state.notifications));
          el.style.opacity = "0.6";
          updateNotifBadge();
        }
      });
    });
  }

  function initNotifications() {
    const toggle = document.getElementById("notifToggle");
    const panel = document.getElementById("notifPanel");
    const markAllBtn = document.getElementById("markAllRead");

    if (toggle && panel) {
      toggle.addEventListener("click", (e) => {
        e.stopPropagation();
        panel.classList.toggle("open");
        document.getElementById("accessPanel").classList.remove("open");
      });
      document.addEventListener("click", (e) => {
        if (!panel.contains(e.target) && e.target !== toggle) {
          panel.classList.remove("open");
        }
      });
    }

    if (markAllBtn) {
      markAllBtn.addEventListener("click", () => {
        state.notifications.forEach((n) => n.read = true);
        localStorage.setItem("vlnotifs", JSON.stringify(state.notifications));
        renderNotifications();
        updateNotifBadge();
        showToast("✅ All notifications marked as read", "success");
      });
    }

    updateNotifBadge();
    renderNotifications();
  }

  // ============================================================
  // ACCESSIBILITY
  // ============================================================
  function initAccessibility() {
    const toggle = document.getElementById("accessToggle");
    const panel = document.getElementById("accessPanel");

    if (toggle && panel) {
      toggle.addEventListener("click", (e) => {
        e.stopPropagation();
        panel.classList.toggle("open");
        document.getElementById("notifPanel").classList.remove("open");
      });
      document.addEventListener("click", (e) => {
        if (!panel.contains(e.target) && e.target !== toggle) {
          panel.classList.remove("open");
        }
      });
    }

    const fontSizeSlider = document.getElementById("fontSizeSlider");
    const fontSizeLabel = document.getElementById("fontSizeLabel");
    if (fontSizeSlider && fontSizeLabel) {
      fontSizeSlider.addEventListener("input", () => {
        const val = fontSizeSlider.value;
        fontSizeLabel.textContent = val + "px";
        state.accessFontSize = parseInt(val);
        document.querySelector(".vl-page").style.fontSize = val + "px";
      });
    }

    const hcToggle = document.getElementById("highContrastToggle");
    if (hcToggle) {
      hcToggle.addEventListener("change", () => {
        state.highContrast = hcToggle.checked;
        document.body.classList.toggle("high-contrast", state.highContrast);
        showToast(state.highContrast ? "♿ High contrast enabled" : "♿ High contrast disabled", "info");
      });
    }

    const capToggle = document.getElementById("captionsToggle");
    if (capToggle) {
      capToggle.addEventListener("change", () => {
        state.captionsOn = capToggle.checked;
        showToast(state.captionsOn ? "♿ Closed captions on" : "♿ Closed captions off", "info");
      });
    }

    const ttsToggle = document.getElementById("ttsToggle");
    if (ttsToggle) {
      ttsToggle.addEventListener("change", () => {
        state.ttsOn = ttsToggle.checked;
        showToast(state.ttsOn ? "♿ Text-to-speech enabled" : "♿ Text-to-speech disabled", "info");
        if (state.ttsOn && state.currentLecture) {
          const msg = `Now playing: ${state.currentLecture.title}. Lecturer: ${state.currentLecture.lecturer}`;
          const utterance = new SpeechSynthesisUtterance(msg);
          speechSynthesis.speak(utterance);
        }
      });
    }
  }

  // ============================================================
  // ANALYTICS
  // ============================================================
  function renderAnalytics() {
    document.getElementById("statTotalViews").textContent = state.analyticsViews.toLocaleString();
    document.getElementById("statTotalLectures").textContent = lectures.length + state.pendingUploads.length;
    document.getElementById("statEngagement").textContent = state.analyticsEngagement + "%";
    const totalWatchMinutes = lectures.reduce((sum, l) => sum + getDurationSeconds(l.duration), 0);
    const totalWatchHours = Math.floor(totalWatchMinutes / 60);
    document.getElementById("statWatchTime").textContent = totalWatchHours + "h";
    document.getElementById("statStudents").textContent = Math.floor(state.analyticsViews * 0.023).toLocaleString();
    document.getElementById("statUploads").textContent = state.pendingUploads.filter(u => u.status === "pending").length;

    // Popular lectures
    const popular = [...lectures].sort((a, b) => b.views - a.views).slice(0, 5);
    const container = document.getElementById("popularLectures");
    if (container) {
      container.innerHTML = popular.map((l, i) => `
        <div class="vl-playlist-item" data-id="${l.id}">
          <div class="vl-playlist-thumb" style="background:${getColor(l.colorIdx)};width:80px;height:45px;font-size:0.9rem;">
            ${getIcon(l.colorIdx)}
          </div>
          <div class="vl-playlist-info">
            <span class="pl-title" style="font-size:0.78rem;">#${i+1} ${l.title}</span>
            <span class="pl-meta">${l.views.toLocaleString()} views • ${l.lecturer}</span>
          </div>
        </div>
      `).join("");
      container.querySelectorAll(".vl-playlist-item").forEach((el) => {
        el.addEventListener("click", () => {
          const id = parseInt(el.dataset.id);
          const l = lectures.find((l) => l.id === id);
          if (l) { selectLecture(l); switchSection("browse"); }
        });
      });
    }
  }

  // ============================================================
  // ADMIN
  // ============================================================
  function renderAdmin() {
    const container = document.getElementById("pendingApprovals");
    const count = document.getElementById("pendingCount");
    if (!container) return;

    const pending = state.pendingUploads.filter(u => u.status === "pending");
    if (count) count.textContent = pending.length + " pending";

    if (pending.length === 0) {
      container.innerHTML = `<p class="vl-muted" style="padding:12px 0;">No pending approvals.</p>`;
      return;
    }

    container.innerHTML = pending.map((u, i) => `
      <div class="vl-queue-item" style="margin-bottom:8px;">
        <span class="qi-icon">📤</span>
        <div class="qi-name">
          <strong>${u.title}</strong><br />
          <span style="font-size:0.72rem;color:var(--text-muted);">${u.lecturer} • ${getSubjectLabel(u.subject)} • ${u.files + u.links} source(s)</span>
        </div>
        <button class="vl-btn vl-btn-sm vl-btn-primary" data-approve="${i}" style="margin-right:4px;">✅ Approve</button>
        <button class="vl-btn vl-btn-sm vl-btn-danger" data-reject="${i}">❌ Reject</button>
      </div>
    `).join("");

    container.querySelectorAll("[data-approve]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.approve);
        const upload = state.pendingUploads[idx];
        if (upload) {
          upload.status = "approved";
          localStorage.setItem("vlpending", JSON.stringify(state.pendingUploads));
          state.auditLogs.unshift({
            id: generateId(),
            action: "approve",
            item: upload.title,
            user: "Admin",
            timestamp: new Date().toISOString(),
          });
          localStorage.setItem("vlaudit", JSON.stringify(state.auditLogs));
          renderAdmin();
          showToast(`✅ Approved: ${upload.title}`, "success");
          addNotification("✅", `Lecture approved: ${upload.title}`, "Just now");
        }
      });
    });

    container.querySelectorAll("[data-reject]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.reject);
        const upload = state.pendingUploads[idx];
        if (upload) {
          upload.status = "rejected";
          localStorage.setItem("vlpending", JSON.stringify(state.pendingUploads));
          state.auditLogs.unshift({
            id: generateId(),
            action: "reject",
            item: upload.title,
            user: "Admin",
            timestamp: new Date().toISOString(),
          });
          localStorage.setItem("vlaudit", JSON.stringify(state.auditLogs));
          renderAdmin();
          showToast(`❌ Rejected: ${upload.title}`, "error");
        }
      });
    });

    // Admin cards
    document.querySelectorAll(".vl-admin-card").forEach((card) => {
      card.addEventListener("click", () => {
        const action = card.dataset.action;
        const actions = {
          bulk: "📦 Bulk upload — Select multiple files to upload at once",
          version: "🔄 Version control enabled — You can update existing lectures",
          tags: "🏷️ Tagging — Assign subjects, keywords, and categories",
          approve: "✅ Approval workflow — Review pending uploads above",
          audit: "📋 Audit logs — All changes are tracked",
          permissions: "👥 User permissions — Admins have full control, teachers limited to their subjects",
        };
        showToast(actions[action] || "🚀 Feature coming soon!", "info");
      });
    });
  }

  // ============================================================
  // EXTRA FEATURES
  // ============================================================
  function initExtraFeatures() {
    document.querySelectorAll(".vl-extra-card").forEach((card) => {
      card.addEventListener("click", () => {
        const feature = card.dataset.feature;
        switch (feature) {
          case "notes":
            showToast("📝 Notes & Highlights — Take notes while watching", "info");
            break;
          case "download":
            showToast("⬇️ Offline access enabled for downloaded lectures", "success");
            break;
          case "captions":
            document.getElementById("accessToggle").click();
            break;
          case "lms":
            showToast("🔗 LMS Integration — Sync with Moodle, Google Classroom, Canvas", "info");
            break;
          case "notifications":
            document.getElementById("notifToggle").click();
            break;
          case "analytics":
            switchSection("analytics");
            break;
          default:
            showToast("🚀 Feature: " + feature, "info");
        }
      });
    });
  }

  function switchSection(section) {
    document.querySelectorAll(".vl-section-tab").forEach((t) => {
      t.classList.toggle("active", t.dataset.section === section);
    });
    document.querySelectorAll(".vl-section-content").forEach((s) => s.style.display = "none");
    const target = document.getElementById("section" + section.charAt(0).toUpperCase() + section.slice(1));
    if (target) target.style.display = "block";
    state.activeSection = section;
    if (section === "analytics") renderAnalytics();
    if (section === "admin") renderAdmin();
    if (section === "live") renderLiveLectures();
  }

  // ============================================================
  // SCROLL TO TOP
  // ============================================================
  function initScrollToTop() {
    const btn = document.getElementById("scrollTopBtn");
    if (!btn) return;
    window.addEventListener("scroll", () => {
      btn.classList.toggle("visible", window.scrollY > 400);
    }, { passive: true });
    btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  // ============================================================
  // ATOMIC LOGO
  // ============================================================
  function initAtomicLogo(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    let W = 100, H = 100;
    const dpr = Math.max(1, Math.min(2.5, window.devicePixelRatio || 1));
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const TAU = Math.PI * 2;
    const eColors = [{ core: "#9bffea", glow: "rgba(64,255,232,0.75)" }, { core: "#b2a3ff", glow: "rgba(160,120,255,0.75)" }];
    const nucColor = "#9ae6ff", nucGlow = "rgba(40,220,255,0.55)";
    function glowCircle(x, y, r, color, glowColor, gs) {
      gs = gs || 1;
      ctx.globalCompositeOperation = "lighter";
      ctx.beginPath(); ctx.fillStyle = glowColor; ctx.shadowColor = glowColor; ctx.shadowBlur = r * 1.2 * gs;
      ctx.arc(x, y, r, 0, TAU); ctx.fill();
      ctx.shadowBlur = 0; ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(x, y, r * 0.55, 0, TAU); ctx.fill();
      ctx.globalCompositeOperation = "source-over";
    }
    function strokeGlow(pathFn, ss, gs, lw, gb) {
      ctx.save(); ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = gs; ctx.lineWidth = lw; ctx.shadowColor = gs; ctx.shadowBlur = gb;
      pathFn(); ctx.stroke();
      ctx.globalCompositeOperation = "source-over"; ctx.shadowBlur = 0;
      ctx.strokeStyle = ss; ctx.lineWidth = lw * 0.72; pathFn(); ctx.stroke();
      ctx.restore();
    }
    function ellipsePath(c, rx, ry, x, y, tilt) {
      const ct = Math.cos(tilt), st = Math.sin(tilt);
      c.beginPath();
      for (let i = 0; i <= 120; i++) {
        const a = (i / 120) * TAU;
        const ex = rx * Math.cos(a), ey = ry * Math.sin(a);
        const p = 1 - 0.12 * (Math.sin(a) * 0.5 + 0.5);
        c.lineTo(x + ex * p, y + ey * ct + ey * st * 0.15);
      }
    }
    let t0 = performance.now();
    function drawFrame(t) {
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2, tilt = 0.75;
      const r1 = Math.round(33), r2 = Math.round(48);
      strokeGlow(() => ellipsePath(ctx, r1, Math.round(r1 * 0.62), cx, cy, tilt), "rgba(120,255,245,0.35)", "rgba(60,255,232,0.28)", 1.5, 8);
      strokeGlow(() => ellipsePath(ctx, r2, Math.round(r2 * 0.52), cx, cy, tilt), "rgba(210,180,255,0.30)", "rgba(150,110,255,0.26)", 1.5, 8);
      const pulse = 0.5 + 0.5 * Math.sin(t * 0.004);
      const nr = Math.round(9) + Math.round(2) * (pulse - 0.5) * 2;
      strokeGlow(() => { ctx.beginPath(); ctx.arc(cx, cy, nr, 0, TAU); }, "rgba(155,230,255,0.85)", "rgba(20,190,255,0.65)", 2, 6);
      glowCircle(cx, cy, nr, nucColor, nucGlow, 1.1);
      for (let i = 0; i < 2; i++) {
        const speed = i === 0 ? 0.0029 : 0.0022;
        const angle = t * speed + (i === 0 ? 0 : Math.PI / 2);
        const rx = i === 0 ? r1 : r2, ry = i === 0 ? Math.round(r1 * 0.62) : Math.round(r2 * 0.52);
        const ex = rx * Math.cos(angle), ey = ry * Math.sin(angle);
        const ct = Math.cos(tilt), st = Math.sin(tilt);
        const p = 1 - 0.12 * (Math.sin(angle) * 0.5 + 0.5);
        const col = eColors[i];
        const wob = 0.6 + 0.4 * Math.sin(t * 0.01 + i * 2);
        const r = Math.round(3.5) * (0.85 + 0.35 * wob);
        const px = ex * p, py = ey * ct + ey * st * 0.15;
        glowCircle(cx + px, cy + py, r, col.core, col.glow, 1.0);
      }
      const shimmer = 0.5 + 0.5 * Math.sin(t * 0.014);
      glowCircle(cx, cy, 2 + shimmer * 2, "#d6fbff", "rgba(40,220,255,0.35)", 1.15);
    }
    function animate() {
      drawFrame(performance.now() - t0);
      requestAnimationFrame(animate);
    }
    animate();
  }

  // ============================================================
  // INIT
  // ============================================================
  function init() {
    renderPlaylist();
    updateResultsCount();
    renderRecentlyWatched();
    renderRecommendations();
    renderComments();
    renderQnA();
    loadNotes();

    initSectionTabs();
    initFilters();
    initSearch();
    initPlayerControls();
    initNavigation();
    initTabs();
    initComments();
    initQnA();
    initNotes();
    initLike();
    initFav();
    initBookmark();
    initShare();
    initDownload();
    initUpload();
    initNotifications();
    initAccessibility();
    initExtraFeatures();
    initScrollToTop();
    initAtomicLogo("headerAtomicCanvas");

    // Hide all sections except browse initially
    document.querySelectorAll(".vl-section-content").forEach((s) => {
      if (s.id !== "sectionBrowse") s.style.display = "none";
    });

    console.log("🎬 Classroom Video Lectures v2 initialized —", lectures.length, "lectures,", liveLectures.length, "live streams");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

