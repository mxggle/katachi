import type { ConjugationType, WordEntry, WordGroup } from '@/lib/distractorEngine';
import type { Language } from '@/lib/i18n';
import { getConjugationRules } from '@/lib/conjugationGuide';
import { formatRuleFormula, getConjugationGuideCopy } from '@/lib/conjugationGuideI18n';

interface ConjugationRulePanelProps {
  type: ConjugationType;
  language: Language;
  currentWord?: Pick<WordEntry, 'group' | 'dictionary_form' | 'conjugations'>;
  compact?: boolean;
}

function currentWordDisplay(word: ConjugationRulePanelProps['currentWord']): string | undefined {
  if (!word) return undefined;

  const { kanji, kana } = word.dictionary_form;
  return kanji && kanji !== kana ? `${kanji}（${kana}）` : (kanji || kana);
}

export default function ConjugationRulePanel({
  type,
  language,
  currentWord,
  compact = false,
}: ConjugationRulePanelProps) {
  const copy = getConjugationGuideCopy(language);
  const rules = getConjugationRules(type);
  const activeGroup: WordGroup | undefined = currentWord?.group;
  const activeWord = currentWordDisplay(currentWord);

  return (
    <div className={compact ? 'space-y-3' : 'grid gap-4 md:grid-cols-2'}>
      {rules.map((rule) => {
        const isCurrentRule = rule.group === activeGroup;
        const before = isCurrentRule && activeWord ? activeWord : rule.example.before;
        const after = isCurrentRule
          ? (currentWord?.conjugations[type] ?? rule.example.after)
          : rule.example.after;

        return (
          <article
            key={rule.group}
            className={`rounded-2xl border-[3px] p-4 text-left transition-colors ${
              isCurrentRule
                ? 'border-[color:var(--ink)] bg-[#fff4bd] shadow-[4px_4px_0_0_var(--ink)]'
                : 'border-[color:var(--border-strong)] bg-white'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-black text-[color:var(--ink)]">
                {copy.groups[rule.group]}
              </h3>
              {isCurrentRule && (
                <span className="rounded-full border-2 border-[color:var(--ink)] bg-[color:var(--accent)] px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
                  {copy.currentRule}
                </span>
              )}
            </div>

            <dl className="mt-3 space-y-3">
              <div>
                <dt className="text-[9px] font-black uppercase tracking-[0.18em] text-[color:var(--muted)]">
                  {copy.pattern}
                </dt>
                <dd className="mt-1 font-mono text-sm font-bold leading-6 text-[color:var(--ink)]">
                  {formatRuleFormula(rule.formula, copy.formula)}
                </dd>
              </div>
              <div>
                <dt className="text-[9px] font-black uppercase tracking-[0.18em] text-[color:var(--muted)]">
                  {isCurrentRule ? copy.currentWord : copy.example}
                </dt>
                <dd className="mt-1 flex flex-wrap items-center gap-2 text-base font-black text-[color:var(--ink)]">
                  <span>{before}</span>
                  <span aria-hidden="true" className="text-[color:var(--accent)]">→</span>
                  <span>{after}</span>
                </dd>
              </div>
            </dl>

            {rule.note && (
              <p className="mt-3 rounded-xl bg-[color:var(--surface-soft)] px-3 py-2 text-xs font-semibold leading-5 text-[color:var(--muted)]">
                {rule.note === 'godan-sound-change'
                  ? copy.notes.godanSoundChange
                  : copy.notes.iiAdjective}
              </p>
            )}
          </article>
        );
      })}
    </div>
  );
}
