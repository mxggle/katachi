import { describe, expect, it, vi } from 'vitest';
import { createTtsPlaybackController, type TtsAudioElement } from './audioPlayback';

function createAudio(playResult: Promise<void> = Promise.resolve()) {
  return {
    audio: {
      src: '',
      currentTime: 42,
      pause: vi.fn(),
      load: vi.fn(),
      play: vi.fn(() => playResult),
    } satisfies TtsAudioElement,
  };
}

describe('createTtsPlaybackController', () => {
  it('stops the current audio before starting the next phrase', async () => {
    const { audio } = createAudio();
    const fetchAudio = vi.fn(async () => new Blob(['audio']));
    const createObjectUrl = vi
      .fn()
      .mockReturnValueOnce('blob:taberu')
      .mockReturnValueOnce('blob:nomu');
    const controller = createTtsPlaybackController({
      audio,
      fallback: vi.fn(),
      fetchAudio,
      createObjectUrl,
    });

    await controller.play('食べる');
    await controller.play('飲む');

    expect(audio.pause).toHaveBeenCalledTimes(2);
    expect(audio.currentTime).toBe(0);
    expect(fetchAudio).toHaveBeenCalledTimes(2);
    expect(audio.src).toBe('blob:nomu');
    expect(audio.load).toHaveBeenCalledTimes(2);
    expect(audio.play).toHaveBeenCalledTimes(2);
  });

  it('does not fall back to browser speech when an outdated play request rejects', async () => {
    let rejectFirst!: (reason?: unknown) => void;
    const firstPlay = new Promise<void>((_, reject) => {
      rejectFirst = reject;
    });
    const { audio } = createAudio(firstPlay);
    const fetchAudio = vi.fn(async () => new Blob(['audio']));
    const createObjectUrl = vi
      .fn()
      .mockReturnValueOnce('blob:taberu')
      .mockReturnValueOnce('blob:nomu');
    const fallback = vi.fn();
    const controller = createTtsPlaybackController({
      audio,
      fallback,
      fetchAudio,
      createObjectUrl,
    });

    const firstRequest = controller.play('食べる');
    audio.play.mockReturnValueOnce(Promise.resolve());
    await controller.play('飲む');

    rejectFirst(new DOMException('The play() request was interrupted.', 'AbortError'));
    await firstRequest;
    await firstPlay.catch(() => undefined);
    await Promise.resolve();

    expect(fallback).not.toHaveBeenCalled();
  });

  it('stops fallback speech whenever playback is stopped', async () => {
    const { audio } = createAudio();
    const stopFallback = vi.fn();
    const controller = createTtsPlaybackController({
      audio,
      fallback: vi.fn(),
      stopFallback,
      fetchAudio: vi.fn(async () => new Blob(['audio'])),
      createObjectUrl: vi.fn(() => 'blob:audio'),
    });

    await controller.play('食べる');
    controller.stop();

    expect(stopFallback).toHaveBeenCalledTimes(2);
  });

  it('caches fetched audio so replaying the same phrase does not call the TTS API again', async () => {
    const { audio } = createAudio();
    const fetchAudio = vi.fn(async () => new Blob(['audio']));
    const createObjectUrl = vi.fn(() => 'blob:taberu');
    const controller = createTtsPlaybackController({
      audio,
      fallback: vi.fn(),
      fetchAudio,
      createObjectUrl,
    });

    await controller.play('食べる');
    await controller.play('食べる');

    expect(fetchAudio).toHaveBeenCalledTimes(1);
    expect(createObjectUrl).toHaveBeenCalledTimes(1);
    expect(audio.src).toBe('blob:taberu');
    expect(audio.play).toHaveBeenCalledTimes(2);
  });

  it('preloads multiple phrases without refetching duplicates', async () => {
    const { audio } = createAudio();
    const fetchAudio = vi.fn(async () => new Blob(['audio']));
    const createObjectUrl = vi
      .fn()
      .mockReturnValueOnce('blob:taberu')
      .mockReturnValueOnce('blob:nomu');
    const controller = createTtsPlaybackController({
      audio,
      fallback: vi.fn(),
      fetchAudio,
      createObjectUrl,
    });

    await controller.preloadMany(['食べる', '飲む', '食べる']);
    await controller.play('食べる');

    expect(fetchAudio).toHaveBeenCalledTimes(2);
    expect(createObjectUrl).toHaveBeenCalledTimes(2);
    expect(audio.src).toBe('blob:taberu');
  });
});
