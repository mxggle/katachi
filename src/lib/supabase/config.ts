type EnvLike = Record<string, string | undefined>;

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

function getPublicEnv(): EnvLike {
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_ENABLE_GOOGLE_AUTH: process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH,
  };
}

export function getSupabaseConfig(env: EnvLike = getPublicEnv()): SupabaseConfig | null {
  const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey };
}

export function isGoogleAuthEnabled(env: EnvLike = getPublicEnv()): boolean {
  return env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH === 'true';
}
