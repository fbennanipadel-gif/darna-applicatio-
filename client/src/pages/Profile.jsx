import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Heart, Star, Globe, Bell, ChevronRight, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../lib/hooks';
import { LogoMark } from '../lib/art';

export default function Profile() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const { data } = useFavorites(!!user);

  if (!user) { nav('/auth'); return null; }
  const favCount = data?.items?.length ?? '—';

  return (
    <div className="container" style={{ padding: '24px 18px 40px', maxWidth: 680 }}>
      <div className="card" style={{ padding: 22, display: 'flex', gap: 16, alignItems: 'center' }}>
        <LogoMark name={`${user.firstName} ${user.lastName}`} size={64} />
        <div style={{ minWidth: 0 }}>
          <h1 style={{ fontSize: 24 }}>{user.firstName} {user.lastName}</h1>
          <div className="muted" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
          {user.role !== 'user' && <span className="chip on" style={{ marginTop: 6 }}>{user.role}</span>}
        </div>
      </div>

      <div className="row" style={{ gap: 12, marginTop: 14 }}>
        <Stat to="/favorites" icon={<Heart size={18} color="var(--primary)" />} value={favCount} label="Favoris" />
        <Stat icon={<Star size={18} color="var(--gold)" />} value={'—'} label="Avis" />
      </div>

      <div className="card stack" style={{ marginTop: 14, padding: 4 }}>
        <Row icon={<Globe size={18} />} label="Langue" value={{ fr: 'Français', en: 'English', ar: 'العربية', es: 'Español' }[user.language] || 'Français'} />
        <Row icon={<Bell size={18} />} label="Notifications" value="Activées" />
        <Row icon={<Shield size={18} />} label="Confidentialité" value="" />
      </div>

      <button className="btn ghost press block" onClick={async () => { await logout(); nav('/'); }} style={{ marginTop: 18, color: 'var(--primary)' }}>
        <LogOut size={18} /> Se déconnecter
      </button>
      <p className="faint" style={{ textAlign: 'center', fontSize: 12, marginTop: 20 }}>Darna · Données restaurants © OpenStreetMap</p>
    </div>
  );
}

function Stat({ to, icon, value, label }) {
  const inner = (
    <div className="card" style={{ flex: 1, padding: 16, textAlign: 'center' }}>
      <div style={{ display: 'grid', placeItems: 'center', marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'Fraunces, serif' }}>{value}</div>
      <div className="faint" style={{ fontSize: 13 }}>{label}</div>
    </div>
  );
  return to ? <Link to={to} style={{ flex: 1, display: 'flex' }}>{inner}</Link> : inner;
}

function Row({ icon, label, value }) {
  return (
    <div className="row press" style={{ gap: 12, padding: '14px 12px', borderBottom: '1px solid var(--line-soft)' }}>
      <span style={{ color: 'var(--gold)' }}>{icon}</span>
      <span style={{ fontWeight: 600 }}>{label}</span>
      <span className="muted" style={{ marginInlineStart: 'auto' }}>{value}</span>
      <ChevronRight size={16} color="var(--ink-faint)" />
    </div>
  );
}
