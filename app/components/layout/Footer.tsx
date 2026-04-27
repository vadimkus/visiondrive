'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Mail, MapPin, MessageCircle } from 'lucide-react'
import Logo from '../common/Logo'
import { useLanguage } from '../../contexts/LanguageContext'
import { visiondriveSlogan } from '@/lib/brand'

const footerTranslations = {
  en: {
    solutions: 'Solutions',
    company: 'Company',
    contact: 'Contact',
    description:
      'Practice operations, made clear. Software for solo practitioners in the UAE.',
    copyright: 'All rights reserved.',
    solutionsLinks: {
      restaurants: 'Product overview',
      hotels: 'Security & data',
      technology: 'About the platform',
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
  ru: {
    solutions: 'Разделы',
    company: 'Компания',
    contact: 'Контакты',
    description:
      'Операции клиники — ясно и просто. ПО для частных специалистов в ОАЭ.',
    copyright: 'Все права защищены.',
    solutionsLinks: {
      restaurants: 'Обзор продукта',
      hotels: 'Безопасность и данные',
      technology: 'О платформе',
    },
    companyLinks: {
      about: 'О нас',
      contact: 'Контакты',
      faq: 'FAQ',
    },
    legalLinks: {
      privacy: 'Конфиденциальность',
      terms: 'Условия',
      compliance: 'Compliance',
    },
  },
}

export default function Footer() {
  const { publicLanguage } = useLanguage()
  const pathname = usePathname()
  const t = footerTranslations[publicLanguage]
  
  const footerNavigation = {
    solutions: [
      { name: t.solutionsLinks.restaurants, href: '/about' },
      { name: t.solutionsLinks.hotels, href: '/privacy' },
      { name: t.solutionsLinks.technology, href: '/about' },
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
      <div className="mx-auto max-w-7xl px-5 md:px-8 py-10 md:py-12">
        
        {/* Mobile: Stacked Layout */}
        <div className="md:hidden">
          {/* Brand - Center aligned */}
          <div className="mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-3 justify-center">
              <Logo className="h-10 w-10" />
              <div className="text-left">
                <span className="text-lg font-semibold text-gray-900">
                  Vision<span className="text-orange-500">Drive</span>
                </span>
                <span className="text-[10px] text-gray-400 block leading-snug">
                  {visiondriveSlogan[publicLanguage]}
                </span>
              </div>
            </Link>
            <p className="text-sm text-gray-500">{t.description}</p>
          </div>

          {/* Links Grid - 2 columns */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="text-center">
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
            <div className="text-center">
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
          <div className="mb-8 text-center">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              {t.contact}
            </h3>
            <div className="space-y-3">
              <a 
                href="mailto:tech@visiondrive.ae" 
                className="flex items-center justify-center gap-3 text-sm text-gray-600"
              >
                <Mail className="h-4 w-4 text-orange-500" />
                tech@visiondrive.ae
              </a>
              <a 
                href="https://wa.me/971559152985" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-center gap-3 text-sm text-gray-600"
              >
                <MessageCircle className="h-4 w-4 text-emerald-500" />
                +971 55 915 2985
              </a>
              <div className="flex items-center justify-center gap-3 text-sm text-gray-600">
                <MapPin className="h-4 w-4 text-red-500" />
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
                  <span className="text-[10px] text-gray-400 block leading-snug">
                    {visiondriveSlogan[publicLanguage]}
                  </span>
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
