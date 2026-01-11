'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  Car, 
  ArrowLeft, 
  Clock, 
  MapPin, 
  Radio,
  Activity,
  Battery,
  Signal
} from 'lucide-react';
import Link from 'next/link';
import { getZone, listBays, getZoneEvents, type Zone, type Bay, type ParkingEvent } from '../../lib/api';

export default function ZoneDetailPage() {
  const params = useParams();
  const zoneId = params.id as string;

  const [zone, setZone] = useState<Zone | null>(null);
  const [bays, setBays] = useState<Bay[]>([]);
  const [events, setEvents] = useState<ParkingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [zoneData, baysData, eventsData] = await Promise.all([
          getZone(zoneId),
          listBays(zoneId),
          getZoneEvents(zoneId, { limit: 20 }),
        ]);

        setZone(zoneData);
        setBays(baysData.bays);
        setEvents(eventsData.events);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load zone:', err);
        setLoading(false);
      }
    }

    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [zoneId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
      </div>
    );
  }

  if (!zone) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-400">Zone not found</p>
      </div>
    );
  }

  const occupiedCount = bays.filter(b => b.status === 'occupied').length;
  const vacantCount = bays.filter(b => b.status === 'vacant').length;
  const unknownCount = bays.filter(b => b.status === 'unknown').length;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/portal/parking/zones"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Zones
        </Link>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 flex items-center justify-center">
              <Car className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{zone.name}</h1>
              <div className="flex items-center gap-4 mt-1 text-slate-400">
                {zone.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {zone.city}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {zone.operatingHours?.open || '00:00'} - {zone.operatingHours?.close || '23:59'}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-4xl font-bold ${
              zone.occupancyRate >= 80 ? 'text-red-400' : 
              zone.occupancyRate >= 40 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {zone.occupancyRate}%
            </p>
            <p className="text-slate-400">Occupancy</p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4">
          <p className="text-slate-400 text-sm">Total Bays</p>
          <p className="text-2xl font-bold text-white">{bays.length}</p>
        </div>
        <div className="bg-emerald-500/10 rounded-xl border border-emerald-500/20 p-4">
          <p className="text-emerald-400 text-sm">Occupied</p>
          <p className="text-2xl font-bold text-emerald-400">{occupiedCount}</p>
        </div>
        <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4">
          <p className="text-slate-400 text-sm">Vacant</p>
          <p className="text-2xl font-bold text-slate-300">{vacantCount}</p>
        </div>
        <div className="bg-amber-500/10 rounded-xl border border-amber-500/20 p-4">
          <p className="text-amber-400 text-sm">Unknown</p>
          <p className="text-2xl font-bold text-amber-400">{unknownCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bay Grid */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Parking Bays</h2>
            
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
              {bays.map((bay) => (
                <BayTile key={bay.bayNumber} bay={bay} />
              ))}
            </div>

            <div className="flex items-center gap-6 mt-6 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-emerald-500" />
                <span className="text-sm text-slate-400">Occupied</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-slate-600" />
                <span className="text-sm text-slate-400">Vacant</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-amber-500" />
                <span className="text-sm text-slate-400">Unknown</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Events */}
        <div>
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Recent Activity</h2>
            
            <div className="space-y-3">
              {events.slice(0, 10).map((event, idx) => (
                <EventRow key={idx} event={event} />
              ))}

              {events.length === 0 && (
                <p className="text-slate-500 text-center py-8">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BayTile({ bay }: { bay: Bay }) {
  const statusColors = {
    occupied: 'bg-emerald-500 hover:bg-emerald-400',
    vacant: 'bg-slate-600 hover:bg-slate-500',
    unknown: 'bg-amber-500 hover:bg-amber-400',
  };

  return (
    <div
      className={`aspect-square rounded-lg ${statusColors[bay.status]} transition-colors cursor-pointer flex items-center justify-center`}
      title={`Bay ${bay.bayNumber} - ${bay.status}`}
    >
      <span className="text-xs font-medium text-white/80">
        {String(bay.bayNumber).slice(-2)}
      </span>
    </div>
  );
}

function EventRow({ event }: { event: ParkingEvent }) {
  const isArrive = event.eventType === 'ARRIVE';
  const time = new Date(event.timestamp);
  const timeStr = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30">
      <div className={`w-2 h-2 rounded-full ${isArrive ? 'bg-emerald-500' : 'bg-red-500'}`} />
      <div className="flex-1">
        <p className="text-sm text-white">
          Bay {event.bayNumber}
        </p>
        <p className="text-xs text-slate-500">
          {isArrive ? 'Arrived' : 'Left'}
          {event.duration && ` • ${event.duration} min`}
        </p>
      </div>
      <span className="text-xs text-slate-500">{timeStr}</span>
    </div>
  );
}
