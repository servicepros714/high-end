// ---------------------------------------------------------------------------
// SEO landing pages (service + city). One template renders all of them
// (src/pages/Landing.jsx); head tags and schema come from src/lib/seo.js.
//
// Only confirmed facts: prices, package contents and job times (data/business.js),
// open 7 days 7 AM–7 PM by appointment, own water and power, same price for every
// vehicle size, prepay online (PREPAY = $15 off) or pay later, same-day bookings
// need 4 hours' notice. Never state: years in business, vehicles detailed,
// ratings, guarantees. The Exterior Wash is an add-on: never bookable alone.
// Keep the wording distinct from the owner's other detailing sites.
// ---------------------------------------------------------------------------

const BRANDS = ['High End Car Detailing', 'High End Detailing', 'High End'];

// Longest title that fits in 60 chars (counting '&' as the escaped '&amp;').
// For each brand (longest first) try "…, CA", then without ", CA".
export function fitTitle(keyword, city) {
  const options = BRANDS.flatMap((b) => [`${keyword} ${city}, CA | ${b}`, `${keyword} ${city} | ${b}`]);
  const len = (t) => t.replace(/&/g, '&amp;').length;
  return options.find((t) => len(t) <= 60) || options[options.length - 1];
}

export const HOME_CITY = 'San Juan Capistrano';

const FAQ_WATER = { q: 'Do I need to provide water or power?', a: 'No. We bring our own water, power, equipment and products. We just need room to work around the car.' };
const FAQ_PAY = { q: 'When do I pay?', a: 'Your choice. Prepay online at checkout and save $15 with code PREPAY, or choose pay later and settle up after the job.' };
const FAQ_WASH = { q: 'Can I book only the Exterior Wash?', a: 'No. The Exterior Wash is a $50 add-on to the Basic or Premium Detail. Add it in step 2 of booking.' };
const FAQ_SIZE = { q: 'Do SUVs and trucks cost more?', a: 'No. Sedans, SUVs, trucks and vans all pay the same: $150 for the Basic Detail, $200 for the Premium Detail and $50 to add the Exterior Wash.' };
const FAQ_TIME = { q: 'How long does a detail take?', a: 'A Basic Detail usually takes about 1.5–2 hours and a Premium Detail about 3–4 hours. Adding the Exterior Wash adds roughly 45 minutes.' };
const FAQ_SOON = { q: 'How soon can I book?', a: 'Appointments start every 30 minutes from 7 AM to 7 PM, seven days a week. Same-day bookings need at least 4 hours’ notice. For anything sooner, call us.' };
const FAQ_PACKAGES = {
  q: 'What do the packages include?',
  a: 'The Basic Detail ($150) is triple-stage vacuuming, a complete interior surface wipe-down and floor mat cleaning. The Premium Detail ($200) adds cabin application, dust elimination, interior windows, deep carpet cleaning, cloth and carpet extraction, full interior shampooing and a UV-protectant coating. The Exterior Wash is a $50 add-on to either one.',
};

// Schema offers: only things a customer can actually book. The wash never appears alone.
const DETAIL_OFFERS = [
  ['Basic Detail', 150], ['Premium Detail', 200],
  ['Basic Detail + Exterior Wash', 200], ['Premium Detail + Exterior Wash', 250],
];

const PHOTO = {
  door: { src: '/images/door-after.webp', alt: 'Clean door panel and trim after an interior detail' },
  seat: { src: '/images/seat-after.webp', alt: 'Car seat after cleaning and extraction', portrait: true },
  convertible: { src: '/images/foam-convertible.webp', alt: 'Luxury convertible foamed up for a hand wash', portrait: true },
  audi: { src: '/images/foam-audi.webp', alt: 'Sedan covered in pre-wash snow foam during a mobile detail', portrait: true },
  rig: { src: '/images/mobile-rig.webp', alt: 'Mobile detailing van parked beside a foamed car', portrait: true },
  taillight: { src: '/images/taillight.webp', alt: 'Hand-washed taillight and rear panel', portrait: true },
};

