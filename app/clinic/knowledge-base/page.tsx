'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  CalendarClock,
  CircleDollarSign,
  FileText,
  Package,
  Search,
  Send,
  Stethoscope,
  Users,
} from 'lucide-react'
import clsx from 'clsx'
import { useClinicLocale } from '@/lib/clinic/clinic-locale'

type Article = {
  id: string
  category: string
  title: string
  summary: string
  steps: string[]
  link?: string
}

const articlesEn: Article[] = [
  {
    id: 'appointments-command-center',
    category: 'Appointments',
    title: 'Run the day from the appointment drawer',
    summary: 'Use one drawer for patient context, status, visit actions, payments, reminders, and history.',
    steps: [
      'Open Appointments and switch to Day view for the current agenda.',
      'Tap any appointment to open the command drawer.',
      'Confirm arrival, start the visit, complete the visit, send WhatsApp reminders, or create a follow-up.',
      'Check the history section before changing time or status.',
    ],
    link: '/clinic/appointments',
  },
  {
    id: 'availability',
    category: 'Appointments',
    title: 'Set working hours, buffers, and private time',
    summary: 'Define when patients can be booked and hide lunch, personal time, or supplier runs.',
    steps: [
      'Open Availability from the Appointments screen.',
      'Enable working days and set start/end time, slot interval, and minimum lead time.',
      'Add blocked time for lunch, leave, training, or private commitments.',
      'Use the slot preview to confirm real availability before using online booking later.',
    ],
    link: '/clinic/appointments/availability',
  },
  {
    id: 'public-booking',
    category: 'Appointments',
    title: 'Share your private booking link',
    summary: 'Let clients choose a service and available time without exposing the internal panel.',
    steps: [
      'Open Dashboard and use Booking link.',
      'Clients choose a service, pick an available slot, and enter DOB/contact details.',
      'The booking uses your working hours, blocked time, buffers, and minimum lead time.',
      'New bookings arrive as online appointments and schedule a 24h WhatsApp reminder.',
    ],
    link: '/clinic',
  },
  {
    id: 'patients',
    category: 'Patients',
    title: 'Keep the patient record clean and private',
    summary: 'Store contact details, medical history, internal notes, visits, photos, payments, and CRM notes.',
    steps: [
      'Create the patient before booking the first appointment.',
      'Use staff notes for private context that must not appear in patient-safe exports.',
      'Log anamnesis, allergies, medications, and conditions before treatment.',
      'Use the timeline filters to review appointments, visits, payments, and CRM history quickly.',
    ],
    link: '/clinic/patients',
  },
  {
    id: 'photos-summary',
    category: 'Patients',
    title: 'Use photos and patient-safe PDF exports',
    summary: 'Attach before/after media to visits and export a clean patient summary when needed.',
    steps: [
      'Open a patient record and go to Photos.',
      'Add before, after, or other images and link them to a visit when possible.',
      'Use Patient summary PDF for a patient-safe export.',
      'Remember: internal notes, payments, photos, and clinical free text stay out of the PDF.',
    ],
    link: '/clinic/patients',
  },
  {
    id: 'inventory',
    category: 'Inventory',
    title: 'Track consumables and avoid low-stock surprises',
    summary: 'Use stock items, reorder levels, barcode lookup, movements, and low-stock alerts.',
    steps: [
      'Create each product or consumable in Inventory with SKU/barcode when available.',
      'Set minimum stock and reorder quantity.',
      'Review movements after purchase order receiving or visit completion.',
      'Enable browser push in Account to receive low-stock notifications.',
    ],
    link: '/clinic/inventory',
  },
  {
    id: 'purchase-orders',
    category: 'Inventory',
    title: 'Receive supplier orders into stock',
    summary: 'Create purchase orders, receive lines, and let inventory update automatically.',
    steps: [
      'Open Purchase orders and create a new order for a supplier.',
      'Add item lines with quantities and unit cost.',
      'Receive the order when products arrive.',
      'Confirm inventory movements and low-stock status after receiving.',
    ],
    link: '/clinic/purchase-orders',
  },
  {
    id: 'finance',
    category: 'Finance',
    title: 'Read profitability at a glance',
    summary: 'Track revenue, refunds, expenses, profit, margin, and recent expense entries.',
    steps: [
      'Record payments from patient records or appointment flow.',
      'Open Finance to review net revenue, paid revenue, pending payments, expenses, and profit.',
      'Add expenses with category, vendor, description, amount, and date.',
      'Review category breakdown to see where money is going.',
    ],
    link: '/clinic/finance',
  },
  {
    id: 'reminders-followups',
    category: 'Communication',
    title: 'Use WhatsApp reminders and follow-ups',
    summary: 'Keep reminders simple and personal for a solo practice.',
    steps: [
      'Open Reminders to adjust WhatsApp templates for reminders, no-shows, and rebooking.',
      'Open an appointment drawer to send now or schedule a 24h reminder.',
      'Use No-show follow-up when a client misses the appointment.',
      'Check the delivery log and appointment history to see what was prepared.',
    ],
    link: '/clinic/reminders',
  },
]

