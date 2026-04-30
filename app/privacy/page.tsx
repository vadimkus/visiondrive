'use client'

import Section from '../components/common/Section'
import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { usePublicDocumentTitle } from '../hooks/usePublicDocumentTitle'

const copy = {
  en: {
    documentTitle: 'Privacy Policy - VisionDrive',
    kicker: 'Privacy Policy',
    title: 'Your data, protected by design',
    effective: 'Effective date: 30 Apr 2026 - updated for UAE PDPL.',
    sections: [
      {
        title: '1. Who we are',
        body: 'VisionDrive Technologies FZ-LLC provides practice operations software in the UAE. This notice explains how we handle personal data when you use our platform, practitioner portals, patient portal links, and support channels.',
      },
      {
        title: '2. Data we collect',
        body: 'Account and contact details, patient/client records entered by the practice, appointment and payment records, uploaded documents or photos, device and network identifiers, and support communications.',
      },
      {
        title: '3. How we use data',
        body: 'To operate the service, prevent fraud, provide support, process payments, improve reliability, and meet legal obligations. Aggregated analytics are used to plan capacity and performance without identifying individuals.',
      },
      {
        title: '4. Legal bases',
        body: 'We rely on contract, legitimate interests, consent where required, and legal obligations.',
      },
      {
        title: '5. Sharing',
        body: 'We may share data with service providers such as hosting, payments, messaging, and analytics, and with authorities where required by law. We do not sell personal data.',
      },
      {
        title: '6. Retention',
        body: 'We keep data only as long as needed for the purpose collected and to meet legal or accounting requirements, then delete or anonymize it.',
      },
      {
        title: '7. Security',
        body: 'We use encryption in transit and at rest, access controls, audit logging, and monitoring. No system is perfect, so please report suspected issues to security@visiondrive.ae.',
      },
      {
        title: '8. Your rights (UAE PDPL)',
        body: 'You may request access, correction, deletion, restriction, or portability where applicable. You may object to processing based on legitimate interests and withdraw consent at any time.',
      },
      {
        title: '9. Cookies and analytics',
        body: 'We use essential cookies for authentication and session continuity, and analytics cookies where allowed to improve performance.',
      },
      {
        title: '10. International transfers',
        body: 'If data is processed outside the UAE, we apply safeguards such as contractual protections and reputable cloud providers to maintain equivalent protection.',
      },
      {
        title: '11. Children',
        body: 'Our services are not directed to children under 16, and we do not knowingly collect their data.',
      },
      {
        title: '12. Contact',
        body: 'For privacy questions or requests, contact tech@visiondrive.ae or call +971 55 915 2985. For legal matters, contact legal@visiondrive.ae.',
      },
    ],
    updateNotice: 'We may update this notice to reflect changes in law or our practices. Material changes will be highlighted on this page.',
    questions: 'Questions about this policy?',
    contactPrefix: 'Contact our legal team at',
  },
  ru: {
    documentTitle: 'Политика конфиденциальности - VisionDrive',
    kicker: 'Политика конфиденциальности',
    title: 'Ваши данные защищены по умолчанию',
    effective: 'Дата вступления в силу: 30 апреля 2026 - обновлено с учетом UAE PDPL.',
    sections: [
      {
        title: '1. Кто мы',
        body: 'VisionDrive Technologies FZ-LLC предоставляет ПО для управления частной практикой в ОАЭ. Это уведомление объясняет, как мы обрабатываем персональные данные при использовании платформы, кабинетов специалистов, ссылок портала пациента и каналов поддержки.',
      },
      {
        title: '2. Какие данные мы собираем',
        body: 'Данные аккаунта и контактов, карты пациентов/клиентов, введенные практикой, записи и оплаты, загруженные документы или фото, идентификаторы устройства и сети, а также обращения в поддержку.',
      },
      {
        title: '3. Как мы используем данные',
        body: 'Для работы сервиса, предотвращения мошенничества, поддержки, обработки оплат, повышения надежности и выполнения правовых обязанностей. Агрегированная аналитика используется без идентификации людей.',
      },
      {
        title: '4. Правовые основания',
        body: 'Мы опираемся на договор, законные интересы, согласие там, где оно требуется, и правовые обязанности.',
      },
      {
        title: '5. Передача данных',
        body: 'Мы можем передавать данные поставщикам услуг: хостинг, оплаты, сообщения, аналитика, а также органам власти, если это требуется законом. Мы не продаем персональные данные.',
      },
      {
        title: '6. Хранение',
        body: 'Мы храним данные только столько, сколько нужно для цели сбора, правовых или бухгалтерских требований, затем удаляем или обезличиваем их.',
      },
      {
        title: '7. Безопасность',
        body: 'Мы используем шифрование при передаче и хранении, контроль доступа, аудит и мониторинг. Идеальных систем не бывает, поэтому сообщайте о подозрениях на security@visiondrive.ae.',
      },
      {
        title: '8. Ваши права (UAE PDPL)',
        body: 'Вы можете запрашивать доступ, исправление, удаление, ограничение или переносимость данных, где это применимо. Вы можете возражать против обработки на основе законного интереса и отзывать согласие.',
      },
      {
        title: '9. Cookies и аналитика',
        body: 'Мы используем необходимые cookies для входа и сессии, а также аналитические cookies, где это разрешено, для улучшения производительности.',
      },
      {
        title: '10. Международная передача',
        body: 'Если данные обрабатываются за пределами ОАЭ, мы применяем меры защиты: договорные условия и надежных облачных провайдеров для эквивалентной защиты.',
      },
      {
        title: '11. Дети',
        body: 'Наши сервисы не предназначены для детей младше 16 лет, и мы сознательно не собираем их данные.',
      },
      {
        title: '12. Контакты',
        body: 'По вопросам приватности обращайтесь на tech@visiondrive.ae или по телефону +971 55 915 2985. По юридическим вопросам: legal@visiondrive.ae.',
      },
    ],
    updateNotice: 'Мы можем обновлять это уведомление при изменении закона или наших процессов. Существенные изменения будут выделены на этой странице.',
    questions: 'Вопросы по этой политике?',
    contactPrefix: 'Свяжитесь с юридической командой:',
  },
} as const

