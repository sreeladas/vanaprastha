import SiteHeader from './SiteHeader'
import SiteFooter from './SiteFooter'
import CollectionCard from './CollectionCard'

interface CollectionSummary {
  slug: string
  title: string
  blurb: string
  heroImage?: string
  heroFocus?: string
}

interface HomePageProps {
  collections: CollectionSummary[]
  imageBaseUrl: string
}

export default function HomePage({ collections, imageBaseUrl }: HomePageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-cream text-foreground">
      <SiteHeader />

      <main className="flex-1">
        <section className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6 leading-tight">
            The Collections of Surjit Das
            <span className="block text-2xl md:text-3xl font-normal text-muted-foreground mt-2">
              at Vanaprastha
            </span>
          </h1>
          <p className="text-lg text-muted-foreground font-sans max-w-2xl mx-auto leading-relaxed">
            A tribute to the discerning eye and profound curiosity of Surjit Das - a visionary
            administrator, a thoughtful collector, and a true connoisseur of culture.
          </p>
        </section>

        <section className="max-w-6xl mx-auto px-6 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((c) => (
              <CollectionCard
                key={c.slug}
                slug={c.slug}
                title={c.title}
                blurb={c.blurb}
                heroImage={c.heroImage}
                heroFocus={c.heroFocus}
                imageBaseUrl={imageBaseUrl}
              />
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
