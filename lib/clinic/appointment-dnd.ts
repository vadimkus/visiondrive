/** MIME type for HTML5 drag payload (clinic appointment reschedule). */
export const CLINIC_APPOINTMENT_DND_MIME = 'application/x-visiondrive-clinic-appointment'

export type ClinicAppointmentDragPayload = {
  id: string
  startsAt: string
}

/** Move calendar day to `targetDay` while preserving local time-of-day from `prevIso`. */
export function rescheduleStartsAtPreserveClock(prevIso: string, targetDay: Date): string {
  const old = new Date(prevIso)
  const next = new Date(targetDay)
  next.setHours(old.getHours(), old.getMinutes(), old.getSeconds(), old.getMilliseconds())
  return next.toISOString()
}
