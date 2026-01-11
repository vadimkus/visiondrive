'use client';

import { useEffect, useState } from 'react';
import { Car, MapPin, Clock, DollarSign, Search, Plus } from 'lucide-react';
import Link from 'next/link';
import { listZones, type Zone } from '../lib/api';

export default function ZonesPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  useEffect(() => {
    async function loadZones() {
      try {
        const data = await listZones();
        setZones(data.zones);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load zones:', err);
        setLoading(false);
      }
    }
    loadZones();
  }, []);

  const filteredZones = zones
    .filter(zone => 
      zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (zone.address && zone.address.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .filter(zone => {
      if (filter === 'all') return true;
      if (filter === 'high') return zone.occupancyRate >= 80;
      if (filter === 'medium') return zone.occupancyRate >= 40 && zone.occupancyRate < 80;
      if (filter === 'low') return zone.occupancyRate < 40;
      return true;
    });

  const stats = {
    totalZones: zones.length,
    totalBays: zones.reduce((sum, z) => sum + (z.totalBays || 0), 0),
    occupiedBays: zones.reduce((sum, z) => sum + (z.occupiedBays || 0), 0),
    avgOccupancy: zones.length > 0 
      ? Math.round(zones.reduce((sum, z) => sum + (z.occupancyRate || 0), 0) / zones.length)
      : 0,
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
          <h1 className="text-3xl font-bold text-white mb-2">Parking Zones</h1>
          <p className="text-slate-400">Manage and monitor all parking zones</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors">
          <Plus className="w-4 h-4" />
          Add Zone
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4">
          <p className="text-slate-400 text-sm">Total Zones</p>
          <p className="text-2xl font-bold text-white">{stats.totalZones}</p>
        </div>
        <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4">
          <p className="text-slate-400 text-sm">Total Bays</p>
          <p className="text-2xl font-bold text-white">{stats.totalBays}</p>
        </div>
        <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4">
          <p className="text-slate-400 text-sm">Occupied</p>
          <p className="text-2xl font-bold text-emerald-400">{stats.occupiedBays}</p>
        </div>
        <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4">
          <p className="text-slate-400 text-sm">Avg Occupancy</p>
          <p className="text-2xl font-bold text-amber-400">{stats.avgOccupancy}%</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search zones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'high', 'medium', 'low'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {f === 'all' ? 'All' : f === 'high' ? '≥80%' : f === 'medium' ? '40-80%' : '<40%'}
            </button>
          ))}
        </div>
      </div>

      {/* Zones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredZones.map((zone) => (
          <ZoneCard key={zone.zoneId} zone={zone} />
        ))}
      </div>

      {filteredZones.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          {searchTerm ? 'No zones match your search' : 'No zones configured'}
        </div>
      )}
    </div>
  );
}

function ZoneCard({ zone }: { zone: Zone }) {
  const occupancyColor = zone.occupancyRate >= 80 
    ? 'from-red-500/20 to-red-500/5 border-red-500/20' 
    : zone.occupancyRate >= 40 
      ? 'from-amber-500/20 to-amber-500/5 border-amber-500/20' 
      : 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20';

  const textColor = zone.occupancyRate >= 80 
    ? 'text-red-400' 
    : zone.occupancyRate >= 40 
      ? 'text-amber-400' 
      : 'text-emerald-400';

  return (
    <Link href={`/portal/parking/zones/${zone.zoneId}`}>
      <div className={`p-6 rounded-2xl bg-gradient-to-br ${occupancyColor} border backdrop-blur-xl transition-all hover:scale-[1.02] cursor-pointer`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-800/50 flex items-center justify-center">
              <Car className="w-6 h-6 text-slate-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">{zone.name}</h3>
              <p className="text-sm text-slate-400">{zone.kind || 'Standard'}</p>
            </div>
          </div>
          <div className={`text-2xl font-bold ${textColor}`}>
            {zone.occupancyRate}%
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-xs text-slate-500 mb-1">Total</p>
            <p className="text-lg font-semibold text-white">{zone.totalBays || 0}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Occupied</p>
            <p className="text-lg font-semibold text-emerald-400">{zone.occupiedBays || 0}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Vacant</p>
            <p className="text-lg font-semibold text-slate-400">{zone.vacantBays || 0}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all ${
              zone.occupancyRate >= 80 ? 'bg-red-500' : zone.occupancyRate >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${zone.occupancyRate || 0}%` }}
          />
        </div>

        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-700/50">
          {zone.location && (
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <MapPin className="w-3 h-3" />
              <span>{zone.city || 'Dubai'}</span>
            </div>
          )}
          {zone.operatingHours && (
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Clock className="w-3 h-3" />
              <span>{zone.operatingHours.open} - {zone.operatingHours.close}</span>
            </div>
          )}
          {typeof zone.pricePerHour === 'number' && (
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <DollarSign className="w-3 h-3" />
              <span>{zone.pricePerHour} AED/hr</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
