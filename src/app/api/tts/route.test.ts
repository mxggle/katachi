import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('GET /api/tts', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.resetModules();
  });

  it('requires text parameter', async () => {
    const { GET } = await import('./route');
    const response = await GET(new Request('http://localhost/api/tts'));
    expect(response.status).toBe(400);
    expect(await response.text()).toBe('Text is required');
  });

  it('uses Google Translate TTS and caches the result', async () => {
    const mockAudio = new Uint8Array(Buffer.from('mock-audio-content'));
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(mockAudio.buffer),
    } as Response);

    const { GET } = await import('./route');
    
    // First request
    const response1 = await GET(new Request('http://localhost/api/tts?text=hello'));
    expect(response1.status).toBe(200);
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1);

    // Second request (cached)
    const response2 = await GET(new Request('http://localhost/api/tts?text=hello'));
    expect(response2.status).toBe(200);
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1); 
    
    const data = await response2.arrayBuffer();
    expect(Buffer.from(data).toString()).toBe('mock-audio-content');
  });

  it('supports range requests', async () => {
    const mockAudio = new Uint8Array(Buffer.from('0123456789'));
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(mockAudio.buffer),
    } as Response);

    const { GET } = await import('./route');
    
    const response = await GET(new Request('http://localhost/api/tts?text=range-test', {
      headers: {
        'range': 'bytes=2-5'
      }
    }));

    expect(response.status).toBe(206);
    expect(response.headers.get('Content-Range')).toBe('bytes 2-5/10');
    expect(response.headers.get('Content-Length')).toBe('4');
    
    const data = await response.arrayBuffer();
    expect(Buffer.from(data).toString()).toBe('2345');
  });

  it('supports open-ended range requests', async () => {
    const mockAudio = new Uint8Array(Buffer.from('0123456789'));
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(mockAudio.buffer),
    } as Response);

    const { GET } = await import('./route');
    
    const response = await GET(new Request('http://localhost/api/tts?text=range-test-open', {
      headers: {
        'range': 'bytes=7-'
      }
    }));

    expect(response.status).toBe(206);
    expect(response.headers.get('Content-Range')).toBe('bytes 7-9/10');
    
    const data = await response.arrayBuffer();
    expect(Buffer.from(data).toString()).toBe('789');
  });

  it('handles Google TTS failures', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 403,
    } as Response);

    const { GET } = await import('./route');
    const response = await GET(new Request('http://localhost/api/tts?text=fail'));
    
    expect(response.status).toBe(500);
    expect(await response.text()).toBe('Internal Server Error');
  });
});
