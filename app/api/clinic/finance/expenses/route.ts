import { NextRequest, NextResponse } from 'next/server'
import { ExpenseCategory } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getClinicSession } from '@/lib/clinic/session'

const ALLOWED_CATEGORIES = new Set<string>(Object.values(ExpenseCategory))

function parseDate(input: string | null, fallback: Date) {
  if (!input) return fallback
  const d = new Date(input)
  return Number.isNaN(d.getTime()) ? fallback : d
}

export async function GET(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const end = parseDate(searchParams.get('end'), new Date())
  const start = parseDate(searchParams.get('start'), new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000))
  const limit = Math.min(100, Math.max(10, Number(searchParams.get('limit') || 50)))

  const expenses = await prisma.expense.findMany({
    where: {
      tenantId: session.tenantId,
      occurredAt: { gte: start, lte: end },
    },
    select: {
      id: true,
      category: true,
      vendor: true,
      description: true,
      amountCents: true,
      currency: true,
      occurredAt: true,
      createdAt: true,
    },
    orderBy: { occurredAt: 'desc' },
    take: limit,
  })

  return NextResponse.json({
    expenses: expenses.map((expense) => ({
      ...expense,
      occurredAt: expense.occurredAt.toISOString(),
      createdAt: expense.createdAt.toISOString(),
    })),
  })
}

export async function POST(request: NextRequest) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const categoryRaw = String(body.category ?? 'OTHER').trim().toUpperCase()
  if (!ALLOWED_CATEGORIES.has(categoryRaw)) {
    return NextResponse.json({ error: 'Invalid expense category' }, { status: 400 })
  }

  const amountCents = Number(body.amountCents)
  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    return NextResponse.json({ error: 'amountCents must be a positive integer' }, { status: 400 })
  }

  const currency = body.currency != null ? String(body.currency).trim().toUpperCase() || 'AED' : 'AED'
  if (!/^[A-Z]{3}$/.test(currency)) {
    return NextResponse.json({ error: 'currency must be a 3-letter code' }, { status: 400 })
  }

  const occurredAtRaw = String(body.occurredAt ?? '')
  const occurredAt = occurredAtRaw ? new Date(occurredAtRaw) : new Date()
  if (Number.isNaN(occurredAt.getTime())) {
    return NextResponse.json({ error: 'occurredAt must be a valid ISO datetime' }, { status: 400 })
  }

  const expense = await prisma.expense.create({
    data: {
      tenantId: session.tenantId,
      category: categoryRaw as ExpenseCategory,
      vendor: body.vendor != null ? String(body.vendor).trim() || null : null,
      description: body.description != null ? String(body.description).trim() || null : null,
      amountCents,
      currency,
      occurredAt,
      createdByUserId: session.userId,
    },
    select: {
      id: true,
      category: true,
      vendor: true,
      description: true,
      amountCents: true,
      currency: true,
      occurredAt: true,
      createdAt: true,
    },
  })

  return NextResponse.json(
    {
      expense: {
        ...expense,
        occurredAt: expense.occurredAt.toISOString(),
        createdAt: expense.createdAt.toISOString(),
      },
    },
    { status: 201 }
  )
}
