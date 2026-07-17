import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronLeft, User, Mail, Phone, Lock, Check, AlertTriangle, Loader2, Globe, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { OB, ZelligePattern, Logo3D } from '../lib/brand';

const I18N = {
  fr: {
    dir: 'ltr', welcome: 'Bienvenue', tagline: 'Découvrez les meilleurs restaurants du Maroc en quelques secondes.',
    start: 'Commencer', langTitle: 'Choisissez votre langue', langSub: 'Vous pourrez la changer à tout moment.', continue: 'Continuer',
    account: 'Créer votre compte', accountSub: 'Rejoignez Darna en quelques secondes.',
    first: 'Prénom', last: 'Nom', email: 'Email', phone: 'Téléphone', password: 'Mot de passe',
    errFirst: 'Au moins 2 caractères', errLast: 'Au moins 2 caractères', errEmail: 'Email invalide', errPhone: 'Numéro invalide', errPassword: 'Au moins 8 caractères',
    createAccount: 'Créer mon compte', creating: 'Création…', haveAccount: 'Déjà membre ?', signIn: 'Se connecter',
    loginTitle: 'Bon retour', loginSub: 'Connectez-vous pour retrouver vos favoris.', signingIn: 'Connexion…', noAccount: 'Pas de compte ?', signUp: "S'inscrire",
    successT: 'Compte créé', successS: 'Bienvenue dans la maison, votre table vous attend.', enter: 'Entrer dans Darna',
    welcomeBack: 'Ravi de vous revoir', successLoginS: 'Votre table vous attend.',
  },
  en: {
    dir: 'ltr', welcome: 'Welcome', tagline: 'Discover the best restaurants in Morocco in seconds.',
    start: 'Get started', langTitle: 'Choose your language', langSub: 'You can change it anytime.', continue: 'Continue',
    account: 'Create your account', accountSub: 'Join Darna in seconds.',
    first: 'First name', last: 'Last name', email: 'Email', phone: 'Phone', password: 'Password',
    errFirst: 'At least 2 characters', errLast: 'At least 2 characters', errEmail: 'Invalid email', errPhone: 'Invalid number', errPassword: 'At least 8 characters',
    createAccount: 'Create my account', creating: 'Creating…', haveAccount: 'Already a member?', signIn: 'Sign in',
    loginTitle: 'Welcome back', loginSub: 'Sign in to find your favourites.', signingIn: 'Signing in…', noAccount: 'No account?', signUp: 'Sign up',
    successT: 'Account created', successS: 'Welcome home, your table awaits.', enter: 'Enter Darna',
    welcomeBack: 'Good to see you again', successLoginS: 'Your table awaits.',
  },
  ar: {
    dir: 'rtl', welcome: 'مرحباً', tagline: 'اكتشف أفضل مطاعم المغرب في ثوانٍ.',
    start: 'ابدأ', langTitle: 'اختر لغتك', langSub: 'يمكنك تغييرها في أي وقت.', continue: 'متابعة',
    account: 'أنشئ حسابك', accountSub: 'انضم إلى دارنا في ثوانٍ.',
    first: 'الاسم', last: 'النسب', email: 'البريد الإلكتروني', phone: 'الهاتف', password: 'كلمة المرور',
    errFirst: 'حرفان على الأقل', errLast: 'حرفان على الأقل', errEmail: 'بريد غير صالح', errPhone: 'رقم غير صالح', errPassword: '8 أحرف على الأقل',
    createAccount: 'إنشاء حسابي', creating: 'جارٍ الإنشاء…', haveAccount: 'عضو بالفعل؟', signIn: 'تسجيل الدخول',
    loginTitle: 'مرحباً بعودتك', loginSub: 'سجّل الدخول لاستعادة مفضلاتك.', signingIn: 'جارٍ الدخول…', noAccount: 'لا حساب؟', signUp: 'سجّل',
    successT: 'تم إنشاء الحساب', successS: 'مرحباً بك في الدار، طاولتك في انتظارك.', enter: 'ادخل إلى دارنا',
    welcomeBack: 'سعداء برؤيتك من جديد', successLoginS: 'طاولتك في انتظارك.',
  },
  es: {
    dir: 'ltr', welcome: 'Bienvenido', tagline: 'Descubre los mejores restaurantes de Marruecos en segundos.',
    start: 'Empezar', langTitle: 'Elige tu idioma', langSub: 'Puedes cambiarlo en cualquier momento.', continue: 'Continuar',
    account: 'Crea tu cuenta', accountSub: 'Únete a Darna en segundos.',
    first: 'Nombre', last: 'Apellido', email: 'Email', phone: 'Teléfono', password: 'Contraseña',
    errFirst: 'Mínimo 2 caracteres', errLast: 'Mínimo 2 caracteres', errEmail: 'Email inválido', errPhone: 'Número inválido', errPassword: 'Mínimo 8 caracteres',
    createAccount: 'Crear mi cuenta', creating: 'Creando…', haveAccount: '¿Ya eres miembro?', signIn: 'Iniciar sesión',
    loginTitle: 'Bienvenido de nuevo', loginSub: 'Inicia sesión para ver tus favoritos.', signingIn: 'Entrando…', noAccount: '¿Sin cuenta?', signUp: 'Regístrate',
    successT: 'Cuenta creada', successS: 'Bienvenido a casa, tu mesa te espera.', enter: 'Entrar en Darna',
    welcomeBack: 'Qué bueno verte de nuevo', successLoginS: 'Tu mesa te espera.',
  },
};

