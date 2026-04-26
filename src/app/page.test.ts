import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const pageSource = readFileSync(path.resolve(__dirname, './page.tsx'), 'utf8');

describe('homepage entry layout', () => {
  it('presents today practice as the primary path with supporting extra-practice entries', () => {
    expect(pageSource).toContain("t('heroTitleLine1')");
    expect(pageSource).toContain("t('todayPractice')");
    expect(pageSource).toContain("t('todayPracticeDescription')");
    expect(pageSource).toContain("t('startTodayPractice')");
    expect(pageSource).toContain("t('weaknessConsolidation')");
    expect(pageSource).toContain("t('freePractice')");
    expect(pageSource).toContain("t('streak')");
  });

  it('keeps the daily start area focused by omitting secondary daily hints', () => {
    expect(pageSource).not.toContain("t('todayPracticeReady')");
    expect(pageSource).not.toContain("t('todayPracticeRemaining')");
    expect(pageSource).not.toContain("t('todayPracticeStartWith')");
    expect(pageSource).not.toContain('remainingToday');
    expect(pageSource).not.toContain('dailyFocusLabel');
  });

  it('does not expose diagnostic labels or raw scheduler keys on the homepage', () => {
    expect(pageSource).not.toContain("t('weakestForm')");
    expect(pageSource).not.toContain("t('weakestPattern')");
    expect(pageSource).not.toContain("t('undiagnosed')");
    expect(pageSource).not.toContain("t('recommendExplore')");
    expect(pageSource).not.toContain("t('recommendFocus')");
    expect(pageSource).not.toContain('weakestPattern.pattern');
    expect(pageSource).not.toContain('return focus;');
    expect(pageSource).not.toContain('return targetLabel;');
  });

  it('uses semantic icon components instead of placeholder glyphs on learning actions', () => {
    expect(pageSource).toContain("from 'lucide-react'");
    expect(pageSource).toContain('CalendarCheck');
    expect(pageSource).toContain('Dumbbell');
    expect(pageSource).toContain('Shuffle');
    expect(pageSource).toContain('BarChart3');
    expect(pageSource).not.toContain('aria-hidden="true">▣');
    expect(pageSource).not.toContain('aria-hidden="true">◎');
    expect(pageSource).not.toContain('aria-hidden="true">▤');
  });

  it('keeps the primary start action high in the first viewport with a compact plan grid', () => {
    expect(pageSource).toContain('pt-20');
    expect(pageSource).toContain('sm:pt-[5.5rem]');
    expect(pageSource).toContain('p-4 sm:p-6');
  });

  it('removes the placeholder header slot in favor of learning-focused support content', () => {
    expect(pageSource).not.toContain('Header slot');
    expect(pageSource).toContain('SetupMenu');
  });

  it('keeps the top brand mark stable while auth controls change state', () => {
    expect(pageSource).toContain('flex items-center gap-4 shrink-0');
    expect(pageSource).toContain('whitespace-nowrap text-lg font-black');
  });

  it('shows the app package version in the footer for release tracking', () => {
    expect(pageSource).toContain("import { APP_VERSION } from '@/lib/appVersion'");
    expect(pageSource).toContain('v{APP_VERSION}');
  });
});
