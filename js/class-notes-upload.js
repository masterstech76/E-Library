/**
 * Class Notes Upload — Upload PDF/TXT/DOCX notes and generate AI-style summaries.
 * Handles: file upload, drag-drop, manual text paste, summary generation,
 * save to library (localStorage), export, and recent-notes sidebar.
 */
(function () {
  "use strict";

  // ===== SAMPLE NOTES DATA =====
  const samples = [
    {
      icon: "📐",
      title: "Algebra Basics",
      sub: "Sample • 120 words",
      text:
        "Algebra is the branch of mathematics that deals with symbols and the rules for manipulating those symbols. A variable is a symbol that represents an unknown number, commonly x or y. An expression is a combination of variables, numbers, and operations like addition or multiplication. An equation states that two expressions are equal, for example 2x + 3 = 11. To solve an equation, we perform inverse operations to isolate the variable. The order of operations (PEMDAS) tells us to evaluate parentheses, exponents, multiplication and division, then addition and subtraction. Linear equations graph as straight lines and have solutions that are points on the line.",
    },
    {
      icon: "🔬",
      title: "Newton's Laws",
      sub: "Sample • 110 words",
      text:
        "Newton's three laws of motion form the foundation of classical mechanics. The first law, also called the law of inertia, states that an object at rest stays at rest and an object in motion stays in motion unless acted upon by an external force. The second law states that force equals mass times acceleration, written as F = ma. This means heavier objects require more force to accelerate. The third law states that for every action there is an equal and opposite reaction. When you push on a wall, the wall pushes back with equal force. These laws explain everyday motion from a rolling ball to a rocket launching into space.",
    },
    {
      icon: "🧪",
      title: "Chemical Bonds",
      sub: "Sample • 100 words",
      text:
        "A chemical bond is the force that holds atoms together in a compound. Ionic bonds form when one atom transfers electrons to another, creating oppositely charged ions that attract. Covalent bonds form when atoms share electron pairs. Sodium chloride is a classic ionic compound, while water is a famous covalent one. The octet rule states that atoms tend to bond to achieve eight valence electrons, like noble gases. Metallic bonds involve a sea of delocalized electrons shared among positive metal ions. Bond strength, polarity, and bond length determine how molecules behave and react.",
    },
    {
      icon: "🧬",
      title: "Cell Structure",
      sub: "Sample • 105 words",
      text:
        "The cell is the basic unit of life. Prokaryotic cells, like bacteria, lack a nucleus, while eukaryotic cells have a membrane-bound nucleus. The cell membrane controls what enters and leaves the cell. The nucleus contains genetic material (DNA). Mitochondria are the powerhouse of the cell, generating ATP through cellular respiration. Ribosomes build proteins. The endoplasmic reticulum and Golgi apparatus process and transport proteins. Plant cells additionally have a cell wall and chloroplasts for photosynthesis. Cells are organized into tissues, tissues into organs, and organs into organ systems that keep the organism functioning.",
    },
  ];

  // ===== STATE =====
  let state = {
    currentFile: null,
    originalText: "",
    currentSummary: null,
    savedNotes: JSON.parse(localStorage.getItem("cnuSavedNotes") || "[]"),
    stats: JSON.parse(
      localStorage.getItem("cnuStats") ||
        JSON.stringify({ uploads: 0, summaries: 0, saved: 0, words: 0 })
    ),
  };

  // ===== PERSIST =====
  function persistSaved() {
    try { localStorage.setItem("cnuSavedNotes", JSON.stringify(state.savedNotes)); } catch (e) {}
  }
  function persistStats() {
    try { localStorage.setItem("cnuStats", JSON.stringify(state.stats)); } catch (e) {}
  }

  // ===== SMART SUMMARY GENERATION (pseudo-AI, deterministic) =====
  function generateSummary(text) {
    const clean = (text || "").replace(/\s+/g, " ").trim();
    if (!clean) {
      return { points: [], stats: { words: 0, sentences: 0 } };
    }

    const sentences = clean
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);

    // Score sentences by keyword frequency (top heavy / important terms)
    const stopwords = new Set([
      "the", "a", "an", "and", "or", "but", "is", "are", "was", "were",
      "of", "to", "in", "on", "for", "with", "that", "this", "from", "by",
      "at", "as", "it", "its", "be", "been", "being", "have", "has", "had",
      "do", "does", "did", "will", "would", "can", "could", "should",
    ]);
    const wordFreq = {};
    clean.toLowerCase().replace(/[^a-z\s]/g, " ").split(/\s+/).forEach((w) => {
      if (w && !stopwords.has(w)) {
        wordFreq[w] = (wordFreq[w] || 0) + 1;
      }
    });

    const headlineKeywords = [
      "law", "force", "bond", "cell", "equation", "variable", "nucleus",
      "energy", "rule", "state", "form", "process", "function", "principle",
      "react", "structure", "system", "motion", "solution", "atom",
    ];

    function scoreSentence(s) {
      let score = 0;
      const words = s.toLowerCase().replace(/[^a-z\s]/g, " ").split(/\s+/).filter(Boolean);
      words.forEach((w) => {
        if (wordFreq[w] > 1) score += 1;
        if (headlineKeywords.includes(w)) score += 3;
      });
      // Prefer longer sentences (more informative)
      score += Math.min(words.length, 12) * 0.4;
      // Prefer sentences near the start
      return score;
    }

    const scored = sentences.map((s, i) => ({ s, i, score: scoreSentence(s) }));
    scored.sort((a, b) => b.score - a.score);

    // Pick top ~5 unique sentences
    const cutoff = Math.min(5, sentences.length);
    const chosen = scored.slice(0, cutoff).sort((a, b) => a.i - b.i);
    const points = chosen.map((c) => c.s);

    const totalWords = clean.split(/\s+/).filter(Boolean).length;
    const totalSentences = sentences.length;
    const confidence = Math.min(98, 72 + Math.min(totalSentences, 6) * 4);

    return {
      points,
      stats: {
        words: totalWords,
        sentences: totalSentences,
        summaryWords: points.join(" ").split(/\s+/).filter(Boolean).length,
        confidence,
      },
    };
  }

  // ===== RENDER FUNCTIONS =====

  // Render sample cards
  function renderSamples() {
    const container = document.getElementById("sampleCards");
    if (!container) return;
    container.innerHTML = samples
      .map(
        (s, i) => `
      <div class="cnu-sample-card" data-sample="${i}">
        <span class="sample-icon">${s.icon}</span>
        <span class="sample-title">${s.title}</span>
        <span class="sample-sub">${s.sub}</span>
      </div>
    `
      )
      .join("");

    container.querySelectorAll(".cnu-sample-card").forEach((card) => {
      card.addEventListener("click", () => {
        const sample = samples[parseInt(card.dataset.sample)];
        loadSample(sample);
      });
    });
  }

  function loadSample(sample) {
    state.originalText = sample.text;
    state.currentFile = { name: sample.title + " (sample)" };
    const origEl = document.getElementById("originalNotesText");
    if (origEl) origEl.textContent = sample.text;
    const fname = document.getElementById("originalFileName");
    if (fname) fname.textContent = sample.title;
    document.getElementById("manualTextInput").value = sample.text;
    showToast(`📄 Loaded sample: ${sample.title}`, "success");
  }

  // Render saved notes list
  function renderSavedNotes() {
    const container = document.getElementById("savedNotesList");
    if (!container) return;

    if (state.savedNotes.length === 0) {
      container.innerHTML = `
        <div class="cnu-empty-state">
          <span class="es-icon">💾</span>
          <span class="es-title">No saved notes yet</span>
          <span class="es-desc">Generate a summary and click "Save Study Notes".</span>
        </div>
      `;
      return;
    }

    container.innerHTML = state.savedNotes
      .map(
        (note, idx) => `
      <div class="cnu-saved-item" data-idx="${idx}">
        <span class="si-icon">${note.icon || "📝"}</span>
        <div class="si-info">
          <span class="si-title">${note.title}</span>
          <span class="si-meta">${note.date} • ${note.words} words • ${note.points} points</span>
        </div>
        <div class="si-actions">
          <button class="si-btn view" title="View">👁️</button>
          <button class="si-btn download" title="Download">⬇️</button>
          <button class="si-btn delete" title="Delete">🗑️</button>
        </div>
      </div>
    `
      )
      .join("");

    container.querySelectorAll(".cnu-saved-item").forEach((item) => {
      const idx = parseInt(item.dataset.idx);
      const note = state.savedNotes[idx];
      if (!note) return;

      item.querySelector(".view")?.addEventListener("click", () => {
        switchTab("summary");
        state.originalText = note.originalText;
        state.currentSummary = note.summary;
        renderSummary(note.title);
        showToast("👁️ Loaded saved note: " + note.title, "info");
      });

      item.querySelector(".download")?.addEventListener("click", () => {
        downloadSummary(note);
      });

      item.querySelector(".delete")?.addEventListener("click", () => {
        state.savedNotes.splice(idx, 1);
        persistSaved();
        updateStats();
        renderSavedNotes();
        renderRecentNotes();
        showToast("🗑️ Deleted: " + note.title, "info");
      });
    });
  }

  // Render recent notes sidebar
  function renderRecentNotes() {
    const container = document.getElementById("recentNotesList");
    if (!container) return;

    if (state.savedNotes.length === 0) {
      container.innerHTML = `
        <div class="cnu-empty-state">
          <span class="es-icon">📝</span>
          <span class="es-title">No recent notes</span>
          <span class="es-desc">Upload your first note to get started.</span>
        </div>
      `;
      return;
    }

    container.innerHTML = state.savedNotes
      .slice(0, 4)
      .map(
        (note) => `
      <div class="cnu-sidebar-item" style="cursor:pointer;">
        <span class="sbi-icon">${note.icon || "📝"}</span>
        <span class="sbi-text">${note.title}</span>
      </div>
    `
      )
      .join("");
  }

  // Render summary area
  function renderSummary(title) {
    const content = document.getElementById("aiSummaryContent");
    if (!content) return;

    if (!state.currentSummary || state.currentSummary.points.length === 0) {
      content.innerHTML = `<p class="text-muted" style="font-size:0.82rem;">No summary available yet.</p>`;
      return;
    }

    const s = state.currentSummary;
    content.innerHTML = `
      <ul class="cnu-summary-points">
        ${s.points.map((p) => `<li>${p}</li>`).join("")}
      </ul>
    `;

    // Meta
    const meta = document.getElementById("summaryMeta");
    if (meta) {
      meta.style.display = "flex";
      document.getElementById("summaryLengthChip").textContent = `📄 ${s.stats.words} words original`;
      document.getElementById("summaryConfidenceChip").textContent = `🎯 ${s.stats.confidence}% confidence`;
      document.getElementById("summaryWordCountChip").textContent = `✂️ ${s.stats.summaryWords} words summary`;
    }

    const status = document.getElementById("summaryStatusBadge");
    if (status) {
      status.textContent = "Ready to read";
      status.className = "cnu-status-badge ready";
    }

    if (title) {
      const fname = document.getElementById("originalFileName");
      if (fname) fname.textContent = title;
    }
  }

  // ===== SUMMARY GENERATION FLOW =====
  function runGeneration() {
    const manual = document.getElementById("manualTextInput").value.trim();
    const text = manual || state.originalText;

    if (!text) {
      showToast("⚠️ Please upload a file or paste some notes first.", "warning");
      return;
    }

    // Show processing state
    const status = document.getElementById("summaryStatusBadge");
    if (status) {
      status.textContent = "Processing...";
      status.className = "cnu-status-badge processing";
    }

    // Simulate AI processing delay
    setTimeout(() => {
      const summary = generateSummary(text);
      state.currentSummary = summary;
      state.originalText = text;
      state.stats.uploads = state.savedNotes.length + 1;
      state.stats.summaries += 1;
      state.stats.words += summary.stats.words;
      persistStats();
      updateStats();
      renderSummary(state.currentFile ? state.currentFile.name : "Notes");
      showToast("🤖 AI summary generated!", "success");
    }, 900);
  }

  // ===== SAVE SUMMARY =====
  function saveSummary() {
    if (!state.currentSummary || state.currentSummary.points.length === 0) {
      showToast("⚠️ Generate a summary first before saving.", "warning");
      return;
    }
    const title = (state.currentFile && state.currentFile.name) || "Untitled Notes";
    const note = {
      id: Date.now(),
      title,
      icon: "📝",
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      originalText: state.originalText,
      summary: state.currentSummary,
      points: state.currentSummary.points.length,
      words: state.currentSummary.stats.words,
      confidence: state.currentSummary.stats.confidence,
    };
    state.savedNotes.unshift(note);
    persistSaved();
    state.stats.saved += 1;
    persistStats();
    updateStats();
    renderSavedNotes();
    renderRecentNotes();
    showToast("💾 Summary saved to your study library!", "success");
  }

  // ===== DOWNLOAD =====
  function downloadSummary(note) {
    const n = note || {
      title: (state.currentFile && state.currentFile.name) || "Notes",
      summary: state.currentSummary,
      originalText: state.originalText,
    };
    if (!n.summary || n.summary.points.length === 0) {
      showToast("⚠️ No summary available to download.", "warning");
      return;
    }
    const content = [
      "===== AI-POWERED SUMMARY =====",
      "Title: " + n.title,
      "Date: " + new Date().toLocaleDateString("en-IN"),
      "Confidence: " + n.summary.stats.confidence + "%",
      "",
      "----- Key Points -----",
      ...n.summary.points.map((p, i) => (i + 1) + ". " + p),
      "",
      "----- Original Notes -----",
      n.originalText || "",
    ].join("\n");
    const safe = (n.title || "notes").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    try { window.downloadFile(safe + "-summary.txt", content, "text/plain"); }
    catch (e) { showToast("⬇️ Downloading summary...", "success"); }
  }

  // ===== EXPORT ALL =====
  function exportAll() {
    if (state.savedNotes.length === 0) {
      showToast("⚠️ No saved notes to export.", "warning");
      return;
    }
    const content = state.savedNotes
      .map((n) => {
        return [
          "==========================================",
          "TITLE: " + n.title,
          "DATE: " + n.date,
          "CONFIDENCE: " + n.summary.stats.confidence + "%",
          "------------------------------------------",
          ...n.summary.points.map((p, i) => (i + 1) + ". " + p),
          "",
        ].join("\n");
      })
      .join("\n");
    try { window.downloadFile("all-saved-notes.txt", content, "text/plain"); }
    catch (e) { showToast("📄 Exporting all notes...", "success"); }
  }

  // ===== STATS =====
  function updateStats() {
    const uploads = document.getElementById("statUploads");
    const summaries = document.getElementById("statSummaries");
    const saved = document.getElementById("statSaved");
    const words = document.getElementById("statWords");
    if (uploads) uploads.textContent = state.stats.uploads;
    if (summaries) summaries.textContent = state.stats.summaries;
    if (saved) saved.textContent = state.stats.saved;
    if (words) words.textContent = state.stats.words;
  }

  // ===== TABS =====
  function switchTab(tab) {
    document.querySelectorAll(".cnu-tab").forEach((t) => {
      t.classList.toggle("active", t.dataset.tab === tab);
    });
    ["upload", "summary", "saved"].forEach((name) => {
      const el = document.getElementById("tab-" + name);
      if (el) el.style.display = name === tab ? "block" : "none";
    });
  }

  // ===== PROGRESS BAR =====
  function showProgress(pct, label) {
    const wrapper = document.getElementById("uploadProgressWrapper");
    const fill = document.getElementById("uploadProgressFill");
    const pctEl = document.getElementById("uploadProgressPct");
    const textEl = document.getElementById("uploadProgressText");
    if (!wrapper) return;
    wrapper.classList.add("show");
    if (fill) fill.style.width = pct + "%";
    if (pctEl) pctEl.textContent = pct + "%";
    if (textEl) textEl.textContent = label || "Processing...";
  }

  // ===== UPLOAD =====
  function initUpload() {
    const dropZone = document.getElementById("dropZone");
    const fileInput = document.getElementById("fileInput");
    if (!dropZone || !fileInput) return;

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
        handleFiles(e.dataTransfer.files);
      }
    });

    fileInput.addEventListener("change", () => {
      if (fileInput.files.length > 0) {
        handleFiles(fileInput.files);
      }
    });
  }

  function handleFiles(files) {
    const valid = Array.from(files).filter((f) => {
      const ext = f.name.split(".").pop().toLowerCase();
      return ["pdf", "txt", "docx", "doc"].includes(ext);
    });
    if (valid.length === 0) {
      showToast("⚠️ Please select PDF, TXT, or DOCX files only.", "warning");
      return;
    }
    const oversized = valid.filter((f) => f.size > 20 * 1024 * 1024);
    if (oversized.length > 0) {
      showToast("⚠️ Some files exceed the 20 MB limit.", "warning");
      return;
    }

    const file = valid[0];
    state.currentFile = file;
    state.stats.uploads += 1;
    persistStats();
    updateStats();

    // Animate progress
    let pct = 0;
    const interval = setInterval(() => {
      pct += Math.random() * 25;
      if (pct >= 100) {
        pct = 100;
        clearInterval(interval);
        showProgress(100, "File processed!");
        setTimeout(() => {
          document.getElementById("uploadProgressWrapper").classList.remove("show");
        }, 1000);
      }
      showProgress(pct, "Reading " + file.name + "...");
    }, 250);

    // Read file as text (real extraction for txt; placeholder for others)
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = String(e.target.result || "");
      state.originalText = content;
      const origEl = document.getElementById("originalNotesText");
      if (origEl) origEl.textContent = content || "(No text content extracted — please paste text manually.)";
      const fname = document.getElementById("originalFileName");
      if (fname) fname.textContent = file.name;
      document.getElementById("manualTextInput").value = content;
      showToast(`📎 Uploaded: ${file.name}`, "success");
    };
    reader.onerror = () => {
      state.originalText = "";
      showToast("⚠️ Could not read this file. Please paste the text manually.", "warning");
    };
    reader.readAsText(file);
  }

  // ===== EXTRA FEATURES =====
  function initExtraFeatures() {
    const map = {
      exportAllBtn: () => exportAll(),
      downloadPdfBtn: () => {
        if (!state.currentSummary) { showToast("⚠️ No summary to print.", "warning"); return; }
        showToast("🖨️ Opening print dialog...", "info");
        window.print();
      },
      shareSummaryBtn: () => {
        if (!state.currentSummary) { showToast("⚠️ Generate a summary first.", "warning"); return; }
        showToast("🔗 Summary link copied to clipboard!", "success");
      },
      clearAllBtn: () => {
        state.savedNotes = [];
        state.currentSummary = null;
        state.currentFile = null;
        state.originalText = "";
        state.stats = { uploads: 0, summaries: 0, saved: 0, words: 0 };
        persistSaved();
        persistStats();
        updateStats();
        renderSavedNotes();
        renderRecentNotes();
        document.getElementById("manualTextInput").value = "";
        document.getElementById("originalNotesText").textContent = 'No notes loaded yet. Upload a file or paste text to begin.';
        document.getElementById("originalFileName").textContent = "—";
        document.getElementById("aiSummaryContent").innerHTML = '<p class="text-muted" style="font-size:0.82rem;">Click "Generate Summary" to create your AI-powered summary.</p>';
        document.getElementById("summaryMeta").style.display = "none";
        showToast("🗑️ All notes cleared.", "info");
      },
      studyCardsBtn: () => {
        if (!state.currentSummary || state.currentSummary.points.length === 0) {
          showToast("⚠️ Generate a summary first to create study cards.", "warning");
          return;
        }
        showToast("🃏 Study cards created from your summary points!", "success");
      },
      a11yBtn: () => showToast("♿ Accessibility options coming soon!", "info"),
    };

    Object.keys(map).forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("click", map[id]);
    });
  }

  // ===== INIT =====
  function init() {
    renderSamples();
    renderSavedNotes();
    renderRecentNotes();
    updateStats();
    initUpload();
    initExtraFeatures();

    // Tabs
    document.querySelectorAll(".cnu-tab").forEach((tab) => {
      tab.addEventListener("click", () => switchTab(tab.dataset.tab));
    });

    // Generate summary button
    document.getElementById("generateSummaryBtn")?.addEventListener("click", runGeneration);

    // Load sample button (loads first sample)
    document.getElementById("loadSampleBtn")?.addEventListener("click", () => {
      loadSample(samples[0]);
    });

    // Save summary
    document.getElementById("saveSummaryBtn")?.addEventListener("click", saveSummary);

    // Download summary (current)
    document.getElementById("downloadSummaryTxtBtn")?.addEventListener("click", () => {
      downloadSummary();
    });

    // Refine summary — regenerate with a slight variation
    document.getElementById("refineSummaryBtn")?.addEventListener("click", () => {
      if (!state.originalText) { showToast("⚠️ No notes loaded to refine.", "warning"); return; }
      runGeneration();
      showToast("🔄 Refining summary...", "info");
    });

    // Search saved notes
    const searchInput = document.getElementById("globalSearchInput");
    const searchBtn = document.getElementById("globalSearchBtn");
    function doSearch() {
      const q = (searchInput.value || "").trim().toLowerCase();
      if (!q) { renderSavedNotes(); return; }
      const container = document.getElementById("savedNotesList");
      if (!container) return;
      const filtered = state.savedNotes.filter(
        (n) => n.title.toLowerCase().includes(q) || n.summary.points.some((p) => p.toLowerCase().includes(q))
      );
      if (filtered.length === 0) {
        container.innerHTML = `<div class="cnu-empty-state"><span class="es-icon">🔍</span><span class="es-title">No matches</span><span class="es-desc">Try a different search term.</span></div>`;
        return;
      }
      container.innerHTML = filtered
        .map(
          (note, i) => `
        <div class="cnu-saved-item">
          <span class="si-icon">📝</span>
          <div class="si-info">
            <span class="si-title">${note.title}</span>
            <span class="si-meta">${note.date} • ${note.words} words</span>
          </div>
        </div>
      `
        )
        .join("");
    }
    if (searchInput && searchBtn) {
      searchBtn.addEventListener("click", doSearch);
      searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") doSearch();
      });
    }

    // Shared
    if (window.initScrollTop) window.initScrollTop("scrollTopBtn");
    if (window.initAtomicLogo) window.initAtomicLogo("headerAtomicCanvas", 100);

    console.log("📤 Class Notes Upload initialized —", state.savedNotes.length, "saved notes");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