const LANGS = [
  { code: 'fr', flag: '🇫🇷', label: 'Français' },
  { code: 'ar', flag: '🇲🇦', label: 'العربية' },
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'es', flag: '🇪🇸', label: 'Español' },
];

const redGrad = `linear-gradient(160deg,${OB.redDark},${OB.red})`;
const ctaStyle = (enabled = true) => ({
  width: '100%', height: 58, borderRadius: 18, background: enabled ? OB.red : '#F0A9AD', color: '#fff',
  border: 'none', fontSize: 16.5, fontWeight: 700, cursor: enabled ? 'pointer' : 'default',
  boxShadow: enabled ? '0 12px 28px -8px rgba(229,9,20,.6)' : 'none',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
});

export default function Onboarding({ initialStep = 'splash' }) {
  const nav = useNavigate();
  const { user, login, register } = useAuth();
  const [step, setStep] = useState(initialStep); // splash · welcome · lang · signup · login · success
  const [lang, setLang] = useState(localStorage.getItem('darna_lang') || 'fr');
  const [newUser, setNewUser] = useState(null);
  const [wasLogin, setWasLogin] = useState(false);
  const t = I18N[lang];

  // Already signed in and not mid-flow → straight to the app.
  useEffect(() => {
    if (user && step === 'splash') {
      const timer = setTimeout(() => finish(), 2200);
      return () => clearTimeout(timer);
    }
  }, [user]); // eslint-disable-line

  const finish = () => {
    localStorage.setItem('darna_onboarded', '1');
    nav('/', { replace: true });
  };

  const screens = {
    splash: <Splash onDone={() => (user ? finish() : setStep('welcome'))} />,
    welcome: <Welcome t={t} dir={t.dir} onNext={() => setStep('lang')} />,
    lang: <LangPick t={t} lang={lang} setLang={(l) => { setLang(l); localStorage.setItem('darna_lang', l); }} onNext={() => setStep('signup')} />,
    signup: (
      <SignUp t={t} dir={t.dir} lang={lang} register={register}
        onBack={() => setStep('lang')}
        onLogin={() => setStep('login')}
        onDone={(u) => { setNewUser(u); setWasLogin(false); setStep('success'); }} />
    ),
    login: (
      <Login t={t} dir={t.dir} login={login}
        onBack={() => setStep('signup')}
        onSignup={() => setStep('signup')}
        onDone={(u) => { setNewUser(u); setWasLogin(true); setStep('success'); }} />
    ),
    success: <Success t={t} dir={t.dir} user={newUser} wasLogin={wasLogin} onEnter={finish} />,
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: '#fff' }}>
      <div key={step} style={{ position: 'absolute', inset: 0, animation: 'screenIn .4s ease both' }}>
        {screens[step]}
      </div>
    </div>
  );
}

