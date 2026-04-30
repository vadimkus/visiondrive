'use client'

import Section from '../components/common/Section'
import {
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileCheck,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Shield,
} from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { usePublicDocumentTitle } from '../hooks/usePublicDocumentTitle'

const copy = {
  en: {
    documentTitle: 'Contact VisionDrive - Practice OS Demo',
    heroTitle: 'Start Running',
    heroAccent: ' Your Practice',
    heroSuffix: ' Today',
    heroText:
      "Whether you are a solo practitioner or an independent private practice, we're ready to help you organize bookings, records, payments, stock, and follow-up.",
    sendEmail: 'Send Email',
    contactMethods: [
      {
        label: 'Email',
        value: 'tech@visiondrive.ae',
        description: 'For inquiries and demonstrations',
        href: 'mailto:tech@visiondrive.ae',
        icon: Mail,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
      },
      {
        label: 'WhatsApp',
        value: '+971 55 915 2985',
        description: 'Quick responses during business hours',
        href: 'https://wa.me/971559152985',
        icon: MessageCircle,
        color: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-200',
      },
      {
        label: 'Phone',
        value: '+971 55 915 2985',
        description: 'Mon-Fri, 9:00 AM - 6:00 PM GST',
        href: 'tel:+971559152985',
        icon: Phone,
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        border: 'border-purple-200',
      },
    ],
    office: 'Office',
    hq: 'VisionDrive HQ',
    address: 'Compass Coworking, RAK, UAE',
    features: [
      { icon: Clock, text: 'Response within 1 business day' },
      { icon: ClipboardList, text: 'Practice workflow review' },
      { icon: Shield, text: 'UAE data residency compliant' },
    ],
    helpTitle: 'How Can We Help?',
    helpIntro: 'We work with solo practitioners and independent private practices across the UAE',
    reasons: [
      {
        icon: CalendarDays,
        title: 'Practice Setup',
        description: 'Configure services, availability, booking links, patient records, and daily workflow.',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
      },
      {
        icon: FileCheck,
        title: 'Records & Documents',
        description: 'Set up patient-safe exports, consent templates, treatment notes, and portal sharing.',
        color: 'text-green-600',
        bg: 'bg-green-50',
      },
      {
        icon: Bell,
        title: 'Reminders & Follow-Up',
        description: 'Configure WhatsApp-ready reminders, aftercare messages, waitlist fill, and review requests.',
        color: 'text-orange-600',
        bg: 'bg-orange-50',
      },
      {
        icon: Shield,
        title: 'Technical Support',
        description: 'Get onboarding support for secure workflows, data residency, and private portal access.',
        color: 'text-purple-600',
        bg: 'bg-purple-50',
      },
    ],
    faqTitle: 'Frequently Asked Questions',
    faqIntro: 'Quick answers to common questions about Practice OS onboarding',
    faqs: [
      {
        q: 'How quickly can I see a demo?',
        a: 'We can usually walk through the product and your workflow within one business day.',
      },
      {
        q: 'What types of practitioners do you serve?',
        a: 'We serve solo practitioners, home-visit providers, aesthetics professionals, wellness operators, and independent private practices across the UAE.',
      },
      {
        q: 'Can you help configure my workflow?',
        a: 'Yes. We can review your services, intake forms, follow-up flow, payments, packages, and patient-card structure during onboarding.',
      },
      {
        q: 'Can I use it on mobile?',
        a: 'Yes. Practice OS is designed for mobile browser use with a practitioner-focused dashboard and patient-card workflow.',
      },
    ],
    missingQuestion: 'Have a question not listed here?',
    emailUs: 'Send us an email',
    ctaTitle: 'Ready to Bring the Practice Under Control?',
    ctaBody:
      'Request a walkthrough and see how VisionDrive can support your booking, treatment, payment, and follow-up workflow.',
    requestDemo: 'Request a Demo',
    explore: 'Explore Product',
  },
  ru: {
    documentTitle: 'Контакты VisionDrive - демо Practice OS',
    heroTitle: 'Начните управлять',
    heroAccent: ' своей практикой',
    heroSuffix: ' уже сегодня',
    heroText:
      'Если вы частный специалист или независимая практика, мы поможем навести порядок в записях, картах пациентов, оплатах, складе и повторных касаниях.',
    sendEmail: 'Написать на почту',
    contactMethods: [
      {
        label: 'Почта',
        value: 'tech@visiondrive.ae',
        description: 'Для вопросов и демонстрации',
        href: 'mailto:tech@visiondrive.ae',
        icon: Mail,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
      },
      {
        label: 'WhatsApp',
        value: '+971 55 915 2985',
        description: 'Быстрые ответы в рабочее время',
        href: 'https://wa.me/971559152985',
        icon: MessageCircle,
        color: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-200',
      },
      {
        label: 'Телефон',
        value: '+971 55 915 2985',
        description: 'Пн-Пт, 9:00-18:00 GST',
        href: 'tel:+971559152985',
        icon: Phone,
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        border: 'border-purple-200',
      },
    ],
    office: 'Офис',
    hq: 'Офис VisionDrive',
    address: 'Compass Coworking, РАК, ОАЭ',
    features: [
      { icon: Clock, text: 'Ответ в течение 1 рабочего дня' },
      { icon: ClipboardList, text: 'Разбор процесса практики' },
      { icon: Shield, text: 'Хранение данных в ОАЭ' },
    ],
    helpTitle: 'Чем мы можем помочь?',
    helpIntro: 'Мы работаем с частными специалистами и независимыми практиками в ОАЭ',
    reasons: [
      {
        icon: CalendarDays,
        title: 'Настройка практики',
        description: 'Настроим услуги, доступность, ссылки записи, карты пациентов и ежедневный процесс.',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
      },
      {
        icon: FileCheck,
        title: 'Записи и документы',
        description: 'Настроим безопасные экспорты, шаблоны согласий, заметки по процедурам и портал.',
        color: 'text-green-600',
        bg: 'bg-green-50',
      },
      {
        icon: Bell,
        title: 'Напоминания и повторные касания',
        description: 'Настроим тексты для WhatsApp, рекомендации после процедуры, заполнение отмен и запросы отзывов.',
        color: 'text-orange-600',
        bg: 'bg-orange-50',
      },
      {
        icon: Shield,
        title: 'Техническая поддержка',
        description: 'Поможем с безопасными процессами, хранением данных в ОАЭ и приватным доступом.',
        color: 'text-purple-600',
        bg: 'bg-purple-50',
      },
    ],
    faqTitle: 'Частые вопросы',
    faqIntro: 'Короткие ответы о подключении Practice OS',
    faqs: [
      {
        q: 'Как быстро можно увидеть демо?',
        a: 'Обычно мы можем показать продукт и разобрать ваш процесс в течение одного рабочего дня.',
      },
      {
        q: 'Для каких специалистов продукт?',
        a: 'Для частных специалистов, выездных услуг, эстетических направлений, wellness-практик и независимых практик в ОАЭ.',
      },
      {
        q: 'Вы поможете настроить мой процесс?',
        a: 'Да. Во время подключения можно разобрать услуги, формы, повторные касания, оплаты, пакеты и структуру карты пациента.',
      },
      {
        q: 'Можно пользоваться с телефона?',
        a: 'Да. Practice OS рассчитан на мобильный браузер, кабинет специалиста и удобную карту пациента.',
      },
    ],
    missingQuestion: 'Не нашли ответ на свой вопрос?',
    emailUs: 'Напишите нам',
    ctaTitle: 'Готовы взять практику под контроль?',
    ctaBody:
      'Запросите демонстрацию и посмотрите, как VisionDrive поддержит запись, процедуры, оплаты и повторные касания.',
    requestDemo: 'Запросить демо',
    explore: 'Изучить продукт',
  },
} as const

