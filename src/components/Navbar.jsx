import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Phone, Menu, X, ArrowLeft, CalendarCheck } from 'lucide-react'
import { BUSINESS } from '../data/business'

const LEFT = [
  { id: 'services', label: 'Services' },
  { id: 'results', label: 'Results' },
  { id: 'process', label: 'Process' }
]
const RIGHT = [
  { id: 'gallery', label: 'Gallery' },
  { id: 'area', label: 'Service Area' },
  { id: 'faq', label: 'FAQ' }
]

export default function Navbar({ compact }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const go = (id) => (e) => {
    e.preventDefault()
    setOpen(false)
    if (pathname !== '/') {
      navigate(`/#${id}`)
      return
    }
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (compact) {
    return (
      <header className="nav nav--compact">
        <div className="nav-compact-inner">
          <Link to="/" className="nav-back"><ArrowLeft size={16} /> <span>Home</span></Link>
          <Link to="/" className="nav-logo" aria-label={BUSINESS.fullName}>
            <img src="/images/logo.png" alt={BUSINESS.fullName} width="560" height="355" />
          </Link>
          <a href={BUSINESS.phoneHref} className="nav-phone-mini"><Phone size={15} /> <span>{BUSINESS.phone}</span></a>
        </div>
      </header>
    )
  }

  return (
    <>
      <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
        <div className="nav-inner">
          <nav className="nav-side nav-side--left" aria-label="Primary">
            {LEFT.map((l) => (
              <a key={l.id} href={`/#${l.id}`} onClick={go(l.id)}>{l.label}</a>
            ))}
          </nav>

          <Link to="/" className="nav-logo" aria-label={BUSINESS.fullName}>
            <img src="/images/logo.png" alt={BUSINESS.fullName} width="560" height="355" />
          </Link>

          <div className="nav-side nav-side--right">
            {RIGHT.map((l) => (
              <a key={l.id} href={`/#${l.id}`} onClick={go(l.id)} className="nav-link-desk">{l.label}</a>
            ))}
            <Link to="/book" className="btn btn-chrome btn-sm nav-book">Book Now</Link>
            <button
              className="nav-burger"
              onClick={() => setOpen((o) => !o)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      <div className={`mnav ${open ? 'mnav--open' : ''}`} aria-hidden={!open}>
        <div className="mnav-body">
          <p className="mnav-eyebrow">Menu</p>
          <ul className="mnav-links">
            {[...LEFT, ...RIGHT].map((l, i) => (
              <li key={l.id} style={{ transitionDelay: open ? `${80 + i * 45}ms` : '0ms' }}>
                <a href={`/#${l.id}`} onClick={go(l.id)} tabIndex={open ? 0 : -1}>
                  <span className="mnav-num">0{i + 1}</span>
                  <span>{l.label}</span>
                </a>
              </li>
            ))}
          </ul>
          <div className="mnav-meta">
            <p>{BUSINESS.hours}</p>
            <p>Mobile service · {BUSINESS.address}</p>
          </div>
        </div>
        <div className="mnav-actions">
          <a href={BUSINESS.phoneHref} className="btn btn-outline-light" tabIndex={open ? 0 : -1}>
            <Phone size={18} /> Call Now
          </a>
          <Link to="/book" className="btn btn-chrome" tabIndex={open ? 0 : -1}>
            <CalendarCheck size={18} /> Book Online
          </Link>
        </div>
      </div>
    </>
  )
}
