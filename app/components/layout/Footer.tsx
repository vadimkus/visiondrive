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
    description: 'Enterprise IoT Solutions for UAE Businesses',
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
      privacy: 'Privacy',
      terms: 'Terms',
      compliance: 'Compliance',
    },
  },
  ar: {
    solutions: 'الحلول',
    company: 'الشركة',
    contact: 'اتصل بنا',
    description: 'حلول إنترنت الأشياء للشركات الإماراتية',
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
      privacy: 'الخصوصية',
      terms: 'الشروط',
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
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="mx-auto max-w-7xl px-5 md:px-8 py-10 md:py-12">
        
        {/* Mobile: Stacked Layout */}
        <div className="md:hidden">
          {/* Brand - Left aligned */}
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-3">
              <Logo className="h-10 w-10" />
              <div>
                <span className="text-lg font-semibold text-gray-900">
                  Vision<span className="text-orange-500">Drive</span>
                </span>
                <span className="text-[10px] text-gray-400 block">IoT company 🇦🇪</span>
              </div>
            </Link>
            <p className="text-sm text-gray-500">{t.description}</p>
          </div>

          {/* Links Grid - 2 columns */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                {t.company}
              </h3>
              <ul className="space-y-3">
                {footerNavigation.company.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`text-sm transition-colors ${
                        pathname === item.href ? 'text-orange-500' : 'text-gray-600'
                      }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                {t.solutions}
              </h3>
              <ul className="space-y-3">
                {footerNavigation.solutions.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`text-sm transition-colors ${
                        pathname === item.href.split('#')[0] ? 'text-orange-500' : 'text-gray-600'
                      }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact */}
          <div className="mb-8">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              {t.contact}
            </h3>
            <div className="space-y-3">
              <a 
                href="mailto:tech@visiondrive.ae" 
                className="flex items-center gap-3 text-sm text-gray-600"
              >
                <Mail className="h-4 w-4 text-orange-500" />
                tech@visiondrive.ae
              </a>
              <a 
                href="https://wa.me/971559152985" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-3 text-sm text-gray-600"
              >
                <MessageCircle className="h-4 w-4 text-emerald-500" />
                +971 55 915 2985
              </a>
              <div className="flex items-start gap-3 text-sm text-gray-600">
                <MapPin className="h-4 w-4 text-red-500 mt-0.5" />
                <span>Compass Coworking, RAK, UAE</span>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="pt-6 border-t border-gray-200">
            <div className="flex justify-center gap-6 mb-4">
              {footerNavigation.legal.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  {item.name}
                </Link>
              ))}
            </div>
            <p className="text-xs text-gray-400 text-center">
              © {new Date().getFullYear()} VisionDrive Technologies FZ-LLC
            </p>
          </div>
        </div>

        {/* Desktop: Grid Layout */}
        <div className="hidden md:block">
          <div className="grid grid-cols-4 gap-8 lg:gap-12">
            {/* Brand */}
            <div>
              <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
                <Logo className="h-11 w-11" />
                <div>
                  <span className="text-lg font-semibold text-gray-900">
                    Vision<span className="text-orange-500">Drive</span>
                  </span>
                  <span className="text-[10px] text-gray-400 block">IoT company 🇦🇪</span>
                </div>
              </Link>
              <p className="text-sm text-gray-500 leading-relaxed">{t.description}</p>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                {t.company}
              </h3>
              <ul className="space-y-3">
                {footerNavigation.company.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`text-sm transition-colors hover:text-orange-500 ${
                        pathname === item.href ? 'text-orange-500' : 'text-gray-600'
                      }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Solutions */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                {t.solutions}
              </h3>
              <ul className="space-y-3">
                {footerNavigation.solutions.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`text-sm transition-colors hover:text-orange-500 ${
                        pathname === item.href.split('#')[0] ? 'text-orange-500' : 'text-gray-600'
                      }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                {t.contact}
              </h3>
              <div className="space-y-3">
                <a 
                  href="mailto:tech@visiondrive.ae" 
                  className="flex items-center gap-3 text-sm text-gray-600 hover:text-orange-500 transition-colors"
                >
                  <Mail className="h-4 w-4 text-orange-500" />
                  tech@visiondrive.ae
                </a>
                <a 
                  href="https://wa.me/971559152985" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-3 text-sm text-gray-600 hover:text-orange-500 transition-colors"
                >
                  <MessageCircle className="h-4 w-4 text-emerald-500" />
                  +971 55 915 2985
                </a>
                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 text-red-500 mt-0.5" />
                  <span>Compass Coworking, RAK, UAE</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-10 pt-6 border-t border-gray-200 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} VisionDrive Technologies FZ-LLC. {t.copyright}
            </p>
            <div className="flex gap-6">
              {footerNavigation.legal.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

      </div>
    </footer>
  )
}
