'use client';

import { useEffect, useState } from 'react';
import { 
  Activity, 
  ArrowDownRight, 
  ArrowUpRight, 
  Clock, 
  Calendar,
  Filter,
  Download
} from 'lucide-react';
import { queryEvents, type ParkingEvent } from '../lib/api';

export default function EventsPage() {
  const [events, setEvents] = useState<ParkingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'ARRIVE' | 'LEAVE'>('all');
  const [limit, setLimit] = useState(50);

  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await queryEvents({ 
          limit,
          eventType: filter === 'all' ? undefined : filter
        });
        setEvents(data.events);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load events:', err);
        setLoading(false);
      }
    }
    loadEvents();

    const interval = setInterval(loadEvents, 15000);
    return () => clearInterval(interval);
  }, [filter, limit]);

  const stats = {
    total: events.length,
    arrivals: events.filter(e => e.eventType === 'ARRIVE').length,
    departures: events.filter(e => e.eventType === 'LEAVE').length,
    avgDuration: events
      .filter(e => e.duration)
      .reduce((sum, e) => sum + (e.duration || 0), 0) / 
      Math.max(1, events.filter(e => e.duration).length),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Parking Events</h1>
          <p className="text-slate-400">Real-time parking activity log</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition-colors">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-slate-400 text-sm">Total Events</p>
            </div>
          </div>
        </div>
        <div className="bg-emerald-500/10 rounded-xl border border-emerald-500/20 p-4">
          <div className="flex items-center gap-3">
            <ArrowDownRight className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-2xl font-bold text-emerald-400">{stats.arrivals}</p>
              <p className="text-emerald-400/70 text-sm">Arrivals</p>
            </div>
          </div>
        </div>
        <div className="bg-red-500/10 rounded-xl border border-red-500/20 p-4">
          <div className="flex items-center gap-3">
            <ArrowUpRight className="w-5 h-5 text-red-400" />
            <div>
              <p className="text-2xl font-bold text-red-400">{stats.departures}</p>
              <p className="text-red-400/70 text-sm">Departures</p>
            </div>
          </div>
        </div>
        <div className="bg-blue-500/10 rounded-xl border border-blue-500/20 p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-2xl font-bold text-blue-400">{Math.round(stats.avgDuration)} min</p>
              <p className="text-blue-400/70 text-sm">Avg Duration</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex gap-2">
          {(['all', 'ARRIVE', 'LEAVE'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {f === 'all' ? 'All Events' : f === 'ARRIVE' ? 'Arrivals' : 'Departures'}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-slate-400 text-sm">Show:</span>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
          </select>
        </div>
      </div>

      {/* Events List */}
      <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left p-4 text-sm font-medium text-slate-400">Event</th>
              <th className="text-left p-4 text-sm font-medium text-slate-400">Zone</th>
              <th className="text-left p-4 text-sm font-medium text-slate-400">Bay</th>
              <th className="text-left p-4 text-sm font-medium text-slate-400">Duration</th>
              <th className="text-left p-4 text-sm font-medium text-slate-400">Revenue</th>
              <th className="text-left p-4 text-sm font-medium text-slate-400">Time</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event, idx) => (
              <EventRow key={idx} event={event} />
            ))}
          </tbody>
        </table>

        {events.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            No events found
          </div>
        )}
      </div>
    </div>
  );
}

function EventRow({ event }: { event: ParkingEvent }) {
  const isArrive = event.eventType === 'ARRIVE';
  const time = new Date(event.timestamp);
  const timeStr = time.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <tr className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            isArrive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {isArrive ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
          </div>
          <span className={isArrive ? 'text-emerald-400' : 'text-red-400'}>
            {isArrive ? 'Arrival' : 'Departure'}
          </span>
        </div>
      </td>
      <td className="p-4 text-slate-300">
        {event.zoneId.slice(0, 8)}...
      </td>
      <td className="p-4 text-white font-medium">
        {event.bayNumber}
      </td>
      <td className="p-4 text-slate-300">
        {event.duration ? `${event.duration} min` : '-'}
      </td>
      <td className="p-4 text-slate-300">
        {event.revenue ? `${event.revenue.toFixed(2)} AED` : '-'}
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2 text-slate-400">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">{timeStr}</span>
        </div>
      </td>
    </tr>
  );
}
