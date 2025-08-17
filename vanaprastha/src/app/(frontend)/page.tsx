import { CollectionSlug, getPayload } from 'payload'
import configPromise from '@payload-config'
import React from 'react'
import Link from 'next/link'
import { Card, CardPageData } from '@/components/Card'

export default async function HomePage() {
  const payload = await getPayload({ config: configPromise })

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
        limit: 10,
        select: { slug: true, title: true, hero: true, caption: true, description: true, id: true },
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
      <div className="flex flex-col gap-12 w-full max-w-5xl">
        {collectionData.map(({ collectionTitle, pages }) => (
          <div key={collectionTitle} className="w-full">
            {pages.map((page, index) => (
              <Link key={index} href={`/${collectionTitle}`} className="group">
                <Card className="h-full" doc={page} showCategories />
              </Link>
            ))}
          </div>
        ))}
      </div>
    </main>
  )
}
