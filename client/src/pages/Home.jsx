import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, MapPin, ChevronDown, Bell, User, Heart, Star, CheckCircle2, TrendingUp, Sparkles, ArrowRight, Utensils, X } from 'lucide-react';
import { useTrending, useRecommended, useRestaurants, useIsFavorite, useToggleFavorite, useGeolocation } from '../lib/hooks';
import { useAuth } from '../context/AuthContext';
import { ZelligePattern, DarnaMark, LogoBadge } from '../lib/brand';
import RestaurantCard from '../components/RestaurantCard';
import { CardSkeleton, Empty } from '../components/ui';

const CITIES = ['Casablanca', 'Rabat', 'Marrakech', 'Tanger', 'Agadir', 'Fès', 'Meknès', 'Tétouan', 'Essaouira', 'Kénitra'];
const CATS = ['Marocain', 'Sushi', 'Pizza', 'Brunch', 'Grillades', 'Burger', 'Café', 'Fruits de mer'];

export default function Home() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [city, setCity] = useState(localStorage.getItem('darna_city') || 'Casablanca');
  const [cityOpen, setCityOpen] = useState(false);
  const [activeCat, setActiveCat] = useState(null);

  // Real device location → genuinely "près de vous"; falls back to the chosen city.
  // Only trust GPS when it's inside Morocco, otherwise nearby search would be empty.
  const geo = useGeolocation();
  const inMorocco = geo.pos && geo.pos.lat > 20 && geo.pos.lat < 37 && geo.pos.lng > -18 && geo.pos.lng < 0;
  const popular = useRestaurants(
    inMorocco
      ? { sort: 'nearby', lat: geo.pos.lat, lng: geo.pos.lng, limit: 8, ...(activeCat ? { category: activeCat } : {}) }
      : { city, sort: 'popular', limit: 8, ...(activeCat ? { category: activeCat } : {}) }
  );
  const trending = useTrending({ limit: 8 });
  const recommended = useRecommended(!!user);
  const isFav = useIsFavorite();

  const pickCity = (c) => {
    setCity(c);
    localStorage.setItem('darna_city', c);
    setCityOpen(false);
  };

  return (
    <div style={{ paddingBottom: 24 }}>
      {/* ---------- Red hero panel (prototype design) ---------- */}
      <div style={{ position: 'relative', background: 'var(--primary)', overflow: 'hidden' }}>
        <ZelligePattern color="#C9A24B" opacity={0.16} />
        {/* Fake device status bar — mobile only */}
        <div data-statusbar style={{ position: 'relative', height: 34, display: 'none', alignItems: 'center', justifyContent: 'space-between', padding: '0 26px', color: '#fff', fontSize: 13, fontWeight: 600 }}>
          <span>9:41</span>
          <span style={{ opacity: 0.8, fontSize: 11, letterSpacing: 0.5 }}>MAROC</span>
        </div>
        <div className="container" style={{ position: 'relative', padding: '10px 20px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <DarnaMark size={22} color="#fff" />
            <div style={{ display: 'flex', gap: 8 }}>
              <HeaderTile onClick={() => nav('/explore')} aria="Notifications"><Bell size={18} /></HeaderTile>
              <HeaderTile onClick={() => nav(user ? '/profile' : '/auth')} aria="Compte"><User size={18} /></HeaderTile>
            </div>
          </div>

          <button className="press" onClick={() => setCityOpen(true)} style={{
            position: 'relative', marginTop: 14, background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.18)',
            color: '#fff', padding: '8px 12px', borderRadius: 12, display: 'inline-flex', gap: 6, alignItems: 'center', fontSize: 14, fontWeight: 600,
          }}>
            <MapPin size={16} /> {city} <ChevronDown size={15} />
          </button>

          <div style={{ position: 'relative', marginTop: 16, maxWidth: 640 }}>
            <div style={{ fontSize: 11, letterSpacing: 2.5, color: '#D9B450', fontWeight: 700, marginBottom: 6 }}>NOTRE MAISON, VOTRE TABLE</div>
            <h1 style={{ color: '#fff', fontFamily: "'Fraunces','Georgia',serif", fontSize: 'clamp(27px, 4vw, 40px)', fontWeight: 600, margin: 0, lineHeight: 1.12 }}>
              Les meilleures tables<br />du Maroc, vérifiées.
            </h1>
            <div style={{ height: 1, background: 'linear-gradient(90deg,#D9B450,transparent)', margin: '14px 0 0', opacity: 0.7 }} />
          </div>

          <button className="press" onClick={() => nav(`/explore?city=${encodeURIComponent(city)}`)} style={{
            position: 'relative', width: '100%', maxWidth: 640, marginTop: 16, background: 'var(--surface)', borderRadius: 16,
            padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 10, border: 'none',
            boxShadow: '0 10px 26px rgba(0,0,0,.18)', cursor: 'pointer',
          }}>
            <Search size={19} color="var(--ink-soft)" />
            <span style={{ color: 'var(--ink-soft)', fontSize: 14.5 }}>Un restaurant, une envie…</span>
          </button>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 0 }}>
        {/* Category chips */}
        <div className="scroll-x" style={{ gap: 10, padding: '16px 0 6px' }}>
          {CATS.map((cat) => {
            const on = activeCat === cat;
            return (
              <button key={cat} className="press" onClick={() => setActiveCat(on ? null : cat)} style={{
                flexShrink: 0, background: on ? 'var(--primary)' : 'var(--surface)', color: on ? '#fff' : 'var(--ink)',
                border: `1px solid ${on ? 'var(--primary)' : 'var(--line)'}`, borderRadius: 14, padding: '9px 16px',
                fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
              }}>{cat}</button>
            );
          })}
        </div>

        {/* Populaires près de vous — horizontal rail (BigCard design) */}
        <SectionTitle title="Populaires près de vous" suffix={inMorocco ? ' · autour de moi' : ` · ${city}`} />
        {popular.isLoading ? (
          <div className="scroll-x" style={{ gap: 14 }}>{[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ width: 196, height: 208, flexShrink: 0, borderRadius: 20 }} />)}</div>
        ) : popular.data?.items?.length ? (
          <div className="scroll-x" style={{ gap: 14, paddingBottom: 10 }}>
            {popular.data.items.map((r, i) => <BigCard key={r._id} r={r} i={i} favored={isFav(r._id)} />)}
          </div>
        ) : (
          <Empty icon={<Utensils size={26} />} title="Aucun restaurant" hint="Essayez une autre ville ou catégorie." />
        )}

        {/* Recommandé pour vous */}
        {user && recommended.data?.items?.length > 0 && (
          <>
            <SectionTitle title="Pour vous" icon={<Sparkles size={17} color="var(--gold)" />} sub="Basé sur vos goûts" />
            <div className="grid-cards">
              {recommended.data.items.slice(0, 8).map((r) => <RestaurantCard key={r._id} r={r} favored={isFav(r._id)} />)}
            </div>
          </>
        )}

        {/* Tendances */}
        <SectionTitle title="Tendances au Maroc" icon={<TrendingUp size={17} color="var(--primary)" />} to="/explore" />
        {trending.isLoading ? (
          <div className="grid-cards">{Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}</div>
        ) : (
          <div className="grid-cards">
            {(trending.data?.items || []).map((r) => <RestaurantCard key={r._id} r={r} favored={isFav(r._id)} />)}
          </div>
        )}

        {!user && (
          <div className="card" style={{ margin: '26px 0 10px', padding: 24, textAlign: 'center', background: 'linear-gradient(135deg,var(--gold-soft),var(--surface))' }}>
            <h2 style={{ fontSize: 24, marginBottom: 6 }}>Créez votre compte Darna</h2>
            <p className="muted" style={{ margin: '0 auto 16px', maxWidth: 420 }}>Enregistrez vos favoris, laissez des avis et recevez des recommandations personnalisées.</p>
            <Link to="/auth" className="btn press">Commencer <ArrowRight size={16} /></Link>
          </div>
        )}
      </div>

      {/* City picker sheet */}
      {cityOpen && (
        <>
          <div onClick={() => setCityOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(10,12,20,.45)' }} />
          <div style={{
            position: 'fixed', zIndex: 71, left: 0, right: 0, bottom: 0, maxWidth: 560, margin: '0 auto',
            background: 'var(--surface)', borderRadius: '22px 22px 0 0', padding: '18px 18px calc(18px + env(safe-area-inset-bottom,0px))',
            boxShadow: 'var(--shadow-lg)', animation: 'rise .3s cubic-bezier(.2,.7,.2,1) both',
          }}>
            <div className="spread" style={{ marginBottom: 12 }}>
              <h3 style={{ fontSize: 19 }}>Choisir une ville</h3>
              <button className="press" onClick={() => setCityOpen(false)} style={{ width: 34, height: 34, borderRadius: 999, background: 'var(--surface-2)', display: 'grid', placeItems: 'center' }}><X size={17} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
              {CITIES.map((c) => (
                <button key={c} className="press" onClick={() => pickCity(c)} style={{
                  padding: '13px 14px', borderRadius: 14, textAlign: 'start', fontWeight: 600, fontSize: 14.5,
                  border: `1.5px solid ${c === city ? 'var(--primary)' : 'var(--line)'}`,
                  background: c === city ? 'var(--primary-soft)' : 'var(--surface)', color: 'var(--ink)', cursor: 'pointer',
                }}>{c}</button>
              ))}
            </div>
          </div>
        </>
      )}

      <style>{`@media (max-width:899px){[data-statusbar]{display:flex!important}}`}</style>
    </div>
  );
}

