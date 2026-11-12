# High End Car Detailing San Juan Capistrano

Vite + React booking site with a Cloudflare Worker (D1 bookings) and Stripe PaymentIntents.

| Item | Value |
|---|---|
| Phone | (949) 304-5373 |
| Location | San Juan Capistrano, CA |
| Source tag (D1) | `highend` |
| Booking ID prefix | `HECD-` |
| Worker name | `highend-detailing-worker` |
| Cloudflare account | detailingmarketers2 (`5df257c170669d41c20367d89e7963d1`) |
| D1 database | `detailing-bookings-detailingmarketers2` (`4143248b-0d9b-4c96-b078-61772ba3597e`, region WNAM / California) |
| Pages project | `highend-car-detailing-v2` → https://highend-car-detailing-v2.pages.dev |
| Live domain | https://highendcardetailing.site (+ www), CNAME → the Pages project, attached 2026-10-23 |
| Slots | Hourly 7 AM – 7 PM, Mon–Sun, earliest slot = California time + 4 hrs |
| Coupon | `PREPAY` = $15 off (online prepay only) |

**Brand** (pulled from the brushed-chrome logo): Ink `#16181B`, Graphite `#24272B`, Gunmetal `#3A3F45`, Steel `#8E9499`, Silver `#C3C7CA`, Platinum `#E4E6E7`, Pearl `#F3F4F3`.
**Fonts:** Archivo Expanded (display), Michroma (eyebrows), Figtree (body).
**Layout:** centered-logo split nav · centered type hero with chrome-ringed arch photos · price-list tab service menu · dark before/after stage · chrome-rail timeline · staggered lookbook · photo CTA band · grayscale map service area · sticky-side FAQ · centered monument footer.

## 1. Worker (wrangler CLI — recommended)

`worker/wrangler.toml` already binds `DB` to `detailing-bookings-detailingmarketers2`. Make sure wrangler is logged in to the detailingmarketers2 account (`npx wrangler whoami`), then:

```
npx wrangler deploy --config worker/wrangler.toml
npx wrangler secret put STRIPE_SECRET_KEY --config worker/wrangler.toml   # paste sk_live_… / sk_test_…
```

`ALLOWED_ORIGIN` is set in `worker/wrangler.toml` `[vars]` (comma-separated: live domain, www, pages.dev, localhost:5173) so only the site can call the API from a browser. Optional: `npx wrangler secret put ADMIN_TOKEN --config worker/wrangler.toml` to protect GET/PATCH `/api/bookings`.

The deploy output prints the Worker URL (`https://highend-detailing-worker.<subdomain>.workers.dev`) — copy it into `.env.local` (step 2).

### Stripe webhook (`whsec_`)

The Worker exposes `POST /api/stripe-webhook`, which verifies the `Stripe-Signature` header (HMAC-SHA256, 5-minute replay window) and updates the matching booking's `payment_status` by `payment_intent_id`:

| Stripe event | `payment_status` set to |
|---|---|
| `payment_intent.succeeded` | `Paid` |
| `payment_intent.payment_failed` | `Incomplete` (never downgrades a booking already `Paid`) |
| `charge.refunded` | `Refunded`, or `Partially Refunded` for a partial refund |

PaymentIntents whose `metadata.source` is not `highend` are ignored, so the Stripe account can be shared with other sites. Stripe usually sends `payment_intent.succeeded` a moment before the browser saves the booking, so when no booking matches yet the Worker answers Stripe immediately and retries the update in the background after 3, 8 and 15 seconds. Checkout sends the PaymentIntent ID with the booking, stored in the `payment_intent_id` column.

Setup (repeat separately for test mode and live mode, each has its own `whsec_`):

1. Stripe Dashboard → **Developers → Webhooks → Add destination** (Workbench) → **Your account** → events `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded` → **Webhook endpoint** → URL `https://highend-detailing-worker.detailingmarketers2.workers.dev/api/stripe-webhook`.
2. Open the endpoint → reveal the **Signing secret** (`whsec_…`).
3. `npx wrangler secret put STRIPE_WEBHOOK_SECRET --config worker/wrangler.toml` and paste it. No redeploy needed.

### GoHighLevel email / SMS notifications

The Worker POSTs every new booking to a GHL **Inbound Webhook** when `GHL_WEBHOOK_URL` is set. Setup:

1. GHL → **Automation → Workflows → Create Workflow → Start from scratch**.
2. Add trigger **Inbound Webhook** → copy the webhook URL.
3. Set it on the Worker: `npx wrangler secret put GHL_WEBHOOK_URL --config worker/wrangler.toml`, then redeploy.
4. Make one test booking on the site, then back in the workflow trigger click **Fetch sample request** — the payload fields appear for mapping.
5. Add actions, e.g. **Create/Update Contact** (map `email`, `phone`, `first_name`, `last_name`), **Send Email** to the customer, and **Send Internal Notification** to the owner.

Payload matches the other portfolio sites (same GHL workflow works for all): `id`, `name`, `phone`, `email`, `service`, `date` (YYYY-MM-DD), `time` (e.g. `6:30 PM`), `source` (`highend`), `source_label` (`High End Car Detailing`), `vehicle`, `address`, `notes`, `payment_status` (`Paid` / `Pay Later`), `total` (number), `event_type` (`booking_confirmed`). Extras: `first_name`, `last_name`, `booking_id`, `status`, `created_at`, `business_phone`.
Webhook URL set 2026-10-23 as secret `GHL_WEBHOOK_URL`.
In GHL email templates reference them as `{{inboundWebhookRequest.booking_id}}`, `{{inboundWebhookRequest.date}}`, etc.
The call is fire-and-forget: if GHL is down the booking still saves and the customer still gets their confirmation page.

