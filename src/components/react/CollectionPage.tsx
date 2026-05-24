import { useMemo } from 'react';
import { marked } from 'marked';
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
  heroFocus?: string;
  items: CollectionItem[];
  slug: string;
  imageBaseUrl: string;
}

export default function CollectionPage({ title, blurb, heroImage, heroFocus, items, slug, imageBaseUrl }: CollectionPageProps) {
  const heroSrc = heroImage ? `${imageBaseUrl}/collections/${slug}/${heroImage}` : undefined;
  const blurbHtml = useMemo(() => marked.parse(blurb, { async: false }) as string, [blurb]);

  return (
    <div className="min-h-screen flex flex-col bg-cream text-warmgray-900">
      <SiteHeader />

      <main className="flex-1">
        {heroSrc && (
          <div className="relative h-64 md:h-96 overflow-hidden">
            <img src={heroSrc} alt={title} className="w-full h-full object-cover" style={{ objectPosition: heroFocus || '50% 50%' }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 max-w-5xl mx-auto px-6 pb-6 md:pb-10">
              <h1 className="text-3xl md:text-5xl font-serif font-bold text-white">{title}</h1>
            </div>
          </div>
        )}

        <div className="max-w-5xl mx-auto px-6">
          {!heroSrc && (
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-warmgray-900 pt-12">{title}</h1>
          )}

          <div className="py-8">
            <div
              className="prose prose-warmgray prose-lg font-sans text-warmgray-700 leading-relaxed max-w-none [&_p]:mb-6 [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-warmgray-900 [&_h2]:font-serif [&_ul]:my-4 [&_ul]:space-y-2 [&_li]:leading-relaxed [&_iframe]:rounded-lg [&_iframe]:my-6 [&_a]:text-warmgray-900 [&_a]:underline [&_a:hover]:text-warmgray-600 [&_hr]:my-8 [&_hr]:border-warmgray-200 [&_em]:text-warmgray-500 [&_em]:text-sm"
              dangerouslySetInnerHTML={{ __html: blurbHtml }}
            />
          </div>

          <div className="pb-16">
            <Gallery items={items} collectionSlug={slug} imageBaseUrl={imageBaseUrl} />
          </div>

          <div className="pb-8">
            <a href="/" className="text-warmgray-500 hover:text-warmgray-700 font-sans text-sm transition-colors">
              ← Back to all collections
            </a>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
