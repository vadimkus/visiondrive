'use client'

import { useState } from 'react'
import Section from '../components/common/Section'
import {
  ArrowRight,
  Bell,
  Calendar,
  ChevronDown,
  CreditCard,
  FileText,
  HelpCircle,
  Mail,
  Repeat,
  Shield,
  Smartphone,
} from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { usePublicDocumentTitle } from '../hooks/usePublicDocumentTitle'

type FAQCategory = {
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  questions: {
    question: string
    answer: string
  }[]
}

const categories = {
  en: [
    {
      id: 'practice',
      title: 'Practice OS Basics',
      icon: Calendar,
      questions: [
        {
          question: 'What is VisionDrive Practice OS?',
          answer: 'Practice OS is a private workspace for solo practitioners to manage bookings, patient records, treatment notes, photos, prices, payments, inventory, reminders, and business reporting from one browser-based system.',
        },
        {
          question: 'Who is it built for?',
          answer: 'It is built for independent practitioners and small clinics in the UAE: aesthetics, wellness, home-visit services, private therapists, and specialists who need clinic discipline without enterprise software overhead.',
        },
        {
          question: 'Does it work on mobile?',
          answer: 'Yes. The authenticated workspace has a mobile-first practitioner mode with quick access to today, appointments, patients, and notes.',
        },
        {
          question: 'Can I use it for home visits?',
          answer: 'Yes. Patient records and appointments support area, home address, access notes, travel buffers, and route-aware scheduling context.',
        },
        {
          question: 'Is this a marketplace?',
          answer: 'No. Practice OS is a private operating system for the practitioner. Public booking and patient portal links are controlled by the practice.',
        },
      ],
    },
    {
      id: 'records',
      title: 'Records & Documents',
      icon: Shield,
      questions: [
        {
          question: 'What can I store in a patient card?',
          answer: 'A patient card can include contact details, area/address, anamnesis, staff-only notes, visits, treatment plans, photos, payments, packages, consents, quotes, and CRM history.',
        },
        {
          question: 'Where is our data stored?',
          answer: 'Practice OS is designed around UAE data residency and tenant-scoped records for private practice operations.',
        },
        {
          question: 'Can patients sign consent forms digitally?',
          answer: 'Yes. The system supports reusable consent templates and consent records linked to appointments or visits.',
        },
        {
          question: 'Can I export patient-safe records?',
          answer: 'Yes. Patient cards include patient-safe PDF export and full data export workflows, with internal notes excluded from patient-safe documents.',
        },
      ],
    },
    {
      id: 'workflow',
      title: 'Booking Workflow',
      icon: FileText,
      questions: [
        {
          question: 'Can clients book online?',
          answer: 'Yes. Practice OS supports private public-booking links with service selection, slot generation, intake questions, consent capture, and appointment creation.',
        },
        {
          question: 'How do reminders work?',
          answer: 'Reminders are WhatsApp-first in the current version. The system prepares message text and handoff links so the practitioner remains in control of sending.',
        },
        {
          question: 'Can clients reschedule or cancel?',
          answer: 'Patient portal links can collect reschedule, cancel, and message requests without directly changing the practitioner schedule.',
        },
        {
          question: 'Does it prevent double booking?',
          answer: 'Scheduling checks active appointments, blocked time, availability, lead time, travel buffers, and service duration before accepting a booking.',
        },
      ],
    },
    {
      id: 'mobile',
      title: 'Mobile Practitioner Mode',
      icon: Smartphone,
      questions: [
        {
          question: 'Can I run the day from an iPhone?',
          answer: 'Yes. The workspace is designed for mobile browsers with large tap targets, today-focused agenda, quick actions, and mobile-friendly patient cards.',
        },
        {
          question: 'What happens when internet is unreliable?',
          answer: 'PWA practitioner mode includes local offline visit drafts and queued photo upload handling so notes are not lost during poor connectivity.',
        },
        {
          question: 'Can I take before/after photos?',
          answer: 'Yes. Photos can be stored by kind, linked to visits, marked with protocol checklist items, and controlled for marketing consent.',
        },
      ],
    },
    {
      id: 'growth',
      title: 'Growth & Retention',
      icon: Repeat,
      questions: [
        {
          question: 'Can I follow up after treatment?',
          answer: 'Yes. Follow-up nudges, aftercare templates, reminder history, call logs, WhatsApp history, and dormant-patient workflows are part of the CRM layer.',
        },
        {
          question: 'Can I generate price quotes quickly?',
          answer: 'Yes. The quote builder creates professional estimates with service/custom lines, totals, PDF export, and WhatsApp/email text handoff.',
        },
        {
          question: 'Can I sell prepaid packages?',
          answer: 'Yes. Packages track sold sessions, remaining balance, expiry, discount reason, and automatic redemption when visits are completed.',
        },
      ],
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: Bell,
      questions: [
        {
          question: 'Can I receive push notifications?',
          answer: 'Yes. Browser push notifications can be enabled for practitioner alerts such as low stock and operational reminders.',
        },
        {
          question: 'Can clients get WhatsApp reminders?',
          answer: 'Yes. The system prepares WhatsApp reminder and follow-up text with one-click handoff.',
        },
      ],
    },
    {
      id: 'commercial',
      title: 'Pricing & Support',
      icon: CreditCard,
      questions: [
        {
          question: 'How is VisionDrive priced?',
          answer: 'Practice OS is currently in private onboarding. Pricing is discussed during consultation based on practice size, onboarding needs, and requested automation depth.',
        },
        {
          question: 'What support do you provide?',
          answer: 'We provide setup guidance, migration help for patient lists, workflow configuration, and UAE business-hours support.',
        },
      ],
    },
  ],
  ru: [
    {
      id: 'practice',
      title: 'Основы Practice OS',
      icon: Calendar,
      questions: [
        {
          question: 'Что такое VisionDrive Practice OS?',
          answer: 'Practice OS - приватный рабочий кабинет для частных специалистов: записи, карты пациентов, заметки по процедурам, фото, цены, оплаты, склад, напоминания и отчетность в одной браузерной системе.',
        },
        {
          question: 'Для кого это создано?',
          answer: 'Для независимых специалистов и небольших клиник в ОАЭ: эстетика, wellness, выездные услуги, частные терапевты и специалисты, которым нужна дисциплина клиники без тяжелой корпоративной системы.',
        },
        {
          question: 'Работает ли это на телефоне?',
          answer: 'Да. В кабинете есть mobile-first режим специалиста с быстрым доступом к сегодняшнему дню, записям, пациентам и заметкам.',
        },
        {
          question: 'Можно использовать для выездов?',
          answer: 'Да. Карты пациентов и записи поддерживают район, домашний адрес, заметки по доступу, буферы на дорогу и контекст маршрута.',
        },
        {
          question: 'Это маркетплейс?',
          answer: 'Нет. Practice OS - приватная операционная система специалиста. Публичные ссылки записи и портала контролирует сама практика.',
        },
      ],
    },
    {
      id: 'records',
      title: 'Записи и документы',
      icon: Shield,
      questions: [
        {
          question: 'Что можно хранить в карте пациента?',
          answer: 'Контакты, район/адрес, анамнез, внутренние заметки, визиты, планы лечения, фото, оплаты, пакеты, согласия, сметы и CRM-историю.',
        },
        {
          question: 'Где хранятся данные?',
          answer: 'Practice OS спроектирован вокруг хранения данных в ОАЭ и записей, ограниченных рамками конкретного кабинета.',
        },
        {
          question: 'Пациенты могут подписывать согласия цифровым способом?',
          answer: 'Да. Система поддерживает шаблоны согласий и записи согласий, связанные с записью или визитом.',
        },
        {
          question: 'Можно экспортировать безопасные для пациента документы?',
          answer: 'Да. Есть patient-safe PDF и полные экспорты, при этом внутренние заметки исключаются из документов для пациента.',
        },
      ],
    },
    {
      id: 'workflow',
      title: 'Процесс записи',
      icon: FileText,
      questions: [
        {
          question: 'Клиенты могут записываться онлайн?',
          answer: 'Да. Practice OS поддерживает приватные публичные ссылки с выбором услуги, слота, вопросами, согласием и созданием записи.',
        },
        {
          question: 'Как работают напоминания?',
          answer: 'Сейчас напоминания WhatsApp-first: система готовит текст и ссылку передачи, а специалист сохраняет контроль над отправкой.',
        },
        {
          question: 'Клиенты могут переносить или отменять запись?',
          answer: 'Ссылки портала пациента могут собирать запросы на перенос, отмену или сообщение без прямого изменения расписания.',
        },
        {
          question: 'Система защищает от двойной записи?',
          answer: 'Проверяются активные записи, блокировки времени, доступность, lead time, буферы дороги и длительность услуги.',
        },
      ],
    },
    {
      id: 'mobile',
      title: 'Мобильный режим специалиста',
      icon: Smartphone,
      questions: [
        {
          question: 'Можно вести день с iPhone?',
          answer: 'Да. Кабинет рассчитан на мобильный браузер: крупные элементы, расписание на сегодня, быстрые действия и удобные карты пациентов.',
        },
        {
          question: 'Что если интернет нестабилен?',
          answer: 'PWA-режим включает локальные черновики визита и очередь загрузки фото, чтобы заметки не потерялись.',
        },
        {
          question: 'Можно делать фото до/после?',
          answer: 'Да. Фото можно хранить по типу, связывать с визитами, отмечать чеклист протокола и контролировать маркетинговое согласие.',
        },
      ],
    },
    {
      id: 'growth',
      title: 'Рост и удержание',
      icon: Repeat,
      questions: [
        {
          question: 'Можно делать follow-up после процедуры?',
          answer: 'Да. Есть follow-up, aftercare-шаблоны, история напоминаний, звонки, WhatsApp-история и сценарии возвращения неактивных клиентов.',
        },
        {
          question: 'Можно быстро делать сметы?',
          answer: 'Да. Конструктор смет создает профессиональные оценки с услугами, строками, итогами, PDF и текстом для WhatsApp/email.',
        },
        {
          question: 'Можно продавать предоплаченные пакеты?',
          answer: 'Да. Пакеты отслеживают проданные сессии, остаток, срок, причину скидки и автоматическое списание при завершении визита.',
        },
      ],
    },
    {
      id: 'notifications',
      title: 'Уведомления',
      icon: Bell,
      questions: [
        {
          question: 'Можно получать push-уведомления?',
          answer: 'Да. Браузерные push-уведомления можно включить для важных событий специалиста, например низких остатков или операционных напоминаний.',
        },
        {
          question: 'Клиенты могут получать WhatsApp-напоминания?',
          answer: 'Да. Система готовит текст WhatsApp-напоминания и follow-up с передачей в один клик.',
        },
      ],
    },
    {
      id: 'commercial',
      title: 'Цена и поддержка',
      icon: CreditCard,
      questions: [
        {
          question: 'Сколько стоит VisionDrive?',
          answer: 'Practice OS сейчас подключается в закрытом режиме. Цена обсуждается на консультации с учетом размера практики, внедрения и уровня автоматизации.',
        },
        {
          question: 'Какую поддержку вы даете?',
          answer: 'Мы помогаем с настройкой, переносом списка пациентов, конфигурацией процессов и поддержкой в рабочие часы ОАЭ.',
        },
      ],
    },
  ],
} satisfies Record<'en' | 'ru', FAQCategory[]>

