import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('GET /api/tts', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('fetch', vi.fn());
    vi.resetModules();
  });

  function audioResponse(content: Uint8Array, headers: Record<string, string> = {}) {
    return new Response(content, {
      status: 200,
      headers: { 'Content-Type': 'audio/mpeg', ...headers },
    });
  }

  it('requires text parameter', async () => {
    const { GET } = await import('./route');
    const response = await GET(new Request('http://localhost/api/tts'));
    expect(response.status).toBe(400);
    expect(await response.text()).toBe('Text is required');
  });

  it('uses Google Translate TTS and caches the result', async () => {
    const mockAudio = new Uint8Array(Buffer.from('mock-audio-content'));
    vi.mocked(fetch).mockResolvedValue(audioResponse(mockAudio));

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
    vi.mocked(fetch).mockResolvedValue(audioResponse(mockAudio));

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
    vi.mocked(fetch).mockResolvedValue(audioResponse(mockAudio));

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

  it('supports suffix range requests', async () => {
    const mockAudio = new Uint8Array(Buffer.from('0123456789'));
    vi.mocked(fetch).mockResolvedValue(audioResponse(mockAudio));

    const { GET } = await import('./route');
    const response = await GET(new Request('http://localhost/api/tts?text=range-test-suffix', {
      headers: { range: 'bytes=-3' },
    }));

    expect(response.status).toBe(206);
    expect(response.headers.get('Content-Range')).toBe('bytes 7-9/10');
    expect(Buffer.from(await response.arrayBuffer()).toString()).toBe('789');
  });

  it('rejects oversized text before contacting the upstream service', async () => {
    const text = 'あ'.repeat(201);
    const { GET } = await import('./route');
    const response = await GET(new Request(`http://localhost/api/tts?text=${encodeURIComponent(text)}`));

    expect(response.status).toBe(413);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('handles Google TTS failures', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 403,
    } as Response);

    const { GET } = await import('./route');
    const response = await GET(new Request('http://localhost/api/tts?text=fail'));
    
    expect(response.status).toBe(502);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(await response.text()).toBe('Audio service unavailable');
  });

  it('rejects non-audio upstream responses', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response('<html>blocked</html>', {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      })
    );

    const { GET } = await import('./route');
    const response = await GET(new Request('http://localhost/api/tts?text=html-response'));

    expect(response.status).toBe(502);
  });

  it('stops reading upstream responses that exceed the audio size limit', async () => {
    const oversizedChunk = new Uint8Array(2 * 1024 * 1024 + 1);
    vi.mocked(fetch).mockResolvedValue(audioResponse(oversizedChunk));

    const { GET } = await import('./route');
    const response = await GET(new Request('http://localhost/api/tts?text=oversized-response'));

    expect(response.status).toBe(502);
  });
});
