'use client'
import { Button, Gutter, Thumbnail, useModal, useSelection } from '@payloadcms/ui'
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { cn } from '../../utilities/ui'
import { BulkCollectionSelector } from './BulkCollectionSelector'
import { TruncatedTextField, TruncatedTextFieldRef } from './TruncatedTextField'
import { styles } from './styles'

export interface SelectedFile {
  id: string
  filename: string
  alt?: string
  caption?: any
  url: string
  thumbnailURL?: string
  collections?: string[]
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
  const [localFiles, setLocalFiles] = useState<SelectedFile[]>([])
  const [isUpdating, setIsUpdating] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const { toggleModal } = useModal()
  const fieldRefs = useRef<Record<string, Record<string, TruncatedTextFieldRef | null>>>({})

  useEffect(() => {
    setLocalFiles([...files])
    setHasUnsavedChanges(false)
  }, [files])

  useEffect(() => {
    if (bulkCollections.length > 0) {
      setLocalFiles((prev) =>
        prev.map((file) => ({
          ...file,
          collections: [...bulkCollections],
        })),
      )
      setHasUnsavedChanges(true)
    }
  }, [bulkCollections])

  const handleUpdateLocalFile = useCallback((fileId: string, field: string, value: any) => {
    setLocalFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, [field]: value } : f)))
    setHasUnsavedChanges(true)
  }, [])

  const handleSaveAll = useCallback(async () => {
    setIsUpdating(true)
    try {
      Object.values(fieldRefs.current).forEach((fileRefs) => {
        Object.values(fileRefs).forEach((ref) => {
          ref?.save()
        })
      })

      await new Promise((resolve) => setTimeout(resolve, 100))

      const results = await Promise.all(
        localFiles.map((file) => {
          const updateData: any = {
            filename: file.filename,
            alt: file.alt,
            caption: file.caption,
          }
          if (file.collections) {
            updateData.collections = file.collections
          }
          return fetch(`/api/media/${file.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData),
          })
        }),
      )

      const failed = results.filter((r) => !r.ok)
      if (failed.length) {
        console.warn(`${failed.length} files failed to update`)
      } else {
        setFiles([...localFiles])
        setHasUnsavedChanges(false)
      }
    } finally {
      setIsUpdating(false)
    }
  }, [localFiles, setFiles])

  const openDetailEditor = useCallback((fileId: string) => {
    window.open(`/admin/collections/media/${fileId}`, '_blank', 'width=1200,height=800')
  }, [])

  if (localFiles.length === 0) {
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
        <div style={{ marginBottom: '1rem' }}>
          <BulkCollectionSelector
            selectedCollections={bulkCollections}
            onChange={setBulkCollections}
          />
        </div>

        {hasUnsavedChanges && (
          <div style={{ marginBottom: '1rem' }}>
            <Button onClick={handleSaveAll} disabled={isUpdating} size="small">
              {isUpdating ? 'Saving...' : 'Save All Changes'}
            </Button>
          </div>
        )}

        <div style={styles.spacingVertical}>
          {localFiles.map((file) => (
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
                  ref={(ref) => {
                    if (!fieldRefs.current[file.id]) fieldRefs.current[file.id] = {}
                    fieldRefs.current[file.id]['filename'] = ref
                  }}
                  value={file.filename || ''}
                  onChange={(value) => handleUpdateLocalFile(file.id, 'filename', value)}
                  onSave={(value) => handleUpdateLocalFile(file.id, 'filename', value)}
                  placeholder="Name"
                />
                <TruncatedTextField
                  ref={(ref) => {
                    if (!fieldRefs.current[file.id]) fieldRefs.current[file.id] = {}
                    fieldRefs.current[file.id]['alt'] = ref
                  }}
                  value={file.alt || ''}
                  onChange={(value) => handleUpdateLocalFile(file.id, 'alt', value)}
                  onSave={(value) => handleUpdateLocalFile(file.id, 'alt', value)}
                  placeholder="Alt text"
                />
                <TruncatedTextField
                  ref={(ref) => {
                    if (!fieldRefs.current[file.id]) fieldRefs.current[file.id] = {}
                    fieldRefs.current[file.id]['caption'] = ref
                  }}
                  value={file.caption || ''}
                  onChange={(value) => handleUpdateLocalFile(file.id, 'caption', value)}
                  onSave={(value) => handleUpdateLocalFile(file.id, 'caption', value)}
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

export const EditMetadataButton: React.FC<{ docs?: any[] }> = ({ docs = [] }) => {
  const { toggleModal } = useModal()
  const { selected } = useSelection()
  const ctx = useContext(BulkUploadContext)
  if (!ctx) return null
  const { setSelectedFiles } = ctx

  const handleOpen = () => {
    if (selected && selected.size > 0) {
      const selectedDocs = docs.filter((doc) => selected.has(doc.id))
      setSelectedFiles(
        selectedDocs.map((doc) => ({
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

  return (
    <Button onClick={handleOpen} disabled={selected.size === 0}>
      Edit Metadata
    </Button>
  )
}
