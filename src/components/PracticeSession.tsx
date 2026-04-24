'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { getConjugationLabel } from '@/lib/displayText';
import { createTtsPlaybackController, type TtsPlaybackController } from '@/lib/audioPlayback';
import { getChoiceInteraction } from '@/lib/practiceChoiceInteraction';
import * as wanakana from 'wanakana';
import Logo from '@/components/Logo';

const SpeakerIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.56.276 2.56-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
        <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
    </svg>
);

export default function PracticeSession() {
    const { activeSession, submitAnswer, endSession, config, language } = useStore();
    const { t } = useTranslation(language);
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

    const audioControllerRef = useRef<TtsPlaybackController | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && !audioControllerRef.current) {
            audioControllerRef.current = createTtsPlaybackController({
                audio: new Audio(),
                fallback: (text) => {
                    if ('speechSynthesis' in window) {
                        window.speechSynthesis.cancel();
                        const utterance = new SpeechSynthesisUtterance(text);
                        utterance.lang = 'ja-JP';
                        utterance.rate = 0.9;
                        window.speechSynthesis.speak(utterance);
                    }
                },
                stopFallback: () => {
                    if ('speechSynthesis' in window) {
                        window.speechSynthesis.cancel();
                    }
                },
            });
        }

        return () => {
            audioControllerRef.current?.stop();
        };
    }, []);

    useEffect(() => {
        if (config.mode === 'input' && !showFeedback && inputRef.current) {
            inputRef.current.focus();
        }
    }, [config.mode, currentIdx, showFeedback]);

    const playAudio = useCallback((text: string) => {
        void audioControllerRef.current?.play(text);
    }, []);

    useEffect(() => {
        if (isFinished || showFeedback) {
            return;
        }

        void audioControllerRef.current?.preload(word?.dictionary_form.kanji || '');
        void audioControllerRef.current?.preload(correctAnswer);
    }, [correctAnswer, isFinished, showFeedback, word?.dictionary_form.kanji]);

    useEffect(() => {
        if (!activeSession || isFinished) {
            return;
        }

        const currentAndUpcomingItems = activeSession.words.slice(currentIdx);
        const textsToPreload = currentAndUpcomingItems.flatMap((item) => [
            item.word.dictionary_form.kanji,
            item.word.conjugations[item.type],
        ]);

        void audioControllerRef.current?.preloadMany(textsToPreload, 2);
    }, [activeSession, currentIdx, isFinished]);

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

    const handleChoiceButtonClick = (choice: string) => {
        const interaction = getChoiceInteraction({ choice, correctAnswer, showFeedback });

        if (interaction.action === 'replay') {
            playAudio(correctAnswer);
            return;
        }

        if (interaction.action === 'submit') {
            handleChoice(choice);
        }
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
        audioControllerRef.current?.stop();
        submitAnswer(isCorrect);
        setInputValue('');
        setShowFeedback(false);
        setLastSelected(null);
    };

    const handleEndSession = () => {
        audioControllerRef.current?.stop();
        endSession();
    };

    if (!activeSession) return null;

    const progress = totalWords > 0 ? (currentIdx / totalWords) * 100 : 0;
    const pct = Math.round((activeSession.sessionCorrect / totalWords) * 100);
    const message = pct >= 80 ? 'すごい！' : pct >= 50 ? 'いい調子！' : 'がんばって！';

    if (isFinished) {
        return (
            <div className="h-dvh bg-[color:var(--bg)] flex flex-col items-center justify-center p-4 sm:p-8 animate-fade-in relative overflow-hidden">
                <div className="blob-bg" />
                <div className="w-full max-w-md relative z-10">
                    <div className="relative rounded-[2.5rem] border-[4px] border-[color:var(--ink)] bg-white p-6 sm:p-8 shadow-[8px_8px_0px_0px_var(--ink)] text-center space-y-6 flex flex-col items-center">
                        <Logo size={100} className="text-[color:var(--ink)]" />
                        
                        <div className="inline-flex items-center justify-center rounded-full border-[3px] border-[color:var(--ink)] bg-[#fde68a] px-5 py-1.5 shadow-[4px_4px_0px_0px_var(--ink)]">
                            <span className="text-lg font-bold uppercase tracking-widest">{message}</span>
                        </div>

                        <div className="space-y-1 w-full">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--muted)]">{t('sessionSummary')}</p>
                            <div className="flex justify-center gap-6">
                                <div className="text-center">
                                    <div className="text-4xl font-black text-[color:var(--accent)]">{pct}%</div>
                                    <div className="text-[9px] font-bold uppercase text-[color:var(--muted)] mt-0.5">{t('score')}</div>
                                </div>
                                <div className="w-[1.5px] bg-[color:var(--ink)] opacity-10" />
                                <div className="text-center">
                                    <div className="text-4xl font-black text-[color:var(--ink)]">{activeSession.sessionStreak}</div>
                                    <div className="text-[9px] font-bold uppercase text-[color:var(--muted)] mt-0.5">{t('streak')}</div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleEndSession}
                            className="w-full py-4 rounded-[1.25rem] border-[3px] border-[color:var(--ink)] bg-[color:var(--accent)] text-xl font-bold text-white shadow-[4px_4px_0px_0px_var(--ink)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_var(--ink)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
                        >
                            {t('backToHome')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-dvh bg-[color:var(--bg)] flex flex-col p-3 sm:p-6 animate-fade-in relative overflow-hidden">
            <div className="blob-bg" />
            
            <div className="mx-auto w-full max-w-2xl flex flex-col h-full relative z-10 gap-3">
                
                {/* Compact Session Header */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            audioControllerRef.current?.stop();
                            setShowConfirm(true);
                        }}
                        className="flex items-center justify-center w-10 h-10 rounded-xl border-[2px] border-[color:var(--ink)] bg-white shadow-[2px_2px_0px_0px_var(--ink)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <div className="flex-1 h-4 rounded-full border-[2px] border-[color:var(--ink)] bg-white shadow-[2px_2px_0px_0px_var(--ink)] overflow-hidden relative">
                        <div
                            className="absolute inset-y-0 left-0 bg-[color:var(--primary-green)] border-r-[2px] border-[color:var(--ink)] transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <div className="inline-flex items-center px-3 h-10 rounded-xl border-[2px] border-[color:var(--ink)] bg-[#fde68a] shadow-[2px_2px_0px_0px_var(--ink)] font-bold text-xs">
                        {currentIdx + 1}/{totalWords}
                    </div>
                </div>

                {/* Main Card - Reduced padding and optimized spacing */}
                <div className="flex-1 flex flex-col rounded-[2rem] border-[3px] border-[color:var(--ink)] bg-white p-4 sm:p-8 shadow-[4px_4px_0px_0px_var(--ink)] min-h-0">
                    <div className="flex items-center justify-between gap-2 shrink-0">
                        <div className="flex gap-1.5 overflow-hidden">
                            {word?.is_common && (
                                <span className="px-2 py-0.5 rounded-md border-[1.5px] border-[color:var(--ink)] bg-[#fde68a] text-[9px] font-bold uppercase tracking-wider truncate">{t('common')}</span>
                            )}
                            {word?.jlpt && (
                                <span className="px-2 py-0.5 rounded-md border-[1.5px] border-[color:var(--ink)] bg-white text-[9px] font-bold uppercase tracking-wider shrink-0">{word.jlpt}</span>
                            )}
                        </div>
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md border-[1.5px] border-[color:var(--ink)] bg-[color:var(--accent-soft)] shrink-0">
                            <span className="text-xs">🔥</span>
                            <span className="text-xs font-bold text-[color:var(--accent)]">{activeSession.sessionStreak}</span>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center text-center py-2 min-h-0">
                        <p className="text-[10px] sm:text-sm font-bold uppercase tracking-[0.15em] text-[color:var(--muted)] mb-1 sm:mb-2 line-clamp-2 px-4">{word?.meaning || '---'}</p>
                        
                        <div className="flex items-center justify-center w-full gap-3 px-4">
                            <h2 className="text-4xl sm:text-6xl font-bold tracking-tight text-[color:var(--ink)] break-all leading-tight">
                                {word?.dictionary_form.kanji || '---'}
                            </h2>
                            <button
                                onClick={() => playAudio(word?.dictionary_form.kanji || '')}
                                className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border-[2.5px] border-[color:var(--ink)] bg-[#fde68a] flex items-center justify-center shadow-[2.5px_2.5px_0px_0px_var(--ink)] active:translate-x-[1.5px] active:translate-y-[1.5px] active:shadow-none transition-all shrink-0"
                            >
                                <SpeakerIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                        </div>
                        <p className="text-lg sm:text-xl font-bold text-[color:var(--muted)] mt-0.5 sm:mt-1">{word?.dictionary_form.kana}</p>

                        <div className="mt-4 sm:mt-6 flex flex-col items-center gap-1.5 shrink-0">
                            <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--muted)]">{t('question')}</span>
                            <div className="px-4 py-1.5 rounded-lg border-[2.5px] border-[color:var(--ink)] bg-[#fde68a] shadow-[3px_3px_0px_0px_var(--ink)] text-sm sm:text-lg font-black">
                                {type && word ? getConjugationLabel(type, word.word_type, language) : '---'}
                            </div>
                        </div>
                    </div>

                    {/* Action Area - Responsive layout for different counts/modes */}
                    <div className="mt-auto pt-4 shrink-0">
                        {config.mode === 'choice' ? (
                            <div className="flex flex-col gap-2.5">
                                <div className={`grid gap-2 sm:gap-3 ${choices.length > 4 || choices.some(c => c.length > 8) ? 'grid-cols-1' : 'grid-cols-2'}`}>
                                    {choices.map((choice, i) => {
                                        const interaction = getChoiceInteraction({ choice, correctAnswer, showFeedback });
                                        let variantClasses = "bg-white text-[color:var(--ink)] shadow-[3px_3px_0px_0px_var(--ink)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none";
                                        
                                        if (showFeedback) {
                                            if (choice === correctAnswer) {
                                                variantClasses = "bg-[color:var(--primary-green)] text-white shadow-[2px_2px_0px_0px_var(--ink)] scale-[0.98] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_var(--ink)]";
                                            } else if (choice === lastSelected) {
                                                variantClasses = "bg-[color:var(--accent)] text-white shadow-[2px_2px_0px_0px_var(--ink)] scale-[0.98]";
                                            } else {
                                                variantClasses = "bg-white text-[color:var(--ink)] opacity-30 border-dashed shadow-none translate-x-0 translate-y-0 grayscale";
                                            }
                                        } else {
                                            variantClasses += " hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_var(--ink)]";
                                        }

                                        return (
                                            <button
                                                key={i}
                                                disabled={interaction.disabled}
                                                onClick={() => handleChoiceButtonClick(choice)}
                                                className={`group relative p-2.5 min-h-[3rem] sm:min-h-[3.5rem] rounded-xl border-[2.5px] border-[color:var(--ink)] font-bold text-sm sm:text-base transition-all flex items-center justify-center text-center leading-none ${variantClasses}`}
                                            >
                                                {showFeedback && choice === correctAnswer && (
                                                    <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-90">
                                                        <SpeakerIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                                    </div>
                                                )}
                                                <span className={`whitespace-nowrap overflow-hidden text-ellipsis ${showFeedback && choice === correctAnswer ? 'px-7' : 'px-1'}`}>{choice}</span>
                                                {showFeedback && choice === correctAnswer && (
                                                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                                {showFeedback && (
                                    <button
                                        onClick={handleNext}
                                        className="w-full py-3.5 sm:py-4 rounded-xl border-[3px] border-[color:var(--ink)] bg-[color:var(--ink)] text-white text-base sm:text-xl font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2"
                                    >
                                        <span>{t('nextQuestion')}</span>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <form onSubmit={handleInputSubmit} className="relative">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        disabled={showFeedback}
                                        placeholder={t('placeholder')}
                                        className={`w-full text-center text-xl sm:text-2xl font-bold p-3.5 sm:p-5 rounded-xl border-[3px] border-[color:var(--ink)] bg-white outline-none transition-all ${
                                            showFeedback
                                                ? isCorrect
                                                    ? 'border-[color:var(--primary-green)] bg-[color:var(--primary-green)]/10'
                                                    : 'border-[color:var(--accent)] bg-[color:var(--accent)]/10'
                                                : 'focus:shadow-[4px_4px_0px_0px_var(--ink)]'
                                        }`}
                                        autoComplete="off"
                                    />
                                    {showFeedback && (
                                        <div className={`mt-3 p-3 rounded-lg border-[2px] border-[color:var(--ink)] ${isCorrect ? 'bg-[color:var(--primary-green)] text-white' : 'bg-[#fde68a] text-[color:var(--ink)]'} flex items-center justify-between`}>
                                            <div className="flex flex-col items-start overflow-hidden">
                                                <span className="text-[8px] font-black uppercase tracking-widest opacity-70 leading-none mb-1">{t('correctAnswer')}</span>
                                                <span className="text-base font-bold truncate w-full">{correctAnswer}</span>
                                            </div>
                                            <button 
                                                type="button"
                                                onClick={() => playAudio(correctAnswer)}
                                                className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center shrink-0 ml-2"
                                            >
                                                <SpeakerIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </form>
                                <button
                                    onClick={showFeedback ? handleNext : handleInputSubmit}
                                    className={`w-full py-3.5 sm:py-4 rounded-xl border-[3px] border-[color:var(--ink)] font-bold text-base sm:text-xl shadow-[4px_4px_0px_0px_var(--ink)] transition-all active:translate-x-[3px] active:translate-y-[3px] active:shadow-none flex items-center justify-center gap-2 ${
                                        showFeedback ? 'bg-[color:var(--ink)] text-white' : 'bg-[color:var(--accent)] text-white'
                                    }`}
                                >
                                    <span>{showFeedback ? t('nextQuestion') : t('checkAnswer')}</span>
                                    {showFeedback && (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
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
                    <div className="w-full max-w-[280px] rounded-[1.5rem] border-[3px] border-[color:var(--ink)] bg-white p-6 space-y-4 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)]">
                        <div className="text-4xl">😿</div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-black text-[color:var(--ink)]">{t('quit')}</h3>
                            <p className="text-xs font-bold text-[color:var(--muted)] leading-tight">{t('quitMessage')}</p>
                        </div>
                        <div className="grid grid-cols-1 gap-2 pt-2">
                            <button
                                onClick={handleEndSession}
                                className="py-3 rounded-xl border-[2px] border-[color:var(--ink)] bg-[color:var(--accent)] text-white text-sm font-bold shadow-[3px_3px_0px_0px_var(--ink)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                            >
                                {t('quitSession')}
                            </button>
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="py-3 rounded-xl border-[2px] border-[color:var(--ink)] bg-white text-[color:var(--ink)] text-sm font-bold active:bg-[color:var(--surface-soft)] transition-all"
                            >
                                {t('keepGoing')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
