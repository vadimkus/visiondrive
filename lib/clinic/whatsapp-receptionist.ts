export type WhatsAppReceptionistMode =
  | 'booking'
  | 'prices'
  | 'quote'
  | 'intake'
  | 'status'
  | 'reschedule'
  | 'cancel'
  | 'waitlist'
  | 'approval'
  | 'reminder'

export type WhatsAppReceptionistProcedure = {
  name: string
  basePriceCents: number
  currency: string
}

export type WhatsAppReceptionistAppointment = {
  startsAt: string | Date
  status: string
  label: string
}

export type WhatsAppReceptionistQuoteLine = {
  description: string
  quantity: number
  totalCents: number
}

export type WhatsAppReceptionistQuote = {
  quoteNumber: string
  title: string
  status: string
  currency: string
  totalCents: number
  validUntil?: string | Date | null
  lines?: WhatsAppReceptionistQuoteLine[]
}

export function receptionistMoney(cents: number, currency: string) {
  return `${(Math.max(0, cents) / 100).toFixed(2)} ${currency}`
}

function patientGreeting(locale: 'en' | 'ru', firstName?: string | null) {
  if (locale === 'ru') return `Здравствуйте, ${firstName || 'добрый день'},`
  return `Hi ${firstName || 'there'},`
}

function formatDateTime(value: string | Date | null | undefined, locale: 'en' | 'ru') {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString(locale === 'ru' ? 'ru-RU' : 'en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Dubai',
  })
}

function bookingLine(locale: 'en' | 'ru', bookingUrl?: string | null) {
  if (bookingUrl) return locale === 'ru' ? `Ссылка для записи: ${bookingUrl}` : `Booking link: ${bookingUrl}`
  return locale === 'ru'
    ? 'Ссылка для записи пока не включена. Я могу принять предпочтения вручную.'
    : 'Booking link is not enabled yet. I can take your preferences manually.'
}

function procedureLines(procedures: WhatsAppReceptionistProcedure[]) {
  return procedures.map((procedure) => `• ${procedure.name}: ${receptionistMoney(procedure.basePriceCents, procedure.currency)}`)
}

function quoteLines(quote: WhatsAppReceptionistQuote) {
  const lines = quote.lines?.length
    ? quote.lines.map((line) => {
        const quantity = line.quantity > 1 ? ` x${line.quantity}` : ''
        return `• ${line.description}${quantity}: ${receptionistMoney(line.totalCents, quote.currency)}`
      })
    : []
  return lines
}

