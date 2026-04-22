'use client';

import { useMemo, useState } from 'react';
import { useStore } from '@/lib/store';
import { WordType, ConjugationType, VERB_ONLY_CONJS, CONJS_FOR_WORD_TYPE } from '@/lib/distractorEngine';

const VERB_FORM_LABELS: Record<ConjugationType, string> = {
  polite: 'ます形',
  negative_plain: 'ない形',
  negative_polite: 'ません形',
  past_plain: 'た形',
  past_polite: 'ました形',
  past_negative_plain: 'なかった形',
  past_negative_polite: 'ませんでした形',
  te_form: 'て形',
  potential: '可能形',
  passive: '受身形',
  causative: '使役形',
  causative_passive: '使役受身形',
  imperative: '命令形',
  volitional: '意向形',
  conditional_ba: 'ば形',
  conditional_tara: 'たら形',
};

const ADJ_FORM_LABELS: Record<string, string> = {
  polite: 'です形',
  negative_plain: 'ない形',
  negative_polite: '丁寧否定形',
  past_plain: 'た形',
  past_polite: 'でした形',
  past_negative_plain: 'なかった形',
  past_negative_polite: '丁寧過去否定形',
  te_form: 'て形',
  conditional_ba: 'ば形',
  conditional_tara: 'たら形',
};

const WORD_TYPE_LABELS: Record<WordType, string> = {
  verb: '動詞',
  'i-adj': 'い形容詞',
  'na-adj': 'な形容詞',
};

const LEVELS = ['N5', 'N4', 'N3'] as const;
const QUESTION_COUNTS = [10, 20, 30];

export default function SetupMenu() {
  const { config, updateConfig } = useStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const availableForms = useMemo(() => {
    const nextAvailable = new Set<ConjugationType>();
    for (const wordType of config.wordTypes) {
      for (const form of CONJS_FOR_WORD_TYPE[wordType]) {
        nextAvailable.add(form);
      }
    }
    return nextAvailable;
  }, [config.wordTypes]);

  const toggleLevel = (level: (typeof LEVELS)[number]) => {
    const nextLevels = config.levels.includes(level)
      ? config.levels.filter((item) => item !== level)
      : [...config.levels, level];

    if (nextLevels.length > 0) {
      updateConfig({ levels: nextLevels });
    }
  };

  const toggleWordType = (wordType: WordType) => {
    const nextWordTypes = config.wordTypes.includes(wordType)
      ? config.wordTypes.filter((item) => item !== wordType)
      : [...config.wordTypes, wordType];

    if (nextWordTypes.length === 0) {
      return;
    }

    const nextAvailableForms = new Set<ConjugationType>();
    for (const item of nextWordTypes) {
      for (const form of CONJS_FOR_WORD_TYPE[item]) {
        nextAvailableForms.add(form);
      }
    }

    const nextForms = config.forms.filter((form) => nextAvailableForms.has(form));
    updateConfig({
      wordTypes: nextWordTypes,
      forms: nextForms.length > 0 ? nextForms : ['polite'],
    });
  };

  const toggleForm = (form: ConjugationType) => {
    if (!availableForms.has(form)) {
      return;
    }

    const nextForms = config.forms.includes(form)
      ? config.forms.filter((item) => item !== form)
      : [...config.forms, form];

    if (nextForms.length > 0) {
      updateConfig({ forms: nextForms });
    }
  };

  const selectAllForms = () => {
    const allAvailable = Array.from(availableForms);
    if (allAvailable.length > 0) updateConfig({ forms: allAvailable });
  };

  const clearAllForms = () => {
    // Keep at least polite form
    updateConfig({ forms: ['polite'] });
  };

  return (
    <section className="rounded-[2rem] border-[3px] border-[color:var(--ink)] bg-white p-6 shadow-[8px_8px_0px_0px_var(--ink)] transition-all sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold text-[color:var(--ink)]">
            Setup Options
          </h3>
          <p className="text-sm font-medium text-[color:var(--muted)]">
            Tweak the forms and modes for your session.
          </p>
        </div>

        <button
          type="button"
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded((value) => !value)}
          className="inline-flex min-h-11 items-center justify-center rounded-xl border-[3px] border-[color:var(--ink)] bg-[#fde68a] px-5 py-2 text-sm font-bold text-[color:var(--ink)] shadow-[4px_4px_0px_0px_var(--ink)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_var(--ink)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
        >
          {isExpanded ? 'Hide Options' : 'Show Options'}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-8 space-y-8 border-t-[3px] border-dashed border-[color:var(--border-strong)] pt-8">
          <ConfigSection title="Levels">
            <ChipRow>
              {LEVELS.map((level) => (
                <ToggleChip
                  key={level}
                  active={config.levels.includes(level)}
                  onClick={() => toggleLevel(level)}
                  label={level}
                />
              ))}
            </ChipRow>
          </ConfigSection>

          <ConfigSection title="Word types">
            <ChipRow>
              {(['verb', 'i-adj', 'na-adj'] as const).map((wordType) => (
                <ToggleChip
                  key={wordType}
                  active={config.wordTypes.includes(wordType)}
                  onClick={() => toggleWordType(wordType)}
                  label={WORD_TYPE_LABELS[wordType]}
                />
              ))}
            </ChipRow>
          </ConfigSection>

          <ConfigSection 
            title="Forms" 
            helper="At least one must be selected."
            action={
              <div className="flex gap-2">
                <button onClick={selectAllForms} className="text-xs font-bold text-[color:var(--accent)] hover:underline">Select All</button>
                <span className="text-xs text-[color:var(--muted)]">|</span>
                <button onClick={clearAllForms} className="text-xs font-bold text-[color:var(--muted)] hover:underline">Clear</button>
              </div>
            }
          >
            <ChipRow>
              {(Object.keys(VERB_FORM_LABELS) as ConjugationType[]).map((form) => {
                if (!availableForms.has(form)) return null;

                const hasVerb = config.wordTypes.includes('verb');
                const hasAdj = config.wordTypes.includes('i-adj') || config.wordTypes.includes('na-adj');
                
                let label = VERB_FORM_LABELS[form];
                if (hasVerb && hasAdj) {
                  const adjLabel = ADJ_FORM_LABELS[form];
                  if (adjLabel && adjLabel !== VERB_FORM_LABELS[form]) {
                    label = `${VERB_FORM_LABELS[form]} / ${adjLabel}`;
                  }
                } else if (hasAdj) {
                  label = ADJ_FORM_LABELS[form] || VERB_FORM_LABELS[form];
                }

                return (
                  <ToggleChip
                    key={form}
                    active={config.forms.includes(form)}
                    onClick={() => toggleForm(form)}
                    label={label}
                    tag={VERB_ONLY_CONJS.includes(form) ? 'V' : undefined}
                  />
                );
              })}
            </ChipRow>
          </ConfigSection>

          <div className="grid gap-8 md:grid-cols-2">
            <ConfigSection title="Practice mode">
              <ChipRow>
                {(['choice', 'input'] as const).map((mode) => (
                  <ToggleChip
                    key={mode}
                    active={config.mode === mode}
                    onClick={() => updateConfig({ mode })}
                    label={mode === 'choice' ? 'Multiple choice' : 'Typing'}
                  />
                ))}
              </ChipRow>
            </ConfigSection>

            <ConfigSection title="Question count">
              <ChipRow>
                {QUESTION_COUNTS.map((questionCount) => (
                  <ToggleChip
                    key={questionCount}
                    active={config.questionCount === questionCount}
                    onClick={() => updateConfig({ questionCount })}
                    label={questionCount.toString()}
                  />
                ))}
              </ChipRow>
            </ConfigSection>
          </div>
        </div>
      )}
    </section>
  );
}

