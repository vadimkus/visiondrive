import type { ClinicLocale } from '@/lib/clinic/strings'

export type VisitNoteAssistantInput = {
  locale?: ClinicLocale | string
  patientName?: string | null
  procedureName?: string | null
  rawNote?: unknown
  chiefComplaint?: unknown
  procedureSummary?: unknown
  nextSteps?: unknown
  staffNotes?: unknown
  lastVisitSummary?: string | null
}

export type VisitNoteDraft = {
  chiefComplaint: string
  procedureSummary: string
  nextSteps: string
  staffNotes: string
  reviewNote: string
}

function clean(value: unknown, max = 2_000) {
  return String(value ?? '')
    .replace(/\r/g, '')
    .replace(/[ \t]+/g, ' ')
    .trim()
    .slice(0, max)
}

function splitLines(text: string) {
  return text
    .split(/\n|[.;]/)
    .map((part) => part.trim())
    .filter(Boolean)
}

function includesAny(text: string, terms: string[]) {
  const lower = text.toLowerCase()
  return terms.some((term) => lower.includes(term))
}

function sentenceCase(text: string) {
  if (!text) return text
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}`
}

export function buildVisitNoteDraft(input: VisitNoteAssistantInput): VisitNoteDraft {
  const locale = String(input.locale || 'en').startsWith('ru') ? 'ru' : 'en'
  const raw = clean(input.rawNote, 4_000)
  const existingChief = clean(input.chiefComplaint)
  const existingSummary = clean(input.procedureSummary, 4_000)
  const existingNextSteps = clean(input.nextSteps, 2_000)
  const existingStaffNotes = clean(input.staffNotes, 2_000)
  const lines = splitLines(raw)

  const nextStepTerms =
    locale === 'ru'
      ? ['домаш', 'уход', 'контроль', 'через', 'повтор', 'след', 'рекоменд', 'назнач']
      : ['home', 'aftercare', 'follow', 'review', 'next', 'return', 'recommend', 'book']
  const riskTerms =
    locale === 'ru'
      ? ['аллерг', 'боль', 'отек', 'отёк', 'покрас', 'реакц', 'противопоказ']
      : ['allerg', 'pain', 'swelling', 'redness', 'reaction', 'contraindication']

  const nextLines = lines.filter((line) => includesAny(line, nextStepTerms))
  const riskLines = lines.filter((line) => includesAny(line, riskTerms))
  const clinicalLines = lines.filter((line) => !nextLines.includes(line))

  const patientName = clean(input.patientName, 120)
  const procedureName = clean(input.procedureName, 120)
  const lastVisitSummary = clean(input.lastVisitSummary, 1_000)

  const chiefComplaint =
    existingChief ||
    sentenceCase(
      clinicalLines[0] ||
        (locale === 'ru'
          ? 'Плановый визит / жалобы уточнить перед сохранением'
          : 'Routine visit / clarify complaint before saving')
    )

  const summaryParts = [
    existingSummary,
    procedureName
      ? locale === 'ru'
        ? `Услуга: ${procedureName}.`
        : `Service: ${procedureName}.`
      : '',
    patientName
      ? locale === 'ru'
        ? `Пациент: ${patientName}.`
        : `Patient: ${patientName}.`
      : '',
    clinicalLines.length > 0
      ? clinicalLines.map(sentenceCase).join('. ')
      : locale === 'ru'
        ? 'Осмотр и выполненные действия описать перед сохранением.'
        : 'Document assessment and performed care before saving.',
    lastVisitSummary
      ? locale === 'ru'
        ? `Контекст прошлого визита: ${lastVisitSummary}`
        : `Previous visit context: ${lastVisitSummary}`
      : '',
  ].filter(Boolean)

  const nextSteps =
    existingNextSteps ||
    (nextLines.length > 0
      ? nextLines.map(sentenceCase).join('. ')
      : locale === 'ru'
        ? 'Продолжить домашний уход по инструкции. Связаться с практиком при ухудшении или необычной реакции.'
        : 'Continue aftercare as instructed. Contact the practitioner if symptoms worsen or an unusual reaction appears.')

  const staffNotesParts = [
    existingStaffNotes,
    riskLines.length > 0
      ? locale === 'ru'
        ? `Проверить перед сохранением: ${riskLines.map(sentenceCase).join('. ')}`
        : `Review before saving: ${riskLines.map(sentenceCase).join('. ')}`
      : '',
  ].filter(Boolean)

  return {
    chiefComplaint,
    procedureSummary: summaryParts.join('\n'),
    nextSteps,
    staffNotes: staffNotesParts.join('\n'),
    reviewNote:
      locale === 'ru'
        ? 'AI-черновик подготовлен локально. Проверьте факты, противопоказания и назначения перед сохранением.'
        : 'AI draft prepared locally. Review facts, contraindications, and instructions before saving.',
  }
}
