'use client';

import { useStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useStore();
  const { t } = useTranslation(language);

  return (
    <div className="flex items-center gap-3 rounded-2xl border-[3px] border-[color:var(--ink)] bg-white px-5 py-3 shadow-[4px_4px_0px_0px_var(--ink)]">
      <span className="text-xs font-bold uppercase tracking-widest text-[color:var(--muted)]">
        {t('language')}
      </span>
      <div className="flex gap-1">
        <button
          onClick={() => setLanguage('en')}
          className={`rounded-lg px-3 py-1.5 text-sm font-bold transition-all ${
            language === 'en'
              ? 'bg-[color:var(--accent)] text-white shadow-[2px_2px_0px_0px_var(--ink)]'
              : 'text-[color:var(--muted)] hover:text-[color:var(--ink)]'
          }`}
        >
          {t('english')}
        </button>
        <button
          onClick={() => setLanguage('zh')}
          className={`rounded-lg px-3 py-1.5 text-sm font-bold transition-all ${
            language === 'zh'
              ? 'bg-[color:var(--accent)] text-white shadow-[2px_2px_0px_0px_var(--ink)]'
              : 'text-[color:var(--muted)] hover:text-[color:var(--ink)]'
          }`}
        >
          {t('chinese')}
        </button>
      </div>
    </div>
  );
}
