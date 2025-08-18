import type { Page, ArchiveBlock as ArchiveBlockProps } from '@/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import RichText from '@/components/RichText'

import { CollectionArchive } from '@/components/CollectionArchive'
import { CollectionGalleryArchive } from '@/components/CollectionGalleryArchive'

export const ArchiveBlock: React.FC<
  ArchiveBlockProps & {
    id?: string
  }
> = async (props) => {
  const {
    id,
    categories,
    introContent,
    limit: limitFromProps,
    populateBy,
    selectedDocs,
    relationTo,
  } = props

  const limit = limitFromProps || 3

  let pages: Page[] = []

  if (populateBy === 'collection') {
    const payload = await getPayload({ config: configPromise })
    const targetCollection = relationTo || 'pages'

    const flattenedCategories = categories?.map((category) => {
      if (typeof category === 'object') return category.id
      else return category
    })

    const fetchedPages = await payload.find({
      /* eslint-disable  @typescript-eslint/no-explicit-any */
      collection: targetCollection as any,
      depth: 1,
      limit,
      ...(flattenedCategories && flattenedCategories.length > 0
        ? {
            where: {
              categories: {
                in: flattenedCategories,
              },
            },
          }
        : {}),
    })

    pages = fetchedPages.docs
  } else {
    if (selectedDocs?.length) {
      const filteredSelectedPages = selectedDocs.map((page) => {
        if (typeof page.value === 'object') return page.value
      }) as Page[]

      pages = filteredSelectedPages
    }
  }

  // Check if we're displaying a custom collection (with galleryImages)
  const isCustomCollection = relationTo && relationTo !== 'pages'
  const customCollectionSlugs = [
    'bollywood-posters',
    'butterflies',
    'dokra-metal-craft',
    'fossils',
    'masks',
    'nekchand-works',
    'paintings',
    'photography',
    'sea-shells',
    'wooden-works',
  ]

  if (isCustomCollection && customCollectionSlugs.includes(relationTo) && pages.length > 0) {
    // For custom collections, display the gallery from the first (and only) collection entry
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    const collectionEntry = pages[0] as any

    return (
      <div className="my-16" id={`block-${id}`}>
        {introContent && (
          <div className="container mb-16">
            <RichText className="ms-0 max-w-[48rem]" data={introContent} enableGutter={false} />
          </div>
        )}
        <CollectionGalleryArchive collection={collectionEntry} />
      </div>
    )
  }

  // Default behavior for pages and other collections
  return (
    <div className="my-16" id={`block-${id}`}>
      {introContent && (
        <div className="container mb-16">
          <RichText className="ms-0 max-w-[48rem]" data={introContent} enableGutter={false} />
        </div>
      )}
      <CollectionArchive pages={pages} />
    </div>
  )
}
