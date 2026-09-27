import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Phone, CalendarCheck } from 'lucide-react'
import { BUSINESS } from '../data/business'

// Mobile-only bar: slides in after the visitor scrolls past the hero
export default function MobileActionBar() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const hero = document.getElementById('hero')
      const limit = hero ? hero.offsetTop + hero.offsetHeight - 120 : 420
      setShow(window.scrollY > limit)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className={`action-bar ${show ? 'action-bar--show' : ''}`} role="region" aria-label="Quick actions">
      <a href={BUSINESS.phoneHref} className="btn btn-outline-light">
        <Phone size={18} /> Call Now
      </a>
      <Link to="/book" className="btn btn-chrome">
        <CalendarCheck size={18} /> Book Online
      </Link>
    </div>
  )
}
