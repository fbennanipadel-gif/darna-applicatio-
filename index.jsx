import React, { useState, useRef, useEffect } from "react";
import {
  Search, MapPin, Star, Heart, Phone, Navigation, ChevronRight, ChevronDown, ChevronLeft,
  SlidersHorizontal, Bell, User, Home as HomeIcon, Map as MapIcon, Clock, CheckCircle2,
  X, Camera, Share2, ArrowLeft, Sun, Moon, Nfc, Sparkles, Send, Tag, AlertTriangle, Globe, Loader2,
  Mail, AtSign, Check, ArrowRight
} from "lucide-react";

/* ============================ TOKENS — LUXE ZELLIGE ============================ */
/* Rouge de marque échantillonné du logo Darna (#BD0404), affiné pour l'UI + or Zellige conservé en accent */
const T = {
  light: { bg: "#F7F2E8", surface: "#FFFFFF", surfaceAlt: "#F1E8D8", ink: "#1B2033", inkSoft: "#5E6478",
    line: "#E7DCC7", primary: "#9A1B1B", primarySoft: "#F3E1DC", gold: "#B0872A", goldSoft: "#F0E6C9",
    goldInk: "#5C440F", green: "#1F6E5C", terracotta: "#B4552F" },
  dark: { bg: "#0B0F1A", surface: "#141A28", surfaceAlt: "#1C2436", ink: "#F3EFE6", inkSoft: "#98A0B4",
    line: "#28303F", primary: "#E2645B", primarySoft: "#341715", gold: "#D9B450", goldSoft: "#2A2410",
    goldInk: "#F4E4B8", green: "#4FB59A", terracotta: "#E0653B" },
};
const GRAD = ["linear-gradient(135deg,#9A1B1B,#C1453C)", "linear-gradient(135deg,#8A5A22,#C89B45)",
  "linear-gradient(135deg,#1F5E52,#3F9A86)", "linear-gradient(135deg,#5A2E52,#9B5B7E)",
  "linear-gradient(135deg,#20304E,#1F6E5C)", "linear-gradient(135deg,#7A5A1B,#C9A24B)"];

/* Photos libres — Wikimedia Commons (Special:FilePath, redirection stable) */
const wiki = (f) => `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(f)}?width=900`;
const P = {
  tagineDish: wiki("Moroccan food-Chicken tagine with preserved lemons and olives-01.jpg"),
  tajine: wiki("Tajine marocain.jpg"), tagine2: wiki("Moroccan TAGINE.JPG"),
  chermoula: wiki("Chermoula tagine.jpg"), pottery: wiki("Handmade Moroccan tajine on the road back from Chefchaouen.jpg"),
  sushi: wiki("Salmon nigiri sushi.jpg"), ricks: wiki("Rickscafe casablanca.jpg"),
  seafood: wiki("Plateau de fruits de mer 01.JPG"), kefta: wiki("Grilled Kefta Skewers.jpg"),
  riad: wiki("Riad du Figuier courtyard - Essaouira 188.jpg"), darMimoun: wiki("Restaurant Dar Mimoun.jpg"),
  salle: wiki("Restaurant Salle Dîner-spéctacle.jpg"),
  mealView: wiki("Oualidia, Casablanca-Settat region, Morocco November 2023 - Meal with a view.jpg"),
  darzellijSalle: wiki("Dar zellij Marrakech.jpg"),
  sqalaCanon: wiki("Canon à la Sqala Casablanca.jpg"),
  elhank: wiki("Le phare d'El Hank, Casablanca, Maroc.jpg"),
};

/* ============================ BASE DE DONNÉES ============================ */
const CITIES = ["Casablanca", "Rabat", "Marrakech", "Tanger", "Agadir", "Fès"];
const CATS = ["Marocaine", "Sushi", "Pizza", "Brunch", "Grillades", "Burgers", "Café", "Fruits de mer"];
const USER_POS = { lat: 33.5883, lng: -7.6114, label: "Casablanca centre (simulé)" };

const RESTOS = [
  { id: 1, name: "Dar Zellij", desc: "Gastronomie marocaine sous les arcades d’un riad du 18e siècle.", cuisine: "Marocaine", category: "Restaurant gastronomique", price: 3,
    rating: 4.8, reviews: 412, city: "Marrakech", hood: "Médina", lat: 31.6295, lng: -7.9811,
    address: "45 Derb Chtouka, Médina, Marrakech", website: "darzellij.ma", instagram: "@darzellij",
    facebook: "DarZellijMarrakech", phone: "+212524378902", grad: GRAD[0],
    photos: [P.darzellijSalle, P.riad, P.tagineDish, P.tagine2, P.mealView], open: true,
    tags: ["Terrasse", "Romantique", "Halal"], verified: true, founded: "1998",
    promo: "-20% sur le menu découverte, midi en semaine",
    story: "Riad du 18e siècle transformé en table gastronomique. La famille Bennani y perpétue une cuisine de fête servie sous les étoiles." },
  { id: 2, name: "La Sqala", desc: "Jardin d’orangers et cuisine marocaine dans un bastion historique.", cuisine: "Marocaine", category: "Café-restaurant", price: 2, rating: 4.6,
    reviews: 890, city: "Casablanca", hood: "Ancienne Médina", lat: 33.6009, lng: -7.6184,
    address: "Boulevard des Almohades, Ancienne Médina, Casablanca", website: "lasqala.com",
    instagram: "@lasqala", facebook: "LaSqala", phone: "+212522260960", grad: GRAD[4],
    photos: [P.sqalaCanon, P.darMimoun, P.tajine, P.pottery, P.chermoula], open: true,
    tags: ["Jardin", "Familial", "Halal"], verified: true, founded: "2004", promo: null,
    story: "Un bastion fortifié du 18e siècle, un jardin d'orangers, et le meilleur petit-déjeuner marocain de la ville." },
  { id: 3, name: "Ito Sushi", desc: "Omakase intimiste, poisson du jour livré du port de Casablanca.", cuisine: "Sushi", category: "Restaurant japonais", price: 3, rating: 4.7,
    reviews: 256, city: "Casablanca", hood: "Gauthier", lat: 33.5869, lng: -7.6323,
    address: "12 Rue Jean Jaurès, Gauthier, Casablanca", website: "itosushi.ma", instagram: "@itosushi",
    facebook: null, phone: "+212522471188", grad: GRAD[2], photos: [P.sushi, P.salle, P.mealView],
    open: true, tags: ["Livraison", "Terrasse"], verified: true, founded: "2016", promo: null,
    story: "Omakase intimiste. Le poisson arrive chaque matin du port de Casablanca." },
  { id: 4, name: "Rick's Café", desc: "L’adresse mythique inspirée du film, piano live face à l’Atlantique.", cuisine: "Brunch", category: "Café-restaurant", price: 4, rating: 4.5,
    reviews: 1320, city: "Casablanca", hood: "Ancienne Médina", lat: 33.6045, lng: -7.6206,
    address: "248 Boulevard Sour Jdid, Ancienne Médina, Casablanca", website: "rickscafe.ma",
    instagram: "@rickscafecasablanca", facebook: "RicksCafeCasablanca", phone: "+212522274207", grad: GRAD[3],
    photos: [P.ricks, P.salle, P.darMimoun, P.mealView], open: false,
    tags: ["Romantique", "Piano live", "Parking"], verified: true, founded: "2004", promo: null,
    story: "Le café de légende inspiré du film Casablanca : piano live, arcades sculptées et zellige, face à l'Atlantique." },
  { id: 5, name: "Le Cabestan", desc: "Produits de la mer les pieds dans l’eau, au phare d’El Hank.", cuisine: "Fruits de mer", category: "Restaurant de la mer", price: 4,
    rating: 4.6, reviews: 640, city: "Casablanca", hood: "Ain Diab", lat: 33.5945, lng: -7.6935,
    address: "90 Boulevard de la Corniche, Phare d'El Hank, Casablanca", website: "le-cabestan.com",
    instagram: "@lecabestancasablanca", facebook: "LeCabestan", phone: "+212522391190", grad: GRAD[5],
    photos: [P.elhank, P.seafood, P.mealView, P.salle], open: true, tags: ["Terrasse", "Romantique", "Parking"],
    verified: true, founded: "1927", promo: "Coupe de champagne offerte au coucher du soleil",
    story: "Pieds dans l'eau au phare d'El Hank, la référence des produits de la mer depuis 1927." },
  { id: 6, name: "Chez Hassan", desc: "Brochettes marinées et pain maison depuis deux générations.", cuisine: "Grillades", category: "Grillades", price: 1, rating: 4.4,
    reviews: 305, city: "Rabat", hood: "Agdal", lat: 34.0069, lng: -6.8498,
    address: "22 Avenue de France, Agdal, Rabat", website: null, instagram: "@chezhassan.rabat",
    facebook: null, phone: "+212537771234", grad: GRAD[1], photos: [P.kefta, P.tagine2, P.salle, P.pottery],
    open: true, tags: ["À emporter", "Familial", "Halal"], verified: false, founded: "2001", promo: null,
    story: "La grillade de quartier : brochettes de kefta marinées et pain maison depuis deux générations." },
  { id: 7, name: "Al Fassia", desc: "La grande cuisine fassie, portée par une brigade entièrement féminine.", cuisine: "Marocaine", category: "Restaurant gastronomique", price: 3, rating: 4.7,
    reviews: 980, city: "Marrakech", hood: "Guéliz", lat: 31.6349, lng: -8.0100,
    address: "55 Boulevard Zerktouni, Guéliz, Marrakech", website: "alfassia.com", instagram: "@alfassia",
    facebook: "AlFassia", phone: "+212524434060", grad: GRAD[1], photos: [P.tajine, P.salle, P.tagineDish, P.pottery],
    open: true, tags: ["Familial", "Halal", "Parking"], verified: true, founded: "1987", promo: null,
    story: "Depuis 1987, une brigade entièrement féminine fait rayonner la cuisine de Fès : épaule d'agneau confite et pigeon aux amandes." },
  { id: 8, name: "Vesuvio", desc: "Pizzas napolitaines au feu de bois, pâte maturée 48 heures.", cuisine: "Pizza", category: "Pizzeria", price: 2, rating: 4.5,
    reviews: 520, city: "Casablanca", hood: "Maârif", lat: 33.5820, lng: -7.6350,
    address: "8 Rue Abou Faris Al Marini, Maârif, Casablanca", website: null, instagram: "@vesuvio.casa",
    facebook: "VesuvioCasa", phone: "+212522252525", grad: GRAD[3], photos: [P.salle, P.mealView, P.pottery],
    open: true, tags: ["Livraison", "À emporter", "Familial"], verified: true, founded: "2012", promo: "Une pizza offerte pour 3 achetées, le mardi",
    story: "Four napolitain à 450 degrés, mozzarella fior di latte et pâte maturée 48 heures : la vraie napolitaine à Maârif." },
  { id: 9, name: "Pizza Roma", desc: "La pizzeria de quartier, généreuse et sans chichi.", cuisine: "Pizza", category: "Pizzeria", price: 1, rating: 4.3,
    reviews: 210, city: "Rabat", hood: "Hassan", lat: 34.0209, lng: -6.8320,
    address: "14 Avenue Moulay Youssef, Hassan, Rabat", website: null, instagram: "@pizzaroma.rabat",
    facebook: null, phone: "+212537701122", grad: GRAD[0], photos: [P.salle, P.pottery, P.mealView],
    open: true, tags: ["Livraison", "À emporter"], verified: true, founded: "2015", promo: null,
    story: "L'adresse des familles du quartier Hassan : pizzas généreuses, prix doux et service rapide." },
  { id: 10, name: "Blend Burger", desc: "Smash burgers gourmets, pain brioché cuit sur place.", cuisine: "Burgers", category: "Burger gourmet", price: 2, rating: 4.6,
    reviews: 760, city: "Casablanca", hood: "Gauthier", lat: 33.5880, lng: -7.6300,
    address: "22 Rue Ahmed Charci, Gauthier, Casablanca", website: "blendburger.ma", instagram: "@blendburger",
    facebook: "BlendBurger", phone: "+212522223344", grad: GRAD[5], photos: [P.kefta, P.salle, P.mealView],
    open: true, tags: ["Livraison", "À emporter", "Terrasse"], verified: true, founded: "2014", promo: null,
    story: "Le pionnier du smash burger à Casablanca : viande maturée, pain brioché maison et frites coupées à la main." },
  { id: 11, name: "Brothers Burger", desc: "Burgers copieux et milkshakes, l'adresse jeune de Tanger.", cuisine: "Burgers", category: "Burger", price: 1, rating: 4.2,
    reviews: 340, city: "Tanger", hood: "Centre-ville", lat: 35.7767, lng: -5.8039,
    address: "3 Rue de la Liberté, Centre-ville, Tanger", website: null, instagram: "@brothersburger.tanger",
    facebook: null, phone: "+212539334455", grad: GRAD[2], photos: [P.kefta, P.mealView, P.salle],
    open: true, tags: ["À emporter", "Familial"], verified: false, founded: "2018", promo: null,
    story: "Deux frères, une passion : burgers copieux, milkshakes et ambiance décontractée face au boulevard." },
  { id: 12, name: "Bacha Coffee", desc: "Cafés d'exception servis dans un palais Art déco de 1910.", cuisine: "Café", category: "Maison de café", price: 3, rating: 4.8,
    reviews: 1150, city: "Marrakech", hood: "Dar el Bacha", lat: 31.6320, lng: -7.9900,
    address: "Dar el Bacha, Route Sidi Abdelaziz, Médina, Marrakech", website: "bachacoffee.com", instagram: "@bachacoffee",
    facebook: "BachaCoffee", phone: "+212524381293", grad: GRAD[5], photos: [P.riad, P.salle, P.pottery, P.mealView],
    open: true, tags: ["Terrasse", "Romantique"], verified: true, founded: "1910", promo: null,
    story: "Dans le palais Dar el Bacha, plus de 200 cafés 100% arabica servis dans des cafetières dorées, entre zellige et marbre." },
  { id: 13, name: "Café Clock", desc: "Café culturel de la médina : burger au chameau et concerts.", cuisine: "Café", category: "Café culturel", price: 2, rating: 4.6,
    reviews: 890, city: "Fès", hood: "Médina", lat: 34.0620, lng: -4.9830,
    address: "7 Derb el Magana, Talaa Kbira, Médina, Fès", website: "cafeclock.com", instagram: "@cafeclock",
    facebook: "CafeClock", phone: "+212535637855", grad: GRAD[4], photos: [P.riad, P.pottery, P.mealView],
    open: true, tags: ["Terrasse", "Familial"], verified: true, founded: "2007", promo: null,
    story: "L'institution culturelle de la médina de Fès : célèbre burger au chameau, cours de cuisine et concerts de gnaoua sur le toit." },
  { id: 14, name: "Nomad", desc: "Cuisine marocaine moderne sur un rooftop face à la médina.", cuisine: "Brunch", category: "Rooftop moderne", price: 3, rating: 4.6,
    reviews: 1480, city: "Marrakech", hood: "Médina", lat: 31.6270, lng: -7.9880,
    address: "1 Derb Aarjane, Rahba Lakdima, Médina, Marrakech", website: "nomadmarrakech.com", instagram: "@nomadmarrakech",
    facebook: "NomadMarrakech", phone: "+212524381609", grad: GRAD[2], photos: [P.mealView, P.riad, P.tagineDish, P.salle],
    open: true, tags: ["Terrasse", "Romantique"], verified: true, founded: "2014", promo: null,
    story: "Le rooftop qui a réinventé la cuisine marocaine : épices locales, produits de saison et coucher de soleil sur les toits de la médina." },
  { id: 15, name: "Kaiten", desc: "Sushi bar contemporain, tapis roulant et produits ultra-frais.", cuisine: "Sushi", category: "Sushi bar", price: 3, rating: 4.5,
    reviews: 410, city: "Rabat", hood: "Agdal", lat: 34.0050, lng: -6.8480,
    address: "10 Avenue Atlas, Agdal, Rabat", website: "kaiten.ma", instagram: "@kaiten.rabat",
    facebook: null, phone: "+212537778899", grad: GRAD[0], photos: [P.sushi, P.salle, P.mealView],
    open: false, tags: ["Livraison", "Terrasse"], verified: true, founded: "2019", promo: null,
    story: "Premier kaiten du royaume : le sushi défile sur tapis roulant, le thon arrive chaque matin du port de Casablanca." },
  { id: 16, name: "Port de Pêche", desc: "Poisson grillé du jour, à la criée, les pieds dans le port.", cuisine: "Fruits de mer", category: "Grillades de la mer", price: 1, rating: 4.5,
    reviews: 2100, city: "Agadir", hood: "Port", lat: 30.4230, lng: -9.6180,
    address: "Port de pêche d'Agadir, Nouveau Talborjt, Agadir", website: null, instagram: null,
    facebook: null, phone: "+212528821010", grad: GRAD[4], photos: [P.seafood, P.mealView, P.kefta],
    open: true, tags: ["Familial", "À emporter", "Parking"], verified: true, founded: "1985", promo: null,
    story: "L'expérience mythique d'Agadir : on choisit son poisson à la criée, il est grillé devant vous, servi avec citron et pain chaud." },
  { id: 17, name: "Kasbah Grill", desc: "Grillades au charbon et vue sur le détroit depuis la kasbah.", cuisine: "Grillades", category: "Grillades", price: 2, rating: 4.4,
    reviews: 470, city: "Tanger", hood: "Kasbah", lat: 35.7880, lng: -5.8130,
    address: "Place de la Kasbah, Tanger", website: null, instagram: "@kasbahgrill",
    facebook: null, phone: "+212539445566", grad: GRAD[1], photos: [P.kefta, P.mealView, P.salle],
    open: true, tags: ["Terrasse", "Halal", "Romantique"], verified: true, founded: "2009", promo: "Thé à la menthe offert au coucher du soleil",
    story: "Côtelettes d'agneau et brochettes au charbon de bois, servies sur la terrasse de la kasbah avec vue sur le détroit de Gibraltar." },
];

