'use client';

import { useEffect, useState } from 'react';
import { 
  Car, 
  MapPin, 
  Radio, 
  TrendingUp, 
  Bell,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { listZones, listSensors, queryEvents, type Zone, type ParkingEvent, type Sensor } from './lib/api';

interface DashboardStats {
  totalZones: number;
  totalBays: number;
  totalSensors: number;
  occupiedBays: number;
  vacantBays: number;
  occupancyRate: number;
}

export default function ParkingDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [zones, setZones] = useState<Zone[]>([]);
  const [recentEvents, setRecentEvents] = useState<ParkingEvent[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [zonesData, sensorsData, eventsData] = await Promise.all([
          listZones(),
          listSensors(),
          queryEvents({ limit: 20 }),
        ]);

        setZones(zonesData.zones);
        setSensors(sensorsData.sensors);
        setRecentEvents(eventsData.events);

        // Calculate stats
        const totals = zonesData.zones.reduce(
          (acc, zone) => ({
            totalBays: acc.totalBays + (zone.totalBays || 0),
            occupiedBays: acc.occupiedBays + (zone.occupiedBays || 0),
          }),
          { totalBays: 0, occupiedBays: 0 }
        );

        setStats({
          totalZones: zonesData.zones.length,
          totalBays: totals.totalBays,
          totalSensors: sensorsData.count,
          occupiedBays: totals.occupiedBays,
          vacantBays: totals.totalBays - totals.occupiedBays,
          occupancyRate: totals.totalBays > 0 
            ? Math.round((totals.occupiedBays / totals.totalBays) * 100) 
            : 0,
        });

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setLoading(false);
      }
    }

    loadData();
    // Refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Parking Dashboard</h1>
        <p className="text-slate-400">Real-time parking occupancy and sensor status</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Zones"
          value={stats?.totalZones || 0}
          icon={MapPin}
          color="emerald"
          href="/portal/parking/zones"
        />
        <StatCard
          title="Parking Bays"
          value={stats?.totalBays || 0}
          subtitle={`${stats?.occupiedBays || 0} occupied`}
          icon={Car}
          color="blue"
        />
        <StatCard
          title="Active Sensors"
          value={stats?.totalSensors || 0}
          icon={Radio}
          color="purple"
          href="/portal/parking/sensors"
        />
        <StatCard
          title="Occupancy Rate"
          value={`${stats?.occupancyRate || 0}%`}
          icon={TrendingUp}
          color="amber"
          trend={stats?.occupancyRate && stats.occupancyRate > 50 ? 'up' : 'down'}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Zones List */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Parking Zones</h2>
              <Link 
                href="/portal/parking/zones"
                className="text-sm text-emerald-400 hover:text-emerald-300"
              >
                View all →
              </Link>
            </div>

            <div className="space-y-4">
              {zones.slice(0, 6).map((zone) => (
                <ZoneCard key={zone.zoneId} zone={zone} />
              ))}
              
              {zones.length === 0 && (
                <p className="text-slate-500 text-center py-8">No zones configured</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Events */}
        <div>
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Recent Events</h2>
              <Link 
                href="/portal/parking/events"
                className="text-sm text-emerald-400 hover:text-emerald-300"
              >
                View all →
              </Link>
            </div>

            <div className="space-y-3">
              {recentEvents.slice(0, 8).map((event, idx) => (
                <EventRow key={idx} event={event} />
              ))}
              
              {recentEvents.length === 0 && (
                <p className="text-slate-500 text-center py-8">No recent events</p>
              )}
            </div>
          </div>

          {/* Sensor Health */}
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 p-6 mt-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Sensor Health</h2>
              <Link 
                href="/portal/parking/sensors"
                className="text-sm text-emerald-400 hover:text-emerald-300"
              >
                View all →
              </Link>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Online</span>
                <span className="text-emerald-400 font-medium">
                  {sensors.filter(s => s.status === 'active' || s.status === 'ACTIVE').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Low Battery</span>
                <span className="text-amber-400 font-medium">
                  {sensors.filter(s => (s.batteryLevel || 100) < 20).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Offline</span>
                <span className="text-red-400 font-medium">
                  {sensors.filter(s => s.status === 'inactive' || s.status === 'INACTIVE').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ 
  title, 
  value, 
  subtitle,
  icon: Icon, 
  color,
  href,
  trend
}: { 
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ElementType;
  color: 'emerald' | 'blue' | 'purple' | 'amber';
  href?: string;
  trend?: 'up' | 'down';
}) {
  const colorClasses = {
    emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 text-emerald-400',
    blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/20 text-blue-400',
    purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/20 text-purple-400',
    amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/20 text-amber-400',
  };

  const content = (
    <div className={`p-6 rounded-2xl bg-gradient-to-br ${colorClasses[color]} border backdrop-blur-xl transition-transform hover:scale-[1.02]`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-${color}-500/20`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          </div>
        )}
      </div>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-slate-400">{title}</p>
      {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

// Zone Card Component
function ZoneCard({ zone }: { zone: Zone }) {
  const occupancyColor = zone.occupancyRate > 80 
    ? 'text-red-400' 
    : zone.occupancyRate > 50 
      ? 'text-amber-400' 
      : 'text-emerald-400';

  return (
    <Link 
      href={`/portal/parking/zones/${zone.zoneId}`}
      className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors border border-slate-700/50"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-700/50 flex items-center justify-center">
          <Car className="w-6 h-6 text-slate-400" />
        </div>
        <div>
          <h3 className="font-medium text-white">{zone.name}</h3>
          <p className="text-sm text-slate-500">
            {zone.totalBays} bays • {zone.kind || 'Standard'}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-lg font-bold ${occupancyColor}`}>
          {zone.occupancyRate}%
        </p>
        <p className="text-xs text-slate-500">
          {zone.occupiedBays}/{zone.totalBays} occupied
        </p>
      </div>
    </Link>
  );
}

// Event Row Component
function EventRow({ event }: { event: ParkingEvent }) {
  const isArrive = event.eventType === 'ARRIVE';
  const time = new Date(event.timestamp);
  const timeAgo = getTimeAgo(time);

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30">
      <div className={`p-2 rounded-lg ${isArrive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
        {isArrive ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white truncate">
          Bay {event.bayNumber}
        </p>
        <p className="text-xs text-slate-500">
          {isArrive ? 'Vehicle arrived' : 'Vehicle left'}
          {event.duration && ` • ${event.duration} min`}
        </p>
      </div>
      <div className="flex items-center gap-1 text-xs text-slate-500">
        <Clock className="w-3 h-3" />
        {timeAgo}
      </div>
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
