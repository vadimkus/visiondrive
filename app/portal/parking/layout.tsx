'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutGrid, 
  Map, 
  Car, 
  Activity, 
  Bell, 
  Settings,
  Radio,
  BarChart3
} from 'lucide-react';

const navItems = [
  { href: '/portal/parking', label: 'Dashboard', icon: LayoutGrid, exact: true },
  { href: '/portal/parking/map', label: 'Live Map', icon: Map },
  { href: '/portal/parking/zones', label: 'Zones', icon: Car },
  { href: '/portal/parking/sensors', label: 'Sensors', icon: Radio },
  { href: '/portal/parking/events', label: 'Events', icon: Activity },
  { href: '/portal/parking/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/portal/parking/alerts', label: 'Alerts', icon: Bell },
  { href: '/portal/parking/settings', label: 'Settings', icon: Settings },
];

export default function ParkingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white">VisionDrive</h1>
              <p className="text-xs text-slate-400">Parking System</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href, item.exact);
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-emerald-400' : ''}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Status indicator */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-slate-400">System Online</span>
            </div>
            <p className="text-xs text-slate-500">
              IoT: Connected • API: Active
            </p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
