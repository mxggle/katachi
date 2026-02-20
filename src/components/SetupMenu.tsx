'use client';

import { useState } from 'react';
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
    const { config, updateConfig, startSession } = useStore();
    const [activeTab, setActiveTab] = useState<'target' | 'forms' | 'settings'>('target');

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
        <div className="max-w-lg mx-auto px-4 pb-4 space-y-6 animate-fade-in flex flex-col min-h-full">
            <div className="text-center space-y-1 pt-1 pb-1">
                <h1 className="text-2xl font-bold text-zinc-100">
                    セットアップ
                </h1>
                <p className="text-sm text-zinc-500">Choose your challenge</p>
            </div>

            <div className="flex bg-[var(--bg)] p-1 rounded-xl">
                {(['target', 'forms', 'settings'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-3.5 min-h-[44px] rounded-lg text-sm font-medium transition-colors ${activeTab === tab
                            ? 'bg-[var(--surface-raised)] text-zinc-200'
                            : 'text-zinc-600'
                            }`}
                    >
                        {tab === 'target' && '対象'}
                        {tab === 'forms' && `活用形 (${config.categories.length})`}
                        {tab === 'settings' && '設定'}
                    </button>
                ))}
            </div>

            <div className="glass rounded-2xl p-4 sm:p-5 min-h-[320px] mb-4">
                {activeTab === 'target' && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Level Selection */}
                        <section className="space-y-3">
                            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">レベル</h2>
                            <div className="flex gap-2">
                                {(['N5', 'N4', 'N3'] as const).map(l => (
                                    <button
                                        key={l}
                                        onClick={() => toggleLevel(l)}
                                        className={`flex-1 py-4 min-h-[48px] rounded-xl border text-sm font-semibold transition-colors ${config.leves.includes(l)
                                            ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                                            : 'border-[var(--border)] text-zinc-600 active:text-zinc-400'
                                            }`}
                                    >
                                        {l}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Word Type Selection */}
                        <section className="space-y-3">
                            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">品詞</h2>
                            <div className="flex gap-2">
                                {(['verb', 'i-adj', 'na-adj'] as const).map(wt => (
                                    <button
                                        key={wt}
                                        onClick={() => toggleWordType(wt)}
                                        className={`flex-1 py-4 min-h-[48px] rounded-xl border text-sm font-semibold transition-colors ${config.wordTypes.includes(wt)
                                            ? 'border-violet-500/40 bg-violet-500/10 text-violet-300'
                                            : 'border-[var(--border)] text-zinc-600 active:text-zinc-400'
                                            }`}
                                    >
                                        {WORD_TYPE_LABELS[wt]}
                                    </button>
                                ))}
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === 'forms' && (
                    <div className="space-y-6 animate-fade-in flex flex-col h-full">
                        {/* Category Selection */}
                        <section className="space-y-3 flex-1">
                            <div className="flex justify-between items-center px-1">
                                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">活用形を選択</h2>
                                <div className="flex gap-3 text-sm">
                                    <button onClick={selectAllForms} className="text-amber-500 font-semibold active:text-amber-400 transition-colors py-2 px-1">全選択</button>
                                    <button onClick={clearAllForms} className="text-zinc-500 hover:text-zinc-300 transition-colors py-2 px-1">クリア</button>
                                </div>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                {Object.keys(CONJ_LABELS).map(c => {
                                    const isAvailable = availableConjs.has(c as ConjugationType);
                                    if (!isAvailable) return null;
                                    return (
                                        <button
                                            key={c}
                                            onClick={() => toggleCategory(c)}
                                            className={`px-3 py-3 min-h-[44px] rounded-xl border text-xs transition-colors whitespace-nowrap ${config.categories.includes(c)
                                                ? 'border-teal-500/40 bg-teal-500/10 text-teal-300'
                                                : 'border-[var(--border)] text-zinc-600 active:text-zinc-400'
                                                }`}
                                        >
                                            {CONJ_LABELS[c]}
                                            {isVerbOnly(c) && <span className="text-[10px] opacity-70 ml-1">(V)</span>}
                                        </button>
                                    );
                                })}
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Batch Size */}
                        <section className="space-y-3">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">カード数</h2>
                                <span className="text-sm text-amber-400 font-semibold">{config.batchSize}</span>
                            </div>
                            <input
                                type="range"
                                min="5"
                                max="30"
                                step="5"
                                value={config.batchSize}
                                onChange={(e) => updateConfig({ batchSize: parseInt(e.target.value) })}
                                className="w-full accent-amber-500 min-h-[44px]"
                            />
                        </section>

                        {/* Mode Selector */}
                        <section className="space-y-3">
                            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">モード</h2>
                            <div className="flex bg-[var(--bg)] p-1 rounded-xl">
                                {(['choice', 'input'] as const).map(m => (
                                    <button
                                        key={m}
                                        onClick={() => updateConfig({ mode: m })}
                                        className={`flex-1 py-3 min-h-[48px] rounded-lg transition-colors text-sm font-medium ${config.mode === m
                                            ? 'bg-[var(--surface-raised)] text-zinc-200'
                                            : 'text-zinc-600'
                                            }`}
                                    >
                                        {m === 'choice' ? '選択' : '入力'}
                                    </button>
                                ))}
                            </div>
                        </section>
                    </div>
                )}
            </div>

            <div className="mt-auto">
                <button
                    onClick={handleStart}
                    disabled={config.categories.length === 0}
                    className={`w-full py-4 min-h-[56px] rounded-2xl font-bold text-base transition-colors ${config.categories.length === 0 ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-amber-500 active:bg-amber-600 text-black'}`}
                >
                    はじめる
                </button>
            </div>
        </div>
    );
}
