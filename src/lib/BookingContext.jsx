import { createContext, useContext, useEffect, useState } from 'react'

const BookingContext = createContext(null)
const STORE = 'highend_booking_draft'

const EMPTY = {
  pkg: null,
  exterior: false,
  date: null,
  time: null,
  info: { name: '', phone: '', email: '', vehicle: '', address: '' },
  result: null
}

function load() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORE) || 'null')
    return saved ? { ...EMPTY, ...saved, info: { ...EMPTY.info, ...(saved.info || {}) } } : EMPTY
  } catch {
    return EMPTY
  }
}

export function BookingProvider({ children }) {
  const [draft, setDraft] = useState(load)

  useEffect(() => {
    try { sessionStorage.setItem(STORE, JSON.stringify(draft)) } catch { /* ignore */ }
  }, [draft])

  const update = (patch) => setDraft((d) => ({ ...d, ...patch }))
  const updateInfo = (patch) => setDraft((d) => ({ ...d, info: { ...d.info, ...patch } }))
  const reset = () => setDraft((d) => ({ ...EMPTY, result: d.result }))

  return (
    <BookingContext.Provider value={{ draft, update, updateInfo, reset }}>
      {children}
    </BookingContext.Provider>
  )
}

export const useBooking = () => useContext(BookingContext)
