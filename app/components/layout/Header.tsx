'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Menu, X, User, LogOut, ChevronRight } from 'lucide-react'
import { motion as fmMotion, AnimatePresence } from 'framer-motion'
import Logo from '../common/Logo'
import LanguageSelector from '../common/LanguageSelector'
import { useLanguage } from '../../contexts/LanguageContext'

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

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <nav className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="flex items-center justify-between h-16 md:h-[72px]">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5">
              <Logo className="h-9 w-9 md:h-11 md:w-11" />
              <div className="flex flex-col">
                <span className="text-[17px] md:text-lg font-semibold text-gray-900 leading-tight">
                  Vision<span className="text-orange-500">Drive</span>
                </span>
                <span className="text-[10px] text-gray-400 hidden sm:block">IoT company 🇦🇪</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-4 py-2 text-[15px] font-medium rounded-full transition-all ${
                      isActive 
                        ? 'text-orange-600 bg-orange-50' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {item.name}
                  </Link>
                )
              })}
            </div>

            {/* Desktop Right Side */}
            <div className="hidden lg:flex items-center gap-3">
              <div className="flex flex-col text-right mr-2">
                <a href="https://wa.me/971559152985" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-orange-500 transition-colors">
                  +971 55 915 29 85
                </a>
                <a href="mailto:tech@visiondrive.ae" className="text-xs text-gray-500 hover:text-orange-500 transition-colors">
                  tech@visiondrive.ae
                </a>
              </div>
              <LanguageSelector />
              <Link
                href={isLoggedIn ? "/portal/smart-kitchen" : "/login"}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <User className={`h-5 w-5 ${isLoggedIn ? 'text-orange-500' : 'text-gray-600'}`} />
              </Link>
              {isLoggedIn && (
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-5 w-5 text-gray-500 hover:text-red-500" />
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              className="lg:hidden flex items-center justify-center w-11 h-11 -mr-2 rounded-xl text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu - Full Screen Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-0 z-40 bg-white"
            style={{ paddingTop: '64px' }}
          >
            <div className="flex flex-col h-full overflow-y-auto">
              
              {/* Navigation Links */}
              <div className="flex-1 px-5 py-6">
                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center justify-between px-4 py-4 text-[17px] font-medium rounded-2xl transition-all active:scale-[0.98] ${
                          isActive
                            ? 'text-orange-600 bg-orange-50'
                            : 'text-gray-900 hover:bg-gray-50'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                        <ChevronRight className={`h-5 w-5 ${isActive ? 'text-orange-400' : 'text-gray-300'}`} />
                      </Link>
                    )
                  })}
                </nav>
                
                {/* Kitchen Owner Portal */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <Link
                    href="/kitchen-owner"
                    className="flex items-center justify-between px-4 py-4 bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 text-[17px] font-semibold rounded-2xl border border-orange-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🍳</span>
                      <span>Kitchen Owner Portal</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-orange-400" />
                  </Link>
                </div>
              </div>

              {/* Bottom Section */}
              <div className="border-t border-gray-100 px-5 py-6 bg-gray-50">
                {/* Contact Cards */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <a 
                    href="https://wa.me/971559152985" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-gray-100"
                  >
                    <span className="text-2xl">💬</span>
                    <span className="text-sm font-medium text-gray-900">WhatsApp</span>
                  </a>
                  <a 
                    href="mailto:tech@visiondrive.ae" 
                    className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-gray-100"
                  >
                    <span className="text-2xl">✉️</span>
                    <span className="text-sm font-medium text-gray-900">Email</span>
                  </a>
                </div>

                {/* Language & Login */}
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <LanguageSelector />
                  </div>
                  <Link
                    href={isLoggedIn ? "/portal/smart-kitchen" : "/login"}
                    className="flex items-center justify-center gap-2 h-12 px-6 bg-gray-900 text-white font-semibold rounded-xl transition-all active:scale-[0.98]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="h-5 w-5" />
                    <span>{isLoggedIn ? 'Dashboard' : 'Login'}</span>
                  </Link>
                </div>

                {isLoggedIn && (
                  <button
                    onClick={() => {
                      handleLogout()
                      setMobileMenuOpen(false)
                    }}
                    className="flex items-center justify-center gap-2 w-full h-12 mt-3 text-red-600 font-medium rounded-xl border border-red-200 bg-white transition-all active:scale-[0.98]"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
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
