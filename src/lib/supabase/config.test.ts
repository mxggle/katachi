import { describe, expect, it } from 'vitest';
import { getSupabaseConfig, isGoogleAuthEnabled } from './config';

describe('Supabase auth configuration', () => {
  it('returns null when Supabase browser credentials are missing', () => {
    expect(getSupabaseConfig({})).toBeNull();
    expect(getSupabaseConfig({ NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co' })).toBeNull();
  });

  it('returns browser credentials when both required values are present', () => {
    expect(
      getSupabaseConfig({
        NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
      })
    ).toEqual({
      url: 'https://example.supabase.co',
      anonKey: 'anon-key',
    });
  });

  it('fails closed when the configured Supabase URL is invalid', () => {
    expect(
      getSupabaseConfig({
        NEXT_PUBLIC_SUPABASE_URL: 'not a URL',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
      })
    ).toBeNull();
    expect(
      getSupabaseConfig({
        NEXT_PUBLIC_SUPABASE_URL: 'javascript:alert(1)',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
      })
    ).toBeNull();
  });

  it('treats Google auth as opt-in so email OTP remains the universal default', () => {
    expect(isGoogleAuthEnabled({})).toBe(false);
    expect(isGoogleAuthEnabled({ NEXT_PUBLIC_ENABLE_GOOGLE_AUTH: 'false' })).toBe(false);
    expect(isGoogleAuthEnabled({ NEXT_PUBLIC_ENABLE_GOOGLE_AUTH: 'true' })).toBe(true);
  });
});
