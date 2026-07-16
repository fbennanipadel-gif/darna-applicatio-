import { z } from 'zod';
import Restaurant from '../models/Restaurant.js';
import Review from '../models/Review.js';
import Offer from '../models/Offer.js';
import VerifiedVisit from '../models/VerifiedVisit.js';
import UserEvent from '../models/UserEvent.js';

async function logEvent(user, restaurant, type, weight = 1) {
  if (!user) return;
  try {
    await UserEvent.create({
      user: user._id,
      restaurant: restaurant?._id,
      type,
      city: restaurant?.city,
      categories: restaurant?.categories || [],
      weight,
    });
  } catch {
    /* non-critical */
  }
}

async function recomputeRating(restaurantId) {
  const stats = await Review.aggregate([
    { $match: { restaurant: restaurantId, status: 'published' } },
    { $group: { _id: null, rating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  await Restaurant.findByIdAndUpdate(restaurantId, {
    rating: Math.round((stats[0]?.rating || 0) * 10) / 10,
    reviewCount: stats[0]?.count || 0,
  });
}

// GET /api/restaurants
export async function list(req, res) {
  const { page = 1, limit = 12, q, city, category, sort = 'rating', lat, lng } = req.query;
  const filter = {};
  if (q) filter.$text = { $search: q };
  if (city) filter.city = new RegExp(`^${city}$`, 'i');
  if (category) filter.categories = new RegExp(category, 'i');

  const perPage = Math.min(+limit, 50);
  const skip = (+page - 1) * perPage;

  if (sort === 'nearby' && lat && lng) {
    // Geo queries can't be counted with the same filter, so paginate on results.
    const items = await Restaurant.find(filter)
      .where('location')
      .near({ center: { type: 'Point', coordinates: [+lng, +lat] }, maxDistance: 30000, spherical: true })
      .limit(perPage + skip)
      .then((all) => all.slice(skip, skip + perPage));
    return res.json({ items, total: items.length, page: +page, pages: 1 });
  }

  const sortMap = {
    rating: { rating: -1, reviewCount: -1 },
    newest: { createdAt: -1 },
    popular: { popularityScore: -1, rating: -1 },
    reviews: { reviewCount: -1 },
  };
  const [items, total] = await Promise.all([
    Restaurant.find(filter).sort(sortMap[sort] || sortMap.rating).skip(skip).limit(perPage),
    Restaurant.countDocuments(filter),
  ]);
  res.json({ items, total, page: +page, pages: Math.ceil(total / perPage) });
}

// GET /api/restaurants/trending  — popularity + engagement, no personalisation
export async function trending(req, res) {
  const { city, limit = 12 } = req.query;
  const match = {};
  if (city) match.city = new RegExp(`^${city}$`, 'i');
  const items = await Restaurant.aggregate([
    { $match: match },
    {
      $addFields: {
        trendScore: {
          $add: [
            { $ifNull: ['$popularityScore', 0] },
            { $multiply: [{ $ifNull: ['$rating', 0] }, { $ifNull: ['$reviewCount', 0] }, 2] },
            { $multiply: [{ $ifNull: ['$viewCount', 0] }, 0.5] },
            { $multiply: [{ $ifNull: ['$favoriteCount', 0] }, 3] },
            { $cond: ['$promoted', 60, 0] },
          ],
        },
      },
    },
    { $sort: { trendScore: -1 } },
    { $limit: Math.min(+limit, 30) },
    { $project: { name: 1, slug: 1, city: 1, categories: 1, rating: 1, reviewCount: 1, priceLevel: 1, logo: 1, images: 1, shortDescription: 1, location: 1, trendScore: 1, promoted: 1, verified: 1 } },
  ]);
  res.json({ items });
}

// GET /api/restaurants/recommended  — personalised (protect)
export async function recommended(req, res) {
  const events = await UserEvent.find({ user: req.user._id }).sort('-createdAt').limit(120);
  const favoritedIds = (req.user.favorites || []).map(String);

  if (!events.length && !favoritedIds.length) {
    // Cold start → fall back to trending.
    return trending(req, res);
  }

  const catW = {};
  const cityW = {};
  const typeWeight = { favorite: 4, review: 5, visit: 4, view: 1, search: 1 };
  for (const e of events) {
    const w = (typeWeight[e.type] || 1) * (e.weight || 1);
    (e.categories || []).forEach((c) => (catW[c] = (catW[c] || 0) + w));
    if (e.city) cityW[e.city] = (cityW[e.city] || 0) + w;
  }
  const topCats = Object.keys(catW).sort((a, b) => catW[b] - catW[a]).slice(0, 6);
  const topCities = Object.keys(cityW).sort((a, b) => cityW[b] - cityW[a]).slice(0, 3);

  const or = [];
  if (topCats.length) or.push({ categories: { $in: topCats } });
  if (topCities.length) or.push({ city: { $in: topCities } });
  const query = or.length ? { $or: or } : {};

  const candidates = await Restaurant.find({
    ...query,
    _id: { $nin: favoritedIds },
  })
    .limit(120)
    .lean();

  const scored = candidates
    .map((r) => {
      let score = (r.popularityScore || 0) * 0.15 + (r.rating || 0) * (r.reviewCount || 0) * 0.3;
      (r.categories || []).forEach((c) => (score += catW[c] || 0));
      if (r.city && cityW[r.city]) score += cityW[r.city] * 0.5;
      return { ...r, recScore: score };
    })
    .sort((a, b) => b.recScore - a.recScore)
    .slice(0, 12);

  res.json({ items: scored, basedOn: { categories: topCats, cities: topCities } });
}

// GET /api/restaurants/:slug
export async function detail(req, res) {
  const item = await Restaurant.findOne({ slug: req.params.slug });
  if (!item) return res.status(404).json({ message: 'Restaurant not found' });
  // Count the view (fire-and-forget) and log behaviour for signed-in users.
  Restaurant.updateOne({ _id: item._id }, { $inc: { viewCount: 1 } }).catch(() => {});
  logEvent(req.user, item, 'view', 1);

  const [reviews, offers] = await Promise.all([
    Review.find({ restaurant: item._id, status: 'published' })
      .populate('user', 'firstName lastName')
      .sort('-createdAt')
      .limit(30),
    Offer.find({ restaurant: item._id, active: true }),
  ]);
  const myReview = req.user
    ? await Review.findOne({ restaurant: item._id, user: req.user._id }).lean()
    : null;
  res.json({ restaurant: item, reviews, offers, myReview });
}

// POST /api/restaurants/:slug/reviews  — any signed-in user (protect)
export async function createReview(req, res) {
  const data = z
    .object({ rating: z.number().int().min(1).max(5), comment: z.string().min(5).max(1500) })
    .parse(req.body);
  const restaurant = await Restaurant.findOne({ slug: req.params.slug });
  if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

  // A matching NFC-verified visit earns the "verified" badge.
  const visit = await VerifiedVisit.findOne({ user: req.user._id, restaurant: restaurant._id }).sort('-verifiedAt');

  const review = await Review.findOneAndUpdate(
    { restaurant: restaurant._id, user: req.user._id },
    {
      $set: {
        rating: data.rating,
        comment: data.comment,
        status: 'published',
        verified: !!visit,
        verifiedVisit: visit?._id,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).populate('user', 'firstName lastName');

  if (visit && !visit.reviewed) {
    visit.reviewed = true;
    await visit.save();
  }
  await recomputeRating(restaurant._id);
  await logEvent(req.user, restaurant, 'review', 1);
  const fresh = await Restaurant.findById(restaurant._id).select('rating reviewCount');
  res.status(201).json({ review, rating: fresh.rating, reviewCount: fresh.reviewCount });
}

// POST /api/restaurants  (partner/admin)
export async function create(req, res) {
  const data = z
    .object({
      name: z.string().min(2),
      city: z.string().min(2),
      categories: z.array(z.string()).min(1),
      shortDescription: z.string().max(180).optional(),
      description: z.string().max(4000).optional(),
      address: z.string().max(200).optional(),
      phone: z.string().max(40).optional(),
      website: z.string().max(200).optional(),
      priceLevel: z.number().int().min(1).max(4).optional(),
      lat: z.number().optional(),
      lng: z.number().optional(),
    })
    .parse(req.body);
  const { lat, lng, ...rest } = data;
  const payload = { ...rest, owner: req.user._id, source: 'manual' };
  if (typeof lat === 'number' && typeof lng === 'number') payload.location = { type: 'Point', coordinates: [lng, lat] };
  res.status(201).json({ restaurant: await Restaurant.create(payload) });
}

// PATCH /api/restaurants/:id  (owner/admin) — whitelisted fields only
export async function update(req, res) {
  const item = await Restaurant.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Restaurant not found' });
  if (req.user.role !== 'admin' && String(item.owner) !== String(req.user._id))
    return res.status(403).json({ message: 'Not allowed' });

  const data = z
    .object({
      name: z.string().min(2).optional(),
      shortDescription: z.string().max(180).optional(),
      description: z.string().max(4000).optional(),
      categories: z.array(z.string()).optional(),
      address: z.string().max(200).optional(),
      phone: z.string().max(40).optional(),
      website: z.string().max(200).optional(),
      priceLevel: z.number().int().min(1).max(4).optional(),
      logo: z.string().optional(),
      images: z.array(z.string()).optional(),
      social: z.object({ instagram: z.string().optional(), facebook: z.string().optional() }).optional(),
    })
    .parse(req.body);
  // Admins may additionally toggle verified/promoted.
  if (req.user.role === 'admin') {
    if (typeof req.body.verified === 'boolean') item.verified = req.body.verified;
    if (typeof req.body.promoted === 'boolean') item.promoted = req.body.promoted;
  }
  Object.assign(item, data);
  await item.save();
  res.json({ restaurant: item });
}
