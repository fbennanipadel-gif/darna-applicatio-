import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useFavorites, useIsFavorite } from '../lib/hooks';
import { useAuth } from '../context/AuthContext';
import RestaurantCard from '../components/RestaurantCard';
import { CardSkeleton, Empty } from '../components/ui';

export default function Favorites() {
  const { user } = useAuth();
  const { data, isLoading } = useFavorites(!!user);
  const isFav = useIsFavorite();

  if (!user) {
    return (
      <div className="container" style={{ padding: '30px 18px' }}>
        <Empty icon={<Heart size={32} />} title="Vos favoris vous attendent"
          hint="Connectez-vous pour enregistrer vos restaurants préférés et les retrouver partout."
          action={<Link to="/auth" className="btn press">Se connecter</Link>} />
      </div>
    );
  }

  const items = data?.items || [];

  return (
    <div className="container" style={{ padding: '20px 18px 40px' }}>
      <h1 style={{ fontSize: 'clamp(26px,4vw,38px)' }}>Mes favoris</h1>
      <p className="muted">{items.length} restaurant{items.length !== 1 ? 's' : ''} enregistré{items.length !== 1 ? 's' : ''}</p>
      {isLoading ? (
        <div className="grid-cards" style={{ marginTop: 16 }}>{Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}</div>
      ) : items.length ? (
        <div className="grid-cards" style={{ marginTop: 16 }}>
          {items.map((r) => <RestaurantCard key={r._id} r={r} favored={isFav(r._id)} />)}
        </div>
      ) : (
        <Empty icon={<Heart size={32} />} title="Aucun favori pour l’instant"
          hint="Explorez et touchez le cœur sur les restaurants que vous aimez."
          action={<Link to="/explore" className="btn press">Explorer</Link>} />
      )}
    </div>
  );
}
