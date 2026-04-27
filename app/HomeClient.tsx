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
      <section className="pt-20 md:pt-24 pb-12 md:pb-14 px-5 md:px-8">
        <div className="max-w-5xl mx-auto">
          <p
            className="text-center text-sm font-medium text-orange-600 mb-4"
            dir="ltr"
          >
            {visiondriveSloganWithRegion[publicLanguage]}
          </p>

          {/* Main Heading */}
          <div className="text-center mb-10 md:mb-10">
            <h1
              className="text-[2rem] leading-[1.1] md:text-5xl lg:text-6xl font-semibold tracking-tight text-gray-900 mb-4 md:mb-5"
              dir="ltr"
            >
              {t.headlineBefore}
              <span className="text-orange-500">{t.headlineAccent}</span>
            </h1>

            <p
              className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed"
              dir="ltr"
            >
              {t.sub}
            </p>
          </div>

          {/* CTA Button */}
          <div className="flex justify-center mb-12 md:mb-10">
            <Link
              href="/contact"
              className="flex items-center justify-center gap-2 h-14 px-8 bg-orange-500 text-white text-[17px] font-semibold rounded-2xl hover:bg-orange-600 active:scale-[0.98] transition-all shadow-lg shadow-orange-500/20"
            >
              {t.ctaPrimary}
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          {/* Capabilities Pills */}
          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            {capabilities.map((cap) => (
              <div
                key={cap.label}
                className="group flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-full border border-gray-100 md:bg-white md:rounded-2xl md:border-gray-200/80 md:shadow-sm md:hover:shadow-md md:hover:border-gray-300 md:hover:scale-[1.02] md:active:scale-[0.98] md:px-5 md:py-3 md:gap-2.5 transition-all duration-200 cursor-default"
              >
                <div className="hidden md:flex w-8 h-8 rounded-xl bg-gray-100 group-hover:bg-orange-50 items-center justify-center transition-colors duration-200">
                  <cap.icon className="h-4 w-4 text-gray-500 group-hover:text-orange-500 transition-colors duration-200" />
                </div>
                <cap.icon className="md:hidden h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 md:group-hover:text-gray-900 transition-colors duration-200">
                  {cap.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Portal CTA */}
      <section className="py-12 md:py-14 px-5 md:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden bg-gray-900 rounded-[2rem] p-8 md:p-12 text-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full blur-3xl" />

            <div className="relative">
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <Radio className="h-5 w-5 text-orange-400" />
                </div>
                <span className="text-sm font-medium text-orange-400">{t.darkKicker}</span>
              </div>

              <h2
                className="text-2xl md:text-3xl lg:text-4xl font-semibold text-white mb-4 tracking-tight"
                dir="ltr"
              >
                {t.darkTitle}
              </h2>

              <p
                className="text-gray-400 mb-8 text-lg max-w-lg mx-auto leading-relaxed"
                dir="ltr"
              >
                {t.darkBody}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 h-14 px-8 bg-orange-500 text-white text-[17px] font-semibold rounded-2xl hover:bg-orange-600 active:scale-[0.98] transition-all"
                >
                  {t.darkPrimary}
                  <ChevronRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/contact"
                  className="flex items-center justify-center gap-2 h-14 px-8 bg-white/10 text-white text-[17px] font-semibold rounded-2xl border border-white/20 hover:bg-white/20 active:scale-[0.98] transition-all"
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
