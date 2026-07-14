import { NextResponse } from 'next/server';

const audioCache = new Map<string, Buffer>();
const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

const MAX_TEXT_LENGTH = 200;
const MAX_AUDIO_BYTES = 2 * 1024 * 1024;
const MAX_CACHE_ENTRIES = 128;
const MAX_CACHE_BYTES = 32 * 1024 * 1024;
const MAX_RATE_LIMIT_BUCKETS = 1_000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_REQUESTS = 60;
const UPSTREAM_TIMEOUT_MS = 8_000;
let cachedAudioBytes = 0;

type UpstreamFailureReason =
    | 'http-status'
    | 'invalid-content-type'
    | 'missing-body'
    | 'response-too-large'
    | 'empty-response';

class UpstreamTtsError extends Error {
    constructor(readonly reason: UpstreamFailureReason) {
        super(reason);
        this.name = 'UpstreamTtsError';
    }
}

const baseAudioHeaders = {
    'Content-Type': 'audio/mpeg',
    'Cache-Control': 'public, max-age=31536000, immutable',
    'Accept-Ranges': 'bytes',
};

function buildBufferedAudioResponse(audio: Buffer, rangeHeader: string | null) {
    if (!rangeHeader) {
        return new NextResponse(new Uint8Array(audio), {
            headers: {
                ...baseAudioHeaders,
                'Content-Length': String(audio.length),
            },
        });
    }

    const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader);
    if (!match) {
        return new NextResponse('Invalid range', { status: 416 });
    }

    if (!match[1] && !match[2]) {
        return new NextResponse('Invalid range', { status: 416 });
    }

    const isSuffixRange = !match[1];
    const suffixLength = isSuffixRange ? Number.parseInt(match[2], 10) : 0;
    if (isSuffixRange && suffixLength <= 0) {
        return new NextResponse('Range not satisfiable', {
            status: 416,
            headers: { ...baseAudioHeaders, 'Content-Range': `bytes */${audio.length}` },
        });
    }

    const requestedStart = isSuffixRange
        ? Math.max(0, audio.length - suffixLength)
        : Number.parseInt(match[1], 10);
    const requestedEnd = isSuffixRange || !match[2]
        ? audio.length - 1
        : Number.parseInt(match[2], 10);
    const start = Math.max(0, requestedStart);
    const end = Math.min(requestedEnd, audio.length - 1);

    if (start > end || start >= audio.length) {
        return new NextResponse('Range not satisfiable', {
            status: 416,
            headers: {
                ...baseAudioHeaders,
                'Content-Range': `bytes */${audio.length}`,
            },
        });
    }

    const chunk = audio.subarray(start, end + 1);
    return new NextResponse(new Uint8Array(chunk), {
        status: 206,
        headers: {
            ...baseAudioHeaders,
            'Content-Length': String(chunk.length),
            'Content-Range': `bytes ${start}-${end}/${audio.length}`,
        },
    });
}

function getClientKey(request: Request) {
    return request.headers.get('x-real-ip')
        ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        ?? 'unknown';
}

function isRateLimited(request: Request, now = Date.now()) {
    const clientKey = getClientKey(request);
    const existing = rateLimitBuckets.get(clientKey);

    if (!existing || existing.resetAt <= now) {
        rateLimitBuckets.set(clientKey, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    } else if (existing.count >= RATE_LIMIT_REQUESTS) {
        return true;
    } else {
        existing.count += 1;
    }

    if (rateLimitBuckets.size > MAX_RATE_LIMIT_BUCKETS) {
        for (const [key, bucket] of rateLimitBuckets) {
            if (bucket.resetAt <= now || rateLimitBuckets.size > MAX_RATE_LIMIT_BUCKETS) {
                rateLimitBuckets.delete(key);
            }
        }
    }

    return false;
}

function getCachedAudio(text: string) {
    const audio = audioCache.get(text);
    if (!audio) return null;

    audioCache.delete(text);
    audioCache.set(text, audio);
    return audio;
}

function cacheAudio(text: string, audio: Buffer) {
    if (audio.length > MAX_CACHE_BYTES) return;

    const existing = audioCache.get(text);
    if (existing) cachedAudioBytes -= existing.length;
    audioCache.delete(text);

    while (audioCache.size >= MAX_CACHE_ENTRIES || cachedAudioBytes + audio.length > MAX_CACHE_BYTES) {
        const oldestKey = audioCache.keys().next().value as string | undefined;
        if (!oldestKey) break;
        const oldestAudio = audioCache.get(oldestKey);
        if (oldestAudio) cachedAudioBytes -= oldestAudio.length;
        audioCache.delete(oldestKey);
    }

    audioCache.set(text, audio);
    cachedAudioBytes += audio.length;
}

async function readBoundedAudio(response: Response): Promise<Buffer> {
    const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';
    if (!contentType.startsWith('audio/')) {
        throw new UpstreamTtsError('invalid-content-type');
    }

    const declaredLength = Number(response.headers.get('content-length'));
    if (Number.isFinite(declaredLength) && declaredLength > MAX_AUDIO_BYTES) {
        throw new UpstreamTtsError('response-too-large');
    }

    const reader = response.body?.getReader();
    if (!reader) {
        throw new UpstreamTtsError('missing-body');
    }

    const chunks: Buffer[] = [];
    let totalBytes = 0;

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (!value) continue;

        totalBytes += value.byteLength;
        if (totalBytes > MAX_AUDIO_BYTES) {
            await reader.cancel();
            throw new UpstreamTtsError('response-too-large');
        }
        chunks.push(Buffer.from(value));
    }

    if (totalBytes === 0) {
        throw new UpstreamTtsError('empty-response');
    }

    return Buffer.concat(chunks, totalBytes);
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get('text')?.trim();
    const rangeHeader = request.headers.get('range');

    if (!text) {
        return new NextResponse('Text is required', { status: 400 });
    }

    if (Array.from(text).length > MAX_TEXT_LENGTH) {
        return new NextResponse('Text is too long', { status: 413 });
    }

    if (isRateLimited(request)) {
        return new NextResponse('Too many requests', {
            status: 429,
            headers: { 'Retry-After': String(RATE_LIMIT_WINDOW_MS / 1000) },
        });
    }

    try {
        const cachedAudio = getCachedAudio(text);
        if (cachedAudio) {
            return buildBufferedAudioResponse(cachedAudio, rangeHeader);
        }

        // Google Translate TTS endpoint is more stable than unofficial Edge TTS WebSocket endpoints
        const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=ja&total=1&idx=0&textlen=${text.length}&client=tw-ob&prev=input`;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
        const response = await fetch(googleTtsUrl, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
        }).finally(() => clearTimeout(timeout));

        if (!response.ok) {
            throw new UpstreamTtsError('http-status');
        }

        const audio = await readBoundedAudio(response);

        cacheAudio(text, audio);

        return buildBufferedAudioResponse(audio, rangeHeader);

    } catch (error) {
        const isTimeout = error instanceof DOMException && error.name === 'AbortError';
        const reason = error instanceof UpstreamTtsError
            ? error.reason
            : isTimeout ? 'timeout' : 'network-error';
        console.error('TTS upstream request failed', { reason });
        return new NextResponse('Audio service unavailable', {
            status: isTimeout ? 504 : 502,
            headers: { 'Cache-Control': 'no-store' },
        });
    }
}
