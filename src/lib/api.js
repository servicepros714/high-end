import { BUSINESS } from '../data/business'
import { localBookedTimes, makeBookingId, saveLocalBooking } from './bookingDb'

const API = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

async function request(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  })
  const text = await res.text()
  let data = {}
  try { data = text ? JSON.parse(text) : {} } catch { data = { error: text } }
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
  return data
}

/** Times already taken for this site on a given date (e.g. ["9:00 AM"]) */
export async function getBookedTimes(date) {
  const local = localBookedTimes(date)
  if (!API) return local
  try {
    const data = await request(`/api/slots?date=${encodeURIComponent(date)}`)
    return Array.from(new Set([...(data.booked || []), ...local]))
  } catch {
    return local
  }
}

/**
 * Save a booking to D1 through the Worker. Falls back to local storage so the
 * customer still gets a confirmation. Returns { id, stored: 'server' | 'local' }.
 */
export async function createBooking(booking) {
  const payload = { ...booking, source: BUSINESS.source }
  if (API) {
    try {
      const data = await request('/api/bookings', { method: 'POST', body: JSON.stringify(payload) })
      saveLocalBooking({ ...payload, id: data.id })
      return { id: data.id, stored: 'server' }
    } catch (err) {
      if (/just booked|already booked/i.test(err.message)) throw err
    }
  }
  const id = makeBookingId()
  saveLocalBooking({ ...payload, id, status: 'Pending' })
  return { id, stored: 'local' }
}

/** Price is computed on the Worker from package + add-on + coupon */
export async function createPaymentIntent({ pkg, exterior, coupon, name, email, phone }) {
  if (!API) throw new Error('Online payment is not connected yet.')
  return request('/api/create-payment-intent', {
    method: 'POST',
    body: JSON.stringify({ package: pkg, exterior, coupon, name, email, phone })
  })
}
