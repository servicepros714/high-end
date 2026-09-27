// California-time aware date helpers (no external date library)
import { SLOT_START, SLOT_END, SLOT_STEP, LEAD_HOURS } from '../data/business'

const TZ = 'America/Los_Angeles'
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

/** Current wall-clock time in California as { y, m (0-11), d, h, min } */
export function californiaNow() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ, year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', hourCycle: 'h23'
  }).formatToParts(new Date())
  const get = (t) => Number(parts.find((p) => p.type === t).value)
  return { y: get('year'), m: get('month') - 1, d: get('day'), h: get('hour'), min: get('minute') }
}

export const toKey = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

export function parseKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return { y, m: m - 1, d }
}

export function todayKey() {
  const n = californiaNow()
  return toKey(n.y, n.m, n.d)
}

/** UTC-epoch representation of a wall-clock moment (used only for comparisons) */
const wallMs = (y, m, d, h = 0, min = 0) => Date.UTC(y, m, d, h, min)

/** Earliest bookable wall-clock moment (now in CA + lead time) */
function earliestMs() {
  const n = californiaNow()
  return wallMs(n.y, n.m, n.d, n.h, n.min) + LEAD_HOURS * 3600 * 1000
}

export function timeLabel(totalMin) {
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  const suffix = h >= 12 ? 'PM' : 'AM'
  const hr = h % 12 === 0 ? 12 : h % 12
  return `${hr}:${String(m).padStart(2, '0')} ${suffix}`
}

/** All slots for a date, each flagged if it is inside the lead window */
export function slotsForDate(key) {
  const { y, m, d } = parseKey(key)
  const min = earliestMs()
  const slots = []
  for (let t = SLOT_START; t <= SLOT_END; t += SLOT_STEP) {
    slots.push({
      minutes: t,
      label: timeLabel(t),
      tooSoon: wallMs(y, m, d, 0, t) < min
    })
  }
  return slots
}

export function dateHasOpenSlots(key) {
  return slotsForDate(key).some((s) => !s.tooSoon)
}

export function isPastDay(key) {
  const { y, m, d } = parseKey(key)
  const n = californiaNow()
  return wallMs(y, m, d) < wallMs(n.y, n.m, n.d)
}

export function monthMatrix(year, month) {
  const first = new Date(Date.UTC(year, month, 1)).getUTCDay()
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  const cells = []
  for (let i = 0; i < first; i++) cells.push(null)
  for (let d = 1; d <= days; d++) cells.push(toKey(year, month, d))
  while (cells.length % 7) cells.push(null)
  return cells
}

export function formatLong(key) {
  if (!key) return ''
  const { y, m, d } = parseKey(key)
  const dow = new Date(Date.UTC(y, m, d)).getUTCDay()
  return `${DAYS[dow]}, ${MONTHS[m]} ${d}, ${y}`
}

export function formatShort(key) {
  if (!key) return ''
  const { y, m, d } = parseKey(key)
  const dow = new Date(Date.UTC(y, m, d)).getUTCDay()
  return `${DAYS[dow].slice(0, 3)}, ${MONTHS[m].slice(0, 3)} ${d}`
}

export const monthName = (m) => MONTHS[m]
export const weekdayShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