const pageCopy = {
  en: {
    documentTitle: 'FAQ - VisionDrive Practice OS',
    helpCenter: 'Help Center',
    titleBefore: 'Frequently Asked',
    titleAccent: 'Questions',
    intro:
      'Find answers to common questions about VisionDrive Practice OS, patient records, booking workflow, payments, retention, and mobile practitioner mode.',
    stillQuestions: 'Still Have Questions?',
    stillText: "Can't find what you're looking for? Our team is here to help with any questions about Practice OS or your solo-practitioner workflow.",
    contact: 'Contact Us',
    emailSupport: 'Email Support',
  },
  ru: {
    documentTitle: 'Вопросы - VisionDrive Practice OS',
    helpCenter: 'Центр помощи',
    titleBefore: 'Частые',
    titleAccent: 'вопросы',
    intro:
      'Ответы на частые вопросы о VisionDrive Practice OS, картах пациентов, записи, оплатах, удержании и мобильном режиме специалиста.',
    stillQuestions: 'Остались вопросы?',
    stillText: 'Не нашли нужный ответ? Мы поможем с вопросами о Practice OS и процессе вашей частной практики.',
    contact: 'Связаться',
    emailSupport: 'Написать в поддержку',
  },
} as const

function FAQItem({ question, answer, isOpen, onToggle }: {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={onToggle}
        className="flex w-full items-start justify-between px-1 py-5 text-left transition-colors hover:bg-gray-50"
      >
        <span className="pr-4 font-medium text-gray-900">{question}</span>
        <ChevronDown
          className={`h-5 w-5 flex-shrink-0 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-96 pb-5' : 'max-h-0'}`}>
        <p className="px-1 leading-relaxed text-gray-600">{answer}</p>
      </div>
    </div>
  )
}

