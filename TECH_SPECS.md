# Technical Specifications: FormMaster Japanese v2.0

## 1. Data Schema (`dictionary.json`)

The application will use a static JSON file as the source of truth. To avoid runtime conjugation complexity and ensure accuracy, typical conjugations will be pre-computed.

### JSON Structure

```json
{
  "version": "1.0",
  "words": [
    {
      "id": "v_taberu",
      "level": "N5",
      "group": "ichidan", // godan, ichidan, suru, kuru, i-adj, na-adj
      "dictionary_form": {
        "kanji": "食べる",
        "kana": "たべる",
        "romaji": "taberu"
      },
      "meaning": "to eat",
      "conjugations": {
        "polite": "たべます",
        "negative_plain": "たべない",
        "negative_polite": "たべません",
        "past_plain": "たべた",
        "past_polite": "たべました",
        "past_negative_plain": "たべなかった",
        "past_negative_polite": "たべませんでした",
        "te_form": "たべて",
        "potential": "たべられる",
        "passive": "たべられる",
        "causative": "たべさせる",
        "causative_passive": "たべさせられる",
        "imperative": "たべろ",
        "volitional": "たべよう",
        "conditional_ba": "たべれば",
        "conditional_tara": "たべたら"
      }
    }
  ]
}
```

### Field Definitions
- **id**: Unique string identifier (e.g., `v_taberu`, `a_takai`).
- **level**: `N5` or `N4`.
- **group**: 
  - Verbs: `godan`, `ichidan`, `suru`, `kuru`.
  - Adjectives: `i-adj`, `na-adj`.
- **dictionary_form**: The base form displayed on the flashcard.
- **conjugations**: Key-value pairs where key is the conjugation type and value is the correct Hiragana string.

---

## 2. Distractor Engine Logic (`distractorEngine.ts`)

The engine generates 3 plausible incorrect answers based on the word group and conjugation type. It MUST satisfy the interface:

`generateDistractors(word: WordEntry, type: ConjugationType): string[]`

### Ruleset

#### A. Verb Group Confusion (The "Ru" Trap)
*Target: Distinction between Godan (Group 1) and Ichidan (Group 2)*
1. **Godan as Ichidan:** If word is `godan` ending in `ru` (e.g., `kaeru`), apply `ichidan` rules.
   - *Example:* `kaeru` (Godan) → `kaenai` (Mistake: treated as Ichidan `kae-nai`) vs Correct `kaeranai`.
2. **Ichidan as Godan:** If word is `ichidan`, apply `godan` rules.
   - *Example:* `taberu` (Ichidan) → `taberanai` (Mistake: treated as Godan `tabe-ranai`) vs Correct `tabenai`.

#### B. Te-Form Sound Swaps
*Target: Te-form phonetic changes (tte, nde, ite, shite)*
1. **Wrong Connector:** Swap `tte` with `nde` or `ite`.
   - *Example:* `yomu` (Correct: `yonde`) → Distractor: `yotte`.
2. **Literal Append:** Append `te` directly to dictionary stem without phonetic change.
   - *Example:* `kaku` (Correct: `kaite`) → Distractor: `kakute`.

#### C. Adjective Crossover
*Target: Confusion between I-Adj and Na-Adj*
1. **I-Adj as Na-Adj:**
   - *Example:* `takai` (Correct Neg: `takakunai`) → Distractor: `takaijanai`.
2. **Na-Adj as I-Adj:**
   - *Example:* `shizuka` (Correct Neg: `shizukajanai`) → Distractor: `shizukakunai`.

#### D. The "Naive" Concatenation
*Target: General morphology errors*
1. **Double Ending:** Keep dictionary ending and add conjugated ending.
   - *Example:* `hanasu` (Polite: `hanashimasu`) → Distractor: `hanasusimasu`.
2. **Stem Only:** Use the stem without the conjugation suffix (rare, but valid filler).

#### E. Irregular Exceptions
*Target: Suru, Kuru, Iku*
1. **Regularized Iku:** Treat `iku` as standard Godan `ku` verb.
   - *Example:* `iku` (Te-form: `itte`) → Distractor: `iite`.

### Fallback Strategy
If specific rules fail to generate 3 unique distractors:
1. Generate a "random" conjugation of a different form (e.g., show Past form when asking for Negative).
2. Use a "Similar Sounding" word's correct conjugation (last resort).

---

## 3. Session Persistence & State Management

### LocalStorage Schema (`user_progress_v1`)

To handle the "Session Persistence" gap, we will track both global stats and in-flight session data.

```typescript
interface LocalStorageData {
  config: {
    lastLevel: 'N5' | 'N4';
    lastMode: 'choice' | 'input';
  };
  streak: {
    currentStreak: number;     // Consecutive correct answers (gameplay streak)
    dailyLoginStreak: number;   // Days in a row played
    lastLoginDate: string;      // ISO Date YYYY-MM-DD
  };
  stats: {
    totalAnswered: number;
    totalCorrect: number;
    // Add simple mastery metric?
  };
  // Detailed word tracking for "Weakest Links" report
  wordStats: {
    [wordId: string]: {
      seen: number;
      correct: number;
      lastReviewed: number; // timestamp
      isFlagged: boolean;   // User wanting to manually review this later
    };
  };
  // Handle in-flight session recovery
  activeSession: {
    isActive: boolean;
    queue: string[]; // List of word IDs left in session
    currentIndex: number;
    timestamp: number; // To expire old sessions (>24h)
  } | null;
}
```

### Session Lifecycle
1. **Start:** User clicks "Start". `activeSession` is populated with scrambled word IDs.
2. **Progress:** On every answer, update `currentIndex` and `wordStats` in `localStorage`.
3. **End:** When queue is empty, set `activeSession` to `null` and show Summary.
4. **Resume:** On app load, if `activeSession` exists and is fresh (<24h), prompt to "Resume Session".

---

## 4. Input Normalization (WanaKana)

To address "WanaKana input edge cases":

1. **Strict Hiragana:** All inputs are converted to Hiragana.
2. **Long Vowels:** 
   - Accept both `ou` (おう) and `oo` (おお) if the visual distinction is ambiguous, BUT standardizing on the dictionary spelling (usually `ou` for verbs/adjectives) is preferred.
   - **Policy:** Reference JSON `kana` field is the strict authority. User must type the exact kana.
   - *Hint UI:* If user types `koutei` but answer is `kouttei`, WanaKana handles the `tte` -> `って`.
3. **"N" Handling:** 
   - WanaKana requires `nn` for `ん`.
   - **Policy:** We will stick to WanaKana defaults: Isolated `n` requires `nn`.

---

## 5. Content Scope Estimate

To address the "vague N4 scope" concern:

*   **JLPT N5:** ~60 Verbs, ~30 Adjectives.
*   **JLPT N4:** ~150 Verbs, ~50 Adjectives.
*   **Total Database Size:** ~300 entries.
*   **Viability:** ~300 entries * ~12 conjugation forms = ~3,600 data points. A static JSON file (approx. 300-500KB) is completely viable and performant, eliminating the need for a backend database.

---

## 6. Session End & Scope

*   **Session Length:** Fixed batches of 10 or 20 cards (user configurable, default 10).
*   **Completion:** Session ends when all 10 cards have been attempted.
*   **Retry:** Incorrect cards are NOT repeated immediately in the same session (to simplify logic), but are prioritized in the *next* session algorithm.
