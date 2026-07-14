#!/usr/bin/env python3
"""
Comprehensive Japanese dictionary data consistency and correctness verifier.

Checks every word's conjugation forms for:
1. Formation existence — which forms should/shouldn't exist per word
2. Formation correctness — spelling matches Japanese grammar rules
3. Schema integrity — required fields, valid values
4. Cross-file alignment — base.json <-> dictionary.json
5. Localization completeness — translation files cover all word IDs
"""

import json
import sys
from pathlib import Path
from collections import defaultdict

SCRIPT_DIR = Path(__file__).parent
DICT_DIR = SCRIPT_DIR.parent / "src" / "data" / "dictionaries"

# ═══════════════════════════════════════════════════════════════════
# 1. FORMATION KEY INVENTORIES
# ═══════════════════════════════════════════════════════════════════

VERB_FORMATIONS = [
    "polite", "negative_plain", "negative_polite",
    "past_plain", "past_polite",
    "past_negative_plain", "past_negative_polite",
    "te_form",
    "potential", "passive", "causative", "causative_passive",
    "imperative", "volitional",
    "conditional_ba", "conditional_tara",
]

ADJ_FORMATIONS = [
    "polite", "negative_plain", "negative_polite",
    "past_plain", "past_polite",
    "past_negative_plain", "past_negative_polite",
    "te_form",
    "conditional_ba", "conditional_tara",
]

VERB_ONLY_FORMATIONS = set(VERB_FORMATIONS) - set(ADJ_FORMATIONS)
# = {potential, passive, causative, causative_passive, imperative, volitional}

# ═══════════════════════════════════════════════════════════════════
# 2. EXISTENCE MATRIX — exact word ID lists
# ═══════════════════════════════════════════════════════════════════

# Category A: stative/potential-like verbs
# MISSING: potential, passive, causative, causative_passive, imperative, volitional
CATEGORY_A_IDS = {
    "v_aru",       # ある (existential)
    "v_wakaru",    # 分かる (stative "understand")
    "v_dekiru",    # できる (IS the potential of する)
    "v_umareru",   # 生まれる (intransitive "be born")
    "v_mieru",     # 見える (spontaneous/potential)
    "v_kikoeru",   # 聞こえる (spontaneous/potential)
}
CATEGORY_A_FORBIDDEN = {"potential", "passive", "causative", "causative_passive", "imperative", "volitional"}

# Category B: intransitive/spontaneous/phenomenon verbs
# MISSING: imperative, volitional
CATEGORY_B_IDS = {
    # Godan
    "v_shiru", "v_furu", "v_kakaru", "v_chigau", "v_komaru",
    "v_hajimaru", "v_shimaru", "v_saku", "v_kumoru", "v_sasu",
    "v_kawaru", "v_maniau", "v_yakunitatsu", "v_mitsukaru",
    "v_kimaru", "v_nakunaru", "v_naoru", "v_futoru", "v_kawaku",
    "v_kotonaru",
    # Ichidan
    "v_tsukareru", "v_ochiru", "v_kowareru", "v_taoreru",
    "v_okureru", "v_tariru", "v_nureru", "v_yaseru",
    "v_wareru", "v_oreru", "v_yakeru", "v_yogoreru", "v_moeru",
}
CATEGORY_B_FORBIDDEN = {"imperative", "volitional"}

# Honorific -aru verbs (irregular polite-stem forms)
HONORIFIC_ARU_IDS = {"v_nasaru", "v_kudasaru", "v_ossharu", "v_irassharu"}

# ═══════════════════════════════════════════════════════════════════
# 3. GODAN CONJUGATION ENGINE
# ═══════════════════════════════════════════════════════════════════

