'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Activity,
  BriefcaseMedical,
  Package,
  ClipboardCheck,
  ClipboardPlus,
  ShoppingCart,
  Truck,
  CircleDollarSign,
  BookOpen,
  CalendarCheck,
  CalendarClock,
  Inbox,
  ClipboardList,
  Repeat2,
  BarChart3,
  Gift,
  HeartPulse,
  MapPinned,
  MessageCircleHeart,
  Share2,
  Send,
  ShieldPlus,
  Sparkles,
  Star,
  Stethoscope,
  Syringe,
  Bot,
  LogOut,
  Target,
  UserCircle,
  ChevronDown,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import clsx from 'clsx'
import Logo from '@/app/components/common/Logo'
import { useClinicLocale } from '@/lib/clinic/clinic-locale'
import type { ClinicLocale } from '@/lib/clinic/strings'

type PracticeNavTone = 'amber' | 'blue' | 'cyan' | 'emerald' | 'fuchsia' | 'indigo' | 'orange' | 'pink' | 'rose' | 'sky' | 'teal' | 'violet'

type PracticeNavItem = {
  href: string
  labelKey: keyof ReturnType<typeof useClinicLocale>['t']
  icon: LucideIcon
  tone: PracticeNavTone
}

const nav: PracticeNavItem[] = [
  { href: '/clinic', labelKey: 'dashboard', icon: Activity, tone: 'orange' },
  { href: '/clinic/patients', labelKey: 'patients', icon: Stethoscope, tone: 'rose' },
  { href: '/clinic/procedures', labelKey: 'procedures', icon: Syringe, tone: 'pink' },
  { href: '/clinic/inventory', labelKey: 'inventory', icon: Package, tone: 'sky' },
  { href: '/clinic/stock-takes', labelKey: 'stockTakes', icon: ClipboardCheck, tone: 'teal' },
  { href: '/clinic/purchase-orders', labelKey: 'purchaseOrders', icon: ShoppingCart, tone: 'amber' },
  { href: '/clinic/suppliers', labelKey: 'suppliers', icon: Truck, tone: 'cyan' },
  { href: '/clinic/finance', labelKey: 'finance', icon: CircleDollarSign, tone: 'emerald' },
  { href: '/clinic/service-analytics', labelKey: 'serviceAnalytics', icon: HeartPulse, tone: 'rose' },
  { href: '/clinic/revenue-plan', labelKey: 'revenuePlan', icon: Target, tone: 'violet' },
  { href: '/clinic/occupancy', labelKey: 'occupancyReport', icon: CalendarClock, tone: 'blue' },
  { href: '/clinic/service-areas', labelKey: 'serviceAreas', icon: MapPinned, tone: 'teal' },
  { href: '/clinic/appointments', labelKey: 'appointments', icon: CalendarCheck, tone: 'orange' },
  { href: '/clinic/waitlist', labelKey: 'smartWaitlist', icon: ClipboardPlus, tone: 'indigo' },
  { href: '/clinic/inbox', labelKey: 'inbox', icon: Inbox, tone: 'sky' },
  { href: '/clinic/retention', labelKey: 'retentionAnalytics', icon: Repeat2, tone: 'emerald' },
  { href: '/clinic/booking-funnel', labelKey: 'bookingFunnelAnalytics', icon: BarChart3, tone: 'violet' },
  { href: '/clinic/occasions', labelKey: 'occasions', icon: Gift, tone: 'fuchsia' },
  { href: '/clinic/referrals', labelKey: 'referrals', icon: Share2, tone: 'cyan' },
  { href: '/clinic/whatsapp-assistant', labelKey: 'whatsappAssistant', icon: Bot, tone: 'emerald' },
  { href: '/clinic/reminders', labelKey: 'reminders', icon: Send, tone: 'orange' },
  { href: '/clinic/reputation', labelKey: 'reputation', icon: Star, tone: 'amber' },
  { href: '/clinic/review-analytics', labelKey: 'reviewAnalytics', icon: MessageCircleHeart, tone: 'pink' },
  { href: '/clinic/knowledge-base', labelKey: 'knowledgeBase', icon: BookOpen, tone: 'blue' },
  { href: '/clinic/account', labelKey: 'account', icon: ShieldPlus, tone: 'indigo' },
]

