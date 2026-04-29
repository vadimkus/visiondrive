import { describe, expect, it } from 'vitest'
import {
  buildPreVisitTasks,
  parsePreVisitTaskCompletion,
  preVisitCompletionSummary,
  serializePreVisitTaskCompletion,
} from './previsit-tasks'

describe('pre-visit tasks', () => {
  it('builds localized tasks and marks completed items', () => {
    const tasks = buildPreVisitTasks(['confirm_address', 'medical_changes'], 'ru')

    expect(tasks).toHaveLength(4)
    expect(tasks[0]).toMatchObject({ id: 'confirm_address', completed: true })
    expect(tasks[0].title).toContain('Подтвердите')
    expect(tasks[1].completed).toBe(false)
  })

  it('serializes and parses completion payloads safely', () => {
    const message = serializePreVisitTaskCompletion(['confirm_address', 'unknown', 'confirm_address'])

    expect(parsePreVisitTaskCompletion(message)).toEqual(['confirm_address'])
    expect(parsePreVisitTaskCompletion('not-json')).toEqual([])
    expect(preVisitCompletionSummary(['confirm_address'], 'en')).toBe('Pre-visit tasks: 1/4 completed')
  })
})
