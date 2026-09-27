import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Check, ChevronLeft, ChevronRight, ArrowLeft, ArrowRight, Plus, Clock, Loader2, Droplets } from 'lucide-react'
import { PACKAGES, EXTERIOR, BUSINESS, subtotal, serviceLabel } from '../data/business'
import { useBooking } from '../lib/BookingContext'
import { getBookedTimes } from '../lib/api'
import {
  californiaNow, monthMatrix, monthName, weekdayShort, slotsForDate,
  dateHasOpenSlots, isPastDay, formatLong, todayKey
} from '../lib/dates'

const STEPS = ['Package', 'Exterior', 'Date & Time', 'Your Info']

const FIELDS = [
  { key: 'name', label: 'Full Name', type: 'text', auto: 'name', placeholder: 'Jordan Rivera' },
  { key: 'phone', label: 'Phone', type: 'tel', auto: 'tel', placeholder: '(949) 555-0123' },
  { key: 'email', label: 'Email', type: 'email', auto: 'email', placeholder: 'you@email.com' },
  { key: 'vehicle', label: 'Vehicle', type: 'text', auto: 'off', placeholder: 'Year Make Model — e.g. 2022 BMW X5' },
  { key: 'address', label: 'Service Address', type: 'text', auto: 'street-address', placeholder: 'Street, City, ZIP' }
]

function formatPhone(v) {
  const d = v.replace(/\D/g, '').slice(0, 10)
  if (d.length < 4) return d
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
}

export default function Book() {
  const { draft, update, updateInfo } = useBooking()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState({})
  const inputs = useRef({})

  useEffect(() => { window.scrollTo(0, 0) }, [step])

  const total = subtotal(draft.pkg, draft.exterior)

  const validateInfo = () => {
    const info = draft.info
    const errs = {}
    if (!info.name.trim()) errs.name = 'Please enter your full name'
    if (info.phone.replace(/\D/g, '').length !== 10) errs.phone = 'Please enter a 10-digit phone number'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(info.email.trim())) errs.email = 'Please enter a valid email address'
    if (!info.vehicle.trim()) errs.vehicle = 'Please enter your vehicle (Year Make Model)'
    if (!info.address.trim()) errs.address = 'Please enter the service address'
    setErrors(errs)
    const first = FIELDS.find((f) => errs[f.key])
    if (first) {
      toast.error(errs[first.key])
      const el = inputs.current[first.key]
      if (el) { el.focus(); el.scrollIntoView({ behavior: 'smooth', block: 'center' }) }
      return false
    }
    return true
  }

  const next = () => {
    if (step === 0 && !draft.pkg) return toast.error('Please choose a package to continue')
    if (step === 2) {
      if (!draft.date) return toast.error('Please pick a date')
      if (!draft.time) return toast.error('Please pick a time')
    }
    if (step === 3) {
      if (!validateInfo()) return
      navigate('/checkout')
      return
    }
    setStep((s) => s + 1)
  }

  const back = () => {
    if (step === 0) navigate('/')
    else setStep((s) => s - 1)
  }

  return (
    <div className="book">
      <div className="container book-wrap">
        <div className="book-head">
          <p className="eyebrow">Book your detail</p>
          <h1 className="book-title">{STEPS[step]}</h1>
          <ol className="progress" aria-label="Booking progress">
            {STEPS.map((s, i) => (
              <li key={s} className={`${i < step ? 'is-done' : ''} ${i === step ? 'is-current' : ''}`}>
                <span className="progress-bar" />
                <span className="progress-label"><em>{i + 1}</em><span>{s}</span></span>
              </li>
            ))}
          </ol>
        </div>

        <div className="book-body">
          {step === 0 && (
            <div className="pick-grid">
              {PACKAGES.map((p) => {
                const on = draft.pkg === p.id
                return (
                  <button key={p.id} className={`pick ${on ? 'is-on' : ''}`} onClick={() => update({ pkg: p.id })} aria-pressed={on}>
                    <span className="pick-check" aria-hidden="true">{on && <Check size={15} strokeWidth={3} />}</span>
                    {p.featured && <span className="pick-flag">Most booked</span>}
                    <span className="pick-name">{p.name}</span>
                    <span className="pick-price">${p.price}</span>
                    <span className="pick-tag">{p.tagline}</span>
                    <ul className="pick-list">
                      {p.features.map((f) => <li key={f}><Check size={13} strokeWidth={2.6} /> {f}</li>)}
                    </ul>
                    <span className="pick-dur"><Clock size={14} /> {p.duration}</span>
                  </button>
                )
              })}
            </div>
          )}

          {step === 1 && (
            <div className="addon-wrap">
              <p className="book-hint">Optional — tap to add a hand-washed exterior to your {PACKAGES.find((p) => p.id === draft.pkg)?.name}.</p>
              <button
                className={`addon ${draft.exterior ? 'is-on' : ''}`}
                onClick={() => update({ exterior: !draft.exterior })}
                aria-pressed={draft.exterior}
              >
                <span className="pick-check" aria-hidden="true">{draft.exterior && <Check size={15} strokeWidth={3} />}</span>
                <span className="addon-icon"><Droplets size={26} strokeWidth={1.6} /></span>
                <span className="addon-main">
                  <span className="addon-top">
                    <span className="pick-name">{EXTERIOR.name}</span>
                    <span className="addon-price">+${EXTERIOR.price}</span>
                  </span>
                  <span className="pick-tag">{EXTERIOR.tagline}</span>
                  <ul className="pick-list pick-list--two">
                    {EXTERIOR.features.map((f) => <li key={f}><Check size={13} strokeWidth={2.6} /> {f}</li>)}
                  </ul>
                  <span className={`addon-state ${draft.exterior ? 'is-on' : ''}`}>
                    {draft.exterior ? <><Check size={14} /> Added to your booking</> : <><Plus size={14} /> Tap to add</>}
                  </span>
                </span>
              </button>
            </div>
          )}

          {step === 2 && <DateTimeStep draft={draft} update={update} />}

          {step === 3 && (
            <form className="info-form" onSubmit={(e) => { e.preventDefault(); next() }} noValidate>
              <div className="info-recap">
                <span>{serviceLabel(draft.pkg, draft.exterior)}</span>
                <span>{formatLong(draft.date)} · {draft.time}</span>
              </div>
              {FIELDS.map((f) => (
                <label key={f.key} className={`field ${errors[f.key] ? 'has-error' : ''} ${f.key === 'address' || f.key === 'vehicle' ? 'field--wide' : ''}`}>
                  <span className="field-label">{f.label}</span>
                  <input
                    ref={(el) => { inputs.current[f.key] = el }}
                    type={f.type}
                    autoComplete={f.auto}
                    inputMode={f.key === 'phone' ? 'tel' : undefined}
                    placeholder={f.placeholder}
                    value={draft.info[f.key]}
                    onChange={(e) => {
                      const v = f.key === 'phone' ? formatPhone(e.target.value) : e.target.value
                      updateInfo({ [f.key]: v })
                      if (errors[f.key]) setErrors((er) => ({ ...er, [f.key]: undefined }))
                    }}
                  />
                  {errors[f.key] && <span className="field-error">{errors[f.key]}</span>}
                </label>
              ))}
              <button type="submit" hidden aria-hidden="true" />
            </form>
          )}
        </div>
      </div>

      <div className="step-bar">
        <div className="container step-bar-inner">
          <button className="btn btn-outline step-back" onClick={back}>
            <ArrowLeft size={17} /> {step === 0 ? 'Home' : 'Back'}
          </button>
          <div className="step-total">
            <span>Total</span>
            <strong>{total ? `$${total}` : '—'}</strong>
          </div>
          <button className="btn btn-graphite step-next" onClick={next}>
            {step === 3 ? 'Checkout' : 'Continue'} <ArrowRight size={17} />
          </button>
        </div>
      </div>
    </div>
  )
}

