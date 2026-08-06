# ReVena E-Library — JEE Trainer + Mock Exam

Fresh, consistent pair of JEE pages rebuilt from scratch.

## Pages

### 1. AI Objective Trainer
`html/pages/features/jee-objective-trainer.html`

- Upload study material (PDF / TXT / DOCX) — processed **locally** via
  `js/jee-parser-worker.js` (a lightweight extraction stub; swap in pdf.js later).
- Auto-extracts topics from pasted/uploaded text (keyword based).
- Generates objective questions in all three styles:
  - MCQ — Single Correct
  - MCQ — Multiple Correct
  - Numerical / Fill-in-the-Blank
- Save to question bank (localStorage), export as JSON, and **push to exam**.
- Consent modal before any external AI/API usage — files stay on-device by default.

### 2. JEE Mock Exam
`html/pages/features/jee-exam.html`

- Strict timed simulator: config → exam runner → results.
- On load, detects a bank pushed from the trainer (`localStorage.jeeTempBank`)
  and offers an **import preview modal**.
- Supports all three question styles with correct marking:
  - Single correct: +4 / −1
  - Multiple correct: +4 / −2 (full-set matching)
  - Numerical: +4 / −0 with configurable tolerance
- Full exam runner: countdown timer (pause/resume, warning & danger),
  question palette with legend, section navigator, progress bar.
- Results: ring score, correct/wrong/skipped, accuracy, time used,
  strengths/weaknesses, and per-question review with solutions.

## Question-style standards (parity)

| Style                 | Negative | Grading                          |
| --------------------- | -------- | -------------------------------- |
| MCQ — Single Correct  | −1       | exact index match                |
| MCQ — Multiple Correct| −2       | full set of chosen indices match |
| Numerical / Fill-in   | 0        | numeric tolerance (default 0.01) |

## Privacy

- Uploads are processed entirely in-browser (Web Worker).
- No file content is sent to any server unless the user explicitly enables
  an external AI/API and consents via the modal.
- All persistence is `localStorage` (question bank, stats, push buffer).

## Running

Serve the project folder via any static server, e.g.:

```bash
npx serve .
```

Then open `html/pages/features/jee-objective-trainer.html` or
`html/pages/features/jee-exam.html`.