/* ============================ GÉNÉRATION — 15 RESTAURANTS PAR VILLE ============================ */
/* Les 17 adresses phares ci-dessus sont complétées automatiquement pour atteindre
   exactement 15 partenaires par ville. En production, ces données de démonstration
   seront remplacées par les vrais restaurants partenaires (même structure). */
const CITY_META = {
  Casablanca: { lat: 33.589, lng: -7.620, tel: "522", hoods: ["Maârif", "Gauthier", "Bourgogne", "Racine", "CIL", "Oasis", "Ain Diab"] },
  Rabat: { lat: 34.020, lng: -6.841, tel: "537", hoods: ["Agdal", "Hassan", "Hay Riad", "Souissi", "Océan", "Les Orangers"] },
  Marrakech: { lat: 31.629, lng: -7.992, tel: "524", hoods: ["Guéliz", "Médina", "Hivernage", "Palmeraie", "Sidi Ghanem"] },
  Tanger: { lat: 35.777, lng: -5.812, tel: "539", hoods: ["Centre-ville", "Kasbah", "Malabata", "Marina", "Iberia"] },
  Agadir: { lat: 30.421, lng: -9.598, tel: "528", hoods: ["Front de mer", "Talborjt", "Founty", "Marina", "Sonaba"] },
  Fès: { lat: 34.043, lng: -4.999, tel: "535", hoods: ["Médina", "Ville Nouvelle", "Batha", "Fès Jdid", "Atlas"] },
};
const GEN_POOLS = {
  Marocaine: { cat: "Restaurant marocain",
    names: ["Dar Yasmine", "Riad Atlas", "Dar Safran", "Ksar Zitoune", "La Table du Sud", "Douiria Malika", "Dar Amal", "Riad Argana", "Le Tajine d'Or", "Dar Menara", "Dar Naji", "Ryad Bahia"],
    desc: "Tajines mijotés, couscous du vendredi et pâtisseries maison.",
    story: "Une maison de cuisine marocaine où les recettes se transmettent de mère en fille, entre zellige et cuivre ciselé.",
    photos: [P.tajine, P.tagineDish, P.pottery, P.salle], tagPool: ["Halal", "Familial", "Terrasse", "Romantique"] },
  Sushi: { cat: "Restaurant japonais",
    names: ["Sakura", "Koi Sushi", "Tokyo Bay", "Wasabi", "Oishi", "Zen Sushi", "Nikkei", "Umami", "Fuji", "Hanami"],
    desc: "Sushis et makis préparés minute, poisson sélectionné du jour.",
    story: "Un comptoir japonais où le chef travaille un poisson rigoureusement sélectionné, entre tradition nippone et touches marocaines.",
    photos: [P.sushi, P.salle, P.mealView], tagPool: ["Livraison", "Terrasse", "Romantique"] },
  Pizza: { cat: "Pizzeria",
    names: ["Bella Napoli", "La Piazza", "Il Forno", "Casa Mia", "Trattoria Nino", "Dolce Vita", "Pomodoro", "La Toscana", "Piccolo", "Mamma Rosa"],
    desc: "Pizzas au feu de bois et produits italiens sélectionnés.",
    story: "Four à bois, farine italienne et tomates San Marzano : la trattoria de quartier qui fait voyager jusqu'à Naples.",
    photos: [P.salle, P.mealView, P.pottery], tagPool: ["Livraison", "À emporter", "Familial"] },
  Brunch: { cat: "Brunch & café",
    names: ["Sunday House", "Le Comptoir Vert", "Maison Bloom", "Brunch & Co", "La Verrière", "Green Corner", "Le Patio Blanc", "Sun Deck", "Casa Brunch", "Morning Glory"],
    desc: "Brunchs généreux, jus pressés et pâtisseries maison.",
    story: "Grandes tablées lumineuses, œufs de la ferme et viennoiseries sorties du four : le repaire des dimanches qui s'étirent.",
    photos: [P.mealView, P.riad, P.salle], tagPool: ["Terrasse", "Familial", "Romantique"] },
  Grillades: { cat: "Grillades",
    names: ["Braise & Co", "Le Charbon Doré", "Grill House", "Chez Simo", "La Broche", "Meat Corner", "Le Fumoir", "Brasero", "Chez Omar", "Grillade du Coin"],
    desc: "Viandes maturées et brochettes grillées au charbon de bois.",
    story: "La braise crépite dès midi : côtelettes, kefta et poulet mariné, servis avec pain chaud et salades marocaines.",
    photos: [P.kefta, P.salle, P.mealView], tagPool: ["Halal", "Familial", "À emporter", "Terrasse"] },
  Burgers: { cat: "Burger",
    names: ["Smash Bros", "Le Comptoir du Burger", "Big Bite", "Street Burger", "Golden Bun", "Burger Factory", "Le Gourmet Burger", "Crispy House", "Urban Burger", "Bun's"],
    desc: "Burgers gourmets, pain brioché et frites maison.",
    story: "Viande fraîche smashée à la commande, cheddar affiné et sauces secrètes : le burger pris au sérieux.",
    photos: [P.kefta, P.mealView, P.salle], tagPool: ["Livraison", "À emporter", "Familial"] },
  "Café": { cat: "Café",
    names: ["Café Andalou", "Le Petit Café", "Café des Épices", "Kawa Corner", "Café Firdaous", "L'Atelier Café", "Café Riad", "Café Lumière", "Café Jardin", "Café Central"],
    desc: "Cafés de spécialité, thé à la menthe et douceurs marocaines.",
    story: "Torréfaction soignée, thé à la menthe versé de haut et cornes de gazelle : la pause qui rythme la ville.",
    photos: [P.riad, P.pottery, P.salle], tagPool: ["Terrasse", "Familial"] },
  "Fruits de mer": { cat: "Poissons & fruits de mer",
    names: ["La Marée", "L'Ancre Bleue", "Chez le Pêcheur", "Océan Grill", "La Sirène", "Le Homard Bleu", "Marée Haute", "La Criée", "Poseidon", "Cap Océan"],
    desc: "Poissons du jour et fruits de mer de la côte atlantique.",
    story: "L'arrivage dicte l'ardoise : poissons entiers grillés, crevettes sauvages et huîtres de Dakhla selon la marée.",
    photos: [P.seafood, P.mealView, P.salle], tagPool: ["Terrasse", "Familial", "Romantique", "Parking"] },
};
const CUISINE_ORDER = ["Marocaine", "Sushi", "Pizza", "Brunch", "Grillades", "Burgers", "Café", "Fruits de mer"];
const STREETS = ["Rue des Orangers", "Avenue Hassan II", "Boulevard Mohammed V", "Rue Ibn Battouta", "Avenue des FAR"];
const rnd01 = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const slugify = (t) => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "");
{
  const used = new Set(RESTOS.map((r) => r.name));
  const counters = {};
  let id = 100;
  Object.keys(CITY_META).forEach((cityName, ci) => {
    const meta = CITY_META[cityName];
    const need = 15 - RESTOS.filter((r) => r.city === cityName).length;
    for (let j = 0; j < need; j++) {
      const cuisine = CUISINE_ORDER[(j + ci) % CUISINE_ORDER.length];
      const pool = GEN_POOLS[cuisine];
      counters[cuisine] = counters[cuisine] || 0;
      let name = pool.names[counters[cuisine] % pool.names.length];
      counters[cuisine] += 1;
      if (used.has(name)) name = name + " " + cityName;
      used.add(name);
      const s = id * 13 + ci * 7 + j;
      const hood = meta.hoods[Math.floor(rnd01(s + 2) * meta.hoods.length)];
      const tags = pool.tagPool.filter((_, k) => rnd01(s + 3 + k) > 0.45).slice(0, 3);
      RESTOS.push({
        id: id, name, desc: pool.desc, cuisine, category: pool.cat,
        price: (cuisine === "Fruits de mer" || cuisine === "Marocaine" ? 2 : 1) + Math.floor(rnd01(s + 1) * 2),
        rating: Math.round((4.0 + rnd01(s) * 0.8) * 10) / 10,
        reviews: 60 + Math.floor(rnd01(s + 9) * 1400),
        city: cityName, hood,
        lat: meta.lat + (rnd01(s + 4) - 0.5) * 0.05, lng: meta.lng + (rnd01(s + 5) - 0.5) * 0.05,
        address: (2 + Math.floor(rnd01(s + 6) * 120)) + " " + STREETS[Math.floor(rnd01(s + 7) * STREETS.length)] + ", " + hood + ", " + cityName,
        website: rnd01(s + 8) > 0.5 ? slugify(name) + ".ma" : null,
        instagram: "@" + slugify(name), facebook: null,
        phone: "+212" + meta.tel + String(100000 + Math.floor(rnd01(s + 10) * 899999)),
        grad: GRAD[(id + j) % GRAD.length], photos: pool.photos,
        open: rnd01(s + 11) > 0.22,
        tags: tags.length ? tags : [pool.tagPool[0]],
        verified: rnd01(s + 12) > 0.2,
        founded: String(1992 + Math.floor(rnd01(s + 13) * 30)),
        promo: rnd01(s + 14) > 0.88 ? "Menu du jour à -15% en semaine" : null,
        story: pool.story,
      });
      id += 1;
    }
  });
}

const MENU = [
  { cat: "Entrées", items: [
    { n: "Trilogie de briouates", d: "Poulet, kefta, chèvre-miel", p: 65, reco: true, alg: ["Gluten", "Lait"], img: P.chermoula },
    { n: "Zaalouk d'aubergines", d: "Caviar d'aubergines, huile d'argan", p: 45, reco: false, alg: [], img: P.pottery }]},
  { cat: "Plats", items: [
    { n: "Tajine d'agneau aux pruneaux", d: "Amandes, œuf, sésame", p: 140, reco: true, alg: ["Fruits à coque"], img: P.tagineDish },
    { n: "Pastilla au pigeon", d: "Recette de la médina, cannelle", p: 120, reco: true, alg: ["Gluten", "Œuf", "Fruits à coque"], img: P.tagine2 },
    { n: "Couscous royal du vendredi", d: "Sept légumes, agneau, poulet, merguez", p: 160, reco: false, alg: ["Gluten"], img: P.tajine }]},
  { cat: "Desserts", items: [
    { n: "Cornes de gazelle", d: "Pâtisserie maison, fleur d'oranger", p: 55, reco: false, alg: ["Gluten", "Fruits à coque"], img: P.chermoula }]},
];

const REVIEWS = [
  { a: "Yasmine E.", r: 5, v: true, t: "Cadre exceptionnel et pastilla parfaite. Le scan à la sortie m'a permis de laisser mon avis en quelques secondes.", d: "il y a 2 jours", ph: [P.tagineDish, P.tagine2], rep: "Merci Yasmine, à très vite dans notre riad." },
  { a: "Karim B.", r: 4, v: true, t: "Très bon accueil en famille, service un peu lent le vendredi soir mais ça valait l'attente.", d: "il y a 1 sem.", ph: [], rep: null },
  { a: "Sophie & Tom", r: 5, v: false, t: "A hidden gem, authentic Moroccan food and a magical terrace. Highly recommend for couples.", d: "il y a 2 sem.", ph: [P.pottery], rep: null },
];

const priceStr = (n) => "€".repeat(n);
const fmtPhone = (p) => "+212 " + p.slice(4).replace(/(\d)(\d{2})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4 $5");

/* distance simulée depuis la position utilisateur */
function haversine(a, b) {
  const R = 6371, dLat = (b.lat - a.lat) * Math.PI / 180, dLng = (b.lng - a.lng) * Math.PI / 180;
  const la1 = a.lat * Math.PI / 180, la2 = b.lat * Math.PI / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function distTime(r) {
  const km = haversine(USER_POS, r);
  const min = km < 20 ? Math.round(km * 3) : Math.round(km / 75 * 60);
  const kmStr = km < 10 ? km.toFixed(1).replace(".", ",") + " km" : Math.round(km) + " km";
  const tStr = min < 60 ? `${min} min` : `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, "0")}`;
  return { kmStr, tStr };
}

/* ============================ ASSISTANT IA (Claude) ============================ */
const DB_TEXT = RESTOS.map((r) =>
  `#${r.id} ${r.name} — ${r.city} (${r.hood}), cuisine ${r.cuisine}, prix ${priceStr(r.price)}, note ${r.rating}/5, ${r.open ? "ouvert" : "fermé"} maintenant, services: ${r.tags.join(", ")}, tel ${r.phone}. ${r.story}`
).join("\n");

const SYS_ASSISTANT = (lang) => `Tu es l'assistant intelligent de "Darna" ("notre maison" en arabe/darija — slogan : "Notre maison, votre table"), une application marocaine qui référence uniquement des restaurants partenaires vérifiés.

RÔLE
- Aider à utiliser l'application, expliquer chaque fonctionnalité, guider pas à pas, y compris les personnes peu à l'aise avec les applications mobiles.
- Recommander des restaurants partenaires selon les envies exprimées en langage naturel.

LANGUE
- Réponds dans la langue du dernier message de l'utilisateur : français, arabe standard, darija marocaine, ou anglais. Langue préférée indiquée par l'utilisateur : ${lang}.
- Ton chaleureux, professionnel, clair et patient. Phrases courtes. N'utilise JAMAIS d'emojis.

FONCTIONNEMENT DE L'APP
- Recherche intelligente : l'utilisateur écrit librement (ex "sushi pas cher ouvert maintenant"), plus des filtres (ville, quartier, cuisine, prix de € à €€€€, note minimale, ouvert maintenant, livraison, à emporter, terrasse, parking, familial, romantique, halal, accessible PMR).
- Fiche restaurant : photos, description, menu avec prix et allergènes, horaires, adresse, appel direct, itinéraire.
- Avis : note sur 5, commentaire, photos. Les avis "Vérifiés" proviennent d'un scan NFC de la carte posée sur la table (preuve de visite réelle).
- Favoris : toucher le cœur sur un restaurant l'enregistre ; ils apparaissent dans l'onglet Favoris.
- Carte : restaurants partenaires, votre position, distance et temps estimé, itinéraire.

RECOMMANDATIONS
- Recommande UNIQUEMENT des restaurants de la liste. N'invente jamais de restaurant.
- Choisis 1 à 3 restaurants les plus pertinents. Pour chacun, justifie brièvement en citant les critères demandés (cuisine, prix, terrasse, ouvert, ville).
- Si rien ne correspond, dis-le honnêtement.

RESTAURANTS PARTENAIRES (seule source de vérité) :
${DB_TEXT}

RÉPONDS STRICTEMENT EN JSON, sans texte ni balises autour :
{"reply":"ton message","restaurantIds":[ids recommandés, [] si aucun]}`;

const SYS_SEARCH = `Tu es le moteur de recherche intelligent de Darna. L'utilisateur écrit une requête libre (français, arabe, darija ou anglais). Interprète-la et renvoie les restaurants correspondants parmi la liste, du plus au moins pertinent.
RESTAURANTS :
${DB_TEXT}
RÉPONDS STRICTEMENT EN JSON, sans texte autour :
{"interpretation":"résumé court des critères compris, dans la langue de la requête","restaurantIds":[ids, [] si aucun]}`;

async function askClaude(system, messages) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, system, messages }),
  });
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error?.message || "Erreur API");
  const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
  if (!text.trim()) throw new Error("Réponse vide");
  let out; try { out = JSON.parse(text.replace(/```json|```/g, "").trim()); } catch { out = null; }
  return { out, text };
}

/* ============================ MOTEUR DE SECOURS LOCAL (hors-ligne) ============================
   Utilisé uniquement si l'appel à l'API échoue (pas de clé API dans cet environnement,
   CORS, ou coupure réseau) : par mots-clés, sans IA, pour que la démo reste utilisable.
   En production, l'assistant passera par un serveur (Supabase Edge Function) qui détient
   la clé API en toute sécurité — voir la note donnée en fin de réponse. */
const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const CUISINE_KEYWORDS = {
  Marocaine: ["couscous", "tajine", "tagine", "marocain", "pastilla", "harira"],
  Sushi: ["sushi", "maki", "sashimi", "japonais"],
  Pizza: ["pizza", "pizzeria"],
  Burgers: ["burger", "smash"],
  Brunch: ["brunch", "petit dejeuner", "petit-dejeuner"],
  "Café": ["cafe", "coffee", "kawa"],
  "Fruits de mer": ["poisson", "fruits de mer", "seafood", "crevette", "homard", "huitre"],
  Grillades: ["grillade", "brochette", "kefta", "viande", "grill"],
};
const TAG_KEYWORDS = { Romantique: ["romantique", "romantic", "anniversaire", "date"], Terrasse: ["terrasse", "terrace"],
  Familial: ["familial", "famille", "family", "enfant"], Halal: ["halal"], Parking: ["parking"], Livraison: ["livraison", "delivery"] };

