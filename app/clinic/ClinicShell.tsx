'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  ListOrdered,
  Calendar,
  LogOut,
  Stethoscope,
  UserCircle,
} from 'lucide-react'
import clsx from 'clsx'
import { visiondriveSlogan } from '@/lib/brand'

const nav = [
  { href: '/clinic', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clinic/patients', label: 'Patients', icon: Users },
  { href: '/clinic/procedures', label: 'Procedures', icon: ListOrdered },
  { href: '/clinic/appointments', label: 'Appointments', icon: Calendar },
  { href: '/clinic/account', label: 'Account', icon: UserCircle },
]

export default function ClinicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col md:flex-row">
      <aside className="md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-gray-200 bg-white md:min-h-screen">
        <div className="p-4 flex md:flex-col gap-3 md:gap-6 items-center md:items-stretch justify-between md:justify-start">
          <Link href="/clinic" className="flex items-center gap-2 md:px-2">
            <div className="w-9 h-9 rounded-xl bg-orange-500/15 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-orange-600" aria-hidden />
            </div>
            <div className="hidden md:block min-w-0">
              <p className="text-sm font-semibold text-gray-900 leading-tight">Practice OS</p>
              <p className="text-[11px] text-gray-500 leading-snug">VisionDrive</p>
              <p className="text-[10px] text-gray-400 leading-snug mt-0.5">{visiondriveSlogan.en}</p>
            </div>
          </Link>
          <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-1 md:pb-0">
            {nav.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href !== '/clinic' && pathname.startsWith(href + '/'))
              return (
                <Link
                  key={href}
                  href={href}
                  className={clsx(
                    'flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors',
                    active
                      ? 'bg-orange-50 text-orange-800'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" aria-hidden />
                  {label}
                </Link>
              )
            })}
          </nav>
          <div className="flex items-center gap-2 md:flex-col md:mt-auto md:pt-6">
            <Link
              href="/"
              className="hidden md:block text-xs text-gray-500 hover:text-orange-600 px-2"
            >
              visiondrive.ae
            </Link>
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-100"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Sign out</span>
            </button>
          </div>
        </div>
      </aside>
      <div className="flex-1 min-w-0 p-4 md:p-8">{children}</div>
    </div>
  )
}
