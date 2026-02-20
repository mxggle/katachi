'use client';

import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/lib/store';
import * as wanakana from 'wanakana';

// SessionComplete component is no longer used directly, its logic is inlined into PracticeSession
// function SessionComplete({ correctCount, total, onBack }: { correctCount: number, total: number, onBack: () => void }) {
//     const pct = Math.round((correctCount / total) * 100);
//     const emoji = pct >= 80 ? '🎉' : pct >= 50 ? '💪' : '📖';
//     const message = pct >= 80 ? 'すごい！' : pct >= 50 ? 'いい調子！' : 'がんばって！';
//     return (
//         <div className="max-w-lg mx-auto px-4 pt-10 pb-8 space-y-6 animate-fade-in text-center">
//             <div className="glass p-6 md:p-8 rounded-[2rem] space-y-6">
//                 <div className="flex justify-center mb-2">
//                     <img src="/mascot.png" alt="Mascot" className="w-32 h-32 object-contain animate-bounce drop-shadow-md" />
//                 </div>
//                 <h2 className="text-2xl font-bold text-slate-800">{message}</h2>
//                 <div className="space-y-1">
//                     <div className="text-6xl font-black text-amber-500">
//                         {correctCount}<span className="text-slate-400 text-3xl font-bold">/{total}</span>
//                     </div>
//                     <p className="text-sm font-medium text-slate-500">正答率 {pct}%</p>
//                 </div>
//                 <button
//                     onClick={onBack}
//                     className="w-full py-4 min-h-[48px] rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-lg transition-colors hover:shadow-md"
//                 >
//                     🏠 メニューに戻る
//                 </button>
//             </div>
//         </div>
//     );
// }

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
    past_negative_polite: '丁寧過去否定形',
    te_form: 'て形',
    conditional_ba: 'ば形',
    conditional_tara: 'たら形',
};

const WORD_GROUP_TAGS: Record<string, { label: string, colorClass: string }> = {
    'godan': { label: '1グループ', colorClass: 'bg-blue-50 text-blue-600 border-blue-200 shadow-sm' },
    'ichidan': { label: '2グループ', colorClass: 'bg-indigo-50 text-indigo-600 border-indigo-200 shadow-sm' },
    'suru': { label: '3グループ', colorClass: 'bg-violet-50 text-violet-600 border-violet-200 shadow-sm' },
    'kuru': { label: '3グループ', colorClass: 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200 shadow-sm' },
    'i-adj': { label: 'い形容詞', colorClass: 'bg-rose-50 text-rose-600 border-rose-200 shadow-sm' },
    'na-adj': { label: 'な形容詞', colorClass: 'bg-orange-50 text-orange-600 border-orange-200 shadow-sm' },
};

// New color mapping for word groups
const WORD_GROUP_COLORS: Record<string, string> = {
    'godan': 'bg-[#e8eedd] text-[#466a3e]',
    'ichidan': 'bg-[#e8eedd] text-[#466a3e]',
    'suru': 'bg-[#e8eedd] text-[#466a3e]',
    'kuru': 'bg-[#e8eedd] text-[#466a3e]',
    'i-adj': 'bg-[#e8eedd] text-[#466a3e]',
    'na-adj': 'bg-[#e8eedd] text-[#466a3e]',
};

// Combined conjugation labels
const CONJ_LABELS: Record<string, string> = {
    ...CONJUGATION_LABELS,
    ...ADJ_CONJUGATION_LABELS,
};

const SpeakerIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.56.276 2.56-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
        <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
    </svg>
);

