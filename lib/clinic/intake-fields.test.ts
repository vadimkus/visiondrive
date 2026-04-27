import { ClinicIntakeQuestionType } from '@prisma/client'
import { describe, expect, it } from 'vitest'
import {
  intakeResponsesNote,
  normalizeIntakeAnswer,
  normalizeIntakeQuestionType,
  normalizeIntakeResponses,
  parseIntakeAnswerInputs,
} from './intake-fields'

describe('clinic intake fields', () => {
  it('normalizes question types and answers', () => {
    expect(normalizeIntakeQuestionType('textarea')).toBe(ClinicIntakeQuestionType.TEXTAREA)
    expect(normalizeIntakeQuestionType('yes_no')).toBe(ClinicIntakeQuestionType.YES_NO)
    expect(normalizeIntakeQuestionType('unknown')).toBe(ClinicIntakeQuestionType.TEXT)
    expect(normalizeIntakeAnswer(ClinicIntakeQuestionType.YES_NO, 'true')).toBe('Yes')
    expect(normalizeIntakeAnswer(ClinicIntakeQuestionType.YES_NO, 'no')).toBe('No')
    expect(normalizeIntakeAnswer(ClinicIntakeQuestionType.TEXT, '  hello  ')).toBe('hello')
  })

  it('parses public answer inputs and detects missing required answers', () => {
    const parsed = parseIntakeAnswerInputs([
      { questionId: 'q1', answer: 'yes' },
      { questionId: '', answer: 'ignored' },
      null,
    ])
    expect(parsed).toEqual([{ questionId: 'q1', answer: 'yes' }])

    const result = normalizeIntakeResponses(
      [
        { id: 'q1', prompt: 'Pregnant?', type: ClinicIntakeQuestionType.YES_NO, required: true },
        { id: 'q2', prompt: 'Allergies?', type: ClinicIntakeQuestionType.TEXT, required: true },
      ],
      parsed
    )
    expect(result.responses).toEqual([
      {
        questionId: 'q1',
        promptSnapshot: 'Pregnant?',
        typeSnapshot: ClinicIntakeQuestionType.YES_NO,
        answerText: 'Yes',
      },
    ])
    expect(result.missingRequired.map((q) => q.id)).toEqual(['q2'])
  })

  it('builds a compact staff note from answered fields', () => {
    expect(
      intakeResponsesNote([
        {
          questionId: 'q1',
          promptSnapshot: 'Recent procedures?',
          typeSnapshot: ClinicIntakeQuestionType.TEXTAREA,
          answerText: 'Peel last week',
        },
      ])
    ).toContain('Recent procedures?: Peel last week')
  })
})
