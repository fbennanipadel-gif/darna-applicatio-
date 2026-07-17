import React from 'react';
import { Star, Gift, BadgeCheck } from 'lucide-react';
import { ZelligePattern, DarnaMark } from '../lib/brand';
import { useLoyalty } from '../lib/hooks';

const TIER_COLORS = {
  Bronze: '#C08A5A',
  Argent: '#C4CBD8',
  Or: '#E8C97A',
  Diamant: '#B9E2F0',
};

/** Carte de fidélité Darna — the member loyalty card (prototype NFC-card design). */
export default function FidelityCard({ user }) {
  const { data, isLoading } = useLoyalty(!!user);

  if (isLoading || !data) {
    return <div className="skeleton" style={{ height: 210, borderRadius: 22 }} />;
  }

  const tierColor = TIER_COLORS[data.tier] || '#E8C97A';
  const pct = data.nextTier
    ? Math.min(100, Math.round((data.points / data.nextTier.at) * 100))
    : 100;

  return (
    <div style={{
      position: 'relative', borderRadius: 22, overflow: 'hidden', color: '#fff',
      background: 'linear-gradient(135deg,#7E1212,#B33A30)',
      boxShadow: '0 18px 40px -14px rgba(126,18,18,.55)', padding: 20,
    }}>
      <ZelligePattern color="#E8C97A" opacity={0.14} />

      {/* Header row */}
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <DarnaMark size={19} color="#fff" />
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(0,0,0,.22)',
          border: `1px solid ${tierColor}`, color: tierColor, fontSize: 11.5, fontWeight: 800,
          letterSpacing: '.08em', padding: '4px 10px', borderRadius: 999, textTransform: 'uppercase',
        }}>
          <BadgeCheck size={13} /> {data.tier}
        </span>
      </div>

      {/* Points */}
      <div style={{ position: 'relative', marginTop: 16 }}>
        <div style={{ fontSize: 11, letterSpacing: 2, opacity: 0.75, fontWeight: 700 }}>CARTE DE FIDÉLITÉ</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 2 }}>
          <span style={{ fontFamily: "'Fraunces','Georgia',serif", fontSize: 40, fontWeight: 600, lineHeight: 1 }}>
            {data.points.toLocaleString('fr-FR')}
          </span>
          <span style={{ fontSize: 13, opacity: 0.8, fontWeight: 600 }}>points</span>
        </div>
        {data.nextTier ? (
          <>
            <div style={{ height: 5, background: 'rgba(255,255,255,.18)', borderRadius: 99, marginTop: 10, overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg,${tierColor},#fff)`, borderRadius: 99, transition: 'width .6s' }} />
            </div>
            <div style={{ fontSize: 11.5, opacity: 0.8, marginTop: 5 }}>
              {data.nextTier.remaining} pts avant le niveau {data.nextTier.name}
            </div>
          </>
        ) : (
          <div style={{ fontSize: 11.5, opacity: 0.85, marginTop: 8 }}>Niveau maximum atteint ✨</div>
        )}
      </div>

      {/* Stamps — every 10 verified visits earns a reward */}
      <div style={{ position: 'relative', marginTop: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
        {Array.from({ length: data.stampsTarget }).map((_, i) => {
          const filled = i < data.stamps;
          return (
            <span key={i} style={{
              width: 20, height: 20, borderRadius: '50%', display: 'grid', placeItems: 'center',
              background: filled ? '#E8C97A' : 'rgba(255,255,255,.14)',
              border: `1.5px solid ${filled ? '#E8C97A' : 'rgba(255,255,255,.35)'}`,
              color: '#7E1212', transition: 'all .3s',
            }}>
              {filled && <Star size={11} fill="#7E1212" strokeWidth={0} />}
            </span>
          );
        })}
        <span style={{ marginInlineStart: 6, fontSize: 11.5, opacity: 0.85, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <Gift size={13} color="#E8C97A" /> {data.stamps}/{data.stampsTarget} visites
        </span>
      </div>

      {/* Footer */}
      <div style={{ position: 'relative', marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 1.5, opacity: 0.65, fontWeight: 700 }}>MEMBRE</div>
          <div style={{ fontSize: 14.5, fontWeight: 700, marginTop: 1 }}>
            {user.firstName} {user.lastName}
          </div>
        </div>
        <div style={{ textAlign: 'end' }}>
          <div style={{ fontSize: 10, letterSpacing: 1.5, opacity: 0.65, fontWeight: 700 }}>N° CARTE</div>
          <div style={{ fontFamily: 'monospace', fontSize: 13.5, letterSpacing: 2, marginTop: 1, color: '#E8C97A' }}>
            {data.cardNumber}
          </div>
        </div>
      </div>
    </div>
  );
}
