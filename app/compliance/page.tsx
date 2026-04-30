'use client'

import Section from '../components/common/Section'
import {
  ArrowUpRight,
  CheckCircle2,
  ClipboardCheck,
  Database,
  FileClock,
  FileText,
  KeyRound,
  Lock,
  Phone,
  Shield,
  UserCheck,
  Users,
} from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { usePublicDocumentTitle } from '../hooks/usePublicDocumentTitle'

const copy = {
  en: {
    documentTitle: 'Practice OS Security & Compliance - UAE Data Residency',
    kicker: 'Practice OS Security & Compliance',
    title: 'Compliance built for',
    accent: 'private practice data',
    intro:
      'VisionDrive Practice OS is designed for UAE solo practitioners who handle sensitive patient records, treatment notes, clinical photos, payments, booking policies, and patient-facing links. The priority is simple: keep the workspace private, structured, and explainable.',
    badges: ['UAE data residency', 'Tenant isolation', 'Patient-safe sharing', 'UAE PDPL aligned'],
    postureTitle: 'Compliance Posture',
    postureIntro:
      'The public compliance page now reflects the current product: practice operations software, not legacy hardware monitoring.',
    areas: [
      {
        icon: Database,
        title: 'UAE Data Residency',
        description:
          'Practice OS is designed so customer data is hosted in the UAE and managed around local data-sovereignty expectations.',
        details: ['UAE-hosted infrastructure', 'Local processing model', 'No routine cross-border transfer', 'Vendor review before new processors'],
      },
      {
        icon: Lock,
        title: 'Privacy & UAE PDPL',
        description:
          'The platform is structured around data minimization, purpose limitation, and patient rights under UAE Federal Decree-Law No. 45 of 2021.',
        details: ['Minimal patient fields by default', 'Access/correction/deletion workflows', 'Consent-aware sharing', 'Clear privacy and terms pages'],
      },
      {
        icon: Users,
        title: 'Tenant Isolation',
        description:
          'Every practitioner workspace is scoped by tenant so one practice cannot access another practice’s patients, notes, photos, payments, or settings.',
        details: ['Tenant-scoped APIs', 'Workspace-level permissions', 'Isolated patient records', 'Safer public media endpoints'],
      },
      {
        icon: ClipboardCheck,
        title: 'Practice Records Governance',
        description:
          'Patient cards, consent records, visit notes, aftercare, wallet history, and exports are organized for professional practice operations.',
        details: ['Consent linked to visits', 'Patient-safe exports', 'Payment and package history', 'Operational audit trail'],
      },
    ],
    residencyTitle: 'Your Practice Data Stays In The UAE',
    residencyBody:
      'Patient records, appointment history, consent context, payments, and internal workspace data are designed to remain in UAE-hosted infrastructure. Any future processor or integration is reviewed before it becomes part of the operational data flow.',
    residencyPills: ['UAE-hosted data', 'Tenant-scoped records', 'No public internal notes'],
    securityTitle: 'Security Controls',
    securityIntro: 'Controls that matter for solo practitioners handling private patient relationships.',
    controls: [
      {
        icon: KeyRound,
        title: 'Authenticated workspace access',
        description: 'Practitioner workspaces require authenticated access and keep internal records away from public profile pages.',
      },
      {
        icon: Shield,
        title: 'Patient-safe public links',
        description: 'Portal links, public profiles, and media endpoints expose only the information explicitly intended for patients.',
      },
      {
        icon: FileClock,
        title: 'Audit-friendly history',
        description: 'Bookings, payments, packages, notes, and patient actions are kept in a traceable operational timeline.',
      },
      {
        icon: FileText,
        title: 'Plain-language policies',
        description: 'Booking rules, cancellation fees, receipts, and client-wallet information are written for patient understanding.',
      },
    ],
    retentionTitle: 'Data Retention & Patient Visibility',
    retentionIntro:
      'The platform separates internal practice records from patient-visible links and public marketing content.',
    table: { type: 'Data Type', retention: 'Retention', purpose: 'Purpose' },
    rows: [
      { type: 'Patient records', retention: 'Practice-controlled', purpose: 'Treatment continuity and client support' },
      { type: 'Consent and forms', retention: 'Linked to visits', purpose: 'Procedure context and patient acknowledgment' },
      { type: 'Payments and receipts', retention: 'Business record period', purpose: 'Accounting, balances, refunds, and disputes' },
      { type: 'Public profile media', retention: 'Until unpublished or consent removed', purpose: 'Marketing-consented before/after gallery' },
      { type: 'Portal links', retention: 'Token expiry / manual revoke', purpose: 'Limited patient access without exposing the full workspace' },
    ],
    responsibilitiesTitle: 'Practitioner Responsibilities',
    responsibilities: [
      'Use strong passwords and keep workspace access limited to authorized staff.',
      'Collect patient consent before uploading or sharing clinical photos.',
      'Do not place sensitive internal notes in patient-visible fields.',
      'Review public profile content before sharing it in Instagram, Google, or WhatsApp.',
      'Respond to patient data requests through the documented support workflow.',
    ],
    statementTitle: 'Compliance Statement',
    statement:
      'VisionDrive Practice OS is designed around UAE data residency, private patient records, tenant-scoped access, patient-safe sharing, and privacy-aware operating workflows. The platform supports practitioners with structured records, consent context, payment history, and public links that avoid exposing internal workspace data.',
    ctaTitle: 'Need Security Or Compliance Details?',
    ctaBody:
      'Contact us to discuss onboarding, privacy questions, data residency, patient-safe exports, or the controls used inside Practice OS.',
    contact: 'Contact VisionDrive',
    terms: 'View Terms',
  },
  ru: {
    documentTitle: 'Безопасность Practice OS - хранение данных в ОАЭ',
    kicker: 'Безопасность и соответствие Practice OS',
    title: 'Соответствие для',
    accent: 'данных частной практики',
    intro:
      'VisionDrive Practice OS создан для частных специалистов в ОАЭ, которые работают с чувствительными картами пациентов, заметками по процедурам, клиническими фото, оплатами, правилами записи и пациентскими ссылками. Главный принцип: рабочий кабинет должен быть приватным, структурированным и понятным.',
    badges: ['Данные в ОАЭ', 'Изоляция кабинетов', 'Безопасные ссылки для пациентов', 'С учетом UAE PDPL'],
    postureTitle: 'Позиция по соответствию',
    postureIntro:
      'Эта страница отражает текущий продукт: ПО для управления частной практикой, а не прежний аппаратный мониторинг.',
    areas: [
      {
        icon: Database,
        title: 'Хранение данных в ОАЭ',
        description:
          'Practice OS спроектирован так, чтобы данные клиентов размещались в ОАЭ и управлялись с учетом местных требований к суверенности данных.',
        details: ['Инфраструктура в ОАЭ', 'Локальная модель обработки', 'Без регулярной передачи за границу', 'Проверка новых обработчиков данных'],
      },
      {
        icon: Lock,
        title: 'Приватность и UAE PDPL',
        description:
          'Платформа учитывает минимизацию данных, ограничение целей обработки и права пациентов по Федеральному декрету-закону ОАЭ No. 45 от 2021 года.',
        details: ['Минимальные поля пациента по умолчанию', 'Запросы на доступ/исправление/удаление', 'Обмен с учетом согласия', 'Понятные страницы политики и условий'],
      },
      {
        icon: Users,
        title: 'Изоляция кабинетов',
        description:
          'Каждое рабочее пространство ограничено своим кабинетом, чтобы одна практика не видела пациентов, заметки, фото, оплаты или настройки другой.',
        details: ['API в рамках кабинета', 'Права на уровне кабинета', 'Изолированные карты пациентов', 'Более безопасные публичные медиа'],
      },
      {
        icon: ClipboardCheck,
        title: 'Управление записями практики',
        description:
          'Карты пациентов, согласия, визиты, рекомендации, кошелек клиента и экспорты организованы для профессиональной работы.',
        details: ['Согласия связаны с визитами', 'Экспорты без внутренних заметок', 'История оплат и пакетов', 'Операционная история для аудита'],
      },
    ],
    residencyTitle: 'Данные вашей практики остаются в ОАЭ',
    residencyBody:
      'Карты пациентов, история записей, контекст согласий, оплаты и внутренние данные кабинета спроектированы для хранения в инфраструктуре ОАЭ. Каждый будущий обработчик данных или интеграция проверяется до включения в операционный поток.',
    residencyPills: ['Данные в ОАЭ', 'Записи в рамках кабинета', 'Внутренние заметки не публичны'],
    securityTitle: 'Контроли безопасности',
    securityIntro: 'Контроли, которые важны частным специалистам при работе с приватными отношениями с пациентами.',
    controls: [
      {
        icon: KeyRound,
        title: 'Доступ только после входа',
        description: 'Рабочие кабинеты требуют авторизации и отделяют внутренние записи от публичных страниц профиля.',
      },
      {
        icon: Shield,
        title: 'Безопасные публичные ссылки',
        description: 'Портал, публичные профили и медиа показывают только информацию, предназначенную для пациента или публики.',
      },
      {
        icon: FileClock,
        title: 'История для аудита',
        description: 'Записи, оплаты, пакеты, заметки и действия пациента сохраняются в прослеживаемой операционной истории.',
      },
      {
        icon: FileText,
        title: 'Понятные правила',
        description: 'Правила записи, штрафы за отмену, квитанции и кошелек клиента написаны понятным для пациента языком.',
      },
    ],
    retentionTitle: 'Хранение данных и видимость для пациента',
    retentionIntro:
      'Платформа отделяет внутренние записи практики от ссылок для пациентов и публичного маркетингового контента.',
    table: { type: 'Тип данных', retention: 'Хранение', purpose: 'Назначение' },
    rows: [
      { type: 'Карты пациентов', retention: 'Под контролем практики', purpose: 'Непрерывность лечения и поддержка клиента' },
      { type: 'Согласия и формы', retention: 'Связаны с визитами', purpose: 'Контекст процедуры и подтверждение пациента' },
      { type: 'Оплаты и квитанции', retention: 'Срок бизнес-записей', purpose: 'Учет, балансы, возвраты и споры' },
      { type: 'Медиа публичного профиля', retention: 'До снятия с публикации или отзыва согласия', purpose: 'Галерея до/после с маркетинговым согласием' },
      { type: 'Ссылки портала', retention: 'Истечение токена / ручной отзыв', purpose: 'Ограниченный доступ пациента без раскрытия кабинета' },
    ],
    responsibilitiesTitle: 'Ответственность специалиста',
    responsibilities: [
      'Использовать надежные пароли и ограничивать доступ только уполномоченным людям.',
      'Получать согласие пациента до загрузки или публикации клинических фото.',
      'Не размещать чувствительные внутренние заметки в полях, видимых пациенту.',
      'Проверять публичный профиль перед размещением в Instagram, Google или WhatsApp.',
      'Отвечать на запросы пациентов по данным через документированный процесс поддержки.',
    ],
    statementTitle: 'Заявление о соответствии',
    statement:
      'VisionDrive Practice OS спроектирован вокруг хранения данных в ОАЭ, приватных карт пациентов, доступа в рамках кабинета, безопасного обмена с пациентами и процессов, учитывающих приватность. Платформа помогает специалистам вести структурированные записи, контекст согласий, историю оплат и публичные ссылки без раскрытия внутренних данных кабинета.',
    ctaTitle: 'Нужны детали по безопасности или соответствию?',
    ctaBody:
      'Свяжитесь с нами, чтобы обсудить подключение, приватность, хранение данных в ОАЭ, безопасные экспорты для пациентов или контроли внутри Practice OS.',
    contact: 'Связаться с VisionDrive',
    terms: 'Открыть условия',
  },
} as const

