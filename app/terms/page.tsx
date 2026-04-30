'use client'

import Section from '../components/common/Section'
import {
  AlertTriangle,
  ArrowUpRight,
  ChevronRight,
  CreditCard,
  Lock,
  Scale,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { usePublicDocumentTitle } from '../hooks/usePublicDocumentTitle'

const copy = {
  en: {
    documentTitle: 'Practice OS Terms of Service - VisionDrive',
    kicker: 'Terms of Service',
    title: 'VisionDrive Practice OS Terms of Service',
    intro:
      'Effective date: 30 Apr 2026 - governed by UAE law. These terms cover VisionDrive Practice OS, practitioner workspaces, patient portals, booking links, public profiles, payments, automations, and related software services.',
    cards: [
      {
        icon: ShieldCheck,
        title: 'Practitioner controlled',
        description: 'You control your patient records, policies, pricing, public profile content, and consent decisions.',
      },
      {
        icon: Lock,
        title: 'Patient data matters',
        description: 'Portal links, exports, photos, and public pages must be reviewed before sharing with patients or the public.',
      },
      {
        icon: Sparkles,
        title: 'AI needs approval',
        description: 'AI-assisted notes, messages, quotes, and receptionist workflows are suggestions, not clinical decisions.',
      },
      {
        icon: CreditCard,
        title: 'Payments are administrative',
        description: 'Wallets, packages, fees, memberships, and receipts support operations, but you remain responsible for disputes.',
      },
    ],
    sections: [
      {
        title: '1. Acceptance of Terms',
        body: 'By accessing or using VisionDrive Practice OS, public booking pages, patient portal links, practitioner workspaces, related APIs, or support services, you agree to these Terms of Service. If you use the service on behalf of a practice, company, clinic, or practitioner, you confirm that you are authorized to accept these terms for that organization.',
        details: ['If you do not agree, you must not use the service.', 'These terms apply together with our Privacy Policy and any signed order form or commercial agreement.'],
      },
      {
        title: '2. Service Description',
        body: 'VisionDrive Technologies FZ-LLC provides Practice OS: practice operations software for solo practitioners and small clinics in the UAE. Features may include scheduling, patient records, treatment notes, photos, consent forms, patient portal links, reminders, payments, inventory, packages, memberships, loyalty, public profile pages, analytics, and workflow automation.',
        details: ['We may add, modify, limit, or discontinue features as the product evolves.', 'Some features may be marked beta, preview, manual, or approval-required.'],
      },
      {
        title: '3. User Accounts',
        body: 'You must create an account to use practitioner workspace features. You are responsible for your login credentials, workspace access, staff permissions, and all activity under your account.',
        details: ['You must provide accurate account and billing information.', 'You must be at least 18 years old to create an account.', 'You must notify us promptly if you suspect unauthorized access.'],
      },
      {
        title: '4. Practitioner Responsibilities',
        body: 'Practice OS is an operational system, not a substitute for professional judgment. Practitioners remain responsible for clinical decisions, patient consent, treatment outcomes, regulatory obligations, appointment policies, pricing, and communications sent to patients.',
        details: ['You must verify records before relying on them.', 'You must collect appropriate consent before uploading or publishing patient photos.', 'You must not place sensitive internal notes in patient-visible fields.'],
      },
      {
        title: '5. Acceptable Use',
        body: 'You agree not to misuse the service, interfere with security, attempt unauthorized access, scrape or reverse-engineer the product, upload unlawful content, create false records, impersonate others, send spam, or use patient data outside a lawful practice purpose.',
        details: ['You must not share accounts or credentials.', 'You must not use the service to harass, mislead, or discriminate against patients.', 'We may suspend access if we reasonably believe the service is being abused.'],
      },
      {
        title: '6. Patient Data and Confidentiality',
        body: 'You own and control the patient and practice data you enter into Practice OS. VisionDrive processes that data to provide, secure, support, and improve the service, subject to our Privacy Policy and applicable law.',
        details: ['Patient records, notes, photos, payments, forms, portal links, and messages must be handled as confidential.', 'Patient-safe exports and public links are designed to limit exposure, but you remain responsible for reviewing what you share.', 'We may access workspace data only as needed for support, security, legal compliance, or service operation.'],
      },
      {
        title: '7. Patient Portal, Booking Links, and Public Profile',
        body: 'Practice OS may generate patient portal links, booking links, Google/Instagram campaign links, WhatsApp messages, public practitioner profiles, and marketing-consented media galleries. These links are convenience features and must be configured and reviewed by the practitioner.',
        details: ['You are responsible for revoking or expiring links when access should end.', 'You must not publish patient photos or reviews unless you have the required consent.', 'Public profile content, services, pricing, and policies are your responsibility.'],
      },
      {
        title: '8. Payments, Wallets, Packages, and Subscriptions',
        body: 'Practice OS may help record deposits, balances, receipts, price quotes, packages, memberships, subscriptions, gift cards, loyalty points, and saved payment method references. These tools support administration and do not replace your own accounting, tax, or refund obligations.',
        details: ['Payment processing may be provided by third-party payment providers.', 'You are responsible for your prices, cancellation policies, no-show fees, refunds, chargebacks, and customer disputes.', 'Autopay or saved-method features may require patient authorization and provider approval before live charging.'],
      },
      {
        title: '9. Automation and AI-Assisted Features',
        body: 'Some features may use automation or AI assistance for drafts, summaries, marketing messages, receptionist workflows, note support, reminders, waitlist offers, or practitioner approval queues. These outputs are suggestions only and must be reviewed by the practitioner before use where required.',
        details: ['AI outputs may be incomplete or inaccurate.', 'Do not rely on AI outputs as medical advice or diagnosis.', 'You are responsible for approving messages, quotes, treatment notes, and patient-facing content.'],
      },
      {
        title: '10. Fees, Billing, and Cancellations',
        body: 'Fees are based on your selected plan, signed agreement, or active subscription. You agree to pay applicable fees and charges on time. Unless stated otherwise in a written agreement, fees are non-refundable except where required by law or explicitly approved by VisionDrive.',
        details: ['Plan limits, trial periods, discounts, and cancellation terms may vary.', 'We may suspend or downgrade access for overdue amounts.', 'You remain responsible for outstanding fees incurred before cancellation or termination.'],
      },
      {
        title: '11. Third-Party Services',
        body: 'Practice OS may integrate with third-party services such as payment providers, messaging tools, maps, email providers, storage providers, analytics, AI services, or external calendars. Your use of those services may be subject to their terms and availability.',
        details: ['We are not responsible for third-party outages, fees, policy changes, or processing delays.', 'Some integrations may require separate setup, approval, or credentials.'],
      },
      {
        title: '12. Intellectual Property',
        body: 'VisionDrive owns the software, product design, workflows, interface, documentation, brand, and technology behind Practice OS. You may not copy, modify, resell, reverse-engineer, or create competing services from the product except as permitted by law.',
        details: ['You retain ownership of your patient and practice data.', 'Feedback or suggestions you provide may be used by VisionDrive without obligation.'],
      },
      {
        title: '13. Disclaimers and Limitation of Liability',
        body: 'Practice OS is provided as operational software. We do not provide medical, legal, accounting, or tax advice. To the maximum extent permitted by law, VisionDrive is not liable for treatment decisions, practitioner actions, patient disputes, lost revenue, indirect damages, third-party failures, or events outside our reasonable control.',
        details: ['Our total liability is limited to the amount you paid to VisionDrive in the 12 months before the claim.', 'The service is provided on an "as is" and "as available" basis, subject to applicable law.'],
      },
      {
        title: '14. Indemnification',
        body: 'You agree to indemnify and hold harmless VisionDrive Technologies FZ-LLC, its officers, employees, contractors, and partners from claims, damages, losses, liabilities, and expenses arising from your use of the service, your patient relationships, your professional services, your content, or your violation of these terms or applicable law.',
        details: [],
      },
      {
        title: '15. Suspension and Termination',
        body: 'We may suspend or terminate access for non-payment, security risk, suspected abuse, legal requirement, or breach of these terms. You may request cancellation by contacting support. After termination, your right to use the service ends, but outstanding payment obligations and provisions intended to survive remain in effect.',
        details: ['Data export or retention after termination may depend on your plan, legal obligations, and technical availability.', 'We may delete inactive or terminated workspace data after reasonable notice where permitted by law.'],
      },
      {
        title: '16. Governing Law and Disputes',
        body: 'These Terms are governed by the laws of the United Arab Emirates and the Emirate of Ras Al Khaimah, without regard to conflict-of-law principles. Disputes will be handled in the competent courts or agreed dispute-resolution forum in the UAE, unless a written agreement states otherwise.',
        details: [],
      },
      {
        title: '17. Changes to Terms',
        body: 'We may update these Terms from time to time. Material changes may be notified by email, website notice, or in-app message. Continued use after the effective date of updated terms means you accept the updated terms.',
        details: ['If you do not agree to updated terms, you must stop using the service.'],
      },
      {
        title: '18. Contact and Support',
        body: 'For questions about these Terms, support requests, account issues, or legal inquiries, contact VisionDrive using the details below.',
        details: ['General support: tech@visiondrive.ae', 'Legal inquiries: legal@visiondrive.ae', 'Phone: +971 55 915 2985'],
      },
    ],
    warning:
      'These Terms of Service are written for the current Practice OS product. They are not medical, legal, accounting, or tax advice. Practitioners should review their own professional obligations before using any patient-facing workflow.',
    agreement:
      'These Terms of Service constitute a legally binding agreement between you and VisionDrive Technologies FZ-LLC. Please read them carefully before using our services.',
    legalAddress: 'Legal address and contact:',
    address: 'Compass Coworking Centre\nRas Al Khaimah, United Arab Emirates',
    privacy: 'Privacy Policy',
    compliance: 'Security and Compliance',
  },
  ru: {
    documentTitle: 'Условия обслуживания Practice OS - VisionDrive',
    kicker: 'Условия обслуживания',
    title: 'Условия обслуживания VisionDrive Practice OS',
    intro:
      'Дата вступления в силу: 30 апреля 2026 - регулируется правом ОАЭ. Эти условия распространяются на VisionDrive Practice OS, кабинеты специалистов, порталы пациентов, ссылки для записи, публичные профили, оплаты, автоматизации и связанные программные услуги.',
    cards: [
      {
        icon: ShieldCheck,
        title: 'Под контролем специалиста',
        description: 'Вы контролируете карты пациентов, правила, цены, публичный профиль и решения по согласиям.',
      },
      {
        icon: Lock,
        title: 'Данные пациентов важны',
        description: 'Портальные ссылки, экспорты, фото и публичные страницы нужно проверять до отправки пациентам или публикации.',
      },
      {
        icon: Sparkles,
        title: 'AI требует проверки',
        description: 'AI-заметки, сообщения, сметы и сценарии ресепшена являются подсказками, а не клиническими решениями.',
      },
      {
        icon: CreditCard,
        title: 'Оплаты - административный инструмент',
        description: 'Кошельки, пакеты, сборы, подписки и квитанции помогают работе, но споры остаются вашей ответственностью.',
      },
    ],
    sections: [
      {
        title: '1. Принятие условий',
        body: 'Используя VisionDrive Practice OS, публичные страницы записи, ссылки портала пациента, кабинеты специалистов, API или поддержку, вы соглашаетесь с этими Условиями обслуживания. Если вы используете сервис от имени практики, компании, клиники или специалиста, вы подтверждаете полномочия принять эти условия.',
        details: ['Если вы не согласны, не используйте сервис.', 'Эти условия применяются вместе с Политикой конфиденциальности и любым подписанным коммерческим соглашением.'],
      },
      {
        title: '2. Описание сервиса',
        body: 'VisionDrive Technologies FZ-LLC предоставляет Practice OS: ПО для управления частной практикой и небольшими клиниками в ОАЭ. Функции могут включать расписание, карты пациентов, заметки, фото, согласия, ссылки портала, напоминания, оплаты, склад, пакеты, подписки, лояльность, публичные профили, аналитику и автоматизацию.',
        details: ['Мы можем добавлять, менять, ограничивать или отключать функции по мере развития продукта.', 'Некоторые функции могут быть помечены как beta, preview, manual или approval-required.'],
      },
      {
        title: '3. Учетные записи',
        body: 'Для функций кабинета специалиста нужна учетная запись. Вы отвечаете за логин, права доступа, сотрудников и все действия под вашей учетной записью.',
        details: ['Предоставляйте точные данные аккаунта и оплаты.', 'Для создания аккаунта вам должно быть не менее 18 лет.', 'Сообщайте нам, если подозреваете несанкционированный доступ.'],
      },
      {
        title: '4. Ответственность специалиста',
        body: 'Practice OS - операционная система, а не замена профессиональному суждению. Специалист отвечает за клинические решения, согласия пациентов, результаты процедур, регуляторные обязанности, правила записи, цены и сообщения пациентам.',
        details: ['Проверяйте записи перед использованием.', 'Получайте согласие до загрузки или публикации фото пациента.', 'Не размещайте чувствительные внутренние заметки в полях, видимых пациенту.'],
      },
      {
        title: '5. Допустимое использование',
        body: 'Нельзя злоупотреблять сервисом, нарушать безопасность, пытаться получить несанкционированный доступ, копировать или вскрывать продукт, загружать незаконный контент, создавать ложные записи, выдавать себя за других, рассылать спам или использовать данные пациентов вне законной цели практики.',
        details: ['Нельзя делиться учетными записями или паролями.', 'Нельзя использовать сервис для давления, обмана или дискриминации пациентов.', 'Мы можем приостановить доступ при разумном подозрении на злоупотребление.'],
      },
      {
        title: '6. Данные пациентов и конфиденциальность',
        body: 'Вы владеете и управляете данными пациентов и практики, которые вводите в Practice OS. VisionDrive обрабатывает эти данные для предоставления, защиты, поддержки и улучшения сервиса согласно Политике конфиденциальности и закону.',
        details: ['Карты пациентов, заметки, фото, оплаты, формы, ссылки портала и сообщения должны считаться конфиденциальными.', 'Экспорты и публичные ссылки ограничивают раскрытие, но вы отвечаете за проверку того, чем делитесь.', 'Мы можем обращаться к данным кабинета только для поддержки, безопасности, правового соответствия или работы сервиса.'],
      },
      {
        title: '7. Портал пациента, ссылки записи и публичный профиль',
        body: 'Practice OS может создавать ссылки портала пациента, ссылки записи, ссылки кампаний Google/Instagram, сообщения WhatsApp, публичные профили специалиста и галереи медиа с маркетинговым согласием. Эти ссылки являются удобством и должны настраиваться и проверяться специалистом.',
        details: ['Вы отвечаете за отзыв или истечение ссылок, когда доступ должен закончиться.', 'Не публикуйте фото или отзывы без нужного согласия.', 'Содержание публичного профиля, услуги, цены и правила - ваша ответственность.'],
      },
      {
        title: '8. Оплаты, кошельки, пакеты и подписки',
        body: 'Practice OS может помогать фиксировать депозиты, балансы, квитанции, сметы, пакеты, подписки, подарочные карты, баллы лояльности и ссылки на сохраненные методы оплаты. Эти инструменты помогают администрированию, но не заменяют ваш учет, налоги или правила возврата.',
        details: ['Оплаты могут обрабатываться сторонними провайдерами.', 'Вы отвечаете за цены, правила отмены, штрафы за неявку, возвраты, chargeback и споры.', 'Autopay или сохраненные методы оплаты могут требовать согласия пациента и подтверждения провайдера до реального списания.'],
      },
      {
        title: '9. Автоматизация и AI-функции',
        body: 'Некоторые функции могут использовать автоматизацию или AI для черновиков, резюме, маркетинговых сообщений, ресепшена, заметок, напоминаний, листа ожидания или очереди на подтверждение специалистом. Эти результаты являются подсказками и должны проверяться специалистом.',
        details: ['AI-результаты могут быть неполными или неточными.', 'Не полагайтесь на AI как на медицинский совет или диагноз.', 'Вы отвечаете за подтверждение сообщений, смет, заметок и контента для пациента.'],
      },
      {
        title: '10. Тарифы, биллинг и отмена',
        body: 'Стоимость зависит от выбранного плана, подписанного соглашения или активной подписки. Вы соглашаетесь своевременно оплачивать применимые суммы. Если письменное соглашение не говорит иное, платежи не возвращаются, кроме случаев, требуемых законом или явно одобренных VisionDrive.',
        details: ['Лимиты, пробные периоды, скидки и условия отмены могут отличаться.', 'Мы можем приостановить или ограничить доступ при просрочке.', 'Вы отвечаете за суммы, начисленные до отмены или прекращения.'],
      },
      {
        title: '11. Сторонние сервисы',
        body: 'Practice OS может интегрироваться с платежными провайдерами, мессенджерами, картами, email-сервисами, хранилищами, аналитикой, AI-сервисами или календарями. Их использование может регулироваться их собственными условиями и доступностью.',
        details: ['Мы не отвечаем за сбои, комиссии, изменения правил или задержки сторонних сервисов.', 'Некоторые интеграции требуют отдельной настройки, одобрения или учетных данных.'],
      },
      {
        title: '12. Интеллектуальная собственность',
        body: 'VisionDrive владеет ПО, дизайном продукта, процессами, интерфейсом, документацией, брендом и технологией Practice OS. Нельзя копировать, изменять, перепродавать, вскрывать или создавать конкурирующие сервисы на основе продукта, кроме случаев, разрешенных законом.',
        details: ['Вы сохраняете права на данные пациентов и практики.', 'Ваши идеи и обратная связь могут использоваться VisionDrive без обязательств.'],
      },
      {
        title: '13. Отказы и ограничение ответственности',
        body: 'Practice OS предоставляется как операционное ПО. Мы не предоставляем медицинские, юридические, бухгалтерские или налоговые консультации. В максимально допустимой законом степени VisionDrive не отвечает за решения по лечению, действия специалиста, споры с пациентами, упущенную выручку, косвенный ущерб, сбои третьих лиц или события вне нашего разумного контроля.',
        details: ['Наша общая ответственность ограничена суммой, уплаченной VisionDrive за 12 месяцев до претензии.', 'Сервис предоставляется "как есть" и "по доступности" с учетом применимого закона.'],
      },
      {
        title: '14. Возмещение',
        body: 'Вы соглашаетесь защищать VisionDrive Technologies FZ-LLC, ее руководителей, сотрудников, подрядчиков и партнеров от претензий, ущерба, потерь, обязательств и расходов, связанных с использованием сервиса, отношениями с пациентами, профессиональными услугами, вашим контентом или нарушением этих условий или закона.',
        details: [],
      },
      {
        title: '15. Приостановка и прекращение',
        body: 'Мы можем приостановить или прекратить доступ при неоплате, риске безопасности, подозрении на злоупотребление, правовом требовании или нарушении условий. Вы можете запросить отмену через поддержку. После прекращения право пользоваться сервисом заканчивается, но обязательства по оплате и положения, которые должны сохраняться, остаются в силе.',
        details: ['Экспорт или хранение данных после прекращения зависит от плана, закона и технической доступности.', 'Мы можем удалить данные неактивного или прекращенного кабинета после разумного уведомления, если закон это разрешает.'],
      },
      {
        title: '16. Применимое право и споры',
        body: 'Эти условия регулируются правом Объединенных Арабских Эмиратов и эмирата Рас-эль-Хайма без учета коллизионных норм. Споры рассматриваются компетентными судами или согласованным форумом разрешения споров в ОАЭ, если письменное соглашение не говорит иное.',
        details: [],
      },
      {
        title: '17. Изменения условий',
        body: 'Мы можем обновлять эти условия. О существенных изменениях можем сообщать по email, на сайте или в приложении. Продолжение использования после даты вступления обновленных условий означает их принятие.',
        details: ['Если вы не согласны с обновленными условиями, прекратите использование сервиса.'],
      },
      {
        title: '18. Контакты и поддержка',
        body: 'По вопросам условий, поддержки, аккаунта или юридическим запросам свяжитесь с VisionDrive по данным ниже.',
        details: ['Поддержка: tech@visiondrive.ae', 'Юридические вопросы: legal@visiondrive.ae', 'Телефон: +971 55 915 2985'],
      },
    ],
    warning:
      'Эти Условия обслуживания написаны для текущего продукта Practice OS. Они не являются медицинской, юридической, бухгалтерской или налоговой консультацией. Специалистам следует проверить свои профессиональные обязанности перед использованием любых процессов, видимых пациенту.',
    agreement:
      'Эти Условия обслуживания являются юридически обязательным соглашением между вами и VisionDrive Technologies FZ-LLC. Пожалуйста, внимательно прочитайте их перед использованием сервиса.',
    legalAddress: 'Юридический адрес и контакты:',
    address: 'Compass Coworking Centre\nРас-эль-Хайма, Объединенные Арабские Эмираты',
    privacy: 'Политика конфиденциальности',
    compliance: 'Безопасность и соответствие',
  },
} as const

type SectionItem = {
  title: string
  body: string
  details: readonly string[]
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
      {open && (
        <div className="mt-3 space-y-3">
          <p className="text-sm leading-relaxed text-gray-700 sm:text-base">{item.body}</p>
          {item.details.length > 0 && (
            <ul className="space-y-2 pl-6">
              {item.details.map((detail) => (
                <li key={detail} className="list-disc text-sm leading-relaxed text-gray-600">
                  {detail}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default function TermsPage() {
  const { publicLanguage } = useLanguage()
  const t = copy[publicLanguage]
  usePublicDocumentTitle(t.documentTitle)

  return (
    <main className="bg-white pt-24 text-gray-900">
      <Section className="py-8 sm:py-12 md:py-14">
        <div className="mx-auto max-w-5xl space-y-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">{t.kicker}</p>
          <h1 className="text-3xl font-bold leading-tight sm:text-5xl">{t.title}</h1>
          <p className="max-w-3xl text-base text-gray-600 sm:text-lg">{t.intro}</p>
        </div>
      </Section>

      <Section className="pb-8 sm:pb-12">
        <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.cards.map((card) => (
            <div key={card.title} className="rounded-2xl border border-orange-100 bg-orange-50/50 p-5">
              <card.icon className="mb-4 h-7 w-7 text-orange-600" aria-hidden />
              <h2 className="font-semibold text-gray-950">{card.title}</h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">{card.description}</p>
            </div>
          ))}
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
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" aria-hidden />
              <p className="text-amber-900">{t.warning}</p>
            </div>
          </div>
          <p>{t.agreement}</p>
          <div className="border-t border-gray-200 pt-4">
            <div className="mb-3 flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary-600" aria-hidden />
              <p className="font-medium text-gray-900">{t.legalAddress}</p>
            </div>
            <p className="mb-3 whitespace-pre-line">
              <strong>VisionDrive Technologies FZ-LLC</strong>
              <br />
              {t.address}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
              <a href="mailto:legal@visiondrive.ae" className="font-medium text-primary-600 transition-colors hover:text-primary-700">
                legal@visiondrive.ae
              </a>
              <a href="/privacy" className="inline-flex items-center gap-1 font-medium text-primary-600 transition-colors hover:text-primary-700">
                {t.privacy}
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </a>
              <a href="/compliance" className="inline-flex items-center gap-1 font-medium text-primary-600 transition-colors hover:text-primary-700">
                {t.compliance}
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </a>
            </div>
          </div>
        </div>
      </Section>
    </main>
  )
}
