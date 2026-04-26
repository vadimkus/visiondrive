'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  ListOrdered,
  Package,
  ShoppingCart,
  CircleDollarSign,
  Calendar,
  LogOut,
  Stethoscope,
  UserCircle,
} from 'lucide-react'
import clsx from 'clsx'
import { visiondriveSlogan } from '@/lib/brand'
import { useClinicLocale } from '@/lib/clinic/clinic-locale'
import type { ClinicLocale } from '@/lib/clinic/strings'

const nav = [
  { href: '/clinic', labelKey: 'dashboard' as const, icon: LayoutDashboard },
  { href: '/clinic/patients', labelKey: 'patients' as const, icon: Users },
  { href: '/clinic/procedures', labelKey: 'procedures' as const, icon: ListOrdered },
  { href: '/clinic/inventory', labelKey: 'inventory' as const, icon: Package },
  { href: '/clinic/purchase-orders', labelKey: 'purchaseOrders' as const, icon: ShoppingCart },
  { href: '/clinic/finance', labelKey: 'finance' as const, icon: CircleDollarSign },
  { href: '/clinic/appointments', labelKey: 'appointments' as const, icon: Calendar },
  { href: '/clinic/account', labelKey: 'account' as const, icon: UserCircle },
]

export default function ClinicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { locale, setLocale, t } = useClinicLocale()

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    router.push('/login')
    router.refresh()
  }

  const slogan = locale === 'ru' ? visiondriveSlogan.ru : visiondriveSlogan.en

  return (
    <div
      className="min-h-screen bg-[#f5f5f7] flex flex-col md:flex-row pb-[env(safe-area-inset-bottom)]"
      dir="ltr"
      lang={locale}
    >
      <aside className="md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-gray-200 bg-white md:min-h-screen md:shadow-[inset_-1px_0_0_rgba(0,0,0,0.04)]">
        <div className="p-4 flex md:flex-col gap-3 md:gap-6 items-center md:items-stretch justify-between md:justify-start">
          <Link
            href="/clinic"
            className="flex items-center gap-2 md:px-2 min-h-11 min-w-11 md:min-w-0"
            aria-label={t.dashboard}
          >
            <div className="w-9 h-9 rounded-xl bg-orange-500/15 flex items-center justify-center shrink-0">
              <Stethoscope className="w-5 h-5 text-orange-600" aria-hidden />
            </div>
            <div className="hidden md:block min-w-0">
              <p className="text-sm font-semibold text-gray-900 leading-tight">{t.practiceOsTitle}</p>
              <p className="text-[11px] text-gray-500 leading-snug">{t.practiceOsBrand}</p>
              <p className="text-[10px] text-gray-400 leading-snug mt-0.5">{slogan}</p>
            </div>
          </Link>

          <div
            className="flex items-center gap-1 md:px-2"
            role="group"
            aria-label={t.language}
          >
            {(['en', 'ru'] as const satisfies ClinicLocale[]).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLocale(code)}
                className={clsx(
                  'min-h-11 min-w-11 px-2 rounded-xl text-xs font-semibold transition-colors',
                  locale === code
                    ? 'bg-orange-100 text-orange-900'
                    : 'text-gray-500 hover:bg-gray-50'
                )}
                aria-pressed={locale === code}
              >
                {code === 'en' ? t.localeEn : t.localeRu}
              </button>
            ))}
          </div>

          <nav
            className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-1 md:pb-0"
            aria-label={t.practiceConsole}
          >
            {nav.map(({ href, labelKey, icon: Icon }) => {
              const active =
                pathname === href || (href !== '/clinic' && pathname.startsWith(href + '/'))
              const label = t[labelKey]
              return (
                <Link
                  key={href}
                  href={href}
                  className={clsx(
                    'flex items-center gap-2 px-3 py-3 md:py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors min-h-11',
                    active
                      ? 'bg-orange-50 text-orange-800 shadow-sm ring-1 ring-orange-100/80'
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
              className="hidden md:block text-xs text-gray-500 hover:text-orange-600 px-2 py-2 min-h-11"
            >
              visiondrive.ae
            </Link>
            <button
              type="button"
              onClick={logout}
              className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm text-gray-600 hover:bg-gray-100 min-h-11"
            >
              <LogOut className="w-4 h-4 shrink-0" aria-hidden />
              <span className="hidden md:inline">{t.signOut}</span>
            </button>
          </div>
        </div>
      </aside>
      <div className="flex-1 min-w-0 p-4 md:p-8">{children}</div>
    </div>
  )
}
