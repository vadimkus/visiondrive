import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  normalizeIntakeHelpText,
  normalizeIntakeConditionAnswer,
  normalizeIntakePrompt,
  normalizeIntakeQuestionType,
} from '@/lib/clinic/intake-fields'
import { getClinicSession } from '@/lib/clinic/session'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: procedureId } = await context.params
  const procedure = await prisma.clinicProcedure.findFirst({
    where: { id: procedureId, tenantId: session.tenantId },
    select: { id: true },
  })
  if (!procedure) {
    return NextResponse.json({ error: 'Procedure not found' }, { status: 404 })
  }

  const questions = await prisma.clinicIntakeQuestion.findMany({
    where: { tenantId: session.tenantId, procedureId },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  })
  return NextResponse.json({ questions })
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

  const { id: procedureId } = await context.params
  const procedure = await prisma.clinicProcedure.findFirst({
    where: { id: procedureId, tenantId: session.tenantId },
    select: { id: true },
  })
  if (!procedure) {
    return NextResponse.json({ error: 'Procedure not found' }, { status: 404 })
  }

  const prompt = normalizeIntakePrompt(body.prompt)
  if (!prompt) {
    return NextResponse.json({ error: 'prompt is required' }, { status: 400 })
  }

  const question = await prisma.clinicIntakeQuestion.create({
    data: {
      tenantId: session.tenantId,
      procedureId,
      prompt,
      helpText: normalizeIntakeHelpText(body.helpText),
      type: normalizeIntakeQuestionType(body.type),
      required: body.required === true,
      internalOnly: body.internalOnly === true,
      showWhenQuestionId:
        body.showWhenQuestionId != null ? String(body.showWhenQuestionId).trim() || null : null,
      showWhenAnswer: normalizeIntakeConditionAnswer(body.showWhenAnswer),
      active: body.active !== false,
      sortOrder: Number.isFinite(Number(body.sortOrder)) ? Math.round(Number(body.sortOrder)) : 0,
      createdByUserId: session.userId,
    },
  })

  return NextResponse.json({ question }, { status: 201 })
}
