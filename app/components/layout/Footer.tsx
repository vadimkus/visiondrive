'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Mail, Phone, MapPin, MessageCircle, Facebook, Instagram } from 'lucide-react'
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
      { name: t.companyLinks.vision, href: '/mission' },
      { name: t.companyLinks.careers, href: '/careers' },
      { name: t.companyLinks.blog, href: '/blog' },
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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-8 sm:pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-2">
              <Logo />
              <div className="flex flex-col">
                <span className="text-xl font-semibold text-gray-900">
                  Vision<span className="text-primary-600">Drive</span>
                </span>
                <span className="text-xs text-gray-500 ml-[15%]">IoT Company 🇦🇪</span>
              </div>
            </Link>
            <p className="text-sm text-gray-600 mb-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {t.description.split('\n').map((line, index) => (
                <span key={index}>
                  {line}
                  {index < t.description.split('\n').length - 1 && <br />}
                </span>
              ))}
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://wa.me/971559152985" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-primary-600 transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
              <a 
                href="mailto:ask@visiondrive.ae" 
                className="text-gray-500 hover:text-primary-600 transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
              <a 
                href="https://www.facebook.com/visiondrive" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-primary-600 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="https://www.instagram.com/visiondrive" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-primary-600 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {t.company}
            </h3>
            <ul className="space-y-2">
              {footerNavigation.company.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`text-sm transition-colors ${
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
            <ul className="space-y-2">
              {footerNavigation.solutions.map((item) => {
                const isActive = pathname === item.href.split('#')[0]
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`text-sm transition-colors ${
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
                <div className="text-sm text-gray-700">
                  <div className="whitespace-nowrap">VisionDrive, Compass Coworking Centre,</div>
                  <div>RAK, UAE</div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 sm:pt-8">
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 mb-6">
            {footerNavigation.legal.map((item, index) => {
              const isActive = pathname === item.href
              return (
                <div key={item.name} className="flex items-center gap-4 sm:gap-6">
                  <Link
                    href={item.href}
                    className={`text-sm transition-colors ${
                      isActive 
                        ? 'text-primary-600' 
                        : 'text-gray-600 hover:text-primary-600'
                    }`}
                  >
                    {item.name}
                  </Link>
                  {index < footerNavigation.legal.length - 1 && (
                    <span className="text-gray-300">|</span>
                  )}
                </div>
              )
            })}
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