function HeaderTile({ children, onClick, aria }) {
  return (
    <button className="press" onClick={onClick} aria-label={aria} style={{
      width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.18)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer',
    }}>{children}</button>
  );
}

function SectionTitle({ title, suffix, sub, icon, to }) {
  return (
    <div style={{ padding: '18px 0 10px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
      <div>
        <h2 style={{ fontFamily: "'Fraunces','Georgia',serif", fontSize: 'clamp(19px,2.2vw,24px)', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: 7 }}>
          {icon} {title}
          {suffix && <span style={{ color: 'var(--gold)' }}>{suffix}</span>}
        </h2>
        {sub && <div className="faint" style={{ fontSize: 12.5, marginTop: 2 }}>{sub}</div>}
      </div>
      {to && <Link to={to} className="link-more">Tout voir →</Link>}
    </div>
  );
}

/* BigCard — prototype horizontal rail card: cover, Vérifié pill, heart, logo badge overlap */
function BigCard({ r, i, favored }) {
  const { user } = useAuth();
  const nav = useNavigate();
  const toggle = useToggleFavorite();
  const [imgOk, setImgOk] = useState(true);
  const cover = r.images?.[0];

  const onFav = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return nav('/auth');
    toggle.mutate(r._id);
  };

  return (
    <Link to={`/r/${r.slug}`} className="press rise" style={{
      width: 196, flexShrink: 0, background: 'var(--surface)', borderRadius: 20, border: '1px solid var(--line)',
      animationDelay: `${i * 60}ms`, boxShadow: '0 6px 18px rgba(0,0,0,.06)', overflow: 'hidden', position: 'relative', display: 'block',
    }}>
      <div style={{ position: 'relative', height: 92, background: 'linear-gradient(135deg,#9A1B1B,#C1453C)' }}>
        {cover && imgOk && (
          <img src={cover} alt="" loading="lazy" onError={() => setImgOk(false)}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        {(!cover || !imgOk) && <ZelligePattern color="#fff" opacity={0.12} />}
        <button onClick={onFav} aria-label="Favori" style={{
          position: 'absolute', top: 8, right: 8, width: 30, height: 30, borderRadius: 10, border: 'none',
          background: 'rgba(255,255,255,.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <Heart size={15} fill={favored ? 'var(--terracotta)' : 'none'} color="var(--terracotta)" />
        </button>
        {r.verified && (
          <div style={{
            position: 'absolute', top: 10, left: 10, background: 'rgba(255,255,255,.92)', borderRadius: 8,
            padding: '3px 7px', display: 'flex', gap: 3, alignItems: 'center', fontSize: 10, fontWeight: 700, color: '#9A1B1B',
          }}>
            <CheckCircle2 size={11} /> Vérifié
          </div>
        )}
        <div style={{ position: 'absolute', bottom: -15, left: 12 }}><LogoBadge name={r.name} size={34} /></div>
      </div>
      <div style={{ padding: '20px 14px 13px' }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</div>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center', marginTop: 4 }}>
          <Star size={13} fill="var(--gold)" color="var(--gold)" />
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{r.rating ? r.rating.toFixed(1) : 'Nouveau'}</span>
          {r.reviewCount ? <span style={{ fontSize: 11.5, color: 'var(--ink-soft)' }}>({r.reviewCount})</span> : null}
        </div>
        <div style={{
          fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.45, marginTop: 6, height: 34,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>{r.shortDescription}</div>
      </div>
    </Link>
  );
}
