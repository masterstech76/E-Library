/**
 * Text-to-Speech Engine — Convert study notes / summaries into natural voice.
 * Uses the browser Web Speech API (SpeechSynthesis) for real TTS.
 * Handles: voice selection, speed/pitch controls, playback with progress,
 * saving audio clips metadata, download (as .txt transcript + instructions),
 * subject presets, auto-read.
 */
(function () {
  "use strict";

  // ===== STATE =====
  let state = {
    voices: [],
    currentUtterance: null,
    isPlaying: false,
    autoRead: false,
    savedClips: JSON.parse(localStorage.getItem("ttsSavedClips") || "[]"),
  };

  let progressTimer = null;

  // ===== PERSIST =====
  function persistClips() {
    try { localStorage.setItem("ttsSavedClips", JSON.stringify(state.savedClips)); } catch (e) {}
  }

  // ===== VOICE LOADING =====
  function loadVoices() {
    if (!("speechSynthesis" in window)) {
      console.warn("Web Speech API not supported in this browser.");
      const sel = document.getElementById("voiceSelect");
      if (sel) sel.innerHTML = "<option value=''>TTS not supported in this browser</option>";
      return;
    }
    state.voices = window.speechSynthesis.getVoices();
    const sel = document.getElementById("voiceSelect");
    if (!sel) return;

    if (state.voices.length === 0) {
      sel.innerHTML = "<option value=''>Loading voices...</option>";
      return;
    }

    sel.innerHTML = state.voices
      .map(
        (v, i) => `<option value="${i}" ${v.lang.startsWith("en") && v.default ? "selected" : ""}>
          ${v.name} (${v.lang})${v.default ? " • Default" : ""}
        </option>`
      )
      .join("");

    // Apply saved language preference if any
    const savedLang = localStorage.getItem("ttsLang") || "";
    if (savedLang) {
      const idx = state.voices.findIndex((v) => v.lang === savedLang);
      if (idx > -1) sel.value = String(idx);
    }
  }

  // ===== CURRENT TEXT =====
  function getText() {
    const ta = document.getElementById("ttsTextInput");
    return ta ? ta.value.trim() : "";
  }

  function updateCounts() {
    const text = getText();
    const wc = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const cc = text.length;
    const wcEl = document.getElementById("wordCount");
    const ccEl = document.getElementById("charCount");
    if (wcEl) wcEl.textContent = wc + " words";
    if (ccEl) ccEl.textContent = cc + " characters";
    return { words: wc, chars: cc };
  }

  // ===== SPEAK =====
  function speak() {
    const text = getText();
    if (!text) {
      showToast("⚠️ Please enter some text to convert to speech.", "warning");
      return;
    }
    if (!("speechSynthesis" in window)) {
      showToast("❌ Text-to-Speech is not supported in this browser. Try Chrome or Edge.", "error");
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    stopProgress();

    const utter = new SpeechSynthesisUtterance(text);
    state.currentUtterance = utter;

    // Voice
    const voiceIdx = parseInt(document.getElementById("voiceSelect").value);
    if (state.voices[voiceIdx]) {
      utter.voice = state.voices[voiceIdx];
      utter.lang = state.voices[voiceIdx].lang;
    } else {
      const lang = document.getElementById("langSelect").value;
      utter.lang = lang;
      // try to pick matching voice
      const match = state.voices.find((v) => v.lang === lang);
      if (match) utter.voice = match;
    }

    // Speed & pitch
    utter.rate = parseFloat(document.getElementById("speedSlider").value);
    utter.pitch = parseFloat(document.getElementById("pitchSlider").value);

    // Show player
    const player = document.getElementById("ttsPlayer");
    if (player) player.classList.add("show");

    const playerTitle = document.getElementById("playerTitle");
    const playerStatus = document.getElementById("playerStatus");
    if (playerTitle) playerTitle.textContent = "🔊 Speaking...";
    const preview = text.slice(0, 120) + (text.length > 120 ? "..." : "");
    if (playerStatus) playerStatus.textContent = preview;

    // Progress bar animation
    startProgress();

    // Events
    utter.onstart = () => {
      state.isPlaying = true;
      const pb = document.getElementById("playPauseBtn");
      if (pb) { pb.textContent = "⏸️"; pb.classList.add("playing"); }
      const title = document.getElementById("playerTitle");
      if (title) title.textContent = "🔊 Speaking...";
      activateWaves(true);
    };

    utter.onend = () => {
      state.isPlaying = false;
      stopProgress();
      const pb = document.getElementById("playPauseBtn");
      if (pb) { pb.textContent = "▶️"; pb.classList.remove("playing"); }
      const title = document.getElementById("playerTitle");
      if (title) title.textContent = "✅ Finished";
      activateWaves(false);
      // Auto-advance to next clip if in saved-clip play mode? not here.
    };

    utter.onerror = (e) => {
      state.isPlaying = false;
      stopProgress();
      activateWaves(false);
      const pb = document.getElementById("playPauseBtn");
      if (pb) { pb.textContent = "▶️"; pb.classList.remove("playing"); }
      if (e.error && e.error !== "canceled") {
        const title = document.getElementById("playerTitle");
        if (title) title.textContent = "⚠️ Error playing";
        showToast("⚠️ Speech was interrupted.", "warning");
      }
    };

    window.speechSynthesis.speak(utter);
    showToast("🔊 Speaking your text...", "success");
  }

  // ===== PROGRESS =====
  function startProgress() {
    stopProgress();
    const fill = document.getElementById("progressFill");
    const totalEl = document.getElementById("totalTime");
    const curEl = document.getElementById("currentTime");
    const text = getText();
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const rate = parseFloat(document.getElementById("speedSlider").value);
    // Estimate duration: ~150 wpm at 1.0x
    const estSeconds = Math.max(5, (words / (150 * rate)) * 60);
    const totalStr = formatTime(estSeconds);
    if (totalEl) totalEl.textContent = totalStr;

    let elapsed = 0;
    progressTimer = setInterval(() => {
      elapsed += 0.25;
      const pct = Math.min(100, (elapsed / estSeconds) * 100);
      if (fill) fill.style.width = pct + "%";
      if (curEl) curEl.textContent = formatTime(elapsed);
      // Sync waves
      activateWaves(true);
      if (elapsed >= estSeconds) stopProgress();
    }, 250);
  }

  function stopProgress() {
    if (progressTimer) {
      clearInterval(progressTimer);
      progressTimer = null;
    }
  }

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  function activateWaves(active) {
    const waves = document.querySelectorAll(".tts-wave");
    if (!active) {
      waves.forEach((w) => w.classList.remove("active"));
      waves.forEach((w) => { w.style.animation = "none"; });
      return;
    }
    waves.forEach((w, i) => {
      w.classList.add("active");
      w.style.animation = `wave ${0.5 + (i % 5) * 0.12}s ease-in-out infinite alternate`;
    });
  }

  // ===== PLAY / PAUSE =====
  function togglePlay() {
    if (!state.currentUtterance && !state.isPlaying) {
      speak();
      return;
    }
    if (state.isPlaying) {
      window.speechSynthesis.pause();
      state.isPlaying = false;
      stopProgress();
      const pb = document.getElementById("playPauseBtn");
      if (pb) { pb.textContent = "▶️"; pb.classList.remove("playing"); }
      activateWaves(false);
      const title = document.getElementById("playerTitle");
      if (title) title.textContent = "⏸️ Paused";
    } else {
      window.speechSynthesis.resume();
      state.isPlaying = true;
      startProgress();
      const pb = document.getElementById("playPauseBtn");
      if (pb) { pb.textContent = "⏸️"; pb.classList.add("playing"); }
      activateWaves(true);
      const title = document.getElementById("playerTitle");
      if (title) title.textContent = "🔊 Speaking...";
    }
  }

  function stopSpeech() {
    window.speechSynthesis.cancel();
    state.isPlaying = false;
    stopProgress();
    activateWaves(false);
    const pb = document.getElementById("playPauseBtn");
    if (pb) { pb.textContent = "▶️"; pb.classList.remove("playing"); }
    const title = document.getElementById("playerTitle");
    if (title) title.textContent = "⏹️ Stopped";
  }

  // ===== DOWNLOAD AUDIO =====
  function downloadAudio() {
    const text = getText();
    if (!text) {
      showToast("⚠️ No text to download.", "warning");
      return;
    }
    // Note: Real MP3 encoding isn't available client-side without heavy libs.
    // We generate a transcript file + instructions saved as an "audio script".
    const rate = document.getElementById("speedSlider").value;
    const pitch = document.getElementById("pitchSlider").value;
    const voice = document.getElementById("voiceSelect").selectedOptions[0]?.textContent || "Default voice";
    const content = [
      "===== ReVena Text-to-Speech Audio Script =====",
      "Voice: " + voice,
      "Rate: " + rate + "x",
      "Pitch: " + pitch,
      "Generated: " + new Date().toLocaleString(),
      "",
      "----- Spoken Text -----",
      text,
      "",
      "----- Instructions -----",
      "Open this file in a compatible screen reader / TTS app to generate the MP3 audio.",
    ].join("\n");
    try {
      window.downloadFile("revena-tts-script.txt", content, "text/plain");
      showToast("📄 Audio script downloaded. Use a TTS tool to render MP3.", "success");
    } catch (e) {
      showToast("⬇️ Downloading audio script...", "success");
    }
  }

  // ===== SAVE CLIP =====
  function saveClip() {
    const text = getText();
    if (!text) {
      showToast("⚠️ No text to save as a clip.", "warning");
      return;
    }
    const title = (text.slice(0, 40) || "") + (text.length > 40 ? "..." : "");
    const words = text.split(/\s+/).filter(Boolean).length;
    const clip = {
      id: Date.now(),
      title,
      text,
      lang: document.getElementById("langSelect").value,
      rate: parseFloat(document.getElementById("speedSlider").value),
      pitch: parseFloat(document.getElementById("pitchSlider").value),
      words,
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    };
    state.savedClips.unshift(clip);
    persistClips();
    renderClips();
    showToast("💾 Audio clip saved!", "success");
  }

  // ===== RENDER CLIPS =====
  function renderClips() {
    const container = document.getElementById("savedClipsList");
    if (!container) return;
    if (state.savedClips.length === 0) {
      container.innerHTML = `<p class="text-muted" style="font-size:0.78rem;">No saved clips yet.</p>`;
      return;
    }
    container.innerHTML = state.savedClips
      .map(
        (clip) => `
      <div class="tts-clip-item" data-id="${clip.id}">
        <span class="ci-icon">🎧</span>
        <div class="ci-info">
          <span class="ci-title">${clip.title}</span>
          <span class="ci-meta">${clip.date} • ${clip.words} words • ${clip.rate}x</span>
        </div>
        <button class="ci-play" title="Play">▶️</button>
      </div>
    `
      )
      .join("");

    container.querySelectorAll(".tts-clip-item").forEach((item) => {
      const clip = state.savedClips.find((c) => c.id === parseInt(item.dataset.id));
      if (!clip) return;
      item.querySelector(".ci-play").addEventListener("click", () => {
        const ta = document.getElementById("ttsTextInput");
        if (ta) ta.value = clip.text;
        const rate = document.getElementById("speedSlider");
        const pitch = document.getElementById("pitchSlider");
        if (rate) rate.value = String(clip.rate);
        if (pitch) pitch.value = String(clip.pitch);
        updateCounts();
        speak();
        showToast("🎧 Playing saved clip: " + clip.title, "info");
      });
    });
  }

  // ===== SUBJECT PRESETS =====
  function applyPreset(lang, speed, pitch) {
    const ls = document.getElementById("langSelect");
    const ss = document.getElementById("speedSlider");
    const ps = document.getElementById("pitchSlider");
    if (ls) ls.value = lang;
    if (ss) ss.value = String(speed);
    if (ps) ps.value = String(pitch);
    localStorage.setItem("ttsLang", lang);
    updateSliderLabels();
    // Try to pick a voice matching the language
    const sel = document.getElementById("voiceSelect");
    if (sel && state.voices.length) {
      const idx = state.voices.findIndex((v) => v.lang === lang);
      if (idx > -1) sel.value = String(idx);
    }
    showToast("🎙️ Voice preset applied", "success");
  }

  function updateSliderLabels() {
    const sp = document.getElementById("speedValue");
    const pt = document.getElementById("pitchValue");
    if (sp) sp.textContent = document.getElementById("speedSlider").value + "x";
    if (pt) pt.textContent = document.getElementById("pitchSlider").value;
  }

  // ===== AUTO READ =====
  function toggleAutoRead() {
    state.autoRead = !state.autoRead;
    const btn = document.getElementById("toggleAutoReadBtn");
    if (btn) {
      btn.classList.toggle("active", state.autoRead);
      if (state.autoRead) btn.style.background = "rgba(154,230,255,0.12)";
      else btn.style.background = "";
    }
    if (state.autoRead) {
      // Auto-read summary text from one-page-summaries page pattern
      // We'll auto-load a sample summary if the input is empty
      const ta = document.getElementById("ttsTextInput");
      if (ta && !ta.value.trim()) {
        ta.value =
          "Welcome to your ReVena Text to Speech engine. This is a sample study summary. " +
          "The cell is the basic unit of life. Prokaryotic cells lack a nucleus, while eukaryotic cells have a membrane-bound nucleus. " +
          "The cell membrane controls what enters and leaves the cell. Mitochondria are the powerhouse of the cell, generating energy. " +
          "Use the speed and pitch controls to customize your listening experience. Happy studying!";
        updateCounts();
      }
      setTimeout(() => {
        speak();
        showToast("📖 Auto-read enabled. Listening to your notes...", "info");
      }, 300);
    } else {
      stopSpeech();
      showToast("⏹️ Auto-read disabled.", "info");
    }
  }

  // ===== EXTRA FEATURES =====
  function initExtraFeatures() {
    const map = {
      exportClipsBtn: () => {
        if (state.savedClips.length === 0) {
          showToast("⚠️ No saved clips to export.", "warning");
          return;
        }
        const content = state.savedClips
          .map((c) => `TITLE: ${c.title}\nDATE: ${c.date}\nWORDS: ${c.words}\nRATE: ${c.rate}x\n---\n${c.text}`)
          .join("\n\n========================================\n\n");
        try { window.downloadFile("saved-audio-clips.txt", content, "text/plain"); }
        catch (e) { showToast("📄 Exporting clips list...", "success"); }
      },
      ttsSummariesBtn: () => {
        // Try to load text from localStorage if set by another page
        const summary = localStorage.getItem("revenaLastSummary") || "";
        const ta = document.getElementById("ttsTextInput");
        if (ta && summary) {
          ta.value = summary;
          updateCounts();
          showToast("📖 Loaded summary text", "info");
        } else {
          ta.value = "";
          showToast("📖 No saved summary found. Paste text to read.", "info");
        }
      },
      ttsShareBtn: () => {
        const ta = document.getElementById("ttsTextInput");
        if (!ta || !ta.value.trim()) {
          showToast("⚠️ Nothing to share yet.", "warning");
          return;
        }
        // Copy link with encoded text
        const url = window.location.origin + window.location.pathname + "?tts=" + encodeURIComponent(ta.value.slice(0, 200));
        try { navigator.clipboard.writeText(url); }
        catch (e) {}
        showToast("🔗 Share link copied to clipboard!", "success");
      },
      ttsA11yBtn: () => showToast("♿ Accessibility options coming soon!", "info"),
      ttsClearBtn: () => {
        state.savedClips = [];
        persistClips();
        renderClips();
        const ta = document.getElementById("ttsTextInput");
        if (ta) ta.value = "";
        updateCounts();
        stopSpeech();
        showToast("🗑️ All clips cleared.", "info");
      },
      ttsHelpBtn: () => {
        showToast("💡 Tip: Paste notes, choose a voice, and click Listen Now!", "info");
      },
    };
    Object.keys(map).forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("click", map[id]);
    });
  }

  // ===== URL PARAM =====
  function applyUrlParam() {
    const params = new URLSearchParams(window.location.search);
    const tts = params.get("tts");
    if (tts) {
      const ta = document.getElementById("ttsTextInput");
      if (ta) {
        ta.value = decodeURIComponent(tts);
        updateCounts();
        setTimeout(() => speak(), 400);
      }
    }
  }

  // ===== INIT =====
  function init() {
    loadVoices();
    updateCounts();
    renderClips();
    initExtraFeatures();

    // Listen for voice load (Chrome async)
    if ("speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Text input counters
    const ta = document.getElementById("ttsTextInput");
    if (ta) {
      ta.addEventListener("input", updateCounts);
    }

    // Sliders
    ["speedSlider", "pitchSlider"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("input", updateSliderLabels);
    });

    // Voice / lang select
    document.getElementById("langSelect")?.addEventListener("change", (e) => {
      localStorage.setItem("ttsLang", e.target.value);
      const sel = document.getElementById("voiceSelect");
      if (sel && state.voices.length) {
        const idx = state.voices.findIndex((v) => v.lang === e.target.value);
        if (idx > -1) sel.value = String(idx);
      }
    });

    // Presets
    document.querySelectorAll(".tts-preset-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".tts-preset-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        applyPreset("en-US", parseFloat(btn.dataset.speed), parseFloat(btn.dataset.pitch));
      });
    });

    // Subject presets
    document.querySelectorAll(".tts-voice-preset-item").forEach((item) => {
      item.addEventListener("click", () => {
        applyPreset(item.dataset.lang, parseFloat(item.dataset.speed), parseFloat(item.dataset.pitch));
      });
    });

    // Buttons
    document.getElementById("listenNowBtn")?.addEventListener("click", speak);
    document.getElementById("playPauseBtn")?.addEventListener("click", togglePlay);
    document.getElementById("stopBtn")?.addEventListener("click", stopSpeech);
    document.getElementById("downloadMp3Btn")?.addEventListener("click", downloadAudio);
    document.getElementById("saveClipBtn")?.addEventListener("click", saveClip);
    document.getElementById("toggleAutoReadBtn")?.addEventListener("click", toggleAutoRead);

    // Upload text file
    const uploadLink = document.getElementById("uploadFileLink");
    const fileInput = document.getElementById("ttsFileInput");
    if (uploadLink && fileInput) {
      uploadLink.addEventListener("click", () => fileInput.click());
      fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
          if (ta) {
            ta.value = String(e.target.result || "");
            updateCounts();
            showToast("📤 Loaded: " + file.name, "success");
          }
        };
        reader.readAsText(file);
      });
    }

    applyUrlParam();

    // Shared
    if (window.initScrollTop) window.initScrollTop("scrollTopBtn");
    if (window.initAtomicLogo) window.initAtomicLogo("headerAtomicCanvas", 100);

    updateSliderLabels();
    console.log("🔊 Text-to-Speech Engine initialized —", state.savedClips.length, "saved clips");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
