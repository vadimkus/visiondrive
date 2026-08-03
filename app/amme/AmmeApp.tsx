'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AMME_MENU_CATEGORIES, SEND_DELAY_SEC } from '@/lib/amme/menu'
import { formatIdr } from '@/lib/amme/money'

type StaffRole = 'ADMIN' | 'KITCHEN' | 'OWNER'

type MenuItem = {
  id: string
  code: string
  name: string
  price: number
  category: string
  station: string
  vegFlag: string | null
}

type Booking = {
  id: string
  at: string
  name: string
  guests: number
  banya: boolean
  phone: string | null
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

type Report = {
  rev: number
  avg: number
  perGuest: number
  bGuests: number
  foodShare: number
  bkAll: number
  bkNo: number
  top: [string, number][]
  tabsPaid: number
}

type State = {
  venue: { id: string; name: string; banyaPrice: number; currency: string }
  day: string
  menu: MenuItem[]
  bookings: Booking[]
  visits: Visit[]
  kitchen: KitchenLine[]
}

type View = 'dash' | 'book' | 'guests' | 'kitchen' | 'report'

const hhmm = (iso: string) =>
  new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })

function tabSum(tab: Tab) {
  return tab.lines.reduce((s, l) => s + l.qty * l.price, 0)
}

function visitSum(v: Visit) {
  return v.tabs.reduce((s, t) => s + tabSum(t), 0)
}

