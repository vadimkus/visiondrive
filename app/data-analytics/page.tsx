import AnalyticsHero from '../components/sections/analytics/AnalyticsHero'
import DataProducts from '../components/sections/analytics/DataProducts'
import BusinessIntelligence from '../components/sections/analytics/BusinessIntelligence'
import DashboardPreview from '../components/sections/analytics/DashboardPreview'
import DataSecurity from '../components/sections/analytics/DataSecurity'
import UseCases from '../components/sections/analytics/UseCases'
import PricingPackages from '../components/sections/analytics/PricingPackages'

export default function DataAnalyticsPage() {
  return (
    <>
      <AnalyticsHero />
      <DataProducts />
      <BusinessIntelligence />
      <DashboardPreview />
      <DataSecurity />
      <UseCases />
      <PricingPackages />
    </>
  )
}

