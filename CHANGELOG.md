# Changelog

All notable changes to Katachi will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
