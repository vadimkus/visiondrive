'use client'

import Section from '../components/common/Section'
import { ArrowUpRight, CalendarCheck, ClipboardList, CreditCard, FileText, Shield, Sparkles, Target, Users } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { usePublicDocumentTitle } from '../hooks/usePublicDocumentTitle'

const copy = {
  en: {
    documentTitle: 'About VisionDrive - Practice OS for UAE Solo Practitioners',
    kicker: 'VisionDrive Practice OS',
    headline: 'Professional system for',
    accent: 'solo practitioners',
    intro:
      'VisionDrive Technologies FZ-LLC is a UAE-based software company building Practice OS: a focused workspace for independent practitioners to manage bookings, patients, treatments, payments, inventory, and follow-up without enterprise complexity.',
    productAreas: [
      {
        icon: CalendarCheck,
        title: 'Bookings and client flow',
        description: 'Public booking links, patient portal, waitlist, reminders, policies, deposits, and reschedule requests.',
      },
      {
        icon: ClipboardList,
        title: 'Practitioner workspace',
        description: 'Patient cards, notes, consent records, treatment plans, aftercare, photos, and before/after tracking.',
      },
      {
        icon: CreditCard,
        title: 'Practice control',
        description: 'Payments, packages, gift cards, subscriptions, client wallet, inventory, and simple profitability views.',
      },
    ],
    missionTitle: 'Our mission',
    missionBody:
      'To give independent practitioners operational discipline without forcing them into heavy, multi-branch software. Practice OS is designed for the reality of home visits and small private practices: fast mobile workflows, clean patient context, simple money tracking, and repeat-client growth.',
    values: [
      {
        icon: Target,
        title: 'Practitioner first',
        description: 'Built for solo operators who need speed, clarity, and fewer admin loops.',
      },
      {
        icon: Shield,
        title: 'Private by default',
        description: 'Patient data stays inside the workspace unless a practitioner explicitly shares a safe link.',
      },
      {
        icon: Users,
        title: 'Workflow led',
        description: 'Product decisions come from real booking, treatment, payment, and follow-up workflows.',
      },
    ],
    companyTitle: 'Company information',
    companyIntro:
      'VisionDrive is incorporated in the UAE and is currently focused on Practice OS for solo practitioners and small private practices.',
    legalEntity: 'Legal entity',
    companyName: 'Company Name',
    jurisdiction: 'Jurisdiction',
    jurisdictionValue: 'Ras Al Khaimah, United Arab Emirates',
    type: 'Type',
    typeValue: 'Free Zone LLC',
    tradeLicense: 'Trade License',
    viewLicense: 'View E-License',
    compliance: 'Compliance',
    complianceLink: 'View security and compliance information',
    contact: 'Contact',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    addressValue: 'Compass Coworking Centre,\nRas Al Khaimah, UAE',
    productFocus: 'Product focus',
    productFocusValue: 'Practice operations software for the UAE',
  },
  ru: {
    documentTitle: 'О VisionDrive - Practice OS для частных специалистов в ОАЭ',
    kicker: 'VisionDrive Practice OS',
    headline: 'Профессиональная система для',
    accent: 'частных специалистов',
    intro:
      'VisionDrive Technologies FZ-LLC - компания из ОАЭ, которая создает Practice OS: рабочее пространство для частных специалистов, где можно управлять записями, пациентами, процедурами, оплатами, складом и повторными визитами без сложности корпоративных систем.',
    productAreas: [
      {
        icon: CalendarCheck,
        title: 'Запись и клиентский путь',
        description: 'Публичные ссылки для записи, портал пациента, лист ожидания, напоминания, правила, депозиты и запросы на перенос.',
      },
      {
        icon: ClipboardList,
        title: 'Рабочее пространство специалиста',
        description: 'Карты пациентов, заметки, согласия, планы лечения, рекомендации, фото и сравнение до/после.',
      },
      {
        icon: CreditCard,
        title: 'Контроль практики',
        description: 'Оплаты, пакеты, подарочные карты, подписки, кошелек клиента, склад и простая аналитика прибыльности.',
      },
    ],
    missionTitle: 'Наша миссия',
    missionBody:
      'Дать частным специалистам дисциплину в операциях без тяжелого ПО для сетевых организаций. Practice OS учитывает реальность выездов и небольших частных практик: быстрые мобильные процессы, понятный контекст пациента, простой учет денег и рост повторных визитов.',
    values: [
      {
        icon: Target,
        title: 'Сначала специалист',
        description: 'Продукт для тех, кому нужны скорость, ясность и меньше административной рутины.',
      },
      {
        icon: Shield,
        title: 'Приватность по умолчанию',
        description: 'Данные пациента остаются внутри кабинета, пока специалист явно не поделится безопасной ссылкой.',
      },
      {
        icon: Users,
        title: 'От реального процесса',
        description: 'Решения в продукте идут от реальных записей, процедур, оплат и повторных касаний.',
      },
    ],
    companyTitle: 'Информация о компании',
    companyIntro:
      'VisionDrive зарегистрирована в ОАЭ и сейчас сфокусирована на Practice OS для частных специалистов и небольших частных практик.',
    legalEntity: 'Юридическое лицо',
    companyName: 'Название компании',
    jurisdiction: 'Юрисдикция',
    jurisdictionValue: 'Рас-эль-Хайма, Объединенные Арабские Эмираты',
    type: 'Тип',
    typeValue: 'Free Zone LLC',
    tradeLicense: 'Торговая лицензия',
    viewLicense: 'Открыть электронную лицензию',
    compliance: 'Безопасность',
    complianceLink: 'Открыть информацию о безопасности и соответствии',
    contact: 'Контакты',
    email: 'Почта',
    phone: 'Телефон',
    address: 'Адрес',
    addressValue: 'Compass Coworking Centre,\nРас-эль-Хайма, ОАЭ',
    productFocus: 'Фокус продукта',
    productFocusValue: 'ПО для управления частной практикой в ОАЭ',
  },
} as const