export function buildWhatsAppReceptionistMessage({
  mode,
  locale = 'en',
  patientFirstName,
  bookingUrl,
  procedures = [],
  appointment,
  quote,
  customText,
  waitlistSlotStart,
}: {
  mode: WhatsAppReceptionistMode
  locale?: 'en' | 'ru'
  patientFirstName?: string | null
  bookingUrl?: string | null
  procedures?: WhatsAppReceptionistProcedure[]
  appointment?: WhatsAppReceptionistAppointment | null
  quote?: WhatsAppReceptionistQuote | null
  customText?: string
  waitlistSlotStart?: string | Date | null
}) {
  const greeting = patientGreeting(locale, patientFirstName)
  const note = customText?.trim()
  const serviceList = procedureLines(procedures)
  const appointmentText = appointment
    ? `${formatDateTime(appointment.startsAt, locale)} · ${appointment.label} · ${appointment.status}`
    : locale === 'ru'
      ? 'Будущей записи пока не вижу.'
      : 'I do not see a future appointment yet.'

  if (mode === 'prices') {
    return [
      greeting,
      '',
      locale === 'ru' ? 'Ориентировочные цены:' : 'Here are the current guide prices:',
      serviceList.length ? serviceList.join('\n') : locale === 'ru' ? 'Уточните, какая услуга интересует.' : 'Tell me which service you are considering.',
      '',
      locale === 'ru'
        ? 'Итоговая цена подтверждается после консультации и выбора препарата/плана.'
        : 'Final pricing is confirmed after consultation and product/treatment-plan choice.',
      bookingLine(locale, bookingUrl),
    ].join('\n')
  }

  if (mode === 'quote') {
    const quoteBody = quote
      ? [
          `${quote.title} (${quote.quoteNumber})`,
          ...quoteLines(quote),
          `${locale === 'ru' ? 'Итого' : 'Estimated total'}: ${receptionistMoney(quote.totalCents, quote.currency)}`,
          quote.validUntil
            ? `${locale === 'ru' ? 'Действует до' : 'Valid until'}: ${formatDateTime(quote.validUntil, locale)}`
            : '',
        ]
      : [
          locale === 'ru' ? 'Предварительный расчёт:' : 'Preliminary estimate:',
          serviceList.length ? serviceList.join('\n') : locale === 'ru' ? 'Уточните услуги, и я подготовлю расчёт.' : 'Tell me the services and I will prepare an estimate.',
        ]
    return [
      greeting,
      '',
      locale === 'ru' ? 'Отправляю расчёт по вашему запросу:' : 'Sharing the estimate for your request:',
      ...quoteBody,
      note ? `\n${note}` : '',
      '',
      locale === 'ru'
        ? 'Ответьте здесь, если хотите подтвердить план или подобрать время.'
        : 'Reply here if you would like to confirm the plan or choose a time.',
    ].filter(Boolean).join('\n')
  }

  if (mode === 'reschedule') {
    return [
      greeting,
      '',
      locale === 'ru' ? 'Могу помочь перенести запись:' : 'I can help reschedule this appointment:',
      appointmentText,
      note ? `${locale === 'ru' ? 'Предпочтение' : 'Preference'}: ${note}` : '',
      '',
      locale === 'ru'
        ? 'Пришлите 2-3 удобных варианта, и я подтвержу новое время лично.'
        : 'Please send 2-3 preferred times and I will personally confirm the new slot.',
    ].filter(Boolean).join('\n')
  }

  if (mode === 'cancel') {
    return [
      greeting,
      '',
      locale === 'ru' ? 'Поняла запрос на отмену записи:' : 'I understand you want to cancel this appointment:',
      appointmentText,
      note ? `${locale === 'ru' ? 'Комментарий' : 'Note'}: ${note}` : '',
      '',
      locale === 'ru'
        ? 'Я проверю правила отмены и подтвержу отмену лично перед изменением в расписании.'
        : 'I will check the cancellation policy and personally confirm before changing the schedule.',
    ].filter(Boolean).join('\n')
  }

  if (mode === 'waitlist') {
    const slot = formatDateTime(waitlistSlotStart, locale)
    return [
      greeting,
      '',
      slot
        ? locale === 'ru'
          ? `Освободилось окно: ${slot}. Хотите, я зарезервирую его для вас?`
          : `A slot opened: ${slot}. Would you like me to reserve it for you?`
        : locale === 'ru'
          ? 'Могу добавить вас в лист ожидания и написать, если освободится более удобное окно.'
          : 'I can add you to the waitlist and message you if a better slot opens.',
      serviceList.length ? serviceList.join('\n') : '',
      note ? `\n${note}` : '',
    ].filter(Boolean).join('\n')
  }

  if (mode === 'approval') {
    return [
      greeting,
      '',
      locale === 'ru'
        ? 'Я подготовила ваш запрос для проверки специалистом.'
        : 'I have prepared your request for practitioner review.',
      appointment ? appointmentText : '',
      serviceList.length ? serviceList.join('\n') : '',
      note ? `${locale === 'ru' ? 'Запрос' : 'Request'}: ${note}` : '',
      '',
      locale === 'ru'
        ? 'Вернусь с подтверждением, как только специалист одобрит время/план.'
        : 'I will come back with confirmation once the practitioner approves the time or plan.',
    ].filter(Boolean).join('\n')
  }

  if (mode === 'intake') {
    return [
      greeting,
      '',
      locale === 'ru'
        ? 'Перед подтверждением записи, пожалуйста, ответьте на вопросы по ссылке.'
        : 'Before confirmation, please complete the intake questions using the link.',
      bookingLine(locale, bookingUrl),
      note ? `${locale === 'ru' ? 'Дополнительный вопрос' : 'Extra question'}: ${note}` : '',
    ].filter(Boolean).join('\n')
  }

  if (mode === 'status') {
    return [
      greeting,
      '',
      locale === 'ru' ? 'Текущий статус записи:' : 'Current appointment status:',
      appointmentText,
      '',
      locale === 'ru'
        ? 'Если время не подходит, ответьте здесь, и я помогу с переносом.'
        : 'If this time no longer works, reply here and I will help reschedule.',
    ].join('\n')
  }

  if (mode === 'reminder') {
    return [
      greeting,
      '',
      locale === 'ru'
        ? 'Напоминание: возможно, пора запланировать следующий визит или follow-up.'
        : 'Quick reminder: it may be time to book your next visit or follow-up.',
      bookingLine(locale, bookingUrl),
      '',
      locale === 'ru'
        ? 'Ответьте здесь, если хотите, чтобы я предложила ближайшее удобное время.'
        : 'Reply here if you want me to suggest the best next slot.',
    ].join('\n')
  }

  return [
    greeting,
    '',
    locale === 'ru'
      ? 'Вы можете выбрать услугу и удобное время по приватной ссылке ниже.'
      : 'You can choose a service and available time using the private booking link below.',
    bookingLine(locale, bookingUrl),
    '',
    locale === 'ru' ? 'После отправки заявки я лично подтвержу запись.' : 'Once you submit the request, I will confirm the appointment personally.',
  ].join('\n')
}
