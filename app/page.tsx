import Hero from './components/sections/Hero'
import CoreValue from './components/sections/CoreValue'
import HowItWorks from './components/sections/HowItWorks'
import FeaturedClients from './components/sections/FeaturedClients'
import CTASection from './components/sections/CTASection'

export default function HomePage() {
  return (
    <>
      <Hero />
      <CoreValue />
      <HowItWorks />
      <FeaturedClients />
      <CTASection />
    </>
  )
}

