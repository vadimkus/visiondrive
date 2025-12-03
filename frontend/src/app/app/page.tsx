import AppHero from '@/components/sections/app/AppHero'
import AppFeatures from '@/components/sections/app/AppFeatures'
import UserBenefits from '@/components/sections/app/UserBenefits'
import AppScreenshots from '@/components/sections/app/AppScreenshots'
import DownloadSection from '@/components/sections/app/DownloadSection'
import UserTestimonials from '@/components/sections/app/UserTestimonials'

export default function AppPage() {
  return (
    <>
      <AppHero />
      <AppFeatures />
      <UserBenefits />
      <AppScreenshots />
      <DownloadSection />
      <UserTestimonials />
    </>
  )
}

