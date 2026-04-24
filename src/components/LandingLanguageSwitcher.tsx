'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import type { LandingLanguage } from '@/lib/landing-i18n';

const LANGUAGES: { code: LandingLanguage; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文' },
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'ne', label: 'नेपाली' },
];

export default function LandingLanguageSwitcher({ currentLang }: { currentLang: LandingLanguage }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeLang = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];

  return (
    <div className="relative inline-flex flex-col items-end" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm font-bold text-[color:var(--accent)] hover:underline"
        aria-expanded={isOpen}
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{activeLang.label}</span>
        <svg className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-3 w-max min-w-[120px] animate-fade-in flex flex-col overflow-hidden rounded-xl border-[2px] border-[color:var(--ink)] bg-white shadow-[4px_4px_0px_0px_var(--ink)] origin-top z-50">
          {LANGUAGES.map((lang) => {
            const href = lang.code === 'en' ? '/learn-japanese-conjugations' : `/learn-japanese-conjugations?lang=${lang.code}`;
            return (
              <Link
                key={lang.code}
                href={href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-4 py-2.5 text-sm font-bold transition-colors hover:bg-[color:var(--accent-soft)] hover:text-[color:var(--ink)] text-left ${
                  currentLang === lang.code 
                    ? 'bg-[color:var(--accent)] text-white hover:bg-[color:var(--accent)] hover:text-white' 
                    : 'text-[color:var(--muted)]'
                }`}
              >
                {lang.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
