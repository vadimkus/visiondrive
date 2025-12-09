'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Menu, X, User, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Logo from '../common/Logo'
import LanguageSelector from '../common/LanguageSelector'
import { useLanguage } from '../../contexts/LanguageContext'

// Make sure Header is client component - already has 'use client'

const navigation = {
  en: [
    { name: 'Home', href: '/' },
    { name: 'About Us', href: '/about' },
    { name: 'Partners & Pilots', href: '/partners' },
    { name: 'Solutions', href: '/solutions' },
    { name: 'The App', href: '/app' },
    { name: 'Compliance', href: '/compliance' },
    { name: 'Contact', href: '/contact' },
    { name: 'Road Map', href: '/roadmap' },
  ],
  ar: [
    { name: 'الرئيسية', href: '/' },
    { name: 'من نحن', href: '/about' },
    { name: 'الشركاء والبرامج التجريبية', href: '/partners' },
    { name: 'الحلول', href: '/solutions' },
    { name: 'التطبيق', href: '/app' },
    { name: 'الامتثال', href: '/compliance' },
    { name: 'اتصل بنا', href: '/contact' },
    { name: 'خارطة الطريق', href: '/roadmap' },
  ],
}

export default function Header() {
  const { language } = useLanguage()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  
  const navItems = navigation[language]

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Logout error:', error)
    }
    setIsLoggedIn(false)
    router.push('/login')
    router.refresh()
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        })
        
        // 401 is expected when not logged in - this is normal behavior
        if (response.status === 401) {
          setIsLoggedIn(false)
        } else if (response.ok) {
          setIsLoggedIn(true)
        } else {
          // Other errors (500, etc.) - still treat as not logged in
          setIsLoggedIn(false)
        }
      } catch (error) {
        // Network errors - silently handle, user is not logged in
        setIsLoggedIn(false)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex w-full items-center justify-between lg:justify-center py-3 sm:py-4">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              <Logo className="h-12 w-12 sm:h-[63px] sm:w-[63px]" />
              <div className="flex flex-col items-center">
                <span className="text-lg sm:text-xl font-semibold text-gray-900">
                  Vision<span className="text-primary-600">Drive</span>
                </span>
                <span className="text-[9px] sm:text-[10.8px] text-gray-500 whitespace-nowrap">IoT Company</span>
              </div>
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:justify-center lg:flex-1 lg:mx-4">
            <div className="flex items-center space-x-3 xl:space-x-4 flex-wrap justify-center">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`text-xs xl:text-sm font-medium transition-colors whitespace-nowrap ${
                      isActive 
                        ? 'text-primary-600' 
                        : 'text-gray-700 hover:text-primary-600'
                    }`}
                  >
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Right side: Contact Info, Language, User, Logout */}
          <div className="hidden lg:flex lg:items-center flex-shrink-0">
            {/* Contact Info */}
            <div className="flex flex-col text-right mr-2">
              <span className="text-xs font-medium text-gray-700">LoRaWAN Provider in the UAE</span>
              <a href="https://wa.me/971559152985" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-600 hover:text-primary-600 transition-colors">
                +971 55 915 29 85 📱
              </a>
              <a href="mailto:ask@visiondrive.ae" className="text-xs text-gray-600 hover:text-primary-600 transition-colors">
                ask@visiondrive.ae
              </a>
            </div>
            <div className="mr-2">
              <LanguageSelector />
            </div>
            <div className="flex items-center space-x-1">
              <Link
                href={isLoggedIn ? "/portal" : "/login"}
                className="inline-flex items-center justify-center p-2 hover:bg-gray-50 rounded-lg transition-colors"
                aria-label={isLoggedIn ? "User account" : "Login"}
              >
                <User className={`h-5 w-5 ${isLoggedIn ? 'text-primary-600' : 'text-gray-700'}`} />
              </Link>
              {isLoggedIn && (
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  aria-label="Logout"
                >
                  <LogOut className="h-5 w-5 text-gray-700 hover:text-red-600" />
                </button>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 text-gray-700 hover:text-gray-900"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="lg:hidden border-t border-gray-200">
                <div className="px-2 pt-2 pb-3 space-y-1">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`block px-3 py-2 text-base font-medium rounded-md transition-colors ${
                          isActive
                            ? 'text-primary-600 bg-primary-50'
                            : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    )
                  })}
                  <div className="px-3 py-2">
                    <LanguageSelector />
                  </div>
                  <Link
                    href={isLoggedIn ? "/portal" : "/login"}
                    className="flex items-center justify-center gap-2 px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-colors mt-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className={`h-5 w-5 ${isLoggedIn ? 'text-primary-600' : 'text-gray-700'}`} />
                    <span>{isLoggedIn ? (language === 'ar' ? 'الحساب' : 'Account') : (language === 'ar' ? 'تسجيل الدخول' : 'Login')}</span>
                  </Link>
                  {isLoggedIn && (
                    <button
                      onClick={() => {
                        handleLogout()
                        setMobileMenuOpen(false)
                      }}
                      className="flex items-center justify-center gap-2 px-3 py-2 text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-md transition-colors mt-2 w-full"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>{language === 'ar' ? 'تسجيل الخروج' : 'Logout'}</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
}

