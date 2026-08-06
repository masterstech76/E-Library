/**
 * One-Page Summaries — Condense chapters into quick revision docs
 * Handles: summary data, subject/chapter filtering, search within summaries,
 * collapsible accordions, favorites, covered-progress tracking, PDF/print,
 * share links, and text-only / visual mode toggle.
 */
(function () {
  "use strict";

  // 1. SUBJECTS
  const subjects = [
    { id: "all", label: "All Subjects", icon: "📚" },
    { id: "math", label: "Mathematics", icon: "📐" },
    { id: "physics", label: "Physics", icon: "🔬" },
    { id: "chemistry", label: "Chemistry", icon: "🧪" },
    { id: "biology", label: "Biology", icon: "🧬" },
    { id: "cs", label: "Computer Science", icon: "💻" },
    { id: "economics", label: "Economics", icon: "📊" },
    { id: "commerce", label: "Commerce", icon: "📦" },
    { id: "history", label: "History", icon: "📜" },
  ];

  const subjectIcons = {
    math: "📐", physics: "🔬", chemistry: "🧪", biology: "🧬",
    cs: "💻", economics: "📊", commerce: "📦", history: "📜",
  };

  // 2. SUMMARY DATA — each summary follows the one-page structure
  const summaries = [
    // ================= MATHEMATICS =================
    {
      id: 1, subject: "math", icon: "📐",
      title: "Calculus — Limits & Derivatives",
      overview: "The foundation of change — understand limits, continuity, and how derivatives measure instantaneous rates of change.",
      bullets: [
        "A limit describes the value a function approaches as the input nears a point — even if the function is not defined there.",
        "A function is continuous at x = a when the limit exists and equals the function value f(a).",
        "The derivative f'(x) is the instantaneous rate of change — the slope of the tangent line at a point.",
        "Standard derivatives: d/dx[x^n] = n·x^(n-1), d/dx[sin x] = cos x, d/dx[cos x] = −sin x.",
        "The chain rule, product rule, and quotient rule break complex derivatives into simpler steps.",
      ],
      terms: [
        { name: "Limit", def: "The value f(x) approaches as x approaches c, written lim x→c." },
        { name: "Continuity", def: "A function is continuous when the graph has no breaks, jumps, or holes." },
        { name: "Derivative", def: "The rate of change of a function with respect to a variable." },
        { name: "Tangent line", def: "A straight line that touches a curve at exactly one point with the same slope." },
      ],
      formula: "lim (h→0) [ f(x+h) − f(x) ] / h = f '(x)",
      formulaLabel: "Definition of the Derivative",
      example: "f(x) = x² has f'(x) = 2x. At x = 3 the slope is 6, so the tangent line rises steeply at that point.",
      remember: "A derivative is just a limit of average rates of change over shrinking intervals. If you master the limit definition, every differentiation rule follows from it.",
      checklist: [
        "State the definition of a limit",
        "Test continuity at a point",
        "Apply power / product / quotient rules",
        "Use the chain rule correctly",
        "Find the slope of a tangent line",
      ],
      tip: "In exams, define the derivative using the first-principles limit before applying shortcut rules — it earns method marks even if the final simplification slips.",
    },
    {
      id: 2, subject: "math", icon: "📐",
      title: "Trigonometry — Identities & Equations",
      overview: "Master the six ratios, the three core identities, and how to solve trigonometric equations on a given interval.",
      bullets: [
        "The six ratios come from a right triangle: sin, cos, tan, cosec, sec, cot.",
        "Fundamental identity: sin²θ + cos²θ = 1.",
        "The sine curve is odd, the cosine curve is even — useful for symmetry problems.",
        "Compound-angle formulas: sin(A+B) = sinA·cosB + cosA·sinB.",
        "General solutions repeat every 360° (or 2π radians) for sin and cos.",
      ],
      terms: [
        { name: "Radian", def: "Angle measure where one full circle = 2π radians." },
        { name: "Period", def: "The length after which a function repeats — 2π for sin and cos." },
        { name: "Amplitude", def: "The peak height of a sine/cosine wave from its midline." },
        { name: "Phase shift", def: "Horizontal displacement of a wave from the standard position." },
      ],
      formula: "sin²θ + cos²θ = 1   •   tanθ = sinθ / cosθ",
      formulaLabel: "Fundamental Identities",
      example: "Solve 2sinθ − 1 = 0 on [0°, 360°]: sinθ = 1/2, so θ = 30° and 150°.",
      remember: "When solving trig equations, always find ALL solutions in the given interval — use the ASTC quadrant rule to avoid missing answers.",
      checklist: [
        "Recall all six ratios",
        "Apply Pythagorean identities",
        "Use compound-angle formulas",
        "Solve equations over an interval",
        "Plot or read a sine/cosine graph",
      ],
      tip: "Draw a quick quadrant diagram (ASTC: All, Sin, Tan, Cos) before solving — it instantly tells you the signs of ratios in each quadrant.",
    },
    {
      id: 3, subject: "math", icon: "📐",
      title: "Algebra — Quadratic Equations",
      overview: "Factorise, complete the square, or use the quadratic formula to find the roots of ax² + bx + c = 0.",
      bullets: [
        "A quadratic has the form ax² + bx + c = 0 with a ≠ 0.",
        "The discriminant D = b² − 4ac decides the nature of the roots.",
        "D > 0 → two real distinct roots; D = 0 → one repeated root; D < 0 → no real roots.",
        "Sum of roots = −b/a, product of roots = c/a.",
        "The vertex of the parabola lies at x = −b/(2a).",
      ],
      terms: [
        { name: "Root", def: "A value of x that makes the quadratic equal to zero." },
        { name: "Discriminant", def: "b² − 4ac — tells the nature and type of roots." },
        { name: "Parabola", def: "The U-shaped graph of a quadratic function." },
        { name: "Vertex", def: "The turning point (maximum or minimum) of the parabola." },
      ],
      formula: "x = [ −b ± √(b² − 4ac) ] / 2a",
      formulaLabel: "Quadratic Formula",
      example: "x² − 5x + 6 = 0 → (x − 2)(x − 3) = 0 → x = 2 or x = 3.",
      remember: "If factorisation is tricky, the quadratic formula always works. Check the discriminant first to know what type of answer to expect.",
      checklist: [
        "Identify a, b, c",
        "Compute the discriminant",
        "Factorise when possible",
        "Apply the quadratic formula",
        "State the sum and product of roots",
      ],
      tip: "Write D = b² − 4ac as your first step in root-nature questions — examiners award marks for the discriminant even before roots are found.",
    },

    // ================= PHYSICS =================
    {
      id: 4, subject: "physics", icon: "🔬",
      title: "Newton's Laws of Motion",
      overview: "Three laws that explain how forces create motion — the backbone of classical mechanics.",
      bullets: [
        "First law: an object stays at rest or in uniform motion unless acted on by a net force (inertia).",
        "Second law: F = ma — force equals mass times acceleration.",
        "Third law: every action has an equal and opposite reaction.",
        "Momentum p = mv; impulse J = Δp = F·t.",
        "Friction opposes motion and is proportional to the normal force (f = μN).",
      ],
      terms: [
        { name: "Inertia", def: "The tendency of an object to resist changes in its motion." },
        { name: "Net force", def: "The vector sum of all forces acting on an object." },
        { name: "Momentum", def: "The product of mass and velocity; a measure of motion quantity." },
        { name: "Impulse", def: "Change in momentum; force applied over a time interval." },
      ],
      formula: "F = ma    •    p = mv    •    J = F·Δt = Δp",
      formulaLabel: "Core Mechanics Formulas",
      example: "A 2 kg ball accelerates at 3 m/s², so the net force is F = 2 × 3 = 6 N.",
      remember: "Always draw a free-body diagram first. Resolve forces along axes before applying F = ma — forces are vectors and must be added directionally.",
      checklist: [
        "State all three laws",
        "Draw a free-body diagram",
        "Resolve forces into components",
        "Apply F = ma to each axis",
        "Solve for unknown force or acceleration",
      ],
      tip: "For contact problems, list the action–reaction pairs explicitly — examiners look for correct pairs when awarding marks.",
    },
    {
      id: 5, subject: "physics", icon: "🔬",
      title: "Thermodynamics",
      overview: "Heat, work, and energy transfers — governed by the laws of thermodynamics.",
      bullets: [
        "First law: ΔU = Q − W — energy is conserved.",
        "Second law: heat cannot spontaneously flow from cold to hot without work.",
        "Entropy measures disorder; it always increases in an isolated system.",
        "Isothermal process keeps temperature constant; adiabatic keeps heat transfer zero.",
        "Efficiency η = W/Q_in for heat engines.",
      ],
      terms: [
        { name: "Internal energy", def: "Total microscopic kinetic and potential energy of molecules." },
        { name: "Entropy", def: "A measure of disorder or randomness in a system." },
        { name: "Isothermal", def: "A process occurring at constant temperature." },
        { name: "Adiabatic", def: "A process with no heat exchange with the surroundings." },
      ],
      formula: "ΔU = Q − W    •    η = W / Q_in",
      formulaLabel: "First Law & Efficiency",
      example: "A gas absorbs 100 J of heat and does 40 J of work, so ΔU = 100 − 40 = 60 J.",
      remember: "Sign conventions matter! Heat absorbed is positive, work done BY the system is positive in ΔU = Q − W.",
      checklist: [
        "State the first law of thermodynamics",
        "Explain the second law",
        "Distinguish isothermal vs adiabatic",
        "Calculate work in a p-V diagram",
        "Compute engine efficiency",
      ],
      tip: "For p-V diagram questions, area under the curve = work done. A closed loop's area equals net work in one cycle.",
    },
    {
      id: 6, subject: "physics", icon: "🔬",
      title: "Optics — Reflection & Refraction",
      overview: "How light bounces off mirrors and bends through lenses — governed by the laws of reflection and Snell's law.",
      bullets: [
        "Law of reflection: angle of incidence equals angle of reflection.",
        "Snell's law: n₁ sinθ₁ = n₂ sinθ₂ for refraction between media.",
        "Total internal reflection occurs when the angle exceeds the critical angle.",
        "Lens formula: 1/f = 1/v − 1/u.",
        "A convex lens converges light; a concave lens diverges light.",
      ],
      terms: [
        { name: "Refraction", def: "The bending of light as it passes between media of different densities." },
        { name: "Critical angle", def: "The incidence angle beyond which total internal reflection occurs." },
        { name: "Focal length", def: "The distance from the lens/mirror to its focus." },
        { name: "Magnification", def: "Ratio of image size to object size: m = v/u." },
      ],
      formula: "n₁ sinθ₁ = n₂ sinθ₂    •    1/f = 1/v − 1/u",
      formulaLabel: "Snell's Law & Lens Formula",
      example: "Light enters glass (n=1.5) from air at 45°. Using Snell's law, sinθ₂ = sin45°/1.5 ≈ 0.47, so θ₂ ≈ 28°.",
      remember: "In ray diagrams, rays NEVER bend at the centre of a lens, and a ray through the focus emerges parallel. Sign conventions follow the Cartesian rule.",
      checklist: [
        "State the laws of reflection",
        "Apply Snell's law",
        "Identify total internal reflection conditions",
        "Use the lens/mirror formula",
        "Draw a ray diagram for a lens",
      ],
      tip: "Memorise the sign convention: distances measured against the direction of incident light are negative. This fixes most lens formula errors.",
    },

    // ================= CHEMISTRY =================
    {
      id: 7, subject: "chemistry", icon: "🧪",
      title: "Atomic Structure",
      overview: "Protons, neutrons, and electrons — how quantum numbers and electronic configurations arrange matter.",
      bullets: [
        "The atom has a dense nucleus (protons + neutrons) surrounded by electrons.",
        "Atomic number Z = number of protons; mass number A = Z + neutrons.",
        "Electrons fill orbitals in order: 1s, 2s, 2p, 3s, 3p, 4s, 3d...",
        "Hund's rule: orbitals fill singly before pairing.",
        "Isotopes are atoms of the same element with different neutron counts.",
      ],
      terms: [
        { name: "Isotope", def: "Same element, different number of neutrons." },
        { name: "Orbital", def: "A region of space where an electron is most likely found." },
        { name: "Valence electron", def: "The outermost electron(s) involved in bonding." },
        { name: "Quantum number", def: "A number describing the energy, shape, and orientation of an orbital." },
      ],
      formula: "Number of neutrons = A − Z    •    Max electrons per shell = 2n²",
      formulaLabel: "Atomic Calculations",
      example: "Carbon-14 has A = 14 and Z = 6, so neutrons = 14 − 6 = 8.",
      remember: "Electron configuration is the roadmap to chemistry — it explains valence, bonding, and reactivity. Always write the configuration before predicting behaviour.",
      checklist: [
        "Identify Z and A for an atom",
        "Write the electronic configuration",
        "Apply Hund's rule",
        "Define isotopes with an example",
        "Count sub-shell electrons",
      ],
      tip: "Use the diagonal rule (Aufbau) diagram for configurations. For ions, add or remove electrons from the OUTERMOST shell first.",
    },
    {
      id: 8, subject: "chemistry", icon: "🧪",
      title: "Chemical Bonding",
      overview: "Ionic, covalent, and metallic bonds — how atoms combine to form stable compounds.",
      bullets: [
        "Ionic bonds form by electron transfer between a metal and a non-metal.",
        "Covalent bonds form by electron sharing between non-metals.",
        "The octet rule drives atoms to gain, lose, or share electrons to reach 8 valence electrons.",
        "Electronegativity difference decides bond type: ionic (> 1.7), polar covalent, or non-polar covalent.",
        "Metallic bonds are a 'sea of electrons' holding positive ions together.",
      ],
      terms: [
        { name: "Ionic bond", def: "Electrostatic attraction between oppositely charged ions." },
        { name: "Covalent bond", def: "A bond formed by sharing a pair of electrons." },
        { name: "Electronegativity", def: "The ability of an atom to attract shared electrons." },
        { name: "Octet rule", def: "Atoms tend to bond to achieve eight valence electrons." },
      ],
      formula: "Electronegativity gap → bond type (ΔEN > 1.7 ionic, < 0.4 non-polar)",
      formulaLabel: "Bond Type Rule",
      example: "NaCl: ΔEN = 2.1 → ionic. HCl: ΔEN = 0.9 → polar covalent. Cl₂: ΔEN = 0 → non-polar covalent.",
      remember: "A large electronegativity gap means one atom 'steals' electrons (ionic); a small gap means sharing (covalent). The trend in the periodic table drives it all.",
      checklist: [
        "Define ionic and covalent bonds",
        "Apply the octet rule",
        "Estimate bond type from ΔEN",
        "Draw a Lewis dot structure",
        "Explain metallic bonding",
      ],
      tip: "Lewis dot diagrams are usually worth full method marks — draw all valence electrons before predicting which atoms share or transfer.",
    },
    {
      id: 9, subject: "chemistry", icon: "🧪",
      title: "Organic Chemistry — Hydrocarbons",
      overview: "Alkanes, alkenes, alkynes, and benzene — the carbon family that fuels chemistry.",
      bullets: [
        "Alkanes have single C–C bonds (CnH2n+2) and are saturated.",
        "Alkenes have one C=C double bond (CnH2n) and undergo addition reactions.",
        "Alkynes have a C≡C triple bond (CnH2n−2).",
        "Functional groups determine chemical behaviour.",
        "Isomers have the same formula but different structures.",
      ],
      terms: [
        { name: "Alkane", def: "Saturated hydrocarbon with only single bonds." },
        { name: "Alkene", def: "Unsaturated hydrocarbon containing a C=C double bond." },
        { name: "Functional group", def: "The reactive atom or group that defines a compound's family." },
        { name: "Isomer", def: "A compound with the same formula but a different arrangement of atoms." },
      ],
      formula: "Alkane: CnH2n+2    Alkene: CnH2n    Alkyne: CnH2n−2",
      formulaLabel: "Hydrocarbon General Formulas",
      example: "Butane C₄H₁₀ is an alkane; butene C₄H₈ is an alkene; butyne C₄H₆ is an alkyne.",
      remember: "Count carbons in a chain to write the molecular formula: the general formulas for alkanes, alkenes, and alkynes are your safest starting point.",
      checklist: [
        "Name the first 10 alkanes",
        "Write the general formula for each family",
        "Identify a functional group",
        "Draw two isomers",
        "Predict alkene addition reactions",
      ],
      tip: "Learn the mnemonic 'My Dear Aunt Sally' for priority: Main chain, Double bonds, Alphabetical substituents — for IUPAC naming.",
    },

    // ================= BIOLOGY =================
    {
      id: 10, subject: "biology", icon: "🧬",
      title: "Cell Biology",
      overview: "The fundamental unit of life — organelles, membranes, and how cells carry out their functions.",
      bullets: [
        "All living things are made of cells; the cell is the basic unit of structure and function.",
        "The plasma membrane is selectively permeable — it controls what enters and exits.",
        "Mitochondria are the powerhouse; they produce ATP via cellular respiration.",
        "The nucleus stores DNA and directs cell activities.",
        "Prokaryotic cells lack a nucleus; eukaryotic cells have one.",
      ],
      terms: [
        { name: "Prokaryote", def: "A cell without a true nucleus, e.g., bacteria." },
        { name: "Eukaryote", def: "A cell with a membrane-bound nucleus and organelles." },
        { name: "Mitochondrion", def: "Organelle that generates ATP through respiration." },
        { name: "Osmosis", def: "Movement of water across a semi-permeable membrane." },
      ],
      formula: "Organelle → Function (map each to its job in the cell)",
      formulaLabel: "Structure–Function Concept",
      example: "Red blood cells lack mitochondria and rely on anaerobic respiration, so they never consume the oxygen they carry.",
      remember: "Link structure to function: folded membranes (mitochondria/chloroplasts) = more surface area = more work capacity.",
      checklist: [
        "Label a typical animal/plant cell",
        "State the function of each organelle",
        "Differentiate prokaryote vs eukaryote",
        "Explain osmosis and diffusion",
        "Describe the cell membrane model",
      ],
      tip: "Draw and label diagrams first — cell diagrams with correct labels earn easy marks in almost every biology paper.",
    },
    {
      id: 11, subject: "biology", icon: "🧬",
      title: "Genetics — Mendelian Inheritance",
      overview: "How traits pass from parents to offspring — dominance, segregation, and independent assortment.",
      bullets: [
        "Mendel's law of segregation: alleles separate during gamete formation.",
        "Law of independent assortment: genes on different chromosomes sort independently.",
        "Dominant alleles mask recessive ones in heterozygotes.",
        "A Punnett square predicts genotype and phenotype ratios.",
        "A monohybrid cross gives a 3:1 phenotype ratio; a dihybrid cross gives 9:3:3:1.",
      ],
      terms: [
        { name: "Allele", def: "An alternative form of a gene." },
        { name: "Genotype", def: "The genetic make-up (e.g., Tt)." },
        { name: "Phenotype", def: "The observable trait (e.g., tall)." },
        { name: "Homozygous", def: "Two identical alleles (TT or tt)." },
        { name: "Heterozygous", def: "Two different alleles (Tt)." },
      ],
      formula: "Monohybrid ratio 3:1    Dihybrid ratio 9:3:3:1",
      formulaLabel: "Classic Phenotype Ratios",
      example: "Cross Tt × Tt: genotypes TT, Tt, tT, tt → 3 tall : 1 dwarf phenotype.",
      remember: "The ratios only apply when traits are on different chromosomes and no linkage/codominance is involved — always check the question's assumptions.",
      checklist: [
        "Define allele, genotype, phenotype",
        "Set up a monohybrid cross",
        "Complete a Punnett square",
        "State both Mendel's laws",
        "Predict a dihybrid ratio",
      ],
      tip: "Write the gametes along the edges of the Punnett square first, then fill the box — this avoids tedious arithmetic mistakes.",
    },
    {
      id: 12, subject: "biology", icon: "🧬",
      title: "Human Physiology — Respiration & Circulation",
      overview: "How oxygen reaches cells and carbon dioxide leaves — the lungs and heart working together.",
      bullets: [
        "Breathing brings oxygen in and removes carbon dioxide via the lungs.",
        "Gas exchange occurs in the alveoli by diffusion.",
        "The heart pumps blood: right side to lungs, left side to the body.",
        "Blood transports oxygen bound to haemoglobin in red blood cells.",
        "The double circulation system keeps oxygenated and deoxygenated blood separate.",
      ],
      terms: [
        { name: "Alveolus", def: "A tiny air sac in the lungs where gas exchange happens." },
        { name: "Haemoglobin", def: "The iron-containing protein in RBCs that carries oxygen." },
        { name: "Atrium", def: "An upper heart chamber that receives blood." },
        { name: "Ventricle", def: "A lower heart chamber that pumps blood out." },
      ],
      formula: "O₂ + Haemoglobin → Oxyhaemoglobin (in lungs) → releases O₂ in tissues",
      formulaLabel: "Oxygen Transport Pathway",
      example: "At high altitude, lower O₂ pressure means haemoglobin binds less oxygen — the body compensates by producing more RBCs.",
      remember: "Follow the blood one-way: veins → atrium → ventricle → arteries. Oxygenation happens ONLY in the lungs; deoxygenation happens in tissues.",
      checklist: [
        "Trace the path of blood through the heart",
        "Describe gas exchange in alveoli",
        "Explain the role of haemoglobin",
        "Distinguish arteries and veins",
        "State why double circulation matters",
      ],
      tip: "Draw a simple heart with arrows for oxygenated (red) and deoxygenated (blue) blood — labelled flow diagrams are high-scoring.",
    },

    // ================= COMPUTER SCIENCE =================
    {
      id: 13, subject: "cs", icon: "💻",
      title: "Data Structures — Stacks & Queues",
      overview: "Two linear containers with strict ordering rules — LIFO for stacks, FIFO for queues.",
      bullets: [
        "A stack follows Last-In-First-Out (LIFO): push and pop happen at the top.",
        "A queue follows First-In-First-Out (FIFO): enqueue at the rear, dequeue at the front.",
        "Stacks power function calls, undo operations, and expression evaluation.",
        "Queues power task scheduling, printing, and breadth-first search.",
        "Both can be implemented with arrays or linked lists.",
      ],
      terms: [
        { name: "LIFO", def: "Last-In-First-Out — the most recent item is removed first." },
        { name: "FIFO", def: "First-In-First-Out — the oldest item is removed first." },
        { name: "Overflow", def: "Attempting to push onto a full stack or enqueue into a full queue." },
        { name: "Underflow", def: "Attempting to pop from an empty stack or dequeue from an empty queue." },
      ],
      formula: "Stack: push/pop = O(1)    Queue: enqueue/dequeue = O(1)",
      formulaLabel: "Time Complexity",
      example: "Browser back button is a stack: each visited page is pushed; Back pops the last page.",
      remember: "Pick the right structure for the job: need to reverse or undo? Stack. Need fairness or order? Queue.",
      checklist: [
        "Define LIFO and FIFO",
        "Show push/pop steps on a stack",
        "Show enqueue/dequeue steps on a queue",
        "Compare array vs linked-list implementation",
        "State real-world uses of each",
      ],
      tip: "Trace a small dry run with a table (operation | contents) — it makes state changes crystal clear and impresses method-markers.",
    },
    {
      id: 14, subject: "cs", icon: "💻",
      title: "Python Programming — Loops & Functions",
      overview: "Control flow and code reuse — for/while loops, and defining reusable functions.",
      bullets: [
        "for loops iterate over sequences: for i in range(5):",
        "while loops repeat while a condition is true; guard against infinite loops.",
        "break exits a loop; continue skips to the next iteration.",
        "Functions are defined with def and can accept parameters and return values.",
        "Default parameters and keyword arguments make functions flexible.",
      ],
      terms: [
        { name: "Iteration", def: "One pass through a loop body." },
        { name: "Range", def: "range(a, b, step) generates a sequence of numbers." },
        { name: "Function", def: "A named, reusable block of code." },
        { name: "Return", def: "The statement that sends a value out of a function." },
      ],
      formula: "def name(params): → body → return value",
      formulaLabel: "Function Skeleton",
      example: "def add(a, b): return a + b  →  print(add(2, 3)) outputs 5.",
      remember: "A function should do ONE clear task. If it grows long, split it. Identify the loop/function pattern before writing code.",
      checklist: [
        "Write a for loop over a range",
        "Write a while loop with a counter",
        "Use break and continue correctly",
        "Define a function with parameters",
        "Return a value and call the function",
      ],
      tip: "Test loops with boundary values mentally (first and last iteration). Off-by-one errors are the most common Python exam trap.",
    },

    // ================= ECONOMICS =================
    {
      id: 15, subject: "economics", icon: "📊",
      title: "Demand & Supply",
      overview: "The market's invisible hand — how prices coordinate what buyers want and sellers offer.",
      bullets: [
        "Demand: quantity buyers are willing to buy at each price.",
        "Supply: quantity sellers are willing to offer at each price.",
        "The law of demand: price up → quantity demanded falls.",
        "Equilibrium is where demand and supply curves intersect.",
        "A shortage pushes price up; a surplus pushes price down.",
      ],
      terms: [
        { name: "Demand", def: "Willingness and ability to buy at various prices." },
        { name: "Supply", def: "Willingness to sell at various prices." },
        { name: "Equilibrium", def: "The price where quantity demanded equals quantity supplied." },
        { name: "Elasticity", def: "How responsive quantity is to a price change." },
      ],
      formula: "Equilibrium: Quantity Demanded = Quantity Supplied",
      formulaLabel: "Market Equilibrium",
      example: "If demand shifts right at the same supply, the equilibrium price and quantity both rise.",
      remember: "Prices are the signal: shortages raise prices, surpluses lower them — the market always moves toward equilibrium.",
      checklist: [
        "State the law of demand",
        "State the law of supply",
        "Draw and label both curves",
        "Locate equilibrium price",
        "Explain the effect of a demand shift",
      ],
      tip: "Draw a neatly labelled supply–demand graph in every essay question — a clear diagram with captions earns marks even if the prose is thin.",
    },
    {
      id: 16, subject: "economics", icon: "📊",
      title: "National Income Accounting",
      overview: "Measuring the economy — GDP, GNP, and the circular flow of income.",
      bullets: [
        "GDP is the market value of all final goods/services produced within a country in a year.",
        "GNP = GDP + net income from abroad.",
        "Three ways to measure: output, income, and expenditure — all should agree.",
        "GDP at factor cost excludes indirect taxes and adds subsidies.",
        "Real GDP adjusts for inflation; nominal GDP does not.",
      ],
      terms: [
        { name: "GDP", def: "Gross Domestic Product — total production within a country's borders." },
        { name: "GNP", def: "GDP plus net factor income earned from abroad." },
        { name: "Final good", def: "A good sold to its final consumer (not for resale)." },
        { name: "Inflation", def: "A sustained rise in the general price level." },
      ],
      formula: "GNP = GDP + Net Factor Income from Abroad",
      formulaLabel: "GNP Identity",
      example: "If GDP = ₹100 and households earn ₹5 from abroad while foreigners earn ₹3 locally, GNP = ₹102.",
      remember: "Only final goods count in GDP — counting intermediate goods double-counts value. 'Value added' is the safe way.",
      checklist: [
        "Define GDP and GNP",
        "List the three measurement methods",
        "Explain final vs intermediate goods",
        "Distinguish real and nominal GDP",
        "Identify income vs expenditure approach",
      ],
      tip: "In numerical problems, always write the formula first, substitute values, then compute — method marks protect you from arithmetic slips.",
    },

    // ================= COMMERCE =================
    {
      id: 17, subject: "commerce", icon: "📦",
      title: "Accounting — Journal & Ledger",
      overview: "Double-entry bookkeeping — every transaction affects at least two accounts.",
      bullets: [
        "Every transaction is recorded with a debit and an equal credit.",
        "The journal is the book of original entry — chronological record.",
        "The ledger groups transactions by account.",
        "Debit = left side; Credit = right side of an account.",
        "The accounting equation: Assets = Liabilities + Equity.",
      ],
      terms: [
        { name: "Debit", def: "An entry on the left side of an account (Dr)." },
        { name: "Credit", def: "An entry on the right side of an account (Cr)." },
        { name: "Journal", def: "Chronological record of transactions in double entry." },
        { name: "Ledger", def: "The complete set of accounts." },
      ],
      formula: "Assets = Liabilities + Owner's Equity",
      formulaLabel: "Accounting Equation",
      example: "Buying ₹5,000 stock on credit: Stock (Dr) ₹5,000 and Creditors (Cr) ₹5,000.",
      remember: "Every debit has an equal credit. If totals don't match, you've dropped a posting — the trial balance catches it.",
      checklist: [
        "State the accounting equation",
        "Journalise a transaction",
        "Post to the ledger",
        "Balance a T-account",
        "Explain debit and credit rules",
      ],
      tip: "Use the phrase 'Debit what comes in, credit what goes out' for real accounts and 'Debit expenses/losses, credit incomes/gains' for nominal accounts.",
    },
    {
      id: 18, subject: "commerce", icon: "📦",
      title: "Marketing Mix — The 4 Ps",
      overview: "Product, Price, Place, Promotion — the four levers every marketer controls.",
      bullets: [
        "Product: what you sell — features, quality, branding, packaging.",
        "Price: what customers pay — cost-plus, competitor-based, or value pricing.",
        "Place: distribution channels that get the product to customers.",
        "Promotion: advertising, sales, PR, and social media to create demand.",
        "A balanced mix aligns all four Ps with the target market.",
      ],
      terms: [
        { name: "Marketing mix", def: "The combination of Product, Price, Place, and Promotion." },
        { name: "Target market", def: "The specific group of customers a firm aims to serve." },
        { name: "Distribution channel", def: "The path from producer to consumer." },
        { name: "Branding", def: "Creating a distinctive identity for a product." },
      ],
      formula: "4 Ps: Product × Price × Place × Promotion",
      formulaLabel: "The Marketing Mix",
      example: "A premium phone (Product) priced high (Price), sold via branded stores and online (Place), and launched with a global ad campaign (Promotion).",
      remember: "The 4 Ps work together — changing price without adjusting promotion or place can confuse the market. Balance is everything.",
      checklist: [
        "Define each of the 4 Ps",
        "Give an example for each P",
        "Explain the target market role",
        "Describe a distribution channel",
        "Compare pricing strategies",
      ],
      tip: "Structure any marketing answer as P → P → P → P, giving one real example per P. It guarantees full coverage of the mark scheme.",
    },

    // ================= HISTORY =================
    {
      id: 19, subject: "history", icon: "📜",
      title: "The Indian Freedom Struggle",
      overview: "From the 1857 Revolt to 1947 Independence — the key movements that won freedom.",
      bullets: [
        "1857: the First War of Independence against British rule.",
        "1885: Indian National Congress founded — moderate phase begins.",
        "1919: Jallianwala Bagh massacre triggers a turning point.",
        "1930: Civil Disobedience and the Salt Satyagraha.",
        "1947: Partition and Indian independence on August 15.",
      ],
      terms: [
        { name: "INC", def: "Indian National Congress (est. 1885) — the main freedom movement party." },
        { name: "Satyagraha", def: "Gandhi's philosophy of non-violent resistance." },
        { name: "Quit India", def: "The 1942 movement demanding an end to British rule." },
        { name: "Partition", def: "The 1947 division of India into India and Pakistan." },
      ],
      formula: "Movement → Year → Demands → Outcome (use this chain for every event)",
      formulaLabel: "Event Analysis Chain",
      example: "Salt Satyagraha (1930): protested the salt tax by marching 240 miles to Dandi — symbolised defiance and drew global attention.",
      remember: "Each movement had a clear cause and outcome. Link economic grievances (taxes, deindustrialisation) to political demands for a fuller answer.",
      checklist: [
        "List major movements with years",
        "Explain the role of Gandhi",
        "Describe the INC's evolution",
        "Assess the impact of 1857",
        "Trace the road to 1947",
      ],
      tip: "Chronology = marks. Write events on a mini timeline in the margin before composing your answer to keep the order accurate.",
    },
    {
      id: 20, subject: "history", icon: "📜",
      title: "World Wars — Causes & Consequences",
      overview: "Two global conflicts that reshaped the 20th century world order.",
      bullets: [
        "WWI (1914–18): militarism, alliances, imperialism, and nationalism.",
        "The Treaty of Versailles (1919) humiliated Germany and sowed WWII's seeds.",
        "WWII (1939–45): fascism, the League of Nations' failure, and expansionism.",
        "The UN was created in 1945 to prevent future global wars.",
        "The Cold War began as the US and USSR emerged as superpowers.",
      ],
      terms: [
        { name: "Militarism", def: "The build-up of armed forces and their influence over policy." },
        { name: "Alliance system", def: "Opposing blocs of allied powers (e.g., Allies vs Central Powers)." },
        { name: "League of Nations", def: "The post-WWI body that failed to keep peace." },
        { name: "Totalitarianism", def: "Absolute state control over society and life." },
      ],
      formula: "Cause → Trigger → Turning Point → Aftermath",
      formulaLabel: "Historical Event Framework",
      example: "The assassination of Archduke Franz Ferdinand (1914) was the trigger, but the alliance system was the underlying cause of WWI.",
      remember: "Distinguish causes (long-term) from triggers (immediate). Exams reward answers that separate underlying causes from spark events.",
      checklist: [
        "List four causes of WWI",
        "Explain the Treaty of Versailles",
        "State three causes of WWII",
        "Describe the role of the UN",
        "Compare consequences of both wars",
      ],
      tip: "Use the mnemonic 'MAIN' for WWI causes — Militarism, Alliances, Imperialism, Nationalism — and cover each in two lines.",
    },
  ];

  // 3. STATE
  let state = {
    activeSubject: "all",
    activeChapter: "all",
    searchQuery: "",
    textOnly: false,
    favorites: JSON.parse(localStorage.getItem("opsFavorites") || "[]"),
    covered: JSON.parse(localStorage.getItem("opsCovered") || "[]"),
    checklistDone: JSON.parse(localStorage.getItem("opsChecklist") || "{}"),
  };

  // 4. UTILITIES
  function getSummarySubjectId(id) {
    const s = summaries.find((s) => s.id === id);
    return s ? s.subject : "";
  }
  function getSubjectLabel(id) {
    const s = subjects.find((s) => s.id === id);
    return s ? s.label : id;
  }
  function getSubjectIcon(id) {
    return subjectIcons[id] || "📚";
  }
  function isFavorited(id) {
    return state.favorites.includes(id);
  }
  function isCovered(id) {
    return state.covered.includes(id);
  }
  function toggleFavorite(id) {
    const idx = state.favorites.indexOf(id);
    if (idx > -1) state.favorites.splice(idx, 1);
    else state.favorites.push(id);
    localStorage.setItem("opsFavorites", JSON.stringify(state.favorites));
    renderFavorites();
    renderSummaries();
    showToast(isFavorited(id) ? "⭐ Added to favorites" : "🗑️ Removed from favorites", "success");
  }
  function toggleCovered(id) {
    const idx = state.covered.indexOf(id);
    if (idx > -1) state.covered.splice(idx, 1);
    else state.covered.push(id);
    localStorage.setItem("opsCovered", JSON.stringify(state.covered));
    renderCovered();
    renderProgress();
    renderSubjectNav();
    renderSummaries();
    showToast(isCovered(id) ? "✅ Marked as covered" : "↩️ Marked as not covered", "info");
  }

  // 5. FILTERING
  function getFilteredSummaries() {
    let result = [...summaries];
    if (state.activeSubject !== "all") {
      result = result.filter((s) => s.subject === state.activeSubject);
    }
    if (state.activeChapter !== "all") {
      result = result.filter((s) => s.id === parseInt(state.activeChapter));
    }
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.trim().toLowerCase();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.overview.toLowerCase().includes(q) ||
          s.bullets.some((b) => b.toLowerCase().includes(q)) ||
          s.terms.some((t) => t.name.toLowerCase().includes(q) || t.def.toLowerCase().includes(q)) ||
          s.remember.toLowerCase().includes(q) ||
          s.example.toLowerCase().includes(q) ||
          s.tip.toLowerCase().includes(q) ||
          s.checklist.some((c) => c.toLowerCase().includes(q))
      );
    }
    return result;
  }

  // 6. RENDER FUNCTIONS

  // Subject Tabs
  function renderSubjectTabs() {
    const container = document.getElementById("subjectTabs");
    if (!container) return;
    container.innerHTML = subjects
      .map(
        (s) => `
      <button class="ops-subject-tab ${state.activeSubject === s.id ? "active" : ""}" data-subject="${s.id}">
        ${s.icon} ${s.label}
      </button>
    `
      )
      .join("");

    container.querySelectorAll(".ops-subject-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.activeSubject = btn.dataset.subject;
        state.activeChapter = "all";
        renderSubjectTabs();
        renderSubjectNav();
        renderChapterSelect();
        renderSummaries();
        updateResultsCount();
      });
    });
  }

  // Left Sidebar Subject Nav
  function renderSubjectNav() {
    const container = document.getElementById("subjectNav");
    if (!container) return;
    container.innerHTML = subjects
      .filter((s) => s.id !== "all")
      .map((s) => {
        const subjectSummaries = summaries.filter((s2) => s2.subject === s.id);
        const subjectCovered = subjectSummaries.filter((s2) => isCovered(s2.id)).length;
        const allDone = subjectSummaries.length > 0 && subjectCovered === subjectSummaries.length;
        return `
      <button class="ops-subject-nav-btn ${state.activeSubject === s.id ? "active" : ""}" data-subject="${s.id}">
        <span class="sn-icon">${s.icon}</span>
        <span>${s.label}</span>
        <span class="sn-check ${allDone ? "covered" : ""}">${allDone ? "✅" : subjectCovered > 0 ? subjectCovered + "/" + subjectSummaries.length : "•"}</span>
      </button>
    `;
      })
      .join("");

    container.querySelectorAll(".ops-subject-nav-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.activeSubject = btn.dataset.subject;
        state.activeChapter = "all";
        renderSubjectTabs();
        renderSubjectNav();
        renderChapterSelect();
        renderSummaries();
        updateResultsCount();
      });
    });
  }

  // Chapter Select Dropdown
  function renderChapterSelect() {
    const select = document.getElementById("chapterSelect");
    if (!select) return;
    const list = state.activeSubject === "all"
      ? summaries
      : summaries.filter((s) => s.subject === state.activeSubject);

    select.innerHTML = `<option value="all">All Chapters</option>` +
      list.map((s) => `<option value="${s.id}" ${state.activeChapter === String(s.id) ? "selected" : ""}>${s.title}</option>`).join("");
  }

  // Progress Bar
  function renderProgress() {
    const pctEl = document.getElementById("progressPercentage");
    const fill = document.getElementById("progressFill");
    if (!pctEl || !fill) return;
    const pct = summaries.length ? Math.round((state.covered.length / summaries.length) * 100) : 0;
    pctEl.textContent = pct + "%";
    fill.style.width = pct + "%";
  }

  // Results Count
  function updateResultsCount() {
    const el = document.getElementById("resultsCount");
    if (!el) return;
    const count = getFilteredSummaries().length;
    el.textContent = `Showing ${count} one-page summar${count !== 1 ? "ies" : "y"}`;
  }

  // Render Summaries (Accordion Cards)
  function renderSummaries() {
    const container = document.getElementById("summaryGrid");
    if (!container) return;

    const filtered = getFilteredSummaries();
    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="ops-empty-state">
          <span class="ops-empty-icon">📄</span>
          <span class="ops-empty-title">No summaries found</span>
          <span class="ops-empty-desc">Try a different subject, chapter, or search query.</span>
          <button class="ops-cta-btn" id="emptyClearBtn" style="width:auto; padding:10px 26px;">✕ Clear Filters</button>
        </div>
      `;
      const clear = container.querySelector("#emptyClearBtn");
      if (clear) {
        clear.addEventListener("click", () => {
          state.activeSubject = "all";
          state.activeChapter = "all";
          state.searchQuery = "";
          const searchInput = document.getElementById("globalSearchInput");
          if (searchInput) searchInput.value = "";
          renderSubjectTabs();
          renderSubjectNav();
          renderChapterSelect();
          renderSummaries();
          updateResultsCount();
        });
      }
      return;
    }

    container.innerHTML = filtered
      .map((s) => {
        const fav = isFavorited(s.id);
        const covered = isCovered(s.id);
        const doneItems = (state.checklistDone[String(s.id)] || []);
        return `
      <div class="ops-summary-card ${state.activeChapter === String(s.id) ? "open" : ""}" data-id="${s.id}">
        <div class="ops-summary-header" data-toggle="1">
          <span class="sh-icon">${s.icon}</span>
          <div class="sh-info">
            <span class="sh-title">${s.title}</span>
            <span class="sh-overview">${s.overview}</span>
          </div>
          <div class="sh-actions">
            <button class="sh-action-btn cover-btn" title="${covered ? "Mark as not covered" : "Mark as covered"}">${covered ? "✅" : "◻️"}</button>
            <button class="sh-action-btn fav-btn ${fav ? "favorited" : ""}" title="${fav ? "Remove from favorites" : "Add to favorites"}">${fav ? "⭐" : "🤍"}</button>
            <button class="sh-action-btn share-btn" title="Share this summary">🔗</button>
          </div>
          <span class="sh-toggle">▾</span>
        </div>
        <div class="ops-summary-body ${state.textOnly ? "text-only" : ""}">
          <div class="ops-section">
            <h4 class="ops-section-title"><span class="st-icon">🎯</span> Top 5 Points</h4>
            <ul class="ops-bullet-list">
              ${s.bullets.map((b) => `<li>${b}</li>`).join("")}
            </ul>
          </div>
          <div class="ops-section">
            <h4 class="ops-section-title"><span class="st-icon">📖</span> Important Terms</h4>
            <div class="ops-term-grid">
              ${s.terms.map((t) => `
                <div class="ops-term-item">
                  <span class="term-name">${t.name}</span>
                  <span class="term-def">${t.def}</span>
                </div>
              `).join("")}
            </div>
          </div>
          <div class="ops-section">
            <h4 class="ops-section-title"><span class="st-icon">⚗️</span> Formula / Example Snapshot</h4>
            <div class="ops-formula-box">
              <span class="formula-label">${s.formulaLabel}</span>
              <span class="formula">${s.formula}</span>
            </div>
            <div class="ops-example-box">
              <span class="example-label">Example</span>
              <span class="example-text">${s.example}</span>
            </div>
          </div>
          <div class="ops-section">
            <h4 class="ops-section-title"><span class="st-icon">💡</span> What to Remember</h4>
            <div class="ops-remember-box">
              <span class="remember-label">🧠 Key Takeaway</span>
              <span class="remember-text">${s.remember}</span>
            </div>
          </div>
          <div class="ops-section">
            <h4 class="ops-section-title"><span class="st-icon">✅</span> Revision Checklist</h4>
            <ul class="ops-checklist">
              ${s.checklist.map((c, i) => `
                <li class="${doneItems.includes(i) ? "done" : ""}" data-chk="${i}">
                  <span class="check-box"></span>
                  <span class="check-text">${c}</span>
                </li>
              `).join("")}
            </ul>
          </div>
          <div class="ops-section">
            <h4 class="ops-section-title"><span class="st-icon">🎓</span> Exam Pointers</h4>
            <div class="ops-tip-box">
              <span class="tip-label">Quick Tip</span>
              <span class="tip-text">${s.tip}</span>
            </div>
          </div>
        </div>
      </div>
    `;
      })
      .join("");

    // Attach events to each card
    container.querySelectorAll(".ops-summary-card").forEach((card) => {
      const id = parseInt(card.dataset.id);

      // Accordion toggle
      card.querySelector(".ops-summary-header")?.addEventListener("click", (e) => {
        if (e.target.closest(".sh-action-btn") || e.target.closest(".sh-toggle")) {
          // handled by specific buttons below
          return;
        }
        card.classList.toggle("open");
      });

      // Cover toggle
      card.querySelector(".cover-btn")?.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleCovered(id);
      });

      // Favorite toggle
      card.querySelector(".fav-btn")?.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleFavorite(id);
      });

      // Share
      card.querySelector(".share-btn")?.addEventListener("click", (e) => {
        e.stopPropagation();
        openShareModal(id);
      });

      // Checklist
      card.querySelectorAll(".ops-checklist li").forEach((li) => {
        li.addEventListener("click", () => {
          const i = parseInt(li.dataset.chk);
          const key = String(id);
          const arr = state.checklistDone[key] ? [...state.checklistDone[key]] : [];
          const idx = arr.indexOf(i);
          if (idx > -1) arr.splice(idx, 1);
          else arr.push(i);
          state.checklistDone[key] = arr;
          localStorage.setItem("opsChecklist", JSON.stringify(state.checklistDone));
          li.classList.toggle("done", arr.includes(i));
        });
      });
    });
  }

  // 7. FAVORITES SIDEBAR
  function renderFavorites() {
    const container = document.getElementById("favoritesList");
    if (!container) return;
    const favSummaries = summaries.filter((s) => state.favorites.includes(s.id));

    if (favSummaries.length === 0) {
      container.innerHTML = `<p class="text-muted" style="font-size:0.78rem;">No favorites yet. Click 🤍 on any summary to save.</p>`;
      return;
    }

    container.innerHTML = favSummaries
      .map(
        (s) => `
      <div class="ops-fav-item" data-id="${s.id}">
        <span class="fav-icon">${s.icon}</span>
        <div class="fav-info">
          <span class="fav-title">${s.title}</span>
          <span class="fav-meta">${getSubjectLabel(s.subject)}</span>
        </div>
        <button class="fav-remove" title="Remove">✕</button>
      </div>
    `
      )
      .join("");

    container.querySelectorAll(".fav-remove").forEach((btn) => {
      const item = btn.closest(".ops-fav-item");
      const id = parseInt(item.dataset.id);
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleFavorite(id);
      });
    });

    container.querySelectorAll(".ops-fav-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        if (e.target.closest(".fav-remove")) return;
        const id = parseInt(item.dataset.id);
        openSummary(id);
      });
    });
  }

  // 8. COVERED SIDEBAR
  function renderCovered() {
    const container = document.getElementById("coveredList");
    if (!container) return;
    const coveredSummaries = summaries.filter((s) => state.covered.includes(s.id));

    if (coveredSummaries.length === 0) {
      container.innerHTML = `<p class="text-muted" style="font-size:0.78rem;">No chapters covered yet. Mark summaries as done to track progress.</p>`;
      return;
    }

    container.innerHTML = coveredSummaries
      .map(
        (s) => `
      <div class="ops-fav-item" data-id="${s.id}">
        <span class="fav-icon">✅</span>
        <div class="fav-info">
          <span class="fav-title">${s.title}</span>
          <span class="fav-meta">${getSubjectLabel(s.subject)}</span>
        </div>
        <button class="fav-remove" title="Unmark">✕</button>
      </div>
    `
      )
      .join("");

    container.querySelectorAll(".fav-remove").forEach((btn) => {
      const item = btn.closest(".ops-fav-item");
      const id = parseInt(item.dataset.id);
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleCovered(id);
      });
    });

    container.querySelectorAll(".ops-fav-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        if (e.target.closest(".fav-remove")) return;
        openSummary(parseInt(item.dataset.id));
      });
    });
  }

  // Open a summary — expand its card and scroll to it
  function openSummary(id) {
    // Filter to show it
    const s = summaries.find((s) => s.id === id);
    if (!s) return;
    state.activeSubject = s.subject;
    state.activeChapter = String(id);
    renderSubjectTabs();
    renderSubjectNav();
    renderChapterSelect();
    renderSummaries();
    updateResultsCount();
    setTimeout(() => {
      const card = document.querySelector(`.ops-summary-card[data-id="${id}"]`);
      if (card) {
        card.classList.add("open");
        card.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  }

  // 9. SEARCH
  function initSearch() {
    const input = document.getElementById("globalSearchInput");
    const btn = document.getElementById("globalSearchBtn");
    if (!input) return;

    function doSearch() {
      state.searchQuery = input.value;
      state.activeChapter = "all";
      renderChapterSelect();
      renderSummaries();
      updateResultsCount();
    }

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") doSearch();
    });
    if (btn) btn.addEventListener("click", doSearch);
  }

  // 10. VIEW TOGGLE (text-only / visual)
  function initViewToggle() {
    const visualBtn = document.getElementById("viewVisualBtn");
    const textBtn = document.getElementById("viewTextBtn");
    if (!visualBtn || !textBtn) return;

    visualBtn.addEventListener("click", () => {
      state.textOnly = false;
      visualBtn.classList.add("active");
      textBtn.classList.remove("active");
      document.querySelectorAll(".ops-summary-body").forEach((body) => {
        body.classList.remove("text-only");
      });
      showToast("🎨 Visual mode enabled", "info");
    });

    textBtn.addEventListener("click", () => {
      state.textOnly = true;
      textBtn.classList.add("active");
      visualBtn.classList.remove("active");
      document.querySelectorAll(".ops-summary-body").forEach((body) => {
        body.classList.add("text-only");
      });
      showToast("📝 Text-only mode enabled", "info");
    });
  }

  // 11. SHARE MODAL
  function openShareModal(id) {
    const s = summaries.find((s) => s.id === id);
    if (!s) return;
    const modal = document.getElementById("shareModal");
    const input = document.getElementById("shareLinkInput");
    if (!modal || !input) return;
    const url = window.location.origin + window.location.pathname + "?summary=" + id;
    input.value = url;
    modal.classList.add("open");
  }

  function initShare() {
    const modal = document.getElementById("shareModal");
    const copyBtn = document.getElementById("copyShareLinkBtn");
    const closeBtns = document.querySelectorAll("[data-close-modal='shareModal']");
    if (!modal) return;

    closeBtns.forEach((btn) => {
      btn.addEventListener("click", () => modal.classList.remove("open"));
    });
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.remove("open");
    });

    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        const input = document.getElementById("shareLinkInput");
        if (!input || !input.value) return;
        navigator.clipboard.writeText(input.value).then(() => {
          showToast("🔗 Share link copied to clipboard!", "success");
        }).catch(() => {
          input.select();
          document.execCommand("copy");
          showToast("🔗 Share link copied to clipboard!", "success");
        });
      });
    }
  }

  // 12. PRINT & PDF (uses the print stylesheet)
  function initPrint() {
    function printSummaries(path) {
      // Open the summary card(s) for printing
      if (path === "active") {
        document.querySelectorAll(".ops-summary-card").forEach((c) => c.classList.add("open"));
      } else {
        // print all — temporarily select all in a new context isn't needed;
        // opening all cards is enough for the print style to render them.
        document.querySelectorAll(".ops-summary-card").forEach((c) => c.classList.add("open"));
      }
      window.print();
    }

    const printSummaryBtn = document.getElementById("printSummaryBtn");
    const printAllBtn = document.getElementById("printAllBtn");
    const printExtra = document.getElementById("printExtra");
    const downloadPdfBtn = document.getElementById("downloadPdfBtn");
    const downloadPdfExtra = document.getElementById("downloadPdfExtra");

    if (printSummaryBtn) printSummaryBtn.addEventListener("click", () => printSummaries("active"));
    if (printAllBtn) printAllBtn.addEventListener("click", () => printSummaries("all"));
    if (printExtra) printExtra.addEventListener("click", () => printSummaries("all"));
    if (downloadPdfBtn) downloadPdfBtn.addEventListener("click", () => {
      printSummaries("all");
    });
    if (downloadPdfExtra) downloadPdfExtra.addEventListener("click", () => {
      printSummaries("all");
    });
  }

  // 13. EXTRA FEATURES BAR
  function initExtraFeatures() {
    document.querySelectorAll(".ops-extra-card").forEach((card) => {
      card.addEventListener("click", () => {
        const title = card.querySelector(".ef-title")?.textContent || "Feature";
        if (card.id === "saveFavExtra") {
          showToast("⭐ Click the 🤍 icon on any summary to save it as a favorite.", "info");
          return;
        }
        if (card.id === "shareExtra") {
          showToast("🔗 Click the 🔗 icon on any summary card to copy its share link.", "info");
          return;
        }
        showToast(`🚀 "${title}" — ready to use!`, "info");
      });
    });
  }

  // 14. METAL CTA & quick action buttons
  function initCTAs() {
    const startRevisionBtn = document.getElementById("startRevisionBtn");
    const chooseChapterBtn = document.getElementById("chooseChapterBtn");

    if (startRevisionBtn) {
      startRevisionBtn.addEventListener("click", () => {
        const first = summaries[0];
        if (first) openSummary(first.id);
        showToast("🚀 Let's revise — opening the first chapter!", "success");
      });
    }

    if (chooseChapterBtn) {
      chooseChapterBtn.addEventListener("click", () => {
        const select = document.getElementById("chapterSelect");
        if (!select) return;
        select.scrollIntoView({ behavior: "smooth", block: "center" });
        select.focus();
        showToast("📖 Choose a chapter from the dropdown above.", "info");
      });
    }
  }

  // 15. RESET PROGRESS
  function initResetProgress() {
    const resetBtn = document.getElementById("resetProgressExtra");
    if (!resetBtn) return;
    resetBtn.addEventListener("click", () => {
      if (confirm("Clear all covered marks and checklist progress?")) {
        state.covered = [];
        state.checklistDone = {};
        localStorage.setItem("opsCovered", "[]");
        localStorage.setItem("opsChecklist", "{}");
        renderCovered();
        renderProgress();
        renderSubjectNav();
        renderSummaries();
        showToast("🔄 Progress reset — start fresh!", "success");
      }
    });
  }

  // 16. URL PARAM SUPPORT
  function handleUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const summaryId = params.get("summary");
    if (summaryId) {
      const id = parseInt(summaryId);
      const s = summaries.find((s) => s.id === id);
      if (s) openSummary(id);
    }
    const searchParam = params.get("search");
    if (searchParam) {
      const input = document.getElementById("globalSearchInput");
      if (input) {
        input.value = searchParam;
        state.searchQuery = searchParam;
        renderChapterSelect();
        renderSummaries();
        updateResultsCount();
      }
    }
  }

  // 17. INIT
  function init() {
    renderSubjectTabs();
    renderSubjectNav();
    renderChapterSelect();
    renderSummaries();
    updateResultsCount();
    renderFavorites();
    renderCovered();
    renderProgress();
    initSearch();
    initViewToggle();
    initShare();
    initPrint();
    initExtraFeatures();
    initCTAs();
    initResetProgress();
    handleUrlParams();

    if (window.initScrollTop) window.initScrollTop("scrollTopBtn");
    if (window.initAtomicLogo) window.initAtomicLogo("headerAtomicCanvas", 100);

    console.log("📄 One-Page Summaries initialized —", summaries.length, "chapter summaries loaded");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

