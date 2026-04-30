import { isPackagePaymentReference } from './patient-packages'
import { whatsappUrl } from './reminders'

export type LoyaltyLocale = 'en' | 'ru'

export type LoyaltyPatientInput = {
  id: string
  firstName: string
  lastName: string
  phone?: string | null
  payments?: Array<{
    amountCents: number
    status: string
    reference?: string | null
  }>
  appointments?: Array<{ status: string }>
  packages?: Array<{ id: string }>
}

export type LoyaltyRow = {
  patientId: string
  patientName: string
  firstName: string
  phone: string | null
  totalPoints: number
  tier: 'Bronze' | 'Silver' | 'Gold' | 'VIP'
  paidSpendCents: number
  completedVisits: number
  packagePurchases: number
  referralCount: number
  message: string
  whatsappUrl: string | null
  actionHref: string
}

export function normalizeLoyaltyLocale(value: unknown): LoyaltyLocale {
  return value === 'ru' ? 'ru' : 'en'
}

function patientName(patient: Pick<LoyaltyPatientInput, 'firstName' | 'lastName'>) {
  return `${patient.lastName}, ${patient.firstName}`.trim()
}

export function loyaltyTier(points: number): LoyaltyRow['tier'] {
  if (points >= 3000) return 'VIP'
  if (points >= 1500) return 'Gold'
  if (points >= 500) return 'Silver'
  return 'Bronze'
}

function loyaltyMessage({
  firstName,
  points,
  tier,
  locale,
}: {
  firstName: string
  points: number
  tier: LoyaltyRow['tier']
  locale: LoyaltyLocale
}) {
  const name = firstName.trim() || (locale === 'ru' ? 'добрый день' : 'there')
  if (locale === 'ru') {
    return `Здравствуйте, ${name}. У вас ${points} бонусных баллов и уровень ${tier}. Можем использовать это для приятного бонуса на следующий визит. Хотите подобрать время?`
  }
  return `Hi ${name}, you have ${points} loyalty points and ${tier} status. We can use this for a small reward on your next visit. Would you like to choose a time?`
}

export function buildLoyaltyRows({
  patients,
  referralCounts = new Map<string, number>(),
  locale = 'en',
}: {
  patients: LoyaltyPatientInput[]
  referralCounts?: Map<string, number>
  locale?: LoyaltyLocale
}): LoyaltyRow[] {
  return patients
    .map((patient) => {
      const paidSpendCents = (patient.payments ?? []).reduce((total, payment) => {
        if (payment.status === 'PAID') return total + Math.max(0, payment.amountCents)
        if (payment.status === 'REFUNDED') return total - Math.max(0, payment.amountCents)
        return total
      }, 0)
      const completedVisits = (patient.appointments ?? []).filter((appointment) => appointment.status === 'COMPLETED').length
      const packageRows = patient.packages?.length ?? 0
      const packagePaymentRefs = (patient.payments ?? []).filter((payment) =>
        isPackagePaymentReference(payment.reference)
      ).length
      const packagePurchases = Math.max(packageRows, packagePaymentRefs)
      const referralCount = referralCounts.get(patient.id) ?? 0
      const spendPoints = Math.max(0, Math.floor(paidSpendCents / 100))
      const repeatVisitPoints = Math.max(0, completedVisits - 1) * 50
      const packagePoints = packagePurchases * 150
      const referralPoints = referralCount * 100
      const totalPoints = spendPoints + repeatVisitPoints + packagePoints + referralPoints
      const tier = loyaltyTier(totalPoints)
      const message = loyaltyMessage({ firstName: patient.firstName, points: totalPoints, tier, locale })

      return {
        patientId: patient.id,
        patientName: patientName(patient),
        firstName: patient.firstName,
        phone: patient.phone ?? null,
        totalPoints,
        tier,
        paidSpendCents: Math.max(0, paidSpendCents),
        completedVisits,
        packagePurchases,
        referralCount,
        message,
        whatsappUrl: whatsappUrl(patient.phone, message),
        actionHref: `/clinic/patients/${patient.id}`,
      }
    })
    .filter((row) => row.totalPoints > 0)
    .sort((a, b) => b.totalPoints - a.totalPoints || a.patientName.localeCompare(b.patientName))
}

export function summarizeLoyalty(rows: LoyaltyRow[]) {
  return {
    members: rows.length,
    totalPoints: rows.reduce((total, row) => total + row.totalPoints, 0),
    vip: rows.filter((row) => row.tier === 'VIP').length,
    gold: rows.filter((row) => row.tier === 'Gold').length,
    withWhatsapp: rows.filter((row) => row.whatsappUrl).length,
  }
}
