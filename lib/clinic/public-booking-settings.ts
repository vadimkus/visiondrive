import type { Prisma } from '@prisma/client'

type PrismaLike = Prisma.TransactionClient

type ClinicSettings = {
  publicBooking?: {
    enabled?: boolean
  }
}

function asClinicSettings(value: Prisma.JsonValue | null | undefined): ClinicSettings {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return value as ClinicSettings
}

export function publicBookingEnabledFromSettings(value: Prisma.JsonValue | null | undefined) {
  return asClinicSettings(value).publicBooking?.enabled === true
}

export async function getPublicBookingEnabled(db: PrismaLike, tenantId: string) {
  const settings = await db.tenantSetting.findUnique({
    where: { tenantId },
    select: { thresholds: true },
  })
  return publicBookingEnabledFromSettings(settings?.thresholds)
}

export async function setPublicBookingEnabled(
  db: PrismaLike,
  tenantId: string,
  enabled: boolean
) {
  const existing = await db.tenantSetting.findUnique({
    where: { tenantId },
    select: { thresholds: true },
  })
  const next = {
    ...asClinicSettings(existing?.thresholds),
    publicBooking: { enabled },
  }

  await db.tenantSetting.upsert({
    where: { tenantId },
    create: { tenantId, thresholds: next },
    update: { thresholds: next },
  })

  return enabled
}
