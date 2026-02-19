import json

def conjugate_verb(word, group):
    kana = word['kana']
    stem = kana[:-1]
    last_char = kana[-1]
    
    conj = {}
    
    if group == 'ichidan':
        conj['polite'] = stem + "ます"
        conj['negative_plain'] = stem + "ない"
        conj['negative_polite'] = stem + "ません"
        conj['past_plain'] = stem + "た"
        conj['past_polite'] = stem + "ました"
        conj['past_negative_plain'] = stem + "なかった"
        conj['past_negative_polite'] = stem + "ませんでした"
        conj['te_form'] = stem + "て"
        conj['potential'] = stem + "られる"
        conj['passive'] = stem + "られる"
        conj['causative'] = stem + "させる"
        conj['causative_passive'] = stem + "させられる"
        conj['imperative'] = stem + "ろ"
        conj['volitional'] = stem + "よう"
        conj['conditional_ba'] = stem + "れば"
        conj['conditional_tara'] = stem + "たら"
    
    elif group == 'godan':
        # Godan stems (a, i, u, e, o)
        godan_map = {
            'う': ['わ', 'い', 'う', 'え', 'お'],
            'く': ['か', 'き', 'く', 'け', 'こ'],
            'ぐ': ['が', 'ぎ', 'ぐ', 'げ', 'ご'],
            'す': ['さ', 'し', 'す', 'せ', 'そ'],
            'つ': ['た', 'ち', 'つ', 'て', 'と'],
            'ぬ': ['な', 'に', 'ぬ', 'ね', 'の'],
            'ぶ': ['ば', 'び', 'ぶ', 'べ', 'ぼ'],
            'む': ['ま', 'み', 'む', 'め', 'も'],
            'る': ['ら', 'り', 'る', 'れ', 'ろ'],
        }
        
        a, i, u, e, o = godan_map[last_char]
        
        conj['polite'] = stem + i + "ます"
        conj['negative_plain'] = stem + a + "ない"
        conj['negative_polite'] = stem + i + "ません"
        
        # Te and Past depend on last char
        # Exception: iku
        if word['kana'] == 'いく':
            conj['te_form'] = "いって"
            conj['past_plain'] = "いった"
        elif last_char in 'うつる':
            conj['te_form'] = stem + "って"
            conj['past_plain'] = stem + "った"
        elif last_char in 'ぬぶむ':
            conj['te_form'] = stem + "んで"
            conj['past_plain'] = stem + "んだ"
        elif last_char == 'く':
            conj['te_form'] = stem + "いて"
            conj['past_plain'] = stem + "いた"
        elif last_char == 'ぐ':
            conj['te_form'] = stem + "いで"
            conj['past_plain'] = stem + "いだ"
        elif last_char == 'す':
            conj['te_form'] = stem + "して"
            conj['past_plain'] = stem + "した"

        conj['past_polite'] = stem + i + "ました"
        conj['past_negative_plain'] = stem + a + "なかった"
        conj['past_negative_polite'] = stem + i + "ませんでした"
        
        conj['potential'] = stem + e + "る"
        conj['passive'] = stem + a + "れる"
        conj['causative'] = stem + a + "せる"
        conj['causative_passive'] = stem + a + "せられる"
        conj['imperative'] = stem + e
        conj['volitional'] = stem + o + "う"
        conj['conditional_ba'] = stem + e + "ば"
        conj['conditional_tara'] = conj['past_plain'] + "ら"

    elif group == 'suru':
        conj = {
            "polite": "します", "negative_plain": "しない", "negative_polite": "しません",
            "past_plain": "した", "past_polite": "しました", "past_negative_plain": "しなかった",
            "past_negative_polite": "しませんでした", "te_form": "して", "potential": "できる",
            "passive": "される", "causative": "させる", "causative_passive": "させられる",
            "imperative": "しろ", "volitional": "しよう", "conditional_ba": "すれば", "conditional_tara": "したら"
        }
    elif group == 'kuru':
        conj = {
            "polite": "きます", "negative_plain": "こない", "negative_polite": "きません",
            "past_plain": "きた", "past_polite": "きました", "past_negative_plain": "こなかった",
            "past_negative_polite": "きませんでした", "te_form": "きて", "potential": "こられる",
            "passive": "こられる", "causative": "こさせる", "causative_passive": "こさせられる",
            "imperative": "こい", "volitional": "こよう", "conditional_ba": "くれば", "conditional_tara": "きたら"
        }
        
    return conj

def conjugate_adj(word, group):
    kana = word['kana']
    conj = {}
    if group == 'i-adj':
        # Exception: ii (good) uses 'yoi' for conjugations
        working_kana = "よい" if kana == "いい" else kana
        stem = working_kana[:-1]
        conj['polite'] = kana + "です"
        conj['negative_plain'] = stem + "くない"
        conj['negative_polite'] = stem + "くないです"
        conj['past_plain'] = stem + "かった"
        conj['past_polite'] = stem + "かったです"
        conj['past_negative_plain'] = stem + "くなかった"
        conj['past_negative_polite'] = stem + "くなかったです"
        conj['te_form'] = stem + "くて"
    elif group == 'na-adj':
        conj['polite'] = kana + "です"
        conj['negative_plain'] = kana + "じゃない"
        conj['negative_polite'] = kana + "じゃありません"
        conj['past_plain'] = kana + "だった"
        conj['past_polite'] = kana + "でした"
        conj['past_negative_plain'] = kana + "じゃなかった"
        conj['past_negative_polite'] = kana + "じゃありませんでした"
        conj['te_form'] = kana + "で"
    return conj

