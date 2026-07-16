import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, BadgeCheck } from 'lucide-react';
import { RestaurantArt, priceText } from '../lib/art';
import { Stars, Badge } from './ui';
import { useAuth } from '../context/AuthContext';
import { useToggleFavorite } from '../lib/hooks';

export default function RestaurantCard({ r, favored, onNeedAuth }) {
  const { user } = useAuth();
  const toggle = useToggleFavorite();
  const cover = r.images?.[0] || r.logo;

  const onFav = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return onNeedAuth?.();
    toggle.mutate(r._id);
  };

  return (
    <Link to={`/r/${r.slug}`} className="card press rise" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'relative', aspectRatio: '16 / 10', background: 'var(--bg-tint)' }}>
        {cover ? (
          <img src={cover} alt={r.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => (e.currentTarget.style.display = 'none')} />
        ) : (
          <RestaurantArt name={r.name} rounded={false} />
        )}
        <button className="press" onClick={onFav} aria-label="Favori" style={{
          position: 'absolute', top: 10, right: 10, width: 36, height: 36, borderRadius: 999,
          background: 'rgba(255,255,255,.92)', display: 'grid', placeItems: 'center', boxShadow: 'var(--shadow-sm)',
        }}>
          <Heart size={18} fill={favored ? '#9A1B1B' : 'none'} color={favored ? '#9A1B1B' : '#5E6478'} />
        </button>
        {r.promoted && <div style={{ position: 'absolute', top: 10, left: 10 }}><Badge tone="gold">Sponsorisé</Badge></div>}
      </div>
      <div className="stack" style={{ gap: 6, padding: '12px 14px 14px' }}>
        <div className="spread" style={{ gap: 8 }}>
          <h3 style={{ fontSize: 17, display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</span>
            {r.verified && <BadgeCheck size={16} color="var(--green)" style={{ flexShrink: 0 }} />}
          </h3>
          <Stars value={r.rating} />
        </div>
        <div className="row muted" style={{ gap: 5, fontSize: 13 }}>
          <MapPin size={14} /> <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.city}</span>
          {r.priceLevel ? <span className="pricelevel" style={{ marginInlineStart: 'auto' }}>{priceText(r.priceLevel)}</span> : null}
        </div>
        <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
          {(r.categories || []).slice(0, 2).map((c) => (
            <span key={c} style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-soft)', background: 'var(--surface-2)', border: '1px solid var(--line)', padding: '2px 8px', borderRadius: 999 }}>{c}</span>
          ))}
          {r.reviewCount ? <span className="faint" style={{ fontSize: 12, marginInlineStart: 'auto' }}>{r.reviewCount} avis</span> : null}
        </div>
      </div>
    </Link>
  );
}
