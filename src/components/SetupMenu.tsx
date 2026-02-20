'use client';

import { useStore } from '@/lib/store';
import { WordType, ConjugationType, VERB_ONLY_CONJS, CONJS_FOR_WORD_TYPE, generateDistractors, WordEntry } from '@/lib/distractorEngine';
import dictionaryData from '../../dictionary.json';

const CONJ_LABELS: Record<string, string> = {
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

const WORD_TYPE_LABELS: Record<WordType, string> = {
    'verb': '動詞',
    'i-adj': 'い形容詞',
    'na-adj': 'な形容詞',
};

export default function SetupMenu() {
    const { config, updateConfig, startSession, dailyStreak, globalStats } = useStore();

    // Compute which conjugations are available based on selected word types
    const availableConjs = new Set<ConjugationType>();
    for (const wt of config.wordTypes) {
        for (const c of CONJS_FOR_WORD_TYPE[wt]) {
            availableConjs.add(c);
        }
    }

    const handleStart = () => {
        const availableWords = (dictionaryData as { words: WordEntry[] }).words.filter((w) =>
            config.leves.includes(w.level) && config.wordTypes.includes(w.word_type)
        );

        if (availableWords.length === 0) return alert('No words found for selected levels and word types');

        // Filter categories to only those valid for the selected word types
        const validCategories = config.categories.filter(c => availableConjs.has(c as ConjugationType));
        if (validCategories.length === 0) return alert('No conjugation types selected');

        const sessionWords = [];
        for (let i = 0; i < config.batchSize; i++) {
            const word = availableWords[Math.floor(Math.random() * availableWords.length)];
            // Only pick conjugation types valid for this specific word
            const wordConjs = CONJS_FOR_WORD_TYPE[word.word_type as WordType];
            const wordValidCats = validCategories.filter(c => wordConjs.includes(c as ConjugationType));
            if (wordValidCats.length === 0) continue;
            const type = wordValidCats[Math.floor(Math.random() * wordValidCats.length)] as ConjugationType;
            let choices: string[] = [];
            if (config.mode === 'choice') {
                const correctAnswer = word.conjugations[type];
                const distractors = generateDistractors(word, type);
                choices = [correctAnswer, ...distractors].sort(() => Math.random() - 0.5);
            }
            sessionWords.push({ word, type, choices });
        }

        if (sessionWords.length === 0) return alert('Could not build session with current settings');
        startSession(sessionWords);
    };

    const toggleLevel = (l: 'N5' | 'N4' | 'N3') => {
        const newLevels = config.leves.includes(l)
            ? config.leves.filter(x => x !== l)
            : [...config.leves, l];
        if (newLevels.length > 0) updateConfig({ leves: newLevels });
    };

    const toggleWordType = (wt: WordType) => {
        const newTypes = config.wordTypes.includes(wt)
            ? config.wordTypes.filter(x => x !== wt)
            : [...config.wordTypes, wt];
        if (newTypes.length === 0) return; // At least one must remain

        // Compute new available conjugations
        const newAvailable = new Set<ConjugationType>();
        for (const t of newTypes) {
            for (const c of CONJS_FOR_WORD_TYPE[t]) {
                newAvailable.add(c);
            }
        }

        // Auto-deselect categories that are no longer available
        const newCats = config.categories.filter(c => newAvailable.has(c as ConjugationType));
        updateConfig({
            wordTypes: newTypes,
            categories: newCats.length > 0 ? newCats : ['polite'],
        });
    };

    const toggleCategory = (c: string) => {
        const newCats = config.categories.includes(c)
            ? config.categories.filter(x => x !== c)
            : [...config.categories, c];
        if (newCats.length > 0) updateConfig({ categories: newCats });
    };

    const isVerbOnly = (c: string) => VERB_ONLY_CONJS.includes(c as ConjugationType);

    const selectAllForms = () => {
        const allAvailable = Array.from(availableConjs);
        if (allAvailable.length > 0) updateConfig({ categories: allAvailable });
    };

    const clearAllForms = () => {
        updateConfig({ categories: [] });
    };

    return (
        <div className="max-w-xl mx-auto px-4 pb-8 space-y-6 animate-fade-in flex flex-col min-h-full">
            {/* User Stats Card */}
            <div className="bg-gradient-to-b from-[#a4dc37] to-[#8cbe2c] ring-1 ring-inset ring-white/30 rounded-[1.5rem] px-2 py-4 flex justify-between items-center shadow-[0_8px_20px_rgba(142,191,41,0.25)] mt-8 relative">
                {/* Streak icon positioned on the top edge of the left section */}
                <div className="absolute -top-[14px] left-1/4 -translate-x-1/2 text-2xl drop-shadow-md z-20 pointer-events-none select-none animate-bounce">
                    🔥
                </div>

                <div className="flex-1 flex flex-col items-center justify-center space-y-1 relative z-10">
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#405c1e] opacity-90">Daily Streak</span>
                    <div className="flex items-center justify-center gap-[6px] font-black text-3xl text-white drop-shadow-sm leading-none">
                        <span className="text-[22px] drop-shadow-none leading-none pt-1">🔥</span>
                        <span className="leading-none tracking-tight">{dailyStreak}</span>
                        <span className="text-[12px] font-black text-[#405c1e] drop-shadow-none leading-none self-end pb-[3px]">days</span>
                    </div>
                </div>

                {/* Subtle centered divider */}
                <div className="w-[1px] h-10 bg-white/40 rounded-full"></div>

                <div className="flex-1 flex flex-col items-center justify-center space-y-1 relative z-10">
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#405c1e] opacity-90">Total Practiced</span>
                    <div className="flex items-center justify-center gap-[6px] font-black text-3xl text-white drop-shadow-sm leading-none">
                        <span className="text-[22px] drop-shadow-none leading-none pt-1">🏆</span>
                        <span className="leading-none tracking-tight">{globalStats.totalAnswered}</span>
                        <span className="text-[12px] font-black text-[#405c1e] drop-shadow-none leading-none self-end pb-[3px]">q&apos;s</span>
                    </div>
                </div>
            </div>

            {/* List Header */}
            <div className="flex justify-between items-center pt-4 px-2">
                <h3 className="text-sm font-black flex items-center gap-2 text-[#2d3748]">
                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px] shadow-sm shadow-blue-500/40">★</div>
                    Configure Your Session
                </h3>
                <span className="text-[10px] font-bold text-[#8ba888] uppercase tracking-wider">Scroll</span>
            </div>

            {/* List items mimicking "Upgrade Eyes" cards */}
            <div className="space-y-3 pb-24">
                {/* Level Row */}
                <div className="px-2 space-y-3 pt-2">
                    <h4 className="text-sm font-black text-[#9acd32] uppercase tracking-wider">Level</h4>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    {(['N5', 'N4', 'N3'] as const).map(l => {
                        const active = config.leves.includes(l);
                        // Map levels to the icons
                        const icon = l === 'N5' ? '🌱' : l === 'N4' ? '🌿' : '🌳';
                        return (
                            <button
                                key={l}
                                onClick={() => toggleLevel(l)}
                                className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all duration-300 overflow-hidden ${active
                                    ? 'bg-gradient-to-br from-[#f8fcf2] to-[#eff6e1] border-[#9acd32] shadow-[0_4px_12px_rgba(154,205,50,0.15)] transform scale-[1.02]'
                                    : 'bg-white border-[#e8eedd] hover:border-[#9acd32]/50 hover:bg-[#f8fcf2]/50 text-[#8ba888]'
                                    }`}
                            >
                                {active && <div className="absolute inset-0 bg-[#9acd32]/10 blur-xl rounded-full" />}
                                <span className={`text-xl mb-1 relative z-10 ${!active && 'opacity-60 grayscale-[0.3]'}`}>{icon}</span>
                                <span className={`text-xs font-black relative z-10 ${active ? 'text-[#466a3e]' : 'text-[#8ba888]'}`}>{l}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Word Types Row */}
                <div className="px-2 space-y-3 pt-4">
                    <h4 className="text-sm font-black text-[#9acd32] uppercase tracking-wider">Word Type</h4>
                </div>
                <div className="card bg-white p-3 pr-4 flex items-center justify-between border border-[#e8eedd] hover:border-[#9acd32]/30 hover:shadow-md transition-all duration-300">
                    <div className="flex items-start gap-3 w-full">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#ff6b6b]/10 to-[#ff6b6b]/5 border border-[#ff6b6b]/10 flex items-center justify-center text-2xl relative overflow-hidden flex-shrink-0 shadow-inner">
                            <span className="relative z-10 drop-shadow-sm">🚀</span>
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white/60 rounded-full blur-md"></div>
                        </div>
                        <div className="space-y-1 mt-0.5 w-full">
                            <div className="flex justify-between items-center">
                                <h4 className="text-sm font-black text-[#2d3748]">Word Types</h4>
                                <span className="text-[9px] font-bold text-white bg-[#ff6b6b] px-2 py-0.5 rounded-full shadow-sm">Required</span>
                            </div>
                            <div className="flex gap-1.5 flex-wrap">
                                {(['verb', 'i-adj', 'na-adj'] as const).map(wt => (
                                    <button
                                        key={wt}
                                        onClick={() => toggleWordType(wt)}
                                        className={`flex-1 min-h-[44px] rounded-xl border-2 text-[11px] font-bold transition-all duration-200 ${config.wordTypes.includes(wt)
                                            ? 'border-[#ff6b6b] bg-[#ff6b6b]/5 text-[#c92a2a]'
                                            : 'border-transparent bg-[#e8eedd]/50 text-[#8ba888] hover:bg-[#e8eedd]'
                                            }`}
                                    >
                                        {WORD_TYPE_LABELS[wt]}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Categories Row */}
                <div className="card bg-white p-3 pr-4 flex items-center justify-between border border-[#e8eedd] hover:border-[#9acd32]/30 hover:shadow-md transition-all duration-300">
                    <div className="flex items-start gap-3 w-full">
                        <div className="w-12 h-12 flex-shrink-0 rounded-2xl bg-gradient-to-br from-[#9acd32]/10 to-[#9acd32]/5 border border-[#9acd32]/10 flex items-center justify-center text-2xl relative overflow-hidden shadow-inner">
                            <span className="relative z-10 drop-shadow-sm">📖</span>
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white/60 rounded-full blur-md"></div>
                        </div>
                        <div className="space-y-1 mt-0.5 w-full">
                            <div className="flex justify-between items-center">
                                <h4 className="text-sm font-black text-[#2d3748]">Conjugations ({config.categories.length})</h4>
                                <div className="flex items-center gap-1">
                                    <button onClick={selectAllForms} className="text-xs font-bold text-[#9acd32] px-3 py-2 -my-2 -ml-3 min-h-[44px] transition-transform active:scale-95 flex items-center justify-center">All</button>
                                    <div className="w-[2px] h-3 bg-[#e8eedd] rounded-full opacity-70"></div>
                                    <button onClick={clearAllForms} className="text-xs font-bold text-[#8ba888] px-3 py-2 -my-2 -mr-3 min-h-[44px] transition-transform active:scale-95 flex items-center justify-center">Clear</button>
                                </div>
                            </div>
                            <div className="flex gap-1.5 flex-wrap">
                                {Object.keys(CONJ_LABELS).map(c => {
                                    const isAvailable = availableConjs.has(c as ConjugationType);
                                    if (!isAvailable) return null;
                                    return (
                                        <button
                                            key={c}
                                            onClick={() => toggleCategory(c)}
                                            className={`px-3 py-2 min-h-[40px] rounded-xl border-2 text-[10px] font-bold transition-all duration-200 whitespace-nowrap flex items-center justify-center gap-1 ${config.categories.includes(c)
                                                ? 'border-[#9acd32] bg-[#9acd32]/10 text-[#466a3e]'
                                                : 'border-transparent bg-[#e8eedd]/50 text-[#8ba888] hover:bg-[#e8eedd]'
                                                }`}
                                        >
                                            {CONJ_LABELS[c]}
                                            {isVerbOnly(c) && <span className="opacity-70 ml-0.5">(V)</span>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Settings Row */}
                <div className="card bg-white p-3 flex border border-[#e8eedd] hover:border-[#9acd32]/30 hover:shadow-md transition-all duration-300 relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-bl from-yellow-100/50 to-transparent rounded-full blur-3xl -z-0 pointer-events-none"></div>
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-tr from-[#9acd32]/10 to-transparent rounded-full blur-2xl -z-0 pointer-events-none"></div>
                    <div className="w-full relative z-10">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-black text-[#2d3748] flex items-center gap-2">⚙️ Advanced Tools</h4>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-[10px] font-bold text-[#8ba888] mb-1">
                                    <span>Session Length</span>
                                    <span>{config.batchSize} Questions</span>
                                </div>
                                <input
                                    type="range"
                                    min="5"
                                    max="30"
                                    step="5"
                                    value={config.batchSize}
                                    onChange={(e) => updateConfig({ batchSize: parseInt(e.target.value) })}
                                    className="w-full accent-[#9acd32]"
                                />
                            </div>

                            <div>
                                <span className="text-[10px] font-bold text-[#8ba888] block mb-1">Practice Mode</span>
                                <div className="flex gap-1 bg-[#e8eedd]/50 p-1 rounded-xl">
                                    {(['choice', 'input'] as const).map(m => (
                                        <button
                                            key={m}
                                            onClick={() => updateConfig({ mode: m })}
                                            className={`flex-1 min-h-[44px] rounded-lg transition-all duration-300 text-[11px] font-bold uppercase tracking-wider ${config.mode === m
                                                ? 'bg-white text-[#466a3e] shadow-sm'
                                                : 'text-[#8ba888]'
                                                }`}
                                        >
                                            {m === 'choice' ? 'Multiple Choice' : 'Keyboard Input'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] left-0 right-0 px-6 z-40 pointer-events-none max-w-md mx-auto">
                <button
                    onClick={handleStart}
                    disabled={config.categories.length === 0}
                    className={`nav-shadow w-full py-4 min-h-[56px] rounded-[2rem] font-black text-lg transition-all duration-300 pointer-events-auto ${config.categories.length === 0 ? 'bg-[#e8eedd] text-[#8ba888] cursor-not-allowed border-2 border-white' : 'bg-[#9acd32] text-white shadow-xl shadow-[#9acd32]/40 hover:-translate-y-1'}`}
                >
                    Start Session
                </button>
            </div>
        </div>
    );
}
