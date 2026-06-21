export default function SiteHeader() {
  return (
    <header className="border-b border-warmgray-200 bg-cream">
      <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <a
          href="/"
          className="text-2xl font-semibold tracking-tight text-foreground hover:text-muted-foreground transition-colors font-serif"
        >
          Vanaprastha
        </a>
        <div className="flex items-center gap-6 text-base font-sans">
          <a href="/" className="inline-flex items-center py-3 text-muted-foreground hover:text-foreground transition-colors">
            Collections
          </a>
          <a href="/about" className="inline-flex items-center py-3 text-muted-foreground hover:text-foreground transition-colors">
            About
          </a>
        </div>
      </nav>
    </header>
  );
}
