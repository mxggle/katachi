export interface LandingCopy {
  meta: {
    title: string;
    description: string;
  };
  hero: {
    h1: string;
    subtitle: string;
    cta: string;
    ctaLink: string;
  };
  problem: {
    heading: string;
    body1: string;
    body2: string;
  };
  features: {
    heading: string;
    items: Array<{
      title: string;
      description: string;
    }>;
  };
  coverage: {
    heading: string;
    verbs: {
      label: string;
      list: string;
    };
    adjectives: {
      label: string;
      list: string;
    };
  };
  finalCta: {
    heading: string;
    subtitle: string;
    cta: string;
  };
  footer: {
    copyright: string;
    practiceLink: string;
  };
  langSwitch: string;
  langParam: string;
}

export type LandingLanguage = 'en' | 'zh';

export const landingCopy: Record<LandingLanguage, LandingCopy> = {
  en: {
    meta: {
      title: 'Katachi — Master Japanese Conjugations Through Daily Practice | JLPT N5 & N4',
      description: 'A focused Japanese conjugation practice tool built by a learner, for learners. Drill verbs and adjectives with smart distractors and weakness tracking. Covers JLPT N5 & N4 grammar forms.',
    },
    hero: {
      h1: 'Stop freezing on Japanese conjugations. Start drilling them.',
      subtitle: 'I built Katachi because I kept getting stuck — mixing up tenses, forgetting passive forms, hesitating on te-form. This tool strips away the noise and focuses on one thing: repetition until it sticks.',
      cta: 'Start Practicing',
      ctaLink: '/',
    },
    problem: {
      heading: 'The frustration that started it all',
      body1: "When you're reading Japanese and hit a verb conjugation, the flow breaks. Is this past polite or plain? Did they use passive or causative? For me, it happened constantly — te-form was my biggest weakness. I'd know the dictionary form, but the moment I needed to connect it, I'd freeze.",
      body2: 'Textbooks explain the rules. Flashcards show the answers. But neither gives you the repetition you actually need to make conjugation automatic.',
    },
    features: {
      heading: 'No setup. No distraction. Just practice.',
      items: [
        {
          title: 'Zero-friction drilling',
          description: 'Pick a level (N5, N4, or N3), choose verb types or adjectives, and start. The system handles the rest.',
        },
        {
          title: 'Smart weakness detection',
          description: "Struggle with te-form? The system notices and surfaces more te-form practice. You don't have to track your weaknesses — Katachi does it for you.",
        },
        {
          title: 'Dual practice modes',
          description: 'Multiple Choice for quick recognition, Typing Mode for active recall. Switch anytime.',
        },
        {
          title: 'Daily streaks',
          description: 'Short, focused sessions you can actually maintain. Consistency beats intensity.',
        },
      ],
    },
    coverage: {
      heading: 'Every form you need for N5 & N4',
      verbs: {
        label: 'Verbs',
        list: 'Polite (masu), Plain negative, Past plain/polite, Te-form, Potential, Passive, Causative, Imperative, Volitional, Conditional (ba/tara)',
      },
      adjectives: {
        label: 'Adjectives',
        list: 'i-adjective & na-adjective forms for polite, negative, past, and conditional',
      },
    },
    finalCta: {
      heading: 'Ready to make conjugations automatic?',
      subtitle: 'Join thousands of learners drilling Japanese grammar every day. Free. No sign-up required.',
      cta: 'Start Practicing Now',
    },
    footer: {
      copyright: '© 2026 Katachi. Built by a Japanese learner, for Japanese learners.',
      practiceLink: 'Practice App',
    },
    langSwitch: 'Switch to 中文',
    langParam: 'zh',
  },
  zh: {
    meta: {
      title: 'Katachi — 日语变形练习工具 | 专注动词・形容词变形训练 | JLPT N5 & N4',
      description: '由日语学习者开发的变形练习工具。专注反复训练，智能识别薄弱环节（如て形、被动形），针对性强化。覆盖 JLPT N5 & N4 核心语法。',
    },
    hero: {
      h1: '日语变形总卡壳？那就练到形成肌肉记忆。',
      subtitle: '我在学日语时，时态总是搞混、被动形记不住、て形变到一半就愣住。所以我做了 Katachi —— 去掉一切干扰，只专注一件事：反复练习，直到变形成为本能。',
      cta: '开始练习',
      ctaLink: '/',
    },
    problem: {
      heading: '一切源于一个让人抓狂的瞬间',
      body1: '读日语的时候，遇到一个动词变形，整个节奏就断了。这是过去式还是现在式？是被动还是使役？对我来说，这种卡顿太常见了——尤其是て形，明明认识原形，一到变形就愣在那里。',
      body2: '课本会讲规则，单词卡会给你答案，但都没有提供真正让你形成本能的重复训练。',
    },
    features: {
      heading: '零配置、零干扰，只管练',
      items: [
        {
          title: '一键开始',
          description: '选择等级（N5、N4 或 N3），勾选动词或形容词类型，立刻开始。系统会自动整理题目。',
        },
        {
          title: '弱点智能追踪',
          description: 'て形总变错？系统会察觉并自动推送更多て形练习。你不用记录自己的薄弱环节——Katachi 帮你做。',
        },
        {
          title: '双模式训练',
          description: '选择题用于快速识别，输入题用于主动回忆。随时切换。',
        },
        {
          title: '每日连胜',
          description: '短时高效的练习，让你能真正坚持下去。持续胜过强度。',
        },
      ],
    },
    coverage: {
      heading: '覆盖 N5 & N4 全部核心变形',
      verbs: {
        label: '动词',
        list: 'ます形、ない形、た形/ました形、て形、可能形、受身形、使役形、命令形、意向形、条件形（ば/たら）',
      },
      adjectives: {
        label: '形容词',
        list: 'い形容词与な形容词的丁宁形、否定形、过去形、条件形',
      },
    },
    finalCta: {
      heading: '让变形成为你的本能',
      subtitle: '和数千名学习者一起，每天进行高效的日语变形训练。免费，无需注册。',
      cta: '立即开始练习',
    },
    footer: {
      copyright: '© 2026 Katachi. 由日语学习者打造，为日语学习者服务。',
      practiceLink: '练习应用',
    },
    langSwitch: 'Switch to English',
    langParam: 'en',
  },
};

export function getLandingCopy(lang: LandingLanguage): LandingCopy {
  return landingCopy[lang];
}
