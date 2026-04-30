'use client'

import { useMemo, useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import { Pencil, RotateCcw, Save, Trash2, Undo2, XCircle } from 'lucide-react'
import clsx from 'clsx'
import type { ClinicStrings } from '@/lib/clinic/strings'
import type { FaceMapMetadata, FaceMapPoint, FaceMapStroke } from '@/lib/clinic/face-map'

export type FaceMapMediaOption = {
  id: string
  label: string
  imageUrl: string
}

type FaceMapBase = {
  source: 'template' | 'media'
  sourceMediaId: string | null
}

const COLORS = ['#dc2626', '#2563eb', '#16a34a', '#7c3aed', '#111827']

function strokePath(points: FaceMapPoint[]) {
  if (points.length === 0) return ''
  const [first, ...rest] = points
  return `M ${first.x} ${first.y} ${rest.map((point) => `L ${point.x} ${point.y}`).join(' ')}`
}

function drawTemplateCanvas(ctx: CanvasRenderingContext2D, size: number) {
  ctx.fillStyle = '#fff7ed'
  ctx.fillRect(0, 0, size, size)

  const scale = size / 1000
  const s = (n: number) => n * scale

  ctx.fillStyle = '#fde7d3'
  ctx.strokeStyle = '#7c2d12'
  ctx.lineWidth = s(5)
  ctx.beginPath()
  ctx.ellipse(s(500), s(455), s(245), s(330), 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = '#3f2a20'
  ctx.beginPath()
  ctx.ellipse(s(500), s(365), s(300), s(360), 0, Math.PI, Math.PI * 2)
  ctx.fill()
  ctx.fillRect(s(215), s(360), s(70), s(215))
  ctx.fillRect(s(715), s(360), s(70), s(215))

  ctx.fillStyle = '#fde7d3'
  ctx.beginPath()
  ctx.ellipse(s(232), s(475), s(36), s(80), 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
  ctx.beginPath()
  ctx.ellipse(s(768), s(475), s(36), s(80), 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = '#f9dcc5'
  ctx.beginPath()
  ctx.moveTo(s(430), s(720))
  ctx.quadraticCurveTo(s(500), s(760), s(570), s(720))
  ctx.lineTo(s(610), s(845))
  ctx.quadraticCurveTo(s(500), s(885), s(390), s(845))
  ctx.closePath()
  ctx.fill()

  ctx.strokeStyle = '#9a3412'
  ctx.lineWidth = s(4)
  ctx.beginPath()
  ctx.moveTo(s(335), s(392))
  ctx.quadraticCurveTo(s(405), s(365), s(462), s(392))
  ctx.moveTo(s(538), s(392))
  ctx.quadraticCurveTo(s(595), s(365), s(665), s(392))
  ctx.stroke()

  ctx.strokeStyle = '#1f2937'
  ctx.lineWidth = s(3)
  ctx.beginPath()
  ctx.ellipse(s(405), s(435), s(42), s(16), 0, 0, Math.PI * 2)
  ctx.ellipse(s(595), s(435), s(42), s(16), 0, 0, Math.PI * 2)
  ctx.stroke()

  ctx.strokeStyle = '#c2410c'
  ctx.beginPath()
  ctx.moveTo(s(500), s(455))
  ctx.quadraticCurveTo(s(470), s(555), s(500), s(592))
  ctx.quadraticCurveTo(s(535), s(565), s(510), s(535))
  ctx.stroke()

  ctx.strokeStyle = '#be123c'
  ctx.lineWidth = s(4)
  ctx.beginPath()
  ctx.moveTo(s(425), s(660))
  ctx.quadraticCurveTo(s(500), s(690), s(575), s(660))
  ctx.quadraticCurveTo(s(500), s(735), s(425), s(660))
  ctx.stroke()

  ctx.strokeStyle = '#ea580c'
  ctx.lineWidth = s(2)
  ctx.setLineDash([s(8), s(10)])
  for (const [x, y, rx, ry] of [
    [365, 535, 70, 115],
    [635, 535, 70, 115],
    [500, 520, 150, 250],
  ] as const) {
    ctx.beginPath()
    ctx.ellipse(s(x), s(y), s(rx), s(ry), 0, 0, Math.PI * 2)
    ctx.stroke()
  }
  ctx.setLineDash([])

  ctx.fillStyle = '#ffedd5'
  ctx.beginPath()
  ctx.moveTo(s(290), s(930))
  ctx.quadraticCurveTo(s(500), s(835), s(710), s(930))
  ctx.lineTo(s(710), s(1000))
  ctx.lineTo(s(290), s(1000))
  ctx.closePath()
  ctx.fill()
}

function FaceTemplateSvg() {
  return (
    <>
      <rect x="0" y="0" width="1000" height="1000" fill="#fff7ed" />
      <path d="M215 575V360c0-170 125-295 285-295s285 125 285 295v215" fill="#3f2a20" />
      <ellipse cx="500" cy="455" rx="245" ry="330" fill="#fde7d3" stroke="#7c2d12" strokeWidth="5" />
      <ellipse cx="232" cy="475" rx="36" ry="80" fill="#fde7d3" stroke="#7c2d12" strokeWidth="5" />
      <ellipse cx="768" cy="475" rx="36" ry="80" fill="#fde7d3" stroke="#7c2d12" strokeWidth="5" />
      <path d="M430 720 Q500 760 570 720 L610 845 Q500 885 390 845 Z" fill="#f9dcc5" />
      <path d="M335 392 Q405 365 462 392 M538 392 Q595 365 665 392" fill="none" stroke="#9a3412" strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="405" cy="435" rx="42" ry="16" fill="none" stroke="#1f2937" strokeWidth="3" />
      <ellipse cx="595" cy="435" rx="42" ry="16" fill="none" stroke="#1f2937" strokeWidth="3" />
      <path d="M500 455 Q470 555 500 592 Q535 565 510 535" fill="none" stroke="#c2410c" strokeWidth="3" strokeLinecap="round" />
      <path d="M425 660 Q500 690 575 660 Q500 735 425 660" fill="none" stroke="#be123c" strokeWidth="4" strokeLinecap="round" />
      <g fill="none" stroke="#ea580c" strokeWidth="2" strokeDasharray="8 10" opacity="0.7">
        <ellipse cx="365" cy="535" rx="70" ry="115" />
        <ellipse cx="635" cy="535" rx="70" ry="115" />
        <ellipse cx="500" cy="520" rx="150" ry="250" />
      </g>
      <path d="M290 930 Q500 835 710 930 L710 1000 L290 1000 Z" fill="#ffedd5" />
    </>
  )
}

async function imageFromBlob(blob: Blob) {
  const url = URL.createObjectURL(blob)
  try {
    const image = new window.Image()
    image.decoding = 'async'
    image.src = url
    await image.decode()
    return image
  } finally {
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
}

function drawImageCover(ctx: CanvasRenderingContext2D, image: HTMLImageElement, size: number) {
  const scale = Math.max(size / image.naturalWidth, size / image.naturalHeight)
  const width = size / scale
  const height = size / scale
  const sx = (image.naturalWidth - width) / 2
  const sy = (image.naturalHeight - height) / 2
  ctx.drawImage(image, sx, sy, width, height, 0, 0, size, size)
}

async function renderFaceMapPng(metadata: FaceMapMetadata, imageUrl: string | null) {
  const size = 1200
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is unavailable')

  if (metadata.source === 'media' && imageUrl) {
    const response = await fetch(imageUrl, { credentials: 'include' })
    if (!response.ok) throw new Error('Could not load base image')
    const image = await imageFromBlob(await response.blob())
    drawImageCover(ctx, image, size)
  } else {
    drawTemplateCanvas(ctx, size)
  }

  const scale = size / 1000
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  metadata.strokes.forEach((stroke) => {
    if (stroke.points.length === 0) return
    ctx.strokeStyle = stroke.color
    ctx.lineWidth = stroke.width * scale
    if (stroke.points.length === 1) {
      const point = stroke.points[0]
      ctx.fillStyle = stroke.color
      ctx.beginPath()
      ctx.arc(point.x * scale, point.y * scale, Math.max(4, (stroke.width * scale) / 2), 0, Math.PI * 2)
      ctx.fill()
      return
    }
    ctx.beginPath()
    ctx.moveTo(stroke.points[0].x * scale, stroke.points[0].y * scale)
    stroke.points.slice(1).forEach((point) => ctx.lineTo(point.x * scale, point.y * scale))
    ctx.stroke()
  })

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Could not render face map'))
    }, 'image/png')
  })
}

export function ClinicFaceMapEditor({
  t,
  mediaOptions,
  initialBase,
  initialFaceMap,
  saving,
  onSave,
  onClose,
}: {
  t: ClinicStrings
  mediaOptions: FaceMapMediaOption[]
  initialBase: FaceMapBase
  initialFaceMap: FaceMapMetadata | null
  saving: boolean
  onSave: (blob: Blob, metadata: FaceMapMetadata) => Promise<void>
  onClose: () => void
}) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const activeStrokeRef = useRef<FaceMapStroke | null>(null)
  const [base, setBase] = useState<FaceMapBase>(initialFaceMap ?? initialBase)
  const [strokes, setStrokes] = useState<FaceMapStroke[]>(initialFaceMap?.strokes ?? [])
  const [activeStroke, setActiveStroke] = useState<FaceMapStroke | null>(null)
  const [color, setColor] = useState(COLORS[0])
  const [width, setWidth] = useState(8)
  const [error, setError] = useState('')

  const baseImageUrl = useMemo(() => {
    if (base.source !== 'media' || !base.sourceMediaId) return null
    return mediaOptions.find((option) => option.id === base.sourceMediaId)?.imageUrl ?? null
  }, [base, mediaOptions])

  const visibleStrokes = activeStroke ? [...strokes, activeStroke] : strokes

  const pointFromEvent = (event: PointerEvent<SVGSVGElement>): FaceMapPoint | null => {
    const svg = svgRef.current
    if (!svg) return null
    const rect = svg.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return null
    return {
      x: ((event.clientX - rect.left) / rect.width) * 1000,
      y: ((event.clientY - rect.top) / rect.height) * 1000,
    }
  }

  const startStroke = (event: PointerEvent<SVGSVGElement>) => {
    const point = pointFromEvent(event)
    if (!point) return
    event.currentTarget.setPointerCapture(event.pointerId)
    const stroke = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      color,
      width,
      points: [point],
    }
    activeStrokeRef.current = stroke
    setActiveStroke(stroke)
  }

  const continueStroke = (event: PointerEvent<SVGSVGElement>) => {
    const point = pointFromEvent(event)
    if (!point) return
    setActiveStroke((current) => {
      if (!current) return current
      const last = current.points[current.points.length - 1]
      const distance = Math.hypot(point.x - last.x, point.y - last.y)
      if (distance < 3) return current
      const next = { ...current, points: [...current.points, point] }
      activeStrokeRef.current = next
      return next
    })
  }

  const finishStroke = () => {
    const current = activeStrokeRef.current
    if (current && current.points.length > 0) {
      setStrokes((existing) => [...existing, current])
    }
    activeStrokeRef.current = null
    setActiveStroke(null)
  }

  const changeBase = (value: string) => {
    const nextBase: FaceMapBase =
      value === 'template' ? { source: 'template', sourceMediaId: null } : { source: 'media', sourceMediaId: value }
    setBase(nextBase)
    setStrokes([])
    activeStrokeRef.current = null
    setActiveStroke(null)
  }

  const save = async () => {
    setError('')
    const metadata: FaceMapMetadata = {
      version: 1,
      source: base.source,
      sourceMediaId: base.source === 'media' ? base.sourceMediaId : null,
      strokes,
      updatedAt: new Date().toISOString(),
    }
    try {
      const blob = await renderFaceMapPng(metadata, baseImageUrl)
      await onSave(blob, metadata)
    } catch (e) {
      setError(e instanceof Error ? e.message : t.faceMapSaveFailed)
    }
  }

  return (
    <section className="rounded-[2rem] border border-orange-100 bg-orange-50/80 p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-lg font-semibold text-orange-950">{t.faceMapEditorTitle}</p>
          <p className="mt-1 text-sm leading-6 text-orange-900/75">{t.faceMapEditorHint}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm"
        >
          <XCircle className="h-4 w-4" aria-hidden />
          {t.cancel}
        </button>
      </div>

      {error && <p className="mt-3 rounded-2xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="overflow-hidden rounded-[1.5rem] border border-white bg-white shadow-sm">
          <svg
            ref={svgRef}
            viewBox="0 0 1000 1000"
            role="img"
            aria-label={t.faceMapEditorTitle}
            className="aspect-square w-full cursor-crosshair touch-none select-none"
            onPointerDown={startStroke}
            onPointerMove={continueStroke}
            onPointerUp={finishStroke}
            onPointerCancel={finishStroke}
          >
            {base.source === 'media' && baseImageUrl ? (
              <image href={baseImageUrl} x="0" y="0" width="1000" height="1000" preserveAspectRatio="xMidYMid slice" />
            ) : (
              <FaceTemplateSvg />
            )}
            {visibleStrokes.map((stroke) =>
              stroke.points.length === 1 ? (
                <circle
                  key={stroke.id}
                  cx={stroke.points[0].x}
                  cy={stroke.points[0].y}
                  r={Math.max(4, stroke.width / 2)}
                  fill={stroke.color}
                />
              ) : (
                <path
                  key={stroke.id}
                  d={strokePath(stroke.points)}
                  fill="none"
                  stroke={stroke.color}
                  strokeWidth={stroke.width}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )
            )}
          </svg>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-orange-950">{t.faceMapBaseImage}</span>
            <select
              value={base.source === 'template' ? 'template' : base.sourceMediaId ?? 'template'}
              onChange={(event) => changeBase(event.target.value)}
              className="w-full rounded-2xl border border-orange-100 bg-white px-3 py-3 text-sm text-slate-900"
            >
              <option value="template">{t.faceMapBaseTemplate}</option>
              {mediaOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div>
            <p className="mb-2 text-sm font-semibold text-orange-950">{t.faceMapInkColor}</p>
            <div className="grid grid-cols-5 gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={clsx(
                    'h-11 rounded-2xl ring-offset-2 ring-offset-orange-50',
                    color === c && 'ring-2 ring-slate-950'
                  )}
                  style={{ backgroundColor: c }}
                  aria-label={c}
                />
              ))}
            </div>
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-orange-950">{t.faceMapLineWidth}</span>
            <input
              type="range"
              min="3"
              max="18"
              value={width}
              onChange={(event) => setWidth(Number(event.target.value))}
              className="w-full accent-orange-600"
            />
          </label>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setStrokes((current) => current.slice(0, -1))}
              disabled={strokes.length === 0}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm disabled:opacity-50"
            >
              <Undo2 className="h-4 w-4" aria-hidden />
              {t.faceMapUndo}
            </button>
            <button
              type="button"
              onClick={() => setStrokes([])}
              disabled={strokes.length === 0}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-white px-3 text-sm font-semibold text-red-700 shadow-sm disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
              {t.faceMapClear}
            </button>
          </div>

          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-lg shadow-slate-950/15 disabled:opacity-60"
          >
            {saving ? <RotateCcw className="h-4 w-4 animate-spin" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}
            {saving ? t.savingEllipsis : t.faceMapSaveToPatient}
          </button>

          <p className="rounded-2xl bg-white/70 p-3 text-xs leading-5 text-orange-950/75">
            <Pencil className="mr-1 inline h-3.5 w-3.5" aria-hidden />
            {t.faceMapVersionHint}
          </p>
        </div>
      </div>
    </section>
  )
}