function DateTimeStep({ draft, update }) {
  const now = californiaNow()
  const [view, setView] = useState(() => {
    if (draft.date) { const [y, m] = draft.date.split('-').map(Number); return { y, m: m - 1 } }
    return { y: now.y, m: now.m }
  })
  const [booked, setBooked] = useState([])
  const [loading, setLoading] = useState(false)
  const cells = useMemo(() => monthMatrix(view.y, view.m), [view])
  const atCurrentMonth = view.y === now.y && view.m === now.m
  const maxMonths = 3
  const monthsAhead = (view.y - now.y) * 12 + (view.m - now.m)

  // Default to the first date with openings
  useEffect(() => {
    if (draft.date && !isPastDay(draft.date) && dateHasOpenSlots(draft.date)) return
    const t = todayKey()
    const pick = dateHasOpenSlots(t) ? t : (() => {
      const d = new Date(Date.UTC(now.y, now.m, now.d + 1))
      return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
    })()
    update({ date: pick, time: null })
    const [py, pm] = pick.split('-').map(Number)
    setView({ y: py, m: pm - 1 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!draft.date) return
    let live = true
    setLoading(true)
    getBookedTimes(draft.date).then((b) => { if (live) { setBooked(b); setLoading(false) } })
    return () => { live = false }
  }, [draft.date])

  const slots = draft.date ? slotsForDate(draft.date) : []

  const shift = (dir) => setView((v) => {
    const m = v.m + dir
    return { y: v.y + Math.floor(m / 12), m: ((m % 12) + 12) % 12 }
  })

  return (
    <div className="dt">
      <div className="cal">
        <div className="cal-head">
          <button className="cal-nav" onClick={() => shift(-1)} disabled={atCurrentMonth} aria-label="Previous month"><ChevronLeft size={18} /></button>
          <strong>{monthName(view.m)} {view.y}</strong>
          <button className="cal-nav" onClick={() => shift(1)} disabled={monthsAhead >= maxMonths} aria-label="Next month"><ChevronRight size={18} /></button>
        </div>
        <div className="cal-grid cal-grid--dow">
          {weekdayShort.map((d) => <span key={d}>{d.slice(0, 2)}</span>)}
        </div>
        <div className="cal-grid">
          {cells.map((key, i) => {
            if (!key) return <span key={`e${i}`} />
            const disabled = isPastDay(key) || !dateHasOpenSlots(key)
            const on = draft.date === key
            return (
              <button
                key={key}
                className={`cal-day ${on ? 'is-on' : ''} ${key === todayKey() ? 'is-today' : ''}`}
                disabled={disabled}
                onClick={() => update({ date: key, time: null })}
              >
                {Number(key.slice(-2))}
              </button>
            )
          })}
        </div>
        <p className="cal-foot">Open {BUSINESS.hours.toLowerCase()} · earliest online slot is 4 hours out</p>
      </div>

      <div className="times">
        <p className="times-date">{draft.date ? formatLong(draft.date) : 'Select a date'}</p>
        {loading ? (
          <p className="times-loading"><Loader2 size={16} className="spin" /> Checking availability…</p>
        ) : (
          <div className="times-grid">
            {slots.map((s) => {
              const taken = booked.includes(s.label)
              const disabled = s.tooSoon || taken
              const on = draft.time === s.label
              return (
                <button
                  key={s.label}
                  className={`time ${on ? 'is-on' : ''}`}
                  disabled={disabled}
                  onClick={() => update({ time: s.label })}
                >
                  {s.label}
                  {taken && !s.tooSoon && <small>Booked</small>}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
