'use client'

import { useCallback, useEffect, useState } from 'react'
import { formatIdr } from '@/lib/amme/money'

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
        setMessage(data.error || 'Не удалось создать запись')
        return
      }
      setMessage(`Запись создана. Депозит к оплате: ${formatIdr(data.depositAmount)}`)
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
        <p className="eyebrow">BALI · BANYA &amp; KITCHEN</p>
        <h1>{venue?.name || 'AMMÉ'}</h1>
        <p className="lead">Выберите время посещения. Мы удержим место после подтверждения депозита.</p>

        <label>Дата<input type="date" min={today()} value={day} onChange={(event) => setDay(event.target.value)} /></label>
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
              <small>{item.remaining} мест</small>
            </button>
          ))}
        </div>

        <div className="form">
          <label>Имя<input value={name} onChange={(event) => setName(event.target.value)} /></label>
          <label>WhatsApp / телефон<input value={phone} onChange={(event) => setPhone(event.target.value)} /></label>
          <label>Гостей<input type="number" min={1} max={20} value={guests} onChange={(event) => setGuests(Number(event.target.value))} /></label>
          <label>Комментарий<textarea rows={3} value={note} onChange={(event) => setNote(event.target.value)} /></label>
        </div>

        {venue ? (
          <div className="summary">
            <span>{guests} гост. · {venue.sessionMinutes} мин.</span>
            <strong>{formatIdr(venue.banyaPrice * guests)}</strong>
            <small>Депозит 25%: {formatIdr(venue.banyaPrice * guests * 0.25)}</small>
          </div>
        ) : null}
        <button className="submit" type="button" disabled={busy || !slot || !name || !phone} onClick={() => void submit()}>
          {busy ? 'Создаём запись…' : 'Забронировать'}
        </button>
        {message ? <p className="message">{message}</p> : null}
      </section>
    </main>
  )
}
