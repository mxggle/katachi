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
      className="min-h-dvh relative overflow-x-hidden font-bold"
      style={{ paddingBottom: activeSession ? '0' : 'calc(6rem + env(safe-area-inset-bottom, 0px))' }}
    >
      {!activeSession && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#e8eedd] pt-2 px-4 shadow-[0_-8px_30px_rgba(154,205,50,0.06)]"
          style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)' }}
        >
          <div className="max-w-sm mx-auto flex justify-between items-center">
            <NavButton active={activeTab === 'practice'} onClick={() => setActiveTab('practice')} label="Practice" icon="🎯" />
            <NavButton active={false} onClick={() => alert('Dictionary feature coming soon!')} label="Dict." icon="📖" isMock />
            <NavButton active={activeTab === 'report'} onClick={() => setActiveTab('report')} label="Profile" icon="🧑‍🎨" />
            <NavButton active={false} onClick={() => alert('Settings coming soon!')} label="Settings" icon="⚙️" isMock />
          </div>
        </nav>
      )}

      {/* Removing standard text header in fav of the avatar component we'll put in each view */}

      <div className={activeSession ? '' : 'pt-2 max-w-xl mx-auto'}>
        {activeSession ? (
          <PracticeSession />
        ) : (
          activeTab === 'practice' ? <SetupMenu /> : <ReportDashboard />
        )}
      </div>
    </main>
  );
}

function NavButton({ active, onClick, label, icon, isMock }: { active: boolean, onClick: () => void, label: string, icon: string, isMock?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`group flex flex-col items-center justify-center gap-1.5 min-w-[72px] min-h-[56px] px-2 py-2 rounded-2xl transition-all duration-300 active:scale-95 relative ${active ? 'bg-gradient-to-b from-[#f8fcf2] to-white' : ''}`}
    >
      {active && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#9acd32] rounded-b-full shadow-[0_2px_8px_rgba(154,205,50,0.4)]" />
      )}
      <div className={`text-2xl transition-all duration-300 flex items-center justify-center ${active ? 'scale-110 -translate-y-0.5 drop-shadow-md' : isMock ? 'opacity-30 grayscale hover:opacity-60' : 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0'}`}>
        {icon}
      </div>
      <span className={`text-[9px] font-black tracking-wider transition-colors uppercase ${active ? 'text-[#9acd32]' : isMock ? 'text-[#8ba888]/40' : 'text-[#8ba888]'}`}>
        {label}
      </span>
    </button>
  );
}
