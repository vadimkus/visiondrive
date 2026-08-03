'use client'

import { useCallback, useEffect, useState } from 'react'
import { formatIdr } from '@/lib/amme/money'
import { CRM_TAG_PRESETS, type CrmSegment } from '@/lib/amme/crm-shared'
import { useI18n, type TranslationKey } from '@/app/amme/i18n'

export type GuestCard = {
  id: string
  name: string
  phone: string | null
  email: string | null
  notes: string | null
  tags: string[]
  preferences: string | null
  dietary: string | null
  birthday: string | null
  source: string | null
  language: string | null
  visitCount: number
  noshowCount: number
  lifetimeSpend: number
  avgSpend: number
  firstVisitAt: string | null
  lastVisitAt: string | null
  banyaPref: boolean
  blocked: boolean
  vip: boolean
}

type HistoryRow = {
  id: string
  name: string
  guests: number
  banya: boolean
  openedAt: string
  closedAt: string | null
  spend: number
  paid: boolean
  topItems: string[]
}

type Summary = Record<CrmSegment, number>

const CRM_TAG_EN: Record<string, string> = {
  VIP: 'VIP',
  Постоянный: 'Regular',
  Аллергия: 'Allergy',
  Веган: 'Vegan',
  Пресса: 'Press',
  'Друг дома': 'Friend of the house',
  Группа: 'Group',
  Осторожно: 'Caution',
}

const SEGMENTS: { id: CrmSegment; label: TranslationKey }[] = [
  { id: 'all', label: 'crm.segment.all' },
  { id: 'vip', label: 'crm.segment.vip' },
  { id: 'regular', label: 'crm.segment.regular' },
  { id: 'new', label: 'crm.segment.new' },
  { id: 'dormant', label: 'crm.segment.dormant' },
  { id: 'banya', label: 'crm.segment.banya' },
  { id: 'high', label: 'crm.segment.highSpend' },
  { id: 'noshow', label: 'crm.segment.noShow' },
  { id: 'blocked', label: 'crm.segment.blocked' },
]

function fmtDay(iso: string | null, locale: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(locale === 'en' ? 'en-GB' : 'ru-RU', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
  })
}

