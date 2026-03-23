'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useStore } from '@/lib/store'
import {
  fetchUserData,
  convertRemoteToLocal,
  migrateLocalToSupabase,
  createDebouncedSync,
} from '@/lib/supabase/sync'

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  signOut: async () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const cleanupRef = useRef<(() => void) | null>(null)

  async function loadUserData(userId: string) {
    const localState = useStore.getState()
    const remote = await fetchUserData(supabase, userId)

    if (!remote) {
      // Network error — keep current local state, do not overwrite with empty data
      console.error('[katachi] Failed to fetch user data, keeping local state')
      return
    }

    let nextState
    if (!remote.profile.migrated_at && localState.globalStats.totalAnswered > 0) {
      // First sign-in with existing local data — migrate and merge
      nextState = await migrateLocalToSupabase(supabase, userId, localState, remote)
    } else {
      nextState = convertRemoteToLocal(remote)
    }

    // Supabase is source of truth — overwrite store
    useStore.setState({ ...nextState, activeSession: null })

    // Start debounced sync for future changes
    cleanupRef.current?.()
    cleanupRef.current = createDebouncedSync(
      supabase,
      userId,
      () => useStore.getState(),
      (listener) => useStore.subscribe(listener)
    )
  }

  useEffect(() => {
    // Use getUser() not getSession() — getUser() validates against the server
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(u)
      if (u) {
        loadUserData(u.id).finally(() => setIsLoading(false))
      } else {
        setIsLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const u = session?.user ?? null

      if (event === 'TOKEN_REFRESHED') {
        // Token refresh — update user object but do NOT re-fetch data
        setUser(u)
        return
      }

      setUser(u)

      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        if (u) loadUserData(u.id)
      }

      if (event === 'SIGNED_OUT') {
        cleanupRef.current?.()
        cleanupRef.current = null
        // Clear Zustand state + localStorage + non-Zustand keys
        useStore.getState().resetStore()
        localStorage.removeItem('katachi-nudge-dismissed')
      }
    })

    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const signOut = async () => {
    await supabase.auth.signOut()
    // onAuthStateChange SIGNED_OUT handles cleanup
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
