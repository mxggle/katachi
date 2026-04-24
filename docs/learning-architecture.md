# Learning Architecture: How Katachi Works

Katachi uses evidence-based learning science to help you master Japanese grammar efficiently. Our learning architecture is built on three core pillars: **Spaced Repetition**, **Interleaved Practice**, and **Mastery-Based Flow**.

## 1. Spaced Repetition & 24h Cooldown
Learning is most effective when it is challenging. If you see the same word too often in a short period, your brain relies on short-term "echo" memory rather than actually learning the grammar rule.

- **The Cooldown:** Once you practice a word, it enters a 24-hour cooldown period. During this time, its "weakness score" is reduced by 90%.
- **The Benefit:** This forces other words to the surface, ensuring you don't get stuck in a loop with the same 5 words. It also ensures that when you *do* see the word again tomorrow, your brain has to work harder to recall it, which strengthens long-term retention.

## 2. Interleaved Practice (Verb Group Balancing)
Many learners struggle with Japanese verbs because they learn them in blocks (e.g., all Godan verbs first, then all Ichidan). In a real conversation, verbs of all types are mixed together.

- **Strict Ratios:** Every session is balanced to include a roughly equal mix (33% each) of Godan (Group 1), Ichidan (Group 2), and Irregular (Group 3) verbs.
- **Interleaving:** We don't just include them; we mix them up (G1 → G2 → G3 → G1...).
- **The Benefit:** This prevents "pattern matching" where you stop thinking about the rule because you know every answer in this block follows the same pattern. Interleaving forces you to identify the verb group *every single time*, which is how Japanese actually works in the wild.

## 3. Mastery-Based Flow (Duolingo Style)
In a traditional quiz, if you get an answer wrong, the session moves on and you just lose a point. In Katachi, mistakes are seen as unfinished business.

- **Re-queueing:** If you answer a question incorrectly, that item is moved to the end of the session queue.
- **Mastery Completion:** A session only ends when you have answered **every** unique item correctly.
- **The Benefit:** This ensures you never walk away from a session without having successfully produced the correct form at least once. It turns "testing" into "training."

## 4. Selection Logic Summary
When you start a session, Katachi:
1. Filters the dictionary for words at your JLPT level.
2. Groups them by verb type (Godan, Ichidan, Irregular).
3. Picks the weakest words in each group that aren't on cooldown.
4. Interleaves them into a single session pool.
5. Monitors your progress, re-queueing any errors until the entire pool is mastered.
