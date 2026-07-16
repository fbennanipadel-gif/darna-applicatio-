import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useRestaurants, useIsFavorite } from '../lib/hooks';
import RestaurantCard from '../components/RestaurantCard';
import { CardSkeleton, Empty } from '../components/ui';

const CITIES = ['Casablanca', 'Rabat', 'Marrakech', 'Tanger', 'Agadir', 'Fès', 'Meknès', 'Tétouan', 'Essaouira', 'Kénitra'];
const CATS = ['Marocain', 'Café', 'Fruits de mer', 'Italien', 'Sushi', 'Grillades', 'Pizza', 'Fast-food', 'Burger', 'Français'];
const SORTS = [
  { v: 'popular', l: 'Populaires' },
  { v: 'rating', l: 'Mieux notés' },
  { v: 'reviews', l: 'Plus d’avis' },
  { v: 'newest', l: 'Nouveaux' },
];

export default function Explore() {
  const [params, setParams] = useSearchParams();
  const isFav = useIsFavorite();
  const q = params.get('q') || '';
  const city = params.get('city') || '';
  const category = params.get('category') || '';
  const sort = params.get('sort') || 'popular';
  const page = Number(params.get('page') || 1);

  const { data, isLoading, isFetching } = useRestaurants({ q, city, category, sort, page, limit: 16 });

  const setParam = (k, v) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v);
    else next.delete(k);
    if (k !== 'page') next.delete('page');
    setParams(next);
  };

  const [qLocal, setQLocal] = React.useState(q);
  React.useEffect(() => setQLocal(q), [q]);

  const items = data?.items || [];
  const pages = data?.pages || 1;
  const hasFilters = q || city || category;

  return (
    <div className="container" style={{ padding: '20px 18px 40px' }}>
      <h1 style={{ fontSize: 'clamp(26px,4vw,38px)', marginBottom: 4 }}>Explorer</h1>
      <p className="muted" style={{ marginTop: 0 }}>{data ? `${data.total} restaurants` : 'Chargement…'} au Maroc</p>

      {/* Search */}
      <div className="card row" style={{ gap: 8, padding: '4px 6px 4px 14px', margin: '14px 0', maxWidth: 560 }}>
        <Search size={19} color="var(--ink-faint)" />
        <input value={qLocal} onChange={(e) => setQLocal(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && setParam('q', qLocal)}
          placeholder="Rechercher un restaurant, une cuisine…" style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: 'var(--ink)', padding: '10px 0' }} />
        {qLocal && <button className="press" onClick={() => { setQLocal(''); setParam('q', ''); }} style={{ padding: 6 }}><X size={16} /></button>}
        <button className="btn press" onClick={() => setParam('q', qLocal)} style={{ padding: '9px 16px' }}>OK</button>
      </div>

      {/* Filters */}
      <div className="scroll-x" style={{ gap: 8, marginBottom: 6 }}>
        <select className="chip" value={city} onChange={(e) => setParam('city', e.target.value)} style={selStyle(!!city)}>
          <option value="">Ville</option>
          {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="chip" value={category} onChange={(e) => setParam('category', e.target.value)} style={selStyle(!!category)}>
          <option value="">Cuisine</option>
          {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="chip" value={sort} onChange={(e) => setParam('sort', e.target.value)} style={selStyle(false)}>
          {SORTS.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
        </select>
        {hasFilters && (
          <button className="chip press" onClick={() => setParams(new URLSearchParams())} style={{ color: 'var(--primary)' }}>
            <X size={14} /> Réinitialiser
          </button>
        )}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid-cards" style={{ marginTop: 18 }}>{Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}</div>
      ) : items.length ? (
        <>
          <div className="grid-cards" style={{ marginTop: 18, opacity: isFetching ? .6 : 1, transition: '.2s' }}>
            {items.map((r) => <RestaurantCard key={r._id || r.slug} r={r} favored={isFav(r._id)} />)}
          </div>
          {pages > 1 && (
            <div className="row" style={{ justifyContent: 'center', gap: 8, marginTop: 28 }}>
              <button className="btn ghost press" disabled={page <= 1} onClick={() => setParam('page', page - 1)}>Précédent</button>
              <span className="muted" style={{ padding: '0 10px', fontWeight: 600 }}>{page} / {pages}</span>
              <button className="btn ghost press" disabled={page >= pages} onClick={() => setParam('page', page + 1)}>Suivant</button>
            </div>
          )}
        </>
      ) : (
        <Empty icon={<SlidersHorizontal size={30} />} title="Aucun résultat" hint="Essayez d’élargir votre recherche ou de changer de filtre." />
      )}
    </div>
  );
}

const selStyle = (active) => ({
  cursor: 'pointer', appearance: 'none', paddingInlineEnd: 26,
  background: active ? 'var(--ink)' : 'var(--surface-2)', color: active ? 'var(--bg)' : 'var(--ink-soft)',
  borderColor: active ? 'var(--ink)' : 'var(--line)',
});
