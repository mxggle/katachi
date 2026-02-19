#!/usr/bin/env python3
"""
Fetches JLPT N5/N4/N3 words from Jisho API and generates dictionary.json
with full conjugation data for verbs and adjectives.
"""

import json
import time
import urllib.request
import urllib.error
import sys

JISHO_API = "https://jisho.org/api/v1/search/words"
LEVELS = ["n5", "n4", "n3"]
OUTPUT_FILE = "dictionary.json"
REQUEST_DELAY = 1.2  # seconds between API calls

# ---------------------------------------------------------------------------
# Kana → Romaji conversion
# ---------------------------------------------------------------------------
_ROMAJI_MAP = [
    # Combo (must come before singles)
    ('しゃ','sha'),('しゅ','shu'),('しょ','sho'),
    ('ちゃ','cha'),('ちゅ','chu'),('ちょ','cho'),
    ('じゃ','ja'),('じゅ','ju'),('じょ','jo'),
    ('きゃ','kya'),('きゅ','kyu'),('きょ','kyo'),
    ('にゃ','nya'),('にゅ','nyu'),('にょ','nyo'),
    ('ひゃ','hya'),('ひゅ','hyu'),('ひょ','hyo'),
    ('みゃ','mya'),('みゅ','myu'),('みょ','myo'),
    ('りゃ','rya'),('りゅ','ryu'),('りょ','ryo'),
    ('ぎゃ','gya'),('ぎゅ','gyu'),('ぎょ','gyo'),
    ('びゃ','bya'),('びゅ','byu'),('びょ','byo'),
    ('ぴゃ','pya'),('ぴゅ','pyu'),('ぴょ','pyo'),
    # Singles
    ('あ','a'),('い','i'),('う','u'),('え','e'),('お','o'),
    ('か','ka'),('き','ki'),('く','ku'),('け','ke'),('こ','ko'),
    ('さ','sa'),('し','shi'),('す','su'),('せ','se'),('そ','so'),
    ('た','ta'),('ち','chi'),('つ','tsu'),('て','te'),('と','to'),
    ('な','na'),('に','ni'),('ぬ','nu'),('ね','ne'),('の','no'),
    ('は','ha'),('ひ','hi'),('ふ','fu'),('へ','he'),('ほ','ho'),
    ('ま','ma'),('み','mi'),('む','mu'),('め','me'),('も','mo'),
    ('や','ya'),('ゆ','yu'),('よ','yo'),
    ('ら','ra'),('り','ri'),('る','ru'),('れ','re'),('ろ','ro'),
    ('わ','wa'),('を','wo'),('ん','n'),
    ('が','ga'),('ぎ','gi'),('ぐ','gu'),('げ','ge'),('ご','go'),
    ('ざ','za'),('じ','ji'),('ず','zu'),('ぜ','ze'),('ぞ','zo'),
    ('だ','da'),('ぢ','di'),('づ','du'),('で','de'),('ど','do'),
    ('ば','ba'),('び','bi'),('ぶ','bu'),('べ','be'),('ぼ','bo'),
    ('ぱ','pa'),('ぴ','pi'),('ぷ','pu'),('ぺ','pe'),('ぽ','po'),
    ('ー',''),
]

def kana_to_romaji(text):
    result = ''
    i = 0
    while i < len(text):
        if text[i] == 'っ':
            # Double next consonant
            if i + 1 < len(text):
                for kana, romaji in _ROMAJI_MAP:
                    if text[i+1:].startswith(kana) and romaji and romaji[0] not in 'aeiou':
                        result += romaji[0]
                        break
            i += 1
            continue
        matched = False
        for kana, romaji in _ROMAJI_MAP:
            if text[i:].startswith(kana):
                result += romaji
                i += len(kana)
                matched = True
                break
        if not matched:
            result += text[i]
            i += 1
    return result

# ---------------------------------------------------------------------------
# Godan verb helpers
# ---------------------------------------------------------------------------
GODAN_ROWS = {
    'う': {'a':'わ','i':'い','e':'え','o':'お'},
    'く': {'a':'か','i':'き','e':'け','o':'こ'},
    'ぐ': {'a':'が','i':'ぎ','e':'げ','o':'ご'},
    'す': {'a':'さ','i':'し','e':'せ','o':'そ'},
    'つ': {'a':'た','i':'ち','e':'て','o':'と'},
    'ぬ': {'a':'な','i':'に','e':'ね','o':'の'},
    'ぶ': {'a':'ば','i':'び','e':'べ','o':'ぼ'},
    'む': {'a':'ま','i':'み','e':'め','o':'も'},
    'る': {'a':'ら','i':'り','e':'れ','o':'ろ'},
}

