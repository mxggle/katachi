#!/usr/bin/env python3
"""
Comprehensive fix for Japanese dictionary data quality issues.
Fixes: critical grammar errors, word type misclassifications, 
unnatural conjugations, katakana romaji, and suru-verb meanings.
"""

import json
import sys
import shutil
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
DICT_DIR = SCRIPT_DIR.parent / "src" / "data" / "dictionaries"
FILES = ["dictionary.json", "base.json"]

# ─────────────────────────────────────────────────────
# 1. ENTRIES TO REMOVE ENTIRELY (not real Japanese)
# ─────────────────────────────────────────────────────
REMOVE_IDS = {
    # Not real verbs - these words can't form suru verbs
    "v_douzosuru",      # どうぞ is an adverb, can't become a verb
    "v_kagakusuru",     # 科学する is essentially never used
    "v_koutsuusuru",    # 交通する is not a natural verb
    "v_juubunsuru",     # 十分する is not a standard verb
    "v_genzaisuru",     # 現在する is not a standard verb
    "v_moushiwakesuru", # 申し訳する is not natural; use 申し訳ない

    # Grammatical marker / not a standalone word
    "na_sou",           # そう is a grammatical auxiliary, not a na-adj

    # Duplicate (ia_kiiroi already exists and is the correct adjective form)
    "na_kiiro",         # 黄色 is a noun, not na-adj; 黄色い exists

    # Pure nouns that cannot be na-adjectives
    "na_kami",          # 神 is a noun, not a na-adj
    "na_aji",           # 味 is a noun, not a na-adj
    "na_cha",           # 茶 is a noun, not a na-adj
    "na_otona",         # 大人 is a noun, not a na-adj

    # Pure adverbs mislabeled as na-adj
    "na_tabun",         # 多分 is an adverb
    "na_mada",          # 未だ is an adverb
    "na_takusan",       # 沢山 is an adverb
    "na_taitei",        # 大抵 is an adverb
    "na_kanari",        # 可也 is an adverb
    "na_isshoukenmei",  # 一生懸命 is an adverb
    "na_nakanaka",      # 中々 is an adverb
    "na_zuibun",        # 随分 is an adverb
    "na_mottomo",       # 最も is an adverb
    "na_nao",           # 尚 is an adverb/conjunction
    "na_ippai",         # 一杯 is an adverb/counter
    "na_amari",         # 余り is an adverb
}

# ─────────────────────────────────────────────────────
# 2. SPECIFIC WORD FIXES (kanji, meaning, group)
# ─────────────────────────────────────────────────────
WORD_FIXES = {
    "v_suru": {
        "dictionary_form.kanji": "する",
    },
}

# ─────────────────────────────────────────────────────
# 3. HONORIFIC -ARU VERBS: Fix polite form and imperative
#    These special godan verbs use い instead of り in
#    ます-form and imperative.
# ─────────────────────────────────────────────────────
HONORIFIC_ARU_FIXES = {
    "v_nasaru": {
        "polite": "なさいます",
        "negative_polite": "なさいません",
        "past_polite": "なさいました",
        "past_negative_polite": "なさいませんでした",
        "imperative": "なさい",
    },
    "v_kudasaru": {
        "polite": "くださいます",
        "negative_polite": "くださいません",
        "past_polite": "くださいました",
        "past_negative_polite": "くださいませんでした",
        "imperative": "ください",
    },
    "v_ossharu": {
        "polite": "おっしゃいます",
        "negative_polite": "おっしゃいません",
        "past_polite": "おっしゃいました",
        "past_negative_polite": "おっしゃいませんでした",
        "imperative": "おっしゃい",
    },
    "v_irassharu": {
        "polite": "いらっしゃいます",
        "negative_polite": "いらっしゃいません",
        "past_polite": "いらっしゃいました",
        "past_negative_polite": "いらっしゃいませんでした",
        "imperative": "いらっしゃい",
    },
}

