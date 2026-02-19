This is shaping up to be a truly professional-grade application! Adding a report page is the perfect finishing touch. Learners need to see their progress to stay motivated, and visualizing their data (like showing them exactly which conjugation they struggle with the most) adds massive value to the app.

Here is the finalized, comprehensive Product Requirements Document (PRD) incorporating Next.js, the modular distractor engine, the dual practice modes, and the new analytics report.

---

# Product Requirements Document (PRD)

**Project Name:** FormMaster Japanese (Working Title)
**Version:** 2.0 (Next.js Architecture)
**Platform:** Mobile-First Web Application (PWA ready)

## 1. Product Overview

FormMaster Japanese is a dynamic, Next.js-powered web application designed to help Japanese learners (JLPT N5 & N4) master verb and adjective conjugations. By offering customizable practice sessions, dual learning modes (Multiple Choice and Active Input), and a modular distractor engine that mimics common human errors, the app provides highly targeted grammar training. A built-in analytics dashboard tracks user performance to identify weak points over time.

## 2. Technical Stack

* **Framework:** Next.js (React) for modular component architecture and efficient page routing.
* **Styling:** CSS Modules or Tailwind CSS (optimized for mobile-first Flexbox/Grid layouts).
* **State Management & Storage:** React `useState`/`useContext` for active sessions, and browser `localStorage` to persist historical data, streaks, and settings.
* **External Libraries:** `WanaKana.js` for seamless Romaji-to-Hiragana conversion during Input Mode.

## 3. Data Architecture (See `TECH_SPECS.md`)

* **Base Database:** A static JSON file (`dictionary.json`) following the schema defined in `TECH_SPECS.md`. It contains the dictionary form, meaning, JLPT level, word group, and pre-computed correct target forms.
* **The Distractor Module:** A robust engine implementing the rules defined in `TECH_SPECS.md` (e.g., Godan/Ichidan confusion, Te-form phonetic errors) to generate 3 unique, plausible distractors per question.

## 4. Core Features

### Feature 1: Configuration & Setup Menu

A clean interface where users build their custom practice deck.

* **Level & Category Toggles:** Checkboxes to select specific JLPT levels (N5/N4), Word Types, and Conjugation Rules.
* **Batch Size:** Slider to choose session length (10, 20, or 50 cards). Default is 10.
* **Mode Selector:**
  * *Multiple Choice Mode:* For rapid recognition practice.
  * *Input (Typing) Mode:* For active recall and spelling practice.

### Feature 2: The Practice Interface

The core gameplay loop.

* **Header:** Displays "Session Streak" (consecutive correct answers in current session) and "Daily Streak" (days logged in).
* **Prompt Canvas:** Shows the Japanese word, meaning, and target form.
* **Dynamic Action Area:**
  * *Multiple Choice:* 2x2 grid.
  * *Input Mode:* Text field with WanaKana auto-conversion (strict `nn` for `ん`).
* **Feedback System:** Immediate green/red visual feedback. Incorrect answers show the correct answer and explanation (e.g., "Group 1 verbs ending in 'u' end with 'tte'").
* **Session End:** The session concludes after the user attempts all cards in the batch.

### Feature 3: The Report & Analytics Page

A dedicated dashboard route (e.g., `/report`) visualizing `localStorage` data.

* **Empty State:** If no history exists, display a large "Start First Session" call-to-action.
* **High-Level Stats:** Total words practiced, best session streak, and overall accuracy.
* **Weakest Links:** A breakdown of lowest-performing categories to guide study.

## 5. User Flow

1. **Setup:** The user selects "JLPT N5", "Te-form", batch size 10, and clicks Start.
2. **Generate:** The app pulls 10 random words matching the criteria, generates distractors (if Multiple Choice), and initializes the session.
3. **Practice:** The user answers cards. Progress is saved to `localStorage` after each answer to handle browser refreshes.
4. **Completion:** After the 10th card, the app shows a Session Summary (Score: 8/10, Accuracy: 80%) and updates global stats.
5. **Review:** The user views the Report Page to see long-term trends.