function ConfigSection({
  title,
  helper,
  action,
  children,
}: {
  title: string;
  helper?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 sm:gap-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
          <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-[color:var(--ink)]">{title}</h3>
          {helper && <p className="text-xs font-bold text-[color:var(--muted)]">{helper}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      {children}
    </section>
  );
}

function ChipRow({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-3">{children}</div>;
}

function ToggleChip({
  active,
  disabled,
  label,
  onClick,
  tag,
}: {
  active: boolean;
  disabled?: boolean;
  label: string;
  onClick: () => void;
  tag?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`relative inline-flex min-h-[2.5rem] items-center gap-2 rounded-xl border-[2px] border-[color:var(--ink)] px-4 py-1.5 text-sm font-bold transition-all ${
        active
          ? 'bg-[color:var(--accent)] text-white shadow-[3px_3px_0px_0px_var(--ink)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_var(--ink)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none'
          : 'bg-[#f4f4ea] text-[color:var(--ink)] shadow-[3px_3px_0px_0px_var(--ink)] hover:bg-[#e9e9d8] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_var(--ink)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none'
      } ${disabled ? 'cursor-not-allowed border-[color:var(--border)] bg-[color:var(--surface-soft)] text-[color:var(--muted)] shadow-none hover:translate-x-0 hover:translate-y-0 hover:bg-[color:var(--surface-soft)] hover:shadow-none active:translate-x-0 active:translate-y-0' : ''}`}
    >
      <span>{label}</span>
      {tag && <span className={`text-[10px] uppercase tracking-wider ${active ? 'text-[color:var(--ink)]' : 'text-[color:var(--muted)]'}`}>{tag}</span>}
    </button>
  );
}