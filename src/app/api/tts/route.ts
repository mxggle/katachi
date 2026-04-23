import { NextResponse } from 'next/server';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

// Initialize a shared TTS instance
const tts = new MsEdgeTTS();
let metadataSet = false;

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get('text');

    if (!text) {
        return new NextResponse('Text is required', { status: 400 });
    }

    try {
        if (!metadataSet) {
            // "ja-JP-NanamiNeural" (Female) or "ja-JP-KeitaNeural" (Male)
            await tts.setMetadata('ja-JP-NanamiNeural', OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
            metadataSet = true;
        }

        const { audioStream } = tts.toStream(text);

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
                const onData = (chunk: Buffer) => {
                    if (!settled) {
                        controller.enqueue(chunk);
                    }
                };

                const onEnd = () => {
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
                'Content-Type': 'audio/mpeg',
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });

    } catch (error) {
        console.error('Error in Edge TTS API:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
