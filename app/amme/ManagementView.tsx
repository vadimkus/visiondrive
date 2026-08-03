'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { formatIdr } from '@/lib/amme/money'

type ManagementPayload = {
  venue: {
    id: string
    name: string
    banyaCapacity: number
    sessionMinutes: number
    turnoverMinutes: number
    timezone: string
  }
  resources: Array<{
    id: string
    code: string
    name: string
    kind: string
    capacity: number
    active: boolean
  }>
  resourceBookings: Array<{
    id: string
    resourceId: string
    guests: number
    startsAt: string
    endsAt: string
    booking?: { name: string; depositStatus: string } | null
    visit?: { name: string } | null
  }>
  capacity: Array<{
    resourceId: string
    name: string
    capacity: number
    allocated: number
    utilizationPct: number
  }>
  waitlist: Array<{
    id: string
    name: string
    phone: string | null
    guests: number
    status: string
    notes: string | null
  }>
  stations: Array<{ id: string; code: string; name: string; targetMinutes: number; active: boolean }>
  inventory: Array<{
    id: string
    sku: string
    name: string
    unit: string
    onHand: number
    reorderAt: number
    avgUnitCost: number
    supplier: string | null
  }>
  packages: Array<{
    id: string
    code: string
    name: string
    type: string
    price: number
    sessions: number
    creditValue: number
    active: boolean
    _count: { guestPackages: number }
  }>
  shifts: Array<{
    id: string
    status: string
    startsAt: string
    notes: Array<{ id: string; body: string; createdAt: string }>
  }>
  automations: Array<{
    id: string
    name: string
    trigger: string
    active: boolean
  }>
  messages: Array<{
    id: string
    channel: string
    recipient: string
    body: string
    status: string
    createdAt: string
  }>
  payments: Array<{
    id: string
    amount: number
    method: string
    status: string
    paidAt: string | null
  }>
}

type Analytics = {
  revenue: number
  foodRevenue: number
  banyaRevenue: number
  paid: number
  avgVisit: number
  utilizationPct: number
  revPerAvailableHour: number
  foodAttachPct: number
  noShowPct: number
  depositCaptured: number
  repeatGuestPct: number
  guests: number
  visits: number
  bookings: number
  stockConsumptionUnits: number
  rfm: Record<string, number>
}

type Panel = 'control' | 'capacity' | 'inventory' | 'packages' | 'staff' | 'automation'

