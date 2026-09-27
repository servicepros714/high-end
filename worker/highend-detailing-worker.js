/**
 * High End Car Detailing San Juan Capistrano — Cloudflare Worker
 * Worker name:  highend-detailing-worker
 * Source tag:   highend          Booking ID prefix: HECD-
 *
 * Dashboard setup (no CLI needed):
 *   1. Workers & Pages → Create → Worker → name it "highend-detailing-worker" → paste this file → Deploy
 *   2. Settings → Bindings → add D1 database → Variable name: DB → pick your shared detailing-bookings DB
 *   3. Settings → Variables and Secrets → add Secret STRIPE_SECRET_KEY = sk_live_... / sk_test_...
 *   4. (optional) ALLOWED_ORIGIN = https://your-site-domain  (defaults to *)
 *   5. (optional) ADMIN_TOKEN — if set, GET/PATCH /api/bookings require "Authorization: Bearer <token>"
 *
 * Routes
 *   GET   /api/slots?date=YYYY-MM-DD         → { booked: ["9:00 AM", ...] }   (source-scoped)
 *   POST  /api/bookings                      → { id }
 *   GET   /api/bookings?date=YYYY-MM-DD      → { bookings: [...] }             (source-scoped)
 *   PATCH /api/bookings/:id                  → { ok: true }
 *   POST  /api/create-payment-intent         → { clientSecret, amount }         (does NOT need D1)
 */

const SOURCE = 'highend'
const ID_PREFIX = 'HECD-'

// Server-side price table — the browser never decides the amount
const PACKAGES = { basic: { name: 'Basic Detail', price: 150 }, premium: { name: 'Premium Detail', price: 200 } }
const EXTERIOR = { name: 'Exterior Wash', price: 50 }
const COUPONS = { PREPAY: 15 }

// Every 30 minutes, 7:00 AM – 7:00 PM
const VALID_TIMES = []
for (let t = 7 * 60; t <= 19 * 60; t += 30) {
  const h = Math.floor(t / 60), m = t % 60
  VALID_TIMES.push(`${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`)
}

// Admin-dashboard compatibility: fields every Worker in the portfolio must accept on PATCH
const PATCHABLE = ['reschedule_date', 'reschedule_time', 'original_date', 'original_time', 'notes2', 'status', 'payment_status']

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    service TEXT,
    name TEXT,
    phone TEXT,
    email TEXT,
    vehicle TEXT,
    address TEXT,
    notes TEXT,
    source TEXT,
    created_at TEXT,
    status TEXT DEFAULT 'Pending',
    reschedule_date TEXT,
    reschedule_time TEXT,
    notes2 TEXT,
    original_date TEXT,
    original_time TEXT,
    payment_status TEXT
  )
`
const INDEX = `CREATE INDEX IF NOT EXISTS idx_bookings_source_date ON bookings (source, date)`

let schemaReady = false
async function ensureSchema(db) {
  if (schemaReady) return
  // D1 .exec() splits on newlines — flatten first to avoid "incomplete input"
  await db.exec(SCHEMA.replace(/\s+/g, ' ').trim())
  await db.exec(INDEX.replace(/\s+/g, ' ').trim())
  schemaReady = true
}

function corsHeaders(env) {
  return {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400'
  }
}

function json(env, data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(env) }
  })
}

const clean = (v, max = 300) => String(v ?? '').trim().slice(0, max)

function normalizePayment(v) {
  const s = String(v || '').toLowerCase().replace(/[\s_-]/g, '')
  return s === 'paid' ? 'Paid' : 'Pay Later'
}

function makeId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = crypto.getRandomValues(new Uint8Array(6))
  return ID_PREFIX + Array.from(bytes, (b) => chars[b % chars.length]).join('')
}

function isAuthorized(request, env) {
  if (!env.ADMIN_TOKEN) return true
  return request.headers.get('Authorization') === `Bearer ${env.ADMIN_TOKEN}`
}

// Slot taken = active booking at that (possibly rescheduled) date/time for THIS site only
const TAKEN_SQL = `
  SELECT COALESCE(NULLIF(reschedule_time, ''), time) AS t
  FROM bookings
  WHERE source = ?
    AND COALESCE(NULLIF(reschedule_date, ''), date) = ?
    AND (status IS NULL OR status NOT IN ('Cancelled', 'Canceled'))
