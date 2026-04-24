import { NextResponse } from 'next/server';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

// Initialize a shared TTS instance
const tts = new MsEdgeTTS();
let metadataSet = false;
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

function collectAudioStream(audioStream: NodeJS.ReadableStream): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];

        audioStream.on('data', (chunk: Buffer) => {
            chunks.push(Buffer.from(chunk));
        });
        audioStream.on('end', () => {
            resolve(Buffer.concat(chunks));
        });
        audioStream.on('error', reject);
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

        if (!metadataSet) {
            // "ja-JP-NanamiNeural" (Female) or "ja-JP-KeitaNeural" (Male)
            await tts.setMetadata('ja-JP-NanamiNeural', OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
            metadataSet = true;
        }

        const { audioStream } = tts.toStream(text);

        if (rangeHeader) {
            const audio = await collectAudioStream(audioStream);
            if (audio.length > 0) {
                audioCache.set(text, audio);
            }

            return buildBufferedAudioResponse(audio, rangeHeader);
        }

        // Convert Node.js Readable stream to Web Streams API ReadableStream
        let settled = false;
        let cleanup = () => {};

        const settle = (callback: () => void) => {
            if (settled) {
                return;
            }

            settled = true;
            cleanup();
            callback();
        };

        const stream = new ReadableStream({
            start(controller) {
                const chunks: Buffer[] = [];

                const onData = (chunk: Buffer) => {
                    if (!settled) {
                        chunks.push(Buffer.from(chunk));
                        controller.enqueue(chunk);
                    }
                };

                const onEnd = () => {
                    if (chunks.length > 0) {
                        audioCache.set(text, Buffer.concat(chunks));
                    }

                    settle(() => {
                        controller.close();
                    });
                };

                const onError = (err: Error) => {
                    settle(() => {
                        controller.error(err);
                    });
                };

                cleanup = () => {
                    audioStream.off('data', onData);
                    audioStream.off('end', onEnd);
                    audioStream.off('error', onError);
                };

                audioStream.on('data', onData);
                audioStream.on('end', onEnd);
                audioStream.on('error', onError);
            },
            cancel() {
                settle(() => {
                    if ('destroy' in audioStream && typeof audioStream.destroy === 'function') {
                        audioStream.destroy();
                    }
                });
            },
        });

        // Set the appropriate headers for an audio response
        return new NextResponse(stream, {
            headers: {
                ...baseAudioHeaders,
            },
        });

    } catch (error) {
        console.error('Error in Edge TTS API:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
