/**
 * High End Car Detailing San Juan Capistrano — Cloudflare Worker
 * Worker name:  highend-detailing-worker
 * Source tag:   highend          Booking ID prefix: HECD-
 *
 * Dashboard setup (no CLI needed):
 *   1. Workers & Pages → Create → Worker → name it "highend-detailing-worker" → paste this file → Deploy
 *   2. Settings → Bindings → add D1 database → Variable name: DB → pick detailing-bookings-detailingmarketers2 (WNAM)
 *      (or skip the dashboard entirely: npx wrangler deploy --config worker/wrangler.toml — binding is preconfigured)
 *   3. Settings → Variables and Secrets → add Secret STRIPE_SECRET_KEY = sk_live_... / sk_test_...
 *   4. (optional) ALLOWED_ORIGIN = comma-separated list of allowed site origins (defaults to *). Set in worker/wrangler.toml [vars].
 *   5. (optional) ADMIN_TOKEN — if set, GET/PATCH /api/bookings require "Authorization: Bearer <token>"
 *   6. (optional) GHL_WEBHOOK_URL — GoHighLevel Workflow "Inbound Webhook" URL. Every new booking is POSTed
 *      there as JSON (see notifyGHL below) so a GHL workflow can create the contact + send email/SMS.
 *      Set via: npx wrangler secret put GHL_WEBHOOK_URL --config worker/wrangler.toml
 *   7. STRIPE_WEBHOOK_SECRET — the whsec_... signing secret of the Stripe webhook endpoint pointing at
 *      /api/stripe-webhook (events: payment_intent.succeeded, payment_intent.payment_failed, charge.refunded).
 *      Set via: npx wrangler secret put STRIPE_WEBHOOK_SECRET --config worker/wrangler.toml
 *
 * Routes
 *   GET   /api/slots?date=YYYY-MM-DD         → { booked: ["9:00 AM", ...] }   (source-scoped)
 *   POST  /api/bookings                      → { id }
 *   GET   /api/bookings?date=YYYY-MM-DD      → { bookings: [...] }             (source-scoped)
 *   PATCH /api/bookings/:id                  → { ok: true }
 *   POST  /api/create-payment-intent         → { clientSecret, amount }         (does NOT need D1)
 *   POST  /api/stripe-webhook                → { received: true }               (Stripe → Worker, signature-verified)
 */

const SOURCE = 'highend'
const ID_PREFIX = 'HECD-'

// Server-side price table — the browser never decides the amount
const PACKAGES = { basic: { name: 'Basic Detail', price: 150 }, premium: { name: 'Premium Detail', price: 200 } }
const EXTERIOR = { name: 'Exterior Wash', price: 50 }
const COUPONS = { PREPAY: 15 }

// PaymentIntent statuses that count as paid. Same list as the checkout page.
const PAID_STATUSES = ['succeeded', 'processing', 'requires_capture']

// What each service costs, by the exact label the site sends
const SERVICE_PRICES = new Map()
for (const pkg of Object.values(PACKAGES)) {
  SERVICE_PRICES.set(pkg.name, pkg.price)
  SERVICE_PRICES.set(`${pkg.name} + ${EXTERIOR.name}`, pkg.price + EXTERIOR.price)
}

// Same-day bookings need 4 hours' notice (California time); the booking page hides
// earlier slots (src/lib/dates.js LEAD_HOURS). Saving allows 1 hour less, so a customer who
// picked a slot at the edge of the window and took a while at checkout is not turned away.
const TIME_ZONE = 'America/Los_Angeles'
const SAVE_LEAD_MINUTES = 4 * 60 - 60

function californiaNow() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).formatToParts(new Date())
  const get = (t) => parts.find((p) => p.type === t).value
  return { date: `${get('year')}-${get('month')}-${get('day')}`, minutes: Number(get('hour')) * 60 + Number(get('minute')) }
}