GODAN_MAP = {
    'う': {'a': 'わ', 'i': 'い', 'e': 'え', 'o': 'お'},
    'く': {'a': 'か', 'i': 'き', 'e': 'け', 'o': 'こ'},
    'ぐ': {'a': 'が', 'i': 'ぎ', 'e': 'げ', 'o': 'ご'},
    'す': {'a': 'さ', 'i': 'し', 'e': 'せ', 'o': 'そ'},
    'つ': {'a': 'た', 'i': 'ち', 'e': 'て', 'o': 'と'},
    'ぬ': {'a': 'な', 'i': 'に', 'e': 'ね', 'o': 'の'},
    'ぶ': {'a': 'ば', 'i': 'び', 'e': 'べ', 'o': 'ぼ'},
    'む': {'a': 'ま', 'i': 'み', 'e': 'め', 'o': 'も'},
    'る': {'a': 'ら', 'i': 'り', 'e': 'れ', 'o': 'ろ'},
}

# Sound changes for te_form and past_plain (音便)
GODAN_TE_TA = {
    'う': ('って', 'った'),
    'つ': ('って', 'った'),
    'る': ('って', 'った'),
    'ぬ': ('んで', 'んだ'),
    'ぶ': ('んで', 'んだ'),
    'む': ('んで', 'んだ'),
    'く': ('いて', 'いた'),
    'ぐ': ('いで', 'いだ'),
    'す': ('して', 'した'),
}


def conjugate_godan(kana):
    """Conjugate a godan verb. Returns dict of formation -> kana string."""
    stem = kana[:-1]
    ending = kana[-1]
    rows = GODAN_MAP[ending]
    te_suf, ta_suf = GODAN_TE_TA[ending]

    # いく / ゆく exception
    if kana in ('いく', 'ゆく'):
        te_suf, ta_suf = 'って', 'った'

    past_plain = stem + ta_suf

    conj = {
        'polite':               stem + rows['i'] + 'ます',
        'negative_plain':       stem + rows['a'] + 'ない',
        'negative_polite':      stem + rows['i'] + 'ません',
        'past_plain':           past_plain,
        'past_polite':          stem + rows['i'] + 'ました',
        'past_negative_plain':  stem + rows['a'] + 'なかった',
        'past_negative_polite': stem + rows['i'] + 'ませんでした',
        'te_form':              stem + te_suf,
        'potential':            stem + rows['e'] + 'る',
        'passive':              stem + rows['a'] + 'れる',
        'causative':            stem + rows['a'] + 'せる',
        'causative_passive':    stem + rows['a'] + 'せられる',
        'imperative':           stem + rows['e'],
        'volitional':           stem + rows['o'] + 'う',
        'conditional_ba':       stem + rows['e'] + 'ば',
        'conditional_tara':     past_plain + 'ら',
    }

    # ある exception: plain negative is ない, past neg plain is なかった
    if kana == 'ある':
        conj['negative_plain'] = 'ない'
        conj['past_negative_plain'] = 'なかった'

    return conj


def conjugate_ichidan(kana):
    """Conjugate an ichidan verb. stem = kana minus trailing る."""
    stem = kana[:-1]
    past_plain = stem + 'た'
    return {
        'polite':               stem + 'ます',
        'negative_plain':       stem + 'ない',
        'negative_polite':      stem + 'ません',
        'past_plain':           past_plain,
        'past_polite':          stem + 'ました',
        'past_negative_plain':  stem + 'なかった',
        'past_negative_polite': stem + 'ませんでした',
        'te_form':              stem + 'て',
        'potential':            stem + 'られる',
        'passive':              stem + 'られる',
        'causative':            stem + 'させる',
        'causative_passive':    stem + 'させられる',
        'imperative':           stem + 'ろ',
        'volitional':           stem + 'よう',
        'conditional_ba':       stem + 'れば',
        'conditional_tara':     past_plain + 'ら',
    }


