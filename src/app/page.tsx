'use client';

import { useState, useEffect } from 'react';
import SetupMenu from '@/components/SetupMenu';
import PracticeSession from '@/components/PracticeSession';
import ReportDashboard from '@/components/ReportDashboard';
import { useStore } from '@/lib/store';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'practice' | 'report'>('practice');
  const { activeSession, dailyStreak, checkDailyStreak } = useStore();

  useEffect(() => {
    checkDailyStreak();
  }, [checkDailyStreak]);

  return (
    <main
      className="min-h-dvh"
      style={{ paddingBottom: activeSession ? '0' : 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}
    >
      {!activeSession && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-50 px-4"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <div className="max-w-sm mx-auto pb-4">
            <div className="glass rounded-2xl p-1.5 flex gap-1">
              <NavButton active={activeTab === 'practice'} onClick={() => setActiveTab('practice')} label="練習" emoji="✏️" />
              <NavButton active={activeTab === 'report'} onClick={() => setActiveTab('report')} label="記録" emoji="📊" />
            </div>
          </div>
        </nav>
      )}

      {!activeSession && (
        <header className="px-5 pt-5 pb-2 flex justify-between items-center">
          <span className="text-sm font-semibold text-zinc-500">Katachi</span>
          <span className="text-sm text-zinc-500">
            🔥 <span className="text-amber-400 font-semibold">{dailyStreak}</span> 日連続
          </span>
        </header>
      )}

      <div className={activeSession ? '' : 'pt-2'}>
        {activeSession ? (
          <PracticeSession />
        ) : (
          activeTab === 'practice' ? <SetupMenu /> : <ReportDashboard />
        )}
      </div>
    </main>
  );
}

function NavButton({ active, onClick, label, emoji }: { active: boolean; onClick: () => void; label: string; emoji: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 ${active
        ? 'bg-amber-500/15 text-amber-400'
        : 'text-zinc-600 active:text-zinc-400'
        }`}
    >
      <span>{emoji}</span>
      <span>{label}</span>
    </button>
  );
}
