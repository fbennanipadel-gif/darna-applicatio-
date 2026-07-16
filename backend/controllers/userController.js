import { z } from 'zod';
import User from '../models/User.js';
import Restaurant from '../models/Restaurant.js';
import UserEvent from '../models/UserEvent.js';

export async function toggleFavorite(req, res) {
  const { restaurantId } = z.object({ restaurantId: z.string() }).parse(req.body);
  const restaurant = await Restaurant.findById(restaurantId).select('city categories');
  if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

  const already = req.user.favorites.some((id) => String(id) === restaurantId);
  req.user.favorites = already
    ? req.user.favorites.filter((id) => String(id) !== restaurantId)
    : [...req.user.favorites, restaurantId];
  await req.user.save();

  // Keep the denormalised counter and behavioural log in sync.
  await Restaurant.updateOne({ _id: restaurantId }, { $inc: { favoriteCount: already ? -1 : 1 } });
  UserEvent.create({
    user: req.user._id,
    restaurant: restaurantId,
    type: already ? 'unfavorite' : 'favorite',
    city: restaurant.city,
    categories: restaurant.categories,
    weight: 1,
  }).catch(() => {});

  res.json({ favorite: !already, favorites: req.user.favorites });
}

export async function favorites(req, res) {
  const user = await User.findById(req.user._id).populate({
    path: 'favorites',
    select: 'name slug logo images shortDescription rating reviewCount city categories priceLevel location',
  });
  res.json({ items: user.favorites });
}
