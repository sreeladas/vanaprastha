'use client'
import { Button, LoadingOverlay, Modal, Pill, useModal, ViewDescription } from '@payloadcms/ui'
import React, { useCallback, useState } from 'react'
import { MetadataEditor, BulkUploadContext, type SelectedFile } from './MetadataEditor'
import { styles } from './styles'

type Props = {
  setSelectedFiles: React.Dispatch<React.SetStateAction<SelectedFile[]>>
}

const EnhancedBulkUploadContent: React.FC<Props> = ({ setSelectedFiles }) => {
  const [isUploading, setIsUploading] = useState(false)
  const { toggleModal } = useModal()

  const handleFileUpload = useCallback(async (files: FileList) => {
    setIsUploading(true)
    const uploadPromises = Array.from(files).map(async (file) => {
      const formData = new FormData()
      formData.append('file', file)
      const response = await fetch('/api/media', { method: 'POST', body: formData })
      if (!response.ok) {
        throw new Error(response.statusText)
      }
      const result = await response.json()
      return {
        id: result.doc.id,
        filename: result.doc.filename,
        alt: result.doc.alt,
        caption: result.doc.caption,
        url: result.doc.url,
        thumbnailURL: result.doc.sizes?.thumbnail?.url,
      } as SelectedFile
    })

    const results = await Promise.allSettled(uploadPromises)
    const successfulUploads = results
      .filter(
        (result) =>
          result.status === 'fulfilled' && (result as PromiseFulfilledResult<SelectedFile>).value,
      )
      .map((result) => (result as PromiseFulfilledResult<SelectedFile>).value)
    setSelectedFiles((prev) => [...prev, ...successfulUploads])
    toggleModal('enhanced-bulk-upload')
    toggleModal('edit-metadata')
    setIsUploading(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()

      if (e.dataTransfer.files?.length) {
        handleFileUpload(e.dataTransfer.files)
      }
    },
    [handleFileUpload],
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length) {
        handleFileUpload(e.target.files)
      }
    },
    [handleFileUpload],
  )

  return (
    <div style={styles.modalContainer}>
      <button
        style={styles.closeButton}
        onClick={() => toggleModal('enhanced-bulk-upload')}
        aria-label="Close modal"
      >
        ×
      </button>

      <div
        style={{ textAlign: 'center', padding: '2rem' }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {isUploading && <LoadingOverlay />}
        {!isUploading && (
          <>
            <ViewDescription description="Drag and drop files here" />
            <Pill>or</Pill>

            <input
              id="file-upload"
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <Button onClick={() => document.getElementById('file-upload')?.click()}>
              Choose Files
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

const EnhancedBulkUpload: React.FC = () => {
  const { toggleModal } = useModal()
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([])

  return (
    <>
      <Button onClick={() => toggleModal('enhanced-bulk-upload')}>New Bulk Upload</Button>
      <Modal slug="enhanced-bulk-upload" title="Enhanced Bulk Upload">
        <EnhancedBulkUploadContent setSelectedFiles={setSelectedFiles} />
      </Modal>
      <BulkUploadContext.Provider value={{ selectedFiles, setSelectedFiles }}>
        <Modal slug="edit-metadata" title="Edit Metadata">
          <MetadataEditor files={selectedFiles} setFiles={setSelectedFiles} />
        </Modal>
      </BulkUploadContext.Provider>
    </>
  )
}

export default EnhancedBulkUpload
