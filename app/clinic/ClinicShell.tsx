'use client'

import { useEffect } from 'react'
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
  CalendarClock,
  Inbox,
  Repeat2,
  BarChart3,
  Gift,
  MessageCircleReply,
  Share2,
  Send,
  Star,
  Bot,
  LogOut,
  Target,
  UserCircle,
  MapPin,
} from 'lucide-react'
import clsx from 'clsx'
import Logo from '@/app/components/common/Logo'
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
  { href: '/clinic/service-analytics', labelKey: 'serviceAnalytics' as const, icon: BarChart3 },
  { href: '/clinic/revenue-plan', labelKey: 'revenuePlan' as const, icon: Target },
  { href: '/clinic/occupancy', labelKey: 'occupancyReport' as const, icon: CalendarClock },
  { href: '/clinic/service-areas', labelKey: 'serviceAreas' as const, icon: MapPin },
  { href: '/clinic/appointments', labelKey: 'appointments' as const, icon: Calendar },
  { href: '/clinic/inbox', labelKey: 'inbox' as const, icon: Inbox },
  { href: '/clinic/retention', labelKey: 'retentionAnalytics' as const, icon: Repeat2 },
  { href: '/clinic/booking-funnel', labelKey: 'bookingFunnelAnalytics' as const, icon: BarChart3 },
  { href: '/clinic/occasions', labelKey: 'occasions' as const, icon: Gift },
  { href: '/clinic/referrals', labelKey: 'referrals' as const, icon: Share2 },
  { href: '/clinic/whatsapp-assistant', labelKey: 'whatsappAssistant' as const, icon: Bot },
  { href: '/clinic/reminders', labelKey: 'reminders' as const, icon: Send },
  { href: '/clinic/reputation', labelKey: 'reputation' as const, icon: Star },
  { href: '/clinic/review-analytics', labelKey: 'reviewAnalytics' as const, icon: MessageCircleReply },
  { href: '/clinic/knowledge-base', labelKey: 'knowledgeBase' as const, icon: BookOpen },
  { href: '/clinic/account', labelKey: 'account' as const, icon: UserCircle },
]

export default function ClinicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { locale, setLocale, t } = useClinicLocale()

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/clinic/me', { credentials: 'include' })
        if (!res.ok) return
        const data = await res.json()
        const preferred = data?.preferences?.locale
        if (!cancelled && (preferred === 'en' || preferred === 'ru')) {
          setLocale(preferred)
        }
      } catch {
        // Local storage remains the fallback when the preference endpoint is unavailable.
      }
    })()
    return () => {
      cancelled = true
    }
  }, [setLocale])

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    router.push('/login')
    router.refresh()
  }

  return (
    <div
      className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.16),transparent_34rem),linear-gradient(135deg,#fff7ed_0%,#f8fafc_42%,#eef2ff_100%)] flex flex-col lg:flex-row pb-[env(safe-area-inset-bottom)]"
      dir="ltr"
      lang={locale}
    >
      <aside className="sticky top-0 z-40 shrink-0 border-b border-white/70 bg-white/90 shadow-sm shadow-orange-100/40 backdrop-blur-xl lg:w-64 lg:border-b-0 lg:border-r lg:min-h-screen lg:shadow-[inset_-1px_0_0_rgba(255,255,255,0.55)]">
        <div className="flex flex-col gap-2 p-3 sm:p-4 lg:min-h-screen lg:gap-6">
          <div className="flex items-center justify-between gap-3 lg:flex-col lg:items-stretch lg:justify-start lg:gap-5">
            <Link
              href="/clinic"
              className="flex min-h-11 min-w-0 items-center gap-2 lg:px-2"
              aria-label={t.dashboard}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white ring-1 ring-orange-100">
                <Logo className="h-9 w-9" priority />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold leading-tight text-gray-900">{t.practiceOsTitle}</p>
                <p className="hidden text-[11px] leading-snug text-gray-500 sm:block">{t.practiceOsBrand}</p>
              </div>
            </Link>

            <div className="flex shrink-0 items-center gap-2 lg:flex-col lg:items-stretch">
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
                      'min-h-11 min-w-11 rounded-xl px-2 text-xs font-semibold transition-colors',
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
              <button
                type="button"
                onClick={logout}
                className="flex min-h-11 min-w-11 items-center justify-center rounded-2xl text-gray-600 hover:bg-white hover:text-gray-900 lg:hidden"
                aria-label={t.signOut}
              >
                <LogOut className="h-4 w-4 shrink-0" aria-hidden />
              </button>
            </div>
          </div>

          <nav
            className="-mx-3 flex gap-1 overflow-x-auto overscroll-x-contain px-3 pb-1 scroll-smooth [scrollbar-width:none] sm:-mx-4 sm:px-4 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden"
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
                    'flex min-h-11 shrink-0 items-center gap-2 rounded-2xl px-3 py-3 text-sm font-medium whitespace-nowrap transition-all lg:py-2.5',
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
          <div className="hidden items-center gap-2 lg:mt-auto lg:flex lg:flex-col lg:pt-6">
            <Link
              href="/"
              className="min-h-11 px-2 py-2 text-xs text-gray-500 hover:text-orange-600"
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
      <main className="min-w-0 flex-1 px-3 pb-24 pt-3 sm:p-5 lg:p-8">{children}</main>
    </div>
  )
}
