export type ExportPatientName = {
  firstName: string
  lastName: string
  middleName?: string | null
}

export function safeExportFilenamePart(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'patient'
}

export function patientDisplayName(patient: ExportPatientName) {
  return [patient.lastName, patient.firstName, patient.middleName].filter(Boolean).join(' ').trim()
}

export function patientDeleteConfirmation(patient: ExportPatientName) {
  return `DELETE ${patientDisplayName(patient)}`
}

export function isPatientDeleteConfirmationValid(patient: ExportPatientName, input: unknown) {
  return typeof input === 'string' && input.trim() === patientDeleteConfirmation(patient)
}

export function patientExportFilename(patient: ExportPatientName & { id: string }, generatedAt = new Date()) {
  const date = generatedAt.toISOString().slice(0, 10)
  const name = safeExportFilenamePart(patientDisplayName(patient))
  return `clinic-patient-export-${name}-${patient.id.slice(0, 8)}-${date}.json`
}

export function stripMediaBinary<T extends { data?: unknown; blobPathname?: string | null }>(media: T) {
  const { data: _data, ...rest } = media
  return {
    ...rest,
    hasInlineData: Boolean(_data),
  }
}
