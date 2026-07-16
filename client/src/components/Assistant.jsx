import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Send, X, MapPin } from 'lucide-react';
import { useAskConcierge } from '../lib/hooks';
import { useAuth } from '../context/AuthContext';
import { Stars } from './ui';

const GREETING = {
  role: 'assistant',
  content:
    "Bonjour 👋 Je suis le concierge Darna. Dites-moi votre ville, votre envie (marocain, sushi, brunch…) et votre budget — je vous trouve la meilleure table.",
};

export default function Assistant({ open, onClose }) {
  const { user } = useAuth();
  const ask = useAskConcierge();
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);
  const sessionId = useRef('sess-' + Math.random().toString(36).slice(2));

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, ask.isPending]);

  const send = async () => {
    const text = input.trim();
    if (!text || ask.isPending) return;
    setMessages((m) => [...m, { role: 'user', content: text }]);
    setInput('');
    if (!user) {
      setMessages((m) => [...m, { role: 'assistant', content: "Connectez-vous pour discuter avec le concierge et enregistrer vos préférences.", cta: true }]);
      return;
    }
    try {
      const data = await ask.mutateAsync({ message: text, sessionId: sessionId.current });
      setMessages((m) => [...m, { role: 'assistant', content: data.answer, restaurants: data.restaurants || [] }]);
    } catch (e) {
      const status = e?.response?.status;
      setMessages((m) => [...m, {
        role: 'assistant',
        content: status === 503 ? "Le concierge n'est pas encore configuré." : "Désolé, le concierge est momentanément indisponible. Réessayez dans un instant.",
      }]);
    }
  };

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(10,12,20,.45)',
        opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none', transition: '.25s',
      }} />
      <aside style={{
        position: 'fixed', zIndex: 61, background: 'var(--surface)', display: 'flex', flexDirection: 'column',
        transition: 'transform .3s cubic-bezier(.2,.7,.2,1)',
        inset: 'auto 0 0 0', height: '86dvh', borderRadius: '24px 24px 0 0',
        transform: open ? 'translateY(0)' : 'translateY(101%)',
        boxShadow: 'var(--shadow-lg)',
      }} data-asst>
        <div className="spread" style={{ padding: '16px 18px', borderBottom: '1px solid var(--line)' }}>
          <div className="row" style={{ gap: 10 }}>
            <span style={{ width: 38, height: 38, borderRadius: 12, background: 'linear-gradient(135deg,#C79A3B,#B0872A)', display: 'grid', placeItems: 'center', color: '#221803' }}><Sparkles size={20} /></span>
            <div>
              <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 17 }}>Concierge Darna</div>
              <div className="faint" style={{ fontSize: 12 }}>Propulsé par l'IA · données réelles</div>
            </div>
          </div>
          <button className="press" onClick={onClose} style={{ width: 36, height: 36, borderRadius: 999, display: 'grid', placeItems: 'center', background: 'var(--surface-2)' }}><X size={18} /></button>
        </div>

        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
              <div style={{
                padding: '11px 14px', borderRadius: 16, lineHeight: 1.5, fontSize: 15,
                background: m.role === 'user' ? 'var(--primary)' : 'var(--surface-2)',
                color: m.role === 'user' ? 'var(--primary-ink)' : 'var(--ink)',
                borderBottomRightRadius: m.role === 'user' ? 4 : 16,
                borderBottomLeftRadius: m.role === 'user' ? 16 : 4,
                border: m.role === 'user' ? 'none' : '1px solid var(--line)',
                whiteSpace: 'pre-wrap',
              }}>{m.content}</div>
              {m.cta && <Link to="/auth" onClick={onClose} className="btn press" style={{ marginTop: 8, padding: '8px 16px', fontSize: 14 }}>Créer un compte</Link>}
              {m.restaurants?.length > 0 && (
                <div className="stack" style={{ gap: 8, marginTop: 8 }}>
                  {m.restaurants.map((r) => (
                    <Link key={r.slug} to={`/r/${r.slug}`} onClick={onClose} className="card press" style={{ padding: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{r.name}</div>
                        <div className="row muted" style={{ gap: 5, fontSize: 12 }}><MapPin size={12} /> {r.city} · {(r.categories || []).slice(0, 2).join(', ')}</div>
                      </div>
                      <Stars value={r.rating} />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          {ask.isPending && <div className="muted" style={{ fontSize: 14, fontStyle: 'italic' }}>Le concierge réfléchit…</div>}
        </div>

        <div className="row" style={{ gap: 8, padding: 14, borderTop: '1px solid var(--line)', paddingBottom: 'calc(14px + env(safe-area-inset-bottom,0px))' }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Ex : un bon marocain à Marrakech pour ce soir"
            style={{ flex: 1, padding: '13px 16px', borderRadius: 999, border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--ink)', outline: 'none' }}
          />
          <button className="btn press" onClick={send} disabled={ask.isPending} style={{ width: 48, height: 48, padding: 0, borderRadius: 999 }}><Send size={18} /></button>
        </div>
      </aside>

      <style>{`@media (min-width:900px){[data-asst]{inset:0 0 0 auto!important;width:440px;height:100dvh!important;border-radius:0!important}}`}</style>
    </>
  );
}
