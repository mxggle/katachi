# Changelog

All notable changes to Katachi will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2026-07-14

### Added

- Added an in-practice conjugation rule dialog that opens from the formation badge, highlights the current word class, and compares the applicable rules for Godan, Ichidan, `する`, `来る`, い-adjectives, and な-adjectives.
- Added a standalone conjugation guide covering all 16 practiced formations with deep links, dictionary-verified examples, and localized teaching copy for English, Chinese, Vietnamese, Nepali, Burmese, and Korean.
- Added a homepage entry, canonical metadata, structured learning-resource data, and sitemap coverage for the new guide.

### Improved

- Made the shared language selector support context-aware menu placement with accessible menu semantics.
- Kept the guide header menu inside narrow viewports by opening it downward and right-aligned while preserving the upward-opening homepage footer menu.
- Added regression coverage for rule completeness, dictionary alignment, multilingual content, safe formation anchors, guide integration, and language-menu placement.

## [0.3.0] - 2026-07-14

### Added

- Added production-ready search metadata with canonical URLs, a generated Open Graph image, `robots.txt`, a multilingual sitemap, and language alternates for English, Chinese, Vietnamese, Nepali, Burmese, and Korean.
- Added an offline navigation fallback so the installed PWA can reopen the cached practice screen when the network is unavailable.
- Added automated dictionary verification covering schema integrity, conjugation correctness, cross-file alignment, and translation completeness for all 1,116 words.

### Improved

- Follow-up weakness drills now focus on the first form and word missed in the completed session instead of starting a generic weakness session.
- Daily progress and streak views now roll over automatically at local midnight without requiring the app to be reloaded.
- Practice dialogs, progress indicators, audio controls, setup toggles, and quit confirmation now provide clearer keyboard and screen-reader behavior.
- Updated localized landing-page copy to accurately describe JLPT N5–N3 coverage and completed Korean search metadata and dictionary wording corrections.
- Updated Next.js, React, Supabase, Serwist, Tailwind CSS, Vite, Vitest, and related production dependencies.

### Fixed

- Prevented repeated Next-button taps from advancing multiple questions and cleaned up pending timers when a practice session closes.
- Released cached audio object URLs after a session to prevent memory growth during long study sessions.
- Merged the latest remote study state before each cloud save so progress from another device is not silently overwritten.
- Repaired incomplete legacy or remote study data safely and capped local and synced history to the most recent 5,000 attempts and 1,000 sessions.
- Made sign-out cleanup consistent and kept the account menu open with a localized error when sign-out fails.
- Corrected additional Korean, Chinese, and Nepali dictionary meanings and kept all localization files aligned.

### Security

- Hardened the text-to-speech endpoint with input limits, request throttling, bounded response streaming, upstream timeouts, content-type validation, cache limits, and sanitized errors.
- Added Content Security Policy, HSTS, clickjacking, MIME-sniffing, permissions, and referrer protections.
- Validated public site and Supabase URLs before use and stopped exposing raw authentication-provider errors in the interface.

## [0.2.1] - 2026-06-06

### Fixed

- Improved mobile route transitions by removing the pathname-keyed app template that forced page subtree remounts on navigation.
- Reduced expensive mobile repaint work by removing full-page blur transitions, lowering decorative background cost, and stopping the homepage card's infinite pulse animation.
- Cached localized dictionary loading and memoized progress-page derived statistics to reduce repeated work when navigating between pages.
- Narrowed several Zustand subscriptions to avoid unnecessary large component rerenders.

## [0.2.0] - 2026-06-05

### Fixed

#### Dictionary Data Quality — Comprehensive Japanese Audit & Fix

A native-level audit of all 1,140 Japanese dictionary entries was performed, identifying and fixing errors across multiple categories.

**24 invalid entries removed** (from all 8 dictionary + localization files):
- 6 suru-verbs that are not real Japanese: `v_douzosuru` (どうぞ is an adverb), `v_kagakusuru`, `v_koutsuusuru`, `v_juubunsuru`, `v_genzaisuru`, `v_moushiwakesuru`
- 1 grammatical marker mislabeled as na-adjective: `na_sou` (そう is an auxiliary, not a standalone word)
- 5 pure nouns mislabeled as na-adjectives: `na_kami` (神), `na_aji` (味), `na_cha` (茶), `na_otona` (大人), `na_kiiro` (黄色 — duplicate of `ia_kiiroi`)
- 12 adverbs mislabeled as na-adjectives: `na_tabun`, `na_mada`, `na_takusan`, `na_taitei`, `na_kanari`, `na_isshoukenmei`, `na_nakanaka`, `na_zuibun`, `na_mottomo`, `na_nao`, `na_ippai`, `na_amari`

**Critical grammar fixes (4 honorific -aru verbs):**
- Fixed polite forms: `なさります→なさいます`, `くださります→くださいます`, `おっしゃります→おっしゃいます`, `いらっしゃります→いらっしゃいます`
- Fixed imperative forms: `なされ→なさい`, `くだされ→ください`, `おっしゃれ→おっしゃい`, `いらっしゃれ→いらっしゃい`

**Removed semantically absurd conjugations:**
- Potential-like verbs (できる, 見える, 聞こえる, ある, 分かる, 生まれる): removed potential/passive/causative/imperative/volitional forms
- 30+ intransitive / natural-phenomenon verbs (降る, 咲く, 曇る, 始まる, 疲れる, etc.): removed imperative/volitional forms

**Other fixes:**
- `v_suru` kanji: `為るする` → `する` (was "suru suru")
- 30 katakana verb romaji fields fixed (mixed katakana+romaji → standard Hepburn, e.g. `プルsuru` → `puurusuru`)
- 435 suru-verb meanings in `en.json` converted from noun glosses to verb glosses (e.g. "work; job" → "to work")
- `ia_hayai` kanji: `早い` → `速い` (早い=early, 速い=fast — meaning was "fast")
- Archaic kanji replaced with standard kana: `つまらない`, `うるさい`, `じっとする`

### Changed

- Dictionary word count: 1,140 → 1,116
- Added `scripts/fix_dictionary.py` for reproducible dictionary fixes

## [0.1.0] - Initial Release

Initial release of Katachi — Japanese conjugation practice app.