`.replace(/\s+/g, ' ').trim()

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const path = url.pathname.replace(/\/+$/, '')
    const method = request.method

    if (method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(env) })

    // Payment never touches D1, so Stripe can be tested before the DB binding exists
    const needsDb = path !== '/api/create-payment-intent'

    try {
      if (needsDb && path.startsWith('/api/')) {
        if (!env.DB) return json(env, { error: 'Database not configured yet for this Worker.' }, 503)
        await ensureSchema(env.DB)
      }

      /* ---------- availability ---------- */
      if (path === '/api/slots' && method === 'GET') {
        const date = clean(url.searchParams.get('date'), 10)
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return json(env, { error: 'Invalid date' }, 400)
        const { results } = await env.DB.prepare(TAKEN_SQL).bind(SOURCE, date).all()
        return json(env, { booked: results.map((r) => r.t) })
      }

      /* ---------- create booking ---------- */
      if (path === '/api/bookings' && method === 'POST') {
        const b = await request.json().catch(() => ({}))
        const booking = {
          date: clean(b.date, 10),
          time: clean(b.time, 10),
          service: clean(b.service, 120),
          name: clean(b.name, 120),
          phone: clean(b.phone, 40),
          email: clean(b.email, 160),
          vehicle: clean(b.vehicle, 160),
          address: clean(b.address, 300),
          notes: clean(b.notes, 500),
          payment_status: normalizePayment(b.payment_status)
        }
        const missing = ['date', 'time', 'service', 'name', 'phone', 'email', 'vehicle', 'address'].filter((k) => !booking[k])
        if (missing.length) return json(env, { error: `Missing: ${missing.join(', ')}` }, 400)
        if (!/^\d{4}-\d{2}-\d{2}$/.test(booking.date)) return json(env, { error: 'Invalid date' }, 400)
        if (!VALID_TIMES.includes(booking.time)) return json(env, { error: 'Invalid time' }, 400)

        const taken = await env.DB.prepare(TAKEN_SQL).bind(SOURCE, booking.date).all()
        if (taken.results.some((r) => r.t === booking.time)) {
          return json(env, { error: 'That time was just booked — please pick another slot.' }, 409)
        }

        const id = makeId()
        await env.DB.prepare(
          `INSERT INTO bookings (id, date, time, service, name, phone, email, vehicle, address, notes, source, created_at, status, reschedule_date, reschedule_time, notes2, original_date, original_time, payment_status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', NULL, NULL, NULL, NULL, NULL, ?)`.replace(/\s+/g, ' ')
        ).bind(
          id, booking.date, booking.time, booking.service, booking.name, booking.phone, booking.email,
          booking.vehicle, booking.address, booking.notes, SOURCE, new Date().toISOString(), booking.payment_status
        ).run()

        return json(env, { id }, 201)
      }

      /* ---------- list bookings (admin) ---------- */
      if (path === '/api/bookings' && method === 'GET') {
        if (!isAuthorized(request, env)) return json(env, { error: 'Unauthorized' }, 401)
        const date = url.searchParams.get('date')
        const stmt = date
          ? env.DB.prepare('SELECT * FROM bookings WHERE source = ? AND date = ? ORDER BY date, time').bind(SOURCE, clean(date, 10))
          : env.DB.prepare('SELECT * FROM bookings WHERE source = ? ORDER BY date DESC, time LIMIT 500').bind(SOURCE)
        const { results } = await stmt.all()
        return json(env, { bookings: results })
      }

      /* ---------- update booking (admin) ---------- */
      const m = path.match(/^\/api\/bookings\/([A-Za-z0-9-]+)$/)
      if (m && method === 'PATCH') {
        if (!isAuthorized(request, env)) return json(env, { error: 'Unauthorized' }, 401)
        const body = await request.json().catch(() => ({}))
        const fields = PATCHABLE.filter((k) => k in body)
        if (!fields.length) return json(env, { error: 'Nothing to update' }, 400)
        const values = fields.map((k) => (k === 'payment_status' ? normalizePayment(body[k]) : body[k] === null ? null : clean(body[k], 500)))
        const sets = fields.map((k) => `${k} = ?`).join(', ')
        const res = await env.DB.prepare(`UPDATE bookings SET ${sets} WHERE id = ? AND source = ?`).bind(...values, m[1], SOURCE).run()
        if (!res.meta || res.meta.changes === 0) return json(env, { error: 'Booking not found' }, 404)
        return json(env, { ok: true })
      }

      /* ---------- Stripe PaymentIntent ---------- */
      if (path === '/api/create-payment-intent' && method === 'POST') {
        if (!env.STRIPE_SECRET_KEY) return json(env, { error: 'Stripe is not configured' }, 503)
        const b = await request.json().catch(() => ({}))
        const pkg = PACKAGES[b.package]
        if (!pkg) return json(env, { error: 'Unknown package' }, 400)
        const coupon = clean(b.coupon, 20).toUpperCase()
        const discount = COUPONS[coupon] || 0
        const total = pkg.price + (b.exterior ? EXTERIOR.price : 0) - discount
        const service = b.exterior ? `${pkg.name} + ${EXTERIOR.name}` : pkg.name

        const form = new URLSearchParams()
        form.append('amount', String(Math.round(total * 100)))
        form.append('currency', 'usd')
        form.append('automatic_payment_methods[enabled]', 'true')
        form.append('description', `High End Car Detailing — ${service}`)
        form.append('metadata[source]', SOURCE)
        form.append('metadata[service]', service)
        if (coupon && discount) form.append('metadata[coupon]', coupon)
        if (b.name) form.append('metadata[name]', clean(b.name, 120))
        if (b.phone) form.append('metadata[phone]', clean(b.phone, 40))
        if (b.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email)) form.append('receipt_email', clean(b.email, 160))

        const res = await fetch('https://api.stripe.com/v1/payment_intents', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: form.toString()
        })
        const data = await res.json()
        if (!res.ok) return json(env, { error: data?.error?.message || 'Stripe error' }, 502)
        return json(env, { clientSecret: data.client_secret, amount: total })
      }

      if (path === '' || path === '/') return json(env, { ok: true, service: 'highend-detailing-worker' })
      return json(env, { error: 'Not found' }, 404)
    } catch (err) {
      return json(env, { error: err?.message || 'Server error' }, 500)
    }
  }
}
