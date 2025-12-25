import Section from '../components/common/Section'
import Button from '../components/common/Button'

const pillars = [
  {
    title: 'Make parking invisible',
    body: 'Reduce search time, automate access, and surface availability before drivers arrive.',
  },
  {
    title: 'Connect the ecosystem',
    body: 'Unify sensors, payments, enforcement, and analytics into a single reliable fabric.',
  },
  {
    title: 'Deliver trusted data',
    body: 'Actionable, real-time insights that help cities and operators plan confidently.',
  },
]

const commitments = [
  'Reliability first: uptime, accuracy, and support you can reach.',
  'Privacy by design: only the data required to operate and improve.',
  'Sustainable impact: less circling, lower congestion, and cleaner air.',
]

export default function MissionPage() {
  return (
    <main className="pt-24 bg-white text-gray-900">
      <Section className="py-8 sm:py-12 md:py-14">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-sm font-semibold tracking-wide text-primary-600 uppercase">Our Mission</p>
          <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
            Orchestrate seamless mobility with parking that just works
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
            We help cities, operators, and communities remove friction from curb to destination—so people park once, move faster, and spend time on what matters.
          </p>
        </div>
      </Section>

      <Section background="gray" className="py-8 sm:py-12 md:py-14">
        <div className="max-w-5xl mx-auto grid gap-4 sm:gap-6 md:gap-8 sm:grid-cols-2 md:grid-cols-3">
          {pillars.map((item) => (
            <div
              key={item.title}
              className="h-full rounded-2xl border border-gray-200 bg-white px-4 py-5 sm:px-6 sm:py-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="py-8 sm:py-12 md:py-14">
        <div className="max-w-4xl mx-auto space-y-4 text-left">
          <p className="text-sm font-semibold tracking-wide text-primary-600 uppercase">How we uphold it</p>
          <ul className="space-y-3">
            {commitments.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3"
              >
                <span className="mt-1 h-2 w-2 rounded-full bg-primary-600" aria-hidden />
                <span className="text-base text-gray-700 leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section background="gray" className="py-8 sm:py-12 md:py-14">
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900">Let’s make parking effortless</h2>
          <p className="text-base sm:text-lg text-gray-600">
            Talk to us about pilots, deployments, or data you need. We respond fast.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button href="/contact" size="md">Talk to our team</Button>
            <Button href="/app/download" variant="secondary" size="md">Experience the app</Button>
          </div>
        </div>
      </Section>
    </main>
  )
}


