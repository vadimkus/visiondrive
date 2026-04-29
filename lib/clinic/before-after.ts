export type BeforeAfterMedia = {
  id: string
  kind: string
  visitId: string | null
  createdAt: string | Date
}

export type BeforeAfterPair<T extends BeforeAfterMedia = BeforeAfterMedia> = {
  id: string
  before: T
  after: T
  visitId: string | null
}

function mediaTime(media: BeforeAfterMedia) {
  const value = new Date(media.createdAt).getTime()
  return Number.isFinite(value) ? value : 0
}

export function buildBeforeAfterPairs<T extends BeforeAfterMedia>(media: T[]): BeforeAfterPair<T>[] {
  const befores = media
    .filter((item) => item.kind === 'BEFORE')
    .sort((a, b) => mediaTime(b) - mediaTime(a))
  const afters = media
    .filter((item) => item.kind === 'AFTER')
    .sort((a, b) => mediaTime(b) - mediaTime(a))

  return afters
    .map((after) => {
      const before =
        befores.find((item) => item.visitId && item.visitId === after.visitId) ??
        befores.find((item) => mediaTime(item) <= mediaTime(after)) ??
        befores[0]
      if (!before) return null
      return {
        id: `${before.id}:${after.id}`,
        before,
        after,
        visitId: after.visitId ?? before.visitId ?? null,
      }
    })
    .filter((pair): pair is BeforeAfterPair<T> => Boolean(pair))
}
