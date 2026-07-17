import { z } from 'zod';
import User from '../models/User.js';
import Restaurant from '../models/Restaurant.js';
import UserEvent from '../models/UserEvent.js';
import Review from '../models/Review.js';
import VerifiedVisit from '../models/VerifiedVisit.js';

// PATCH /api/users/me — update profile & preferences
export async function updateMe(req, res) {
  const data = z
    .object({
      firstName: z.string().min(1).max(50).optional(),
      lastName: z.string().min(1).max(50).optional(),
      phone: z.string().max(30).optional(),
      language: z.enum(['en', 'fr', 'ar', 'es']).optional(),
    })
    .parse(req.body);
  Object.assign(req.user, data);
  await req.user.save();
  res.json({
    user: {
      id: req.user._id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
      language: req.user.language,
      favorites: req.user.favorites,
    },
  });
}

// GET /api/users/me/reviews — the user's own reviews
export async function myReviews(req, res) {
  const items = await Review.find({ user: req.user._id })
    .populate('restaurant', 'name slug city logo images')
    .sort('-createdAt');
  res.json({ items });
}

/**
 * GET /api/users/me/loyalty — Carte de fidélité Darna.
 * Points: verified visit = 100, review = 50, favorite = 10.
 * Stamps: 1 per verified visit; every 10 stamps unlocks a reward.
 */
export async function loyalty(req, res) {
  const [visits, reviews] = await Promise.all([
    VerifiedVisit.countDocuments({ user: req.user._id }),
    Review.countDocuments({ user: req.user._id, status: 'published' }),
  ]);
  const favoritesCount = (req.user.favorites || []).length;
  const points = visits * 100 + reviews * 50 + favoritesCount * 10;
  const tiers = [
    { name: 'Bronze', min: 0 },
    { name: 'Argent', min: 300 },
    { name: 'Or', min: 800 },
    { name: 'Diamant', min: 1500 },
  ];
  const tier = [...tiers].reverse().find((t) => points >= t.min);
  const next = tiers.find((t) => t.min > points) || null;
  res.json({
    points,
    visits,
    reviews,
    favorites: favoritesCount,
    tier: tier.name,
    nextTier: next ? { name: next.name, at: next.min, remaining: next.min - points } : null,
    stamps: visits % 10,
    stampsTarget: 10,
    rewardsEarned: Math.floor(visits / 10),
    memberSince: req.user.createdAt,
    cardNumber: String(req.user._id).slice(-8).toUpperCase(),
  });
}

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