function timeToMinutes(label) {
  const [t, period] = label.split(' ')
  const [h, m] = t.split(':').map(Number)
  return ((h % 12) + (period === 'PM' ? 12 : 0)) * 60 + m
}

// Error message when the date/time can't be booked any more, otherwise null
function tooLate(date, time) {
  const now = californiaNow()
  if (date < now.date) return 'That date has already passed. Please choose another day.'
  if (date === now.date && timeToMinutes(time) < now.minutes + SAVE_LEAD_MINUTES) {
    return "Same-day bookings need at least 4 hours' notice. Please choose a later time or another day."
  }
  return null
}

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
    payment_status TEXT,
    payment_intent_id TEXT
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

// ALLOWED_ORIGIN may be a comma-separated list; the matching request Origin is echoed back.
// Unset or "*" allows everything. A non-matching origin gets the first listed one (so the browser blocks it).
function corsHeaders(env) {
  const list = String(env.ALLOWED_ORIGIN || '*').split(',').map((s) => s.trim().replace(/\/$/, '')).filter(Boolean)
  const origin = env.REQUEST_ORIGIN || ''
  const allow = list.includes('*') ? '*' : (list.includes(origin) ? origin : list[0])
  return {
    'Access-Control-Allow-Origin': allow,
    'Vary': 'Origin',
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

/**
 * Fire-and-forget POST of a new booking to a GoHighLevel Inbound Webhook.
 * Never throws — a GHL outage must not break the customer's booking.
 * Field names are flat and snake_case so they map cleanly in the GHL workflow builder.
 */
async function notifyGHL(env, booking) {
  if (!env.GHL_WEBHOOK_URL) return
  const [first_name, ...rest] = booking.name.split(/\s+/)
  // Same shape as the other portfolio sites (e.g. aventa-anaheim) so one GHL workflow can serve them all
  const payload = {
    id: booking.id,
    name: booking.name,
    phone: booking.phone,
    email: booking.email,
    service: booking.service,
    date: booking.date,            // YYYY-MM-DD
    time: booking.time,            // e.g. "6:30 PM"
    source: SOURCE,
    source_label: 'High End Car Detailing',
    vehicle: booking.vehicle,
    address: booking.address,
    notes: booking.notes,
    payment_status: booking.payment_status,   // "Paid" | "Pay Later"
    total: booking.total,
    event_type: 'booking_confirmed',
    // extras (harmless if unmapped)
    first_name,
    last_name: rest.join(' '),
    booking_id: booking.id,
    status: 'Pending',
    created_at: booking.created_at,
    business_phone: '(949) 304-5373'
  }
  try {
    const res = await fetch(env.GHL_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!res.ok) console.error('GHL webhook failed', res.status, await res.text().catch(() => ''))
  } catch (err) {
    console.error('GHL webhook error', err?.message || err)
  }
}

/**
 * Decide a booking's payment status from Stripe itself: the browser saying "Paid" is never trusted.
 * Anything unproven is saved as Pay Later. A PaymentIntent that may still be real stays linked,
 * so the webhook can upgrade the booking if it did succeed (e.g. Stripe was unreachable here).
 */
async function verifyPayment(env, booking) {
  const unproven = (linked) => ({
    payment_status: 'Pay Later',
    payment_intent_id: linked ? booking.payment_intent_id : null
  })
  if (!booking.payment_intent_id) return unproven(false)

  let pi
  try {
    const res = await fetch(`https://api.stripe.com/v1/payment_intents/${booking.payment_intent_id}`, {
      headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` }
    })
    if (res.status === 404) return unproven(false)
    if (!res.ok) throw new Error(`Stripe responded ${res.status}`)
    pi = await res.json()
  } catch (err) {
    console.error('could not verify payment', booking.payment_intent_id, err?.message || err)
    return unproven(true)
  }

  if (pi.metadata?.source !== SOURCE || pi.metadata?.service !== booking.service) {
    console.warn('payment does not match booking', booking.payment_intent_id)
    return unproven(false)
  }
  if (!PAID_STATUSES.includes(pi.status)) return unproven(true)
  return { payment_status: 'Paid', payment_intent_id: pi.id, total: pi.amount / 100 }
}

/**
 * Verify a Stripe-Signature header ("t=...,v1=...,v1=...") against the raw body.
 * HMAC-SHA256 of `${t}.${body}` keyed with the whsec_ secret; 5-minute replay window.
 */
async function verifyStripeSignature(raw, header, secret, toleranceSec = 300) {
  if (!header) return false
  const parts = header.split(',').map((p) => p.split('='))
  const t = parts.find(([k]) => k === 't')?.[1]
  const sigs = parts.filter(([k]) => k === 'v1').map(([, v]) => v)
  if (!t || !sigs.length) return false
  if (Math.abs(Date.now() / 1000 - Number(t)) > toleranceSec) return false

  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(`${t}.${raw}`)))
  const expected = Array.from(mac, (b) => b.toString(16).padStart(2, '0')).join('')

  // Constant-time compare against each provided v1 signature
  return sigs.some((s) => {
    if (s.length !== expected.length) return false
    let diff = 0
    for (let i = 0; i < s.length; i++) diff |= s.charCodeAt(i) ^ expected.charCodeAt(i)
    return diff === 0
  })
}

export default {
  async fetch(request, baseEnv, ctx) {
    // Request-scoped view of env so CORS can see this request's Origin without touching the shared bindings object
    const env = Object.assign(Object.create(baseEnv), { REQUEST_ORIGIN: request.headers.get('Origin') || '' })
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
          payment_status: normalizePayment(b.payment_status),
          // Links the booking to its Stripe PaymentIntent so the webhook can find it later
          payment_intent_id: /^pi_[A-Za-z0-9]{10,64}$/.test(String(b.payment_intent_id || '')) ? b.payment_intent_id : null
        }
        const missing = ['date', 'time', 'service', 'name', 'phone', 'email', 'vehicle', 'address'].filter((k) => !booking[k])
        if (missing.length) return json(env, { error: `Missing: ${missing.join(', ')}` }, 400)
        if (!/^\d{4}-\d{2}-\d{2}$/.test(booking.date)) return json(env, { error: 'Invalid date' }, 400)
        if (!VALID_TIMES.includes(booking.time)) return json(env, { error: 'Invalid time' }, 400)
        if (!SERVICE_PRICES.has(booking.service)) return json(env, { error: 'Unknown service' }, 400)

        const taken = await env.DB.prepare(TAKEN_SQL).bind(SOURCE, booking.date).all()
        if (taken.results.some((r) => r.t === booking.time)) {
          return json(env, { error: 'That time was just booked — please pick another slot.' }, 409)
        }

        // The total is never taken from the browser: list price, or what Stripe actually charged
        booking.total = SERVICE_PRICES.get(booking.service)
        if (booking.payment_status === 'Paid') Object.assign(booking, await verifyPayment(env, booking))
        else booking.payment_intent_id = null

        // Pay-later bookings must respect the notice window. A booking backed by a Stripe
        // payment is never refused here: the customer has already paid.
        if (booking.payment_status !== 'Paid' && !booking.payment_intent_id) {
          const late = tooLate(booking.date, booking.time)
          if (late) return json(env, { error: late }, 400)
        }
        booking.notes = [`Total: $${booking.total}`, booking.notes.replace(/^Total:\s*\$?\d+(?:\.\d+)?\s*(?:·\s*)?/, '')].filter(Boolean).join(' · ')

        // One payment can only ever back one booking
        if (booking.payment_intent_id) {
          const used = await env.DB.prepare('SELECT id FROM bookings WHERE payment_intent_id = ?').bind(booking.payment_intent_id).first()
          if (used) return json(env, { error: 'That payment was already used for a booking.' }, 409)
        }

        const id = makeId()
        const created_at = new Date().toISOString()
        await env.DB.prepare(
          `INSERT INTO bookings (id, date, time, service, name, phone, email, vehicle, address, notes, source, created_at, status, reschedule_date, reschedule_time, notes2, original_date, original_time, payment_status, payment_intent_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', NULL, NULL, NULL, NULL, NULL, ?, ?)`.replace(/\s+/g, ' ')
        ).bind(
          id, booking.date, booking.time, booking.service, booking.name, booking.phone, booking.email,
          booking.vehicle, booking.address, booking.notes, SOURCE, created_at, booking.payment_status,
          booking.payment_intent_id
        ).run()

        // Notify GoHighLevel after the response is sent (does not delay or block the customer)
        ctx.waitUntil(notifyGHL(env, { ...booking, id, created_at }))

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
        // Card (Apple Pay rides on card) + Link only — keeps Cash App, Klarna, Affirm etc. off the checkout
        form.append('payment_method_types[]', 'card')
        form.append('payment_method_types[]', 'link')
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

      /* ---------- Stripe webhook (server-to-server, signed with whsec_) ---------- */
      if (path === '/api/stripe-webhook' && method === 'POST') {
        if (!env.STRIPE_WEBHOOK_SECRET) return json(env, { error: 'Webhook secret not configured' }, 503)
        const raw = await request.text()   // must be the exact raw body for the signature check
        const ok = await verifyStripeSignature(raw, request.headers.get('Stripe-Signature'), env.STRIPE_WEBHOOK_SECRET)
        if (!ok) return json(env, { error: 'Invalid signature' }, 400)

        let event
        try { event = JSON.parse(raw) } catch { return json(env, { error: 'Bad JSON' }, 400) }
        const obj = event?.data?.object || {}

        // Ignore PaymentIntents created by other sites that share this Stripe account
        const piSource = obj.object === 'payment_intent' ? obj.metadata?.source : null
        if (piSource && piSource !== SOURCE) return json(env, { received: true, ignored: 'other source' })

        let piId = null, newStatus = null
        if (event.type === 'payment_intent.succeeded') { piId = obj.id; newStatus = 'Paid' }
        else if (event.type === 'payment_intent.payment_failed') { piId = obj.id; newStatus = 'Incomplete' }
        else if (event.type === 'charge.refunded') {
          piId = obj.payment_intent
          newStatus = obj.amount_refunded >= obj.amount ? 'Refunded' : 'Partially Refunded'
        }

        let updated = 0
        if (piId && newStatus) {
          // A failed attempt must never downgrade a booking that is already Paid (customer may retry and succeed)
          const guard = newStatus === 'Incomplete' ? " AND payment_status <> 'Paid'" : ''
          const apply = async () => {
            const res = await env.DB.prepare(
              `UPDATE bookings SET payment_status = ? WHERE payment_intent_id = ? AND source = ?${guard}`
            ).bind(newStatus, piId, SOURCE).run()
            return res.meta?.changes || 0
          }
          updated = await apply()
          console.log('stripe webhook', event.type, piId, newStatus, 'rows:', updated)

          // Stripe usually fires payment_intent.succeeded a split second BEFORE the browser saves the booking.
          // Answer Stripe right away, then retry in the background (Workers allow ~30s of waitUntil work).
          if (updated === 0) {
            ctx.waitUntil((async () => {
              for (const delayMs of [3000, 8000, 15000]) {
                await new Promise((r) => setTimeout(r, delayMs))
                const n = await apply()
                console.log('stripe webhook retry', event.type, piId, newStatus, `after ${delayMs}ms rows:`, n)
                if (n > 0) return
              }
              console.log('stripe webhook gave up: no booking with', piId)
            })())
          }
        }
        return json(env, { received: true, type: event.type, updated })
      }

      if (path === '' || path === '/') return json(env, { ok: true, service: 'highend-detailing-worker' })
      return json(env, { error: 'Not found' }, 404)
    } catch (err) {
      return json(env, { error: err?.message || 'Server error' }, 500)
    }
  }
}
