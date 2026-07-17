import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MapPin, CheckCircle2, Star } from 'lucide-react';
import { RestaurantArt, priceText } from '../lib/art';
import { LogoBadge } from '../lib/brand';
import { useAuth } from '../context/AuthContext';
import { useToggleFavorite } from '../lib/hooks';

export default function RestaurantCard({ r, favored }) {
  const { user } = useAuth();
  const nav = useNavigate();
  const toggle = useToggleFavorite();
  const [imgOk, setImgOk] = useState(true);
  const cover = r.images?.[0] || r.logo;

  const onFav = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return nav('/auth');
    toggle.mutate(r._id);
  };

  return (
    <Link to={`/r/${r.slug}`} className="card press rise" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', borderRadius: 20 }}>
      <div style={{ position: 'relative', aspectRatio: '16 / 10', background: 'var(--bg-tint)' }}>
        {cover && imgOk ? (
          <img src={cover} alt={r.name} loading="lazy" onError={() => setImgOk(false)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
        ) : (
          <RestaurantArt name={r.name} rounded={false} />
        )}
        <button className="press" onClick={onFav} aria-label="Favori" style={{
          position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: 10,
          background: 'rgba(255,255,255,.92)', display: 'grid', placeItems: 'center', border: 'none', cursor: 'pointer',
        }}>
          <Heart size={16} fill={favored ? 'var(--terracotta)' : 'none'} color="var(--terracotta)" />
        </button>
        {r.verified && (
          <div style={{
            position: 'absolute', top: 10, left: 10, background: 'rgba(255,255,255,.92)', borderRadius: 8,
            padding: '3px 8px', display: 'flex', gap: 4, alignItems: 'center', fontSize: 10.5, fontWeight: 700, color: '#9A1B1B',
          }}>
            <CheckCircle2 size={12} /> Vérifié
          </div>
        )}
        <div style={{ position: 'absolute', bottom: -15, left: 13 }}><LogoBadge name={r.name} size={34} /></div>
      </div>
      <div className="stack" style={{ gap: 5, padding: '21px 14px 14px' }}>
        <div className="spread" style={{ gap: 8 }}>
          <h3 style={{ fontSize: 16.5, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</h3>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 700, fontSize: 13.5, flexShrink: 0 }}>
            <Star size={13} fill="var(--gold)" color="var(--gold)" />
            {r.rating ? r.rating.toFixed(1) : <span className="faint" style={{ fontWeight: 600 }}>Nouveau</span>}
            {r.reviewCount ? <span className="faint" style={{ fontWeight: 500, fontSize: 12 }}>({r.reviewCount})</span> : null}
          </span>
        </div>
        <div className="row muted" style={{ gap: 5, fontSize: 13 }}>
          <MapPin size={13} /> <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.city}</span>
          {r.priceLevel ? <span className="pricelevel" style={{ marginInlineStart: 'auto' }}>{priceText(r.priceLevel)}</span> : null}
        </div>
        <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
          {(r.categories || []).slice(0, 2).map((c) => (
            <span key={c} style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--ink-soft)', background: 'var(--surface-2)', border: '1px solid var(--line)', padding: '2px 8px', borderRadius: 999 }}>{c}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}
