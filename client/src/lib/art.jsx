import React from 'react';

/* Deterministic, brand-consistent artwork for restaurants that have no photo.
   Every venue gets a stable Zellige-tiled gradient keyed to its name. */

const GRADIENTS = [
  ['#9A1B1B', '#C1453C'],
  ['#8A5A22', '#C89B45'],
  ['#1F5E52', '#3F9A86'],
  ['#5A2E52', '#9B5B7E'],
  ['#20304E', '#1F6E5C'],
  ['#7A5A1B', '#C9A24B'],
  ['#7A2E2E', '#B4552F'],
  ['#243B55', '#3F7CA6'],
];

export function hashStr(s = '') {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function gradientFor(name) {
  return GRADIENTS[hashStr(name) % GRADIENTS.length];
}

export function initials(name = '') {
  return name
    .replace(/^(le |la |les |restaurant |café |cafe |the )/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
}

export function priceText(level) {
  if (!level) return '';
  return '€'.repeat(Math.max(1, Math.min(4, level)));
}

/** Full-bleed generated cover art for a restaurant. */
export function RestaurantArt({ name = '', style, rounded = true, showInitials = true }) {
  const [a, b] = gradientFor(name);
  const id = 'g' + (hashStr(name) % 100000);
  return (
    <svg
      viewBox="0 0 400 260"
      preserveAspectRatio="xMidYMid slice"
      style={{ width: '100%', height: '100%', display: 'block', borderRadius: rounded ? 'inherit' : 0, ...style }}
      role="img"
      aria-label={name}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
        <pattern id={id + 'p'} width="46" height="46" patternUnits="userSpaceOnUse" patternTransform="rotate(0)">
          <path d="M23 0l23 23-23 23L0 23z" fill="none" stroke="#ffffff" strokeOpacity="0.16" strokeWidth="1.2" />
          <path d="M23 9l14 14-14 14-14-14z" fill="none" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="1" />
          <circle cx="23" cy="23" r="2.2" fill="#ffffff" fillOpacity="0.14" />
        </pattern>
      </defs>
      <rect width="400" height="260" fill={`url(#${id})`} />
      <rect width="400" height="260" fill={`url(#${id}p)`} />
      <rect width="400" height="260" fill="#000" opacity="0.06" />
      {showInitials && (
        <text
          x="200"
          y="150"
          textAnchor="middle"
          fontFamily="Fraunces, Georgia, serif"
          fontSize="86"
          fontWeight="600"
          fill="#ffffff"
          fillOpacity="0.92"
        >
          {initials(name)}
        </text>
      )}
    </svg>
  );
}

/** Small round logo mark. */
export function LogoMark({ name = '', size = 44 }) {
  const [a, b] = gradientFor(name);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 14,
        background: `linear-gradient(135deg, ${a}, ${b})`,
        display: 'grid',
        placeItems: 'center',
        color: '#fff',
        fontFamily: 'Fraunces, serif',
        fontWeight: 600,
        fontSize: size * 0.4,
        flexShrink: 0,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {initials(name)}
    </div>
  );
}

/** The Darna wordmark lockup. */
export function DarnaLogo({ size = 22, mono = false }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
      <svg width={size * 1.15} height={size * 1.15} viewBox="0 0 40 40" aria-hidden>
        <path d="M20 2l18 18-18 18L2 20z" fill="none" stroke={mono ? 'currentColor' : 'var(--gold)'} strokeWidth="2.4" />
        <path d="M20 9l11 11-11 11L9 20z" fill={mono ? 'currentColor' : 'var(--primary)'} />
        <circle cx="20" cy="20" r="3.4" fill={mono ? 'var(--bg)' : '#fff'} />
      </svg>
      <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: size, letterSpacing: '-.01em' }}>
        Darna
      </span>
    </span>
  );
}
