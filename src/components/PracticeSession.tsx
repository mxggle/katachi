'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { generateDistractors } from '@/lib/distractorEngine';
import * as wanakana from 'wanakana';

function SessionComplete({ correctCount, total, onBack }: { correctCount: number, total: number, onBack: () => void }) {
    const pct = Math.round((correctCount / total) * 100);
    const emoji = pct >= 80 ? '🎉' : pct >= 50 ? '💪' : '📖';
    const message = pct >= 80 ? 'すごい！' : pct >= 50 ? 'いい調子！' : 'がんばって！';
    return (
        <div className="max-w-lg mx-auto px-5 pt-16 space-y-8 animate-fade-in text-center">
            <div className="glass p-8 rounded-2xl space-y-6">
                <div className="text-5xl">{emoji}</div>
                <h2 className="text-2xl font-bold text-zinc-100">{message}</h2>
                <div className="space-y-1">
                    <div className="text-5xl font-bold text-amber-400">
                        {correctCount}<span className="text-zinc-600 text-3xl">/{total}</span>
                    </div>
                    <p className="text-sm text-zinc-500">正答率 {pct}%</p>
                </div>
                <button
                    onClick={onBack}
                    className="w-full py-3.5 rounded-xl bg-[var(--surface-raised)] text-zinc-300 font-semibold text-sm transition-colors active:bg-zinc-700"
                >
                    🏠 メニューに戻る
                </button>
            </div>
        </div>
    );
}

export default function PracticeSession() {
    const { activeSession, submitAnswer, endSession, config } = useStore();
    const [selected, setSelected] = useState<string | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [isRevealed, setIsRevealed] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    const currentIdx = activeSession?.currentIndex ?? 0;
    const totalWords = activeSession?.words.length ?? 0;
    const isFinished = activeSession ? currentIdx >= totalWords : false;

    const currentItem = (activeSession && !isFinished) ? activeSession.words[currentIdx] : null;
    const word = currentItem?.word;
    const type = currentItem?.type;
    const correctAnswer = (word && type) ? word.conjugations[type] : '';

    const choices = useMemo(() => {
        if (!word || !type || config.mode !== 'choice') return [];
        const distractors = generateDistractors(word, type);
        return [correctAnswer, ...distractors].sort(() => Math.random() - 0.5);
    }, [word, type, config.mode, correctAnswer]);

    const handleChoice = (choice: string) => {
        if (isRevealed) return;
        const correct = choice === correctAnswer;
        setSelected(choice);
        setIsCorrect(correct);
        setIsRevealed(true);
    };

    const handleInputSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isRevealed) return;
        const correct = inputValue === correctAnswer;
        setIsCorrect(correct);
        setIsRevealed(true);
    };

    const handleNext = () => {
        submitAnswer(isCorrect);
        setSelected(null);
        setInputValue('');
        setIsRevealed(false);
    };

    if (!activeSession) return null;

    if (isFinished) {
        const correctCount = activeSession.results.filter(r => r).length;
        return <SessionComplete correctCount={correctCount} total={totalWords} onBack={endSession} />;
    }

    if (!word || !type) return null;

    const progress = totalWords > 0 ? (currentIdx / totalWords) * 100 : 0;

    return (
        <div className="max-w-lg mx-auto px-5 pt-3 pb-8 space-y-5 animate-fade-in">
            {/* Progress bar + counter */}
            <div className="space-y-2">
                <div className="flex justify-between items-center text-xs text-zinc-500 font-medium">
                    <span>📝 {currentIdx + 1} / {totalWords}</span>
                    <span>
                        🔥 <span className="text-amber-400 font-semibold">{activeSession.sessionStreak}</span> 連続
                    </span>
                </div>
                <div className="w-full h-1.5 bg-[var(--surface-raised)] rounded-full overflow-hidden">
                    <div
                        className="h-full bg-amber-500 transition-all duration-300 rounded-full"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Word card */}
            <div className="glass rounded-2xl p-6 text-center space-y-5">
                <div className="space-y-1">
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{word.meaning}</p>
                    <h2 className="text-5xl font-bold text-zinc-100 py-2">{word.dictionary_form.kanji}</h2>
                    <p className="text-sm text-zinc-500">{word.dictionary_form.kana}</p>
                </div>
                <div className="inline-block px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20">
                    {type.replace(/_/g, ' ').toUpperCase()}
                </div>

                {/* Action area */}
                <div className="pt-2">
                    {config.mode === 'choice' ? (
                        <div className="grid grid-cols-2 gap-3">
                            {choices.map((choice) => (
                                <button
                                    key={choice}
                                    disabled={isRevealed}
                                    onClick={() => handleChoice(choice)}
                                    className={`py-4 px-3 rounded-xl border text-lg font-semibold transition-colors ${isRevealed
                                        ? choice === correctAnswer
                                            ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
                                            : choice === selected
                                                ? 'border-red-500/50 bg-red-500/10 text-red-300'
                                                : 'border-[var(--border)] text-zinc-700'
                                        : 'border-[var(--border)] text-zinc-300 active:bg-[var(--surface-raised)]'
                                    }`}
                                >
                                    {choice}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <form onSubmit={handleInputSubmit}>
                            <input
                                autoFocus
                                type="text"
                                disabled={isRevealed}
                                value={inputValue}
                                onChange={(e) => setInputValue(wanakana.toHiragana(e.target.value))}
                                placeholder="ひらがなで入力..."
                                className={`w-full py-4 px-6 rounded-xl bg-[var(--bg)] border text-xl font-semibold text-center focus:outline-none transition-colors ${isRevealed
                                    ? isCorrect ? 'border-emerald-500/50 text-emerald-300' : 'border-red-500/50 text-red-300'
                                    : 'border-[var(--border)] text-zinc-200 focus:border-amber-500/50 placeholder:text-zinc-700'
                                }`}
                            />
                        </form>
                    )}
                </div>

                {/* Feedback */}
                {isRevealed && (
                    <div className="space-y-4 pt-2 animate-fade-in">
                        {!isCorrect && (
                            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 text-left space-y-1">
                                <p className="text-xs font-semibold text-red-400 uppercase tracking-wider">❌ 正解</p>
                                <p className="text-lg font-bold text-zinc-200">{correctAnswer}</p>
                                <p className="text-xs text-zinc-500">{word.group}</p>
                            </div>
                        )}
                        {isCorrect && (
                            <p className="text-emerald-400 font-semibold text-sm">✅ 正解！</p>
                        )}
                        <button
                            onClick={handleNext}
                            className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-colors active:scale-[0.98] ${isCorrect
                                ? 'bg-emerald-600 active:bg-emerald-700 text-white'
                                : 'bg-[var(--surface-raised)] text-zinc-300 active:bg-zinc-700'
                            }`}
                        >
                            次へ →
                        </button>
                    </div>
                )}
            </div>

            <div className="text-center">
                <button
                    onClick={() => { if (confirm('セッションを終了しますか？')) endSession() }}
                    className="text-zinc-700 active:text-red-400 text-xs font-medium transition-colors py-2"
                >
                    やめる
                </button>
            </div>
        </div>
    );
}
