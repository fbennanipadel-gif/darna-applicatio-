import React from 'react';

/* Onboarding palette — bright brand red from the prototype/logo */
export const OB = {
  red: '#E50914',
  redDeep: '#7A0409',
  redDark: '#3D0205',
  gold: '#D9B450',
  ink: '#141414',
  line: '#ECECEC',
};

/* ---------- Zellige 8-point star pattern (exact prototype port) ---------- */
let ZID = 0;
export function ZelligePattern({ color = '#C9A24B', opacity = 0.14, style }) {
  const id = React.useMemo(() => `zlg${ZID++}`, []);
  const star = (cx, cy, R, r) => {
    const p = [];
    for (let i = 0; i < 8; i++) {
      const aO = (Math.PI / 4) * i - Math.PI / 2;
      const aI = aO + Math.PI / 8;
      p.push(`${(cx + R * Math.cos(aO)).toFixed(1)},${(cy + R * Math.sin(aO)).toFixed(1)}`);
      p.push(`${(cx + r * Math.cos(aI)).toFixed(1)},${(cy + r * Math.sin(aI)).toFixed(1)}`);
    }
    return p.join(' ');
  };
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', ...style }} aria-hidden>
      <defs>
        <pattern id={id} width="64" height="64" patternUnits="userSpaceOnUse">
          <g fill="none" stroke={color} strokeWidth="1.1" opacity={opacity}>
            <polygon points={star(32, 32, 22, 9)} />
            <polygon points={star(0, 0, 22, 9)} />
            <polygon points={star(64, 0, 22, 9)} />
            <polygon points={star(0, 64, 22, 9)} />
            <polygon points={star(64, 64, 22, 9)} />
            <rect x="27" y="27" width="10" height="10" transform="rotate(45 32 32)" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/* ---------- Roof glyph + wordmark ---------- */
export function DarnaRoof({ size = 22, color = '#fff' }) {
  return (
    <svg width={size} height={size * 0.72} viewBox="0 0 100 72" fill="none" aria-hidden>
      <path d="M4 40 L50 6 L96 40" stroke={color} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M28 24 L28 4" stroke={color} strokeWidth="9" strokeLinecap="round" />
      <path d="M72 24 L72 4" stroke={color} strokeWidth="9" strokeLinecap="round" />
    </svg>
  );
}

export function DarnaMark({ size = 22, color = '#fff', textColor, gap = 8 }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap }}>
      <DarnaRoof size={size} color={color} />
      <span
        style={{
          fontFamily: "'Fraunces','Georgia',serif",
          fontSize: size * 0.95,
          fontWeight: 600,
          color: textColor || color,
          letterSpacing: 0.3,
        }}
      >
        Darna
      </span>
    </span>
  );
}

/* ---------- 3D spinning splash logo (exact prototype port) ---------- */
export function Logo3D({ size = 132 }) {
  const layers = 8;
  return (
    <div style={{ width: size, height: size, perspective: 600 }}>
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d',
          animation: 'spin3d 3.2s cubic-bezier(.45,.05,.25,1) infinite',
        }}
      >
        {Array.from({ length: layers }).map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `translateZ(${(i - layers / 2) * 2}px)`,
              opacity: i === layers - 1 ? 1 : 0.5,
            }}
          >
            <svg width={size} height={size} viewBox="0 0 120 120">
              <circle
                cx="60" cy="60" r="54" fill="none"
                stroke={i === layers - 1 ? '#fff' : OB.gold}
                strokeWidth="2.5"
                opacity={i === layers - 1 ? 1 : 0.3}
              />
              <path d="M28 66 L60 38 L92 66" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M44 54 L44 40 M76 54 L76 40" stroke="#fff" strokeWidth="7" strokeLinecap="round" />
              <text x="60" y="92" textAnchor="middle" fontFamily="'Fraunces','Georgia',serif" fontSize="20" fontWeight="600" fill="#fff">
                Darna
              </text>
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Circular restaurant logo badge (initials, red + gold ring) ---------- */
export function monogram(name = '') {
  return name
    .replace(/^(le |la |les |l'|restaurant |café |cafe |the |snack )/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
}

export function LogoBadge({ name, size = 30 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: '#9A1B1B',
        border: '1.5px solid #C9A24B',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#E9CF86',
        fontFamily: "'Fraunces','Georgia',serif",
        fontWeight: 600,
        fontSize: size * 0.38,
        boxShadow: '0 2px 8px rgba(0,0,0,.35)',
        flexShrink: 0,
      }}
    >
      {monogram(name)}
    </div>
  );
}