def conjugate_suru(prefix):
    """Conjugate a suru verb. prefix = noun part (empty for する itself)."""
    return {
        'polite':               prefix + 'します',
        'negative_plain':       prefix + 'しない',
        'negative_polite':      prefix + 'しません',
        'past_plain':           prefix + 'した',
        'past_polite':          prefix + 'しました',
        'past_negative_plain':  prefix + 'しなかった',
        'past_negative_polite': prefix + 'しませんでした',
        'te_form':              prefix + 'して',
        'potential':            prefix + 'できる',
        'passive':              prefix + 'される',
        'causative':            prefix + 'させる',
        'causative_passive':    prefix + 'させられる',
        'imperative':           prefix + 'しろ',
        'volitional':           prefix + 'しよう',
        'conditional_ba':       prefix + 'すれば',
        'conditional_tara':     prefix + 'したら',
    }


def conjugate_kuru():
    """Conjugate 来る (くる)."""
    return {
        'polite':               'きます',
        'negative_plain':       'こない',
        'negative_polite':      'きません',
        'past_plain':           'きた',
        'past_polite':          'きました',
        'past_negative_plain':  'こなかった',
        'past_negative_polite': 'きませんでした',
        'te_form':              'きて',
        'potential':            'こられる',
        'passive':              'こられる',
        'causative':            'こさせる',
        'causative_passive':    'こさせられる',
        'imperative':           'こい',
        'volitional':           'こよう',
        'conditional_ba':       'くれば',
        'conditional_tara':     'きたら',
    }


def conjugate_i_adj(kana):
    """Conjugate an i-adjective. kana includes trailing い."""
    # Special case: いい / よい
    if kana in ('いい', 'よい'):
        return {
            'polite':               'いいです',
            'negative_plain':       'よくない',
            'negative_polite':      'よくないです',
            'past_plain':           'よかった',
            'past_polite':          'よかったです',
            'past_negative_plain':  'よくなかった',
            'past_negative_polite': 'よくなかったです',
            'te_form':              'よくて',
            'conditional_ba':       'よければ',
            'conditional_tara':     'よかったら',
        }

    stem = kana[:-1]  # Remove い
    return {
        'polite':               kana + 'です',
        'negative_plain':       stem + 'くない',
        'negative_polite':      stem + 'くないです',
        'past_plain':           stem + 'かった',
        'past_polite':          stem + 'かったです',
        'past_negative_plain':  stem + 'くなかった',
        'past_negative_polite': stem + 'くなかったです',
        'te_form':              stem + 'くて',
        'conditional_ba':       stem + 'ければ',
        'conditional_tara':     stem + 'かったら',
    }


def conjugate_na_adj(kana):
    """Conjugate a na-adjective. kana is the stem (without な)."""
    return {
        'polite':               kana + 'です',
        'negative_plain':       kana + 'じゃない',
        'negative_polite':      kana + 'じゃありません',
        'past_plain':           kana + 'だった',
        'past_polite':          kana + 'でした',
        'past_negative_plain':  kana + 'じゃなかった',
        'past_negative_polite': kana + 'じゃありませんでした',
        'te_form':              kana + 'で',
        'conditional_ba':       kana + 'であれば',
        'conditional_tara':     kana + 'だったら',
    }


# ═══════════════════════════════════════════════════════════════════
# 4. EXPECTED CONJUGATION GENERATOR
# ═══════════════════════════════════════════════════════════════════

