import type { Language } from '@/lib/i18n';
import type { WordGroup } from '@/lib/distractorEngine';
import type { FormulaRow, RuleFormula } from '@/lib/conjugationGuide';

export interface ConjugationGuideCopy {
  pageEyebrow: string;
  pageTitle: string;
  pageIntro: string;
  backToPractice: string;
  quickStartTitle: string;
  quickStartSteps: readonly [string, string, string];
  chooseForm: string;
  verbForms: string;
  adjectiveForms: string;
  tapForRules: string;
  close: string;
  currentRule: string;
  currentWord: string;
  allRules: string;
  viewFullGuide: string;
  pattern: string;
  example: string;
  homeCardTitle: string;
  homeCardDescription: string;
  groups: Record<WordGroup, string>;
  formula: {
    finalKana: string;
    changeTo: string;
    rows: Record<FormulaRow, string>;
    dropFinalRu: string;
    replaceFinalI: string;
    keepDictionaryForm: string;
    dictionaryForm: string;
    pastPlain: string;
    uToWa: string;
  };
  notes: {
    godanSoundChange: string;
    iiAdjective: string;
  };
}

export const conjugationGuideTranslations = {
  en: {
    pageEyebrow: 'Katachi rule book',
    pageTitle: 'Japanese conjugation guide',
    pageIntro: 'Choose a form, identify the word class, and follow the matching pattern. Every example uses the same rules as Katachi practice.',
    backToPractice: 'Back to practice',
    quickStartTitle: 'How to use this guide',
    quickStartSteps: [
      'Identify the word: Godan, Ichidan, irregular verb, い-adjective, or な-adjective.',
      'Choose the formation you want to make.',
      'Apply the matching pattern and check the example.',
    ],
    chooseForm: 'Choose a formation',
    verbForms: 'Verb formations',
    adjectiveForms: 'Adjective formations',
    tapForRules: 'Show the conjugation rule',
    close: 'Close',
    currentRule: 'Rule for this word',
    currentWord: 'Current word',
    allRules: 'Rules for every word class',
    viewFullGuide: 'Open the full conjugation guide',
    pattern: 'Pattern',
    example: 'Example',
    homeCardTitle: 'Conjugation guide',
    homeCardDescription: 'Learn the rule for every form and word class.',
    groups: {
      godan: 'Godan verb (う-verb)',
      ichidan: 'Ichidan verb (る-verb)',
      suru: 'する verb (irregular)',
      kuru: '来る (irregular)',
      'i-adj': 'い-adjective',
      'na-adj': 'な-adjective',
    },
    formula: {
      finalKana: 'final kana',
      changeTo: 'change to',
      rows: { a: 'あ-row', i: 'い-row', e: 'え-row', o: 'お-row' },
      dropFinalRu: 'drop the final る',
      replaceFinalI: 'replace the final い',
      keepDictionaryForm: 'keep the dictionary form',
      dictionaryForm: 'dictionary form',
      pastPlain: 'plain past form',
      uToWa: 'う changes to わ',
    },
    notes: {
      godanSoundChange: 'Godan sound change: う・つ・る → って／った, ぬ・ぶ・む → んで／んだ, く → いて／いた, ぐ → いで／いだ, す → して／した. 行く is the exception: 行って／行った.',
      iiAdjective: 'Exception: いい／よい uses the よ- stem: よくない, よかった, よくて, よければ.',
    },
  },
  zh: {
    pageEyebrow: 'Katachi 变形规则手册',
    pageTitle: '日语变形指南',
    pageIntro: '选择变形，判断词类，然后套用对应规则。这里的例子与 Katachi 练习使用完全相同的规则。',
    backToPractice: '返回练习',
    quickStartTitle: '如何使用本指南',
    quickStartSteps: [
      '先判断词类：五段、一段、不规则动词、い形容词或な形容词。',
      '选择想要变化的形式。',
      '套用对应规则，并用例子检查。',
    ],
    chooseForm: '选择变形',
    verbForms: '动词变形',
    adjectiveForms: '形容词变形',
    tapForRules: '查看变形规则',
    close: '关闭',
    currentRule: '当前单词的规则',
    currentWord: '当前单词',
    allRules: '各词类的规则',
    viewFullGuide: '打开完整变形指南',
    pattern: '规则',
    example: '例子',
    homeCardTitle: '变形指南',
    homeCardDescription: '学习每种变形与词类的变化规则。',
    groups: {
      godan: '五段动词（う动词）',
      ichidan: '一段动词（る动词）',
      suru: 'する动词（不规则）',
      kuru: '来る（不规则）',
      'i-adj': 'い形容词',
      'na-adj': 'な形容词',
    },
    formula: {
      finalKana: '词尾假名',
      changeTo: '变为',
      rows: { a: 'あ段', i: 'い段', e: 'え段', o: 'お段' },
      dropFinalRu: '去掉末尾的る',
      replaceFinalI: '替换末尾的い',
      keepDictionaryForm: '保留原形',
      dictionaryForm: '原形',
      pastPlain: '普通体过去式',
      uToWa: 'う要变为わ',
    },
    notes: {
      godanSoundChange: '五段音便：う・つ・る → って／った，ぬ・ぶ・む → んで／んだ，く → いて／いた，ぐ → いで／いだ，す → して／した。行く是例外：行って／行った。',
      iiAdjective: '例外：いい／よい使用「よ-」词干：よくない、よかった、よくて、よければ。',
    },
  },
  vi: {
    pageEyebrow: 'Sổ tay quy tắc Katachi',
    pageTitle: 'Hướng dẫn chia dạng tiếng Nhật',
    pageIntro: 'Chọn dạng, xác định loại từ rồi áp dụng đúng công thức. Mọi ví dụ dùng cùng quy tắc với phần luyện tập Katachi.',
    backToPractice: 'Quay lại luyện tập',
    quickStartTitle: 'Cách dùng hướng dẫn',
    quickStartSteps: [
      'Xác định loại từ: động từ Godan, Ichidan, bất quy tắc, tính từ い hoặc tính từ な.',
      'Chọn dạng bạn muốn biến đổi.',
      'Áp dụng đúng công thức và kiểm tra bằng ví dụ.',
    ],
    chooseForm: 'Chọn dạng biến đổi',
    verbForms: 'Các dạng động từ',
    adjectiveForms: 'Các dạng tính từ',
    tapForRules: 'Xem quy tắc biến đổi',
    close: 'Đóng',
    currentRule: 'Quy tắc cho từ này',
    currentWord: 'Từ hiện tại',
    allRules: 'Quy tắc cho mọi loại từ',
    viewFullGuide: 'Mở toàn bộ hướng dẫn chia dạng',
    pattern: 'Công thức',
    example: 'Ví dụ',
    homeCardTitle: 'Hướng dẫn chia dạng',
    homeCardDescription: 'Học quy tắc cho từng dạng và từng loại từ.',
    groups: {
      godan: 'Động từ Godan (động từ う)',
      ichidan: 'Động từ Ichidan (động từ る)',
      suru: 'Động từ する (bất quy tắc)',
      kuru: '来る (bất quy tắc)',
      'i-adj': 'Tính từ い',
      'na-adj': 'Tính từ な',
    },
    formula: {
      finalKana: 'kana cuối',
      changeTo: 'đổi sang',
      rows: { a: 'hàng あ', i: 'hàng い', e: 'hàng え', o: 'hàng お' },
      dropFinalRu: 'bỏ る cuối',
      replaceFinalI: 'thay い cuối',
      keepDictionaryForm: 'giữ nguyên dạng từ điển',
      dictionaryForm: 'dạng từ điển',
      pastPlain: 'dạng quá khứ thường',
      uToWa: 'う đổi thành わ',
    },
    notes: {
      godanSoundChange: 'Biến âm Godan: う・つ・る → って／った, ぬ・ぶ・む → んで／んだ, く → いて／いた, ぐ → いで／いだ, す → して／した. 行く là ngoại lệ: 行って／行った.',
      iiAdjective: 'Ngoại lệ: いい／よい dùng thân よ-: よくない, よかった, よくて, よければ.',
    },
  },
  ne: {
    pageEyebrow: 'Katachi नियम पुस्तिका',
    pageTitle: 'जापानी रूप परिवर्तन मार्गदर्शिका',
    pageIntro: 'एउटा रूप छान्नुहोस्, शब्दको वर्ग पहिचान गर्नुहोस् र मिल्ने ढाँचा प्रयोग गर्नुहोस्। सबै उदाहरण Katachi अभ्यासकै नियममा आधारित छन्।',
    backToPractice: 'अभ्यासमा फर्कनुहोस्',
    quickStartTitle: 'यो मार्गदर्शिका कसरी प्रयोग गर्ने',
    quickStartSteps: [
      'शब्दको प्रकार पहिचान गर्नुहोस्: Godan, Ichidan, अनियमित क्रिया, い-विशेषण वा な-विशेषण।',
      'बनाउन चाहेको रूप छान्नुहोस्।',
      'मिल्ने ढाँचा लगाएर उदाहरणसँग जाँच्नुहोस्।',
    ],
    chooseForm: 'रूप छान्नुहोस्',
    verbForms: 'क्रियाका रूपहरू',
    adjectiveForms: 'विशेषणका रूपहरू',
    tapForRules: 'रूप परिवर्तन नियम हेर्नुहोस्',
    close: 'बन्द गर्नुहोस्',
    currentRule: 'यस शब्दको नियम',
    currentWord: 'हालको शब्द',
    allRules: 'सबै शब्द वर्गका नियमहरू',
    viewFullGuide: 'पूर्ण रूप परिवर्तन मार्गदर्शिका खोल्नुहोस्',
    pattern: 'ढाँचा',
    example: 'उदाहरण',
    homeCardTitle: 'रूप परिवर्तन मार्गदर्शिका',
    homeCardDescription: 'हरेक रूप र शब्द वर्गको नियम सिक्नुहोस्।',
    groups: {
      godan: 'Godan क्रिया (う-क्रिया)',
      ichidan: 'Ichidan क्रिया (る-क्रिया)',
      suru: 'する क्रिया (अनियमित)',
      kuru: '来る (अनियमित)',
      'i-adj': 'い-विशेषण',
      'na-adj': 'な-विशेषण',
    },
    formula: {
      finalKana: 'अन्तिम काना',
      changeTo: 'यसमा बदल्नुहोस्',
      rows: { a: 'あ-पङ्क्ति', i: 'い-पङ्क्ति', e: 'え-पङ्क्ति', o: 'お-पङ्क्ति' },
      dropFinalRu: 'अन्तिम る हटाउनुहोस्',
      replaceFinalI: 'अन्तिम い बदल्नुहोस्',
      keepDictionaryForm: 'शब्दकोश रूप जस्ताको तस्तै राख्नुहोस्',
      dictionaryForm: 'शब्दकोश रूप',
      pastPlain: 'साधारण भूतकाल रूप',
      uToWa: 'う लाई わ मा बदल्नुहोस्',
    },
    notes: {
      godanSoundChange: 'Godan ध्वनि परिवर्तन: う・つ・る → って／った, ぬ・ぶ・む → んで／んだ, く → いて／いた, ぐ → いで／いだ, す → して／した। 行く अपवाद हो: 行って／行った।',
      iiAdjective: 'अपवाद: いい／よい ले よ- मूल प्रयोग गर्छ: よくない, よかった, よくて, よければ।',
    },
  },
  my: {
    pageEyebrow: 'Katachi စည်းမျဉ်းစာအုပ်',
    pageTitle: 'ဂျပန်စကားလုံးပုံစံပြောင်း လမ်းညွှန်',
    pageIntro: 'ပုံစံတစ်ခုရွေး၊ စကားလုံးအမျိုးအစားကိုသတ်မှတ်ပြီး ကိုက်ညီသောစည်းမျဉ်းကိုသုံးပါ။ ဥပမာအားလုံးသည် Katachi လေ့ကျင့်ခန်းနှင့်တူညီသောစည်းမျဉ်းများကို သုံးထားသည်။',
    backToPractice: 'လေ့ကျင့်ခန်းသို့ ပြန်ရန်',
    quickStartTitle: 'ဤလမ်းညွှန်ကို အသုံးပြုပုံ',
    quickStartSteps: [
      'Godan၊ Ichidan၊ မမှန်ကြိယာ၊ い-နာမဝိသေသန သို့မဟုတ် な-နာမဝိသေသနဟု စကားလုံးအမျိုးအစားကို သတ်မှတ်ပါ။',
      'ပြောင်းလိုသည့်ပုံစံကို ရွေးပါ။',
      'ကိုက်ညီသောစည်းမျဉ်းကိုသုံးပြီး ဥပမာနှင့်စစ်ပါ။',
    ],
    chooseForm: 'ပုံစံရွေးပါ',
    verbForms: 'ကြိယာပုံစံများ',
    adjectiveForms: 'နာမဝိသေသနပုံစံများ',
    tapForRules: 'ပုံစံပြောင်းစည်းမျဉ်းကိုကြည့်ရန်',
    close: 'ပိတ်ရန်',
    currentRule: 'ဤစကားလုံးအတွက် စည်းမျဉ်း',
    currentWord: 'လက်ရှိစကားလုံး',
    allRules: 'စကားလုံးအမျိုးအစားအားလုံးအတွက် စည်းမျဉ်းများ',
    viewFullGuide: 'ပုံစံပြောင်းလမ်းညွှန်အပြည့်အစုံကို ဖွင့်ရန်',
    pattern: 'စည်းမျဉ်း',
    example: 'ဥပမာ',
    homeCardTitle: 'ပုံစံပြောင်းလမ်းညွှန်',
    homeCardDescription: 'ပုံစံနှင့် စကားလုံးအမျိုးအစားတိုင်းအတွက် စည်းမျဉ်းကို လေ့လာပါ။',
    groups: {
      godan: 'Godan ကြိယာ (う-ကြိယာ)',
      ichidan: 'Ichidan ကြိယာ (る-ကြိယာ)',
      suru: 'する ကြိယာ (မမှန်)',
      kuru: '来る (မမှန်)',
      'i-adj': 'い-နာမဝိသေသန',
      'na-adj': 'な-နာမဝိသေသန',
    },
    formula: {
      finalKana: 'နောက်ဆုံး kana',
      changeTo: 'သို့ပြောင်းရန်',
      rows: { a: 'あ-တန်း', i: 'い-တန်း', e: 'え-တန်း', o: 'お-တန်း' },
      dropFinalRu: 'နောက်ဆုံး る ကိုဖြုတ်ရန်',
      replaceFinalI: 'နောက်ဆုံး い ကိုအစားထိုးရန်',
      keepDictionaryForm: 'အဘိဓာန်ပုံစံကို မပြောင်းဘဲထားရန်',
      dictionaryForm: 'အဘိဓာန်ပုံစံ',
      pastPlain: 'ရိုးရိုးအတိတ်ပုံစံ',
      uToWa: 'う ကို わ သို့ပြောင်းရန်',
    },
    notes: {
      godanSoundChange: 'Godan အသံပြောင်းမှု: う・つ・る → って／った, ぬ・ぶ・む → んで／んだ, く → いて／いた, ぐ → いで／いだ, す → して／した။ 行く သည်ခြွင်းချက်: 行って／行った။',
      iiAdjective: 'ခြွင်းချက်: いい／よい သည် よ- အရင်းကိုသုံးသည်: よくない, よかった, よくて, よければ။',
    },
  },
  ko: {
    pageEyebrow: 'Katachi 활용 규칙집',
    pageTitle: '일본어 활용 가이드',
    pageIntro: '활용형을 고르고 품사를 확인한 뒤 알맞은 규칙을 적용하세요. 모든 예시는 Katachi 연습과 동일한 규칙을 사용합니다.',
    backToPractice: '연습으로 돌아가기',
    quickStartTitle: '가이드 사용법',
    quickStartSteps: [
      '단어가 5단, 1단, 불규칙 동사, い형용사, な형용사 중 무엇인지 확인합니다.',
      '만들고 싶은 활용형을 고릅니다.',
      '알맞은 규칙을 적용하고 예시로 확인합니다.',
    ],
    chooseForm: '활용형 선택',
    verbForms: '동사 활용형',
    adjectiveForms: '형용사 활용형',
    tapForRules: '활용 규칙 보기',
    close: '닫기',
    currentRule: '이 단어의 규칙',
    currentWord: '현재 단어',
    allRules: '모든 품사의 규칙',
    viewFullGuide: '전체 활용 가이드 열기',
    pattern: '규칙',
    example: '예시',
    homeCardTitle: '활용 가이드',
    homeCardDescription: '모든 활용형과 품사의 변화 규칙을 익히세요.',
    groups: {
      godan: '5단 동사 (う동사)',
      ichidan: '1단 동사 (る동사)',
      suru: 'する 동사 (불규칙)',
      kuru: '来る (불규칙)',
      'i-adj': 'い형용사',
      'na-adj': 'な형용사',
    },
    formula: {
      finalKana: '마지막 가나',
      changeTo: '다음으로 변경',
      rows: { a: 'あ단', i: 'い단', e: 'え단', o: 'お단' },
      dropFinalRu: '마지막 る 제거',
      replaceFinalI: '마지막 い 교체',
      keepDictionaryForm: '사전형 유지',
      dictionaryForm: '사전형',
      pastPlain: '보통체 과거형',
      uToWa: 'う는 わ로 변경',
    },
    notes: {
      godanSoundChange: '5단 음편: う・つ・る → って／った, ぬ・ぶ・む → んで／んだ, く → いて／いた, ぐ → いで／いだ, す → して／した. 行く는 예외로 行って／行った가 됩니다.',
      iiAdjective: '예외: いい／よい는 よ- 어간을 사용합니다: よくない, よかった, よくて, よければ.',
    },
  },
} satisfies Record<Language, ConjugationGuideCopy>;

