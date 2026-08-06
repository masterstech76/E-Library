/**
 * Adaptive Quizzes — Real-time difficulty adjustment.
 * Handles: quiz configuration, adaptive question selection (difficulty shifts
 * based on answers), per-question timer, immediate feedback, progress tracking,
 * difficulty meter, streak/score quick stats, post-quiz analysis with adaptive
 * growth, recommendations, and answer review.
 */
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);

  // ============================================================
  // 1. QUESTION BANK (keyed by subject) — each question has difficulty
  // ============================================================
  const QUESTION_BANK = {
    math: {
      label: "Mathematics",
      icon: "📐",
      questions: [
        { d: "easy", type: "mcq", text: "What is 5 + 7?", options: ["10", "11", "12", "13"], answer: 2, explanation: "5 + 7 = 12." },
        { d: "easy", type: "mcq", text: "What is 9 × 6?", options: ["54", "56", "63", "45"], answer: 0, explanation: "9 × 6 = 54." },
        { d: "easy", type: "mcq", text: "What is the value of 100 ÷ 4?", options: ["20", "25", "30", "40"], answer: 1, explanation: "100 ÷ 4 = 25." },
        { d: "medium", type: "mcq", text: "Solve for x: 2x + 6 = 14", options: ["3", "4", "5", "6"], answer: 1, explanation: "2x = 8, so x = 4." },
        { d: "medium", type: "mcq", text: "What is the area of a circle with radius 7? (π ≈ 22/7)", options: ["144", "154", "164", "174"], answer: 1, explanation: "Area = πr² = (22/7)×49 = 154." },
        { d: "medium", type: "numeric", text: "What is the value of 5! (5 factorial)?", answer: 120, explanation: "5! = 5×4×3×2×1 = 120." },
        { d: "hard", type: "mcq", text: "What is the derivative of x² with respect to x?", options: ["x", "2x", "x²", "2"], answer: 1, explanation: "d/dx(x²) = 2x by the power rule." },
        { d: "hard", type: "mcq", text: "If log₂(x) = 5, what is x?", options: ["16", "25", "32", "64"], answer: 2, explanation: "2⁵ = 32, so x = 32." },
        { d: "hard", type: "numeric", text: "What is the integral of 2x dx from 0 to 3?", answer: 9, explanation: "∫2x dx = x², evaluated from 0 to 3 = 9." },
      ],
    },
    science: {
      label: "Science",
      icon: "🔬",
      questions: [
        { d: "easy", type: "mcq", text: "What is the chemical symbol for water?", options: ["CO₂", "H₂O", "O₂", "NaCl"], answer: 1, explanation: "Water is H₂O." },
        { d: "easy", type: "mcq", text: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Mercury"], answer: 1, explanation: "Mars appears reddish due to iron oxide." },
        { d: "easy", type: "mcq", text: "Which gas do plants absorb from the air?", options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Helium"], answer: 2, explanation: "Plants absorb CO₂ for photosynthesis." },
        { d: "medium", type: "mcq", text: "What is the powerhouse of the cell?", options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi body"], answer: 2, explanation: "Mitochondria generate ATP energy." },
        { d: "medium", type: "mcq", text: "Which force keeps us grounded on Earth?", options: ["Friction", "Gravity", "Magnetism", "Tension"], answer: 1, explanation: "Gravity attracts objects toward Earth." },
        { d: "medium", type: "numeric", text: "What is the speed of light in vacuum (×10⁸ m/s)?", answer: 3, explanation: "Light travels at ≈ 3 × 10⁸ m/s." },
        { d: "hard", type: "mcq", text: "Which particle has a negative charge?", options: ["Proton", "Neutron", "Electron", "Photon"], answer: 2, explanation: "Electrons carry a negative charge." },
        { d: "hard", type: "mcq", text: "What is the pH of a neutral solution?", options: ["0", "5", "7", "14"], answer: 2, explanation: "pH 7 is neutral." },
        { d: "hard", type: "numeric", text: "How many chromosomes do humans have in each body cell?", answer: 46, explanation: "Humans have 46 chromosomes (23 pairs)." },
      ],
    },
    cs: {
      label: "Computer Science",
      icon: "💻",
      questions: [
        { d: "easy", type: "mcq", text: "Which language defines web page structure?", options: ["Python", "C++", "HTML", "Java"], answer: 2, explanation: "HTML defines web structure." },
        { d: "easy", type: "mcq", text: "What does CPU stand for?", options: ["Central Processing Unit", "Computer Personal Unit", "Central Program Utility", "Core Processing Unit"], answer: 0, explanation: "CPU = Central Processing Unit." },
        { d: "easy", type: "numeric", text: "How many bits are in one byte?", answer: 8, explanation: "A byte has 8 bits." },
        { d: "medium", type: "mcq", text: "Which data structure uses FIFO ordering?", options: ["Stack", "Queue", "Tree", "Graph"], answer: 1, explanation: "A queue is First-In-First-Out." },
        { d: "medium", type: "mcq", text: "Which of these is an operating system?", options: ["Photoshop", "Linux", "Chrome", "Excel"], answer: 1, explanation: "Linux is an operating system." },
        { d: "medium", type: "mcq", text: "What does 'HTTP' stand for?", options: ["HyperText Transfer Protocol", "High Tech Transfer Process", "Hyper Test Transport Protocol", "Home Text Transfer Program"], answer: 0, explanation: "HTTP = HyperText Transfer Protocol." },
        { d: "hard", type: "mcq", text: "Which sorting algorithm has O(n log n) average time?", options: ["Bubble Sort", "Insertion Sort", "Merge Sort", "Selection Sort"], answer: 2, explanation: "Merge Sort runs in O(n log n)." },
        { d: "hard", type: "mcq", text: "What is the time complexity of binary search?", options: ["O(n)", "O(log n)", "O(n²)", "O(1)"], answer: 1, explanation: "Binary search is O(log n)." },
        { d: "hard", type: "numeric", text: "How many bits are in 2 kilobytes?", answer: 16384, explanation: "2 KB = 2 × 1024 bytes × 8 bits = 16384." },
      ],
    },
    english: {
      label: "English",
      icon: "📖",
      questions: [
        { d: "easy", type: "mcq", text: "Choose the synonym for 'happy'.", options: ["Sad", "Joyful", "Angry", "Tired"], answer: 1, explanation: "'Joyful' is a synonym of 'happy'." },
        { d: "easy", type: "mcq", text: "What is the past tense of 'run'?", options: ["runed", "ran", "runned", "running"], answer: 1, explanation: "The past tense of 'run' is 'ran'." },
        { d: "easy", type: "mcq", text: "Which sentence is correct?", options: ["He go to school.", "He goes to school.", "He going to school.", "He gone to school."], answer: 1, explanation: "Third-person singular takes 'goes'." },
        { d: "medium", type: "mcq", text: "Identify the noun in: 'The cat sleeps peacefully.'", options: ["cat", "sleeps", "peacefully", "The"], answer: 0, explanation: "'Cat' is the noun." },
        { d: "medium", type: "mcq", text: "Which word is an adverb?", options: ["quickly", "quick", "quicken", "quickness"], answer: 0, explanation: "'Quickly' describes how, so it is an adverb." },
        { d: "medium", type: "numeric", text: "How many vowels are in the word 'education'?", answer: 5, explanation: "e, u, a, i, o → 5 vowels." },
        { d: "hard", type: "mcq", text: "Choose the correct passive form: 'They built the house.'", options: ["The house built.", "The house was built by them.", "The house is build.", "built the house"], answer: 1, explanation: "Passive: 'The house was built by them.'" },
        { d: "hard", type: "mcq", text: "Which is a metaphor?", options: ["As brave as a lion", "The world is a stage", "He runs fast", "She sings loudly"], answer: 1, explanation: "'The world is a stage' is a metaphor." },
        { d: "hard", type: "numeric", text: "How many letters are in the word 'independence'?", answer: 12, explanation: "'independence' has 12 letters." },
      ],
    },
    history: {
      label: "History & Civics",
      icon: "📜",
      questions: [
        { d: "easy", type: "mcq", text: "In which year did India gain independence?", options: ["1945", "1947", "1950", "1942"], answer: 1, explanation: "India became independent in 1947." },
        { d: "easy", type: "mcq", text: "Who was the first President of India?", options: ["Jawaharlal Nehru", "Rajendra Prasad", "Sardar Patel", "Mahatma Gandhi"], answer: 1, explanation: "Dr. Rajendra Prasad was first President." },
        { d: "easy", type: "mcq", text: "Who built the Taj Mahal?", options: ["Akbar", "Shah Jahan", "Aurangzeb", "Babur"], answer: 1, explanation: "Shah Jahan built the Taj Mahal." },
        { d: "medium", type: "mcq", text: "The 'Salt March' was led by whom?", options: ["Subhas Chandra Bose", "Mahatma Gandhi", "Jawaharlal Nehru", "Bhagat Singh"], answer: 1, explanation: "Gandhi led the Dandi Salt March (1930)." },
        { d: "medium", type: "mcq", text: "Which ancient civilization built the pyramids?", options: ["Roman", "Egyptian", "Greek", "Mesopotamian"], answer: 1, explanation: "Ancient Egyptians built the pyramids." },
        { d: "medium", type: "numeric", text: "How many fundamental rights were originally in the Indian Constitution?", answer: 7, explanation: "Originally there were seven fundamental rights." },
        { d: "hard", type: "mcq", text: "The Battle of Plassey was fought in which year?", options: ["1757", "1857", "1640", "1812"], answer: 0, explanation: "The Battle of Plassey was in 1757." },
        { d: "hard", type: "mcq", text: "Who wrote the 'Arthashastra'?", options: ["Chanakya", "Ashoka", "Harsha", "Buddha"], answer: 0, explanation: "Chanakya (Kautilya) wrote the Arthashastra." },
        { d: "hard", type: "numeric", text: "In which year did World War II end?", answer: 1945, explanation: "World War II ended in 1945." },
      ],
    },
    commerce: {
      label: "Commerce",
      icon: "📊",
      questions: [
        { d: "easy", type: "mcq", text: "What does 'Assets = Liabilities + Equity' represent?", options: ["Income Statement", "Accounting Equation", "Cash Flow", "Budget"], answer: 1, explanation: "This is the accounting equation." },
        { d: "easy", type: "mcq", text: "Which is a current asset?", options: ["Building", "Inventory", "Machinery", "Patent"], answer: 1, explanation: "Inventory converts to cash within a year." },
        { d: "easy", type: "numeric", text: "If an item costs ₹200 and sells at ₹250, what is the profit?", answer: 50, explanation: "Profit = 250 − 200 = 50." },
        { d: "medium", type: "mcq", text: "Which document lists all transactions of a business?", options: ["Invoice", "Ledger", "Quotation", "Receipt"], answer: 1, explanation: "A ledger summarizes all transactions." },
        { d: "medium", type: "mcq", text: "What is the primary purpose of marketing?", options: ["Cut costs", "Create and deliver value", "Reduce employees", "Increase taxes"], answer: 1, explanation: "Marketing creates and delivers value." },
        { d: "medium", type: "numeric", text: "If a shirt costs ₹500 and is discounted 20%, what is the sale price?", answer: 400, explanation: "Discount = 20% of 500 = 100; sale price = 400." },
        { d: "hard", type: "mcq", text: "Which ratio measures a company's profitability?", options: ["Current Ratio", "Profit Margin", "Quick Ratio", "Debt Ratio"], answer: 1, explanation: "Profit margin measures profitability." },
        { d: "hard", type: "mcq", text: "What does 'GDP' stand for?", options: ["Gross Domestic Product", "General Domestic Price", "Gross Development Plan", "Global Demand Product"], answer: 0, explanation: "GDP = Gross Domestic Product." },
        { d: "hard", type: "numeric", text: "If revenue is ₹1000 and expenses are ₹650, what is net profit?", answer: 350, explanation: "Net profit = 1000 − 650 = 350." },
      ],
    },
  };

  // ============================================================
  // 2. STATE
  // ============================================================
  const state = {
    config: {
      subject: "mixed",
      topic: "core",
      startLevel: "medium",
      questionCount: 10,
    },
    questions: [],        // selected sequence of {question, subjectId, difficulty}
    currentIndex: 0,
    currentLevel: "medium",
    answered: false,
    results: [],          // {correct: bool, difficulty, timeTaken, question}
    score: 0,
    streak: 0,
    bestStreak: 0,
    timer: {
      perQuestion: 15,
      remaining: 15,
      interval: null,
      totalTime: 0,
    },
    quizActive: false,
    quizStarted: false,
    submitted: false,
  };

  const LEVELS = ["easy", "medium", "hard"];
  const LEVEL_ORDER = { easy: 0, medium: 1, hard: 2 };

  function levelLabel(level) {
    return level.charAt(0).toUpperCase() + level.slice(1);
  }

  // ============================================================
  // 3. ADAPTIVE QUESTION SELECTION
  // ============================================================
  function pickSubject() {
    const keys = state.config.subject === "mixed"
      ? Object.keys(QUESTION_BANK)
      : [state.config.subject];
    return keys[Math.floor(Math.random() * keys.length)];
  }

  function pickQuestion(level) {
    // Pick a random subject, then a random question of the target level
    const subjects = state.config.subject === "mixed"
      ? Object.keys(QUESTION_BANK)
      : [state.config.subject];
    // Shuffle subjects for variety
    const shuffled = [...subjects].sort(() => 0.5 - Math.random());
    for (const subjId of shuffled) {
      const bank = QUESTION_BANK[subjId];
      const pool = bank.questions.filter((q) => q.d === level);
      if (pool.length) {
        const q = pool[Math.floor(Math.random() * pool.length)];
        return { ...q, subjectId: subjId, subjectLabel: bank.label, subjectIcon: bank.icon };
      }
    }
    // Fallback: any level
    const bank = QUESTION_BANK[shuffled[0]];
    const q = bank.questions[Math.floor(Math.random() * bank.questions.length)];
    return { ...q, subjectId: shuffled[0], subjectLabel: bank.label, subjectIcon: bank.icon };
  }

  function buildQuiz() {
    state.questions = [];
    state.currentLevel = state.config.startLevel;
    for (let i = 0; i < state.config.questionCount; i++) {
      state.questions.push(pickQuestion(state.currentLevel));
    }
  }

  // ============================================================
  // 4. RENDER — Question
  // ============================================================
  function renderQuestion() {
    const q = state.questions[state.currentIndex];
    if (!q) return;

    $("aqTopicLabel").textContent = q.subjectIcon + " " + q.subjectLabel;
    $("aqQCounter").textContent = "Question " + (state.currentIndex + 1) + " of " + state.questions.length;
    $("aqQText").textContent = q.text;

    // Difficulty badge
    const badge = $("aqDiffBadge");
    badge.className = "aq-diff " + state.currentLevel;
    badge.textContent = levelLabel(state.currentLevel);

    // Difficulty meter
    const fill = $("aqDiffFill");
    const pct = ((LEVEL_ORDER[state.currentLevel] + 1) / 3) * 100;
    fill.style.width = pct + "%";
    fill.className = "meter-fill " + state.currentLevel;

    // Reset per-question timer
    resetQTimer();

    // Options / input
    const opts = $("aqOptions");
    const inputWrap = $("aqInputWrap");
    const input = $("aqAnswerInput");

    state.answered = false;
    $("aqFeedback").classList.remove("visible");
    $("aqNextWrap").classList.add("aq-hidden");

    if (q.type === "mcq") {
      inputWrap.classList.add("aq-hidden");
      opts.classList.remove("aq-hidden");
      opts.innerHTML = q.options
        .map((opt, i) => {
          const key = String.fromCharCode(65 + i);
          return `
            <div class="aq-option" data-option="${i}" role="radio" tabindex="0" aria-checked="false">
              <span class="opt-key">${key}</span>
              <span class="opt-text">${opt}</span>
            </div>
          `;
        })
        .join("");

      opts.querySelectorAll(".aq-option").forEach((el) => {
        el.addEventListener("click", () => handleAnswer("mcq", parseInt(el.dataset.option)));
        el.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleAnswer("mcq", parseInt(el.dataset.option));
          }
        });
      });
    } else {
      // numeric/input answer
      opts.classList.add("aq-hidden");
      inputWrap.classList.remove("aq-hidden");
      input.value = "";
      input.focus();
      input.onkeydown = (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          handleAnswer("numeric", input.value.trim());
        }
      };
    }
  }

  // ============================================================
  // 5. ANSWER HANDLING + ADAPTIVE SHIFT
  // ============================================================
  function handleAnswer(type, value) {
    if (state.answered || !state.quizActive || state.submitted) return;
    state.answered = true;
    clearInterval(state.timer.interval);

    const q = state.questions[state.currentIndex];
    let correct = false;

    if (type === "mcq") {
      correct = value === q.answer;
      // Mark options
      $("aqOptions").querySelectorAll(".aq-option").forEach((el) => {
        el.classList.add("disabled");
        const i = parseInt(el.dataset.option);
        if (i === q.answer) el.classList.add("correct");
        if (i === value && value !== q.answer) el.classList.add("wrong");
      });
    } else {
      correct = String(value).trim() === String(q.answer).trim();
      const input = $("aqAnswerInput");
      input.classList.add(value === "" ? "wrong" : correct ? "correct" : "wrong");
      input.disabled = true;
    }

    // Record result
    const timeTaken = state.config.perQuestion - state.timer.remaining;
    state.results.push({
      correct,
      difficulty: state.currentLevel,
      timeTaken,
      question: q,
      userAnswer: type === "mcq" ? (q.options[value] || "—") : (value || "—"),
    });

    // Update score & streak
    if (correct) {
      state.score++;
      state.streak++;
      state.bestStreak = Math.max(state.bestStreak, state.streak);
    } else {
      state.streak = 0;
    }

    // Update quick stats
    updateQuickStats();

    // Show feedback
    showFeedback(q, correct);

    // Adaptive difficulty shift
    const prevLevel = state.currentLevel;
    if (correct) {
      // Move up a level (challenge harder)
      state.currentLevel = LEVELS[Math.min(LEVEL_ORDER[state.currentLevel] + 1, 2)];
    } else {
      // Move down a level (make manageable)
      state.currentLevel = LEVELS[Math.max(LEVEL_ORDER[state.currentLevel] - 1, 0)];
    }

    // Show motivational microcopy
    const nextMsg = $("aqFbNext");
    if (correct && state.currentLevel !== prevLevel) {
      nextMsg.textContent = "🎉 Great! Next one is harder. Keep going!";
    } else if (correct) {
      nextMsg.textContent = "💪 You are mastering this topic!";
    } else if (state.currentLevel !== prevLevel) {
      nextMsg.textContent = "📉 No worries — easing difficulty a bit. You've got this!";
    } else {
      nextMsg.textContent = "🌱 Keep trying — review the explanation above.";
    }

    // Update difficulty trend
    updateDiffHistory();

    // Show next button
    $("aqNextWrap").classList.remove("aq-hidden");
    $("aqNextBtn").innerHTML = state.currentIndex < state.questions.length - 1
      ? "Next Question →"
      : "✓ Finish Quiz";

    updateProgress();
  }

  function showFeedback(q, correct) {
    const fb = $("aqFeedback");
    const title = $("aqFbTitle");
    title.className = "fb-title " + (correct ? "correct" : "wrong");
    title.textContent = correct ? "✅ Correct!" : "❌ Not quite.";
    $("aqFbExplain").textContent = "💡 " + q.explanation;
    fb.classList.add("visible");
  }

  // ============================================================
  // 6. TIMER (per question)
  // ============================================================
  function resetQTimer() {
    clearInterval(state.timer.interval);
    state.timer.perQuestion = state.currentLevel === "hard" ? 12 : state.currentLevel === "medium" ? 15 : 20;
    state.timer.remaining = state.timer.perQuestion;
    updateQTimerClock();
    state.timer.interval = setInterval(() => {
      if (!state.quizActive || state.submitted || state.answered) return;
      state.timer.remaining--;
      state.timer.totalTime++;
      updateQTimerClock();
      if (state.timer.remaining <= 0) {
        // Time's up — treat as unanswered/wrong
        handleAnswer("timeout", "");
      }
    }, 1000);
  }

  function updateQTimerClock() {
    const clock = $("aqQTimerClock");
    clock.textContent = state.timer.remaining + "s";
    clock.classList.toggle("warning", state.timer.remaining <= 5);
  }

  // ============================================================
  // 7. QUICK STATS + PROGRESS + DIFF HISTORY
  // ============================================================
  function updateQuickStats() {
    $("aqScore").textContent = state.score;
    $("aqStreak").textContent = state.streak;
    const correctCount = state.results.filter((r) => r.correct).length;
    $("aqCorrect").textContent = correctCount;
    const totalTime = state.results.reduce((s, r) => s + r.timeTaken, 0);
    const avg = state.results.length ? Math.round(totalTime / state.results.length) : 0;
    $("aqAvgTime").textContent = avg + "s";
  }

  function updateProgress() {
    const total = state.questions.length;
    const answered = state.results.length;
    const pct = total ? Math.round((answered / total) * 100) : 0;
    $("aqProgressFill").style.width = pct + "%";
    $("aqProgressLabel").textContent = answered + " / " + total + " answered";
    $("aqProgressPct").textContent = pct + "%";
  }

  function updateDiffHistory() {
    const container = $("aqDiffHistory");
    container.innerHTML = state.results
      .map((r, i) => `
        <div class="aq-diff-item">
          <span class="di-q">Q${i + 1} <span class="aq-diff aq-diff-mini ${r.difficulty}">${levelLabel(r.difficulty)}</span></span>
          <span class="di-result ${r.correct ? "correct" : "wrong"}">${r.correct ? "✓" : "✗"}</span>
        </div>
      `)
      .join("");
  }

  // ============================================================
  // 8. QUIZ FLOW
  // ============================================================
  function beginQuiz() {
    state.config.subject = $("aqSubject").value;
    state.config.topic = $("aqTopic").value;
    state.config.startLevel = $("aqStartLevel").value;
    state.config.questionCount = parseInt($("aqQuestions").value) || 10;

    buildQuiz();
    if (!state.questions.length) {
      showToast("⚠️ No questions available for this selection.", "warning");
      return;
    }

    state.currentIndex = 0;
    state.currentLevel = state.config.startLevel;
    state.results = [];
    state.score = 0;
    state.streak = 0;
    state.bestStreak = 0;
    state.timer.totalTime = 0;
    state.quizActive = true;
    state.quizStarted = true;
    state.submitted = false;

    $("aqSelectPanel").classList.add("aq-hidden");
    $("aqResultsSection").classList.remove("active");
    $("aqQuizMode").classList.add("active");

    // Reset sidebar
    $("aqDiffHistory").innerHTML = '<p style="font-size:0.75rem;color:var(--text-muted);">No questions answered yet.</p>';
    $("aqPauseBtn").innerHTML = "⏸ Pause Quiz";
    updateQuickStats();
    updateProgress();

    renderQuestion();
    window.scrollTo({ top: 0, behavior: "smooth" });
    showToast("🧠 Adaptive quiz started! Difficulty will adjust live.", "success");
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
    renderResults();

    $("aqQuizMode").classList.remove("active");
    $("aqResultsSection").classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function pauseQuiz() {
    if (state.timer.interval) clearInterval(state.timer.interval);
    state.quizActive = false;
    $("aqPauseBtn").innerHTML = "▶ Resume Quiz";
    showToast("⏸ Quiz paused", "info");
  }

  function resumeQuiz() {
    if (state.submitted) return;
    state.quizActive = true;
    $("aqPauseBtn").innerHTML = "⏸ Pause Quiz";
    resetQTimer();
    showToast("▶ Quiz resumed", "success");
  }

  // ============================================================
  // 9. RESULTS
  // ============================================================
  function renderResults() {
    const total = state.results.length;
    const correct = state.results.filter((r) => r.correct).length;
    const wrong = total - correct;
    const accuracy = total ? Math.round((correct / total) * 100) : 0;
    const avgTime = total ? Math.round(state.results.reduce((s, r) => s + r.timeTaken, 0) / total) : 0;
    const finalLevel = state.currentLevel;

    $("aqStatCorrect").textContent = correct;
    $("aqStatWrong").textContent = wrong;
    $("aqStatAccuracy").textContent = accuracy + "%";
    $("aqStatAvgTime").textContent = avgTime + "s";
    $("aqStatFinalLevel").textContent = levelLabel(finalLevel);

    // Title & message
    let title, msg;
    if (accuracy >= 80) {
      title = "Outstanding! 🏆";
      msg = "You mastered the adaptive challenge. The engine pushed you to harder questions, and you kept up!";
    } else if (accuracy >= 60) {
      title = "Great Job! 🎉";
      msg = "Solid adaptive growth. Review the explanations and push into harder territory next time.";
    } else if (accuracy >= 40) {
      title = "Good Effort 💪";
      msg = "The engine adjusted to find your level. Focus on the weak areas to climb higher.";
    } else {
      title = "Keep Improving 📚";
      msg = "No worries — adaptive learning is a journey. Review below and try again.";
    }
    $("aqResultTitle").textContent = title;
    $("aqScoreMsg").textContent = msg;

    // Strength / weakness by subject
    const subjectStats = {};
    state.results.forEach((r) => {
      if (!subjectStats[r.question.subjectId]) {
        subjectStats[r.question.subjectId] = { correct: 0, total: 0, label: r.question.subjectLabel, icon: r.question.subjectIcon };
      }
      subjectStats[r.question.subjectId].total++;
      if (r.correct) subjectStats[r.question.subjectId].correct++;
    });

    const strengths = [];
    const weaknesses = [];
    Object.keys(subjectStats).forEach((id) => {
      const s = subjectStats[id];
      const pct = Math.round((s.correct / s.total) * 100);
      if (pct >= 70) strengths.push(s);
      else if (pct < 50) weaknesses.push(s);
    });

    $("aqStrengthList").innerHTML = strengths.length
      ? strengths.map((s) => `<div class="aq-growth-item strength">${s.icon} ${s.label} — ${Math.round((s.correct / s.total) * 100)}% accuracy</div>`).join("")
      : `<div class="aq-growth-item">No strong subjects yet. Keep practicing!</div>`;

    $("aqWeaknessList").innerHTML = weaknesses.length
      ? weaknesses.map((s) => `<div class="aq-growth-item weakness">${s.icon} ${s.label} — ${Math.round((s.correct / s.total) * 100)}% accuracy</div>`).join("")
      : `<div class="aq-growth-item">Excellent — no weak subjects detected! 🎉</div>`;

    // Recommendations
    const recs = [];
    if (weaknesses.length) {
      recs.push({ icon: "📘", text: "Review concept explanations for: " + weaknesses.map((w) => w.label).join(", "), level: "easy" });
    }
    if (accuracy < 70) {
      recs.push({ icon: "🎯", text: "Focus on " + (finalLevel === "hard" ? "medium" : "easy") + " questions to build confidence before advancing.", level: finalLevel });
    } else if (finalLevel !== "hard") {
      recs.push({ icon: "🚀", text: "You're ready for harder questions. Try a Hard-level quiz next!", level: "hard" });
    }
    recs.push({ icon: "🔄", text: "Consistency is key — attempt a quiz daily to track adaptive growth.", level: "medium" });
    recs.push({ icon: "📈", text: "Longest streak this session: " + state.bestStreak + " correct in a row. Beat it next time!", level: "medium" });

    $("aqRecommendList").innerHTML = recs
      .map((r) => `
        <div class="aq-recommend-item">
          <span class="rc-icon">${r.icon}</span>
          <span class="rc-text">${r.text}</span>
          <span class="aq-diff ${r.level}">${levelLabel(r.level)}</span>
        </div>
      `)
      .join("");

    // Review
    $("aqReviewList").innerHTML = state.results
      .map((r, i) => {
        const tag = r.correct ? "Correct" : "Incorrect";
        const tagClass = r.correct ? "correct" : "wrong";
        const correctDisplay = r.question.type === "mcq" ? r.question.options[r.question.answer] : r.question.answer;
        return `
          <div class="aq-review-item">
            <div class="aq-review-q">${i + 1}. ${r.question.subjectIcon} ${r.question.text}
              <span class="aq-diff ${r.difficulty}" style="margin-left:8px;">${levelLabel(r.difficulty)}</span>
            </div>
            <div class="aq-review-answer">
              <span class="answer-tag ${tagClass}">${tag}</span>
              Your answer: <strong>${r.userAnswer}</strong>
            </div>
            <div class="aq-review-answer">Correct answer: <strong>${correctDisplay}</strong></div>
            <div class="aq-review-explanation">💡 ${r.question.explanation}</div>
          </div>
        `;
      })
      .join("");
  }

  // ============================================================
  // 10. PERSISTENCE + PROGRESS
  // ============================================================
  function saveHistory() {
    try {
      const history = JSON.parse(localStorage.getItem("aqHistory") || "[]");
      const correct = state.results.filter((r) => r.correct).length;
      history.unshift({
        id: Date.now(),
        subject: state.config.subject,
        startLevel: state.config.startLevel,
        finalLevel: state.currentLevel,
        score: correct,
        total: state.results.length,
        bestStreak: state.bestStreak,
        date: new Date().toISOString(),
      });
      if (history.length > 20) history.pop();
      localStorage.setItem("aqHistory", JSON.stringify(history));
    } catch (e) { /* quota */ }
  }

  function seeProgress() {
    const history = JSON.parse(localStorage.getItem("aqHistory") || "[]");
    if (!history.length) {
      showToast("📈 No quiz history yet. Complete a quiz to see your progress!", "info");
      return;
    }
    const last = history[0];
    showToast(
      `📈 Last quiz: ${last.score}/${last.total}, final level ${levelLabel(last.finalLevel)}, best streak ${last.bestStreak} 🔥`,
      "success"
    );
  }

  // ============================================================
  // 11. FULLSCREEN
  // ============================================================
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  }

  // ============================================================
  // 12. INIT
  // ============================================================
  function init() {
    $("aqSubject").value = state.config.subject;

    // Hero actions
    $("aqStartQuizBtn").addEventListener("click", () => {
      $("aqSelectPanel").scrollIntoView({ behavior: "smooth" });
    });
    $("aqSeeProgressBtn").addEventListener("click", seeProgress);
    $("aqSeeProgressBtn2").addEventListener("click", seeProgress);

    // Config
    $("aqBeginQuizBtn").addEventListener("click", beginQuiz);
    $("aqResetConfigBtn").addEventListener("click", () => {
      $("aqSubject").value = "mixed";
      $("aqTopic").value = "core";
      $("aqStartLevel").value = "medium";
      $("aqQuestions").value = "10";
      showToast("↺ Configuration reset", "info");
    });

    // Quiz controls
    $("aqPauseBtn").addEventListener("click", () => {
      if (state.quizActive) pauseQuiz();
      else resumeQuiz();
    });
    $("aqNextBtn").addEventListener("click", nextQuestion);

    // Results actions
    $("aqRetakeBtn").addEventListener("click", () => {
      $("aqResultsSection").classList.remove("active");
      beginQuiz();
    });
    $("aqNewQuizBtn").addEventListener("click", () => {
      state.quizActive = false;
      $("aqResultsSection").classList.remove("active");
      $("aqQuizMode").classList.remove("active");
      $("aqSelectPanel").classList.remove("aq-hidden");
      $("aqSelectPanel").scrollIntoView({ behavior: "smooth" });
    });

    // Fullscreen
    $("aqFullscreenBtn").addEventListener("click", toggleFullscreen);

    // Shared utilities
    if (window.initScrollTop) window.initScrollTop("scrollTopBtn");
    if (window.initAtomicLogo) window.initAtomicLogo("headerAtomicCanvas", 100);

    console.log("🧠 Adaptive Quizzes initialized — ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
