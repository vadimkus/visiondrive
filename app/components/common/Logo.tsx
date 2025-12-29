'use client'

import { useState } from 'react'
import Image from 'next/image'

interface LogoProps {
  className?: string
  priority?: boolean
}

// Static logo path - use this for instant loading
const STATIC_LOGO_PATH = '/images/logo/logo.jpg'

export default function Logo({ className = 'h-[42px] w-[42px]', priority = false }: LogoProps) {
  const [imageSrc, setImageSrc] = useState<string>(STATIC_LOGO_PATH)
  const [imageError, setImageError] = useState(false)
  const [useNextImage, setUseNextImage] = useState(true)

  const handleError = async () => {
    // If static logo fails, try fetching from database as fallback
    if (imageSrc === STATIC_LOGO_PATH) {
      try {
        const response = await fetch('/api/images/logo', {
          credentials: 'include',
          cache: 'force-cache',
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.image?.data) {
            setImageSrc(data.image.data)
            setImageError(false)
            // Data URLs need unoptimized next/image or fallback to img
            setUseNextImage(false)
            return
          }
        }
      } catch (error) {
        console.error('Failed to load logo from database:', error)
      }
    }
    setImageError(true)
  }

  if (imageError) {
    return (
      <div className={`${className} bg-primary-600 rounded-lg flex items-center justify-center`}>
        <span className="text-white font-bold text-lg">V</span>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {useNextImage ? (
        <Image
          src={imageSrc}
          alt="Vision Drive Logo"
          fill
          className="object-contain"
          priority={priority}
          onError={handleError}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageSrc}
          alt="Vision Drive Logo"
          className="w-full h-full object-contain"
          onError={handleError}
        />
      )}
    </div>
  )
}

