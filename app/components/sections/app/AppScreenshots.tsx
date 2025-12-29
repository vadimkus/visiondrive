import Section from '../../common/Section'

export default function AppScreenshots() {
  return (
    <Section id="screenshots" background="gray">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto px-2">
        {[1, 2, 3].map((screenshotNum) => (
          <div key={`screenshot-${screenshotNum}`} className="bg-white rounded-lg overflow-hidden shadow-sm">
            <div className="aspect-[9/16] bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
              <span className="text-2xl sm:text-3xl">📱</span>
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}