const articlesRu: Article[] = [
  {
    id: 'appointments-command-center',
    category: 'Записи',
    title: 'Ведите день через карточку записи',
    summary: 'Одна карточка показывает пациента, статус, визит, оплату, напоминания и историю.',
    steps: [
      'Откройте Записи и переключитесь на вид День.',
      'Нажмите на любую запись, чтобы открыть карточку.',
      'Подтвердите, отметьте приход, начните визит, завершите визит, отправьте WhatsApp или создайте повторную запись.',
      'Перед изменениями проверяйте историю записи.',
    ],
    link: '/clinic/appointments',
  },
  {
    id: 'availability',
    category: 'Записи',
    title: 'Настройте рабочее время, буферы и личные слоты',
    summary: 'Управляйте тем, когда можно записывать пациентов, и закрывайте личное время.',
    steps: [
      'Откройте Доступность из раздела Записи.',
      'Включите рабочие дни, задайте время, интервал слотов и минимальное время до записи.',
      'Добавьте закрытые слоты для обеда, отпуска, обучения или личных дел.',
      'Проверьте доступные слоты в превью перед онлайн-записью.',
    ],
    link: '/clinic/appointments/availability',
  },
  {
    id: 'public-booking',
    category: 'Записи',
    title: 'Поделитесь приватной ссылкой для записи',
    summary: 'Клиент выбирает услугу и свободное время без доступа к внутренней панели.',
    steps: [
      'Откройте Дашборд и используйте ссылку для записи.',
      'Клиент выбирает услугу, слот и вводит дату рождения/контакты.',
      'Запись учитывает рабочие часы, закрытые слоты, буферы и минимальное время до записи.',
      'Новая запись создаётся как онлайн-запись и планирует WhatsApp-напоминание за 24 часа.',
    ],
    link: '/clinic',
  },
  {
    id: 'patients',
    category: 'Пациенты',
    title: 'Держите карту пациента чистой и приватной',
    summary: 'Контакты, анамнез, внутренние заметки, визиты, фото, оплаты и CRM находятся в одной карте.',
    steps: [
      'Создайте пациента перед первой записью.',
      'Используйте внутренние заметки для приватной информации.',
      'Заполните анамнез, аллергии, лекарства и состояния перед процедурой.',
      'Используйте фильтры таймлайна для быстрого просмотра истории.',
    ],
    link: '/clinic/patients',
  },
  {
    id: 'photos-summary',
    category: 'Пациенты',
    title: 'Фото и безопасный PDF для пациента',
    summary: 'Прикрепляйте фото до/после и экспортируйте чистое резюме пациента.',
    steps: [
      'Откройте карту пациента и вкладку Фото.',
      'Добавьте фото до, после или другое и привяжите к визиту.',
      'Используйте PDF резюме пациента для безопасного экспорта.',
      'Внутренние заметки, оплаты, фото и клинический текст не попадают в PDF.',
    ],
    link: '/clinic/patients',
  },
  {
    id: 'inventory',
    category: 'Склад',
    title: 'Контролируйте расходники и низкие остатки',
    summary: 'Товары, минимальные остатки, штрихкоды, движения и уведомления.',
    steps: [
      'Создайте товар или расходник на складе, добавьте SKU/штрихкод.',
      'Укажите минимальный остаток и количество для заказа.',
      'Проверяйте движения после закупки или завершения визита.',
      'Включите push-уведомления в Аккаунте, чтобы получать низкие остатки.',
    ],
    link: '/clinic/inventory',
  },
  {
    id: 'purchase-orders',
    category: 'Склад',
    title: 'Принимайте закупки от поставщиков',
    summary: 'Закупки автоматически пополняют склад после приемки.',
    steps: [
      'Откройте Закупки и создайте заказ поставщику.',
      'Добавьте позиции с количеством и ценой.',
      'Примите заказ, когда товар пришел.',
      'Проверьте движения склада и статус низких остатков.',
    ],
    link: '/clinic/purchase-orders',
  },
  {
    id: 'finance',
    category: 'Финансы',
    title: 'Смотрите прибыльность без таблиц',
    summary: 'Выручка, возвраты, расходы, прибыль, маржа и последние расходы.',
    steps: [
      'Записывайте оплаты из карты пациента или процесса визита.',
      'Откройте Финансы, чтобы увидеть выручку, ожидание оплат, расходы и прибыль.',
      'Добавляйте расходы с категорией, поставщиком, описанием, суммой и датой.',
      'Смотрите разбивку по категориям, чтобы понимать структуру затрат.',
    ],
    link: '/clinic/finance',
  },
  {
    id: 'reminders-followups',
    category: 'Коммуникации',
    title: 'WhatsApp напоминания и повторные записи',
    summary: 'Простая персональная коммуникация для соло-практики.',
    steps: [
      'Откройте Напоминания, чтобы настроить шаблоны WhatsApp.',
      'Откройте карточку записи, чтобы отправить сейчас или запланировать за 24 часа.',
      'Используйте сообщение после неявки, если клиент пропустил запись.',
      'Проверяйте журнал отправок и историю записи.',
    ],
    link: '/clinic/reminders',
  },
]

