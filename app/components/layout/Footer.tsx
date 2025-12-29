'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Mail, MapPin, MessageCircle } from 'lucide-react'
import Logo from '../common/Logo'
import { useLanguage } from '../../contexts/LanguageContext'
import { footerTranslations } from '../../translations/footer'

export default function Footer() {
  const { language } = useLanguage()
  const pathname = usePathname()
  const t = footerTranslations[language]
  
  const footerNavigation = {
    solutions: [
      { name: t.solutionsLinks.technology, href: '/technology' },
      { name: t.solutionsLinks.communities, href: '/communities' },
      { name: t.solutionsLinks.municipalities, href: '/municipalities' },
    ],
    company: [
      { name: t.companyLinks.about, href: '/about' },
      { name: t.companyLinks.vision, href: '/mission' },
      { name: t.companyLinks.careers, href: '/careers' },
    ],
    legal: [
      { name: t.legalLinks.privacy, href: '/privacy' },
      { name: t.legalLinks.terms, href: '/terms' },
      { name: t.legalLinks.compliance, href: '/compliance' },
      { name: t.legalLinks.certificates, href: '/certificates' },
      { name: t.companyLinks.faq, href: '/faq' },
    ],
  }

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-6 sm:pb-8">
        {/* Mobile: Single column with accordion-style sections */}
        {/* Desktop: 4-column grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {/* Brand - Full width on mobile */}
          <div className="col-span-2 lg:col-span-1 text-center sm:text-left">
            <Link href="/" className="inline-flex items-center space-x-2 mb-4">
              <Logo className="h-12 w-12" />
              <div className="flex flex-col items-start">
                <span className="text-xl font-semibold text-gray-900">
                  Vision<span className="text-primary-600">Drive</span>
                </span>
                <span className="text-xs text-gray-500">IoT Company 🇦🇪</span>
              </div>
            </Link>
            <p className="text-sm text-gray-600 max-w-xs mx-auto sm:mx-0" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {t.description.split('\n').map((line, lineIdx) => (
                <span key={`desc-${lineIdx}-${line.slice(0, 10)}`}>
                  {line}
                  {lineIdx < t.description.split('\n').length - 1 && <br />}
                </span>
              ))}
            </p>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {t.company}
            </h3>
            <ul className="space-y-3">
              {footerNavigation.company.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`text-sm py-1 inline-block transition-colors ${
                        isActive 
                          ? 'text-primary-600' 
                          : 'text-gray-700 hover:text-primary-600'
                      }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Solutions */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {t.solutions}
            </h3>
            <ul className="space-y-3">
              {footerNavigation.solutions.map((item) => {
                const isActive = pathname === item.href.split('#')[0]
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`text-sm py-1 inline-block transition-colors ${
                        isActive 
                          ? 'text-primary-600' 
                          : 'text-gray-700 hover:text-primary-600'
                      }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 sm:col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {t.contact}
            </h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="mailto:tech@visiondrive.ae" 
                  className="flex items-center gap-3 py-2 px-3 -mx-3 rounded-lg text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors"
                >
                  <Mail className="h-5 w-5 text-primary-600 flex-shrink-0" />
                  <span className="text-sm break-all">tech@visiondrive.ae</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://wa.me/971559152985" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-3 py-2 px-3 -mx-3 rounded-lg text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors"
                >
                  <MessageCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm">+971 55 915 2985</span>
                </a>
              </li>
              <li className="flex items-start gap-3 py-2 px-3 -mx-3">
                <MapPin className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-700">
                  <div>VisionDrive, Compass Coworking,</div>
                  <div>RAK, UAE</div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Links & Copyright */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          {/* Legal links - horizontal scroll on mobile */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 sm:gap-x-6 mb-4">
            {footerNavigation.legal.map((item, index) => {
              const isActive = pathname === item.href
              return (
                <div key={item.name} className="flex items-center">
                  <Link
                    href={item.href}
                    className={`text-xs sm:text-sm py-1 transition-colors ${
                      isActive 
                        ? 'text-primary-600' 
                        : 'text-gray-500 hover:text-primary-600'
                    }`}
                  >
                    {item.name}
                  </Link>
                  {index < footerNavigation.legal.length - 1 && (
                    <span className="text-gray-300 ml-4 sm:ml-6 hidden sm:inline">|</span>
                  )}
                </div>
              )
            })}
          </div>
          {/* Copyright */}
          <p className="text-xs text-gray-400 text-center safe-area-bottom" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            © {new Date().getFullYear()} VisionDrive Technologies FZ-LLC. {t.copyright}
          </p>
        </div>
      </div>
    </footer>
  )
}

