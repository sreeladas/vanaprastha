'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

export const Logo = (props: Props) => {
  const { className, loading: loadingFromProps, priority: priorityFromProps } = props
  const [theme, setTheme] = useState<string>('dark')

  const loading = loadingFromProps || 'lazy'
  const priority = priorityFromProps || 'low'

  useEffect(() => {
    // Function to get theme from localStorage
    const getTheme = () => {
      if (typeof window !== 'undefined') {
        const storedTheme = localStorage.getItem('payload-theme')
        return storedTheme || 'dark'
      }
      return 'dark'
    }

    // Set initial theme
    setTheme(getTheme())

    // Listen for storage changes (when theme changes in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'payload-theme') {
        setTheme(e.newValue || 'dark')
      }
    }

    // Listen for theme changes in the same window
    const handleThemeChange = () => {
      setTheme(getTheme())
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('theme-change', handleThemeChange)

    // Also listen for any changes to localStorage directly
    const originalSetItem = localStorage.setItem
    localStorage.setItem = function (key, value) {
      originalSetItem.apply(this, [key, value])
      if (key === 'payload-theme') {
        setTheme(value)
      }
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('theme-change', handleThemeChange)
      localStorage.setItem = originalSetItem
    }
  }, [])

  const src = theme === 'dark' ? '/vanaprastha-white.svg' : '/vanaprastha-black.svg'

  return (
    <div className={`flex items-center gap-3 ${className || ''}`}>
      <Image
        src={src}
        alt="Vanaprastha Logo"
        height={32}
        width={32}
        loading={loading}
        priority={priority === 'high'}
        className={className || ''}
      />
      <span className="text-lg font-medium">Vanaprastha</span>
    </div>
  )
}
