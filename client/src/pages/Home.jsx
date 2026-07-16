import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, MapPin, TrendingUp, Sparkles, ArrowRight, Utensils } from 'lucide-react';
import { useTrending, useRecommended, useIsFavorite } from '../lib/hooks';
import { useAuth } from '../context/AuthContext';
import RestaurantCard from '../components/RestaurantCard';
import { CardSkeleton, Empty } from '../components/ui';

const CITIES = ['Casablanca', 'Rabat', 'Marrakech', 'Tanger', 'Agadir', 'Fès'];
const CATS = [
  { label: 'Marocain', q: 'Marocain' },
  { label: 'Café', q: 'Café' },
  { label: 'Fruits de mer', q: 'Fruits de mer' },
  { label: 'Italien', q: 'Italien' },
  { label: 'Sushi', q: 'Sushi' },
  { label: 'Grillades', q: 'Grillades' },
  { label: 'Fast-food', q: 'Fast-food' },
  { label: 'Pizza', q: 'Pizza' },
];

export default function Home() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [q, setQ] = useState('');
  const [city, setCity] = useState('');
  const trending = useTrending({ limit: 8 });
  const recommended = useRecommended(!!user);
  const isFav = useIsFavorite();

  const search = () => {
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (city) p.set('city', city);
    nav(`/explore?${p.toString()}`);
  };

  return (
    <div>
      {/* HERO */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, var(--primary) 0%, #6f1414 55%, #3d0f0f 100%)' }} />
        <ZelligeOverlay />
        <div className="container" style={{ position: 'relative', padding: '46px 18px 40px', color: '#fff' }}>
          <div className="eyebrow rise" style={{ color: 'var(--gold)' }}>Notre maison, votre table</div>
          <h1 className="rise" style={{ fontSize: 'clamp(34px, 6vw, 62px)', maxWidth: 780, margin: '10px 0 8px', color: '#fff' }}>
            Les meilleures tables du Maroc, <span style={{ fontStyle: 'italic', color: 'var(--gold)' }}>vérifiées</span> et près de vous.
          </h1>
          <p className="rise" style={{ fontSize: 'clamp(15px,2vw,18px)', opacity: .9, maxWidth: 560, margin: '0 0 22px' }}>
            Des milliers de restaurants réels, des avis authentiques et un concierge IA qui comprend vos envies.
          </p>

          <div className="rise" style={{
            display: 'flex', gap: 8, flexWrap: 'wrap', background: 'var(--surface)', padding: 8, borderRadius: 18,
            boxShadow: 'var(--shadow-lg)', maxWidth: 720,
          }}>
            <div className="row" style={{ flex: '1 1 220px', gap: 8, padding: '0 10px', minWidth: 0 }}>
              <Search size={19} color="var(--ink-faint)" />
              <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && search()}
                placeholder="Cuisine, plat, restaurant…" style={inp} />
            </div>
            <div className="row" style={{ flex: '1 1 150px', gap: 8, padding: '0 10px', borderInlineStart: '1px solid var(--line)', minWidth: 0 }}>
              <MapPin size={18} color="var(--ink-faint)" />
              <select value={city} onChange={(e) => setCity(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                <option value="">Toutes les villes</option>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button className="btn press" onClick={search} style={{ flex: '0 0 auto' }}><Search size={17} /> Rechercher</button>
          </div>

          <div className="row scroll-x" style={{ marginTop: 18, gap: 8 }}>
            {CITIES.map((c) => (
              <button key={c} className="press" onClick={() => nav(`/explore?city=${encodeURIComponent(c)}`)}
                style={{ padding: '7px 14px', borderRadius: 999, background: 'rgba(255,255,255,.14)', color: '#fff', fontWeight: 600, fontSize: 14, border: '1px solid rgba(255,255,255,.2)' }}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="container">
        {/* Categories */}
        <div className="scroll-x" style={{ margin: '22px 0 4px', gap: 10 }}>
          {CATS.map((c) => (
            <Link key={c.label} to={`/explore?q=${encodeURIComponent(c.q)}`} className="card press" style={{
              padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap', fontWeight: 600,
            }}>
              <Utensils size={15} color="var(--gold)" /> {c.label}
            </Link>
          ))}
        </div>

        {/* Recommended (personalised) */}
        {user && (
          <Section title="Pour vous" icon={<Sparkles size={18} color="var(--gold)" />} to="/explore"
            subtitle="Sélection basée sur vos favoris et vos visites">
            <Grid data={recommended.data?.items} loading={recommended.isLoading} isFav={isFav}
              empty="Ajoutez des favoris pour recevoir des recommandations." />
          </Section>
        )}

        {/* Trending */}
        <Section title="Tendances au Maroc" icon={<TrendingUp size={18} color="var(--primary)" />} to="/explore">
          <Grid data={trending.data?.items} loading={trending.isLoading} isFav={isFav}
            empty="Aucune donnée pour le moment." />
        </Section>

        {!user && (
          <div className="card" style={{ margin: '10px 0 40px', padding: 24, textAlign: 'center', background: 'linear-gradient(135deg,var(--gold-soft),var(--surface))' }}>
            <h2 style={{ fontSize: 24, marginBottom: 6 }}>Créez votre compte Darna</h2>
            <p className="muted" style={{ margin: '0 auto 16px', maxWidth: 420 }}>Enregistrez vos favoris, laissez des avis et recevez des recommandations personnalisées.</p>
            <Link to="/auth" className="btn press">Commencer <ArrowRight size={16} /></Link>
          </div>
        )}
        <div style={{ height: 30 }} />
      </div>
    </div>
  );
}

function Section({ title, icon, subtitle, to, children }) {
  return (
    <section style={{ marginTop: 8 }}>
      <div className="section-title">
        <div>
          <h2 className="row" style={{ gap: 8 }}>{icon} {title}</h2>
          {subtitle && <div className="faint" style={{ fontSize: 13, marginTop: 2 }}>{subtitle}</div>}
        </div>
        {to && <Link to={to} className="link-more">Tout voir →</Link>}
      </div>
      {children}
    </section>
  );
}

function Grid({ data, loading, isFav, empty }) {
  if (loading) return <div className="grid-cards">{Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}</div>;
  if (!data?.length) return <Empty icon={<Utensils size={30} />} title="Rien ici pour l'instant" hint={empty} />;
  return (
    <div className="grid-cards">
      {data.map((r) => <RestaurantCard key={r._id || r.slug} r={r} favored={isFav(r._id)} />)}
    </div>
  );
}

function ZelligeOverlay() {
  return (
    <div style={{
      position: 'absolute', inset: 0, opacity: .14, mixBlendMode: 'overlay',
      backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cpath d='M40 0l40 40-40 40L0 40z' fill='none' stroke='%23fff' stroke-width='1.5'/%3E%3Cpath d='M40 16l24 24-24 24-24-24z' fill='none' stroke='%23fff' stroke-width='1'/%3E%3C/svg%3E\")",
      backgroundSize: '70px 70px',
    }} />
  );
}

const inp = { flex: 1, border: 'none', outline: 'none', background: 'transparent', color: 'var(--ink)', fontSize: 15, minWidth: 0, appearance: 'none' };
