import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DarnaLogo } from '../lib/art';

const LANGS = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
  { code: 'es', label: 'Español' },
];

export default function Auth() {
  const { user, login, register } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', language: 'fr' });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (user) nav('/', { replace: true }); }, [user, nav]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (mode === 'register') {
      if (!form.firstName || !form.lastName) return setError('Indiquez votre prénom et nom.');
      if (form.password.length < 8) return setError('Le mot de passe doit contenir au moins 8 caractères.');
    }
    setBusy(true);
    try {
      if (mode === 'login') await login({ email: form.email, password: form.password });
      else await register(form);
      nav('/', { replace: true });
    } catch (err) {
      const status = err?.response?.status;
      setError(err?.response?.data?.message || (status === 401 ? 'Email ou mot de passe incorrect.' : 'Une erreur est survenue.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', minHeight: '100dvh' }} data-auth>
      {/* Brand panel (desktop) */}
      <div data-auth-brand style={{ display: 'none', position: 'relative', overflow: 'hidden', background: 'linear-gradient(160deg,var(--primary),#5f1212)', color: '#fff', padding: 48, flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: .15, backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='90' height='90' viewBox='0 0 90 90'%3E%3Cpath d='M45 0l45 45-45 45L0 45z' fill='none' stroke='%23fff' stroke-width='1.5'/%3E%3C/svg%3E\")", backgroundSize: '76px' }} />
        <div style={{ position: 'relative', color: '#fff' }}><DarnaLogo size={26} mono /></div>
        <div style={{ position: 'relative' }}>
          <h1 style={{ fontSize: 44, color: '#fff', lineHeight: 1.05 }}>Notre maison,<br /><span style={{ fontStyle: 'italic', color: 'var(--gold)' }}>votre table.</span></h1>
          <p style={{ opacity: .85, maxWidth: 380, marginTop: 14 }}>Découvrez les meilleures tables du Maroc, laissez des avis vérifiés et laissez notre concierge IA vous guider.</p>
        </div>
        <div style={{ position: 'relative', opacity: .6, fontSize: 13 }}>© {new Date().getFullYear()} Darna · Données © OpenStreetMap</div>
      </div>

      {/* Form */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px 22px', maxWidth: 460, margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: 22 }} data-auth-logo><DarnaLogo size={24} /></div>
        <h2 style={{ fontSize: 30, marginBottom: 4 }}>{mode === 'login' ? 'Bon retour' : 'Créer un compte'}</h2>
        <p className="muted" style={{ marginTop: 0, marginBottom: 22 }}>
          {mode === 'login' ? 'Connectez-vous pour retrouver vos favoris.' : 'Rejoignez Darna en quelques secondes.'}
        </p>

        <form onSubmit={submit} className="stack" style={{ gap: 12 }}>
          {mode === 'register' && (
            <div className="row" style={{ gap: 10 }}>
              <Field icon={<User size={18} />} placeholder="Prénom" value={form.firstName} onChange={set('firstName')} />
              <Field icon={<User size={18} />} placeholder="Nom" value={form.lastName} onChange={set('lastName')} />
            </div>
          )}
          <Field icon={<Mail size={18} />} type="email" placeholder="Email" value={form.email} onChange={set('email')} autoComplete="email" required />
          {mode === 'register' && <Field icon={<Phone size={18} />} placeholder="Téléphone (optionnel)" value={form.phone} onChange={set('phone')} />}
          <Field icon={<Lock size={18} />} type={show ? 'text' : 'password'} placeholder="Mot de passe" value={form.password} onChange={set('password')}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required
            suffix={<button type="button" className="press" onClick={() => setShow((s) => !s)} style={{ color: 'var(--ink-faint)' }}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>} />

          {mode === 'register' && (
            <div>
              <div className="faint" style={{ fontSize: 12, marginBottom: 6, fontWeight: 700, letterSpacing: '.05em' }}>LANGUE</div>
              <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                {LANGS.map((l) => (
                  <button type="button" key={l.code} className={`chip press ${form.language === l.code ? 'on' : ''}`} onClick={() => setForm((f) => ({ ...f, language: l.code }))}>{l.label}</button>
                ))}
              </div>
            </div>
          )}

          {error && <div style={{ background: 'var(--primary-soft)', color: 'var(--primary)', padding: '10px 14px', borderRadius: 12, fontSize: 14, fontWeight: 600 }}>{error}</div>}

          <button className="btn press block" type="submit" disabled={busy} style={{ marginTop: 6, padding: 14 }}>
            {busy ? 'Un instant…' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'} <ArrowRight size={18} />
          </button>
        </form>

        <div className="muted" style={{ textAlign: 'center', marginTop: 20 }}>
          {mode === 'login' ? 'Pas encore de compte ?' : 'Déjà membre ?'}{' '}
          <button className="press" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }} style={{ color: 'var(--primary)', fontWeight: 700 }}>
            {mode === 'login' ? "S'inscrire" : 'Se connecter'}
          </button>
        </div>
      </div>

      <style>{`
        @media (min-width:900px){
          [data-auth]{grid-template-columns:1fr 1fr!important}
          [data-auth-brand]{display:flex!important}
          [data-auth-logo]{display:none!important}
        }
      `}</style>
    </div>
  );
}

function Field({ icon, suffix, ...props }) {
  return (
    <label className="row" style={{ gap: 10, padding: '0 14px', border: '1px solid var(--line)', borderRadius: 14, background: 'var(--surface-2)', flex: 1, minWidth: 0 }}>
      <span style={{ color: 'var(--ink-faint)' }}>{icon}</span>
      <input {...props} style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: 'var(--ink)', padding: '14px 0', minWidth: 0 }} />
      {suffix}
    </label>
  );
}
