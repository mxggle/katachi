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
  modes: {
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
  whyN3: {
    heading: string;
    body1: string;
    body2: string;
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
}

export type LandingLanguage = 'en' | 'zh' | 'vi';

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
    modes: {
      heading: 'Three ways to practice',
      items: [
        {
          title: 'Daily Drill',
          description: 'A curated session generated automatically every day. Just open the app and go — no decisions needed.',
        },
        {
          title: 'Weakness Training',
          description: 'Katachi analyzes your mistakes and builds sessions that target your weakest forms. te-form trouble? You will get more te-form until it clicks.',
        },
        {
          title: 'Free Practice',
          description: 'Full control. Pick any level, word type, and conjugation form combination. Perfect for drilling a specific grammar point before a test.',
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
    whyN3: {
      heading: 'Why stop at N3?',
      body1: 'Katachi covers N5 through N3, but that is not because N2 and N1 are unimportant. It is the opposite — once you drill the fundamental conjugation patterns into muscle memory, advanced vocabulary is just a different stem with the same rules.',
      body2: 'This is not a vocabulary app. It is a conjugation drill tool. You do not need to memorize ten thousand words to master conjugation. You need repetition on the patterns until they become automatic, regardless of the word.',
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
    modes: {
      heading: '三种练习方式',
      items: [
        {
          title: '每日练习',
          description: '每天自动生成一套精选题目。打开应用直接开始——无需任何选择。',
        },
        {
          title: '弱点训练',
          description: 'Katachi 分析你的错误记录，针对你最薄弱的变形形式进行强化。て形总出错？系统会一直推送て形，直到你掌握为止。',
        },
        {
          title: '自由练习',
          description: '完全自定义。自由选择等级、词性和变形形式的任意组合。考前突击某个语法点的最佳选择。',
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
    whyN3: {
      heading: '为什么只到 N3？',
      body1: 'Katachi 覆盖 N5 到 N3 的核心变形，但这不是因为 N2、N1 不重要。恰恰相反——一旦你把基础变形练到本能反应，高级词汇的变形只是换了一个词干，规则是完全一样的。',
      body2: '这不是一个背单词的软件，它是一个练变形的工具。你不需要背一万个单词才能掌握变形。你需要的是对规则进行反复训练，直到它们成为本能，无论遇到什么词都能立刻反应。',
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
  },
  vi: {
    meta: {
      title: 'Katachi — Nắm vững chia động từ tiếng Nhật qua luyện tập hằng ngày | JLPT N5 & N4',
      description: 'Công cụ luyện tập chia động từ tiếng Nhật được tạo ra bởi người học, dành cho người học. Luyện tập động từ và tính từ với phân tích điểm yếu thông minh. Bao gồm các dạng ngữ pháp JLPT N5 & N4.',
    },
    hero: {
      h1: 'Ngừng bối rối khi chia động từ tiếng Nhật. Bắt đầu luyện tập ngay.',
      subtitle: 'Tôi tạo ra Katachi vì tôi liên tục bị kẹt — nhầm lẫn các thì, quên thể bị động, do dự với thể te. Công cụ này loại bỏ sự phân tâm và tập trung vào một điều duy nhất: lặp lại cho đến khi nhớ.',
      cta: 'Bắt đầu luyện tập',
      ctaLink: '/',
    },
    problem: {
      heading: 'Sự bực bội đã bắt đầu tất cả',
      body1: "Khi bạn đang đọc tiếng Nhật và gặp một động từ chia, mạch đọc bị gián đoạn. Đây là thể quá khứ lịch sự hay thông thường? Họ đã dùng thể bị động hay sai khiến? Đối với tôi, điều đó xảy ra liên tục — thể te là điểm yếu lớn nhất của tôi. Tôi biết thể từ điển, nhưng lúc cần kết nối, tôi lại đứng hình.",
      body2: 'Sách giáo khoa giải thích các quy tắc. Flashcard cho thấy đáp án. Nhưng không cái nào cung cấp cho bạn sự lặp lại mà bạn thực sự cần để việc chia từ trở thành phản xạ tự nhiên.',
    },
    features: {
      heading: 'Không thiết lập. Không phân tâm. Chỉ luyện tập.',
      items: [
        {
          title: 'Luyện tập không rào cản',
          description: 'Chọn cấp độ (N5, N4, hoặc N3), chọn loại động từ hoặc tính từ và bắt đầu. Hệ thống sẽ lo phần còn lại.',
        },
        {
          title: 'Phát hiện điểm yếu thông minh',
          description: "Gặp khó khăn với thể te? Hệ thống sẽ nhận ra và đưa ra nhiều bài tập thể te hơn. Bạn không cần tự theo dõi điểm yếu — Katachi làm điều đó cho bạn.",
        },
        {
          title: 'Chế độ luyện tập kép',
          description: 'Trắc nghiệm để nhận diện nhanh, Gõ chữ để chủ động nhớ lại. Chuyển đổi bất cứ lúc nào.',
        },
        {
          title: 'Chuỗi ngày học liên tục',
          description: 'Các phiên học ngắn, tập trung mà bạn thực sự có thể duy trì. Sự kiên trì chiến thắng cường độ.',
        },
      ],
    },
    modes: {
      heading: 'Ba cách để luyện tập',
      items: [
        {
          title: 'Luyện tập hằng ngày',
          description: 'Một phiên học được chọn lọc và tạo tự động mỗi ngày. Chỉ cần mở ứng dụng và học — không cần phải quyết định.',
        },
        {
          title: 'Huấn luyện điểm yếu',
          description: 'Katachi phân tích lỗi sai của bạn và xây dựng các phiên học nhắm vào những dạng yếu nhất. Khó khăn với thể te? Bạn sẽ nhận được nhiều thể te hơn cho đến khi thành thạo.',
        },
        {
          title: 'Luyện tập tự do',
          description: 'Kiểm soát hoàn toàn. Chọn bất kỳ sự kết hợp nào giữa cấp độ, loại từ và dạng chia. Hoàn hảo để luyện tập một điểm ngữ pháp cụ thể trước kỳ thi.',
        },
      ],
    },
    coverage: {
      heading: 'Mọi dạng chia bạn cần cho N5 & N4',
      verbs: {
        label: 'Động từ',
        list: 'Lịch sự (masu), Thông thường phủ định, Quá khứ thông thường/lịch sự, Thể te, Khả năng, Bị động, Sai khiến, Mệnh lệnh, Ý chí, Điều kiện (ba/tara)',
      },
      adjectives: {
        label: 'Tính từ',
        list: 'Các dạng tính từ đuôi i & đuôi na cho lịch sự, phủ định, quá khứ và điều kiện',
      },
    },
    whyN3: {
      heading: 'Tại sao dừng lại ở N3?',
      body1: 'Katachi bao phủ từ N5 đến N3, nhưng không phải vì N2 và N1 không quan trọng. Ngược lại — một khi bạn đã rèn luyện các mẫu chia từ cơ bản thành phản xạ cơ bắp, từ vựng nâng cao chỉ là một gốc từ khác với cùng một quy tắc.',
      body2: 'Đây không phải là một ứng dụng từ vựng. Nó là một công cụ luyện chia động từ. Bạn không cần phải ghi nhớ mười nghìn từ để làm chủ cách chia. Bạn cần sự lặp lại các mẫu chia cho đến khi chúng trở thành tự động, bất kể là từ nào.',
    },
    finalCta: {
      heading: 'Sẵn sàng để việc chia động từ trở nên tự động?',
      subtitle: 'Tham gia cùng hàng ngàn người học luyện ngữ pháp tiếng Nhật mỗi ngày. Miễn phí. Không cần đăng ký.',
      cta: 'Bắt đầu luyện tập ngay',
    },
    footer: {
      copyright: '© 2026 Katachi. Được tạo ra bởi người học tiếng Nhật, dành cho người học tiếng Nhật.',
      practiceLink: 'Ứng dụng luyện tập',
    },
  },
};

export function getLandingCopy(lang: LandingLanguage): LandingCopy {
  return landingCopy[lang];
}