/* ---------- Écran 1 : Splash ---------- */
function Splash({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line
  return (
    <div style={{ position: 'absolute', inset: 0, background: redGrad, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <ZelligePattern color={OB.gold} opacity={0.12} />
      <div style={{ position: 'relative', animation: 'logoIn 1s cubic-bezier(.2,.8,.2,1) both' }}>
        <Logo3D size={140} />
      </div>
      <div style={{ position: 'relative', marginTop: 30, color: 'rgba(255,255,255,.8)', fontSize: 12.5, letterSpacing: 3, fontWeight: 600, animation: 'fadeInOb 1.2s .5s both' }}>
        NOTRE MAISON, VOTRE TABLE
      </div>
    </div>
  );
}

/* ---------- Écran 2 : Bienvenue ---------- */
function Welcome({ t, dir, onNext }) {
  return (
    <div dir={dir} style={{ position: 'absolute', inset: 0, background: '#fff', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: '58%', background: redGrad, position: 'relative', borderBottomLeftRadius: 40, borderBottomRightRadius: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <ZelligePattern color={OB.gold} opacity={0.13} />
        <div style={{ animation: 'logoIn .9s cubic-bezier(.2,.8,.2,1) both' }}><Logo3D size={128} /></div>
      </div>
      <div style={{ flex: 1, padding: '34px 30px', display: 'flex', flexDirection: 'column', animation: 'fadeInOb .6s .2s both', maxWidth: 560, width: '100%', margin: '0 auto' }}>
        <h1 style={{ fontFamily: "'Fraunces','Georgia',serif", fontSize: 34, fontWeight: 600, color: OB.ink, margin: 0 }}>{t.welcome}</h1>
        <p style={{ fontSize: 16, lineHeight: 1.55, color: '#5B5B5B', marginTop: 12 }}>{t.tagline}</p>
        <div style={{ flex: 1 }} />
        <button className="press" onClick={onNext} style={ctaStyle()}>
          {t.start} <ArrowRight size={20} style={{ transform: dir === 'rtl' ? 'scaleX(-1)' : 'none' }} />
        </button>
      </div>
    </div>
  );
}

/* ---------- Écran 3 : Langue ---------- */
function LangPick({ t, lang, setLang, onNext }) {
  return (
    <div dir={t.dir} style={{ position: 'absolute', inset: 0, background: '#fff', display: 'flex', flexDirection: 'column', padding: '56px 26px 26px', maxWidth: 560, margin: '0 auto', width: '100%' }}>
      <div style={{ width: 60, height: 60, borderRadius: 20, background: `linear-gradient(135deg,${OB.redDeep},${OB.red})`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <Globe size={28} color="#fff" />
      </div>
      <h1 style={{ fontFamily: "'Fraunces','Georgia',serif", fontSize: 26, fontWeight: 600, color: OB.ink, margin: 0 }}>{t.langTitle}</h1>
      <p style={{ fontSize: 14, color: '#8A8A8A', marginTop: 8 }}>{t.langSub}</p>
      <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {LANGS.map((l) => {
          const on = lang === l.code;
          return (
            <button key={l.code} className="press" onClick={() => setLang(l.code)} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '15px 16px', borderRadius: 18,
              border: `2px solid ${on ? OB.red : OB.line}`, background: on ? '#FFF1F1' : '#fff', cursor: 'pointer',
            }}>
              <span style={{ fontSize: 24 }}>{l.flag}</span>
              <span style={{ fontSize: 16, fontWeight: 600, color: OB.ink }}>{l.label}</span>
              {on && <Check size={20} color={OB.red} style={{ marginInlineStart: 'auto' }} />}
            </button>
          );
        })}
      </div>
      <div style={{ flex: 1 }} />
      <button className="press" onClick={onNext} style={ctaStyle()}>
        {t.continue} <ArrowRight size={20} style={{ transform: t.dir === 'rtl' ? 'scaleX(-1)' : 'none' }} />
      </button>
    </div>
  );
}

/* ---------- Field (prototype styling, real-time validation) ---------- */
function Field({ icon, label, value, onChange, onBlur, valid, error, touched, type = 'text', dir, suffix, autoComplete }) {
  const [focus, setFocus] = useState(false);
  const showErr = touched && !valid;
  const showOk = touched && valid;
  const border = showErr ? OB.red : focus ? OB.ink : OB.line;
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 12.5, fontWeight: 600, color: '#6B6B6B', marginBottom: 7, display: 'block' }}>{label}</label>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: `1.5px solid ${border}`,
        borderRadius: 16, padding: '0 14px', height: 54, transition: 'border-color .2s, box-shadow .2s',
        boxShadow: focus ? '0 0 0 4px rgba(20,20,20,.06)' : 'none',
      }}>
        <span style={{ color: focus ? OB.ink : '#9A9A9A', display: 'flex', transition: 'color .2s' }}>{icon}</span>
        <input
          value={value} type={type} dir={dir} autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => { setFocus(false); onBlur && onBlur(); }}
          style={{ flex: 1, border: 'none', outline: 'none', background: 'none', fontSize: 15, color: OB.ink, fontFamily: 'inherit', height: '100%', minWidth: 0 }}
        />
        {suffix}
        {showOk && <Check size={18} color="#1F9D55" />}
        {showErr && <AlertTriangle size={17} color={OB.red} />}
      </div>
      {showErr && <div style={{ fontSize: 12, color: OB.red, marginTop: 5 }}>{error}</div>}
    </div>
  );
}