def get_expected_conjugations(word):
    """
    Generate the expected conjugations for a word based on its group and kana.
    Returns a dict of formation_key -> expected_kana_string.
    Only includes formations that SHOULD exist for this word.
    """
    wid = word["id"]
    group = word["group"]
    kana = word["dictionary_form"]["kana"]

    # Generate base conjugations
    if group == "godan":
        conj = conjugate_godan(kana)
    elif group == "ichidan":
        conj = conjugate_ichidan(kana)
    elif group == "suru":
        # Extract prefix: kana minus trailing する
        if kana.endswith("する"):
            prefix = kana[:-2]
        else:
            prefix = ""
        conj = conjugate_suru(prefix)
    elif group == "kuru":
        conj = conjugate_kuru()
    elif group == "i-adj":
        conj = conjugate_i_adj(kana)
    elif group == "na-adj":
        conj = conjugate_na_adj(kana)
    else:
        return {}

    # Apply honorific -aru overrides (polite, neg_polite, past_polite,
    # past_neg_polite, imperative use い instead of り)
    if wid in HONORIFIC_ARU_IDS:
        stem = kana[:-1]  # Remove final る
        conj["polite"]               = stem + "います"
        conj["negative_polite"]      = stem + "いません"
        conj["past_polite"]          = stem + "いました"
        conj["past_negative_polite"] = stem + "いませんでした"
        conj["imperative"]           = stem + "い"

    # Remove forbidden formations based on existence category
    if wid in CATEGORY_A_IDS:
        for key in CATEGORY_A_FORBIDDEN:
            conj.pop(key, None)
    elif wid in CATEGORY_B_IDS:
        for key in CATEGORY_B_FORBIDDEN:
            conj.pop(key, None)

    return conj


def get_expected_formation_keys(word):
    """Return the set of formation keys that SHOULD exist for this word."""
    wid = word["id"]
    group = word["group"]

    if group in ("i-adj", "na-adj"):
        return set(ADJ_FORMATIONS)

    # Verb
    keys = set(VERB_FORMATIONS)
    if wid in CATEGORY_A_IDS:
        keys -= CATEGORY_A_FORBIDDEN
    elif wid in CATEGORY_B_IDS:
        keys -= CATEGORY_B_FORBIDDEN

    return keys


# ═══════════════════════════════════════════════════════════════════
# 5. VALIDATION CHECKS
# ═══════════════════════════════════════════════════════════════════

VALID_WORD_TYPES = {"verb", "i-adj", "na-adj"}
VALID_LEVELS = {"N5", "N4", "N3"}
VALID_VERB_GROUPS = {"godan", "ichidan", "suru", "kuru"}
VALID_ADJ_GROUPS = {"i-adj", "na-adj"}
VALID_GROUPS = VALID_VERB_GROUPS | VALID_ADJ_GROUPS


def check_schema(words):
    """Validate schema: required fields, valid enum values, consistency."""
    errors = []

    seen_ids = set()
    for i, w in enumerate(words):
        wid = w.get("id", f"<missing-id-at-index-{i}>")
        prefix = f"[{wid}]"

        # Required top-level fields
        for field in ("id", "level", "group", "word_type", "dictionary_form", "conjugations"):
            if field not in w:
                errors.append(f"{prefix} Missing required field: {field}")

        # Unique ID
        if wid in seen_ids:
            errors.append(f"{prefix} Duplicate ID")
        seen_ids.add(wid)

        # Valid values
        wt = w.get("word_type", "")
        if wt not in VALID_WORD_TYPES:
            errors.append(f"{prefix} Invalid word_type: '{wt}' (expected one of {VALID_WORD_TYPES})")

        level = w.get("level", "")
        if level not in VALID_LEVELS:
            errors.append(f"{prefix} Invalid level: '{level}' (expected one of {VALID_LEVELS})")

        group = w.get("group", "")
        if group not in VALID_GROUPS:
            errors.append(f"{prefix} Invalid group: '{group}' (expected one of {VALID_GROUPS})")

        # group <-> word_type consistency
        if group in VALID_VERB_GROUPS and wt != "verb":
            errors.append(f"{prefix} Group '{group}' should have word_type 'verb', got '{wt}'")
        if group in VALID_ADJ_GROUPS and wt != group:
            errors.append(f"{prefix} Group '{group}' should have word_type '{group}', got '{wt}'")

        # dictionary_form sub-fields
        df = w.get("dictionary_form", {})
        for subfield in ("kanji", "kana", "romaji"):
            if subfield not in df:
                errors.append(f"{prefix} Missing dictionary_form.{subfield}")
            elif not df[subfield]:
                errors.append(f"{prefix} Empty dictionary_form.{subfield}")

    return errors


