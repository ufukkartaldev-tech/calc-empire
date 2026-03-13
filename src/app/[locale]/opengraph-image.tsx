import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'CalcEmpire - Engineering Calculators';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'system-ui',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ fontSize: '120px' }}>📏</span>
          <span style={{ fontWeight: 'bold' }}>CalcEmpire</span>
        </div>
        <div
          style={{
            fontSize: 32,
            marginTop: 20,
            opacity: 0.9,
            textAlign: 'center',
            maxWidth: '80%',
          }}
        >
          Professional Engineering Calculators
        </div>
        <div
          style={{
            fontSize: 24,
            marginTop: 10,
            opacity: 0.7,
          }}
        >
          Precise • Fast • Multilingual
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
