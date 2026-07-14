'use client';

import Link from 'next/link';
import { BookOpen, X } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';
import type { ConjugationType, WordEntry } from '@/lib/distractorEngine';
import type { Language } from '@/lib/i18n';
import { getConjugationLabel } from '@/lib/displayText';
import { getConjugationGuideCopy } from '@/lib/conjugationGuideI18n';
import ConjugationRulePanel from '@/components/ConjugationRulePanel';
import Portal from '@/components/Portal';

interface FormationRuleDialogProps {
  open: boolean;
  type: ConjugationType;
  word: Pick<WordEntry, 'group' | 'word_type' | 'dictionary_form' | 'conjugations'>;
  language: Language;
  onClose: () => void;
}

export default function FormationRuleDialog({
  open,
  type,
  word,
  language,
  onClose,
}: FormationRuleDialogProps) {
  const copy = getConjugationGuideCopy(language);
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [onClose, open]);

  if (!open) return null;

  const label = getConjugationLabel(type, word.word_type, language);

  return (
    <Portal>
      <div className="fixed inset-0 z-[110] flex items-end justify-center p-0 sm:items-center sm:p-5">
        <button
          type="button"
          aria-label={copy.close}
          onClick={onClose}
          className="absolute inset-0 h-full w-full cursor-default bg-black/45 animate-backdrop"
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="relative flex max-h-[88dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[2rem] border-[3px] border-b-0 border-[color:var(--ink)] bg-[color:var(--bg)] shadow-[8px_8px_0_0_var(--ink)] animate-modal-enter sm:rounded-[2rem] sm:border-b-[3px]"
        >
          <header className="flex items-start justify-between gap-4 border-b-[3px] border-[color:var(--ink)] bg-[#fde68a] p-4 sm:p-6">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[color:var(--muted)]">
                {copy.allRules}
              </p>
              <h2 id={titleId} className="mt-1 text-2xl font-black text-[color:var(--ink)] sm:text-3xl">
                {label}
              </h2>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              aria-label={copy.close}
              onClick={onClose}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-[3px] border-[color:var(--ink)] bg-white shadow-[3px_3px_0_0_var(--ink)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
            >
              <X className="h-5 w-5" strokeWidth={3} aria-hidden="true" />
            </button>
          </header>

          <div className="overflow-y-auto p-4 sm:p-6">
            <ConjugationRulePanel
              type={type}
              language={language}
              currentWord={word}
              compact
            />

            <Link
              href={`/conjugation-guide#${type}`}
              className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border-[3px] border-[color:var(--ink)] bg-[color:var(--ink)] px-4 py-3 text-center text-sm font-black text-white shadow-[4px_4px_0_0_#ff6b6b] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#ff6b6b]"
            >
              <BookOpen className="h-5 w-5" strokeWidth={2.5} aria-hidden="true" />
              {copy.viewFullGuide}
            </Link>
          </div>
        </div>
      </div>
    </Portal>
  );
}