export default function ContactPage() {
  const { publicLanguage } = useLanguage()
  const t = copy[publicLanguage]
  usePublicDocumentTitle(t.documentTitle)

  return (
    <main className="bg-white pt-[60px] text-gray-900 sm:pt-[72px]">
      <Section className="py-10 sm:py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid items-start gap-8 md:grid-cols-2 md:gap-12">
            <div className="text-center md:text-left">
              <h1 className="mb-4 text-[2rem] font-semibold leading-[1.1] tracking-tight text-gray-900 sm:mb-6 md:text-5xl lg:text-6xl">
                {t.heroTitle}
                <span className="block text-orange-500 sm:inline">{t.heroAccent}</span>
                {t.heroSuffix}
              </h1>
              <p className="mb-6 text-base leading-relaxed text-gray-600 sm:mb-8 sm:text-lg">{t.heroText}</p>

              <div className="mb-8 hidden flex-wrap gap-4 sm:flex">
                {t.features.map((feature) => (
                  <div key={feature.text} className="flex items-center gap-2 text-sm text-gray-600">
                    <feature.icon className="h-4 w-4 text-orange-600" aria-hidden />
                    {feature.text}
                  </div>
                ))}
              </div>

              <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:gap-4 md:mb-0">
                <a
                  href="mailto:tech@visiondrive.ae"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl bg-orange-600 px-6 py-3.5 text-center font-semibold leading-tight text-white shadow-lg shadow-orange-600/25 transition-all hover:bg-orange-700 active:scale-[0.98]"
                >
                  <Send className="mr-2 h-5 w-5 shrink-0" aria-hidden />
                  {t.sendEmail}
                </a>
                <a
                  href="https://wa.me/971559152985"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl bg-green-600 px-6 py-3.5 text-center font-semibold leading-tight text-white transition-all hover:bg-green-700 active:scale-[0.98]"
                >
                  <MessageCircle className="mr-2 h-5 w-5 shrink-0" aria-hidden />
                  WhatsApp
                </a>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {t.contactMethods.map((contact) => (
                <a
                  key={contact.label}
                  href={contact.href}
                  target={contact.href.startsWith('http') ? '_blank' : undefined}
                  rel={contact.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className={`group flex items-center gap-4 rounded-2xl border bg-white p-4 transition-all duration-200 hover:shadow-lg active:scale-[0.99] sm:p-5 ${contact.border}`}
                >
                  <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl sm:h-14 sm:w-14 ${contact.bg}`}>
                    <contact.icon className={`h-6 w-6 sm:h-7 sm:w-7 ${contact.color}`} aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{contact.label}</div>
                    <div className="break-words font-semibold leading-snug text-gray-900 transition-colors group-hover:text-orange-600">{contact.value}</div>
                    <div className="text-xs leading-snug text-gray-500 sm:text-sm">{contact.description}</div>
                  </div>
                  <ArrowRight className="h-5 w-5 flex-shrink-0 text-gray-400 transition-all group-hover:translate-x-1 group-hover:text-orange-600" aria-hidden />
                </a>
              ))}

              <a
                href="https://maps.app.goo.gl/TB79xTZArqX6wJZo6"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-4 transition-all duration-200 hover:shadow-lg active:scale-[0.99] sm:p-5"
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-red-50 sm:h-14 sm:w-14">
                  <MapPin className="h-6 w-6 text-red-600 sm:h-7 sm:w-7" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{t.office}</div>
                  <div className="font-semibold text-gray-900 transition-colors group-hover:text-orange-600">{t.hq}</div>
                  <div className="text-xs text-gray-500 sm:text-sm">{t.address}</div>
                </div>
                <ArrowRight className="h-5 w-5 flex-shrink-0 text-gray-400 transition-all group-hover:translate-x-1 group-hover:text-orange-600" aria-hidden />
              </a>
            </div>
          </div>
        </div>
      </Section>

      <Section background="gray" className="py-12 md:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">{t.helpTitle}</h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">{t.helpIntro}</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {t.reasons.map((reason) => (
              <div key={reason.title} className="rounded-xl border border-gray-200 bg-white p-6 transition-all duration-200 hover:border-orange-300 hover:shadow-md">
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg ${reason.bg}`}>
                  <reason.icon className={`h-6 w-6 ${reason.color}`} aria-hidden />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">{reason.title}</h3>
                <p className="text-sm leading-relaxed text-gray-600">{reason.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section className="py-12 md:py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">{t.faqTitle}</h2>
            <p className="text-lg text-gray-600">{t.faqIntro}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {t.faqs.map((faq) => (
              <div key={faq.q} className="rounded-xl border border-orange-100 bg-orange-50 p-6">
                <div className="mb-3 flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-6 w-6 flex-shrink-0 text-orange-600" aria-hidden />
                  <h3 className="font-semibold text-gray-900">{faq.q}</h3>
                </div>
                <p className="ml-9 leading-relaxed text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="mb-4 text-gray-500">{t.missingQuestion}</p>
            <a href="mailto:tech@visiondrive.ae" className="inline-flex items-center font-medium text-orange-600 hover:text-orange-700">
              {t.emailUs} <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
            </a>
          </div>
        </div>
      </Section>

      <Section background="gray" className="py-12 md:py-16">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl bg-gradient-to-br from-orange-600 to-orange-700 p-8 text-center text-white md:p-12">
            <h2 className="mb-4 text-2xl font-bold sm:text-3xl">{t.ctaTitle}</h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-orange-100">{t.ctaBody}</p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <a href="mailto:tech@visiondrive.ae" className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 font-medium text-orange-600 transition-colors hover:bg-gray-100">
                <Mail className="mr-2 h-5 w-5" aria-hidden />
                {t.requestDemo}
              </a>
              <a href="/about" className="inline-flex items-center justify-center rounded-lg border border-orange-400 bg-orange-500 px-6 py-3 font-medium text-white transition-colors hover:bg-orange-400">
                {t.explore}
              </a>
            </div>
          </div>
        </div>
      </Section>
    </main>
  )
}