# ─────────────────────────────────────────────────────
# 4. VERBS WHERE CERTAIN CONJUGATION KEYS ARE ABSURD
#    (stative verbs, spontaneous verbs, potential-only verbs)
# ─────────────────────────────────────────────────────
# "potential-like" verbs: already potential/stative, their
# potential/passive/causative forms are semantically absurd
REMOVE_CONJ_KEYS_POTENTIAL_LIKE = {
    "v_dekiru",   # できる IS the potential form of する
    "v_mieru",    # 見える is already spontaneous/potential
    "v_kikoeru",  # 聞こえる is already spontaneous/potential
    "v_aru",      # ある (existential) has no potential/passive/causative
    "v_umareru",  # 生まれる (intransitive "be born")
    "v_wakaru",   # 分かる (stative "understand")
}
ABSURD_KEYS_POTENTIAL_LIKE = {
    "potential", "passive", "causative", "causative_passive",
    "imperative", "volitional",
}

# Intransitive/spontaneous verbs: imperative/volitional are absurd
REMOVE_CONJ_KEYS_INTRANSITIVE = {
    "v_furu",         # 降る (rain falls)
    "v_saku",         # 咲く (flowers bloom)
    "v_kumoru",       # 曇る (cloud over)
    "v_kawaku",       # 乾く (dry)
    "v_hajimaru",     # 始まる (intr. begin)
    "v_shimaru",      # 閉まる (intr. close)
    "v_kimaru",       # 決まる (intr. be decided)
    "v_kawaru",       # 変わる (intr. change)
    "v_nakunaru",     # 無くなる (be lost)
    "v_naoru",        # 治る (heal, intr.)
    "v_kowareru",     # 壊れる (break, intr.)
    "v_taoreru",      # 倒れる (collapse, intr.)
    "v_nureru",       # 濡れる (get wet)
    "v_yogoreru",     # 汚れる (get dirty)
    "v_wareru",       # 割れる (break, intr.)
    "v_oreru",        # 折れる (snap, intr.)
    "v_yakeru",       # 焼ける (burn, intr.)
    "v_moeru",        # 燃える (burn, intr.)
    "v_tsukareru",    # 疲れる (get tired)
    "v_okureru",      # 遅れる (be late)
    "v_ochiru",       # 落ちる (fall, intr.)
    "v_komaru",       # 困る (be troubled)
    "v_chigau",       # 違う (differ)
    "v_kotonaru",     # 異なる (differ)
    "v_tariru",       # 足りる (be sufficient)
    "v_futoru",       # 太る (gain weight)
    "v_yaseru",       # 痩せる (lose weight)
    "v_kakaru",       # 掛かる (take time/money)
    "v_yakunitatsu",  # 役に立つ (be useful)
    "v_maniau",       # 間に合う (be in time)
    "v_mitsukaru",    # 見つかる (be found)
    "v_shiru",        # 知る (know - stative)
    "v_sasu",         # 差す (shine - natural phenomenon)
}
ABSURD_KEYS_INTRANSITIVE = {"imperative", "volitional"}

# ─────────────────────────────────────────────────────
# 5. KATAKANA VERB ROMAJI FIXES
# ─────────────────────────────────────────────────────
KATAKANA_ROMAJI_FIXES = {
    "v_プルsuru":     "puurusuru",
    "v_テストsuru":   "tesutosuru",
    "v_ポストsuru":   "posutosuru",
    "v_コピsuru":     "kopiisuru",
    "v_ノトsuru":     "nootosuru",
    "v_マッチsuru":   "matchisuru",
    "v_ファックスsuru": "fakkususuru",
    "v_アルバイトsuru": "arubaitosuru",
    "v_ダンスsuru":   "dansusuru",
    "v_サビスsuru":   "saabisusuru",
    "v_デトsuru":     "deetosuru",
    "v_スケトsuru":   "sukeetosuru",
    "v_ドライブsuru": "doraibusuru",
    "v_ノックsuru":   "nokkusuru",
    "v_キャンプsuru": "kyanpusuru",
    "v_トンネルsuru": "tonnerusuru",
    "v_コチsuru":     "kouchisuru",
    "v_プラスsuru":   "purasusuru",
    "v_マスタsuru":   "masutaasuru",
    "v_パスsuru":     "pasusuru",
    "v_セットsuru":   "settosuru",
    "v_メモsuru":     "memosuru",
    "v_スイッチsuru": "suitchisuru",
    "v_ゴルsuru":     "goorusuru",
    "v_サインsuru":   "sainsuru",
    "v_ミスsuru":     "misusuru",
    "v_チェックsuru": "chekkusuru",
    "v_プレゼントsuru": "purezentosuru",
    "v_タイプsuru":   "taipusuru",
    "v_レポトsuru":   "repootosuru",
}

