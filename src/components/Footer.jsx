import { Link } from 'react-router-dom'
import { Phone, MapPin, Clock, CalendarCheck, Star } from 'lucide-react'
import { BUSINESS, GOOGLE_PROFILE_URL } from '../data/business'
import { SERVICE_PAGES, CITY_PAGES, HOME_CITY } from '../lib/pages'

export default function Footer({ slim }) {
  const year = new Date().getFullYear()

  if (slim) {
    return (
      <footer className="footer footer--slim">
        <p>© {year} {BUSINESS.fullName} · <a href={BUSINESS.phoneHref}>{BUSINESS.phone}</a></p>
      </footer>
    )
  }

  return (
    <footer className="footer">
      <div className="footer-sheen" aria-hidden="true" />
      <div className="container footer-inner">
        <img className="footer-logo" src="/images/logo.png" alt={BUSINESS.fullName} width="560" height="355" loading="lazy" />
        <p className="footer-tag">Mobile interior &amp; exterior detailing — we come to your home, office or garage.</p>

        <div className="footer-plates">
          <a href={BUSINESS.phoneHref} className="footer-plate">
            <Phone size={18} />
            <span className="footer-plate-label">Call or text</span>
            <strong>{BUSINESS.phone}</strong>
          </a>
          <div className="footer-plate">
            <Clock size={18} />
            <span className="footer-plate-label">Hours</span>
            <strong>{BUSINESS.hours}</strong>
          </div>
          <div className="footer-plate">
            <MapPin size={18} />
            <span className="footer-plate-label">Based in</span>
            <strong>{BUSINESS.address}</strong>
          </div>
        </div>

        <nav className="footer-links" aria-label="Footer">
          <a href="/#services">Services</a>
          <a href="/#results">Before &amp; After</a>
          <a href="/#process">How It Works</a>
          <a href="/#gallery">Gallery</a>
          <a href="/#area">Service Area</a>
          <a href="/#faq">FAQ</a>
          <Link to="/book" className="footer-book"><CalendarCheck size={15} /> Book Online</Link>
        </nav>

        <div className="footer-rows">
          <nav aria-label="Services">
            <span>Services</span>
            {SERVICE_PAGES.map((p) => <Link key={p.path} to={p.path}>{p.nav}</Link>)}
          </nav>
          <nav aria-label="Areas">
            <span>Areas</span>
            <Link to="/">{HOME_CITY}</Link>
            {CITY_PAGES.map((p) => <Link key={p.path} to={p.path}>{p.city}</Link>)}
          </nav>
          <a className="footer-google" href={GOOGLE_PROFILE_URL} target="_blank" rel="noopener noreferrer">
            <Star size={15} /> Find us on Google
          </a>
        </div>

        <div className="footer-base">
          <span>© {year} {BUSINESS.fullName}. All rights reserved.</span>
          <span>Secure payments by Stripe</span>
        </div>
      </div>
    </footer>
  )
}
