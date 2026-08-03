'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

type Ticket = {
  id: string
  name: string
  qty: number
  status: string
  sentAt: string | null
  guestName: string
  station: string
  priority: number
}

export default function KdsClient({ venueName }: { venueName: string }) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [station, setStation] = useState('ALL')
  const [now, setNow] = useState(0)
  const [sound, setSound] = useState(true)
  const previous = useRef(0)

  const load = useCallback(async () => {
    const day = new Date().toISOString().slice(0, 10)
    const res = await fetch(`/api/amme/state?day=${day}`)
    const data = await res.json()
    if (res.ok && data.success) setTickets(data.kitchen || [])
  }, [])

  useEffect(() => {
    const firstLoad = setTimeout(() => void load(), 0)
    const poll = setInterval(() => void load(), 4_000)
    const firstClock = setTimeout(() => setNow(Date.now()), 0)
    const clock = setInterval(() => setNow(Date.now()), 15_000)
    const source = new EventSource('/api/amme/events')
    source.onmessage = () => void load()
    ;['send_kitchen', 'line_done', 'line_qty_changed'].forEach((event) =>
      source.addEventListener(event, () => void load())
    )
    return () => {
      clearInterval(poll)
      clearTimeout(firstLoad)
      clearTimeout(firstClock)
      clearInterval(clock)
      source.close()
    }
  }, [load])

  useEffect(() => {
    const count = tickets.filter((ticket) => ticket.status === 'SENT').length
    if (sound && count > previous.current && previous.current > 0) {
      try {
        const audio = new AudioContext()
        const oscillator = audio.createOscillator()
        oscillator.frequency.value = 880
        oscillator.connect(audio.destination)
        oscillator.start()
        oscillator.stop(audio.currentTime + 0.14)
      } catch {}
    }
    previous.current = count
  }, [sound, tickets])

  const stations = useMemo(
    () => [...new Set(tickets.map((ticket) => ticket.station || 'Кухня'))],
    [tickets]
  )
  const open = tickets
    .filter((ticket) => ticket.status === 'SENT' && (station === 'ALL' || ticket.station === station))
    .sort(
      (a, b) =>
        b.priority - a.priority ||
        new Date(a.sentAt || 0).getTime() - new Date(b.sentAt || 0).getTime()
    )

  async function done(id: string) {
    await fetch('/api/amme/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'done', lineId: id }),
    })
    void load()
  }

  return (
    <div className="amme-kds-full">
      <header>
        <div><strong>{venueName}</strong><span>KITCHEN DISPLAY</span></div>
        <nav>
          <button className={station === 'ALL' ? 'on' : ''} onClick={() => setStation('ALL')}>Все</button>
          {stations.map((item) => <button key={item} className={station === item ? 'on' : ''} onClick={() => setStation(item)}>{item}</button>)}
        </nav>
        <button className={sound ? 'on' : ''} onClick={() => setSound((value) => !value)}>Звук {sound ? 'ON' : 'OFF'}</button>
      </header>
      <main>
        {open.length === 0 ? <div className="empty">Очередь пуста</div> : null}
        {open.map((ticket) => {
          const minutes = ticket.sentAt && now
            ? Math.floor((now - new Date(ticket.sentAt).getTime()) / 60_000)
            : 0
          const urgency = minutes >= 10 ? 'hot' : minutes >= 5 ? 'warn' : 'ok'
          return (
            <article key={ticket.id} className={urgency}>
              <div className="ticket-head"><strong>{ticket.guestName}</strong><b>{minutes}м</b></div>
              <div className="station">{ticket.station}</div>
              <div className="dish">{ticket.qty}× {ticket.name}</div>
              <button onClick={() => void done(ticket.id)}>ОТДАНО</button>
            </article>
          )
        })}
      </main>
    </div>
  )
}
