// Local fallback store — keeps a copy of every booking in the browser so the
// customer always reaches confirmation, even if the Worker is unreachable.
import { BUSINESS } from '../data/business'

const KEY = 'highend_bookings'

export function makeBookingId() {
  const stamp = Date.now().toString(36).slice(-5).toUpperCase()
  const rand = Math.random().toString(36).slice(2, 5).toUpperCase()
  return `${BUSINESS.idPrefix}${stamp}${rand}`
}

export function saveLocalBooking(booking) {
  try {
    const all = JSON.parse(localStorage.getItem(KEY) || '[]')
    all.push(booking)
    localStorage.setItem(KEY, JSON.stringify(all))
  } catch {
    /* storage unavailable — ignore */
  }
}

export function localBookedTimes(date) {
  try {
    const all = JSON.parse(localStorage.getItem(KEY) || '[]')
    return all.filter((b) => b.date === date && b.status !== 'Cancelled').map((b) => b.time)
  } catch {
    return []
  }
}
