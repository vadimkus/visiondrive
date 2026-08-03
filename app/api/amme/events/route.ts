import { NextRequest } from 'next/server'
import { getAmmeSession } from '@/lib/amme/session'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const session = await getAmmeSession(request)
  if (!session) return new Response('Unauthorized', { status: 401 })

  const encoder = new TextEncoder()
  let cursor = request.nextUrl.searchParams.get('after') || new Date(Date.now() - 10_000).toISOString()
  let timer: ReturnType<typeof setInterval> | null = null
  let heartbeat: ReturnType<typeof setInterval> | null = null

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode('retry: 2000\n\n'))
      const send = async () => {
        try {
          const events = await prisma.ammeDomainEvent.findMany({
            where: { venueId: session.venueId, occurredAt: { gt: new Date(cursor) } },
            orderBy: { occurredAt: 'asc' },
            take: 100,
          })
          for (const event of events) {
            cursor = event.occurredAt.toISOString()
            controller.enqueue(
              encoder.encode(
                `id: ${event.id}\nevent: ${event.type}\ndata: ${JSON.stringify({
                  ...event,
                  occurredAt: cursor,
                })}\n\n`
              )
            )
          }
        } catch {
          controller.enqueue(encoder.encode('event: error\ndata: {"retry":true}\n\n'))
        }
      }
      void send()
      timer = setInterval(() => void send(), 1500)
      heartbeat = setInterval(() => controller.enqueue(encoder.encode(': heartbeat\n\n')), 10_000)
    },
    cancel() {
      if (timer) clearInterval(timer)
      if (heartbeat) clearInterval(heartbeat)
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
