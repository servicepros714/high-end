import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Hero from '../components/Hero'
import ServiceMenu from '../components/ServiceMenu'
import BeforeAfter from '../components/BeforeAfter'
import { Process, Lookbook, Reviews, CtaBand, ServiceArea, Faq } from '../components/Sections'
import useReveal from '../lib/useReveal'

export default function Home() {
  const { hash } = useLocation()
  useReveal()

  useEffect(() => {
    if (!hash) return
    const t = setTimeout(() => {
      const el = document.getElementById(hash.slice(1))
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 60)
    return () => clearTimeout(t)
  }, [hash])

  return (
    <>
      <Hero />
      <ServiceMenu />
      <BeforeAfter />
      <Process />
      <Lookbook />
      <Reviews />
      <CtaBand />
      <ServiceArea />
      <Faq />
    </>
  )
}
