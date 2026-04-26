'use client';

import { X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import type { Language } from '@/lib/i18n';
import Portal from '@/components/Portal';

const COUNT_OPTIONS = [5, 10, 15, 20, 30];

interface PracticeCountDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (count: number) => void;
  language: Language;
  title?: string;
  defaultCount?: number;
}

export default function PracticeCountDialog({
  open,
  onClose,
  onConfirm,
  language,
  defaultCount = 10,
}: PracticeCountDialogProps) {
  const { t } = useTranslation(language);
  const [selected, setSelected] = useState(defaultCount);
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setSelected(defaultCount);
    }
  }

  if (!open) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 animate-backdrop" onClick={onClose} />
        <div className="relative w-full max-w-sm rounded-[2rem] border-[4px] border-[color:var(--ink)] bg-white p-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.5)] sm:p-8 animate-modal-enter">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-[color:var(--ink)]">{t('selectQuestionCount')}</h3>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[color:var(--ink)] bg-[#f4f4ea] text-[color:var(--ink)] transition-all hover:bg-[color:var(--accent-soft)] rebound-sm"
            >
              <X className="h-5 w-5" strokeWidth={3} />
            </button>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {COUNT_OPTIONS.map((count, i) => (
              <button
                key={count}
                type="button"
                onClick={() => setSelected(count)}
                style={{ animationDelay: `${i * 40}ms` }}
                className={`inline-flex min-h-[3rem] min-w-[3.5rem] items-center justify-center rounded-xl border-[2.5px] border-[color:var(--ink)] px-5 py-1.5 text-base font-bold transition-all rebound-sm animate-pop-in ${
                  selected === count
                    ? 'bg-[color:var(--accent)] text-white shadow-[4px_4px_0px_0px_var(--ink)]'
                    : 'bg-[#f4f4ea] text-[color:var(--ink)] shadow-[3px_3px_0px_0px_var(--ink)]'
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
            className="mt-8 inline-flex w-full items-center justify-center rounded-[1.25rem] border-[3px] border-[color:var(--ink)] bg-[color:var(--accent)] px-6 py-4 text-xl font-black text-white shadow-[6px_6px_0px_0px_var(--ink)] rebound-md"
          >
            {t('startPractice')}
          </button>
        </div>
      </div>
    </Portal>
  );
}
