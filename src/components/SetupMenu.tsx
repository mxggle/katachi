'use client';

import { ChevronDown, Settings2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useStore } from '@/lib/store';
import { useTranslation, translations } from '@/lib/i18n';
import { WordType, ConjugationType, VERB_ONLY_CONJS, CONJS_FOR_WORD_TYPE } from '@/lib/distractorEngine';

const LEVELS = ['N5', 'N4', 'N3'] as const;
const QUESTION_COUNTS = [10, 20, 30];

export default function SetupMenu() {
  const { updateDailyGoal, language, studyState, updateDailyConfig, updateFreeConfig } = useStore();
  const { t } = useTranslation(language);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'daily' | 'free'>('daily');

  const isDaily = activeTab === 'daily';
  const currentConfig = isDaily 
    ? studyState.preferences.dailySessionConfig 
    : studyState.preferences.freeSessionConfig;
  const updateCurrentConfig = isDaily ? updateDailyConfig : updateFreeConfig;

  const dict = translations[language];

  const verbFormLabels: Record<ConjugationType, string> = {
    polite: dict.verb_form.polite,
    negative_plain: dict.verb_form.negative_plain,
    negative_polite: dict.verb_form.negative_polite,
    past_plain: dict.verb_form.past_plain,
    past_polite: dict.verb_form.past_polite,
    past_negative_plain: dict.verb_form.past_negative_plain,
    past_negative_polite: dict.verb_form.past_negative_polite,
    te_form: dict.verb_form.te_form,
    potential: dict.verb_form.potential,
    passive: dict.verb_form.passive,
    causative: dict.verb_form.causative,
    causative_passive: dict.verb_form.causative_passive,
    imperative: dict.verb_form.imperative,
    volitional: dict.verb_form.volitional,
    conditional_ba: dict.verb_form.conditional_ba,
    conditional_tara: dict.verb_form.conditional_tara,
  };

  const adjFormLabels: Record<string, string> = {
    polite: dict.adj_form.polite,
    negative_plain: dict.adj_form.negative_plain,
    negative_polite: dict.adj_form.negative_polite,
    past_plain: dict.adj_form.past_plain,
    past_polite: dict.adj_form.past_polite,
    past_negative_plain: dict.adj_form.past_negative_plain,
    past_negative_polite: dict.adj_form.past_negative_polite,
    te_form: dict.adj_form.te_form,
    conditional_ba: dict.adj_form.conditional_ba,
    conditional_tara: dict.adj_form.conditional_tara,
  };

  const wordTypeLabels: Record<WordType, string> = {
    verb: t('verb'),
    'i-adj': t('iAdj'),
    'na-adj': t('naAdj'),
  };

  const availableForms = useMemo(() => {
    const nextAvailable = new Set<ConjugationType>();
    for (const wordType of currentConfig.wordTypes) {
      for (const form of CONJS_FOR_WORD_TYPE[wordType]) {
        nextAvailable.add(form);
      }
    }
    return nextAvailable;
  }, [currentConfig.wordTypes]);

  const toggleLevel = (level: (typeof LEVELS)[number]) => {
    const nextLevels = currentConfig.levels.includes(level)
      ? currentConfig.levels.filter((item) => item !== level)
      : [...currentConfig.levels, level];

    if (nextLevels.length > 0) {
      updateCurrentConfig({ levels: nextLevels });
    }
  };

  const toggleWordType = (wordType: WordType) => {
    const nextWordTypes = currentConfig.wordTypes.includes(wordType)
      ? currentConfig.wordTypes.filter((item) => item !== wordType)
      : [...currentConfig.wordTypes, wordType];

    if (nextWordTypes.length === 0) {
      return;
    }

    const nextAvailableForms = new Set<ConjugationType>();
    for (const item of nextWordTypes) {
      for (const form of CONJS_FOR_WORD_TYPE[item]) {
        nextAvailableForms.add(form);
      }
    }

    const nextForms = currentConfig.forms.filter((form) => nextAvailableForms.has(form));
    updateCurrentConfig({
      wordTypes: nextWordTypes,
      forms: nextForms.length > 0 ? nextForms : ['polite'],
    });
  };

  const toggleForm = (form: ConjugationType) => {
    if (!availableForms.has(form)) {
      return;
    }

    const nextForms = currentConfig.forms.includes(form)
      ? currentConfig.forms.filter((item) => item !== form)
      : [...currentConfig.forms, form];

    if (nextForms.length > 0) {
      updateCurrentConfig({ forms: nextForms });
    }
  };

  const selectAllForms = () => {
    const allAvailable = Array.from(availableForms);
    if (allAvailable.length > 0) updateCurrentConfig({ forms: allAvailable });
  };

  const clearAllForms = () => {
    // Keep at least polite form
    updateCurrentConfig({ forms: ['polite'] });
  };

  return (
    <section className="rounded-[2rem] border-[3px] border-[color:var(--ink)] bg-white p-6 shadow-[8px_8px_0px_0px_var(--ink)] transition-all sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Settings2 className="h-6 w-6 text-[color:var(--accent)]" strokeWidth={3} aria-hidden="true" />
            <h3 className="text-2xl font-bold text-[color:var(--ink)]">
              {t('setupOptions')}
            </h3>
          </div>
          <p className="text-sm font-medium text-[color:var(--muted)]">
            {t('setupDescription')}
          </p>
        </div>

        <button
          type="button"
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded((value) => !value)}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border-[3px] border-[color:var(--ink)] bg-[#fde68a] px-5 py-2 text-sm font-bold text-[color:var(--ink)] shadow-[4px_4px_0px_0px_var(--ink)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_var(--ink)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
        >
          <span>{isExpanded ? t('hideOptions') : t('showOptions')}</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            strokeWidth={3}
            aria-hidden="true"
          />
        </button>
      </div>

      {isExpanded && (
        <div className="mt-8 space-y-8 border-t-[3px] border-dashed border-[color:var(--border-strong)] pt-8">
          <div className="flex w-full gap-2 rounded-xl bg-[color:var(--surface-soft)] p-1.5 border-[2px] border-[color:var(--border)]">
            <button
              onClick={() => setActiveTab('daily')}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-bold transition-all ${
                isDaily 
                  ? 'bg-white text-[color:var(--ink)] shadow-sm border-2 border-[color:var(--ink)]' 
                  : 'text-[color:var(--muted)] hover:text-[color:var(--ink)] border-2 border-transparent'
              }`}
            >
              {t('dailyPractice')}
            </button>
            <button
              onClick={() => setActiveTab('free')}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-bold transition-all ${
                !isDaily 
                  ? 'bg-white text-[color:var(--ink)] shadow-sm border-2 border-[color:var(--ink)]' 
                  : 'text-[color:var(--muted)] hover:text-[color:var(--ink)] border-2 border-transparent'
              }`}
            >
              {t('freePractice')}
            </button>
          </div>

          <ConfigSection title={t('levels')}>
            <ChipRow>
              {LEVELS.map((level) => (
                <ToggleChip
                  key={level}
                  active={currentConfig.levels.includes(level)}
                  onClick={() => toggleLevel(level)}
                  label={level}
                />
              ))}
            </ChipRow>
          </ConfigSection>

          <ConfigSection title={t('wordTypes')}>
            <ChipRow>
              {(['verb', 'i-adj', 'na-adj'] as const).map((wordType) => (
                <ToggleChip
                  key={wordType}
                  active={currentConfig.wordTypes.includes(wordType)}
                  onClick={() => toggleWordType(wordType)}
                  label={wordTypeLabels[wordType]}
                />
              ))}
            </ChipRow>
          </ConfigSection>

          <ConfigSection 
            title={t('forms')} 
            helper={t('formsHelper')}
            action={
              <div className="flex gap-2">
                <button onClick={selectAllForms} className="text-xs font-bold text-[color:var(--accent)] hover:underline">{t('selectAll')}</button>
                <span className="text-xs text-[color:var(--muted)]">|</span>
                <button onClick={clearAllForms} className="text-xs font-bold text-[color:var(--muted)] hover:underline">{t('resetForms')}</button>
              </div>
            }
          >
            <ChipRow>
              {(Object.keys(verbFormLabels) as ConjugationType[]).map((form) => {
                if (!availableForms.has(form)) return null;

                const hasVerb = currentConfig.wordTypes.includes('verb');
                const hasAdj = currentConfig.wordTypes.includes('i-adj') || currentConfig.wordTypes.includes('na-adj');
                
                let label = verbFormLabels[form];
                if (hasVerb && hasAdj) {
                  const adjLabel = adjFormLabels[form];
                  if (adjLabel && adjLabel !== verbFormLabels[form]) {
                    label = `${verbFormLabels[form]} / ${adjLabel}`;
                  }
                } else if (hasAdj) {
                  label = adjFormLabels[form] || verbFormLabels[form];
                }

                return (
                  <ToggleChip
                    key={form}
                    active={currentConfig.forms.includes(form)}
                    onClick={() => toggleForm(form)}
                    label={label}
                    tag={VERB_ONLY_CONJS.includes(form) ? 'V' : undefined}
                  />
                );
              })}
            </ChipRow>
          </ConfigSection>

          <div className="grid gap-8 md:grid-cols-2">
            <ConfigSection title={t('practiceMode')}>
              <ChipRow>
                {(['choice', 'input'] as const).map((mode) => (
                  <ToggleChip
                    key={mode}
                    active={currentConfig.mode === mode}
                    onClick={() => updateCurrentConfig({ mode })}
                    label={mode === 'choice' ? t('multipleChoice') : t('typing')}
                  />
                ))}
              </ChipRow>
            </ConfigSection>

            <ConfigSection title={isDaily ? t('dailyGoal') : t('questionCount')}>
              <ChipRow>
                {QUESTION_COUNTS.map((count) => (
                  <ToggleChip
                    key={count}
                    active={isDaily ? studyState.preferences.dailyQuestionGoal === count : currentConfig.questionCount === count}
                    onClick={() => {
                      if (isDaily) updateDailyGoal(count);
                      else updateCurrentConfig({ questionCount: count });
                    }}
                    label={count.toString()}
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