const mobileTabs: PracticeNavItem[] = [
  { href: '/clinic', labelKey: 'dashboard', icon: Activity, tone: 'orange' },
  { href: '/clinic/appointments', labelKey: 'appointments', icon: CalendarCheck, tone: 'orange' },
  { href: '/clinic/patients', labelKey: 'patients', icon: Stethoscope, tone: 'rose' },
  { href: '/clinic/waitlist', labelKey: 'smartWaitlist', icon: ClipboardList, tone: 'indigo' },
  { href: '/clinic/inbox', labelKey: 'inbox', icon: Inbox, tone: 'sky' },
]

const commandNav = nav.slice(0, 15)
const growthNav = nav.slice(15, 21)
const systemNav = nav.slice(21)

const iconToneClasses: Record<PracticeNavTone, { active: string; idle: string; glow: string }> = {
  amber: {
    active: 'bg-amber-400/20 text-amber-200 ring-amber-300/25',
    idle: 'bg-amber-50 text-amber-600 ring-amber-100 group-hover:bg-amber-100 group-hover:text-amber-700',
    glow: 'from-amber-300/45 to-orange-400/20',
  },
  blue: {
    active: 'bg-blue-400/20 text-blue-200 ring-blue-300/25',
    idle: 'bg-blue-50 text-blue-600 ring-blue-100 group-hover:bg-blue-100 group-hover:text-blue-700',
    glow: 'from-blue-300/45 to-indigo-400/20',
  },
  cyan: {
    active: 'bg-cyan-400/20 text-cyan-200 ring-cyan-300/25',
    idle: 'bg-cyan-50 text-cyan-600 ring-cyan-100 group-hover:bg-cyan-100 group-hover:text-cyan-700',
    glow: 'from-cyan-300/45 to-sky-400/20',
  },
  emerald: {
    active: 'bg-emerald-400/20 text-emerald-200 ring-emerald-300/25',
    idle: 'bg-emerald-50 text-emerald-600 ring-emerald-100 group-hover:bg-emerald-100 group-hover:text-emerald-700',
    glow: 'from-emerald-300/45 to-teal-400/20',
  },
  fuchsia: {
    active: 'bg-fuchsia-400/20 text-fuchsia-200 ring-fuchsia-300/25',
    idle: 'bg-fuchsia-50 text-fuchsia-600 ring-fuchsia-100 group-hover:bg-fuchsia-100 group-hover:text-fuchsia-700',
    glow: 'from-fuchsia-300/45 to-pink-400/20',
  },
  indigo: {
    active: 'bg-indigo-400/20 text-indigo-200 ring-indigo-300/25',
    idle: 'bg-indigo-50 text-indigo-600 ring-indigo-100 group-hover:bg-indigo-100 group-hover:text-indigo-700',
    glow: 'from-indigo-300/45 to-violet-400/20',
  },
  orange: {
    active: 'bg-orange-400/20 text-orange-200 ring-orange-300/25',
    idle: 'bg-orange-50 text-orange-600 ring-orange-100 group-hover:bg-orange-100 group-hover:text-orange-700',
    glow: 'from-orange-300/45 to-rose-400/20',
  },
  pink: {
    active: 'bg-pink-400/20 text-pink-200 ring-pink-300/25',
    idle: 'bg-pink-50 text-pink-600 ring-pink-100 group-hover:bg-pink-100 group-hover:text-pink-700',
    glow: 'from-pink-300/45 to-rose-400/20',
  },
  rose: {
    active: 'bg-rose-400/20 text-rose-200 ring-rose-300/25',
    idle: 'bg-rose-50 text-rose-600 ring-rose-100 group-hover:bg-rose-100 group-hover:text-rose-700',
    glow: 'from-rose-300/45 to-orange-400/20',
  },
  sky: {
    active: 'bg-sky-400/20 text-sky-200 ring-sky-300/25',
    idle: 'bg-sky-50 text-sky-600 ring-sky-100 group-hover:bg-sky-100 group-hover:text-sky-700',
    glow: 'from-sky-300/45 to-cyan-400/20',
  },
  teal: {
    active: 'bg-teal-400/20 text-teal-200 ring-teal-300/25',
    idle: 'bg-teal-50 text-teal-600 ring-teal-100 group-hover:bg-teal-100 group-hover:text-teal-700',
    glow: 'from-teal-300/45 to-emerald-400/20',
  },
  violet: {
    active: 'bg-violet-400/20 text-violet-200 ring-violet-300/25',
    idle: 'bg-violet-50 text-violet-600 ring-violet-100 group-hover:bg-violet-100 group-hover:text-violet-700',
    glow: 'from-violet-300/45 to-fuchsia-400/20',
  },
}

