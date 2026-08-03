export type CrmSegment =
  | 'all'
  | 'vip'
  | 'regular'
  | 'new'
  | 'dormant'
  | 'banya'
  | 'high'
  | 'blocked'
  | 'noshow'

export const CRM_TAG_PRESETS = [
  'VIP',
  'Постоянный',
  'Аллергия',
  'Веган',
  'Пресса',
  'Друг дома',
  'Группа',
  'Осторожно',
] as const
