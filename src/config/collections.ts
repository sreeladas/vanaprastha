import type { CollectionConfig } from 'payload'

// Import all collection configurations
import { BollywoodPosters } from '../collections/BollywoodPosters'
import { Butterflies } from '../collections/Butterflies'
import { DokraMetalCraft } from '../collections/DokraMetalCraft'
import { Fossils } from '../collections/Fossils'
import { Masks } from '../collections/Masks'
import { NekchandWorks } from '../collections/NekchandWorks'
import { Paintings } from '../collections/Paintings'
import { Photography } from '../collections/Photography'
import { SeaShells } from '../collections/SeaShells'
import { WoodenWorks } from '../collections/WoodenWorks'

export interface CollectionInfo {
  slug: string
  title: string
  config: CollectionConfig
}

// Collection slugs as const for type safety
export const COLLECTION_SLUGS = [
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
] as const

// Centralized collection registry
export const AUTOMATED_COLLECTIONS: CollectionInfo[] = [
  {
    slug: 'bollywood-posters',
    title: 'Bollywood Posters',
    config: BollywoodPosters,
  },
  {
    slug: 'butterflies',
    title: 'Butterflies',
    config: Butterflies,
  },
  {
    slug: 'dokra-metal-craft',
    title: 'Dokra Metal Craft',
    config: DokraMetalCraft,
  },
  {
    slug: 'fossils',
    title: 'Fossils',
    config: Fossils,
  },
  {
    slug: 'masks',
    title: 'Masks',
    config: Masks,
  },
  {
    slug: 'nekchand-works',
    title: 'Works by Nek Chand',
    config: NekchandWorks,
  },
  {
    slug: 'paintings',
    title: 'Paintings',
    config: Paintings,
  },
  {
    slug: 'photography',
    title: 'Photography',
    config: Photography,
  },
  {
    slug: 'sea-shells',
    title: 'Sea Shells',
    config: SeaShells,
  },
  {
    slug: 'wooden-works',
    title: 'Wooden Works',
    config: WoodenWorks,
  },
]

// Helper functions to extract different aspects of the collections
export const getCollectionConfigs = (): CollectionConfig[] => {
  return AUTOMATED_COLLECTIONS.map((collection) => collection.config)
}

export const getCollectionSlugs = (): readonly string[] => {
  return AUTOMATED_COLLECTIONS.map((collection) => collection.slug)
}

export const getCollectionTitles = (): Record<string, string> => {
  return AUTOMATED_COLLECTIONS.reduce(
    (acc, collection) => {
      acc[collection.slug] = collection.title
      return acc
    },
    {} as Record<string, string>,
  )
}

export const getCollectionBySlug = (slug: string): CollectionInfo | undefined => {
  return AUTOMATED_COLLECTIONS.find((collection) => collection.slug === slug)
}
