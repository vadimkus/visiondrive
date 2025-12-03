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
            setImageError(true)
          }
        } else {
          setImageError(true)
        }
      } catch (error) {
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
      <Image
        src={imageSrc}
        alt="Vision Drive Logo"
        fill
        className="object-contain"
        priority={priority}
        onError={() => setImageError(true)}
      />
    </div>
  )
}

