'use client';

import { useEffect, useState } from 'react';
import { 
  MapPin, 
  Maximize2,
  Layers,
  Car
} from 'lucide-react';
import { listZones, type Zone } from '../lib/api';

export default function MapPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Live Map</h1>
            <p className="text-sm text-slate-400">Real-time parking zone visualization</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors">
              <Layers className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors">
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        {/* Map Placeholder - In production, integrate with Mapbox or Google Maps */}
        <div className="absolute inset-0 bg-slate-900">
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-12 h-12 text-slate-600" />
              </div>
              <p className="text-slate-400 mb-2">Map Integration</p>
              <p className="text-slate-500 text-sm">
                Connect Mapbox or Google Maps API to display live parking zones
              </p>
            </div>
          </div>
          
          {/* Zone Grid Overlay */}
          <div className="absolute inset-4 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 pointer-events-none">
            {zones.slice(0, 12).map((zone) => (
              <ZoneMarker 
                key={zone.zoneId} 
                zone={zone} 
                onClick={() => setSelectedZone(zone)}
              />
            ))}
          </div>
        </div>

        {/* Zone List Sidebar */}
        <div className="absolute left-4 top-4 bottom-4 w-80 bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <h2 className="font-semibold text-white">Parking Zones</h2>
            <p className="text-sm text-slate-400">{zones.length} zones</p>
          </div>
          
          <div className="overflow-y-auto max-h-[calc(100%-70px)]">
            {zones.map((zone) => (
              <button
                key={zone.zoneId}
                onClick={() => setSelectedZone(zone)}
                className={`w-full p-4 text-left border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors ${
                  selectedZone?.zoneId === zone.zoneId ? 'bg-slate-800/50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">{zone.name}</p>
                    <p className="text-xs text-slate-500">
                      {zone.occupiedBays}/{zone.totalBays} occupied
                    </p>
                  </div>
                  <div className={`text-lg font-bold ${
                    zone.occupancyRate >= 80 ? 'text-red-400' :
                    zone.occupancyRate >= 40 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {zone.occupancyRate}%
                  </div>
                </div>
                <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${
                      zone.occupancyRate >= 80 ? 'bg-red-500' :
                      zone.occupancyRate >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${zone.occupancyRate}%` }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Zone Detail */}
        {selectedZone && (
          <div className="absolute right-4 top-4 w-80 bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-800 p-6">
            <button
              onClick={() => setSelectedZone(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              ×
            </button>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Car className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">{selectedZone.name}</h3>
                <p className="text-sm text-slate-400">{selectedZone.kind || 'Standard'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-800/50 rounded-xl p-3">
                <p className="text-xs text-slate-500">Occupied</p>
                <p className="text-xl font-bold text-emerald-400">{selectedZone.occupiedBays}</p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-3">
                <p className="text-xs text-slate-500">Vacant</p>
                <p className="text-xl font-bold text-slate-300">{selectedZone.vacantBays}</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-400">Occupancy</span>
                <span className={
                  selectedZone.occupancyRate >= 80 ? 'text-red-400' :
                  selectedZone.occupancyRate >= 40 ? 'text-amber-400' : 'text-emerald-400'
                }>{selectedZone.occupancyRate}%</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${
                    selectedZone.occupancyRate >= 80 ? 'bg-red-500' :
                    selectedZone.occupancyRate >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${selectedZone.occupancyRate}%` }}
                />
              </div>
            </div>

            <a
              href={`/portal/parking/zones/${selectedZone.zoneId}`}
              className="block w-full text-center py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              View Details
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function ZoneMarker({ zone, onClick }: { zone: Zone; onClick: () => void }) {
  const color = zone.occupancyRate >= 80 ? 'bg-red-500' :
    zone.occupancyRate >= 40 ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <button
      onClick={onClick}
      className="pointer-events-auto flex flex-col items-center justify-center p-4 rounded-xl bg-slate-800/80 backdrop-blur-sm border border-slate-700 hover:border-emerald-500 transition-all hover:scale-105"
    >
      <div className={`w-4 h-4 rounded-full ${color} mb-2`} />
      <p className="text-xs text-white text-center truncate w-full">{zone.name}</p>
      <p className="text-lg font-bold text-white">{zone.occupancyRate}%</p>
    </button>
  );
}
