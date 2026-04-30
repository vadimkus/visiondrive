import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { CalendarCheck, Camera, ChevronRight, ShieldCheck, Sparkles, Star } from 'lucide-react'
import { getPublicClinicProfile } from '@/lib/clinic/public-profile'

export const dynamic = 'force-dynamic'

const copy = {
  en: {
    profile: 'Practitioner profile',
    heroTitle: 'A clear profile before a client books.',
    heroText:
      'Review services, policies, public feedback, and consent-approved before/after examples before choosing a time.',
    bookNow: 'Book now',
    viewBooking: 'Open booking link',
    services: 'Services',
    servicesHint: 'Active treatments available through the public booking flow.',
    reviews: 'Client reviews',
    reviewsHint: 'Published feedback approved for public use.',
    gallery: 'Before / after gallery',
    galleryHint: 'Only images explicitly marked with marketing/public-use consent are shown here.',
    policies: 'Booking policies',
    policiesHint: 'Service-level deposit, cancellation, and no-show rules are shown before booking.',
    noReviews: 'No public reviews yet.',
    noGallery: 'No public before/after pairs yet.',
    noPolicies: 'Detailed policy terms are shown during booking when they apply.',
    servicesCount: 'services',
    reviewsCount: 'reviews',
    galleryCount: 'before/after pairs',
    duration: 'min',
    from: 'From',
    before: 'Before',
    after: 'After',
    language: 'Language',
    privateCare: 'Private care data stays inside the practice. This page only shows public-safe information.',
  },
  ru: {
    profile: 'Профиль специалиста',
    heroTitle: 'Понятный профиль до записи клиента.',
    heroText:
      'Посмотрите услуги, правила записи, публичные отзывы и before/after примеры с отдельным согласием на публикацию.',
    bookNow: 'Записаться',
    viewBooking: 'Открыть запись',
    services: 'Услуги',
    servicesHint: 'Активные процедуры, доступные через публичную запись.',
    reviews: 'Отзывы клиентов',
    reviewsHint: 'Опубликованные отзывы, разрешённые для публичного показа.',
    gallery: 'Галерея до / после',
    galleryHint: 'Здесь показываются только фото с явным согласием на маркетинговое/публичное использование.',
    policies: 'Правила записи',
    policiesHint: 'Депозит, отмена и правила неявки показываются до подтверждения записи.',
    noReviews: 'Публичных отзывов пока нет.',
    noGallery: 'Публичных пар до/после пока нет.',
    noPolicies: 'Подробные правила показываются при записи, если они применяются.',
    servicesCount: 'услуг',
    reviewsCount: 'отзывов',
    galleryCount: 'пар до/после',
    duration: 'мин',
    from: 'От',
    before: 'До',
    after: 'После',
    language: 'Язык',
    privateCare:
      'Приватные медицинские данные остаются внутри клиники. На этой странице только безопасная публичная информация.',
  },
} as const

function stars(rating: number | null) {
  if (!rating) return '★★★★★'
  return Array.from({ length: 5 }, (_, index) => (index < Math.round(rating) ? '★' : '☆')).join('')
}