export default function AboutClient() {
  const { publicLanguage } = useLanguage()
  const t = copy[publicLanguage]
  usePublicDocumentTitle(t.documentTitle)

  return (
    <main className="bg-white pt-24 text-gray-900">
      <Section className="py-12 md:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-800">
              <Sparkles className="h-4 w-4" aria-hidden />
              {t.kicker}
            </p>
            <h1 className="mb-6 text-[2.2rem] font-semibold leading-[1.05] tracking-tight text-gray-950 md:text-5xl lg:text-6xl">
              {t.headline} <span className="text-orange-600">{t.accent}</span>
            </h1>
            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-gray-600 sm:text-xl">{t.intro}</p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {t.productAreas.map((area) => (
              <div key={area.title} className="rounded-3xl border border-orange-100 bg-orange-50/50 p-5">
                <area.icon className="mb-4 h-7 w-7 text-orange-600" aria-hidden />
                <h2 className="text-lg font-semibold text-gray-950">{area.title}</h2>
                <p className="mt-2 text-sm leading-6 text-gray-600">{area.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section background="gray" className="py-12 md:py-16">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm md:p-12">
            <div className="mb-6 flex items-center gap-3">
              <FileText className="h-8 w-8 text-orange-600" aria-hidden />
              <h2 className="text-2xl font-bold text-gray-900">{t.missionTitle}</h2>
            </div>
            <p className="mb-6 text-lg leading-relaxed text-gray-700">{t.missionBody}</p>
            <div className="grid gap-6 border-t border-gray-100 pt-6 sm:grid-cols-3">
              {t.values.map((value) => (
                <div key={value.title} className="text-center sm:text-left">
                  <value.icon className="mx-auto mb-2 h-6 w-6 text-orange-600 sm:mx-0" aria-hidden />
                  <h3 className="mb-1 font-semibold text-gray-900">{value.title}</h3>
                  <p className="text-sm text-gray-600">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section className="py-12 md:py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">{t.companyTitle}</h2>
            <p className="mx-auto max-w-2xl text-gray-600">{t.companyIntro}</p>
          </div>

          <div className="rounded-[2rem] bg-gray-50 p-8">
            <div className="grid gap-8 sm:grid-cols-2">
              <div>
                <h3 className="mb-4 text-lg font-semibold text-gray-900">{t.legalEntity}</h3>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-gray-500">{t.companyName}</dt>
                    <dd className="font-medium text-gray-900">VisionDrive Technologies FZ-LLC</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">{t.jurisdiction}</dt>
                    <dd className="font-medium text-gray-900">{t.jurisdictionValue}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">{t.type}</dt>
                    <dd className="font-medium text-gray-900">{t.typeValue}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">{t.tradeLicense}</dt>
                    <dd>
                      <a
                        href="/license/E-License.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-medium text-orange-600 hover:text-orange-700"
                      >
                        {t.viewLicense}
                        <ArrowUpRight className="h-4 w-4" aria-hidden />
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">{t.compliance}</dt>
                    <dd>
                      <a href="/compliance" className="inline-flex items-center gap-1 font-medium text-orange-600 hover:text-orange-700">
                        {t.complianceLink}
                        <ArrowUpRight className="h-4 w-4" aria-hidden />
                      </a>
                    </dd>
                  </div>
                </dl>
              </div>
              <div>
                <h3 className="mb-4 text-lg font-semibold text-gray-900">{t.contact}</h3>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-gray-500">{t.email}</dt>
                    <dd>
                      <a href="mailto:tech@visiondrive.ae" className="font-medium text-orange-600 hover:text-orange-700">
                        tech@visiondrive.ae
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">{t.phone}</dt>
                    <dd>
                      <a href="tel:+971559152985" className="font-medium text-gray-900 hover:text-orange-600">
                        +971 55 915 2985
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">{t.address}</dt>
                    <dd className="whitespace-pre-line font-medium text-gray-900">{t.addressValue}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">{t.productFocus}</dt>
                    <dd className="font-medium text-gray-900">{t.productFocusValue}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </main>
  )
}
