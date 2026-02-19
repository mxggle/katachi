1. The "Exception Rule" Trap (The ru Betrayal)Many Group 1 verbs end in the letter ru (る), which makes beginners constantly confuse them with Group 2 verbs. Your script can target this specific group to generate highly effective distractors.The Logic: If a Group 1 verb ends in ru (like 帰る - kaeru / to go home), program the script to temporarily treat it as a Group 2 verb.The Result: * Correct Negative: 帰らない (kaeranai)Script Distractor: 帰ない (kaenai - chopping off the ru like a Group 2 verb).2. The Te-Form "Sound Swap"The Group 1 Te-form is notorious because it has four different rules based on the final syllable (ite, nde, tte, shite). Beginners constantly mix these up.The Logic: Write a function that randomly applies the wrong Te-form ending to a Group 1 verb.The Result for 読む (yomu - to read):Correct: 読んで (yonde)Script Distractor A: よって (yotte - using the tsu/ru/u rule)Script Distractor B: よいて (yoite - using the ku rule)3. The Adjective "Identity Crisis"Because I-adjectives and Na-adjectives look different but function similarly, learners often cross-contaminate their conjugation rules.The Logic: If the JSON entry is an I-Adjective, have the script apply the Na-Adjective negative rule. If it is a Na-Adjective, apply the I-Adjective negative rule.The Result for 高い (takai - expensive / I-Adjective):Correct Negative: 高くない (takakunai)Script Distractor: 高いじゃない (takai janai - applying the Na-adjective rule)The Result for 静か (shizuka - quiet / Na-Adjective):Correct Negative: 静かじゃない (shizuka janai)Script Distractor: 静かくない (shizukakunai - applying the I-adjective rule)4. The "Iku" (行く) Exception IgnoreThere is one major exception in Group 1 verbs: 行く (iku - to go). Normally, verbs ending in ku become ite in the Te-form (like kaku $\rightarrow$ kaite). But iku becomes itte (行って).The Logic: Program the script to blindly follow the standard rule for iku without treating it as an exception.The Result:Correct: 行って (itte)Script Distractor: 行いて (iite - the most common beginner mistake for this word).5. The "Double Conjugation"Learners sometimes successfully conjugate a word but then accidentally leave the dictionary ending attached.The Logic: Take the conjugated stem and paste the original dictionary ending back onto it.The Result for 話す (hanasu - to speak):Correct Polite: 話します (hanashimasu)Script Distractor: 話しすます (hanashisumasu - leaving the 'su' from the dictionary form).



The "Wrong Group" Trap: The script treats a Group 2 verb like a Group 1 verb.

Example: 食べる (Group 2). Correct Te-form: 食べて. Script generates: 食べって (applying the Group 1 rule for verbs ending in ru).

The "Literal Stem" Trap: The script just slaps the ending onto the dictionary form without transforming it.

Example: 飲む. Correct Te-form: のんで. Script generates: のむて.

The "Wrong Sound" Trap: The script swaps similar-sounding conjugation rules (like confusing nde with tte).

Example: 読む. Correct Te-form: よんで. Script generates: よって.

Adjective Mix-ups: The script treats an I-adjective like a Na-adjective, or vice versa.

Example: 高い (I-adj). Correct Negative: 高くない. Script generates: 高いじゃない.