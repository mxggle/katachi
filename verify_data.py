import json

def verify():
    with open("dictionary.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    
    words = {w["dictionary_form"]["kana"]: w for w in data["words"]}
    
    # Target words that are commonly conjugated incorrectly in automated scripts
    test_cases = [
        ("いく", "godan", "いって", "いかない"),       # Iku exception
        ("かえる", "godan", "かえって", "かえらない"), # Godan Ru-trap
        ("たべる", "ichidan", "たべて", "たべない"),   # Standard Ichidan
        ("くる", "kuru", "きて", "こない"),            # Irregular
        ("いい", "i-adj", "よくて", "よくない")        # Adjective exception
    ]
    
    print(f"{'Word':<10} | {'Group':<10} | {'Te-Form':<10} | {'Negative':<10} | {'Status'}")
    print("-" * 65)
    
    for kana, group, exp_te, exp_neg in test_cases:
        w = words.get(kana)
        if not w:
            print(f"{kana:<10} | {'MISSING':<10}")
            continue
            
        te = w["conjugations"].get("te_form", "")
        neg = w["conjugations"].get("negative_plain", "")
        
        is_correct = (te == exp_te and neg == exp_neg and w["group"] == group)
        status = "✅ PASS" if is_correct else "❌ FAIL"
        
        print(f"{kana:<10} | {w['group']:<10} | {te:<10} | {neg:<10} | {status}")
        if not is_correct:
            print(f"   Expected: {group:<10} | {exp_te:<10} | {exp_neg:<10}")

if __name__ == "__main__":
    verify()