export default function FAQPage() {
  const { publicLanguage } = useLanguage()
  const t = pageCopy[publicLanguage]
  usePublicDocumentTitle(t.documentTitle)
  const faqCategories = categories[publicLanguage]
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())
  const [activeCategory, setActiveCategory] = useState<string>('practice')

  const toggleItem = (id: string) => {
    const nextOpenItems = new Set(openItems)
    if (nextOpenItems.has(id)) {
      nextOpenItems.delete(id)
    } else {
      nextOpenItems.add(id)
    }
    setOpenItems(nextOpenItems)
  }

  const activeData = faqCategories.find((category) => category.id === activeCategory) ?? faqCategories[0]

  return (
    <main className="bg-white pt-24 text-gray-900">
      <Section className="py-12 md:py-16">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700">
            <HelpCircle className="h-4 w-4" aria-hidden />
            {t.helpCenter}
          </div>
          <h1 className="mb-6 text-4xl font-bold leading-tight sm:text-5xl">
            {t.titleBefore} <span className="text-orange-600">{t.titleAccent}</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-600">{t.intro}</p>
        </div>
      </Section>

      <Section background="gray" className="py-12 md:py-16">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col gap-8 lg:flex-row">
            <div className="flex-shrink-0 lg:w-64">
              <div className="rounded-xl border border-gray-200 bg-white p-2 lg:sticky lg:top-28">
                <nav className="space-y-1">
                  {faqCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                        activeCategory === category.id ? 'bg-orange-50 text-orange-700' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <category.icon className={`h-5 w-5 flex-shrink-0 ${activeCategory === category.id ? 'text-orange-600' : 'text-gray-400'}`} />
                      <span className="text-sm font-medium">{category.title}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            <div className="flex-1">
              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="mb-6 flex items-center gap-3 border-b border-gray-200 pb-4">
                  <activeData.icon className="h-6 w-6 text-orange-600" />
                  <h2 className="text-xl font-semibold text-gray-900">{activeData.title}</h2>
                </div>
                <div>
                  {activeData.questions.map((item, index) => (
                    <FAQItem
                      key={`${activeCategory}-${index}`}
                      question={item.question}
                      answer={item.answer}
                      isOpen={openItems.has(`${activeCategory}-${index}`)}
                      onToggle={() => toggleItem(`${activeCategory}-${index}`)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section className="py-12 md:py-16">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl bg-gradient-to-br from-orange-600 to-orange-700 p-8 text-center text-white md:p-12">
            <Mail className="mx-auto mb-6 h-12 w-12 text-orange-200" aria-hidden />
            <h2 className="mb-4 text-2xl font-bold sm:text-3xl">{t.stillQuestions}</h2>
            <p className="mx-auto mb-8 max-w-xl text-lg text-orange-100">{t.stillText}</p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <a href="/contact" className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 font-medium text-orange-600 transition-colors hover:bg-gray-100">
                {t.contact}
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </a>
              <a href="mailto:tech@visiondrive.ae" className="inline-flex items-center justify-center rounded-lg border border-orange-400 bg-orange-500 px-6 py-3 font-medium text-white transition-colors hover:bg-orange-400">
                <Mail className="mr-2 h-4 w-4" aria-hidden />
                {t.emailSupport}
              </a>
            </div>
          </div>
        </div>
      </Section>
    </main>
  )
}
