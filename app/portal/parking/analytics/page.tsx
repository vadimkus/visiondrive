'use client';

import { useEffect, useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  DollarSign,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { listZones, queryEvents, type Zone, type ParkingEvent } from '../lib/api';

export default function AnalyticsPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [events, setEvents] = useState<ParkingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');

  useEffect(() => {
    async function loadData() {
      try {
        const [zonesData, eventsData] = await Promise.all([
          listZones(),
          queryEvents({ limit: 500 }),
        ]);
        setZones(zonesData.zones);
        setEvents(eventsData.events);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load analytics:', err);
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Calculate analytics
  const totalBays = zones.reduce((sum, z) => sum + (z.totalBays || 0), 0);
  const occupiedBays = zones.reduce((sum, z) => sum + (z.occupiedBays || 0), 0);
  const avgOccupancy = totalBays > 0 ? Math.round((occupiedBays / totalBays) * 100) : 0;

  const arrivals = events.filter(e => e.eventType === 'ARRIVE').length;
  const departures = events.filter(e => e.eventType === 'LEAVE').length;
  
  const durations = events.filter(e => e.duration).map(e => e.duration!);
  const avgDuration = durations.length > 0 
    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    : 0;

  const revenues = events.filter(e => e.revenue).map(e => e.revenue!);
  const totalRevenue = revenues.reduce((a, b) => a + b, 0);

  // Peak hours calculation
  const hourCounts: Record<number, number> = {};
  events.forEach(e => {
    const hour = new Date(e.timestamp).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });
  
  const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];

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
          <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
          <p className="text-slate-400">Parking usage statistics and insights</p>
        </div>
        <div className="flex gap-2">
          {(['day', 'week', 'month'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {p === 'day' ? 'Today' : p === 'week' ? 'This Week' : 'This Month'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Avg Occupancy"
          value={`${avgOccupancy}%`}
          change={+5}
          icon={TrendingUp}
          color="emerald"
        />
        <KPICard
          title="Total Events"
          value={events.length}
          subtitle={`${arrivals} arrivals, ${departures} departures`}
          icon={BarChart3}
          color="blue"
        />
        <KPICard
          title="Avg Duration"
          value={`${avgDuration} min`}
          change={-3}
          icon={Clock}
          color="purple"
        />
        <KPICard
          title="Est. Revenue"
          value={`${totalRevenue.toFixed(0)} AED`}
          change={+12}
          icon={DollarSign}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Zone Performance */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Zone Performance</h2>
          
          <div className="space-y-4">
            {zones.slice(0, 8).map((zone) => (
              <div key={zone.zoneId} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-white truncate">{zone.name}</span>
                    <span className={`text-sm font-medium ${
                      zone.occupancyRate >= 80 ? 'text-red-400' :
                      zone.occupancyRate >= 40 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>{zone.occupancyRate}%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        zone.occupancyRate >= 80 ? 'bg-red-500' :
                        zone.occupancyRate >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${zone.occupancyRate}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hourly Distribution */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Hourly Activity</h2>
          
          <div className="flex items-end gap-1 h-48">
            {Array.from({ length: 24 }, (_, hour) => {
              const count = hourCounts[hour] || 0;
              const maxCount = Math.max(...Object.values(hourCounts), 1);
              const height = (count / maxCount) * 100;
              
              return (
                <div key={hour} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-emerald-500/50 rounded-t transition-all hover:bg-emerald-500"
                    style={{ height: `${height}%`, minHeight: count > 0 ? '4px' : '0' }}
                    title={`${hour}:00 - ${count} events`}
                  />
                  {hour % 4 === 0 && (
                    <span className="text-xs text-slate-500 mt-2">{hour}</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Peak Hour</span>
              <span className="text-white font-medium">
                {peakHour ? `${peakHour[0]}:00 - ${peakHour[1]} events` : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Trends */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Quick Stats</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 rounded-xl bg-slate-800/50">
              <span className="text-slate-400">Busiest Zone</span>
              <span className="text-white font-medium">
                {zones.length > 0 
                  ? zones.sort((a, b) => b.occupancyRate - a.occupancyRate)[0].name.slice(0, 20)
                  : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 rounded-xl bg-slate-800/50">
              <span className="text-slate-400">Longest Stay</span>
              <span className="text-white font-medium">
                {durations.length > 0 ? `${Math.max(...durations)} min` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 rounded-xl bg-slate-800/50">
              <span className="text-slate-400">Total Zones</span>
              <span className="text-white font-medium">{zones.length}</span>
            </div>
            <div className="flex justify-between items-center p-4 rounded-xl bg-slate-800/50">
              <span className="text-slate-400">Total Capacity</span>
              <span className="text-white font-medium">{totalBays} bays</span>
            </div>
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Revenue Insights</h2>
          
          <div className="text-center py-8">
            <p className="text-5xl font-bold text-emerald-400 mb-2">
              {totalRevenue.toFixed(0)}
            </p>
            <p className="text-slate-400">AED Total Revenue</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-slate-800/50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-white">
                {departures > 0 ? (totalRevenue / departures).toFixed(1) : 0}
              </p>
              <p className="text-xs text-slate-400">AED per session</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-white">{departures}</p>
              <p className="text-xs text-slate-400">Completed sessions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({
  title,
  value,
  subtitle,
  change,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number;
  icon: React.ElementType;
  color: 'emerald' | 'blue' | 'purple' | 'amber';
}) {
  const colorClasses = {
    emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20',
    blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/20',
    purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/20',
    amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/20',
  };

  const iconColors = {
    emerald: 'text-emerald-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    amber: 'text-amber-400',
  };

  return (
    <div className={`p-6 rounded-2xl bg-gradient-to-br ${colorClasses[color]} border backdrop-blur-xl`}>
      <div className="flex items-center justify-between mb-4">
        <Icon className={`w-6 h-6 ${iconColors[color]}`} />
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-slate-400">{title}</p>
      {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
    </div>
  );
}
