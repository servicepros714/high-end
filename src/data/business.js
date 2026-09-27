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
