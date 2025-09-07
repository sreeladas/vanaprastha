'use client'
import React, { useState, useEffect } from 'react'
import { styles } from './styles'

interface TruncatedTextFieldProps {
  value: string
  onChange: (value: string) => void
  isRichText?: boolean
  placeholder?: string
}

export const TruncatedTextField: React.FC<TruncatedTextFieldProps> = ({
  value,
  onChange,
  isRichText = false,
  placeholder = '',
}) => {
  const [localValue, setLocalValue] = useState('')
  const displayValue = isRichText ? extractPlaintext(value) : value

  // Sync with prop value when it changes
  useEffect(() => {
    setLocalValue(displayValue)
  }, [displayValue])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value)
  }

  const handleBlur = () => {
    onChange(localValue)
  }

  return (
    <div style={styles.flexContainer}>
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        style={styles.inputField}
      />
    </div>
  )
}

const extractPlaintext = (richText: any): string => {
  if (typeof richText === 'string') return richText
  if (!richText?.root?.children) return ''
  const extractFromChildren = (children: any[]): string =>
    children
      .map((child) =>
        child.type === 'text'
          ? child.text || ''
          : child.children
            ? extractFromChildren(child.children)
            : '',
      )
      .join(' ')
  return extractFromChildren(richText.root.children)
}
