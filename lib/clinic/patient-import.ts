import { normalizePatientCategory, normalizePatientTags } from './patient-tags'

export type SpreadsheetCell = string | number | boolean | Date | null | undefined

export type PatientImportCandidate = {
  rowNumber: number
  firstName: string
  lastName: string
  middleName: string | null
  dateOfBirth: string | null
  phone: string | null
  email: string | null
  homeAddress: string | null
  area: string | null
  accessNotes: string | null
  category: string | null
  tags: string[]
  internalNotes: string | null
  errors: string[]
  duplicateReason: string | null
}

type ExistingPatientKey = {
  phone?: string | null
  email?: string | null
}

const COLUMN_ALIASES = {
  firstName: ['firstname', 'first', 'givenname', 'имя'],
  lastName: ['lastname', 'last', 'surname', 'familyname', 'фамилия'],
  middleName: ['middlename', 'middle', 'patronymic', 'отчество'],
  fullName: ['fullname', 'name', 'patient', 'client', 'fio', 'фио', 'пациент', 'клиент'],
  dateOfBirth: ['dateofbirth', 'dob', 'birthdate', 'birthday', 'датарождения', 'др'],
  phone: ['phone', 'mobile', 'whatsapp', 'telephone', 'телефон', 'мобильный'],
  email: ['email', 'mail', 'e-mail', 'почта', 'емейл'],
  homeAddress: ['homeaddress', 'address', 'clientaddress', 'адрес', 'домашнийадрес'],
  area: ['area', 'district', 'location', 'район'],
  accessNotes: ['accessnotes', 'parking', 'access', 'notesforaccess', 'доступ', 'парковка'],
  category: ['category', 'segment', 'type', 'категория'],
  tags: ['tags', 'labels', 'метки', 'теги'],
  internalNotes: ['notes', 'internalnotes', 'comment', 'comments', 'заметки', 'комментарий'],
} as const

function normalizeHeader(value: SpreadsheetCell) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^a-zа-я0-9]+/g, '')
}

function text(value: SpreadsheetCell, max = 500) {
  const normalized = String(value ?? '').trim().slice(0, max)
  return normalized || null
}

function normalizeEmail(value: SpreadsheetCell) {
  const normalized = text(value, 320)?.toLowerCase() ?? null
  return normalized && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) ? normalized : normalized
}

function normalizePhone(value: SpreadsheetCell) {
  const normalized = text(value, 80)?.replace(/\s+/g, ' ') ?? null
  return normalized
}

function dateToIso(date: Date) {
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString().slice(0, 10)
}

function excelSerialToDate(serial: number) {
  // Excel's serial day 1 is 1900-01-01, with the historical leap-year bug baked into common exports.
  const millis = Math.round((serial - 25569) * 86400 * 1000)
  return new Date(millis)
}

export function parsePatientImportDate(value: SpreadsheetCell) {
  if (value instanceof Date) return dateToIso(value)
  if (typeof value === 'number' && Number.isFinite(value) && value > 1000) {
    return dateToIso(excelSerialToDate(value))
  }
  const raw = String(value ?? '').trim()
  if (!raw) return null

  const iso = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/.exec(raw)
  if (iso) {
    const [, year, month, day] = iso
    return dateToIso(new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), 12)))
  }

  const local = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/.exec(raw)
  if (local) {
    const first = Number(local[1])
    const second = Number(local[2])
    const year = Number(local[3].length === 2 ? `20${local[3]}` : local[3])
    const day = second > 12 ? second : first
    const month = second > 12 ? first : second
    return dateToIso(new Date(Date.UTC(year, month - 1, day, 12)))
  }

  return null
}

function findColumn(headers: string[], aliases: readonly string[]) {
  return headers.findIndex((header) => aliases.includes(header))
}

function splitFullName(fullName: string | null) {
  if (!fullName) return { firstName: '', lastName: '', middleName: null }
  if (fullName.includes(',')) {
    const [last, rest] = fullName.split(',', 2).map((part) => part.trim())
    const parts = rest.split(/\s+/).filter(Boolean)
    return {
      firstName: parts[0] ?? '',
      lastName: last,
      middleName: parts.slice(1).join(' ') || null,
    }
  }
  const parts = fullName.split(/\s+/).filter(Boolean)
  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' '),
    middleName: null,
  }
}

export function buildPatientImportCandidates(
  rows: SpreadsheetCell[][],
  existingPatients: ExistingPatientKey[] = []
) {
  if (rows.length < 2) return []
  const headers = rows[0].map(normalizeHeader)
  const column = Object.fromEntries(
    Object.entries(COLUMN_ALIASES).map(([key, aliases]) => [key, findColumn(headers, aliases)])
  ) as Record<keyof typeof COLUMN_ALIASES, number>

  const existingEmails = new Set(existingPatients.map((patient) => patient.email?.toLowerCase()).filter(Boolean))
  const existingPhones = new Set(existingPatients.map((patient) => patient.phone).filter(Boolean))
  const seenEmails = new Set<string>()
  const seenPhones = new Set<string>()

  return rows.slice(1).map((row, index): PatientImportCandidate => {
    const at = (key: keyof typeof COLUMN_ALIASES) => (column[key] >= 0 ? row[column[key]] : null)
    const fullName = text(at('fullName'))
    const split = splitFullName(fullName)
    const firstName = text(at('firstName'), 120) ?? split.firstName
    const lastName = text(at('lastName'), 120) ?? split.lastName
    const middleName = text(at('middleName'), 120) ?? split.middleName
    const dateOfBirth = parsePatientImportDate(at('dateOfBirth'))
    const phone = normalizePhone(at('phone'))
    const email = normalizeEmail(at('email'))
    const errors: string[] = []
    let duplicateReason: string | null = null

    if (!firstName || !lastName) errors.push('name_missing')
    if (!dateOfBirth) errors.push('dob_missing')
    if (!phone && !email) errors.push('contact_missing')
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('email_invalid')

    if (email && existingEmails.has(email)) duplicateReason = 'existing_email'
    if (!duplicateReason && phone && existingPhones.has(phone)) duplicateReason = 'existing_phone'
    if (!duplicateReason && email && seenEmails.has(email)) duplicateReason = 'file_email'
    if (!duplicateReason && phone && seenPhones.has(phone)) duplicateReason = 'file_phone'
    if (email) seenEmails.add(email)
    if (phone) seenPhones.add(phone)

    return {
      rowNumber: index + 2,
      firstName,
      lastName,
      middleName,
      dateOfBirth,
      phone,
      email,
      homeAddress: text(at('homeAddress'), 2000),
      area: text(at('area'), 120),
      accessNotes: text(at('accessNotes'), 2000),
      category: normalizePatientCategory(at('category')),
      tags: normalizePatientTags(at('tags')),
      internalNotes: text(at('internalNotes'), 4000),
      errors,
      duplicateReason,
    }
  })
}

export function patientImportSummary(rows: PatientImportCandidate[]) {
  const validRows = rows.filter((row) => row.errors.length === 0)
  const duplicates = rows.filter((row) => row.duplicateReason)
  return {
    total: rows.length,
    valid: validRows.length,
    importable: validRows.filter((row) => !row.duplicateReason).length,
    duplicates: duplicates.length,
    invalid: rows.filter((row) => row.errors.length > 0).length,
  }
}
