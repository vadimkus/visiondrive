'use client';

import { useState } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  Battery, 
  Wifi,
  CheckCircle,
  Clock,
  Filter
} from 'lucide-react';

// Mock alerts for now - would come from API
const mockAlerts = [
  {
    id: '1',
    type: 'LOW_BATTERY',
    severity: 'warning',
    title: 'Low Battery Alert',
    message: 'Sensor PSL01B-012 battery at 15%',
    sensorId: 'PSL01B-012',
    zoneId: 'zone-001',
    openedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'open',
  },
  {
    id: '2',
    type: 'OFFLINE',
    severity: 'critical',
    title: 'Sensor Offline',
    message: 'Sensor PSL01B-005 has not reported for 2 hours',
    sensorId: 'PSL01B-005',
    zoneId: 'zone-002',
    openedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    status: 'open',
  },
  {
    id: '3',
    type: 'LOW_BATTERY',
    severity: 'warning',
    title: 'Low Battery Alert',
    message: 'Sensor PSL01B-023 battery at 18%',
    sensorId: 'PSL01B-023',
    zoneId: 'zone-001',
    openedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    status: 'acknowledged',
    acknowledgedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
  },
];

type Alert = typeof mockAlerts[0];

export default function AlertsPage() {
  const [alerts] = useState<Alert[]>(mockAlerts);
  const [filter, setFilter] = useState<'all' | 'open' | 'acknowledged'>('all');

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    return alert.status === filter;
  });

  const stats = {
    total: alerts.length,
    open: alerts.filter(a => a.status === 'open').length,
    critical: alerts.filter(a => a.severity === 'critical' && a.status === 'open').length,
    acknowledged: alerts.filter(a => a.status === 'acknowledged').length,
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Alerts</h1>
        <p className="text-slate-400">Monitor and manage system alerts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-slate-400 text-sm">Total Alerts</p>
            </div>
          </div>
        </div>
        <div className="bg-red-500/10 rounded-xl border border-red-500/20 p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <div>
              <p className="text-2xl font-bold text-red-400">{stats.critical}</p>
              <p className="text-red-400/70 text-sm">Critical</p>
            </div>
          </div>
        </div>
        <div className="bg-amber-500/10 rounded-xl border border-amber-500/20 p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-2xl font-bold text-amber-400">{stats.open}</p>
              <p className="text-amber-400/70 text-sm">Open</p>
            </div>
          </div>
        </div>
        <div className="bg-emerald-500/10 rounded-xl border border-emerald-500/20 p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-2xl font-bold text-emerald-400">{stats.acknowledged}</p>
              <p className="text-emerald-400/70 text-sm">Acknowledged</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex gap-2">
          {(['all', 'open', 'acknowledged'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {f === 'all' ? 'All' : f === 'open' ? 'Open' : 'Acknowledged'}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <AlertCard key={alert.id} alert={alert} />
        ))}

        {filteredAlerts.length === 0 && (
          <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800">
            <Bell className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No alerts to display</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AlertCard({ alert }: { alert: Alert }) {
  const getIcon = () => {
    switch (alert.type) {
      case 'LOW_BATTERY':
        return Battery;
      case 'OFFLINE':
        return Wifi;
      default:
        return AlertTriangle;
    }
  };

  const Icon = getIcon();
  const isCritical = alert.severity === 'critical';
  const isOpen = alert.status === 'open';

  const time = new Date(alert.openedAt);
  const timeAgo = getTimeAgo(time);

  return (
    <div className={`p-6 rounded-2xl border backdrop-blur-xl ${
      isCritical 
        ? 'bg-red-500/10 border-red-500/20' 
        : 'bg-amber-500/10 border-amber-500/20'
    }`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${
          isCritical ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
        }`}>
          <Icon className="w-6 h-6" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-white">{alert.title}</h3>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              isCritical 
                ? 'bg-red-500/20 text-red-400' 
                : 'bg-amber-500/20 text-amber-400'
            }`}>
              {alert.severity}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              isOpen 
                ? 'bg-slate-500/20 text-slate-400' 
                : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              {alert.status}
            </span>
          </div>

          <p className="text-slate-400 text-sm mb-3">{alert.message}</p>

          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>Sensor: {alert.sensorId}</span>
            <span>•</span>
            <span>Opened {timeAgo}</span>
            {alert.acknowledgedAt && (
              <>
                <span>•</span>
                <span>Acknowledged {getTimeAgo(new Date(alert.acknowledgedAt))}</span>
              </>
            )}
          </div>
        </div>

        {isOpen && (
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 text-sm">
              Acknowledge
            </button>
            <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm">
              Resolve
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}
