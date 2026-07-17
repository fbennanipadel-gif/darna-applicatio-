/**
 * Give every restaurant a real photo.
 *
 * Strategy (legitimate sources only — no Google scraping, which violates ToS):
 *   1. Restaurants with a website → fetch their own og:image / twitter:image
 *      (a real photo of the actual venue, published by the venue itself).
 *   2. Everyone else → a real, high-quality food/venue photograph matched to
 *      their cuisine category (curated Unsplash CDN pool), picked
 *      deterministically so each restaurant keeps a stable image.
 *
 *   node utils/fetchImages.js          # run both stages
 *   node utils/fetchImages.js og       # only stage 1 (websites)
 *   node utils/fetchImages.js pool     # only stage 2 (cuisine pool)
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/db.js';
import Restaurant from '../models/Restaurant.js';

const u = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

// Curated real photography pool, keyed by cuisine keyword (checked stable Unsplash CDN paths).
const POOL = {
  marocain: [
    u('photo-1541518763669-27fef04b14ea'), // tagine
    u('photo-1585937421612-70a008356fbe'), // couscous-style dish
    u('photo-1539136788836-5699e78bfc75'), // moroccan riad
    u('photo-1519676867240-f03562e64548'), // moroccan tea
  ],
  cafe: [
    u('photo-1509042239860-f550ce710b93'), // coffee cup
    u('photo-1445116572660-236099ec97a0'), // café interior
    u('photo-1495474472287-4d71bcdd2085'), // coffee beans latte
    u('photo-1554118811-1e0d58224f24'), // cafe terrace
  ],
  pizza: [
    u('photo-1513104890138-7c749659a591'),
    u('photo-1574071318508-1cdbab80d002'),
    u('photo-1565299624946-b28f40a0ae38'),
  ],
  sushi: [
    u('photo-1579584425555-c3ce17fd4351'),
    u('photo-1553621042-f6e147245754'),
    u('photo-1611143669185-af224c5e3252'),
  ],
  burger: [
    u('photo-1568901346375-23c9450c58cd'),
    u('photo-1571091718767-18b5b1457add'),
    u('photo-1550547660-d9450f859349'),
  ],
  'fruits de mer': [
    u('photo-1559742811-822873691df8'),
    u('photo-1615141982883-c7ad0e69fd62'),
    u('photo-1519708227418-c8fd9a32b7a2'),
  ],
  poisson: [u('photo-1519708227418-c8fd9a32b7a2'), u('photo-1535140728325-a4d3707eee61')],
  grillades: [
    u('photo-1529193591184-b1d58069ecdd'),
    u('photo-1544025162-d76694265947'),
    u('photo-1555939594-58d7cb561ad1'),
  ],
  kebab: [u('photo-1561651823-34feb02250e4'), u('photo-1529006557810-274b9b2fc783')],
  sandwich: [u('photo-1528735602780-2552fd46c7af'), u('photo-1509722747041-616f39b57569')],
  'fast-food': [
    u('photo-1561758033-d89a9ad46330'),
    u('photo-1550547660-d9450f859349'),
    u('photo-1571091655789-405eb7a3a3a8'),
  ],
  italien: [u('photo-1595295333158-4742f28fbd85'), u('photo-1473093295043-cdd812d0e601'), u('photo-1551183053-bf91a1d81141')],
  français: [u('photo-1414235077428-338989a2e8c0'), u('photo-1550966871-3ed3cdb5ed0c')],
  japonais: [u('photo-1580822184713-fc5400e7fe10'), u('photo-1617196034796-73dfa7b1fd56')],
  chinois: [u('photo-1525755662778-989d0524087e'), u('photo-1563245372-f21724e3856d')],
  indien: [u('photo-1585937421612-70a008356fbe'), u('photo-1567188040759-fb8a883dc6d8')],
  mexicain: [u('photo-1565299585323-38d6b0865b47'), u('photo-1552332386-f8dd00dc2f85')],
  libanais: [u('photo-1541518763669-27fef04b14ea'), u('photo-1615870216519-2f9fa575fa5c')],
  turc: [u('photo-1561651823-34feb02250e4'), u('photo-1599458252573-56ae36120de1')],
  'salon de thé': [u('photo-1519676867240-f03562e64548'), u('photo-1556679343-c7306c1976bc')],
  glacier: [u('photo-1563805042-7684c019e1cb'), u('photo-1497034825429-c343d7c6a68f')],
  pâtisserie: [u('photo-1517433670267-08bbd4be890f'), u('photo-1509440159596-0249088772ff'), u('photo-1555507036-ab1f4038808a')],
  'petit-déjeuner': [u('photo-1533089860892-a7c6f0a88666'), u('photo-1525351484163-7529414344d8')],
  crêperie: [u('photo-1519676867240-f03562e64548'), u('photo-1565299543923-37dd37887442')],
  chicken: [u('photo-1626645738196-c2a7c87a8f58'), u('photo-1562967914-608f82629710')],
  tacos: [u('photo-1565299585323-38d6b0865b47'), u('photo-1551504734-5ee1c4a1479b')],
  méditerranéen: [u('photo-1540914124281-342587941389'), u('photo-1544510806-7bd3e1c31753')],
  végétarien: [u('photo-1512621776951-a57141f2eefd'), u('photo-1540420773420-3366772f4999')],
  restaurant: [
    u('photo-1517248135467-4c7edcad34c4'), // restaurant interior
    u('photo-1552566626-52f8b828add9'),
    u('photo-1466978913421-dad2ebd01d17'),
    u('photo-1414235077428-338989a2e8c0'),
    u('photo-1559339352-11d035aa65de'),
  ],
};

function hashStr(s = '') {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function poolFor(categories = []) {
  for (const raw of categories) {
    const c = raw.toLowerCase();
    if (POOL[c]) return POOL[c];
    for (const key of Object.keys(POOL)) if (c.includes(key) || key.includes(c)) return POOL[key];
  }
  return POOL.restaurant;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchOgImage(website) {
  try {
    const url = website.startsWith('http') ? website : `https://${website}`;
    const res = await fetch(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(9000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DarnaBot/1.0; +https://darna-sigma.vercel.app)' },
    });
    if (!res.ok) return null;
    const html = (await res.text()).slice(0, 300_000);
    const m =
      html.match(/<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::secure_url)?["']/i) ||
      html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
    if (!m) return null;
    let img = m[1].trim();
    if (img.startsWith('//')) img = 'https:' + img;
    else if (img.startsWith('/')) img = new URL(img, res.url).href;
    if (!/^https?:\/\//.test(img)) return null;
    // sanity: verify it serves an image
    const head = await fetch(img, { method: 'GET', signal: AbortSignal.timeout(8000), headers: { Range: 'bytes=0-2048' } }).catch(() => null);
    if (!head || !head.ok || !(head.headers.get('content-type') || '').startsWith('image/')) return null;
    return img;
  } catch {
    return null;
  }
}

async function stageOg() {
  const targets = await Restaurant.find({
    website: { $exists: true, $nin: [null, ''] },
  }).select('name website images');
  console.log(`Stage 1 — fetching og:image from ${targets.length} restaurant websites…`);
  let found = 0;
  const queue = [...targets];
  const workers = Array.from({ length: 6 }, async () => {
    while (queue.length) {
      const r = queue.shift();
      const img = await fetchOgImage(r.website);
      if (img) {
        await Restaurant.updateOne({ _id: r._id }, { $set: { images: [img], logo: img } });
        found++;
        console.log(`  ✓ ${r.name} → ${img.slice(0, 80)}`);
      }
      await sleep(150);
    }
  });
  await Promise.all(workers);
  console.log(`Stage 1 done: ${found}/${targets.length} real venue photos found.`);
}

async function stagePool() {
  const targets = await Restaurant.find({ $or: [{ images: { $size: 0 } }, { images: { $exists: false } }] }).select(
    'name categories osmRef images'
  );
  console.log(`Stage 2 — assigning real cuisine photography to ${targets.length} restaurants…`);
  const ops = targets.map((r) => {
    const pool = poolFor(r.categories);
    const img = pool[hashStr(r.osmRef || r.name) % pool.length];
    return { updateOne: { filter: { _id: r._id }, update: { $set: { images: [img] } } } };
  });
  for (let i = 0; i < ops.length; i += 500) await Restaurant.bulkWrite(ops.slice(i, i + 500), { ordered: false });
  console.log(`Stage 2 done: ${ops.length} images assigned.`);
}

async function run() {
  await connectDatabase();
  const mode = process.argv[2];
  if (!mode || mode === 'og') await stageOg();
  if (!mode || mode === 'pool') await stagePool();
  const withImg = await Restaurant.countDocuments({ 'images.0': { $exists: true } });
  const total = await Restaurant.countDocuments();
  console.log(`Coverage: ${withImg}/${total} restaurants have an image.`);
  await mongoose.connection.close();
  process.exit(0);
}
run().catch((e) => {
  console.error(e);
  process.exit(1);
});
