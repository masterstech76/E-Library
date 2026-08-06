/**
 * Micro-Quizzes — 3-minute recall bursts for fast practice.
 * Handles: quick quiz configuration, large 3-minute countdown timer with
 * color shifts, single-question focused view, auto-advance, score/streak
 * counters, speed indicator, instant feedback, review of wrong answers,
 * and suggested follow-up practice.
 */
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);

  // ============================================================
  // 1. QUESTION BANK (keyed by subject) — with difficulty
  // ============================================================
  const QUESTION_BANK = {
    math: {
      label: "Mathematics", icon: "📐",
      questions: [
        { d: "easy", type: "mcq", text: "What is 5 + 7?", options: ["10", "11", "12", "13"], answer: 2, explanation: "5 + 7 = 12." },
        { d: "easy", type: "mcq", text: "What is 9 × 6?", options: ["54", "56", "63", "45"], answer: 0, explanation: "9 × 6 = 54." },
        { d: "easy", type: "mcq", text: "What is half of 50?", options: ["20", "25", "30", "35"], answer: 1, explanation: "50 ÷ 2 = 25." },
        { d: "medium", type: "mcq", text: "Solve for x: 2x + 6 = 14", options: ["3", "4", "5", "6"], answer: 1, explanation: "2x = 8, so x = 4." },
        { d: "medium", type: "numeric", text: "What is 5! (5 factorial)?", answer: 120, explanation: "5! = 5×4×3×2×1 = 120." },
        { d: "medium", type: "mcq", text: "What is the area of a circle with radius 7? (π≈22/7)", options: ["144", "154", "164", "174"], answer: 1, explanation: "Area = πr² = (22/7)×49 = 154." },
        { d: "hard", type: "mcq", text: "What is the derivative of x²?", options: ["x", "2x", "x²", "2"], answer: 1, explanation: "d/dx(x²) = 2x." },
        { d: "hard", type: "numeric", text: "What is 2⁶ (2 to the power 6)?", answer: 64, explanation: "2⁶ = 64." },
        { d: "hard", type: "mcq", text: "If log₂(x) = 5, what is x?", options: ["16", "25", "32", "64"], answer: 2, explanation: "2⁵ = 32." },
      ],
    },
    science: {
      label: "Science", icon: "🔬",
      questions: [
        { d: "easy", type: "mcq", text: "What is the chemical symbol for water?", options: ["CO₂", "H₂O", "O₂", "NaCl"], answer: 1, explanation: "Water is H₂O." },
        { d: "easy", type: "mcq", text: "Which planet is the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Mercury"], answer: 1, explanation: "Mars appears reddish." },
        { d: "easy", type: "mcq", text: "Which gas do plants absorb?", options: ["Oxygen", "Nitrogen", "CO₂", "Helium"], answer: 2, explanation: "Plants absorb CO₂." },
        { d: "medium", type: "mcq", text: "What is the powerhouse of the cell?", options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi"], answer: 2, explanation: "Mitochondria make ATP." },
        { d: "medium", type: "numeric", text: "What is the speed of light (×10⁸ m/s)?", answer: 3, explanation: "≈ 3 × 10⁸ m/s." },
        { d: "medium", type: "mcq", text: "Which force keeps us grounded?", options: ["Friction", "Gravity", "Magnetism", "Tension"], answer: 1, explanation: "Gravity." },
        { d: "hard", type: "mcq", text: "Which particle has a negative charge?", options: ["Proton", "Neutron", "Electron", "Photon"], answer: 2, explanation: "Electrons are negative." },
        { d: "hard", type: "mcq", text: "What is the pH of a neutral solution?", options: ["0", "5", "7", "14"], answer: 2, explanation: "pH 7 is neutral." },
        { d: "hard", type: "numeric", text: "How many chromosomes does a human have?", answer: 46, explanation: "46 (23 pairs)." },
      ],
    },
    cs: {
      label: "Computer Science", icon: "💻",
      questions: [
        { d: "easy", type: "mcq", text: "Which language defines web structure?", options: ["Python", "C++", "HTML", "Java"], answer: 2, explanation: "HTML." },
        { d: "easy", type: "mcq", text: "What does CPU stand for?", options: ["Central Processing Unit", "Computer Personal Unit", "Central Program Utility", "Core Processing Unit"], answer: 0, explanation: "Central Processing Unit." },
        { d: "easy", type: "numeric", text: "How many bits are in one byte?", answer: 8, explanation: "8 bits." },
        { d: "medium", type: "mcq", text: "Which structure uses FIFO?", options: ["Stack", "Queue", "Tree", "Graph"], answer: 1, explanation: "Queue = FIFO." },
        { d: "medium", type: "mcq", text: "Which is an operating system?", options: ["Photoshop", "Linux", "Chrome", "Excel"], answer: 1, explanation: "Linux is an OS." },
        { d: "medium", type: "mcq", text: "What does HTTP stand for?", options: ["HyperText Transfer Protocol", "High Tech Transfer Process", "Hyper Test Transport", "Home Text Transfer"], answer: 0, explanation: "HyperText Transfer Protocol." },
        { d: "hard", type: "mcq", text: "Complexity of binary search?", options: ["O(n)", "O(log n)", "O(n²)", "O(1)"], answer: 1, explanation: "O(log n)." },
        { d: "hard", type: "mcq", text: "Which sort is O(n log n) average?", options: ["Bubble", "Insertion", "Merge", "Selection"], answer: 2, explanation: "Merge Sort." },
        { d: "hard", type: "numeric", text: "How many bits in 1 kilobyte?", answer: 8192, explanation: "1024 bytes × 8 = 8192." },
      ],
    },
    english: {
      label: "English", icon: "📖",
      questions: [
        { d: "easy", type: "mcq", text: "Synonym for 'happy'?", options: ["Sad", "Joyful", "Angry", "Tired"], answer: 1, explanation: "'Joyful'." },
        { d: "easy", type: "mcq", text: "Past tense of 'run'?", options: ["runed", "ran", "runned", "running"], answer: 1, explanation: "'ran'." },
        { d: "easy", type: "mcq", text: "Which is correct?", options: ["He go.", "He goes.", "He going.", "He gone."], answer: 1, explanation: "'goes'." },
        { d: "medium", type: "mcq", text: "Find the noun: 'The cat sleeps.'", options: ["cat", "sleeps", "peacefully", "The"], answer: 0, explanation: "'cat'." },
        { d: "medium", type: "mcq", text: "Which is an adverb?", options: ["quickly", "quick", "quicken", "quickness"], answer: 0, explanation: "'quickly'." },
        { d: "medium", type: "numeric", text: "How many vowels in 'education'?", answer: 5, explanation: "e,u,a,i,o." },
        { d: "hard", type: "mcq", text: "Passive: 'They built the house.'", options: ["The house built.", "The house was built by them.", "The house is build.", "built the house"], answer: 1, explanation: "Correct passive form." },
        { d: "hard", type: "mcq", text: "Which is a metaphor?", options: ["As brave as a lion", "The world is a stage", "He runs fast", "She sings"], answer: 1, explanation: "'The world is a stage'." },
        { d: "hard", type: "numeric", text: "How many letters in 'independence'?", answer: 12, explanation: "'independence' = 12 letters." },
      ],
    },
    history: {
      label: "History & Civics", icon: "📜",
      questions: [
        { d: "easy", type: "mcq", text: "Year India gained independence?", options: ["1945", "1947", "1950", "1942"], answer: 1, explanation: "1947." },
        { d: "easy", type: "mcq", text: "First President of India?", options: ["Nehru", "Rajendra Prasad", "Patel", "Gandhi"], answer: 1, explanation: "Dr. Rajendra Prasad." },
        { d: "easy", type: "mcq", text: "Who built the Taj Mahal?", options: ["Akbar", "Shah Jahan", "Aurangzeb", "Babur"], answer: 1, explanation: "Shah Jahan." },
        { d: "medium", type: "mcq", text: "The Salt March was led by?", options: ["Bose", "Gandhi", "Nehru", "Bhagat Singh"], answer: 1, explanation: "Gandhi." },
        { d: "medium", type: "mcq", text: "Which civilization built the pyramids?", options: ["Roman", "Egyptian", "Greek", "Mesopotamian"], answer: 1, explanation: "Egyptian." },
        { d: "medium", type: "numeric", text: "How many fundamental rights originally?", answer: 7, explanation: "Seven." },
        { d: "hard", type: "mcq", text: "Battle of Plassey year?", options: ["1757", "1857", "1640", "1812"], answer: 0, explanation: "1757." },
        { d: "hard", type: "mcq", text: "Who wrote the Arthashastra?", options: ["Chanakya", "Ashoka", "Harsha", "Buddha"], answer: 0, explanation: "Chanakya." },
        { d: "hard", type: "numeric", text: "Year WWII ended?", answer: 1945, explanation: "1945." },
      ],
    },
    commerce: {
      label: "Commerce", icon: "📊",
      questions: [
        { d: "easy", type: "mcq", text: "Assets = Liabilities + ?", options: ["Income", "Equity", "Expenses", "Cash"], answer: 1, explanation: "Assets = Liabilities + Equity." },
        { d: "easy", type: "mcq", text: "Which is a current asset?", options: ["Building", "Inventory", "Machinery", "Patent"], answer: 1, explanation: "Inventory." },
        { d: "easy", type: "numeric", text: "Cost ₹200, sold ₹250. Profit?", answer: 50, explanation: "250 − 200 = 50." },
        { d: "medium", type: "mcq", text: "Which lists all transactions?", options: ["Invoice", "Ledger", "Quotation", "Receipt"], answer: 1, explanation: "Ledger." },
        { d: "medium", type: "mcq", text: "Primary purpose of marketing?", options: ["Cut costs", "Create and deliver value", "Reduce employees", "Increase taxes"], answer: 1, explanation: "Create and deliver value." },
        { d: "medium", type: "numeric", text: "Shirt ₹500, 20% off. Sale price?", answer: 400, explanation: "500 − 100 = 400." },
        { d: "hard", type: "mcq", text: "Which ratio measures profitability?", options: ["Current", "Profit Margin", "Quick", "Debt"], answer: 1, explanation: "Profit margin." },
        { d: "hard", type: "mcq", text: "What does GDP stand for?", options: ["Gross Domestic Product", "General Domestic Price", "Gross Development Plan", "Global Demand Product"], answer: 0, explanation: "Gross Domestic Product." },
        { d: "hard", type: "numeric", text: "Revenue ₹1000, expenses ₹650. Net profit?", answer: 350, explanation: "1000 − 650 = 350." },
      ],
    },
  };

  // ============================================================
  // 2. STATE
  // ============================================================
  const state = {
    config: { subject: "mixed", difficulty: "medium", questionCount: 10 },
    questions: [],
    currentIndex: 0,
    results: [],
    score: 0,
    streak: 0,
    bestStreak: 0,
    timer: { total: 180, remaining: 180, interval: null },
    quizActive: false,
    submitted: false,
  };

  const TOTAL_TIME = 180; // 3 minutes

  function fmtTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m + ":" + String(s).padStart(2, "0");
  }

  // ============================================================
  // 3. BUILD QUIZ
  // ============================================================
  function buildQuiz() {
    const subjects = state.config.subject === "mixed"
      ? Object.keys(QUESTION_BANK)
      : [state.config.subject];

    const pool = [];
    subjects.forEach((subjId) => {
      const bank = QUESTION_BANK[subjId];
      bank.questions
        .filter((q) => q.d === state.config.difficulty)
        .forEach((q) => pool.push({ ...q, subjectId: subjId, subjectLabel: bank.label, subjectIcon: bank.icon }));
    });

    // Shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    state.questions = pool.slice(0, state.config.questionCount);
  }

  // ============================================================
  // 4. RENDER QUESTION
  // ============================================================
  function renderQuestion() {
    const q = state.questions[state.currentIndex];
    if (!q) return;

    $("mqQTopic").textContent = q.subjectIcon + " " + q.subjectLabel;
    $("mqQCounter").textContent = "Question " + (state.currentIndex + 1) + " of " + state.questions.length;
    $("mqQText").textContent = q.text;

    const opts = $("mqOptions");
    const inputWrap = $("mqInputWrap");
    const input = $("mqAnswerInput");

    $("mqFeedback").classList.remove("visible");
    $("mqNextWrap").classList.add("mq-hidden");

    if (q.type === "mcq") {
      inputWrap.classList.add("mq-hidden");
      opts.classList.remove("mq-hidden");
      opts.innerHTML = q.options
        .map((opt, i) => {
          const key = String.fromCharCode(65 + i);
          return `
            <div class="mq-option" data-option="${i}" role="radio" tabindex="0" aria-checked="false">
              <span class="opt-key">${key}</span>
              <span class="opt-text">${opt}</span>
            </div>
          `;
        })
        .join("");

      opts.querySelectorAll(".mq-option").forEach((el) => {
        el.addEventListener("click", () => handleAnswer("mcq", parseInt(el.dataset.option)));
        el.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleAnswer("mcq", parseInt(el.dataset.option));
          }
        });
      });
    } else {
      opts.classList.add("mq-hidden");
      inputWrap.classList.remove("mq-hidden");
      input.value = "";
      input.disabled = false;
      input.classList.remove("correct", "wrong");
      input.focus();
      input.onkeydown = (e) => {
        if (e.key === "Enter") { e.preventDefault(); handleAnswer("numeric", input.value.trim()); }
      };
    }
  }

  // ============================================================
  // 5. ANSWER HANDLING
  // ============================================================
  function handleAnswer(type, value) {
    if (state.submitted || state.quizActive === false) return;
    // Prevent double-answer on the same question
    const already = state.results.find((r) => r.index === state.currentIndex);
    if (already) return;

    const q = state.questions[state.currentIndex];
    const timeUsed = TOTAL_TIME - state.timer.remaining;
    let correct = false;

    if (type === "mcq") {
      correct = value === q.answer;
      $("mqOptions").querySelectorAll(".mq-option").forEach((el) => {
        el.classList.add("disabled");
        const i = parseInt(el.dataset.option);
        if (i === q.answer) el.classList.add("correct");
        if (i === value && value !== q.answer) el.classList.add("wrong");
      });
    } else if (type === "timeout") {
      correct = false;
      optsMarkTimeout();
    } else {
      correct = String(value).trim() === String(q.answer).trim();
      const input = $("mqAnswerInput");
      input.classList.add(correct ? "correct" : "wrong");
      input.disabled = true;
    }

    // Record result
    state.results.push({ index: state.currentIndex, correct, timeUsed, question: q, type, userAnswer: type === "mcq" ? q.options[value] : (type === "timeout" ? "—" : value) });

    if (correct) {
      state.score++;
      state.streak++;
      state.bestStreak = Math.max(state.bestStreak, state.streak);
    } else {
      state.streak = 0;
    }

    // Speed indicator based on timeUsed
    const speed = timeUsed <= 3 ? "Lightning ⚡" : timeUsed <= 6 ? "Fast 🚀" : timeUsed <= 10 ? "Steady ✅" : "Careful 🐢";
    $("mqSpeed").textContent = speed;
    $("mqScore").textContent = state.score;
    $("mqStreak").textContent = state.streak;

    // Feedback
    const fb = $("mqFeedback");
    $("mqFbTitle").className = "fb-title " + (correct ? "correct" : "wrong");
    $("mqFbTitle").textContent = correct ? "✅ Correct!" : "❌ Not quite.";
    $("mqFbExplain").textContent = "💡 " + q.explanation;
    $("mqFbSpeed").textContent = "⚡ Speed: " + speed + " • " + timeUsed + "s";
    fb.classList.add("visible");

    // Next button
    $("mqNextWrap").classList.remove("mq-hidden");
    $("mqNextBtn").innerHTML = state.currentIndex < state.questions.length - 1 ? "Next Question →" : "✓ Finish";

    updateProgress();
  }

  function optsMarkTimeout() {
    $("mqOptions").querySelectorAll(".mq-option").forEach((el) => {
      el.classList.add("disabled");
      if (parseInt(el.dataset.option) === state.questions[state.currentIndex].answer) el.classList.add("correct");
    });
  }

  // ============================================================
  // 6. TIMER
  // ============================================================
  function startTimer() {
    clearInterval(state.timer.interval);
    state.timer.interval = setInterval(() => {
      if (!state.quizActive || state.submitted) return;
      state.timer.remaining--;
      updateTimerClock();
      if (state.timer.remaining <= 0) {
        clearInterval(state.timer.interval);
        showToast("⏱️ Time's up! Auto-submitting...", "warning");
        finishQuiz();
      }
    }, 1000);
  }

  function updateTimerClock() {
    const clock = $("mqTimerClock");
    clock.textContent = fmtTime(state.timer.remaining);
    clock.classList.remove("warning", "danger");
    if (state.timer.remaining <= 30 && state.timer.remaining > 10) {
      clock.classList.add("warning");
    } else if (state.timer.remaining <= 10) {
      clock.classList.add("danger");
    }
  }

  // ============================================================
  // 7. QUIZ FLOW
  // ============================================================
  function beginQuiz() {
    state.config.subject = $("mqSubject").value;
    state.config.difficulty = $("mqDifficulty").value;
    state.config.questionCount = parseInt($("mqQuestions").value) || 10;

    buildQuiz();
    if (!state.questions.length) {
      showToast("⚠️ No questions available for this selection.", "warning");
      return;
    }

    state.currentIndex = 0;
    state.results = [];
    state.score = 0;
    state.streak = 0;
    state.bestStreak = 0;
    state.timer.total = TOTAL_TIME;
    state.timer.remaining = TOTAL_TIME;
    state.quizActive = true;
    state.submitted = false;

    $("mqStartPanel").classList.add("mq-hidden");
    $("mqSummarySection").classList.remove("active");
    $("mqQuizMode").classList.add("active");

    $("mqTimerClock").textContent = "3:00";
    $("mqSpeed").textContent = "—";
    $("mqScore").textContent = "0";
    $("mqStreak").textContent = "0";

    renderQuestion();
    updateProgress();
    startTimer();
    window.scrollTo({ top: 0, behavior: "smooth" });
    showToast("⚡ 3-minute micro-quiz started! Go fast!", "success");
  }

  function nextQuestion() {
    if (state.currentIndex < state.questions.length - 1) {
      state.currentIndex++;
      renderQuestion();
    } else {
      finishQuiz();
    }
  }

  function finishQuiz() {
    if (state.submitted) return;
    state.submitted = true;
    state.quizActive = false;
    clearInterval(state.timer.interval);

    saveHistory();
    renderSummary();

    $("mqQuizMode").classList.remove("active");
    $("mqSummarySection").classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ============================================================
  // 8. SUMMARY
  // ============================================================
  function renderSummary() {
    const total = state.results.length;
    const correct = state.results.filter((r) => r.correct).length;
    const wrong = state.results.filter((r) => !r.correct && r.type !== "timeout").length;
    const skipped = state.results.filter((r) => r.type === "timeout").length;
    // Note: wrong answers are those marked incorrect; skipped are timeouts
    const avgTime = total ? Math.round(state.results.reduce((s, r) => s + r.timeUsed, 0) / total) : 0;
    const accuracy = total ? Math.round((correct / total) * 100) : 0;

    $("mqStatCorrect").textContent = correct;
    $("mqStatWrong").textContent = wrong;
    $("mqStatSkipped").textContent = skipped;
    $("mqStatSpeed").textContent = avgTime + "s";
    $("mqStatBestStreak").textContent = state.bestStreak;

    let title, msg;
    if (accuracy >= 80) {
      title = "Blazing Fast! 🏆";
      msg = "Superb recall speed and accuracy. You crushed this burst!";
    } else if (accuracy >= 60) {
      title = "Great Burst! 🎉";
      msg = "Solid performance. Review the misses and go again for a higher streak.";
    } else if (accuracy >= 40) {
      title = "Good Effort 💪";
      msg = "You're building recall muscle. Review below and retry.";
    } else {
      title = "Keep Practicing 📚";
      msg = "Every burst counts. Review the explanations and try another round.";
    }
    $("mqSummaryTitle").textContent = title;
    $("mqSummaryMsg").textContent = msg;

    // Review mistakes
    const mistakes = state.results.filter((r) => !r.correct);
    const review = $("mqReviewList");
    if (!mistakes.length) {
      review.innerHTML = '<p style="color:var(--success-color);font-size:0.85rem;">🎉 Perfect round — no mistakes to review!</p>';
    } else {
      review.innerHTML = mistakes
        .map((r) => {
          const correctDisplay = r.question.type === "mcq" ? r.question.options[r.question.answer] : r.question.answer;
          return `
            <div class="mq-review-item">
              <div class="mq-review-q">${r.index + 1}. ${r.question.subjectIcon} ${r.question.text}</div>
              <div class="mq-review-answer">
                <span class="answer-tag wrong">Missed</span>
                Your answer: <strong>${r.userAnswer}</strong>
              </div>
              <div class="mq-review-answer">Correct answer: <strong>${correctDisplay}</strong></div>
              <div class="mq-review-explanation">💡 ${r.question.explanation}</div>
            </div>
          `;
        })
        .join("");
    }

    // Follow-up suggestions
    const followups = [];
    if (correct < total) {
      followups.push({ icon: "📘", text: "Review the missed topics above — explanations are provided for each." });
    }
    followups.push({ icon: "⚡", text: "Try another round with the same settings to improve your speed and streak." });
    if (state.config.difficulty !== "hard") {
      followups.push({ icon: "🚀", text: "Feeling confident? Bump the difficulty to Hard for a bigger challenge." });
    } else if (state.config.difficulty !== "easy") {
      followups.push({ icon: "🎯", text: "Try Easy mode for a confidence-building warm-up round." });
    }
    followups.push({ icon: "📈", text: "Your best streak this round: " + state.bestStreak + ". Aim to beat it next time!" });

    $("mqFollowupList").innerHTML = followups
      .map((f) => `<div class="mq-followup-item"><span class="fu-icon">${f.icon}</span><span class="fu-text">${f.text}</span></div>`)
      .join("");
  }

  // ============================================================
  // 9. PROGRESS + PERSISTENCE
  // ============================================================
  function updateProgress() {
    const total = state.questions.length;
    const answered = state.results.length;
    const pct = total ? Math.round((answered / total) * 100) : 0;
    $("mqProgressFill").style.width = pct + "%";
    $("mqProgressLabel").textContent = answered + " / " + total + " answered";
    $("mqProgressPct").textContent = pct + "%";
  }

  function saveHistory() {
    try {
      const history = JSON.parse(localStorage.getItem("mqHistory") || "[]");
      const correct = state.results.filter((r) => r.correct).length;
      history.unshift({
        id: Date.now(),
        subject: state.config.subject,
        difficulty: state.config.difficulty,
        score: correct,
        total: state.results.length,
        bestStreak: state.bestStreak,
        date: new Date().toISOString(),
      });
      if (history.length > 20) history.pop();
      localStorage.setItem("mqHistory", JSON.stringify(history));
    } catch (e) { /* quota */ }
  }

  // ============================================================
  // 10. FULLSCREEN
  // ============================================================
  function toggleFullscreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
    else document.exitFullscreen();
  }

  // ============================================================
  // 11. INIT
  // ============================================================
  function init() {
    $("mqSubject").value = state.config.subject;

    $("mqHeroStartBtn").addEventListener("click", () => {
      $("mqStartPanel").scrollIntoView({ behavior: "smooth" });
    });
    $("mqStartBtn").addEventListener("click", beginQuiz);
    $("mqResetBtn").addEventListener("click", () => {
      $("mqSubject").value = "mixed";
      $("mqDifficulty").value = "medium";
      $("mqQuestions").value = "10";
      showToast("↺ Configuration reset", "info");
    });
    $("mqNextBtn").addEventListener("click", nextQuestion);
    $("mqRetryBtn").addEventListener("click", () => {
      $("mqSummarySection").classList.remove("active");
      beginQuiz();
    });
    $("mqReviewMistakesBtn").addEventListener("click", () => {
      const el = document.querySelector(".mq-mistakes");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    });
    $("mqFullscreenBtn").addEventListener("click", toggleFullscreen);

    if (window.initScrollTop) window.initScrollTop("scrollTopBtn");
    if (window.initAtomicLogo) window.initAtomicLogo("headerAtomicCanvas", 100);

    console.log("⚡ Micro-Quizzes initialized — ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
