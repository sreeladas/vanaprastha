interface CollectionCardProps {
  slug: string;
  title: string;
  blurb: string;
  heroImage?: string;
  heroFocus?: string;
  imageBaseUrl: string;
}

export default function CollectionCard({ slug, title, blurb, heroImage, heroFocus, imageBaseUrl }: CollectionCardProps) {
  const imgSrc = heroImage ? `${imageBaseUrl}/collections/${slug}/${heroImage}` : undefined;

  return (
    <a
      href={`/collections/${slug}`}
      className="group block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-warmgray-100"
    >
      <div className="aspect-[4/3] bg-warmgray-100 overflow-hidden">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            style={{ objectPosition: heroFocus || '50% 50%' }}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground font-sans text-base">
            No image
          </div>
        )}
      </div>
      <div className="p-5">
        <h2 className="text-xl font-semibold text-foreground mb-2 font-serif">{title}</h2>
        <p className="text-lg text-muted-foreground font-sans line-clamp-3 leading-relaxed">{blurb}</p>
      </div>
    </a>
  );
}
