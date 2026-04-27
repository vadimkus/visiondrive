import { describe, expect, it } from 'vitest'
import {
  buildPatientImportCandidates,
  parsePatientImportDate,
  patientImportSummary,
} from './patient-import'

describe('patient import', () => {
  it('parses common date formats and Excel serials', () => {
    expect(parsePatientImportDate('1990-12-31')).toBe('1990-12-31')
    expect(parsePatientImportDate('31.12.1990')).toBe('1990-12-31')
    expect(parsePatientImportDate('12/31/1990')).toBe('1990-12-31')
    expect(parsePatientImportDate(33239)).toBe('1991-01-01')
  })

  it('maps spreadsheet headers into patient import candidates', () => {
    const rows = [
      ['Full name', 'DOB', 'Phone', 'Email', 'Category', 'Tags', 'Address'],
      ['Jane Smith', '1990-12-31', '+971 50 123 4567', 'JANE@EXAMPLE.COM', 'vip', 'vip, follow up due', 'Dubai Marina'],
    ]

    const [candidate] = buildPatientImportCandidates(rows)

    expect(candidate).toMatchObject({
      rowNumber: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      dateOfBirth: '1990-12-31',
      phone: '+971 50 123 4567',
      email: 'jane@example.com',
      homeAddress: 'Dubai Marina',
      category: 'VIP',
      tags: ['vip', 'follow-up-due'],
      errors: [],
      duplicateReason: null,
    })
  })

  it('marks invalid and duplicate rows before import', () => {
    const rows = [
      ['First name', 'Last name', 'Date of birth', 'Phone', 'Email'],
      ['Jane', 'Smith', '1990-12-31', '+971501', 'jane@example.com'],
      ['Jake', 'Smith', '', '+971501', 'jake@example.com'],
      ['Existing', 'Client', '1988-01-01', '+971502', 'existing@example.com'],
    ]

    const candidates = buildPatientImportCandidates(rows, [{ email: 'existing@example.com' }])
    expect(candidates[1].errors).toContain('dob_missing')
    expect(candidates[1].duplicateReason).toBe('file_phone')
    expect(candidates[2].duplicateReason).toBe('existing_email')
    expect(patientImportSummary(candidates)).toEqual({
      total: 3,
      valid: 2,
      importable: 1,
      duplicates: 2,
      invalid: 1,
    })
  })
})
