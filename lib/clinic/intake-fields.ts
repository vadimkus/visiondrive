import { ClinicIntakeQuestionType } from '@prisma/client'

export type IntakeQuestionLike = {
  id: string
  prompt: string
  helpText?: string | null
  type: ClinicIntakeQuestionType | string
  required: boolean
}

export type IntakeAnswerInput = {
  questionId: string
  answer: string
}

export type NormalizedIntakeAnswer = {
  questionId: string
  promptSnapshot: string
  typeSnapshot: ClinicIntakeQuestionType
  answerText: string | null
}

export function normalizeIntakeQuestionType(value: unknown): ClinicIntakeQuestionType {
  const text = String(value ?? '').trim().toUpperCase()
  if (text === 'TEXTAREA') return ClinicIntakeQuestionType.TEXTAREA
  if (text === 'YES_NO') return ClinicIntakeQuestionType.YES_NO
  return ClinicIntakeQuestionType.TEXT
}

export function normalizeIntakePrompt(value: unknown) {
  return String(value ?? '').trim().slice(0, 500)
}

export function normalizeIntakeHelpText(value: unknown) {
  const text = String(value ?? '').trim().slice(0, 1000)
  return text || null
}

export function normalizeIntakeAnswer(type: ClinicIntakeQuestionType | string, value: unknown) {
  const questionType = normalizeIntakeQuestionType(type)
  if (questionType === ClinicIntakeQuestionType.YES_NO) {
    const text = String(value ?? '').trim().toLowerCase()
    if (['yes', 'true', '1', 'y'].includes(text)) return 'Yes'
    if (['no', 'false', '0', 'n'].includes(text)) return 'No'
    return null
  }
  const limit = questionType === ClinicIntakeQuestionType.TEXTAREA ? 2000 : 500
  const text = String(value ?? '').trim().slice(0, limit)
  return text || null
}

export function parseIntakeAnswerInputs(value: unknown): IntakeAnswerInput[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const record = item as Record<string, unknown>
      const questionId = String(record.questionId ?? '').trim()
      if (!questionId) return null
      return { questionId, answer: String(record.answer ?? '') }
    })
    .filter((item): item is IntakeAnswerInput => item !== null)
}

export function normalizeIntakeResponses(
  questions: IntakeQuestionLike[],
  answerInputs: IntakeAnswerInput[]
) {
  const answers = new Map(answerInputs.map((answer) => [answer.questionId, answer.answer]))
  const missingRequired: IntakeQuestionLike[] = []
  const responses: NormalizedIntakeAnswer[] = []

  for (const question of questions) {
    const type = normalizeIntakeQuestionType(question.type)
    const answerText = normalizeIntakeAnswer(type, answers.get(question.id))
    if (question.required && !answerText) {
      missingRequired.push(question)
      continue
    }
    if (answerText) {
      responses.push({
        questionId: question.id,
        promptSnapshot: question.prompt,
        typeSnapshot: type,
        answerText,
      })
    }
  }

  return { responses, missingRequired }
}

export function intakeResponsesNote(responses: NormalizedIntakeAnswer[]) {
  if (responses.length === 0) return null
  return ['Service intake answers', ...responses.map((response) => `${response.promptSnapshot}: ${response.answerText}`)].join('\n')
}