### Database schema

- `worker/schema.sql` — schema captured from the original shared `detailing-bookings` DB (previous account).
- `worker/adapt-detailingmarketers2.sql` — the migration applied on 2026-10-22 that rebuilt `bookings` in `detailing-bookings-detailingmarketers2` to match it (plus a `payment_intent_id` column with a unique index). The Worker's `ensureSchema` is a no-op against this table.

### Worker (Cloudflare dashboard alternative)

1. **Workers & Pages → Create → Worker** → name `highend-detailing-worker` → Deploy.
2. **Edit code** → paste `worker/highend-detailing-worker.js` → Deploy.
3. **Settings → Bindings → Add → D1 database** → variable name `DB` → pick `detailing-bookings-detailingmarketers2`.
4. **Settings → Variables and Secrets → Add → Secret** `STRIPE_SECRET_KEY` = your `sk_live_…` / `sk_test_…`.
5. Optional: `ALLOWED_ORIGIN` (your site URL) and `ADMIN_TOKEN` (protects GET/PATCH `/api/bookings`).

Test: open `https://highend-detailing-worker.detailingmarketers2.workers.dev/api/slots?date=2026-10-01` → should return `{"booked":[]}`.
Payment works even before D1 is bound (the payment route skips the database).

## 2. Frontend env

Edit `.env.local`:

```
VITE_API_URL=https://highend-detailing-worker.detailingmarketers2.workers.dev
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

(The publishable key must match the secret key's Stripe account and mode.)

## 3. Local run (Windows CMD)

```
cd high-end-car-detailing
npm install
npm run dev
```

## 4. GitHub → Cloudflare Pages

```
cd high-end-car-detailing
git init
git add .
git commit -m "High End Car Detailing site"
git branch -M main
git remote add origin https://github.com/servicepros714/high-end-car-detailing.git
git push -u origin main
```

1. In Cloudflare: **Workers & Pages → Create → Pages → Direct Upload** → create project `highend-car-detailing-v2` (already created on 2026-10-23; first deploy done via `npx wrangler pages deploy dist --project-name=highend-car-detailing-v2 --branch=main`), or let the first Action run create it.
2. GitHub repo → **Settings → Secrets and variables → Actions** → add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` (and optionally `VITE_STRIPE_PUBLISHABLE_KEY`).
3. Every push to `main` builds and deploys via `.github/workflows/deploy.yml`.
4. There is no `public/_redirects`: every page is a real HTML file (see SEO below), and
   unknown URLs get `dist/404.html` with a 404 status.

## SEO

- `npm run build` = `vite build` + an SSR build of `src/entry-server.jsx` + `scripts/prerender.js`.
  The prerender writes one static HTML file per route (home, landing pages, `/404`; the booking
  pages get head tags only), writes `sitemap.xml`, and **fails the build** if a title is over
  60 characters, a description over 160, or two pages share a title.
- `src/lib/seo.js`: titles, descriptions, canonical (non-www), Open Graph and JSON-LD schema
  (AutomotiveBusiness, FAQ, Service, breadcrumbs). `<Seo />` swaps them on client navigation.
- `src/lib/pages.js`: the service and city landing pages (data). `src/pages/Landing.jsx` renders them.
  Only confirmed facts go in there. The Exterior Wash is an add-on, never sold alone.
- `src/data/business.js`: `SITE_URL`, Google profile links and `FAQS` (home FAQ + schema).
- `public/robots.txt` points to the sitemap; `public/_headers` keeps `*.pages.dev` out of search.

## Booking flow

1. Package (Basic $150 / Premium $200)  2. Exterior Wash add-on (+$50, tap to add)  3. Date & time  4. Your info → Checkout (PREPAY banner, order summary, coupon, Stripe Payment Element, "I'll pay later" link) → Confirmation.
Back / Total / Continue is a sticky bar at the bottom (fixed on mobile). Bookings save to D1 with `payment_status` `Paid` or `Pay Later`; price, coupon and Stripe ID are written to `notes`.

The Worker only saves a booking as `Paid` after confirming with Stripe that the PaymentIntent went through, belongs to this site and matches the booked service. Anything else is saved as `Pay Later`. If Stripe can't be reached, the PaymentIntent stays linked so the webhook can still mark it `Paid`.

The total in `notes` and in the GoHighLevel payload is set by the Worker, never the browser: what Stripe charged for a `Paid` booking, otherwise the list price. Services it doesn't recognize are rejected. If you rename a package, update `PACKAGES` in `worker/highend-detailing-worker.js` too.

## Photos

Client photos are in `public/images`. Third-party business signage visible in two photos was cropped or cleaned out.

## Checkout payment methods

- PaymentIntents are created with `payment_method_types` = `card` + `link` only, so Cash App, Klarna and Affirm never appear. Apple Pay runs on `card`.
- Checkout shows Stripe's **Express Checkout** buttons first: Apple Pay and Link. Google Pay, PayPal, Amazon Pay and Klarna are switched off in the `paymentMethods` options in `src/pages/Checkout.jsx`.
- The card form is hidden behind "Pay with card instead". It opens automatically when the device has no Apple Pay or Link available.
- Apple Pay and Link buttons need both domains registered in Stripe (live mode): **Settings → Payment methods → Payment method domains** → add `highendcardetailing.site` and `www.highendcardetailing.site`.