export default function AmmeApp({
  user,
}: {
  user: { id: string; email: string; name: string | null; staffRole: StaffRole }
}) {
  const router = useRouter()
  const [view, setView] = useState<View>('dash')
  const [state, setState] = useState<State | null>(null)
  const [report, setReport] = useState<Report | null>(null)
  const [selVisit, setSelVisit] = useState<string | null>(null)
  const [selTab, setSelTab] = useState<string | null>(null)
  const [selLines, setSelLines] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState<{ msg: string; err?: boolean } | null>(null)
  const [busy, setBusy] = useState(false)
  const [importText, setImportText] = useState('')
  const [walkOpen, setWalkOpen] = useState(false)
  const [wName, setWName] = useState('')
  const [wGuests, setWGuests] = useState(2)
  const [wBanya, setWBanya] = useState(false)
  const [sendLeft, setSendLeft] = useState(0)
  const sendTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  const showToast = (msg: string, err = false) => {
    setToast({ msg, err })
    setTimeout(() => setToast(null), 2800)
  }

  const load = useCallback(async () => {
    const res = await fetch('/api/amme/state')
    if (res.status === 401) {
      router.replace('/amme/login')
      return
    }
    const data = await res.json()
    if (!data.success) {
      showToast(data.error || 'Ошибка загрузки', true)
      return
    }
    setState(data)
  }, [router])

  const loadReport = useCallback(async () => {
    const res = await fetch('/api/amme/report')
    if (!res.ok) return
    const data = await res.json()
    if (data.success) setReport(data.report)
  }, [])

  useEffect(() => {
    load()
    loadReport()
    const t = setInterval(() => {
      load()
      if (view === 'dash' || view === 'report') loadReport()
    }, 20000)
    return () => clearInterval(t)
  }, [load, loadReport, view])

  async function act(body: Record<string, unknown>) {
    setBusy(true)
    try {
      const res = await fetch('/api/amme/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok || data.success === false) {
        showToast(data.error || 'Ошибка', true)
        return
      }
      setState(data)
      if (view === 'dash' || view === 'report') loadReport()
    } catch {
      showToast('Сеть недоступна', true)
    } finally {
      setBusy(false)
    }
  }

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

  const activeVisit = useMemo(
    () => openVisits.find((v) => v.id === selVisit) || null,
    [openVisits, selVisit]
  )
  const activeTab = useMemo(() => {
    if (!activeVisit) return null
    return activeVisit.tabs.find((t) => t.id === selTab) || activeVisit.tabs.find((t) => !t.closedAt) || null
  }, [activeVisit, selTab])

  useEffect(() => {
    if (activeVisit && !selTab) {
      const t = activeVisit.tabs.find((x) => !x.closedAt)
      if (t) setSelTab(t.id)
    }
  }, [activeVisit, selTab])

  if (!state) {
    return (
      <div className="amme-main">
        <p className="amme-eyebrow">Загрузка смены…</p>
      </div>
    )
  }

  return (
    <>
      <header className="amme-topbar">
        <div className="amme-brand">
          {state.venue.name}
          <span>{user.name || user.email} · {user.staffRole.toLowerCase()}</span>
        </div>
        <nav className="amme-nav">
          {(
            [
              ['dash', 'Дашборд'],
              ['book', 'Записи'],
              ['guests', 'Гости'],
              ['kitchen', 'Кухня'],
              ['report', 'Отчёт'],
            ] as const
          ).map(([id, label]) => (
            <button key={id} className={view === id ? 'on' : ''} onClick={() => setView(id)} type="button">
              {label}
              {id === 'kitchen' && kitchenOpen > 0 ? <span className="badge">{kitchenOpen}</span> : null}
              {id === 'book' && waiting > 0 ? <span className="badge">{waiting}</span> : null}
            </button>
          ))}
          <button className="amme-ghost" type="button" onClick={logout} style={{ marginLeft: 8 }}>
            Выйти
          </button>
        </nav>
      </header>

      <div className="amme-main" style={{ opacity: busy ? 0.7 : 1 }}>
        {view === 'dash' ? (
          <Dashboard
            state={state}
            report={report}
            banyaLive={banyaLive}
            kitchenOpen={kitchenOpen}
            waiting={waiting}
            onGo={setView}
          />
        ) : null}

        {view === 'book' ? (
          <Bookings
            bookings={state.bookings}
            day={state.day}
            importText={importText}
            setImportText={setImportText}
            onArrive={(id) => {
              void act({ type: 'arrive', bookingId: id }).then(() => setView('guests'))
            }}
            onNoshow={(id) => void act({ type: 'noshow', bookingId: id })}
            onUnmark={(id) => void act({ type: 'unmark', bookingId: id })}
            onToggle={(id) => void act({ type: 'toggle_banya', bookingId: id })}
            onImport={(mode) => {
              void act({ type: 'import', text: importText, mode }).then(() => setImportText(''))
            }}
            onOpenVisit={(visitId) => {
              setSelVisit(visitId)
              setView('guests')
            }}
          />
        ) : null}

        {view === 'guests' ? (
          <Guests
            visits={openVisits}
            banyaLive={banyaLive}
            banyaPrice={state.venue.banyaPrice}
            menu={state.menu}
            activeVisit={activeVisit}
            activeTab={activeTab}
            selLines={selLines}
            sendLeft={sendLeft}
            walkOpen={walkOpen}
            wName={wName}
            wGuests={wGuests}
            wBanya={wBanya}
            setWalkOpen={setWalkOpen}
            setWName={setWName}
            setWGuests={setWGuests}
            setWBanya={setWBanya}
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
            onPay={() => activeTab && void act({ type: 'pay', tabId: activeTab.id })}
            onClose={() => activeTab && void act({ type: 'close', tabId: activeTab.id })}
            onEndBanya={(id) => void act({ type: 'end_banya', visitId: id })}
            onNewTab={() => {
              if (!activeVisit || !selLines.size) return
              void act({
                type: 'move',
                lineIds: [...selLines],
                newTabForVisitId: activeVisit.id,
              }).then(() => setSelLines(new Set()))
            }}
            onMoveTo={(tabId) => {
              void act({ type: 'move', lineIds: [...selLines], targetTabId: tabId }).then(() =>
                setSelLines(new Set())
              )
            }}
            onWalkin={() => {
              void act({ type: 'walkin', name: wName, guests: wGuests, banya: wBanya }).then(() => {
                setWalkOpen(false)
                setWName('')
                setWGuests(2)
                setWBanya(false)
              })
            }}
          />
        ) : null}

        {view === 'kitchen' ? (
          <Kitchen
            lines={state.kitchen}
            onDone={(id) => void act({ type: 'done', lineId: id })}
          />
        ) : null}

        {view === 'report' ? <ReportView report={report} banyaPrice={state.venue.banyaPrice} /> : null}
      </div>

      {toast ? <div className={`amme-toast ${toast.err ? 'err' : ''}`}>{toast.msg}</div> : null}
    </>
  )
}

