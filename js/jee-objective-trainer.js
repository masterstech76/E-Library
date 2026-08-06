/**
 * AI Objective Trainer
 * Upload material → extract topics → push to Mock Exam (localStorage jeeTempBank).
 * The actual question generation happens on the Mock Exam page.
 */
(function () {
  "use strict";

  /* ============================================================
   * 1. STATE
   * ============================================================ */
  const LS = {
    bank: "jotBank",
    attempted: "jotAttempted",
    correct: "jotCorrect",
    wrongTopics: "jotWrongTopics",
    push: "jeeTempBank",
  };

  const state = {
    extractedTopics: [],
    extractedText: "",
    bank: JSON.parse(localStorage.getItem(LS.bank) || "[]"),
    attempted: JSON.parse(localStorage.getItem(LS.attempted) || "0"),
    correct: JSON.parse(localStorage.getItem(LS.correct) || "0"),
    wrongTopics: JSON.parse(localStorage.getItem(LS.wrongTopics) || "[]"),
  };

  // Keyword-based topic detection
  const keywordTopics = {
    "Kinematics": ["velocity", "acceleration", "displacement", "motion", "kinematics"],
    "Newton's Laws": ["newton", "force", "friction", "inertia"],
    "Thermodynamics": ["heat", "enthalpy", "entropy", "thermodynamic", "temperature"],
    "Optics": ["lens", "mirror", "refraction", "reflection", "optics"],
    "Electrostatics": ["charge", "coulomb", "electric field", "potential"],
    "Mole Concept": ["mole", "molar", "avogadro", "stoichiometry"],
    "Chemical Bonding": ["bond", "covalent", "ionic", "hybridisation"],
    "Organic Chemistry": ["carbon", "alkane", "alkene", "functional group", "isomer"],
    "Acids & Bases": ["acid", "base", "ph", "neutralization"],
    "Calculus": ["limit", "derivative", "integral", "differentiation", "calculus"],
    "Algebra": ["quadratic", "polynomial", "equation", "matrix", "determinant"],
    "Trigonometry": ["sin", "cos", "tan", "trigonometric", "angle"],
    "Probability": ["probability", "event", "random", "permutation", "combination"],
    "Vectors": ["vector", "scalar", "dot product", "cross product"],
  };

  /* ============================================================
   * 2. HELPERS
   * ============================================================ */
  function $(id) { return document.getElementById(id); }
  function esc(t) {
    t = t == null ? "" : String(t);
    const d = document.createElement("div");
    d.textContent = t;
    return d.innerHTML;
  }
  function toast(msg, type) { if (window.showToast) window.showToast(msg, type); }

  function persist() {
    try {
      localStorage.setItem(LS.bank, JSON.stringify(state.bank));
      localStorage.setItem(LS.attempted, JSON.stringify(state.attempted));
      localStorage.setItem(LS.correct, JSON.stringify(state.correct));
      localStorage.setItem(LS.wrongTopics, JSON.stringify(state.wrongTopics));
    } catch (e) { /* quota */ }
  }

  /* ============================================================
   * 3. UPLOAD + PARSER WORKER
   * ============================================================ */
  function parseFile(file) {
    return new Promise((resolve, reject) => {
      const ext = (file.name.split(".").pop() || "").toLowerCase();
      const type = ext === "md" ? "txt" : ext;
      if (!["txt", "pdf", "docx"].includes(type)) return reject(new Error("Unsupported file type."));
      if (file.size > 25 * 1024 * 1024) return reject(new Error("File exceeds 25 MB."));

      const reader = new FileReader();
      reader.onload = () => {
        try {
          const Worker = window.Worker ? new Worker("../../../js/jee-parser-worker.js") : null;
          if (!Worker) return reject(new Error("Workers not supported in this browser."));
          Worker.onmessage = (e) => {
            Worker.terminate();
            if (e.data && e.data.ok) resolve(e.data.text);
            else reject(new Error((e.data && e.data.error) || "Extraction failed."));
          };
          Worker.onerror = () => { Worker.terminate(); reject(new Error("Worker error.")); };
          Worker.postMessage({ type, data: reader.result });
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error("Could not read file."));
      reader.readAsArrayBuffer(file);
    });
  }

  function extractTopics(text) {
    const found = [];
    const lower = text.toLowerCase();
    Object.keys(keywordTopics).forEach((topic) => {
      if (keywordTopics[topic].some((k) => lower.includes(k))) found.push(topic);
    });
    return found.length ? found : ["General Concepts"];
  }

  function processText(text) {
    if (!text.trim()) { toast("⚠️ No content found in file.", "warning"); return; }
    state.extractedText = text;
    state.extractedTopics = extractTopics(text);
    renderExtracted();
    toast(`📌 Extracted ${state.extractedTopics.length} topic(s)`, "success");
  }

  function handleFile(file) {
    toast(`📎 Processing "${file.name}" locally…`, "info");
    parseFile(file)
      .then((text) => processText(text))
      .catch((err) => toast("⚠️ " + err.message, "error"));
  }

  /* ============================================================
   * 4. RENDER EXTRACTED TOPICS
   * ============================================================ */
  function renderExtracted() {
    const wrap = $("extractedWrap");
    if (state.extractedTopics.length) {
      wrap.hidden = false;
      $("extractedTags").innerHTML = state.extractedTopics.map((t) => `<span class="ex-tag">${esc(t)}</span>`).join("");
      $("uploadStatus").textContent = `✅ ${state.extractedTopics.length} topic(s) extracted from your material`;
    } else {
      wrap.hidden = true;
    }
  }

  /* ============================================================
   * 5. STATS / BANK RENDER
   * ============================================================ */
  function renderStats() {
    if ($("statAttempted")) $("statAttempted").textContent = state.attempted;
    if ($("statCorrect")) $("statCorrect").textContent = state.correct;
    if ($("statAccuracy")) $("statAccuracy").textContent = state.attempted ? Math.round((state.correct / state.attempted) * 100) + "%" : "0%";
    if ($("statSaved")) $("statSaved").textContent = state.bank.length;
  }

  function renderWeakTopics() {
    const wrap = $("weakTopics");
    const empty = $("weakEmpty");
    if (!wrap) return;
    empty.hidden = !!state.wrongTopics.length;
    wrap.innerHTML = state.wrongTopics.map((t) => `<span class="jot-weak-tag">${esc(t)}</span>`).join("");
  }

  function renderBank() {
    const list = $("savedList");
    const empty = $("savedEmpty");
    if (!list) return;
    empty.hidden = !!state.bank.length;
    list.innerHTML = state.bank.map((q, i) => `
      <div class="jot-saved-item" data-i="${i}">
        <div>
          <div class="si-subject">${esc((q.question || q.q || "").length > 46 ? (q.question || q.q).slice(0, 46) + "…" : (q.question || q.q))}</div>
          <div class="si-meta">${esc(q.subject || q.sec || "General")} • ${esc(q.topic || "General")}</div>
        </div>
        <span class="si-style">${esc(q.style || (q.options ? "single" : "numerical"))}</span>
      </div>
    `).join("");
    $("statSaved").textContent = state.bank.length;
  }

  function clearAll() {
    if (!confirm("Clear the entire question bank and stats?")) return;
    state.bank = []; state.wrongTopics = []; state.attempted = 0; state.correct = 0;
    persist(); renderBank(); renderWeakTopics(); renderStats();
    toast("🗑️ Bank & stats cleared.", "success");
  }

  /* ============================================================
   * 6. PUSH TO EXAM
   * ============================================================ */
  function pushToExam() {
    if (!state.bank.length) { toast("⚠️ Your bank is empty — save questions on the exam page first.", "warning"); return; }
    try { localStorage.setItem(LS.push, JSON.stringify(state.bank)); } catch (e) { toast("⚠️ Could not store bank.", "error"); return; }
    toast("🚀 Bank pushed — open the Mock Exam to import it.", "success");
  }

  function goToExam() {
    // Persist any extracted markdown so the exam page can use it as context
    if (state.extractedText) {
      try { localStorage.setItem("jotExtractedText", state.extractedText); } catch (e) { /* ignore */ }
      try { localStorage.setItem("jotExtractedTopics", JSON.stringify(state.extractedTopics)); } catch (e) { /* ignore */ }
    }
    if (state.bank.length) {
      try { localStorage.setItem(LS.push, JSON.stringify(state.bank)); } catch (e) { /* ignore */ }
    }
    toast("🎓 Opening the Mock Exam…", "info");
    setTimeout(() => { window.location.href = "jee-exam.html"; }, 400);
  }

  /* ============================================================
   * 7. CONSENT MODAL (export flow)
   * ============================================================ */
  function download(text, name, type) {
    const blob = new Blob([text], { type: type || "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function exportBank() {
    const data = { type: "jee-question-bank", exportedAt: new Date().toISOString(), questions: state.bank };
    download(JSON.stringify(data, null, 2), "jee-question-bank.json", "application/json");
    toast("⬇ Question bank exported as JSON.", "success");
  }

  function openConsent(cb) {
    const modal = $("consentModal");
    if (!modal) { cb(); return; }
    modal.hidden = false;
    const ok = () => { modal.hidden = true; cleanup(); cb(); };
    const cancel = () => { modal.hidden = true; cleanup(); };
    const cleanup = () => {
      $("consentOk").removeEventListener("click", ok);
      $("consentCancel").removeEventListener("click", cancel);
    };
    $("consentOk").addEventListener("click", ok);
    $("consentCancel").addEventListener("click", cancel);
  }

  /* ============================================================
   * 8. INIT
   * ============================================================ */
  function init() {
    if (window.initAtomicLogo) window.initAtomicLogo("headerAtomicCanvas", 100);
    if (window.initScrollTop) window.initScrollTop("scrollTopBtn");

    renderStats();
    renderWeakTopics();
    renderBank();

    // Upload
    const drop = $("dropZone");
    const fileInput = $("fileInput");
    if (drop) {
      drop.addEventListener("click", () => fileInput.click());
      drop.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInput.click(); } });
      ["dragenter", "dragover"].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add("drag"); }));
      ["dragleave", "drop"].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove("drag"); }));
      drop.addEventListener("drop", (e) => { if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]); });
    }
    if (fileInput) {
      fileInput.addEventListener("change", () => { if (fileInput.files.length) handleFile(fileInput.files[0]); fileInput.value = ""; });
    }

    // Generate Exam button → push context/bank then switch to the exam page
    if ($("generateExamBtn")) $("generateExamBtn").addEventListener("click", goToExam);

    // Bank / export / push
    if ($("pushToExamBtn")) $("pushToExamBtn").addEventListener("click", pushToExam);
    if ($("clearBankBtn")) $("clearBankBtn").addEventListener("click", clearAll);
    if ($("exportBankBtn")) $("exportBankBtn").addEventListener("click", () => openConsent(exportBank));

    initAgentChat();

    console.log("🤖 AI Objective Trainer initialized —", state.bank.length, "saved question(s).");
  }

