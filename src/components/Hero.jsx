import { Link } from 'react-router-dom'
import { Phone, CalendarCheck, Truck, CalendarDays, ShieldCheck, Droplets } from 'lucide-react'
import { BUSINESS } from '../data/business'

const ARCHES = [
  { src: '/images/foam-audi.webp', alt: 'Sedan covered in pre-wash snow foam during a mobile detail', pos: '30% 60%' },
  { src: '/images/foam-convertible.webp', alt: 'Luxury convertible foamed up for a hand wash', pos: '50% 60%' },
  { src: '/images/mobile-rig.webp', alt: 'Fully equipped mobile detailing van parked beside a foamed car', pos: '40% 50%' }
]

const CREDS = [
  { icon: Truck, title: 'Fully mobile', text: 'We come to your driveway' },
  { icon: CalendarDays, title: '7 days a week', text: 'By appointment, 7 AM – 7 PM' },
  { icon: Droplets, title: 'Hand-finished', text: 'Microfiber & pro-grade products' },
  { icon: ShieldCheck, title: 'Flat pricing', text: 'No surprise upcharges' }
]

export default function Hero() {
  return (
    <section id="hero" className="hero">
      <div className="hero-brush" aria-hidden="true" />
      <div className="container hero-copy">
        <p className="eyebrow hero-eyebrow">
          <span className="spark" aria-hidden="true">✦</span> Mobile Detailing · {BUSINESS.city}
        </p>
        <h1 className="hero-title">
          Showroom <span className="metal-text">finish.</span>
          <br />
          Delivered to your driveway.
        </h1>
        <p className="hero-sub">
          Deep interior restoration and hand-washed exteriors for San Juan Capistrano drivers —
          flat pricing from $150, booked online in under a minute.
        </p>
        <div className="hero-ctas">
          <Link to="/book" className="btn btn-graphite btn-lg">
            <CalendarCheck size={19} /> Book Online
          </Link>
          <a href={BUSINESS.phoneHref} className="btn btn-outline btn-lg">
            <Phone size={18} /> {BUSINESS.phone}
          </a>
        </div>
      </div>

      <div className="hero-arches">
        {ARCHES.map((a, i) => (
          <figure key={a.src} className={`arch arch--${i + 1}`}>
            <img src={a.src} alt={a.alt} style={{ objectPosition: a.pos }} loading={i === 1 ? 'eager' : 'lazy'} />
          </figure>
        ))}
      </div>

      <div className="creds">
        <div className="container creds-grid">
          {CREDS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="cred">
              <Icon size={22} strokeWidth={1.6} />
              <div>
                <strong>{title}</strong>
                <span>{text}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
