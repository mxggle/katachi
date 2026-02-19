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
            <div className="max-w-lg mx-auto px-5 pt-16 text-center animate-fade-in space-y-4">
                <div className="text-4xl">📭</div>
                <h2 className="text-xl font-bold text-zinc-200">データなし</h2>
                <p className="text-sm text-zinc-500">練習を始めると、ここに記録が表示されます。</p>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto px-5 pb-8 space-y-5 animate-fade-in">
            <h2 className="text-xl font-bold text-zinc-100 pt-2">📈 あなたの記録</h2>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
                <StatCard label="練習数" value={totalAnswered} emoji="✏️" color="text-amber-400" />
                <StatCard label="正答率" value={`${accuracy}%`} emoji="🎯" color="text-emerald-400" />
                <StatCard label="習得済" value={mastered} emoji="⭐" color="text-purple-400" />
            </div>

            {/* Accuracy bar */}
            <div className="glass rounded-2xl p-5 space-y-3">
                <div className="flex justify-between text-xs font-medium text-zinc-500">
                    <span>📊 定着率</span>
                    <span className="text-amber-400">{accuracy}%</span>
                </div>
                <div className="w-full h-2 bg-[var(--bg)] rounded-full overflow-hidden">
                    <div
                        className="h-full bg-amber-500 transition-all duration-700 rounded-full"
                        style={{ width: `${accuracy}%` }}
                    />
                </div>
            </div>

            {/* Weakest links */}
            <div className="glass rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-zinc-300">⚠️ 要復習</h3>
                <div className="space-y-2">
                    {weakest.length > 0 ? weakest.map((w) => (
                        <div key={w.id} className="flex justify-between items-center py-3 px-4 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
                            <span className="text-sm font-medium text-zinc-300">{w.id.replace('v_', '').replace('a_', '')}</span>
                            <span className="text-sm font-semibold text-red-400">{Math.round(w.rate * 100)}%</span>
                        </div>
                    )) : (
                        <p className="text-sm text-zinc-600 py-2">もっと練習すると弱点が表示されます。</p>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, emoji, color }: { label: string; value: string | number; emoji: string; color: string }) {
    return (
        <div className="glass rounded-xl p-4 space-y-1">
            <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">{emoji} {label}</p>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
        </div>
    );
}
