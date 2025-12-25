'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import mapboxgl from 'mapbox-gl'
import { Grid3x3, Home, Loader2, Move3d, PlusSquare, RefreshCw, Save, Satellite, Trash2, Undo2 } from 'lucide-react'

type ZoneItem = { id: string; name: string; bayCount: number }

type BayItem = {
  id: string
  code: string | null
  lat: number | null
  lng: number | null
  geojson: any | null
  siteId: string | null
  zoneId: string | null
  siteName: string | null
  zoneName: string | null
}

function nextCode(existing: BayItem[]) {
  // Prefer A1..A999 if existing includes Axx, else B1.. style.
  const nums: number[] = []
  for (const b of existing) {
    const s = (b.code || '').trim()
    const m = /^A0*(\d+)$/.exec(s)
    if (m?.[1]) nums.push(Number(m[1]))
  }
  const n = nums.length ? Math.max(...nums) + 1 : existing.length + 1
  return `A${String(n).padStart(2, '0')}`
}

function rectPolygonFromBounds(a: mapboxgl.LngLatLike, b: mapboxgl.LngLatLike) {
  const p1 = mapboxgl.LngLat.convert(a)
  const p2 = mapboxgl.LngLat.convert(b)
  const minLng = Math.min(p1.lng, p2.lng)
  const maxLng = Math.max(p1.lng, p2.lng)
  const minLat = Math.min(p1.lat, p2.lat)
  const maxLat = Math.max(p1.lat, p2.lat)
  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [minLng, minLat],
          [maxLng, minLat],
          [maxLng, maxLat],
          [minLng, maxLat],
          [minLng, minLat],
        ],
      ],
    },
    properties: {},
  }
}

function rectPolygonAroundCenterMeters(center: mapboxgl.LngLat, widthM: number, heightM: number) {
  // Rough meters→degrees conversion (fine for small bay rectangles).
  const dLat = (heightM / 2) / 111_320
  const dLng = (widthM / 2) / (111_320 * Math.max(0.2, Math.cos((center.lat * Math.PI) / 180)))
  return rectPolygonFromBounds(
    { lng: center.lng - dLng, lat: center.lat - dLat },
    { lng: center.lng + dLng, lat: center.lat + dLat }
  )
}

type RectPx = { cx: number; cy: number; w: number; h: number; angle: number }

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.sqrt(dx * dx + dy * dy)
}

function rectFromPolygonPx(map: mapboxgl.Map, geojson: any): RectPx | null {
  const ring = geojson?.geometry?.coordinates?.[0]
  if (!Array.isArray(ring) || ring.length < 4) return null
  const pts = ring
    .slice(0, 4)
    .map((c: any) => (Array.isArray(c) && c.length >= 2 ? map.project({ lng: c[0], lat: c[1] }) : null))
    .filter(Boolean) as mapboxgl.Point[]
  if (pts.length < 4) return null
  const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length
  const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length
  const w = dist(pts[0], pts[1])
  const h = dist(pts[1], pts[2])
  const angle = Math.atan2(pts[1].y - pts[0].y, pts[1].x - pts[0].x)
  if (!Number.isFinite(w) || !Number.isFinite(h) || w < 2 || h < 2) return null
  return { cx, cy, w, h, angle }
}

function cornersFromRectPx(r: RectPx) {
  const c = Math.cos(r.angle)
  const s = Math.sin(r.angle)
  const hw = r.w / 2
  const hh = r.h / 2
  const local = [
    { x: -hw, y: -hh },
    { x: hw, y: -hh },
    { x: hw, y: hh },
    { x: -hw, y: hh },
  ]
  return local.map((p) => ({
    x: r.cx + p.x * c - p.y * s,
    y: r.cy + p.x * s + p.y * c,
  }))
}

function featureFromRect(map: mapboxgl.Map, r: RectPx, props?: any) {
  const corners = cornersFromRectPx(r)
  const coords = corners.map((p) => {
    const ll = map.unproject([p.x, p.y])
    return [ll.lng, ll.lat]
  })
  coords.push(coords[0])
  return { type: 'Feature', geometry: { type: 'Polygon', coordinates: [coords] }, properties: props || {} }
}

function snapAngleRad(angle: number, stepDeg: number) {
  const step = (stepDeg * Math.PI) / 180
  let a = Math.round(angle / step) * step
  // snap to multiples of 90° if close (3°)
  const ninety = Math.PI / 2
  const nearest = Math.round(a / ninety) * ninety
  const threshold = (3 * Math.PI) / 180
  if (Math.abs(a - nearest) <= threshold) a = nearest
  return a
}