# ─────────────────────────────────────────────────────
# 6. SURU-VERB MEANING FIXES (noun → verb gloss)
# ─────────────────────────────────────────────────────
SURU_MEANING_FIXES = {
    "v_shigotosuru":     "to work",
    "v_denwasuru":        "to call (on the phone)",
    "v_kekkonsuru":       "to marry; to get married",
    "v_ryokousuru":       "to travel",
    "v_ryourisuru":       "to cook",
    "v_imisuru":          "to mean; to signify",
    "v_sanposuru":        "to take a walk; to stroll",
    "v_jugyousuru":       "to teach or take a class",
    "v_kaimonosuru":      "to shop; to do shopping",
    "v_soujisuru":        "to clean",
    "v_sakubunsuru":      "to write a composition",
    "v_sentakusuru":      "to do laundry",
    "v_shitsumonsuru":    "to ask a question",
    "v_benkyousuru":      "to study",
    "v_renshuusuru":      "to practice",
    "v_himasuru":         "to have free time; to be idle",
    "v_ochasuru":         "to go for tea; to have tea",
    "v_seikatsusuru":     "to live; to make a living",
    "v_chuuisuru":        "to warn; to pay attention",
    "v_setsumeisuru":     "to explain",
    "v_kankeisuru":       "to relate to; to be connected",
    "v_kenkyuusuru":      "to research",
    "v_kaigisuru":        "to hold a meeting; to confer",
    "v_kyouikusuru":      "to educate",
    "v_koshousuru":       "to break down; to malfunction",
    "v_sotsugyousuru":    "to graduate",
    "v_suieisuru":        "to swim",
    "v_kougisuru":        "to lecture",
    "v_seisansuru":       "to produce",
    "v_kaiwasuru":        "to converse; to talk",
    "v_honyakusuru":      "to translate",
    "v_bouekisuru":       "to trade",
    "v_nyuugakusuru":     "to enter a school; to enroll",
    "v_hatsuonsuru":      "to pronounce",
    "v_chuushasuru":      "to inject",
    "v_hanamisuru":       "to view cherry blossoms",
    "v_kenkasuru":        "to quarrel; to fight",
    "v_kenbutsusuru":     "to sightsee",
    "v_shikensuru":       "to take an exam; to be tested",
    "v_shippaisuru":      "to fail; to make a mistake",
    "v_ikensuru":         "to give one's opinion; to advise",
    "v_shiaisuru":        "to play a match; to compete",
    "v_hantaisuru":       "to oppose",
    "v_yakusokusuru":     "to promise",
    "v_riyousuru":        "to use; to utilize",
    "v_yoteisuru":        "to plan; to schedule",
    "v_henjisuru":        "to reply; to answer",
    "v_yukkurisuru":      "to take it easy; to relax",
    "v_プルsuru":         "to swim; to go to the pool",
    "v_テストsuru":       "to test; to take a test",
    "v_ポストsuru":       "to post; to mail",
    "v_コピsuru":         "to copy; to photocopy",
    "v_ノトsuru":         "to take notes",
    "v_マッチsuru":       "to match; to coincide",
}

# ─────────────────────────────────────────────────────
# 7. SPECIFIC KANJI FIXES (archaic kanji → kana)
# ─────────────────────────────────────────────────────
KANJI_FIXES = {
    "ia_tsumaranai": "つまらない",  # 詰らない is archaic; use kana
    "ia_urusai":     "うるさい",     # 煩い is rarely written in kanji
    "v_jittosuru":   "じっとする",   # 凝乎とする is extremely rare/archaic
}

# ─────────────────────────────────────────────────────
# 8. MEANING FIX for 早い→速い
# ─────────────────────────────────────────────────────
IA_HAYAI_KANJI_FIX = "速い"  # 早い=early, 速い=fast; meaning is "fast"


