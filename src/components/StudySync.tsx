'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthProvider';
import { useTranslation } from '@/lib/i18n';
import { useStore } from '@/lib/store';
import {
  fetchRemoteStudySnapshot,
  getStudySyncErrorMessageKey,
  readStudySyncMeta,
  resolveStudyStateForHydration,
  saveRemoteStudyState,
  stringifyStudyState,
  writeStudySyncMeta,
} from '@/lib/supabase/studySync';

export default function StudySync() {
  const { isLoading, supabase, user } = useAuth();
  const studyState = useStore((state) => state.studyState);
  const setStudyState = useStore((state) => state.setStudyState);
  const language = useStore((state) => state.language);
  const { t } = useTranslation(language);
  const [isReady, setIsReady] = useState(false);
  const [syncErrorKey, setSyncErrorKey] = useState<ReturnType<typeof getStudySyncErrorMessageKey> | null>(null);
  const lastSavedJsonRef = useRef<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function hydrate() {
      if (isLoading) {
        return;
      }

      if (!supabase || !user) {
        setIsReady(false);
        setSyncErrorKey(null);
        lastSavedJsonRef.current = null;
        return;
      }

      try {
        const localState = useStore.getState().studyState;
        const remoteSnapshot = await fetchRemoteStudySnapshot(supabase, user);
        const nextState = resolveStudyStateForHydration(localState, {
          userId: user.id,
          remoteState: remoteSnapshot?.studyState ?? null,
          syncMeta: readStudySyncMeta(user.id),
        });

        if (isCancelled) {
          return;
        }

        setStudyState(nextState);
        const savedSnapshot = await saveRemoteStudyState(supabase, user, nextState);
        writeStudySyncMeta(user.id, savedSnapshot);
        lastSavedJsonRef.current = stringifyStudyState(savedSnapshot.studyState);
        setSyncErrorKey(null);
        setIsReady(true);
      } catch (error) {
        console.error('Failed to hydrate Supabase study state', error);
        if (!isCancelled) {
          setSyncErrorKey(getStudySyncErrorMessageKey(error));
          setIsReady(false);
        }
      }
    }

    hydrate();

    return () => {
      isCancelled = true;
    };
  }, [isLoading, setStudyState, supabase, user]);

  useEffect(() => {
    if (!supabase || !user || !isReady) {
      return;
    }

    const nextJson = stringifyStudyState(studyState);
    if (nextJson === lastSavedJsonRef.current) {
      return;
    }

    const timeout = window.setTimeout(() => {
      saveRemoteStudyState(supabase, user, studyState)
        .then((savedSnapshot) => {
          writeStudySyncMeta(user.id, savedSnapshot);
          lastSavedJsonRef.current = stringifyStudyState(savedSnapshot.studyState);
        })
        .catch((error) => {
          console.error('Failed to save Supabase study state', error);
          setSyncErrorKey(getStudySyncErrorMessageKey(error));
        });
    }, 1200);

    return () => window.clearTimeout(timeout);
  }, [isReady, studyState, supabase, user]);

  if (!syncErrorKey || !user) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-lg rounded-2xl border-[3px] border-[#b42318] bg-[#fff1f2] px-4 py-3 text-sm font-bold text-[#b42318] shadow-[4px_4px_0px_0px_#b42318]">
      {t(syncErrorKey)}
    </div>
  );
}
