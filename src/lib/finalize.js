import { createBooking } from './api'
import { serviceLabel, subtotal, COUPONS } from '../data/business'

export function priceFor(draft, coupon) {
  const base = subtotal(draft.pkg, draft.exterior)
  const discount = coupon && COUPONS[coupon] ? COUPONS[coupon] : 0
  return { base, discount, total: Math.max(0, base - discount) }
}

/** Persist the booking (D1 via Worker, local fallback) and return the result */
export async function finalizeBooking(draft, { paid, coupon, paymentIntentId }) {
  const { total, discount } = priceFor(draft, paid ? coupon : null)
  const noteParts = [`Total: $${total}`]
  if (discount) noteParts.push(`${coupon} -$${discount}`)
  if (paymentIntentId) noteParts.push(`Stripe ${paymentIntentId}`)

  const booking = {
    date: draft.date,
    time: draft.time,
    service: serviceLabel(draft.pkg, draft.exterior),
    name: draft.info.name.trim(),
    phone: draft.info.phone.trim(),
    email: draft.info.email.trim(),
    vehicle: draft.info.vehicle.trim(),
    address: draft.info.address.trim(),
    notes: noteParts.join(' · '),
    payment_status: paid ? 'Paid' : 'Pay Later'
  }
  const res = await createBooking(booking)
  return { ...booking, id: res.id, stored: res.stored, total }
}

export const isDraftComplete = (d) =>
  !!(d.pkg && d.date && d.time && d.info.name && d.info.phone && d.info.email && d.info.vehicle && d.info.address)