def check_existence(words):
    """Validate that each word has exactly the formations it should have."""
    errors = []

    for w in words:
        wid = w["id"]
        prefix = f"[{wid}]"
        actual_keys = set(w.get("conjugations", {}).keys())
        expected_keys = get_expected_formation_keys(w)

        # Formations that exist but shouldn't
        extra = actual_keys - expected_keys
        for key in sorted(extra):
            errors.append(f"{prefix} EXTRA formation '{key}' should NOT exist for this word")

        # Formations that should exist but don't
        missing = expected_keys - actual_keys
        for key in sorted(missing):
            errors.append(f"{prefix} MISSING formation '{key}' should exist for this word")

    return errors


def check_correctness(words):
    """Validate that every existing formation has the correct spelling."""
    errors = []

    for w in words:
        wid = w["id"]
        prefix = f"[{wid}]"
        kana = w["dictionary_form"]["kana"]
        actual = w.get("conjugations", {})
        expected = get_expected_conjugations(w)

        for key in sorted(actual.keys()):
            if key not in expected:
                # Extra key — already reported by check_existence
                continue

            actual_val = actual[key]
            expected_val = expected[key]

            if actual_val != expected_val:
                errors.append(
                    f"{prefix} WRONG '{key}': "
                    f"got '{actual_val}', expected '{expected_val}' "
                    f"(word: {kana}, group: {w['group']})"
                )

    return errors


def check_alignment(base_words, dict_words):
    """Check that base.json and dictionary.json have the same word IDs
    and identical structural fields (everything except 'meaning')."""
    errors = []

    base_ids = {w["id"] for w in base_words}
    dict_ids = {w["id"] for w in dict_words}

    only_in_base = base_ids - dict_ids
    only_in_dict = dict_ids - base_ids

    for wid in sorted(only_in_base):
        errors.append(f"[{wid}] Present in base.json but not dictionary.json")
    for wid in sorted(only_in_dict):
        errors.append(f"[{wid}] Present in dictionary.json but not base.json")

    # For words in both, check structural field equality
    base_map = {w["id"]: w for w in base_words}
    dict_map = {w["id"]: w for w in dict_words}

    shared_ids = base_ids & dict_ids
    for wid in sorted(shared_ids):
        bw = base_map[wid]
        dw = dict_map[wid]

        # Compare all fields except 'meaning'
        for field in ("level", "group", "word_type", "dictionary_form", "conjugations"):
            bval = bw.get(field)
            dval = dw.get(field)
            if bval != dval:
                errors.append(
                    f"[{wid}] Field '{field}' differs between base.json and dictionary.json"
                )

    return errors


def check_localization(base_words, loc_dir):
    """Check that every localization file contains exactly the word IDs in base.json."""
    errors = []
    base_ids = {w["id"] for w in base_words}

    loc_files = ["en.json", "zh.json", "ko.json", "vi.json", "my.json", "ne.json"]

    for filename in loc_files:
        filepath = loc_dir / filename
        if not filepath.exists():
            errors.append(f"[{filename}] Localization file not found")
            continue

        with open(filepath, "r", encoding="utf-8") as f:
            loc_data = json.load(f)

        loc_ids = set(loc_data.keys())

        only_in_base = base_ids - loc_ids
        only_in_loc = loc_ids - base_ids

        for wid in sorted(only_in_base):
            errors.append(f"[{filename}] Missing translation for '{wid}'")
        for wid in sorted(only_in_loc):
            errors.append(f"[{filename}] Extra translation for '{wid}' (not in base.json)")

    return errors


# ═══════════════════════════════════════════════════════════════════
# 6. MAIN
# ═══════════════════════════════════════════════════════════════════