export function getConjugationGuideCopy(language: Language): ConjugationGuideCopy {
  return conjugationGuideTranslations[language];
}

export function formatRuleFormula(
  formula: RuleFormula,
  copy: ConjugationGuideCopy['formula']
): string {
  switch (formula.kind) {
    case 'godan-row': {
      const suffix = formula.suffix ? ` + ${formula.suffix}` : '';
      const exception = formula.uToWa ? `（${copy.uToWa}）` : '';
      return `${copy.finalKana} → ${copy.changeTo} ${copy.rows[formula.row]}${suffix} ${exception}`.trim();
    }
    case 'godan-sound-change':
      return formula.result === 'te'
        ? 'う・つ・る → って ／ ぬ・ぶ・む → んで ／ く → いて ／ ぐ → いで ／ す → して'
        : 'う・つ・る → った ／ ぬ・ぶ・む → んだ ／ く → いた ／ ぐ → いだ ／ す → した';
    case 'drop-ru':
      return `${copy.dropFinalRu} + ${formula.suffix}`;
    case 'replace-i':
      return `${copy.replaceFinalI} → ${formula.suffix}`;
    case 'keep':
      return `${copy.keepDictionaryForm} + ${formula.suffix}`;
    case 'append':
      return `${copy.dictionaryForm} + ${formula.suffix}`;
    case 'past-plus-ra':
      return `${copy.pastPlain} + ら`;
    case 'fixed':
      return `${formula.before} → ${formula.after}`;
  }
}
