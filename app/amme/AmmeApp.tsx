'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AMME_MENU_CATEGORIES, SEND_DELAY_SEC } from '@/lib/amme/menu'
import { formatIdr } from '@/lib/amme/money'
import { KNOWLEDGE_ARTICLES, KNOWLEDGE_CATEGORIES } from '@/lib/amme/knowledge'
import { KNOWLEDGE_ARTICLES_EN, KNOWLEDGE_CATEGORY_EN } from '@/lib/amme/knowledge-en'
import CrmView, { type GuestCard } from '@/app/amme/CrmView'
import ManagementView from '@/app/amme/ManagementView'
import LanguageSwitcher from '@/app/amme/components/LanguageSwitcher'
import { KpiCard } from '@/app/amme/components/ui'
import { useI18n, type TranslationKey } from '@/app/amme/i18n'

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
  station: string
  priority: number
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

type View =
  | 'dash'
  | 'book'
  | 'guests'
  | 'crm'
  | 'kitchen'
  | 'report'
  | 'manage'
  | 'menu'
  | 'knowledge'

const VIEW_META: Record<View, { label: TranslationKey; hint: TranslationKey; ico: string }> = {
  dash: { label: 'sidebar.dashboard', hint: 'sidebar.dashboardHint', ico: '◆' },
  book: { label: 'sidebar.bookings', hint: 'sidebar.bookingsHint', ico: '☰' },
  guests: { label: 'sidebar.bills', hint: 'sidebar.billsHint', ico: '◎' },
  crm: { label: 'sidebar.crm', hint: 'sidebar.crmHint', ico: '◈' },
  kitchen: { label: 'sidebar.kitchen', hint: 'sidebar.kitchenHint', ico: '▣' },
  report: { label: 'sidebar.reports', hint: 'sidebar.reportsHint', ico: '▤' },
  manage: { label: 'sidebar.management', hint: 'sidebar.managementHint', ico: '⬡' },
  menu: { label: 'sidebar.menu', hint: 'sidebar.menuHint', ico: '≡' },
  knowledge: { label: 'sidebar.knowledge', hint: 'sidebar.knowledgeHint', ico: '?' },
}

