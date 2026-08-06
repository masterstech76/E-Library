/**
 * JEE Mock Exam — strict timed objective simulator.
 * Imports banks from the AI Objective Trainer (localStorage jeeTempBank),
 * supports MCQ single correct, MCQ multiple correct, and numerical questions.
 */
(function () {
  "use strict";

  /* ============================================================
   * 1. STATE
   * ============================================================ */
  const LS_PUSH = "jeeTempBank";

const state = {
    mode: "main",
    subject: "all",
    difficulty: "medium",
    duration: 180,
    count: 90,
    tolerance: 0.01,
    useBank: false,

    importedBank: JSON.parse(localStorage.getItem(LS_PUSH) || "[]"),

questions: [],
    currentIndex: 0,
    currentSection: null,
    answers: {},
    marked: {},

    timerTotal: 0,
    timerLeft: 0,
    timerRunning: false,
    timerInterval: null,
    startedAt: null,
    pausedAccum: 0,
    paused: false,
    finished: false,
  };

// Built-in seed bank — 90 questions (30 per subject: 25 MCQ + 5 numerical)
  const seedBank = [
    // ===== PHYSICS (25 MCQ + 5 numerical = 30) =====
    { q: "A body starts from rest with uniform acceleration a. Its velocity after time t is:", opts: ["a / t", "a·t", "a·t²", "t / a"], ans: 1, exp: "v = u + at = 0 + at.", sec: "Physics", style: "single" },
    { q: "The SI unit of force is:", opts: ["Joule", "Newton", "Watt", "Pascal"], ans: 1, exp: "Force = mass × acceleration → newton (N).", sec: "Physics", style: "single" },
    { q: "The work done by a conservative force is equal to the negative change in:", opts: ["Kinetic energy", "Linear momentum", "Potential energy", "Angular momentum"], ans: 2, exp: "W = −ΔU by definition of potential energy.", sec: "Physics", style: "single" },
    { q: "The dimensional formula of Planck's constant is:", opts: ["MLT⁻¹", "ML²T⁻¹", "ML²T⁻²", "MLT⁻²"], ans: 1, exp: "h = E/f → [ML²T⁻²]/[T⁻¹] = ML²T⁻¹.", sec: "Physics", style: "single" },
    { q: "A projectile launched at 45° has maximum:", opts: ["Speed", "Range", "Time of flight", "Height"], ans: 1, exp: "Range = v²sin2θ/g is max at 45°.", sec: "Physics", style: "single" },
    { q: "The SI unit of electric current is:", opts: ["Volt", "Watt", "Ampere", "Ohm"], ans: 2, exp: "Current is measured in ampere (A).", sec: "Physics", style: "single" },
    { q: "Ohm's law relates voltage, current and:", opts: ["Power", "Resistance", "Capacitance", "Inductance"], ans: 1, exp: "V = IR.", sec: "Physics", style: "single" },
    { q: "The unit of capacitance is the:", opts: ["Henry", "Farad", "Weber", "Coulomb"], ans: 1, exp: "Capacitance C = Q/V → farad.", sec: "Physics", style: "single" },
    { q: "The speed of light in vacuum is approximately:", opts: ["3 × 10⁶ m/s", "3 × 10⁸ m/s", "3 × 10¹⁰ m/s", "3 × 10⁵ m/s"], ans: 1, exp: "c ≈ 3 × 10⁸ m/s.", sec: "Physics", style: "single" },
    { q: "The SI unit of frequency is:", opts: ["Hertz", "Newton", "Joule", "Watt"], ans: 0, exp: "Frequency is measured in hertz (Hz).", sec: "Physics", style: "single" },
    { q: "Newton's second law is expressed as:", opts: ["F = mv", "F = ma", "F = m/a", "F = a/m"], ans: 1, exp: "F = ma.", sec: "Physics", style: "single" },
    { q: "The escape velocity from Earth is about:", opts: ["7.9 km/s", "11.2 km/s", "15 km/s", "3 km/s"], ans: 1, exp: "Escape velocity ≈ 11.2 km/s.", sec: "Physics", style: "single" },
    { q: "The unit of power is the:", opts: ["Joule", "Watt", "Newton", "Pascal"], ans: 1, exp: "Power = work/time → watt.", sec: "Physics", style: "single" },
    { q: "Which of the following are vector quantities? (Select all that apply)", opts: ["Force", "Speed", "Displacement", "Mass"], ans: [0, 2], exp: "Force & displacement are vectors.", sec: "Physics", style: "multiple" },
    { q: "Which of the following are SI base units? (Select all that apply)", opts: ["Metre", "Newton", "Second", "Joule"], ans: [0, 2], exp: "Metre & second are base units.", sec: "Physics", style: "multiple" },
    { q: "Which quantities are conserved in an inelastic collision? (Select all that apply)", opts: ["Linear momentum", "Total energy", "Kinetic energy", "Mass"], ans: [0, 1, 3], exp: "Momentum & total energy conserved; KE is not.", sec: "Physics", style: "multiple" },
    { q: "Which of the following are SI derived units? (Select all that apply)", opts: ["Newton", "Metre", "Joule", "Kilogram"], ans: [0, 2], exp: "Newton & Joule are derived units.", sec: "Physics", style: "multiple" },
    { q: "Which statements about simple harmonic motion are true? (Select all that apply)", opts: ["Acceleration is opposite to displacement", "Period is independent of amplitude", "Energy is constant for ideal SHM", "Velocity is maximum at extremes"], ans: [0, 1, 2], exp: "Acceleration ∝ −x, isochronous, constant energy; velocity is max at mean.", sec: "Physics", style: "multiple" },
    { q: "Which are electromagnetic waves? (Select all that apply)", opts: ["Light", "Sound", "X-rays", "Radio waves"], ans: [0, 2, 3], exp: "Light, X-rays, radio are EM; sound is mechanical.", sec: "Physics", style: "multiple" },
    { q: "Which of the following are units of energy? (Select all that apply)", opts: ["Joule", "Electron-volt", "Watt", "Calorie"], ans: [0, 1, 3], exp: "Joule, eV, calorie are energy; watt is power.", sec: "Physics", style: "multiple" },
    { q: "Which are examples of transverse waves? (Select all that apply)", opts: ["Light", "String vibration", "Sound in air", "Water surface waves"], ans: [0, 1, 3], exp: "Light, string, water are transverse; sound is longitudinal.", sec: "Physics", style: "multiple" },
    { q: "Which of the following affect the time period of a simple pendulum? (Select all that apply)", opts: ["Length", "Mass of bob", "Acceleration due to gravity", "Amplitude (small angles)"], ans: [0, 2], exp: "T = 2π√(L/g); independent of mass & small amplitude.", sec: "Physics", style: "multiple" },
    { q: "Which are fundamental forces in nature? (Select all that apply)", opts: ["Gravitational", "Electromagnetic", "Friction", "Strong nuclear"], ans: [0, 1, 3], exp: "Four fundamental forces include gravity, EM, strong, weak.", sec: "Physics", style: "multiple" },
    { q: "Which statements about the ideal gas are true? (Select all that apply)", opts: ["PV = nRT", "Molecules have no volume", "No intermolecular forces", "Pressure is zero at 0 K"], ans: [0, 1, 2], exp: "Ideal gas law; point molecules; no forces.", sec: "Physics", style: "multiple" },
    { q: "Which are units of pressure? (Select all that apply)", opts: ["Pascal", "Atmosphere", "Newton", "Bar"], ans: [0, 1, 3], exp: "Pascal, atm, bar are pressure; newton is force.", sec: "Physics", style: "multiple" },
    { q: "Numerical: A body falls from rest. Its velocity (m/s) after 3 s (g=9.8):", opts: null, ans: "29.4", exp: "v = gt = 9.8×3 = 29.4 m/s.", sec: "Physics", style: "numerical" },
    { q: "Numerical: Work done (J) by a 10 N force moving 5 m:", opts: null, ans: "50", exp: "W = F·d = 10×5 = 50 J.", sec: "Physics", style: "numerical" },
    { q: "Numerical: Kinetic energy (J) of a 2 kg mass moving at 3 m/s:", opts: null, ans: "9", exp: "KE = ½mv² = ½×2×9 = 9 J.", sec: "Physics", style: "numerical" },
    { q: "Numerical: Acceleration (m/s²) of a 4 kg mass under a 12 N force:", opts: null, ans: "3", exp: "a = F/m = 12/4 = 3 m/s².", sec: "Physics", style: "numerical" },
    { q: "Numerical: The resistance (Ω) of a wire with V=6 V and I=2 A:", opts: null, ans: "3", exp: "R = V/I = 6/2 = 3 Ω.", sec: "Physics", style: "numerical" },
    // ===== CHEMISTRY (25 MCQ + 5 numerical = 30) =====
    { q: "The number of atoms in one mole is:", opts: ["6.022 × 10²³", "3.011 × 10²³", "1.204 × 10²⁴", "6.022 × 10²²"], ans: 0, exp: "Avogadro's number ≈ 6.022 × 10²³.", sec: "Chemistry", style: "single" },
    { q: "Which of the following is a strong acid?", opts: ["CH₃COOH", "H₂CO₃", "HCl", "H₃PO₄"], ans: 2, exp: "HCl dissociates completely.", sec: "Chemistry", style: "single" },
    { q: "The pH of a neutral solution at 25°C is:", opts: ["0", "7", "14", "1"], ans: 1, exp: "Neutral water has pH = 7.", sec: "Chemistry", style: "single" },
    { q: "The atomic number of carbon is:", opts: ["6", "8", "12", "14"], ans: 0, exp: "Carbon has 6 protons.", sec: "Chemistry", style: "single" },
    { q: "The most electronegative element is:", opts: ["Oxygen", "Chlorine", "Nitrogen", "Fluorine"], ans: 3, exp: "Fluorine is the most electronegative.", sec: "Chemistry", style: "single" },
    { q: "The general formula of alkanes is:", opts: ["CₙH₂ₙ", "CₙH₂ₙ₊₂", "CₙH₂ₙ₋₂", "CₙHₙ"], ans: 1, exp: "Alkanes: CₙH₂ₙ₊₂.", sec: "Chemistry", style: "single" },
    { q: "The rate of a chemical reaction is measured by:", opts: ["Change in concentration over time", "Change in temperature", "Change in pressure", "Change in volume of container"], ans: 0, exp: "Rate = change in concentration / time.", sec: "Chemistry", style: "single" },
    { q: "The oxidation state of oxygen in H₂O₂ is:", opts: ["-2", "-1", "0", "+2"], ans: 1, exp: "In peroxides, oxygen has an oxidation state of −1.", sec: "Chemistry", style: "single" },
    { q: "The most abundant gas in Earth's atmosphere is:", opts: ["Oxygen", "Carbon dioxide", "Nitrogen", "Argon"], ans: 2, exp: "Nitrogen ≈ 78%.", sec: "Chemistry", style: "single" },
    { q: "The formula of common salt is:", opts: ["KCl", "NaCl", "CaCl₂", "Na₂SO₄"], ans: 1, exp: "Common salt is sodium chloride, NaCl.", sec: "Chemistry", style: "single" },
    { q: "Which is a noble gas?", opts: ["Hydrogen", "Helium", "Oxygen", "Nitrogen"], ans: 1, exp: "Helium is a noble gas.", sec: "Chemistry", style: "single" },
    { q: "The SI unit of amount of substance is the:", opts: ["Kilogram", "Mole", "Litre", "Gram"], ans: 1, exp: "Amount of substance → mole.", sec: "Chemistry", style: "single" },
    { q: "Which of the following are strong electrolytes? (Select all that apply)", opts: ["NaCl", "CH₃COOH", "HCl", "Sugar"], ans: [0, 2], exp: "NaCl & HCl ionise fully.", sec: "Chemistry", style: "multiple" },
    { q: "Which of the following are diatomic gases? (Select all that apply)", opts: ["O₂", "He", "N₂", "CO₂"], ans: [0, 2], exp: "O₂ & N₂ are diatomic.", sec: "Chemistry", style: "multiple" },
    { q: "Which are states of matter? (Select all that apply)", opts: ["Solid", "Liquid", "Gas", "Plasma"], ans: [0, 1, 2, 3], exp: "All four are states of matter.", sec: "Chemistry", style: "multiple" },
    { q: "Which of the following are acids? (Select all that apply)", opts: ["HCl", "NaOH", "H₂SO₄", "KOH"], ans: [0, 2], exp: "HCl & H₂SO₄ are acids.", sec: "Chemistry", style: "multiple" },
    { q: "Which are greenhouse gases? (Select all that apply)", opts: ["CO₂", "CH₄", "N₂", "H₂O"], ans: [0, 1, 3], exp: "CO₂, CH₄, H₂O; N₂ is not a greenhouse gas.", sec: "Chemistry", style: "multiple" },
    { q: "Which of the following are allotropes of carbon? (Select all that apply)", opts: ["Diamond", "Graphite", "Fullerene", "Silica"], ans: [0, 1, 2], exp: "Diamond, graphite, fullerene; silica is SiO₂.", sec: "Chemistry", style: "multiple" },
    { q: "Which are physical changes? (Select all that apply)", opts: ["Melting of ice", "Rusting", "Evaporation", "Burning"], ans: [0, 2], exp: "Melting & evaporation; rusting & burning are chemical.", sec: "Chemistry", style: "multiple" },
    { q: "Which of the following are transition metals? (Select all that apply)", opts: ["Iron", "Copper", "Sodium", "Zinc"], ans: [0, 1, 3], exp: "Fe, Cu, Zn are transition metals.", sec: "Chemistry", style: "multiple" },
    { q: "Which are properties of ionic compounds? (Select all that apply)", opts: ["High melting point", "Conduct electricity when molten", "Soluble in water", "Low boiling point"], ans: [0, 1, 2], exp: "Ionic compounds have high m.p., conduct when molten, soluble in water.", sec: "Chemistry", style: "multiple" },
    { q: "Which of the following are organic compounds? (Select all that apply)", opts: ["Methane", "Ethanol", "NaCl", "Glucose"], ans: [0, 1, 3], exp: "Methane, ethanol, glucose are organic.", sec: "Chemistry", style: "multiple" },
    { q: "Which techniques separate mixtures? (Select all that apply)", opts: ["Distillation", "Filtration", "Chromatography", "Neutralisation"], ans: [0, 1, 2], exp: "Distillation, filtration, chromatography.", sec: "Chemistry", style: "multiple" },
    { q: "Which are examples of colligative properties? (Select all that apply)", opts: ["Boiling point elevation", "Freezing point depression", "Vapour pressure lowering", "Density"], ans: [0, 1, 2], exp: "These depend on solute particle number.", sec: "Chemistry", style: "multiple" },
    { q: "Which of the following are strong bases? (Select all that apply)", opts: ["NaOH", "KOH", "NH₃", "Ca(OH)₂"], ans: [0, 1], exp: "NaOH & KOH are strong bases.", sec: "Chemistry", style: "multiple" },
    { q: "Numerical: The pH of a 0.001 M HCl solution is:", opts: null, ans: "3", exp: "pH = -log(0.001) = 3.", sec: "Chemistry", style: "numerical" },
    { q: "Numerical: Moles in 36 g of water (18 g/mol):", opts: null, ans: "2", exp: "n = 36/18 = 2.", sec: "Chemistry", style: "numerical" },
    { q: "Numerical: The number of moles in 44 g of CO₂ (44 g/mol):", opts: null, ans: "1", exp: "n = 44/44 = 1.", sec: "Chemistry", style: "numerical" },
    { q: "Numerical: The oxidation number of sulphur in H₂SO₄ is:", opts: null, ans: "6", exp: "2(+1)+S+4(−2)=0 → S=+6.", sec: "Chemistry", style: "numerical" },
    { q: "Numerical: Moles of NaOH in 80 g (molar mass 40 g/mol):", opts: null, ans: "2", exp: "n = 80/40 = 2.", sec: "Chemistry", style: "numerical" },
    // ===== MATHS (25 MCQ + 5 numerical = 30) =====
    { q: "If f(x) = x², then f'(3) is:", opts: ["3", "6", "9", "27"], ans: 1, exp: "f'(x) = 2x → 6.", sec: "Mathematics", style: "single" },
    { q: "sin(90°) is equal to:", opts: ["0", "0.5", "1", "√2"], ans: 2, exp: "sin(90°) = 1.", sec: "Mathematics", style: "single" },
    { q: "The value of cos(0°) is:", opts: ["0", "0.5", "1", "-1"], ans: 2, exp: "cos(0°) = 1.", sec: "Mathematics", style: "single" },
    { q: "The determinant of a 2×2 identity matrix is:", opts: ["0", "1", "2", "-1"], ans: 1, exp: "det(I) = 1.", sec: "Mathematics", style: "single" },
    { q: "The derivative of a constant is:", opts: ["1", "0", "The constant", "Undefined"], ans: 1, exp: "d/dx(c) = 0.", sec: "Mathematics", style: "single" },
    { q: "The solution of x + 3 = 7 is:", opts: ["x = 3", "x = 4", "x = 10", "x = -4"], ans: 1, exp: "x = 7 − 3 = 4.", sec: "Mathematics", style: "single" },
    { q: "The value of tan(45°) is:", opts: ["0", "0.5", "1", "√2"], ans: 2, exp: "tan(45°) = 1.", sec: "Mathematics", style: "single" },
    { q: "The area of a circle of radius r is:", opts: ["πr", "2πr", "πr²", "πr³"], ans: 2, exp: "Area = πr².", sec: "Mathematics", style: "single" },
    { q: "The sum of interior angles of a triangle is:", opts: ["90°", "180°", "270°", "360°"], ans: 1, exp: "Sum = 180°.", sec: "Mathematics", style: "single" },
    { q: "The value of 2³ is:", opts: ["6", "8", "9", "16"], ans: 1, exp: "2³ = 8.", sec: "Mathematics", style: "single" },
    { q: "The slope of the line y = 2x + 1 is:", opts: ["1", "2", "3", "0"], ans: 1, exp: "Slope = coefficient of x = 2.", sec: "Mathematics", style: "single" },
    { q: "The integral of 2x dx is:", opts: ["x²", "2x²", "x² + C", "2x + C"], ans: 2, exp: "∫2x dx = x² + C.", sec: "Mathematics", style: "single" },
    { q: "The value of √(144) is:", opts: ["10", "12", "14", "16"], ans: 1, exp: "√144 = 12.", sec: "Mathematics", style: "single" },
    { q: "Which of the following are Pythagorean triplets? (Select all that apply)", opts: ["3, 4, 5", "5, 12, 13", "2, 3, 4", "6, 8, 10"], ans: [0, 1, 3], exp: "3,4,5 · 5,12,13 · 6,8,10.", sec: "Mathematics", style: "multiple" },
    { q: "Which of the following are irrational numbers? (Select all that apply)", opts: ["√2", "3.14", "π", "22/7"], ans: [0, 2], exp: "√2 & π are irrational.", sec: "Mathematics", style: "multiple" },
    { q: "Which of the following are even numbers? (Select all that apply)", opts: ["2", "5", "8", "10"], ans: [0, 2, 3], exp: "2, 8, 10 are even.", sec: "Mathematics", style: "multiple" },
    { q: "Which are prime numbers? (Select all that apply)", opts: ["2", "4", "7", "9"], ans: [0, 2], exp: "2 & 7 are prime.", sec: "Mathematics", style: "multiple" },
    { q: "Which of the following are trigonometric identities? (Select all that apply)", opts: ["sin²θ + cos²θ = 1", "1 + tan²θ = sec²θ", "sin(2θ) = 2sinθcosθ", "tanθ = sinθ·cosθ"], ans: [0, 1, 2], exp: "First three are identities.", sec: "Mathematics", style: "multiple" },
    { q: "Which are the properties of a parallelogram? (Select all that apply)", opts: ["Opposite sides equal", "Opposite angles equal", "Diagonals bisect each other", "All angles are 90°"], ans: [0, 1, 2], exp: "Opposite sides/angles equal, diagonals bisect; not all 90°.", sec: "Mathematics", style: "multiple" },
    { q: "Which of the following are quadratic equations? (Select all that apply)", opts: ["x² + 2x + 1 = 0", "x + 3 = 0", "2x² = 8", "x³ = 27"], ans: [0, 2], exp: "x²+2x+1 and 2x² are quadratic (degree 2).", sec: "Mathematics", style: "multiple" },
    { q: "Which statements about a function's inverse are true? (Select all that apply)", opts: ["f(f⁻¹(x)) = x", "Requires one-to-one function", "Graph is reflected across y=x", "Always exists for any function"], ans: [0, 1, 2], exp: "Inverse properties; needs one-to-one.", sec: "Mathematics", style: "multiple" },
    { q: "Which are the roots of x² − 5x + 6 = 0? (Select all that apply)", opts: ["2", "3", "-2", "-3"], ans: [0, 1], exp: "(x−2)(x−3)=0 → x=2,3.", sec: "Mathematics", style: "multiple" },
    { q: "Which of the following are measures of central tendency? (Select all that apply)", opts: ["Mean", "Median", "Mode", "Variance"], ans: [0, 1, 2], exp: "Mean, median, mode; variance is dispersion.", sec: "Mathematics", style: "multiple" },
    { q: "Which are the angles of a right-angled triangle? (Select all that apply)", opts: ["90°", "45°", "30°", "60°"], ans: [0, 1, 2, 3], exp: "One must be 90°; others sum to 90°.", sec: "Mathematics", style: "multiple" },
    { q: "Which numbers are composite? (Select all that apply)", opts: ["4", "6", "9", "11"], ans: [0, 1, 2], exp: "4, 6, 9 are composite; 11 is prime.", sec: "Mathematics", style: "multiple" },
    { q: "Numerical: The number of permutations of 4 objects taken 2 at a time:", opts: null, ans: "12", exp: "P(4,2) = 4×3 = 12.", sec: "Mathematics", style: "numerical" },
    { q: "Numerical: 2^5 = ?", opts: null, ans: "32", exp: "2^5 = 32.", sec: "Mathematics", style: "numerical" },
    { q: "Numerical: The value of 7! / 5! is:", opts: null, ans: "42", exp: "7!/5! = 7×6 = 42.", sec: "Mathematics", style: "numerical" },
    { q: "Numerical: The number of combinations of 5 objects taken 2 at a time:", opts: null, ans: "10", exp: "C(5,2) = 10.", sec: "Mathematics", style: "numerical" },
    { q: "Numerical: The discriminant of x² − 4x + 3 = 0 is:", opts: null, ans: "4", exp: "D = b²−4ac = 16−12 = 4.", sec: "Mathematics", style: "numerical" },
  ];

  const styleLabels = { single: "Single Correct", multiple: "Multiple Correct", numerical: "Numerical" };
  const sectionOrder = ["Physics", "Chemistry", "Mathematics"];

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
  function genId() { return "q_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  function fmtTime(secs) {
    secs = Math.max(0, Math.floor(secs));
    const m = Math.floor(secs / 60), s = secs % 60;
    return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
  }
  function subjectLabel(id) { return { physics: "Physics", chemistry: "Chemistry", maths: "Mathematics" }[id] || id; }
  function norm(s) { return (Array.isArray(s) ? s.slice() : [s]).sort().join(","); }
  function isNumAnswerCorrect(given, expected, tol) {
    return Math.abs(parseFloat(given) - parseFloat(expected)) <= parseFloat(tol);
  }

  /* ============================================================
   * 3. QUESTION BUILDING (bank import + seed)
   * ============================================================ */
  function buildPaper() {
    let pool = [];

    // Prefer imported bank
    if (state.useBank && state.importedBank.length) {
      pool = state.importedBank.map((q) => ({
        id: genId(),
        section: q.subject || q.sec || "General",
        question: q.question || q.q,
        options: q.options !== undefined ? q.options : q.opts,
        answer: q.answer !== undefined ? q.answer : q.ans,
        explanation: q.explanation || q.exp || "",
        style: q.style || (q.options ? "single" : "numerical"),
        marks: 4,
        negative: q.style === "multiple" ? 2 : q.options ? 1 : 0,
        source: q.topic || "Imported bank",
      }));
    }

    // Otherwise/also use seed bank
    if (!pool.length) {
      const secs = state.subject === "all" ? sectionOrder : [subjectLabel(state.subject)];
      pool = [];
      secs.forEach((sec) => {
        seedBank.filter((p) => p.sec === sec).forEach((p) => {
          pool.push({
            id: genId(),
            section: sec,
            question: p.q,
            options: p.opts,
            answer: p.ans,
            explanation: p.exp,
            style: p.style,
            marks: 4,
            negative: p.style === "multiple" ? 2 : p.opts ? 1 : 0,
            source: "Built-in bank",
          });
        });
      });
    }

    // Filter by subject if importing from bank and subject filtered
    if (state.useBank && state.importedBank.length && state.subject !== "all") {
      const want = subjectLabel(state.subject);
      pool = pool.filter((q) => q.section === want);
    }

    // Shuffle and limit
    return shuffle(pool).slice(0, state.count);
  }

  /* ============================================================
   * 4. RENDER
   * ============================================================ */
// Questions belonging to the currently active section
  function activeQuestions() {
    if (!state.currentSection) {
      state.currentSection = state.questions.length ? state.questions[0].section : null;
    }
    return state.questions.filter((q) => q.section === state.currentSection);
  }

  function renderSections() {
    const nav = $("sectionNav");
    const secs = {};
    state.questions.forEach((q) => { secs[q.section] = (secs[q.section] || 0) + 1; });
    nav.innerHTML = Object.keys(secs)
      .map((sec) => `<button class="jex-section-btn" data-sec="${esc(sec)}"><span>${esc(sec)}</span><span class="sec-count">${secs[sec]}</span></button>`)
      .join("");
    nav.querySelectorAll(".jex-section-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.dataset.sec === state.currentSection) return; // already active
        // Switch to the selected section and start at its first question
        state.currentSection = btn.dataset.sec;
        state.currentIndex = state.questions.findIndex((q) => q.section === state.currentSection);
        if (state.currentIndex < 0) state.currentIndex = 0;
        renderQuestion();
      });
    });
  }