# Define words
verbs_n5 = [
    ("食べる", "たべる", "taberu", "to eat", "ichidan"),
    ("飲む", "のむ", "nomu", "to drink", "godan"),
    ("行く", "いく", "iku", "to go", "godan"),
    ("来る", "くる", "kuru", "to come", "kuru"),
    ("する", "する", "suru", "to do", "suru"),
    ("書く", "かく", "kaku", "to write", "godan"),
    ("読む", "よむ", "yomu", "to read", "godan"),
    ("話す", "はなす", "hanasu", "to speak", "godan"),
    ("聞く", "きく", "kiku", "to listen/ask", "godan"),
    ("見る", "みる", "miru", "to see", "ichidan"),
    ("寝る", "ねる", "neru", "to sleep", "ichidan"),
    ("起きる", "おきる", "okiru", "to wake up", "ichidan"),
    ("帰る", "かえる", "kaeru", "to return home", "godan"), # Godan Ru trap
    ("買う", "かう", "kau", "to buy", "godan"),
    ("会う", "あう", "au", "to meet", "godan"),
    ("待つ", "まつ", "matsu", "to wait", "godan"),
    ("持つ", "もつ", "motsu", "to hold", "godan"),
    ("死ぬ", "しぬ", "shinu", "to die", "godan"),
    ("飛ぶ", "とぶ", "tobu", "to fly", "godan"),
    ("呼ぶ", "よぶ", "yobu", "to call", "godan"),
    ("泳ぐ", "およぐ", "oyogu", "to swim", "godan"),
    ("遊ぶ", "あそぶ", "asobu", "to play", "godan"),
]

adjs_n5 = [
    ("高い", "たかい", "takai", "expensive/high", "i-adj"),
    ("安い", "やすい", "yasui", "cheap", "i-adj"),
    ("大きい", "おおきい", "ookii", "big", "i-adj"),
    ("小さい", "ちいさい", "chiisai", "small", "i-adj"),
    ("新しい", "あたらしい", "atarashii", "new", "i-adj"),
    ("古い", "ふるい", "furui", "old", "i-adj"),
    ("いい", "いい", "ii", "good", "i-adj"), # Special exception
    ("静か", "しずか", "shizuka", "quiet", "na-adj"),
    ("賑やか", "にぎやか", "nigiyaka", "lively", "na-adj"),
    ("綺麗", "きれい", "kirei", "beautiful/clean", "na-adj"),
    ("有名", "ゆうめい", "yuumei", "famous", "na-adj"),
]

# N4 additions
verbs_n4 = [
    ("教える", "おしえる", "oshieru", "to teach", "ichidan"),
    ("覚える", "おぼえる", "oboeru", "to remember", "ichidan"),
    ("考える", "かんがえる", "kangaeru", "to think", "ichidan"),
    ("決める", "きめる", "kimeru", "to decide", "ichidan"),
    ("調べる", "しらべる", "shiraberu", "to investigate", "ichidan"),
    ("忘れる", "わすれる", "wasureru", "to forget", "ichidan"),
    ("笑う", "わらう", "warau", "to laugh", "godan"),
    ("怒る", "おこる", "okoru", "to get angry", "godan"),
    ("頼む", "たのむ", "tanomu", "to request", "godan"),
    ("頑張る", "がんばる", "ganbaru", "to do one's best", "godan"),
]

words_list = []

for kanji, kana, romaji, meaning, group in verbs_n5:
    w = {
        "id": f"v_{romaji}", "level": "N5", "group": group,
        "dictionary_form": {"kanji": kanji, "kana": kana, "romaji": romaji},
        "meaning": meaning,
        "conjugations": conjugate_verb({"kana": kana}, group)
    }
    words_list.append(w)

for kanji, kana, romaji, meaning, group in adjs_n5:
    w = {
        "id": f"a_{romaji}", "level": "N5", "group": group,
        "dictionary_form": {"kanji": kanji, "kana": kana, "romaji": romaji},
        "meaning": meaning,
        "conjugations": conjugate_adj({"kana": kana}, group)
    }
    words_list.append(w)

for kanji, kana, romaji, meaning, group in verbs_n4:
    w = {
        "id": f"v_{romaji}", "level": "N4", "group": group,
        "dictionary_form": {"kanji": kanji, "kana": kana, "romaji": romaji},
        "meaning": meaning,
        "conjugations": conjugate_verb({"kana": kana}, group)
    }
    words_list.append(w)

output = {
    "version": "1.0",
    "words": words_list
}

with open("dictionary.json", "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"Generated dictionary.json with {len(words_list)} words.")
