'use client';

import { useStore } from '@/lib/store';

export default function ReportDashboard() {
    const { globalStats, wordStats } = useStore();

    const totalAnswered = globalStats.totalAnswered;
    const accuracy = totalAnswered > 0
        ? Math.round((globalStats.totalCorrect / totalAnswered) * 100)
        : 0;

    const mastered = Object.values(wordStats).filter(s => s.correct / s.seen > 0.8).length;

    const weakest = Object.entries(wordStats)
        .map(([id, stats]) => ({ id, ...stats, rate: stats.correct / stats.seen }))
        .filter(s => s.seen > 2)
        .sort((a, b) => a.rate - b.rate)
        .slice(0, 5);

    if (totalAnswered === 0) {
        return (
            <div className="max-w-xl mx-auto px-5 pt-16 text-center animate-fade-in space-y-4">
                <div className="text-6xl animate-bounce mb-6">📭</div>
                <h2 className="text-2xl font-black text-[#2d3748] tracking-tight">No Data Yet</h2>
                <p className="text-sm font-bold text-[#8ba888]">Complete a session to see your stats.</p>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto px-5 pb-8 space-y-6 animate-fade-in pt-4">
            {/* Header / Profile section */}
            <div className="flex flex-col items-center justify-center pt-8 pb-2 space-y-3">
                <div className="relative w-28 h-28 rounded-full border-4 border-[#9acd32]/30 bg-[#e8eedd] overflow-hidden shadow-sm flex items-center justify-center p-2">
                    <img src="/mascot.png" alt="Mascot" className="w-full h-full object-contain transform translate-y-1" />
                </div>
                <div className="text-center space-y-0.5">
                    <h1 className="text-xl font-black text-[#2d3748] tracking-tight">Learner</h1>
                    <p className="text-xs font-bold text-[#8ba888]">Katachi Student</p>
                </div>
                {/* Level progress bar simulation */}
                <div className="w-48 max-w-full flex items-center gap-2 pt-2">
                    <div className="flex-1 h-3 bg-[#e8eedd] rounded-full overflow-hidden shadow-inner flex items-center p-0.5">
                        <div className="h-full bg-[#9acd32] rounded-full w-2/3 shadow-sm"></div>
                    </div>
                    <div className="w-5 h-5 bg-[#9acd32] text-white rounded-full flex items-center justify-center text-[10px] shadow-sm font-black border-2 border-white">
                        ★
                    </div>
                </div>
            </div>

            {/* Stats row container */}
            <div className="card bg-white p-3 shadow-sm border border-[#e8eedd]">
                <div className="grid grid-cols-3 gap-2">
                    <StatCard label="Total" value={totalAnswered} emoji="🧑‍🏫" color="text-[#466a3e]" bg="bg-[#e8eedd]/50" />
                    <StatCard label="Accuracy" value={accuracy + '%'} emoji="❤️" color="text-[#c92a2a]" bg="bg-[#ff6b6b]/10" />
                    <StatCard label="Mastered" value={mastered} emoji="👕" color="text-[#2d3748]" bg="bg-[#e8eedd]/50" />
                </div>
            </div>

            {/* Retention Rate (looks like the 14 Days card) */}
            <div className="card bg-white p-4 shadow-sm border border-[#e8eedd] flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 text-xl shadow-inner">
                        <div className="w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center text-white text-sm font-black shadow-sm">
                            ✓
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-[#2d3748] tracking-tight">{accuracy}% Accuracy</h3>
                        <p className="text-xs font-bold text-[#8ba888]">Retention Rate Overall</p>
                    </div>
                </div>
                <button className="w-8 h-8 rounded-full hover:bg-gray-50 flex items-center justify-center text-gray-400 font-black">
                    ⋮
                </button>
            </div>

            {/* Weakest links */}
            <div className="card bg-[#e8eedd]/40 p-4 shadow-sm border-2 border-[#9acd32]/20 space-y-4 mb-2 relative overflow-hidden">
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#9acd32]/10 rounded-full blur-2xl pointer-events-none"></div>
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-sm font-black text-[#2d3748]">⚠️ Needs Review</h3>
                    <div className="w-6 h-6 rounded-full border-4 border-[#9acd32] border-t-transparent animate-spin opacity-50"></div>
                </div>
                <div className="space-y-2 relative z-10">
                    {weakest.length > 0 ? weakest.map((w) => (
                        <div key={w.id} className="flex justify-between items-center py-3 px-4 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all">
                            <span className="text-sm font-bold text-[#466a3e]">{w.id.replace('v_', '').replace('a_', '')}</span>
                            <span className="text-[11px] font-black text-[#c92a2a] bg-[#ff6b6b]/10 px-3 py-1 rounded-full">{Math.round(w.rate * 100)}%</span>
                        </div>
                    )) : (
                        <p className="text-sm font-bold text-[#8ba888] py-2 px-2">Keep practicing to see your weak points!</p>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, emoji, color, bg }: { label: string; value: string | number; emoji: string; color: string; bg: string }) {
    return (
        <div className={`rounded-xl p-3 flex flex-col items-center justify-center space-y-1 ${bg}`}>
            <div className="text-lg pb-1">{emoji}</div>
            <div className={`text-sm font-black tracking-tight ${color}`}>{value}</div>
            <p className={`text-[9px] font-bold uppercase tracking-wider ${color} opacity-70`}>{label}</p>
        </div>
    );
}
