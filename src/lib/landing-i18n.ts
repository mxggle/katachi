export interface LandingCopy {
  meta: {
    title: string;
    description: string;
  };
  hero: {
    eyebrow: string;
    h1: string;
    subtitle: string;
    cta: string;
    ctaLink: string;
    proof: string[];
  };
  drillPanel: {
    label: string;
    promptLabel: string;
    prompt: string;
    targetLabel: string;
    target: string;
    choices: string[];
    helper: string;
    stats: Array<{
      value: string;
      label: string;
    }>;
  };
  trainingStats: Array<{
    value: string;
    label: string;
  }>;
  sectionLabels: {
    problem: string;
    modes: string;
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
    intro: string;
    items: Array<{
      modeIndex: string;
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

export type LandingLanguage = 'en' | 'zh' | 'vi' | 'ne' | 'my';

export const landingCopy: Record<LandingLanguage, LandingCopy> = {
  en: {
    meta: {
      title: 'Katachi — Master Japanese Conjugations Through Daily Practice | JLPT N5 & N4',
      description: 'A focused Japanese conjugation practice tool built by a learner, for learners. Drill verbs and adjectives with smart distractors and weakness tracking. Covers JLPT N5 & N4 grammar forms.',
    },
    hero: {
      eyebrow: 'Conjugation Lab',
      h1: 'Build Japanese conjugations into muscle memory.',
      subtitle: 'Katachi focuses on one skill: turning Japanese verb and adjective conjugation into fast, reliable recall through short drills, smart distractors, and targeted repetition.',
      cta: 'Start Practicing',
      ctaLink: '/',
      proof: ['Free practice', 'No sign-up required', 'JLPT N5-N3 patterns'],
    },
    drillPanel: {
      label: 'Live drill preview',
      promptLabel: 'Dictionary form',
      prompt: '泳ぐ',
      targetLabel: 'Make the te-form',
      target: 'Which answer connects the sentence correctly?',
      choices: ['泳いで', '泳って', '泳んで'],
      helper: 'The distractors are intentionally close, so each round gives you the repetition you need to make the form automatic.',
      stats: [
        { value: '12', label: 'prompts' },
        { value: '4', label: 'forms mixed' },
        { value: '1', label: 'weak spot surfaced' },
      ],
    },
    trainingStats: [
      { value: 'N5-N3', label: 'levels covered' },
      { value: '2', label: 'practice modes' },
      { value: '0', label: 'setup required' },
    ],
    sectionLabels: {
      problem: 'Why it matters',
      modes: 'Practice setup',
    },
    problem: {
      heading: 'Why conjugation needs focused practice',
      body1: 'Many learners understand conjugation rules in isolation, but still hesitate when a sentence requires the right form: past, negative, te-form, potential, passive, causative, or conditional.',
      body2: 'Textbooks explain the rules. Flashcards show the answers. Katachi gives you the focused repetition you need to make conjugation automatic.',
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
      intro: 'Choose a ready-made session, target your weak spots, or take full control when you want to drill a specific grammar point.',
      items: [
        {
          modeIndex: '01',
          title: 'Daily Drill',
          description: 'A curated session generated automatically every day. Just open the app and go — no decisions needed.',
        },
        {
          modeIndex: '02',
          title: 'Weakness Training',
          description: 'Katachi analyzes your mistakes and builds sessions that target your weakest forms. te-form trouble? You will get more te-form until it clicks.',
        },
        {
          modeIndex: '03',
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
      heading: 'Ready to build conjugations into muscle memory?',
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
      eyebrow: 'Conjugation Lab',
      h1: '把日语变形练成肌肉记忆',
      subtitle: 'Katachi 专注于一件事：通过短时高频练习、智能干扰项和薄弱点追踪，帮助学习者把日语动词与形容词变形练到快速、稳定、自然。',
      cta: '开始练习',
      ctaLink: '/',
      proof: ['免费练习', '无需注册', '覆盖 JLPT N5-N3 核心模式'],
    },
    drillPanel: {
      label: '练习预览',
      promptLabel: '辞书形',
      prompt: '泳ぐ',
      targetLabel: '变成て形',
      target: '哪一个答案能正确连接句子？',
      choices: ['泳いで', '泳って', '泳んで'],
      helper: '干扰项会尽量贴近常见错误，让每一轮练习都真正提供让变形形成本能的重复训练。',
      stats: [
        { value: '12', label: '题' },
        { value: '4', label: '混合形式' },
        { value: '1', label: '薄弱点浮现' },
      ],
    },
    trainingStats: [
      { value: 'N5-N3', label: '覆盖等级' },
      { value: '2', label: '练习模式' },
      { value: '0', label: '开始前配置' },
    ],
    sectionLabels: {
      problem: '为什么会卡住',
      modes: '练习设置',
    },
    problem: {
      heading: '为什么变形需要专项训练',
      body1: '很多学习者能理解变形规则，但在阅读或输出时遇到具体形式，仍然会停顿：过去式、否定形、て形、可能形、被动形、使役形或条件形。',
      body2: '课本会讲规则，单词卡会给你答案。Katachi 提供的是针对变形本身的重复训练，帮助你把规则练到自动反应。',
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
      intro: '你可以直接开始每日练习，也可以针对薄弱点强化，或自由选择某个语法点反复训练。',
      items: [
        {
          modeIndex: '01',
          title: '每日练习',
          description: '每天自动生成一套精选题目。打开应用直接开始——无需任何选择。',
        },
        {
          modeIndex: '02',
          title: '弱点训练',
          description: 'Katachi 分析你的错误记录，针对你最薄弱的变形形式进行强化。て形总出错？系统会一直推送て形，直到你掌握为止。',
        },
        {
          modeIndex: '03',
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
      heading: '把日语变形练成肌肉记忆',
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
      eyebrow: 'Conjugation Lab',
      h1: 'Luyện chia động từ tiếng Nhật thành phản xạ.',
      subtitle: 'Katachi tập trung vào một kỹ năng: biến việc chia động từ và tính từ tiếng Nhật thành phản xạ nhanh, ổn định thông qua phiên luyện ngắn, đáp án gây nhiễu thông minh và lặp lại có mục tiêu.',
      cta: 'Bắt đầu luyện tập',
      ctaLink: '/',
      proof: ['Miễn phí', 'Không cần đăng ký', 'Mẫu JLPT N5-N3'],
    },
    drillPanel: {
      label: 'Xem trước bài luyện',
      promptLabel: 'Thể từ điển',
      prompt: '泳ぐ',
      targetLabel: 'Chuyển sang thể te',
      target: 'Đáp án nào nối câu chính xác?',
      choices: ['泳いで', '泳って', '泳んで'],
      helper: 'Các đáp án gây nhiễu được đặt gần với lỗi thường gặp, để mỗi vòng luyện tập tạo ra sự lặp lại bạn cần.',
      stats: [
        { value: '12', label: 'câu hỏi' },
        { value: '4', label: 'dạng trộn' },
        { value: '1', label: 'điểm yếu hiện ra' },
      ],
    },
    trainingStats: [
      { value: 'N5-N3', label: 'cấp độ bao phủ' },
      { value: '2', label: 'chế độ luyện tập' },
      { value: '0', label: 'thiết lập cần thiết' },
    ],
    sectionLabels: {
      problem: 'Vì sao bị kẹt',
      modes: 'Thiết lập luyện tập',
    },
    problem: {
      heading: 'Vì sao chia từ cần luyện tập riêng',
      body1: 'Nhiều người học hiểu quy tắc chia từ khi học riêng lẻ, nhưng vẫn do dự khi câu cần đúng dạng: quá khứ, phủ định, thể te, khả năng, bị động, sai khiến hoặc điều kiện.',
      body2: 'Sách giáo khoa giải thích quy tắc. Flashcard cho thấy đáp án. Katachi cung cấp sự lặp lại tập trung để việc chia từ trở thành phản xạ tự nhiên.',
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
      intro: 'Chọn một phiên học có sẵn, luyện điểm yếu, hoặc tự kiểm soát khi bạn muốn luyện một điểm ngữ pháp cụ thể.',
      items: [
        {
          modeIndex: '01',
          title: 'Luyện tập hằng ngày',
          description: 'Một phiên học được chọn lọc và tạo tự động mỗi ngày. Chỉ cần mở ứng dụng và học — không cần phải quyết định.',
        },
        {
          modeIndex: '02',
          title: 'Huấn luyện điểm yếu',
          description: 'Katachi phân tích lỗi sai của bạn và xây dựng các phiên học nhắm vào những dạng yếu nhất. Khó khăn với thể te? Bạn sẽ nhận được nhiều thể te hơn cho đến khi thành thạo.',
        },
        {
          modeIndex: '03',
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
      heading: 'Sẵn sàng luyện chia động từ thành phản xạ?',
      subtitle: 'Tham gia cùng hàng ngàn người học luyện ngữ pháp tiếng Nhật mỗi ngày. Miễn phí. Không cần đăng ký.',
      cta: 'Bắt đầu luyện tập ngay',
    },
    footer: {
      copyright: '© 2026 Katachi. Được tạo ra bởi người học tiếng Nhật, dành cho người học tiếng Nhật.',
      practiceLink: 'Ứng dụng luyện tập',
    },
  },
  ne: {
    meta: {
      title: 'काटाची — दैनिक अभ्यास मार्फत जापानी रूपान्तरणहरूमा महारत हासिल गर्नुहोस् | JLPT N5 र N4',
      description: 'एक विद्यार्थीद्वारा विद्यार्थीहरूका लागि बनाइएको जापानी रूपान्तरण अभ्यास उपकरण। स्मार्ट डिस्ट्याक्टर्स र कमजोरी ट्र्याकिङको साथ क्रिया र विशेषणहरूको अभ्यास गर्नुहोस्। JLPT N5 र N4 व्याकरण फारमहरू समावेश गर्दछ।',
    },
    hero: {
      eyebrow: 'कन्जुगेसन ल्याब',
      h1: 'जापानी रूपान्तरणहरूलाई मांसपेशी स्मृतिमा निर्माण गर्नुहोस्।',
      subtitle: 'काटाचीले एउटा सीपमा केन्द्रित गर्दछ: जापानी क्रिया र विशेषण रूपान्तरणलाई छोटो ड्रिल, स्मार्ट डिस्ट्याक्टर्स, र लक्षित पुनरावृत्ति मार्फत छिटो र भरपर्दो सम्झनामा बदल्ने।',
      cta: 'अभ्यास सुरु गर्नुहोस्',
      ctaLink: '/',
      proof: ['नि:शुल्क अभ्यास', 'साइन-अप आवश्यक छैन', 'JLPT N5-N3 ढाँचाहरू'],
    },
    drillPanel: {
      label: 'प्रत्यक्ष ड्रिल पूर्वावलोकन',
      promptLabel: 'शब्दकोश फारम',
      prompt: '泳ぐ',
      targetLabel: 'te-फारम बनाउनुहोस्',
      target: 'कुन उत्तरले वाक्यलाई सही रूपमा जोड्छ?',
      choices: ['泳いで', '泳って', '泳んで'],
      helper: 'डिस्ट्याक्टर्सहरू जानीजानी उस्तै राखिएका छन्, ताकि प्रत्येक चरणले तपाईंलाई फारम स्वचालित बनाउन आवश्यक पर्ने पुनरावृत्ति दिन्छ।',
      stats: [
        { value: '१२', label: 'प्रश्नहरू' },
        { value: '४', label: 'मिश्रित फारमहरू' },
        { value: '१', label: 'कमजोर बिन्दु फेला पर्यो' },
      ],
    },
    trainingStats: [
      { value: 'N5-N3', label: 'स्तरहरू समावेश' },
      { value: '२', label: 'अभ्यास मोडहरू' },
      { value: '०', label: 'सेटअप आवश्यक' },
    ],
    sectionLabels: {
      problem: 'किन यो महत्त्वपूर्ण छ',
      modes: 'अभ्यास सेटअप',
    },
    problem: {
      heading: 'किन रूपान्तरणलाई केन्द्रित अभ्यास आवश्यक छ',
      body1: 'धेरै विद्यार्थीहरूले रूपान्तरण नियमहरू बुझेका हुन्छन्, तर वाक्यमा सही फारम (भूतकाल, नकारात्मक, te-फारम, सम्भावित, निष्क्रिय, कारक, वा सर्त) आवश्यक पर्दा हिचकिचाउँछन्।',
      body2: 'पाठ्यपुस्तकहरूले नियमहरू व्याख्या गर्छन्। फ्ल्यासकार्डहरूले उत्तर देखाउँछन्। काताचीले तपाईंलाई रूपान्तरण स्वचालित बनाउन आवश्यक पर्ने केन्द्रित पुनरावृत्ति दिन्छ।',
    },
    features: {
      heading: 'कुनै सेटअप छैन। कुनै अवरोध छैन। केवल अभ्यास।',
      items: [
        {
          title: 'शून्य-घर्षण ड्रिलिंग',
          description: 'स्तर (N5, N4, वा N3) रोज्नुहोस्, क्रिया प्रकार वा विशेषण छान्नुहोस्, र सुरु गर्नुहोस्। बाँकी प्रणालीले सम्हाल्नेछ।',
        },
        {
          title: 'स्मार्ट कमजोरी पत्ता लगाउने',
          description: "te-फारममा संघर्ष गर्दै हुनुहुन्छ? प्रणालीले याद गर्छ र थप te-फारम अभ्यास देखाउँछ। तपाईंले आफ्नो कमजोरी ट्र्याक गर्नु पर्दैन — काताचीले तपाईंको लागि यो गरिदिन्छ।",
        },
        {
          title: 'दोहोरो अभ्यास मोडहरू',
          description: 'छिटो पहिचानको लागि बहु-विकल्प, सक्रिय सम्झनाको लागि टाइपिङ मोड। जुनसुकै बेला परिवर्तन गर्नुहोस्।',
        },
        {
          title: 'दैनिक सिलसिला',
          description: 'छोटो, केन्द्रित सत्रहरू जुन तपाईंले वास्तवमै कायम राख्न सक्नुहुन्छ। निरन्तरताले तीव्रतालाई जित्छ।',
        },
      ],
    },
    modes: {
      heading: 'अभ्यास गर्ने तीन तरिकाहरू',
      intro: 'तयार सत्र रोज्नुहोस्, आफ्ना कमजोर बिन्दुहरूलाई लक्षित गर्नुहोस्, वा विशेष व्याकरण बिन्दु ड्रिल गर्न पूर्ण नियन्त्रण लिनुहोस्।',
      items: [
        {
          modeIndex: '०१',
          title: 'दैनिक ड्रिल',
          description: 'हरेक दिन स्वचालित रूपमा उत्पन्न हुने सत्र। केवल एप खोल्नुहोस् र जानुहोस् — कुनै निर्णय आवश्यक छैन।',
        },
        {
          modeIndex: '०२',
          title: 'कमजोरी प्रशिक्षण',
          description: 'काटाचीले तपाईंका गल्तीहरूको विश्लेषण गर्छ र तपाईंका सबैभन्दा कमजोर फारमहरूलाई लक्षित गर्ने सत्रहरू बनाउँछ। te-फारममा समस्या छ? तपाईंले सफल नभएसम्म थप te-फारम पाउनुहुनेछ।',
        },
        {
          modeIndex: '०३',
          title: 'नि:शुल्क अभ्यास',
          description: 'पूर्ण नियन्त्रण। कुनै पनि स्तर, शब्द प्रकार, र रूपान्तरण फारम संयोजन रोज्नुहोस्। परीक्षा अघि विशेष व्याकरण बिन्दु ड्रिल गर्नका लागि उपयुक्त।',
        },
      ],
    },
    coverage: {
      heading: 'N5 र N4 का लागि तपाईंलाई चाहिने हरेक फारम',
      verbs: {
        label: 'क्रियाहरू',
        list: 'सभ्य (masu), सामान्य नकारात्मक (nai), सामान्य/सभ्य भूतकाल, ते-फारम (te), सम्भावित (potential), निष्क्रिय (passive), कारक (causative), आदेशात्मक (imperative), स्वैच्छिक (volitional), ससर्त (ba/tara)',
      },
      adjectives: {
        label: 'विशेषणहरू',
        list: 'सभ्य, नकारात्मक, भूतकाल र ससर्तका लागि i-विशेषण र na-विशेषण फारमहरू',
      },
    },
    whyN3: {
      heading: 'N3 मा किन रोकिने?',
      body1: 'काटाचीले N5 देखि N3 सम्म कभर गर्छ, तर त्यसको मतलब N2 र N1 कम महत्त्वपूर्ण छन् भन्ने होइन। यो ठीक उल्टो हो — एक पटक तपाईंले आधारभूत रूपान्तरण ढाँचाहरू मांसपेशी स्मृतिमा ड्रिल गरेपछि, उन्नत शब्दावली मात्र एउटै नियम भएको फरक स्टेम हो।',
      body2: 'यो शब्दावली एप होइन। यो एक रूपान्तरण ड्रिल उपकरण हो। रूपान्तरणमा महारत हासिल गर्न तपाईंले दश हजार शब्दहरू कण्ठ गर्नु पर्दैन। तपाईंलाई ढाँचाहरू स्वचालित नभएसम्म पुनरावृत्ति चाहिन्छ, शब्द जेसुकै भए पनि।',
    },
    finalCta: {
      heading: 'रूपान्तरणहरूलाई मांसपेशी स्मृतिमा निर्माण गर्न तयार हुनुहुन्छ?',
      subtitle: 'हरेक दिन जापानी व्याकरण ड्रिल गर्ने हजारौं विद्यार्थीहरूसँग सामेल हुनुहोस्। नि:शुल्क। कुनै साइन-अप आवश्यक छैन।',
      cta: 'अहिले अभ्यास सुरु गर्नुहोस्',
    },
    footer: {
      copyright: '© २०२६ काटाची। जापानी विद्यार्थीद्वारा जापानी विद्यार्थीहरूका लागि बनाइएको।',
      practiceLink: 'अभ्यास एप',
    },
  },
  my: {
    meta: {
      title: 'Katachi — နေ့စဉ်လေ့ကျင့်မှုဖြင့် ဂျပန်ဘာသာ အသုံးအနှုန်းများကို ကျွမ်းကျင်အောင် လုပ်ဆောင်ပါ | JLPT N5 & N4',
      description: 'ဂျပန်စာလေ့လာသူများအတွက် အထူးရည်ရွယ်ပြီး ပြုလုပ်ထားသော ဂျပန်ဘာသာ အသုံးအနှုန်း လေ့ကျင့်ရေးကိရိယာ။ ကြိယာများနှင့် နာမဝိသေသနများကို အာရုံစိုက်လေ့ကျင့်နိုင်ပြီး သင်၏အားနည်းချက်များကို ခြေရာခံပေးပါသည်။ JLPT N5 & N4 အဆင့်များအတွက် အကျုံးဝင်ပါသည်။',
    },
    hero: {
      eyebrow: 'Conjugation Lab',
      h1: 'ဂျပန်ဘာသာ အသုံးအနှုန်းများကို အလိုအလျောက် မှတ်မိနေစေရန် လေ့ကျင့်ပါ။',
      subtitle: 'Katachi သည် တစ်ခုတည်းသော စွမ်းရည်ကို အာရုံစိုက်ပါသည် - ဂျပန်ဘာသာ ကြိယာနှင့် နာမဝိသေသန အသုံးအနှုန်းများကို ထပ်ခါထပ်ခါ လေ့ကျင့်ခြင်းဖြင့် လျင်မြန်စွာ မှတ်မိစေရန် ကူညီပေးပါသည်။',
      cta: 'လေ့ကျင့်မှုစတင်ရန်',
      ctaLink: '/',
      proof: ['အခမဲ့လေ့ကျင့်နိုင်သည်', 'အကောင့်ဖွင့်ရန် မလိုပါ', 'JLPT N5-N3 အဆင့်များ'],
    },
    drillPanel: {
      label: 'လေ့ကျင့်မှု နမူနာ',
      promptLabel: 'အခြေခံပုံစံ (Dictionary form)',
      prompt: '泳ぐ',
      targetLabel: 'te-form ပြောင်းပါ',
      target: 'မည်သည့်အဖြေက ဝါကျကို မှန်ကန်စွာ ဆက်စပ်ပေးသနည်း?',
      choices: ['泳いで', '泳့တေ', '泳နဒီ'],
      helper: 'အဖြေမှားများကို ဆင်တူယိုးမှား ပြုလုပ်ထားသောကြောင့် သင်ပိုမိုအာရုံစိုက်ပြီး လေ့ကျင့်နိုင်ပါလိမ့်မည်။',
      stats: [
        { value: '၁၂', label: 'မေးခွန်းများ' },
        { value: '၄', label: 'ပုံစံများ ရောနှောထားသည်' },
        { value: '၁', label: 'အားနည်းချက်ကို တွေ့ရှိသည်' },
      ],
    },
    trainingStats: [
      { value: 'N5-N3', label: 'အဆင့်များ' },
      { value: '၂', label: 'လေ့ကျင့်မှုမုဒ်များ' },
      { value: '၀', label: 'ချိန်ညှိရန် မလိုပါ' },
    ],
    sectionLabels: {
      problem: 'ဘာကြောင့် အရေးကြီးသနည်း',
      modes: 'လေ့ကျင့်မှု ချိန်ညှိချက်',
    },
    problem: {
      heading: 'ဘာကြောင့် အသုံးအနှုန်းများကို သီးသန့်လေ့ကျင့်ရန် လိုအပ်သနည်း',
      body1: 'လေ့လာသူအများစုသည် စည်းမျဉ်းများကို နားလည်သော်လည်း ဝါကျတစ်ခုတွင် အတိတ်ကာလ၊ အငြင်းဝါကျ၊ te-form စသည်တို့ကို အသုံးပြုရာတွင် တွန့်ဆုတ်နေတတ်ကြပါသည်။',
      body2: 'သင်ရိုးညွှန်းတမ်းစာအုပ်များက စည်းမျဉ်းများကို ရှင်းပြသည်။ flashcards များက အဖြေကို ပြသည်။ Katachi ကမူ သင်အလိုအလျောက် အသုံးပြုနိုင်ရန် ထပ်ခါထပ်ခါ လေ့ကျင့်ပေးပါသည်။',
    },
    features: {
      heading: 'လွယ်ကူမြန်ဆန်စွာ လေ့ကျင့်ပါ။',
      items: [
        {
          title: 'ချက်ချင်းလေ့ကျင့်ပါ',
          description: 'အဆင့် (N5, N4, or N3) ကို ရွေးချယ်ပါ၊ ကြိယာ သို့မဟုတ် နာမဝိသေသန အမျိုးအစားကို ရွေးပြီး စတင်ပါ။ ကျန်ရှိသည်များကို စနစ်မှ ဆောင်ရွက်ပေးပါမည်။',
        },
        {
          title: 'အားနည်းချက်ကို ရှာဖွေပေးခြင်း',
          description: "te-form ပြောင်းရာတွင် အခက်အခဲရှိပါသလား? စနစ်က ၎င်းကို သတိပြုမိပြီး te-form လေ့ကျင့်မှုများကို ပိုမိုပြသပေးပါမည်။",
        },
        {
          title: 'လေ့ကျင့်မှုမုဒ် နှစ်မျိုး',
          description: 'လျင်မြန်စွာ ရွေးချယ်နိုင်ရန် ရွေးချယ်စရာမုဒ်နှင့် အဖြေကို တိုက်ရိုက် ရိုက်ထည့်နိုင်ရန် စာရိုက်မုဒ်။',
        },
        {
          title: 'နေ့စဉ်စံချိန်',
          description: 'နေ့စဉ် အချိန်အနည်းငယ်ပေးရုံဖြင့် တစိုက်မတ်မတ် လေ့ကျင့်နိုင်ပါသည်။',
        },
      ],
    },
    modes: {
      heading: 'လေ့ကျင့်ရန် နည်းလမ်း သုံးမျိုး',
      intro: 'အလိုအလျောက် ဖန်တီးထားသော လေ့ကျင့်မှုကို ရွေးချယ်ပါ၊ သင်၏အားနည်းချက်ကို အာရုံစိုက်ပါ သို့မဟုတ် သင်လေ့ကျင့်လိုသည့် အပိုင်းကို စိတ်ကြိုက်ရွေးချယ်ပါ။',
      items: [
        {
          modeIndex: '၀၁',
          title: 'နေ့စဉ်လေ့ကျင့်မှု',
          description: 'နေ့စဉ် အလိုအလျောက် ဖန်တီးပေးသော လေ့ကျင့်မှု။ အက်ပ်ကို ဖွင့်ပြီး ချက်ချင်း စတင်နိုင်ပါသည်။',
        },
        {
          modeIndex: '၀၂',
          title: 'အားနည်းချက် လေ့ကျင့်ရေး',
          description: 'Katachi က သင်၏အမှားများကို ခွဲခြမ်းစိတ်ဖြာပြီး သင်အားအနည်းဆုံး အပိုင်းများကို အာရုံစိုက် လေ့ကျင့်ပေးပါသည်။',
        },
        {
          modeIndex: '၀၃',
          title: 'စိတ်ကြိုက်လေ့ကျင့်မှု',
          description: 'အဆင့်၊ စကားလုံးအမျိုးအစားနှင့် ပုံစံများကို စိတ်ကြိုက် ရွေးချယ်လေ့ကျင့်နိုင်ပါသည်။',
        },
      ],
    },
    coverage: {
      heading: 'N5 & N4 အတွက် လိုအပ်သော ပုံစံအားလုံး',
      verbs: {
        label: 'ကြိယာများ',
        list: 'Polite (masu), Plain negative, Past plain/polite, Te-form, Potential, Passive, Causative, Imperative, Volitional, Conditional (ba/tara)',
      },
      adjectives: {
        label: 'နာမဝိသေသနများ',
        list: 'i-adjective နှင့် na-adjective ပုံစံများ (polite, negative, past, conditional)',
      },
    },
    whyN3: {
      heading: 'ဘာကြောင့် N3 အထိပဲလဲ?',
      body1: 'အခြေခံ အသုံးအနှုန်း ပုံစံများကို ကျွမ်းကျင်သွားပါက အဆင့်မြင့် စကားလုံးများသည်လည်း ထိုစည်းမျဉ်းများအတိုင်းပင် ဖြစ်ပါသည်။',
      body2: '၎င်းသည် စကားလုံးကျက်သည့် အက်ပ်မဟုတ်ဘဲ အသုံးအနှုန်း ပုံစံများကို ကျွမ်းကျင်အောင် လေ့ကျင့်ပေးသည့် ကိရိယာ ဖြစ်ပါသည်။',
    },
    finalCta: {
      heading: 'ဂျပန်ဘာသာ အသုံးအနှုန်းများကို အလိုအလျောက် မှတ်မိစေရန် အဆင်သင့်ဖြစ်ပြီလား?',
      subtitle: 'နေ့စဉ် လေ့ကျင့်နေသော သင်ယူသူ ထောင်ပေါင်းများစွာနှင့် ပူးပေါင်းလိုက်ပါ။ အခမဲ့ဖြစ်ပြီး အကောင့်ဖွင့်ရန် မလိုပါ။',
      cta: 'ယခုပင် လေ့ကျင့်မှုစတင်ပါ',
    },
    footer: {
      copyright: '© ၂၀၂၆ Katachi. ဂျပန်စာလေ့လာသူတစ်ဦးမှ ဖန်တီးထားပါသည်။',
      practiceLink: 'လေ့ကျင့်ရေး အက်ပ်',
    },
  },
};

export function getLandingCopy(lang: LandingLanguage): LandingCopy {
  return landingCopy[lang];
}