export default function CrmView({
  onToast,
  focusGuestId,
  onFocusConsumed,
}: {
  onToast: (msg: string, err?: boolean) => void
  focusGuestId?: string | null
  onFocusConsumed?: () => void
}) {
  const { locale, t } = useI18n()
  const [segment, setSegment] = useState<CrmSegment>('all')
  const [q, setQ] = useState('')
  const [guests, setGuests] = useState<GuestCard[]>([])
  const [summary, setSummary] = useState<Partial<Summary>>({})
  const [total, setTotal] = useState(0)
  const [sel, setSel] = useState<string | null>(null)
  const [detail, setDetail] = useState<GuestCard | null>(null)
  const [history, setHistory] = useState<HistoryRow[]>([])
  const [busy, setBusy] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [cName, setCName] = useState('')
  const [cPhone, setCPhone] = useState('')
  const [cNotes, setCNotes] = useState('')
  const [cVip, setCVip] = useState(false)

  const [eNotes, setENotes] = useState('')
  const [ePrefs, setEPrefs] = useState('')
  const [eDietary, setEDietary] = useState('')
  const [ePhone, setEPhone] = useState('')
  const [eBirthday, setEBirthday] = useState('')
  const [eTags, setETags] = useState<string[]>([])
  const [eVip, setEVip] = useState(false)
  const [eBlocked, setEBlocked] = useState(false)
  const [eBanya, setEBanya] = useState(false)

  const loadList = useCallback(async () => {
    const params = new URLSearchParams({ segment, q })
    const res = await fetch(`/api/amme/crm?${params}`)
    const data = await res.json()
    if (!res.ok || !data.success) {
      onToast(data.error || t('crm.unavailable'), true)
      return
    }
    setGuests(data.guests || [])
    setSummary(data.summary || {})
    setTotal(data.total || 0)
  }, [onToast, q, segment, t])

  const loadDetail = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/amme/crm?id=${encodeURIComponent(id)}`)
      const data = await res.json()
      if (!res.ok || !data.success) {
        onToast(data.error || t('crm.cardNotFound'), true)
        return
      }
      const g = data.guest as GuestCard
      setDetail(g)
      setHistory(data.history || [])
      setENotes(g.notes || '')
      setEPrefs(g.preferences || '')
      setEDietary(g.dietary || '')
      setEPhone(g.phone || '')
      setEBirthday(g.birthday || '')
      setETags(g.tags || [])
      setEVip(!!g.vip)
      setEBlocked(!!g.blocked)
      setEBanya(!!g.banyaPref)
    },
    [onToast, t]
  )

  useEffect(() => {
    void loadList()
  }, [loadList])

  useEffect(() => {
    if (focusGuestId) {
      setSel(focusGuestId)
      onFocusConsumed?.()
    }
  }, [focusGuestId, onFocusConsumed])

  useEffect(() => {
    if (sel) void loadDetail(sel)
  }, [sel, loadDetail])

  async function saveDetail() {
    if (!detail) return
    setBusy(true)
    try {
      const res = await fetch('/api/amme/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'update',
          guestId: detail.id,
          notes: eNotes,
          preferences: ePrefs,
          dietary: eDietary,
          phone: ePhone,
          birthday: eBirthday || null,
          tags: eTags,
          vip: eVip,
          blocked: eBlocked,
          banyaPref: eBanya,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        onToast(data.error || t('common.operationFailed'), true)
        return
      }
      onToast(t('crm.cardSaved'))
      setDetail(data.guest)
      void loadList()
    } finally {
      setBusy(false)
    }
  }

  async function createGuest() {
    setBusy(true)
    try {
      const res = await fetch('/api/amme/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'create',
          name: cName,
          phone: cPhone,
          notes: cNotes,
          vip: cVip,
          source: 'manual',
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        onToast(data.error || t('common.operationFailed'), true)
        return
      }
      onToast(t('crm.guestAdded'))
      setCreateOpen(false)
      setCName('')
      setCPhone('')
      setCNotes('')
      setCVip(false)
      setSel(data.guest.id)
      void loadList()
    } finally {
      setBusy(false)
    }
  }

  function toggleTag(tag: string) {
    setETags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  return (
    <div className="amme-crm">
      <div className="amme-kpis">
        <div className="amme-kpi">
          <div className="kl">{t('crm.guestBase')}</div>
          <div className="kv">{summary.all ?? total}</div>
        </div>
        <div className="amme-kpi">
          <div className="kl">VIP</div>
          <div className="kv">{summary.vip ?? 0}</div>
        </div>
        <div className="amme-kpi">
          <div className="kl">{t('crm.regular3')}</div>
          <div className="kv">{summary.regular ?? 0}</div>
        </div>
        <div className="amme-kpi">
          <div className="kl">{t('crm.dormant30')}</div>
          <div className="kv">{summary.dormant ?? 0}</div>
        </div>
        <div className="amme-kpi">
          <div className="kl">Noshow</div>
          <div className="kv">{summary.noshow ?? 0}</div>
        </div>
      </div>

      <div className="amme-crm-toolbar amme-no-print">
        <div className="amme-seg">
          {SEGMENTS.map((s) => (
            <button
              key={s.id}
              type="button"
              className={segment === s.id ? 'on' : ''}
              aria-pressed={segment === s.id}
              onClick={() => setSegment(s.id)}
            >
              {t(s.label)}
              {summary[s.id] != null ? ` · ${summary[s.id]}` : ''}
            </button>
          ))}
        </div>
        <div className="amme-crm-search">
          <input
            placeholder={t('crm.searchPlaceholder')}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className="amme-primary" type="button" onClick={() => setCreateOpen((v) => !v)}>
            {t('crm.addGuest')}
          </button>
        </div>
      </div>

      {createOpen ? (
        <div className="amme-card amme-crm-create">
          <p className="amme-eyebrow">{t('crm.newCard')}</p>
          <div className="amme-crm-form-grid">
            <input placeholder={`${t('common.name')} *`} value={cName} onChange={(e) => setCName(e.target.value)} />
            <input
              placeholder={t('crm.whatsappPhone')}
              value={cPhone}
              onChange={(e) => setCPhone(e.target.value)}
            />
            <textarea
              placeholder={t('crm.shiftNote')}
              value={cNotes}
              onChange={(e) => setCNotes(e.target.value)}
              rows={2}
            />
          </div>
          <label className="amme-crm-check">
            <input type="checkbox" checked={cVip} onChange={(e) => setCVip(e.target.checked)} />
            {t('crm.vipImmediately')}
          </label>
          <button
            className="amme-primary"
            type="button"
            disabled={busy || !cName.trim()}
            onClick={() => void createGuest()}
          >
            {t('crm.saveToCrm')}
          </button>
        </div>
      ) : null}

      <div className="amme-crm-split">
        <div className="amme-crm-list">
          {guests.length === 0 ? (
            <div className="amme-card">
              <p className="amme-eyebrow">{t('crm.emptyTitle')}</p>
              <p>{t('crm.emptyHelp')}</p>
            </div>
          ) : (
            guests.map((g) => (
              <button
                key={g.id}
                type="button"
                className={`amme-crm-row ${sel === g.id ? 'on' : ''} ${g.blocked ? 'blocked' : ''}`}
                onClick={() => setSel(g.id)}
              >
                <div className="top">
                  <strong>{g.name}</strong>
                  <span className="spend">{formatIdr(g.lifetimeSpend)}</span>
                </div>
                <div className="meta">
                  {g.phone || t('crm.noPhone')} · {t('common.visits', { count: g.visitCount })} · noshow {g.noshowCount}
                </div>
                <div className="tags">
                  {g.vip ? <span className="tag vip">VIP</span> : null}
                  {g.banyaPref ? <span className="tag">{t('bookings.banya')}</span> : null}
                  {g.blocked ? <span className="tag bad">{t('bookings.caution')}</span> : null}
                  {g.tags
                    .filter((t) => t !== 'VIP' && t !== 'Осторожно')
                    .slice(0, 3)
                    .map((t) => (
                      <span key={t} className="tag">
                        {t}
                      </span>
                    ))}
                </div>
              </button>
            ))
          )}
        </div>

        <div className="amme-crm-detail amme-card">
          {!detail ? (
            <>
              <p className="amme-eyebrow">{t('crm.guestCard')}</p>
              <p>{t('crm.selectGuestHelp')}</p>
              <ul className="amme-crm-hints">
                <li>{t('crm.phoneIsKey')}</li>
                <li>{t('crm.vipRule')}</li>
                <li>{t('crm.notesVisible')}</li>
              </ul>
            </>
          ) : (
            <>
              <div className="amme-crm-head">
                <div>
                  <h2>{detail.name}</h2>
                  <div className="sub">
                    LTV {formatIdr(detail.lifetimeSpend)} · {t('crm.averageSpend', { amount: formatIdr(detail.avgSpend) })} ·{' '}
                    {t('crm.firstVisit', { date: fmtDay(detail.firstVisitAt, locale) })} · {t('crm.lastVisit', { date: fmtDay(detail.lastVisitAt, locale) })}
                  </div>
                </div>
                <button className="amme-jade" type="button" disabled={busy} onClick={() => void saveDetail()}>
                  {t('common.actions.save')}
                </button>
              </div>

              {(detail.notes || detail.blocked || detail.dietary) && (
                <div className={`amme-crm-alert ${detail.blocked ? 'bad' : ''}`}>
                  {detail.blocked ? `${t('crm.blacklistAlert')} ` : ''}
                  {detail.dietary ? `${t('crm.dietary')}: ${detail.dietary}. ` : ''}
                  {detail.notes || ''}
                </div>
              )}

              <div className="amme-crm-form-grid">
                <label>
                  {t('common.phone')}
                  <input value={ePhone} onChange={(e) => setEPhone(e.target.value)} />
                </label>
                <label>
                  {t('crm.birthday')}
                  <input
                    type="date"
                    value={eBirthday}
                    onChange={(e) => setEBirthday(e.target.value)}
                  />
                </label>
                <label className="span2">
                  {t('crm.shiftNotes')}
                  <textarea value={eNotes} onChange={(e) => setENotes(e.target.value)} rows={3} />
                </label>
                <label className="span2">
                  {t('crm.preferences')}
                  <textarea
                    value={ePrefs}
                    onChange={(e) => setEPrefs(e.target.value)}
                    rows={2}
                    placeholder={t('crm.preferencesPlaceholder')}
                  />
                </label>
                <label className="span2">
                  {t('crm.dietary')}
                  <input value={eDietary} onChange={(e) => setEDietary(e.target.value)} />
                </label>
              </div>

              <div className="amme-crm-flags">
                <label className="amme-crm-check">
                  <input type="checkbox" checked={eVip} onChange={(e) => setEVip(e.target.checked)} />
                  VIP
                </label>
                <label className="amme-crm-check">
                  <input
                    type="checkbox"
                    checked={eBanya}
                    onChange={(e) => setEBanya(e.target.checked)}
                  />
                  {t('crm.likesBanya')}
                </label>
                <label className="amme-crm-check">
                  <input
                    type="checkbox"
                    checked={eBlocked}
                    onChange={(e) => setEBlocked(e.target.checked)}
                  />
                  {t('bookings.caution')}
                </label>
              </div>

              <div className="amme-crm-tagbar">
                {CRM_TAG_PRESETS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={eTags.includes(t) ? 'on' : ''}
                    aria-pressed={eTags.includes(t)}
                    onClick={() => toggleTag(t)}
                  >
                    {locale === 'en' ? CRM_TAG_EN[t] || t : t}
                  </button>
                ))}
              </div>

              <p className="amme-eyebrow" style={{ marginTop: 18 }}>
                {t('crm.visitHistory')}
              </p>
              <div className="amme-crm-history">
                {history.length === 0 ? (
                  <p className="dim">{t('crm.noHistory')}</p>
                ) : (
                  history.map((h) => (
                    <div key={h.id} className="row">
                      <div>
                        <strong>{fmtDay(h.openedAt, locale)}</strong>
                        {h.banya ? ` · ${t('bookings.banya')}` : ` · ${t('bookings.kitchen')}`} · {t('common.people', { count: h.guests })}
                        {h.paid ? ` · ${t('status.paid').toLocaleLowerCase()}` : ''}
                      </div>
                      <div className="spend">{formatIdr(h.spend)}</div>
                      {h.topItems.length ? (
                        <div className="items">{h.topItems.join(', ')}</div>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
