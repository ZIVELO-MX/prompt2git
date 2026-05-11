import { ImageResponse } from '@vercel/og'

export const alt = 'Prompt2Git — Escribe. Git hace el resto.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const FONT_TIMEOUT = 15000

async function loadGoogleFont(family: string, weight: number): Promise<ArrayBuffer> {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}:wght@${weight}&display=swap`,
    { signal: AbortSignal.timeout(FONT_TIMEOUT) }
  ).then(r => r.text())

  const url = css.match(/src:\s*url\(([^)]+)\)/)?.[1]
  if (!url) throw new Error(`Failed to resolve font: ${family} ${weight}`)

  return fetch(url, { signal: AbortSignal.timeout(FONT_TIMEOUT) }).then(r => r.arrayBuffer())
}

export default async function Image() {
  const [dm300, dm600, jb700] = await Promise.all([
    loadGoogleFont('DM Sans', 300),
    loadGoogleFont('DM Sans', 600),
    loadGoogleFont('JetBrains Mono', 700),
  ])

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: '#0d1117',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'DM Sans',
        }}
      >
        {/* Grid pattern overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.15,
            backgroundImage:
              'linear-gradient(#1a1f2e 1px, transparent 1px), linear-gradient(90deg, #1a1f2e 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Green radial glow at top */}
        <div
          style={{
            position: 'absolute',
            top: '-15%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 800,
            height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(69, 206, 58, 0.08) 0%, transparent 70%)',
          }}
        />

        {/* Terminal bar at bottom */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 56,
            background: '#141822',
            borderTop: '1px solid #1a1f2e',
            display: 'flex',
            alignItems: 'center',
            padding: '0 36px',
            gap: 10,
          }}
        >
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#e34c4c' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#e3b34c' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#4ce34c' }} />
          <div
            style={{
              flex: 1,
              textAlign: 'center',
              fontFamily: 'JetBrains Mono',
              fontSize: 13,
              fontWeight: 700,
              color: '#555',
              letterSpacing: '0.06em',
            }}
          >
            PROMPT2GIT
          </div>
        </div>

        {/* Main content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 80px',
          }}
        >
          {/* Logo + wordmark */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              marginBottom: 44,
            }}
          >
            <svg width="40" height="40" viewBox="0 0 16 16" fill="none">
              <circle cx="12" cy="3" r="1.8" fill="#45ce3a" />
              <circle cx="12" cy="13" r="1.8" fill="#45ce3a" />
              <circle cx="4" cy="8" r="1.8" fill="#45ce3a" />
              <path
                d="M12 5v3M12 11V8M5.8 8h4.4"
                stroke="#45ce3a"
                stroke-width="1.4"
                stroke-linecap="round"
              />
            </svg>
            <span
              style={{
                fontFamily: 'JetBrains Mono',
                fontSize: 28,
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: '#e6edf3',
              }}
            >
              Prompt<span style={{ color: '#45ce3a' }}>2</span>Git
            </span>
          </div>

          {/* Tagline lines */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <span
              style={{
                fontSize: 76,
                fontWeight: 300,
                letterSpacing: '-0.04em',
                color: '#e6edf3',
                lineHeight: 1.1,
              }}
            >
              Escribe.
            </span>
            <div
              style={{
                display: 'flex',
                fontSize: 76,
                letterSpacing: '-0.04em',
                lineHeight: 1.1,
              }}
            >
              <span style={{ fontWeight: 600, color: '#45ce3a', marginRight: 20 }}>Git</span>
              <span style={{ fontWeight: 300, color: '#e6edf3' }}>hace el resto.</span>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'DM Sans', data: dm300, weight: 300, style: 'normal' },
        { name: 'DM Sans', data: dm600, weight: 600, style: 'normal' },
        { name: 'JetBrains Mono', data: jb700, weight: 700, style: 'normal' },
      ],
    }
  )
}
