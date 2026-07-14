import { ImageResponse } from 'next/og';

export const alt = 'Katachi Japanese conjugation practice';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: 'center',
          background: '#f4f4ea',
          color: '#20242b',
          display: 'flex',
          height: '100%',
          justifyContent: 'center',
          padding: '72px',
          width: '100%',
        }}
      >
        <div
          style={{
            background: '#ffffff',
            border: '8px solid #20242b',
            boxShadow: '18px 18px 0 #20242b',
            display: 'flex',
            flexDirection: 'column',
            padding: '64px 72px',
            width: '100%',
          }}
        >
          <div style={{ color: '#f36f5c', display: 'flex', fontSize: 30, fontWeight: 800 }}>
            KATACHI · 形
          </div>
          <div style={{ display: 'flex', fontSize: 72, fontWeight: 900, lineHeight: 1.05, marginTop: 26 }}>
            Japanese conjugation,<br />built into reflex.
          </div>
          <div style={{ color: '#625848', display: 'flex', fontSize: 30, fontWeight: 600, marginTop: 30 }}>
            Focused daily practice for JLPT N5–N3
          </div>
        </div>
      </div>
    ),
    size,
  );
}