export default function PracticeSession() {
    const { activeSession, submitAnswer, endSession, config } = useStore();
    const [selected, setSelected] = useState<string | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [isRevealed, setIsRevealed] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false); // New state for feedback
    const [lastSelected, setLastSelected] = useState<string | null>(null); // New state for last selected choice

    const inputRef = useRef<HTMLInputElement>(null); // Ref for input field

    const currentIdx = activeSession?.currentIndex ?? 0;
    const totalWords = activeSession?.words.length ?? 0;
    const isFinished = activeSession ? currentIdx >= totalWords : false;

    const currentItem = (activeSession && !isFinished) ? activeSession.words[currentIdx] : null;
    const word = currentItem?.word;
    const type = currentItem?.type;
    const choices = currentItem?.choices || [];
    const correctAnswer = (word && type) ? word.conjugations[type] : '';

    // Ref to hold a persistent audio object to satisfy mobile browser policies
    // requiring audio to be played from a direct user interaction context
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && !audioRef.current) {
            audioRef.current = new Audio();
        }
    }, []);

    useEffect(() => {
        if (config.mode === 'input' && !isRevealed && inputRef.current) {
            inputRef.current.focus();
        }
    }, [config.mode, isRevealed, currentIdx]); // Focus input on new question

    const playAudio = (text: string) => {
        if (!audioRef.current) return;

        try {
            // Use the new, robust Edge Neural API generated server-side
            const url = `/api/tts?text=${encodeURIComponent(text)}`;
            audioRef.current.src = url;
            audioRef.current.load(); // Important for iOS

            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch((error) => {
                    console.error("Audio playback failed, attempting fallbacks:", error);
                    fallbackGoogleTTS(text);
                });
            }
        } catch (e) {
            fallbackGoogleTTS(text);
        }
    };

    const fallbackGoogleTTS = (text: string) => {
        if (!audioRef.current) return;
        try {
            const url = `https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=ja&q=${encodeURIComponent(text)}`;
            audioRef.current.src = url;
            audioRef.current.load();
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => fallbackBrowserTTS(text));
            }
        } catch (e) {
            fallbackBrowserTTS(text);
        }
    };

    const fallbackBrowserTTS = (text: string) => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ja-JP';
            utterance.rate = 0.9;

            const setVoice = () => {
                const voices = window.speechSynthesis.getVoices();
                const jaVoices = voices.filter(v => v.lang.includes('ja') || v.lang === 'ja-JP');
                if (jaVoices.length > 0) {
                    utterance.voice = jaVoices.find(v => v.name.includes('Google') || v.name.includes('Premium')) || jaVoices[0]!;
                }
            };

            setVoice();
            window.speechSynthesis.speak(utterance);
        }
    };

    const lastPlayedIdxRef = useRef<number>(-1);

    useEffect(() => {
        if (!isFinished && word?.dictionary_form.kanji && !showFeedback && lastPlayedIdxRef.current !== currentIdx) {
            lastPlayedIdxRef.current = currentIdx;
            const timer = setTimeout(() => {
                playAudio(word.dictionary_form.kanji);
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [currentIdx, isFinished, word?.dictionary_form.kanji, showFeedback]);

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
        const correct = wanakana.toHiragana(inputValue) === wanakana.toHiragana(correctAnswer);
        setIsCorrect(correct);
        setShowFeedback(true);
        playAudio(correctAnswer);
    };

    const handleNext = () => {
        submitAnswer(isCorrect);
        setSelected(null);
        setInputValue('');
        setIsRevealed(false);
        setShowFeedback(false); // Reset feedback state
        setLastSelected(null); // Reset last selected choice
    };

    if (!activeSession) return null;

    const progress = totalWords > 0 ? (currentIdx / totalWords) * 100 : 0;
    const pct = Math.round((activeSession.sessionCorrect / totalWords) * 100);
    const message = pct >= 80 ? 'すごい！' : pct >= 50 ? 'いい調子！' : 'がんばって！';

    return (
        <div className="max-w-xl mx-auto px-4 flex flex-col h-[100dvh] overflow-y-auto animate-fade-in relative">
            <div className="absolute inset-0 bg-white pointer-events-none rounded-b-[3rem] shadow-sm z-0"></div>
            {/* Session Complete Screen */}
            {isFinished && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-between p-4 md:p-6 bg-[#e8eedd] overflow-hidden">
                    <div className="w-full max-w-sm flex-1 flex flex-col items-center justify-center relative min-h-0 pt-4 md:pt-8 pb-4">
                        <div className="relative w-full aspect-square max-h-[45vh] lg:max-h-[50vh] rounded-[3rem] overflow-hidden shadow-2xl border-[8px] border-white/60 bg-white">
                            <img
                                src="/header_tiger.png"
                                alt="Tiger Mascot"
                                className="w-full h-full object-cover animate-bounce"
                                style={{ animationDuration: '4s' }}
                            />
                        </div>
                    </div>
                    <div className="card bg-white w-full max-w-sm p-6 md:p-8 text-center space-y-6 shadow-2xl rounded-[2.5rem] relative z-20 shrink-0 mb-2 md:mb-4 border-2 border-[#e8eedd]/30">
                        <h2 className="text-4xl font-black text-[#2d3748] tracking-tight">{message}</h2>
                        <div className="flex justify-between items-center bg-[#f8faf6] p-5 rounded-3xl border-2 border-[#e8eedd]/50">
                            <div className="space-y-1 flex-1">
                                <p className="text-[11px] font-bold text-[#8ba888] uppercase tracking-wider">Score</p>
                                <div className="text-4xl font-black text-[#ff6b6b]">
                                    {Math.round((activeSession.sessionCorrect / totalWords) * 100)}<span className="text-2xl">%</span>
                                </div>
                            </div>
                            <div className="w-0.5 h-14 bg-[#e8eedd] rounded-full opacity-60"></div>
                            <div className="space-y-1 flex-1">
                                <p className="text-[11px] font-bold text-[#8ba888] uppercase tracking-wider">Streak</p>
                                <div className="text-4xl font-black text-[#9acd32]">
                                    {activeSession.sessionStreak}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={endSession}
                            className="mt-2 w-full py-4 min-h-[64px] rounded-[1.8rem] font-black text-xl bg-[#9acd32] text-white shadow-xl shadow-[#9acd32]/30 active:scale-95 transition-all hover:bg-[#8ac220]"
                        >
                            Continue
                        </button>
                    </div>
                </div>
            )}

            {/* Header with Leave button */}
            <div className="flex justify-between items-center pt-2 pb-1 relative z-10">
                <button
                    onClick={() => setShowConfirm(true)}
                    className="flex items-center justify-center w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-white shadow-sm hover:shadow active:scale-95 transition-all text-slate-400 hover:text-red-500 hover:bg-red-50"
                    aria-label="セッションをやめる"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="space-y-1.5 shrink-0 relative z-10 pt-1 pb-3">
                <div className="flex justify-between items-center text-xs font-bold text-[#8ba888]">
                    <div className="flex items-center gap-2">
                        <span>📝 {currentIdx + 1} / {totalWords}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-[#e8eedd] px-3 py-1 rounded-full">
                        <span>🔥</span>
                        <span className="text-[#9acd32]">Streak {activeSession.sessionStreak}</span>
                    </div>
                </div>
                <div className="w-full h-2.5 bg-[#e8eedd] rounded-full overflow-hidden shadow-inner">
                    <div
                        className="h-full bg-[#9acd32] transition-all duration-300 rounded-full"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Word card */}
            <div className="card bg-white p-4 md:p-6 flex flex-col flex-1 mt-0 mb-4 relative z-10 border-2 border-[#e8eedd]">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-2">
                        {word?.is_common && <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded-lg uppercase tracking-wider">Common</span>}
                        {word?.jlpt && <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-lg">{word.jlpt.toUpperCase()}</span>}
                    </div>
                </div>

                <div className="flex-1 flex flex-col justify-center items-center py-4 text-center">


                    <p className="text-xs md:text-sm font-bold text-[#8ba888] mb-2 md:mb-4 uppercase tracking-widest">{word?.meaning || '---'}</p>
                    <div className="relative flex flex-col items-center">
                        <div className="flex items-center justify-center">
                            <h2 className="text-4xl md:text-5xl font-black text-[#2d3748] tracking-tight">{word?.dictionary_form.kanji || '---'}</h2>
                            <button
                                onClick={() => playAudio(word?.dictionary_form.kanji || '')}
                                className="absolute -right-12 md:-right-16 w-11 h-11 min-w-[44px] min-h-[44px] flex-shrink-0 rounded-full bg-[#f1f5f9] text-[#8ba888] flex items-center justify-center hover:bg-[#e8eedd] transition-colors shadow-sm active:scale-95"
                                aria-label="音声を聞く"
                            >
                                <SpeakerIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-[#8ba888] font-bold mt-2 text-lg">{word?.dictionary_form.kana}</p>
                    </div>
                    <div className="mt-4 md:mt-6 flex flex-col items-center gap-1.5">
                        <span className="text-[10px] font-bold text-[#8ba888] uppercase tracking-widest">Question</span>
                        <div className={`px-4 py-1.5 text-xs md:text-sm font-black rounded-xl uppercase tracking-wider shadow-sm border-2 ${WORD_GROUP_COLORS[word?.group || ''] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                            {type ? CONJ_LABELS[type] || type : '---'}
                        </div>
                    </div>
                </div>

                {/* Input/Choice Area */}
                <div className="mt-auto space-y-4">
                    {config.mode === 'choice' ? (
                        <div className="space-y-4">
                            <div className={`grid gap-2 md:gap-3 ${choices.some(c => c.length > 8) ? 'grid-cols-1' : 'grid-cols-2'}`}>
                                {choices.map((c, i) => {
                                    // Make buttons flex-col to naturally handle multiline text and the icon
                                    let btnClass = "p-3 min-h-[56px] md:min-h-[64px] rounded-[1.25rem] md:rounded-[1.5rem] font-bold text-xs md:text-base transition-all border-2 relative flex flex-col items-center justify-center gap-1 ";
                                    if (showFeedback) {
                                        if (c === correctAnswer) {
                                            btnClass += "bg-[#e8eedd] border-[#9acd32] text-[#466a3e] shadow-sm";
                                        } else if (c === lastSelected) {
                                            btnClass += "bg-[#ff6b6b]/10 border-[#ff6b6b] text-[#c92a2a] shadow-sm";
                                        } else {
                                            btnClass += "bg-white border-transparent text-[#8ba888] opacity-50";
                                        }
                                    } else {
                                        btnClass += "bg-[#e8eedd]/50 border-transparent text-[#2d3748] hover:bg-[#e8eedd] active:scale-95";
                                    }
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => showFeedback ? playAudio(c) : handleChoice(c)}
                                            className={btnClass}
                                        >
                                            <span className="text-center leading-tight">{c}</span>
                                            {showFeedback && c === correctAnswer && (
                                                <div className="absolute top-2 right-2">
                                                    <SpeakerIcon className="w-4 h-4 opacity-70 text-[#466a3e]" />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                            {showFeedback && (
                                <button
                                    onClick={handleNext}
                                    className="w-full py-4 min-h-[56px] rounded-[1.5rem] font-black text-lg transition-all bg-[#9acd32] active:bg-[#85b525] text-white shadow-lg shadow-[#9acd32]/30"
                                >
                                    Next
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
                                    placeholder="Romaji / Kana"
                                    className={`w-full text-center text-xl font-bold p-4 min-h-[64px] rounded-[1.5rem] bg-[#e8eedd]/50 border-2 outline-none transition-all placeholder:text-[#8ba888] ${showFeedback
                                        ? isCorrect
                                            ? 'border-[#9acd32] text-[#466a3e] bg-[#e8eedd]'
                                            : 'border-[#ff6b6b] text-[#c92a2a] bg-[#ff6b6b]/10'
                                        : 'border-transparent text-[#2d3748] focus:border-[#9acd32] focus:bg-white'
                                        }`}
                                    autoComplete="off"
                                />
                                {showFeedback && isCorrect && (
                                    <button
                                        type="button"
                                        onClick={() => playAudio(correctAnswer)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 active:scale-95 transition-all text-[#466a3e]"
                                    >
                                        <SpeakerIcon className="w-7 h-7" />
                                    </button>
                                )}
                            </form>
                            {showFeedback && !isCorrect && (
                                <div
                                    className="text-center font-bold text-[#c92a2a] bg-[#ff6b6b]/10 py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform"
                                    onClick={() => playAudio(correctAnswer)}
                                >
                                    <span>正解: {correctAnswer}</span>
                                    <SpeakerIcon className="w-5 h-5 opacity-70" />
                                </div>
                            )}
                            <button
                                onClick={handleInputSubmit}
                                className={`w-full py-4 min-h-[56px] rounded-[1.5rem] font-black text-lg transition-all ${showFeedback
                                    ? 'bg-[#9acd32] active:bg-[#85b525] text-white shadow-lg shadow-[#9acd32]/30'
                                    : 'bg-[#2d3748] active:bg-[#1a202c] text-white'
                                    }`}
                            >
                                {showFeedback ? 'Next' : 'Check'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="text-center shrink-0 pb-4 relative z-10">
                <button
                    onClick={() => setShowConfirm(true)}
                    className="text-slate-400 hover:text-slate-600 active:text-red-500 text-sm font-bold transition-colors py-3 min-h-[44px] px-4"
                >
                    やめる
                </button>
            </div>

            {/* Confirm Quit Modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
                    <div className="card bg-white w-full max-w-[320px] p-6 space-y-6 text-center shadow-2xl">
                        <div className="w-20 h-20 bg-[#ff6b6b]/10 rounded-full flex items-center justify-center mx-auto mb-2 text-4xl">
                            😿
                        </div>
                        <h3 className="text-xl font-black text-[#2d3748]">Quit Session?</h3>
                        <p className="text-sm font-bold text-[#8ba888]">Your streak will be lost.</p>
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="py-3 px-4 rounded-[1.5rem] font-bold text-sm bg-[#e8eedd] text-[#466a3e] active:scale-95 transition-transform"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={endSession}
                                className="py-3 px-4 rounded-[1.5rem] font-bold text-sm bg-[#ff6b6b] text-white shadow-lg shadow-[#ff6b6b]/30 active:scale-95 transition-transform"
                            >
                                Quit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