def main():
    print("=" * 70)
    print("  Japanese Dictionary Data Consistency & Correctness Verifier")
    print("=" * 70)

    # Load data
    base_path = DICT_DIR / "base.json"
    dict_path = DICT_DIR / "dictionary.json"

    if not base_path.exists():
        print(f"\n  ERROR: {base_path} not found")
        sys.exit(1)

    with open(base_path, "r", encoding="utf-8") as f:
        base_data = json.load(f)
    base_words = base_data.get("words", [])

    dict_words = []
    if dict_path.exists():
        with open(dict_path, "r", encoding="utf-8") as f:
            dict_data = json.load(f)
        dict_words = dict_data.get("words", [])

    print(f"\n  Loaded {len(base_words)} words from base.json")
    print(f"  Loaded {len(dict_words)} words from dictionary.json")

    # Word counts by group
    group_counts = defaultdict(int)
    for w in base_words:
        group_counts[w.get("group", "unknown")] += 1
    print(f"\n  Breakdown by group:")
    for g in sorted(group_counts):
        print(f"    {g}: {group_counts[g]}")

    all_errors = {}
    total_errors = 0

    # 1. Schema validation
    print(f"\n{'─' * 70}")
    print("  CHECK 1: Schema Validation")
    print(f"{'─' * 70}")
    schema_errors = check_schema(base_words)
    all_errors["schema"] = schema_errors
    total_errors += len(schema_errors)
    if schema_errors:
        for e in schema_errors:
            print(f"    ❌ {e}")
    else:
        print(f"    ✅ All {len(base_words)} words pass schema validation")

    # 2. Formation existence
    print(f"\n{'─' * 70}")
    print("  CHECK 2: Formation Existence")
    print(f"{'─' * 70}")
    existence_errors = check_existence(base_words)
    all_errors["existence"] = existence_errors
    total_errors += len(existence_errors)
    if existence_errors:
        for e in existence_errors:
            print(f"    ❌ {e}")
    else:
        print(f"    ✅ All {len(base_words)} words have correct formation sets")

    # 3. Formation correctness
    print(f"\n{'─' * 70}")
    print("  CHECK 3: Formation Correctness")
    print(f"{'─' * 70}")
    correctness_errors = check_correctness(base_words)
    all_errors["correctness"] = correctness_errors
    total_errors += len(correctness_errors)
    if correctness_errors:
        for e in correctness_errors:
            print(f"    ❌ {e}")
    else:
        # Count total formations checked
        total_formations = sum(
            len(w.get("conjugations", {})) for w in base_words
        )
        print(f"    ✅ All {total_formations} formations across {len(base_words)} words are correct")

    # 4. Cross-file alignment
    print(f"\n{'─' * 70}")
    print("  CHECK 4: base.json <-> dictionary.json Alignment")
    print(f"{'─' * 70}")
    if dict_words:
        alignment_errors = check_alignment(base_words, dict_words)
        all_errors["alignment"] = alignment_errors
        total_errors += len(alignment_errors)
        if alignment_errors:
            for e in alignment_errors:
                print(f"    ❌ {e}")
        else:
            print(f"    ✅ Both files are fully aligned ({len(base_words)} words)")
    else:
        print(f"    ⚠️  dictionary.json not found, skipping alignment check")

    # 5. Localization completeness
    print(f"\n{'─' * 70}")
    print("  CHECK 5: Localization Completeness")
    print(f"{'─' * 70}")
    loc_errors = check_localization(base_words, DICT_DIR)
    all_errors["localization"] = loc_errors
    total_errors += len(loc_errors)
    if loc_errors:
        for e in loc_errors:
            print(f"    ❌ {e}")
    else:
        print(f"    ✅ All localization files are complete")

    # Summary
    print(f"\n{'═' * 70}")
    if total_errors == 0:
        print(f"  ✅ ALL CHECKS PASSED — 0 errors found")
    else:
        print(f"  ❌ FOUND {total_errors} ERRORS:")
        for category, errs in all_errors.items():
            if errs:
                print(f"    {category}: {len(errs)} error(s)")
    print(f"{'═' * 70}")

    return 0 if total_errors == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
