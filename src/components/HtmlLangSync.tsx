'use client';

import { useEffect } from 'react';
import { useStore } from '@/lib/store';

export function HtmlLangSync() {
  const { language } = useStore();

  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
  }, [language]);

  return null;
}
