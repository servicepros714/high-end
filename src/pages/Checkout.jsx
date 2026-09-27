import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import toast from 'react-hot-toast'
import { ArrowLeft, Lock, Tag, BadgePercent, Loader2, Check, X } from 'lucide-react'
import { useBooking } from '../lib/BookingContext'
import { createPaymentIntent } from '../lib/api'
import { finalizeBooking, isDraftComplete, priceFor } from '../lib/finalize'
import { formatLong } from '../lib/dates'
import { COUPONS, PREPAY_DISCOUNT, serviceLabel } from '../data/business'

const PK = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''
const stripeReady = PK.startsWith('pk_') && !PK.includes('REPLACE')
const stripePromise = stripeReady ? loadStripe(PK) : null

const appearance = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#24272B',
    colorText: '#16181B',
    colorTextSecondary: '#5B6166',
    colorBackground: '#FFFFFF',
    colorDanger: '#B3261E',
    borderRadius: '10px',
    fontFamily: 'Figtree, system-ui, sans-serif',
    spacingUnit: '4px'
  },
  rules: {
    '.Input': { border: '1px solid #D5D8DA', boxShadow: 'none' },
    '.Input:focus': { border: '1px solid #24272B', boxShadow: '0 0 0 3px rgba(36,39,43,.12)' },
    '.Tab': { border: '1px solid #D5D8DA' },
    '.Tab--selected': { border: '1px solid #24272B' }
  }
}

export default function Checkout() {
  const { draft, update, reset } = useBooking()
  const navigate = useNavigate()
  const [coupon, setCoupon] = useState(null)
  const [code, setCode] = useState('')
  const [clientSecret, setClientSecret] = useState(null)
  const [intentError, setIntentError] = useState(null)
  const [savingLater, setSavingLater] = useState(false)

  const complete = isDraftComplete(draft)
  const price = priceFor(draft, coupon)

  useEffect(() => {
    if (!complete || !stripeReady) return
    let live = true
    setClientSecret(null)
    setIntentError(null)
    createPaymentIntent({
      pkg: draft.pkg,
      exterior: draft.exterior,
      coupon,
      name: draft.info.name,
      email: draft.info.email,
      phone: draft.info.phone
    })
      .then((d) => { if (live) setClientSecret(d.clientSecret) })
      .catch((e) => { if (live) setIntentError(e.message) })
    return () => { live = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complete, coupon])

  const options = useMemo(() => (clientSecret ? { clientSecret, appearance } : null), [clientSecret])

  if (!complete && !draft.result) return <Navigate to="/book" replace />
  if (!complete) return <Navigate to="/confirmation" replace />

  const applyCode = (e) => {
    e.preventDefault()
    const c = code.trim().toUpperCase()
    if (!c) return toast.error('Enter a coupon code')
    if (!COUPONS[c]) return toast.error('That code isn\'t valid')
    setCoupon(c)
    toast.success(`${c} applied — $${COUPONS[c]} off`)
  }

  const payLater = async () => {
    setSavingLater(true)
    try {
      const result = await finalizeBooking(draft, { paid: false })
      update({ result })
      reset()
      navigate('/confirmation')
    } catch (e) {
      toast.error(e.message || 'Could not save your booking')
      setSavingLater(false)
    }
  }

  const onPaid = async (paymentIntentId) => {
    try {
      const result = await finalizeBooking(draft, { paid: true, coupon, paymentIntentId })
      update({ result })
      reset()
      navigate('/confirmation')
    } catch (e) {
      toast.error(`Payment received, but we couldn't save the booking — please call us. (${e.message})`)
    }
  }

  return (
    <div className="checkout">
      <div className="container checkout-single">
        <Link to="/book" className="checkout-back"><ArrowLeft size={16} /> Edit booking</Link>
        <p className="eyebrow checkout-eyebrow"><Lock size={13} /> Secure checkout</p>

        {!coupon && (
          <div className="prepay-banner">
            <BadgePercent size={22} />
            <div>
              <strong>Save ${PREPAY_DISCOUNT} when you prepay</strong>
              <span>Use code <b>PREPAY</b> below and pay online today.</span>
            </div>
          </div>
        )}

        <div className="order-card">
          <div className="order-row">
            <div>
              <span className="order-label">Service</span>
              <strong>{serviceLabel(draft.pkg, draft.exterior)}</strong>
              <span className="order-when">{formatLong(draft.date)} · {draft.time}</span>
            </div>
            <span className="order-amt">${price.base}</span>
          </div>
          {coupon && (
            <div className="order-row order-row--disc">
              <span><Tag size={14} /> {coupon}</span>
              <span>−${price.discount}</span>
            </div>
          )}
          <div className="order-row order-row--total">
            <span>Total</span>
            <strong>${price.total}</strong>
          </div>
        </div>

        {coupon ? (
          <div className="coupon-applied">
            <span><Check size={15} /> Code <b>{coupon}</b> applied</span>
            <button onClick={() => { setCoupon(null); setCode('') }} aria-label="Remove coupon"><X size={15} /></button>
          </div>
        ) : (
          <form className="coupon" onSubmit={applyCode}>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Coupon code"
              aria-label="Coupon code"
              autoCapitalize="characters"
            />
            <button className="btn btn-outline" type="submit">Apply</button>
          </form>
        )}

        <div className="pay-card">
          <h2 className="pay-title">Payment</h2>
          {!stripeReady && (
            <p className="pay-note">Online payment isn't connected yet. You can still reserve your time and pay after the job.</p>
          )}
          {stripeReady && intentError && (
            <p className="pay-note">We couldn't start online payment ({intentError}). You can still reserve and pay later.</p>
          )}
          {stripeReady && !intentError && !options && (
            <p className="pay-loading"><Loader2 size={17} className="spin" /> Loading secure payment…</p>
          )}
          {stripeReady && options && (
            <Elements stripe={stripePromise} options={options} key={clientSecret}>
              <PayForm total={price.total} email={draft.info.email} coupon={coupon} onPaid={onPaid} />
            </Elements>
          )}
        </div>

        <button className="paylater-link" onClick={payLater} disabled={savingLater}>
          {savingLater ? 'Saving your booking…' : 'I\'ll pay later — reserve without paying'}
        </button>
      </div>
    </div>
  )
}

function PayForm({ total, email, coupon, onPaid }) {
  const stripe = useStripe()
  const elements = useElements()
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setBusy(true)
    // Remember the coupon in case the payment method redirects away and back
    try { sessionStorage.setItem('highend_coupon', coupon || '') } catch { /* ignore */ }
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
      confirmParams: {
        return_url: `${window.location.origin}/confirmation`,
        receipt_email: email
      }
    })
    if (error) {
      toast.error(error.message || 'Payment failed')
      setBusy(false)
      return
    }
    if (paymentIntent && ['succeeded', 'processing', 'requires_capture'].includes(paymentIntent.status)) {
      await onPaid(paymentIntent.id)
    } else {
      toast.error('Payment was not completed')
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="pay-form">
      <PaymentElement options={{ layout: 'tabs' }} />
      <button className="btn btn-graphite btn-lg pay-btn" disabled={!stripe || busy}>
        {busy ? <><Loader2 size={18} className="spin" /> Processing…</> : <><Lock size={16} /> Pay ${total}</>}
      </button>
    </form>
  )
}
