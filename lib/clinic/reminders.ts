import {
  ClinicReminderChannel,
  ClinicReminderKind,
  ClinicReminderStatus,
  type Prisma,
} from '@prisma/client'

export const DEFAULT_REMINDER_MINUTES_BEFORE = 24 * 60

export type ReminderAppointmentContext = {
  startsAt: Date
  patient: { firstName: string; lastName: string; phone?: string | null }
  procedure: { name: string } | null
  titleOverride: string | null
}

export type ReminderTemplateSeed = {
  kind: ClinicReminderKind
  channel: ClinicReminderChannel
  name: string
  body: string
}

export function defaultReminderTemplates(): ReminderTemplateSeed[] {
  return [
    {
      kind: ClinicReminderKind.APPOINTMENT_REMINDER,
      channel: ClinicReminderChannel.WHATSAPP,
      name: 'Appointment reminder',
      body:
        'Hi {{firstName}}, reminder for your {{service}} on {{date}} at {{time}}. Please reply to confirm. — VisionDrive Practice OS',
    },
    {
      kind: ClinicReminderKind.NO_SHOW_FOLLOW_UP,
      channel: ClinicReminderChannel.WHATSAPP,
      name: 'No-show follow-up',
      body:
        'Hi {{firstName}}, we missed you today for {{service}}. Would you like me to help reschedule? — VisionDrive Practice OS',
    },
    {
      kind: ClinicReminderKind.REBOOKING_FOLLOW_UP,
      channel: ClinicReminderChannel.WHATSAPP,
      name: 'Rebooking follow-up',
      body:
        'Hi {{firstName}}, it may be time to plan your next {{service}}. Reply here if you want a few available options.',
    },
  ]
}

export function phoneForWhatsapp(phone: string | null | undefined) {
  const digits = String(phone || '').replace(/\D/g, '')
  return digits ? digits : null
}

export function reminderScheduledFor(startsAt: Date, minutesBefore = DEFAULT_REMINDER_MINUTES_BEFORE) {
  return new Date(startsAt.getTime() - Math.max(0, minutesBefore) * 60 * 1000)
}

export function renderReminderTemplate(
  template: string,
  appointment: ReminderAppointmentContext,
  locale = 'en-GB'
) {
  const service = appointment.procedure?.name || appointment.titleOverride || 'appointment'
  const date = appointment.startsAt.toLocaleDateString(locale, {
    dateStyle: 'medium',
    timeZone: 'Asia/Dubai',
  })
  const time = appointment.startsAt.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Dubai',
  })

  return template
    .replaceAll('{{firstName}}', appointment.patient.firstName)
    .replaceAll('{{lastName}}', appointment.patient.lastName)
    .replaceAll('{{service}}', service)
    .replaceAll('{{date}}', date)
    .replaceAll('{{time}}', time)
}

export function whatsappUrl(phone: string | null | undefined, body: string) {
  const digits = phoneForWhatsapp(phone)
  return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(body)}` : null
}

type PrismaLike = Prisma.TransactionClient

export async function ensureDefaultReminderTemplates(db: PrismaLike, tenantId: string) {
  const templates = defaultReminderTemplates()
  for (const template of templates) {
    await db.clinicReminderTemplate.upsert({
      where: {
        tenantId_kind_channel: {
          tenantId,
          kind: template.kind,
          channel: template.channel,
        },
      },
      create: {
        tenantId,
        ...template,
      },
      update: {},
    })
  }
}

export async function getReminderTemplate(
  db: PrismaLike,
  tenantId: string,
  kind: ClinicReminderKind,
  channel = ClinicReminderChannel.WHATSAPP
) {
  const found = await db.clinicReminderTemplate.findUnique({
    where: { tenantId_kind_channel: { tenantId, kind, channel } },
  })
  if (found) return found.active ? found : null

  const seed = defaultReminderTemplates().find((template) => template.kind === kind)
  if (!seed) return null
  return db.clinicReminderTemplate.create({
    data: {
      tenantId,
      ...seed,
    },
  })
}

export function reminderStatusForManualPreparation() {
  return ClinicReminderStatus.PREPARED
}
