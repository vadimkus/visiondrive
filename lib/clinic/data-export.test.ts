import { describe, expect, it } from 'vitest'
import {
  isPatientDeleteConfirmationValid,
  patientDeleteConfirmation,
  patientDisplayName,
  patientExportFilename,
  safeExportFilenamePart,
  stripMediaBinary,
} from './data-export'

describe('data export helpers', () => {
  it('builds safe patient names and export filenames', () => {
    const patient = { id: 'patient_1234567890', firstName: 'Anna', lastName: 'De/Smith', middleName: null }

    expect(patientDisplayName(patient)).toBe('De/Smith Anna')
    expect(safeExportFilenamePart(patientDisplayName(patient))).toBe('De-Smith-Anna')
    expect(patientExportFilename(patient, new Date('2026-04-28T00:00:00.000Z'))).toBe(
      'clinic-patient-export-De-Smith-Anna-patient_-2026-04-28.json'
    )
  })

  it('requires exact typed delete confirmation', () => {
    const patient = { firstName: 'Anna', lastName: 'Smith' }

    expect(patientDeleteConfirmation(patient)).toBe('DELETE Smith Anna')
    expect(isPatientDeleteConfirmationValid(patient, 'DELETE Smith Anna')).toBe(true)
    expect(isPatientDeleteConfirmationValid(patient, 'delete Smith Anna')).toBe(false)
    expect(isPatientDeleteConfirmationValid(patient, 'DELETE Anna Smith')).toBe(false)
  })

  it('removes raw media bytes from JSON export shape', () => {
    expect(
      stripMediaBinary({
        id: 'media_1',
        data: new Uint8Array([1, 2, 3]),
        blobPathname: 'clinic/blob',
      })
    ).toEqual({
      id: 'media_1',
      blobPathname: 'clinic/blob',
      hasInlineData: true,
    })
  })
})
