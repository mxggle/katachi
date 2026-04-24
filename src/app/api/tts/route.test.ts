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
    AUDIO_24KHZ_96KBITRATE_MONO_MP3: 'audio-24khz-96kbitrate-mono-mp3',
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

  it('uses the higher quality Japanese neural voice output format', async () => {
    const audioStream = new PassThrough();
    mockToStream.mockReturnValue({ audioStream });

    const { GET } = await import('./route');
    await GET(new Request('http://localhost/api/tts?text=test'));
    audioStream.end();

    expect(mockSetMetadata).toHaveBeenCalledWith(
      'ja-JP-NanamiNeural',
      'audio-24khz-96kbitrate-mono-mp3'
    );
  });

  it('serves repeated text from the in-memory audio cache', async () => {
    const audioStream = new PassThrough();
    mockToStream.mockReturnValue({ audioStream });

    const { GET } = await import('./route');
    const firstResponse = await GET(new Request('http://localhost/api/tts?text=test'));
    const firstRead = firstResponse.arrayBuffer();

    audioStream.end(Buffer.from('audio'));
    await firstRead;

    const secondResponse = await GET(new Request('http://localhost/api/tts?text=test'));
    const secondAudio = Buffer.from(await secondResponse.arrayBuffer()).toString('utf8');

    expect(mockToStream).toHaveBeenCalledTimes(1);
    expect(secondAudio).toBe('audio');
  });

  it('supports range requests for mobile audio playback', async () => {
    const audioStream = new PassThrough();
    mockToStream.mockReturnValue({ audioStream });

    const { GET } = await import('./route');
    const responsePromise = GET(
      new Request('http://localhost/api/tts?text=test', {
        headers: {
          Range: 'bytes=0-2',
        },
      })
    );

    audioStream.end(Buffer.from('audio'));
    const response = await responsePromise;
    const rangedAudio = Buffer.from(await response.arrayBuffer()).toString('utf8');

    expect(response.status).toBe(206);
    expect(response.headers.get('Accept-Ranges')).toBe('bytes');
    expect(response.headers.get('Content-Range')).toBe('bytes 0-2/5');
    expect(response.headers.get('Content-Length')).toBe('3');
    expect(rangedAudio).toBe('aud');
  });

  it('supports open-ended range requests from the audio element', async () => {
    const audioStream = new PassThrough();
    mockToStream.mockReturnValue({ audioStream });

    const { GET } = await import('./route');
    const responsePromise = GET(
      new Request('http://localhost/api/tts?text=test', {
        headers: {
          Range: 'bytes=2-',
        },
      })
    );

    audioStream.end(Buffer.from('audio'));
    const response = await responsePromise;
    const rangedAudio = Buffer.from(await response.arrayBuffer()).toString('utf8');

    expect(response.status).toBe(206);
    expect(response.headers.get('Content-Range')).toBe('bytes 2-4/5');
    expect(response.headers.get('Content-Length')).toBe('3');
    expect(rangedAudio).toBe('dio');
  });
});
