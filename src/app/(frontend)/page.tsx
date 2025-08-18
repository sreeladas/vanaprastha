import { CollectionSlug, getPayload } from 'payload'
import configPromise from '@payload-config'
import React from 'react'
import { Card, CardPageData } from '@/components/Card'

export default async function HomePage() {
  const payload = await getPayload({ config: configPromise })

  // Fetch homepage global data for editable description
  const homepageData = await payload.findGlobal({
    slug: 'homepage',
  })

  const collections = [
    'nekchand-works',
    'masks',
    'wooden-works',
    'bollywood-posters',
    'paintings',
    'photography',
    'dokra-metal-craft',
    'fossils',
    'sea-shells',
    'butterflies',
  ] as CollectionSlug[]

  const collectionData = await Promise.all(
    collections.map(async (collection) => {
      const docs = await payload.find({
        collection,
        limit: 1,
        select: {
          slug: true,
          title: true,
          hero: true,
          heroImage: true,
          galleryImages: { image: true },
          caption: true,
          description: true,
          meta: true,
          id: true,
        },
      })
      return {
        collectionTitle: collection,
        pages: docs.docs as CardPageData[],
      }
    }),
  )

  return (
    <main className="flex flex-col items-center justify-center min-h-screen pt-16 pb-24">
      <h1 className="text-3xl font-bold mb-8 text-center">Vanaprastha</h1>
      {homepageData?.description && (
        <p className="text-lg text-center mb-12 max-w-3xl">{homepageData.description}</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl px-4">
        {collectionData.map(({ collectionTitle, pages }) =>
          pages.map((page, index) => {
            // Determine hero image with fallback
            const heroImage =
              page.heroImage || page.heroImage || (page.galleryImages?.[0]?.image ?? null)

            const pageWithHero = {
              ...page,
              slug: collectionTitle,
              meta: {
                ...page.meta,
                image: heroImage,
              },
            }

            return (
              <Card
                key={`${collectionTitle}-${index}`}
                className="h-full"
                doc={pageWithHero}
                showCategories
              />
            )
          }),
        )}
      </div>
    </main>
  )
}
