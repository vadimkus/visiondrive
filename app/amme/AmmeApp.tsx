'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AMME_MENU_CATEGORIES, SEND_DELAY_SEC } from '@/lib/amme/menu'
import { formatIdr } from '@/lib/amme/money'
import { KNOWLEDGE_ARTICLES, KNOWLEDGE_CATEGORIES } from '@/lib/amme/knowledge'
import CrmView, { type GuestCard } from '@/app/amme/CrmView'

type StaffRole = 'ADMIN' | 'KITCHEN' | 'OWNER'

type MenuItem = {
  id: string
  code: string
  name: string
  price: number
  category: string
  station: string
  vegFlag: string | null
  active: boolean
}

type Booking = {
  id: string
  at: string
  name: string
  guests: number
  banya: boolean
  phone: string | null
  note?: string | null
  guestId?: string | null
  status: 'WAITING' | 'ARRIVED' | 'NOSHOW'
  visitId: string | null
}

type Line = {
  id: string
  name: string
  qty: number
  price: number
  kind: string
  status: 'DRAFT' | 'SENT' | 'DONE' | 'CANCELLED'
  menuCode: string | null
}

type Tab = {
  id: string
  label: string | null
  paidAt: string | null
  closedAt: string | null
  lines: Line[]
}

type Visit = {
  id: string
  name: string
  guests: number
  banya: boolean
  banyaEndedAt: string | null
  openedAt: string
  guestId?: string | null
  tabs: Tab[]
}

type KitchenLine = {
  id: string
  name: string
  qty: number
  status: string
  sentAt: string | null
  guestName: string
  visitId: string
  tabId: string
}

type Audit = {
  id: string
  action: string
  detail: string | null
  createdAt: string | null
}

type ReportRange = 'today' | '7d' | '30d' | 'custom'

type Report = {
  rev: number
  food: number
  banyaRev: number
  avg: number
  bGuests: number
  guestsServed: number
  perGuest: number
  foodShare: number
  banyaShare: number
  bkAll: number
  bkNo: number
  bkArrived: number
  top: [string, number][]
  daily: { day: string; rev: number; tabs: number; food: number; banya: number }[]
  hourly: { hour: number; tabs: number }[]
  tabsPaid: number
  visitsPaid: number
  day: string
  range: string
  rangeLabel: string
  audits: Audit[]
}

type State = {
  venue: { id: string; name: string; banyaPrice: number; currency: string }
  day: string
  menu: MenuItem[]
  bookings: Booking[]
  visits: Visit[]
  kitchen: KitchenLine[]
  audits: Audit[]
  guests: GuestCard[]
  history: Visit[]
}

type View = 'dash' | 'book' | 'guests' | 'crm' | 'kitchen' | 'report' | 'menu' | 'knowledge'

const VIEW_META: Record<View, { label: string; hint: string; ico: string }> = {
  dash: { label: 'Дашборд', hint: 'Смена и быстрые действия', ico: '◆' },
  book: { label: 'Записи', hint: 'Приход, неявки, импорт', ico: '☰' },
  guests: { label: 'Счета', hint: 'Счета, меню, оплата', ico: '◎' },
  crm: { label: 'CRM', hint: 'Профили, сегменты, заметки', ico: '◈' },
  kitchen: { label: 'Кухня', hint: 'Очередь тикетов', ico: '▣' },
  report: { label: 'Отчёт', hint: 'Выручка и журнал', ico: '▤' },
  menu: { label: 'Меню', hint: 'Цены и активность', ico: '≡' },
  knowledge: { label: 'Справка', hint: 'Инструкции для смены', ico: '?' },
}

const ROLE_LABEL: Record<StaffRole, string> = {
  ADMIN: 'админ',
  KITCHEN: 'кухня',
  OWNER: 'владелец',
}

const hhmm = (iso: string) =>
  new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })

