import React, { useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, Tooltip } from 'react-leaflet';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';

function FitBounds({ points }) {
  const map = useMap();
  React.useEffect(() => {
    if (!points.length) return;
    if (points.length === 1) {
      map.setView(points[0], 14);
      return;
    }
    const lats = points.map((p) => p[0]);
    const lngs = points.map((p) => p[1]);
    map.fitBounds(
      [
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)],
      ],
      { padding: [40, 40], maxZoom: 15 }
    );
  }, [points, map]);
  return null;
}

export default function RestaurantMap({ restaurants = [], userPos, selectedSlug, height = '100%', onSelect }) {
  const points = useMemo(
    () =>
      restaurants
        .map((r) => {
          const c = r.location?.coordinates;
          return c && c.length === 2 ? { r, lat: c[1], lng: c[0] } : null;
        })
        .filter(Boolean),
    [restaurants]
  );

  const center = points[0] ? [points[0].lat, points[0].lng] : [33.5731, -7.5898];
  const boundsPts = [...points.map((p) => [p.lat, p.lng]), ...(userPos ? [[userPos.lat, userPos.lng]] : [])];

  return (
    <MapContainer
      center={center}
      zoom={12}
      scrollWheelZoom
      style={{ height, width: '100%', background: 'var(--bg-tint)' }}
      preferCanvas
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <FitBounds points={boundsPts} />
      {userPos && (
        <CircleMarker center={[userPos.lat, userPos.lng]} radius={8} pathOptions={{ color: '#fff', weight: 3, fillColor: '#20304E', fillOpacity: 1 }}>
          <Tooltip>Vous êtes ici</Tooltip>
        </CircleMarker>
      )}
      {points.map(({ r, lat, lng }) => {
        const sel = r.slug === selectedSlug;
        return (
          <CircleMarker
            key={r._id || r.slug}
            center={[lat, lng]}
            radius={sel ? 11 : 7}
            eventHandlers={{ click: () => onSelect?.(r) }}
            pathOptions={{
              color: '#fff',
              weight: 2,
              fillColor: sel ? '#B0872A' : '#9A1B1B',
              fillOpacity: 0.95,
            }}
          >
            <Popup>
              <div style={{ minWidth: 150 }}>
                <strong style={{ fontFamily: 'Fraunces, serif' }}>{r.name}</strong>
                <div style={{ fontSize: 12, color: '#5E6478', margin: '3px 0 6px' }}>
                  {(r.categories || []).slice(0, 2).join(' · ')} · {r.city}
                </div>
                <Link to={`/r/${r.slug}`} style={{ color: '#9A1B1B', fontWeight: 700, fontSize: 13 }}>
                  Voir la fiche →
                </Link>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
