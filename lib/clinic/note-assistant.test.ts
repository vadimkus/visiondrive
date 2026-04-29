import { describe, expect, it } from 'vitest'
import { buildVisitNoteDraft } from '@/lib/clinic/note-assistant'

describe('note assistant', () => {
  it('builds an English structured visit draft', () => {
    const draft = buildVisitNoteDraft({
      locale: 'en',
      patientName: 'Maya Chen',
      procedureName: 'Hydrafacial',
      rawNote:
        'skin dry after travel. performed gentle cleanse and hydration. recommend SPF and follow up in 2 weeks.',
    })

    expect(draft.chiefComplaint).toBe('Skin dry after travel')
    expect(draft.procedureSummary).toContain('Service: Hydrafacial.')
    expect(draft.nextSteps).toContain('Recommend SPF')
    expect(draft.reviewNote).toContain('Review facts')
  })

  it('builds a Russian draft with review guardrail', () => {
    const draft = buildVisitNoteDraft({
      locale: 'ru',
      rawNote: 'сухость кожи после перелета. выполнено очищение. домашний уход и контроль через 10 дней',
    })

    expect(draft.chiefComplaint).toBe('Сухость кожи после перелета')
    expect(draft.nextSteps).toContain('Домашний уход')
    expect(draft.reviewNote).toContain('Проверьте')
  })

  it('preserves existing fields when present', () => {
    const draft = buildVisitNoteDraft({
      rawNote: 'follow up next week',
      chiefComplaint: 'Existing complaint',
      procedureSummary: 'Existing summary',
    })

    expect(draft.chiefComplaint).toBe('Existing complaint')
    expect(draft.procedureSummary).toContain('Existing summary')
  })
})
