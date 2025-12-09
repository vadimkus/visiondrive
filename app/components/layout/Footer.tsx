'use client'

import Link from 'next/link'
import { Mail, Phone, MapPin, Linkedin, Twitter } from 'lucide-react'
import Logo from '../common/Logo'
import { useLanguage } from '../../contexts/LanguageContext'
import { footerTranslations } from '../../translations/footer'

export default function Footer() {
  const { language } = useLanguage()
  const t = footerTranslations[language]
  
  const footerNavigation = {
    solutions: [
      { name: t.solutionsLinks.communities, href: '/solutions#communities' },
      { name: t.solutionsLinks.municipalities, href: '/solutions#municipalities' },
      { name: t.solutionsLinks.technology, href: '/solutions#technology' },
    ],
    company: [
      { name: t.companyLinks.vision, href: '/roadmap' },
      { name: t.companyLinks.careers, href: '/about/careers' },
      { name: t.companyLinks.blog, href: '/blog' },
      { name: t.companyLinks.faq, href: '/faq' },
    ],
    legal: [
      { name: t.legalLinks.privacy, href: '/privacy' },
      { name: t.legalLinks.terms, href: '/terms' },
    ],
  }

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-8 sm:pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-2">
              <Logo />
              <div className="flex flex-col">
                <span className="text-xl font-semibold text-gray-900">
                  Vision<span className="text-primary-600">Drive</span>
                </span>
                <span className="text-xs text-gray-500 ml-[15%]">IoT Company</span>
              </div>
            </Link>
            <p className="text-sm text-gray-600 mb-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {t.description}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-primary-600 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-primary-600 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Solutions */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {t.solutions}
            </h3>
            <ul className="space-y-2">
              {footerNavigation.solutions.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {t.company}
            </h3>
            <ul className="space-y-2">
              {footerNavigation.company.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {t.contact}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <a href="mailto:ask@visiondrive.ae" className="text-sm text-gray-700 hover:text-primary-600 transition-colors break-all">
                  ask@visiondrive.ae
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <a href="tel:+971559152985" className="text-sm text-gray-700 hover:text-primary-600 transition-colors">
                  +971 55 915 2985
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-700 break-words">
                  <div>Office: VisionDrive, Ground floor</div>
                  <div>RAKEZ Compass Coworking Centre</div>
                  <div className="break-words">Al Shohada Road Al Hamra Industrial Zone, FZ - Ras Al Khaimah</div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 sm:pt-8">
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-6">
            {footerNavigation.legal.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="border-t border-gray-200 pt-6">
            <p className="text-xs sm:text-sm text-gray-500 text-center" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              © 2026 VisionDrive Technologies FZ-LLC. {t.copyright}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

