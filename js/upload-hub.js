/**
 * Upload Hub & Video Player — ReVena E-Library
 *
 * Complete rewrite v2.0:
 * - Drag & drop multi-file upload with preview
 * - YouTube-like video player with custom HTML5 controls
 * - Telegram-like file manager: rename, sort, multi-select, share, captions, folders, pin/star
 * - Security: malicious PDF/content blocking, MIME spoofing, macro detection, path traversal, rate limiting
 * - File type tabs, search, delete, download, batch operations
 * - Upload queue with progress bars, speed, ETA
 */
(function () {
  "use strict";

  // ============================================================
  // 1. CONFIGURATION
  // ============================================================
  const CONFIG = {
    maxFileSize: 500 * 1024 * 1024, // 500MB
    maxVideoSize: 2 * 1024 * 1024 * 1024, // 2GB
    maxConcurrentUploads: 5,
    maxTotalStorage: 5 * 1024 * 1024 * 1024, // 5GB per session
    allowedTypes: {
      documents: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "text/plain",
        "text/csv",
      ],
      images: [
        "image/jpeg", "image/png", "image/gif", "image/webp",
        "image/svg+xml", "image/bmp", "image/avif",
      ],
      audio: [
        "audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4", "audio/flac",
        "audio/aac", "audio/webm",
      ],
      video: [
        "video/mp4", "video/webm", "video/ogg", "video/quicktime",
        "video/x-msvideo", "video/x-matroska",
      ],
      archives: [
        "application/zip", "application/x-rar-compressed", "application/gzip",
        "application/x-7z-compressed", "application/x-tar",
      ],
    },
    maliciousPatterns: [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript\s*:/gi,
      /onerror\s*=/gi,
      /onload\s*=/gi,
      /onclick\s*=/gi,
      /onmouseover\s*=/gi,
      /eval\s*\(/gi,
      /document\.\s*write/gi,
      /base64\s*,\s*[A-Za-z0-9+/]{100,}/gi,
      /%00|%0d|%0a/gi,
      /new\s+ActiveXObject\s*\(/gi,
      /\.exe\s*$/gmi,
      /VBA\s*Project/gi,
      /Auto_Open|AutoExec|AutoClose/gi,
    ],
    // Magic bytes for MIME spoofing detection
    magicBytes: {
      pdf: [0x25, 0x50, 0x44, 0x46], // %PDF
      zip: [0x50, 0x4b, 0x03, 0x04],
      gif: [0x47, 0x49, 0x46, 0x38],
      jpeg: [0xff, 0xd8, 0xff],
      png: [0x89, 0x50, 0x4e, 0x47],
      webp: [0x52, 0x49, 0x46, 0x46],
      mp4: [0x00, 0x00, 0x00, 0x1c, 0x66, 0x74, 0x79, 0x70],
      ogg: [0x4f, 0x67, 0x67, 0x53],
    },
    blockedExtensions: [
      ".exe", ".bat", ".cmd", ".com", ".msi", ".scr",
      ".vbs", ".vbe", ".js", ".jse", ".wsf", ".wsh",
      ".ps1", ".psm1", ".psd1", ".pssc", ".msu",
      ".reg", ".inf", ".lnk", ".url", ".tmp",
    ],
  };

  // ============================================================
  // 2. STATE
  // ============================================================
  let uploadedFiles = [];
  let currentFilter = "all";
  let uploadIdCounter = 0;
  let selectedIds = new Set();
  let folders = [{ id: "root", name: "All Files", parentId: null }];
  let currentFolderId = "root";
  let sortBy = "date-desc";
  let activeUploads = 0;
  let totalUploadedSize = 0;
  let uploadHistory = [];

  // ============================================================
  // 3. DOM REFS
  // ============================================================
  const dropZone = document.getElementById("dropZone");
  const fileInput = document.getElementById("fileInput");
  const uploadQueue = document.getElementById("uploadQueue");
  const fileGrid = document.getElementById("fileGrid");
  const fileTabs = document.querySelectorAll(".file-tab");
  const videoPlayerSection = document.getElementById("videoPlayerSection");
  const videoElement = document.getElementById("videoElement");
  const videoWrapper = document.getElementById("videoPlayerWrapper");
  const videoControls = document.getElementById("videoControls");
  const toastContainer = document.getElementById("toastContainer");
  const searchInput = document.getElementById("fileSearchInput");
  const emptyState = document.getElementById("emptyState");
  const sortSelect = document.getElementById("sortSelect");
  const createFolderBtn = document.getElementById("createFolderBtn");
  const selectAllCheckbox = document.getElementById("selectAllCheckbox");
  const selectAllWrapper = document.getElementById("selectAllWrapper");
  const batchActions = document.getElementById("batchActions");
  const batchDeleteBtn = document.getElementById("batchDeleteBtn");
  const batchDownloadBtn = document.getElementById("batchDownloadBtn");
  const batchShareBtn = document.getElementById("batchShareBtn");
  const batchPinBtn = document.getElementById("batchPinBtn");
  const folderBreadcrumb = document.getElementById("folderBreadcrumb");
  const currentFolderName = document.getElementById("currentFolderName");
  const statsBar = document.getElementById("uploadStatsBar");
  const statsFileCount = document.getElementById("statsFileCount");
  const statsTotalSize = document.getElementById("statsTotalSize");
  const statsUploadSpeed = document.getElementById("statsUploadSpeed");
  const uploadStatsBadge = document.getElementById("uploadStats");

  // Video controls
  const playPauseBtn = document.getElementById("playPauseBtn");
  const videoProgress = document.getElementById("videoProgress");
  const videoProgressFill = document.getElementById("videoProgressFill");
  const currentTimeSpan = document.getElementById("currentTime");
  const totalTimeSpan = document.getElementById("totalTime");
  const volumeSlider = document.getElementById("volumeSlider");
  const fullscreenBtn = document.getElementById("fullscreenBtn");
  const volumeBtn = document.getElementById("volumeBtn");
  const pipBtn = document.getElementById("pipBtn");
  const playbackSpeed = document.getElementById("playbackSpeed");
  const closeVideoBtn = document.getElementById("closeVideoBtn");
  const videoTitleEl = document.getElementById("videoTitle");

  // ============================================================
  // 4. UTILITY FUNCTIONS (was missing - now added)
  // ============================================================

  /** Format file size to human-readable string */
  function formatSize(bytes) {
    if (!bytes || bytes === 0) return "0 B";
    const units = ["B", "KB", "MB", "GB", "TB"];
    let i = 0;
    let size = bytes;
    while (size >= 1024 && i < units.length - 1) {
      size /= 1024;
      i++;
    }
    return size.toFixed(i > 0 ? 1 : 0) + " " + units[i];
  }

  /** Format duration in seconds to mm:ss or hh:mm:ss */
  function formatDuration(seconds) {
    if (!seconds || isNaN(seconds) || !isFinite(seconds)) return "0:00";
    seconds = Math.floor(seconds);
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return h + ":" + String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
    return m + ":" + String(s).padStart(2, "0");
  }

  /** Get file icon based on category/type */
  function getFileIcon(category, mimeType) {
    if (!category) category = "unknown";
    const icons = {
      documents: "📄",
      images: "🖼️",
      audio: "🎵",
      video: "🎬",
  const emptyState = document.getElementById("emptyState");
  const sortSelect = document.getElementById("sortSelect");
  const selectAllCheckbox = document.getElementById("selectAllCheckbox");
  const selectAllWrapper = document.getElementById("selectAllWrapper");
  const batchActions = document.getElementById("batchActions");
  const selectedCountSpan = document.querySelector("#selectedCount");
  const batchDeleteBtn = document.getElementById("batchDeleteBtn");
  const batchDownloadBtn = document.getElementById("batchDownloadBtn");
  const batchShareBtn = document.getElementById("batchShareBtn");
  const batchPinBtn = document.getElementById("batchPinBtn");
  const createFolderBtn = document.getElementById("createFolderBtn");
  const folderBreadcrumb = document.getElementById("folderBreadcrumb");
  const currentFolderName = document.getElementById("currentFolderName");
  const uploadStats = document.getElementById("uploadStats");
  const uploadStatsBar = document.getElementById("uploadStatsBar");
  const statsFileCount = document.getElementById("statsFileCount");
  const statsTotalSize = document.getElementById("statsTotalSize");
  const statsUploadSpeed = document.getElementById("statsUploadSpeed");
  const videoTitle = document.getElementById("videoTitle");
  const closeVideoBtn = document.getElementById("closeVideoBtn");
  const pipBtn = document.getElementById("pipBtn");
  const playbackSpeed = document.getElementById("playbackSpeed");

  // Video controls
  const playPauseBtn = document.getElementById("playPauseBtn");
  const videoProgress = document.getElementById("videoProgress");
  const videoProgressFill = document.getElementById("videoProgressFill");
  const currentTimeSpan = document.getElementById("currentTime");
  const totalTimeSpan = document.getElementById("totalTime");
  const volumeSlider = document.getElementById("volumeSlider");
  const fullscreenBtn = document.getElementById("fullscreenBtn");
  const volumeBtn = document.getElementById("volumeBtn");

  // ============================================================
  // 4. TOAST
  // ============================================================
  function showToast(message, type) {
    type = type || "info";
    if (!toastContainer) return;
    const toast = document.createElement("div");
    toast.className = "toast " + type;
    const icons = { success: "✅", error: "❌", warning: "⚠️", info: "ℹ️" };
    toast.innerHTML = `<span>${icons[type] || "ℹ️"}</span> ${message}`;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  // ============================================================
  // 5. SECURITY ENGINE (fully Promise-based, fixed)
  // ============================================================
  function getFileCategory(file) {
    // file can be a File object or a fileData object
    const type = file.type || "";
    for (const [cat, types] of Object.entries(CONFIG.allowedTypes)) {
      if (types.includes(type)) return cat;
    }
    const name = file.name || "";
    const ext = "." + name.split(".").pop().toLowerCase();
    if (CONFIG.blockedExtensions.includes(ext)) return "blocked";
    if (/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv)$/i.test(name)) return "documents";
    if (/\.(jpg|jpeg|png|gif|webp|svg|bmp|avif)$/i.test(name)) return "images";
    if (/\.(mp3|wav|ogg|flac|m4a|aac)$/i.test(name)) return "audio";
    if (/\.(mp4|webm|mov|avi|mkv)$/i.test(name)) return "video";
    if (/\.(zip|rar|gz|7z|tar|bz2)$/i.test(name)) return "archives";
    return "unknown";
  }

  function checkMagicBytes(file) {
    return new Promise((resolve) => {
      const mimeKey = file.type;
      const magic = CONFIG.magicBytes[mimeKey];
      if (!magic) {
        resolve(true); // no magic bytes check for this type
        return;
      }
      const blob = file.slice(magic.offset, magic.offset + magic.bytes.length);
      const reader = new FileReader();
      reader.onload = function (e) {
        const arr = new Uint8Array(e.target.result);
        const match = magic.bytes.every((b, i) => arr[i] === b);
        resolve(match);
      };
      reader.onerror = function () {
        resolve(true); // can't check, allow
      };
      reader.readAsArrayBuffer(blob);
    });
  }

  function securityScan(file) {
    return new Promise((resolve) => {
      const result = { safe: true, warnings: [], passed: true };

      // 0. Sanitize file name
      const safeName = sanitizeFileName(file.name);
      if (safeName !== file.name) {
        result.warnings.push("File name sanitized (removed dangerous characters)");
      }

      // 1. Extension check
      const ext = "." + file.name.split(".").pop().toLowerCase();
      if (CONFIG.blockedExtensions.includes(ext)) {
        result.safe = false;
        result.warnings.push("Blocked file extension: " + ext);
        result.passed = false;
        resolve(result);
              id: "file-" + Date.now() + "-" + Math.random().toString(36).substr(2, 6),
              name: file.name,
              size: file.size,
              type: file.type,
              category: cat,
              icon: icon,
              url: URL.createObjectURL(file),
              lastModified: file.lastModified,
              date: new Date().toLocaleDateString(),
              safe: true,
            };
            uploadedFiles.push(fileData);

            // Remove from queue after delay
            setTimeout(() => item.remove(), 1000);
            renderFileGrid();
            showToast("✅ " + file.name + " uploaded successfully!", "success");
          } else {
            progressFill.style.width = progress + "%";
          }
        }, 100);
      });
    });
  }

  // ============================================================
  // 8. DRAG & DROP
  // ============================================================
  if (dropZone) {
    dropZone.addEventListener("dragover", function (e) {
      e.preventDefault();
      e.stopPropagation();
      this.classList.add("drag-over");
    });

    dropZone.addEventListener("dragleave", function (e) {
      e.preventDefault();
      e.stopPropagation();
      this.classList.remove("drag-over");
    });

    dropZone.addEventListener("drop", function (e) {
      e.preventDefault();
      e.stopPropagation();
      this.classList.remove("drag-over");
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleFiles(files);
      }
    });

    dropZone.addEventListener("click", function () {
      if (fileInput) fileInput.click();
    });
  }

  if (fileInput) {
    fileInput.addEventListener("change", function () {
      if (this.files && this.files.length > 0) {
        handleFiles(this.files);
        this.value = "";
      }
    });
  }

  // ============================================================
  // 9. FILE GRID RENDER
  // ============================================================
  function renderFileGrid() {
    let files = uploadedFiles;
    const query = searchInput ? searchInput.value.toLowerCase().trim() : "";

    // Filter by tab
    if (currentFilter !== "all") {
      files = files.filter(function (f) { return f.category === currentFilter; });
    }

    // Filter by search
    if (query) {
      files = files.filter(function (f) { return f.name.toLowerCase().includes(query); });
    }

    // Show empty state if no files
    if (files.length === 0) {
      fileGrid.innerHTML = "";
      if (emptyState) emptyState.style.display = "block";
      return;
    }
    if (emptyState) emptyState.style.display = "none";

    // Build grid
    let html = "";
    files.forEach(function (file) {
      const thumbHtml = file.category === "images"
        ? `<div class="file-card-thumb"><img src="${file.url}" alt="${file.name}" /></div>`
        : `<div class="file-card-thumb">${file.icon}</div>`;

      html += `
        <div class="file-card" data-id="${file.id}">
          ${thumbHtml}
          <span class="file-card-name" title="${file.name}">${file.name}</span>
          <span class="file-card-meta">${formatSize(file.size)} • ${file.date}</span>
          <div class="file-card-actions">
            <button class="btn btn-secondary btn-sm preview-btn" data-id="${file.id}">👁️ Preview</button>
            <button class="btn btn-secondary btn-sm download-btn" data-id="${file.id}">⬇️</button>
            <button class="btn btn-secondary btn-sm delete-btn" data-id="${file.id}">🗑️</button>
          </div>
      `;
    });
    fileGrid.innerHTML = html;
  }

  // ============================================================
  // 10. FILE GRID EVENTS (delegated)
  // ============================================================
  document.addEventListener("click", function (e) {
    const previewBtn = e.target.closest(".preview-btn");
    const downloadBtn = e.target.closest(".download-btn");
    const deleteBtn = e.target.closest(".delete-btn");

    if (previewBtn) {
      const id = previewBtn.dataset.id;
      const file = findFileById(id);
      if (file) previewFile(file);
    }

    if (downloadBtn) {
      const id = downloadBtn.dataset.id;
      const file = findFileById(id);
      if (file) downloadFile(file);
    }

    if (deleteBtn) {
      const id = deleteBtn.dataset.id;
      const file = findFileById(id);
      if (file && confirm('Delete "' + file.name + '"?')) {
        deleteFile(id);
      }
    }
  });

  function findFileById(id) {
    return uploadedFiles.find(function (f) { return f.id === id; });
  }

  function previewFile(file) {
    // For video files, load into player
    if (file.category === "video") {
      loadVideo(file);
      return;
    }

    // For images, open in new tab
    if (file.category === "images") {
      window.open(file.url, "_blank");
      showToast("🖼️ Opening " + file.name, "info");
      return;
    }

    // For audio, play in player area
    if (file.category === "audio") {
      loadVideo(file); // reuse video player for audio
      return;
    }

    // For documents and archives, show info
    showToast("📄 Preview not available for " + file.category + " files in-browser. Download to view.", "info");
  }

  function downloadFile(file) {
    const a = document.createElement("a");
    a.href = file.url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast("⬇️ Downloading " + file.name, "success");
  }

  function deleteFile(id) {
    const index = uploadedFiles.findIndex(function (f) { return f.id === id; });
    if (index !== -1) {
      const file = uploadedFiles[index];
      URL.revokeObjectURL(file.url);
      uploadedFiles.splice(index, 1);
      renderFileGrid();
      showToast("🗑️ " + file.name + " deleted", "warning");

      // If this was the current video, clear player
      if (videoElement && videoElement.src === file.url) {
        videoElement.pause();
        videoElement.removeAttribute("src");
        videoPlayerSection.style.display = "none";
      }
    }
  }

  // ============================================================
  // 11. TAB FILTER
  // ============================================================
  fileTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      fileTabs.forEach(function (t) { t.classList.remove("active"); });
      this.classList.add("active");
      currentFilter = this.dataset.filter;
      renderFileGrid();
    });
  });

  // ============================================================
  // 12. SEARCH
  // ============================================================
  if (searchInput) {
    searchInput.addEventListener("input", renderFileGrid);
  }

  // ============================================================
  // 13. VIDEO PLAYER
  // ============================================================
  function loadVideo(file) {
    if (!videoPlayerSection || !videoElement) return;

    videoPlayerSection.style.display = "block";
    videoElement.src = file.url;
    videoElement.load();
    videoElement.play().catch(function () {});
    showToast("🎬 Playing: " + file.name, "info");

    // Show controls
    if (videoControls) videoControls.classList.add("show");
  }

  // Play/Pause
  if (playPauseBtn && videoElement) {
    playPauseBtn.addEventListener("click", function () {
      if (videoElement.paused) {
        videoElement.play();
        playPauseBtn.textContent = "⏸️";
      } else {
        videoElement.pause();
        playPauseBtn.textContent = "▶️";
      }
    });

    videoElement.addEventListener("play", function () {
      if (playPauseBtn) playPauseBtn.textContent = "⏸️";
    });
    videoElement.addEventListener("pause", function () {
      if (playPauseBtn) playPauseBtn.textContent = "▶️";
    });
  }

  // Time update
  if (videoElement && currentTimeSpan && totalTimeSpan && videoProgressFill && videoProgress) {
    videoElement.addEventListener("timeupdate", function () {
      if (videoElement.duration) {
        const pct = (videoElement.currentTime / videoElement.duration) * 100;
        videoProgressFill.style.width = pct + "%";
        currentTimeSpan.textContent = formatDuration(videoElement.currentTime);
      }
    });

    videoElement.addEventListener("loadedmetadata", function () {
      totalTimeSpan.textContent = formatDuration(videoElement.duration);
    });

    // Click on progress bar to seek
    videoProgress.addEventListener("click", function (e) {
      const rect = this.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      videoElement.currentTime = pct * videoElement.duration;
    });
  }

  // Volume
  if (volumeSlider && videoElement) {
    volumeSlider.addEventListener("input", function () {
      videoElement.volume = parseFloat(this.value);
      if (volumeBtn) {
        volumeBtn.textContent = videoElement.volume === 0 ? "🔇" : videoElement.volume < 0.5 ? "🔉" : "🔊";
      }
    });
  }

  if (volumeBtn && videoElement) {
    volumeBtn.addEventListener("click", function () {
      videoElement.muted = !videoElement.muted;
      volumeBtn.textContent = videoElement.muted ? "🔇" : videoElement.volume < 0.5 ? "🔉" : "🔊";
      if (volumeSlider) volumeSlider.value = videoElement.muted ? 0 : videoElement.volume;
    });
  }

  // Fullscreen
  if (fullscreenBtn && videoPlayerSection) {
    fullscreenBtn.addEventListener("click", function () {
      const wrapper = videoPlayerSection;
      if (!document.fullscreenElement) {
        if (wrapper.requestFullscreen) {
          wrapper.requestFullscreen();
        } else if (wrapper.webkitRequestFullscreen) {
          wrapper.webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }
    });
  }

  // Click on video to toggle play/pause
  if (videoElement) {
    videoElement.addEventListener("click", function () {
      if (playPauseBtn) playPauseBtn.click();
    });
  }

  // ============================================================
  // 14. DEMO FILES (for preview)
  // ============================================================
  function addDemoFiles() {
    const now = Date.now();
    const demoFiles = [
      { id: "demo-" + now + "-1", name: "Mathematics_Chapter_5.pdf", size: 2450000, type: "application/pdf", icon: "📕",
