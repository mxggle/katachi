import { describe, expect, it } from 'vitest';
import { getLanguageMenuPosition } from '@/components/LanguageSwitcher';

describe('language switcher menu placement', () => {
  it('opens above centered controls such as the homepage footer', () => {
    expect(getLanguageMenuPosition('up', 'center')).toContain('bottom-full');
    expect(getLanguageMenuPosition('up', 'center')).toContain('left-1/2');
  });

  it('opens below and stays right-aligned inside a page header', () => {
    expect(getLanguageMenuPosition('down', 'end')).toContain('top-full');
    expect(getLanguageMenuPosition('down', 'end')).toContain('right-0');
  });
});
