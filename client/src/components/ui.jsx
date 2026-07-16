import React from 'react';
import { Star, Loader2 } from 'lucide-react';

export function Stars({ value = 0, size = 14 }) {
  return (
    <span className="rating" title={value ? value.toFixed(1) : 'Nouveau'}>
      <Star size={size} fill="currentColor" strokeWidth={0} />
      {value ? value.toFixed(1) : <span className="faint" style={{ fontWeight: 600 }}>Nouveau</span>}
    </span>
  );
}

export function Spinner({ label }) {
  return (
    <div className="row" style={{ gap: 10, color: 'var(--ink-soft)', justifyContent: 'center', padding: 30 }}>
      <Loader2 size={18} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
      {label && <span>{label}</span>}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export function Empty({ icon, title, hint, action }) {
  return (
    <div className="stack" style={{ alignItems: 'center', textAlign: 'center', gap: 10, padding: '48px 20px', color: 'var(--ink-soft)' }}>
      {icon && <div style={{ color: 'var(--gold)' }}>{icon}</div>}
      <h3 style={{ color: 'var(--ink)' }}>{title}</h3>
      {hint && <p className="muted" style={{ maxWidth: 340, margin: 0 }}>{hint}</p>}
      {action}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div className="skeleton" style={{ height: 150, borderRadius: 0 }} />
      <div className="stack" style={{ gap: 8, padding: 14 }}>
        <div className="skeleton" style={{ height: 16, width: '70%' }} />
        <div className="skeleton" style={{ height: 12, width: '45%' }} />
      </div>
    </div>
  );
}

export function Badge({ children, tone = 'gold' }) {
  const tones = {
    gold: { bg: 'var(--gold-soft)', c: 'var(--gold-ink)' },
    green: { bg: 'var(--green-soft)', c: 'var(--green)' },
    red: { bg: 'var(--primary-soft)', c: 'var(--primary)' },
  };
  const t = tones[tone] || tones.gold;
  return (
    <span style={{ background: t.bg, color: t.c, fontSize: 11, fontWeight: 800, letterSpacing: '.04em', padding: '4px 9px', borderRadius: 999, textTransform: 'uppercase' }}>
      {children}
    </span>
  );
}