# te-form / ta-form suffix by ending
GODAN_TE_TA = {
    'う': ('って','った'),
    'つ': ('って','った'),
    'る': ('って','った'),
    'く': ('いて','いた'),
    'ぐ': ('いで','いだ'),
    'す': ('して','した'),
    'ぬ': ('んで','んだ'),
    'ぶ': ('んで','んだ'),
    'む': ('んで','んだ'),
}

def conjugate_godan(stem, ending, kana):
    """Conjugate a godan verb. stem = kana minus last char, ending = last char."""
    rows = GODAN_ROWS[ending]
    te_suf, ta_suf = GODAN_TE_TA[ending]

    # 行く exception
    is_iku = kana in ('いく', 'ゆく')
    if is_iku:
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

    # ある exception: plain negative → ない
    if kana == 'ある':
        conj['negative_plain'] = 'ない'
        conj['past_negative_plain'] = 'なかった'

    return conj

def conjugate_ichidan(stem):
    """Conjugate an ichidan verb. stem = kana minus る."""
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
    """Conjugate a suru verb. prefix = noun part (empty string for する itself)."""
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

def conjugate_kuru(prefix=''):
    """Conjugate 来る. prefix = kanji/kana before くる if compound (usually empty)."""
    return {
        'polite':               prefix + 'きます',
        'negative_plain':       prefix + 'こない',
        'negative_polite':      prefix + 'きません',
        'past_plain':           prefix + 'きた',
        'past_polite':          prefix + 'きました',
        'past_negative_plain':  prefix + 'こなかった',
        'past_negative_polite': prefix + 'きませんでした',
        'te_form':              prefix + 'きて',
        'potential':            prefix + 'こられる',
        'passive':              prefix + 'こられる',
        'causative':            prefix + 'こさせる',
        'causative_passive':    prefix + 'こさせられる',
        'imperative':           prefix + 'こい',
        'volitional':           prefix + 'こよう',
        'conditional_ba':       prefix + 'くれば',
        'conditional_tara':     prefix + 'きたら',
    }

def conjugate_i_adj(kana):
    """Conjugate an i-adjective. kana includes the trailing い."""
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

    # Special case: かっこいい
    if kana == 'かっこいい':
        stem = 'かっこよ'
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

# ---------------------------------------------------------------------------
# POS classification
# ---------------------------------------------------------------------------
def classify_entry(entry):
    """
    Returns (group, word_type) or None if not a conjugatable word.
    group: 'godan'|'ichidan'|'suru'|'kuru'|'i-adj'|'na-adj'
    word_type: 'verb'|'i-adj'|'na-adj'
    """
    japanese = entry.get('japanese', [{}])[0]
    kana = japanese.get('reading', '')
    word = japanese.get('word', kana)

    # Collect all POS strings across senses
    all_pos = []
    for sense in entry.get('senses', []):
        all_pos.extend(sense.get('parts_of_speech', []))

    # Check for 来る specifically
    if word == '来る' or (kana == 'くる' and any('Kuru verb' in p for p in all_pos)):
        return ('kuru', 'verb')

    for pos in all_pos:
        if pos.startswith('Godan verb'):
            return ('godan', 'verb')
        if pos.startswith('Ichidan verb'):
            return ('ichidan', 'verb')
        if pos.startswith('Suru verb'):
            return ('suru', 'verb')

    for pos in all_pos:
        if 'I-adjective' in pos:
            return ('i-adj', 'i-adj')

    for pos in all_pos:
        if 'Na-adjective' in pos:
            return ('na-adj', 'na-adj')

    return None

# ---------------------------------------------------------------------------
# Jisho API fetching
# ---------------------------------------------------------------------------
def fetch_page(level, page):
    """Fetch a single page of results from Jisho API."""
    url = f"{JISHO_API}?keyword=%23jlpt-{level}&page={page}"
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'KatachiApp/1.0'})
            with urllib.request.urlopen(req, timeout=15) as resp:
                return json.loads(resp.read().decode('utf-8'))
        except (urllib.error.URLError, TimeoutError) as e:
            print(f"  Retry {attempt+1}/3 for page {page}: {e}", file=sys.stderr)
            time.sleep(3)
    print(f"  FAILED to fetch page {page} after 3 attempts", file=sys.stderr)
    return None

