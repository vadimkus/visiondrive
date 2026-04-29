import Link from 'next/link'
import { ClinicPaymentStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { paymentRequestTokenHash } from '@/lib/clinic/deposit-requests'

function money(cents: number, currency: string) {
  return `${(Math.max(0, cents) / 100).toFixed(2)} ${currency}`
}

export default async function DepositPaymentRequestPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const payment = await prisma.clinicPatientPayment.findFirst({
    where: { paymentRequestTokenHash: paymentRequestTokenHash(token) },
    include: {
      tenant: { select: { name: true } },
      patient: { select: { firstName: true, lastName: true } },
      appointment: {
        select: {
          startsAt: true,
          titleOverride: true,
          procedure: { select: { name: true } },
        },
      },
    },
  })

  const now = new Date()
  const expired =
    !payment ||
    (payment.paymentRequestExpiresAt != null && payment.paymentRequestExpiresAt.getTime() < now.getTime())
  const paid = payment?.status === ClinicPaymentStatus.PAID

  if (!payment || expired) {
    return (
      <main className="min-h-screen bg-orange-50 px-4 py-10">
        <section className="mx-auto max-w-md rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">VisionDrive Practice OS</p>
          <h1 className="mt-3 text-2xl font-semibold text-gray-950">Payment request unavailable</h1>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            This deposit request is expired or no longer available. Please contact the practitioner for a fresh link.
          </p>
        </section>
      </main>
    )
  }

  const appointmentLabel =
    payment.appointment?.procedure?.name ?? payment.appointment?.titleOverride ?? 'Appointment'
  const appointmentAt = payment.appointment?.startsAt

  return (
    <main className="min-h-screen bg-orange-50 px-4 py-10">
      <section className="mx-auto max-w-md rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">
          {payment.tenant.name}
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-gray-950">Deposit request</h1>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          This link confirms the deposit requested to secure the appointment slot.
        </p>

        <div className="mt-6 rounded-2xl bg-gray-50 p-4">
          <p className="text-sm text-gray-500">Amount</p>
          <p className="mt-1 text-3xl font-semibold text-gray-950">
            {money(payment.amountCents, payment.currency)}
          </p>
          <p className="mt-3 text-sm text-gray-600">
            {payment.patient.firstName} {payment.patient.lastName}
          </p>
          <p className="text-sm text-gray-600">{appointmentLabel}</p>
          {appointmentAt && (
            <p className="text-sm text-gray-600">
              {appointmentAt.toLocaleString('en-GB', {
                dateStyle: 'medium',
                timeStyle: 'short',
                timeZone: 'Asia/Dubai',
              })}
            </p>
          )}
        </div>

        {paid ? (
          <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900">
            Deposit is marked paid. Your practitioner will keep the appointment confirmed.
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-orange-100 bg-orange-50 p-4 text-sm leading-6 text-orange-950">
            Pay using the payment method agreed with your practitioner, then reply in WhatsApp with proof or the
            transfer reference. The practitioner will mark this request paid manually.
          </div>
        )}

        <p className="mt-5 text-xs leading-5 text-gray-500">
          This is a secure request summary, not an online card gateway yet. Do not share this link publicly.
        </p>
        <Link href="/" className="mt-5 inline-flex text-sm font-semibold text-orange-700">
          VisionDrive
        </Link>
      </section>
    </main>
  )
}