function BackBtn({ dir, onClick }) {
  return (
    <button className="press" onClick={onClick} style={{
      width: 42, height: 42, borderRadius: 13, border: `1px solid ${OB.line}`, background: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: 18,
    }}>
      <ChevronLeft size={20} color={OB.ink} style={{ transform: dir === 'rtl' ? 'scaleX(-1)' : 'none' }} />
    </button>
  );
}

/* ---------- Écran 4 : Inscription (wired to real API) ---------- */
function SignUp({ t, dir, lang, register, onBack, onLogin, onDone }) {
  const [f, setF] = useState({ first: '', last: '', email: '', phone: '', password: '' });
  const [touched, setTouched] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const v = {
    first: f.first.trim().length >= 2,
    last: f.last.trim().length >= 2,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email),
    phone: f.phone === '' || f.phone.replace(/\D/g, '').length >= 8,
    password: f.password.length >= 8,
  };
  const allValid = v.first && v.last && v.email && v.password && v.phone;
  const set = (k) => (val) => setF((s) => ({ ...s, [k]: val }));
  const blur = (k) => () => setTouched((s) => ({ ...s, [k]: true }));

  const submit = async () => {
    setTouched({ first: true, last: true, email: true, phone: true, password: true });
    if (!allValid || loading) return;
    setLoading(true);
    setApiError('');
    try {
      const u = await register({
        firstName: f.first.trim(), lastName: f.last.trim(), email: f.email.trim(),
        phone: f.phone.trim() || undefined, password: f.password, language: lang,
      });
      onDone(u);
    } catch (err) {
      setApiError(err?.response?.data?.message || 'Une erreur est survenue. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir={dir} style={{ position: 'absolute', inset: 0, background: '#fff', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '48px 26px 8px', flexShrink: 0, maxWidth: 560, margin: '0 auto', width: '100%' }}>
        <BackBtn dir={dir} onClick={onBack} />
        <h1 style={{ fontFamily: "'Fraunces','Georgia',serif", fontSize: 26, fontWeight: 600, color: OB.ink, margin: 0 }}>{t.account}</h1>
        <p style={{ fontSize: 14, color: '#8A8A8A', marginTop: 8 }}>{t.accountSub}</p>
      </div>
      <div className="scr" style={{ flex: 1, overflowY: 'auto', padding: '16px 26px 0', maxWidth: 560, margin: '0 auto', width: '100%' }}>
        <Field icon={<User size={19} />} label={t.first} value={f.first} onChange={set('first')} onBlur={blur('first')} valid={v.first} error={t.errFirst} touched={touched.first} dir={dir} autoComplete="given-name" />
        <Field icon={<User size={19} />} label={t.last} value={f.last} onChange={set('last')} onBlur={blur('last')} valid={v.last} error={t.errLast} touched={touched.last} dir={dir} autoComplete="family-name" />
        <Field icon={<Mail size={19} />} label={t.email} value={f.email} onChange={set('email')} onBlur={blur('email')} valid={v.email} error={t.errEmail} touched={touched.email} type="email" dir="ltr" autoComplete="email" />
        <Field icon={<Phone size={19} />} label={`${t.phone} (optionnel)`} value={f.phone} onChange={(val) => set('phone')(val.replace(/[^\d\s+]/g, ''))} onBlur={blur('phone')} valid={v.phone} error={t.errPhone} touched={touched.phone} type="tel" dir="ltr" autoComplete="tel" />
        <Field icon={<Lock size={19} />} label={t.password} value={f.password} onChange={set('password')} onBlur={blur('password')} valid={v.password} error={t.errPassword} touched={touched.password} type={showPw ? 'text' : 'password'} dir="ltr" autoComplete="new-password"
          suffix={<button type="button" className="press" onClick={() => setShowPw((s) => !s)} style={{ border: 'none', background: 'none', color: '#9A9A9A', display: 'flex', cursor: 'pointer' }}>{showPw ? <EyeOff size={18} /> : <Eye size={18} />}</button>} />
        {apiError && <div style={{ background: '#FFF1F1', color: OB.red, padding: '10px 14px', borderRadius: 12, fontSize: 13.5, fontWeight: 600, marginBottom: 8 }}>{apiError}</div>}
      </div>
      <div style={{ padding: '12px 26px 26px', flexShrink: 0, maxWidth: 560, margin: '0 auto', width: '100%' }}>
        <button className="press" onClick={submit} disabled={loading} style={ctaStyle(allValid)}>
          {loading ? (<><Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> {t.creating}</>) : t.createAccount}
        </button>
        <div style={{ textAlign: 'center', marginTop: 14, fontSize: 14, color: '#6B6B6B' }}>
          {t.haveAccount}{' '}
          <button className="press" onClick={onLogin} style={{ border: 'none', background: 'none', color: OB.red, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>{t.signIn}</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Écran 4b : Connexion ---------- */
function Login({ t, dir, login, onBack, onSignup, onDone }) {
  const [f, setF] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const v = { email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email), password: f.password.length >= 1 };
  const allValid = v.email && v.password;

  const submit = async () => {
    setTouched({ email: true, password: true });
    if (!allValid || loading) return;
    setLoading(true);
    setApiError('');
    try {
      const u = await login({ email: f.email.trim(), password: f.password });
      onDone(u);
    } catch (err) {
      setApiError(err?.response?.data?.message || 'Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir={dir} style={{ position: 'absolute', inset: 0, background: '#fff', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '48px 26px 8px', flexShrink: 0, maxWidth: 560, margin: '0 auto', width: '100%' }}>
        <BackBtn dir={dir} onClick={onBack} />
        <h1 style={{ fontFamily: "'Fraunces','Georgia',serif", fontSize: 26, fontWeight: 600, color: OB.ink, margin: 0 }}>{t.loginTitle}</h1>
        <p style={{ fontSize: 14, color: '#8A8A8A', marginTop: 8 }}>{t.loginSub}</p>
      </div>
      <div className="scr" style={{ flex: 1, overflowY: 'auto', padding: '16px 26px 0', maxWidth: 560, margin: '0 auto', width: '100%' }}>
        <Field icon={<Mail size={19} />} label={t.email} value={f.email} onChange={(val) => setF((s) => ({ ...s, email: val }))} onBlur={() => setTouched((s) => ({ ...s, email: true }))} valid={v.email} error={t.errEmail} touched={touched.email} type="email" dir="ltr" autoComplete="email" />
        <Field icon={<Lock size={19} />} label={t.password} value={f.password} onChange={(val) => setF((s) => ({ ...s, password: val }))} onBlur={() => setTouched((s) => ({ ...s, password: true }))} valid={v.password} error={t.errPassword} touched={touched.password} type={showPw ? 'text' : 'password'} dir="ltr" autoComplete="current-password"
          suffix={<button type="button" className="press" onClick={() => setShowPw((s) => !s)} style={{ border: 'none', background: 'none', color: '#9A9A9A', display: 'flex', cursor: 'pointer' }}>{showPw ? <EyeOff size={18} /> : <Eye size={18} />}</button>} />
        {apiError && <div style={{ background: '#FFF1F1', color: OB.red, padding: '10px 14px', borderRadius: 12, fontSize: 13.5, fontWeight: 600 }}>{apiError}</div>}
      </div>
      <div style={{ padding: '12px 26px 26px', flexShrink: 0, maxWidth: 560, margin: '0 auto', width: '100%' }}>
        <button className="press" onClick={submit} disabled={loading} style={ctaStyle(allValid)}>
          {loading ? (<><Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> {t.signingIn}</>) : t.signIn}
        </button>
        <div style={{ textAlign: 'center', marginTop: 14, fontSize: 14, color: '#6B6B6B' }}>
          {t.noAccount}{' '}
          <button className="press" onClick={onSignup} style={{ border: 'none', background: 'none', color: OB.red, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>{t.signUp}</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Écran 5 : Succès "Compte créé" ---------- */
function Success({ t, dir, user, wasLogin, onEnter }) {
  return (
    <div dir={dir} style={{ position: 'absolute', inset: 0, background: redGrad, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 30, overflow: 'hidden' }}>
      <ZelligePattern color={OB.gold} opacity={0.12} />
      <div style={{
        position: 'relative', width: 96, height: 96, borderRadius: '50%', background: 'rgba(255,255,255,.14)',
        border: '2px solid rgba(255,255,255,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'logoIn .7s cubic-bezier(.2,.8,.2,1) both',
      }}>
        <Check size={52} color="#fff" strokeWidth={2.5} />
      </div>
      <h1 style={{ position: 'relative', fontFamily: "'Fraunces','Georgia',serif", fontSize: 30, fontWeight: 600, color: '#fff', margin: '26px 0 0', animation: 'fadeInOb .6s .2s both' }}>
        {wasLogin ? t.welcomeBack : t.successT}
      </h1>
      <p style={{ position: 'relative', fontSize: 15.5, color: 'rgba(255,255,255,.85)', textAlign: 'center', marginTop: 12, maxWidth: 280, lineHeight: 1.55, animation: 'fadeInOb .6s .35s both' }}>
        {user?.firstName ? `${user.firstName}, ` : ''}{wasLogin ? t.successLoginS : t.successS}
      </p>
      <div style={{ position: 'relative', marginTop: 40, width: '100%', maxWidth: 420, animation: 'fadeInOb .6s .5s both' }}>
        <button className="press" onClick={onEnter} style={{
          width: '100%', height: 58, borderRadius: 18, background: '#fff', color: OB.red, border: 'none',
          fontSize: 16.5, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
        }}>
          {t.enter} <ArrowRight size={20} style={{ transform: dir === 'rtl' ? 'scaleX(-1)' : 'none' }} />
        </button>
      </div>
    </div>
  );
}