const categoryIcons = {
  Appointments: CalendarClock,
  Записи: CalendarClock,
  Patients: Users,
  Пациенты: Users,
  Inventory: Package,
  Склад: Package,
  Finance: CircleDollarSign,
  Финансы: CircleDollarSign,
  Communication: Send,
  Коммуникации: Send,
}

export default function ClinicKnowledgeBasePage() {
  const { locale, t } = useClinicLocale()
  const isRu = locale === 'ru'
  const articles = isRu ? articlesRu : articlesEn
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string>('all')

  const copy = {
    title: isRu ? 'База знаний' : 'Knowledge base',
    subtitle: isRu
      ? 'Короткие инструкции по функциям VisionDrive Practice OS, в стиле справочного центра Altegio.'
      : 'Short, practical articles for VisionDrive Practice OS, formatted like a help center.',
    search: isRu ? 'Поиск по базе знаний...' : 'Search the knowledge base...',
    all: isRu ? 'Все' : 'All',
    open: isRu ? 'Открыть раздел' : 'Open section',
    empty: isRu ? 'Ничего не найдено.' : 'No matching articles.',
    featured: isRu ? 'Рекомендуемые статьи' : 'Featured articles',
  }

  const categories = useMemo(
    () => Array.from(new Set(articles.map((article) => article.category))),
    [articles]
  )
  const filtered = articles.filter((article) => {
    const haystack = `${article.title} ${article.summary} ${article.steps.join(' ')}`.toLowerCase()
    const matchesSearch = !query || haystack.includes(query.toLowerCase())
    const matchesCategory = category === 'all' || article.category === category
    return matchesSearch && matchesCategory
  })

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="rounded-3xl bg-gradient-to-br from-orange-50 via-white to-gray-50 border border-orange-100 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
          <div className="max-w-2xl">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-orange-700" aria-hidden />
            </div>
            <h1 className="text-3xl font-semibold text-gray-900">{copy.title}</h1>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">{copy.subtitle}</p>
          </div>
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={copy.search}
              className="w-full min-h-12 rounded-2xl border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-900 shadow-sm outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        <aside className="rounded-2xl bg-white border border-gray-200 p-3 shadow-sm h-fit">
          <button
            type="button"
            onClick={() => setCategory('all')}
            className={clsx(
              'w-full flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold min-h-11',
              category === 'all' ? 'bg-orange-50 text-orange-900' : 'text-gray-700 hover:bg-gray-50'
            )}
          >
            {copy.all}
            <span className="text-xs text-gray-400">{articles.length}</span>
          </button>
          {categories.map((cat) => {
            const Icon = categoryIcons[cat as keyof typeof categoryIcons] || FileText
            const count = articles.filter((article) => article.category === cat).length
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={clsx(
                  'mt-1 w-full flex items-center justify-between gap-3 rounded-xl px-3 py-3 text-sm font-semibold min-h-11',
                  category === cat ? 'bg-orange-50 text-orange-900' : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                <span className="inline-flex items-center gap-2">
                  <Icon className="w-4 h-4" aria-hidden />
                  {cat}
                </span>
                <span className="text-xs text-gray-400">{count}</span>
              </button>
            )
          })}
        </aside>

        <section className="space-y-4">
          <h2 className="font-semibold text-gray-900">{copy.featured}</h2>
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
              {copy.empty}
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {filtered.map((article) => (
                <article key={article.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">
                    {article.category}
                  </p>
                  <h3 className="text-lg font-semibold text-gray-900 mt-2">{article.title}</h3>
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">{article.summary}</p>
                  <ol className="mt-4 space-y-2">
                    {article.steps.map((step, index) => (
                      <li key={step} className="flex gap-3 text-sm text-gray-700 leading-relaxed">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[11px] font-bold text-orange-800">
                          {index + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                  {article.link && (
                    <Link
                      href={article.link}
                      className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white hover:bg-gray-800"
                    >
                      {copy.open}
                    </Link>
                  )}
                </article>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-400">{t.docsFooter}</p>
        </section>
      </div>
    </div>
  )
}
