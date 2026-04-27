import { ClinicPatientPackageStatus, type Prisma } from '@prisma/client'

export const PACKAGE_PAYMENT_REFERENCE_PREFIX = 'PACKAGE:'

export type PackageDeductionResult = {
  deducted: {
    packageId: string
    name: string
    remainingSessions: number
    totalSessions: number
  } | null
  skipped:
    | null
    | {
        reason:
          | 'already_redeemed'
          | 'no_visit'
          | 'no_procedure'
          | 'no_active_package'
          | 'race_lost'
      }
}

export function isPackagePaymentReference(reference: string | null | undefined) {
  return !!reference?.startsWith(PACKAGE_PAYMENT_REFERENCE_PREFIX)
}

export function packagePaymentReference(packageId: string) {
  return `${PACKAGE_PAYMENT_REFERENCE_PREFIX}${packageId}`
}

export function normalizePackageSessions(value: unknown, fallback = 1) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(Math.max(Math.round(parsed), 1), 100)
}

export function normalizePackagePriceCents(value: unknown) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) return 0
  return Math.round(parsed)
}

export function packageStatusFromSessions(remainingSessions: number, expiresAt?: Date | string | null) {
  if (remainingSessions <= 0) return ClinicPatientPackageStatus.USED_UP
  if (expiresAt) {
    const expiry = expiresAt instanceof Date ? expiresAt : new Date(expiresAt)
    if (!Number.isNaN(expiry.getTime()) && expiry < new Date()) {
      return ClinicPatientPackageStatus.EXPIRED
    }
  }
  return ClinicPatientPackageStatus.ACTIVE
}

export async function applyPatientPackageDeduction(
  tx: Prisma.TransactionClient,
  params: {
    tenantId: string
    patientId: string
    visitId: string | null
    appointmentId?: string | null
    procedureId?: string | null
    createdByUserId?: string | null
  }
): Promise<PackageDeductionResult> {
  if (!params.visitId) {
    return { deducted: null, skipped: { reason: 'no_visit' } }
  }

  const existingRedemption = await tx.clinicPackageRedemption.findFirst({
    where: { tenantId: params.tenantId, visitId: params.visitId },
    select: { id: true },
  })
  if (existingRedemption) {
    return { deducted: null, skipped: { reason: 'already_redeemed' } }
  }

  let procedureId = params.procedureId ?? null
  if (!procedureId && params.appointmentId) {
    const appointment = await tx.clinicAppointment.findFirst({
      where: { id: params.appointmentId, tenantId: params.tenantId },
      select: { procedureId: true },
    })
    procedureId = appointment?.procedureId ?? null
  }

  if (!procedureId) {
    return { deducted: null, skipped: { reason: 'no_procedure' } }
  }

  const now = new Date()
  await tx.clinicPatientPackage.updateMany({
    where: {
      tenantId: params.tenantId,
      patientId: params.patientId,
      status: ClinicPatientPackageStatus.ACTIVE,
      remainingSessions: { gt: 0 },
      expiresAt: { lt: now },
    },
    data: { status: ClinicPatientPackageStatus.EXPIRED },
  })

  const packages = await tx.clinicPatientPackage.findMany({
    where: {
      tenantId: params.tenantId,
      patientId: params.patientId,
      status: ClinicPatientPackageStatus.ACTIVE,
      remainingSessions: { gt: 0 },
      AND: [
        { OR: [{ procedureId }, { procedureId: null }] },
        { OR: [{ expiresAt: null }, { expiresAt: { gte: now } }] },
      ],
    },
    orderBy: [{ purchasedAt: 'asc' }, { createdAt: 'asc' }],
    select: {
      id: true,
      name: true,
      totalSessions: true,
      remainingSessions: true,
      expiresAt: true,
      procedureId: true,
    },
  })

  const selected = packages.sort((a, b) => {
    if (a.procedureId && !b.procedureId) return -1
    if (!a.procedureId && b.procedureId) return 1
    if (a.expiresAt && b.expiresAt) return a.expiresAt.getTime() - b.expiresAt.getTime()
    if (a.expiresAt && !b.expiresAt) return -1
    if (!a.expiresAt && b.expiresAt) return 1
    return 0
  })[0]

  if (!selected) {
    return { deducted: null, skipped: { reason: 'no_active_package' } }
  }

  const updated = await tx.clinicPatientPackage.updateMany({
    where: {
      id: selected.id,
      tenantId: params.tenantId,
      status: ClinicPatientPackageStatus.ACTIVE,
      remainingSessions: { gt: 0 },
    },
    data: { remainingSessions: { decrement: 1 } },
  })

  if (updated.count !== 1) {
    return { deducted: null, skipped: { reason: 'race_lost' } }
  }

  const packageAfter = await tx.clinicPatientPackage.findUniqueOrThrow({
    where: { id: selected.id },
    select: { id: true, name: true, totalSessions: true, remainingSessions: true },
  })

  if (packageAfter.remainingSessions <= 0) {
    await tx.clinicPatientPackage.update({
      where: { id: selected.id },
      data: { status: ClinicPatientPackageStatus.USED_UP },
    })
  }

  await tx.clinicPackageRedemption.create({
    data: {
      tenantId: params.tenantId,
      patientPackageId: selected.id,
      visitId: params.visitId,
      appointmentId: params.appointmentId ?? null,
      sessionsDelta: -1,
      note: 'Auto: visit completed',
      createdByUserId: params.createdByUserId ?? null,
    },
  })

  return {
    deducted: {
      packageId: packageAfter.id,
      name: packageAfter.name,
      remainingSessions: packageAfter.remainingSessions,
      totalSessions: packageAfter.totalSessions,
    },
    skipped: null,
  }
}