function localRecommend(query, limit = 3) {
  const q = norm(query);
  const detected = { cuisine: null, tags: [], city: null, cheap: false, open: false };
  for (const [cu, kws] of Object.entries(CUISINE_KEYWORDS)) if (kws.some((k) => q.includes(k))) detected.cuisine = cu;
  for (const [tag, kws] of Object.entries(TAG_KEYWORDS)) if (kws.some((k) => q.includes(k))) detected.tags.push(tag);
  for (const ct of CITIES) if (q.includes(norm(ct))) detected.city = ct;
  if (/pas cher|rkhis|economique|petit budget|cheap/.test(q)) detected.cheap = true;
  if (/ouvert|maintenant|open now|daba/.test(q)) detected.open = true;

  const any = detected.cuisine || detected.tags.length || detected.city || detected.cheap || detected.open;
  if (!any) return null;

  let list = RESTOS.filter((r) =>
    (!detected.cuisine || r.cuisine === detected.cuisine) &&
    (!detected.city || r.city === detected.city) &&
    (detected.tags.length === 0 || detected.tags.every((t) => r.tags.includes(t))) &&
    (!detected.open || r.open) &&
    (!detected.cheap || r.price <= 2));
  list = list.sort((a, b) => b.rating - a.rating).slice(0, limit);

  const parts = [];
  if (detected.cuisine) parts.push(`cuisine ${detected.cuisine.toLowerCase()}`);
  if (detected.city) parts.push(`à ${detected.city}`);
  if (detected.tags.length) parts.push(detected.tags.join(", ").toLowerCase());
  if (detected.cheap) parts.push("prix doux");
  if (detected.open) parts.push("ouvert maintenant");
  const criteria = parts.join(", ");

  return { ids: list.map((r) => r.id), criteria, list };
}
function localAssistantReply(query) {
  const found = localRecommend(query, 3);
  if (!found || found.list.length === 0) {
    return { reply: "Mode démonstration hors-ligne : je n'ai pas trouvé de partenaire correspondant précisément. Essayez une ville, une cuisine (couscous, sushi, pizza…) ou un critère comme « romantique » ou « pas cher ».", ids: [] };
  }
  const names = found.list.map((r) => r.name).join(", ");
  return { reply: `Mode démonstration hors-ligne (sans IA en direct) : d'après votre demande (${found.criteria}), je vous propose ${names}. Ce sont les partenaires les mieux notés qui correspondent à ces critères.`, ids: found.ids };
}

/* ============================ MOTIF ZELLIGE ============================ */
let ZID = 0;
function ZelligePattern({ color = "#C9A24B", opacity = 0.14, style }) {
  const id = React.useMemo(() => `zlg${ZID++}`, []);
  const star = (cx, cy, R, r) => {
    const p = [];
    for (let i = 0; i < 8; i++) {
      const aO = (Math.PI / 4) * i - Math.PI / 2, aI = aO + Math.PI / 8;
      p.push(`${(cx + R * Math.cos(aO)).toFixed(1)},${(cy + R * Math.sin(aO)).toFixed(1)}`);
      p.push(`${(cx + r * Math.cos(aI)).toFixed(1)},${(cy + r * Math.sin(aI)).toFixed(1)}`);
    } return p.join(" ");
  };
  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", ...style }}>
      <defs><pattern id={id} width="64" height="64" patternUnits="userSpaceOnUse">
        <g fill="none" stroke={color} strokeWidth="1.1" opacity={opacity}>
          <polygon points={star(32, 32, 22, 9)} /><polygon points={star(0, 0, 22, 9)} />
          <polygon points={star(64, 0, 22, 9)} /><polygon points={star(0, 64, 22, 9)} />
          <polygon points={star(64, 64, 22, 9)} />
          <rect x="27" y="27" width="10" height="10" transform="rotate(45 32 32)" />
        </g></pattern></defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/* ============================ MARQUE DARNA ============================ */
/* Glyphe toit inspiré du logo (pignon marocain) — dessiné en SVG, pas l'image importée,
   pour rester léger et net à toute taille dans l'app. */
function DarnaRoof({ size = 22, color = "#fff" }) {
  return (
    <svg width={size} height={size * 0.72} viewBox="0 0 100 72" fill="none">
      <path d="M4 40 L50 6 L96 40" stroke={color} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M28 24 L28 4" stroke={color} strokeWidth="9" strokeLinecap="round" />
      <path d="M72 24 L72 4" stroke={color} strokeWidth="9" strokeLinecap="round" />
    </svg>
  );
}
function DarnaMark({ size = 22, color = "#fff", textColor, gap = 8, display }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap }}>
      <DarnaRoof size={size} color={color} />
      <span style={{ fontFamily: display || "'Fraunces','Georgia',serif", fontSize: size * 0.95,
        fontWeight: 600, color: textColor || color, letterSpacing: .3 }}>Darna</span>
    </span>
  );
}

function Photo({ src, grad, style, scrim, label, iconSize = 22, fallback, children }) {
  const [ok, setOk] = useState(true);
  return (
    <div style={{ background: grad, position: "relative", overflow: "hidden", ...style }}>
      {(!ok || !src) && (fallback ? (
        <>
          {fallback}
          {label && <span style={{ position: "absolute", bottom: 14, left: 14, background: "rgba(0,0,0,.45)",
            color: "#fff", fontSize: 10.5, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
            padding: "5px 10px", borderRadius: 8 }}>{label}</span>}
        </>
      ) : (
        <>
          <ZelligePattern color="#fff" opacity={0.12} />
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 7, color: "rgba(255,255,255,.9)" }}>
            <Camera size={iconSize} strokeWidth={1.6} />
            {label && <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>{label}</span>}
          </div>
        </>
      ))}
      {ok && src && <img src={src} alt="" onError={() => setOk(false)}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}
      {scrim && <div style={{ position: "absolute", inset: 0,
        background: "linear-gradient(180deg,rgba(0,0,0,.28),rgba(0,0,0,0) 34%,rgba(0,0,0,0) 55%,rgba(0,0,0,.42))" }} />}
      {children}
    </div>
  );
}
function Stars({ v, size = 13, color }) {
  return <span style={{ display: "inline-flex", gap: 1, alignItems: "center" }}>
    {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={size} fill={i <= Math.round(v) ? color : "none"}
      color={color} style={{ opacity: i <= Math.round(v) ? 1 : 0.3 }} />)}</span>;
}

