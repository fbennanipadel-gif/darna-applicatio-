import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Heart, Star, Globe, Bell, ChevronRight, Moon, Check, X as XIcon, MapPin, BadgeCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFavorites, useMyReviews, useUpdateMe, useLoyalty } from '../lib/hooks';
import { LogoMark } from '../lib/art';
import { XLogo, InstagramLogo, FacebookLogo } from '../lib/brand';
import FidelityCard from '../components/FidelityCard';

const LANGS = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
  { code: 'es', label: 'Español' },
];

export default function Profile() {
  const { user, loading, logout, setUser } = useAuth();
  const nav = useNavigate();
  const favs = useFavorites(!!user);
  const reviews = useMyReviews(!!user);
  const loyalty = useLoyalty(!!user);
  const updateMe = useUpdateMe();

  const [langOpen, setLangOpen] = useState(false);
  const [notif, setNotif] = useState(() => localStorage.getItem('darna_notif') !== '0');
  const [dark, setDark] = useState(() => (localStorage.getItem('darna_theme') || 'light') === 'dark');

  React.useEffect(() => {
    if (!loading && !user) nav('/auth', { replace: true });
  }, [loading, user, nav]);

  if (loading) return <div className="skeleton" style={{ height: 300, margin: 18, borderRadius: 22 }} />;
  if (!user) return null;

  const setLanguage = async (code) => {
    setLangOpen(false);
    localStorage.setItem('darna_lang', code);
    try {
      const { user: updated } = await updateMe.mutateAsync({ language: code });
      setUser(updated);
    } catch { /* offline — local pref still saved */ }
  };

  const toggleDark = () => {
    const next = dark ? 'light' : 'dark';
    setDark(!dark);
    localStorage.setItem('darna_theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  const toggleNotif = () => {
    setNotif((n) => {
      localStorage.setItem('darna_notif', n ? '0' : '1');
      return !n;
    });
  };

  const langLabel = LANGS.find((l) => l.code === user.language)?.label || 'Français';
  const myReviews = reviews.data?.items || [];

  return (
    <div className="container" style={{ padding: '24px 18px 40px', maxWidth: 680 }}>
      {/* Identity */}
      <div className="card" style={{ padding: 22, display: 'flex', gap: 16, alignItems: 'center' }}>
        <LogoMark name={`${user.firstName} ${user.lastName}`} size={64} />
        <div style={{ minWidth: 0 }}>
          <h1 style={{ fontSize: 24 }}>{user.firstName} {user.lastName}</h1>
          <div className="muted" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
          {user.role !== 'user' && <span className="chip on" style={{ marginTop: 6 }}>{user.role}</span>}
        </div>
      </div>

      {/* Carte de fidélité */}
      <div style={{ marginTop: 14 }}>
        <FidelityCard user={user} />
      </div>

      {/* Stats */}
      <div className="row" style={{ gap: 12, marginTop: 14 }}>
        <Stat to="/favorites" icon={<Heart size={18} color="var(--primary)" />} value={favs.data?.items?.length ?? '…'} label="Favoris" />
        <Stat icon={<Star size={18} color="var(--gold)" />} value={reviews.data ? myReviews.length : '…'} label="Avis" />
        <Stat icon={<MapPin size={18} color="var(--green)" />} value={loyalty.data?.visits ?? '…'} label="Visites" />
      </div>

      {/* Settings */}
      <div className="card stack" style={{ marginTop: 14, padding: 4 }}>
        <Row icon={<Globe size={18} />} label="Langue" value={langLabel} onClick={() => setLangOpen(true)} />
        <Row icon={<Moon size={18} />} label="Mode sombre" toggle={dark} onClick={toggleDark} />
        <Row icon={<Bell size={18} />} label="Notifications" toggle={notif} onClick={toggleNotif} last />
      </div>

      {/* Mes avis */}
      <div style={{ marginTop: 22 }}>
        <h2 style={{ fontSize: 20, marginBottom: 10 }}>Mes avis</h2>
        {myReviews.length ? (
          <div className="stack" style={{ gap: 10 }}>
            {myReviews.map((rv) => (
              <Link key={rv._id} to={`/r/${rv.restaurant?.slug}`} className="card press" style={{ padding: 14, display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="row" style={{ gap: 6, fontWeight: 700 }}>
                    {rv.restaurant?.name || 'Restaurant'}
                    {rv.verified && <BadgeCheck size={14} color="var(--green)" />}
                  </div>
                  <div className="muted" style={{ fontSize: 13, marginTop: 3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{rv.comment}</div>
                </div>
                <span className="rating"><Star size={14} fill="var(--gold)" strokeWidth={0} color="var(--gold)" /> {rv.rating}</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="muted" style={{ marginTop: 4 }}>Vous n'avez pas encore laissé d'avis. Visitez un restaurant et partagez votre expérience !</p>
        )}
      </div>

      {/* Social — suivez Darna */}
      <div className="card" style={{ marginTop: 22, padding: 18, textAlign: 'center' }}>
        <div style={{ fontWeight: 700, marginBottom: 12 }}>Suivez Darna</div>
        <div className="row" style={{ gap: 12, justifyContent: 'center' }}>
          <SocialBtn href="https://instagram.com/darna.app" label="Instagram"><InstagramLogo size={19} /></SocialBtn>
          <SocialBtn href="https://facebook.com/darna.app" label="Facebook"><FacebookLogo size={19} /></SocialBtn>
          <SocialBtn href="https://x.com/darna_app" label="X"><XLogo size={17} /></SocialBtn>
          <SocialBtn href="https://darna-sigma.vercel.app" label="Site web"><Globe size={19} /></SocialBtn>
        </div>
      </div>

      <button className="btn ghost press block" onClick={async () => { await logout(); nav('/'); }} style={{ marginTop: 18, color: 'var(--primary)' }}>
        <LogOut size={18} /> Se déconnecter
      </button>
      <p className="faint" style={{ textAlign: 'center', fontSize: 12, marginTop: 20 }}>Darna · Données restaurants © OpenStreetMap</p>

      {/* Language sheet */}
      {langOpen && (
        <>
          <div onClick={() => setLangOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(10,12,20,.45)' }} />
          <div style={{
            position: 'fixed', zIndex: 71, left: 0, right: 0, bottom: 0, maxWidth: 560, margin: '0 auto',
            background: 'var(--surface)', borderRadius: '22px 22px 0 0', padding: '18px 18px calc(18px + env(safe-area-inset-bottom,0px))',
            boxShadow: 'var(--shadow-lg)', animation: 'rise .3s cubic-bezier(.2,.7,.2,1) both',
          }}>
            <div className="spread" style={{ marginBottom: 12 }}>
              <h3 style={{ fontSize: 19 }}>Langue</h3>
              <button className="press" onClick={() => setLangOpen(false)} style={{ width: 34, height: 34, borderRadius: 999, background: 'var(--surface-2)', display: 'grid', placeItems: 'center', border: 'none', cursor: 'pointer' }}><XIcon size={17} /></button>
            </div>
            <div className="stack" style={{ gap: 9 }}>
              {LANGS.map((l) => (
                <button key={l.code} className="press" onClick={() => setLanguage(l.code)} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderRadius: 14, cursor: 'pointer',
                  border: `1.5px solid ${user.language === l.code ? 'var(--primary)' : 'var(--line)'}`,
                  background: user.language === l.code ? 'var(--primary-soft)' : 'var(--surface)', color: 'var(--ink)', fontWeight: 600, fontSize: 15,
                }}>
                  {l.label}
                  {user.language === l.code && <Check size={18} color="var(--primary)" style={{ marginInlineStart: 'auto' }} />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ to, icon, value, label }) {
  const inner = (
    <div className="card" style={{ flex: 1, padding: 16, textAlign: 'center' }}>
      <div style={{ display: 'grid', placeItems: 'center', marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Fraunces','Georgia',serif" }}>{value}</div>
      <div className="faint" style={{ fontSize: 13 }}>{label}</div>
    </div>
  );
  return to ? <Link to={to} style={{ flex: 1, display: 'flex' }}>{inner}</Link> : <div style={{ flex: 1, display: 'flex' }}>{inner}</div>;
}

function Row({ icon, label, value, toggle, onClick, last }) {
  return (
    <button className="row press" onClick={onClick} style={{
      gap: 12, padding: '14px 12px', borderBottom: last ? 'none' : '1px solid var(--line-soft)',
      background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'start',
      borderBottomColor: 'var(--line-soft)', borderBottomStyle: last ? 'none' : 'solid', borderBottomWidth: last ? 0 : 1,
    }}>
      <span style={{ color: 'var(--gold)' }}>{icon}</span>
      <span style={{ fontWeight: 600, color: 'var(--ink)', fontSize: 15 }}>{label}</span>
      <span style={{ marginInlineStart: 'auto', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        {typeof toggle === 'boolean' ? (
          <span style={{
            width: 44, height: 26, borderRadius: 99, position: 'relative', transition: '.2s',
            background: toggle ? 'var(--green)' : 'var(--line)',
          }}>
            <span style={{
              position: 'absolute', top: 3, left: toggle ? 21 : 3, width: 20, height: 20, borderRadius: '50%',
              background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.25)', transition: 'left .2s',
            }} />
          </span>
        ) : (
          <>
            <span className="muted">{value}</span>
            <ChevronRight size={16} color="var(--ink-faint)" />
          </>
        )}
      </span>
    </button>
  );
}

function SocialBtn({ href, label, children }) {
  return (
    <a className="press" href={href} target="_blank" rel="noreferrer" aria-label={label} style={{
      width: 46, height: 46, borderRadius: 14, display: 'grid', placeItems: 'center',
      background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--ink)',
    }}>
      {children}
    </a>
  );
}