function renderPalette() {
    const pal = $("questionPalette");
    const list = activeQuestions();
    const currentQ = state.questions[state.currentIndex];
    pal.innerHTML = list.map((q, i) => {
      const globalIdx = state.questions.findIndex((x) => x.id === q.id);
      let cls = "jex-palette-btn";
      if (hasAnswer(q.id)) cls += " answered";
      if (state.marked[q.id]) cls += " marked";
      if (currentQ && q.id === currentQ.id) cls += " current";
      return `<button class="${cls}" data-i="${globalIdx}">${i + 1}</button>`;
    }).join("");
    pal.querySelectorAll(".jex-palette-btn").forEach((btn) => {
      btn.addEventListener("click", () => { state.currentIndex = parseInt(btn.dataset.i); renderQuestion(); });
    });
  }

  function renderQuestion() {
    const q = state.questions[state.currentIndex];
    if (!q) return;
    const list = activeQuestions();
    const secIdx = list.findIndex((x) => x.id === q.id);
    const total = list.length;

    $("qNumberLabel").textContent = `Question ${secIdx + 1} of ${total}`;
    $("qSectionLabel").textContent = q.section;
    $("qStyleLabel").textContent = styleLabels[q.style] || q.style;
    $("qMarks").textContent = `+${q.marks} / −${q.negative}`;
    $("qText").textContent = q.question;
    $("currentSection").textContent = q.section;
    $("qCounter").textContent = secIdx + 1;
    $("totalQ").textContent = total;

    const markBtn = $("markReviewBtn");
    markBtn.textContent = state.marked[q.id] ? "🚩 Marked" : "🚩 Mark for Review";
    markBtn.classList.toggle("active", !!state.marked[q.id]);

    const optWrap = $("qOptions");
    const numWrap = $("qNumericWrap");

    if (q.style === "numerical") {
      optWrap.innerHTML = "";
      optWrap.hidden = true;
      numWrap.hidden = false;
      $("qNumericInput").value = state.answers[q.id] || "";
    } else {
      numWrap.hidden = true;
      optWrap.hidden = false;
      optWrap.innerHTML = q.options.map((opt, i) => {
        const sel = state.answers[q.id];
        const isSel = q.style === "multiple" ? (Array.isArray(sel) && sel.includes(i)) : sel === i;
        const check = q.style === "multiple" ? `<span class="opt-check">✓</span>` : "";
        return `
          <div class="jex-option ${q.style === "multiple" ? "multi" : ""} ${isSel ? "selected" : ""} ${state.marked[q.id] ? "marked" : ""}" data-idx="${i}" role="button" tabindex="0" aria-label="Option ${String.fromCharCode(65 + i)}">
            ${check}
            <span class="opt-key">${String.fromCharCode(65 + i)}</span>
            <span class="opt-text">${esc(opt)}</span>
          </div>
        `;
      }).join("");
      optWrap.querySelectorAll(".jex-option").forEach((elm) => {
        const idx = parseInt(elm.dataset.idx);
        elm.addEventListener("click", () => toggleSelect(elm, idx));
        elm.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleSelect(elm, idx); }
        });
      });
    }

    renderSections();
    renderPalette();
    updateProgress();
    document.querySelectorAll(".jex-section-btn").forEach((b) => b.classList.toggle("active", b.dataset.sec === q.section));
  }

  function toggleSelect(elm, idx) {
    const q = state.questions[state.currentIndex];
    if (!q || q.style === "numerical") return;
    if (q.style === "single") {
      $("qOptions").querySelectorAll(".jex-option").forEach((o) => o.classList.remove("selected"));
      elm.classList.add("selected");
      state.answers[q.id] = idx;
    } else {
      elm.classList.toggle("selected");
      const sel = Array.from($("qOptions").querySelectorAll(".jex-option.selected")).map((o) => parseInt(o.dataset.idx));
      if (sel.length) state.answers[q.id] = sel;
      else delete state.answers[q.id];
    }
    updateProgress();
  }

  function hasAnswer(id) { return state.answers[id] !== undefined; }

  function updateProgress() {
    const answered = state.questions.filter((q) => hasAnswer(q.id)).length;
    const total = state.questions.length;
    const pct = total ? Math.round((answered / total) * 100) : 0;
    $("progressAnswered").textContent = `${answered} answered`;
    $("progressPercent").textContent = pct + "%";
    $("progressFill").style.width = pct + "%";
  }

  /* ============================================================
   * 5. TIMER
   * ============================================================ */
  function startTimer() {
    state.timerTotal = state.duration * 60;
    state.timerLeft = state.timerTotal;
    state.timerRunning = true;
    state.startedAt = Date.now();
    state.pausedAccum = 0;
    state.paused = false;
    $("timerStatus").textContent = "Running";
    $("pauseResumeBtn").textContent = "⏸ Pause";
    tickTimer();
    state.timerInterval = setInterval(tickTimer, 1000);
  }

  function tickTimer() {
    if (!state.timerRunning || state.paused) return;
    const elapsed = state.pausedAccum + (Date.now() - state.startedAt) / 1000;
    state.timerLeft = Math.max(0, state.timerTotal - elapsed);
    $("timerClock").textContent = fmtTime(state.timerLeft);
    const clock = $("timerClock");
    clock.classList.remove("warning", "danger");
    if (state.timerLeft <= 60) clock.classList.add("danger");
    else if (state.timerLeft <= 180) clock.classList.add("warning");

    if (state.timerLeft === 300) toast("⚠️ 5 minutes remaining!", "warning");
    if (state.timerLeft === 60) toast("🚨 1 minute remaining!", "warning");

    if (state.timerLeft <= 0) {
      clearInterval(state.timerInterval);
      state.timerRunning = false;
      toast("⏰ Time's up! Submitting your exam.", "warning");
      submitExam();
    }
  }

  function togglePause() {
    if (!state.timerRunning) return;
    if (state.paused) {
      state.paused = false;
      state.startedAt = Date.now();
      $("timerStatus").textContent = "Running";
      $("pauseResumeBtn").textContent = "⏸ Pause";
      tickTimer();
      state.timerInterval = setInterval(tickTimer, 1000);
    } else {
      state.paused = true;
      state.pausedAccum += (Date.now() - state.startedAt) / 1000;
      clearInterval(state.timerInterval);
      $("timerStatus").textContent = "Paused";
      $("pauseResumeBtn").textContent = "▶ Resume";
    }
  }

  function getTimeUsed() { return state.timerTotal - state.timerLeft; }
  function stopTimer() { if (state.timerInterval) clearInterval(state.timerInterval); state.timerRunning = false; }

  /* ============================================================
   * 6. SUBMIT + SCORE
   * ============================================================ */
  function submitExam() {
    if (state.finished) return;
    state.finished = true;
    stopTimer();

    let correct = 0, wrong = 0, skipped = 0, score = 0;
    const sw = {};
    state.questions.forEach((q) => {
      const given = state.answers[q.id];
      if (given === undefined) { skipped++; return; }
      let isCorrect = false;
      if (q.style === "numerical") {
        isCorrect = isNumAnswerCorrect(given, q.answer, state.tolerance);
      } else if (q.style === "multiple") {
        const expected = Array.isArray(q.answer) ? q.answer : [];
        isCorrect = norm(given) === norm(expected);
      } else {
        isCorrect = given === q.answer;
      }
      if (isCorrect) { correct++; score += q.marks; sw[q.section] = (sw[q.section] || 0) + 1; }
      else { wrong++; score -= q.negative; sw[q.section] = (sw[q.section] || 0) - 0.5; }
    });

    const totalMarks = state.questions.length * 4;
    const pct = Math.max(0, Math.round((score / totalMarks) * 100));
    $("scoreNumber").textContent = score;
    $("scoreTotalLabel").textContent = ` / ${totalMarks}`;
    $("scoreCircle").style.setProperty("--score-angle", pct + "%");
    $("statCorrect").textContent = correct;
    $("statWrong").textContent = wrong;
    $("statSkipped").textContent = skipped;
    $("statAccuracy").textContent = (correct + wrong) ? Math.round((correct / (correct + wrong)) * 100) + "%" : "0%";
    $("statTimeUsed").textContent = fmtTime(getTimeUsed());

    const msgEl = $("scoreMessage");
    if (pct >= 80) msgEl.textContent = "🏆 Excellent! You're exam-ready. Keep it up!";
    else if (pct >= 60) msgEl.textContent = "👍 Good effort! Review your mistakes to improve.";
    else if (pct >= 40) msgEl.textContent = "📈 Decent start — focus on your weak sections.";
    else msgEl.textContent = "📚 Keep practicing! Review the explanations carefully.";

    const strengths = [], weaknesses = [];
    Object.keys(sw).forEach((sec) => { if (sw[sec] > 0) strengths.push(sec); else weaknesses.push(sec); });
    $("strengthList").innerHTML = strengths.length
      ? strengths.map((s) => `<div class="jex-sw-item strength">${esc(s)}</div>`).join("")
      : `<div class="jex-sw-item">No clear strengths yet — keep practicing!</div>`;
    $("weaknessList").innerHTML = weaknesses.length
      ? weaknesses.map((s) => `<div class="jex-sw-item weakness">${esc(s)}</div>`).join("")
      : `<div class="jex-sw-item">No weak areas detected — great job!</div>`;

    renderReview();

    $("examMode").classList.remove("active");
    $("resultsSection").classList.add("active");
    toast("✅ Exam submitted. Review your results.", "success");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function formatAnswer(q) {
    if (q.style === "numerical") return esc(q.answer);
    if (q.style === "multiple") {
      const arr = Array.isArray(q.answer) ? q.answer : [];
      return arr.map((a) => String.fromCharCode(65 + a)).join(", ") + " — " + arr.map((a) => esc(q.options[a])).join(", ");
    }
    return String.fromCharCode(65 + q.answer) + " — " + esc(q.options[q.answer]);
  }

  function renderReview() {
    const list = $("reviewList");
    list.innerHTML = state.questions.map((q, i) => {
      const given = state.answers[q.id];
      let tag = "skipped", tagText = "Not Attempted", userText = "—", isCorrect = false;
      if (given !== undefined) {
        if (q.style === "numerical") {
          userText = given;
          isCorrect = isNumAnswerCorrect(given, q.answer, state.tolerance);
        } else if (q.style === "multiple") {
          userText = (Array.isArray(given) ? given : []).map((a) => String.fromCharCode(65 + a)).join(", ");
          isCorrect = norm(given) === norm(Array.isArray(q.answer) ? q.answer : []);
        } else {
          userText = String.fromCharCode(65 + given);
          isCorrect = given === q.answer;
        }
        tag = isCorrect ? "correct" : "wrong";
        tagText = isCorrect ? "Correct" : "Incorrect";
      }
      return `
        <div class="jex-review-item">
          <div class="jex-review-q">Q${i + 1} [${esc(q.section)}] — ${esc(q.question)}</div>
          <div class="jex-review-answer">
            <span class="answer-tag ${tag}">${tagText}</span>
            <span>Your answer: <strong>${esc(userText)}</strong></span>
            <span style="margin-left:10px;">Correct: <strong>${formatAnswer(q)}</strong></span>
          </div>
          <div class="jex-review-explanation">💡 ${esc(q.explanation)}</div>
        </div>
      `;
    }).join("");
  }

  /* ============================================================
   * 7. ACTIONS
   * ============================================================ */
  function beginExam() {
    state.mode = $("examModeSelect").value;
    state.subject = $("subjectSelect").value;
    state.difficulty = $("difficultySelect").value;
state.duration = parseInt($("durationInput").value) || 180;
    state.count = parseInt($("questionCount").value) || 90;
    state.tolerance = parseFloat($("numericTolerance").value) || 0.01;
    state.useBank = $("sourceBankChk").checked;

    if (state.duration < 1) state.duration = 10;
    if (state.useBank && !state.importedBank.length) {
      toast("⚠️ No imported bank found — using built-in bank.", "warning");
      state.useBank = false;
    }

state.questions = buildPaper();
    if (!state.questions.length) { toast("⚠️ No questions available for this configuration.", "warning"); return; }

    state.currentIndex = 0;
    state.currentSection = state.questions[0] ? state.questions[0].section : null;
    state.answers = {};
    state.marked = {};
    state.finished = false;

    $("configPanel").style.display = "none";
    $("resultsSection").classList.remove("active");
    $("examMode").classList.add("active");

    renderQuestion();
    startTimer();
    toast(`🏁 Exam started — ${state.questions.length} questions, ${state.duration} minutes.`, "success");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

function resetConfig() {
    $("examModeSelect").value = "main";
    $("subjectSelect").value = "all";
    $("difficultySelect").value = "medium";
    $("durationInput").value = "180";
    $("questionCount").value = "90";
    $("numericTolerance").value = "0.01";
    $("sourceBankChk").checked = false;
    toast("↺ Configuration reset.", "info");
  }

  function goToNewExam() {
    stopTimer();
    state.finished = false;
    $("resultsSection").classList.remove("active");
    $("examMode").classList.remove("active");
    $("configPanel").style.display = "";
    toast("📋 Configure a new exam.", "info");
  }

  /* ============================================================
   * 8. IMPORT MODAL
   * ============================================================ */
function initImportModal() {
    if (!state.importedBank.length) return;
    $("importDesc").textContent = `A bank of ${state.importedBank.length} question(s) was pushed from the AI Objective Trainer. Import it to use as your exam source?`;
    $("bankCountNote").textContent = `(${state.importedBank.length} question(s) available in imported bank)`;
    $("sourceBankChk").checked = true;
    const modal = $("importModal");
    modal.hidden = false;
    // Consume the pushed bank so the modal does NOT reappear on every page load.
    try { localStorage.removeItem(LS_PUSH); } catch (e) { /* ignore */ }
    const ok = () => { modal.hidden = true; cleanup(); toast("📥 Bank imported — ready to configure.", "success"); };
    const cancel = () => { modal.hidden = true; $("sourceBankChk").checked = false; cleanup(); };
    const cleanup = () => {
      $("importOk").removeEventListener("click", ok);
      $("importCancel").removeEventListener("click", cancel);
    };
    $("importOk").addEventListener("click", ok);
    $("importCancel").addEventListener("click", cancel);
  }

  /* ============================================================
   * 9. INIT
   * ============================================================ */
  function init() {
    if (window.initAtomicLogo) window.initAtomicLogo("headerAtomicCanvas", 100);
    if (window.initScrollTop) window.initScrollTop("scrollTopBtn");

    $("beginExamBtn").addEventListener("click", beginExam);
    $("resetConfigBtn").addEventListener("click", resetConfig);
$("nextQBtn").addEventListener("click", () => {
      const list = activeQuestions();
      const idx = list.findIndex((x) => x.id === state.questions[state.currentIndex].id);
      if (idx < list.length - 1) { state.currentIndex++; renderQuestion(); }
    });
    $("prevQBtn").addEventListener("click", () => {
      const list = activeQuestions();
      const idx = list.findIndex((x) => x.id === state.questions[state.currentIndex].id);
      if (idx > 0) { state.currentIndex--; renderQuestion(); }
    });
    $("markReviewBtn").addEventListener("click", () => {
      const q = state.questions[state.currentIndex];
      if (!q) return;
      state.marked[q.id] = !state.marked[q.id];
      renderQuestion();
    });
    $("clearRespBtn").addEventListener("click", () => {
      const q = state.questions[state.currentIndex];
      if (!q) return;
      delete state.answers[q.id];
      renderQuestion();
      toast("✕ Response cleared.", "info");
    });
    $("pauseResumeBtn").addEventListener("click", togglePause);
    $("submitExamBtn").addEventListener("click", () => { if (confirm("Submit the exam?")) submitExam(); });
    $("sidebarSubmitBtn").addEventListener("click", () => { if (confirm("Submit your exam?")) submitExam(); });
    $("retakeBtn").addEventListener("click", beginExam);
    $("newExamBtn").addEventListener("click", goToNewExam);
    $("fullscreenBtn").addEventListener("click", () => {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
      else document.exitFullscreen().catch(() => {});
    });

// keyboard nav
    document.addEventListener("keydown", (e) => {
      if (!$("examMode").classList.contains("active") || state.finished) return;
      if (e.key === "ArrowRight") {
        const list = activeQuestions();
        const idx = list.findIndex((x) => x.id === state.questions[state.currentIndex].id);
        if (idx < list.length - 1) { state.currentIndex++; renderQuestion(); }
      }
      if (e.key === "ArrowLeft") {
        const list = activeQuestions();
        const idx = list.findIndex((x) => x.id === state.questions[state.currentIndex].id);
        if (idx > 0) { state.currentIndex--; renderQuestion(); }
      }
    });

    initImportModal();
    console.log("🏁 JEE Mock Exam initialized.");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
