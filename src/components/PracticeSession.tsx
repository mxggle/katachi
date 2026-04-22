'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useStore } from '@/lib/store';
import * as wanakana from 'wanakana';

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

const ADJ_CONJUGATION_LABELS: Record<string, string> = {
    polite: 'です形',
    negative_plain: 'ない形',
    negative_polite: '丁寧否定形',
    past_plain: 'た形',
    past_polite: 'でした形',
    past_negative_plain: 'なかった形',
    past_negative_polite: '丁寧过去否定形',
    te_form: 'て形',
    conditional_ba: 'ば形',
    conditional_tara: 'たら形',
};

const getConjugationLabel = (type: string, wordType: string) => {
    if (wordType === 'verb') {
        return CONJUGATION_LABELS[type] || type;
    } else {
        return ADJ_CONJUGATION_LABELS[type] || type;
    }
};

const SpeakerIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.56.276 2.56-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
        <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
    </svg>
);

export default function PracticeSession() {
    const { activeSession, submitAnswer, endSession, config } = useStore();
    const [inputValue, setInputValue] = useState('');
    const [isCorrect, setIsCorrect] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const [lastSelected, setLastSelected] = useState<string | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);

    const currentIdx = activeSession?.currentIndex ?? 0;
    const totalWords = activeSession?.words.length ?? 0;
    const isFinished = activeSession ? currentIdx >= totalWords : false;

    const currentItem = (activeSession && !isFinished) ? activeSession.words[currentIdx] : null;
    const word = currentItem?.word;
    const type = currentItem?.type;
    const choices = currentItem?.choices || [];
    const correctAnswer = (word && type) ? word.conjugations[type] : '';

    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && !audioRef.current) {
            audioRef.current = new Audio();
        }
    }, []);

    useEffect(() => {
        if (config.mode === 'input' && !showFeedback && inputRef.current) {
            inputRef.current.focus();
        }
    }, [config.mode, currentIdx, showFeedback]);

    const fallbackBrowserTTS = useCallback((text: string) => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ja-JP';
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        }
    }, []);

    const playAudio = useCallback((text: string) => {
        if (!audioRef.current) return;
        try {
            const url = `/api/tts?text=${encodeURIComponent(text)}`;
            audioRef.current.src = url;
            audioRef.current.load();
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => fallbackBrowserTTS(text));
            }
        } catch {
            fallbackBrowserTTS(text);
        }
    }, [fallbackBrowserTTS]);

    const lastPlayedIdxRef = useRef<number>(-1);

    useEffect(() => {
        if (!isFinished && word?.dictionary_form.kanji && !showFeedback && lastPlayedIdxRef.current !== currentIdx) {
            lastPlayedIdxRef.current = currentIdx;
            const timer = setTimeout(() => {
                playAudio(word.dictionary_form.kanji);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [currentIdx, isFinished, playAudio, showFeedback, word?.dictionary_form.kanji]);

    const handleChoice = (choice: string) => {
        if (showFeedback) return;
        const correct = choice === correctAnswer;
        setLastSelected(choice);
        setIsCorrect(correct);
        setShowFeedback(true);
        playAudio(correctAnswer);
    };

    const handleInputSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (showFeedback) {
            handleNext();
            return;
        }
        if (!inputValue.trim()) return;
        const correct = wanakana.toHiragana(inputValue.trim()) === wanakana.toHiragana(correctAnswer);
        setIsCorrect(correct);
        setShowFeedback(true);
        playAudio(correctAnswer);
    };

    const handleNext = () => {
        submitAnswer(isCorrect);
        setInputValue('');
        setShowFeedback(false);
        setLastSelected(null);
    };

    if (!activeSession) return null;

    const progress = totalWords > 0 ? (currentIdx / totalWords) * 100 : 0;
    const pct = Math.round((activeSession.sessionCorrect / totalWords) * 100);
    const message = pct >= 80 ? 'すごい！' : pct >= 50 ? 'いい調子！' : 'がんばって！';

    if (isFinished) {
        return (
            <div className="min-h-dvh bg-[color:var(--bg)] flex flex-col items-center justify-center p-6 sm:p-8 animate-fade-in relative overflow-hidden">
                <div className="blob-bg" />
                <div className="w-full max-w-md relative z-10 space-y-8">
                    <div className="relative rounded-[2.5rem] border-[4px] border-[color:var(--ink)] bg-white p-8 shadow-[12px_12px_0px_0px_var(--ink)] text-center space-y-6">
                        <div className="inline-flex items-center justify-center rounded-full border-[3px] border-[color:var(--ink)] bg-[#fde68a] px-5 py-2 shadow-[4px_4px_0px_0px_var(--ink)]">
                            <span className="text-xl font-bold uppercase tracking-widest">{message}</span>
                        </div>

                        <div className="space-y-2">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--muted)]">Session Summary</p>
                            <div className="flex justify-center gap-8">
                                <div className="text-center">
                                    <div className="text-5xl font-black text-[color:var(--accent)]">{pct}%</div>
                                    <div className="text-[10px] font-bold uppercase text-[color:var(--muted)] mt-1">Score</div>
                                </div>
                                <div className="w-[2px] bg-[color:var(--ink)] opacity-20" />
                                <div className="text-center">
                                    <div className="text-5xl font-black text-[color:var(--ink)]">{activeSession.sessionStreak}</div>
                                    <div className="text-[10px] font-bold uppercase text-[color:var(--muted)] mt-1">Streak</div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={endSession}
                            className="w-full py-5 rounded-[1.5rem] border-[3px] border-[color:var(--ink)] bg-[color:var(--accent)] text-2xl font-bold text-white shadow-[6px_6px_0px_0px_var(--ink)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_var(--ink)] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-dvh bg-[color:var(--bg)] flex flex-col p-4 sm:p-6 lg:p-8 animate-fade-in relative overflow-hidden">
            <div className="blob-bg" />
            
            <div className="mx-auto w-full max-w-2xl flex flex-col flex-1 relative z-10 gap-6">
                
                {/* Session Header */}
                <div className="flex items-center justify-between gap-4">
                    <button
                        onClick={() => setShowConfirm(true)}
                        className="flex items-center justify-center w-12 h-12 rounded-2xl border-[3px] border-[color:var(--ink)] bg-white shadow-[4px_4px_0px_0px_var(--ink)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_var(--ink)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <div className="flex-1 h-6 rounded-full border-[3px] border-[color:var(--ink)] bg-white shadow-[4px_4px_0px_0px_var(--ink)] overflow-hidden relative">
                        <div
                            className="absolute inset-y-0 left-0 bg-[color:var(--primary-green)] border-r-[3px] border-[color:var(--ink)] transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <div className="inline-flex items-center px-4 h-12 rounded-2xl border-[3px] border-[color:var(--ink)] bg-[#fde68a] shadow-[4px_4px_0px_0px_var(--ink)] font-bold text-sm">
                        {currentIdx + 1}/{totalWords}
                    </div>
                </div>

                {/* Main Card */}
                <div className="flex-1 flex flex-col rounded-[2.5rem] border-[4px] border-[color:var(--ink)] bg-white p-6 sm:p-10 shadow-[8px_8px_0px_0px_var(--ink)]">
                    <div className="flex items-start justify-between">
                        <div className="flex gap-2">
                            {word?.is_common && (
                                <span className="px-3 py-1 rounded-lg border-[2px] border-[color:var(--ink)] bg-[#fde68a] text-[10px] font-bold uppercase tracking-wider">Common</span>
                            )}
                            {word?.jlpt && (
                                <span className="px-3 py-1 rounded-lg border-[2px] border-[color:var(--ink)] bg-white text-[10px] font-bold uppercase tracking-wider">{word.jlpt}</span>
                            )}
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg border-[2px] border-[color:var(--ink)] bg-[color:var(--accent-soft)]">
                            <span className="text-sm">🔥</span>
                            <span className="text-sm font-bold text-[color:var(--accent)]">{activeSession.sessionStreak}</span>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[color:var(--muted)] mb-4">{word?.meaning || '---'}</p>
                        
                        <div className="relative group">
                            <h2 className="text-6xl sm:text-7xl font-bold tracking-tight text-[color:var(--ink)] mb-2">
                                {word?.dictionary_form.kanji || '---'}
                            </h2>
                            <button
                                onClick={() => playAudio(word?.dictionary_form.kanji || '')}
                                className="absolute -right-16 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-[3px] border-[color:var(--ink)] bg-[#fde68a] flex items-center justify-center shadow-[4px_4px_0px_0px_var(--ink)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_var(--ink)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
                            >
                                <SpeakerIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <p className="text-2xl font-bold text-[color:var(--muted)]">{word?.dictionary_form.kana}</p>

                        <div className="mt-10 flex flex-col items-center gap-3">
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[color:var(--muted)]">Question</span>
                            <div className="px-6 py-2 rounded-xl border-[3px] border-[color:var(--ink)] bg-[#fde68a] shadow-[4px_4px_0px_0px_var(--ink)] text-lg font-bold">
                                {type && word ? getConjugationLabel(type, word.word_type) : '---'}
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto pt-6">
                        {config.mode === 'choice' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {choices.map((choice, i) => {
                                    let variantClasses = "bg-white text-[color:var(--ink)] shadow-[4px_4px_0px_0px_var(--ink)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_var(--ink)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none";
                                    
                                    if (showFeedback) {
                                        if (choice === correctAnswer) {
                                            variantClasses = "bg-[color:var(--primary-green)] text-white shadow-[4px_4px_0px_0px_var(--ink)]";
                                        } else if (choice === lastSelected) {
                                            variantClasses = "bg-[color:var(--accent)] text-white shadow-[4px_4px_0px_0px_var(--ink)]";
                                        } else {
                                            variantClasses = "bg-white text-[color:var(--ink)] opacity-50 border-dashed shadow-none translate-x-0 translate-y-0";
                                        }
                                    }

                                    return (
                                        <button
                                            key={i}
                                            disabled={showFeedback}
                                            onClick={() => handleChoice(choice)}
                                            className={`group relative p-4 min-h-[4rem] rounded-2xl border-[3px] border-[color:var(--ink)] font-bold text-lg transition-all flex items-center justify-center text-center ${variantClasses}`}
                                        >
                                            {choice}
                                            {showFeedback && choice === correctAnswer && (
                                                <div className="absolute right-4">
                                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                                {showFeedback && (
                                    <button
                                        onClick={handleNext}
                                        className="sm:col-span-2 mt-4 py-5 rounded-2xl border-[3px] border-[color:var(--ink)] bg-[color:var(--ink)] text-white text-xl font-bold shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] transition-all hover:-translate-y-1 active:translate-y-0 active:shadow-none flex items-center justify-center gap-2"
                                    >
                                        <span>Next Question</span>
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <form onSubmit={handleInputSubmit} className="relative">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        disabled={showFeedback}
                                        placeholder="Type in Hiragana or Romaji"
                                        className={`w-full text-center text-2xl font-bold p-6 rounded-2xl border-[4px] border-[color:var(--ink)] bg-white outline-none transition-all ${
                                            showFeedback
                                                ? isCorrect
                                                    ? 'border-[color:var(--primary-green)] bg-[color:var(--primary-green)]/10'
                                                    : 'border-[color:var(--accent)] bg-[color:var(--accent)]/10'
                                                : 'focus:shadow-[6px_6px_0px_0px_var(--ink)]'
                                        }`}
                                        autoComplete="off"
                                    />
                                    {showFeedback && (
                                        <div className={`mt-4 p-4 rounded-xl border-[3px] border-[color:var(--ink)] ${isCorrect ? 'bg-[color:var(--primary-green)] text-white' : 'bg-[#fde68a] text-[color:var(--ink)]'} flex items-center justify-between`}>
                                            <div className="flex flex-col items-start">
                                                <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Correct Answer</span>
                                                <span className="text-xl font-bold">{correctAnswer}</span>
                                            </div>
                                            <button 
                                                type="button"
                                                onClick={() => playAudio(correctAnswer)}
                                                className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20"
                                            >
                                                <SpeakerIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    )}
                                </form>
                                <button
                                    onClick={showFeedback ? handleNext : handleInputSubmit}
                                    className={`w-full py-5 rounded-2xl border-[3px] border-[color:var(--ink)] font-bold text-xl shadow-[6px_6px_0px_0px_var(--ink)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_var(--ink)] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none flex items-center justify-center gap-2 ${
                                        showFeedback ? 'bg-[color:var(--ink)] text-white' : 'bg-[color:var(--accent)] text-white'
                                    }`}
                                >
                                    <span>{showFeedback ? 'Next Question' : 'Check Answer'}</span>
                                    {showFeedback && (
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Confirm Modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-[320px] rounded-[2rem] border-[4px] border-[color:var(--ink)] bg-white p-8 space-y-6 text-center shadow-[12px_12px_0px_0px_rgba(0,0,0,0.5)]">
                        <div className="text-5xl">😿</div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-[color:var(--ink)]">Quit?</h3>
                            <p className="font-bold text-[color:var(--muted)] leading-tight">Your progress in this session will be lost.</p>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            <button
                                onClick={endSession}
                                className="py-4 rounded-2xl border-[3px] border-[color:var(--ink)] bg-[color:var(--accent)] text-white font-bold shadow-[4px_4px_0px_0px_var(--ink)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
                            >
                                Quit Session
                            </button>
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="py-4 rounded-2xl border-[3px] border-[color:var(--ink)] bg-white text-[color:var(--ink)] font-bold active:bg-[color:var(--surface-soft)] transition-all"
                            >
                                Keep Going
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
