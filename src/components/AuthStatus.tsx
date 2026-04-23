'use client';

import { useState, useSyncExternalStore } from 'react';
import { useStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { useAuth } from './AuthProvider';
import LoginForm from './LoginForm';

function subscribeToClientSnapshot() {
  return () => {};
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

export default function AuthStatus() {
  const { user, isConfigured, isLoading, signOut } = useAuth();
  const language = useStore((state) => state.language);
  const { t } = useTranslation(language);
  const [isOpen, setIsOpen] = useState(false);
  const hasMounted = useSyncExternalStore(subscribeToClientSnapshot, getClientSnapshot, getServerSnapshot);

  if (!hasMounted || isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-full border-2 border-[color:var(--ink)]/10 px-4 py-2 opacity-50">
        <div className="h-2 w-2 animate-pulse rounded-full bg-[color:var(--muted)]" />
        <span className="text-[10px] font-black uppercase tracking-widest">{t('loadingAccount')}</span>
      </div>
    );
  }

  if (user) {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className={`flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-[color:var(--ink)] bg-white transition-all ${
            isOpen 
            ? 'translate-x-[2px] translate-y-[2px] shadow-none' 
            : 'shadow-[3px_3px_0px_0px_var(--ink)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_var(--ink)]'
          }`}
        >
          <svg className="h-6 w-6 text-[color:var(--ink)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
            <div className="absolute right-0 top-full z-40 mt-4 w-48 rounded-2xl border-[3px] border-[color:var(--ink)] bg-white p-4 shadow-[5px_5px_0px_0px_var(--ink)] animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="mb-3 space-y-1 px-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-[color:var(--muted)]">Signed in as</p>
                <p className="truncate text-xs font-black text-[color:var(--ink)]">{user.email}</p>
              </div>
              <div className="mb-3 h-px bg-[color:var(--ink)]/10" />
              <button
                type="button"
                onClick={() => {
                  signOut();
                  setIsOpen(false);
                }}
                className="flex w-full items-center justify-center rounded-xl border-2 border-[color:var(--ink)] bg-[#fff1f2] py-2 text-[10px] font-black uppercase tracking-widest text-[#b42318] transition-all hover:bg-[#ffe4e6]"
              >
                {t('signOut')}
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  if (!isConfigured) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className={`flex items-center gap-3 rounded-full border-[3px] border-[color:var(--ink)] px-5 py-2 text-xs font-black transition-all ${
          isOpen 
          ? 'bg-[color:var(--ink)] text-white shadow-none translate-x-[2px] translate-y-[2px]' 
          : 'bg-[#fffbeb] text-[color:var(--ink)] shadow-[3px_3px_0px_0px_var(--ink)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_var(--ink)]'
        }`}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v8" />
        </svg>
        <span className="hidden sm:inline">{t('saveProgressOnline')}</span>
        <span className="sm:hidden">{t('signIn')}</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-30" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 top-full z-40 mt-4 w-[min(22rem,calc(100vw-2rem))] animate-in fade-in slide-in-from-top-2 duration-200">
            <LoginForm />
          </div>
        </>
      )}
    </div>
  );
}
