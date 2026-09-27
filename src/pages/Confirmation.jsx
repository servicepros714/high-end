import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Phone, CalendarDays, Car, MapPin, Loader2 } from 'lucide-react'
import { useBooking } from '../lib/BookingContext'
import { finalizeBooking, isDraftComplete } from '../lib/finalize'
import { formatLong } from '../lib/dates'
import { BUSINESS } from '../data/business'

export default function Confirmation() {
  const { draft, update, reset } = useBooking()
  const [params] = useSearchParams()
  const [finishing, setFinishing] = useState(false)
  const ran = useRef(false)

  // Returning from a redirect-based payment method (e.g. some wallets / bank methods)
  useEffect(() => {
    const pi = params.get('payment_intent')
    const status = params.get('redirect_status')
    if (ran.current || !pi || status !== 'succeeded' || !isDraftComplete(draft)) return
    ran.current = true
    setFinishing(true)
    let coupon = null
    try { coupon = sessionStorage.getItem('highend_coupon') || null } catch { /* ignore */ }
    finalizeBooking(draft, { paid: true, coupon, paymentIntentId: pi })
      .then((result) => { update({ result }); reset() })
      .finally(() => {
        setFinishing(false)
        window.history.replaceState(null, '', '/confirmation')
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const r = draft.result

  if (finishing) {
    return (
      <div className="confirm">
        <div className="container confirm-card"><p className="pay-loading"><Loader2 size={18} className="spin" /> Finalizing your booking…</p></div>
      </div>
    )
  }

  if (!r) {
    return (
      <div className="confirm">
        <div className="container confirm-card confirm-card--empty">
          <h1 className="confirm-title">No booking found</h1>
          <p>Start a new booking and it'll show up here.</p>
          <Link to="/book" className="btn btn-graphite">Book a detail</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="confirm">
      <div className="container confirm-card">
        <div className="confirm-badge"><CheckCircle2 size={34} strokeWidth={1.7} /></div>
        <p className="eyebrow">Booking {r.payment_status === 'Paid' ? 'confirmed & paid' : 'reserved'}</p>
        <h1 className="confirm-title">You're on the schedule, {r.name.split(' ')[0]}.</h1>
        <p className="confirm-id">Confirmation <strong>{r.id}</strong></p>

        <ul className="confirm-list">
          <li><CalendarDays size={18} /><span><em>When</em>{formatLong(r.date)} · {r.time}</span></li>
          <li><Car size={18} /><span><em>Service</em>{r.service} — {r.vehicle}</span></li>
          <li><MapPin size={18} /><span><em>Where</em>{r.address}</span></li>
        </ul>

        <div className={`confirm-pay ${r.payment_status === 'Paid' ? 'is-paid' : ''}`}>
          <span>{r.payment_status === 'Paid' ? 'Paid online' : 'Pay after service'}</span>
          <strong>${r.total}</strong>
        </div>

        <p className="confirm-note">
          We'll reach out at {r.phone} before your appointment. Need to change anything? Call or text us.
        </p>
        <div className="confirm-actions">
          <a href={BUSINESS.phoneHref} className="btn btn-outline"><Phone size={17} /> {BUSINESS.phone}</a>
          <Link to="/" className="btn btn-graphite">Back to home</Link>
        </div>
      </div>
    </div>
  )
}
