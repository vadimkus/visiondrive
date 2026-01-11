'use client';

import { useEffect, useState } from 'react';
import { 
  Radio, 
  Battery, 
  Signal, 
  Clock, 
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { listSensors, type Sensor } from '../lib/api';

export default function SensorsPage() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'low-battery'>('all');

  useEffect(() => {
    async function loadSensors() {
      try {
        const data = await listSensors();
        setSensors(data.sensors);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load sensors:', err);
        setLoading(false);
      }
    }
    loadSensors();

    const interval = setInterval(loadSensors, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredSensors = sensors
    .filter(sensor => 
      sensor.sensorId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sensor.devEui && sensor.devEui.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sensor.model && sensor.model.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .filter(sensor => {
      if (statusFilter === 'all') return true;
      if (statusFilter === 'active') return sensor.status === 'active' || sensor.status === 'ACTIVE';
      if (statusFilter === 'inactive') return sensor.status === 'inactive' || sensor.status === 'INACTIVE';
      if (statusFilter === 'low-battery') return (sensor.batteryLevel || 100) < 20;
      return true;
    });

  const stats = {
    total: sensors.length,
    active: sensors.filter(s => s.status === 'active' || s.status === 'ACTIVE').length,
    inactive: sensors.filter(s => s.status === 'inactive' || s.status === 'INACTIVE').length,
    lowBattery: sensors.filter(s => (s.batteryLevel || 100) < 20).length,
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Sensors</h1>
        <p className="text-slate-400">Monitor and manage parking sensors</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4">
          <div className="flex items-center gap-3">
            <Radio className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-slate-400 text-sm">Total Sensors</p>
            </div>
          </div>
        </div>
        <div className="bg-emerald-500/10 rounded-xl border border-emerald-500/20 p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-2xl font-bold text-emerald-400">{stats.active}</p>
              <p className="text-emerald-400/70 text-sm">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-red-500/10 rounded-xl border border-red-500/20 p-4">
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-400" />
            <div>
              <p className="text-2xl font-bold text-red-400">{stats.inactive}</p>
              <p className="text-red-400/70 text-sm">Inactive</p>
            </div>
          </div>
        </div>
        <div className="bg-amber-500/10 rounded-xl border border-amber-500/20 p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-2xl font-bold text-amber-400">{stats.lowBattery}</p>
              <p className="text-amber-400/70 text-sm">Low Battery</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by ID, DevEUI, or model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'inactive', 'low-battery'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                statusFilter === f
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {f === 'all' ? 'All' : f === 'active' ? 'Active' : f === 'inactive' ? 'Inactive' : 'Low Battery'}
            </button>
          ))}
        </div>
      </div>

      {/* Sensors Table */}
      <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left p-4 text-sm font-medium text-slate-400">Sensor ID</th>
              <th className="text-left p-4 text-sm font-medium text-slate-400">Model</th>
              <th className="text-left p-4 text-sm font-medium text-slate-400">Zone / Bay</th>
              <th className="text-left p-4 text-sm font-medium text-slate-400">Status</th>
              <th className="text-left p-4 text-sm font-medium text-slate-400">Battery</th>
              <th className="text-left p-4 text-sm font-medium text-slate-400">Signal</th>
              <th className="text-left p-4 text-sm font-medium text-slate-400">Last Seen</th>
            </tr>
          </thead>
          <tbody>
            {filteredSensors.map((sensor) => (
              <SensorRow key={sensor.sensorId} sensor={sensor} />
            ))}
          </tbody>
        </table>

        {filteredSensors.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            {searchTerm ? 'No sensors match your search' : 'No sensors registered'}
          </div>
        )}
      </div>
    </div>
  );
}

function SensorRow({ sensor }: { sensor: Sensor }) {
  const isActive = sensor.status === 'active' || sensor.status === 'ACTIVE';
  const batteryLevel = sensor.batteryLevel || 100;
  const isLowBattery = batteryLevel < 20;
  
  const lastSeenTime = sensor.lastSeen ? new Date(sensor.lastSeen) : null;
  const lastSeenStr = lastSeenTime 
    ? lastSeenTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'Never';

  return (
    <tr className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
      <td className="p-4">
        <div>
          <p className="text-white font-medium">{sensor.sensorId.slice(0, 12)}...</p>
          {sensor.devEui && (
            <p className="text-xs text-slate-500">{sensor.devEui}</p>
          )}
        </div>
      </td>
      <td className="p-4 text-slate-300">{sensor.model || 'PSL01B'}</td>
      <td className="p-4 text-slate-300">
        {sensor.zoneId ? (
          <span>{sensor.zoneId.slice(0, 8)}... / {sensor.bayNumber}</span>
        ) : (
          <span className="text-slate-500">Unassigned</span>
        )}
      </td>
      <td className="p-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
          isActive 
            ? 'bg-emerald-500/20 text-emerald-400' 
            : 'bg-red-500/20 text-red-400'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-red-400'}`} />
          {isActive ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          <Battery className={`w-4 h-4 ${isLowBattery ? 'text-red-400' : 'text-emerald-400'}`} />
          <span className={isLowBattery ? 'text-red-400' : 'text-slate-300'}>
            {batteryLevel}%
          </span>
        </div>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          <Signal className="w-4 h-4 text-slate-400" />
          <span className="text-slate-300">
            {sensor.signalStrength || 0} dBm
          </span>
        </div>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2 text-slate-400">
          <Clock className="w-4 h-4" />
          <span className="text-sm">{lastSeenStr}</span>
        </div>
      </td>
    </tr>
  );
}
