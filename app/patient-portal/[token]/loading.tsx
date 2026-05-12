export default function LoadingPatientPortal() {
  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#fff7ed_0%,#f8fafc_48%,#eef2ff_100%)] px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-xl rounded-[2rem] border border-white/80 bg-white/90 p-6 shadow-xl shadow-orange-100/50">
        <div className="h-4 w-32 rounded-full bg-orange-100" />
        <div className="mt-5 h-8 w-3/4 rounded-2xl bg-slate-100" />
        <div className="mt-3 h-4 w-full rounded-full bg-slate-100" />
        <div className="mt-2 h-4 w-5/6 rounded-full bg-slate-100" />
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="h-24 rounded-2xl bg-orange-50" />
          <div className="h-24 rounded-2xl bg-blue-50" />
        </div>
      </section>
    </main>
  )
}
