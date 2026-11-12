import { Link } from 'react-router-dom'
import { CalendarCheck, Check, Clock, MapPin, Phone } from 'lucide-react'
import { BUSINESS, PACKAGES, EXTERIOR } from '../data/business'
import { SERVICE_PAGES, CITY_PAGES, HOME_CITY } from '../lib/pages'
import ServiceMenu from '../components/ServiceMenu'
import { CtaBand, Faq } from '../components/Sections'
import useReveal from '../lib/useReveal'

// One template for every SEO landing page in src/lib/pages.js.

const [basic, premium] = PACKAGES

// Hero price card: a detail, or 'combo' = Premium Detail + Exterior Wash.
// The Exterior Wash is never shown as a product on its own.
function HeroCard({ page }) {
  const combo = page.card === 'combo'
  const pkg = combo ? premium : PACKAGES.find((p) => p.id === page.card)
  const name = combo ? `${premium.name} + ${EXTERIOR.name}` : pkg.name
  const price = combo ? premium.price + EXTERIOR.price : pkg.price
  const items = combo
    ? ['Everything in the Premium Detail', 'Full Interior Shampooing', 'UV-Protectant Coating', 'Hand-Washed Exterior', 'Rims, Tires & Tire Shine', 'Spot-Free Hand Drying']
    : pkg.features
  return (
    <aside className="svc svc--featured lp-card" aria-label={name}>
      <span className="svc-flag">{combo ? 'Inside + out' : 'Most complete'}</span>
      <p className="svc-kicker">{combo ? 'Full detail' : 'Interior package'}</p>
      <h2 className="svc-name">{name}</h2>
      <div className="svc-price">
        <span className="svc-price-num">${price}</span>
        <span className="svc-price-unit">/ flat</span>
      </div>
      <p className="svc-tag">{combo ? `$${premium.price} detail + $${EXTERIOR.price} hand wash` : pkg.tagline}</p>
      <ul className="svc-list">
        {items.map((f) => (
          <li key={f}><span className="tick"><Check size={13} strokeWidth={2.8} /></span>{f}</li>
        ))}
      </ul>
      <span className="svc-dur"><Clock size={14} /> {combo ? `${premium.duration} + ≈ 45 min` : pkg.duration}</span>
      <Link to="/book" className="btn btn-chrome btn-lg lp-card-btn">
        <CalendarCheck size={18} /> {combo ? 'Book Premium + wash' : `Book the ${pkg.name}`}
      </Link>
      <p className="lp-card-note">
        {combo
          ? `Or the Basic Detail + wash for $${basic.price + EXTERIOR.price}. Add the wash in step 2.`
          : 'Prepay online with code PREPAY and save $15, or pay after the job.'}
      </p>
    </aside>
  )
}

function Related({ page }) {
  const services = SERVICE_PAGES.filter((p) => p.path !== page.path)
  const areas = CITY_PAGES.filter((p) => p.path !== page.path)
  return (
    <section className="section lp-related" aria-label={`More from ${BUSINESS.name}`}>
      <div className="container lp-related-grid">
        <div>
          <h2 className="lp-related-title">More services</h2>
          <ul className="area-chips lp-chips">
            {services.map((p) => <li key={p.path}><Link to={p.path}>{p.nav}</Link></li>)}
            <li><a href="/#services">All prices</a></li>
          </ul>
        </div>
        <div>
          <h2 className="lp-related-title">Areas we serve</h2>
          <ul className="area-chips lp-chips">
            <li><Link to="/">{HOME_CITY}</Link></li>
            {areas.map((p) => <li key={p.path}><Link to={p.path}>{p.city}</Link></li>)}
          </ul>
        </div>
      </div>
    </section>
  )
}

export default function Landing({ page }) {
  useReveal()
  const { local, intro } = page
  const isCity = page.kind === 'city'
  return (
    <>
      <section id="hero" className="hero lp-hero">
        <div className="hero-brush" aria-hidden="true" />
        <div className="container lp-hero-grid">
          <div className="lp-hero-copy">
            <nav className="lp-crumbs" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{page.nav}</span>
            </nav>
            <p className="eyebrow">{page.eyebrow}</p>
            <h1 className="lp-title">
              {page.h1[0]} <span className="metal-text">{page.h1[1]}</span>
            </h1>
            <p className="hero-sub">{page.lede}</p>
            <div className="hero-ctas">
              <Link to="/book" className="btn btn-graphite btn-lg"><CalendarCheck size={19} /> Book Online</Link>
              <a href={BUSINESS.phoneHref} className="btn btn-outline btn-lg"><Phone size={18} /> {BUSINESS.phone}</a>
            </div>
            <ul className="lp-facts">
              {page.facts.map((f) => <li key={f}><Check size={15} strokeWidth={2.6} /> {f}</li>)}
            </ul>
          </div>
          <HeroCard page={page} />
        </div>
      </section>

      <section className="section lp-intro">
        <div className="container lp-intro-grid">
          <div>
            <p className="eyebrow">{isCity ? page.city : 'Overview'}</p>
            <h2 className="h2">{intro.h2}</h2>
            <div className="lp-prose">
              {intro.paras.map((p) => <p key={p}>{p}</p>)}
            </div>
          </div>
          {page.beforeAfter ? (
            <div className="lp-pair">
              <figure className="look">
                <img src={page.beforeAfter.before} alt={`Stained ${page.beforeAfter.alt} before cleaning`} loading="lazy" />
                <figcaption>Before</figcaption>
              </figure>
              <figure className="look">
                <img src={page.beforeAfter.after} alt={`The same ${page.beforeAfter.alt} after shampoo and extraction`} loading="lazy" />
                <figcaption>After</figcaption>
              </figure>
            </div>
          ) : (
            <figure className={`look lp-photo ${page.photo.portrait ? 'lp-photo--portrait' : ''}`}>
              <img src={page.photo.src} alt={page.photo.alt} loading="lazy" />
            </figure>
          )}
        </div>
      </section>

      <ServiceMenu
        title={isCity ? <>Flat prices <span className="muted">in {page.city}.</span></> : undefined}
        links={false}
      />

      <section className="section lp-points-section">
        <div className="container">
          <p className="eyebrow eyebrow--light">Why High End</p>
          <h2 className="h2 h2--light">{isCity ? <>Why book us <span className="muted">in {page.city}.</span></> : <>Why book <span className="muted">High End.</span></>}</h2>
          <ul className="lp-points">
            {page.points.map((pt) => (
              <li key={pt.title}>
                <h3>{pt.title}</h3>
                <p>{pt.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Faq faqs={page.faqs} title={<>{page.nav} <span className="muted">questions.</span></>} />

      {local && (
        <section className="section area">
          <div className="container area-grid">
            <div className="area-copy">
              <p className="eyebrow">Service area</p>
              <h2 className="h2">{local.h2}</h2>
              <p className="lede">{local.text}</p>
              <p className="lp-spots-label"><MapPin size={14} /> {local.spotsLabel}</p>
              <ul className="area-chips">
                {local.spots.map((s) => <li key={s}>{s}</li>)}
              </ul>
            </div>
            <div className="area-map">
              <iframe
                title={`Map of ${local.map}`}
                src={`https://maps.google.com/maps?q=${encodeURIComponent(local.map)}&z=12&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="area-map-card">
                <strong>{BUSINESS.fullName}</strong>
                <span>{BUSINESS.hoursDetail}</span>
                <a href={BUSINESS.phoneHref}>{BUSINESS.phone}</a>
              </div>
            </div>
          </div>
        </section>
      )}

      <Related page={page} />
      <CtaBand />
    </>
  )
}
