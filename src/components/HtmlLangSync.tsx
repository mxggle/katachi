'use client';

import { useEffect } from 'react';
import { useStore } from '@/lib/store';

export function HtmlLangSync() {
  const { language } = useStore();

  useEffect(() => {
    const htmlLanguages = {
      en: 'en',
      zh: 'zh-CN',
      vi: 'vi',
      ne: 'ne',
      my: 'my',
      ko: 'ko',
    } as const;
    document.documentElement.lang = htmlLanguages[language];
  }, [language]);

  return null;
}
