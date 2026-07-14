import { afterEach, describe, expect, it, vi } from 'vitest';

function createMemoryStorage() {
  const values = new Map<string, string>();

  return {
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => values.set(key, value)),
    removeItem: vi.fn((key: string) => values.delete(key)),
    clear: vi.fn(() => values.clear()),
    key: vi.fn((index: number) => Array.from(values.keys())[index] ?? null),
    get length() {
      return values.size;
    },
  } satisfies Storage;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe('language persistence', () => {
  it('restores the selected language after the store is recreated', async () => {
    const localStorage = createMemoryStorage();
    vi.stubGlobal('localStorage', localStorage);
    vi.stubGlobal('window', { localStorage });

    const firstStoreModule = await import('./store');
    firstStoreModule.useStore.getState().setLanguage('zh');

    const persisted = JSON.parse(
      localStorage.getItem(firstStoreModule.STORE_STORAGE_KEY) ?? '{}',
    ) as { state?: { studyState?: { preferences?: { language?: string } } } };
    expect(persisted.state?.studyState?.preferences?.language).toBe('zh');

    vi.resetModules();
    const reloadedStoreModule = await import('./store');

    expect(reloadedStoreModule.useStore.getState().language).toBe('zh');
    expect(reloadedStoreModule.useStore.getState().studyState.preferences.language).toBe('zh');
  });
});
