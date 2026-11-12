export const BUSINESS = {
  name: 'High End Car Detailing',
  fullName: 'High End Car Detailing San Juan Capistrano',
  city: 'San Juan Capistrano',
  address: 'San Juan Capistrano, CA',
  phone: '(949) 304-5373',
  phoneHref: 'tel:+19493045373',
  hours: 'Mon–Sun by appointment',
  hoursDetail: '7:00 AM – 7:00 PM, 7 days',
  source: 'highend',
  idPrefix: 'HECD-'
}

// Canonical site address (no www). Every canonical tag, sitemap URL and schema URL uses this.
export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://highendcardetailing.site').replace(/\/$/, '')

// Google Business Profile. GOOGLE_PROFILE_URL is the share link people click;
// GOOGLE_PROFILE_ID is the stable profile URL used in schema (sameAs).
export const GOOGLE_PROFILE_URL = 'https://share.google/jbfJW7wkTPawtb8wD'
export const GOOGLE_PROFILE_ID = 'https://www.google.com/search?kgmid=/g/11ytfjz0mf'

export const PACKAGES = [
  {
    id: 'basic',
    name: 'Basic Detail',
    price: 150,
    tagline: 'The essential interior reset',
    duration: '≈ 1.5–2 hrs',
    features: [
      'Triple-Stage Vacuuming for Deep Debris Removal',
      'Complete Interior Surface Wipe-Down',
      'Floor Mat Cleaning & Restoration'
    ]
  },
  {
    id: 'premium',
    name: 'Premium Detail',
    price: 200,
    tagline: 'Full interior restoration, top to bottom',
    duration: '≈ 3–4 hrs',
    featured: true,
    features: [
      'Triple-Stage Vacuuming',
      'Cabin Application',
      'Dust Elimination',
      'Interior Window Cleaning',
      'Deep Carpet Cleaning',
      'Cloth & Carpet Extraction',
      'Full Interior Shampooing',
      'UV-Protectant Coating'
    ]
  }
]

export const EXTERIOR = {
  id: 'exterior',
  name: 'Exterior Wash',
  price: 50,
  tagline: 'Add a hand-washed exterior to any detail',
  features: [
    'Hand-Washed Exterior',
    'Detailed Rim Cleaning',
    'Tire Scrub and Degrease',
    'Door Jamb & Panel Wipe-Down',
    'Premium Tire Shine Application',
    'Spot-Free Hand Drying'
  ]
}

export const PREPAY_DISCOUNT = 15
export const COUPONS = { PREPAY: PREPAY_DISCOUNT }

// Appointment starts every 30 minutes, 7:00 AM – 7:00 PM (minutes after midnight)
export const SLOT_START = 7 * 60
export const SLOT_END = 19 * 60
export const SLOT_STEP = 30
export const LEAD_HOURS = 4 // earliest slot = now (California time) + 4 hours

export const SERVICE_AREA = [
  'San Juan Capistrano', 'Dana Point', 'Capistrano Beach', 'San Clemente',
  'Laguna Niguel', 'Mission Viejo', 'Ladera Ranch', 'Rancho Mission Viejo',
  'Laguna Hills', 'Laguna Beach', 'Aliso Viejo', 'Monarch Beach'
]

// Real customer reviews only, copied word for word from the Google Business Profile
// (newest first, first name + last initial; screen names as shown). Emoji left out.
// To add one: { name: 'Maria G.', text: '...' }, then commit and push.
export const REVIEWS = [
  { name: 'Judy M.', text: 'Booked for an interior stain removal. They did a great job' },
  { name: 'Ashley M.', text: 'Amazing service! Super nice and super helpful! Made sure that everything i needed was dealt with! Thank you again!' },
  { name: 'David T.', text: 'great service very detailed highly recommended company deserves their five stars.' },
  { name: 'L. B.', text: 'Came to them in desperate need and was in a rush, they took care of me no problem and the work was immaculate! Thanks again guys, definitely would recommend to anyone!' },
  { name: 'Royukusan', text: 'Got a thorough cleaning and detailed and my car felt fresh like I bought off the lot again. Really great people that work here' },
  { name: 'Andrew G.', text: 'the service and experience was high end. I love a clean car but hate doing it. friendly and fun staff' },
  { name: 'Jay', text: 'Very understanding , Proffesional, and also extremely reliable 10/10 would recommend' },
  { name: 'Haaris H.', text: 'Greater than I could have ever expected' },
  { name: 'Luciana V.', text: 'Very satisfied with their services. Highly recommended!' },
  { name: 'Jake F.', text: 'Great customer service and left everything fresh and clean' }
]

// Home page FAQ. Also used for the FAQPage schema on the home page, so only list
// questions that are shown on the page, and only confirmed facts.
export const FAQS = [
  { q: 'Do I need to provide water or power?', a: 'No. We bring our own water, power, equipment and products. We just need room to work around the car.' },
  { q: 'How long does a detail take?', a: 'A Basic Detail usually takes about 1.5–2 hours. A Premium Detail with full shampoo and extraction runs about 3–4 hours. Adding an Exterior Wash adds roughly 45 minutes.' },
  { q: 'Can I book only the Exterior Wash?', a: 'No. The Exterior Wash is a $50 add-on to the Basic or Premium Detail. Add it in step 2 of booking.' },
  { q: 'Do SUVs and trucks cost more?', a: 'No. Sedans, SUVs, trucks and vans all pay the same package price.' },
  { q: 'When do I pay?', a: 'Your choice. Prepay online at checkout and save $15 with code PREPAY, or choose pay later and settle up after the job.' },
  { q: 'How soon can I book?', a: 'Appointments start every 30 minutes from 7 AM to 7 PM, seven days a week. Same-day bookings need at least 4 hours\u2019 notice. For anything sooner, call us.' },
  { q: 'What if I need to reschedule?', a: 'Call or text us at (949) 304-5373 and we\u2019ll move your appointment to another open time.' },
  { q: 'Which areas do you serve?', a: 'San Juan Capistrano and South Orange County, including Dana Point, San Clemente, Laguna Niguel, Mission Viejo and Ladera Ranch. Enter your address when you book.' }
]

export function serviceLabel(pkgId, addExterior) {
  const pkg = PACKAGES.find((p) => p.id === pkgId)
  if (!pkg) return ''
  return addExterior ? `${pkg.name} + ${EXTERIOR.name}` : pkg.name
}

export function subtotal(pkgId, addExterior) {
  const pkg = PACKAGES.find((p) => p.id === pkgId)
  if (!pkg) return 0
  return pkg.price + (addExterior ? EXTERIOR.price : 0)
}
