import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Heart, Star, MapPin, Phone, Globe, Clock, Navigation, BadgeCheck, Share2, Tag } from 'lucide-react';
import { useRestaurant, useToggleFavorite, useSubmitReview, useIsFavorite } from '../lib/hooks';
import { useAuth } from '../context/AuthContext';
import { RestaurantArt, priceText } from '../lib/art';
import { XLogo, InstagramLogo, FacebookLogo } from '../lib/brand';
import { Stars, Spinner, Badge, Empty } from '../components/ui';
import RestaurantMap from '../components/RestaurantMap';

export default function RestaurantDetail() {
  const { slug } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const { data, isLoading, isError } = useRestaurant(slug);
  const toggle = useToggleFavorite();
  const isFav = useIsFavorite();

  if (isLoading) return <Spinner label="Chargement du restaurant…" />;
  if (isError || !data?.restaurant) return <Empty title="Restaurant introuvable" hint="Ce restaurant n’existe pas ou a été retiré." action={<Link to="/explore" className="btn">Explorer</Link>} />;

  const r = data.restaurant;
  const reviews = data.reviews || [];
  const offers = data.offers || [];
  const coords = r.location?.coordinates;
  const favored = isFav(r._id);
  const cover = r.images?.[0] || r.logo;

  const onFav = () => (user ? toggle.mutate(r._id) : nav('/auth'));
  const share = () => {
    if (navigator.share) navigator.share({ title: r.name, url: window.location.href }).catch(() => {});
    else navigator.clipboard?.writeText(window.location.href);
  };

  return (
    <div>
      {/* Cover */}
      <div style={{ position: 'relative', height: 'clamp(220px, 38vh, 380px)', background: 'var(--bg-tint)' }}>
        {cover ? <img src={cover} alt={r.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <RestaurantArt name={r.name} rounded={false} />}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.55), transparent 55%)' }} />
        <div className="container" style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px 18px' }}>
          <div className="spread">
            <button className="press" onClick={() => nav(-1)} style={fab}><ArrowLeft size={20} /></button>
            <div className="row" style={{ gap: 8 }}>
              <button className="press" onClick={share} style={fab}><Share2 size={18} /></button>
              <button className="press" onClick={onFav} style={fab}><Heart size={20} fill={favored ? '#9A1B1B' : 'none'} color={favored ? '#9A1B1B' : '#1B2033'} /></button>
            </div>
          </div>
          <div style={{ color: '#fff' }}>
            <div className="row" style={{ gap: 8, marginBottom: 6 }}>
              {r.verified && <Badge tone="green">Vérifié</Badge>}
              {r.promoted && <Badge tone="gold">Sponsorisé</Badge>}
            </div>
            <h1 style={{ fontSize: 'clamp(28px,5vw,46px)', color: '#fff', display: 'flex', alignItems: 'center', gap: 10 }}>
              {r.name} {r.verified && <BadgeCheck size={26} color="var(--gold)" />}
            </h1>
            <div className="row" style={{ gap: 12, marginTop: 6, flexWrap: 'wrap', fontWeight: 600 }}>
              <span className="row" style={{ gap: 5 }}><Star size={16} fill="var(--gold)" strokeWidth={0} /> {r.rating ? r.rating.toFixed(1) : 'Nouveau'} {r.reviewCount ? <span style={{ opacity: .8 }}>({r.reviewCount})</span> : null}</span>
              <span className="row" style={{ gap: 5 }}><MapPin size={15} /> {r.city}</span>
              {r.priceLevel ? <span className="pricelevel" style={{ color: 'var(--gold)' }}>{priceText(r.priceLevel)}</span> : null}
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '20px 18px 60px', display: 'grid', gap: 26, gridTemplateColumns: '1fr', maxWidth: 1000 }}>
        {/* Categories */}
        <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
          {(r.categories || []).map((c) => <span key={c} className="chip">{c}</span>)}
        </div>

        {r.shortDescription && <p style={{ fontSize: 17, lineHeight: 1.6, margin: 0 }}>{r.description || r.shortDescription}</p>}

        {/* Social & web presence */}
        {(r.social?.instagram || r.social?.facebook || r.social?.twitter || r.website) && (
          <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
            {r.social?.instagram && (
              <SocialIcon href={r.social.instagram.startsWith('http') ? r.social.instagram : `https://instagram.com/${r.social.instagram.replace(/^@/, '')}`} label="Instagram"><InstagramLogo size={18} /></SocialIcon>
            )}
            {r.social?.facebook && (
              <SocialIcon href={r.social.facebook.startsWith('http') ? r.social.facebook : `https://facebook.com/${r.social.facebook}`} label="Facebook"><FacebookLogo size={18} /></SocialIcon>
            )}
            {r.social?.twitter && (
              <SocialIcon href={r.social.twitter.startsWith('http') ? r.social.twitter : `https://x.com/${r.social.twitter.replace(/^@/, '')}`} label="X"><XLogo size={16} /></SocialIcon>
            )}
            {r.website && (
              <SocialIcon href={r.website.startsWith('http') ? r.website : `https://${r.website}`} label="Site web"><Globe size={18} /></SocialIcon>
            )}
          </div>
        )}

        {/* Offers */}
        {offers.length > 0 && (
          <div className="stack" style={{ gap: 10 }}>
            {offers.map((o) => (
              <div key={o._id} className="card row" style={{ gap: 12, padding: 14, background: 'var(--gold-soft)', borderColor: 'var(--gold)' }}>
                <Tag size={20} color="var(--gold-ink)" />
                <div><strong>{o.title}</strong> {o.discount && <span style={{ color: 'var(--primary)', fontWeight: 800 }}>· {o.discount}</span>}<div className="muted" style={{ fontSize: 13 }}>{o.description}</div></div>
              </div>
            ))}
          </div>
        )}

        {/* Info + map */}
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr' }} data-info-grid>
          <div className="card stack" style={{ gap: 2, padding: 6 }}>
            {r.address && <InfoRow icon={<MapPin size={18} />} label={r.address} />}
            {r.phone && <InfoRow icon={<Phone size={18} />} label={r.phone} href={`tel:${r.phone}`} />}
            {r.website && <InfoRow icon={<Globe size={18} />} label={r.website.replace(/^https?:\/\//, '').slice(0, 40)} href={r.website} external />}
            {r.openingHoursText && <InfoRow icon={<Clock size={18} />} label={r.openingHoursText} />}
            {coords && (
              <a className="row press" href={`https://www.google.com/maps/dir/?api=1&destination=${coords[1]},${coords[0]}`} target="_blank" rel="noreferrer"
                style={{ gap: 12, padding: '13px 12px', color: 'var(--primary)', fontWeight: 700 }}>
                <Navigation size={18} /> Itinéraire
              </a>
            )}
          </div>
          {coords && (
            <div className="card" style={{ overflow: 'hidden', minHeight: 220, height: 260 }}>
              <RestaurantMap restaurants={[r]} selectedSlug={r.slug} height="260px" />
            </div>
          )}
        </div>

        {/* Reviews */}
        <div>
          <div className="section-title"><h2 className="row" style={{ gap: 8 }}><Star size={20} color="var(--gold)" fill="var(--gold)" /> Avis {r.reviewCount ? `(${r.reviewCount})` : ''}</h2></div>
          <ReviewForm slug={slug} myReview={data.myReview} user={user} onNeedAuth={() => nav('/auth')} />
          {reviews.length ? (
            <div className="stack" style={{ gap: 12, marginTop: 16 }}>
              {reviews.map((rv) => <ReviewCard key={rv._id} rv={rv} />)}
            </div>
          ) : (
            <p className="muted" style={{ marginTop: 12 }}>Soyez le premier à laisser un avis sur ce restaurant.</p>
          )}
        </div>
      </div>

      <style>{`@media(min-width:760px){[data-info-grid]{grid-template-columns:1fr 1fr!important;align-items:start}}`}</style>
    </div>
  );
}

function SocialIcon({ href, label, children }) {
  return (
    <a className="press" href={href} target="_blank" rel="noreferrer" aria-label={label} style={{
      width: 44, height: 44, borderRadius: 13, display: 'grid', placeItems: 'center',
      background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--ink)', boxShadow: 'var(--shadow-sm)',
    }}>
      {children}
    </a>
  );
}

