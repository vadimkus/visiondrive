'use client'

import Link from 'next/link'
import { useLanguage } from './contexts/LanguageContext'
import { usePublicDocumentTitle } from './hooks/usePublicDocumentTitle'

const copy = {
  en: {
    documentTitle: 'Page Not Found - VisionDrive',
    title: 'Page Not Found',
    body: "The page you're looking for doesn't exist or has been moved.",
    home: 'Go to Homepage',
    contact: 'Contact Us',
    helpfulNav: 'Helpful links',
    helpfulPages: 'Helpful pages:',
    links: [
      { href: '/about', label: 'About Us' },
      { href: '/contact', label: 'Contact' },
      { href: '/faq', label: 'FAQ' },
    ],
  },
  ru: {
    documentTitle: 'Страница не найдена - VisionDrive',
    title: 'Страница не найдена',
    body: 'Страница, которую вы ищете, не существует или была перенесена.',
    home: 'На главную',
    contact: 'Связаться',
    helpfulNav: 'Полезные ссылки',
    helpfulPages: 'Полезные страницы:',
    links: [
      { href: '/about', label: 'О нас' },
      { href: '/contact', label: 'Контакты' },
      { href: '/faq', label: 'Вопросы' },
    ],
  },
} as const

export default function NotFoundClient() {
  const { publicLanguage } = useLanguage()
  const t = copy[publicLanguage]
  usePublicDocumentTitle(t.documentTitle)

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="w-full max-w-lg text-center">
        <div className="mb-8">
          <span className="text-8xl font-bold text-orange-500">404</span>
        </div>

        <h1 className="mb-4 text-3xl font-bold text-gray-900">{t.title}</h1>
        <p className="mb-8 text-lg text-gray-600">{t.body}</p>

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-orange-600"
          >
            {t.home}
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-100 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-200"
          >
            {t.contact}
          </Link>
        </div>

        <nav className="mt-12 text-sm text-gray-500" aria-label={t.helpfulNav}>
          <p className="mb-3 font-medium text-gray-700">{t.helpfulPages}</p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
            {t.links.map((link) => (
              <Link key={link.href} href={link.href} className="text-orange-500 hover:text-orange-600 hover:underline">
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </div>
  )
}
