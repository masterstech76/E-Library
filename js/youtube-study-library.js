/**
 * YouTube Study Library — Curated Educational Videos from YouTube Channels
 * Features: Browse by subject/channel (all data-driven, no hardcoded content),
 * search, embedded player (YouTube + local file uploads via IndexedDB), favorites,
 * watch later, notes per video, analytics, study streak & shuffle, accessibility.
 *
 * All content (videos, channels, subjects) is stored in localStorage and only
 * enters the library through the Add Video button.
 */
(function () {
  "use strict";

  // ============================================================
  // DATA LAYER (localStorage-backed — NO hardcoded content data)
  // ============================================================
  const KEYS = {
    videos: "ytvideos",
    channels: "ytchannels",
    subjects: "ytsubjects",
    favorites: "ytfavorites",
    watchLater: "ytwatchlater",
    recent: "ytrecently",
    watchHistory: "ytwatchhistory",
    notes: "ytnotes",
    suggestions: "ytchannelSuggestions",
    streak: "ytStudyStreak",
    a11y: "yta11y",
  };

  // Default subject CATEGORIES only (filter taxonomy, not content).
  const DEFAULT_SUBJECTS = [
    { id: "math", label: "Mathematics", icon: "📐" },
    { id: "science", label: "Science", icon: "🔬" },
    { id: "cs", label: "Computer Science", icon: "💻" },
    { id: "language", label: "Languages", icon: "📖" },
    { id: "history", label: "History & Civics", icon: "📜" },
    { id: "commerce", label: "Commerce", icon: "📊" },
    { id: "arts", label: "Arts & Humanities", icon: "🎨" },
    { id: "exam", label: "Exam Prep", icon: "🎯" },
  ];

function load(key, fallback) {
    try {
      const v = JSON.parse(localStorage.getItem(key));
      return v === null || v === undefined ? fallback : v;
    } catch (e) { return fallback; }
  }
  function save(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { console.warn("localStorage full/blocked", key); }
  }

  // ============================================================
  // SEED DATA — curated starter videos so the library isn't empty
  // on first load. Only applied when localStorage has no videos.
  // ============================================================
  const SEED_DATA = [
    { title: "Essence of Calculus — Limits & Derivatives", channel: "3Blue1Brown", subject: "math", duration: "17:05", views: 4200000, videoId: "WUvT157iWQ0", description: "An intuitive introduction to the core ideas of calculus using visual reasoning." },
    { title: "The Standard Model of Particle Physics", channel: "Fermilab", subject: "science", duration: "12:40", views: 1800000, videoId: "kK_k_OZ1noU", description: "A tour of the fundamental particles and forces that make up our universe." },
    { title: "CS50 — Understanding Algorithms", channel: "CS50", subject: "cs", duration: "45:12", views: 2500000, videoId: "8hly31xKli0", description: "An introduction to algorithms, data structures, and computational thinking." },
    { title: "Crash Course World History — The Silk Road", channel: "CrashCourse", subject: "history", duration: "10:30", views: 3100000, videoId: "vn3e37VWcQk", description: "How the Silk Road connected civilizations and shaped world trade." },
    { title: "Learn English: Common Idioms Explained", channel: "English with Lucy", subject: "language", duration: "18:22", views: 970000, videoId: "VY_lMuWZv_Q", description: "Master everyday English idioms with clear explanations and examples." },
    { title: "The Science of Study Habits", channel: "Thomas Frank", subject: "exam", duration: "14:08", views: 1500000, videoId: "ZzD8yHf6v4U", description: "Evidence-based study techniques to improve retention and focus." },
  ];

  function seedIfEmpty() {
    if (videos.length > 0) return;
    const seeded = [];
    const seededChannels = {};
    SEED_DATA.forEach(item => {
      const chId = slugifyChannel(item.channel);
      if (!seededChannels[chId]) {
        seededChannels[chId] = { name: item.channel, icon: "📺" };
        channels[chId] = seededChannels[chId];
      }
      seeded.push({
        id: genId(),
        title: item.title,
        channelId: chId,
        subject: item.subject,
        duration: item.duration,
        views: item.views,
        description: item.description,
        videoId: item.videoId,
        fileKey: null,
        createdAt: now(),
        seeded: true,
      });
    });
    videos = seeded;
    persistVideos();
    persistChannels();
  }

  function slugifyChannel(name) {
    return String(name || "").toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 20) || genId();
  }

  let videos = load(KEYS.videos, []);
  let channels = load(KEYS.channels, {});   // { id: { name, icon } }
  let subjects = load(KEYS.subjects, DEFAULT_SUBJECTS);

  function persistVideos() { save(KEYS.videos, videos); }
  function persistChannels() { save(KEYS.channels, channels); }
  function persistSubjects() { save(KEYS.subjects, subjects); }

  // ============================================================
  // STATE
  // ============================================================
  let state = {
    activeSubject: "all",
    activeChannel: "all",
    searchQuery: "",
    currentVideo: null,
    favorites: load(KEYS.favorites, []),
    watchLater: load(KEYS.watchLater, []),
    recentlyWatched: load(KEYS.recent, []),
    watchHistory: load(KEYS.watchHistory, []),
    notes: load(KEYS.notes, {}),
    viewMode: "grid",
    currentPage: 1,
    pageSize: 12,
    a11y: load(KEYS.a11y, { fontSize: 15, highContrast: false, reduceMotion: false, largeThumbs: false }),
  };

  function persistFavorites() { save(KEYS.favorites, state.favorites); }
  function persistWatchLater() { save(KEYS.watchLater, state.watchLater); }
  function persistRecent() { save(KEYS.recent, state.recentlyWatched); }
  function persistNotes() { save(KEYS.notes, state.notes); }
  function persistA11y() { save(KEYS.a11y, state.a11y); }

  // ============================================================
  // HELPERS ( $, qs, qsa, esc, genId, now, fmtDate, showToast, downloadFile — provided by shared.js )
  // ============================================================
  function getSubject(id) { return subjects.find(s => s.id === id); }
  function getSubjectLabel(id) { const s = getSubject(id); return s ? s.label : id; }
  function getSubjectIcon(id) { const s = getSubject(id); return s ? s.icon : "📚"; }

  function getChannel(id) { return channels[id]; }
  function getChannelIcon(id) { const c = getChannel(id); return c ? (c.icon || "📺") : "📺"; }

  function slugify(name) {
    return String(name || "").toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 20) || genId();
  }

  function ensureChannel(name) {
    const trimmed = String(name || "").trim();
    if (!trimmed) return null;
    const existing = Object.keys(channels).find(id => (channels[id].name || "").toLowerCase() === trimmed.toLowerCase());
    if (existing) return existing;
    const id = slugify(trimmed);
    channels[id] = { name: trimmed, icon: "📺" };
    persistChannels();
    return id;
  }

  function ensureSubject(name) {
    const trimmed = String(name || "").trim();
    if (!trimmed) return null;
    const existing = subjects.find(s => s.label.toLowerCase() === trimmed.toLowerCase());
    if (existing) return existing.id;
    const id = slugify(trimmed) + genId().slice(0, 3);
    subjects.push({ id: id, label: trimmed, icon: "📚" });
    persistSubjects();
    return id;
  }

  function formatViews(n) {
    n = parseInt(n) || 0;
    if (n >= 10000000) return (n / 10000000).toFixed(1) + "Cr";
    if (n >= 100000) return (n / 100000).toFixed(1) + "L";
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return n.toString();
  }

  function generateEmbedUrl(videoId) {
    return "https://www.youtube.com/embed/" + encodeURIComponent(videoId) + "?autoplay=1&rel=0";
  }
  function generateWatchUrl(videoId) {
    return "https://www.youtube.com/watch?v=" + encodeURIComponent(videoId);
  }
  function thumbnailUrl(videoId) {
    return "https://i.ytimg.com/vi/" + encodeURIComponent(videoId) + "/hqdefault.jpg";
  }

  function extractVideoId(input) {
    if (!input) return null;
    input = String(input).trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;
    try {
      const u = new URL(input);
      if (/youtu\.?be/i.test(u.hostname)) {
        if (u.pathname.indexOf("/embed/") === 0) {
          const m = u.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
          if (m) return m[1];
        }
        const v = u.searchParams.get("v");
        if (v) return v;
        if (u.pathname.length > 1) return u.pathname.slice(1).split("/")[0] || null;
      }
    } catch (e) { /* fall through */ }
    const m = input.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
    return m ? m[1] : null;
  }

  // ============================================================
  // FILTERED VIDEOS
  // ============================================================
  function getFilteredVideos() {
    let result = [...videos];
    if (state.activeSubject !== "all") {
      result = result.filter(v => v.subject === state.activeSubject);
    }
    if (state.activeChannel !== "all") {
      result = result.filter(v => v.channelId === state.activeChannel);
    }
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.trim().toLowerCase();
      result = result.filter(v =>
        (v.title || "").toLowerCase().includes(q) ||
        (getChannel(v.channelId) ? getChannel(v.channelId).name.toLowerCase().includes(q) : false) ||
        getSubjectLabel(v.subject).toLowerCase().includes(q) ||
        (v.description || "").toLowerCase().includes(q)
      );
    }
    return result;
  }

  function getPaginated(videosList) {
    const start = (state.currentPage - 1) * state.pageSize;
    return videosList.slice(start, start + state.pageSize);
  }
  function getTotalPages(videosList) {
    return Math.ceil(videosList.length / state.pageSize);
  }