export const SERVICE_PAGES = [
  {
    path: '/interior-car-detailing-san-juan-capistrano',
    kind: 'service',
    nav: 'Interior detailing',
    city: HOME_CITY,
    title: fitTitle('Interior Car Detailing', HOME_CITY),
    description: 'Mobile interior car detailing in San Juan Capistrano. Basic Detail $150, Premium with shampoo and extraction $200, done at your home. Book online.',
    eyebrow: 'Interior detailing · San Juan Capistrano',
    h1: ['Interior car detailing', 'in San Juan Capistrano.'],
    lede: 'Dust, crumbs and everyday grime cleaned out of your cabin at your home or office. Basic resets it; Premium shampoos and extracts it.',
    facts: ['From $150', 'Same price, any size', 'Open 7 days, 7 AM–7 PM'],
    card: 'premium',
    photo: PHOTO.door,
    intro: {
      h2: 'A cabin reset, at your address.',
      paras: [
        'Canyon dust, kids’ snacks and the daily commute all end up inside the car. A gas-station vacuum only gets what sits on top.',
        'The Basic Detail (about 1.5–2 hours) is triple-stage vacuuming for deep debris removal, a complete interior surface wipe-down, and floor mat cleaning and restoration.',
        'The Premium Detail (about 3–4 hours) is the full interior restoration: cabin application, dust elimination, interior window cleaning, deep carpet cleaning, cloth and carpet extraction, full interior shampooing and a UV-protectant coating.',
      ],
    },
    points: [
      { title: 'Nothing to drop off', text: 'We work where the car is parked, with our own water, power and equipment.' },
      { title: 'Two clear levels', text: 'Basic for regular upkeep, Premium when seats and carpet need shampoo and extraction.' },
      { title: 'Flat pricing', text: '$150 or $200, the same for every vehicle size.' },
    ],
    faqs: [
      { q: 'Should I book Basic or Premium?', a: 'Basic suits a car that gets regular care and needs a deep vacuum, a wipe-down and clean floor mats. Premium suits stained seats or carpet, or a car that hasn’t been detailed in a while.' },
      { q: 'Can you clean the outside too?', a: 'Yes. Add the Exterior Wash for $50 (about 45 more minutes): a hand-washed exterior, detailed rim cleaning, tire scrub and degrease, door jamb and panel wipe-down, tire shine and a spot-free hand dry.' },
      FAQ_TIME,
      FAQ_WATER,
      FAQ_PAY,
    ],
    service: { type: 'Interior car detailing', offers: [['Basic Detail', 150], ['Premium Detail', 200]] },
  },
  {
    path: '/car-seat-carpet-shampoo-san-juan-capistrano',
    kind: 'service',
    nav: 'Seat & carpet shampoo',
    city: HOME_CITY,
    title: fitTitle('Car Seat and Carpet Shampoo', HOME_CITY),
    description: 'Car seat and carpet shampoo in San Juan Capistrano. The $200 Premium Detail includes deep carpet cleaning, extraction and full shampooing, at your home.',
    eyebrow: 'Seat & carpet shampoo · San Juan Capistrano',
    h1: ['Car seat & carpet shampoo', 'in San Juan Capistrano.'],
    lede: 'Spills on the seats, mud in the footwells, a smell that won’t leave. The Premium Detail shampoos and extracts it in your driveway.',
    facts: ['$200 Premium Detail', 'About 3–4 hours', 'Open 7 days, 7 AM–7 PM'],
    card: 'premium',
    photo: PHOTO.seat,
    beforeAfter: { before: '/images/seat-before.webp', after: '/images/seat-after.webp', alt: 'car seat' },
    intro: {
      h2: 'Clean all the way into the fabric.',
      paras: [
        'A vacuum lifts loose dirt. Spilled drinks, ground-in mud and odors sit down in the fibers, where only shampoo and extraction reach.',
        'In the Premium Detail we shampoo cloth seats and carpets, then extract the dirty water and loosened grime back out. Deep carpet cleaning, dust elimination, interior windows and a UV-protectant coating are included.',
        'Most everyday stains come out or fade a lot. Old, set-in stains, ink and dye transfer may not lift completely.',
      ],
    },
    points: [
      { title: 'Shampoo + extraction', text: 'The grime leaves with the water instead of drying back into the seat.' },
      { title: 'UV-protectant finish', text: 'Every Premium Detail ends with a UV-protectant coating.' },
      { title: 'At your address', text: 'Own water and power, so nothing is needed from you.' },
    ],
    faqs: [
      { q: 'Is shampoo part of the Basic Detail?', a: 'No. Basic is triple-stage vacuuming, a complete interior surface wipe-down and floor mat cleaning. Shampoo, extraction and deep carpet cleaning come with the Premium Detail ($200).' },
      { q: 'Will every stain come out?', a: 'Most everyday stains come out or fade noticeably. Old, set-in stains, ink and dye transfer may not lift completely.' },
      { q: 'How long until the seats are dry?', a: 'It depends on the fabric, the weather and how much cleaning a spot needed. Sun, or a garage with the windows cracked, helps them dry faster.' },
      FAQ_WATER,
      FAQ_PAY,
    ],
    service: { type: 'Car upholstery and carpet shampoo', offers: [['Premium Detail', 200]] },
  },
  {
    path: '/full-car-detailing-san-juan-capistrano',
    kind: 'service',
    nav: 'Full detail, inside & out',
    city: HOME_CITY,
    title: fitTitle('Full Car Detailing', HOME_CITY),
    description: 'Full car detailing in San Juan Capistrano, inside and out. Basic Detail plus hand wash $200, or Premium plus hand wash $250, done at your home.',
    eyebrow: 'Full detail · San Juan Capistrano',
    h1: ['Full car detailing', 'in San Juan Capistrano.'],
    lede: 'An interior detail plus the Exterior Wash in one visit at your address. Basic plus the wash is $200; Premium plus the wash is $250.',
    facts: ['From $200', 'Inside + out', 'Open 7 days, 7 AM–7 PM'],
    card: 'combo',
    photo: PHOTO.convertible,
    intro: {
      h2: 'Inside and out, one appointment.',
      paras: [
        'A full detail is the Basic or Premium Detail with the Exterior Wash added. The cabin and the paint get done in the same visit, wherever the car is parked.',
        'Inside, choose Basic ($150, about 1.5–2 hours) for a deep vacuum, wipe-down and clean floor mats, or Premium ($200, about 3–4 hours) for shampoo, extraction and a UV-protectant coating.',
        'Outside, the Exterior Wash adds $50 and about 45 minutes: a hand-washed exterior, detailed rim cleaning, tire scrub and degrease, door jamb and panel wipe-down, premium tire shine and a spot-free hand dry.',
      ],
    },
    points: [
      { title: 'Two flat prices', text: 'Basic plus the wash for $200, or Premium plus the wash for $250, any vehicle size.' },
      { title: 'Washed by hand', text: 'Rims, tires and door jambs included, finished with a spot-free hand dry.' },
      { title: 'Own water and power', text: 'Nothing needed from you but room around the car.' },
    ],
    faqs: [
      { q: 'How much is a full detail?', a: '$200 for the Basic Detail with the Exterior Wash, or $250 for the Premium Detail with the Exterior Wash. Same price for every vehicle size.' },
      FAQ_WASH,
      { q: 'What does the Exterior Wash include?', a: 'A hand-washed exterior, detailed rim cleaning, tire scrub and degrease, door jamb and panel wipe-down, premium tire shine application and a spot-free hand dry.' },
      FAQ_TIME,
      FAQ_PAY,
    ],
    service: { type: 'Full car detailing', offers: [['Basic Detail + Exterior Wash', 200], ['Premium Detail + Exterior Wash', 250]] },
  },
  {
    path: '/suv-truck-detailing-san-juan-capistrano',
    kind: 'service',
    nav: 'SUV & truck detailing',
    city: HOME_CITY,
    title: fitTitle('SUV & Truck Detailing', HOME_CITY),
    description: 'Mobile SUV, truck and van detailing in San Juan Capistrano at the same price as a sedan. Interior from $150, add a hand wash for $50. Book online.',
    eyebrow: 'SUV, truck & van · San Juan Capistrano',
    h1: ['SUV & truck detailing', 'in San Juan Capistrano.'],
    lede: 'Three-row SUVs, work trucks and family vans pay the same package price as a sedan.',
    facts: ['From $150', 'All sizes, same price', 'Open 7 days, 7 AM–7 PM'],
    card: 'premium',
    photo: PHOTO.rig,
    intro: {
      h2: 'Bigger vehicle, same price.',
      paras: [
        'The Basic Detail is $150, the Premium Detail is $200 and adding the Exterior Wash is $50, whether it’s a compact, a three-row SUV, a pickup or a van.',
        'Trail dust, horse-country dirt and sports gear end up in the third row and the truck-cab floor. Triple-stage vacuuming pulls debris out of carpets, seats and crevices.',
        'Add the Exterior Wash to have the body hand-washed, the rims cleaned and the tires scrubbed and shined in the same visit.',
      ],
    },
    points: [
      { title: 'One price, any size', text: 'Sedans, SUVs, trucks and vans all pay the same.' },
      { title: 'Every row', text: 'The whole interior is detailed, third row included.' },
      { title: 'Open 7 days', text: 'Book any open time from 7 AM to 7 PM.' },
    ],
    faqs: [
      FAQ_SIZE,
      { q: 'Do you clean the third row?', a: 'Yes. The whole interior is detailed, every row included. The Premium Detail adds deep carpet cleaning, cloth and carpet extraction and full interior shampooing.' },
      { q: 'Can you hand wash a truck?', a: 'Yes. Add the Exterior Wash to either detail for $50: a hand wash, detailed rim cleaning, tire scrub and degrease, door jamb and panel wipe-down, tire shine and a spot-free hand dry.' },
      FAQ_WATER,
      FAQ_SOON,
    ],
    service: { type: 'SUV and truck detailing', offers: DETAIL_OFFERS },
  },
];