export default function ManagementView({
  day,
  onToast,
}: {
  day: string
  onToast: (message: string, error?: boolean) => void
}) {
  const [panel, setPanel] = useState<Panel>('control')
  const [management, setManagement] = useState<ManagementPayload | null>(null)
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [busy, setBusy] = useState(false)

  const [resourceName, setResourceName] = useState('Главная баня')
  const [resourceCapacity, setResourceCapacity] = useState(20)
  const [waitName, setWaitName] = useState('')
  const [waitPhone, setWaitPhone] = useState('')
  const [waitGuests, setWaitGuests] = useState(2)
  const [sku, setSku] = useState('')
  const [stockName, setStockName] = useState('')
  const [stockQty, setStockQty] = useState(0)
  const [stockReorder, setStockReorder] = useState(0)
  const [stockCost, setStockCost] = useState(0)
  const [packageName, setPackageName] = useState('')
  const [packagePrice, setPackagePrice] = useState(0)
  const [packageSessions, setPackageSessions] = useState(5)
  const [shiftNote, setShiftNote] = useState('')
  const [automationName, setAutomationName] = useState('')
  const [automationTrigger, setAutomationTrigger] = useState('close_tab')
  const [messageTo, setMessageTo] = useState('')
  const [messageBody, setMessageBody] = useState('')

  const load = useCallback(async () => {
    const res = await fetch(`/api/amme/manage?day=${encodeURIComponent(day)}`)
    const data = await res.json()
    if (!res.ok || !data.success) {
      onToast(data.error || 'Management API недоступен', true)
      return
    }
    setManagement(data.management)
    setAnalytics(data.analytics)
  }, [day, onToast])

  useEffect(() => {
    void load()
  }, [load])

  async function act(body: Record<string, unknown>, message: string) {
    setBusy(true)
    try {
      const res = await fetch('/api/amme/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, day }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        onToast(data.error || 'Операция не выполнена', true)
        return false
      }
      setManagement(data.management)
      setAnalytics(data.analytics)
      onToast(message)
      return true
    } finally {
      setBusy(false)
    }
  }

  const openShift = management?.shifts.find((shift) => shift.status === 'OPEN') || null
  const lowStock = useMemo(
    () => management?.inventory.filter((item) => item.onHand <= item.reorderAt) || [],
    [management?.inventory]
  )

  if (!management || !analytics) {
    return <div className="amme-card">Загрузка системы управления…</div>
  }

  const panels: Array<{ id: Panel; label: string }> = [
    { id: 'control', label: 'Owner BI' },
    { id: 'capacity', label: 'Capacity & waitlist' },
    { id: 'inventory', label: 'Inventory / COGS' },
    { id: 'packages', label: 'Packages' },
    { id: 'staff', label: 'Смена' },
    { id: 'automation', label: 'Automation' },
  ]

  return (
    <div>
      <div className="amme-seg amme-no-print" style={{ marginBottom: 16 }}>
        {panels.map((item) => (
          <button
            key={item.id}
            type="button"
            className={panel === item.id ? 'on' : ''}
            onClick={() => setPanel(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {panel === 'control' ? (
        <>
          <div className="amme-kpis">
            <div className="amme-kpi">
              <div className="kl">Выручка сегодня</div>
              <div className="kv">{formatIdr(analytics.revenue)}</div>
            </div>
            <div className="amme-kpi">
              <div className="kl">Загрузка бани</div>
              <div className="kv">{analytics.utilizationPct}%</div>
            </div>
            <div className="amme-kpi">
              <div className="kl">Rev / доступный час</div>
              <div className="kv">{formatIdr(analytics.revPerAvailableHour)}</div>
            </div>
            <div className="amme-kpi">
              <div className="kl">Food attach</div>
              <div className="kv">{analytics.foodAttachPct}%</div>
            </div>
            <div className="amme-kpi">
              <div className="kl">Повторные гости</div>
              <div className="kv">{analytics.repeatGuestPct}%</div>
            </div>
            <div className="amme-kpi">
              <div className="kl">No-show</div>
              <div className="kv">{analytics.noShowPct}%</div>
            </div>
          </div>
          <div className="amme-split">
            <div className="amme-card">
              <p className="amme-eyebrow">Контроль денег</p>
              <div className="amme-manage-list">
                <div><span>Оплачено</span><strong>{formatIdr(analytics.paid)}</strong></div>
                <div><span>Депозиты</span><strong>{formatIdr(analytics.depositCaptured)}</strong></div>
                <div><span>Средний визит</span><strong>{formatIdr(analytics.avgVisit)}</strong></div>
                <div><span>Баня</span><strong>{formatIdr(analytics.banyaRevenue)}</strong></div>
                <div><span>F&amp;B</span><strong>{formatIdr(analytics.foodRevenue)}</strong></div>
              </div>
            </div>
            <div className="amme-card">
              <p className="amme-eyebrow">RFM база</p>
              <div className="amme-manage-list">
                {Object.entries(analytics.rfm).map(([segment, count]) => (
                  <div key={segment}><span>{segment}</span><strong>{count}</strong></div>
                ))}
              </div>
              <button
                className="amme-jade"
                type="button"
                disabled={busy}
                onClick={() => void act({ type: 'rfm_recompute' }, 'RFM обновлён')}
              >
                Пересчитать RFM
              </button>
            </div>
          </div>
        </>
      ) : null}

      {panel === 'capacity' ? (
        <div className="amme-manage-grid">
          <div className="amme-card">
            <p className="amme-eyebrow">Ресурсы и загрузка · {day}</p>
            {management.capacity.map((row) => (
              <div key={row.resourceId} className="amme-capacity-row">
                <div>
                  <strong>{row.name}</strong>
                  <span>{row.allocated} гостей · лимит {row.capacity}</span>
                </div>
                <div className="amme-capacity-bar">
                  <i style={{ width: `${Math.min(100, row.utilizationPct)}%` }} />
                </div>
                <b>{row.utilizationPct}%</b>
              </div>
            ))}
            <div className="amme-field"><label>Название ресурса</label><input value={resourceName} onChange={(e) => setResourceName(e.target.value)} /></div>
            <div className="amme-field"><label>Вместимость</label><input type="number" value={resourceCapacity} onChange={(e) => setResourceCapacity(Number(e.target.value))} /></div>
            <button className="amme-primary" type="button" disabled={busy} onClick={() => void act({
              type: 'resource_upsert',
              code: resourceName.toUpperCase().replace(/\s+/g, '_'),
              name: resourceName,
              kind: 'BANYA',
              capacity: resourceCapacity,
              sessionMinutes: management.venue.sessionMinutes,
              turnoverMinutes: management.venue.turnoverMinutes,
            }, 'Ресурс сохранён')}>Сохранить ресурс</button>
          </div>
          <div className="amme-card">
            <p className="amme-eyebrow">Лист ожидания</p>
            <div className="amme-field"><label>Имя</label><input value={waitName} onChange={(e) => setWaitName(e.target.value)} /></div>
            <div className="amme-field"><label>Телефон</label><input value={waitPhone} onChange={(e) => setWaitPhone(e.target.value)} /></div>
            <div className="amme-field"><label>Гостей</label><input type="number" value={waitGuests} onChange={(e) => setWaitGuests(Number(e.target.value))} /></div>
            <button className="amme-primary" type="button" disabled={busy || !waitName} onClick={() => void act({
              type: 'waitlist_add', name: waitName, phone: waitPhone, guests: waitGuests, day,
            }, 'Добавлено в waitlist').then((ok) => {
              if (ok) { setWaitName(''); setWaitPhone('') }
            })}>+ Waitlist</button>
            <div className="amme-manage-list" style={{ marginTop: 14 }}>
              {management.waitlist.map((entry) => (
                <div key={entry.id}><span>{entry.name} · {entry.guests} чел.</span><strong>{entry.status}</strong></div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {panel === 'inventory' ? (
        <div className="amme-manage-grid">
          <div className="amme-card">
            <p className="amme-eyebrow">Остатки {lowStock.length ? `· ${lowStock.length} low` : ''}</p>
            <div className="amme-manage-list">
              {management.inventory.map((item) => (
                <div key={item.id} className={item.onHand <= item.reorderAt ? 'warn' : ''}>
                  <span>{item.name}<small>{item.sku} · {item.supplier || 'без поставщика'}</small></span>
                  <strong>{item.onHand} {item.unit}</strong>
                  <button className="amme-ghost" type="button" onClick={() => void act({
                    type: 'inventory_adjust', inventoryItemId: item.id, quantity: 1, movementType: 'RECEIPT', note: 'Quick +1',
                  }, 'Остаток обновлён')}>+1</button>
                </div>
              ))}
            </div>
          </div>
          <div className="amme-card">
            <p className="amme-eyebrow">Новая складская позиция</p>
            <div className="amme-field"><label>SKU</label><input value={sku} onChange={(e) => setSku(e.target.value)} /></div>
            <div className="amme-field"><label>Название</label><input value={stockName} onChange={(e) => setStockName(e.target.value)} /></div>
            <div className="amme-field"><label>Остаток</label><input type="number" value={stockQty} onChange={(e) => setStockQty(Number(e.target.value))} /></div>
            <div className="amme-field"><label>Reorder at</label><input type="number" value={stockReorder} onChange={(e) => setStockReorder(Number(e.target.value))} /></div>
            <div className="amme-field"><label>Cost / unit</label><input type="number" value={stockCost} onChange={(e) => setStockCost(Number(e.target.value))} /></div>
            <button className="amme-primary" type="button" disabled={busy || !sku || !stockName} onClick={() => void act({
              type: 'inventory_upsert', sku, name: stockName, unit: 'pcs', onHand: stockQty, reorderAt: stockReorder, avgUnitCost: stockCost,
            }, 'Складская позиция создана')}>Сохранить</button>
          </div>
        </div>
      ) : null}

      {panel === 'packages' ? (
        <div className="amme-manage-grid">
          <div className="amme-card">
            <p className="amme-eyebrow">Memberships / packages</p>
            <div className="amme-manage-list">
              {management.packages.map((pkg) => (
                <div key={pkg.id}>
                  <span>{pkg.name}<small>{pkg.type} · {pkg.sessions} визитов</small></span>
                  <strong>{formatIdr(pkg.price)} · {pkg._count.guestPackages} guests</strong>
                </div>
              ))}
            </div>
          </div>
          <div className="amme-card">
            <p className="amme-eyebrow">Создать пакет</p>
            <div className="amme-field"><label>Название</label><input value={packageName} onChange={(e) => setPackageName(e.target.value)} /></div>
            <div className="amme-field"><label>Цена</label><input type="number" value={packagePrice} onChange={(e) => setPackagePrice(Number(e.target.value))} /></div>
            <div className="amme-field"><label>Сессий</label><input type="number" value={packageSessions} onChange={(e) => setPackageSessions(Number(e.target.value))} /></div>
            <button className="amme-primary" type="button" disabled={busy || !packageName} onClick={() => void act({
              type: 'package_upsert',
              code: packageName.toUpperCase().replace(/\s+/g, '_'),
              name: packageName,
              packageType: 'SESSION_PACK',
              price: packagePrice,
              sessions: packageSessions,
              creditValue: 0,
              validityDays: 365,
            }, 'Пакет создан')}>Создать</button>
          </div>
        </div>
      ) : null}

      {panel === 'staff' ? (
        <div className="amme-manage-grid">
          <div className="amme-card">
            <p className="amme-eyebrow">Текущая смена</p>
            {openShift ? (
              <>
                <h3>OPEN · {new Date(openShift.startsAt).toLocaleString('ru-RU')}</h3>
                <div className="amme-manage-list">
                  {openShift.notes.map((note) => <div key={note.id}><span>{note.body}</span></div>)}
                </div>
              </>
            ) : (
              <button className="amme-primary" type="button" onClick={() => void act({ type: 'shift_open' }, 'Смена открыта')}>Открыть смену</button>
            )}
          </div>
          <div className="amme-card">
            <p className="amme-eyebrow">Передача смены</p>
            <textarea rows={5} value={shiftNote} onChange={(e) => setShiftNote(e.target.value)} placeholder="Что передать следующей смене…" />
            <button className="amme-primary" type="button" disabled={!openShift || !shiftNote.trim()} onClick={() => void act({
              type: 'shift_note', shiftId: openShift?.id, body: shiftNote,
            }, 'Заметка сохранена').then((ok) => ok && setShiftNote(''))}>Сохранить handover</button>
          </div>
        </div>
      ) : null}

      {panel === 'automation' ? (
        <div className="amme-manage-grid">
          <div className="amme-card">
            <p className="amme-eyebrow">Workflows</p>
            <div className="amme-manage-list">
              {management.automations.map((automation) => (
                <div key={automation.id}><span>{automation.name}<small>{automation.trigger}</small></span><strong>{automation.active ? 'ON' : 'OFF'}</strong></div>
              ))}
            </div>
            <div className="amme-field"><label>Название</label><input value={automationName} onChange={(e) => setAutomationName(e.target.value)} /></div>
            <div className="amme-field"><label>Trigger</label><select value={automationTrigger} onChange={(e) => setAutomationTrigger(e.target.value)}><option value="close_tab">close_tab</option><option value="noshow">noshow</option><option value="booking_create">booking_create</option><option value="guest_birthday">guest_birthday</option></select></div>
            <button className="amme-primary" type="button" disabled={!automationName} onClick={() => void act({
              type: 'automation_upsert', name: automationName, trigger: automationTrigger, conditions: {}, actions: { type: 'ADD_TAG', tag: 'Follow-up' },
            }, 'Automation создан')}>Создать workflow</button>
          </div>
          <div className="amme-card">
            <p className="amme-eyebrow">WhatsApp outbox</p>
            <div className="amme-field"><label>Получатель</label><input value={messageTo} onChange={(e) => setMessageTo(e.target.value)} placeholder="+62…" /></div>
            <div className="amme-field"><label>Текст</label><textarea rows={4} value={messageBody} onChange={(e) => setMessageBody(e.target.value)} /></div>
            <button className="amme-primary" type="button" disabled={!messageTo || !messageBody} onClick={() => void act({
              type: 'message_queue', recipient: messageTo, body: messageBody, channel: 'WHATSAPP',
            }, 'Сообщение в очереди')}>В очередь</button>
            <div className="amme-manage-list" style={{ marginTop: 14 }}>
              {management.messages.slice(0, 10).map((message) => (
                <div key={message.id}><span>{message.recipient}<small>{message.body}</small></span><strong>{message.status}</strong></div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
