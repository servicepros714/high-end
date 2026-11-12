import { Link } from 'react-router-dom'
import { Phone, CalendarCheck, MapPin, Plus, Minus } from 'lucide-react'
import { useState } from 'react'
import { BUSINESS, SERVICE_AREA, FAQS } from '../data/business'
import { CITY_PAGES } from '../lib/pages'

/* ---------- How it works: chrome-rail timeline ---------- */
const STEPS = [
  { n: '01', title: 'Book online', text: 'Pick your detail, add an exterior wash if you like, and choose any open time from 7 AM to 7 PM.' },
  { n: '02', title: 'We pull up', text: 'Your detailer arrives at your home, office or garage with our own water, power, equipment and products.' },
  { n: '03', title: 'The detail', text: 'Vacuuming, extraction, shampoo and wipe-downs done by hand — you carry on with your day.' },
  { n: '04', title: 'All done', text: 'Check out the finished car. Pay online in advance or after the job.' }
]

export function Process() {
  return (
    <section id="process" className="section process">
      <div className="container">
        <div className="process-head reveal">
          <p className="eyebrow">How It Works</p>
          <h2 className="h2">From booking to <span className="metal-text">spotless</span> in four steps.</h2>
        </div>
        <ol className="rail">
          {STEPS.map((s, i) => (
            <li key={s.n} className="rail-step reveal" style={{ transitionDelay: `${i * 90}ms` }}>
              <span className="rail-dot" aria-hidden="true" />
              <span className="rail-num">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ---------- Lookbook: staggered three-column gallery ---------- */
const LOOKS = [
  { src: '/images/foam-convertible.webp', cap: 'Snow-foam pre-wash', pos: '50% 55%' },
  { src: '/images/taillight.webp', cap: 'Contact-safe hand wash', pos: '50% 45%' },
  { src: '/images/door-after.webp', cap: 'Interior trim reset', pos: '70% 50%' },
  { src: '/images/mobile-rig.webp', cap: 'Mobile rig on site', pos: '40% 50%' },
  { src: '/images/seat-after.webp', cap: 'Seat cleaning', pos: '50% 55%' },
  { src: '/images/foam-audi.webp', cap: 'Driveway exterior wash', pos: '30% 60%' }
]

export function Lookbook() {
  const cols = [[LOOKS[0], LOOKS[3]], [LOOKS[1], LOOKS[4]], [LOOKS[2], LOOKS[5]]]
  return (
    <section id="gallery" className="section lookbook">
      <div className="container">
        <div className="lookbook-head reveal">
          <div>
            <p className="eyebrow">The Lookbook</p>
            <h2 className="h2">Recent work around <span className="muted">South County.</span></h2>
          </div>
          <Link to="/book" className="btn btn-outline">Reserve your slot</Link>
        </div>
        <div className="lookbook-grid">
          {cols.map((col, ci) => (
            <div key={ci} className={`lookbook-col lookbook-col--${ci + 1}`}>
              {col.map((l) => (
                <figure key={l.src} className="look reveal">
                  <img src={l.src} alt={l.cap} style={{ objectPosition: l.pos }} loading="lazy" />
                  <figcaption>{l.cap}</figcaption>
                </figure>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- CTA band ---------- */
export function CtaBand() {
  return (
    <section className="cta-band">
      <img src="/images/taillight.webp" alt="" aria-hidden="true" className="cta-band-bg" loading="lazy" />
      <div className="container cta-band-inner reveal">
        <p className="eyebrow eyebrow--light">Open 7 days · by appointment</p>
        <h2 className="h2 h2--light">Your car, detailed <span className="metal-text">where it's parked.</span></h2>
        <p className="cta-band-sub">Book online — prepay and save $15, or pay after the job.</p>
        <div className="cta-band-actions">
          <Link to="/book" className="btn btn-chrome btn-lg"><CalendarCheck size={19} /> Book Online</Link>
          <a href={BUSINESS.phoneHref} className="btn btn-outline-light btn-lg"><Phone size={18} /> Call {BUSINESS.phone}</a>
        </div>
      </div>
    </section>
  )
}

/* ---------- Service area ---------- */
export function ServiceArea() {
  return (
    <section id="area" className="section area">
      <div className="container area-grid">
        <div className="area-copy reveal">
          <p className="eyebrow">Service Area</p>
          <h2 className="h2">Based in San Juan Capistrano. <span className="muted">Serving South Orange County.</span></h2>
          <p className="lede">We bring the detail to you anywhere in and around San Juan Capistrano. Don't see your city? Call and ask.</p>
          <ul className="area-chips">
            {SERVICE_AREA.map((c) => {
              const page = CITY_PAGES.find((p) => p.city === c)
              return (
                <li key={c} className={page ? 'has-link' : undefined}>
                  <MapPin size={13} /> {page ? <Link to={page.path}>{c}</Link> : c}
                </li>
              )
            })}
          </ul>
        </div>
        <div className="area-map reveal">
          <iframe
            title="Map of San Juan Capistrano, CA"
            src="https://maps.google.com/maps?q=San%20Juan%20Capistrano%2C%20CA&z=12&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="area-map-card">
            <strong>{BUSINESS.fullName}</strong>
            <span>{BUSINESS.hours}</span>
            <a href={BUSINESS.phoneHref}>{BUSINESS.phone}</a>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- FAQ ----------
   Questions live in data/business.js (FAQS) and feed the FAQ schema too.
   Landing pages pass their own list and title. */

export function Faq({ faqs = FAQS, title = <>Good questions, <span className="muted">straight answers.</span></> }) {
  const [open, setOpen] = useState(0)
  return (
    <section id="faq" className="section faq">
      <div className="container faq-grid">
        <div className="faq-side reveal">
          <p className="eyebrow">FAQ</p>
          <h2 className="h2">{title}</h2>
          <div className="faq-call">
            <p>Still wondering about something?</p>
            <a href={BUSINESS.phoneHref} className="btn btn-graphite"><Phone size={17} /> {BUSINESS.phone}</a>
          </div>
        </div>
        <div className="faq-list reveal">
          {faqs.map((f, i) => {
            const isOpen = open === i
            return (
              <div key={f.q} className={`faq-item ${isOpen ? 'is-open' : ''}`}>
                <button className="faq-q" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? -1 : i)}>
                  <span>{f.q}</span>
                  {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                </button>
                <div className="faq-a"><div><p>{f.a}</p></div></div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