const auditTime = (iso: string | null) => {
  if (!iso) return ''
  return new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function tabSum(tab: Tab) {
  return tab.lines.reduce((s, l) => s + l.qty * l.price, 0)
}

function visitSum(v: Visit) {
  return v.tabs.reduce((s, t) => s + tabSum(t), 0)
}

function pickState(data: Record<string, unknown>): State {
  return {
    venue: data.venue as State['venue'],
    day: data.day as string,
    menu: data.menu as MenuItem[],
    bookings: data.bookings as Booking[],
    visits: data.visits as Visit[],
    kitchen: data.kitchen as KitchenLine[],
    audits: (data.audits as Audit[]) || [],
    guests: (data.guests as GuestCard[]) || [],
    history: (data.history as Visit[]) || [],
  }
}

function guestMap(cards: GuestCard[]) {
  return new Map(cards.map((g) => [g.id, g]))
}

function matchesSearch(q: string, name: string) {
  if (!q.trim()) return true
  return name.toLowerCase().includes(q.trim().toLowerCase())
}

function kitchenUrgency(mins: number): 'ok' | 'warn' | 'hot' {
  if (mins >= 10) return 'hot'
  if (mins >= 5) return 'warn'
  return 'ok'
}

export default function AmmeApp({
  user,
}: {
  user: { id: string; email: string; name: string | null; staffRole: StaffRole }
}) {
  const router = useRouter()
  const [view, setView] = useState<View>('dash')
  const [day, setDay] = useState(todayKey)
  const [search, setSearch] = useState('')
  const [state, setState] = useState<State | null>(null)
  const [dashReport, setDashReport] = useState<Report | null>(null)
  const [report, setReport] = useState<Report | null>(null)
  const [reportRange, setReportRange] = useState<ReportRange>('7d')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [selVisit, setSelVisit] = useState<string | null>(null)
  const [selTab, setSelTab] = useState<string | null>(null)
  const [selLines, setSelLines] = useState<Set<string>>(new Set())
  const [selArticle, setSelArticle] = useState(KNOWLEDGE_ARTICLES[0]?.id || '')
  const [crmFocusId, setCrmFocusId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; err?: boolean } | null>(null)
  const [busy, setBusy] = useState(false)
  const [importText, setImportText] = useState('')
  const [walkOpen, setWalkOpen] = useState(false)
  const [wName, setWName] = useState('')
  const [wPhone, setWPhone] = useState('')
  const [wGuests, setWGuests] = useState(2)
  const [wBanya, setWBanya] = useState(false)
  const [bkOpen, setBkOpen] = useState(false)
  const [bkTime, setBkTime] = useState('12:00')
  const [bkName, setBkName] = useState('')
  const [bkGuests, setBkGuests] = useState(2)
  const [bkBanya, setBkBanya] = useState(false)
  const [bkPhone, setBkPhone] = useState('')
  const [sendLeft, setSendLeft] = useState(0)
  const sendTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  const showToast = useCallback((msg: string, err = false) => {
    setToast({ msg, err })
    setTimeout(() => setToast(null), 2800)
  }, [])

  const load = useCallback(async () => {
    const res = await fetch(`/api/amme/state?day=${encodeURIComponent(day)}`)
    if (res.status === 401) {
      router.replace('/amme/login')
      return
    }
    const data = await res.json()
    if (!data.success) {
      showToast(data.error || 'Ошибка загрузки', true)
      return
    }
    setState(pickState(data))
  }, [day, router, showToast])

  const loadDashReport = useCallback(async () => {
    const params = new URLSearchParams({ day, range: '7d' })
    const res = await fetch(`/api/amme/report?${params}`)
    if (!res.ok) return
    const data = await res.json()
    if (data.success) setDashReport(data.report)
  }, [day])

  const loadReport = useCallback(async () => {
    const params = new URLSearchParams({ day, range: reportRange })
    if (reportRange === 'custom' && customFrom && customTo) {
      params.set('from', customFrom)
      params.set('to', customTo)
    }
    const res = await fetch(`/api/amme/report?${params}`)
    if (!res.ok) return
    const data = await res.json()
    if (data.success) setReport(data.report)
  }, [day, reportRange, customFrom, customTo])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    void loadDashReport()
  }, [loadDashReport])

  useEffect(() => {
    if (view === 'report') void loadReport()
  }, [view, loadReport])

  useEffect(() => {
    const t = setInterval(() => {
      void load()
      void loadDashReport()
      if (view === 'report') void loadReport()
    }, 20000)
    return () => clearInterval(t)
  }, [load, loadDashReport, loadReport, view])

  useEffect(() => {
    return () => {
      if (sendTimer.current) clearInterval(sendTimer.current)
    }
  }, [])

  const act = useCallback(
    async (body: Record<string, unknown>, successMsg?: string) => {
      setBusy(true)
      try {
        const res = await fetch('/api/amme/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...body, day: body.day ?? day }),
        })
        const data = await res.json()
        if (!res.ok || data.success === false) {
          showToast(data.error || 'Ошибка', true)
          return false
        }
        setState(pickState(data))
        void loadDashReport()
        if (view === 'report') void loadReport()
        if (successMsg) showToast(successMsg)
        return true
      } catch {
        showToast('Сеть недоступна', true)
        return false
      } finally {
        setBusy(false)
      }
    },
    [day, loadDashReport, loadReport, showToast, view]
  )

  function armSend(tabId: string) {
    if (sendTimer.current) clearInterval(sendTimer.current)
    setSendLeft(SEND_DELAY_SEC)
    sendTimer.current = setInterval(() => {
      setSendLeft((n) => {
        if (n <= 1) {
          if (sendTimer.current) clearInterval(sendTimer.current)
          sendTimer.current = null
          void act({ type: 'send', tabId })
          return 0
        }
        return n - 1
      })
    }, 1000)
  }

  async function logout() {
    await fetch('/api/amme/auth/logout', { method: 'POST' })
    router.replace('/amme/login')
  }

  const kitchenOpen = state?.kitchen.filter((k) => k.status === 'SENT').length || 0
  const openVisits = state?.visits || []
  const waiting = state?.bookings.filter((b) => b.status === 'WAITING').length || 0
  const banyaLive = openVisits.filter((v) => v.banya && !v.banyaEndedAt)
  const activeMenu = useMemo(() => (state?.menu || []).filter((m) => m.active), [state?.menu])
  const guestsById = useMemo(() => guestMap(state?.guests || []), [state?.guests])

  const filteredBookings = useMemo(
    () => (state?.bookings || []).filter((b) => matchesSearch(search, b.name)),
    [state?.bookings, search]
  )

  const filteredVisits = useMemo(
    () => openVisits.filter((v) => matchesSearch(search, v.name)),
    [openVisits, search]
  )

  const activeVisit = useMemo(
    () => openVisits.find((v) => v.id === selVisit) || null,
    [openVisits, selVisit]
  )

  const activeTab = useMemo(() => {
    if (!activeVisit) return null
    return (
      activeVisit.tabs.find((t) => t.id === selTab) ||
      activeVisit.tabs.find((t) => !t.closedAt) ||
      null
    )
  }, [activeVisit, selTab])

  useEffect(() => {
    if (activeVisit && !selTab) {
      const t = activeVisit.tabs.find((x) => !x.closedAt)
      if (t) setSelTab(t.id)
    }
  }, [activeVisit, selTab])

  const article = useMemo(
    () => KNOWLEDGE_ARTICLES.find((a) => a.id === selArticle) || KNOWLEDGE_ARTICLES[0],
    [selArticle]
  )

  if (!state) {
    return (
      <div className="amme-shell">
        <div className="amme-workspace">
          <div className="amme-main">
            <p className="amme-eyebrow">Загрузка смены…</p>
          </div>
        </div>
      </div>
    )
  }

  const meta = VIEW_META[view]

  return (
    <div className="amme-shell">
      <aside className="amme-sidebar amme-no-print">
        <div className="amme-side-brand">
          <div className="mark">{state.venue.name}</div>
          <div className="sub">AMMÉ · учёт бани и кухни</div>
        </div>

        <nav className="amme-side-nav">
          {(Object.keys(VIEW_META) as View[]).map((id) => {
            const m = VIEW_META[id]
            const badge =
              id === 'kitchen' && kitchenOpen > 0
                ? kitchenOpen
                : id === 'book' && waiting > 0
                  ? waiting
                  : null
            return (
              <button
                key={id}
                type="button"
                className={view === id ? 'on' : ''}
                onClick={() => setView(id)}
              >
                <span className="ico">{m.ico}</span>
                {m.label}
                {badge != null ? <span className="badge">{badge}</span> : null}
              </button>
            )
          })}
        </nav>

        <div className="amme-side-foot">
          <div className="amme-user-chip">
            <div className="nm">{user.name || user.email}</div>
            <div className="em">
              {user.email} · {ROLE_LABEL[user.staffRole]}
            </div>
          </div>
          <button className="amme-ghost" type="button" onClick={() => void logout()}>
            Выйти
          </button>
        </div>
      </aside>

      <div className="amme-workspace">
        <header className="amme-topbar amme-no-print">
          <div>
            <h1>{meta.label}</h1>
            <div className="hint">{meta.hint}</div>
          </div>

          <div className="amme-top-actions">
            <div className="amme-field" style={{ margin: 0, width: 148 }}>
              <label>Дата смены</label>
              <input type="date" value={day} onChange={(e) => setDay(e.target.value)} />
            </div>
            {(view === 'book' || view === 'guests' || view === 'dash') && (
              <div className="amme-field" style={{ margin: 0, width: 180 }}>
                <label>Поиск</label>
                <input
                  type="search"
                  placeholder="Имя гостя"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            )}
          </div>
        </header>

        <div className="amme-main" style={{ opacity: busy ? 0.65 : 1 }}>
          {view === 'dash' ? (
            <Dashboard
              state={state}
              report={dashReport}
              banyaLive={banyaLive}
              kitchenOpen={kitchenOpen}
              waiting={waiting}
              visits={search ? filteredVisits : openVisits}
              onGo={setView}
            />
          ) : null}

          {view === 'book' ? (
            <Bookings
              bookings={filteredBookings}
              day={state.day}
              importText={importText}
              setImportText={setImportText}
              bkOpen={bkOpen}
              setBkOpen={setBkOpen}
              bkTime={bkTime}
              setBkTime={setBkTime}
              bkName={bkName}
              setBkName={setBkName}
              bkGuests={bkGuests}
              setBkGuests={setBkGuests}
              bkBanya={bkBanya}
              setBkBanya={setBkBanya}
              bkPhone={bkPhone}
              setBkPhone={setBkPhone}
              onArrive={(id) => {
                void act({ type: 'arrive', bookingId: id }).then((ok) => {
                  if (ok) setView('guests')
                })
              }}
              onNoshow={(id) => void act({ type: 'noshow', bookingId: id })}
              onUnmark={(id) => void act({ type: 'unmark', bookingId: id })}
              onToggle={(id) => void act({ type: 'toggle_banya', bookingId: id })}
              onImport={(mode) => {
                void act({ type: 'import', text: importText, mode }, 'Список импортирован').then(
                  (ok) => {
                    if (ok) setImportText('')
                  }
                )
              }}
              onCreate={() => {
                void act(
                  {
                    type: 'booking_create',
                    time: bkTime,
                    name: bkName,
                    guests: bkGuests,
                    banya: bkBanya,
                    phone: bkPhone || undefined,
                  },
                  'Запись добавлена'
                ).then((ok) => {
                  if (ok) {
                    setBkOpen(false)
                    setBkName('')
                    setBkGuests(2)
                    setBkBanya(false)
                    setBkPhone('')
                    setBkTime('12:00')
                  }
                })
              }}
              onOpenVisit={(visitId) => {
                setSelVisit(visitId)
                setView('guests')
              }}
              guestsById={guestsById}
            />
          ) : null}

          {view === 'crm' ? (
            <CrmView
              onToast={showToast}
              focusGuestId={crmFocusId}
              onFocusConsumed={() => setCrmFocusId(null)}
            />
          ) : null}

          {view === 'guests' ? (
            <Guests
              visits={filteredVisits}
              banyaLive={banyaLive}
              banyaPrice={state.venue.banyaPrice}
              menu={activeMenu}
              activeVisit={activeVisit}
              activeTab={activeTab}
              selLines={selLines}
              sendLeft={sendLeft}
              walkOpen={walkOpen}
              wName={wName}
              wPhone={wPhone}
              wGuests={wGuests}
              wBanya={wBanya}
              setWalkOpen={setWalkOpen}
              setWName={setWName}
              setWPhone={setWPhone}
              setWGuests={setWGuests}
              setWBanya={setWBanya}
              guestsById={guestsById}
              onOpenCrm={(id) => {
                setCrmFocusId(id)
                setView('crm')
              }}
              onSelectVisit={(id) => {
                setSelVisit(id)
                const v = openVisits.find((x) => x.id === id)
                setSelTab(v?.tabs.find((t) => !t.closedAt)?.id || null)
                setSelLines(new Set())
              }}
              onSelectTab={setSelTab}
              onDish={(code) => {
                if (!activeTab) return
                void act({ type: 'add_dish', tabId: activeTab.id, menuCode: code }).then(() =>
                  armSend(activeTab.id)
                )
              }}
              onBump={(lineId, delta) => {
                void act({ type: 'bump', lineId, delta })
                if (activeTab) armSend(activeTab.id)
              }}
              onToggleLine={(id) => {
                setSelLines((prev) => {
                  const n = new Set(prev)
                  if (n.has(id)) n.delete(id)
                  else n.add(id)
                  return n
                })
              }}
              onSendNow={() => {
                if (!activeTab) return
                if (sendTimer.current) clearInterval(sendTimer.current)
                setSendLeft(0)
                void act({ type: 'send', tabId: activeTab.id })
              }}
              onPay={() =>
                activeTab && void act({ type: 'pay', tabId: activeTab.id }, 'Оплата зафиксирована')
              }
              onClose={() =>
                activeTab && void act({ type: 'close', tabId: activeTab.id }, 'Счёт закрыт')
              }
              onEndBanya={(id) => void act({ type: 'end_banya', visitId: id }, 'Баня завершена')}
              onNewTab={() => {
                if (!activeVisit || !selLines.size) return
                void act({
                  type: 'move',
                  lineIds: [...selLines],
                  newTabForVisitId: activeVisit.id,
                }).then((ok) => {
                  if (ok) setSelLines(new Set())
                })
              }}
              onMoveTo={(tabId) => {
                void act({ type: 'move', lineIds: [...selLines], targetTabId: tabId }).then((ok) => {
                  if (ok) setSelLines(new Set())
                })
              }}
              onWalkin={() => {
                void act(
                  {
                    type: 'walkin',
                    name: wName,
                    guests: wGuests,
                    banya: wBanya,
                    phone: wPhone || undefined,
                  },
                  'Визит открыт'
                ).then((ok) => {
                  if (ok) {
                    setWalkOpen(false)
                    setWName('')
                    setWPhone('')
                    setWGuests(2)
                    setWBanya(false)
                  }
                })
              }}
            />
          ) : null}

          {view === 'kitchen' ? (
            <Kitchen lines={state.kitchen} onDone={(id) => void act({ type: 'done', lineId: id })} />
          ) : null}

          {view === 'report' ? (
            <ReportView
              report={report}
              banyaPrice={state.venue.banyaPrice}
              reportRange={reportRange}
              setReportRange={setReportRange}
              customFrom={customFrom}
              setCustomFrom={setCustomFrom}
              customTo={customTo}
              setCustomTo={setCustomTo}
              onRefresh={() => void loadReport()}
            />
          ) : null}

          {view === 'menu' ? (
            <MenuEditor
              menu={state.menu}
              onSave={(code, patch) =>
                void act({ type: 'menu_update', menuCode: code, ...patch }, 'Меню обновлено')
              }
            />
          ) : null}

          {view === 'knowledge' ? (
            <KnowledgeView selArticle={selArticle} setSelArticle={setSelArticle} article={article} />
          ) : null}
        </div>
      </div>

      {toast ? <div className={`amme-toast ${toast.err ? 'err' : ''}`}>{toast.msg}</div> : null}
    </div>
  )
}

