import { describe, expect, it } from 'vitest'
import {
  normalizePhotoMilestones,
  normalizeTreatmentPlanCadenceDays,
  normalizeTreatmentPlanSessions,
  normalizeTreatmentPlanStatus,
  treatmentPlanProgress,
} from './treatment-plans'

describe('clinic treatment plans', () => {
  it('normalizes sessions and cadence into practical ranges', () => {
    expect(normalizeTreatmentPlanSessions('0')).toBe(1)
    expect(normalizeTreatmentPlanSessions('6')).toBe(6)
    expect(normalizeTreatmentPlanSessions('999')).toBe(60)
    expect(normalizeTreatmentPlanCadenceDays('0')).toBe(1)
    expect(normalizeTreatmentPlanCadenceDays('21')).toBe(21)
    expect(normalizeTreatmentPlanCadenceDays('999')).toBe(365)
  })

  it('normalizes plan status with fallback', () => {
    expect(normalizeTreatmentPlanStatus('paused')).toBe('PAUSED')
    expect(normalizeTreatmentPlanStatus('bad')).toBe('ACTIVE')
  })

  it('normalizes photo milestones from text or objects', () => {
    expect(normalizePhotoMilestones('Before photos, Session 3 comparison')).toEqual([
      { title: 'Before photos', targetSession: null, note: null },
      { title: 'Session 3 comparison', targetSession: null, note: null },
    ])
    expect(
      normalizePhotoMilestones([{ title: 'Final result', targetSession: 5, note: 'Use same lighting' }])
    ).toEqual([{ title: 'Final result', targetSession: 5, note: 'Use same lighting' }])
  })

  it('computes progress without exceeding expected sessions', () => {
    expect(treatmentPlanProgress(7, 5)).toEqual({
      completedSessions: 5,
      expectedSessions: 5,
      percent: 100,
      remainingSessions: 0,
    })
  })
})
