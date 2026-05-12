'use client'

export default function PatientPortalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#fff7ed_0%,#f8fafc_48%,#eef2ff_100%)] px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-xl rounded-[2rem] border border-red-100 bg-white p-6 shadow-xl shadow-red-100/40">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-red-700">Patient portal</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Portal could not load</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Please refresh this private link. If it still does not open, ask the practice to send you a new patient portal link.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 min-h-11 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white"
        >
          Try again
        </button>
      </section>
    </main>
  )
}