/* ============================================================
   * 9. AI AGENT — live internet (backend) + offline fallback
   * ============================================================ */
  const AGENT_API = "http://localhost:8080/api/agent/chat";

  /**
   * Ask the Java backend (live internet) for an answer.
   * Falls back to the local knowledge base if the backend is unreachable.
   */
  function askAgent(q) {
    return new Promise((resolve) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12000);
      fetch(AGENT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q }),
        signal: controller.signal,
      })
.then((r) => (r.ok ? r.json() : Promise.reject(new Error("bad status"))))
        .then((data) => {
          clearTimeout(timer);
          resolve({
            text: data.reply || "🤖 I couldn't find that. Try rephrasing.",
            source: data.source || "live",
            live: !!data.live,
          });
        })
        .catch(() => {
          clearTimeout(timer);
          // Offline fallback — local knowledge base.
          resolve({ text: localReply(q), source: "ReVena (offline)", live: false });
        });
    });
  }

  function localReply(q) {
    const lower = (q || "").toLowerCase();
    if (lower.includes("kinematics") || lower.includes("velocity") || lower.includes("acceleration")) {
      return "📐 <strong>Kinematics</strong>: motion without forces. v = u + at, s = ut + ½at², v² = u² + 2as.";
    }
    if (lower.includes("newton") || lower.includes("force") || lower.includes("friction")) {
      return "⚖️ <strong>Newton's Laws</strong>: F = ma; action-reaction pairs; friction opposes relative motion (μN).";
    }
    if (lower.includes("mole") || lower.includes("avogadro")) {
      return "🧪 <strong>Mole Concept</strong>: 1 mol = 6.022×10²³ particles. n = mass/molar mass, M = mol/L.";
    }
    if (lower.includes("acid") || lower.includes("base") || lower.includes("ph")) {
      return "⚗️ <strong>Acids & Bases</strong>: pH = -log[H⁺]; strong acids dissociate fully; weak acids partially.";
    }
    if (lower.includes("derivative") || lower.includes("calculus")) {
      return "∫ <strong>Calculus</strong>: d/dx(xⁿ) = nxⁿ⁻¹. Chain/product/quotient rules are key for JEE.";
    }
    if (lower.includes("trig") || lower.includes("sin") || lower.includes("cos")) {
      return "📐 <strong>Trigonometry</strong>: sin²θ + cos²θ = 1; sin(90°)=1. Practice identities.";
    }
    if (lower.includes("permutation") || lower.includes("combination") || lower.includes("probability")) {
      return "🎲 <strong>Permutations & Probability</strong>: nPr = n!/(n-r)!, nCr = n!/(r!(n-r)!).";
    }
    if (lower.includes("pattern") || (lower.includes("main") && lower.includes("advanced"))) {
      return "📋 <strong>JEE Pattern</strong>: Main → single-correct + numerical, 4 marks each (−1 wrong). Advanced → multiple-correct possible, −2 wrong. Focus on accuracy & speed.";
    }
    if (lower.includes("tip") || lower.includes("study") || lower.includes("strategy")) {
      return "💡 <strong>Study tip</strong>: active recall > passive reading. Do timed MCQs daily, review wrong answers, use spaced repetition.";
    }
    if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
      return "👋 Hello! Ask me about JEE concepts, patterns, or study tips. I'll fetch live info from the web when I'm online.";
    }
    return "🤖 I'm your <strong>ReVena AI Agent</strong>. Ask me about JEE concepts, patterns, or study tips. I fetch live info from the web when online, and fall back to my built-in knowledge when offline.";
  }

  function initAgentChat() {
    // Large container (below upload)
    const bigInput = $("agentChatInput");
    const bigSend = $("agentChatSend");
    const bigBody = $("agentChatBody");
    // FAB chat panel
    const fab = $("agentChatBtn");
    const panel = $("agentChatPanel");
    const closeBtn = $("agentChatClose");
    const fabInput = $("fabChatInput");
    const fabSend = $("fabChatSend");
    const fabBody = $("fabChatBody");

    function makeAddMsg(body) {
      return function addMsg(text, who, source) {
        const div = document.createElement("div");
        div.className = "ag-msg " + (who === "user" ? "ag-msg-user" : "ag-msg-agent");
        const avatar = who === "user" ? "🧑‍🎓" : "🤖";
        const src = source ? `<div class="ag-source">${esc(source)}</div>` : "";
        div.innerHTML = `<span class="ag-msg-avatar">${avatar}</span><div class="ag-bubble">${text}${src}</div>`;
        body.appendChild(div);
        body.scrollTop = body.scrollHeight;
      };
    }

    function makeAddTyping(body) {
      return function addTyping() {
        const div = document.createElement("div");
        div.className = "ag-msg ag-msg-agent";
        div.innerHTML = `<span class="ag-msg-avatar">🤖</span><div class="ag-bubble">…</div>`;
        body.appendChild(div);
        body.scrollTop = body.scrollHeight;
        return div;
      };
    }

    function makeSend(input, body) {
      const addMsg = makeAddMsg(body);
      const addTyping = makeAddTyping(body);
      return function sendMessage() {
        const msg = (input.value || "").trim();
        if (!msg) return;
        addMsg(esc(msg), "user");
        input.value = "";
        const typing = addTyping();
        askAgent(msg).then((res) => {
          typing.remove();
          addMsg(res.text, "agent", res.source + (res.live ? " · live internet" : ""));
        });
      };
    }

    // Wire large container
    if (bigInput && bigSend && bigBody) {
      const sendBig = makeSend(bigInput, bigBody);
      bigSend.addEventListener("click", sendBig);
      bigInput.addEventListener("keydown", (e) => { if (e.key === "Enter") sendBig(); });
    }

    // Wire FAB chat
    if (fab && panel) {
      function openChat() { panel.classList.add("open"); }
      function closeChat() { panel.classList.remove("open"); }
      fab.addEventListener("click", () => {
        if (panel.classList.contains("open")) closeChat(); else openChat();
      });
      if (closeBtn) closeBtn.addEventListener("click", closeChat);
      if (fabInput && fabSend && fabBody) {
        const sendFab = makeSend(fabInput, fabBody);
        fabSend.addEventListener("click", sendFab);
        fabInput.addEventListener("keydown", (e) => { if (e.key === "Enter") sendFab(); });
      }
    }

    // Suggestion chips (in the large container)
    if (bigInput && bigSend && bigBody) {
      const sendBig = makeSend(bigInput, bigBody);
      document.querySelectorAll(".jot-agent-container .ag-suggestion").forEach((chip) => {
        chip.addEventListener("click", () => { bigInput.value = chip.textContent; sendBig(); });
      });
    }

    // Connection status indicator
    const statusEl = $("agentStatus");
    if (statusEl) {
      fetch(AGENT_API.replace("/chat", "/health"))
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then(() => {
          statusEl.innerHTML = '<span class="ag-status-dot"></span> Live · Internet';
          statusEl.classList.remove("offline");
        })
        .catch(() => {
          statusEl.innerHTML = '<span class="ag-status-dot"></span> Offline · Built-in';
          statusEl.classList.add("offline");
        });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
