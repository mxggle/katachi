'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import * as wanakana from 'wanakana';

function SessionComplete({ correctCount, total, onBack }: { correctCount: number, total: number, onBack: () => void }) {
    const pct = Math.round((correctCount / total) * 100);
    const emoji = pct >= 80 ? '🎉' : pct >= 50 ? '💪' : '📖';
    const message = pct >= 80 ? 'すごい！' : pct >= 50 ? 'いい調子！' : 'がんばって！';
    return (
        <div className="max-w-lg mx-auto px-4 pt-10 pb-8 space-y-6 animate-fade-in text-center">
            <div className="glass p-6 md:p-8 rounded-2xl space-y-6">
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
                    className="w-full py-4 min-h-[48px] rounded-xl bg-[var(--surface-raised)] text-zinc-200 font-bold text-sm transition-colors active:bg-zinc-700"
                >
                    🏠 メニューに戻る
                </button>
            </div>
        </div>
    );
}

const CONJUGATION_LABELS: Record<string, string> = {
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

export default function PracticeSession() {
    const { activeSession, submitAnswer, endSession, config } = useStore();
    const [selected, setSelected] = useState<string | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [isRevealed, setIsRevealed] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const currentIdx = activeSession?.currentIndex ?? 0;
    const totalWords = activeSession?.words.length ?? 0;
    const isFinished = activeSession ? currentIdx >= totalWords : false;

    const currentItem = (activeSession && !isFinished) ? activeSession.words[currentIdx] : null;
    const word = currentItem?.word;
    const type = currentItem?.type;
    const choices = currentItem?.choices || [];
    const correctAnswer = (word && type) ? word.conjugations[type] : '';

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
        <div
            className="max-w-lg mx-auto px-4 pt-1 flex flex-col h-[100dvh] animate-fade-in"
            style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
        >
            {/* Progress bar + counter */}
            <div className="space-y-2 shrink-0">
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
            <div className="glass rounded-2xl p-5 md:p-6 text-center flex flex-col flex-1 mt-5 mb-3">
                <div className="flex-1 flex flex-col justify-center space-y-5 pb-6">
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{word.meaning}</p>
                        <h2 className="text-5xl font-bold text-zinc-100 py-2">{word.dictionary_form.kanji}</h2>
                        <p className="text-sm text-zinc-500">{word.dictionary_form.kana}</p>
                    </div>
                    <div>
                        <div className="inline-block px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20">
                            {CONJUGATION_LABELS[type] || type.replace(/_/g, ' ').toUpperCase()}
                        </div>
                    </div>
                </div>

                {/* Action area */}
                <div className="shrink-0">
                    {config.mode === 'choice' ? (
                        <div className={`grid gap-3 ${Math.max(0, ...choices.map(c => c.length)) > 7 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2'}`}>
                            {choices.map((choice) => (
                                <button
                                    key={choice}
                                    disabled={isRevealed}
                                    onClick={() => handleChoice(choice)}
                                    className={`py-3 sm:py-4 px-3 rounded-xl border ${Math.max(0, ...choices.map(c => c.length)) > 7 ? 'text-base sm:text-lg' : 'text-lg'} font-semibold transition-colors flex items-center justify-center text-center break-keep min-h-[3.5rem] leading-snug sm:leading-normal ${isRevealed
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

            <div className="text-center shrink-0">
                <button
                    onClick={() => setShowConfirm(true)}
                    className="text-zinc-500 hover:text-zinc-300 active:text-red-400 text-xs font-medium transition-colors py-2"
                >
                    やめる
                </button>
            </div>

            {/* Confirm Quit Modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="glass w-full max-w-sm p-6 rounded-2xl space-y-6 text-center shadow-2xl">
                        <div className="space-y-3">
                            <div className="text-4xl">⚠️</div>
                            <h3 className="text-xl font-bold text-zinc-100">セッションを終了しますか？</h3>
                            <p className="text-sm text-zinc-400">
                                セッションを中断してメニューに戻りますか？現在の進捗は保存されません。
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="py-4 min-h-[48px] px-4 rounded-xl font-bold text-sm bg-[var(--surface-raised)] text-zinc-300 active:bg-zinc-700 transition-colors"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={endSession}
                                className="py-4 min-h-[48px] px-4 rounded-xl font-bold text-sm bg-red-500/10 text-red-500 active:bg-red-500/20 active:text-red-400 transition-colors"
                            >
                                終了する
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
