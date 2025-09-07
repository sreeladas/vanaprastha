'use client'
import { Button, Gutter, Thumbnail, useModal, useSelection } from '@payloadcms/ui'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { cn } from '../../utilities/ui'
import { BulkCollectionSelector } from './BulkCollectionSelector'
import { TruncatedTextField } from './TruncatedTextField'
import { styles } from './styles'

export interface SelectedFile {
  id: string
  filename: string
  alt?: string
  caption?: any
  url: string
  thumbnailURL?: string
}

interface MetadataEditorProps {
  files: SelectedFile[]
  setFiles: React.Dispatch<React.SetStateAction<SelectedFile[]>>
}

export const BulkUploadContext = React.createContext<{
  selectedFiles: SelectedFile[]
  setSelectedFiles: React.Dispatch<React.SetStateAction<SelectedFile[]>>
} | null>(null)

export const MetadataEditor: React.FC<MetadataEditorProps> = ({ files, setFiles }) => {
  const [bulkCollections, setBulkCollections] = useState<string[]>([])
  const [isUpdating, setIsUpdating] = useState(false)
  const { toggleModal } = useModal()

  const handleUpdateFile = useCallback(
    async (fileId: string, field: string, value: any) => {
      try {
        const res = await fetch(`/api/media/${fileId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [field]: value }),
        })
        if (!res.ok) throw new Error(`Update failed: ${res.statusText}`)
        setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, [field]: value } : f)))
      } catch (err) {
        console.error('Failed to update file:', err)
      }
    },
    [setFiles],
  )

  const handleBulkUpdateCollections = useCallback(
    async (collections: string[]) => {
      if (!collections.length) return
      setIsUpdating(true)
      try {
        const fileIds = files.map((f) => f.id)
        const results = await Promise.all(
          fileIds.map((id) =>
            fetch(`/api/media/${id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ collections }),
            }),
          ),
        )
        const failed = results.filter((r) => !r.ok)
        if (failed.length) console.warn(`${failed.length} files failed to update collections`)
      } finally {
        setIsUpdating(false)
      }
    },
    [files],
  )

  const openDetailEditor = useCallback((fileId: string) => {
    window.open(`/admin/collections/media/${fileId}`, '_blank', 'width=1200,height=800')
  }, [])

  if (files.length === 0) {
    return <div className={cn('text-gray-500 text-center py-4')}>No files uploaded yet</div>
  }

  return (
    <div style={styles.modalContainer}>
      <button
        style={styles.closeButton}
        onClick={() => toggleModal('edit-metadata')}
        aria-label="Close modal"
      >
        ×
      </button>

      <Gutter>
        <BulkCollectionSelector
          selectedCollections={bulkCollections}
          onChange={setBulkCollections}
        />

        {bulkCollections.length > 0 && (
          <Button
            onClick={() => handleBulkUpdateCollections(bulkCollections)}
            disabled={isUpdating}
          >
            {isUpdating ? 'Applying...' : `Apply to ${files.length} Files`}
          </Button>
        )}

        <div style={styles.spacingVertical}>
          {files.map((file) => (
            <div
              key={file.id}
              style={{
                ...styles.cardContainer,
                ...styles.flexContainerHorizontal,
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <Thumbnail
                fileSrc={file.thumbnailURL || file.url}
                className={cn('w-16 h-16 flex-shrink-0 object-cover rounded')}
              />
              <div style={styles.flexContainer}>
                <TruncatedTextField
                  value={file.filename || ''}
                  onChange={(value) => handleUpdateFile(file.id, 'filename', value)}
                  placeholder="Name"
                />
                <TruncatedTextField
                  value={file.alt || ''}
                  onChange={(value) => handleUpdateFile(file.id, 'alt', value)}
                  placeholder="Alt text"
                />
                <TruncatedTextField
                  value={file.caption || ''}
                  onChange={(value) => handleUpdateFile(file.id, 'caption', value)}
                  isRichText={true}
                  placeholder="Caption"
                />
                <Button el="button" onClick={() => openDetailEditor(file.id)}>
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Gutter>
    </div>
  )
}

export const EditMetadataButton: React.FC = () => {
  const { toggleModal } = useModal()
  const { selected } = useSelection()
  const ctx = useContext(BulkUploadContext)
  if (!ctx) return null
  const { setSelectedFiles } = ctx

  const handleOpen = () => {
    if (selected?.docs?.length) {
      setSelectedFiles(
        selected.docs.map((doc) => ({
          id: doc.id,
          filename: doc.filename,
          alt: doc.alt,
          caption: doc.caption,
          url: doc.url,
          thumbnailURL: doc.sizes?.thumbnail?.url,
        })),
      )
      toggleModal('edit-metadata')
    }
  }

  return <Button onClick={handleOpen}>Edit Metadata</Button>
}