function cityPage({ slug, city, description, lede, intro, photo, localH2, localText, spots, spotsLabel = 'Neighborhoods we cover', faqs }) {
  return {
    path: `/mobile-car-detailing-${slug}`,
    kind: 'city',
    nav: city,
    city,
    title: fitTitle('Mobile Car Detailing', city),
    description,
    eyebrow: `Mobile detailing · ${city}, CA`,
    h1: ['Mobile car detailing', `in ${city}.`],
    lede,
    facts: ['Interior from $150', 'Hand wash add-on, +$50', 'Open 7 days, 7 AM–7 PM'],
    card: 'premium',
    photo,
    intro,
    points: [
      { title: `At your door in ${city}`, text: 'Home, office or garage, with our own water, power and equipment.' },
      { title: 'Same price, any size', text: 'Sedans, SUVs, trucks and vans all pay the same.' },
      { title: 'Pay your way', text: 'Prepay online with code PREPAY and save $15, or pay after the job.' },
    ],
    local: { h2: localH2, text: localText, spots, spotsLabel, map: `${city}, CA` },
    faqs: [...faqs, FAQ_PACKAGES, FAQ_WATER, FAQ_SOON],
    service: { type: 'Mobile car detailing', offers: DETAIL_OFFERS },
  };
}

export const CITY_PAGES = [
  cityPage({
    slug: 'dana-point',
    city: 'Dana Point',
    description: 'Mobile car detailing in Dana Point, CA. Interior details from $150, shampoo and extraction for $200, plus a $50 hand wash add-on. Book online.',
    lede: 'Interior detailing at your Dana Point home, with an optional hand wash. Open 7 days, 7 AM to 7 PM.',
    photo: PHOTO.audi,
    intro: {
      h2: 'From the harbor to Capo Beach.',
      paras: [
        'Dana Point sits just down the hill from San Juan Capistrano. Beach days and harbor trips bring sand and salt air into the car, and we clean it up where you park.',
        'Choose the Basic Detail for triple-stage vacuuming, a complete interior surface wipe-down and floor mat cleaning, or the Premium Detail for shampoo, extraction and a UV-protectant coating.',
        'Add the Exterior Wash for $50 to hand wash the salt film off the body and shine the tires in the same visit.',
      ],
    },
    localH2: 'Coastal Dana Point, covered.',
    localText: 'We come to homes and condos across Dana Point, from Capistrano Beach and the Lantern District to Monarch Beach.',
    spots: ['Capistrano Beach', 'Lantern District', 'Dana Point Harbor area', 'Monarch Beach', 'Niguel Shores'],
    faqs: [
      { q: 'Can you get beach sand out of the carpet?', a: 'Triple-stage vacuuming pulls out loose sand on both details. For sand worked deep into the carpet, choose the Premium Detail with deep carpet cleaning and extraction.' },
    ],
  }),
  cityPage({
    slug: 'san-clemente',
    city: 'San Clemente',
    description: 'Mobile car detailing in San Clemente, CA. Interior details from $150 and a $50 hand wash add-on, done at your home. Book online, open 7 days.',
    lede: 'Interior detailing at your San Clemente home or office, with an optional hand wash. No drop-off, no waiting room.',
    photo: PHOTO.taillight,
    intro: {
      h2: 'Surf town, clean interior.',
      paras: [
        'San Clemente is a short drive south of San Juan Capistrano. Wetsuits, boards and sandy feet are tough on a cabin, and we take care of it at your home.',
        'The Basic Detail is triple-stage vacuuming, a complete interior surface wipe-down and floor mat cleaning. The Premium Detail adds dust elimination, interior windows, deep carpet cleaning, extraction, full shampooing and a UV-protectant coating.',
        'Add the Exterior Wash to either detail for $50: a hand wash, clean rims, tire shine and a spot-free hand dry.',
      ],
    },
    localH2: 'Talega to the pier.',
    localText: 'We detail cars at homes across San Clemente, from Talega and Forster Ranch to downtown and the beach neighborhoods.',
    spots: ['Talega', 'Forster Ranch', 'Downtown & Avenida Del Mar', 'Rancho San Clemente', 'Marblehead'],
    faqs: [
      { q: 'Do you come to San Clemente?', a: 'Yes. Book online and enter your San Clemente address. We bring our own water and power, so we just need room to work around the car.' },
    ],
  }),
  cityPage({
    slug: 'laguna-niguel',
    city: 'Laguna Niguel',
    description: 'Mobile car detailing in Laguna Niguel, CA. Interior details from $150, shampoo and extraction for $200, plus a $50 hand wash add-on. Book online.',
    lede: 'Interior detailing in your Laguna Niguel driveway, with an optional hand wash. Open 7 days, 7 AM to 7 PM.',
    photo: PHOTO.convertible,
    intro: {
      h2: 'Hillside homes, driveway detailing.',
      paras: [
        'Laguna Niguel borders San Juan Capistrano to the west. Sloped driveways and garages are fine for us, since we bring our own water and power.',
        'Pick the Basic Detail for triple-stage vacuuming, a complete interior surface wipe-down and floor mat cleaning, or the Premium Detail for shampoo, extraction and a UV-protectant coating.',
        'The Exterior Wash adds a hand wash, detailed rims and tire shine for $50, in the same visit.',
      ],
    },
    localH2: 'Across Laguna Niguel.',
    localText: 'We come to homes across Laguna Niguel, from Marina Hills and Rancho Niguel to Beacon Hill and Kite Hill.',
    spots: ['Marina Hills', 'Rancho Niguel', 'Beacon Hill', 'Kite Hill', 'Along Crown Valley Parkway'],
    faqs: [
      { q: 'Can you detail a car in a gated community?', a: 'Yes, as long as we can get in and park next to the car. Add the gate instructions when you book, or call us before the appointment.' },
    ],
  }),
  cityPage({
    slug: 'mission-viejo',
    city: 'Mission Viejo',
    description: 'Mobile car detailing in Mission Viejo, CA. Interior details from $150 and a $50 hand wash add-on, at your home or office. Book online, open 7 days.',
    lede: 'Interior detailing at your Mission Viejo home or office, with an optional hand wash. No shop, no waiting room.',
    photo: PHOTO.door,
    intro: {
      h2: 'Family cars, back to clean.',
      paras: [
        'Mission Viejo is just north of San Juan Capistrano. School runs, sports practice and road trips leave their mark on the cabin, and we reset it at your home.',
        'The Basic Detail is triple-stage vacuuming, a complete interior surface wipe-down and floor mat cleaning. The Premium Detail adds deep carpet cleaning, extraction, full shampooing and a UV-protectant coating.',
        'Add the Exterior Wash for $50 to have the outside hand-washed and the tires shined in the same visit.',
      ],
    },
    localH2: 'Around the lake and beyond.',
    localText: 'We detail cars at homes and offices across Mission Viejo, from Lake Mission Viejo to Pacific Hills and Casta del Sol.',
    spots: ['Lake Mission Viejo', 'Pacific Hills', 'Casta del Sol', 'Aegean Hills', 'Near The Shops at Mission Viejo'],
    faqs: [
      { q: 'Can you detail my car at work in Mission Viejo?', a: 'Yes, if we can park next to your car and the property allows it. We bring our own water and power.' },
    ],
  }),
  cityPage({
    slug: 'ladera-ranch',
    city: 'Ladera Ranch',
    description: 'Mobile car detailing in Ladera Ranch, CA. Interior details from $150, shampoo and extraction for $200, plus a $50 hand wash add-on. Book online.',
    lede: 'Interior detailing at your Ladera Ranch home, with an optional hand wash. Open 7 days, 7 AM to 7 PM.',
    photo: PHOTO.rig,
    intro: {
      h2: 'Next door, by appointment.',
      paras: [
        'Ladera Ranch sits right above San Juan Capistrano along Antonio Parkway. We work in your driveway or garage with our own water and power.',
        'Choose the Basic Detail for triple-stage vacuuming, a complete interior surface wipe-down and floor mat cleaning, or the Premium Detail for shampoo, extraction and a UV-protectant coating.',
        'Add the Exterior Wash for $50 to have the outside hand-washed in the same visit.',
      ],
    },
    localH2: 'Village to village.',
    localText: 'We come to homes across Ladera Ranch’s villages, from Covenant Hills to Terramor.',
    spots: ['Covenant Hills', 'Terramor', 'Township', 'Oak Knoll', 'Along Antonio Parkway'],
    spotsLabel: 'Areas we cover',
    faqs: [
      { q: 'Can you work in an HOA neighborhood?', a: 'Yes. We work in your driveway or garage. If your HOA has rules about service vehicles, check them or call us before the appointment.' },
    ],
  }),
];

export const LANDING_PAGES = [...SERVICE_PAGES, ...CITY_PAGES];

export function findLanding(pathname) {
  return LANDING_PAGES.find((p) => p.path === pathname);
}
