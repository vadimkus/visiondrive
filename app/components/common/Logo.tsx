'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface LogoProps {
  className?: string
  priority?: boolean
}

export default function Logo({ className = 'h-[42px] w-[42px]', priority = false }: LogoProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [imageError, setImageError] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch logo from API
    const fetchLogo = async () => {
      try {
        const response = await fetch('/api/images/logo', {
          credentials: 'include',
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.image?.data) {
            setImageSrc(data.image.data)
          } else {
            // Logo not found in database, show fallback
            setImageError(true)
          }
        } else {
          // API error, show fallback
          setImageError(true)
        }
      } catch (error) {
        // Network or other error, show fallback
        console.error('Failed to load logo:', error)
        setImageError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchLogo()
  }, [])

  if (loading) {
    return (
      <div className={`${className} bg-gray-200 rounded-lg animate-pulse`} />
    )
  }

  if (imageError || !imageSrc) {
    return (
      <div className={`${className} bg-primary-600 rounded-lg flex items-center justify-center`}>
        <span className="text-white font-bold text-lg">V</span>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <img
        src={imageSrc || undefined}
        alt="Vision Drive Logo"
        className="w-full h-full object-contain"
        onError={() => setImageError(true)}
      />
    </div>
  )
}