/* ============================ LOGOS (style Glovo) ============================ */
const monogram = (name) => {
  const w = name.replace(/^(Le|La|Les|L')\s*/i, "").trim().split(/\s+/);
  return (w[0][0] + (w[1] ? w[1][0] : "")).toUpperCase();
};
/* Première diapositive de la galerie : le logo du restaurant, plein écran */
function LogoCover({ r }) {
  return (
    <div style={{ position: "absolute", inset: 0, background: "#1E2E52", display: "flex",
      flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <ZelligePattern color="#C9A24B" opacity={0.15} />
      <div style={{ position: "relative", width: 112, height: 112, borderRadius: "50%",
        border: "2px solid #C9A24B", background: "rgba(255,255,255,.05)", display: "flex",
        alignItems: "center", justifyContent: "center", boxShadow: "0 0 0 9px rgba(201,162,75,.12)" }}>
        <span style={{ fontFamily: "'Fraunces','Georgia',serif", fontSize: 44, fontWeight: 600, color: "#E9CF86" }}>{monogram(r.name)}</span>
      </div>
      <div style={{ position: "relative", marginTop: 16, color: "#fff", fontFamily: "'Fraunces','Georgia',serif", fontSize: 21 }}>{r.name}</div>
      <div style={{ position: "relative", marginTop: 5, fontSize: 10.5, letterSpacing: 2.5, color: "#C9A24B", fontWeight: 700 }}>{r.cuisine.toUpperCase()} · {r.city.toUpperCase()}</div>
    </div>
  );
}
/* Pastille logo ronde superposée aux photos des cartes */
function LogoBadge({ r, size = 30 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "#9A1B1B",
      border: "1.5px solid #C9A24B", display: "flex", alignItems: "center", justifyContent: "center",
      color: "#E9CF86", fontFamily: "'Fraunces','Georgia',serif", fontWeight: 600, fontSize: size * 0.38,
      boxShadow: "0 2px 8px rgba(0,0,0,.35)", flexShrink: 0 }}>{monogram(r.name)}</div>
  );
}

/* ============================ ILLUSTRATIONS CULINAIRES ============================
   Une image par restaurant, dessinée en SVG et intégrée au code : toujours visible,
   y compris hors-ligne et dans les environnements qui bloquent les images externes.
   En production, la vraie photo du partenaire (CDN) s'affichera par-dessus. */
const ART_PALETTES = [
  { bg1: "#9A1B1B", bg2: "#C1453C", plate: "#F7F2E8", accent: "#E8C97A" },
  { bg1: "#1F5E52", bg2: "#3F9A86", plate: "#F7F2E8", accent: "#F0D8A8" },
  { bg1: "#8A5A22", bg2: "#C89B45", plate: "#FFF8EC", accent: "#9A1B1B" },
  { bg1: "#5A2E52", bg2: "#9B5B7E", plate: "#F7F2E8", accent: "#E8C97A" },
  { bg1: "#20304E", bg2: "#3A5E7C", plate: "#F7F2E8", accent: "#E8C97A" },
];
function DishGlyph({ cuisine, p }) {
  const st = p.bg1, acc = p.accent;
  switch (cuisine) {
    case "Marocaine": return (<g>
      <path d="M60 118 h80 a8 8 0 0 1 0 16 h-80 a8 8 0 0 1 0 -16" fill={st} />
      <path d="M100 44 L136 114 H64 Z" fill={acc} stroke={st} strokeWidth="4" strokeLinejoin="round" />
      <circle cx="100" cy="42" r="6" fill={st} /></g>);
    case "Sushi": return (<g>
      <ellipse cx="80" cy="110" rx="24" ry="13" fill={acc} /><rect x="60" y="90" width="40" height="16" rx="8" fill="#E86A5B" />
      <ellipse cx="126" cy="110" rx="24" ry="13" fill={acc} /><rect x="106" y="90" width="40" height="16" rx="8" fill="#E8A25B" />
      <rect x="54" y="62" width="92" height="5" rx="2.5" fill={st} transform="rotate(-8 100 64)" /></g>);
    case "Pizza": return (<g>
      <circle cx="100" cy="102" r="40" fill={acc} stroke={st} strokeWidth="5" />
      <circle cx="87" cy="90" r="6.5" fill="#C1453C" /><circle cx="115" cy="98" r="6.5" fill="#C1453C" />
      <circle cx="98" cy="118" r="6.5" fill="#C1453C" />
      <path d="M100 62 V142 M60 102 H140" stroke={p.plate} strokeWidth="4" /></g>);
    case "Burgers": return (<g>
      <path d="M64 86 a36 22 0 0 1 72 0 z" fill={acc} stroke={st} strokeWidth="4" />
      <rect x="62" y="90" width="76" height="9" rx="4.5" fill="#7FA05A" />
      <rect x="60" y="101" width="80" height="13" rx="6.5" fill="#7A4020" />
      <rect x="64" y="117" width="72" height="13" rx="6.5" fill={acc} stroke={st} strokeWidth="4" /></g>);
    case "Brunch": return (<g>
      <path d="M58 94 q10 -24 40 -24 q-8 28 -40 24" fill={acc} stroke={st} strokeWidth="4" />
      <circle cx="123" cy="106" r="18" fill={p.plate} stroke={st} strokeWidth="4" />
      <circle cx="123" cy="106" r="8" fill={acc} />
      <path d="M64 116 h46 v9 a11 11 0 0 1 -11 11 h-24 a11 11 0 0 1 -11 -11 z" fill={p.plate} stroke={st} strokeWidth="4" /></g>);
    case "Grillades": return (<g>
      <rect x="54" y="98" width="92" height="5" rx="2.5" fill={st} />
      <rect x="66" y="88" width="17" height="23" rx="5" fill="#8A4A2A" /><rect x="91" y="88" width="17" height="23" rx="5" fill={acc} />
      <rect x="116" y="88" width="17" height="23" rx="5" fill="#8A4A2A" />
      <path d="M82 70 q4 -9 0 -17 M102 70 q4 -9 0 -17 M122 70 q4 -9 0 -17" stroke={acc} strokeWidth="4" fill="none" strokeLinecap="round" /></g>);
    case "Café": return (<g>
      <path d="M68 86 h56 v24 a24 24 0 0 1 -48 0 z" fill={p.plate} stroke={st} strokeWidth="5" />
      <path d="M124 92 h9 a11 11 0 0 1 0 22 h-11" fill="none" stroke={st} strokeWidth="5" />
      <path d="M86 72 q4 -8 0 -15 M102 72 q4 -8 0 -15" stroke={acc} strokeWidth="4" fill="none" strokeLinecap="round" /></g>);
    default: return (<g>
      <path d="M58 102 q26 -22 54 0 q-26 22 -54 0" fill={acc} stroke={st} strokeWidth="4" />
      <path d="M112 102 l20 -13 v26 z" fill={acc} stroke={st} strokeWidth="4" strokeLinejoin="round" />
      <circle cx="72" cy="98" r="3" fill={st} />
      <path d="M120 130 q10 -13 22 -8" stroke="#E86A5B" strokeWidth="6" fill="none" strokeLinecap="round" /></g>);
  }
}
function DishArt({ r, style, rounded = 0 }) {
  const p = ART_PALETTES[r.id % ART_PALETTES.length];
  return (
    <div style={{ position: "relative", overflow: "hidden", borderRadius: rounded, flexShrink: 0,
      background: `linear-gradient(135deg,${p.bg1},${p.bg2})`, ...style }}>
      <ZelligePattern color="#fff" opacity={0.10} />
      <svg viewBox="0 0 200 200" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} preserveAspectRatio="xMidYMid slice">
        <circle cx="100" cy="102" r="62" fill={p.plate} opacity="0.97" />
        <circle cx="100" cy="102" r="52" fill="none" stroke={p.accent} strokeWidth="2" opacity=".8" />
        <DishGlyph cuisine={r.cuisine} p={p} />
      </svg>
    </div>
  );
}

/* ============================ APP PRINCIPALE ============================ */
function MainApp({ lang = "fr", user }) {
  const [dark, setDark] = useState(false);
  const c = dark ? T.dark : T.light;
  const [tab, setTab] = useState("home");
  const [city, setCity] = useState("Casablanca");
  const [cityOpen, setCityOpen] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [detailTab, setDetailTab] = useState("apercu");
  const [favs, setFavs] = useState(new Set([2, 5]));
  const [nfc, setNfc] = useState(false);
  const [nfcStep, setNfcStep] = useState(0);
  const [review, setReview] = useState(null);
  const [filters, setFilters] = useState(false);
  const [activeCat, setActiveCat] = useState(null);
  const [asst, setAsst] = useState(false);
  const [toast, setToast] = useState(null);

  const resto = RESTOS.find((r) => r.id === openId);
  const toggleFav = (id) => setFavs((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const flash = (m) => { setToast(m); setTimeout(() => setToast(null), 1800); };
  const openResto = (id) => { setAsst(false); setDetailTab("apercu"); setOpenId(id); };
  const display = "'Fraunces','Georgia',serif";

  return (
    <div style={{ minHeight: "100vh", width: "100%", background: dark ? "#05070B" : "#DFD6C4",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 12px",
      fontFamily: "'Inter',system-ui,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        .scr::-webkit-scrollbar { width: 0; height: 0; }
        @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.12);opacity:.7} }
        @keyframes ring { 0%{transform:scale(.6);opacity:.9} 100%{transform:scale(1.9);opacity:0} }
        @keyframes blink { 0%,80%,100%{opacity:.25} 40%{opacity:1} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .card { animation: fadeIn .35s ease both; }
        .press { transition: transform .12s ease; cursor: pointer; }
        .press:active { transform: scale(.96); }
        a.press { text-decoration: none; }
      `}</style>

      <div style={{ width: 390, height: 800, background: c.bg, borderRadius: 44, overflow: "hidden",
        position: "relative", boxShadow: "0 40px 80px -20px rgba(0,0,0,.5),0 0 0 11px #0b0d12,0 0 0 13px #23262e",
        display: "flex", flexDirection: "column" }}>

        <div style={{ height: 44, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 26px", color: c.ink, fontSize: 13, fontWeight: 600 }}>
          <span>9:41</span>
          <div style={{ position: "absolute", left: "50%", top: 8, transform: "translateX(-50%)", width: 110, height: 26, background: "#0b0d12", borderRadius: 20 }} />
          <span style={{ opacity: .8, fontSize: 11, letterSpacing: .5 }}>MAROC</span>
        </div>

        <div className="scr" style={{ flex: 1, overflowY: "auto", position: "relative" }}>
          {tab === "home" && <Home {...{ c, city, setCityOpen, activeCat, setActiveCat, favs, toggleFav, openResto, display, setTab }} />}
          {tab === "search" && <SearchScreen {...{ c, openResto, setFilters, favs, toggleFav, display }} />}
          {tab === "nfc" && <NfcScreen {...{ c, display, setNfc, setNfcStep, openResto }} />}
          {tab === "map" && <MapScreen {...{ c, city, openResto, display, flash }} />}
          {tab === "favs" && <Favs {...{ c, favs, toggleFav, openResto, display, setTab }} />}
          {tab === "profile" && <Profile {...{ c, dark, setDark, display, favs }} />}
        </div>

        <div style={{ flexShrink: 0, height: 74, background: c.surface, borderTop: `1px solid ${c.line}`,
          display: "flex", alignItems: "flex-start", justifyContent: "space-around", paddingTop: 10 }}>
          {[["home", HomeIcon, "Accueil"], ["search", Search, "Recherche"], ["nfc", Nfc, "Scan"],
            ["map", MapIcon, "Carte"], ["favs", Heart, "Favoris"], ["profile", User, "Profil"]].map(([k, Ic, l]) => (
            k === "nfc" ? (
              <button key={k} onClick={() => setTab("nfc")} style={{ background: "none", border: "none", cursor: "pointer",
                width: 60, display: "flex", flexDirection: "column", alignItems: "center", marginTop: -26 }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: `linear-gradient(135deg,${c.gold},#E9CF86)`,
                  display: "flex", alignItems: "center", justifyContent: "center", color: c.goldInk,
                  boxShadow: "0 8px 18px -4px rgba(176,135,42,.6)", border: `3.5px solid ${c.surface}`,
                  transform: tab === "nfc" ? "scale(1.06)" : "scale(1)", transition: "transform .15s" }}>
                  <Ic size={24} strokeWidth={2.4} /></div>
                <span style={{ fontSize: 10, fontWeight: 700, color: tab === "nfc" ? c.gold : c.inkSoft, marginTop: 3 }}>{l}</span>
              </button>
            ) : (
            <button key={k} onClick={() => setTab(k)} style={{ background: "none", border: "none", display: "flex",
              flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer", color: tab === k ? c.primary : c.inkSoft, width: 56 }}>
              <Ic size={22} strokeWidth={tab === k ? 2.5 : 2} fill={k === "favs" && tab === k ? c.primary : "none"} />
              <span style={{ fontSize: 10, fontWeight: tab === k ? 700 : 500 }}>{l}</span>
            </button>
            )
          ))}
        </div>

        {/* FAB Assistant IA — présent sur toutes les pages */}
        {!asst && !resto && (
          <button className="press" onClick={() => setAsst(true)}
            style={{ position: "absolute", right: 18, bottom: 92, height: 52, borderRadius: 26, paddingLeft: 16, paddingRight: 18,
              background: `linear-gradient(135deg,${c.gold},#E9CF86)`, border: "none",
              boxShadow: "0 10px 24px -6px rgba(176,135,42,.7)", display: "flex", alignItems: "center", gap: 8,
              color: c.goldInk, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
            <Sparkles size={20} strokeWidth={2.4} /> Assistant
          </button>
        )}

        {resto && <RestaurantDetail {...{ c, resto, detailTab, setDetailTab, favs, toggleFav, setOpenId, display, setReview, flash }} />}
        {cityOpen && (
          <Sheet c={c} onClose={() => setCityOpen(false)} title="Choisir une ville">
            {CITIES.map((ct) => (
              <button key={ct} className="press" onClick={() => { setCity(ct); setCityOpen(false); }} style={rowBtn(c, ct === city)}>
                <span style={{ display: "flex", gap: 10, alignItems: "center" }}><MapPin size={18} color={c.primary} /> {ct}</span>
                {ct === city && <CheckCircle2 size={18} color={c.gold} />}
              </button>))}
          </Sheet>
        )}
        {filters && <FilterSheet c={c} onClose={() => setFilters(false)} />}
        {nfc && <NfcSheet {...{ c, nfcStep, setNfcStep, setNfc, setReview, display }} />}
        {review && <ReviewSheet {...{ c, review, setReview, display, flash }} />}
        {asst && <Assistant {...{ c, setAsst, openResto, display }} />}

        {toast && (
          <div style={{ position: "absolute", bottom: 96, left: "50%", transform: "translateX(-50%)", background: c.ink,
            color: c.bg, padding: "12px 18px", borderRadius: 14, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap",
            animation: "fadeIn .3s ease", zIndex: 60, display: "flex", gap: 8, alignItems: "center", boxShadow: "0 12px 30px rgba(0,0,0,.3)" }}>
            <CheckCircle2 size={16} color={c.gold} /> {toast}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================ ACCUEIL ============================ */
function Home({ c, city, setCityOpen, activeCat, setActiveCat, favs, toggleFav, openResto, display, setTab }) {
  const inCity = RESTOS.filter((r) => r.city === city);
  const byCat = activeCat ? inCity.filter((r) => r.cuisine === activeCat) : null;
  const top = [...inCity].sort((a, b) => b.rating - a.rating);
  const popular = [...inCity].sort((a, b) => b.reviews - a.reviews);
  const promos = inCity.filter((r) => r.promo);
  return (
    <div style={{ paddingBottom: 96 }}>
      <div style={{ position: "relative", padding: "6px 20px 20px", background: c.primary, overflow: "hidden" }}>
        <ZelligePattern color={c.gold} opacity={0.16} />
        <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <DarnaMark size={22} color="#fff" display={display} />
          <div style={{ display: "flex", gap: 8 }}>
            {[Bell, User].map((Ic, i) => <div key={i} style={{ width: 38, height: 38, borderRadius: 12,
              background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.18)", display: "flex",
              alignItems: "center", justifyContent: "center", color: "#fff" }}><Ic size={18} /></div>)}
          </div>
        </div>
        <button className="press" onClick={() => setCityOpen(true)} style={{ position: "relative", marginTop: 14,
          background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.18)", color: "#fff", padding: "8px 12px",
          borderRadius: 12, display: "inline-flex", gap: 6, alignItems: "center", fontSize: 14, fontWeight: 600 }}>
          <MapPin size={16} /> {city} <ChevronDown size={15} />
        </button>
        <div style={{ position: "relative", marginTop: 16 }}>
          <div style={{ fontSize: 11, letterSpacing: 2.5, color: c.gold, fontWeight: 700, marginBottom: 6 }}>NOTRE MAISON, VOTRE TABLE</div>
          <h1 style={{ color: "#fff", fontFamily: display, fontSize: 27, fontWeight: 600, margin: 0, lineHeight: 1.12 }}>
            Les meilleures tables<br />du Maroc, vérifiées.
          </h1>
          <div style={{ height: 1, background: `linear-gradient(90deg,${c.gold},transparent)`, margin: "14px 0 0", opacity: .7 }} />
        </div>
        <button className="press" onClick={() => setTab("search")} style={{ position: "relative", width: "100%", marginTop: 16,
          background: c.surface, borderRadius: 16, padding: "13px 16px", display: "flex", alignItems: "center", gap: 10,
          border: "none", boxShadow: "0 10px 26px rgba(0,0,0,.18)", cursor: "pointer" }}>
          <Search size={19} color={c.inkSoft} />
          <span style={{ color: c.inkSoft, fontSize: 14.5 }}>Un restaurant, une envie…</span>
        </button>
      </div>

      <div className="scr" style={{ display: "flex", gap: 10, overflowX: "auto", padding: "16px 20px 6px" }}>
        {CATS.map((cat) => {
          const on = activeCat === cat;
          return <button key={cat} className="press" onClick={() => setActiveCat(on ? null : cat)}
            style={{ flexShrink: 0, background: on ? c.primary : c.surface, color: on ? "#fff" : c.ink,
              border: `1px solid ${on ? c.primary : c.line}`, borderRadius: 14, padding: "9px 16px",
              fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>{cat}</button>;
        })}
      </div>

      {byCat ? (
        <>
          <Section c={c} display={display} title={`${activeCat} à `} suffix={city} />
          <div style={{ padding: "0 20px 6px", fontSize: 12.5, color: c.inkSoft, fontWeight: 600 }}>
            {byCat.length} partenaire{byCat.length > 1 ? "s" : ""}
          </div>
          <div style={{ padding: "0 20px" }}>
            {byCat.length === 0 ? (
              <div style={{ textAlign: "center", padding: "36px 20px", color: c.inkSoft, fontSize: 13.5 }}>
                Aucun partenaire {activeCat} à {city} pour le moment.
              </div>
            ) : [...byCat].sort((a, b) => b.rating - a.rating).map((r) => (
              <ListCard key={r.id} {...{ c, r, rank: null, favs, toggleFav, openResto }} />
            ))}
          </div>
        </>
      ) : (
        <>
          <Section c={c} display={display} title="Populaires près de vous" />
          <div className="scr" style={{ display: "flex", gap: 14, overflowX: "auto", padding: "4px 20px 6px" }}>
            {popular.slice(0, 6).map((r, i) => <BigCard key={r.id} {...{ c, r, i, favs, toggleFav, openResto }} />)}
          </div>

          {promos.length > 0 && <>
            <Section c={c} display={display} title="Promotions du moment" />
            <div style={{ padding: "0 20px" }}>
              {promos.map((r) => (
                <div key={r.id} className="press card" onClick={() => openResto(r.id)} style={{ display: "flex", gap: 12,
                  background: c.surface, borderRadius: 18, padding: 12, marginBottom: 12, border: `1px solid ${c.line}`, alignItems: "center" }}>
                  <DishArt r={r} rounded={14} style={{ width: 54, height: 54 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "inline-flex", gap: 4, alignItems: "center", background: c.gold, color: c.goldInk,
                      fontSize: 10.5, fontWeight: 700, padding: "3px 8px", borderRadius: 8, marginBottom: 5 }}><Tag size={11} /> PROMO</span>
                    <div style={{ fontWeight: 700, fontSize: 14.5, color: c.ink }}>{r.name}</div>
                    <div style={{ fontSize: 12.5, color: c.inkSoft, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.promo}</div>
                  </div>
                  <ChevronRight size={20} color={c.inkSoft} />
                </div>))}
            </div>
          </>}

          <Section c={c} display={display} title="Les mieux notés à " suffix={city} />
          <div style={{ padding: "0 20px" }}>
            {top.slice(0, 5).map((r, i) => <ListCard key={r.id} {...{ c, r, rank: i + 1, favs, toggleFav, openResto }} />)}
          </div>
        </>
      )}
    </div>
  );
}
function Section({ c, title, suffix, display }) {
  return <div style={{ padding: "18px 20px 8px" }}>
    <h2 style={{ fontFamily: display, fontSize: 19, fontWeight: 600, color: c.ink, margin: 0 }}>
      {title}{suffix && <span style={{ color: c.gold }}>{suffix}</span>}</h2></div>;
}

function BigCard({ c, r, i, favs, toggleFav, openResto }) {
  return (
    <div className="press card" onClick={() => openResto(r.id)} style={{ width: 196, flexShrink: 0, background: c.surface,
      borderRadius: 20, border: `1px solid ${c.line}`, animationDelay: `${i * 60}ms`, boxShadow: "0 6px 18px rgba(0,0,0,.06)",
      overflow: "hidden", position: "relative" }}>
      <div style={{ position: "relative" }}>
        <DishArt r={r} style={{ height: 92 }} />
        <button onClick={(e) => { e.stopPropagation(); toggleFav(r.id); }} style={{ position: "absolute", top: 8, right: 8,
          width: 30, height: 30, borderRadius: 10, border: "none", background: "rgba(255,255,255,.92)", display: "flex",
          alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <Heart size={15} fill={favs.has(r.id) ? c.terracotta : "none"} color={c.terracotta} /></button>
        {r.verified && <div style={{ position: "absolute", top: 10, left: 10, background: "rgba(255,255,255,.92)",
          borderRadius: 8, padding: "3px 7px", display: "flex", gap: 3, alignItems: "center", fontSize: 10, fontWeight: 700, color: "#9A1B1B" }}>
          <CheckCircle2 size={11} /> Vérifié</div>}
        <div style={{ position: "absolute", bottom: -15, left: 12 }}><LogoBadge r={r} size={34} /></div>
      </div>
      <div style={{ padding: "20px 14px 13px" }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: c.ink }}>{r.name}</div>
        <div style={{ display: "flex", gap: 5, alignItems: "center", marginTop: 4 }}>
          <Star size={13} fill={c.gold} color={c.gold} />
          <span style={{ fontSize: 13, fontWeight: 700, color: c.ink }}>{r.rating}</span>
          <span style={{ fontSize: 11.5, color: c.inkSoft }}>({r.reviews})</span>
        </div>
        <div style={{ fontSize: 12, color: c.inkSoft, lineHeight: 1.45, marginTop: 6, display: "-webkit-box",
          WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{r.desc}</div>
      </div>
    </div>
  );
}
function ListCard({ c, r, rank, favs, toggleFav, openResto }) {
  return (
    <div className="press card" onClick={() => openResto(r.id)} style={{ display: "flex", gap: 13, background: c.surface,
      borderRadius: 18, padding: 13, marginBottom: 12, border: `1px solid ${c.line}`, alignItems: "center", boxShadow: "0 4px 14px rgba(0,0,0,.05)" }}>
      <div style={{ position: "relative", flexShrink: 0 }}>
        <DishArt r={r} rounded={14} style={{ width: 58, height: 58 }} />
        <div style={{ position: "absolute", bottom: -5, right: -5 }}><LogoBadge r={r} size={22} /></div>
        {rank && <div style={{ position: "absolute", top: -6, left: -6, width: 22, height: 22, borderRadius: 8, background: c.primary,
          color: "#fff", fontSize: 11.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", border: `1.5px solid ${c.gold}`, zIndex: 2 }}>{rank}</div>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: c.ink }}>{r.name}</span>
          {r.verified && <CheckCircle2 size={14} color={c.gold} />}
        </div>
        <div style={{ display: "flex", gap: 5, alignItems: "center", margin: "3px 0 4px" }}>
          <Stars v={r.rating} color={c.gold} size={12} /><span style={{ fontSize: 12, color: c.inkSoft }}>{r.rating} ({r.reviews})</span>
        </div>
        <div style={{ fontSize: 12.5, color: c.inkSoft, lineHeight: 1.4, display: "-webkit-box",
          WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{r.desc}</div>
      </div>
      <button onClick={(e) => { e.stopPropagation(); toggleFav(r.id); }} style={{ background: "none", border: "none", cursor: "pointer" }}>
        <Heart size={20} fill={favs.has(r.id) ? c.terracotta : "none"} color={favs.has(r.id) ? c.terracotta : c.inkSoft} /></button>
    </div>
  );
}
function Badge({ children, bg, ink, icon }) {
  return <span style={{ background: bg, color: ink, fontSize: 10.5, fontWeight: 700, padding: "4px 8px", borderRadius: 8,
    display: "inline-flex", gap: 4, alignItems: "center" }}>{icon}{children}</span>;
}

/* ============================ RECHERCHE INTELLIGENTE ============================ */
function SearchScreen({ c, openResto, setFilters, favs, toggleFav, display }) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [interp, setInterp] = useState(null);
  const [ids, setIds] = useState(null);
  const [err, setErr] = useState(false);
  const examples = ["Un restaurant romantique avec terrasse", "Couscous pas cher", "Sushi ouvert maintenant", "Un endroit pour un anniversaire en famille"];

  const [offline, setOffline] = useState(false);
  const run = async (text) => {
    const query = (text ?? q).trim(); if (!query) return;
    setQ(query); setLoading(true); setErr(false); setInterp(null); setIds(null); setOffline(false);
    try {
      const { out } = await askClaude(SYS_SEARCH, [{ role: "user", content: query }]);
      if (out) { setInterp(out.interpretation || ""); setIds(out.restaurantIds || []); }
      else setErr(true);
    } catch {
      const fb = localRecommend(query, 8);
      if (fb) { setOffline(true); setInterp(`(mode démonstration hors-ligne) ${fb.criteria || "recherche par mots-clés"}`); setIds(fb.ids); }
      else setErr(true);
    }
    setLoading(false);
  };
  const results = ids ? ids.map((i) => RESTOS.find((r) => r.id === i)).filter(Boolean) : RESTOS;

  return (
    <div style={{ paddingBottom: 96 }}>
      <div style={{ padding: "8px 20px 0" }}>
        <div style={{ background: c.surface, borderRadius: 16, padding: "6px 8px 6px 16px", display: "flex",
          alignItems: "center", gap: 10, border: `1px solid ${c.line}` }}>
          <Sparkles size={18} color={c.gold} />
          <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && run()}
            placeholder="Décrivez votre envie…" style={{ flex: 1, border: "none", outline: "none", background: "none",
              fontSize: 14.5, color: c.ink, fontFamily: "inherit", padding: "8px 0" }} />
          <button className="press" onClick={() => run()} style={{ background: c.primary, border: "none", borderRadius: 12,
            width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            {loading ? <Loader2 size={18} color="#fff" className="spin" style={{ animation: "spin 1s linear infinite" }} /> : <Search size={18} color="#fff" />}
          </button>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
          <span style={{ fontSize: 12, color: c.inkSoft }}>Recherche en langage naturel</span>
          <button className="press" onClick={() => setFilters(true)} style={{ background: "none", border: "none",
            color: c.primary, fontSize: 12.5, fontWeight: 700, display: "flex", gap: 5, alignItems: "center", cursor: "pointer" }}>
            <SlidersHorizontal size={14} /> Filtres manuels</button>
        </div>
      </div>

      {!ids && !loading && (
        <div style={{ padding: "8px 20px 0" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: c.inkSoft, textTransform: "uppercase", letterSpacing: .5, margin: "8px 0" }}>Exemples</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {examples.map((ex) => (
              <button key={ex} className="press" onClick={() => run(ex)} style={{ textAlign: "left", background: c.surface,
                border: `1px solid ${c.line}`, borderRadius: 12, padding: "11px 14px", fontSize: 13.5, color: c.ink,
                cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                {ex} <ChevronRight size={16} color={c.inkSoft} /></button>))}
          </div>
        </div>
      )}

      {loading && <div style={{ textAlign: "center", padding: "40px 20px", color: c.inkSoft, fontSize: 13.5 }}>
        <Loader2 size={26} color={c.gold} style={{ animation: "spin 1s linear infinite", marginBottom: 10 }} />
        <div>Analyse de votre demande…</div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>}

      {err && <div style={{ margin: "16px 20px", padding: 14, borderRadius: 12, background: c.surfaceAlt, color: c.inkSoft, fontSize: 13.5 }}>
        La recherche intelligente n'est pas disponible pour le moment. Réessayez ou utilisez les filtres manuels.</div>}

      {interp && (
        <div style={{ margin: "14px 20px 4px", padding: "12px 14px", borderRadius: 14, background: c.primarySoft,
          border: `1px solid ${c.primary}`, display: "flex", gap: 10 }}>
          <Sparkles size={17} color={c.primary} style={{ flexShrink: 0, marginTop: 1 }} />
          <div><div style={{ fontSize: 11.5, fontWeight: 700, color: c.primary, marginBottom: 2 }}>Compris</div>
            <div style={{ fontSize: 13, color: c.ink }}>{interp}</div></div>
        </div>
      )}
      {ids && <div style={{ padding: "8px 20px 2px", fontSize: 13, color: c.inkSoft, fontWeight: 600 }}>
        {results.length > 0 ? `${results.length} restaurant${results.length > 1 ? "s" : ""} correspondant${results.length > 1 ? "s" : ""}` : "Aucun partenaire ne correspond exactement."}</div>}

      <div style={{ padding: "4px 20px" }}>
        {results.map((r) => <ListCard key={r.id} {...{ c, r, rank: null, favs, toggleFav, openResto }} />)}
      </div>
    </div>
  );
}

/* ============================ ÉCRAN CARTE NFC (onglet dédié) ============================ */
function NfcScreen({ c, display, setNfc, setNfcStep, openResto }) {
  const visits = [
    { r: RESTOS.find((x) => x.id === 1), d: "Aujourd'hui, 13h42", note: 5 },
    { r: RESTOS.find((x) => x.id === 7), d: "Il y a 3 jours", note: 4 },
    { r: RESTOS.find((x) => x.id === 14), d: "La semaine dernière", note: 5 },
  ];
  const steps = [
    ["Terminez votre repas", "Profitez de votre moment chez le partenaire Darna."],
    ["Approchez votre téléphone", "La carte Darna est posée sur votre table ou au comptoir."],
    ["Laissez votre avis vérifié", "Il porte le badge Vérifié : impossible à falsifier."],
  ];
  return (
    <div style={{ paddingBottom: 100 }}>
      <div style={{ background: c.primary, padding: "10px 20px 54px", position: "relative", overflow: "hidden" }}>
        <ZelligePattern color={c.gold} opacity={0.16} />
        <div style={{ position: "relative" }}>
          <h1 style={{ fontFamily: display, fontSize: 24, fontWeight: 600, color: "#fff", margin: "6px 0 4px" }}>Carte Darna</h1>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.8)" }}>Votre preuve de visite. Vos avis vérifiés.</div>
        </div>
      </div>

      {/* Carte physique façon portefeuille numérique */}
      <div style={{ margin: "-38px 24px 0", position: "relative", zIndex: 2 }}>
        <div style={{ borderRadius: 22, background: "linear-gradient(135deg,#7E1212,#B33A30)", padding: "18px 18px 16px",
          position: "relative", overflow: "hidden", boxShadow: "0 20px 44px -12px rgba(126,18,18,.6)", aspectRatio: "1.65" }}>
          <ZelligePattern color="#E8C97A" opacity={0.14} />
          <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <DarnaMark size={19} color="#fff" display={display} />
              <Nfc size={22} color="#E8C97A" />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 38, height: 28, borderRadius: 6, background: "linear-gradient(135deg,#E8C97A,#C9A24B)",
                border: "1px solid rgba(255,255,255,.35)" }} />
              <div style={{ fontSize: 11.5, color: "rgba(255,255,255,.85)", lineHeight: 1.4 }}>
                Approchez votre téléphone<br />pour vérifier votre visite</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <div style={{ fontSize: 9, letterSpacing: 2, color: "#E8C97A", fontWeight: 700 }}>RESTAURANT PARTENAIRE</div>
                <div style={{ fontSize: 12.5, color: "#fff", fontWeight: 700, marginTop: 2 }}>Avis 100% vérifiés</div>
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,.6)", letterSpacing: 1 }}>NTAG 424</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "18px 20px 0" }}>
        <button className="press" onClick={() => { setNfcStep(0); setNfc(true); }}
          style={{ width: "100%", background: `linear-gradient(135deg,${c.gold},#E9CF86)`, color: c.goldInk,
            border: "none", borderRadius: 16, padding: 16, fontSize: 15.5, fontWeight: 700, cursor: "pointer",
            display: "flex", gap: 9, alignItems: "center", justifyContent: "center",
            boxShadow: "0 10px 24px -8px rgba(176,135,42,.6)" }}>
          <Nfc size={20} /> Scanner la carte du restaurant
        </button>

        <h2 style={{ fontFamily: display, fontSize: 18, color: c.ink, margin: "22px 0 12px" }}>Comment ça marche</h2>
        {steps.map(([t, d], i) => (
          <div key={i} style={{ display: "flex", gap: 13, marginBottom: 14 }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: c.goldSoft, border: `1.5px solid ${c.gold}`,
              color: c.goldInk, fontWeight: 700, fontSize: 13.5, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: c.ink }}>{t}</div>
              <div style={{ fontSize: 12.5, color: c.inkSoft, marginTop: 2, lineHeight: 1.45 }}>{d}</div>
            </div>
          </div>
        ))}

        <div style={{ background: c.primarySoft, border: `1px solid ${c.primary}`, borderRadius: 14, padding: "12px 14px",
          display: "flex", gap: 10, margin: "6px 0 22px" }}>
          <CheckCircle2 size={17} color={c.primary} style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 12.5, color: c.ink, lineHeight: 1.5 }}>
            Chaque carte génère un code unique et infalsifiable à chaque scan. C'est la garantie Darna : un avis vérifié provient toujours d'un vrai client, sur place.</div>
        </div>

        <h2 style={{ fontFamily: display, fontSize: 18, color: c.ink, margin: "0 0 12px" }}>Mes visites vérifiées</h2>
        {visits.map(({ r, d, note }, i) => r && (
          <div key={i} className="press card" onClick={() => openResto(r.id)} style={{ display: "flex", gap: 12, alignItems: "center",
            background: c.surface, border: `1px solid ${c.line}`, borderRadius: 16, padding: 11, marginBottom: 10 }}>
            <DishArt r={r} rounded={12} style={{ width: 46, height: 46 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: c.ink }}>{r.name}</div>
              <div style={{ fontSize: 11.5, color: c.inkSoft, margin: "2px 0" }}>{d}</div>
              <Stars v={note} color={c.gold} size={11} />
            </div>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: c.green, background: `${c.green}22`,
              padding: "4px 8px", borderRadius: 8, display: "flex", gap: 4, alignItems: "center", flexShrink: 0 }}>
              <CheckCircle2 size={11} /> Vérifié</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================ CARTE ============================ */
function MapScreen({ c, city, openResto, display, flash }) {
  const list = RESTOS.filter((r) => r.city === city);
  const [sel, setSel] = useState(list[0]);
  const pins = list.map((r, i) => ({ id: r.id, x: 14 + ((i * 37) % 68), y: 18 + ((i * 53) % 52) }));
  const dm = c.bg === T.dark.bg; const dt = distTime(sel);
  return (
    <div style={{ height: "100%", position: "relative" }}>
      <div style={{ position: "absolute", inset: 0, background: dm ? "linear-gradient(135deg,#0f1622,#141d2b)" : "linear-gradient(135deg,#eef1e9,#e7ede9)" }}>
        <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: .5 }}>
          {[20, 40, 60, 80].map((p) => <line key={"h" + p} x1="0" y1={`${p}%`} x2="100%" y2={`${p}%`} stroke={c.line} />)}
          {[20, 40, 60, 80].map((p) => <line key={"v" + p} x1={`${p}%`} y1="0" x2={`${p}%`} y2="100%" stroke={c.line} />)}
          <path d="M0,55% Q40%,45% 60%,60% T100%,55%" stroke={c.primary} strokeWidth="6" fill="none" opacity=".2" />
          <path d="M30%,0 Q45%,40% 40%,70% T55%,100%" stroke={c.gold} strokeWidth="5" fill="none" opacity=".2" />
        </svg>
      </div>
      <div style={{ position: "absolute", top: 10, left: 20, right: 20, background: c.surface, borderRadius: 16,
        padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 8px 24px rgba(0,0,0,.14)" }}>
        <Search size={18} color={c.inkSoft} /><span style={{ color: c.inkSoft, fontSize: 14, flex: 1 }}>Rechercher dans cette zone</span>
        <MapPin size={18} color={c.primary} />
      </div>

      {/* position utilisateur simulée */}
      <div style={{ position: "absolute", left: "46%", top: "50%", transform: "translate(-50%,-50%)", zIndex: 3 }}>
        <div style={{ position: "relative", width: 22, height: 22 }}>
          <span style={{ position: "absolute", inset: -8, borderRadius: "50%", background: `${c.primary}33`, animation: "pulse 2s ease-in-out infinite" }} />
          <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: c.primary, border: "3px solid #fff", boxShadow: "0 2px 8px rgba(0,0,0,.4)" }} />
        </div>
      </div>

      {pins.map((p) => {
        const r = RESTOS.find((x) => x.id === p.id); const active = sel.id === p.id;
        return <button key={p.id} onClick={() => setSel(r)} className="press" style={{ position: "absolute", left: `${p.x}%`,
          top: `${p.y}%`, transform: "translate(-50%,-100%)", background: "none", border: "none", cursor: "pointer", zIndex: active ? 5 : 2 }}>
          <div style={{ background: active ? c.gold : c.primary, color: active ? c.goldInk : "#fff", padding: "6px 10px",
            borderRadius: 20, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", display: "flex", gap: 4, alignItems: "center",
            boxShadow: "0 6px 16px rgba(0,0,0,.25)", transform: active ? "scale(1.06)" : "scale(1)" }}>
            <Star size={12} fill="currentColor" /> {r.rating}</div>
        </button>;
      })}

      <div className="card" key={sel.id} style={{ position: "absolute", bottom: 88, left: 20, right: 20, background: c.surface,
        borderRadius: 20, padding: 14, boxShadow: "0 14px 34px rgba(0,0,0,.2)", border: `1px solid ${c.line}` }}>
        <div onClick={() => openResto(sel.id)} className="press" style={{ display: "flex", gap: 13, alignItems: "center", cursor: "pointer" }}>
          <DishArt r={sel} rounded={14} style={{ width: 56, height: 56 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ fontWeight: 700, fontSize: 15.5, color: c.ink }}>{sel.name}</span>
              {sel.verified && <CheckCircle2 size={14} color={c.gold} />}
            </div>
            <div style={{ fontSize: 12.5, color: c.inkSoft, margin: "3px 0" }}>{sel.cuisine} · {priceStr(sel.price)} · {sel.city}</div>
            <div style={{ display: "flex", gap: 12, fontSize: 12.5, fontWeight: 600 }}>
              <span style={{ color: c.primary, display: "flex", gap: 4, alignItems: "center" }}><Navigation size={13} /> {dt.kmStr}</span>
              <span style={{ color: c.gold, display: "flex", gap: 4, alignItems: "center" }}><Clock size={13} /> {dt.tStr}</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <button className="press" onClick={() => flash("Ouverture de l'itinéraire…")} style={{ flex: 1, background: c.primary, color: "#fff",
            border: "none", borderRadius: 13, padding: "11px 0", fontSize: 14, fontWeight: 700, cursor: "pointer",
            display: "flex", gap: 7, alignItems: "center", justifyContent: "center" }}><Navigation size={16} /> Itinéraire</button>
          <a href={`tel:${sel.phone}`} className="press" style={{ background: c.goldSoft, border: `1.5px solid ${c.gold}`, color: c.goldInk,
            borderRadius: 13, padding: "0 16px", display: "flex", alignItems: "center", cursor: "pointer" }}><Phone size={17} /></a>
        </div>
      </div>

      <div style={{ position: "absolute", top: 66, left: 20, background: c.surface, borderRadius: 10, padding: "5px 10px",
        fontSize: 11, color: c.inkSoft, border: `1px solid ${c.line}`, display: "flex", gap: 5, alignItems: "center" }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.primary }} /> {USER_POS.label}</div>
    </div>
  );
}

/* ============================ FAVORIS / PROFIL ============================ */
function Favs({ c, favs, toggleFav, openResto, display, setTab }) {
  const list = RESTOS.filter((r) => favs.has(r.id));
  return (
    <div style={{ padding: "8px 20px 96px" }}>
      <h1 style={{ fontFamily: display, fontSize: 26, fontWeight: 600, color: c.ink, margin: "8px 0 16px" }}>Mes favoris</h1>
      {list.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: c.inkSoft }}>
          <Heart size={44} color={c.line} style={{ margin: "0 auto 14px" }} />
          <div style={{ fontWeight: 700, color: c.ink, fontSize: 16, marginBottom: 6 }}>Aucun favori pour l'instant</div>
          <div style={{ fontSize: 13.5, lineHeight: 1.5 }}>Touchez le cœur sur un restaurant pour le retrouver ici.</div>
          <button className="press" onClick={() => setTab("home")} style={{ marginTop: 18, background: c.primary, color: "#fff",
            border: "none", borderRadius: 14, padding: "12px 20px", fontWeight: 600, cursor: "pointer" }}>Découvrir des restaurants</button>
        </div>
      ) : list.map((r) => <ListCard key={r.id} {...{ c, r, rank: null, favs, toggleFav, openResto }} />)}
    </div>
  );
}
function Profile({ c, dark, setDark, display, favs }) {
  const rows = [[Heart, "Mes favoris", `${favs.size}`], [Star, "Mes avis", "7"], [Nfc, "Mes visites vérifiées", "12"], [Bell, "Notifications", ""], [Globe, "Langue", "Français"]];
  return (
    <div style={{ paddingBottom: 96 }}>
      <div style={{ background: c.primary, padding: "20px 20px 26px", position: "relative", overflow: "hidden" }}>
        <ZelligePattern color={c.gold} opacity={0.16} />
        <div style={{ position: "relative", display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{ width: 66, height: 66, borderRadius: 20, background: `linear-gradient(135deg,${c.gold},#E9CF86)`, display: "flex",
            alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 700, color: c.goldInk, fontFamily: display }}>Y</div>
          <div><div style={{ color: "#fff", fontSize: 20, fontWeight: 700, fontFamily: display }}>Yasmine El Amrani</div>
            <div style={{ color: "rgba(255,255,255,.8)", fontSize: 13.5 }}>yasmine@email.ma · Casablanca</div></div>
        </div>
      </div>
      <div style={{ padding: "16px 20px" }}>
        {rows.map(([Ic, l, v]) => (
          <div key={l} className="press" style={{ display: "flex", alignItems: "center", gap: 13, padding: "14px 4px", borderBottom: `1px solid ${c.line}`, cursor: "pointer" }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: c.primarySoft, display: "flex", alignItems: "center", justifyContent: "center", color: c.primary }}><Ic size={18} /></div>
            <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: c.ink }}>{l}</span>
            {v && <span style={{ fontSize: 14, color: c.gold, fontWeight: 700 }}>{v}</span>}<ChevronRight size={18} color={c.inkSoft} />
          </div>))}
        <div style={{ display: "flex", alignItems: "center", gap: 13, padding: "14px 4px" }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: c.primarySoft, display: "flex", alignItems: "center", justifyContent: "center", color: c.primary }}>{dark ? <Moon size={18} /> : <Sun size={18} />}</div>
          <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: c.ink }}>Mode sombre</span>
          <button onClick={() => setDark((d) => !d)} style={{ width: 50, height: 30, borderRadius: 20, background: dark ? c.gold : c.line, border: "none", position: "relative", cursor: "pointer", transition: "background .2s" }}>
            <span style={{ position: "absolute", top: 3, left: dark ? 23 : 3, width: 24, height: 24, borderRadius: "50%", background: "#fff", transition: "left .2s", boxShadow: "0 2px 5px rgba(0,0,0,.3)" }} /></button>
        </div>
        <div style={{ textAlign: "center", marginTop: 24, fontSize: 12, color: c.inkSoft }}>Darna · v1.0 — Notre maison, votre table.</div>
      </div>
    </div>
  );
}

/* ============================ FICHE RESTAURANT ============================ */
function RestaurantDetail({ c, resto: r, detailTab, setDetailTab, favs, toggleFav, setOpenId, display, setReview, flash }) {
  const [pi, setPi] = useState(0);
  useEffect(() => { setPi(0); }, [r.id]);
  const tabs = [["apercu", "Aperçu"], ["menu", "Menu"], ["avis", "Avis"], ["infos", "Infos"]];
  const dt = distTime(r);
  return (
    <div style={{ position: "absolute", inset: 0, background: c.bg, zIndex: 40, display: "flex", flexDirection: "column", animation: "fadeIn .3s ease" }}>
      {/* galerie photos */}
      <div style={{ height: 250, flexShrink: 0, position: "relative" }}>
        <div className="scr" onScroll={(e) => setPi(Math.round(e.target.scrollLeft / e.target.clientWidth))}
          style={{ display: "flex", overflowX: "auto", height: "100%", scrollSnapType: "x mandatory" }}>
          {/* diapositive 1 : logo (style Glovo), puis photos */}
          <div style={{ minWidth: "100%", scrollSnapAlign: "start", position: "relative" }}>
            <LogoCover r={r} />
          </div>
          {r.photos.map((src, i) => (
            <div key={i} style={{ minWidth: "100%", scrollSnapAlign: "start", position: "relative" }}>
              <Photo src={src} grad={GRAD[(RESTOS.indexOf(r) + i) % GRAD.length]} scrim
                label={["Plat signature", "Salle", "Terrasse", "Façade", "Ambiance"][i] || "Photo"}
                fallback={<DishArt r={r} style={{ position: "absolute", inset: 0 }} />}
                iconSize={32} style={{ height: "100%" }} />
            </div>))}
        </div>
        <div style={{ position: "absolute", top: 44, left: 16, right: 16, display: "flex", justifyContent: "space-between", zIndex: 2 }}>
          <button className="press" onClick={() => setOpenId(null)} style={circBtn}><ArrowLeft size={19} /></button>
          <button className="press" onClick={() => flash("Lien copié")} style={circBtn}><Share2 size={19} /></button>
        </div>
        <div style={{ position: "absolute", bottom: 12, left: 0, right: 0, display: "flex", gap: 6, justifyContent: "center", zIndex: 2 }}>
          {[0, ...r.photos].map((_, i) => <span key={i} style={{ width: i === pi ? 18 : 6, height: 6, borderRadius: 3,
            background: i === pi ? "#fff" : "rgba(255,255,255,.55)", transition: "width .2s" }} />)}
        </div>
        {pi === 0 && <div style={{ position: "absolute", bottom: 34, left: 0, right: 0, textAlign: "center", zIndex: 2,
          fontSize: 11, color: "rgba(255,255,255,.75)", fontWeight: 600, letterSpacing: .3 }}>Faites défiler pour voir les photos</div>}
        <div style={{ position: "absolute", bottom: 12, left: 16, zIndex: 2 }}>
          {r.verified && <Badge bg="rgba(255,255,255,.95)" ink={c.primary} icon={<CheckCircle2 size={12} />}>Partenaire vérifié</Badge>}
        </div>
      </div>

      <div className="scr" style={{ flex: 1, overflowY: "auto", paddingBottom: 96 }}>
        <div style={{ padding: "16px 20px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
            <div>
              <h1 style={{ fontFamily: display, fontSize: 24, fontWeight: 600, color: c.ink, margin: 0 }}>{r.name}</h1>
              <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 6, flexWrap: "wrap" }}>
                <Stars v={r.rating} color={c.gold} size={15} /><span style={{ fontWeight: 700, color: c.ink, fontSize: 14 }}>{r.rating}</span>
                <span style={{ color: c.inkSoft, fontSize: 13.5 }}>({r.reviews} avis) · {priceStr(r.price)} · {r.cuisine}</span>
              </div>
              <div style={{ fontSize: 13, color: r.open ? c.green : c.terracotta, marginTop: 7, fontWeight: 600, display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                <Clock size={13} /> {r.open ? "Ouvert · ferme à 23h" : "Fermé · ouvre à 12h"}
                <span style={{ color: c.inkSoft, fontWeight: 500, display: "flex", gap: 4, alignItems: "center" }}><Navigation size={12} /> {dt.kmStr} · {dt.tStr}</span>
              </div>
            </div>
            <button className="press" onClick={() => toggleFav(r.id)} style={{ width: 44, height: 44, borderRadius: 14, background: c.surface,
              border: `1px solid ${c.line}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
              <Heart size={21} fill={favs.has(r.id) ? c.terracotta : "none"} color={c.terracotta} /></button>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button className="press" onClick={() => flash("Ouverture de l'itinéraire…")} style={{ flex: 1, padding: "13px 0", borderRadius: 14,
              border: "none", background: c.primary, color: "#fff", fontSize: 14.5, fontWeight: 700, cursor: "pointer",
              display: "flex", gap: 8, alignItems: "center", justifyContent: "center" }}><Navigation size={17} /> Itinéraire</button>
            <a href={`tel:${r.phone}`} className="press" style={{ flex: 1, padding: "13px 0", borderRadius: 14, border: `1.5px solid ${c.gold}`,
              background: c.goldSoft, color: c.goldInk, fontSize: 14.5, fontWeight: 700, display: "flex", gap: 8, alignItems: "center", justifyContent: "center" }}>
              <Phone size={17} /> Appeler</a>
          </div>
          <div style={{ fontSize: 11.5, color: c.inkSoft, textAlign: "center", marginTop: 7 }}>{fmtPhone(r.phone)}</div>
        </div>

        <div style={{ display: "flex", gap: 4, padding: "16px 20px 0", borderBottom: `1px solid ${c.line}`, position: "sticky", top: 0, background: c.bg, zIndex: 2 }}>
          {tabs.map(([k, l]) => <button key={k} onClick={() => setDetailTab(k)} style={{ background: "none", border: "none",
            padding: "8px 12px 12px", fontSize: 14.5, fontWeight: 700, cursor: "pointer", color: detailTab === k ? c.primary : c.inkSoft,
            borderBottom: `2.5px solid ${detailTab === k ? c.gold : "transparent"}` }}>{l}</button>)}
        </div>
        <div style={{ padding: "18px 20px" }}>
          {detailTab === "apercu" && <Apercu {...{ c, r, display }} />}
          {detailTab === "menu" && <MenuTab {...{ c, display }} />}
          {detailTab === "avis" && <AvisTab {...{ c, r, display }} />}
          {detailTab === "infos" && <InfosTab {...{ c, r, display }} />}
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "14px 20px 22px", background: c.surface, borderTop: `1px solid ${c.line}`, display: "flex", gap: 10 }}>
        <button className="press" onClick={() => setReview({ restoId: r.id, verified: false })} style={{ flex: 1, background: c.primary, color: "#fff",
          border: "none", borderRadius: 15, padding: 14, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>Laisser un avis</button>
        <button className="press" onClick={() => setReview({ restoId: r.id, verified: true })} style={{ background: `linear-gradient(135deg,${c.gold},#E9CF86)`,
          color: c.goldInk, border: "none", borderRadius: 15, padding: "0 16px", display: "flex", alignItems: "center", gap: 7, fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>
          <Nfc size={18} /> Scanner</button>
      </div>
    </div>
  );
}
const circBtn = { width: 40, height: 40, borderRadius: 13, background: "rgba(0,0,0,.4)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", cursor: "pointer" };

function Apercu({ c, r, display }) {
  return (
    <div className="card">
      {r.promo && <div style={{ background: c.goldSoft, border: `1px solid ${c.gold}`, borderRadius: 14, padding: "12px 14px",
        marginBottom: 16, display: "flex", gap: 10, alignItems: "center" }}>
        <Tag size={18} color={c.gold} /><div><div style={{ fontWeight: 700, color: c.ink, fontSize: 13.5 }}>Offre en cours</div>
          <div style={{ fontSize: 13, color: c.inkSoft }}>{r.promo}</div></div></div>}
      <h3 style={{ fontFamily: display, fontSize: 17, color: c.ink, margin: "0 0 8px" }}>L'histoire</h3>
      <p style={{ fontSize: 14, lineHeight: 1.65, color: c.inkSoft, margin: 0 }}>{r.story}</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
        {[r.category, ...r.tags, `Depuis ${r.founded}`].map((t) => <span key={t} style={{ background: c.surfaceAlt, color: c.ink,
          fontSize: 12.5, fontWeight: 600, padding: "7px 12px", borderRadius: 20 }}>{t}</span>)}
      </div>
    </div>
  );
}
function MenuTab({ c, display }) {
  return (
    <div className="card">
      {MENU.map((sec) => (
        <div key={sec.cat} style={{ marginBottom: 22 }}>
          <h3 style={{ fontFamily: display, fontSize: 18, color: c.ink, margin: "0 0 12px" }}>{sec.cat}</h3>
          {sec.items.map((it) => (
            <div key={it.n} style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 7, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700, fontSize: 14.5, color: c.ink }}>{it.n}</span>
                  {it.reco && <span style={{ fontSize: 10.5, fontWeight: 700, color: c.goldInk, background: c.goldSoft, padding: "2px 7px",
                    borderRadius: 7, display: "inline-flex", gap: 3, alignItems: "center" }}><Star size={10} fill={c.goldInk} /> Recommandé</span>}
                </div>
                <div style={{ fontSize: 13, color: c.inkSoft, marginTop: 3, lineHeight: 1.4 }}>{it.d}</div>
                {it.alg.length > 0 && <div style={{ fontSize: 11.5, color: c.terracotta, marginTop: 4, display: "flex", gap: 4, alignItems: "center" }}>
                  <AlertTriangle size={11} /> {it.alg.join(", ")}</div>}
                <div style={{ fontWeight: 700, color: c.primary, marginTop: 5, fontSize: 14 }}>{it.p} MAD</div>
              </div>
              <Photo src={it.img} grad={GRAD[MENU.indexOf(sec) % GRAD.length]} style={{ width: 76, height: 76, borderRadius: 14, flexShrink: 0 }} />
            </div>))}
        </div>))}
    </div>
  );
}
function AvisTab({ c, r, display }) {
  const dist = [70, 20, 6, 3, 1];
  return (
    <div className="card">
      <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 18 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: display, fontSize: 40, fontWeight: 700, color: c.ink, lineHeight: 1 }}>{r.rating}</div>
          <Stars v={r.rating} color={c.gold} size={13} /><div style={{ fontSize: 12, color: c.inkSoft, marginTop: 4 }}>{r.reviews} avis</div>
        </div>
        <div style={{ flex: 1 }}>
          {dist.map((pct, i) => <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: c.inkSoft, width: 10 }}>{5 - i}</span>
            <div style={{ flex: 1, height: 6, background: c.surfaceAlt, borderRadius: 4, overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: c.gold }} /></div></div>)}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <span style={{ background: c.primarySoft, color: c.primary, fontSize: 12, fontWeight: 700, padding: "6px 12px", borderRadius: 20, display: "flex", gap: 5, alignItems: "center" }}><CheckCircle2 size={13} /> Avis vérifiés</span>
        <span style={{ background: c.surfaceAlt, color: c.inkSoft, fontSize: 12, fontWeight: 600, padding: "6px 12px", borderRadius: 20 }}>Avec photos</span>
      </div>
      {REVIEWS.map((rv, i) => (
        <div key={i} style={{ paddingBottom: 16, marginBottom: 16, borderBottom: `1px solid ${c.line}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: GRAD[i % GRAD.length], display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700 }}>{rv.a[0]}</div>
              <div><div style={{ fontWeight: 700, fontSize: 13.5, color: c.ink, display: "flex", gap: 6, alignItems: "center" }}>{rv.a}
                {rv.v && <span style={{ fontSize: 10, fontWeight: 700, color: c.green, background: `${c.green}22`, padding: "1px 6px", borderRadius: 6, display: "flex", gap: 3, alignItems: "center" }}><CheckCircle2 size={10} /> Vérifié</span>}</div>
                <div style={{ fontSize: 11.5, color: c.inkSoft }}>{rv.d}</div></div>
            </div>
            <Stars v={rv.r} color={c.gold} size={12} />
          </div>
          <p style={{ fontSize: 13.5, lineHeight: 1.55, color: c.ink, margin: "10px 0 0" }}>{rv.t}</p>
          {rv.ph.length > 0 && <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            {rv.ph.map((src, k) => <Photo key={k} src={src} grad={GRAD[(i + k) % GRAD.length]} style={{ width: 64, height: 64, borderRadius: 12 }} />)}</div>}
          {rv.rep && <div style={{ background: c.surfaceAlt, borderRadius: 12, padding: "10px 12px", marginTop: 10 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: c.primary, marginBottom: 3 }}>Réponse du restaurant</div>
            <div style={{ fontSize: 13, color: c.inkSoft }}>{rv.rep}</div></div>}
        </div>))}
    </div>
  );
}
function InfosTab({ c, r, display }) {
  const hours = [["Lun – Jeu", "12:00 – 15:00 · 19:00 – 23:00"], ["Ven – Sam", "12:00 – 00:00"], ["Dimanche", "12:00 – 23:00"]];
  const dm = c.bg === T.dark.bg;
  const socials = [r.website && "Site web", r.instagram && "Instagram", r.facebook && "Facebook"].filter(Boolean);
  return (
    <div className="card">
      <Info c={c} icon={<MapPin size={17} color={c.primary} />} title="Adresse" body={r.address} sub="Voir sur la carte" />
      <div style={{ height: 120, borderRadius: 16, background: dm ? "#141d2b" : "#e7ede9", margin: "6px 0 18px", position: "relative", overflow: "hidden", border: `1px solid ${c.line}` }}>
        <svg width="100%" height="100%" style={{ opacity: .5 }}>{[30, 60, 90].map((p) => <line key={p} x1="0" y1={p} x2="100%" y2={p} stroke={c.line} />)}</svg>
        <MapPin size={30} color={c.terracotta} fill={c.terracotta} style={{ position: "absolute", left: "50%", top: "44%", transform: "translate(-50%,-100%)" }} />
      </div>
      <Info c={c} icon={<Clock size={17} color={c.primary} />} title="Horaires" custom={
        <div style={{ marginTop: 4 }}>{hours.map(([d, h]) => <div key={d} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "3px 0" }}>
          <span style={{ color: c.inkSoft }}>{d}</span><span style={{ color: c.ink, fontWeight: 600 }}>{h}</span></div>)}</div>} />
      <a href={`tel:${r.phone}`} className="press" style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center", color: "inherit" }}>
        <div style={{ width: 36, height: 36, borderRadius: 11, background: c.goldSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Phone size={17} color={c.gold} /></div>
        <div style={{ flex: 1 }}><div style={{ fontSize: 13.5, fontWeight: 700, color: c.ink }}>Téléphone</div>
          <div style={{ fontSize: 13.5, color: c.gold, fontWeight: 600, marginTop: 2 }}>{fmtPhone(r.phone)} — appeler</div></div>
        <Phone size={18} color={c.gold} />
      </a>
      {socials.length > 0 && <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {socials.map((s) => <span key={s} style={{ background: c.surfaceAlt, color: c.primary, fontSize: 12.5, fontWeight: 600, padding: "8px 14px", borderRadius: 20 }}>{s}</span>)}</div>}
    </div>
  );
}
function Info({ c, icon, title, body, sub, custom }) {
  return <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
    <div style={{ width: 36, height: 36, borderRadius: 11, background: c.primarySoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
    <div style={{ flex: 1 }}><div style={{ fontSize: 13.5, fontWeight: 700, color: c.ink }}>{title}</div>
      {body && <div style={{ fontSize: 13.5, color: c.inkSoft, marginTop: 2 }}>{body}</div>}
      {sub && <div style={{ fontSize: 12.5, color: c.gold, fontWeight: 600, marginTop: 2 }}>{sub}</div>}{custom}</div></div>;
}

/* ============================ ASSISTANT IA ============================ */
function Assistant({ c, setAsst, openResto, display }) {
  const [lang, setLang] = useState("Français");
  const [msgs, setMsgs] = useState([{ role: "assistant", text: "Bonjour, je suis l'assistant Darna. Dites-moi votre envie ou posez-moi une question sur l'application, je vous guide.", ids: [] }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, loading]);

  const suggestions = ["Je ne sais pas quoi manger", "Un restaurant romantique", "Ouvert maintenant près de moi", "Comment laisser un avis ?"];

  const send = async (text) => {
    const content = (text ?? input).trim(); if (!content || loading) return;
    const next = [...msgs, { role: "user", text: content, ids: [] }];
    setMsgs(next); setInput(""); setLoading(true);
    // L'API exige que la conversation commence par un message "user" :
    // on exclut donc le message de bienvenue de l'assistant.
    const start = next.findIndex((m) => m.role === "user");
    const history = next.slice(start).map((m) => ({ role: m.role, content: m.text }));
    try {
      const { out, text: raw } = await askClaude(SYS_ASSISTANT(lang), history);
      const reply = out?.reply ?? raw;
      setMsgs((m) => [...m, { role: "assistant", text: reply, ids: out?.restaurantIds || [] }]);
    } catch {
      const fb = localAssistantReply(content);
      setMsgs((m) => [...m, { role: "assistant", text: fb.reply, ids: fb.ids }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 55, display: "flex", flexDirection: "column", background: c.bg, animation: "slideUp .3s cubic-bezier(.2,.8,.2,1)" }}>
      {/* header */}
      <div style={{ background: c.primary, padding: "44px 18px 14px", position: "relative", overflow: "hidden", flexShrink: 0 }}>
        <ZelligePattern color={c.gold} opacity={0.16} />
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 11 }}>
          <div style={{ width: 40, height: 40, borderRadius: 13, background: `linear-gradient(135deg,${c.gold},#E9CF86)`, display: "flex", alignItems: "center", justifyContent: "center", color: c.goldInk }}><Sparkles size={20} /></div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 16, fontFamily: display }}>Assistant Darna</div>
            <div style={{ color: "rgba(255,255,255,.7)", fontSize: 11.5 }}>Recommandations et aide, en direct</div>
          </div>
          <button className="press" onClick={() => setAsst(false)} style={{ width: 36, height: 36, borderRadius: 12, background: "rgba(255,255,255,.15)", border: "none", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><X size={18} /></button>
        </div>
        <div style={{ position: "relative", display: "flex", gap: 6, marginTop: 12 }}>
          {["Français", "العربية", "Darija", "English"].map((l) => (
            <button key={l} className="press" onClick={() => setLang(l)} style={{ background: lang === l ? c.gold : "rgba(255,255,255,.12)",
              color: lang === l ? c.goldInk : "#fff", border: "none", borderRadius: 20, padding: "5px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{l}</button>))}
        </div>
      </div>

      {/* messages */}
      <div className="scr" style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px" }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{ maxWidth: "84%", padding: "11px 14px", borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                background: m.role === "user" ? c.primary : c.surface, color: m.role === "user" ? "#fff" : c.ink,
                border: m.role === "user" ? "none" : `1px solid ${c.line}`, fontSize: 14, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{m.text}</div>
            </div>
            {m.ids && m.ids.length > 0 && (
              <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
                {m.ids.map((id) => { const r = RESTOS.find((x) => x.id === id); if (!r) return null;
                  return <div key={id} className="press" onClick={() => openResto(id)} style={{ display: "flex", gap: 11, background: c.surface,
                    border: `1px solid ${c.line}`, borderRadius: 14, padding: 9, alignItems: "center", boxShadow: "0 3px 10px rgba(0,0,0,.05)" }}>
                    <DishArt r={r} rounded={12} style={{ width: 48, height: 48 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", gap: 5, alignItems: "center" }}><span style={{ fontWeight: 700, fontSize: 14, color: c.ink }}>{r.name}</span>{r.verified && <CheckCircle2 size={13} color={c.gold} />}</div>
                      <div style={{ fontSize: 12, color: c.inkSoft, margin: "2px 0" }}>{r.cuisine} · {priceStr(r.price)} · {r.hood}</div>
                      <div style={{ display: "flex", gap: 4, alignItems: "center", fontSize: 12, color: c.inkSoft }}><Star size={11} fill={c.gold} color={c.gold} /> {r.rating} · {r.open ? "Ouvert" : "Fermé"}</div>
                    </div><ChevronRight size={18} color={c.inkSoft} /></div>; })}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 14 }}>
            <div style={{ padding: "13px 16px", borderRadius: "16px 16px 16px 4px", background: c.surface, border: `1px solid ${c.line}`, display: "flex", gap: 5 }}>
              {[0, 1, 2].map((k) => <span key={k} style={{ width: 7, height: 7, borderRadius: "50%", background: c.inkSoft, animation: `blink 1.2s ${k * 0.2}s infinite` }} />)}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* suggestions */}
      {msgs.length <= 1 && (
        <div className="scr" style={{ display: "flex", gap: 8, overflowX: "auto", padding: "4px 16px 8px", flexShrink: 0 }}>
          {suggestions.map((s) => <button key={s} className="press" onClick={() => send(s)} style={{ flexShrink: 0, background: c.surface,
            border: `1px solid ${c.line}`, borderRadius: 20, padding: "8px 13px", fontSize: 12.5, color: c.ink, cursor: "pointer" }}>{s}</button>)}
        </div>
      )}

      {/* input */}
      <div style={{ flexShrink: 0, padding: "10px 16px 22px", borderTop: `1px solid ${c.line}`, background: c.surface, display: "flex", gap: 10, alignItems: "flex-end" }}>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={1}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Écrivez votre message…" style={{ flex: 1, resize: "none", maxHeight: 90, border: `1px solid ${c.line}`,
            borderRadius: 18, padding: "11px 14px", fontSize: 14, color: c.ink, background: c.bg, outline: "none", fontFamily: "inherit" }} />
        <button className="press" onClick={() => send()} disabled={!input.trim() || loading} style={{ width: 44, height: 44, borderRadius: 14,
          background: input.trim() && !loading ? c.primary : c.line, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
          <Send size={18} color="#fff" /></button>
      </div>
    </div>
  );
}

/* ============================ SHEETS ============================ */
function Sheet({ c, onClose, title, children }) {
  return (
    <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 50, display: "flex", alignItems: "flex-end" }}>
      <div onClick={(e) => e.stopPropagation()} className="scr" style={{ width: "100%", background: c.surface, borderRadius: "26px 26px 0 0",
        padding: "10px 20px 30px", maxHeight: "80%", overflowY: "auto", animation: "slideUp .32s cubic-bezier(.2,.8,.2,1)" }}>
        <div style={{ width: 40, height: 5, borderRadius: 3, background: c.line, margin: "6px auto 16px" }} />
        {title && <h2 style={{ fontSize: 19, fontWeight: 700, color: c.ink, margin: "0 0 12px" }}>{title}</h2>}{children}
      </div>
    </div>
  );
}
const rowBtn = (c, active) => ({ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 4px",
  background: "none", border: "none", borderBottom: `1px solid ${c.line}`, fontSize: 15.5, fontWeight: active ? 700 : 500, color: active ? c.primary : c.ink, cursor: "pointer" });

function FilterSheet({ c, onClose }) {
  const [price, setPrice] = useState(2); const [min, setMin] = useState(4);
  const feats = ["Ouvert maintenant", "Livraison", "À emporter", "Terrasse", "Parking", "Familial", "Romantique", "Halal", "Accessible PMR"];
  const cuis = ["Marocaine", "Italienne", "Japonaise", "Française", "Libanaise", "Grillades", "Fruits de mer", "Fast-food"];
  const [on, setOn] = useState(new Set(["Terrasse", "Halal"]));
  const tog = (k) => setOn((s) => { const n = new Set(s); n.has(k) ? n.delete(k) : n.add(k); return n; });
  return (
    <Sheet c={c} onClose={onClose} title="Filtres">
      <label style={lbl(c)}>Prix</label>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[1, 2, 3, 4].map((p) => <button key={p} onClick={() => setPrice(p)} className="press" style={{ flex: 1, padding: "11px 0", borderRadius: 12,
          border: `1px solid ${p <= price ? c.primary : c.line}`, background: p <= price ? c.primarySoft : c.surface, color: p <= price ? c.primary : c.inkSoft, fontWeight: 700, cursor: "pointer" }}>{"€".repeat(p)}</button>)}
      </div>
      <label style={lbl(c)}>Note minimale</label>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[3, 3.5, 4, 4.5].map((m) => <button key={m} onClick={() => setMin(m)} className="press" style={{ flex: 1, padding: "10px 0", borderRadius: 12,
          border: `1px solid ${m === min ? c.gold : c.line}`, background: m === min ? c.goldSoft : c.surface, color: m === min ? c.goldInk : c.inkSoft,
          fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", gap: 3, alignItems: "center", justifyContent: "center" }}><Star size={12} fill="currentColor" />{m}</button>)}
      </div>
      <label style={lbl(c)}>Cuisine</label>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>{cuis.map((k) => <button key={k} className="press" onClick={() => tog(k)} style={chip(c, on.has(k))}>{k}</button>)}</div>
      <label style={lbl(c)}>Services</label>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>{feats.map((k) => <button key={k} className="press" onClick={() => tog(k)} style={chip(c, on.has(k))}>{k}</button>)}</div>
      <button className="press" onClick={onClose} style={{ width: "100%", background: c.primary, color: "#fff", border: "none", borderRadius: 15, padding: 15, fontSize: 15.5, fontWeight: 700, cursor: "pointer" }}>Voir les résultats</button>
    </Sheet>
  );
}
const lbl = (c) => ({ display: "block", fontSize: 12, fontWeight: 700, color: c.inkSoft, marginBottom: 9, textTransform: "uppercase", letterSpacing: .5 });
const chip = (c, a) => ({ background: a ? c.primarySoft : c.surface, color: a ? c.primary : c.inkSoft, border: `1px solid ${a ? c.primary : c.line}`, borderRadius: 20, padding: "8px 13px", fontSize: 13, fontWeight: 600, cursor: "pointer" });

/* ============================ NFC & AVIS ============================ */
function NfcSheet({ c, nfcStep, setNfcStep, setNfc, setReview, display }) {
  React.useEffect(() => { if (nfcStep === 0) { const t = setTimeout(() => setNfcStep(1), 2200); return () => clearTimeout(t); } }, [nfcStep]);
  return (
    <Sheet c={c} onClose={() => setNfc(false)}>
      {nfcStep === 0 ? (
        <div style={{ textAlign: "center", padding: "10px 10px 20px" }}>
          <div style={{ position: "relative", width: 120, height: 120, margin: "10px auto 24px" }}>
            {[0, 1].map((k) => <span key={k} style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `2px solid ${c.gold}`, animation: `ring 1.8s ${k * 0.9}s ease-out infinite` }} />)}
            <div style={{ position: "absolute", inset: 22, borderRadius: "50%", background: `linear-gradient(135deg,${c.gold},#E9CF86)`, display: "flex", alignItems: "center", justifyContent: "center", animation: "pulse 1.6s ease-in-out infinite" }}><Nfc size={44} color={c.goldInk} /></div>
          </div>
          <h2 style={{ fontFamily: display, fontSize: 21, color: c.ink, margin: "0 0 8px" }}>Approchez votre téléphone</h2>
          <p style={{ fontSize: 14, color: c.inkSoft, lineHeight: 1.55, margin: "0 auto", maxWidth: 260 }}>Approchez le dos de votre téléphone de la carte posée sur votre table pour vérifier votre visite.</p>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "10px 10px 20px", animation: "fadeIn .4s ease" }}>
          <div style={{ width: 84, height: 84, borderRadius: "50%", background: `${c.green}22`, margin: "10px auto 20px", display: "flex", alignItems: "center", justifyContent: "center" }}><CheckCircle2 size={48} color={c.green} /></div>
          <h2 style={{ fontFamily: display, fontSize: 21, color: c.ink, margin: "0 0 8px" }}>Visite vérifiée</h2>
          <p style={{ fontSize: 14, color: c.inkSoft, lineHeight: 1.55, margin: "0 auto 22px", maxWidth: 270 }}>Votre présence chez <b style={{ color: c.ink }}>Dar Zellij</b> est confirmée. Votre avis portera le badge Vérifié.</p>
          <button className="press" onClick={() => { setNfc(false); setReview({ restoId: 1, verified: true }); }} style={{ width: "100%", background: c.primary, color: "#fff", border: "none", borderRadius: 15, padding: 15, fontSize: 15.5, fontWeight: 700, cursor: "pointer" }}>Laisser mon avis vérifié</button>
        </div>
      )}
    </Sheet>
  );
}
function ReviewSheet({ c, review, setReview, display, flash }) {
  const r = RESTOS.find((x) => x.id === review.restoId);
  const [rating, setRating] = useState(0); const [txt, setTxt] = useState("");
  return (
    <Sheet c={c} onClose={() => setReview(null)} title="Votre avis">
      {review.verified && <div style={{ background: `${c.green}18`, border: `1px solid ${c.green}`, borderRadius: 12, padding: "10px 13px", display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}>
        <CheckCircle2 size={17} color={c.green} /><span style={{ fontSize: 13, color: c.ink, fontWeight: 600 }}>Visite vérifiée par NFC — avis authentifié</span></div>}
      <div style={{ display: "flex", gap: 11, alignItems: "center", marginBottom: 20 }}>
        <LogoBadge r={r} size={46} />
        <div><div style={{ fontWeight: 700, fontSize: 15.5, color: c.ink }}>{r.name}</div><div style={{ fontSize: 12.5, color: c.inkSoft }}>{r.hood}, {r.city}</div></div>
      </div>
      <div style={{ textAlign: "center", marginBottom: 18 }}>
        <div style={{ fontSize: 13, color: c.inkSoft, marginBottom: 10, fontWeight: 600 }}>Votre note</div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          {[1, 2, 3, 4, 5].map((i) => <button key={i} className="press" onClick={() => setRating(i)} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <Star size={38} fill={i <= rating ? c.gold : "none"} color={c.gold} style={{ opacity: i <= rating ? 1 : 0.35, transition: "all .15s" }} /></button>)}
        </div>
      </div>
      <textarea value={txt} onChange={(e) => setTxt(e.target.value)} placeholder="Partagez votre expérience…" style={{ width: "100%", minHeight: 90, borderRadius: 14, border: `1px solid ${c.line}`, background: c.bg, padding: 14, fontSize: 14, color: c.ink, fontFamily: "inherit", resize: "none", outline: "none" }} />
      <button className="press" style={{ width: "100%", marginTop: 12, background: c.surfaceAlt, color: c.inkSoft, border: `1px dashed ${c.line}`, borderRadius: 14, padding: 13, fontSize: 13.5, fontWeight: 600, display: "flex", gap: 8, alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Camera size={17} /> Ajouter des photos</button>
      <button className="press" disabled={rating === 0} onClick={() => { setReview(null); flash("Merci, votre avis est publié"); }} style={{ width: "100%", marginTop: 16, background: rating ? c.primary : c.line, color: "#fff", border: "none", borderRadius: 15, padding: 15, fontSize: 15.5, fontWeight: 700, cursor: rating ? "pointer" : "default", opacity: rating ? 1 : .6 }}>Publier mon avis</button>
    </Sheet>
  );
}

/* ============================================================================
   ONBOARDING PREMIUM — Splash · Bienvenue · Langue · Inscription · Succès
   Multilingue (FR / EN / AR-RTL / ES). Précède l'app Darna.
============================================================================ */

const OB = {
  red: "#E50914", redDeep: "#7A0409", redDark: "#3D0205", gold: "#D9B450", ink: "#141414", line: "#ECECEC",
};

const I18N = {
  fr: { dir: "ltr", welcome: "Bienvenue", tagline: "Découvrez les meilleurs restaurants du Maroc en quelques secondes.",
    start: "Commencer", chooseLang: "Choisissez votre langue", langHint: "Vous pourrez la modifier à tout moment",
    createAccount: "Créer mon compte", account: "Créons votre compte", accountSub: "Quelques informations pour personnaliser votre expérience.",
    first: "Prénom", last: "Nom", email: "Adresse e-mail", phone: "Numéro de téléphone", continue: "Continuer", back: "Retour",
    creating: "Création…", successT: "Compte créé", successS: "Bienvenue dans la maison, votre table vous attend.", enter: "Entrer dans Darna",
    errFirst: "Entrez votre prénom", errLast: "Entrez votre nom", errEmail: "E-mail invalide", errPhone: "Numéro invalide" },
  en: { dir: "ltr", welcome: "Welcome", tagline: "Discover the best restaurants in Morocco in seconds.",
    start: "Get started", chooseLang: "Choose your language", langHint: "You can change it anytime",
    createAccount: "Create my account", account: "Let's create your account", accountSub: "A few details to personalise your experience.",
    first: "First name", last: "Last name", email: "Email address", phone: "Phone number", continue: "Continue", back: "Back",
    creating: "Creating…", successT: "Account created", successS: "Welcome home, your table awaits.", enter: "Enter Darna",
    errFirst: "Enter your first name", errLast: "Enter your last name", errEmail: "Invalid email", errPhone: "Invalid number" },
  ar: { dir: "rtl", welcome: "مرحباً", tagline: "اكتشف أفضل مطاعم المغرب في ثوانٍ معدودة.",
    start: "ابدأ", chooseLang: "اختر لغتك", langHint: "يمكنك تغييرها في أي وقت",
    createAccount: "إنشاء حسابي", account: "لننشئ حسابك", accountSub: "بعض المعلومات لتخصيص تجربتك.",
    first: "الاسم الشخصي", last: "الاسم العائلي", email: "البريد الإلكتروني", phone: "رقم الهاتف", continue: "متابعة", back: "رجوع",
    creating: "جارٍ الإنشاء…", successT: "تم إنشاء الحساب", successS: "مرحباً بك في دارنا، طاولتك بانتظارك.", enter: "دخول إلى دارنا",
    errFirst: "أدخل اسمك الشخصي", errLast: "أدخل اسمك العائلي", errEmail: "بريد غير صالح", errPhone: "رقم غير صالح" },
  es: { dir: "ltr", welcome: "Bienvenido", tagline: "Descubre los mejores restaurantes de Marruecos en segundos.",
    start: "Empezar", chooseLang: "Elige tu idioma", langHint: "Puedes cambiarlo cuando quieras",
    createAccount: "Crear mi cuenta", account: "Creemos tu cuenta", accountSub: "Algunos datos para personalizar tu experiencia.",
    first: "Nombre", last: "Apellido", email: "Correo electrónico", phone: "Número de teléfono", continue: "Continuar", back: "Atrás",
    creating: "Creando…", successT: "Cuenta creada", successS: "Bienvenido a casa, tu mesa te espera.", enter: "Entrar en Darna",
    errFirst: "Introduce tu nombre", errLast: "Introduce tu apellido", errEmail: "Correo inválido", errPhone: "Número inválido" },
};
const LANGS = [
  { code: "fr", flag: "🇫🇷", label: "Français" },
  { code: "en", flag: "🇬🇧", label: "English" },
  { code: "ar", flag: "🇲🇦", label: "العربية" },
  { code: "es", flag: "🇪🇸", label: "Español" },
];
const DIAL_CODES = [
  { c: "🇲🇦", d: "+212" }, { c: "🇫🇷", d: "+33" }, { c: "🇪🇸", d: "+34" }, { c: "🇬🇧", d: "+44" },
  { c: "🇺🇸", d: "+1" }, { c: "🇩🇿", d: "+213" }, { c: "🇹🇳", d: "+216" }, { c: "🇧🇪", d: "+32" },
];

/* Logo 3D Darna en rotation (toit + cercle, effet de profondeur via faces empilées) */
function Logo3D({ size = 132 }) {
  const layers = 8;
  return (
    <div style={{ width: size, height: size, perspective: 600 }}>
      <div style={{ width: "100%", height: "100%", position: "relative", transformStyle: "preserve-3d",
        animation: "spin3d 3.2s cubic-bezier(.45,.05,.25,1) infinite" }}>
        {Array.from({ length: layers }).map((_, i) => (
          <div key={i} style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
            transform: `translateZ(${(i - layers / 2) * 2}px)`, opacity: i === layers - 1 ? 1 : 0.5 }}>
            <svg width={size} height={size} viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke={i === layers - 1 ? "#fff" : OB.gold} strokeWidth="2.5" opacity={i === layers - 1 ? 1 : 0.3} />
              <path d="M28 66 L60 38 L92 66" fill="none" stroke={i === layers - 1 ? "#fff" : "#fff"} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M44 54 L44 40 M76 54 L76 40" stroke="#fff" strokeWidth="7" strokeLinecap="round" />
              <text x="60" y="92" textAnchor="middle" fontFamily="'Fraunces','Georgia',serif" fontSize="20" fontWeight="600" fill="#fff">Darna</text>
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Champ de formulaire premium : icône, focus animé, validation temps réel */
function Field({ icon, label, value, onChange, onBlur, valid, error, touched, type = "text", dir, prefix }) {
  const [focus, setFocus] = useState(false);
  const showErr = touched && error;
  const showOk = touched && valid;
  const border = showErr ? "#E50914" : focus ? OB.ink : OB.line;
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 12.5, fontWeight: 600, color: "#6B6B6B", marginBottom: 7, display: "block" }}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", border: `1.5px solid ${border}`,
        borderRadius: 16, padding: "0 14px", height: 54, transition: "border-color .2s, box-shadow .2s",
        boxShadow: focus ? "0 0 0 4px rgba(20,20,20,.06)" : "none" }}>
        <span style={{ color: focus ? OB.ink : "#9A9A9A", display: "flex", transition: "color .2s" }}>{icon}</span>
        {prefix}
        <input value={value} onChange={(e) => onChange(e.target.value)} type={type} dir={dir}
          onFocus={() => setFocus(true)} onBlur={() => { setFocus(false); onBlur && onBlur(); }}
          style={{ flex: 1, border: "none", outline: "none", background: "none", fontSize: 15, color: OB.ink,
            fontFamily: "inherit", height: "100%", minWidth: 0 }} />
        {showOk && <Check size={18} color="#1F9D55" />}
        {showErr && <AlertTriangle size={17} color="#E50914" />}
      </div>
      {showErr && <div style={{ fontSize: 12, color: "#E50914", marginTop: 5 }}>{error}</div>}
    </div>
  );
}

function PhonePrefix({ dial, setDial, open, setOpen }) {
  return (
    <div style={{ position: "relative" }}>
      <button type="button" onClick={() => setOpen(!open)} className="press"
        style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none",
          borderRight: `1.5px solid ${OB.line}`, paddingRight: 10, marginRight: 4, cursor: "pointer",
          fontSize: 15, color: OB.ink, fontWeight: 600, height: 28 }}>
        <span style={{ fontSize: 18 }}>{dial.c}</span> {dial.d} <ChevronDown size={14} />
      </button>
      {open && (
        <div style={{ position: "absolute", top: 40, left: 0, background: "#fff", borderRadius: 14, border: `1px solid ${OB.line}`,
          boxShadow: "0 16px 36px rgba(0,0,0,.18)", zIndex: 20, width: 150, overflow: "hidden" }}>
          {DIAL_CODES.map((d) => (
            <button key={d.d} type="button" onClick={() => { setDial(d); setOpen(false); }} className="press"
              style={{ width: "100%", display: "flex", gap: 9, alignItems: "center", padding: "11px 14px", background: "none",
                border: "none", cursor: "pointer", fontSize: 14, color: OB.ink }}>
              <span style={{ fontSize: 17 }}>{d.c}</span> {d.d}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Écran 1 : Splash ---------- */
function Splash({ onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, []);
  return (
    <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg,${OB.redDark},${OB.red})`,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <ZelligePattern color={OB.gold} opacity={0.12} />
      <div style={{ position: "relative", animation: "logoIn 1s cubic-bezier(.2,.8,.2,1) both" }}>
        <Logo3D size={140} />
      </div>
      <div style={{ position: "relative", marginTop: 30, color: "rgba(255,255,255,.8)", fontSize: 12.5,
        letterSpacing: 3, fontWeight: 600, animation: "fadeIn 1.2s .5s both" }}>NOTRE MAISON, VOTRE TABLE</div>
    </div>
  );
}

/* ---------- Écran 2 : Bienvenue ---------- */
function Welcome({ t, dir, onNext }) {
  return (
    <div dir={dir} style={{ position: "absolute", inset: 0, background: "#fff", display: "flex", flexDirection: "column" }}>
      <div style={{ height: "58%", background: `linear-gradient(160deg,${OB.redDark},${OB.red})`, position: "relative",
        borderBottomLeftRadius: 40, borderBottomRightRadius: 40, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <ZelligePattern color={OB.gold} opacity={0.13} />
        <div style={{ animation: "logoIn .9s cubic-bezier(.2,.8,.2,1) both" }}><Logo3D size={128} /></div>
      </div>
      <div style={{ flex: 1, padding: "34px 30px", display: "flex", flexDirection: "column", animation: "fadeIn .6s .2s both" }}>
        <h1 style={{ fontFamily: "'Fraunces','Georgia',serif", fontSize: 34, fontWeight: 600, color: OB.ink, margin: 0 }}>{t.welcome}</h1>
        <p style={{ fontSize: 16, lineHeight: 1.55, color: "#5B5B5B", marginTop: 12 }}>{t.tagline}</p>
        <div style={{ flex: 1 }} />
        <button className="press" onClick={onNext} style={{ width: "100%", height: 58, borderRadius: 18, background: OB.red,
          color: "#fff", border: "none", fontSize: 16.5, fontWeight: 700, cursor: "pointer",
          boxShadow: "0 12px 28px -8px rgba(229,9,20,.6)", display: "flex", alignItems: "center", justifyContent: "center", gap: 9 }}>
          {t.start} <ArrowRight size={20} style={{ transform: dir === "rtl" ? "scaleX(-1)" : "none" }} />
        </button>
      </div>
    </div>
  );
}

/* ---------- Écran 3 : Langue ---------- */
function LangPick({ lang, setLang, t, dir, onNext }) {
  return (
    <div dir={dir} style={{ position: "absolute", inset: 0, background: "#fff", display: "flex", flexDirection: "column", padding: "64px 26px 26px" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
        <div style={{ width: 60, height: 60, borderRadius: 20, background: `linear-gradient(135deg,${OB.redDeep},${OB.red})`,
          display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><Globe size={28} /></div>
      </div>
      <h1 style={{ fontFamily: "'Fraunces','Georgia',serif", fontSize: 26, fontWeight: 600, color: OB.ink, margin: 0, textAlign: "center" }}>{t.chooseLang}</h1>
      <p style={{ fontSize: 14, color: "#8A8A8A", textAlign: "center", margin: "8px 0 26px" }}>{t.langHint}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {LANGS.map((l) => {
          const on = lang === l.code;
          return (
            <button key={l.code} className="press" onClick={() => setLang(l.code)}
              style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", borderRadius: 18,
                background: on ? "#FFF1F1" : "#fff", border: `2px solid ${on ? OB.red : OB.line}`, cursor: "pointer",
                transition: "border-color .2s, background .2s" }}>
              <span style={{ fontSize: 26 }}>{l.flag}</span>
              <span style={{ flex: 1, textAlign: dir === "rtl" ? "right" : "left", fontSize: 16, fontWeight: 700, color: OB.ink }}>{l.label}</span>
              {on ? <CheckCircle2 size={22} color={OB.red} /> : <div style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${OB.line}` }} />}
            </button>
          );
        })}
      </div>
      <div style={{ flex: 1 }} />
      <button className="press" onClick={onNext} style={{ width: "100%", height: 58, borderRadius: 18, background: OB.red,
        color: "#fff", border: "none", fontSize: 16.5, fontWeight: 700, cursor: "pointer",
        boxShadow: "0 12px 28px -8px rgba(229,9,20,.6)", marginTop: 20 }}>{t.continue}</button>
    </div>
  );
}

/* ---------- Écran 4 : Inscription ---------- */
function SignUp({ t, dir, onBack, onDone }) {
  const [f, setF] = useState({ first: "", last: "", email: "", phone: "" });
  const [touched, setTouched] = useState({});
  const [dial, setDial] = useState(DIAL_CODES[0]);
  const [dialOpen, setDialOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const v = {
    first: f.first.trim().length >= 2,
    last: f.last.trim().length >= 2,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email),
    phone: f.phone.replace(/\D/g, "").length >= 8,
  };
  const allValid = v.first && v.last && v.email && v.phone;
  const set = (k) => (val) => setF((s) => ({ ...s, [k]: val }));
  const blur = (k) => () => setTouched((s) => ({ ...s, [k]: true }));

  const submit = () => {
    setTouched({ first: true, last: true, email: true, phone: true });
    if (!allValid || loading) return;
    setLoading(true);
    setTimeout(() => onDone({ ...f, phone: dial.d + " " + f.phone }), 1400);
  };

  return (
    <div dir={dir} style={{ position: "absolute", inset: 0, background: "#fff", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "56px 26px 8px", flexShrink: 0 }}>
        <button className="press" onClick={onBack} style={{ width: 42, height: 42, borderRadius: 13, border: `1px solid ${OB.line}`,
          background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", marginBottom: 18 }}>
          <ChevronLeft size={20} color={OB.ink} style={{ transform: dir === "rtl" ? "scaleX(-1)" : "none" }} />
        </button>
        <h1 style={{ fontFamily: "'Fraunces','Georgia',serif", fontSize: 26, fontWeight: 600, color: OB.ink, margin: 0 }}>{t.account}</h1>
        <p style={{ fontSize: 14, color: "#8A8A8A", marginTop: 8 }}>{t.accountSub}</p>
      </div>
      <div className="scr" style={{ flex: 1, overflowY: "auto", padding: "16px 26px 0" }}>
        <Field icon={<User size={19} />} label={t.first} value={f.first} onChange={set("first")} onBlur={blur("first")}
          valid={v.first} error={t.errFirst} touched={touched.first} dir={dir} />
        <Field icon={<User size={19} />} label={t.last} value={f.last} onChange={set("last")} onBlur={blur("last")}
          valid={v.last} error={t.errLast} touched={touched.last} dir={dir} />
        <Field icon={<Mail size={19} />} label={t.email} value={f.email} onChange={set("email")} onBlur={blur("email")}
          valid={v.email} error={t.errEmail} touched={touched.email} type="email" dir="ltr" />
        <Field icon={<Phone size={19} />} label={t.phone} value={f.phone} onChange={(val) => set("phone")(val.replace(/[^\d\s]/g, ""))}
          onBlur={blur("phone")} valid={v.phone} error={t.errPhone} touched={touched.phone} type="tel" dir="ltr"
          prefix={<PhonePrefix dial={dial} setDial={setDial} open={dialOpen} setOpen={setDialOpen} />} />
      </div>
      <div style={{ padding: "12px 26px 26px", flexShrink: 0 }}>
        <button className="press" onClick={submit} disabled={loading}
          style={{ width: "100%", height: 58, borderRadius: 18, background: allValid ? OB.red : "#F0A9AD", color: "#fff",
            border: "none", fontSize: 16.5, fontWeight: 700, cursor: loading ? "default" : "pointer",
            boxShadow: allValid ? "0 12px 28px -8px rgba(229,9,20,.6)" : "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          {loading ? <><Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} /> {t.creating}</> : t.createAccount}
        </button>
      </div>
    </div>
  );
}

/* ---------- Écran 5 : Succès ---------- */
function Success({ t, dir, user, onEnter }) {
  return (
    <div dir={dir} style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg,${OB.redDark},${OB.red})`,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 30, overflow: "hidden" }}>
      <ZelligePattern color={OB.gold} opacity={0.12} />
      <div style={{ position: "relative", width: 96, height: 96, borderRadius: "50%", background: "rgba(255,255,255,.14)",
        border: "2px solid rgba(255,255,255,.5)", display: "flex", alignItems: "center", justifyContent: "center",
        animation: "logoIn .7s cubic-bezier(.2,.8,.2,1) both" }}>
        <Check size={52} color="#fff" strokeWidth={2.5} />
      </div>
      <h1 style={{ position: "relative", fontFamily: "'Fraunces','Georgia',serif", fontSize: 30, fontWeight: 600, color: "#fff",
        margin: "26px 0 0", animation: "fadeIn .6s .2s both" }}>{t.successT}</h1>
      <p style={{ position: "relative", fontSize: 15.5, color: "rgba(255,255,255,.85)", textAlign: "center", marginTop: 12,
        maxWidth: 280, lineHeight: 1.55, animation: "fadeIn .6s .35s both" }}>
        {user?.first ? `${user.first}, ` : ""}{t.successS}</p>
      <div style={{ position: "relative", flex: 0, marginTop: 40, width: "100%", animation: "fadeIn .6s .5s both" }}>
        <button className="press" onClick={onEnter} style={{ width: "100%", height: 58, borderRadius: 18, background: "#fff",
          color: OB.red, border: "none", fontSize: 16.5, fontWeight: 700, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 9 }}>
          {t.enter} <ArrowRight size={20} style={{ transform: dir === "rtl" ? "scaleX(-1)" : "none" }} />
        </button>
      </div>
    </div>
  );
}

/* ============================ RACINE : onboarding puis app ============================ */
export default function App() {
  const [step, setStep] = useState("splash"); // splash · welcome · lang · signup · success · app
  const [lang, setLang] = useState("fr");
  const [user, setUser] = useState(null);
  const t = I18N[lang];

  return (
    <div style={{ minHeight: "100vh", width: "100%", background: "#DFD6C4", display: "flex", alignItems: "center",
      justifyContent: "center", padding: "24px 12px", fontFamily: "'Inter',system-ui,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Sans+Arabic:wght@400;600;700&display=swap');
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        .scr::-webkit-scrollbar { width: 0; height: 0; }
        .press { transition: transform .12s ease; cursor: pointer; }
        .press:active { transform: scale(.97); }
        [dir="rtl"] { font-family: 'IBM Plex Sans Arabic','Inter',sans-serif; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes spin3d { from { transform: rotateY(0deg); } to { transform: rotateY(360deg); } }
        @keyframes logoIn { from { opacity: 0; transform: scale(.7); } to { opacity: 1; transform: scale(1); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes screenIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      {step === "app" ? (
        <MainApp lang={lang} user={user} />
      ) : (
        <div style={{ width: 390, height: 800, background: "#fff", borderRadius: 44, overflow: "hidden", position: "relative",
          boxShadow: "0 40px 80px -20px rgba(0,0,0,.5),0 0 0 11px #0b0d12,0 0 0 13px #23262e" }}>
          <div key={step} style={{ position: "absolute", inset: 0, animation: "screenIn .4s ease both" }}>
            {step === "splash" && <Splash onDone={() => setStep("welcome")} />}
            {step === "welcome" && <Welcome t={t} dir={t.dir} onNext={() => setStep("lang")} />}
            {step === "lang" && <LangPick lang={lang} setLang={setLang} t={t} dir={t.dir} onNext={() => setStep("signup")} />}
            {step === "signup" && <SignUp t={t} dir={t.dir} onBack={() => setStep("lang")} onDone={(u) => { setUser(u); setStep("success"); }} />}
            {step === "success" && <Success t={t} dir={t.dir} user={user} onEnter={() => setStep("app")} />}
          </div>
        </div>
      )}
    </div>
  );
}