function Dashboard({
  state,
  report,
  banyaLive,
  kitchenOpen,
  waiting,
  onGo,
}: {
  state: State
  report: Report | null
  banyaLive: Visit[]
  kitchenOpen: number
  waiting: number
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

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
        <button className="amme-primary" type="button" onClick={() => onGo('book')}>
          Открыть записи
        </button>
        <button className="amme-ghost" type="button" onClick={() => onGo('guests')}>
          Гости и счета
        </button>
        <button className="amme-ghost" type="button" onClick={() => onGo('kitchen')}>
          Кухня
        </button>
        <button className="amme-ghost" type="button" onClick={() => onGo('report')}>
          Отчёт
        </button>
      </div>

      <div className="amme-card">
        <p className="amme-eyebrow">Активные гости</p>
        {state.visits.length === 0 ? (
          <p style={{ color: 'var(--amme-dim)', margin: 0 }}>Пока никого. Отметьте приход в Записях.</p>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {state.visits.map((v) => (
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
    </>
  )
}

function Bookings(props: {
  bookings: Booking[]
  day: string
  importText: string
  setImportText: (v: string) => void
  onArrive: (id: string) => void
  onNoshow: (id: string) => void
  onUnmark: (id: string) => void
  onToggle: (id: string) => void
  onImport: (mode: 'append' | 'replace') => void
  onOpenVisit: (visitId: string) => void
}) {
  const now = Date.now()
  return (
    <>
      <p className="amme-eyebrow">Записи · {props.day}</p>
      <div style={{ display: 'grid', gap: 6, maxWidth: 860, marginBottom: 22 }}>
        {props.bookings.map((b) => {
          const late = b.status === 'WAITING' && now - new Date(b.at).getTime() > 15 * 60000
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
                borderColor: late ? '#6b3a24' : b.status === 'ARRIVED' ? '#31513f' : undefined,
                background: late ? '#271e19' : b.status === 'ARRIVED' ? '#1c2620' : undefined,
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
                  }}
                >
                  {b.name}
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

      <div className="amme-card" style={{ maxWidth: 860 }}>
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
  wGuests: number
  wBanya: boolean
  setWalkOpen: (v: boolean) => void
  setWName: (v: string) => void
  setWGuests: (n: number | ((x: number) => number)) => void
  setWBanya: (v: boolean) => void
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
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
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
            <button className="amme-ghost" type="button" onClick={() => props.setWalkOpen(true)}>
              + гость без записи
            </button>
          </div>

          {props.walkOpen ? (
            <div className="amme-card" style={{ marginBottom: 12 }}>
              <div className="amme-field">
                <label>Имя</label>
                <input value={props.wName} onChange={(e) => props.setWName(e.target.value)} />
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
            {props.visits.map((v) => {
              const hot = v.tabs.some((t) => t.lines.some((l) => l.status === 'SENT'))
              const unpaid = v.tabs.some((t) => !t.paidAt && !t.closedAt)
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => props.onSelectVisit(v.id)}
                  className="amme-card"
                  style={{
                    textAlign: 'left',
                    borderColor: props.activeVisit?.id === v.id ? 'var(--amme-sage)' : undefined,
                    background: props.activeVisit?.id === v.id ? 'var(--amme-panel-2)' : undefined,
                  }}
                >
                  <div style={{ fontFamily: 'var(--amme-display)', fontSize: 17 }}>{v.name}</div>
                  <div className="amme-mono" style={{ fontSize: 11.5, color: 'var(--amme-dim)', marginTop: 3 }}>
                    {v.guests} чел. · {v.banya ? 'баня' : 'кухня'}
                    {hot ? ' · кухня' : ''}
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
              {AMME_MENU_CATEGORIES.map((cat) => (
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
                    {props.menu
                      .filter((m) => m.category === cat)
                      .map((m) => (
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
              ))}
            </div>
          </div>
        </div>

        <Receipt
          visit={props.activeVisit}
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
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px dashed #b8ae9e' }}>
        <b style={{ fontWeight: 500 }}>{props.visit.name}</b>
        <span>{props.visit.guests} чел.</span>
      </div>

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
          <div style={{ padding: '20px 0', textAlign: 'center', color: '#7a6f63' }}>Пусто — ткните блюдо в меню</div>
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
          const hot = mins >= 10
          return (
            <div
              key={l.id}
              className="amme-card"
              style={{ borderColor: hot ? 'var(--amme-ember)' : undefined, overflow: 'hidden', padding: 0 }}
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
                <span className="amme-mono" style={{ color: hot ? 'var(--amme-ember)' : 'var(--amme-dim)' }}>
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

function ReportView({ report, banyaPrice }: { report: Report | null; banyaPrice: number }) {
  if (!report) {
    return <p className="amme-eyebrow">Считаем отчёт…</p>
  }
  const max = report.top[0]?.[1] || 1
  return (
    <>
      <p className="amme-eyebrow">Итоги · закрытые счета · 7 дней</p>
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
          <div className="kl">Еда на гостя бани</div>
          <div className="kv">
            {formatIdr(report.perGuest / 1000)}
            <small>тыс</small>
          </div>
        </div>
        <div className="amme-kpi">
          <div className="kl">Гостей в бане</div>
          <div className="kv">{report.bGuests}</div>
        </div>
        <div className="amme-kpi">
          <div className="kl">Доля еды</div>
          <div className="kv">
            {report.foodShare}
            <small>%</small>
          </div>
        </div>
        <div className="amme-kpi">
          <div className="kl">Неявки сегодня</div>
          <div className="kv">
            {report.bkAll ? Math.round((report.bkNo / report.bkAll) * 100) : 0}
            <small>
              % · {report.bkNo}/{report.bkAll}
            </small>
          </div>
        </div>
      </div>

      <p className="amme-eyebrow">Что приносит деньги</p>
      <div className="amme-card">
        {report.top.map(([n, s]) => (
          <div
            key={n}
            style={{
              display: 'grid',
              gridTemplateColumns: '140px 1fr 90px',
              gap: 10,
              alignItems: 'center',
              padding: '6px 0',
            }}
          >
            <span style={{ fontSize: 13 }}>{n}</span>
            <span style={{ height: 6, background: 'var(--amme-slate)', borderRadius: 2, overflow: 'hidden' }}>
              <i
                style={{
                  display: 'block',
                  height: '100%',
                  width: `${Math.max(2, (s / max) * 100)}%`,
                  background: n.startsWith('Баня') ? 'var(--amme-ember)' : 'var(--amme-sage)',
                }}
              />
            </span>
            <span className="amme-mono" style={{ textAlign: 'right', fontSize: 12 }}>
              {formatIdr(s / 1000)} тыс
            </span>
          </div>
        ))}
      </div>
      <p style={{ marginTop: 14, fontSize: 12, color: 'var(--amme-dim)' }}>
        Баня: {formatIdr(banyaPrice)} Rp с человека за сеанс. Данные в Postgres.
      </p>
    </>
  )
}
