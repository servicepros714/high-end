import { Link } from 'react-router-dom'
import { Phone, CalendarCheck, MapPin, Plus, Minus } from 'lucide-react'
import { useState } from 'react'
import { BUSINESS, SERVICE_AREA } from '../data/business'

/* ---------- How it works: chrome-rail timeline ---------- */
const STEPS = [
  { n: '01', title: 'Book online', text: 'Pick your detail, add an exterior wash if you like, and choose any open hour from 7 AM to 7 PM.' },
  { n: '02', title: 'We pull up', text: 'Your detailer arrives at your home, office or garage with the equipment and products needed for the job.' },
  { n: '03', title: 'The detail', text: 'Vacuuming, extraction, shampoo and wipe-downs done by hand — you carry on with your day.' },
  { n: '04', title: 'Walkthrough', text: 'We walk the car with you before we leave. Pay online in advance or after the job.' }
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
  { src: '/images/seat-after.webp', cap: 'Leather restoration', pos: '50% 55%' },
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
        <p className="cta-band-sub">Book online in under a minute — prepay and save $15, or pay after the job.</p>
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
          <p className="lede">We bring the detail to you anywhere in and around San Juan Capistrano. Don't see your city? Call — we can usually make it work.</p>
          <ul className="area-chips">
            {SERVICE_AREA.map((c) => (
              <li key={c}><MapPin size={13} /> {c}</li>
            ))}
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

/* ---------- FAQ ---------- */
const FAQS = [
  { q: 'Do I need to provide water or power?', a: 'Just let us know when you book if your location has limited access to water or an outlet (like an apartment garage). We\'ll confirm the setup with you before your appointment.' },
  { q: 'How long does a detail take?', a: 'A Basic Detail usually takes about 1.5–2 hours. A Premium Detail with full shampoo and extraction runs about 3–4 hours. Adding an Exterior Wash adds roughly 45 minutes.' },
  { q: 'Is the Exterior Wash available on its own?', a: 'The Exterior Wash is an add-on for $50 that pairs with either interior package. You can add it in step 2 of booking.' },
  { q: 'When do I pay?', a: 'Your choice. Prepay online with card, Apple Pay or Google Pay and save $15 with code PREPAY — or choose "pay later" and settle up after the job.' },
  { q: 'How soon can I book?', a: 'Appointments run every hour from 7 AM to 7 PM, seven days a week. The earliest online slot is four hours from now — for anything sooner, give us a call.' },
  { q: 'What if I need to reschedule?', a: 'Call or text us at (949) 304-5373 and we\'ll move your appointment to another open time.' }
]

export function Faq() {
  const [open, setOpen] = useState(0)
  return (
    <section id="faq" className="section faq">
      <div className="container faq-grid">
        <div className="faq-side reveal">
          <p className="eyebrow">FAQ</p>
          <h2 className="h2">Good questions, <span className="muted">straight answers.</span></h2>
          <div className="faq-call">
            <p>Still wondering about something?</p>
            <a href={BUSINESS.phoneHref} className="btn btn-graphite"><Phone size={17} /> {BUSINESS.phone}</a>
          </div>
        </div>
        <div className="faq-list reveal">
          {FAQS.map((f, i) => {
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
