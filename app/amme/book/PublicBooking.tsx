'use client'

import { useCallback, useEffect, useState } from 'react'
import { formatIdr } from '@/lib/amme/money'
import LanguageSwitcher from '@/app/amme/components/LanguageSwitcher'
import { useI18n } from '@/app/amme/i18n'

type Slot = {
  resourceId: string
  resourceName: string
  time: string
  remaining: number
  available: boolean
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

export default function PublicBooking() {
  const { t } = useI18n()
  const [day, setDay] = useState(today())
  const [slots, setSlots] = useState<Slot[]>([])
  const [slot, setSlot] = useState<Slot | null>(null)
  const [venue, setVenue] = useState<{ name: string; banyaPrice: number; sessionMinutes: number } | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [guests, setGuests] = useState(2)
  const [note, setNote] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const response = await fetch(`/api/amme/public/booking?day=${day}`)
    const data = await response.json()
    if (data.success) {
      setSlots(data.slots)
      setVenue(data.venue)
      setSlot(null)
    }
  }, [day])

  useEffect(() => { void load() }, [load])

  async function submit() {
    if (!slot || !name.trim() || !phone.trim()) return
    setBusy(true)
    setMessage('')
    try {
      const response = await fetch('/api/amme/public/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          day,
          time: slot.time,
          resourceId: slot.resourceId,
          name,
          phone,
          guests,
          note,
        }),
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        setMessage(data.error || t('public.createFailed'))
        return
      }
      setMessage(t('public.createdDeposit', { amount: formatIdr(data.depositAmount) }))
      setName('')
      setPhone('')
      setNote('')
      void load()
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="amme-public-book">
      <section>
        <LanguageSwitcher />
        <p className="eyebrow">{t('public.eyebrow')}</p>
        <h1>{venue?.name || 'AMMÉ'}</h1>
        <p className="lead">{t('public.lead')}</p>

        <label>{t('common.date')}<input type="date" min={today()} value={day} onChange={(event) => setDay(event.target.value)} /></label>
        <div className="slots">
          {slots.map((item) => (
            <button
              key={`${item.resourceId}-${item.time}`}
              type="button"
              disabled={!item.available || item.remaining < guests}
              className={slot?.resourceId === item.resourceId && slot.time === item.time ? 'on' : ''}
              onClick={() => setSlot(item)}
            >
              <strong>{item.time}</strong>
              <span>{item.resourceName}</span>
              <small>{t('public.remainingPlaces', { count: item.remaining })}</small>
            </button>
          ))}
        </div>

        <div className="form">
          <label>{t('common.name')}<input value={name} onChange={(event) => setName(event.target.value)} /></label>
          <label>{t('public.whatsappPhone')}<input value={phone} onChange={(event) => setPhone(event.target.value)} /></label>
          <label>{t('common.guests')}<input type="number" min={1} max={20} value={guests} onChange={(event) => setGuests(Number(event.target.value))} /></label>
          <label>{t('common.comment')}<textarea rows={3} value={note} onChange={(event) => setNote(event.target.value)} /></label>
        </div>

        {venue ? (
          <div className="summary">
            <span>{t('public.summary', { guests, minutes: venue.sessionMinutes })}</span>
            <strong>{formatIdr(venue.banyaPrice * guests)}</strong>
            <small>{t('public.deposit25', { amount: formatIdr(venue.banyaPrice * guests * 0.25) })}</small>
          </div>
        ) : null}
        <button className="submit" type="button" disabled={busy || !slot || !name || !phone} onClick={() => void submit()}>
          {busy ? t('public.creating') : t('public.booking')}
        </button>
        {message ? <p className="message" role="status" aria-live="polite">{message}</p> : null}
      </section>
    </main>
  )
}
