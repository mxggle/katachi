'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';
import { clearStudySyncMeta } from '@/lib/supabase/studySync';
import { useStore } from '@/lib/store';

interface AuthContextValue {
  supabase: SupabaseClient<Database> | null;
  user: User | null;
  isConfigured: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(supabase));
  const resetStore = useStore((state) => state.resetStore);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let isMounted = true;
    const loadingTimeout = window.setTimeout(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    }, 2500);

    supabase.auth
      .getUser()
      .then(({ data }) => {
        if (!isMounted) return;
        setUser(data.user);
      })
      .catch((error) => {
        console.error('Failed to load Supabase user', error);
      })
      .finally(() => {
        if (!isMounted) return;
        window.clearTimeout(loadingTimeout);
        setIsLoading(false);
      });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
      if (event === 'SIGNED_OUT') {
        resetStore();
        clearStudySyncMeta();
      }
    });

    return () => {
      isMounted = false;
      window.clearTimeout(loadingTimeout);
      listener.subscription.unsubscribe();
    };
  }, [resetStore, supabase]);

  const value = useMemo<AuthContextValue>(
    () => ({
      supabase,
      user,
      isConfigured: Boolean(supabase),
      isLoading,
      signOut: async () => {
        try {
          if (supabase) {
            await supabase.auth.signOut();
          }
        } finally {
          resetStore();
          clearStudySyncMeta();
        }
      },
    }),
    [isLoading, resetStore, supabase, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
