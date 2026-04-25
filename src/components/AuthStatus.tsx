'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
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
  const [showSuccess, setShowSuccess] = useState(false);
  const prevUserRef = useRef(user);
  const hasMounted = useSyncExternalStore(subscribeToClientSnapshot, getClientSnapshot, getServerSnapshot);

  useEffect(() => {
    const wasSignedOut = !prevUserRef.current;
    prevUserRef.current = user;

    if (wasSignedOut && user && isOpen) {
      let hideTimer: ReturnType<typeof setTimeout> | undefined;
      const successTimer = setTimeout(() => {
        setIsOpen(false);
        setShowSuccess(true);
        hideTimer = setTimeout(() => setShowSuccess(false), 4000);
      }, 0);

      return () => {
        clearTimeout(successTimer);
        if (hideTimer) {
          clearTimeout(hideTimer);
        }
      };
    }
  }, [user, isOpen]);

  if (!hasMounted || isLoading) {
    return (
      <div className="flex h-11 shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full border-2 border-[color:var(--ink)]/10 px-3 opacity-50 sm:px-4">
        <div className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-[color:var(--muted)]" />
        <span className="hidden whitespace-nowrap text-[10px] font-black uppercase tracking-widest sm:inline">{t('loadingAccount')}</span>
      </div>
    );
  }

  if (user) {
    return (
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-[3px] border-[color:var(--ink)] bg-white transition-all ${
            isOpen 
            ? 'translate-x-[2px] translate-y-[2px] shadow-none' 
            : 'shadow-[3px_3px_0px_0px_var(--ink)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_var(--ink)]'
          }`}
        >
          <svg className="h-6 w-6 text-[color:var(--ink)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>

        {showSuccess && (
          <div className="absolute right-0 top-full z-50 mt-4 flex items-center gap-2 whitespace-nowrap rounded-2xl border-[3px] border-[color:var(--ink)] bg-[color:var(--accent-soft)] px-4 py-3 text-xs font-black text-[color:var(--ink)] shadow-[5px_5px_0px_0px_var(--ink)] animate-in fade-in slide-in-from-top-2 duration-300">
            <svg className="h-4 w-4 shrink-0 text-[color:var(--accent)]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {t('signedIn')}
          </div>
        )}

        {isOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
            <div className="absolute right-0 top-full z-40 mt-4 w-48 rounded-2xl border-[3px] border-[color:var(--ink)] bg-white p-4 shadow-[5px_5px_0px_0px_var(--ink)] animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="mb-3 space-y-1 px-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-[color:var(--muted)]">{t('signedInAs')}</p>
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
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className={`flex h-11 shrink-0 items-center gap-3 rounded-full border-[3px] border-[color:var(--ink)] px-4 text-xs font-black transition-all sm:px-5 ${
          isOpen 
          ? 'bg-[color:var(--ink)] text-white shadow-none translate-x-[2px] translate-y-[2px]' 
          : 'bg-[#fffbeb] text-[color:var(--ink)] shadow-[3px_3px_0px_0px_var(--ink)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_var(--ink)]'
        }`}
      >
        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v8" />
        </svg>
        <span className="hidden whitespace-nowrap sm:inline">{t('saveProgressOnline')}</span>
        <span className="whitespace-nowrap sm:hidden">{t('signIn')}</span>
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