function InfoRow({ icon, label, href, external }) {
  const inner = <><span style={{ color: 'var(--gold)' }}>{icon}</span><span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span></>;
  const style = { gap: 12, padding: '13px 12px', borderBottom: '1px solid var(--line-soft)' };
  return href ? <a className="row press" href={href} target={external ? '_blank' : undefined} rel="noreferrer" style={style}>{inner}</a> : <div className="row" style={style}>{inner}</div>;
}

function ReviewCard({ rv }) {
  const name = rv.user ? `${rv.user.firstName} ${rv.user.lastName?.[0] || ''}.` : 'Invité';
  return (
    <div className="card" style={{ padding: 16 }}>
      <div className="spread">
        <div className="row" style={{ gap: 8 }}>
          <strong>{name}</strong>
          {rv.verified && <span className="row" style={{ gap: 3, fontSize: 12, color: 'var(--green)', fontWeight: 700 }}><BadgeCheck size={14} /> Visite vérifiée</span>}
        </div>
        <Stars value={rv.rating} />
      </div>
      <p style={{ margin: '8px 0 0', lineHeight: 1.55 }}>{rv.comment}</p>
    </div>
  );
}

function ReviewForm({ slug, myReview, user, onNeedAuth }) {
  const submit = useSubmitReview(slug);
  const [rating, setRating] = useState(myReview?.rating || 0);
  const [comment, setComment] = useState(myReview?.comment || '');
  const [done, setDone] = useState(false);

  if (!user) {
    return (
      <div className="card" style={{ padding: 18, textAlign: 'center' }}>
        <p className="muted" style={{ margin: '0 0 12px' }}>Connectez-vous pour partager votre expérience.</p>
        <button className="btn press" onClick={onNeedAuth}>Se connecter</button>
      </div>
    );
  }

  const send = async () => {
    if (!rating || comment.trim().length < 5) return;
    await submit.mutateAsync({ rating, comment: comment.trim() });
    setDone(true);
    setTimeout(() => setDone(false), 2500);
  };

  return (
    <div className="card" style={{ padding: 18 }}>
      <div style={{ fontWeight: 700, marginBottom: 10 }}>{myReview ? 'Modifier votre avis' : 'Laisser un avis'}</div>
      <div className="row" style={{ gap: 4, marginBottom: 12 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} className="press" onClick={() => setRating(n)} aria-label={`${n} étoiles`}>
            <Star size={30} fill={n <= rating ? 'var(--gold)' : 'none'} color={n <= rating ? 'var(--gold)' : 'var(--line)'} strokeWidth={n <= rating ? 0 : 1.5} />
          </button>
        ))}
      </div>
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder="Qu’avez-vous pensé de ce restaurant ?"
        style={{ width: '100%', border: '1px solid var(--line)', borderRadius: 12, padding: 12, resize: 'vertical', background: 'var(--surface-2)', color: 'var(--ink)', outline: 'none' }} />
      <div className="spread" style={{ marginTop: 12 }}>
        <span className="faint" style={{ fontSize: 12 }}>{done ? '✓ Avis enregistré' : submit.isError ? 'Erreur, réessayez' : ''}</span>
        <button className="btn press" onClick={send} disabled={!rating || comment.trim().length < 5 || submit.isPending}>
          {submit.isPending ? 'Envoi…' : myReview ? 'Mettre à jour' : 'Publier'}
        </button>
      </div>
    </div>
  );
}

const fab = { width: 42, height: 42, borderRadius: 999, background: 'rgba(255,255,255,.92)', color: '#1B2033', display: 'grid', placeItems: 'center', boxShadow: 'var(--shadow-sm)' };
