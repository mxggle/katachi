'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthProvider';
import { useStore } from '@/lib/store';
import { fetchRemoteStudyState, mergeStudyStates, saveRemoteStudyState } from '@/lib/supabase/studySync';

export default function StudySync() {
  const { supabase, user } = useAuth();
  const studyState = useStore((state) => state.studyState);
  const setStudyState = useStore((state) => state.setStudyState);
  const [isReady, setIsReady] = useState(false);
  const lastSavedJsonRef = useRef<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function hydrate() {
      if (!supabase || !user) {
        setIsReady(false);
        lastSavedJsonRef.current = null;
        return;
      }

      try {
        const localState = useStore.getState().studyState;
        const remoteState = await fetchRemoteStudyState(supabase, user);
        const mergedState = mergeStudyStates(localState, remoteState);

        if (isCancelled) {
          return;
        }

        setStudyState(mergedState);
        await saveRemoteStudyState(supabase, user, mergedState);
        lastSavedJsonRef.current = JSON.stringify(mergedState);
        setIsReady(true);
      } catch (error) {
        console.error('Failed to hydrate Supabase study state', error);
        if (!isCancelled) {
          setIsReady(false);
        }
      }
    }

    hydrate();

    return () => {
      isCancelled = true;
    };
  }, [setStudyState, supabase, user]);

  useEffect(() => {
    if (!supabase || !user || !isReady) {
      return;
    }

    const nextJson = JSON.stringify(studyState);
    if (nextJson === lastSavedJsonRef.current) {
      return;
    }

    const timeout = window.setTimeout(() => {
      saveRemoteStudyState(supabase, user, studyState)
        .then(() => {
          lastSavedJsonRef.current = nextJson;
        })
        .catch((error) => {
          console.error('Failed to save Supabase study state', error);
        });
    }, 1200);

    return () => window.clearTimeout(timeout);
  }, [isReady, studyState, supabase, user]);

  return null;
}