function PracticeNavIcon({
  Icon,
  active,
  tone,
  compact = false,
}: {
  Icon: LucideIcon
  active: boolean
  tone: PracticeNavTone
  compact?: boolean
}) {
  const classes = iconToneClasses[tone]
  return (
    <span
      className={clsx(
        'relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl ring-1 transition-all duration-200',
        compact ? 'h-9 w-9' : 'h-8 w-8',
        active
          ? classes.active
          : `${classes.idle} text-slate-500 shadow-sm group-hover:-translate-y-0.5 group-hover:shadow-md`
      )}
    >
      <span
        className={clsx(
          'absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-200 group-hover:opacity-100',
          classes.glow,
          active && 'opacity-100'
        )}
        aria-hidden
      />
      <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-white/70 blur-[1px]" aria-hidden />
      <Icon className={clsx('relative z-10 shrink-0', compact ? 'h-5 w-5' : 'h-4 w-4')} aria-hidden />
    </span>
  )
}

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
      {items.map(({ href, labelKey, icon: Icon, tone }) => {
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
            <PracticeNavIcon Icon={Icon} active={active} tone={tone} />
            <span className="truncate">{label}</span>
          </Link>
        )
      })}
    </div>
  )

  return (
    <div
      className="min-h-[100dvh] w-full min-w-0 overflow-x-hidden bg-[#f6f3ee] text-slate-950 lg:flex lg:bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.20),transparent_26rem),radial-gradient(circle_at_78%_0%,rgba(99,102,241,0.16),transparent_24rem),linear-gradient(135deg,#fff7ed_0%,#f8fafc_46%,#eef2ff_100%)]"
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
          <div className="flex shrink-0 items-center gap-2">
            <label className="sr-only" htmlFor="clinic-mobile-language">
              {t.language}
            </label>
            <div className="relative">
              <select
                id="clinic-mobile-language"
                value={locale}
                onChange={(event) => setLocale(event.target.value === 'ru' ? 'ru' : 'en')}
                className="min-h-11 appearance-none rounded-2xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs font-semibold text-slate-700 shadow-sm outline-none transition focus:ring-2 focus:ring-orange-500/30"
                aria-label={t.language}
              >
                <option value="en">EN</option>
                <option value="ru">RU</option>
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden
              />
            </div>
            <Link
              href="/clinic/account"
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm transition active:scale-95"
              aria-label={t.yourAccount}
            >
              <UserCircle className="h-5 w-5" aria-hidden />
            </Link>
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
          {renderNavGroup(commandNav, t.navGroupCommand)}
          {renderNavGroup(growthNav, t.navGroupGrowth)}
          {renderNavGroup(systemNav, t.navGroupSystem)}
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

      <main className="min-w-0 flex-1 overflow-x-hidden px-4 pb-[calc(6.25rem+env(safe-area-inset-bottom))] pt-4 sm:px-5 lg:h-[100dvh] lg:overflow-y-auto lg:px-8 lg:py-8 xl:px-10">
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/80 bg-white/88 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-18px_50px_rgba(15,23,42,0.12)] backdrop-blur-2xl lg:hidden" aria-label={t.practiceConsole}>
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          {mobileTabs.map(({ href, labelKey, icon: Icon, tone }) => {
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
                <PracticeNavIcon Icon={Icon} active={active} tone={tone} compact />
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
          <Sparkles className="h-5 w-5" aria-hidden />
        </Link>
      </nav>
    </div>
  )
}
