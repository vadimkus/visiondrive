export type ClinicPractitionerIdentity = {
  displayName: string
  professionalTitle: string
  specialty: string
  messageSignature: string
}

const MAX_DISPLAY_NAME = 80
const MAX_TITLE = 90
const MAX_SPECIALTY = 120
const MAX_SIGNATURE = 160

function normalizeText(value: unknown, maxLength: number) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
}

function asSettings(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

export function normalizeClinicPractitionerIdentity(
  value: unknown,
  fallbackDisplayName?: string | null
): ClinicPractitionerIdentity {
  const raw = asSettings(value)
  return {
    displayName: normalizeText(raw.displayName ?? fallbackDisplayName, MAX_DISPLAY_NAME),
    professionalTitle: normalizeText(raw.professionalTitle, MAX_TITLE),
    specialty: normalizeText(raw.specialty, MAX_SPECIALTY),
    messageSignature: normalizeText(raw.messageSignature, MAX_SIGNATURE),
  }
}

export function practitionerIdentityFromThresholds(
  thresholds: unknown,
  fallbackDisplayName?: string | null
) {
  return normalizeClinicPractitionerIdentity(
    asSettings(thresholds).practitionerIdentity,
    fallbackDisplayName
  )
}

export function mergePractitionerIdentityIntoThresholds(
  thresholds: unknown,
  identity: ClinicPractitionerIdentity
) {
  return {
    ...asSettings(thresholds),
    practitionerIdentity: identity,
  }
}

export function practitionerDisplayName(identity?: Pick<ClinicPractitionerIdentity, 'displayName'> | null) {
  return identity?.displayName?.trim() || ''
}
