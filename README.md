# High End Car Detailing San Juan Capistrano

Vite + React booking site with a Cloudflare Worker (D1 bookings) and Stripe PaymentIntents.

| Item | Value |
|---|---|
| Phone | (949) 304-5373 |
| Location | San Juan Capistrano, CA |
| Source tag (D1) | `highend` |
| Booking ID prefix | `HECD-` |
| Worker name | `highend-detailing-worker` |
| Pages project | `high-end-car-detailing` |
| Slots | Hourly 7 AM – 7 PM, Mon–Sun, earliest slot = California time + 4 hrs |
| Coupon | `PREPAY` = $15 off (online prepay only) |

**Brand** (pulled from the brushed-chrome logo): Ink `#16181B`, Graphite `#24272B`, Gunmetal `#3A3F45`, Steel `#8E9499`, Silver `#C3C7CA`, Platinum `#E4E6E7`, Pearl `#F3F4F3`.
**Fonts:** Archivo Expanded (display), Michroma (eyebrows), Figtree (body).
**Layout:** centered-logo split nav · centered type hero with chrome-ringed arch photos · price-list tab service menu · dark before/after stage · chrome-rail timeline · staggered lookbook · photo CTA band · grayscale map service area · sticky-side FAQ · centered monument footer.

## 1. Worker (Cloudflare dashboard)

1. **Workers & Pages → Create → Worker** → name `highend-detailing-worker` → Deploy.
2. **Edit code** → paste `worker/highend-detailing-worker.js` → Deploy.
3. **Settings → Bindings → Add → D1 database** → variable name `DB` → pick the shared detailing-bookings database for the account you choose.
4. **Settings → Variables and Secrets → Add → Secret** `STRIPE_SECRET_KEY` = your `sk_live_…` / `sk_test_…`.
5. Optional: `ALLOWED_ORIGIN` (your site URL) and `ADMIN_TOKEN` (protects GET/PATCH `/api/bookings`).

Test: open `https://highend-detailing-worker.<subdomain>.workers.dev/api/slots?date=2026-10-01` → should return `{"booked":[]}`.
Payment works even before D1 is bound (the payment route skips the database).

## 2. Frontend env

Edit `.env.local`:

```
VITE_API_URL=https://highend-detailing-worker.<subdomain>.workers.dev
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

1. In Cloudflare: **Workers & Pages → Create → Pages → Direct Upload** → create project `high-end-car-detailing` (skip upload), or let the first Action run create it.
2. GitHub repo → **Settings → Secrets and variables → Actions** → add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` (and optionally `VITE_STRIPE_PUBLISHABLE_KEY`).
3. Every push to `main` builds and deploys via `.github/workflows/deploy.yml`.
4. `public/_redirects` handles SPA routes (`/book`, `/checkout`, `/confirmation`).

## Booking flow

1. Package (Basic $150 / Premium $200)  2. Exterior Wash add-on (+$50, tap to add)  3. Date & time  4. Your info → Checkout (PREPAY banner, order summary, coupon, Stripe Payment Element, "I'll pay later" link) → Confirmation.
Back / Total / Continue is a sticky bar at the bottom (fixed on mobile). Bookings save to D1 with `payment_status` `Paid` or `Pay Later`; price, coupon and Stripe ID are written to `notes`.

## Photos

Client photos are in `public/images`. Third-party business signage visible in two photos was cropped or cleaned out.
