import { PassThrough } from 'node:stream';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockSetMetadata = vi.fn();
const mockToStream = vi.fn();

vi.mock('msedge-tts', () => ({
  MsEdgeTTS: vi.fn(() => ({
    setMetadata: mockSetMetadata,
    toStream: mockToStream,
  })),
  OUTPUT_FORMAT: {
    AUDIO_24KHZ_48KBITRATE_MONO_MP3: 'audio-24khz-48kbitrate-mono-mp3',
  },
}));

describe('GET /api/tts', () => {
  beforeEach(() => {
    mockSetMetadata.mockResolvedValue(undefined);
    mockToStream.mockReset();
    vi.resetModules();
  });

  it('ignores audio stream end events after the response body is canceled', async () => {
    const audioStream = new PassThrough();
    mockToStream.mockReturnValue({ audioStream });

    const { GET } = await import('./route');
    const response = await GET(new Request('http://localhost/api/tts?text=test'));
    const reader = response.body?.getReader();

    expect(reader).toBeDefined();

    await reader?.cancel();

    expect(() => {
      audioStream.emit('end');
    }).not.toThrow();
  });
});
