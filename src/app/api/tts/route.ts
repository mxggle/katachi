import { NextResponse } from 'next/server';

const audioCache = new Map<string, Buffer>();

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

    const requestedStart = match[1] ? Number.parseInt(match[1], 10) : 0;
    const requestedEnd = match[2] ? Number.parseInt(match[2], 10) : audio.length - 1;
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

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get('text');
    const rangeHeader = request.headers.get('range');

    if (!text) {
        return new NextResponse('Text is required', { status: 400 });
    }

    try {
        const cachedAudio = audioCache.get(text);
        if (cachedAudio) {
            return buildBufferedAudioResponse(cachedAudio, rangeHeader);
        }

        // Google Translate TTS endpoint is more stable than unofficial Edge TTS WebSocket endpoints
        const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=ja&total=1&idx=0&textlen=${text.length}&client=tw-ob&prev=input`;

        const response = await fetch(googleTtsUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
        });

        if (!response.ok) {
            throw new Error(`Google TTS request failed with status ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const audio = Buffer.from(arrayBuffer);

        if (audio.length > 0) {
            audioCache.set(text, audio);
        }

        return buildBufferedAudioResponse(audio, rangeHeader);

    } catch (error) {
        console.error('Error in TTS API:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

