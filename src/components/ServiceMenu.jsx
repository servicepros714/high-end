import { Link } from 'react-router-dom'
import { Check, Clock, ArrowRight } from 'lucide-react'
import { PACKAGES, EXTERIOR } from '../data/business'

const CARDS = [
  ...PACKAGES.map((p) => ({ ...p, kicker: 'Interior package', unit: 'flat' })),
  { ...EXTERIOR, kicker: 'Add-on · pairs with any detail', unit: 'add-on', addon: true, duration: '+ ≈ 45 min' }
]

export default function ServiceMenu() {
  return (
    <section id="services" className="section menu">
      <div className="container">
        <div className="menu-head reveal">
          <p className="eyebrow">The Service Menu</p>
          <h2 className="h2">Two interior details. <span className="muted">One exterior upgrade.</span></h2>
          <p className="lede">Flat, published pricing for sedans, SUVs and trucks alike. Choose your detail, then add a hand-washed exterior when you book.</p>
        </div>

        <div className="svc-grid">
          {CARDS.map((c, i) => (
            <article
              key={c.id}
              className={`svc reveal ${c.featured ? 'svc--featured' : ''}`}
              style={{ transitionDelay: `${i * 90}ms` }}
            >
              {c.featured && <span className="svc-flag">Most booked</span>}
              <p className="svc-kicker">{c.kicker}</p>
              <h3 className="svc-name">{c.name}</h3>
              <div className="svc-price">
                <span className="svc-price-num">{c.addon ? '+' : ''}${c.price}</span>
                <span className="svc-price-unit">/ {c.unit}</span>
              </div>
              <p className="svc-tag">{c.tagline}</p>
              <ul className="svc-list">
                {c.features.map((f) => (
                  <li key={f}><span className="tick"><Check size={13} strokeWidth={2.8} /></span>{f}</li>
                ))}
              </ul>
              <span className="svc-dur"><Clock size={14} /> {c.duration}</span>
            </article>
          ))}
        </div>

        <div className="svc-cta reveal">
          <Link to="/book" className="btn btn-graphite btn-lg">
            Book now <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  )
}