def fetch_level(level):
    """Fetch all words for a JLPT level."""
    words = []
    page = 1
    while True:
        print(f"  Fetching {level} page {page}...", file=sys.stderr)
        data = fetch_page(level, page)
        if not data or not data.get('data'):
            break
        words.extend(data['data'])
        if len(data['data']) < 20:
            break
        page += 1
        time.sleep(REQUEST_DELAY)
    return words

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def build_entry(raw, level_str, used_ids):
    """Build a dictionary entry from a raw Jisho result. Returns None if not conjugatable."""
    classification = classify_entry(raw)
    if not classification:
        return None

    group, word_type = classification
    japanese = raw.get('japanese', [{}])[0]
    kana = japanese.get('reading', '')
    kanji = japanese.get('word', kana)

    if not kana:
        return None

    # Get English meaning from first sense
    meanings = []
    for sense in raw.get('senses', []):
        eng = sense.get('english_definitions', [])
        if eng:
            meanings.extend(eng[:2])
        if meanings:
            break
    meaning = '; '.join(meanings[:3]) if meanings else ''

    # For suru verbs, append する
    if group == 'suru':
        if not kana.endswith('する'):
            kana = kana + 'する'
        if not kanji.endswith('する'):
            kanji = kanji + 'する'

    # Compute conjugations
    try:
        if group == 'godan':
            stem = kana[:-1]
            ending = kana[-1]
            if ending not in GODAN_ROWS:
                return None
            conjugations = conjugate_godan(stem, ending, kana)
        elif group == 'ichidan':
            if not kana.endswith('る'):
                return None
            stem = kana[:-1]
            conjugations = conjugate_ichidan(stem)
        elif group == 'suru':
            prefix = kana[:-2]  # Remove する
            conjugations = conjugate_suru(prefix)
        elif group == 'kuru':
            prefix = kana[:-2] if kana.endswith('くる') and len(kana) > 2 else ''
            conjugations = conjugate_kuru(prefix)
        elif group == 'i-adj':
            if not kana.endswith('い'):
                return None
            conjugations = conjugate_i_adj(kana)
        elif group == 'na-adj':
            conjugations = conjugate_na_adj(kana)
        else:
            return None
    except Exception as e:
        print(f"  Conjugation error for {kanji} ({kana}): {e}", file=sys.stderr)
        return None

    # Build ID
    romaji = kana_to_romaji(kana)
    if word_type == 'verb':
        base_id = f"v_{romaji}"
    elif word_type == 'i-adj':
        base_id = f"ia_{romaji}"
    else:
        base_id = f"na_{romaji}"

    entry_id = base_id
    counter = 2
    while entry_id in used_ids:
        entry_id = f"{base_id}_{counter}"
        counter += 1
    used_ids.add(entry_id)

    return {
        'id': entry_id,
        'level': level_str,
        'group': group,
        'word_type': word_type,
        'dictionary_form': {
            'kanji': kanji,
            'kana': kana,
            'romaji': romaji,
        },
        'meaning': meaning,
        'conjugations': conjugations,
    }


def main():
    all_entries = []
    used_ids = set()
    seen_kana = set()  # Deduplicate by kana

    for level in LEVELS:
        level_str = level.upper()  # "N5", "N4", "N3"
        print(f"\n=== Fetching {level_str} ===", file=sys.stderr)
        raw_words = fetch_level(level)
        print(f"  Got {len(raw_words)} raw entries", file=sys.stderr)

        level_count = 0
        for raw in raw_words:
            japanese = raw.get('japanese', [{}])[0]
            kana = japanese.get('reading', '')
            kanji = japanese.get('word', kana)

            # Deduplicate
            dedup_key = kana or kanji
            # For suru verbs, check the する form
            classification = classify_entry(raw)
            if classification and classification[0] == 'suru':
                dedup_key = kana + 'する' if not kana.endswith('する') else kana

            if dedup_key in seen_kana:
                continue

            entry = build_entry(raw, level_str, used_ids)
            if entry:
                seen_kana.add(dedup_key)
                all_entries.append(entry)
                level_count += 1

        print(f"  Added {level_count} conjugatable entries for {level_str}", file=sys.stderr)

    # Write output
    output = {
        'version': '2.0',
        'words': all_entries,
    }

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\nTotal entries: {len(all_entries)}", file=sys.stderr)
    print(f"Written to {OUTPUT_FILE}", file=sys.stderr)

    # Summary by type
    by_type = {}
    by_level = {}
    for e in all_entries:
        by_type[e['word_type']] = by_type.get(e['word_type'], 0) + 1
        by_level[e['level']] = by_level.get(e['level'], 0) + 1

    print(f"\nBy word type: {by_type}", file=sys.stderr)
    print(f"By level: {by_level}", file=sys.stderr)


if __name__ == '__main__':
    main()
