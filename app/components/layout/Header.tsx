'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Menu, X, User, LogOut } from 'lucide-react'
import { motion as fmMotion, AnimatePresence } from 'framer-motion'
import Logo from '../common/Logo'
import LanguageSelector from '../common/LanguageSelector'
import { useLanguage } from '../../contexts/LanguageContext'

// React 19 + Framer Motion v10 typing edge-case: loosen typing for UI animations.
const motion = fmMotion as any

const navigation = {
  en: [
    { name: 'Home', href: '/' },
    { name: 'Solutions', href: '/solutions' },
    { name: 'Technology', href: '/technology' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ],
  ar: [
    { name: 'الرئيسية', href: '/' },
    { name: 'الحلول', href: '/solutions' },
    { name: 'التكنولوجيا', href: '/technology' },
    { name: 'من نحن', href: '/about' },
    { name: 'اتصل بنا', href: '/contact' },
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
        
        if (response.status === 401) {
          setIsLoggedIn(false)
        } else if (response.ok) {
          setIsLoggedIn(true)
        } else {
          setIsLoggedIn(false)
        }
      } catch (error) {
        setIsLoggedIn(false)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
          <div className="flex w-full items-center justify-between lg:justify-center h-[60px] sm:h-[72px]">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0">
              <Link href="/" className="flex items-center space-x-2 py-2">
                <Logo className="h-10 w-10 sm:h-[56px] sm:w-[56px]" />
                <div className="flex flex-col">
                  <span className="text-base sm:text-xl font-semibold text-gray-900 leading-tight">
                    Vision<span className="text-orange-600">Drive</span>
                  </span>
                  <span className="text-[8px] sm:text-[10px] text-gray-500 whitespace-nowrap">Smart Kitchen IoT 🇦🇪</span>
                </div>
              </Link>
            </div>

            {/* Center: Desktop Navigation */}
            <div className="hidden lg:flex lg:items-center lg:justify-center lg:flex-1 lg:mx-4">
              <div className="flex items-center flex-wrap justify-center gap-x-6 xl:gap-x-8 gap-y-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`text-sm xl:text-base font-medium transition-colors whitespace-nowrap ${
                        isActive 
                          ? 'text-orange-600' 
                          : 'text-gray-700 hover:text-orange-600'
                      }`}
                    >
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Right side: Contact Info, Language, User, Logout */}
            <div className={`hidden lg:flex lg:items-center flex-shrink-0 ${language === 'ar' ? 'space-x-4' : ''}`}>
              {/* Contact Info */}
              <div className={`flex flex-col text-right ${language === 'ar' ? 'mr-4' : 'mr-2'}`}>
                <span className="text-xs font-medium text-gray-700">Smart Kitchen Solutions</span>
                <a href="https://wa.me/971559152985" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-600 hover:text-orange-600 transition-colors">
                  +971 55 915 29 85 📱
                </a>
                <a href="mailto:tech@visiondrive.ae" className="text-xs text-gray-600 hover:text-orange-600 transition-colors">
                  tech@visiondrive.ae
                </a>
              </div>
              <div className={language === 'ar' ? 'mr-4' : 'mr-2'}>
                <LanguageSelector />
              </div>
              <div className={`flex items-center ${language === 'ar' ? 'space-x-2' : 'space-x-1'}`}>
                <Link
                  href={isLoggedIn ? "/portal/smart-kitchen" : "/login"}
                  className="inline-flex items-center justify-center p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  aria-label={isLoggedIn ? "User account" : "Login"}
                >
                  <User className={`h-5 w-5 ${isLoggedIn ? 'text-orange-600' : 'text-gray-700'}`} />
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
                className="relative z-50 inline-flex items-center justify-center w-11 h-11 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-0 top-[60px] bg-white z-40 overflow-y-auto"
          >
            <div className="flex flex-col min-h-full">
              {/* Navigation Links */}
              <nav className="flex-1 px-4 py-6 space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center px-4 py-4 text-lg font-medium rounded-xl transition-all active:scale-[0.98] ${
                        isActive
                          ? 'text-orange-600 bg-orange-50'
                          : 'text-gray-800 hover:text-orange-600 hover:bg-gray-50'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  )
                })}
                
                {/* Kitchen Owner Portal Link */}
                <Link
                  href="/kitchen-owner"
                  className="flex items-center px-4 py-4 text-lg font-medium rounded-xl transition-all active:scale-[0.98] text-orange-700 bg-orange-50 border border-orange-200 mt-4"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  🍳 Kitchen Owner Portal
                </Link>
              </nav>

              {/* Bottom Section */}
              <div className="border-t border-gray-100 px-4 py-6 space-y-4 bg-gray-50">
                {/* Contact Info */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Contact Us</p>
                  <a 
                    href="https://wa.me/971559152985" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-3 py-2 text-gray-700 hover:text-orange-600"
                  >
                    <span className="text-lg">📱</span>
                    <span className="font-medium">+971 55 915 29 85</span>
                  </a>
                  <a 
                    href="mailto:tech@visiondrive.ae" 
                    className="flex items-center gap-3 py-2 text-gray-700 hover:text-orange-600"
                  >
                    <span className="text-lg">✉️</span>
                    <span className="font-medium">tech@visiondrive.ae</span>
                  </a>
                </div>

                {/* Language & Auth */}
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <LanguageSelector />
                  </div>
                  <Link
                    href={isLoggedIn ? "/portal/smart-kitchen" : "/login"}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-colors active:scale-[0.98]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="h-5 w-5" />
                    <span>{isLoggedIn ? (language === 'ar' ? 'لوحة التحكم' : 'Dashboard') : (language === 'ar' ? 'دخول' : 'Login')}</span>
                  </Link>
                </div>

                {isLoggedIn && (
                  <button
                    onClick={() => {
                      handleLogout()
                      setMobileMenuOpen(false)
                    }}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 text-red-600 font-medium rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 transition-colors active:scale-[0.98]"
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
    </>
  )
}
