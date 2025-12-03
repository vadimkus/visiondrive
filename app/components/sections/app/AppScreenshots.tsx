import Section from '../../common/Section'

export default function AppScreenshots() {
  return (
    <Section id="screenshots" background="gray">
      <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm">
            <div className="aspect-[9/16] bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
              <span className="text-3xl">📱</span>
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}