const ROLE_LABEL: Record<StaffRole, TranslationKey> = {
  ADMIN: 'role.admin',
  KITCHEN: 'role.kitchen',
  OWNER: 'role.owner',
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

function useNow(interval = 15_000) {
  const [now, setNow] = useState(0)
  useEffect(() => {
    const first = setTimeout(() => setNow(Date.now()), 0)
    const timer = setInterval(() => setNow(Date.now()), interval)
    return () => {
      clearTimeout(first)
      clearInterval(timer)
    }
  }, [interval])
  return now
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
  const { t } = useI18n()
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
      showToast(data.error || t('app.loadError'), true)
      return
    }
    setState(pickState(data))
  }, [day, router, showToast, t])

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
    const interval = view === 'kitchen' ? 4_000 : 15_000
    const t = setInterval(() => {
      void load()
      void loadDashReport()
      if (view === 'report') void loadReport()
    }, interval)
    return () => clearInterval(t)
  }, [load, loadDashReport, loadReport, view])

  useEffect(() => {
    if (view !== 'kitchen') return
    const source = new EventSource('/api/amme/events')
    const refresh = () => void load()
    source.addEventListener('send_kitchen', refresh)
    source.addEventListener('line_done', refresh)
    source.addEventListener('line_qty_changed', refresh)
    return () => source.close()
  }, [load, view])

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
          showToast(data.error || t('common.operationFailed'), true)
          return false
        }
        setState(pickState(data))
        void loadDashReport()
        if (view === 'report') void loadReport()
        if (successMsg) showToast(successMsg)
        return true
      } catch {
        showToast(t('app.networkError'), true)
        return false
      } finally {
        setBusy(false)
      }
    },
    [day, loadDashReport, loadReport, showToast, t, view]
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
  const openVisits = useMemo(() => state?.visits || [], [state?.visits])
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
            <p className="amme-eyebrow">{t('app.loading')}</p>
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
          <div className="sub">AMMÉ · {t('app.tagline')}</div>
        </div>

        <nav className="amme-side-nav">
          {(Object.keys(VIEW_META) as View[])
            .filter((id) => {
              if (user.staffRole === 'KITCHEN') return id === 'dash' || id === 'kitchen' || id === 'knowledge'
              if (user.staffRole === 'ADMIN') return id !== 'menu'
              return true
            })
            .map((id) => {
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
                aria-current={view === id ? 'page' : undefined}
                onClick={() => setView(id)}
              >
                <span className="ico">{m.ico}</span>
                {t(m.label)}
                {badge != null ? <span className="badge">{badge}</span> : null}
              </button>
            )
          })}
        </nav>

        <div className="amme-side-foot">
          <div className="amme-user-chip">
            <div className="nm">{user.name || user.email}</div>
            <div className="em">
              {user.email} · {t(ROLE_LABEL[user.staffRole])}
            </div>
          </div>
          <button className="amme-ghost" type="button" onClick={() => void logout()}>
            {t('common.actions.logout')}
          </button>
        </div>
      </aside>

      <div className="amme-workspace">
        <header className="amme-topbar amme-no-print">
          <div>
            <h1>{t(meta.label)}</h1>
            <div className="hint">{t(meta.hint)}</div>
          </div>

          <div className="amme-top-actions">
            <LanguageSwitcher />
            <button className="amme-ghost amme-mobile-logout" type="button" onClick={() => void logout()}>
              {t('common.actions.logout')}
            </button>
            <div className="amme-field" style={{ margin: 0, width: 148 }}>
              <label>{t('common.shiftDate')}</label>
              <input type="date" value={day} onChange={(e) => setDay(e.target.value)} />
            </div>
            {(view === 'book' || view === 'guests' || view === 'dash') && (
              <div className="amme-field" style={{ margin: 0, width: 180 }}>
                <label>{t('common.actions.search')}</label>
                <input
                  type="search"
                  placeholder={t('bookings.guestName')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            )}
          </div>
        </header>

        <main className="amme-main" style={{ opacity: busy ? 0.65 : 1 }}>
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
                void act({ type: 'import', text: importText, mode }, t('bookings.imported')).then(
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
                  t('bookings.created')
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
                activeTab && void act({ type: 'pay', tabId: activeTab.id }, t('bills.paymentRecorded'))
              }
              onClose={() =>
                activeTab && void act({ type: 'close', tabId: activeTab.id }, t('bills.closed'))
              }
              onEndBanya={(id) => void act({ type: 'end_banya', visitId: id }, t('bills.banyaEnded'))}
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
                  t('bills.visitOpened')
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

          {view === 'manage' ? <ManagementView day={day} onToast={showToast} /> : null}

          {view === 'menu' ? (
            <MenuEditor
              menu={state.menu}
              onSave={(code, patch) =>
                void act({ type: 'menu_update', menuCode: code, ...patch }, t('menu.updated'))
              }
            />
          ) : null}

          {view === 'knowledge' ? (
            <KnowledgeView selArticle={selArticle} setSelArticle={setSelArticle} article={article} />
          ) : null}
        </main>
      </div>

      {toast ? (
        <div
          className={`amme-toast ${toast.err ? 'err' : ''}`}
          role={toast.err ? 'alert' : 'status'}
          aria-live={toast.err ? 'assertive' : 'polite'}
        >
          {toast.msg}
        </div>
      ) : null}
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
  const { t } = useI18n()
  return (
    <>
      <p className="amme-eyebrow">{t('dashboard.shift', { date: state.day })}</p>
      <div className="amme-kpis">
        <KpiCard label={t('dashboard.revenue7d')} value={formatIdr((report?.rev || 0) / 1000)} suffix={t('common.currencyThousands')} tone="gold" />
        <KpiCard label={t('dashboard.averageBill')} value={formatIdr((report?.avg || 0) / 1000)} suffix={t('common.currencyThousands')} tone="sage" />
        <KpiCard label={t('dashboard.guestsNow')} value={state.visits.length} tone="neutral" />
        <KpiCard label={t('dashboard.inBanya')} value={banyaLive.reduce((s, v) => s + v.guests, 0)} tone="terracotta" />
        <KpiCard label={t('dashboard.waitingBookings')} value={waiting} tone="gold" />
        <KpiCard label={t('dashboard.kitchenQueue')} value={kitchenOpen} tone="sage" />
      </div>

      <div className="amme-no-print" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
        <button className="amme-primary" type="button" onClick={() => onGo('book')}>
          {t('dashboard.openBookings')}
        </button>
        <button className="amme-ghost" type="button" onClick={() => onGo('guests')}>
          {t('dashboard.guestsAndBills')}
        </button>
        <button className="amme-ghost" type="button" onClick={() => onGo('kitchen')}>
          {t('sidebar.kitchen')} {kitchenOpen > 0 ? `(${kitchenOpen})` : ''}
        </button>
        <button className="amme-ghost" type="button" onClick={() => onGo('report')}>
          {t('dashboard.report')}
        </button>
      </div>

      <div className="amme-split" style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)' }}>
        <div className="amme-card">
          <p className="amme-eyebrow">{t('dashboard.activeGuests')}</p>
          {visits.length === 0 ? (
            <p style={{ color: 'var(--amme-dim)', margin: 0 }}>
              {t('dashboard.noActiveGuests')}
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
                      {t('common.people', { count: v.guests })} · {v.banya ? t('dashboard.banyaOnly') : t('dashboard.kitchenOnly')} · {hhmm(v.openedAt)}
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
          <p className="amme-eyebrow">{t('dashboard.shiftLog')}</p>
          {state.audits.length === 0 ? (
            <p style={{ color: 'var(--amme-dim)', margin: 0 }}>{t('dashboard.noEvents')}</p>
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
  const { t } = useI18n()
  const now = useNow()
  return (
    <>
      <div
        className="amme-no-print"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}
      >
        <p className="amme-eyebrow" style={{ margin: 0 }}>
          {t('bookings.title', { date: props.day })}
        </p>
        <button className="amme-primary" type="button" onClick={() => props.setBkOpen(!props.bkOpen)}>
          {t('bookings.addManual')}
        </button>
      </div>

      {props.bkOpen ? (
        <div className="amme-card amme-no-print" style={{ maxWidth: 560, marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 10 }}>
            <div className="amme-field">
              <label>{t('common.time')}</label>
              <input value={props.bkTime} onChange={(e) => props.setBkTime(e.target.value)} placeholder="12:00" />
            </div>
            <div className="amme-field">
              <label>{t('common.name')}</label>
              <input value={props.bkName} onChange={(e) => props.setBkName(e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
            <span className="amme-mono" style={{ fontSize: 12, color: 'var(--amme-dim)' }}>
              {t('common.guests')}
            </span>
            <button className="amme-ghost" type="button" aria-label={t('common.actions.decrease')} onClick={() => props.setBkGuests((n) => Math.max(1, n - 1))}>
              −
            </button>
            <span className="amme-mono">{props.bkGuests}</span>
            <button className="amme-ghost" type="button" aria-label={t('common.actions.increase')} onClick={() => props.setBkGuests((n) => n + 1)}>
              +
            </button>
            <button
              type="button"
              aria-pressed={props.bkBanya}
              className={props.bkBanya ? 'amme-jade' : 'amme-ghost'}
              onClick={() => props.setBkBanya(!props.bkBanya)}
            >
              {props.bkBanya ? t('bookings.banya') : t('bookings.kitchenOnly')}
            </button>
          </div>
          <div className="amme-field">
            <label>{t('common.phone')}</label>
            <input value={props.bkPhone} onChange={(e) => props.setBkPhone(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button className="amme-primary" type="button" onClick={props.onCreate}>
              {t('common.actions.save')}
            </button>
            <button className="amme-ghost" type="button" onClick={() => props.setBkOpen(false)}>
              {t('common.actions.cancel')}
            </button>
          </div>
        </div>
      ) : null}

      <div style={{ display: 'grid', gap: 6, maxWidth: 860, marginBottom: 22 }}>
        {props.bookings.length === 0 ? (
          <div className="amme-card" style={{ color: 'var(--amme-dim)' }}>
            {t('bookings.none')}
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
                  ? 'rgba(216, 102, 89, 0.5)'
                  : late
                    ? 'rgba(201, 105, 75, 0.5)'
                    : b.status === 'ARRIVED'
                      ? 'rgba(120, 145, 122, 0.5)'
                      : undefined,
                background: g?.blocked
                  ? 'rgba(216, 102, 89, 0.08)'
                  : late
                    ? 'rgba(201, 105, 75, 0.08)'
                    : b.status === 'ARRIVED'
                      ? 'rgba(120, 145, 122, 0.08)'
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
                  {g?.blocked ? <span className="amme-pill bad">{t('bookings.caution')}</span> : null}
                </div>
                <div
                  className="amme-mono"
                  style={{ fontSize: 11.5, color: 'var(--amme-dim)', display: 'flex', gap: 8, flexWrap: 'wrap' }}
                >
                  <span>{t('common.people', { count: b.guests })}</span>
                  <button type="button" onClick={() => props.onToggle(b.id)} disabled={b.status !== 'WAITING'}>
                    {b.banya ? t('bookings.banya') : t('bookings.kitchen')}
                  </button>
                  {b.phone ? <span>{b.phone}</span> : null}
                  {g?.notes ? <span title={g.notes}>📝 {t('bookings.note')}</span> : null}
                  {late ? <span style={{ color: 'var(--amme-ember)' }}>{t('bookings.late')}</span> : null}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {b.status === 'WAITING' ? (
                  <>
                    <button className="amme-jade" type="button" onClick={() => props.onArrive(b.id)}>
                      {t('bookings.arrive')}
                    </button>
                    <button className="amme-ghost" type="button" onClick={() => props.onNoshow(b.id)}>
                      {t('bookings.noShow')}
                    </button>
                  </>
                ) : null}
                {b.status === 'ARRIVED' && b.visitId ? (
                  <button className="amme-ghost" type="button" onClick={() => props.onOpenVisit(b.visitId!)}>
                    {t('bookings.toBill')}
                  </button>
                ) : null}
                {b.status === 'NOSHOW' ? (
                  <button className="amme-ghost" type="button" onClick={() => props.onUnmark(b.id)}>
                    {t('bookings.return')}
                  </button>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>

      <div className="amme-card amme-no-print" style={{ maxWidth: 860 }}>
        <h3 style={{ fontFamily: 'var(--amme-display)', margin: '0 0 4px', fontWeight: 500 }}>{t('bookings.importTitle')}</h3>
        <p style={{ margin: '0 0 10px', fontSize: 12.5, color: 'var(--amme-dim)' }}>
          {t('bookings.importHelp')}
        </p>
        <textarea
          rows={4}
          value={props.importText}
          onChange={(e) => props.setImportText(e.target.value)}
          placeholder={t('bookings.importPlaceholder')}
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <button className="amme-ghost" type="button" onClick={() => props.onImport('append')}>
            {t('bookings.importAppend')}
          </button>
          <button className="amme-ghost" type="button" onClick={() => props.onImport('replace')}>
            {t('bookings.importReplace')}
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
  const { t } = useI18n()
  const bPeople = props.banyaLive.reduce((s, v) => s + v.guests, 0)
  return (
    <>
      <div
        className={`amme-card amme-banya-banner ${bPeople ? 'is-live' : ''}`}
        style={{
          display: 'flex',
          gap: 16,
          alignItems: 'center',
          flexWrap: 'wrap',
          marginBottom: 16,
          borderColor: bPeople ? 'rgba(201, 105, 75, 0.38)' : undefined,
        }}
      >
        <div>
          <div className="amme-eyebrow" style={{ margin: 0 }}>
            {t('bills.banyaNow')}
          </div>
          <div style={{ fontFamily: 'var(--amme-display)', fontSize: 20 }}>
            {bPeople ? props.banyaLive.map((v) => v.name).join(', ') : t('bills.banyaEmpty')}
          </div>
        </div>
        <div className="amme-mono" style={{ color: 'var(--amme-ember)' }}>
          {formatIdr(bPeople * props.banyaPrice)} Rp
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {props.banyaLive.map((v) => (
            <button key={v.id} className="amme-ghost" type="button" onClick={() => props.onEndBanya(v.id)}>
              {t('bills.endBanya', { name: v.name })}
            </button>
          ))}
        </div>
      </div>

      <div className="amme-split">
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <p className="amme-eyebrow" style={{ margin: 0 }}>
              {t('bills.guestsInHall')}
            </p>
            <button className="amme-ghost amme-no-print" type="button" onClick={() => props.setWalkOpen(true)}>
              {t('bills.walkIn')}
            </button>
          </div>

          {props.walkOpen ? (
            <div className="amme-card amme-no-print" style={{ marginBottom: 12 }}>
              <div className="amme-field">
                <label>{t('common.name')}</label>
                <input value={props.wName} onChange={(e) => props.setWName(e.target.value)} />
              </div>
              <div className="amme-field">
                <label>{t('bills.walkInPhone')}</label>
                <input
                  value={props.wPhone}
                  onChange={(e) => props.setWPhone(e.target.value)}
                  placeholder="+62…"
                />
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                <button className="amme-ghost" type="button" aria-label={t('common.actions.decrease')} onClick={() => props.setWGuests((n) => Math.max(1, n - 1))}>
                  −
                </button>
                <span className="amme-mono">{props.wGuests}</span>
                <button className="amme-ghost" type="button" aria-label={t('common.actions.increase')} onClick={() => props.setWGuests((n) => n + 1)}>
                  +
                </button>
                <button
                  type="button"
                  aria-pressed={props.wBanya}
                  className={props.wBanya ? 'amme-jade' : 'amme-ghost'}
                  onClick={() => props.setWBanya(!props.wBanya)}
                >
                  {props.wBanya ? t('bookings.banya') : t('bookings.kitchenOnly')}
                </button>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="amme-primary" type="button" onClick={props.onWalkin}>
                  {t('bills.openVisit')}
                </button>
                <button className="amme-ghost" type="button" onClick={() => props.setWalkOpen(false)}>
                  {t('common.actions.cancel')}
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
                {t('bills.noActiveGuests')}
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
                      ? 'rgba(216, 102, 89, 0.5)'
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
                    {t('common.people', { count: v.guests })} · {v.banya ? t('bookings.banya') : t('bookings.kitchen')}
                    {hot ? ` · ${t('bookings.kitchen')}` : ''}
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
            className="amme-card amme-menu-surface"
            style={{
              background: 'radial-gradient(120% 140% at 30% 0%,var(--amme-teak-700),var(--amme-charcoal-800))',
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
                        borderBottom: '1px solid var(--amme-line-strong)',
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
  const { t } = useI18n()
  if (!props.visit || !props.tab) {
    return (
      <div
        className="amme-receipt amme-receipt-empty"
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
        {t('bills.selectGuest')}
      </div>
    )
  }

  const lines = props.tab.lines
  const total = tabSum(props.tab)
  const otherTabs = props.visit.tabs.filter((t) => t.id !== props.tab!.id && !t.closedAt)

  return (
    <div
      className="amme-receipt"
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
        <div style={{ fontSize: 11, color: '#6a6055', marginTop: 3, letterSpacing: '0.08em' }}>{t('bills.receipt')}</div>
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
        <span>{t('common.people', { count: props.visit.guests })}</span>
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
            <span>{t('bills.visitCount', { count: props.guest.visitCount })}</span>
            <span>LTV {formatIdr(props.guest.lifetimeSpend)}</span>
            {props.guest.dietary ? <span>{t('bills.diet', { value: props.guest.dietary })}</span> : null}
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
              {props.guest.blocked ? `${t('bills.cautionMessage')} ` : ''}
              {props.guest.notes || props.guest.preferences}
            </div>
          ) : null}
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: 5, paddingTop: 9, flexWrap: 'wrap' }}>
        {props.visit.tabs.map((tab, i) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => props.onSelectTab(tab.id)}
            style={{
              padding: '3px 9px',
              border: '1px solid #c3b8a6',
              borderRadius: 2,
              fontSize: 11,
              background: tab.id === props.tab!.id ? '#241f1b' : 'transparent',
              color: tab.id === props.tab!.id ? '#f3eee4' : '#5c5247',
            }}
          >
            {tab.label || t('bills.billNumber', { number: i + 1 })}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 11, paddingTop: 11, borderTop: '1px dashed #b8ae9e' }}>
        {lines.length === 0 ? (
          <div style={{ padding: '20px 0', textAlign: 'center', color: '#7a6f63' }}>
            {t('bills.empty')}
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
                    aria-label={`${t('common.actions.decrease')}: ${l.name}`}
                    onClick={() => props.onBump(l.id, -1)}
                    style={{ width: 20, height: 20, border: '1px solid #cdc2b0', borderRadius: 2 }}
                  >
                    −
                  </button>
                  <button
                    type="button"
                    aria-label={`${t('common.actions.increase')}: ${l.name}`}
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
            {t('bills.selected', { count: props.selLines.size })}
          </div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 7 }}>
            <button
              type="button"
              onClick={props.onNewTab}
              style={{ padding: '6px 10px', border: '1px solid #e2542a', background: '#e2542a', borderRadius: 2 }}
            >
              {t('bills.moveToNew')}
            </button>
            {otherTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => props.onMoveTo(tab.id)}
                style={{ padding: '6px 10px', border: '1px solid #6a6055', borderRadius: 2 }}
              >
                {t('bills.moveTo', { bill: tab.label || t('bills.receipt').toLocaleLowerCase() })}
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
          <span>{t('bills.sendCountdown', { seconds: props.sendLeft })}</span>
          <button type="button" onClick={props.onSendNow} style={{ color: '#d8c48f', textDecoration: 'underline' }}>
            {t('bills.sendNow')}
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
        <span>{t('common.total')}</span>
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
          {props.tab.paidAt ? t('bills.paid') : t('bills.pay')}
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
          {t('bills.closeBill')}
        </button>
      </div>
    </div>
  )
}

function Kitchen({ lines, onDone }: { lines: KitchenLine[]; onDone: (id: string) => void }) {
  const { t } = useI18n()
  const now = useNow()
  const stations = [...new Set(lines.map((line) => line.station || t('sidebar.kitchen')))]
  const [station, setStation] = useState('ALL')
  const [sound, setSound] = useState(true)
  const previousOpen = useRef(0)
  const open = lines
    .filter((l) => l.status === 'SENT' && (station === 'ALL' || l.station === station))
    .sort((a, b) => b.priority - a.priority || String(a.sentAt).localeCompare(String(b.sentAt)))
  const done = lines
    .filter((l) => l.status === 'DONE' && (station === 'ALL' || l.station === station))
    .slice(-12)

  useEffect(() => {
    const count = lines.filter((line) => line.status === 'SENT').length
    if (sound && count > previousOpen.current && previousOpen.current > 0) {
      try {
        const audio = new AudioContext()
        const oscillator = audio.createOscillator()
        oscillator.frequency.value = 880
        oscillator.connect(audio.destination)
        oscillator.start()
        oscillator.stop(audio.currentTime + 0.12)
      } catch {
        // Browser may require an initial interaction before audio.
      }
    }
    previousOpen.current = count
  }, [lines, sound])

  const urgencyStyle = (mins: number) => {
    const u = kitchenUrgency(mins)
    if (u === 'hot') return { borderColor: 'var(--amme-ember)', timerColor: 'var(--amme-ember)' }
    if (u === 'warn') return { borderColor: 'var(--amme-gold)', timerColor: 'var(--amme-gold)' }
    return { borderColor: 'var(--amme-line)', timerColor: 'var(--amme-dim)' }
  }

  return (
    <>
      <div className="amme-kds-toolbar">
        <p className="amme-eyebrow" style={{ margin: 0 }}>{t('kds.title')}</p>
        <div className="amme-seg">
          <button type="button" aria-pressed={station === 'ALL'} className={station === 'ALL' ? 'on' : ''} onClick={() => setStation('ALL')}>{t('kds.allStations')}</button>
          {stations.map((name) => (
            <button key={name} type="button" aria-pressed={station === name} className={station === name ? 'on' : ''} onClick={() => setStation(name)}>
              {name}
            </button>
          ))}
        </div>
        <button className={sound ? 'amme-jade' : 'amme-ghost'} type="button" aria-pressed={sound} onClick={() => setSound((value) => !value)}>
          {t('kds.sound', { state: sound ? t('common.on') : t('common.off') })}
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 12 }}>
        {open.length === 0 ? (
          <div className="amme-card" style={{ color: 'var(--amme-dim)' }}>
            {t('kds.empty')}
          </div>
        ) : null}
        {open.map((l) => {
          const mins = l.sentAt && now ? Math.floor((now - new Date(l.sentAt).getTime()) / 60000) : 0
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
                <span className="amme-mono" style={{ color: style.timerColor }}>{l.station} · {mins}м</span>
              </div>
              <div style={{ padding: 13 }}>
                <div style={{ fontSize: 16, marginBottom: 12 }}>
                  {l.qty}× {l.name}
                </div>
                <button className="amme-jade" type="button" onClick={() => onDone(l.id)} style={{ width: '100%' }}>
                  {t('kds.served')}
                </button>
              </div>
            </div>
          )
        })}
      </div>
      {done.length ? (
        <>
          <p className="amme-eyebrow" style={{ marginTop: 22 }}>
            {t('kds.recentlyServed')}
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
  const { t } = useI18n()
  if (!report) {
    return <p className="amme-eyebrow">{t('reports.calculating')}</p>
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
          {t('reports.summary', { range: report.rangeLabel })}
        </p>
        <div className="amme-seg">
          {(
            [
              ['today', t('reports.today')],
              ['7d', t('reports.sevenDays')],
              ['30d', t('reports.thirtyDays')],
              ['custom', t('reports.custom')],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={reportRange === id ? 'on' : ''}
              aria-pressed={reportRange === id}
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
              {t('common.actions.apply')}
            </button>
          </>
        ) : null}
        <button className="amme-primary" type="button" onClick={() => window.print()} style={{ marginLeft: 'auto' }}>
          {t('common.actions.print')}
        </button>
      </div>

      <div className="amme-kpis">
        <KpiCard label={t('reports.revenue')} value={formatIdr(report.rev / 1000)} suffix={`${t('common.currencyThousands')} Rp`} tone="gold" />
        <KpiCard label={t('reports.averageBill')} value={formatIdr(report.avg / 1000)} suffix={t('common.currencyThousands')} tone="sage" />
        <KpiCard label={t('reports.foodShare')} value={report.foodShare} suffix="%" tone="sage" />
        <KpiCard label={t('reports.banyaShare')} value={report.banyaShare} suffix="%" tone="terracotta" />
        <KpiCard label={t('reports.foodPerBanyaGuest')} value={formatIdr(report.perGuest / 1000)} suffix={t('common.currencyThousands')} tone="gold" />
        <KpiCard label={t('reports.noShows')} value={noshowPct} suffix={`% · ${report.bkNo}/${report.bkAll}`} tone="terracotta" />
        <KpiCard label={t('reports.guestsServed')} value={report.guestsServed} tone="neutral" />
      </div>

      <div className="amme-split" style={{ gridTemplateColumns: 'minmax(0,1.2fr) minmax(0,1fr)', marginBottom: 18 }}>
        <div className="amme-card">
          <p className="amme-eyebrow">{t('reports.revenueByDay')}</p>
          {report.daily.length === 0 ? (
            <p style={{ color: 'var(--amme-dim)', margin: 0 }}>{t('reports.noPaidBills')}</p>
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
          <p className="amme-eyebrow">{t('reports.billsByHour')}</p>
          <div className="amme-day-chart" style={{ minHeight: 100 }}>
            {report.hourly
              .filter((h) => h.tabs > 0)
              .map((h) => (
                <div key={h.hour} className="col" title={`${h.hour}:00, ${h.tabs} сч.`}>
                  <div
                    className="stem"
                    style={{
                      height: `${Math.max(4, (h.tabs / maxHourly) * 80)}px`,
                      background: 'linear-gradient(180deg, var(--amme-gold-300), var(--amme-gold-700))',
                    }}
                  />
                  <div className="lbl">{h.hour}</div>
                </div>
              ))}
          </div>
        </div>
      </div>

      <p className="amme-eyebrow">{t('reports.topItems')}</p>
      <div className="amme-card amme-bars" style={{ marginBottom: 18 }}>
        {report.top.length === 0 ? (
          <p style={{ color: 'var(--amme-dim)', margin: 0 }}>{t('common.noData')}</p>
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

      <p className="amme-eyebrow">{t('reports.periodLog')}</p>
      <div className="amme-card" style={{ marginBottom: 14 }}>
        {report.audits.length === 0 ? (
          <p style={{ color: 'var(--amme-dim)', margin: 0 }}>{t('reports.noEvents')}</p>
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
        {t('reports.banyaPriceNote', { price: formatIdr(banyaPrice), bills: report.tabsPaid, visits: report.visitsPaid })}
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
  const { t } = useI18n()
  const [drafts, setDrafts] = useState<Record<string, { name: string; price: string }>>(() => {
    const next: Record<string, { name: string; price: string }> = {}
    for (const m of menu) {
      next[m.code] = { name: m.name, price: String(m.price) }
    }
    return next
  })

  return (
    <>
      <p className="amme-eyebrow">{t('menu.editor')}</p>
      <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--amme-dim)' }}>
        {t('menu.editorHelp')}
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
                <label>{t('menu.priceRp')}</label>
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
                  {t('common.actions.save')}
                </button>
                <button
                  className={m.active ? 'amme-ghost' : 'amme-jade'}
                  type="button"
                  onClick={() => onSave(m.code, { active: !m.active })}
                >
                  {m.active ? t('common.actions.disable') : t('common.actions.enable')}
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
  const { locale, t } = useI18n()
  if (!article) return null
  const localizedArticle = locale === 'en' ? { ...article, ...KNOWLEDGE_ARTICLES_EN[article.id] } : article

  return (
    <div className="amme-kb-grid">
      <div>
        {KNOWLEDGE_CATEGORIES.map((cat) => {
          const items = KNOWLEDGE_ARTICLES.filter((a) => a.category === cat)
          if (items.length === 0) return null
          return (
            <div key={cat} style={{ marginBottom: 16 }}>
              <p className="amme-eyebrow">{locale === 'en' ? KNOWLEDGE_CATEGORY_EN[cat] : cat}</p>
              <div className="amme-kb-list">
                {items.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    className={selArticle === a.id ? 'on' : ''}
                    onClick={() => setSelArticle(a.id)}
                  >
                    <div className="cat">{t('knowledge.minutes', { count: a.minutes })}</div>
                    <div style={{ fontWeight: 600 }}>{locale === 'en' ? KNOWLEDGE_ARTICLES_EN[a.id]?.title || a.title : a.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--amme-dim)', marginTop: 4 }}>
                      {locale === 'en' ? KNOWLEDGE_ARTICLES_EN[a.id]?.summary || a.summary : a.summary}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="amme-card amme-kb-article">
        <p className="amme-eyebrow">{localizedArticle.category}</p>
        <h2>{localizedArticle.title}</h2>
        <p style={{ color: 'var(--amme-dim)', margin: '0 0 16px' }}>{localizedArticle.summary}</p>
        <ol>
          {localizedArticle.body.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </div>
    </div>
  )
}
