# Backup — JEE pages fresh rebuild

This folder records the state before rebuilding the JEE trainer / mock exam pages
from scratch.

## What happened

The following **obsolete / duplicate** files were removed (per user request) because
their documented features were incorrect or duplicated across pages:

- `html/pages/features/jee-exam.html`, `css/jee-exam.css`, `js/jee-exam.js`
- `html/pages/features/jee-objective-trainer.html`, `css/jee-objective-trainer.css`, `js/jee-objective-trainer.js`
- `html/pages/features/timed-mock-tests.html`, `css/timed-mock-tests.css`, `js/timed-mock-tests.js`

The files were deleted **before** this backup note was created, so no byte-for-byte
originals exist here. The rebuild recreates these pages from scratch with a clean,
consistent architecture:

### Rebuilt pages
- `AI Objective Trainer` — upload → generate MCQ/numerical → save/export → push to exam
- `Mock Exam` — strict timed objective simulator that can import trainer banks

### Question styles (parity across both pages)
- MCQ – Single Correct
- MCQ – Multiple Correct
- Numerical / Fill-in-the-Blank

### Key decisions
- Bank import uses `localStorage.jeeTempBank` (push from trainer → preview on exam).
- Extractions are client-side; external AI/API calls require explicit user consent.
- Grading: single −1 negative, multiple −2 negative, numerical 0 with configurable tolerance.

Created during fresh rebuild. Not a restore point.

