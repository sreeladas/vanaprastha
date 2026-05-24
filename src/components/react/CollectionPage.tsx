import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import Gallery from './Gallery';

interface CollectionItem {
  filename: string;
  title?: string;
  caption?: string;
}

interface CollectionPageProps {
  title: string;
  blurb: string;
  heroImage?: string;
  items: CollectionItem[];
  slug: string;
  imageBaseUrl: string;
}

export default function CollectionPage({ title, blurb, heroImage, items, slug, imageBaseUrl }: CollectionPageProps) {
  const heroSrc = heroImage ? `${imageBaseUrl}/collections/${slug}/${heroImage}` : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-cream text-warmgray-900">
      <SiteHeader />

      <main className="flex-1">
        {heroSrc && (
          <div className="relative h-64 md:h-96 overflow-hidden">
            <img src={heroSrc} alt={title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
              <h1 className="text-3xl md:text-5xl font-serif font-bold text-white">{title}</h1>
            </div>
          </div>
        )}

        {!heroSrc && (
          <div className="max-w-4xl mx-auto px-6 pt-12">
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-warmgray-900">{title}</h1>
          </div>
        )}

        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="prose prose-warmgray font-sans text-warmgray-700 leading-relaxed max-w-none">
            {blurb.split('\n\n').map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 pb-16">
          <Gallery items={items} collectionSlug={slug} imageBaseUrl={imageBaseUrl} />
        </div>

        <div className="max-w-4xl mx-auto px-6 pb-8">
          <a href="/" className="text-warmgray-500 hover:text-warmgray-700 font-sans text-sm transition-colors">
            ← Back to all collections
          </a>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