export default function BaysPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ''
  const BUILD_TAG = 'bays-editor-2025-12-24e'

  const zoneId = searchParams.get('zoneId') || 'all'

  const [loading, setLoading] = useState(true)
  const [listLoading, setListLoading] = useState(false)
  const [items, setItems] = useState<BayItem[]>([])
  const [zones, setZones] = useState<ZoneItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [drawMode, setDrawMode] = useState(false)
  const [satellite, setSatellite] = useState(true)
  const satelliteRef = useRef(satellite)
  const ensureLayersRef = useRef<null | ((opts?: { force?: boolean }) => void)>(null)
  const styleSwitchSeqRef = useRef(0)
  const [draftGeojson, setDraftGeojson] = useState<any | null>(null)
  const [draftCode, setDraftCode] = useState<string>('')
  const [draftZoneId, setDraftZoneId] = useState<string>('all')
  // Keep the page focused on rectangle drawing; editing handles can be enabled explicitly if needed.
  const [editMode, setEditMode] = useState(false)
  const [snap, setSnap] = useState(true)
  const [editGeojson, setEditGeojson] = useState<any | null>(null)
  const [editCode, setEditCode] = useState<string>('')
  const [editZoneId, setEditZoneId] = useState<string>('all')
  const [saving, setSaving] = useState(false)
  const [readyStatus, setReadyStatus] = useState<string | null>(null)
  const [interactionStatus, setInteractionStatus] = useState<string | null>(null)

  useEffect(() => {
    satelliteRef.current = satellite
  }, [satellite])

  const pushInteraction = useCallback((msg: string) => {
    setInteractionStatus(msg)
  }, [])

  // --- Undo stack (geometry + selection) ---
  type UndoSnapshot = {
    selectedId: string | null
    editGeojson: any | null
    editCode: string
    editZoneId: string
    draftGeojson: any | null
    draftCode: string
    draftZoneId: string
    drawMode: boolean
    editMode: boolean
  }

  const undoRef = useRef<UndoSnapshot[]>([])
  const [canUndo, setCanUndo] = useState(false)
  const MAX_UNDO = 50

  const editCodeRef = useRef(editCode)
  const editZoneIdRef = useRef(editZoneId)
  const draftCodeRef = useRef(draftCode)
  const draftZoneIdRef = useRef(draftZoneId)
  useEffect(() => {
    editCodeRef.current = editCode
  }, [editCode])
  useEffect(() => {
    editZoneIdRef.current = editZoneId
  }, [editZoneId])
  useEffect(() => {
    draftCodeRef.current = draftCode
  }, [draftCode])
  useEffect(() => {
    draftZoneIdRef.current = draftZoneId
  }, [draftZoneId])

  const pushUndo = useCallback((reason: string) => {
    const snap: UndoSnapshot = {
      selectedId: selectedIdRef.current,
      editGeojson: editGeojsonRef.current,
      editCode: editCodeRef.current || '',
      editZoneId: editZoneIdRef.current || 'all',
      draftGeojson: draftGeojsonRef.current,
      draftCode: draftCodeRef.current || '',
      draftZoneId: draftZoneIdRef.current || 'all',
      drawMode: drawModeRef.current,
      editMode,
    }
    undoRef.current.unshift(snap)
    if (undoRef.current.length > MAX_UNDO) undoRef.current.length = MAX_UNDO
    setCanUndo(undoRef.current.length > 0)
    pushInteraction(`Undo saved (${reason})`)
  }, [editMode, pushInteraction])

  const undoOnce = useCallback(() => {
    const snap = undoRef.current.shift()
    setCanUndo(undoRef.current.length > 0)
    if (!snap) return
    setSelectedId(snap.selectedId)
    setEditGeojson(snap.editGeojson)
    setEditCode(snap.editCode)
    setEditZoneId(snap.editZoneId)
    setDraftGeojson(snap.draftGeojson)
    setDraftCode(snap.draftCode)
    setDraftZoneId(snap.draftZoneId)
    setDrawMode(snap.drawMode)
    drawModeRef.current = snap.drawMode
    setEditMode(snap.editMode)
    pushInteraction('Undo ✓')
  }, [pushInteraction])

  // React-driven gestures (bypass Mapbox event system; works reliably on trackpads)
  const gestureRef = useRef<{
    pointerId: number | null
    mode: 'idle' | 'draw' | 'drag'
    dragging: boolean
    startPt: { x: number; y: number } | null
    startLngLat: mapboxgl.LngLat | null
    target: null | { kind: 'bay' | 'draft'; id?: string; base: RectPx }
  }>({ pointerId: null, mode: 'idle', dragging: false, startPt: null, startLngLat: null, target: null })

  const mapPointFromClient = useCallback((clientX: number, clientY: number) => {
    const map = mapRef.current
    if (!map) return null
    const rect = map.getCanvas().getBoundingClientRect()
    return { x: clientX - rect.left, y: clientY - rect.top }
  }, [])

  const lngLatFromClient = useCallback((clientX: number, clientY: number) => {
    const map = mapRef.current
    const pt = mapPointFromClient(clientX, clientY)
    if (!map || !pt) return null
    return map.unproject([pt.x, pt.y])
  }, [mapPointFromClient])

  const pickFeatureAtClient = useCallback(
    (clientX: number, clientY: number, layers: string[]) => {
      const map = mapRef.current
      const pt = mapPointFromClient(clientX, clientY)
      if (!map || !pt) return null
      // During initial load or while switching styles, our custom layers may not exist yet.
      // Mapbox throws if you queryRenderedFeatures() with a non-existent layer id.
      const safeLayers = (layers || []).filter((id) => {
        try {
          return Boolean(map.getLayer(id))
        } catch {
          return false
        }
      })
      if (!safeLayers.length) return null
      try {
        const hits = (map.queryRenderedFeatures([pt.x, pt.y] as any, { layers: safeLayers }) as any[]) || []
        return hits[0] || null
      } catch {
        return null
      }
    },
    [mapPointFromClient]
  )

  const onMapPointerDown = useCallback(
    (e: any) => {
      const map = mapRef.current
      if (!map) return
      const clientX = e.clientX
      const clientY = e.clientY
      if (typeof e.pointerId === 'number') {
        try {
          e.currentTarget.setPointerCapture(e.pointerId)
        } catch {
          // ignore
        }
        gestureRef.current.pointerId = e.pointerId
      }

      const startPt = mapPointFromClient(clientX, clientY)
      if (!startPt) return

      // DRAW mode: click-drag anywhere to create a rectangle
      if (drawModeRef.current) {
        pushUndo('draw start')
        const ll = lngLatFromClient(clientX, clientY)
        if (!ll) return
        gestureRef.current = {
          pointerId: gestureRef.current.pointerId,
          mode: 'draw',
          dragging: true,
          startPt,
          startLngLat: ll,
          target: null,
        }
        pushInteraction('Drawing rectangle…')
        try {
          map.dragPan.disable()
        } catch {}
        return
      }

      // DRAFT exists: only interact with draft shape
      if (hasDraftRef.current) {
        const hit = pickFeatureAtClient(clientX, clientY, ['bays-draft-fill'])
        if (!hit) {
          pushInteraction('No draft hit (tap the green draft rectangle).')
          return
        }
        pushUndo('drag draft start')
        const gj = draftGeojsonRef.current
        const base = gj?.geometry ? rectFromPolygonPx(map, gj) : null
        if (!base) return
        gestureRef.current = {
          pointerId: gestureRef.current.pointerId,
          mode: 'drag',
          dragging: false,
          startPt,
          startLngLat: null,
          target: { kind: 'draft', base: { ...base } },
        }
        return
      }

      // Existing bays: hit-test bays-hit and select
      const hit = pickFeatureAtClient(clientX, clientY, ['bays-hit'])
      if (!hit?.properties?.id || !hit?.geometry) {
        pushInteraction('No bay hit.')
        return
      }
      const id = String(hit.properties.id)
      if (selectedIdRef.current !== id) pushUndo('select bay')
      const geom = { type: 'Feature', geometry: hit.geometry, properties: {} }
      setSelectedId(id)
      setEditGeojson(geom)
      editGeojsonRef.current = geom
      selectedIdRef.current = id
      pushInteraction(`Selected bay: ${id}`)

      const base = rectFromPolygonPx(map, geom)
      if (!base) return
      pushUndo('drag bay start')
      gestureRef.current = {
        pointerId: gestureRef.current.pointerId,
        mode: 'drag',
        dragging: false,
        startPt,
        startLngLat: null,
        target: { kind: 'bay', id, base: { ...base } },
      }
    },
    [lngLatFromClient, mapPointFromClient, pickFeatureAtClient, pushInteraction, pushUndo]
  )

  const onMapPointerMove = useCallback(
    (e: any) => {
      const map = mapRef.current
      if (!map) return
      const g = gestureRef.current
      if (typeof g.pointerId === 'number' && typeof e.pointerId === 'number' && e.pointerId !== g.pointerId) return

      const clientX = e.clientX
      const clientY = e.clientY
      const curPt = mapPointFromClient(clientX, clientY)
      if (!curPt || !g.startPt) return

      if (g.mode === 'draw' && g.startLngLat) {
        const ll = lngLatFromClient(clientX, clientY)
        if (!ll) return
        const rect = rectPolygonFromBounds(g.startLngLat, ll)
        setDraftGeojson(rect)
        return
      }

      if (g.mode === 'drag' && g.target) {
        const dx = curPt.x - g.startPt.x
        const dy = curPt.y - g.startPt.y
        if (!g.dragging) {
          if (Math.abs(dx) < 3 && Math.abs(dy) < 3) return
          g.dragging = true
          pushInteraction(g.target.kind === 'draft' ? 'Moving draft…' : 'Moving bay…')
          try {
            map.dragPan.disable()
          } catch {}
        }
        applyRectToUI(map, { ...g.target.base, cx: g.target.base.cx + dx, cy: g.target.base.cy + dy })
      }
    },
    [lngLatFromClient, mapPointFromClient, pushInteraction]
  )

  const onMapPointerUp = useCallback(
    (e: any) => {
      const map = mapRef.current
      if (!map) return
      const g = gestureRef.current
      if (typeof g.pointerId === 'number' && typeof e.pointerId === 'number' && e.pointerId !== g.pointerId) return

      if (g.mode === 'draw') {
        setDraftCode((prev) => prev || nextCode(itemsRef.current))
        setDraftZoneId(zoneIdRef.current || 'all')
        pushInteraction('Rectangle ready. Set code/zone and click Save Draft.')
      } else if (g.mode === 'drag' && g.target && g.dragging) {
        pushInteraction(g.target.kind === 'draft' ? 'Draft moved ✓' : 'Bay moved ✓')
      }

      gestureRef.current = { pointerId: null, mode: 'idle', dragging: false, startPt: null, startLngLat: null, target: null }
      try {
        map.dragPan.enable()
      } catch {}
    },
    [pushInteraction]
  )

  // Keyboard shortcut: Cmd/Ctrl+Z
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isZ = e.key === 'z' || e.key === 'Z'
      if (!isZ) return
      if (!(e.metaKey || e.ctrlKey)) return
      e.preventDefault()
      undoOnce()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [undoOnce])

  const selected = useMemo(() => items.find((b) => b.id === selectedId) || null, [items, selectedId])
  const hasDraft = !!draftGeojson?.geometry

  const mapElRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const bootedRef = useRef(false)

  // Refs to avoid stale closures in map event handlers (map is created once).
  const drawModeRef = useRef(false)
  const zoneIdRef = useRef('all')
  const itemsRef = useRef<BayItem[]>([])
  const selectedIdRef = useRef<string | null>(null)
  const editGeojsonRef = useRef<any | null>(null)
  const hasDraftRef = useRef(false)
  const draftGeojsonRef = useRef<any | null>(null)

  useEffect(() => {
    drawModeRef.current = drawMode
  }, [drawMode])
  useEffect(() => {
    zoneIdRef.current = zoneId || 'all'
  }, [zoneId])
  useEffect(() => {
    itemsRef.current = items
  }, [items])
  useEffect(() => {
    selectedIdRef.current = selectedId
  }, [selectedId])
  useEffect(() => {
    editGeojsonRef.current = editGeojson
  }, [editGeojson])
  useEffect(() => {
    hasDraftRef.current = hasDraft
    draftGeojsonRef.current = draftGeojson
  }, [hasDraft, draftGeojson])

  const baysFc = useMemo(() => {
    const features = items
      .map((b) => {
        const gj = b.geojson?.geometry ? b.geojson : null
        if (!gj?.geometry) return null
        return {
          type: 'Feature',
          geometry: gj.geometry,
          properties: {
            id: b.id,
            code: b.code || '',
            selected: selectedId === b.id ? 1 : 0,
          },
        }
      })
      .filter(Boolean) as any[]
    return { type: 'FeatureCollection', features }
  }, [items, selectedId])

  const baysFcRef = useRef<any>(null)
  useEffect(() => {
    baysFcRef.current = baysFc
  }, [baysFc])

  const editFc = useMemo(() => {
    if (!editGeojson?.geometry) return { type: 'FeatureCollection', features: [] }
    return { type: 'FeatureCollection', features: [{ ...editGeojson, properties: { code: editCode || selected?.code || '' } }] }
  }, [editGeojson, editCode, selected?.code])

  const editFcRef = useRef<any>(null)
  useEffect(() => {
    editFcRef.current = editFc
  }, [editFc])

  const draftFc = useMemo(() => {
    if (!draftGeojson?.geometry) return { type: 'FeatureCollection', features: [] }
    return { type: 'FeatureCollection', features: [{ ...draftGeojson, properties: { code: draftCode || 'NEW' } }] }
  }, [draftGeojson, draftCode])

  const draftFcRef = useRef<any>(null)
  useEffect(() => {
    draftFcRef.current = draftFc
  }, [draftFc])

  const load = useCallback(
    async (boot = false) => {
      if (boot) setLoading(true)
      else setListLoading(true)
      try {
        const me = await fetch('/api/auth/me', { credentials: 'include' })
        if (!me.ok) {
          router.push('/login')
          return
        }
        const meJson = await me.json().catch(() => ({}))
        const role = String(meJson?.user?.role || '')
        if (!['MASTER_ADMIN', 'CUSTOMER_ADMIN', 'ADMIN'].includes(role)) {
          setInteractionStatus('Forbidden: only admins can manage parking bays.')
          router.push('/portal')
          return
        }

        const zRes = await fetch('/api/portal/zones', { credentials: 'include' })
        const zJson = await zRes.json().catch(() => ({}))
        if (zJson?.success) {
          const raw = (zJson.items || zJson.zones || []) as any[]
          setZones(
            raw.map((z) => ({
              id: String(z.id),
              name: String(z.name || 'Unnamed Zone'),
              bayCount: typeof z.bayCount === 'number' ? z.bayCount : Number(z.bayCount || 0),
            }))
          )
        }

        const qs = new URLSearchParams()
        qs.set('zoneId', zoneId || 'all')
        const res = await fetch(`/api/portal/admin/bays?${qs.toString()}`, { credentials: 'include' })
        const json = await res.json().catch(() => ({}))
        if (json?.success) {
          setItems(json.items || [])
          if (!selectedId && json.items?.[0]?.id) setSelectedId(json.items[0].id)
        } else {
          setInteractionStatus(`Refresh failed: ${json?.error || 'UNKNOWN'}`)
        }
      } finally {
        if (boot) setLoading(false)
        else setListLoading(false)
      }
    },
    [router, zoneId, selectedId]
  )

  useEffect(() => {
    // Boot: allow a full-screen loading state only once. Subsequent zone switches
    // should keep the map mounted and just refresh data.
    if (!bootedRef.current) {
      bootedRef.current = true
      load(true)
    } else {
      load(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoneId])

  // Keep edit form in sync with selection
  useEffect(() => {
    if (!selected) {
      setEditGeojson(null)
      setEditCode('')
      setEditZoneId('all')
      return
    }
    // While a draft is active, don't overwrite the edit state from selection.
    if (hasDraft) return
    setEditGeojson(selected.geojson || null)
    setEditCode(selected.code || '')
    setEditZoneId(selected.zoneId || 'all')
  }, [selectedId, selected?.geojson, selected?.code, selected?.zoneId, hasDraft])

  const createRectangle = useCallback(() => {
    const map = mapRef.current
    if (!map) {
      setInteractionStatus('Map not ready yet. Try again in 1–2 seconds.')
      return
    }

    pushUndo('create rectangle')
    const center = map.getCenter()
    const rect = rectPolygonAroundCenterMeters(center, 2.8, 5.6) // ~standard bay size
    setDraftGeojson(rect)
    setDraftCode((prev) => prev || nextCode(itemsRef.current))
    setDraftZoneId(zoneIdRef.current || 'all')
    setDrawMode(false)
    drawModeRef.current = false
    setEditMode(true)
    setSelectedId(null)
    setEditGeojson(null) // avoid showing selected overlay while drafting
    setInteractionStatus('Rectangle created. Drag to move, use Edit Handles to resize/rotate, then Save Draft.')
  }, [pushUndo])

  const cancelDraft = useCallback(() => {
    pushUndo('cancel draft')
    setDraftGeojson(null)
    setDraftCode('')
    setDraftZoneId(zoneIdRef.current || 'all')
    setInteractionStatus('Draft cleared.')
  }, [pushUndo])

  useEffect(() => {
    // The map container isn't rendered while `loading` is true (see early return below),
    // so we must wait until loading completes before trying to construct Mapbox.
    if (loading) return
    if (!token) {
      setInteractionStatus('Mapbox token missing: set NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN and restart the dev server.')
      return
    }
    if (!mapElRef.current) return
    if (mapRef.current) return
    ;(mapboxgl as any).accessToken = token
    let map: mapboxgl.Map
    try {
      map = new mapboxgl.Map({
        container: mapElRef.current,
        style: 'mapbox://styles/mapbox/satellite-v9',
        center: [55.1622, 25.1016],
        zoom: 17.5,
      })
    } catch (e: any) {
      setInteractionStatus(`Map init failed: ${String(e?.message || e || 'unknown error')}`)
      return
    }
    mapRef.current = map
    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right')

    // Keep Mapbox DOM pointer-interactive.
    try {
      const containerEl = map.getContainer()
      const canvasContainerEl = map.getCanvasContainer()
      const canvasEl = map.getCanvas()
      ;(containerEl as any).style.pointerEvents = 'auto'
      ;(canvasContainerEl as any).style.pointerEvents = 'auto'
      ;(canvasEl as any).style.pointerEvents = 'auto'
      ;(canvasEl as any).style.touchAction = 'none'
    } catch {
      // ignore
    }

    // After map.setStyle(), style.load can fire while Mapbox is still not fully "queryable".
    // Use a bounded retry loop instead of relying on idle (which isn't guaranteed to fire promptly).
    let ensureTries = 0
    const ensureLayers = (opts?: { force?: boolean }) => {
      try {
        if (!map.isStyleLoaded()) {
          if (ensureTries++ < 200) setTimeout(() => ensureLayers(opts), 50)
          return
        }
        ensureTries = 0

        // IMPORTANT: style swaps remove sources/layers; always re-add using the latest FCs from refs.
        // Do NOT read from React closures here; this function must stay stable across renders.
        const baysData = baysFcRef.current || { type: 'FeatureCollection', features: [] }
        const draftData = draftFcRef.current || { type: 'FeatureCollection', features: [] }
        const editData = editFcRef.current || { type: 'FeatureCollection', features: [] }

        const force = Boolean(opts?.force)
        if (force) {
          // Mapbox setStyle() wipes sources/layers. Also, depending on timing, getSource/getLayer may
          // transiently return stale objects. The most robust approach is: remove known layers/sources,
          // then re-add everything from scratch.
          const safeRemoveLayer = (id: string) => {
            try {
              if (map.getLayer(id)) map.removeLayer(id)
            } catch {
              // ignore
            }
          }
          const safeRemoveSource = (id: string) => {
            try {
              if (map.getSource(id)) map.removeSource(id)
            } catch {
              // ignore
            }
          }

          // Remove layers first (sources cannot be removed while referenced).
          for (const lid of [
            'bays-labels',
            'bays-selected-outline',
            'bays-hit',
            'bays-outline',
            'bays-fill',
            'bays-draft-outline',
            'bays-draft-fill',
            'bays-edit-outline',
            'bays-edit-fill',
          ]) {
            safeRemoveLayer(lid)
          }

          // Then remove sources.
          for (const sid of ['bays', 'bays-draft', 'bays-edit']) safeRemoveSource(sid)
        }

        // Mapbox styles may be "classic" (no imports) or "imported/standard" (has imports).
        // Imported styles require custom layers to use a slot; classic styles may reject unknown keys.
        const styleAny = map.getStyle() as any
        const hasImports = Boolean(styleAny?.imports?.length)
        const LAYER_SLOT: any = hasImports ? { slot: 'top' } : {}

        // Make bays clearly visible on both light (streets) and dark (satellite) base maps.
        const isSatellite = satelliteRef.current
        const baysLineColor = isSatellite ? '#ffffff' : '#1d4ed8' // bright blue on streets
        const baysFillColor = isSatellite ? '#ffffff' : '#60a5fa' // light blue fill on streets
        const baysFillOpacity = isSatellite ? 0.12 : 0.35
        const labelTextColor = isSatellite ? '#ffffff' : '#111827'
        const labelHaloColor = isSatellite ? '#000000' : '#ffffff'
        const labelHaloWidth = isSatellite ? 1.5 : 2.0
        const baysLineWidth = isSatellite ? 2 : 3

        // IMPORTANT: Never remove a source while layers reference it. Mapbox will throw and abort.
        // On style switch, sources/layers are already gone — so we just add. Otherwise we setData.
        if (!map.getSource('bays')) map.addSource('bays', { type: 'geojson', data: baysData as any })
        else (map.getSource('bays') as any).setData(baysData as any)

        if (!map.getLayer('bays-fill')) {
          map.addLayer(
            {
              ...LAYER_SLOT,
              id: 'bays-fill',
              type: 'fill',
              source: 'bays',
              paint: {
                'fill-color': baysFillColor,
                'fill-opacity': baysFillOpacity,
              },
            } as any
          )
        }
        if (!map.getLayer('bays-outline')) {
          map.addLayer(
            {
              ...LAYER_SLOT,
              id: 'bays-outline',
              type: 'line',
              source: 'bays',
              paint: {
                'line-color': baysLineColor,
                'line-width': baysLineWidth,
                'line-opacity': 0.9,
              },
            } as any
          )
        }
        // Invisible hit layer: makes dragging reliable even if you start on labels/outlines.
        if (!map.getLayer('bays-hit')) {
          map.addLayer(
            {
              ...LAYER_SLOT,
              id: 'bays-hit',
              type: 'fill',
              source: 'bays',
              // NOTE: Some Mapbox GL builds may not return fully-transparent layers from queryRenderedFeatures.
              // Keep this visually invisible but still "queryable".
              paint: { 'fill-color': '#000000', 'fill-opacity': 0.01 },
            } as any
          )
        }
        if (!map.getLayer('bays-selected-outline')) {
          map.addLayer(
            {
              ...LAYER_SLOT,
              id: 'bays-selected-outline',
              type: 'line',
              source: 'bays',
              filter: ['==', ['get', 'selected'], 1],
              paint: { 'line-color': '#22c55e', 'line-width': 4, 'line-opacity': 1.0 },
            } as any
          )
        } else {
          map.setFilter('bays-selected-outline', ['==', ['get', 'selected'], 1])
        }
        if (!map.getLayer('bays-labels')) {
          map.addLayer(
            {
              ...LAYER_SLOT,
              id: 'bays-labels',
              type: 'symbol',
              source: 'bays',
              layout: {
                'text-field': ['get', 'code'],
                'text-size': 11,
                'text-allow-overlap': true,
              },
              paint: { 'text-color': labelTextColor, 'text-halo-color': labelHaloColor, 'text-halo-width': labelHaloWidth },
            } as any
          )
        }

        if (!map.getSource('bays-draft')) map.addSource('bays-draft', { type: 'geojson', data: draftData as any })
        else (map.getSource('bays-draft') as any).setData(draftData as any)

        if (!map.getLayer('bays-draft-fill')) {
          map.addLayer(
            {
              ...LAYER_SLOT,
              id: 'bays-draft-fill',
              type: 'fill',
              source: 'bays-draft',
              paint: { 'fill-color': '#22c55e', 'fill-opacity': 0.18 },
            } as any
          )
        }
        if (!map.getLayer('bays-draft-outline')) {
          map.addLayer(
            {
              ...LAYER_SLOT,
              id: 'bays-draft-outline',
              type: 'line',
              source: 'bays-draft',
              paint: { 'line-color': '#22c55e', 'line-width': 3, 'line-opacity': 1.0 },
            } as any
          )
        }

        if (!map.getSource('bays-edit')) map.addSource('bays-edit', { type: 'geojson', data: editData as any })
        else (map.getSource('bays-edit') as any).setData(editData as any)

        if (!map.getLayer('bays-edit-fill')) {
          map.addLayer(
            {
              ...LAYER_SLOT,
              id: 'bays-edit-fill',
              type: 'fill',
              source: 'bays-edit',
              paint: { 'fill-color': '#22c55e', 'fill-opacity': 0.10 },
            } as any
          )
        }
        if (!map.getLayer('bays-edit-outline')) {
          map.addLayer(
            {
              ...LAYER_SLOT,
              id: 'bays-edit-outline',
              type: 'line',
              source: 'bays-edit',
              paint: { 'line-color': '#22c55e', 'line-width': 4, 'line-opacity': 1.0 },
            } as any
          )
        }

        // Ready breadcrumb should not overwrite interaction/debug messages.
        const n = Array.isArray(baysData?.features) ? baysData.features.length : 0
        setReadyStatus(`Map layers ready ✓ bays=${n}`)

      } catch (e: any) {
        // Surface to user once; avoid noisy logs.
        setInteractionStatus(`Map overlay init failed: ${String(e?.message || e || 'unknown')}`)
      }
    }

    const onStyleLoad = () => {
      // style.load can fire before Mapbox is fully ready; a short delay makes this reliable.
      setTimeout(() => ensureLayers({ force: true }), 100)
    }
    map.on('style.load', onStyleLoad)
    map.once('load', () => ensureLayers({ force: true }))
    ensureLayersRef.current = ensureLayers

    const onMapError = (e: any) => {
      try {
        const msg = String(e?.error?.message || e?.error || 'unknown error')
        const status = typeof e?.error?.status === 'number' ? ` status=${e.error.status}` : ''
        const url = e?.error?.url ? ` url=${String(e.error.url)}` : ''
        setInteractionStatus(`Map error:${status} ${msg}${url}`)
      } catch {
        setInteractionStatus('Map error (unparseable)')
      }
    }
    map.on('error', onMapError)

    return () => {
      map.off('style.load', onStyleLoad)
      map.off('error', onMapError)
      if (ensureLayersRef.current === ensureLayers) ensureLayersRef.current = null
    }
  }, [token, loading])

  // Toggle base map style (Normal vs Satellite)
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const targetStyle = satellite ? 'mapbox://styles/mapbox/satellite-v9' : 'mapbox://styles/mapbox/streets-v12'
    try {
      styleSwitchSeqRef.current += 1
      const seq = styleSwitchSeqRef.current
      setInteractionStatus(`Switching map style → ${satellite ? 'Satellite' : 'Normal'}…`)
      ;(map as any).setStyle(targetStyle, { diff: false })
      // Belt-and-suspenders: even if style.load timing is odd, force re-add our custom layers.
      // Multiple attempts help when Mapbox is still finalizing the new style.
      setTimeout(() => ensureLayersRef.current?.({ force: true }), 120)
      setTimeout(() => ensureLayersRef.current?.({ force: true }), 400)
      setTimeout(() => ensureLayersRef.current?.({ force: true }), 1200)

      // Watchdog: for a few seconds after switching styles, keep ensuring the custom bay layers exist.
      // This covers cases where style finishes loading *after* our scheduled calls, or style.load is flaky.
      const start = Date.now()
      const timer = setInterval(() => {
        if (styleSwitchSeqRef.current !== seq) {
          clearInterval(timer)
          return
        }
        if (Date.now() - start > 6000) {
          clearInterval(timer)
          return
        }
        try {
          const styleLoaded = map.isStyleLoaded()
          const hasFill = Boolean(map.getLayer('bays-fill'))
          if (styleLoaded && !hasFill) ensureLayersRef.current?.({ force: true })
        } catch {
          // ignore
        }
      }, 200)
      return () => clearInterval(timer)
    } catch (err) {
      console.error('Style change error:', err)
      setInteractionStatus(`Style change error: ${String((err as any)?.message || err)}`)
    }
  }, [satellite])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    
    // Wait a tick to ensure layers are ready after style changes
    const updateData = () => {
      try {
        const s1 = map.getSource('bays') as any
        if (s1 && s1.setData) s1.setData(baysFc as any)
        
        const s2 = map.getSource('bays-draft') as any
        if (s2 && s2.setData) s2.setData(draftFc as any)
        
        const s3 = map.getSource('bays-edit') as any
        if (s3 && s3.setData) s3.setData(editFc as any)
        
        if (map.getLayer('bays-selected-outline')) {
          map.setFilter('bays-selected-outline', ['==', ['get', 'selected'], 1])
        }
      } catch (err) {
        console.error('Error updating map data:', err)
      }
    }
    
    // Immediate update
    updateData()
    
    // Also update after a short delay to handle style transitions
    const timer = setTimeout(updateData, 50)
    return () => clearTimeout(timer)
  }, [baysFc, draftFc, editFc])

  // --- Proper edit handles (corners + rotate) for selected bay ---
  const editMarkersRef = useRef<{ corners: mapboxgl.Marker[]; rotate: mapboxgl.Marker | null }>({ corners: [], rotate: null })
  const editRectRef = useRef<RectPx | null>(null)

  const clearEditMarkers = useCallback(() => {
    for (const m of editMarkersRef.current.corners) m.remove()
    editMarkersRef.current.corners = []
    editMarkersRef.current.rotate?.remove()
    editMarkersRef.current.rotate = null
    editRectRef.current = null
  }, [])

  const applyRectToUI = useCallback(
    (map: mapboxgl.Map, r: RectPx) => {
      editRectRef.current = r
      const feature = featureFromRect(map, r, {})
      if (hasDraftRef.current) setDraftGeojson(feature)
      else setEditGeojson(feature)

      // Move markers to corners + rotate handle
      const cornersPx = cornersFromRectPx(r)
      const cornersLL = cornersPx.map((p) => map.unproject([p.x, p.y]))
      const cLL = map.unproject([r.cx, r.cy])
      const rotateOffset = 30
      const c = Math.cos(r.angle)
      const s = Math.sin(r.angle)
      const hx = 0
      const hy = -(r.h / 2 + rotateOffset)
      const rx = r.cx + hx * c - hy * s
      const ry = r.cy + hx * s + hy * c
      const rLL = map.unproject([rx, ry])

      const setMarker = (m: mapboxgl.Marker, ll: mapboxgl.LngLat) => m.setLngLat([ll.lng, ll.lat])
      editMarkersRef.current.corners.forEach((m, i) => setMarker(m, cornersLL[i]))
      if (editMarkersRef.current.rotate) setMarker(editMarkersRef.current.rotate, rLL)

      // Do not touch map dragPan here; gesture handlers manage pan/drag behavior.
    },
    []
  )

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    clearEditMarkers()
    if (!editMode) return
    const sourceGeo = hasDraftRef.current ? draftGeojsonRef.current : selected?.geojson
    if (!sourceGeo?.geometry) return

    const base = rectFromPolygonPx(map, sourceGeo)
    if (!base) return
    editRectRef.current = base

    const makeHandleEl = (kind: 'corner' | 'rotate') => {
      const el = document.createElement('div')
      el.style.width = kind === 'corner' ? '10px' : '12px'
      el.style.height = kind === 'corner' ? '10px' : '12px'
      el.style.borderRadius = '999px'
      el.style.background = kind === 'corner' ? '#22c55e' : '#2563eb'
      el.style.border = '2px solid #ffffff'
      el.style.boxShadow = '0 1px 6px rgba(0,0,0,0.25)'
      return el
    }

    // Create corner markers (draggable)
    const cornersPx = cornersFromRectPx(base)
    const cornersLL = cornersPx.map((p) => map.unproject([p.x, p.y]))
    const cornersMarkers = cornersLL.map((ll, idx) => {
      const m = new mapboxgl.Marker({ element: makeHandleEl('corner'), draggable: true })
        .setLngLat([ll.lng, ll.lat])
        .addTo(map)
      m.on('drag', () => {
        const r = editRectRef.current
        if (!r) return
        const oppIdx = (idx + 2) % 4
        const dragged = map.project(m.getLngLat())
        const oppPx = cornersFromRectPx(r)[oppIdx]
        const newCx = (dragged.x + oppPx.x) / 2
        const newCy = (dragged.y + oppPx.y) / 2

        // rotate points into local space around new center
        const c = Math.cos(-r.angle)
        const s = Math.sin(-r.angle)
        const toLocal = (p: { x: number; y: number }) => {
          const dx = p.x - newCx
          const dy = p.y - newCy
          return { x: dx * c - dy * s, y: dx * s + dy * c }
        }
        const a = toLocal({ x: dragged.x, y: dragged.y })
        const b = toLocal({ x: oppPx.x, y: oppPx.y })
        const w = Math.max(6, Math.abs(a.x - b.x))
        const h = Math.max(6, Math.abs(a.y - b.y))
        applyRectToUI(map, { cx: newCx, cy: newCy, w, h, angle: r.angle })
      })
      return m
    })

    // Rotate handle marker
    // IMPORTANT: Marker must have an initial lng/lat before addTo(), otherwise Mapbox crashes (lng undefined).
    const centerLL = map.unproject([base.cx, base.cy])
    const rotateMarker = new mapboxgl.Marker({ element: makeHandleEl('rotate'), draggable: true })
      .setLngLat([centerLL.lng, centerLL.lat])
      .addTo(map)
    rotateMarker.on('drag', () => {
      const r = editRectRef.current
      if (!r) return
      const hp = map.project(rotateMarker.getLngLat())
      const vx = hp.x - r.cx
      const vy = hp.y - r.cy
      let a = Math.atan2(vy, vx) + Math.PI / 2
      if (snap) a = snapAngleRad(a, 5)
      applyRectToUI(map, { ...r, angle: a })
    })

    editMarkersRef.current.corners = cornersMarkers
    editMarkersRef.current.rotate = rotateMarker

    // Initial position update (including rotate handle)
    applyRectToUI(map, base)

    return () => {
      clearEditMarkers()
    }
  }, [selectedId, editMode, snap, clearEditMarkers, applyRectToUI, selected?.geojson, hasDraft])

  const saveSelected = useCallback(async () => {
    if (!selectedId) return
    if (!editGeojson?.geometry) {
      setInteractionStatus('No edited geometry to save.')
      return
    }
    setSaving(true)
    setInteractionStatus(null)
    try {
      const zoneToUse = editZoneId && editZoneId !== 'all' ? editZoneId : null
      const res = await fetch('/api/portal/admin/bays', {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'update', id: selectedId, code: editCode.trim() || null, zoneId: zoneToUse, geojson: editGeojson }),
      })
      const json = await res.json().catch(() => ({}))
      if (!json?.success) {
        setInteractionStatus(`Save failed: ${json?.error || 'UNKNOWN'}`)
        return
      }
      setInteractionStatus('Saved selected bay ✓')
      await load(false)
    } finally {
      setSaving(false)
    }
  }, [selectedId, editGeojson, editCode, editZoneId, load])

  const saveDraft = useCallback(async () => {
    if (!draftGeojson?.geometry) {
      setInteractionStatus('Draw a rectangle first.')
      return
    }
    const siteId = items?.[0]?.siteId || null
    if (!siteId) {
      setInteractionStatus('No siteId found for this tenant (seed a site first).')
      return
    }
    const code = draftCode.trim()
    if (!code) {
      setInteractionStatus('Code is required.')
      return
    }
    const zoneToUse = draftZoneId && draftZoneId !== 'all' ? draftZoneId : null
    setSaving(true)
    setInteractionStatus(null)
    try {
      const res = await fetch('/api/portal/admin/bays', {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'create', code, siteId, zoneId: zoneToUse, geojson: draftGeojson }),
      })
      const json = await res.json().catch(() => ({}))
      if (!json?.success) {
        setInteractionStatus(`Save failed: ${json?.error || 'UNKNOWN'}`)
        return
      }
      setInteractionStatus('Saved ✓')
      setDraftGeojson(null)
      await load(false)
    } finally {
      setSaving(false)
    }
  }, [draftGeojson, draftCode, draftZoneId, items, load])

  const deleteSelected = useCallback(async () => {
    if (!selectedId) return
    setSaving(true)
    setInteractionStatus(null)
    try {
      const res = await fetch('/api/portal/admin/bays', {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id: selectedId }),
      })
      const json = await res.json().catch(() => ({}))
      if (!json?.success) {
        setInteractionStatus(`Delete failed: ${json?.error || 'UNKNOWN'}`)
        return
      }
      setInteractionStatus('Deleted ✓')
      setSelectedId(null)
      await load(false)
    } finally {
      setSaving(false)
    }
  }, [selectedId, load])

  if (!token) {
    return (
      <div className="rounded-xl border-2 border-yellow-200 bg-yellow-50 p-6 shadow-lg">
        <p className="text-sm text-yellow-900">
          Set <code className="font-mono font-semibold">NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</code> to use Parking Bays.
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-[1920px] mx-auto flex items-center justify-center min-h-[600px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
            <p className="text-gray-700 font-medium">Loading parking bays…</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1920px] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 inline-flex items-center gap-3">
              <Grid3x3 className="h-9 w-9 text-emerald-700" />
              Parking Bays
            </h1>
            <p className="text-base sm:text-lg text-gray-600">
              Admin drawing tool: click-drag to create rectangular bays, then Save to DB. <span className="text-xs text-gray-400">({BUILD_TAG})</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={zoneId}
              onChange={(e) => router.replace(`/portal/bays?zoneId=${encodeURIComponent(e.target.value)}`)}
              className="px-3 py-3 rounded-lg border-2 border-gray-200 bg-white text-sm font-medium"
            >
              <option value="all">All zones</option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name} ({z.bayCount})
                </option>
              ))}
            </select>

            <button
              onClick={() =>
                setDrawMode((v) => {
                  const next = !v
                  // Keep ref in sync immediately so the very next mouse-down uses the new mode.
                  drawModeRef.current = next
                  if (next) setInteractionStatus('Draw mode ON: click-drag anywhere on the map to create a new rectangle.')
                  return next
                })
              }
              className={`inline-flex items-center px-4 py-3 text-sm font-medium rounded-lg border-2 transition-colors ${
                drawMode ? 'bg-emerald-600 border-emerald-700 text-white' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              title="Rectangle draw mode"
            >
              <PlusSquare className="h-5 w-5 mr-2" />
              {drawMode ? 'Drawing ON' : 'Draw Rectangle'}
            </button>
            <button
              onClick={undoOnce}
              disabled={!canUndo}
              className="inline-flex items-center px-4 py-3 text-sm font-medium rounded-lg border-2 transition-colors bg-white border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              title="Undo (Cmd/Ctrl+Z)"
            >
              <Undo2 className="h-5 w-5 mr-2" />
              Undo
            </button>
            <button
              onClick={createRectangle}
              className="inline-flex items-center px-4 py-3 text-sm font-medium rounded-lg border-2 transition-colors bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              title="Create a new bay rectangle at map center"
            >
              <PlusSquare className="h-5 w-5 mr-2" />
              Rectangle
            </button>
            {hasDraft ? (
              <button
                onClick={cancelDraft}
                className="inline-flex items-center px-4 py-3 text-sm font-medium rounded-lg border-2 transition-colors bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                title="Discard the current draft"
              >
                <Trash2 className="h-5 w-5 mr-2" />
                Cancel Draft
              </button>
            ) : null}
            <button
              onClick={() => {
                satelliteRef.current = false
                setSatellite(false)
              }}
              className={`inline-flex items-center px-4 py-3 text-sm font-medium rounded-lg border-2 transition-colors ${
                !satellite ? 'bg-gray-900 border-gray-900 text-white' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              title="Normal map view"
            >
              <Home className="h-5 w-5 mr-2" />
              Normal
            </button>
            <button
              onClick={() => {
                satelliteRef.current = true
                setSatellite(true)
              }}
              className={`inline-flex items-center px-4 py-3 text-sm font-medium rounded-lg border-2 transition-colors ${
                satellite ? 'bg-gray-900 border-gray-900 text-white' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              title="Satellite view"
            >
              <Satellite className="h-5 w-5 mr-2" />
              Satellite
            </button>
            <button
              onClick={() => setEditMode((v) => !v)}
              className={`inline-flex items-center px-4 py-3 text-sm font-medium rounded-lg border-2 transition-colors ${
                editMode ? 'bg-blue-600 border-blue-700 text-white' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              title="Edit selected bay (handles + rotate)"
            >
              <Move3d className="h-5 w-5 mr-2" />
              {editMode ? 'Edit ON' : 'Edit Handles'}
            </button>
            <label className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg border-2 border-gray-200 bg-white text-gray-700 cursor-pointer">
              <input type="checkbox" checked={snap} onChange={(e) => setSnap(e.target.checked)} className="w-4 h-4" />
              Snap
            </label>
            <button
              onClick={() => load(false)}
              disabled={listLoading}
              className="inline-flex items-center px-4 py-3 text-sm font-medium rounded-lg bg-gray-900 text-white hover:bg-black disabled:opacity-50"
            >
              <RefreshCw className={`h-5 w-5 mr-2 ${listLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Bays Map ({satellite ? 'Satellite' : 'Normal'})</h2>
              <div className="flex items-center gap-2">
                {draftGeojson?.geometry ? (
                  <button
                    onClick={saveDraft}
                    disabled={saving}
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 text-sm font-medium"
                    title="Save the drawn rectangle"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Draft
                  </button>
                ) : null}
                {editMode && selectedId && editGeojson?.geometry ? (
                  <button
                    onClick={saveSelected}
                    disabled={saving}
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
                    title="Save edited selected bay"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Selected
                  </button>
                ) : null}
                <div className="text-sm text-gray-600">{items.length} bays</div>
              </div>
            </div>
            <div
              className="h-[650px] lg:h-[900px] rounded-lg overflow-hidden border border-gray-200"
              style={{ pointerEvents: 'auto' }}
              onPointerDown={onMapPointerDown}
              onPointerMove={onMapPointerMove}
              onPointerUp={onMapPointerUp}
              onPointerCancel={onMapPointerUp}
            >
              <div ref={mapElRef} className="w-full h-full" style={{ pointerEvents: 'auto' }} />
            </div>
            {readyStatus ? <div className="mt-3 text-sm text-gray-700">{readyStatus}</div> : null}
            {interactionStatus ? <div className="mt-2 text-sm text-gray-700">{interactionStatus}</div> : null}
          </div>

          <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6 flex flex-col">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Editor</h2>

            <div className="space-y-3">
              <div className="text-sm font-medium text-gray-700">Draft (new rectangle)</div>
              <label className="block text-xs text-gray-600">Code</label>
              <input
                value={draftCode}
                onChange={(e) => setDraftCode(e.target.value)}
                placeholder="A01"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
              />
              <label className="block text-xs text-gray-600">Zone</label>
              <select
                value={draftZoneId}
                onChange={(e) => setDraftZoneId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm bg-white"
              >
                <option value="all">All / Unassigned</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </select>
              <button
                onClick={saveDraft}
                disabled={saving || !draftGeojson?.geometry}
                className="inline-flex items-center justify-center px-4 py-3 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                <Save className="h-5 w-5 mr-2" />
                Save Draft
              </button>
            </div>

            <div className="mt-6 border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-700">Selected</div>
                <button
                  onClick={deleteSelected}
                  disabled={!selectedId || saving}
                  className="inline-flex items-center px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </button>
              </div>
              <div className="mt-2 text-sm text-gray-700">{selected ? `${selected.code || selected.id}` : 'None'}</div>
              {selected ? (
                <div className="mt-1 text-xs text-gray-500">
                  {selected.siteName || '—'} · {selected.zoneName || '—'}
                </div>
              ) : null}

              {selected ? (
                <div className="mt-4 space-y-2">
                  <div className="text-xs text-gray-600">
                    <span className="font-semibold">Tip:</span> Turn on <b>Edit Handles</b>, then drag green corner handles to resize and the blue handle to rotate.
                  </div>
                  <label className="block text-xs text-gray-600">Code</label>
                  <input
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                  />
                  <label className="block text-xs text-gray-600">Zone</label>
                  <select
                    value={editZoneId}
                    onChange={(e) => setEditZoneId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm bg-white"
                  >
                    <option value="all">All / Unassigned</option>
                    {zones.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={saveSelected}
                    disabled={saving || !editGeojson?.geometry}
                    className="inline-flex items-center justify-center w-full px-4 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Save className="h-5 w-5 mr-2" />
                    Save Selected
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


