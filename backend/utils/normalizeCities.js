/**
 * Reassign every restaurant's `city` to the nearest canonical Moroccan city
 * based on its stored coordinates. Fixes noisy OSM addr:city values
 * (mixed Arabic/Tamazight/Latin scripts) without touching Overpass.
 *
 *   node utils/normalizeCities.js
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/db.js';
import Restaurant from '../models/Restaurant.js';

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
  const s = Math.sin(dLat / 2) ** 2 + Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}
function nearest(lat, lng) {
  let best = CITIES[0], bestD = Infinity;
  for (const c of CITIES) {
    const d = haversine(lat, lng, c.lat, c.lng);
    if (d < bestD) { bestD = d; best = c; }
  }
  return best.name;
}

async function run() {
  await connectDatabase();
  const cursor = Restaurant.find({ 'location.coordinates.1': { $exists: true } }).cursor();
  let fixed = 0, checked = 0;
  for (let doc = await cursor.next(); doc; doc = await cursor.next()) {
    const [lng, lat] = doc.location.coordinates;
    const city = nearest(lat, lng);
    checked++;
    if (doc.city !== city) {
      const cats = (doc.categories || []).join(' · ');
      doc.city = city;
      doc.shortDescription = `${cats}${city ? ' — ' + city : ''}`.slice(0, 180);
      await doc.save();
      fixed++;
    }
  }
  console.log(`Checked ${checked}, normalised ${fixed} city names.`);
  await mongoose.connection.close();
  process.exit(0);
}
run().catch((e) => { console.error(e); process.exit(1); });
