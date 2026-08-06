/**
 * Go Live — Standalone Live Meetings page (Google Meet / Zoom style).
 * Features: create/start a meeting, join via code or invite link,
 * camera & mic via getUserMedia, screen share, in-meeting chat (persisted
 * per session in localStorage), copy invite link, and a live meeting grid.
 */
(function () {
  "use strict";

  // ============================================================
  // MEETINGS STORE (localStorage-backed)
  // ============================================================
  function loadMeetings() {
    try { return JSON.parse(localStorage.getItem("vlmeetings")) || []; } catch (e) { return []; }
  }
  function saveMeetings(list) {
    try { localStorage.setItem("vlmeetings", JSON.stringify(list)); } catch (e) { /* quota */ }
  }

  function generateMeetingCode() {
    const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
    let code = "";
    for (let i = 0; i < 10; i++) {
      if (i === 3 || i === 7) code += "-";
      code += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return code;
  }

  function getMeetingLink(code) {
    const base = window.location.href.split("?")[0];
    return base + "?meet=" + encodeURIComponent(code);
  }

  function normalizeCode(input) {
    return String(input || "").trim().toLowerCase().replace(/\s+/g, "-");
  }

  // ============================================================
  // RENDER LIVE MEETING GRID
  // ============================================================
  function renderLiveLectures() {
    const container = document.getElementById("liveGrid");
    if (!container) return;

    const meetings = loadMeetings();
    if (!meetings.length) {
      container.innerHTML = `<p class="vl-muted" style="text-align:center;padding:40px 0;grid-column:1/-1;">No active meetings. Click "Go Live — Start Meeting" to begin!</p>`;
      return;
    }

    container.innerHTML = meetings.map((l) => `
      <div class="vl-live-card" data-code="${l.code}">
        <div class="vl-live-thumb">
          <span style="font-size:2.5rem;">🔴</span>
          <span class="live-badge"><span class="vl-live-dot"></span> LIVE</span>
          <span class="live-count">👁️ ${l.viewers || 1} watching</span>
        </div>
        <div class="vl-live-info">
          <span class="ll-title">${l.title || "Live Meeting"}</span>
          <span class="ll-lecturer">${l.host || "Host"}</span>
          <div class="ll-meta">
            <span>🔗 ${l.code}</span>
            <span>${l.host ? "Started " + new Date(l.startedAt).toLocaleTimeString() : ""}</span>
          </div>
        </div>
      </div>
    `).join("");

    container.querySelectorAll(".vl-live-card").forEach((el) => {
      el.addEventListener("click", () => {
        joinMeeting(el.dataset.code);
      });
    });
  }

  // ============================================================
  // CREATE / JOIN
  // ============================================================
  function createMeeting() {
    const code = generateMeetingCode();
    const meetings = loadMeetings();
    meetings.unshift({
      code: code,
      title: "Live Lecture",
      host: "You",
      startedAt: new Date().toISOString(),
      status: "live",
      viewers: 1,
    });
    saveMeetings(meetings);
    openMeetingRoom(code, true);
    renderLiveLectures();
    showToast("🚀 Meeting started! Share the invite link to let others join.", "success");
  }

  function joinMeeting(rawCode) {
    const code = normalizeCode(rawCode);
    if (!code) { showToast("⚠️ Please enter a valid meeting code.", "warning"); return; }
    const meetings = loadMeetings();
    const meeting = meetings.find((m) => m.code.toLowerCase() === code.toLowerCase());
    if (!meeting) {
      showToast("⚠️ Meeting not found — check the code or invite link.", "error");
      return;
    }
    showToast("🔴 Joining meeting: " + (meeting.title || code), "success");
    openMeetingRoom(code, false);
  }

  function joinByUrlParam() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("meet");
    if (code) {
      setTimeout(() => openMeetingRoom(normalizeCode(code), false), 300);
    }
  }

  // ============================================================
  // MEETING ROOM
  // ============================================================
  let meetingState = null; // { code, host, localStream, screenStream, micOn, camOn, chat }

  function openMeetingRoom(code, isHost) {
    if (meetingState) return; // already in a meeting
    const modal = document.getElementById("meetRoomModal");
    if (!modal) return;

    meetingState = {
      code: code,
      host: isHost,
      micOn: true,
      camOn: false,
      screenOn: false,
      chat: JSON.parse(localStorage.getItem("vlmeetchat_" + code) || "[]"),
    };

    document.getElementById("meetTitle").textContent = isHost ? "🚀 Your Live Meeting" : "🔴 Live Meeting";
    document.getElementById("meetCodeLabel").textContent = "Code: " + code;
    modal.style.display = "flex";
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
    document.getElementById("meetChatMessages").innerHTML = "";
    renderChatMessages();
    setChatVisible(true);

    // Self view with camera
    const selfVideo = document.getElementById("selfVideo");
    const camOff = document.getElementById("selfCameraOff");
    if (camOff) camOff.style.display = "none";

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          meetingState.localStream = stream;
          const videoTracks = stream.getVideoTracks();
          if (videoTracks.length) {
            meetingState.camOn = true;
            if (selfVideo) selfVideo.srcObject = stream;
            if (camOff) camOff.style.display = "none";
            const camBtn = document.getElementById("meetCamBtn");
            if (camBtn) { camBtn.classList.remove("off"); camBtn.textContent = "🎥"; }
          } else {
            meetingState.camOn = false;
            if (selfVideo) selfVideo.style.display = "none";
            if (camOff) camOff.style.display = "flex";
            const camBtn = document.getElementById("meetCamBtn");
            if (camBtn) { camBtn.classList.add("off"); camBtn.textContent = "🚫"; }
          }
          const audioTracks = stream.getAudioTracks();
          if (audioTracks.length) {
            audioTracks[0].enabled = true;
            meetingState.micOn = true;
            const micBtn = document.getElementById("meetMicBtn");
            if (micBtn) { micBtn.classList.remove("off"); micBtn.textContent = "🎤"; }
            const tMic = document.getElementById("selfTileMic");
            if (tMic) tMic.textContent = "🎤";
          }
        })
        .catch(() => {
          if (selfVideo) selfVideo.style.display = "none";
          if (camOff) camOff.style.display = "flex";
          const camBtn = document.getElementById("meetCamBtn");
          if (camBtn) { camBtn.classList.add("off"); camBtn.textContent = "🚫"; }
          showToast("⚠️ Camera/mic unavailable — you can still chat.", "warning");
        });
    } else {
      if (selfVideo) selfVideo.style.display = "none";
      if (camOff) camOff.style.display = "flex";
    }

    // Add placeholder participant tiles for demonstration
    addMeetingTile("Student 1");
    addMeetingTile("Student 2");

    // Refresh viewer count in storage
    const meetings = loadMeetings();
    const m = meetings.find((x) => x.code.toLowerCase() === code.toLowerCase());
    if (m) {
      m.viewers = (m.viewers || 1) + 1;
      saveMeetings(meetings);
    }
    renderLiveLectures();
  }

  function addMeetingTile(name) {
    const grid = document.getElementById("meetGrid");
    if (!grid) return;
    const tile = document.createElement("div");
    tile.className = "vl-meet-tile";
    tile.setAttribute("data-participant", "1");
    tile.innerHTML = `
      <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:linear-gradient(135deg,#14161f,#1d202c);">
        <span style="font-size:2.5rem;">👨‍🎓</span>
        <span style="font-size:0.78rem;color:var(--text-muted);">${name}</span>
      </div>
      <div class="vl-meet-tile-label"><span>${name}</span><span>🎤</span></div>
    `;
    grid.appendChild(tile);
  }

  function closeMeetingRoom() {
    if (!meetingState) return;
    if (meetingState.localStream) {
      meetingState.localStream.getTracks().forEach((t) => t.stop());
    }
    if (meetingState.screenStream) {
      meetingState.screenStream.getTracks().forEach((t) => t.stop());
    }
    meetingState = null;

    const modal = document.getElementById("meetRoomModal");
    if (modal) {
      modal.style.display = "none";
      modal.classList.remove("open");
    }
    document.body.style.overflow = "";

    const selfVideo = document.getElementById("selfVideo");
    if (selfVideo) { selfVideo.srcObject = null; selfVideo.style.display = ""; }
    const camOff = document.getElementById("selfCameraOff");
    if (camOff) camOff.style.display = "none";

    const micBtn = document.getElementById("meetMicBtn");
    const camBtn = document.getElementById("meetCamBtn");
    const screenBtn = document.getElementById("meetScreenShareBtn");
    if (micBtn) { micBtn.classList.remove("off"); micBtn.textContent = "🎤"; }
    if (camBtn) { camBtn.classList.remove("off"); camBtn.textContent = "🎥"; }
    if (screenBtn) { screenBtn.classList.remove("off"); screenBtn.textContent = "🖥️"; }

    document.querySelectorAll("#meetGrid .vl-meet-tile[data-participant]").forEach((t) => t.remove());
    setChatVisible(true);
  }

  function copyMeetingLink() {
    if (!meetingState) return;
    const link = getMeetingLink(meetingState.code);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link).then(() => {
        showToast("🔗 Invite link copied!", "success");
      }).catch(() => showToast("Could not copy link", "error"));
    } else {
      showToast("🔗 " + link, "info");
    }
  }

  // ============================================================
  // CHAT
  // ============================================================
  function persistChat(code, chat) {
    try { localStorage.setItem("vlmeetchat_" + code, JSON.stringify(chat)); } catch (e) { /* quota */ }
  }

  function renderChatMessages() {
    const container = document.getElementById("meetChatMessages");
    if (!container || !meetingState) return;
    if (!meetingState.chat.length) {
      container.innerHTML = `<p class="vl-muted" style="text-align:center;padding:12px;font-size:0.78rem;">No messages yet. Say hello!</p>`;
      return;
    }
    container.innerHTML = meetingState.chat.map((msg) => `
      <div class="vl-meet-msg ${msg.mine ? "mine" : "theirs"}">
        <span class="mm-author">${msg.author}</span>
        ${msg.text}
      </div>
    `).join("");
    container.scrollTop = container.scrollHeight;
  }

  function sendChatMessage() {
    if (!meetingState) return;
    const input = document.getElementById("meetChatInput");
    const text = input.value.trim();
    if (!text) return;
    meetingState.chat.push({ author: "You", text: text, mine: true });
    persistChat(meetingState.code, meetingState.chat);
    input.value = "";
    renderChatMessages();
  }

  function setChatVisible(visible) {
    const chat = document.getElementById("meetChatPanel");
    if (chat) chat.classList.toggle("hidden", !visible);
    const btn = document.getElementById("meetChatToggleBtn");
    if (btn) btn.classList.toggle("off", !visible);
  }

  // ============================================================
  // CONTROLS WIRING
  // ============================================================
  function initMeetingControls() {
    const createBtn = document.getElementById("createMeetingBtn");
    if (createBtn) createBtn.addEventListener("click", createMeeting);

    const joinBtn = document.getElementById("joinMeetingBtn");
    const joinInput = document.getElementById("joinMeetingInput");
    if (joinBtn && joinInput) {
      joinBtn.addEventListener("click", () => { joinMeeting(joinInput.value); joinInput.value = ""; });
      joinInput.addEventListener("keydown", (e) => { if (e.key === "Enter") { joinMeeting(joinInput.value); joinInput.value = ""; } });
    }

    const copyBtn = document.getElementById("copyMeetLinkBtn");
    if (copyBtn) copyBtn.addEventListener("click", copyMeetingLink);

    const leaveBtn = document.getElementById("leaveMeetBtn");
    if (leaveBtn) leaveBtn.addEventListener("click", () => {
      closeMeetingRoom();
      showToast("👋 You left the meeting.", "info");
    });

    const meetLeaveBtn = document.getElementById("meetLeaveBtn");
    if (meetLeaveBtn) meetLeaveBtn.addEventListener("click", () => {
      closeMeetingRoom();
      showToast("👋 You left the meeting.", "info");
    });

    // Mic toggle
    const micBtn = document.getElementById("meetMicBtn");
    if (micBtn) {
      micBtn.addEventListener("click", () => {
        if (!meetingState) return;
        meetingState.micOn = !meetingState.micOn;
        if (meetingState.localStream) {
          meetingState.localStream.getAudioTracks().forEach((t) => t.enabled = meetingState.micOn);
        }
        micBtn.classList.toggle("off", !meetingState.micOn);
        micBtn.textContent = meetingState.micOn ? "🎤" : "🔇";
        const labelMic = document.getElementById("selfTileMic");
        if (labelMic) labelMic.textContent = meetingState.micOn ? "🎤" : "🔇";
        showToast(meetingState.micOn ? "🎤 Mic on" : "🔇 Mic muted", "info");
      });
    }

    // Camera toggle
    const camBtn = document.getElementById("meetCamBtn");
    if (camBtn) {
      camBtn.addEventListener("click", () => {
        if (!meetingState) return;
        meetingState.camOn = !meetingState.camOn;
        const selfVideo = document.getElementById("selfVideo");
        const camOff = document.getElementById("selfCameraOff");
        if (meetingState.localStream) {
          meetingState.localStream.getVideoTracks().forEach((t) => t.enabled = meetingState.camOn);
        }
        if (selfVideo) selfVideo.style.display = meetingState.camOn ? "" : "none";
        if (camOff) camOff.style.display = meetingState.camOn ? "none" : "flex";
        camBtn.classList.toggle("off", !meetingState.camOn);
        camBtn.textContent = meetingState.camOn ? "🎥" : "🚫";
        showToast(meetingState.camOn ? "🎥 Camera on" : "🚫 Camera off", "info");
      });
    }

    // Screen share
    const screenBtn = document.getElementById("meetScreenShareBtn");
    if (screenBtn) {
      screenBtn.addEventListener("click", () => {
        if (!meetingState) return;
        if (meetingState.screenOn) {
          if (meetingState.screenStream) meetingState.screenStream.getTracks().forEach((t) => t.stop());
          meetingState.screenOn = false;
          screenBtn.classList.remove("off");
          screenBtn.textContent = "🖥️";
          showToast("🖥️ Screen share stopped", "info");
          return;
        }
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
          navigator.mediaDevices.getDisplayMedia({ video: true })
            .then((stream) => {
              meetingState.screenStream = stream;
              meetingState.screenOn = true;
              screenBtn.classList.add("off");
              screenBtn.textContent = "⏹️";
              showToast("🖥️ Sharing your screen", "success");
              stream.getVideoTracks()[0].addEventListener("ended", () => {
                meetingState.screenOn = false;
                screenBtn.classList.remove("off");
                screenBtn.textContent = "🖥️";
              });
            })
            .catch(() => showToast("⚠️ Screen share cancelled/denied", "warning"));
        } else {
          showToast("⚠️ Screen sharing not supported in this browser", "warning");
        }
      });
    }

    // Chat toggle
    const chatToggle = document.getElementById("meetChatToggleBtn");
    if (chatToggle) {
      chatToggle.addEventListener("click", () => {
        const chat = document.getElementById("meetChatPanel");
        if (chat) {
          const hidden = chat.classList.contains("hidden");
          setChatVisible(!hidden);
        }
      });
    }

    // Chat send
    const chatSend = document.getElementById("meetChatSendBtn");
    const chatInput = document.getElementById("meetChatInput");
    if (chatSend) chatSend.addEventListener("click", sendChatMessage);
    if (chatInput) {
      chatInput.addEventListener("keydown", (e) => { if (e.key === "Enter") sendChatMessage(); });
    }

    // ESC closes meeting
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && meetingState) {
        closeMeetingRoom();
        showToast("👋 You left the meeting.", "info");
      }
    });
  }

  // ============================================================
  // SEARCH
  // ============================================================
  function initSearch() {
    const input = document.getElementById("meetingSearchInput");
    const btn = document.getElementById("meetingSearchBtn");
    function doSearch() {
      if (!input) return;
      const q = input.value.trim().toLowerCase();
      const container = document.getElementById("liveGrid");
      if (!container) return;
      const meetings = loadMeetings();
      const filtered = meetings.filter((m) =>
        (m.code || "").toLowerCase().includes(q) ||
        (m.host || "").toLowerCase().includes(q) ||
        (m.title || "").toLowerCase().includes(q)
      );
      if (!q) { renderLiveLectures(); return; }
      if (filtered.length === 0) {
        container.innerHTML = `<p class="vl-muted" style="text-align:center;padding:40px 0;grid-column:1/-1;">No meetings match your search.</p>`;
        return;
      }
      container.innerHTML = filtered.map((l) => `
        <div class="vl-live-card" data-code="${l.code}">
          <div class="vl-live-thumb">
            <span style="font-size:2.5rem;">🔴</span>
            <span class="live-badge"><span class="vl-live-dot"></span> LIVE</span>
            <span class="live-count">👁️ ${l.viewers || 1} watching</span>
          </div>
          <div class="vl-live-info">
            <span class="ll-title">${l.title || "Live Meeting"}</span>
            <span class="ll-lecturer">${l.host || "Host"}</span>
            <div class="ll-meta"><span>🔗 ${l.code}</span></div>
          </div>
        </div>
      `).join("");
      container.querySelectorAll(".vl-live-card").forEach((el) => {
        el.addEventListener("click", () => joinMeeting(el.dataset.code));
      });
    }
    if (input) {
      input.addEventListener("keydown", (e) => { if (e.key === "Enter") doSearch(); });
    }
    if (btn) btn.addEventListener("click", doSearch);
  }

  // ============================================================  // EXTRA FEATURES
  // ============================================================
  function initExtraFeatures() {
    document.querySelectorAll(".vl-extra-card").forEach((card) => {
      card.addEventListener("click", () => {
        const feature = card.dataset.feature;
        switch (feature) {
          case "howto":
            showToast("📖 Start a meeting, copy the invite link, and share it with students.", "info");
            break;
          case "recordings":
            showToast("🎞️ Recordings feature coming soon.", "info");
            break;
          case "schedule":
            showToast("🗓️ Schedule upcoming live lectures soon.", "info");
            break;
          default:
            showToast("🚀 Feature: " + feature, "info");
        }
      });
    });
  }

  // ============================================================
  // INIT
  // ============================================================
  function init() {
    renderLiveLectures();
    initMeetingControls();
    initSearch();
    initExtraFeatures();

    if (window.ReVenaShared && window.ReVenaShared.initScrollTop) {
      window.ReVenaShared.initScrollTop("scrollTopBtn");
    }
    if (window.ReVenaShared && window.ReVenaShared.initAtomicLogo) {
      window.ReVenaShared.initAtomicLogo("headerAtomicCanvas", 100);
    }

    joinByUrlParam();
    console.log("🚀 Go Live page initialized.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