function Dashboard({
  state,
  report,
  banyaLive,
  kitchenOpen,
  waiting,
  visits,
  onGo,
}: {
  state: State
  report: Report | null
  banyaLive: Visit[]
  kitchenOpen: number
  waiting: number
  visits: Visit[]
  onGo: (v: View) => void
}) {
  return (
    <>
      <p className="amme-eyebrow">Смена · {state.day}</p>
      <div className="amme-kpis">
        <div className="amme-kpi">
          <div className="kl">Выручка (7д)</div>
          <div className="kv">
            {formatIdr((report?.rev || 0) / 1000)}
            <small>тыс</small>
          </div>
        </div>
        <div className="amme-kpi">
          <div className="kl">Средний чек</div>
          <div className="kv">
            {formatIdr((report?.avg || 0) / 1000)}
            <small>тыс</small>
          </div>
        </div>
        <div className="amme-kpi">
          <div className="kl">Гости сейчас</div>
          <div className="kv">{state.visits.length}</div>
        </div>
        <div className="amme-kpi">
          <div className="kl">В бане</div>
          <div className="kv">{banyaLive.reduce((s, v) => s + v.guests, 0)}</div>
        </div>
        <div className="amme-kpi">
          <div className="kl">Ждут записи</div>
          <div className="kv">{waiting}</div>
        </div>
        <div className="amme-kpi">
          <div className="kl">Кухня</div>
          <div className="kv">{kitchenOpen}</div>
        </div>
      </div>

      <div className="amme-no-print" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
        <button className="amme-primary" type="button" onClick={() => onGo('book')}>
          Открыть записи
        </button>
        <button className="amme-ghost" type="button" onClick={() => onGo('guests')}>
          Гости и счета
        </button>
        <button className="amme-ghost" type="button" onClick={() => onGo('kitchen')}>
          Кухня {kitchenOpen > 0 ? `(${kitchenOpen})` : ''}
        </button>
        <button className="amme-ghost" type="button" onClick={() => onGo('report')}>
          Отчёт
        </button>
      </div>

      <div className="amme-split" style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)' }}>
        <div className="amme-card">
          <p className="amme-eyebrow">Активные гости</p>
          {visits.length === 0 ? (
            <p style={{ color: 'var(--amme-dim)', margin: 0 }}>
              Пока никого. Отметьте приход в Записях.
            </p>
          ) : (
            <div style={{ display: 'grid', gap: 8 }}>
              {visits.map((v) => (
                <div
                  key={v.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    padding: '10px 0',
                    borderBottom: '1px solid var(--amme-line)',
                  }}
                >
                  <div>
                    <div style={{ fontFamily: 'var(--amme-display)', fontSize: 17 }}>{v.name}</div>
                    <div className="amme-mono" style={{ fontSize: 12, color: 'var(--amme-dim)' }}>
                      {v.guests} чел. · {v.banya ? 'баня' : 'только кухня'} · {hhmm(v.openedAt)}
                    </div>
                  </div>
                  <div className="amme-mono" style={{ color: 'var(--amme-sage)' }}>
                    {formatIdr(visitSum(v))} Rp
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="amme-card">
          <p className="amme-eyebrow">Журнал смены</p>
          {state.audits.length === 0 ? (
            <p style={{ color: 'var(--amme-dim)', margin: 0 }}>Пока без событий.</p>
          ) : (
            <div style={{ display: 'grid', gap: 8 }}>
              {state.audits.map((a) => (
                <div
                  key={a.id}
                  style={{
                    padding: '8px 0',
                    borderBottom: '1px solid var(--amme-line)',
                    fontSize: 13,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <span className="amme-mono" style={{ color: 'var(--amme-sage)' }}>
                      {a.action}
                    </span>
                    <span className="amme-mono" style={{ fontSize: 11, color: 'var(--amme-dim)' }}>
                      {auditTime(a.createdAt)}
                    </span>
                  </div>
                  {a.detail ? (
                    <div style={{ marginTop: 4, color: 'var(--amme-dim)', fontSize: 12 }}>{a.detail}</div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function Bookings(props: {
  bookings: Booking[]
  day: string
  importText: string
  setImportText: (v: string) => void
  bkOpen: boolean
  setBkOpen: (v: boolean) => void
  bkTime: string
  setBkTime: (v: string) => void
  bkName: string
  setBkName: (v: string) => void
  bkGuests: number
  setBkGuests: (n: number | ((x: number) => number)) => void
  bkBanya: boolean
  setBkBanya: (v: boolean) => void
  bkPhone: string
  setBkPhone: (v: string) => void
  onArrive: (id: string) => void
  onNoshow: (id: string) => void
  onUnmark: (id: string) => void
  onToggle: (id: string) => void
  onImport: (mode: 'append' | 'replace') => void
  onCreate: () => void
  onOpenVisit: (visitId: string) => void
  guestsById: Map<string, GuestCard>
}) {
  const now = Date.now()
  return (
    <>
      <div
        className="amme-no-print"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}
      >
        <p className="amme-eyebrow" style={{ margin: 0 }}>
          Записи · {props.day}
        </p>
        <button className="amme-primary" type="button" onClick={() => props.setBkOpen(!props.bkOpen)}>
          + Запись вручную
        </button>
      </div>

      {props.bkOpen ? (
        <div className="amme-card amme-no-print" style={{ maxWidth: 560, marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 10 }}>
            <div className="amme-field">
              <label>Время</label>
              <input value={props.bkTime} onChange={(e) => props.setBkTime(e.target.value)} placeholder="12:00" />
            </div>
            <div className="amme-field">
              <label>Имя</label>
              <input value={props.bkName} onChange={(e) => props.setBkName(e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
            <span className="amme-mono" style={{ fontSize: 12, color: 'var(--amme-dim)' }}>
              Гостей
            </span>
            <button className="amme-ghost" type="button" onClick={() => props.setBkGuests((n) => Math.max(1, n - 1))}>
              −
            </button>
            <span className="amme-mono">{props.bkGuests}</span>
            <button className="amme-ghost" type="button" onClick={() => props.setBkGuests((n) => n + 1)}>
              +
            </button>
            <button
              type="button"
              className={props.bkBanya ? 'amme-jade' : 'amme-ghost'}
              onClick={() => props.setBkBanya(!props.bkBanya)}
            >
              {props.bkBanya ? 'баня' : 'только кухня'}
            </button>
          </div>
          <div className="amme-field">
            <label>Телефон</label>
            <input value={props.bkPhone} onChange={(e) => props.setBkPhone(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button className="amme-primary" type="button" onClick={props.onCreate}>
              Сохранить
            </button>
            <button className="amme-ghost" type="button" onClick={() => props.setBkOpen(false)}>
              Отмена
            </button>
          </div>
        </div>
      ) : null}

      <div style={{ display: 'grid', gap: 6, maxWidth: 860, marginBottom: 22 }}>
        {props.bookings.length === 0 ? (
          <div className="amme-card" style={{ color: 'var(--amme-dim)' }}>
            Нет записей на эту дату.
          </div>
        ) : null}
        {props.bookings.map((b) => {
          const late = b.status === 'WAITING' && now - new Date(b.at).getTime() > 15 * 60000
          const g = b.guestId ? props.guestsById.get(b.guestId) : undefined
          return (
            <div
              key={b.id}
              className="amme-card"
              style={{
                display: 'grid',
                gridTemplateColumns: '64px minmax(0,1fr) auto',
                gap: 12,
                alignItems: 'center',
                opacity: b.status === 'NOSHOW' ? 0.45 : 1,
                borderColor: g?.blocked
                  ? '#6b2a2a'
                  : late
                    ? '#6b3a24'
                    : b.status === 'ARRIVED'
                      ? '#31513f'
                      : undefined,
                background: g?.blocked
                  ? '#2a1818'
                  : late
                    ? '#271e19'
                    : b.status === 'ARRIVED'
                      ? '#1c2620'
                      : undefined,
              }}
            >
              <div className="amme-mono" style={{ fontSize: 16, color: 'var(--amme-sage)' }}>
                {hhmm(b.at)}
              </div>
              <div>
                <div
                  style={{
                    fontFamily: 'var(--amme-display)',
                    fontSize: 17,
                    textDecoration: b.status === 'NOSHOW' ? 'line-through' : undefined,
                    display: 'flex',
                    gap: 8,
                    alignItems: 'center',
                    flexWrap: 'wrap',
                  }}
                >
                  {b.name}
                  {g?.vip ? <span className="amme-pill vip">VIP</span> : null}
                  {g && g.visitCount >= 2 ? (
                    <span className="amme-pill">{g.visitCount}×</span>
                  ) : null}
                  {g?.blocked ? <span className="amme-pill bad">осторожно</span> : null}
                </div>
                <div
                  className="amme-mono"
                  style={{ fontSize: 11.5, color: 'var(--amme-dim)', display: 'flex', gap: 8, flexWrap: 'wrap' }}
                >
                  <span>{b.guests} чел.</span>
                  <button type="button" onClick={() => props.onToggle(b.id)} disabled={b.status !== 'WAITING'}>
                    {b.banya ? 'баня' : 'кухня'}
                  </button>
                  {b.phone ? <span>{b.phone}</span> : null}
                  {g?.notes ? <span title={g.notes}>📝 заметка</span> : null}
                  {late ? <span style={{ color: 'var(--amme-ember)' }}>опоздание</span> : null}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {b.status === 'WAITING' ? (
                  <>
                    <button className="amme-jade" type="button" onClick={() => props.onArrive(b.id)}>
                      Пришёл
                    </button>
                    <button className="amme-ghost" type="button" onClick={() => props.onNoshow(b.id)}>
                      Не пришёл
                    </button>
                  </>
                ) : null}
                {b.status === 'ARRIVED' && b.visitId ? (
                  <button className="amme-ghost" type="button" onClick={() => props.onOpenVisit(b.visitId!)}>
                    К счёту
                  </button>
                ) : null}
                {b.status === 'NOSHOW' ? (
                  <button className="amme-ghost" type="button" onClick={() => props.onUnmark(b.id)}>
                    Вернуть
                  </button>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>

      <div className="amme-card amme-no-print" style={{ maxWidth: 860 }}>
        <h3 style={{ fontFamily: 'var(--amme-display)', margin: '0 0 4px', fontWeight: 500 }}>Импорт списка</h3>
        <p style={{ margin: '0 0 10px', fontSize: 12.5, color: 'var(--amme-dim)' }}>
          Вставьте текст. Обязательно время (10:00). Распознаются телефон, число гостей и «баня».
        </p>
        <textarea
          rows={4}
          value={props.importText}
          onChange={(e) => props.setImportText(e.target.value)}
          placeholder={'10:00 Игорь 2 чел баня +62…\n11:30 Настя x3'}
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <button className="amme-ghost" type="button" onClick={() => props.onImport('append')}>
            Добавить
          </button>
          <button className="amme-ghost" type="button" onClick={() => props.onImport('replace')}>
            Заменить ожидающих
          </button>
        </div>
      </div>
    </>
  )
}

function Guests(props: {
  visits: Visit[]
  banyaLive: Visit[]
  banyaPrice: number
  menu: MenuItem[]
  activeVisit: Visit | null
  activeTab: Tab | null
  selLines: Set<string>
  sendLeft: number
  walkOpen: boolean
  wName: string
  wPhone: string
  wGuests: number
  wBanya: boolean
  setWalkOpen: (v: boolean) => void
  setWName: (v: string) => void
  setWPhone: (v: string) => void
  setWGuests: (n: number | ((x: number) => number)) => void
  setWBanya: (v: boolean) => void
  guestsById: Map<string, GuestCard>
  onOpenCrm: (guestId: string) => void
  onSelectVisit: (id: string) => void
  onSelectTab: (id: string) => void
  onDish: (code: string) => void
  onBump: (lineId: string, delta: number) => void
  onToggleLine: (id: string) => void
  onSendNow: () => void
  onPay: () => void
  onClose: () => void
  onEndBanya: (id: string) => void
  onNewTab: () => void
  onMoveTo: (tabId: string) => void
  onWalkin: () => void
}) {
  const bPeople = props.banyaLive.reduce((s, v) => s + v.guests, 0)
  return (
    <>
      <div
        className="amme-card"
        style={{
          display: 'flex',
          gap: 16,
          alignItems: 'center',
          flexWrap: 'wrap',
          marginBottom: 16,
          borderColor: bPeople ? '#6b3a24' : undefined,
          background: bPeople ? 'linear-gradient(90deg,#2a1e18,#1e2325 60%)' : undefined,
        }}
      >
        <div>
          <div className="amme-eyebrow" style={{ margin: 0 }}>
            Баня сейчас
          </div>
          <div style={{ fontFamily: 'var(--amme-display)', fontSize: 20 }}>
            {bPeople ? props.banyaLive.map((v) => v.name).join(', ') : 'пусто'}
          </div>
        </div>
        <div className="amme-mono" style={{ color: 'var(--amme-ember)' }}>
          {formatIdr(bPeople * props.banyaPrice)} Rp
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {props.banyaLive.map((v) => (
            <button key={v.id} className="amme-ghost" type="button" onClick={() => props.onEndBanya(v.id)}>
              Завершить · {v.name}
            </button>
          ))}
        </div>
      </div>

      <div className="amme-split">
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <p className="amme-eyebrow" style={{ margin: 0 }}>
              Гости в зале
            </p>
            <button className="amme-ghost amme-no-print" type="button" onClick={() => props.setWalkOpen(true)}>
              + гость без записи
            </button>
          </div>

          {props.walkOpen ? (
            <div className="amme-card amme-no-print" style={{ marginBottom: 12 }}>
              <div className="amme-field">
                <label>Имя</label>
                <input value={props.wName} onChange={(e) => props.setWName(e.target.value)} />
              </div>
              <div className="amme-field">
                <label>Телефон (для CRM)</label>
                <input
                  value={props.wPhone}
                  onChange={(e) => props.setWPhone(e.target.value)}
                  placeholder="+62…"
                />
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                <button className="amme-ghost" type="button" onClick={() => props.setWGuests((n) => Math.max(1, n - 1))}>
                  −
                </button>
                <span className="amme-mono">{props.wGuests}</span>
                <button className="amme-ghost" type="button" onClick={() => props.setWGuests((n) => n + 1)}>
                  +
                </button>
                <button
                  type="button"
                  className={props.wBanya ? 'amme-jade' : 'amme-ghost'}
                  onClick={() => props.setWBanya(!props.wBanya)}
                >
                  {props.wBanya ? 'баня' : 'только кухня'}
                </button>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="amme-primary" type="button" onClick={props.onWalkin}>
                  Открыть визит
                </button>
                <button className="amme-ghost" type="button" onClick={() => props.setWalkOpen(false)}>
                  Отмена
                </button>
              </div>
            </div>
          ) : null}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))',
              gap: 10,
              marginBottom: 18,
            }}
          >
            {props.visits.length === 0 ? (
              <div className="amme-card" style={{ color: 'var(--amme-dim)' }}>
                Нет активных гостей.
              </div>
            ) : null}
            {props.visits.map((v) => {
              const hot = v.tabs.some((t) => t.lines.some((l) => l.status === 'SENT'))
              const unpaid = v.tabs.some((t) => !t.paidAt && !t.closedAt)
              const g = v.guestId ? props.guestsById.get(v.guestId) : undefined
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => props.onSelectVisit(v.id)}
                  className="amme-card"
                  style={{
                    textAlign: 'left',
                    borderColor: g?.blocked
                      ? '#6b2a2a'
                      : props.activeVisit?.id === v.id
                        ? 'var(--amme-sage)'
                        : undefined,
                    background: props.activeVisit?.id === v.id ? 'var(--amme-panel-2)' : undefined,
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--amme-display)',
                      fontSize: 17,
                      display: 'flex',
                      gap: 6,
                      flexWrap: 'wrap',
                      alignItems: 'center',
                    }}
                  >
                    {v.name}
                    {g?.vip ? <span className="amme-pill vip">VIP</span> : null}
                    {g && g.visitCount >= 2 ? <span className="amme-pill">{g.visitCount}×</span> : null}
                  </div>
                  <div className="amme-mono" style={{ fontSize: 11.5, color: 'var(--amme-dim)', marginTop: 3 }}>
                    {v.guests} чел. · {v.banya ? 'баня' : 'кухня'}
                    {hot ? ' · кухня' : ''}
                    {g?.notes ? ' · 📝' : ''}
                  </div>
                  <div
                    className="amme-mono"
                    style={{ marginTop: 8, color: unpaid ? 'var(--amme-ember)' : 'var(--amme-sage)' }}
                  >
                    {formatIdr(visitSum(v))} Rp
                  </div>
                </button>
              )
            })}
          </div>

          <div
            className="amme-card"
            style={{
              background: 'radial-gradient(120% 140% at 30% 0%,#232a2c,#191e20)',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--amme-display)',
                fontSize: 15,
                letterSpacing: '0.1em',
                textAlign: 'center',
                margin: '0 0 14px',
              }}
            >
              MENU
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
              {AMME_MENU_CATEGORIES.map((cat) => {
                const items = props.menu.filter((m) => m.category === cat)
                if (items.length === 0) return null
                return (
                  <div key={cat}>
                    <h4
                      style={{
                        fontFamily: 'var(--amme-display)',
                        fontSize: 12,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        margin: '0 0 8px',
                        paddingBottom: 5,
                        borderBottom: '1px solid #46504f',
                      }}
                    >
                      {cat}
                    </h4>
                    <div style={{ display: 'grid', gap: 3 }}>
                      {items.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          disabled={!props.activeTab}
                          onClick={() => props.onDish(m.code)}
                          style={{
                            display: 'flex',
                            gap: 8,
                            alignItems: 'baseline',
                            padding: '6px 8px',
                            borderRadius: 2,
                            textAlign: 'left',
                            width: '100%',
                          }}
                        >
                          <span style={{ flex: 1 }}>{m.name}</span>
                          {m.vegFlag ? (
                            <span style={{ fontSize: 11, color: 'var(--amme-sage)' }}>{m.vegFlag}</span>
                          ) : null}
                          <span className="amme-mono" style={{ fontSize: 12, color: 'var(--amme-dim)' }}>
                            {formatIdr(m.price / 1000)}k
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <Receipt
          visit={props.activeVisit}
          guest={
            props.activeVisit?.guestId
              ? props.guestsById.get(props.activeVisit.guestId) || null
              : null
          }
          onOpenCrm={props.onOpenCrm}
          tab={props.activeTab}
          selLines={props.selLines}
          sendLeft={props.sendLeft}
          onSelectTab={props.onSelectTab}
          onBump={props.onBump}
          onToggleLine={props.onToggleLine}
          onSendNow={props.onSendNow}
          onPay={props.onPay}
          onClose={props.onClose}
          onNewTab={props.onNewTab}
          onMoveTo={props.onMoveTo}
        />
      </div>
    </>
  )
}

function Receipt(props: {
  visit: Visit | null
  guest: GuestCard | null
  onOpenCrm: (guestId: string) => void
  tab: Tab | null
  selLines: Set<string>
  sendLeft: number
  onSelectTab: (id: string) => void
  onBump: (lineId: string, delta: number) => void
  onToggleLine: (id: string) => void
  onSendNow: () => void
  onPay: () => void
  onClose: () => void
  onNewTab: () => void
  onMoveTo: (tabId: string) => void
}) {
  if (!props.visit || !props.tab) {
    return (
      <div
        style={{
          background: '#f3eee4',
          color: '#7a6f63',
          borderRadius: 2,
          padding: 28,
          textAlign: 'center',
          fontFamily: 'var(--amme-mono)',
          fontSize: 12.5,
        }}
      >
        Выберите гостя слева
      </div>
    )
  }

  const lines = props.tab.lines
  const total = tabSum(props.tab)
  const otherTabs = props.visit.tabs.filter((t) => t.id !== props.tab!.id && !t.closedAt)

  return (
    <div
      style={{
        background: '#f3eee4',
        color: '#241f1b',
        borderRadius: 2,
        fontFamily: 'var(--amme-mono)',
        fontSize: 13,
        boxShadow: '0 18px 40px rgba(0,0,0,.5)',
        padding: '20px 18px',
      }}
    >
      <div style={{ textAlign: 'center', borderBottom: '1px dashed #b8ae9e', paddingBottom: 11 }}>
        <div style={{ fontFamily: 'var(--amme-display)', fontWeight: 700, fontSize: 17, letterSpacing: '0.08em' }}>
          AMMÉ
        </div>
        <div style={{ fontSize: 11, color: '#6a6055', marginTop: 3, letterSpacing: '0.08em' }}>СЧЁТ</div>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '10px 0',
          borderBottom: '1px dashed #b8ae9e',
        }}
      >
        <b style={{ fontWeight: 500 }}>{props.visit.name}</b>
        <span>{props.visit.guests} чел.</span>
      </div>

      {props.guest ? (
        <div
          className="amme-no-print"
          style={{
            marginTop: 8,
            padding: '8px 10px',
            background: props.guest.blocked ? '#f3d9d2' : '#e8e2d6',
            borderRadius: 4,
            fontSize: 11.5,
            color: '#3a322c',
          }}
        >
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            {props.guest.vip ? <span className="amme-pill vip">VIP</span> : null}
            <span>{props.guest.visitCount} виз.</span>
            <span>LTV {formatIdr(props.guest.lifetimeSpend)}</span>
            {props.guest.dietary ? <span>диета: {props.guest.dietary}</span> : null}
            <button
              type="button"
              style={{ marginLeft: 'auto', textDecoration: 'underline', color: '#5a4f45' }}
              onClick={() => props.onOpenCrm(props.guest!.id)}
            >
              CRM →
            </button>
          </div>
          {props.guest.notes || props.guest.preferences || props.guest.blocked ? (
            <div style={{ marginTop: 4 }}>
              {props.guest.blocked ? '⚠ Осторожно. ' : ''}
              {props.guest.notes || props.guest.preferences}
            </div>
          ) : null}
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: 5, paddingTop: 9, flexWrap: 'wrap' }}>
        {props.visit.tabs.map((t, i) => (
          <button
            key={t.id}
            type="button"
            onClick={() => props.onSelectTab(t.id)}
            style={{
              padding: '3px 9px',
              border: '1px solid #c3b8a6',
              borderRadius: 2,
              fontSize: 11,
              background: t.id === props.tab!.id ? '#241f1b' : 'transparent',
              color: t.id === props.tab!.id ? '#f3eee4' : '#5c5247',
            }}
          >
            {t.label || `Счёт ${i + 1}`}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 11, paddingTop: 11, borderTop: '1px dashed #b8ae9e' }}>
        {lines.length === 0 ? (
          <div style={{ padding: '20px 0', textAlign: 'center', color: '#7a6f63' }}>
            Пусто, ткните блюдо в меню
          </div>
        ) : (
          lines.map((l) => (
            <div
              key={l.id}
              style={{
                display: 'flex',
                gap: 8,
                alignItems: 'flex-start',
                padding: '5px 0',
                background: props.selLines.has(l.id) ? '#e6dece' : undefined,
              }}
            >
              <button
                type="button"
                onClick={() => props.onToggleLine(l.id)}
                style={{
                  width: 20,
                  height: 20,
                  border: '1px solid #b8ae9e',
                  borderRadius: 2,
                  background: props.selLines.has(l.id) ? '#241f1b' : '#fbf8f2',
                  color: props.selLines.has(l.id) ? '#f3eee4' : 'transparent',
                  fontSize: 12,
                }}
              >
                ✓
              </button>
              <div style={{ flex: 1 }}>
                <span>
                  {l.name} ×{l.qty}
                </span>
                <span
                  style={{
                    marginLeft: 6,
                    fontSize: 9.5,
                    textTransform: 'uppercase',
                    padding: '1px 4px',
                    borderRadius: 2,
                    background:
                      l.status === 'DRAFT' ? '#d9cfbd' : l.status === 'SENT' ? '#e2542a' : '#3e6b57',
                    color: l.status === 'DRAFT' ? '#5c5247' : '#fff',
                  }}
                >
                  {l.status}
                </span>
              </div>
              <span>{formatIdr(l.qty * l.price)}</span>
              {l.status === 'DRAFT' ? (
                <span style={{ display: 'flex', gap: 2 }}>
                  <button
                    type="button"
                    onClick={() => props.onBump(l.id, -1)}
                    style={{ width: 20, height: 20, border: '1px solid #cdc2b0', borderRadius: 2 }}
                  >
                    −
                  </button>
                  <button
                    type="button"
                    onClick={() => props.onBump(l.id, 1)}
                    style={{ width: 20, height: 20, border: '1px solid #cdc2b0', borderRadius: 2 }}
                  >
                    +
                  </button>
                </span>
              ) : null}
            </div>
          ))
        )}
      </div>

      {props.selLines.size > 0 ? (
        <div style={{ marginTop: 11, padding: 10, background: '#241f1b', color: '#f3eee4', borderRadius: 2 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#b3a692' }}>
            Выбрано {props.selLines.size}
          </div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 7 }}>
            <button
              type="button"
              onClick={props.onNewTab}
              style={{ padding: '6px 10px', border: '1px solid #e2542a', background: '#e2542a', borderRadius: 2 }}
            >
              В новый счёт
            </button>
            {otherTabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => props.onMoveTo(t.id)}
                style={{ padding: '6px 10px', border: '1px solid #6a6055', borderRadius: 2 }}
              >
                → {t.label || 'счёт'}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {props.sendLeft > 0 ? (
        <div
          style={{
            marginTop: 12,
            padding: '9px 11px',
            background: '#241f1b',
            color: '#f3eee4',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 11.5,
            borderRadius: 2,
          }}
        >
          <span>На кухню через {props.sendLeft}с</span>
          <button type="button" onClick={props.onSendNow} style={{ color: '#d8c48f', textDecoration: 'underline' }}>
            Сейчас
          </button>
        </div>
      ) : null}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 12,
          paddingTop: 11,
          borderTop: '1px solid #241f1b',
          fontSize: 15,
          fontWeight: 500,
        }}
      >
        <span>Итого</span>
        <span>{formatIdr(total)} Rp</span>
      </div>

      <div style={{ marginTop: 14, display: 'grid', gap: 6 }}>
        <button
          type="button"
          onClick={props.onPay}
          disabled={!!props.tab.paidAt}
          style={{
            padding: 10,
            borderRadius: 2,
            background: props.tab.paidAt ? '#3e6b57' : '#241f1b',
            color: '#f3eee4',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontSize: 12,
          }}
        >
          {props.tab.paidAt ? 'Оплачено' : 'Оплатить'}
        </button>
        <button
          type="button"
          onClick={props.onClose}
          style={{
            padding: 10,
            borderRadius: 2,
            border: '1px solid #c3b8a6',
            color: '#5c5247',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontSize: 12,
          }}
        >
          Закрыть счёт
        </button>
      </div>
    </div>
  )
}

function Kitchen({ lines, onDone }: { lines: KitchenLine[]; onDone: (id: string) => void }) {
  const open = lines.filter((l) => l.status === 'SENT')
  const done = lines.filter((l) => l.status === 'DONE').slice(-12)

  const urgencyStyle = (mins: number) => {
    const u = kitchenUrgency(mins)
    if (u === 'hot') return { borderColor: 'var(--amme-ember)', timerColor: 'var(--amme-ember)' }
    if (u === 'warn') return { borderColor: 'var(--amme-gold)', timerColor: 'var(--amme-gold)' }
    return { borderColor: 'var(--amme-line)', timerColor: 'var(--amme-dim)' }
  }

  return (
    <>
      <p className="amme-eyebrow">Кухня · тикеты</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 12 }}>
        {open.length === 0 ? (
          <div className="amme-card" style={{ color: 'var(--amme-dim)' }}>
            Очередь пуста
          </div>
        ) : null}
        {open.map((l) => {
          const mins = l.sentAt ? Math.floor((Date.now() - new Date(l.sentAt).getTime()) / 60000) : 0
          const style = urgencyStyle(mins)
          return (
            <div
              key={l.id}
              className="amme-card"
              style={{ borderColor: style.borderColor, overflow: 'hidden', padding: 0 }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 13px',
                  background: 'var(--amme-panel-2)',
                  borderBottom: '1px solid var(--amme-line)',
                }}
              >
                <span style={{ fontFamily: 'var(--amme-display)', fontSize: 16 }}>{l.guestName}</span>
                <span className="amme-mono" style={{ color: style.timerColor }}>
                  {mins}м
                </span>
              </div>
              <div style={{ padding: 13 }}>
                <div style={{ fontSize: 16, marginBottom: 12 }}>
                  {l.qty}× {l.name}
                </div>
                <button className="amme-jade" type="button" onClick={() => onDone(l.id)} style={{ width: '100%' }}>
                  Отдано
                </button>
              </div>
            </div>
          )
        })}
      </div>
      {done.length ? (
        <>
          <p className="amme-eyebrow" style={{ marginTop: 22 }}>
            Недавно отдано
          </p>
          <div className="amme-card" style={{ color: 'var(--amme-dim)', fontSize: 13 }}>
            {done.map((l) => (
              <div key={l.id} style={{ padding: '4px 0' }}>
                {l.guestName}: {l.qty}× {l.name}
              </div>
            ))}
          </div>
        </>
      ) : null}
    </>
  )
}

function ReportView({
  report,
  banyaPrice,
  reportRange,
  setReportRange,
  customFrom,
  setCustomFrom,
  customTo,
  setCustomTo,
  onRefresh,
}: {
  report: Report | null
  banyaPrice: number
  reportRange: ReportRange
  setReportRange: (r: ReportRange) => void
  customFrom: string
  setCustomFrom: (v: string) => void
  customTo: string
  setCustomTo: (v: string) => void
  onRefresh: () => void
}) {
  if (!report) {
    return <p className="amme-eyebrow">Считаем отчёт…</p>
  }

  const maxTop = report.top[0]?.[1] || 1
  const maxDaily = Math.max(...report.daily.map((d) => d.rev), 1)
  const maxHourly = Math.max(...report.hourly.map((h) => h.tabs), 1)
  const noshowPct = report.bkAll ? Math.round((report.bkNo / report.bkAll) * 100) : 0

  return (
    <>
      <div
        className="amme-no-print"
        style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 16 }}
      >
        <p className="amme-eyebrow" style={{ margin: 0 }}>
          Итоги · {report.rangeLabel}
        </p>
        <div className="amme-seg">
          {(
            [
              ['today', 'Сегодня'],
              ['7d', '7 дней'],
              ['30d', '30 дней'],
              ['custom', 'Свой'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={reportRange === id ? 'on' : ''}
              onClick={() => setReportRange(id)}
            >
              {label}
            </button>
          ))}
        </div>
        {reportRange === 'custom' ? (
          <>
            <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} style={{ width: 140 }} />
            <span className="amme-mono" style={{ color: 'var(--amme-dim)' }}>
              →
            </span>
            <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} style={{ width: 140 }} />
            <button className="amme-ghost" type="button" onClick={onRefresh}>
              Применить
            </button>
          </>
        ) : null}
        <button className="amme-primary" type="button" onClick={() => window.print()} style={{ marginLeft: 'auto' }}>
          Печать
        </button>
      </div>

      <div className="amme-kpis">
        <div className="amme-kpi">
          <div className="kl">Выручка</div>
          <div className="kv">
            {formatIdr(report.rev / 1000)}
            <small>тыс Rp</small>
          </div>
        </div>
        <div className="amme-kpi">
          <div className="kl">Средний чек</div>
          <div className="kv">
            {formatIdr(report.avg / 1000)}
            <small>тыс</small>
          </div>
        </div>
        <div className="amme-kpi">
          <div className="kl">Доля еды</div>
          <div className="kv">
            {report.foodShare}
            <small>%</small>
          </div>
        </div>
        <div className="amme-kpi">
          <div className="kl">Доля бани</div>
          <div className="kv">
            {report.banyaShare}
            <small>%</small>
          </div>
        </div>
        <div className="amme-kpi">
          <div className="kl">Еда на гостя бани</div>
          <div className="kv">
            {formatIdr(report.perGuest / 1000)}
            <small>тыс</small>
          </div>
        </div>
        <div className="amme-kpi">
          <div className="kl">Неявки</div>
          <div className="kv">
            {noshowPct}
            <small>
              % · {report.bkNo}/{report.bkAll}
            </small>
          </div>
        </div>
        <div className="amme-kpi">
          <div className="kl">Обслужено гостей</div>
          <div className="kv">{report.guestsServed}</div>
        </div>
      </div>

      <div className="amme-split" style={{ gridTemplateColumns: 'minmax(0,1.2fr) minmax(0,1fr)', marginBottom: 18 }}>
        <div className="amme-card">
          <p className="amme-eyebrow">Выручка по дням</p>
          {report.daily.length === 0 ? (
            <p style={{ color: 'var(--amme-dim)', margin: 0 }}>Нет оплаченных счетов за период.</p>
          ) : (
            <div className="amme-day-chart">
              {report.daily.map((d) => (
                <div key={d.day} className="col" title={`${d.day}: ${formatIdr(d.rev)} Rp`}>
                  <div
                    className="stem"
                    style={{ height: `${Math.max(4, (d.rev / maxDaily) * 100)}px` }}
                  />
                  <div className="lbl">{d.day.slice(5)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="amme-card">
          <p className="amme-eyebrow">Счета по часам</p>
          <div className="amme-day-chart" style={{ minHeight: 100 }}>
            {report.hourly
              .filter((h) => h.tabs > 0)
              .map((h) => (
                <div key={h.hour} className="col" title={`${h.hour}:00, ${h.tabs} сч.`}>
                  <div
                    className="stem"
                    style={{
                      height: `${Math.max(4, (h.tabs / maxHourly) * 80)}px`,
                      background: 'linear-gradient(180deg, var(--amme-gold), #8a6f45)',
                    }}
                  />
                  <div className="lbl">{h.hour}</div>
                </div>
              ))}
          </div>
        </div>
      </div>

      <p className="amme-eyebrow">Топ позиций</p>
      <div className="amme-card amme-bars" style={{ marginBottom: 18 }}>
        {report.top.length === 0 ? (
          <p style={{ color: 'var(--amme-dim)', margin: 0 }}>Пока нет данных.</p>
        ) : (
          report.top.map(([n, s]) => (
            <div key={n} className="amme-bar-row">
              <span>{n}</span>
              <span className="amme-bar-track">
                <i className={n.startsWith('Баня') ? 'ember' : ''} style={{ width: `${Math.max(2, (s / maxTop) * 100)}%` }} />
              </span>
              <span className="amme-mono" style={{ textAlign: 'right' }}>
                {formatIdr(s / 1000)} тыс
              </span>
            </div>
          ))
        )}
      </div>

      <p className="amme-eyebrow">Журнал за период</p>
      <div className="amme-card" style={{ marginBottom: 14 }}>
        {report.audits.length === 0 ? (
          <p style={{ color: 'var(--amme-dim)', margin: 0 }}>Событий нет.</p>
        ) : (
          report.audits.map((a) => (
            <div
              key={a.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '120px 1fr auto',
                gap: 10,
                padding: '8px 0',
                borderBottom: '1px solid var(--amme-line)',
                fontSize: 13,
              }}
            >
              <span className="amme-mono" style={{ color: 'var(--amme-sage)' }}>
                {a.action}
              </span>
              <span style={{ color: 'var(--amme-dim)' }}>{a.detail || '—'}</span>
              <span className="amme-mono" style={{ fontSize: 11, color: 'var(--amme-mute)' }}>
                {auditTime(a.createdAt)}
              </span>
            </div>
          ))
        )}
      </div>

      <p style={{ fontSize: 12, color: 'var(--amme-dim)' }}>
        Баня: {formatIdr(banyaPrice)} Rp с человека за сеанс. Оплачено счетов: {report.tabsPaid}, визитов:{' '}
        {report.visitsPaid}.
      </p>
    </>
  )
}

function MenuEditor({
  menu,
  onSave,
}: {
  menu: MenuItem[]
  onSave: (code: string, patch: { name?: string; price?: number; active?: boolean }) => void
}) {
  const [drafts, setDrafts] = useState<Record<string, { name: string; price: string }>>({})

  useEffect(() => {
    const next: Record<string, { name: string; price: string }> = {}
    for (const m of menu) {
      next[m.code] = { name: m.name, price: String(m.price) }
    }
    setDrafts(next)
  }, [menu])

  return (
    <>
      <p className="amme-eyebrow">Редактор меню</p>
      <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--amme-dim)' }}>
        Изменение цены не пересчитывает старые счета. Выключенные позиции скрыты с доски заказа.
      </p>
      <div style={{ display: 'grid', gap: 10, maxWidth: 720 }}>
        {menu.map((m) => {
          const d = drafts[m.code] || { name: m.name, price: String(m.price) }
          return (
            <div
              key={m.id}
              className="amme-card"
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0,1fr) 120px auto',
                gap: 12,
                alignItems: 'end',
                opacity: m.active ? 1 : 0.55,
              }}
            >
              <div className="amme-field" style={{ margin: 0 }}>
                <label>
                  {m.code} · {m.category}
                </label>
                <input
                  value={d.name}
                  onChange={(e) =>
                    setDrafts((prev) => ({ ...prev, [m.code]: { ...d, name: e.target.value } }))
                  }
                />
              </div>
              <div className="amme-field" style={{ margin: 0 }}>
                <label>Цена Rp</label>
                <input
                  value={d.price}
                  inputMode="numeric"
                  onChange={(e) =>
                    setDrafts((prev) => ({ ...prev, [m.code]: { ...d, price: e.target.value } }))
                  }
                />
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button
                  className="amme-ghost"
                  type="button"
                  onClick={() => {
                    const price = Math.round(Number(d.price))
                    if (!d.name.trim() || !Number.isFinite(price)) return
                    onSave(m.code, { name: d.name.trim(), price })
                  }}
                >
                  Сохранить
                </button>
                <button
                  className={m.active ? 'amme-ghost' : 'amme-jade'}
                  type="button"
                  onClick={() => onSave(m.code, { active: !m.active })}
                >
                  {m.active ? 'Выключить' : 'Включить'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

function KnowledgeView({
  selArticle,
  setSelArticle,
  article,
}: {
  selArticle: string
  setSelArticle: (id: string) => void
  article: (typeof KNOWLEDGE_ARTICLES)[number] | undefined
}) {
  if (!article) return null

  return (
    <div className="amme-kb-grid">
      <div>
        {KNOWLEDGE_CATEGORIES.map((cat) => {
          const items = KNOWLEDGE_ARTICLES.filter((a) => a.category === cat)
          if (items.length === 0) return null
          return (
            <div key={cat} style={{ marginBottom: 16 }}>
              <p className="amme-eyebrow">{cat}</p>
              <div className="amme-kb-list">
                {items.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    className={selArticle === a.id ? 'on' : ''}
                    onClick={() => setSelArticle(a.id)}
                  >
                    <div className="cat">{a.minutes} мин</div>
                    <div style={{ fontWeight: 600 }}>{a.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--amme-dim)', marginTop: 4 }}>{a.summary}</div>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="amme-card amme-kb-article">
        <p className="amme-eyebrow">{article.category}</p>
        <h2>{article.title}</h2>
        <p style={{ color: 'var(--amme-dim)', margin: '0 0 16px' }}>{article.summary}</p>
        <ol>
          {article.body.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </div>
    </div>
  )
}
