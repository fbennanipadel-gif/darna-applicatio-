/**
 * Import REAL Moroccan restaurant/cafe data from OpenStreetMap (Overpass API)
 * into MongoDB. Idempotent: re-running upserts by osmRef (no duplicates).
 *
 *   node utils/importOsm.js            # full import (restaurant + cafe + fast_food)
 *   node utils/importOsm.js restaurant # only one amenity type
 *
 * Data © OpenStreetMap contributors, ODbL. No fake ratings are invented.
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/db.js';
import Restaurant from '../models/Restaurant.js';

const ENDPOINTS = [
  'https://overpass.private.coffee/api/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];

// Major Moroccan cities with centroids — used to assign a city when addr:city is missing.
const CITIES = [
  { name: 'Casablanca', lat: 33.5731, lng: -7.5898 },
  { name: 'Rabat', lat: 34.0209, lng: -6.8416 },
  { name: 'Marrakech', lat: 31.6295, lng: -7.9811 },
  { name: 'Fès', lat: 34.0331, lng: -5.0003 },
  { name: 'Tanger', lat: 35.7595, lng: -5.834 },
  { name: 'Agadir', lat: 30.4278, lng: -9.5981 },
  { name: 'Meknès', lat: 33.8935, lng: -5.5473 },
  { name: 'Oujda', lat: 34.6867, lng: -1.9114 },
  { name: 'Kénitra', lat: 34.261, lng: -6.5802 },
  { name: 'Tétouan', lat: 35.5785, lng: -5.3684 },
  { name: 'Salé', lat: 34.0531, lng: -6.7985 },
  { name: 'Nador', lat: 35.1681, lng: -2.9335 },
  { name: 'Essaouira', lat: 31.5085, lng: -9.7595 },
  { name: 'El Jadida', lat: 33.2549, lng: -8.5079 },
  { name: 'Chefchaouen', lat: 35.1688, lng: -5.2636 },
  { name: 'Ouarzazate', lat: 30.9189, lng: -6.8934 },
  { name: 'Mohammedia', lat: 33.6861, lng: -7.383 },
  { name: 'Ifrane', lat: 33.5228, lng: -5.1106 },
  { name: 'Dakhla', lat: 23.6848, lng: -15.958 },
  { name: 'Taghazout', lat: 30.5451, lng: -9.7098 },
];

function haversine(aLat, aLng, bLat, bLng) {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

function nearestCity(lat, lng) {
  let best = null;
  let bestD = Infinity;
  for (const c of CITIES) {
    const d = haversine(lat, lng, c.lat, c.lng);
    if (d < bestD) {
      bestD = d;
      best = c;
    }
  }
  return { city: best.name, distanceKm: bestD };
}

const CUISINE_LABELS = {
  moroccan: 'Marocain',
  regional: 'Cuisine régionale',
  arab: 'Arabe',
  international: 'International',
  italian: 'Italien',
  pizza: 'Pizza',
  french: 'Français',
  japanese: 'Japonais',
  sushi: 'Sushi',
  chinese: 'Chinois',
  asian: 'Asiatique',
  indian: 'Indien',
  seafood: 'Fruits de mer',
  fish: 'Poisson',
  burger: 'Burger',
  american: 'Américain',
  mexican: 'Mexicain',
  lebanese: 'Libanais',
  turkish: 'Turc',
  spanish: 'Espagnol',
  mediterranean: 'Méditerranéen',
  grill: 'Grillades',
  barbecue: 'Grillades',
  kebab: 'Kebab',
  sandwich: 'Sandwich',
  coffee_shop: 'Café',
  cafe: 'Café',
  tea: 'Salon de thé',
  ice_cream: 'Glacier',
  bakery: 'Pâtisserie',
  breakfast: 'Petit-déjeuner',
  crepe: 'Crêperie',
  tapas: 'Tapas',
  steak_house: 'Steakhouse',
  vegetarian: 'Végétarien',
  vegan: 'Vegan',
  thai: 'Thaï',
  korean: 'Coréen',
};

function toTitle(s) {
  return s
    .replace(/[_-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function parseCategories(tags) {
  const cats = [];
  const cuisine = tags.cuisine || '';
  cuisine
    .split(';')
    .map((c) => c.trim().toLowerCase())
    .filter(Boolean)
    .forEach((c) => {
      cats.push(CUISINE_LABELS[c] || toTitle(c));
    });
  if (!cats.length) {
    if (tags.amenity === 'cafe') cats.push('Café');
    else if (tags.amenity === 'fast_food') cats.push('Fast-food');
    else cats.push('Restaurant');
  }
  // De-dupe, cap at 4
  return [...new Set(cats)].slice(0, 4);
}

function slugify(s) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function popularity(tags, hasPhone, hasSite, hasHours, cats) {
  let score = 0;
  if (tags.amenity === 'restaurant') score += 20;
  if (hasPhone) score += 15;
  if (hasSite) score += 15;
  if (hasHours) score += 10;
  if (tags.cuisine) score += 15;
  if (cats.length > 1) score += 5;
  if (tags['addr:street']) score += 5;
  if (tags.wheelchair === 'yes') score += 3;
  if (tags.outdoor_seating === 'yes') score += 3;
  if (tags.stars) score += Number(tags.stars) * 4;
  return score;
}

const HEADERS = {
  'Content-Type': 'application/x-www-form-urlencoded',
  Accept: 'application/json',
  'User-Agent': 'DarnaApp/1.0 (Morocco restaurant discovery; contact marketing@aicrafters.com)',
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchOverpass(query, attempt = 0) {
  const url = ENDPOINTS[attempt % ENDPOINTS.length];
  try {
    const res = await fetch(url, { method: 'POST', headers: HEADERS, body: 'data=' + encodeURIComponent(query) });
    if (res.status === 429 || res.status === 504 || res.status === 502) throw new Error(`HTTP ${res.status}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    if (text.trim().startsWith('<')) throw new Error('Overpass busy (HTML response)');
    return JSON.parse(text);
  } catch (err) {
    if (attempt >= 5) throw err;
    const backoff = 2000 * (attempt + 1);
    console.warn(`  · ${url} failed: ${err.message} — retry in ${backoff}ms`);
    await sleep(backoff);
    return fetchOverpass(query, attempt + 1);
  }
}

// One amenity per request — the public Overpass servers 504 on heavy multi-clause
// `around` queries, but single-amenity queries are fast and reliable.
function buildQuery(center, radiusKm, amenity) {
  const r = Math.round(radiusKm * 1000);
  const around = `(around:${r},${center.lat},${center.lng})`;
  return `[out:json][timeout:60];(node["amenity"="${amenity}"]["name"]${around};way["amenity"="${amenity}"]["name"]${around};);out center tags;`;
}

function toDoc(el) {
  const tags = el.tags || {};
  const name = (tags.name || '').trim();
  if (!name || name.length < 2) return null;

  const lat = el.type === 'node' ? el.lat : el.center?.lat;
  const lng = el.type === 'node' ? el.lon : el.center?.lon;
  if (typeof lat !== 'number' || typeof lng !== 'number') return null;
  // Rough Morocco bounding box guard
  if (lat < 20 || lat > 37 || lng < -18 || lng > 0) return null;

  const phone = tags.phone || tags['contact:phone'] || tags['contact:mobile'] || '';
  const website = tags.website || tags['contact:website'] || '';
  const instagram = tags['contact:instagram'] || '';
  const facebook = tags['contact:facebook'] || '';
  const hoursText = tags.opening_hours || '';
  const cats = parseCategories(tags);

  const near = nearestCity(lat, lng);
  // Always use the canonical city name for consistent filtering (OSM addr:city is
  // noisy: mixed Arabic/Tamazight/Latin scripts and casing). Keep raw addr in address.
  const city = near.city;
  // Discard points absurdly far from any known city (likely mis-tagged)
  if (near.distanceKm > 120) return null;

  const addressParts = [tags['addr:housenumber'], tags['addr:street'], tags['addr:neighbourhood'], tags['addr:city']]
    .filter(Boolean)
    .join(' ');

  const priceMap = { cheap: 1, moderate: 2, expensive: 3, fine_dining: 4 };
  let priceLevel = priceMap[tags.price] || (tags.amenity === 'fast_food' ? 1 : 2);

  return {
    osmRef: `${el.type}/${el.id}`,
    source: 'osm',
    name,
    slug: `${slugify(name)}-${el.id}`.slice(0, 80),
    shortDescription: `${cats.join(' · ')}${city ? ' — ' + city : ''}`.slice(0, 180),
    categories: cats,
    cuisineRaw: tags.cuisine || '',
    city,
    address: addressParts || undefined,
    location: { type: 'Point', coordinates: [lng, lat] },
    phone: phone || undefined,
    website: website || undefined,
    social: { instagram: instagram || undefined, facebook: facebook || undefined },
    openingHoursText: hoursText || undefined,
    priceLevel,
    rating: 0,
    reviewCount: 0,
    verified: false,
    popularityScore: popularity(tags, !!phone, !!website, !!hoursText, cats),
  };
}

// Overpass returns 0 for very large multi-clause `around` queries, so keep radii <= 12km.
// Big metros are covered by extra sub-centre points instead of one huge radius.
const CITY_RADIUS = 11;
const METRO_SUBCENTERS = {
  Casablanca: [
    { lat: 33.5731, lng: -7.5898 },
    { lat: 33.5899, lng: -7.6114 },
    { lat: 33.5461, lng: -7.6716 }, // Ain Diab / Corniche
    { lat: 33.6103, lng: -7.5389 }, // Sidi Bernoussi side
    { lat: 33.52, lng: -7.63 },
  ],
  Marrakech: [
    { lat: 31.6295, lng: -7.9811 },
    { lat: 31.6417, lng: -8.0089 }, // Gueliz
    { lat: 31.6069, lng: -7.9772 }, // Medina/Hivernage
  ],
  Rabat: [
    { lat: 34.0209, lng: -6.8416 },
    { lat: 34.0132, lng: -6.8326 }, // Agdal
  ],
  Tanger: [
    { lat: 35.7595, lng: -5.834 },
    { lat: 35.7806, lng: -5.8136 },
  ],
  Agadir: [
    { lat: 30.4278, lng: -9.5981 },
    { lat: 30.4202, lng: -9.5982 },
  ],
};

const AMENITIES = ['restaurant', 'cafe', 'fast_food'];

async function importCity(city, seen, ops) {
  const centers = METRO_SUBCENTERS[city.name] || [{ lat: city.lat, lng: city.lng }];
  const elements = [];
  for (const c of centers) {
    for (const amenity of AMENITIES) {
      try {
        const data = await fetchOverpass(buildQuery(c, CITY_RADIUS, amenity));
        if (data.elements) elements.push(...data.elements);
      } catch (err) {
        console.warn(`    (${city.name}/${amenity} skipped: ${err.message})`);
      }
      await sleep(500);
    }
  }
  let kept = 0;
  for (const el of elements) {
    const doc = toDoc(el);
    if (!doc) continue;
    if (seen.has(doc.osmRef)) continue;
    seen.add(doc.osmRef);
    ops.push({
      updateOne: {
        filter: { osmRef: doc.osmRef },
        update: {
          $set: {
            // Only fields we own from OSM; don't clobber user-generated rating/reviewCount on re-import
            name: doc.name,
            slug: doc.slug,
            shortDescription: doc.shortDescription,
            categories: doc.categories,
            cuisineRaw: doc.cuisineRaw,
            city: doc.city,
            address: doc.address,
            location: doc.location,
            phone: doc.phone,
            website: doc.website,
            social: doc.social,
            openingHoursText: doc.openingHoursText,
            priceLevel: doc.priceLevel,
            source: 'osm',
            popularityScore: doc.popularityScore,
          },
          $setOnInsert: { rating: 0, reviewCount: 0, verified: false },
        },
        upsert: true,
      },
    });
    kept++;
  }
  return { raw: elements.length, kept };
}

async function flush(ops) {
  let inserted = 0;
  let modified = 0;
  for (let i = 0; i < ops.length; i += 500) {
    const r = await Restaurant.bulkWrite(ops.slice(i, i + 500), { ordered: false });
    inserted += r.upsertedCount || 0;
    modified += r.modifiedCount || 0;
  }
  return { inserted, modified };
}

async function run() {
  await connectDatabase();
  await Restaurant.syncIndexes().catch(() => {});

  const seen = new Set();
  const only = process.argv[2];
  const targets = only ? CITIES.filter((c) => c.name.toLowerCase() === only.toLowerCase()) : CITIES;
  if (only && !targets.length) {
    console.error(`Unknown city "${only}". Known: ${CITIES.map((c) => c.name).join(', ')}`);
    process.exit(1);
  }
  console.log(`Importing real restaurants/cafés from OpenStreetMap across ${targets.length} Moroccan cit${targets.length === 1 ? 'y' : 'ies'}…`);

  let grandInserted = 0;
  let grandModified = 0;
  for (const city of targets) {
    const ops = [];
    try {
      const { raw, kept } = await importCity(city, seen, ops);
      // Flush immediately so progress survives Overpass flakiness.
      const { inserted, modified } = ops.length ? await flush(ops) : { inserted: 0, modified: 0 };
      grandInserted += inserted;
      grandModified += modified;
      console.log(`  ${city.name.padEnd(12)} ${raw} raw → ${kept} kept → +${inserted} new, ~${modified} updated`);
    } catch (err) {
      console.error(`  ! ${city.name} failed: ${err.message}`);
    }
    await sleep(1000);
  }

  const total = await Restaurant.countDocuments({ source: 'osm' });
  console.log(`\nDone. Inserted ${grandInserted}, updated ${grandModified}. Total OSM restaurants: ${total}`);
  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error('Import failed:', err);
  process.exit(1);
});
