import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MapPin, Star, Crosshair } from 'lucide-react';
import { useRestaurants } from '../lib/hooks';
import RestaurantMap from '../components/RestaurantMap';
import { Spinner, Stars } from '../components/ui';
import { priceText } from '../lib/art';

const CITIES = ['Casablanca', 'Rabat', 'Marrakech', 'Tanger', 'Agadir', 'Fès', 'Meknès', 'Tétouan', 'Essaouira'];

export default function MapPage() {
  const [params, setParams] = useSearchParams();
  const city = params.get('city') || 'Casablanca';
  const [userPos, setUserPos] = useState(null);
  const [selected, setSelected] = useState(null);
  const { data, isLoading } = useRestaurants({ city, limit: 50, sort: 'popular' });

  const items = (data?.items || []).filter((r) => r.location?.coordinates?.length === 2);

  const locate = () => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}
    );
  };
  useEffect(() => { locate(); }, []);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', height: 'calc(100dvh - var(--header-h))' }} data-map-layout>
      {/* List (desktop) */}
      <div data-map-list style={{ display: 'none', overflowY: 'auto', borderInlineEnd: '1px solid var(--line)', padding: 16 }}>
        <div className="spread" style={{ marginBottom: 12 }}>
          <h2 style={{ fontSize: 22 }}>Carte · {city}</h2>
        </div>
        <select value={city} onChange={(e) => setParams({ city: e.target.value })} className="chip" style={{ marginBottom: 12, cursor: 'pointer' }}>
          {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        {isLoading ? <Spinner /> : (
          <div className="stack" style={{ gap: 10 }}>
            {items.map((r) => (
              <Link key={r._id} to={`/r/${r.slug}`} onMouseEnter={() => setSelected(r)} className="card press" style={{ padding: 12, display: 'flex', gap: 10, alignItems: 'center', borderColor: selected?._id === r._id ? 'var(--gold)' : 'var(--line)' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700 }}>{r.name}</div>
                  <div className="row muted" style={{ gap: 5, fontSize: 12.5 }}><MapPin size={12} /> {(r.categories || []).slice(0, 2).join(', ')} {r.priceLevel ? <span className="pricelevel">· {priceText(r.priceLevel)}</span> : null}</div>
                </div>
                <Stars value={r.rating} />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      <div style={{ position: 'relative' }}>
        <RestaurantMap restaurants={items} userPos={userPos} selectedSlug={selected?.slug} onSelect={setSelected} height="100%" />
        <button className="btn press" onClick={locate} style={{ position: 'absolute', bottom: 90, right: 16, zIndex: 500, width: 46, height: 46, padding: 0, borderRadius: 999, background: 'var(--surface)', color: 'var(--ink)', boxShadow: 'var(--shadow-md)' }} aria-label="Ma position">
          <Crosshair size={20} />
        </button>
        {/* Mobile city selector */}
        <div data-map-mobile-city style={{ position: 'absolute', top: 12, left: 12, right: 12, zIndex: 500 }}>
          <select value={city} onChange={(e) => setParams({ city: e.target.value })} style={{ width: '100%', padding: '12px 14px', borderRadius: 999, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)', fontWeight: 600, boxShadow: 'var(--shadow-md)' }}>
            {CITIES.map((c) => <option key={c} value={c}>{`Carte · ${c}`}</option>)}
          </select>
        </div>
      </div>

      <style>{`
        @media (min-width:900px){
          [data-map-layout]{grid-template-columns:380px 1fr!important}
          [data-map-list]{display:block!important}
          [data-map-mobile-city]{display:none!important}
        }
        @media (max-width:899px){ [data-map-layout]{height:calc(100dvh - 56px - var(--tabbar-h))!important} }
      `}</style>
    </div>
  );
}