export default async function PublicPractitionerProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ lang?: string }>
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams])
  const locale = query.lang === 'ru' ? 'ru' : 'en'
  const t = copy[locale]
  const profile = await getPublicClinicProfile(slug)

  if (!profile) notFound()

  const profilePath = `/profile/${profile.tenant.slug}`
  const policyProcedures = profile.procedures.filter(
    (procedure) => procedure.bookingPolicyText || procedure.bookingPolicyType !== 'NONE'
  )

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.20),transparent_28rem),linear-gradient(135deg,#fff7ed_0%,#f8fafc_48%,#eef2ff_100%)] px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="inline-flex items-center gap-3 text-sm font-bold text-slate-950">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-orange-100">
              VD
            </span>
            <span>
              <span className="block">VisionDrive</span>
              <span className="block text-xs font-semibold text-slate-500">Practice OS</span>
            </span>
          </Link>
          <div className="inline-flex w-fit rounded-2xl border border-white/80 bg-white/80 p-1 text-xs font-bold shadow-sm">
            {(['en', 'ru'] as const).map((code) => (
              <Link
                key={code}
                href={`${profilePath}?lang=${code}`}
                className={
                  locale === code
                    ? 'rounded-xl bg-slate-950 px-3 py-2 text-white'
                    : 'rounded-xl px-3 py-2 text-slate-500 hover:bg-slate-100'
                }
                aria-label={`${t.language}: ${code.toUpperCase()}`}
              >
                {code.toUpperCase()}
              </Link>
            ))}
          </div>
        </header>

        <section className="overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-2xl shadow-slate-950/20">
          <div className="relative p-6 sm:p-8 lg:p-10">
            <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-orange-400/40 blur-3xl" />
            <div className="absolute -bottom-28 left-16 h-72 w-72 rounded-full bg-indigo-400/30 blur-3xl" />
            <div className="relative grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-orange-100">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden />
                  {t.profile}
                </p>
                <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-[-0.04em] sm:text-5xl">
                  {profile.tenant.name}
                </h1>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">{t.heroText}</p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={`${profile.bookingUrl}?source=profile&utm_source=profile&utm_medium=public_page&utm_campaign=direct_booking`}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 text-sm font-black text-white shadow-xl shadow-orange-950/20 hover:bg-orange-600"
                  >
                    {t.bookNow}
                    <ChevronRight className="h-4 w-4" aria-hidden />
                  </Link>
                  <p className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-white/10 px-4 text-sm font-semibold text-slate-200">
                    <ShieldCheck className="h-4 w-4 text-emerald-300" aria-hidden />
                    {t.privateCare}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Metric value={profile.summary.serviceCount} label={t.servicesCount} />
                <Metric value={profile.summary.reviewCount} label={t.reviewsCount} />
                <Metric value={profile.summary.galleryPairCount} label={t.galleryCount} />
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[2rem] border border-white/80 bg-white/85 p-5 shadow-sm backdrop-blur sm:p-6">
            <SectionTitle title={t.services} hint={t.servicesHint} icon={<CalendarCheck className="h-5 w-5" />} />
            <div className="mt-5 grid gap-3">
              {profile.procedures.map((procedure) => (
                <article key={procedure.id} className="rounded-3xl border border-slate-100 bg-slate-50/70 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-slate-950">{procedure.name}</h2>
                      <p className="mt-1 text-sm text-slate-500">
                        {procedure.defaultDurationMin} {t.duration}
                        {procedure.priceLabel ? ` · ${t.from} ${procedure.priceLabel}` : ''}
                      </p>
                    </div>
                    <span className="w-fit rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">
                      {procedure.policyLabel}
                    </span>
                  </div>
                  <Link
                    href={`${profile.bookingUrl}?procedureId=${procedure.id}&source=profile&utm_source=profile&utm_medium=service_card&utm_campaign=direct_booking`}
                    className="mt-4 inline-flex min-h-10 items-center justify-center rounded-xl bg-slate-950 px-4 text-sm font-bold text-white hover:bg-slate-800"
                  >
                    {t.viewBooking}
                  </Link>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/80 bg-white/85 p-5 shadow-sm backdrop-blur sm:p-6">
            <SectionTitle title={t.reviews} hint={t.reviewsHint} icon={<Star className="h-5 w-5" />} />
            {profile.reviews.length === 0 ? (
              <p className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                {t.noReviews}
              </p>
            ) : (
              <div className="mt-5 space-y-3">
                {profile.reviews.slice(0, 5).map((review) => (
                  <article key={review.id} className="rounded-3xl border border-slate-100 bg-slate-50/70 p-4">
                    <p className="text-sm font-black tracking-wide text-amber-500">{stars(review.rating)}</p>
                    {review.publicComment && (
                      <p className="mt-2 text-sm leading-6 text-slate-700">“{review.publicComment}”</p>
                    )}
                    <p className="mt-3 text-xs font-semibold text-slate-500">
                      {review.clientName} · {review.serviceName}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/80 bg-white/85 p-5 shadow-sm backdrop-blur sm:p-6">
          <SectionTitle title={t.gallery} hint={t.galleryHint} icon={<Camera className="h-5 w-5" />} />
          {profile.galleryPairs.length === 0 ? (
            <p className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              {t.noGallery}
            </p>
          ) : (
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {profile.galleryPairs.map((pair) => (
                <article key={pair.id} className="overflow-hidden rounded-3xl border border-slate-100 bg-slate-50">
                  <div className="grid grid-cols-2">
                    <figure>
                      <Image
                        src={pair.before.url}
                        alt={t.before}
                        width={480}
                        height={480}
                        className="aspect-square w-full object-cover"
                      />
                      <figcaption className="px-3 py-2 text-xs font-bold text-slate-500">{t.before}</figcaption>
                    </figure>
                    <figure>
                      <Image
                        src={pair.after.url}
                        alt={t.after}
                        width={480}
                        height={480}
                        className="aspect-square w-full object-cover"
                      />
                      <figcaption className="px-3 py-2 text-xs font-bold text-slate-500">{t.after}</figcaption>
                    </figure>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-[2rem] border border-white/80 bg-white/85 p-5 shadow-sm backdrop-blur sm:p-6">
          <SectionTitle title={t.policies} hint={t.policiesHint} icon={<ShieldCheck className="h-5 w-5" />} />
          {policyProcedures.length === 0 ? (
            <p className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              {t.noPolicies}
            </p>
          ) : (
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {policyProcedures.map((procedure) => (
                <article key={procedure.id} className="rounded-3xl border border-slate-100 bg-slate-50/70 p-4">
                  <h2 className="font-bold text-slate-950">{procedure.name}</h2>
                  <p className="mt-1 text-sm font-semibold text-orange-700">{procedure.policyLabel}</p>
                  {procedure.bookingPolicyText && (
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                      {procedure.bookingPolicyText}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

function Metric({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-3xl bg-white/10 p-4 text-center ring-1 ring-white/10">
      <p className="text-3xl font-black">{value}</p>
      <p className="mt-1 text-xs font-semibold text-slate-300">{label}</p>
    </div>
  )
}

function SectionTitle({ title, hint, icon }: { title: string; hint: string; icon: ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
        {icon}
      </span>
      <div>
        <h2 className="text-xl font-black text-slate-950">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">{hint}</p>
      </div>
    </div>
  )
}
