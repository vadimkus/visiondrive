'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  ListOrdered,
  Package,
  ClipboardCheck,
  ShoppingCart,
  Truck,
  CircleDollarSign,
  BookOpen,
  Calendar,
  Inbox,
  Repeat2,
  BarChart3,
  Gift,
  Share2,
  Send,
  Star,
  LogOut,
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
  { href: '/clinic/stock-takes', labelKey: 'stockTakes' as const, icon: ClipboardCheck },
  { href: '/clinic/purchase-orders', labelKey: 'purchaseOrders' as const, icon: ShoppingCart },
  { href: '/clinic/suppliers', labelKey: 'suppliers' as const, icon: Truck },
  { href: '/clinic/finance', labelKey: 'finance' as const, icon: CircleDollarSign },
  { href: '/clinic/appointments', labelKey: 'appointments' as const, icon: Calendar },
  { href: '/clinic/inbox', labelKey: 'inbox' as const, icon: Inbox },
  { href: '/clinic/retention', labelKey: 'retentionAnalytics' as const, icon: Repeat2 },
  { href: '/clinic/booking-funnel', labelKey: 'bookingFunnelAnalytics' as const, icon: BarChart3 },
  { href: '/clinic/occasions', labelKey: 'occasions' as const, icon: Gift },
  { href: '/clinic/referrals', labelKey: 'referrals' as const, icon: Share2 },
  { href: '/clinic/reminders', labelKey: 'reminders' as const, icon: Send },
  { href: '/clinic/reputation', labelKey: 'reputation' as const, icon: Star },
  { href: '/clinic/knowledge-base', labelKey: 'knowledgeBase' as const, icon: BookOpen },
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
      className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.16),transparent_34rem),linear-gradient(135deg,#fff7ed_0%,#f8fafc_42%,#eef2ff_100%)] flex flex-col lg:flex-row pb-[env(safe-area-inset-bottom)]"
      dir="ltr"
      lang={locale}
    >
      <aside className="sticky top-0 z-40 shrink-0 border-b border-white/70 bg-white/85 shadow-sm shadow-orange-100/40 backdrop-blur-xl lg:w-64 lg:border-b-0 lg:border-r lg:min-h-screen lg:shadow-[inset_-1px_0_0_rgba(255,255,255,0.55)]">
        <div className="p-3 sm:p-4 flex lg:flex-col gap-3 lg:gap-6 items-center lg:items-stretch justify-between lg:justify-start">
          <Link
            href="/clinic"
            className="flex items-center gap-2 lg:px-2 min-h-11 min-w-11 lg:min-w-0"
            aria-label={t.dashboard}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 text-sm font-black tracking-tight text-white shadow-lg shadow-orange-500/20">
              VD
            </div>
            <div className="hidden lg:block min-w-0">
              <p className="text-sm font-semibold text-gray-900 leading-tight">{t.practiceOsTitle}</p>
              <p className="text-[11px] text-gray-500 leading-snug">{t.practiceOsBrand}</p>
              <p className="text-[10px] text-gray-400 leading-snug mt-0.5">{slogan}</p>
            </div>
          </Link>

          <div
            className="flex items-center gap-1 lg:px-2"
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
                    ? 'bg-orange-100 text-orange-900 shadow-sm'
                    : 'text-gray-500 hover:bg-white'
                )}
                aria-pressed={locale === code}
              >
                {code === 'en' ? t.localeEn : t.localeRu}
              </button>
            ))}
          </div>

          <nav
            className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 scroll-smooth"
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
                    'flex items-center gap-2 px-3 py-3 lg:py-2.5 rounded-2xl text-sm font-medium whitespace-nowrap transition-all min-h-11',
                    active
                      ? 'bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-lg shadow-orange-500/20'
                      : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm'
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" aria-hidden />
                  {label}
                </Link>
              )
            })}
          </nav>
          <div className="flex items-center gap-2 lg:flex-col lg:mt-auto lg:pt-6">
            <Link
              href="/"
              className="hidden lg:block text-xs text-gray-500 hover:text-orange-600 px-2 py-2 min-h-11"
            >
              visiondrive.ae
            </Link>
            <button
              type="button"
              onClick={logout}
              className="flex items-center justify-center gap-2 px-3 py-3 rounded-2xl text-sm text-gray-600 hover:bg-white hover:text-gray-900 min-h-11"
            >
              <LogOut className="w-4 h-4 shrink-0" aria-hidden />
              <span className="hidden lg:inline">{t.signOut}</span>
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 min-w-0 p-3 sm:p-5 lg:p-8">{children}</main>
    </div>
  )
}
