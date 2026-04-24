export interface TtsAudioElement {
  src: string;
  currentTime: number;
  pause: () => void;
  load: () => void;
  play: () => Promise<void> | void;
}

type FetchAudio = (url: string) => Promise<Blob>;
type CreateObjectUrl = (blob: Blob) => string;

interface TtsPlaybackControllerOptions {
  audio: TtsAudioElement;
  fallback: (text: string) => void;
  stopFallback?: () => void;
  buildUrl?: (text: string) => string;
  fetchAudio?: FetchAudio;
  createObjectUrl?: CreateObjectUrl;
}

export interface TtsPlaybackController {
  play: (text: string) => Promise<void>;
  preload: (text: string) => Promise<void>;
  preloadMany: (texts: string[], concurrency?: number) => Promise<void>;
  stop: () => void;
}

const defaultBuildUrl = (text: string) => `/api/tts?text=${encodeURIComponent(text)}`;

const defaultFetchAudio: FetchAudio = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`TTS request failed: ${response.status}`);
  }

  return response.blob();
};

const defaultCreateObjectUrl: CreateObjectUrl = (blob) => URL.createObjectURL(blob);

export function createTtsPlaybackController({
  audio,
  fallback,
  stopFallback,
  buildUrl = defaultBuildUrl,
  fetchAudio = defaultFetchAudio,
  createObjectUrl = defaultCreateObjectUrl,
}: TtsPlaybackControllerOptions): TtsPlaybackController {
  let requestId = 0;
  const audioUrlCache = new Map<string, string>();
  const pendingAudioUrlCache = new Map<string, Promise<string>>();

  const getCachedAudioUrl = (text: string) => {
    const cachedUrl = audioUrlCache.get(text);
    if (cachedUrl) {
      return Promise.resolve(cachedUrl);
    }

    const pendingUrl = pendingAudioUrlCache.get(text);
    if (pendingUrl) {
      return pendingUrl;
    }

    const audioUrlPromise = fetchAudio(buildUrl(text))
      .then((blob) => {
        const objectUrl = createObjectUrl(blob);
        audioUrlCache.set(text, objectUrl);
        return objectUrl;
      })
      .finally(() => {
        pendingAudioUrlCache.delete(text);
      });

    pendingAudioUrlCache.set(text, audioUrlPromise);
    return audioUrlPromise;
  };

  const stop = () => {
    requestId += 1;
    stopFallback?.();
    audio.pause();
    audio.currentTime = 0;
  };

  return {
    async play(text) {
      const trimmedText = text.trim();
      if (!trimmedText) {
        return;
      }

      stop();
      const activeRequestId = requestId;

      try {
        const audioUrl = await getCachedAudioUrl(trimmedText);
        if (activeRequestId !== requestId) {
          return;
        }

        audio.src = audioUrl;
        audio.load();
        const playResult = audio.play();

        if (playResult && typeof playResult.catch === 'function') {
          await playResult.catch(() => {
            if (activeRequestId !== requestId) {
              return;
            }

            fallback(trimmedText);
          });
        }
      } catch {
        if (activeRequestId === requestId) {
          fallback(trimmedText);
        }
      }
    },
    async preload(text) {
      const trimmedText = text.trim();
      if (!trimmedText) {
        return;
      }

      await getCachedAudioUrl(trimmedText).catch(() => undefined);
    },
    async preloadMany(texts, concurrency = 2) {
      const uniqueTexts = Array.from(
        new Set(texts.map((text) => text.trim()).filter(Boolean))
      );
      const workerCount = Math.max(1, Math.min(concurrency, uniqueTexts.length));
      let nextIndex = 0;

      await Promise.all(
        Array.from({ length: workerCount }, async () => {
          while (nextIndex < uniqueTexts.length) {
            const text = uniqueTexts[nextIndex];
            nextIndex += 1;
            await getCachedAudioUrl(text).catch(() => undefined);
          }
        })
      );
    },
    stop,
  };
}