def fix_dictionary(filepath):
    """Apply all fixes to a single JSON dictionary file."""
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)

    words = data.get("words", [])
    original_count = len(words)
    fixes_applied = 0
    removals = 0

    # ── Step 1: Remove invalid entries ──
    removed_ids = set()
    new_words = []
    for w in words:
        wid = w.get("id", "")
        if wid in REMOVE_IDS:
            removed_ids.add(wid)
            removals += 1
        else:
            new_words.append(w)
    words = new_words
    data["words"] = words

    # ── Step 2: Apply per-word fixes ──
    for w in words:
        wid = w.get("id", "")

        # 2a. Simple field fixes
        if wid in WORD_FIXES:
            for keypath, value in WORD_FIXES[wid].items():
                # Support dotted paths like "dictionary_form.kanji"
                parts = keypath.split(".")
                target = w
                for part in parts[:-1]:
                    target = target[part]
                target[parts[-1]] = value
                fixes_applied += 1

        # 2b. Fix ia_hayai kanji (早い→速い since meaning is "fast")
        if wid == "ia_hayai" and w.get("dictionary_form", {}).get("kanji") == "早い":
            w["dictionary_form"]["kanji"] = IA_HAYAI_KANJI_FIX
            fixes_applied += 1

        # 2c. Kanji fixes (replace archaic kanji with kana)
        if wid in KANJI_FIXES:
            w["dictionary_form"]["kanji"] = KANJI_FIXES[wid]
            fixes_applied += 1

        # 2d. Honorific -aru verb fixes
        if wid in HONORIFIC_ARU_FIXES:
            for key, value in HONORIFIC_ARU_FIXES[wid].items():
                w["conjugations"][key] = value
                fixes_applied += 1

        # 2e. Remove absurd conjugations (potential-like verbs)
        if wid in REMOVE_CONJ_KEYS_POTENTIAL_LIKE:
            for key in ABSURD_KEYS_POTENTIAL_LIKE:
                if key in w.get("conjugations", {}):
                    del w["conjugations"][key]
                    fixes_applied += 1

        # 2f. Remove absurd conjugations (intransitive verbs)
        if wid in REMOVE_CONJ_KEYS_INTRANSITIVE:
            for key in ABSURD_KEYS_INTRANSITIVE:
                if key in w.get("conjugations", {}):
                    del w["conjugations"][key]
                    fixes_applied += 1

        # 2g. Fix katakana romaji
        if wid in KATAKANA_ROMAJI_FIXES:
            w["dictionary_form"]["romaji"] = KATAKANA_ROMAJI_FIXES[wid]
            fixes_applied += 1

        # 2h. Fix suru-verb meanings (noun → verb)
        if wid in SURU_MEANING_FIXES:
            w["meaning"] = SURU_MEANING_FIXES[wid]
            fixes_applied += 1

    # ── Step 3: Write back ──
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")

    return original_count, len(words), fixes_applied, removals, removed_ids


def main():
    print("=" * 60)
    print("Fixing Japanese dictionary data...")
    print("=" * 60)

    all_removed = set()

    for filename in FILES:
        filepath = DICT_DIR / filename
        if not filepath.exists():
            print(f"  [SKIP] {filename} not found")
            continue

        # Backup
        backup_path = filepath.with_suffix(".json.bak")
        shutil.copy2(filepath, backup_path)

        orig, new_count, fixes, removals, removed = fix_dictionary(filepath)
        all_removed.update(removed)

        print(f"\n  {filename}:")
        print(f"    Words: {orig} → {new_count} ({removals} removed)")
        print(f"    Fixes applied: {fixes}")

    # ── Also update localization files (remove entries, fix meanings) ──
    local_files = ["en.json", "zh.json", "ko.json", "vi.json", "my.json", "ne.json"]
    for loc_file in local_files:
        loc_path = DICT_DIR / loc_file
        if not loc_path.exists():
            continue

        # Backup
        backup_path = loc_path.with_suffix(".json.bak")
        shutil.copy2(loc_path, backup_path)

        with open(loc_path, "r", encoding="utf-8") as f:
            loc_data = json.load(f)

        # Remove entries for deleted words
        removed_from_loc = 0
        for wid in all_removed:
            if wid in loc_data:
                del loc_data[wid]
                removed_from_loc += 1

        with open(loc_path, "w", encoding="utf-8") as f:
            json.dump(loc_data, f, ensure_ascii=False, indent=2)
            f.write("\n")

        print(f"  {loc_file}: {removed_from_loc} entries removed")

    print(f"\n  Removed {len(all_removed)} invalid entries:")
    for wid in sorted(all_removed):
        print(f"    - {wid}")

    print(f"\n  Backups saved as *.json.bak")
    print("=" * 60)
    print("Done! Run tests to verify.")


if __name__ == "__main__":
    main()
