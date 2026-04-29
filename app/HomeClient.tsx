'use client'

import {
  ArrowRight,
  Radio,
  ChevronRight,
  Layers,
  Lock,
  Shield,
  BarChart3,
} from 'lucide-react'
import { useLanguage } from './contexts/LanguageContext'
import Link from 'next/link'
import { visiondriveSloganWithRegion } from '@/lib/brand'

const homeCopy = {
  en: {
    headlineBefore: 'A professional system for ',
    headlineAccent: 'solo practitioners',
    sub: 'VisionDrive gives independent clinics and solo service providers one calm workspace for bookings, client records, treatment notes, photos, inventory, payments, and business reporting. Built for practitioners who need the discipline of a clinic system without the overhead of an enterprise suite.',
    mobileSub: 'Bookings. Records. Payments. One calm workspace.',
    mobilePrimary: 'Open portal',
    mobileSecondary: 'Request demo',
    ctaPrimary: 'Request product walkthrough',
    capabilities: [
      { icon: Lock, label: 'Client records & privacy' },
      { icon: Shield, label: 'UAE-ready practice data' },
      { icon: BarChart3, label: 'Revenue & follow-up insight' },
      { icon: Layers, label: 'Bookings to payments' },
    ],
    darkKicker: 'Practice workspace',
    darkTitle: 'Run the whole practice from one console',
    darkBody:
      'Access is currently private while the product is prepared for selective onboarding. VisionDrive helps solo practitioners keep appointments, treatment history, follow-ups, stock, and finances organized in one professional operating system.',
    darkPrimary: 'Open console',
    darkSecondary: 'Request access',
  },
  ru: {
    headlineBefore: 'Профессиональная система для ',
    headlineAccent: 'частных специалистов',
    sub: 'VisionDrive дает независимым клиникам и частным специалистам единое рабочее пространство для записей, клиентских карт, заметок по процедурам, фото, склада, оплат и управленческой отчетности. Это дисциплина клинической системы без сложности корпоративной платформы.',
    mobileSub: 'Записи. Карты. Оплаты. Всё спокойно и понятно.',
    mobilePrimary: 'Открыть портал',
    mobileSecondary: 'Демо',
    ctaPrimary: 'Запросить демонстрацию',
    capabilities: [
      { icon: Lock, label: 'Клиентские карты и приватность' },
      { icon: Shield, label: 'Данные практики в ОАЭ' },
      { icon: BarChart3, label: 'Доходы и повторные визиты' },
      { icon: Layers, label: 'От записи до оплаты' },
    ],
    darkKicker: 'Рабочее пространство',
    darkTitle: 'Управляйте всей практикой из одной консоли',
    darkBody:
      'Доступ сейчас закрытый, пока продукт готовится к выборочному подключению. VisionDrive помогает частным специалистам держать в порядке расписание, историю процедур, повторные визиты, склад и финансы в одной профессиональной операционной системе.',
    darkPrimary: 'Открыть консоль',
    darkSecondary: 'Запросить доступ',
  },
} as const

export default function HomeClient() {
  const { publicLanguage } = useLanguage()
  const t = homeCopy[publicLanguage]

  const capabilities = t.capabilities

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="px-5 pb-8 pt-24 md:px-8 md:pb-14 md:pt-24">
        <div className="max-w-5xl mx-auto">
          <p
            className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-orange-600 md:mb-4 md:text-sm md:normal-case md:tracking-normal"
            dir="ltr"
          >
            {visiondriveSloganWithRegion[publicLanguage]}
          </p>

          {/* Main Heading */}
          <div className="mb-7 text-center md:mb-10">
            <h1
              className="mb-3 text-[2.65rem] font-semibold leading-[0.96] tracking-[-0.055em] text-gray-950 md:mb-5 md:text-5xl md:leading-[1.1] lg:text-6xl"
              dir="ltr"
            >
              {t.headlineBefore}
              <span className="text-orange-500">{t.headlineAccent}</span>
            </h1>

            <p
              className="mx-auto max-w-xs text-base leading-6 text-gray-500 md:hidden"
              dir="ltr"
            >
              {t.mobileSub}
            </p>
            <p
              className="mx-auto hidden max-w-2xl text-xl leading-relaxed text-gray-500 md:block"
              dir="ltr"
            >
              {t.sub}
            </p>
          </div>

          {/* CTA Button */}
          <div className="mb-8 grid grid-cols-2 gap-3 md:mb-10 md:flex md:justify-center">
            <Link
              href="/login"
              className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-gray-950 px-5 text-[16px] font-semibold text-white shadow-lg shadow-gray-950/15 transition-all active:scale-[0.98] md:hidden"
            >
              {t.mobilePrimary}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 text-[16px] font-semibold text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600 active:scale-[0.98] md:px-8 md:text-[17px]"
            >
              <span className="md:hidden">{t.mobileSecondary}</span>
              <span className="hidden md:inline">{t.ctaPrimary}</span>
              <ArrowRight className="hidden h-5 w-5 md:block" />
            </Link>
          </div>

          {/* Capabilities Pills */}
          <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap md:justify-center md:gap-4">
            {capabilities.map((cap) => (
              <div
                key={cap.label}
                className="group flex items-center justify-center gap-2 rounded-2xl border border-gray-100 bg-gray-50 px-3 py-3 transition-all duration-200 md:justify-start md:rounded-2xl md:border-gray-200/80 md:bg-white md:px-5 md:py-3 md:shadow-sm md:hover:scale-[1.02] md:hover:border-gray-300 md:hover:shadow-md md:active:scale-[0.98]"
              >
                <div className="hidden md:flex w-8 h-8 rounded-xl bg-gray-100 group-hover:bg-orange-50 items-center justify-center transition-colors duration-200">
                  <cap.icon className="h-4 w-4 text-gray-500 group-hover:text-orange-500 transition-colors duration-200" />
                </div>
                <cap.icon className="md:hidden h-4 w-4 text-gray-500" />
                <span className="text-center text-xs font-semibold text-gray-700 transition-colors duration-200 md:text-left md:text-sm md:font-medium md:group-hover:text-gray-900">
                  {cap.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Portal CTA */}
      <section className="bg-gray-50 px-5 py-8 md:px-8 md:py-14">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-[2rem] bg-gray-950 p-5 text-center md:p-12">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full blur-3xl" />

            <div className="relative">
              <div className="mb-4 flex items-center justify-center gap-2 md:mb-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/20 md:h-10 md:w-10">
                  <Radio className="h-5 w-5 text-orange-400" />
                </div>
                <span className="text-sm font-medium text-orange-400">{t.darkKicker}</span>
              </div>

              <h2
                className="mb-0 text-2xl font-semibold tracking-tight text-white md:mb-4 md:text-3xl lg:text-4xl"
                dir="ltr"
              >
                {t.darkTitle}
              </h2>

              <p
                className="mx-auto mb-8 hidden max-w-lg text-lg leading-relaxed text-gray-400 md:block"
                dir="ltr"
              >
                {t.darkBody}
              </p>

              <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row md:mt-0">
                <Link
                  href="/login"
                  className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-orange-500 px-8 text-[17px] font-semibold text-white transition-all hover:bg-orange-600 active:scale-[0.98]"
                >
                  {t.darkPrimary}
                  <ChevronRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/contact"
                  className="hidden h-14 items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-8 text-[17px] font-semibold text-white transition-all hover:bg-white/20 active:scale-[0.98] sm:flex"
                >
                  {t.darkSecondary}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="h-8 md:h-0" />
    </main>
  )
}
