import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import {
  normalizeIntakeHelpText,
  normalizeIntakeConditionAnswer,
  normalizeIntakePrompt,
  normalizeIntakeQuestionType,
} from '@/lib/clinic/intake-fields'
import { getClinicSession } from '@/lib/clinic/session'

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string; questionId: string }> }
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

  const { id: procedureId, questionId } = await context.params
  const existing = await prisma.clinicIntakeQuestion.findFirst({
    where: { id: questionId, procedureId, tenantId: session.tenantId },
    select: { id: true },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 })
  }

  const data: Prisma.ClinicIntakeQuestionUpdateInput = {}
  if (body.prompt !== undefined) {
    const prompt = normalizeIntakePrompt(body.prompt)
    if (!prompt) return NextResponse.json({ error: 'prompt cannot be empty' }, { status: 400 })
    data.prompt = prompt
  }
  if (body.helpText !== undefined) data.helpText = normalizeIntakeHelpText(body.helpText)
  if (body.type !== undefined) data.type = normalizeIntakeQuestionType(body.type)
  if (body.required !== undefined) data.required = body.required === true
  if (body.internalOnly !== undefined) data.internalOnly = body.internalOnly === true
  if (body.showWhenQuestionId !== undefined) {
    data.showWhenQuestionId =
      body.showWhenQuestionId != null ? String(body.showWhenQuestionId).trim() || null : null
  }
  if (body.showWhenAnswer !== undefined) data.showWhenAnswer = normalizeIntakeConditionAnswer(body.showWhenAnswer)
  if (body.active !== undefined) data.active = body.active === true
  if (body.sortOrder !== undefined && Number.isFinite(Number(body.sortOrder))) {
    data.sortOrder = Math.round(Number(body.sortOrder))
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  const question = await prisma.clinicIntakeQuestion.update({
    where: { id: questionId },
    data,
  })

  return NextResponse.json({ question })
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; questionId: string }> }
) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: procedureId, questionId } = await context.params
  const existing = await prisma.clinicIntakeQuestion.findFirst({
    where: { id: questionId, procedureId, tenantId: session.tenantId },
    select: { id: true },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 })
  }

  await prisma.clinicIntakeQuestion.delete({ where: { id: questionId } })
  return NextResponse.json({ ok: true })
}
