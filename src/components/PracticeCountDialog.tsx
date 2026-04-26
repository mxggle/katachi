'use client';

import { X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import type { Language } from '@/lib/i18n';

const COUNT_OPTIONS = [5, 10, 15, 20, 30];

interface PracticeCountDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (count: number) => void;
  language: Language;
  title?: string;
}

export default function PracticeCountDialog({
  open,
  onClose,
  onConfirm,
  language,
}: PracticeCountDialogProps) {
  const { t } = useTranslation(language);
  const [selected, setSelected] = useState(10);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-[2rem] border-[4px] border-[color:var(--ink)] bg-white p-6 shadow-[8px_8px_0px_0px_var(--ink)] sm:p-8">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-[color:var(--ink)]">{t('selectQuestionCount')}</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-[color:var(--ink)] bg-[#f4f4ea] text-[color:var(--ink)] transition-colors hover:bg-[color:var(--accent-soft)]"
          >
            <X className="h-4 w-4" strokeWidth={3} />
          </button>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {COUNT_OPTIONS.map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => setSelected(count)}
              className={`inline-flex min-h-[2.5rem] items-center rounded-xl border-[2px] border-[color:var(--ink)] px-5 py-1.5 text-sm font-bold transition-all ${
                selected === count
                  ? 'bg-[color:var(--accent)] text-white shadow-[3px_3px_0px_0px_var(--ink)]'
                  : 'bg-[#f4f4ea] text-[color:var(--ink)] shadow-[3px_3px_0px_0px_var(--ink)] hover:bg-[#e9e9d8]'
              }`}
            >
              {count}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            onConfirm(selected);
            onClose();
          }}
          className="mt-6 inline-flex w-full items-center justify-center rounded-[1.25rem] border-[3px] border-[color:var(--ink)] bg-[color:var(--accent)] px-6 py-3 text-lg font-black text-white shadow-[5px_5px_0px_0px_var(--ink)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_var(--ink)] active:translate-x-[5px] active:translate-y-[5px] active:shadow-none"
        >
          {t('startPractice')}
        </button>
      </div>
    </div>
  );
}