type SectionItem = {
  title: string
  body: string
}

function CollapsibleCard({ item, defaultOpen = false }: { item: SectionItem; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  const { publicLanguage } = useLanguage()
  const toggleLabel = open
    ? publicLanguage === 'ru'
      ? 'Свернуть'
      : 'Collapse'
    : publicLanguage === 'ru'
      ? 'Развернуть'
      : 'Expand'

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-start justify-between gap-3 text-left"
        aria-expanded={open}
      >
        <div className="flex items-start gap-2">
          <ChevronRight
            className={`mt-1 h-4 w-4 flex-shrink-0 text-primary-600 transition-transform ${open ? 'rotate-90' : ''}`}
            aria-hidden
          />
          <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">{item.title}</h2>
        </div>
        <span className="sr-only">{toggleLabel}</span>
      </button>
      {open && <p className="mt-3 text-sm leading-relaxed text-gray-700 sm:text-base">{item.body}</p>}
    </div>
  )
}

export default function PrivacyPage() {
  const { publicLanguage } = useLanguage()
  const t = copy[publicLanguage]
  usePublicDocumentTitle(t.documentTitle)

  return (
    <main className="bg-white pt-24 text-gray-900">
      <Section className="py-8 sm:py-12 md:py-14">
        <div className="mx-auto max-w-5xl space-y-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">{t.kicker}</p>
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl">{t.title}</h1>
          <p className="text-base text-gray-600 sm:text-lg">{t.effective}</p>
        </div>
      </Section>

      <Section background="gray" className="py-8 sm:py-12 md:py-14">
        <div className="mx-auto max-w-5xl space-y-6">
          {t.sections.map((item, index) => (
            <CollapsibleCard key={item.title} item={item} defaultOpen={index === 0} />
          ))}
        </div>
      </Section>

      <Section className="py-8 sm:py-12 md:py-14">
        <div className="mx-auto max-w-4xl space-y-4 text-sm leading-relaxed text-gray-600">
          <p>{t.updateNotice}</p>
          <div className="border-t border-gray-200 pt-4">
            <p className="mb-2 font-medium text-gray-900">{t.questions}</p>
            <p>
              {t.contactPrefix}{' '}
              <a href="mailto:legal@visiondrive.ae" className="font-medium text-primary-600 transition-colors hover:text-primary-700">
                legal@visiondrive.ae
              </a>
            </p>
          </div>
        </div>
      </Section>
    </main>
  )
}
