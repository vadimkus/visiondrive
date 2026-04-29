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
  ClipboardList,
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
  MoreHorizontal,
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
  { href: '/clinic/waitlist', labelKey: 'smartWaitlist' as const, icon: ClipboardList },
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

const mobileTabs = [
  { href: '/clinic', labelKey: 'dashboard' as const, icon: LayoutDashboard },
  { href: '/clinic/appointments', labelKey: 'appointments' as const, icon: Calendar },
  { href: '/clinic/patients', labelKey: 'patients' as const, icon: Users },
  { href: '/clinic/waitlist', labelKey: 'smartWaitlist' as const, icon: ClipboardList },
  { href: '/clinic/inbox', labelKey: 'inbox' as const, icon: Inbox },
]

const commandNav = nav.slice(0, 15)
const growthNav = nav.slice(15, 21)
const systemNav = nav.slice(21)

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

  const renderNavGroup = (items: typeof nav, title: string) => (
    <div className="space-y-1">
      <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
        {title}
      </p>
      {items.map(({ href, labelKey, icon: Icon }) => {
        const active = pathname === href || (href !== '/clinic' && pathname.startsWith(href + '/'))
        const label = t[labelKey]
        return (
          <Link
            key={href}
            href={href}
            className={clsx(
              'group flex min-h-11 items-center gap-3 rounded-2xl px-3 text-sm font-medium transition-all',
              active
                ? 'bg-slate-950 text-white shadow-xl shadow-slate-950/15'
                : 'text-slate-600 hover:bg-white hover:text-slate-950 hover:shadow-sm'
            )}
          >
            <span
              className={clsx(
                'flex h-8 w-8 items-center justify-center rounded-xl transition-colors',
                active ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-orange-50 group-hover:text-orange-600'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
            </span>
            <span className="truncate">{label}</span>
          </Link>
        )
      })}
    </div>
  )

  return (
    <div
      className="min-h-[100dvh] bg-[#f6f3ee] text-slate-950 lg:flex lg:bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.20),transparent_26rem),radial-gradient(circle_at_78%_0%,rgba(99,102,241,0.16),transparent_24rem),linear-gradient(135deg,#fff7ed_0%,#f8fafc_46%,#eef2ff_100%)]"
      dir="ltr"
      lang={locale}
    >
      <header className="sticky top-0 z-40 border-b border-white/70 bg-white/80 px-4 py-3 backdrop-blur-2xl safe-area-top lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <Link href="/clinic" className="flex min-h-11 min-w-0 items-center gap-3" aria-label={t.dashboard}>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-orange-100">
              <Logo className="h-9 w-9" priority />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[15px] font-semibold leading-tight text-slate-950">
                {t.practiceOsTitle}
              </span>
              <span className="block truncate text-xs text-slate-500">{t.practiceOsBrand}</span>
            </span>
          </Link>
          <div className="flex items-center gap-1">
            {(['en', 'ru'] as const satisfies ClinicLocale[]).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLocale(code)}
                className={clsx(
                  'min-h-11 min-w-11 rounded-2xl px-2 text-xs font-semibold transition active:scale-95',
                  locale === code ? 'bg-slate-950 text-white shadow-sm' : 'bg-white text-slate-500'
                )}
                aria-pressed={locale === code}
              >
                {code === 'en' ? t.localeEn : t.localeRu}
              </button>
            ))}
          </div>
        </div>
      </header>

      <aside className="sticky top-0 hidden h-[100dvh] w-[18rem] shrink-0 border-r border-white/70 bg-white/72 p-4 shadow-[inset_-1px_0_0_rgba(255,255,255,0.7)] backdrop-blur-2xl lg:flex lg:flex-col">
        <Link href="/clinic" className="flex min-h-12 items-center gap-3 rounded-3xl px-2" aria-label={t.dashboard}>
          <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-orange-100">
            <Logo className="h-10 w-10" priority />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-slate-950">{t.practiceOsTitle}</span>
            <span className="block text-xs text-slate-500">{t.practiceOsBrand}</span>
          </span>
        </Link>

        <nav className="mt-6 flex-1 space-y-6 overflow-y-auto pr-1 scrollbar-hide" aria-label={t.practiceConsole}>
          {renderNavGroup(commandNav, 'Command')}
          {renderNavGroup(growthNav, 'Growth')}
          {renderNavGroup(systemNav, 'System')}
        </nav>

        <div className="mt-4 rounded-3xl border border-white/80 bg-white/70 p-3 shadow-sm">
          <div className="mb-3 flex items-center gap-1" role="group" aria-label={t.language}>
            {(['en', 'ru'] as const satisfies ClinicLocale[]).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLocale(code)}
                className={clsx(
                  'min-h-10 flex-1 rounded-2xl px-2 text-xs font-semibold transition-colors',
                  locale === code ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'
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
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
          >
            <LogOut className="h-4 w-4 shrink-0" aria-hidden />
            {t.signOut}
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-4 pb-[calc(6.25rem+env(safe-area-inset-bottom))] pt-4 sm:px-5 lg:h-[100dvh] lg:overflow-y-auto lg:px-8 lg:py-8 xl:px-10">
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/80 bg-white/88 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-18px_50px_rgba(15,23,42,0.12)] backdrop-blur-2xl lg:hidden" aria-label={t.practiceConsole}>
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          {mobileTabs.map(({ href, labelKey, icon: Icon }) => {
            const active = pathname === href || (href !== '/clinic' && pathname.startsWith(href + '/'))
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[10px] font-semibold transition active:scale-95',
                  active ? 'bg-slate-950 text-white shadow-lg shadow-slate-950/15' : 'text-slate-500 active:bg-slate-100'
                )}
              >
                <Icon className="h-5 w-5" aria-hidden />
                <span className="max-w-full truncate">{t[labelKey]}</span>
              </Link>
            )
          })}
        </div>
        <Link
          href="/clinic/knowledge-base"
          className="absolute right-3 top-[-3.25rem] flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-500 shadow-xl ring-1 ring-slate-200 active:scale-95"
          aria-label={t.knowledgeBase}
        >
          <MoreHorizontal className="h-5 w-5" aria-hidden />
        </Link>
      </nav>
    </div>
  )
}
