export default function SiteHeader() {
  return (
    <header className="border-b border-warmgray-200 bg-cream">
      <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <a
          href="/"
          className="text-xl font-semibold tracking-tight text-warmgray-800 hover:text-warmgray-600 transition-colors font-serif"
        >
          Vanaprastha
        </a>
        <div className="flex gap-6 text-sm font-sans">
          <a href="/" className="text-warmgray-600 hover:text-warmgray-900 transition-colors">
            Collections
          </a>
          <a href="/about" className="text-warmgray-600 hover:text-warmgray-900 transition-colors">
            About
          </a>
        </div>
      </nav>
    </header>
  );
}
