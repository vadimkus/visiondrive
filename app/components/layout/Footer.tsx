'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Mail, MapPin, MessageCircle } from 'lucide-react'
import Logo from '../common/Logo'
import { useLanguage } from '../../contexts/LanguageContext'

const footerTranslations = {
  en: {
    solutions: 'Solutions',
    company: 'Company',
    contact: 'Contact',
    description: 'Enterprise IoT Solutions\nfor UAE Businesses',
    copyright: 'All rights reserved.',
    solutionsLinks: {
      restaurants: 'For Restaurants',
      hotels: 'For Hotels & Catering',
      technology: 'Technology',
    },
    companyLinks: {
      about: 'About Us',
      contact: 'Contact',
      faq: 'FAQ',
    },
    legalLinks: {
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      compliance: 'Compliance',
    },
  },
  ar: {
    solutions: 'الحلول',
    company: 'الشركة',
    contact: 'اتصل بنا',
    description: 'حلول إنترنت الأشياء المؤسسية\nللشركات الإماراتية',
    copyright: 'جميع الحقوق محفوظة.',
    solutionsLinks: {
      restaurants: 'للمطاعم',
      hotels: 'للفنادق والتموين',
      technology: 'التكنولوجيا',
    },
    companyLinks: {
      about: 'من نحن',
      contact: 'اتصل بنا',
      faq: 'الأسئلة الشائعة',
    },
    legalLinks: {
      privacy: 'سياسة الخصوصية',
      terms: 'شروط الخدمة',
      compliance: 'الامتثال',
    },
  },
}

export default function Footer() {
  const { language } = useLanguage()
  const pathname = usePathname()
  const t = footerTranslations[language]
  
  const footerNavigation = {
    solutions: [
      { name: t.solutionsLinks.restaurants, href: '/solutions#restaurants' },
      { name: t.solutionsLinks.hotels, href: '/solutions#hotels' },
      { name: t.solutionsLinks.technology, href: '/technology' },
    ],
    company: [
      { name: t.companyLinks.about, href: '/about' },
      { name: t.companyLinks.contact, href: '/contact' },
      { name: t.companyLinks.faq, href: '/faq' },
    ],
    legal: [
      { name: t.legalLinks.privacy, href: '/privacy' },
      { name: t.legalLinks.terms, href: '/terms' },
      { name: t.legalLinks.compliance, href: '/compliance' },
    ],
  }

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-6 sm:pb-8">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1 text-center sm:text-left">
            <Link href="/" className="inline-flex items-center space-x-2 mb-4">
              <Logo className="h-12 w-12" />
              <div className="flex flex-col items-start">
                <span className="text-xl font-semibold text-gray-900">
                  Vision<span className="text-orange-600">Drive</span>
                </span>
                <span className="text-xs text-gray-500">IoT company 🇦🇪</span>
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
                          ? 'text-orange-600' 
                          : 'text-gray-700 hover:text-orange-600'
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
                          ? 'text-orange-600' 
                          : 'text-gray-700 hover:text-orange-600'
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
                  className="flex items-center gap-3 py-2 px-3 -mx-3 rounded-lg text-gray-700 hover:text-orange-600 hover:bg-gray-50 transition-colors"
                >
                  <Mail className="h-5 w-5 text-orange-600 flex-shrink-0" />
                  <span className="text-sm break-all">tech@visiondrive.ae</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://wa.me/971559152985" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-3 py-2 px-3 -mx-3 rounded-lg text-gray-700 hover:text-orange-600 hover:bg-gray-50 transition-colors"
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
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 sm:gap-x-6 mb-4">
            {footerNavigation.legal.map((item, index) => {
              const isActive = pathname === item.href
              return (
                <div key={item.name} className="flex items-center">
                  <Link
                    href={item.href}
                    className={`text-xs sm:text-sm py-1 transition-colors ${
                      isActive 
                        ? 'text-orange-600' 
                        : 'text-gray-500 hover:text-orange-600'
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
          <p className="text-xs text-gray-400 text-center safe-area-bottom" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            © {new Date().getFullYear()} VisionDrive Technologies FZ-LLC. {t.copyright}
          </p>
        </div>
      </div>
    </footer>
  )
}
