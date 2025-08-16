import type { Metadata } from 'next'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/utilities/generateMeta'
import { CollectionCarousel } from '@/components/CollectionCarousel'
import { LivePreviewListener } from '@/components/LivePreviewListener'

// Map slugs to collection names
const collectionMap = {
  'bollywood-posters': 'bollywood-posters',
  'butterflies': 'butterflies',
  'dokra-metal-craft': 'dokra-metal-craft',
  'fossils': 'fossils',
  'masks': 'masks',
  'nekchand-works': 'nekchand-works',
  'paintings': 'paintings',
  'photography': 'photography',
  'sea-shells': 'sea-shells',
  'wooden-works': 'wooden-works',
} as const

type CollectionSlug = keyof typeof collectionMap

export async function generateStaticParams() {
  return Object.keys(collectionMap).map((slug) => ({
    collection: slug,
  }))
}

type Args = {
  params: Promise<{
    collection: CollectionSlug
  }>
}

export default async function CollectionPage({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { collection } = await paramsPromise
  const url = `/${collection}`

  // Get the collection slug for Payload
  const collectionSlug = collectionMap[collection]
  
  if (!collectionSlug) {
    return <PayloadRedirects url={url} />
  }

  const collectionData = await queryCollection({
    collection: collectionSlug,
  })

  if (!collectionData || collectionData.docs.length === 0) {
    return <PayloadRedirects url={url} />
  }

  // Use the first document as the main collection page
  const mainDoc = collectionData.docs[0]
  const { heroImage, galleryImages, title, description } = mainDoc

  // Create hero object from heroImage
  const hero = heroImage ? {
    type: 'mediumImpact',
    media: heroImage,
    richText: {
      root: {
        type: 'root',
        children: [
          {
            type: 'heading',
            children: [
              {
                type: 'text',
                text: title,
                version: 1,
              },
            ],
            tag: 'h1',
            version: 1,
          },
          ...(description ? [{
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: description,
                version: 1,
              },
            ],
            version: 1,
          }] : []),
        ],
        version: 1,
      },
    },
  } : null

  return (
    <article className="pt-16 pb-24">
      <PayloadRedirects disableNotFound url={url} />
      
      {draft && <LivePreviewListener />}

      {hero && <RenderHero {...hero} />}
      
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {!hero && (
            <>
              <h1 className="text-4xl font-bold mb-4 text-center">{title}</h1>
              {description && (
                <p className="text-lg text-center mb-8 text-gray-600">{description}</p>
              )}
            </>
          )}
          
          {galleryImages && galleryImages.length > 0 && (
            <CollectionCarousel images={galleryImages} collectionTitle={title} />
          )}
        </div>
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { collection } = await paramsPromise
  const collectionSlug = collectionMap[collection]
  
  if (!collectionSlug) {
    return {}
  }

  const collectionData = await queryCollection({
    collection: collectionSlug,
  })

  const mainDoc = collectionData?.docs?.[0]

  return generateMeta({ doc: mainDoc })
}

const queryCollection = cache(async ({ collection }: { collection: string }) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: collection as any,
    draft,
    limit: 100,
    pagination: false,
    overrideAccess: draft,
  })

  return result
})