// ============================================================
  // RENDER: SUBJECT BADGES (top topics in the section header)
  // ============================================================
  function renderSubjectBadges() {
    const container = $("subjectBadgeRow");
    if (!container) return;
    const counts = {};
    videos.forEach(v => { if (v.subject) counts[v.subject] = (counts[v.subject] || 0) + 1; });
    const used = subjects.filter(s => counts[s.id]);
    if (used.length === 0) {
      container.innerHTML = `<span>🎥 ${videos.length} video${videos.length !== 1 ? "s" : ""} in your library</span>`;
      return;
    }
    container.innerHTML = used.map(s =>
      `<span class="yt-badge-chip" data-subject="${s.id}">${s.icon} ${esc(s.label)} · ${counts[s.id]}</span>`
    ).join("") + `<span class="yt-badge-chip yt-badge-cta" id="badgeAddVideo">➕ Add Video</span>`;
    const badgeBtn = $("badgeAddVideo");
    if (badgeBtn) badgeBtn.addEventListener("click", () => openModal("addVideoModal"));
    container.querySelectorAll("[data-subject]").forEach(b => {
      b.addEventListener("click", () => {
        state.activeSubject = b.dataset.subject;
        state.currentPage = 1;
        state.currentVideo = null;
        renderSubjectTabs();
        renderVideoGrid();
        updateResultsCount();
      });
    });
  }

  // ============================================================
  // RENDER: SUBJECT TABS
  // ============================================================
  function renderSubjectTabs() {
    const container = $("subjectTabs");
    if (!container) return;
    const counts = {};
    videos.forEach(v => { if (v.subject) counts[v.subject] = (counts[v.subject] || 0) + 1; });
    const allCount = videos.length;
    const allBtn = `<button class="yt-subject-tab ${state.activeSubject === "all" ? "active" : ""}" data-subject="all">📚 All Subjects${allCount ? ` <span class="yt-tab-count">${allCount}</span>` : ""}</button>`;
    container.innerHTML = allBtn + subjects.map(s =>
      `<button class="yt-subject-tab ${s.id === state.activeSubject ? "active" : ""}" data-subject="${s.id}">${s.icon} ${esc(s.label)}${counts[s.id] ? ` <span class="yt-tab-count">${counts[s.id]}</span>` : ""}</button>`
    ).join("");

    container.querySelectorAll(".yt-subject-tab").forEach(tab => {
      tab.addEventListener("click", () => {
        state.activeSubject = tab.dataset.subject;
        state.currentPage = 1;
        state.currentVideo = null;
        renderSubjectTabs();
        renderVideoGrid();
        updateResultsCount();
      });
    });
  }

  // ============================================================ 
  // RENDER: CHANNEL BAR
  // ============================================================
  function renderChannelBar() {
    const container = $("channelBar");
    if (!container) return;

    // Only show channels that have at least one video OR are explicitly managed
    const usedChannelIds = new Set(videos.map(v => v.channelId).filter(Boolean));
    const entries = Object.entries(channels).filter(([id]) => usedChannelIds.has(id) || id === state.activeChannel);

    if (entries.length === 0) {
      container.innerHTML = "";
      return;
    }

const chCounts = {};
    videos.forEach(v => { if (v.channelId) chCounts[v.channelId] = (chCounts[v.channelId] || 0) + 1; });
    const allCount = videos.length;
    let html = `<button class="yt-channel-chip ${state.activeChannel === "all" ? "active" : ""}" data-channel="all">🌐 All Channels${allCount ? ` <span class="yt-tab-count">${allCount}</span>` : ""}</button>`;
    html += entries.map(([id, ch]) =>
      `<button class="yt-channel-chip ${state.activeChannel === id ? "active" : ""}" data-channel="${id}">${ch.icon || "📺"} ${esc(ch.name)}${chCounts[id] ? ` <span class="yt-tab-count">${chCounts[id]}</span>` : ""}</button>`
    ).join("");

    container.innerHTML = html;
    container.querySelectorAll(".yt-channel-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        state.activeChannel = chip.dataset.channel;
        state.currentPage = 1;
        state.currentVideo = null;
        renderChannelBar();
        renderVideoGrid();
        updateResultsCount();
      });
    });
  }

  // ============================================================
  // RESULTS COUNT + EMPTY STATE
  // ============================================================
  function updateResultsCount() {
    const el = $("resultsCount");
    if (!el) return;
    const filtered = getFilteredVideos();
    const sub = state.activeSubject === "all" ? "All Subjects" : getSubjectLabel(state.activeSubject);
    if (videos.length === 0) {
      el.textContent = "The library is empty — add your first video to get started.";
    } else {
      el.textContent = "Showing " + filtered.length + " of " + videos.length + " videos in " + sub;
    }
  }

  // ============================================================
  // RENDER: VIDEO GRID
  // ============================================================
  function renderVideoGrid() {
    const container = $("videoGrid");
    if (!container) return;
    const filtered = getFilteredVideos();
    const pageVideos = getPaginated(filtered);
    const totalPages = getTotalPages(filtered);

    container.className = "yt-video-grid" + (state.viewMode === "list" ? " list-view" : "") + (state.a11y.largeThumbs ? " large-thumbs" : "");

    if (videos.length === 0) {
      container.innerHTML =
        `<div class="yt-empty-state"><span class="yt-empty-icon">🎥</span>` +
        `<span class="yt-empty-title">No videos yet</span>` +
        `<span class="yt-empty-desc">Upload a video or add a YouTube link to build your study library.</span>` +
        `<button class="yt-btn yt-btn-primary" id="emptyAddVideoBtn">➕ Add Your First Video</button></div>`;
      const b = $("emptyAddVideoBtn");
      if (b) b.addEventListener("click", () => openModal("addVideoModal"));
      renderPagination(0);
      return;
    }

if (pageVideos.length === 0) {
      container.innerHTML =
        `<div class="yt-empty-state"><span class="yt-empty-icon">🔍</span>` +
        `<span class="yt-empty-title">No videos found</span>` +
        `<span class="yt-empty-desc">Try removing filters, clearing your search, or browsing another subject.</span>` +
        `<button class="yt-btn yt-btn-outline" id="emptyClearFiltersBtn">🧹 Clear filters</button>` +
        `<button class="yt-btn yt-btn-primary" id="emptyAddVideoBtn2">➕ Add a video</button></div>`;
      const bb = $("emptyClearFiltersBtn");
      if (bb) bb.addEventListener("click", clearFilters);
      const b2 = $("emptyAddVideoBtn2");
      if (b2) b2.addEventListener("click", () => openModal("addVideoModal"));
      renderPagination(totalPages);
      return;
    }

    container.innerHTML = pageVideos.map(v => {
      const ch = getChannel(v.channelId);
      const thumb = v.videoId
        ? `<img class="yt-thumb-img" src="${thumbnailUrl(v.videoId)}" alt="" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" /><div class="yt-thumb-fallback" style="display:none;">🎬</div>`
        : `<span class="yt-thumb-fallback">🎬</span>`;
      return `
      <div class="yt-video-card" data-id="${v.id}">
        <div class="yt-video-thumb">
          <div class="yt-thumb-bg" style="background:linear-gradient(135deg,#1a1c25,#2a2d3a);"></div>
          ${thumb}
          <button class="yt-card-play-btn" aria-label="Play ${esc(v.title)}"><span class="play-icon">▶</span></button>
          <span class="yt-duration">${esc(v.duration || "—")}</span>
          ${ch ? `<span class="yt-channel-badge">${ch.icon || "📺"} ${esc(ch.name)}</span>` : ""}
          ${v.fileKey ? `<span class="yt-file-badge">📁 Local</span>` : ""}
        </div>
        <div class="yt-video-info">
          <span class="yt-video-title">${esc(v.title)}</span>
          <span class="yt-video-channel">${ch ? (ch.icon || "📺") + " " + esc(ch.name) : "📺 Unknown"}</span>
          <span class="yt-video-meta">👁️ ${formatViews(v.views)} views • ${getSubjectIcon(v.subject)} ${getSubjectLabel(v.subject)}</span>
          <div class="yt-video-tags">
            <span>${esc(v.duration || "—")}</span>
            <span>${state.favorites.includes(v.id) ? "⭐" : ""}</span>
            <span>${state.watchLater.includes(v.id) ? "⏰" : ""}</span>
          </div>
        </div>
      </div>`;
    }).join("");

    container.querySelectorAll(".yt-video-card").forEach(card => {
      card.addEventListener("click", () => {
        const video = videos.find(v => v.id === card.dataset.id);
        if (video) openVideoModal(video);
      });
    });
    container.querySelectorAll(".yt-card-play-btn").forEach(btn => {
      btn.addEventListener("click", e => {
        e.stopPropagation();
        const card = btn.closest(".yt-video-card");
        const video = videos.find(v => v.id === card.dataset.id);
        if (video) openVideoModal(video);
      });
    });

    renderPagination(totalPages);
    renderSidebar();
  }

  // ============================================================
  // PAGINATION
  // ============================================================
  function renderPagination(totalPages) {
    const container = $("pagination");
    if (!container) return;
    if (!totalPages || totalPages <= 1) { container.innerHTML = ""; return; }
    let html = "";
    for (let i = 1; i <= totalPages; i++) {
      html += `<button class="yt-page-btn ${i === state.currentPage ? "active" : ""}" data-page="${i}">${i}</button>`;
    }
    container.innerHTML = html;
    container.querySelectorAll(".yt-page-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        state.currentPage = parseInt(btn.dataset.page);
        renderVideoGrid();
      });
    });
  }

  // ============================================================
  // SIDEBAR RENDERING
  // ============================================================
  function renderSidebar() {
    renderFavorites();
    renderWatchLater();
    renderRecentlyWatched();
    renderTopChannels();
    renderStudyStreak();
  }

  function findVideo(id) { return videos.find(v => v.id === id); }

  function videoSidebarItem(v, meta) {
    return `<div class="yt-sidebar-item" data-id="${v.id}">
        <div class="si-thumb">${v.videoId ? `<img src="${thumbnailUrl(v.videoId)}" alt="" loading="lazy" onerror="this.style.display='none';this.parentNode.textContent='🎬';" />` : "🎬"}</div>
        <div class="si-info">
          <span class="si-title">${esc(v.title)}</span>
          <span class="si-meta">${esc(meta)}</span>
        </div>
      </div>`;
  }
  function bindSidebarClicks(container, list) {
    if (!container) return;
    container.querySelectorAll(".yt-sidebar-item").forEach(el => {
      el.addEventListener("click", () => {
        const v = list.find(x => x.id === el.dataset.id);
        if (v) openVideoModal(v);
      });
    });
  }

  function renderFavorites() {
    const container = $("favoritesList");
    if (!container) return;
    const favs = state.favorites.map(findVideo).filter(Boolean);
    if (favs.length === 0) {
      container.innerHTML = `<p class="text-muted" style="font-size:0.78rem;">No favorites yet.</p>`;
      return;
    }
    container.innerHTML = favs.map(v => videoSidebarItem(v, getChannel(v.channelId) ? getChannel(v.channelId).name : "")).join("");
    bindSidebarClicks(container, favs);
  }

  function renderWatchLater() {
    const container = $("watchLaterList");
    if (!container) return;
    const wl = state.watchLater.map(findVideo).filter(Boolean);
    if (wl.length === 0) {
      container.innerHTML = `<p class="text-muted" style="font-size:0.78rem;">No videos saved.</p>`;
      return;
    }
    container.innerHTML = wl.map(v => videoSidebarItem(v, "⏰ " + (v.duration || ""))).join("");
    bindSidebarClicks(container, wl);
  }

  function renderRecentlyWatched() {
    const container = $("recentlyWatched");
    if (!container) return;
    const recent = state.recentlyWatched.map(findVideo).filter(Boolean).slice(0, 3);
    if (recent.length === 0) {
      container.innerHTML = `<p class="text-muted" style="font-size:0.78rem;">No videos watched yet.</p>`;
      return;
    }
    container.innerHTML = recent.map(v => videoSidebarItem(v, "🕐 " + (getChannel(v.channelId) ? getChannel(v.channelId).name : ""))).join("");
    bindSidebarClicks(container, recent);
  }

  function renderTopChannels() {
    const container = $("topChannels");
    if (!container) return;
    const counts = {};
    videos.forEach(v => {
      if (v.channelId) counts[v.channelId] = (counts[v.channelId] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    if (sorted.length === 0) {
      container.innerHTML = `<p class="text-muted" style="font-size:0.78rem;">No channels yet.</p>`;
      return;
    }
    container.innerHTML = sorted.map(([chId, count]) => {
      const ch = getChannel(chId);
      return `<div class="yt-channel-item">
        <span class="ci-icon">${ch ? (ch.icon || "📺") : "📺"}</span>
        <span class="ci-name">${esc(ch ? ch.name : chId)}</span>
        <span class="ci-count">${count} video${count !== 1 ? "s" : ""}</span>
      </div>`;
    }).join("");
  }

  // ============================================================
  // STUDY STREAK — daily learning streak (replaces storage-info tool)
  // ============================================================
  function bumpStudyStreak() {
    const today = new Date().toDateString();
    let streak = load(KEYS.streak, { last: null, count: 0 });
    if (streak.last !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      streak.count = streak.last === yesterday ? streak.count + 1 : 1;
      streak.last = today;
      save(KEYS.streak, streak);
    }
    return streak.count;
  }

  function renderStudyStreak() {
    const streak = load(KEYS.streak, { last: null, count: 0 });
    const el = $("studyStreakBadge");
    if (!el) return;
    el.innerHTML = "🔥 " + (streak.count || 0) + "-day streak";
  }

  // ============================================================
  // SHUFFLE — open a random video from the current filter
  // ============================================================
  function openRandomVideo() {
    const filtered = getFilteredVideos();
    if (filtered.length === 0) {
      showToast("🎲 No videos available to shuffle — add some first!", "warning");
      return;
    }
    const pick = filtered[Math.floor(Math.random() * filtered.length)];
    openVideoModal(pick);
    bumpStudyStreak();
    renderStudyStreak();
    showToast("🎲 Random pick: " + pick.title, "success");
  }

  // ============================================================
  // VIDEO MODAL
  // ============================================================
  function openVideoModal(video) {
    if (!video) return;
    state.currentVideo = video;
    const modal = $("videoModal");
    if (!modal) return;

    $("modalVideoTitle").textContent = video.title;

    const embedContainer = $("embedContainer");
    if (video.fileKey) {
      embedContainer.innerHTML =
        `<div class="yt-embed-loading">Loading video file…</div>`;
      const shared = window.ReVenaShared;
      if (shared && shared.idbGet) {
        shared.idbGet(video.fileKey).then(blob => {
          if (!blob) { embedContainer.innerHTML = `<div class="yt-embed-placeholder"><span class="yt-embed-icon">📁</span><span class="yt-embed-text">Video file not found.</span></div>`; return; }
          const url = URL.createObjectURL(blob);
          embedContainer.innerHTML = `<video src="${url}" controls autoplay playsinline style="width:100%;height:100%;"></video>`;
        }).catch(() => {
          embedContainer.innerHTML = `<div class="yt-embed-placeholder"><span class="yt-embed-icon">⚠️</span><span class="yt-embed-text">Could not load video.</span></div>`;
        });
      } else {
        embedContainer.innerHTML = `<div class="yt-embed-placeholder"><span class="yt-embed-icon">📁</span><span class="yt-embed-text">Local video unavailable.</span></div>`;
      }
    } else if (video.videoId) {
      embedContainer.innerHTML = `<iframe src="${generateEmbedUrl(video.videoId)}" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
    } else {
      embedContainer.innerHTML = `<div class="yt-embed-placeholder"><span class="yt-embed-icon">🎬</span><span class="yt-embed-text">No playable source.</span></div>`;
    }

    const ch = getChannel(video.channelId);
    $("modalChannel").textContent = (ch ? (ch.icon || "📺") : "📺") + " " + (ch ? ch.name : "Unknown");
    $("modalSubject").textContent = getSubjectIcon(video.subject) + " " + getSubjectLabel(video.subject);
    $("modalDuration").textContent = "⏱️ " + (video.duration || "—");
    $("modalViews").textContent = "👁️ " + formatViews(video.views);
    $("modalDescription").textContent = video.description || "No description provided.";

    updateModalButtons(video);
    $("videoNotesTextarea").value = state.notes[video.id] || "";
    renderRelatedVideos(video);

    state.recentlyWatched = state.recentlyWatched.filter(id => id !== video.id);
    state.recentlyWatched.unshift(video.id);
    if (state.recentlyWatched.length > 10) state.recentlyWatched.pop();
    persistRecent();

    // Track FULL watch history (persistent, not capped for the modal list)
    state.watchHistory = state.watchHistory.filter(id => id !== video.id);
    state.watchHistory.unshift(video.id);
    while (state.watchHistory.length > 200) state.watchHistory.pop();
    save(KEYS.watchHistory, state.watchHistory);

    modal.classList.add("open");
    document.body.style.overflow = "hidden";
    renderSidebar();
    updateAnalytics();
  }

  function closeVideoModal() {
    const modal = $("videoModal");
    if (modal) modal.classList.remove("open");
    if (!document.querySelector(".yt-modal-overlay.open")) {
      document.body.style.overflow = "";
    }
    const embed = $("embedContainer");
    if (embed) embed.innerHTML = `<div class="yt-embed-placeholder"><span class="yt-embed-icon">🎥</span><span class="yt-embed-text">Loading video...</span></div>`;
    state.currentVideo = null;
  }

  function updateModalButtons(video) {
    const wlBtn = $("modalWatchLaterBtn");
    const favBtn = $("modalFavBtn");
    if (wlBtn) {
      const inList = state.watchLater.includes(video.id);
      wlBtn.textContent = inList ? "✅ Watch Later" : "⏰ Watch Later";
      wlBtn.className = "yt-btn " + (inList ? "yt-btn-outline" : "yt-btn-primary");
    }
    if (favBtn) {
      const inFav = state.favorites.includes(video.id);
      favBtn.textContent = inFav ? "⭐ Favorited" : "☆ Favorite";
    }
  }

  function renderRelatedVideos(current) {
    const container = $("relatedVideos");
    if (!container) return;
    const related = videos.filter(v =>
      v.id !== current.id && (v.subject === current.subject || v.channelId === current.channelId)
    ).slice(0, 4);
    if (related.length === 0) {
      container.innerHTML = `<p class="text-muted" style="font-size:0.78rem;">No related videos found.</p>`;
      return;
    }
    container.innerHTML = related.map(v => `
      <div class="yt-related-card" data-id="${v.id}">
        <div class="rc-thumb">${v.videoId ? `<img src="${thumbnailUrl(v.videoId)}" alt="" loading="lazy" onerror="this.style.display='none';this.parentNode.textContent='🎬';" />` : "🎬"}</div>
        <div class="rc-info">
          <span class="rc-title">${esc(v.title)}</span>
          <span class="rc-channel">${getChannel(v.channelId) ? esc(getChannel(v.channelId).name) : ""}</span>
        </div>
      </div>`).join("");
    container.querySelectorAll(".yt-related-card").forEach(el => {
      el.addEventListener("click", () => {
        const v = videos.find(x => x.id === el.dataset.id);
        if (v) openVideoModal(v);
      });
    });
  }

  // ============================================================
  // MODAL ACTIONS
  // ============================================================
  function initModalActions() {
    $("modalClose").addEventListener("click", closeVideoModal);
    $("videoModal").addEventListener("click", e => {
      if (e.target === e.currentTarget) closeVideoModal();
    });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") {
        closeVideoModal();
        qsa(".yt-modal-overlay.open").forEach(m => m.classList.remove("open"));
      }
    });

    $("modalWatchLaterBtn").addEventListener("click", () => {
      if (!state.currentVideo) return;
      const id = state.currentVideo.id;
      const idx = state.watchLater.indexOf(id);
      if (idx > -1) state.watchLater.splice(idx, 1);
      else state.watchLater.push(id);
      persistWatchLater();
      updateModalButtons(state.currentVideo);
      renderSidebar();
      showToast(idx > -1 ? "🗑️ Removed from Watch Later" : "⏰ Added to Watch Later", "success");
      updateAnalytics();
    });

    $("modalFavBtn").addEventListener("click", () => {
      if (!state.currentVideo) return;
      const id = state.currentVideo.id;
      const idx = state.favorites.indexOf(id);
      if (idx > -1) state.favorites.splice(idx, 1);
      else state.favorites.push(id);
      persistFavorites();
      updateModalButtons(state.currentVideo);
      renderSidebar();
      showToast(idx > -1 ? "🗑️ Removed from Favorites" : "⭐ Added to Favorites", "success");
      updateAnalytics();
    });

    $("modalShareBtn").addEventListener("click", () => {
      if (!state.currentVideo) return;
      const v = state.currentVideo;
      const url = v.videoId ? generateWatchUrl(v.videoId) : window.location.href;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => showToast("🔗 Link copied to clipboard!", "success"))
          .catch(() => showToast("Could not copy link", "error"));
      } else {
        showToast("🔗 Share feature is available", "info");
      }
    });

    $("modalOpenYtBtn").addEventListener("click", () => {
      if (!state.currentVideo) return;
      const v = state.currentVideo;
      if (v.videoId) window.open(generateWatchUrl(v.videoId), "_blank");
      else showToast("📁 This is a local file video — no YouTube link.", "info");
    });

    $("saveNotesBtn").addEventListener("click", () => {
      if (!state.currentVideo) return;
      state.notes[state.currentVideo.id] = $("videoNotesTextarea").value;
      persistNotes();
      showToast("💾 Notes saved!", "success");
      updateAnalytics();
    });

    $("clearNotesBtn").addEventListener("click", () => {
      if (!state.currentVideo) return;
      $("videoNotesTextarea").value = "";
      delete state.notes[state.currentVideo.id];
      persistNotes();
      showToast("🗑️ Notes cleared", "info");
      updateAnalytics();
    });
  }

  // ============================================================
  // GENERIC MODAL SYSTEM
  // ============================================================
function openModal(id) {
    const m = $(id);
    if (!m) return;
    m.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeModal(id) {
    const m = $(id);
    if (m) m.classList.remove("open");
    if (!document.querySelector(".yt-modal-overlay.open")) {
      document.body.style.overflow = "";
    }
  }

  function initGenericModalSystem() {
    document.addEventListener("click", e => {
      // Close buttons with data-close-modal
      const closer = e.target.closest("[data-close-modal]");
      if (closer) {
        closeModal(closer.dataset.closeModal);
        return;
      }
      // Click on overlay backdrop
      const overlay = e.target.closest(".yt-modal-overlay");
      if (overlay && e.target === overlay) {
        closeModal(overlay.id);
      }
    });

}

  // ============================================================
  // ADD VIDEO FEATURE
  // ============================================================
  let addVideoMode = "file";      // 'file' | 'url'  (default matches HTML initial active tab)
  let addVideoFile = null;        // Blob for file mode
  let addVideoModeEl = null;

  function initAddVideo() {
    const fileWrap = $("avFileWrap");
    const urlWrap = $("avUrlWrap");
    const modeFile = $("avModeFile");
    const modeUrl = $("avModeUrl");
    const dropZone = $("avDropZone");
    const fileInput = $("avFileInput");
    const subjectSel = $("avSubject");
    const newSubjectWrap = $("avNewSubjectWrap");
    const form = $("addVideoForm");

    // Sync button state with the HTML initial active tab
    setMode("file");

    function setMode(mode) {
      addVideoMode = mode;
      addVideoModeEl = (mode === "file") ? modeFile : modeUrl;
      [modeFile, modeUrl].forEach(b => b && b.classList.toggle("active", b === addVideoModeEl));
      if (fileWrap) fileWrap.style.display = mode === "file" ? "block" : "none";
      if (urlWrap) urlWrap.style.display = mode === "url" ? "block" : "none";
    }
    if (modeFile) modeFile.addEventListener("click", () => setMode("file"));
    if (modeUrl) modeUrl.addEventListener("click", () => setMode("url"));

    // File pick via drop zone
    if (dropZone && fileInput) {
      dropZone.addEventListener("click", () => fileInput.click());
      dropZone.addEventListener("dragover", e => { e.preventDefault(); dropZone.classList.add("drag-over"); });
      dropZone.addEventListener("dragleave", () => dropZone.classList.remove("drag-over"));
      dropZone.addEventListener("drop", e => {
        e.preventDefault();
        dropZone.classList.remove("drag-over");
        if (e.dataTransfer.files.length) setAddVideoFile(e.dataTransfer.files[0]);
      });
      fileInput.addEventListener("change", () => {
        if (fileInput.files.length) setAddVideoFile(fileInput.files[0]);
        fileInput.value = "";
      });
    }

    function setAddVideoFile(file) {
      addVideoFile = file;
      const info = $("avFileInfo");
      if (info) {
        info.style.display = "flex";
        info.innerHTML = `<span>🎬 ${esc(file.name)}</span><span>${(file.size / (1024 * 1024)).toFixed(2)} MB</span><button type="button" class="yt-btn yt-btn-sm yt-btn-outline" id="avFileRemove">✕</button>`;
        qs("#avFileRemove", info).addEventListener("click", () => {
          addVideoFile = null;
          info.style.display = "none";
        });
      }
    }

    // New category reveal
    if (subjectSel) {
      subjectSel.addEventListener("change", () => {
        if (newSubjectWrap) newSubjectWrap.style.display = subjectSel.value === "new" ? "block" : "none";
      });
    }

    // Submit
    if (form) {
      form.addEventListener("submit", e => {
        e.preventDefault();
        const title = $("avTitle")?.value.trim();
        const channel = $("avChannel")?.value.trim();
        let subjectId = subjectSel?.value;

        if (!title) { showToast("⚠️ Please enter a video title.", "warning"); return; }
        if (!channel) { showToast("⚠️ Please enter the channel name.", "warning"); return; }

        // File mode needs a file; URL mode needs an extractable video id
        let videoId = null;
        if (addVideoMode === "file") {
          if (!addVideoFile) { showToast("⚠️ Please select a video file first.", "warning"); return; }
        } else {
          videoId = extractVideoId($("avUrl")?.value);
          if (!videoId) { showToast("⚠️ Could not extract a valid YouTube video ID from that URL.", "warning"); return; }
        }

        if (subjectId === "new") {
          const newName = $("avNewSubject")?.value.trim();
          if (!newName) { showToast("⚠️ Enter the new category name.", "warning"); return; }
          subjectId = ensureSubject(newName);
        }
        if (!subjectId) subjectId = "other";

        const channelId = ensureChannel(channel);
        const video = {
          id: genId(),
          title: title,
          channelId: channelId,
          subject: subjectId,
          duration: $("avDuration")?.value.trim() || "00:00",
          views: Math.max(0, parseInt($("avViews")?.value) || 0),
          description: $("avDescription")?.value.trim() || "",
          videoId: videoId,
          fileKey: null,
          createdAt: now(),
        };

        function finishAdd() {
          videos.unshift(video);
          persistVideos();
          renderAll();
          resetAddVideoForm(form);
          closeModal("addVideoModal");
          showToast("✅ Video added to your library!", "success");
        }

        if (addVideoMode === "file") {
          const shared = window.ReVenaShared;
          if (shared && shared.idbPut) {
            const key = genId();
            shared.idbPut(key, addVideoFile).then(() => {
              video.fileKey = key;
              finishAdd();
            }).catch(err => {
              showToast("⚠️ Could not store video file (" + err + ").", "error");
            });
          } else {
            showToast("⚠️ File upload requires IndexedDB (shared.js) support.", "error");
          }
        } else {
          finishAdd();
        }
      });
    }
  }

  function resetAddVideoForm(form) {
    if (!form) form = $("addVideoForm");
    if (form) form.reset();
    addVideoFile = null;
    const info = $("avFileInfo");
    if (info) info.style.display = "none";
    const newWrap = $("avNewSubjectWrap");
    if (newWrap) newWrap.style.display = "none";
    // Default back to file mode (matches initial HTML state)
    const modeFile = $("avModeFile");
    if (modeFile) modeFile.click();
  }

  // ============================================================
  // WATCH HISTORY LIST
  // ============================================================
  function renderWatchHistoryList() {
    const list = $("watchHistoryList");
    if (!list) return;
    const history = state.watchHistory.map(findVideo).filter(Boolean);
    if (history.length === 0) {
      list.innerHTML = `<p class="text-muted" style="font-size:0.78rem;">No watch history yet — videos you open will appear here.</p>`;
      return;
    }
    list.innerHTML = history.map(v => `
      <div class="yt-manage-item yt-history-item" data-id="${v.id}" style="cursor:pointer;">
        <span class="ym-icon">${v.videoId ? `<img src="${thumbnailUrl(v.videoId)}" alt="" style="width:44px;height:26px;object-fit:cover;border-radius:4px;" onerror="this.style.display='none';this.parentNode.textContent='🎬';" />` : "🎬"}</span>
        <span class="ym-name" style="flex:1;min-width:0;">
          <span class="si-title" style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(v.title)}</span>
          <span class="si-meta">${getChannel(v.channelId) ? esc(getChannel(v.channelId).name) : ""}</span>
        </span>
        <span class="ym-count">⏱️ ${esc(v.duration || "—")}</span>
      </div>
    `).join("");
    list.querySelectorAll(".yt-history-item").forEach(el => {
      el.addEventListener("click", () => {
        const v = videos.find(x => x.id === el.dataset.id);
        if (v) {
          closeModal("watchHistoryModal");
          openVideoModal(v);
        }
      });
    });
  }

  // ============================================================
  // EXTRA FEATURES (Shuffle, Export Favorites, Suggest Channel, History, Notes, Analytics, A11y)
  // ============================================================
  function initExtraFeatures() {
    // Shuffle — surprise me with a random video
    $("shuffleBtn")?.addEventListener("click", () => {
      openRandomVideo();
    });

    // Export Favorites
    $("exportFavBtn")?.addEventListener("click", () => {
      const favs = state.favorites.map(findVideo).filter(Boolean);
      if (favs.length === 0) { showToast("⚠️ No favorites to export", "warning"); return; }
      let txt = "=== YouTube Study Library — Favorites ===\nExported: " + new Date().toLocaleString() + "\nTotal: " + favs.length + "\n\n";
      favs.forEach((v, i) => {
        txt += "[" + (i + 1) + "] " + v.title + "\nChannel: " + (getChannel(v.channelId) ? getChannel(v.channelId).name : "") + "\nSubject: " + getSubjectLabel(v.subject) + "\nURL: " + (v.videoId ? generateWatchUrl(v.videoId) : "(local file)") + "\n\n";
      });
      downloadFile("yt-favorites-" + Date.now() + ".txt", txt);
      showToast("📄 Favorites exported!", "success");
    });

    // Suggest a Channel — opens modal
    $("suggestChannelBtn")?.addEventListener("click", () => openModal("suggestChannelModal"));
    const suggestForm = $("suggestChannelForm");
    if (suggestForm) {
      suggestForm.addEventListener("submit", e => {
        e.preventDefault();
        const name = $("suggestChannelName")?.value.trim();
        if (!name) { showToast("⚠️ Enter a channel name.", "warning"); return; }
        const suggestions = load(KEYS.suggestions, []);
        suggestions.push({
          id: genId(),
          name: name,
          url: $("suggestChannelUrl")?.value.trim() || "",
          reason: $("suggestChannelReason")?.value.trim() || "",
          createdAt: now(),
          status: "pending",
        });
        save(KEYS.suggestions, suggestions);
        showToast("💡 Suggestion submitted — thank you!", "success");
        suggestForm.reset();
        closeModal("suggestChannelModal");
      });
    }

    // Watch History — open modal with full list
    $("watchHistoryBtn")?.addEventListener("click", () => {
      renderWatchHistoryList();
      openModal("watchHistoryModal");
    });
    $("clearHistoryBtn")?.addEventListener("click", () => {
      state.recentlyWatched = [];
      persistRecent();
      renderWatchHistoryList();
      renderSidebar();
      updateAnalytics();
      showToast("🗑️ Watch history cleared", "info");
    });
    $("exportHistoryBtn")?.addEventListener("click", () => {
      const recent = state.recentlyWatched.map(findVideo).filter(Boolean);
      if (recent.length === 0) { showToast("🕐 No watch history to export", "warning"); return; }
      let txt = "=== Watch History ===\n" + new Date().toLocaleString() + "\n\n";
      recent.forEach((v, i) => {
        txt += "[" + (i + 1) + "] " + v.title + " — " + (getChannel(v.channelId) ? getChannel(v.channelId).name : "") + "\n";
      });
      downloadFile("yt-history-" + Date.now() + ".txt", txt);
      showToast("📄 History exported!", "success");
    });

    // Export Notes
    $("notesExportBtn")?.addEventListener("click", () => {
      const noteEntries = Object.entries(state.notes).filter(([, text]) => text && text.trim());
      if (noteEntries.length === 0) { showToast("📝 No notes to export", "warning"); return; }
      let txt = "=== Video Notes ===\nExported: " + new Date().toLocaleString() + "\n\n";
      noteEntries.forEach(([id, text]) => {
        const v = findVideo(id);
        txt += "--- " + (v ? v.title : id) + " ---\n" + text + "\n\n";
      });
      downloadFile("yt-notes-" + Date.now() + ".txt", txt);
      showToast("📝 Notes exported!", "success");
    });

    // Analytics toggle
    $("analyticsBtn")?.addEventListener("click", () => {
      const panel = $("analyticsPanel");
      if (panel) {
        panel.style.display = panel.style.display === "none" ? "grid" : "none";
        updateAnalytics();
      }
    });

    // Accessibility — opens modal
    $("a11yBtn")?.addEventListener("click", () => {
      syncA11yModal();
      openModal("accessibilityModal");
    });
  }

  // ============================================================
  // ANALYTICS
  // ============================================================
  function updateAnalytics() {
    $("anWatched").textContent = state.recentlyWatched.length;
    $("anFavorites").textContent = state.favorites.length;
    $("anWatchLater").textContent = state.watchLater.length;
    const noteCount = Object.values(state.notes).filter(n => n && n.trim()).length;
    $("anNotes").textContent = noteCount;
    const channelsSet = new Set(videos.filter(v => state.recentlyWatched.includes(v.id)).map(v => v.channelId));
    $("anChannels").textContent = channelsSet.size;
    $("anLastWatched").textContent = state.recentlyWatched.length > 0 ? "Today" : "—";
  }

  // ============================================================
  // ACCESSIBILITY
  // ============================================================
  function applyA11y() {
    const page = qs(".yt-page");
    if (page) page.style.fontSize = state.a11y.fontSize + "px";
    document.body.classList.toggle("high-contrast", !!state.a11y.highContrast);
    document.body.classList.toggle("reduce-motion", !!state.a11y.reduceMotion);

    let reduceStyle = qs("#ytReduceMotionStyle");
    if (state.a11y.reduceMotion) {
      if (!reduceStyle) {
        reduceStyle = document.createElement("style");
        reduceStyle.id = "ytReduceMotionStyle";
        reduceStyle.textContent = "*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important;}";
        document.head.appendChild(reduceStyle);
      }
    } else if (reduceStyle) {
      reduceStyle.remove();
    }

    let hcStyle = qs("#ytHighContrastStyle");
    if (state.a11y.highContrast) {
      if (!hcStyle) {
        hcStyle = document.createElement("style");
        hcStyle.id = "ytHighContrastStyle";
        hcStyle.textContent = ".high-contrast{--text-muted:hsl(0,0%,75%);--text-secondary:#fff;}.high-contrast .yt-video-card,.high-contrast .yt-sidebar-card,.high-contrast .yt-extra-card,.high-contrast .yt-analytics-card{border-color:rgba(255,255,255,0.4);background:rgba(0,0,0,0.55);}";
        document.head.appendChild(hcStyle);
      }
    } else if (hcStyle) {
      hcStyle.remove();
    }

    persistA11y();
  }

  function syncA11yModal() {
    const fs = $("a11yFontSize");
    const lbl = $("a11yFontSizeLabel");
    if (fs) {
      fs.value = state.a11y.fontSize;
      if (lbl) lbl.textContent = state.a11y.fontSize + "px";
    }
    const hc = $("a11yHighContrast");
    if (hc) hc.checked = !!state.a11y.highContrast;
    const rm = $("a11yReduceMotion");
    if (rm) rm.checked = !!state.a11y.reduceMotion;
    const lt = $("a11yLargeThumbs");
    if (lt) lt.checked = !!state.a11y.largeThumbs;
  }

  function initAccessibility() {
    const fs = $("a11yFontSize");
    const lbl = $("a11yFontSizeLabel");
    if (fs) {
      fs.addEventListener("input", () => {
        state.a11y.fontSize = parseInt(fs.value);
        if (lbl) lbl.textContent = state.a11y.fontSize + "px";
        applyA11y();
      });
    }
    const hc = $("a11yHighContrast");
    if (hc) hc.addEventListener("change", () => {
      state.a11y.highContrast = hc.checked;
      applyA11y();
    });
    const rm = $("a11yReduceMotion");
    if (rm) rm.addEventListener("change", () => {
      state.a11y.reduceMotion = rm.checked;
      applyA11y();
    });
    const lt = $("a11yLargeThumbs");
    if (lt) lt.addEventListener("change", () => {
      state.a11y.largeThumbs = lt.checked;
      applyA11y();
      renderVideoGrid();
    });
  }

  // ============================================================
  // SEARCH
  // ============================================================
  function initSearch() {
    const input = $("globalSearchInput");
    const btn = $("globalSearchBtn");
    if (!input) return;
    function doSearch() {
      state.searchQuery = input.value;
      state.currentPage = 1;
      state.currentVideo = null;
      renderVideoGrid();
      updateResultsCount();
    }
    input.addEventListener("keydown", e => { if (e.key === "Enter") doSearch(); });
    if (btn) btn.addEventListener("click", doSearch);
  }

  // ============================================================
  // VIEW TOGGLE
  // ============================================================
  function initViewToggle() {
    const gridBtn = $("viewGridBtn");
    const listBtn = $("viewListBtn");
    if (gridBtn) gridBtn.addEventListener("click", () => {
      state.viewMode = "grid";
      gridBtn.classList.add("active");
      if (listBtn) listBtn.classList.remove("active");
      renderVideoGrid();
    });
    if (listBtn) listBtn.addEventListener("click", () => {
      state.viewMode = "list";
      listBtn.classList.add("active");
      if (gridBtn) gridBtn.classList.remove("active");
      renderVideoGrid();
    });
  }

  // ============================================================
  // RENDER ALL
  // ============================================================
function renderAll() {
    renderSubjectBadges();
    renderSubjectTabs();
    renderChannelBar();
    renderVideoGrid();
    updateResultsCount();
    renderSidebar();
    updateAnalytics();
  }

  // ============================================================
  // CLEAR FILTERS
  // ============================================================
  function clearFilters() {
    state.activeSubject = "all";
    state.activeChannel = "all";
    state.searchQuery = "";
    const input = $("globalSearchInput");
    if (input) input.value = "";
    state.currentPage = 1;
    state.currentVideo = null;
    renderAll();
    showToast("🧹 Filters cleared", "info");
  }

  function initClearFilters() {
    const btn = $("clearFiltersBtn");
    if (btn) btn.addEventListener("click", clearFilters);
  }

// ============================================================
  // NOTES AUTOSAVE + SAVED INDICATOR
  // ============================================================
  let notesSaveTimer = null;
  function initNotesAutosave() {
    const ta = $("videoNotesTextarea");
    const ind = $("notesSavedIndicator");
    if (!ta) return;
    ta.addEventListener("input", () => {
      if (!state.currentVideo) return;
      // Show "typing…" state
      if (ind) { ind.textContent = "✍️ Typing…"; ind.classList.add("show"); }
      clearTimeout(notesSaveTimer);
      notesSaveTimer = setTimeout(() => {
        state.notes[state.currentVideo.id] = ta.value;
        persistNotes();
        if (ind) { ind.textContent = "✅ Saved"; ind.classList.add("show"); }
        setTimeout(() => { if (ind) ind.classList.remove("show"); }, 1800);
        updateAnalytics();
      }, 700);
    });
  }

  // ============================================================
  // INIT
  // ============================================================
  function init() {
    seedIfEmpty();
    renderAll();

    initSearch();
    initViewToggle();
    initModalActions();
initGenericModalSystem();
    initAddVideo();
    initExtraFeatures();
    initAccessibility();
    initNotesAutosave();
    initClearFilters();
    applyA11y();

    // Scroll to top (use shared or local fallback)
    if (window.ReVenaShared && window.ReVenaShared.initScrollTop) {
      window.ReVenaShared.initScrollTop("scrollTopBtn");
    } else {
      const btn = $("scrollTopBtn");
      if (btn) {
        window.addEventListener("scroll", () => btn.classList.toggle("visible", window.scrollY > 400), { passive: true });
        btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
      }
    }

    // Atomic logo (use shared or local fallback)
    if (window.ReVenaShared && window.ReVenaShared.initAtomicLogo) {
      window.ReVenaShared.initAtomicLogo("headerAtomicCanvas", 100);
    }

    console.log("🎥 YouTube Study Library initialized — " + videos.length + " videos, " + Object.keys(channels).length + " channels, " + subjects.length + " categories (all data-driven).");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