export default function CompliancePage() {
  const { publicLanguage } = useLanguage()
  const t = copy[publicLanguage]
  usePublicDocumentTitle(t.documentTitle)

  return (
    <main className="bg-white pt-24 text-gray-900">
      <Section className="py-12 md:py-20">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-800">
            <Shield className="h-4 w-4" aria-hidden />
            {t.kicker}
          </div>
          <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            {t.title} <span className="text-orange-600">{t.accent}</span>
          </h1>
          <p className="mx-auto mb-8 max-w-3xl text-lg leading-relaxed text-gray-600 sm:text-xl">{t.intro}</p>

          <div className="flex flex-wrap justify-center gap-3">
            {t.badges.map((badge) => (
              <div key={badge} className="flex items-center gap-2 rounded-xl border border-orange-100 bg-orange-50 px-4 py-2">
                <CheckCircle2 className="h-5 w-5 text-orange-600" aria-hidden />
                <span className="text-sm font-medium text-orange-900">{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section background="gray" className="py-12 md:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">{t.postureTitle}</h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">{t.postureIntro}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {t.areas.map((area) => (
              <div key={area.title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                <div className="mb-4 flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-orange-50">
                    <area.icon className="h-6 w-6 text-orange-600" aria-hidden />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{area.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-gray-600">{area.description}</p>
                  </div>
                </div>
                <ul className="ml-16 space-y-2">
                  {area.details.map((detail) => (
                    <li key={detail} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-600" aria-hidden />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section className="py-12 md:py-16">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-[2rem] border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-8 md:p-12">
            <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-center">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-green-100 md:mx-0">
                <Database className="h-12 w-12 text-green-700" aria-hidden />
              </div>
              <div className="text-center md:text-left">
                <h2 className="mb-4 text-2xl font-bold text-gray-900 sm:text-3xl">{t.residencyTitle}</h2>
                <p className="mb-5 leading-relaxed text-gray-700">{t.residencyBody}</p>
                <div className="flex flex-wrap justify-center gap-3 md:justify-start">
                  {t.residencyPills.map((item) => (
                    <span key={item} className="rounded-full bg-white px-4 py-2 text-sm font-medium text-green-800 shadow-sm">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section background="gray" className="py-12 md:py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">{t.securityTitle}</h2>
            <p className="text-lg text-gray-600">{t.securityIntro}</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {t.controls.map((control) => (
              <div key={control.title} className="rounded-2xl border border-gray-200 bg-white p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50">
                  <control.icon className="h-5 w-5 text-orange-600" aria-hidden />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">{control.title}</h3>
                <p className="text-sm leading-relaxed text-gray-600">{control.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section className="py-12 md:py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">{t.retentionTitle}</h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">{t.retentionIntro}</p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="grid bg-gray-50 px-6 py-4 text-sm font-semibold text-gray-900 sm:grid-cols-[1fr_1fr_1.4fr]">
              <span>{t.table.type}</span>
              <span className="hidden sm:block">{t.table.retention}</span>
              <span className="hidden sm:block">{t.table.purpose}</span>
            </div>
            <div className="divide-y divide-gray-100">
              {t.rows.map((row) => (
                <div key={row.type} className="grid gap-2 px-6 py-5 sm:grid-cols-[1fr_1fr_1.4fr] sm:gap-4">
                  <div className="font-medium text-gray-900">{row.type}</div>
                  <div>
                    <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-800">
                      {row.retention}
                    </span>
                  </div>
                  <div className="text-sm leading-6 text-gray-600">{row.purpose}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section background="gray" className="py-12 md:py-16">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 md:grid-cols-[1fr_1fr]">
            <div className="rounded-[2rem] border border-gray-200 bg-white p-8">
              <UserCheck className="mb-5 h-10 w-10 text-orange-600" aria-hidden />
              <h2 className="mb-4 text-2xl font-bold text-gray-900">{t.responsibilitiesTitle}</h2>
              <ul className="space-y-3">
                {t.responsibilities.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-gray-700">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[2rem] border border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 p-8">
              <Shield className="mb-5 h-10 w-10 text-orange-600" aria-hidden />
              <h2 className="mb-4 text-2xl font-bold text-gray-900">{t.statementTitle}</h2>
              <p className="leading-relaxed text-gray-700">
                <em>&quot;{t.statement}&quot;</em>
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section className="py-12 md:py-16">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-[2rem] bg-gradient-to-br from-orange-500 to-red-500 p-8 text-center text-white md:p-12">
            <ClipboardCheck className="mx-auto mb-6 h-12 w-12 text-orange-100" aria-hidden />
            <h2 className="mb-4 text-2xl font-bold sm:text-3xl">{t.ctaTitle}</h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-orange-100">{t.ctaBody}</p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <a
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-medium text-orange-600 transition hover:bg-gray-100"
              >
                {t.contact}
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </a>
              <a
                href="/terms"
                className="inline-flex items-center justify-center rounded-xl border border-orange-300 bg-orange-400 px-6 py-3 font-medium text-white transition hover:bg-orange-300"
              >
                {t.terms}
              </a>
            </div>
            <div className="mt-8 border-t border-orange-400 pt-6">
              <p className="text-sm text-orange-100">
                <Phone className="mr-2 inline h-4 w-4" aria-hidden />
                +971 55 915 2985 • tech@visiondrive.ae
              </p>
            </div>
          </div>
        </div>
      </Section>
    </main>
  )
}
