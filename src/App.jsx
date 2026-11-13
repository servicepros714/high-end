import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { BookingProvider } from './lib/BookingContext'
import Navbar from './components/Navbar'
import MobileActionBar from './components/MobileActionBar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Book from './pages/Book'
import Checkout from './pages/Checkout'
import Confirmation from './pages/Confirmation'
import NotFound from './pages/NotFound'
import Landing from './pages/Landing'
import Seo from './components/Seo'
import { LANDING_PAGES } from './lib/pages'

function ScrollToTop() {
  const { pathname } = useLocation()
  // 'instant': the page has smooth scrolling on, and a long smooth slide from the bottom
  // of the previous page gets interrupted (it would stop around the FAQ).
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }) }, [pathname])
  return null
}

const FLOW_ROUTES = ['/book', '/checkout', '/confirmation']

export default function App() {
  const { pathname } = useLocation()
  const inFlow = FLOW_ROUTES.includes(pathname)

  return (
    <BookingProvider>
      <Seo />
      <ScrollToTop />
      <Navbar compact={inFlow} />
      <main className={inFlow ? 'main-flow' : ''}>
        <Routes>
          <Route path="/" element={<Home />} />
          {LANDING_PAGES.map((p) => (
            <Route key={p.path} path={p.path} element={<Landing key={p.path} page={p} />} />
          ))}
          <Route path="/book" element={<Book />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!inFlow && <MobileActionBar />}
      <Footer slim={inFlow} />
      <Toaster
        position="top-center"
        toastOptions={{
          style: { background: '#16181B', color: '#F3F4F3', fontFamily: 'Figtree, sans-serif', fontSize: '14px', borderRadius: '10px' }
        }}
      />
    </BookingProvider>
  )
}
