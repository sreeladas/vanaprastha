'use client'
import React from 'react'
import { Button } from '@payloadcms/ui'
import { styles } from './styles'
import { AUTOMATED_COLLECTIONS } from '@/config/collections'

interface BulkCollectionSelectorProps {
  selectedCollections: string[]
  onChange: (collections: string[]) => void
}

const COLLECTION_OPTIONS = AUTOMATED_COLLECTIONS.map((collection) => ({
  label: collection.title,
  value: collection.slug,
}))

export const BulkCollectionSelector: React.FC<BulkCollectionSelectorProps> = ({
  selectedCollections,
  onChange,
}) => {
  const handleCollectionToggle = (collectionValue: string) => {
    const isSelected = selectedCollections.includes(collectionValue)
    onChange(
      isSelected
        ? selectedCollections.filter((c) => c !== collectionValue)
        : [...selectedCollections, collectionValue],
    )
  }

  const handleSelectAll = () => {
    if (selectedCollections.length === COLLECTION_OPTIONS.length) {
      onChange([])
    } else {
      onChange(COLLECTION_OPTIONS.map((opt) => opt.value))
    }
  }

  return (
    <div className="field-type">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.5rem',
        }}
      >
        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '500' }}>
          Bulk Collection Assignment
        </h3>
        <Button el="button" onClick={handleSelectAll} size="small">
          {selectedCollections.length === COLLECTION_OPTIONS.length ? 'Deselect All' : 'Select All'}
        </Button>
      </div>

      <div style={styles.gridContainer}>
        {COLLECTION_OPTIONS.map((option) => (
          <label
            key={option.value}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <input
              type="checkbox"
              className="checkbox"
              checked={selectedCollections.includes(option.value)}
              onChange={() => handleCollectionToggle(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>

      <div style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: '#6b7280' }}>
        {selectedCollections.length} of {COLLECTION_OPTIONS.length} collections selected
      </div>
    </div>
  )
}
