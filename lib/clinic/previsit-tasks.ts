export const PRE_VISIT_TASKS_MESSAGE_PREFIX = 'PRE_VISIT_TASKS:'

export type PreVisitTaskId =
  | 'confirm_address'
  | 'confirm_access'
  | 'medical_changes'
  | 'treatment_ready'

export type PreVisitTask = {
  id: PreVisitTaskId
  title: string
  description: string
  completed: boolean
}

type PreVisitTaskCopy = Record<PreVisitTaskId, { title: string; description: string }>

const copy: Record<'en' | 'ru', PreVisitTaskCopy> = {
  en: {
    confirm_address: {
      title: 'Confirm the address',
      description: 'Check that the address and area below are correct for the home visit.',
    },
    confirm_access: {
      title: 'Prepare access details',
      description: 'Share entrance, parking, gate code, concierge, or lift instructions if needed.',
    },
    medical_changes: {
      title: 'Tell us about changes',
      description: 'Message the practitioner if allergies, medication, pregnancy, illness, or skin condition changed.',
    },
    treatment_ready: {
      title: 'Be treatment-ready',
      description: 'Have a clean treatment area, good lighting, and avoid makeup or heavy skincare before injectables.',
    },
  },
  ru: {
    confirm_address: {
      title: 'Подтвердите адрес',
      description: 'Проверьте, что адрес и район ниже указаны верно для выездного визита.',
    },
    confirm_access: {
      title: 'Подготовьте доступ',
      description: 'Если нужно, сообщите вход, парковку, код ворот, консьержа или лифт.',
    },
    medical_changes: {
      title: 'Сообщите об изменениях',
      description: 'Напишите специалисту, если изменились аллергии, лекарства, беременность, самочувствие или кожа.',
    },
    treatment_ready: {
      title: 'Подготовьтесь к процедуре',
      description: 'Подготовьте чистое место и хороший свет; перед инъекциями избегайте макияжа и плотного ухода.',
    },
  },
}

const taskOrder: PreVisitTaskId[] = [
  'confirm_address',
  'confirm_access',
  'medical_changes',
  'treatment_ready',
]

export function buildPreVisitTasks(
  completedTaskIds: Iterable<string> = [],
  locale: 'en' | 'ru' = 'en'
): PreVisitTask[] {
  const completed = new Set(completedTaskIds)
  return taskOrder.map((id) => ({
    id,
    ...copy[locale][id],
    completed: completed.has(id),
  }))
}

export function serializePreVisitTaskCompletion(completedTaskIds: Iterable<string>) {
  const valid = new Set(taskOrder)
  const ids = Array.from(new Set(completedTaskIds)).filter((id): id is PreVisitTaskId =>
    valid.has(id as PreVisitTaskId)
  )
  return `${PRE_VISIT_TASKS_MESSAGE_PREFIX}${JSON.stringify({ completedTaskIds: ids })}`
}

export function parsePreVisitTaskCompletion(message: string | null | undefined): PreVisitTaskId[] {
  if (!message?.startsWith(PRE_VISIT_TASKS_MESSAGE_PREFIX)) return []
  try {
    const payload = JSON.parse(message.slice(PRE_VISIT_TASKS_MESSAGE_PREFIX.length)) as {
      completedTaskIds?: unknown
    }
    if (!Array.isArray(payload.completedTaskIds)) return []
    const valid = new Set(taskOrder)
    return payload.completedTaskIds.filter((id): id is PreVisitTaskId =>
      typeof id === 'string' && valid.has(id as PreVisitTaskId)
    )
  } catch {
    return []
  }
}

export function preVisitCompletionSummary(completedTaskIds: Iterable<string>, locale: 'en' | 'ru' = 'en') {
  const tasks = buildPreVisitTasks(completedTaskIds, locale)
  const done = tasks.filter((task) => task.completed).length
  return locale === 'ru'
    ? `Предвизитные задачи: ${done}/${tasks.length} выполнено`
    : `Pre-visit tasks: ${done}/${tasks.length} completed`
}
