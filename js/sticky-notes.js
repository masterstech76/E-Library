/**
 * Sticky Notes — Complete Module
 * CRUD, rich text, pin/unpin, drag & drop, voice, export, analytics
 */
(function () {
  "use strict";

  const STORAGE_KEY = "revena_sticky_notes";
  const TRASH_KEY = "revena_sticky_notes_trash";
  const SETTINGS_KEY = "revena_sticky_notes_settings";
  let notes = [], trash = [], currentFilter = "active", currentColor = "all", currentCategory = "all", searchQuery = "", editingNoteId = null, isRecording = false, viewMode = "grid";
  let mediaRecorder = null, audioChunks = [], recordingTimer = null, recordingSeconds = 0;

  // $, qs, qsa, esc, genId, now, fmtDate, showToast are provided by shared.js

  /** Safely get DOM refs — null if element missing */
  function safeGet(id) { const el = $(id); return el || null; }

  const DOM = {};
  ["notesGrid","addNoteBtn","searchNotes","colorChips","totalNotesCount","pinnedCount","archivedCount","lastEditedTime","noteEditorModal","modalTitle","noteTitleInput","noteContentEditor","modalColorPicker","pinCheckbox","categorySelect","tagsInput","saveNoteBtn","deleteNoteBtn","archiveNoteBtn","cancelNoteBtn","modalClose","voiceRecorder","recordingTime","stopRecordingBtn","cancelRecordingBtn","fontSizeSlider","ttsBtn","exportPdfBtn","exportTxtBtn","voiceNoteBtn","analyticsBtn","analyticsPanel","pasteContentArea","createFromPasteBtn","dropZone","fileInput","globalSearchInput","globalSearchBtn"].forEach(id => DOM[id] = safeGet(id));

  function strip(h) { const d = document.createElement("div"); d.innerHTML = h; return d.textContent||""; }

  /** Custom confirm dialog using DOM (non-blocking) */
  function showConfirm(msg, onConfirm, onCancel) {
    // Create overlay
    const overlay = document.createElement("div");
    overlay.className = "sn-modal-overlay";
    overlay.style.display = "flex";
    overlay.style.zIndex = "5000";
    overlay.innerHTML = `
      <div class="sn-modal" style="max-width:400px;padding:32px;text-align:center;">
        <div style="font-size:2rem;margin-bottom:12px;">⚠️</div>
        <p style="color:var(--text-secondary);margin-bottom:24px;font-size:0.95rem;">${esc(msg)}</p>
        <div style="display:flex;gap:12px;justify-content:center;">
          <button class="btn btn-primary confirm-yes" style="padding:10px 28px;">Yes</button>
          <button class="btn btn-secondary confirm-no" style="padding:10px 28px;">Cancel</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector(".confirm-yes").addEventListener("click", function() {
      overlay.remove();
      if (onConfirm) onConfirm();
    });
    overlay.querySelector(".confirm-no").addEventListener("click", function() {
      overlay.remove();
      if (onCancel) onCancel();
    });
    overlay.addEventListener("click", function(e) {
      if (e.target === overlay) { overlay.remove(); if (onCancel) onCancel(); }
    });
  }

  function load() {
    try { notes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; trash = JSON.parse(localStorage.getItem(TRASH_KEY)) || []; } catch(e) { notes = []; trash = []; }
  }
  function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(notes)); localStorage.setItem(TRASH_KEY, JSON.stringify(trash)); }
  function loadSettings() {
    try {
      const s = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
      if (s.fontSize && DOM.noteContentEditor) { DOM.noteContentEditor.style.fontSize = s.fontSize + "px"; DOM.fontSizeSlider.value = s.fontSize; }
    } catch(e) {}
  }
  function saveSettings() { localStorage.setItem(SETTINGS_KEY, JSON.stringify({fontSize: parseInt(DOM.fontSizeSlider ? DOM.fontSizeSlider.value : 16)||16 })); }

  function filtered() {
    if (currentFilter === "trash") {
      let r = [...trash];
      if (searchQuery.trim()) { const q = searchQuery.trim().toLowerCase(); r = r.filter(n => n.title.toLowerCase().includes(q) || strip(n.content).toLowerCase().includes(q) || (n.tags||[]).some(t => t.toLowerCase().includes(q))); }
      return r;
    }
    let r = [...notes];
    if (currentFilter === "pinned") r = r.filter(n => n.pinned);
    else if (currentFilter === "archived") r = r.filter(n => n.archived);
    else if (currentFilter === "active") r = r.filter(n => !n.archived);
    if (currentCategory !== "all") r = r.filter(n => n.category === currentCategory);
    if (currentColor !== "all") r = r.filter(n => n.color === currentColor);
    if (searchQuery.trim()) { const q = searchQuery.trim().toLowerCase(); r = r.filter(n => n.title.toLowerCase().includes(q) || strip(n.content).toLowerCase().includes(q) || (n.tags||[]).some(t => t.toLowerCase().includes(q))); }
    r.sort((a,b) => { if (a.pinned&&!b.pinned) return -1; if (!a.pinned&&b.pinned) return 1; return new Date(b.updatedAt)-new Date(a.updatedAt); });
    return r;
  }

  function render() {
    if (!DOM.notesGrid) return;
    const f = filtered(), isTrash = currentFilter === "trash";
    DOM.notesGrid.className = "sn-notes-grid" + (viewMode === "board" ? " board-view" : "");
    if (f.length === 0) {
      DOM.notesGrid.innerHTML = `<div class="sn-empty-state" style="grid-column:1/-1;"><span class="sn-empty-icon">📝</span><span class="sn-empty-title">No notes found</span><span class="sn-empty-desc">${isTrash ? "Trash is empty." : 'Click "➕ Add Note" to create your first sticky note!'}</span></div>`;
      stats(); cats(); recent(); return;
    }
    DOM.notesGrid.innerHTML = f.map(n => {
      const p = n.pinned, cc = "color-"+(n.color||"yellow"), tags = (n.tags||[]).slice(0,3);
      return `<div class="sn-note-card ${cc} ${p?"pinned":""}" data-id="${n.id}" draggable="${!isTrash}"><div class="sn-note-color-bar"></div><div class="sn-note-body">${p?'<span class="sn-note-pin-indicator">📌</span>':""}<span class="sn-note-title">${esc(n.title||"Untitled")}</span><div class="sn-note-content">${n.content||""}</div><div class="sn-note-meta"><span class="sn-note-date">🕐 ${fmtDate(n.updatedAt)}</span><span>🏷️ ${n.category||"other"}</span></div>${tags.length?`<div class="sn-note-tags">${tags.map(t=>`<span>#${esc(t)}</span>`).join("")}</div>`:""}<div class="sn-note-actions">${isTrash?`<button class="sn-restore-btn" data-id="${n.id}">♻️ Restore</button><button class="sn-delete-perm-btn" data-id="${n.id}">🗑️ Delete Forever</button>`:`<button class="sn-edit-btn" data-id="${n.id}">✏️ Edit</button><button class="sn-pin-btn" data-id="${n.id}">${p?"📌 Unpin":"📌 Pin"}</button><button class="sn-archive-btn" data-id="${n.id}">🗄️</button><button class="sn-delete-btn" data-id="${n.id}">🗑️</button>`}</div></div>`;
    }).join("");
    if (!isTrash) attachDrag();
    stats(); cats(); recent();
  }

  function stats() {
    const active = notes.filter(n=>!n.archived);
    if (DOM.totalNotesCount) DOM.totalNotesCount.textContent = active.length;
    if (DOM.pinnedCount) DOM.pinnedCount.textContent = notes.filter(n=>n.pinned).length;
    if (DOM.archivedCount) DOM.archivedCount.textContent = notes.filter(n=>n.archived).length;
    if (DOM.lastEditedTime) DOM.lastEditedTime.textContent = notes.length ? fmtDate([...notes].sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt))[0].updatedAt) : "—";
    ["all","study","reminder","idea","exam","project"].forEach(cat => {
      const el = $("cat"+cat.charAt(0).toUpperCase()+cat.slice(1)+"Count");
      if (el) el.textContent = cat==="all" ? notes.filter(n=>!n.archived).length : notes.filter(n=>n.category===cat&&!n.archived).length;
    });
  }

  function cats() { qsa(".sn-category-item").forEach(el => el.classList.toggle("active", el.dataset.category === currentCategory)); }

  function recent() {
    const c = $("recentlyEdited");
    if (!c) return;
    const sorted = [...notes].sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt)).slice(0,5);
    if (!sorted.length) { c.innerHTML = '<p class="text-muted" style="font-size:0.78rem;">No notes edited yet.</p>'; return; }
    c.innerHTML = sorted.map(n => `<div class="ref-recent-item" style="cursor:pointer;" data-id="${n.id}"><div class="recent-cover" style="background:var(--input-bg);">📌</div><div class="recent-info"><span class="recent-title">${esc(n.title||"Untitled")}</span><span class="recent-time">${fmtDate(n.updatedAt)}</span></div>`).join("");
    c.querySelectorAll(".ref-recent-item").forEach(el => el.addEventListener("click", () => { const note = notes.find(n=>n.id===el.dataset.id); if(note) openEditor(note); }));
  }

  function updateAnalytics() {
    ["anTotalNotes","anPinnedNotes","anDeleted","anTopColor","anTopCategory","anLastEdited"].forEach(id => { const el=$(id); if(el) el.textContent="—"; });
    const anTotal=$("anTotalNotes"), anPinned=$("anPinnedNotes"), anDeleted=$("anDeleted"), anTopColor=$("anTopColor"), anTopCategory=$("anTopCategory"), anLastEdited=$("anLastEdited");
    if (anTotal) anTotal.textContent = notes.length;
    if (anPinned) anPinned.textContent = notes.filter(n=>n.pinned).length;
    if (anDeleted) anDeleted.textContent = trash.length;
    const cc = {}; notes.forEach(n=>{const c=n.color||"yellow"; cc[c]=(cc[c]||0)+1;});
    const tc = Object.entries(cc).sort((a,b)=>b[1]-a[1])[0];
    if (anTopColor) anTopColor.textContent = tc ? tc[0]+" ("+tc[1]+")" : "—";
    const catC = {}; notes.forEach(n=>{const c=n.category||"other"; catC[c]=(catC[c]||0)+1;});
    const tcat = Object.entries(catC).sort((a,b)=>b[1]-a[1])[0];
    if (anTopCategory) anTopCategory.textContent = tcat ? tcat[0]+" ("+tcat[1]+")" : "—";
    if (anLastEdited) anLastEdited.textContent = notes.length ? fmtDate([...notes].sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt))[0].updatedAt) : "—";
  }

  // Drag & Drop
  let dragSrcId = null;
  function attachDrag() { qsa(".sn-note-card").forEach(c => { c.addEventListener("dragstart",dragStart); c.addEventListener("dragend",dragEnd); c.addEventListener("dragover",dragOver); c.addEventListener("dragleave",dragLeave); c.addEventListener("drop",dragDrop); }); }
  function dragStart(e) { dragSrcId=this.dataset.id; this.classList.add("dragging"); e.dataTransfer.effectAllowed="move"; e.dataTransfer.setData("text/plain",dragSrcId); }
  function dragEnd() { this.classList.remove("dragging"); qsa(".sn-note-card").forEach(c=>c.classList.remove("drag-over")); dragSrcId=null; }
  function dragOver(e) { e.preventDefault(); e.dataTransfer.dropEffect="move"; this.classList.add("drag-over"); }
  function dragLeave() { this.classList.remove("drag-over"); }
  function dragDrop(e) {
    e.preventDefault(); this.classList.remove("drag-over");
    const tgt = this.dataset.id;
    if (!dragSrcId||dragSrcId===tgt) return;
    const s=notes.find(n=>n.id===dragSrcId), t=notes.find(n=>n.id===tgt);
    if (!s||!t) return;
    const si=notes.indexOf(s), ti=notes.indexOf(t);
    notes.splice(si,1); notes.splice(ti,0,s);
    save(); render(); showToast("📌 Reordered!","success");
  }

  function openEditor(note) {
    editingNoteId = note ? note.id : null;
    if (note) {
      DOM.modalTitle.textContent = "✏️ Edit Note"; DOM.noteTitleInput.value = note.title||""; DOM.noteContentEditor.innerHTML = note.content||"";
      DOM.pinCheckbox.checked = note.pinned||false; DOM.categorySelect.value = note.category||"study"; DOM.tagsInput.value = (note.tags||[]).join(", ");
      DOM.deleteNoteBtn.style.display = "inline-flex"; DOM.archiveNoteBtn.style.display = "inline-flex";
      DOM.archiveNoteBtn.textContent = note.archived ? "♻️ Restore" : "🗄️ Archive";
      qsa(".color-option", DOM.modalColorPicker).forEach(el => el.classList.toggle("active", el.dataset.color===(note.color||"yellow")));
    } else {
      DOM.modalTitle.textContent = "📝 New Note"; DOM.noteTitleInput.value = ""; DOM.noteContentEditor.innerHTML = "";
      DOM.pinCheckbox.checked = false; DOM.categorySelect.value = "study"; DOM.tagsInput.value = "";
      DOM.deleteNoteBtn.style.display = "none"; DOM.archiveNoteBtn.style.display = "none";
      qsa(".color-option", DOM.modalColorPicker).forEach(el => el.classList.toggle("active", el.dataset.color==="yellow"));
    }
    DOM.noteContentEditor.style.fontSize = (parseInt(DOM.fontSizeSlider.value)||16)+"px";
    DOM.noteEditorModal.classList.add("open");
    DOM.noteTitleInput.focus();
  }

  function closeEditor() { DOM.noteEditorModal.classList.remove("open"); editingNoteId=null; if (isRecording) stopRecord(); }

  function saveNote() {
    const title = DOM.noteTitleInput.value.trim()||"Untitled", content = DOM.noteContentEditor.innerHTML.trim();
    const color = (qs(".color-option.active",DOM.modalColorPicker)||{}).dataset.color||"yellow";
    const pinned = DOM.pinCheckbox.checked, category = DOM.categorySelect.value, tags = DOM.tagsInput.value.split(",").map(t=>t.trim()).filter(Boolean);
    if (!content&&!title) { showToast("⚠️ Add content.","warning"); return; }
    if (editingNoteId) {
      const idx = notes.findIndex(n=>n.id===editingNoteId);
      if (idx!==-1) { notes[idx] = {...notes[idx], title, content, color, pinned, category, tags, updatedAt: now()}; }
      showToast("✅ Updated!","success");
    } else {
      notes.unshift({id:genId(), title, content, color, pinned, category, tags, archived:false, createdAt:now(), updatedAt:now()});
      showToast("✅ Created!","success");
    }
    save(); closeEditor(); render(); updateAnalytics();
  }

  function deleteNote(id) {
    if (currentFilter==="trash") { trash=trash.filter(n=>n.id!==id); save(); render(); showToast("🗑️ Deleted.","info"); return; }
    const idx=notes.findIndex(n=>n.id===id);
    if (idx!==-1) { const [n]=notes.splice(idx,1); n.deletedAt=now(); trash.unshift(n); save(); render(); updateAnalytics(); showToast("🗑️ Moved to trash.","info"); }
  }

  function restoreNote(id) {
    const idx=trash.findIndex(n=>n.id===id);
    if (idx!==-1) { const [n]=trash.splice(idx,1); n.updatedAt=now(); delete n.deletedAt; notes.unshift(n); save(); render(); updateAnalytics(); showToast("♻️ Restored!","success"); }
  }

  function toggleArchive(id) {
    const n=notes.find(n=>n.id===id); if (!n) return;
    n.archived=!n.archived; n.updatedAt=now(); save();
    if (editingNoteId===id) closeEditor();
    render(); updateAnalytics(); showToast(n.archived?"🗄️ Archived.":"♻️ Unarchived.","info");
  }

  function togglePin(id) {
    const n=notes.find(n=>n.id===id); if (!n) return;
    n.pinned=!n.pinned; n.updatedAt=now(); save(); render(); showToast(n.pinned?"📌 Pinned!":"📌 Unpinned.","info");
  }

  function execFmt(cmd) {
    // Use modern document.execCommand with fallback
    try {
      document.execCommand(cmd, false, null);
    } catch(e) {
      console.warn("execCommand failed for:", cmd);
    }
    if (DOM.noteContentEditor) DOM.noteContentEditor.focus();
  }

  async function startRecord() {
    if (!navigator.mediaDevices?.getUserMedia) { showToast("⚠️ Not supported.","warning"); return; }
    try {
      const s=await navigator.mediaDevices.getUserMedia({audio:true});
      mediaRecorder=new MediaRecorder(s); audioChunks=[];
      mediaRecorder.ondataavailable=e=>{if(e.data.size>0) audioChunks.push(e.data);};
      mediaRecorder.onstop=()=>{
        const blob=new Blob(audioChunks,{type:"audio/webm"}), url=URL.createObjectURL(blob);
        const a=document.createElement("audio"); a.controls=true; a.src=url; a.style.cssText="width:100%;margin-top:8px;";
        DOM.noteContentEditor.appendChild(a); showToast("🎤 Attached!","success"); s.getTracks().forEach(t=>t.stop());
      };
      mediaRecorder.start(); isRecording=true; DOM.voiceRecorder.classList.add("recording");
      recordingSeconds=0; DOM.recordingTime.textContent="00:00";
      recordingTimer=setInterval(()=>{recordingSeconds++; const m=String(Math.floor(recordingSeconds/60)).padStart(2,"0"),s=String(recordingSeconds%60).padStart(2,"0"); DOM.recordingTime.textContent=m+":"+s;},1000);
      showToast("🎤 Recording...","info");
    } catch(e) { showToast("⚠️ Mic denied.","error"); }
  }

  function stopRecord() {
    if (mediaRecorder&&mediaRecorder.state!=="inactive") mediaRecorder.stop();
    isRecording=false; if (DOM.voiceRecorder) DOM.voiceRecorder.classList.remove("recording"); clearInterval(recordingTimer);
  }

  function speakNote() {
    const text=DOM.noteTitleInput.value.trim()+". "+strip(DOM.noteContentEditor.innerHTML);
    if (!text.trim()) { showToast("⚠️ Nothing to read.","warning"); return; }
    if (!window.speechSynthesis) { showToast("⚠️ TTS not supported.","warning"); return; }
    window.speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text); u.rate=0.9; u.pitch=1; window.speechSynthesis.speak(u);
    showToast("🔊 Reading...","info");
  }

  function uploadFiles(files) {
    Array.from(files).forEach(f=>{
      if (!f.name.endsWith(".txt")) { showToast("⚠️ Only .txt.","warning"); return; }
      if (f.size>2*1024*1024) { showToast("⚠️ Max 2 MB.","warning"); return; }
      const r=new FileReader();
      r.onload=e=>{
        notes.unshift({id:genId(),title:f.name.replace(/\.txt$/i,""),content:"<p>"+esc(e.target.result)+"</p>",color:"yellow",pinned:false,category:"study",tags:[],archived:false,createdAt:now(),updatedAt:now()});
        save(); render(); updateAnalytics(); showToast("📄 Imported: "+f.name,"success");
      };
      r.readAsText(f);
    });
  }

  function createFromPaste() {
    const ta=DOM.pasteContentArea; if (!ta||!ta.value.trim()) { showToast("⚠️ Paste content first.","warning"); return; }
    const lines=ta.value.split("\n").filter(l=>l.trim());
    if (!lines.length) { showToast("⚠️ No content.","warning"); return; }
    lines.forEach(l=>{if(l.trim()){notes.unshift({id:genId(),title:l.trim().slice(0,50)+(l.trim().length>50?"...":""),content:"<p>"+esc(l.trim())+"</p>",color:"yellow",pinned:false,category:"study",tags:[],archived:false,createdAt:now(),updatedAt:now()});}});
    save(); ta.value=""; render(); updateAnalytics(); showToast("📝 Created "+lines.length+" note(s)!","success");
  }

  function exportPDF() {
    const a=notes.filter(n=>!n.archived); if (!a.length) { showToast("⚠️ No notes.","warning"); return; }
    const w=window.open("","_blank");
    let h='<!DOCTYPE html><html><head><title>Notes Export</title><style>body{font-family:sans-serif;padding:40px;background:#fff;color:#222;}h1{font-size:24px;}.meta{color:#666;font-size:14px;margin-bottom:32px;}.note{border:1px solid #ddd;border-radius:8px;padding:16px 20px;margin-bottom:16px;page-break-inside:avoid;}.note.pinned{border-left:4px solid gold;}.note h2{font-size:18px;margin:0 0 8px;}.content{font-size:14px;line-height:1.6;}</style></head><body>';
    h+='<h1>📌 Sticky Notes</h1><div class="meta">'+new Date().toLocaleString()+' — '+a.length+' notes</div>';
    a.forEach(n=>{h+='<div class="note'+(n.pinned?' pinned':'')+'"><h2>'+esc(n.title||"Untitled")+(n.pinned?' 📌':'')+'</h2><div class="content">'+(n.content||"")+'</div><div class="meta"><small>🏷️ '+(n.category||"other")+' • '+fmtDate(n.updatedAt)+'</small></div>';});
    h+='</body></html>'; w.document.write(h); w.document.close(); w.focus(); w.print(); showToast("📄 Export opened.","success");
  }

  function exportTXT() {
    const a=notes.filter(n=>!n.archived); if (!a.length) { showToast("⚠️ No notes.","warning"); return; }
    let txt="=== Sticky Notes ===\nExported: "+new Date().toLocaleString()+"\nTotal: "+a.length+"\n\n";
    a.forEach((n,i)=>{txt+="["+(i+1)+"] "+(n.title||"Untitled")+(n.pinned?" [PINNED]":"")+"\nCategory: "+(n.category||"other")+"\nTags: "+((n.tags||[]).join(", ")||"none")+"\n"+strip(n.content)+"\n\n---\n\n";});
    const blob=new Blob([txt],{type:"text/plain"}), url=URL.createObjectURL(blob);
    const aEl=document.createElement("a"); aEl.href=url; aEl.download="notes-"+Date.now()+".txt"; aEl.click(); URL.revokeObjectURL(url);
    showToast("📝 Downloaded!","success");
  }

  function exportAllData() {
    const data={notes,trash,exportedAt:now()};
    const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}), url=URL.createObjectURL(blob);
    const a=document.createElement("a"); a.href=url; a.download="notes-backup-"+Date.now()+".json"; a.click(); URL.revokeObjectURL(url);
    showToast("📦 Exported!","success");
  }

  function clearAllNotes() {
    showConfirm("Permanently delete ALL notes and trash? This cannot be undone.", function() {
      notes = []; trash = []; save(); render(); updateAnalytics();
      showToast("🗑️ All notes cleared.","info");
    });
  }

  function loadSample() {
    if (notes.length) return;
    const samples = [
      {title:"📚 Calculus Review", content:"<p>Key formulas:</p><ul><li>d/dx x^n = nx^(n-1)</li><li>∫udv = uv - ∫vdu</li><li>Chain rule</li></ul>", color:"green", pinned:true, category:"study", tags:["math","calculus"]},
      {title:"⏰ Physics Assignment", content:"<p><b>Due Monday!</b></p><p>Thermodynamics problems 1-10, derive Carnot efficiency.</p>", color:"orange", pinned:true, category:"reminder", tags:["physics","deadline"]},
      {title:"💡 Flashcard Feature", content:"<p>Auto-convert notes to flashcards with spaced repetition.</p>", color:"purple", pinned:false, category:"idea", tags:["feature"]},
      {title:"📝 Organic Reactions", content:"<ul><li>SN1 vs SN2</li><li>E1 & E2 elimination</li><li>Aldol condensation</li></ul>", color:"blue", pinned:false, category:"exam", tags:["chemistry"]},
      {title:"🔧 Study Planner App", content:"<p>React + drag & drop scheduler with AI recommendations.</p>", color:"teal", pinned:false, category:"project", tags:["dev","planner"]}
    ];
    samples.forEach(s=>notes.push({id:genId(),...s,archived:false,createdAt:now(),updatedAt:now()}));
    save(); render(); updateAnalytics();
  }

  // ===== EVENT INIT =====
  function init() {
    load(); loadSettings(); loadSample(); render(); updateAnalytics();

    // Add Note
    if (DOM.addNoteBtn) DOM.addNoteBtn.addEventListener("click",()=>openEditor(null));

    // Search
    if (DOM.searchNotes) DOM.searchNotes.addEventListener("input",e=>{searchQuery=e.target.value; render();});

    // Color filter chips
    if (DOM.colorChips) DOM.colorChips.addEventListener("click",e=>{const c=e.target.closest(".sn-color-chip"); if(!c) return; currentColor=c.dataset.color; qsa(".sn-color-chip",DOM.colorChips).forEach(el=>el.classList.toggle("active",el.dataset.color===currentColor)); render();});

    // View toggle
    const viewGrid = $("viewGridBtn");
    const viewBoard = $("viewBoardBtn");
    if (viewGrid) viewGrid.addEventListener("click",function(){viewMode="grid"; this.classList.add("active"); if(viewBoard) viewBoard.classList.remove("active"); render();});
    if (viewBoard) viewBoard.addEventListener("click",function(){viewMode="board"; this.classList.add("active"); if(viewGrid) viewGrid.classList.remove("active"); render();});

    // Modal controls
    if (DOM.modalClose) DOM.modalClose.addEventListener("click",closeEditor);
    if (DOM.cancelNoteBtn) DOM.cancelNoteBtn.addEventListener("click",closeEditor);
    if (DOM.noteEditorModal) DOM.noteEditorModal.addEventListener("click",e=>{if(e.target===DOM.noteEditorModal) closeEditor();});
    if (DOM.saveNoteBtn) DOM.saveNoteBtn.addEventListener("click",saveNote);

    // Delete note from modal — use custom confirm instead of native confirm()
    if (DOM.deleteNoteBtn) DOM.deleteNoteBtn.addEventListener("click",()=>{
      if(editingNoteId) {
        showConfirm("Move this note to trash?", function() {
          deleteNote(editingNoteId);
          closeEditor();
        });
      }
    });

    if (DOM.archiveNoteBtn) DOM.archiveNoteBtn.addEventListener("click",()=>{if(editingNoteId) toggleArchive(editingNoteId);});

    // Format toolbar
    qsa(".sn-format-toolbar button[data-cmd]").forEach(b=>b.addEventListener("click",function(){execFmt(this.dataset.cmd);}));

    // Modal color picker
    if (DOM.modalColorPicker) DOM.modalColorPicker.addEventListener("click",e=>{const o=e.target.closest(".color-option"); if(!o) return; qsa(".color-option",DOM.modalColorPicker).forEach(el=>el.classList.remove("active")); o.classList.add("active");});

    // Notes grid actions — with custom confirm
    if (DOM.notesGrid) DOM.notesGrid.addEventListener("click",e=>{
      const b=e.target.closest("button"); if(!b||!b.dataset.id) return; const id=b.dataset.id;
      if (b.classList.contains("sn-edit-btn")) { const n=notes.find(x=>x.id===id); if(n) openEditor(n); }
      else if (b.classList.contains("sn-pin-btn")) togglePin(id);
      else if (b.classList.contains("sn-delete-btn")) {
        showConfirm("Move this note to trash?", function() { deleteNote(id); });
      }
      else if (b.classList.contains("sn-archive-btn")) toggleArchive(id);
      else if (b.classList.contains("sn-restore-btn")) restoreNote(id);
      else if (b.classList.contains("sn-delete-perm-btn")) {
        showConfirm("Permanently delete this note?", function() { deleteNote(id); });
      }
    });

    // Quick filters
    qsa(".sn-quick-filter").forEach(b=>b.addEventListener("click",function(){currentFilter=this.dataset.filter; qsa(".sn-quick-filter").forEach(x=>x.classList.remove("active")); this.classList.add("active"); render();}));

    // Categories
    qsa(".sn-category-item").forEach(el=>el.addEventListener("click",function(){currentCategory=this.dataset.category; cats(); render();}));

    // Voice
    if (DOM.voiceNoteBtn) DOM.voiceNoteBtn.addEventListener("click",startRecord);
    if (DOM.stopRecordingBtn) DOM.stopRecordingBtn.addEventListener("click",stopRecord);
    if (DOM.cancelRecordingBtn) DOM.cancelRecordingBtn.addEventListener("click",()=>{stopRecord(); if(DOM.voiceRecorder) DOM.voiceRecorder.classList.remove("recording");});

    // TTS
    if (DOM.ttsBtn) DOM.ttsBtn.addEventListener("click",speakNote);

    // Font size slider
    if (DOM.fontSizeSlider) DOM.fontSizeSlider.addEventListener("input",function(){if(DOM.noteContentEditor) DOM.noteContentEditor.style.fontSize=this.value+"px"; saveSettings();});

    // Export
    if (DOM.exportPdfBtn) DOM.exportPdfBtn.addEventListener("click",exportPDF);
    if (DOM.exportTxtBtn) DOM.exportTxtBtn.addEventListener("click",exportTXT);

    // Analytics toggle
    if (DOM.analyticsBtn) DOM.analyticsBtn.addEventListener("click",()=>{const p=DOM.analyticsPanel; if(p){p.style.display=p.style.display==="none"?"grid":"none"; updateAnalytics();}});

    // Drag & drop file upload
    if (DOM.dropZone&&DOM.fileInput) {
      DOM.dropZone.addEventListener("click",()=>DOM.fileInput.click());
      DOM.dropZone.addEventListener("dragover",e=>{e.preventDefault(); DOM.dropZone.classList.add("drag-over");});
      DOM.dropZone.addEventListener("dragleave",()=>DOM.dropZone.classList.remove("drag-over"));
      DOM.dropZone.addEventListener("drop",e=>{e.preventDefault(); DOM.dropZone.classList.remove("drag-over"); if(e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files);});
      DOM.fileInput.addEventListener("change",function(){if(this.files.length) uploadFiles(this.files); this.value="";});
    }

    // Paste content
    if (DOM.createFromPasteBtn) DOM.createFromPasteBtn.addEventListener("click",createFromPaste);

    // Extra features buttons
    const collabBtn = $("collabBtn");
    const a11yBtn = $("a11yBtn");
    if (collabBtn) collabBtn.addEventListener("click",()=>showToast("👥 Collaboration feature coming soon!","info"));
    if (a11yBtn) a11yBtn.addEventListener("click",()=>showToast("♿ Accessibility settings available in the editor modal.","info"));

// Global search
    const globalSearchInput = $("globalSearchInput");
    const globalSearchBtn = $("globalSearchBtn");
    if (globalSearchInput) {
      globalSearchInput.addEventListener("keydown", function(e) {
        if (e.key === "Enter") {
          const q = this.value.trim();
          if (q) {
            searchQuery = q;
            if (DOM.searchNotes) DOM.searchNotes.value = q;
            render();
            showToast(`🔍 Searching for: "${q}"`,"info");
          }
        }
      });
    }
    if (globalSearchBtn) {
      globalSearchBtn.addEventListener("click", function() {
        const input = $("globalSearchInput");
        if (input) {
          const q = input.value.trim();
          if (q) {
            searchQuery = q;
            if (DOM.searchNotes) DOM.searchNotes.value = q;
            render();
            showToast(`🔍 Searching for: "${q}"`,"info");
          }
        }
      });
    }

    // Scroll to top (use shared.js)
    if (window.initScrollTop) window.initScrollTop("scrollTopBtn");

    // Keyboard shortcut: Escape to close modal
    document.addEventListener("keydown", function(e) {
      if (e.key === "Escape" && DOM.noteEditorModal && DOM.noteEditorModal.classList.contains("open")) {
        closeEditor();
      }
    });

    console.log("✅ Sticky Notes initialized");
  }

  // Boot
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();

