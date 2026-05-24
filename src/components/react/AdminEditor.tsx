import { useState, useEffect, useCallback } from 'react';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';

interface Item {
  filename?: string;
  url?: string;
  title?: string;
  caption?: string;
}

interface CollectionSummary {
  slug: string;
  title: string;
  order: number;
  heroImage?: string;
  itemCount: number;
  blurb: string;
}

interface CollectionFull {
  slug: string;
  title: string;
  order: number;
  heroImage?: string;
  pdfPage?: number;
  items: Item[];
  body: string;
}

type View = 'list' | 'edit' | 'create';
type ThumbSize = 'sm' | 'md' | 'lg';
const THUMB_PX: Record<ThumbSize, number> = { sm: 64, md: 128, lg: 256 };

export default function AdminEditor() {
  const [view, setView] = useState<View>('list');
  const [collections, setCollections] = useState<CollectionSummary[]>([]);
  const [editing, setEditing] = useState<CollectionFull | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [thumbSize, setThumbSize] = useState<ThumbSize>('md');
  const [newSlug, setNewSlug] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [cacheBuster, setCacheBuster] = useState(Date.now());

  const loadCollections = useCallback(async () => {
    const res = await fetch('/api/collections');
    if (res.ok) setCollections(await res.json());
  }, []);

  useEffect(() => { loadCollections(); }, [loadCollections]);

  // Restore edit state from hash on mount (survives HMR reloads)
  useEffect(() => {
    const hash = window.location.hash;
    const match = hash.match(/^#edit\/(.+)$/);
    if (match) {
      openEditor(match[1]);
    }
  }, []);

  function flash(msg: string) {
    setStatus(msg);
    setTimeout(() => setStatus(''), 3000);
  }

  async function openEditor(slug: string) {
    const res = await fetch(`/api/collections/${slug}`);
    if (res.ok) {
      setEditing(await res.json());
      setFocusedIndex(null);
      setView('edit');
      window.location.hash = `#edit/${slug}`;
    }
  }

  function closeEditor() {
    setView('list');
    setEditing(null);
    setFocusedIndex(null);
    window.location.hash = '';
  }

  async function saveCollection() {
    if (!editing) return;
    setBusy(true);
    const res = await fetch(`/api/collections/${editing.slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: editing.title,
        order: editing.order,
        heroImage: editing.heroImage,
        items: editing.items,
        blurb: editing.body,
      }),
    });
    setBusy(false);
    if (res.ok) {
      flash('Saved');
      loadCollections();
    }
  }

  async function deleteCollection(slug: string) {
    if (!confirm(`Delete "${slug}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/collections/${slug}`, { method: 'DELETE' });
    if (res.ok) {
      flash('Deleted');
      closeEditor();
      loadCollections();
    }
  }

  async function createCollection() {
    if (!newSlug || !newTitle) return;
    const res = await fetch('/api/collections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: newSlug, title: newTitle }),
    });
    if (res.ok) {
      flash('Created');
      setNewSlug('');
      setNewTitle('');
      setView('list');
      loadCollections();
    } else {
      flash(await res.text());
    }
  }

  function updateEditing(patch: Partial<CollectionFull>) {
    if (editing) setEditing({ ...editing, ...patch });
  }

  function updateItem(index: number, patch: Partial<Item>) {
    if (!editing) return;
    const items = [...editing.items];
    items[index] = { ...items[index], ...patch };
    updateEditing({ items });
  }

  function removeItem(index: number) {
    if (!editing) return;
    if (focusedIndex === index) setFocusedIndex(null);
    else if (focusedIndex !== null && focusedIndex > index) setFocusedIndex(focusedIndex - 1);
    updateEditing({ items: editing.items.filter((_, i) => i !== index) });
  }

  function moveItem(index: number, direction: -1 | 1) {
    if (!editing) return;
    const items = [...editing.items];
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    [items[index], items[target]] = [items[target], items[index]];
    if (focusedIndex === index) setFocusedIndex(target);
    else if (focusedIndex === target) setFocusedIndex(index);
    updateEditing({ items });
  }

  async function rotateImage(index: number, degrees: 90 | 180 | 270 = 90) {
    if (!editing) return;
    const item = editing.items[index];
    if (!item.filename) { flash('Can only rotate local images'); return; }
    setBusy(true);
    const res = await fetch('/api/images/rotate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collection: editing.slug, filename: item.filename, degrees }),
    });
    setBusy(false);
    if (res.ok) {
      setCacheBuster(Date.now());
      flash(`Rotated ${degrees}°`);
    } else {
      flash(await res.text());
    }
  }

  async function moveToCollection(index: number, toCollection: string) {
    if (!editing) return;
    setBusy(true);
    const res = await fetch('/api/images/move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromCollection: editing.slug, toCollection, itemIndex: index }),
    });
    setBusy(false);
    if (res.ok) {
      const items = editing.items.filter((_, i) => i !== index);
      if (focusedIndex === index) setFocusedIndex(null);
      else if (focusedIndex !== null && focusedIndex > index) setFocusedIndex(focusedIndex - 1);
      updateEditing({ items });
      flash(`Moved to ${toCollection}`);
      loadCollections();
    } else {
      flash(await res.text());
    }
  }

  async function sortBySimilarity() {
    if (!editing) return;
    setBusy(true);
    flash('Sorting by similarity...');
    const res = await fetch('/api/images/sort-similar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collection: editing.slug }),
    });
    if (res.ok) {
      await openEditor(editing.slug);
      flash('Sorted by similarity');
    } else {
      flash(await res.text());
    }
    setBusy(false);
  }

  function addImageFromUrl() {
    const url = prompt('Paste image URL:');
    if (!url || !editing) return;
    const title = prompt('Title (optional):') || '';
    const caption = prompt('Caption (optional):') || '';
    updateEditing({ items: [...editing.items, { url, title, caption }] });
  }

  function addLocalImage() {
    const filename = prompt('Filename (e.g. mask-01.webp):');
    if (!filename || !editing) return;
    const title = prompt('Title (optional):') || '';
    updateEditing({ items: [...editing.items, { filename, title }] });
  }

  function imgSrc(item: Item): string {
    if (item.url) return item.url;
    return `/images/collections/${editing?.slug}/${item.filename}?t=${cacheBuster}`;
  }

  const otherCollections = collections.filter((c) => c.slug !== editing?.slug);

  return (
    <div className="min-h-screen flex flex-col bg-cream text-warmgray-900">
      <SiteHeader />
      <main className="flex-1 max-w-6xl mx-auto px-6 py-10 w-full font-sans">
        {status && (
          <div className="mb-4 px-4 py-2 bg-green-50 text-green-800 rounded text-sm border border-green-200">
            {status}
          </div>
        )}

        {view === 'list' && <CollectionList
          collections={collections}
          onEdit={openEditor}
          onDelete={deleteCollection}
          onCreate={() => setView('create')}
        />}

        {view === 'create' && <CreateForm
          slug={newSlug} title={newTitle}
          onSlugChange={setNewSlug} onTitleChange={setNewTitle}
          onCreate={createCollection} onCancel={() => setView('list')}
        />}

        {view === 'edit' && editing && (
          <>
            <div className="flex items-center gap-4 mb-6">
              <button onClick={closeEditor}
                className="text-warmgray-500 hover:text-warmgray-700 cursor-pointer">&larr; Back</button>
              <h1 className="text-2xl font-serif font-bold flex-1">{editing.title}</h1>
              <button onClick={saveCollection} disabled={busy}
                className="px-4 py-2 bg-warmgray-800 text-white text-sm rounded hover:bg-warmgray-700 disabled:opacity-50 cursor-pointer">
                {busy ? 'Saving...' : 'Save'}
              </button>
            </div>

            {focusedIndex !== null && editing.items[focusedIndex] ? (
              <ImageDetail
                item={editing.items[focusedIndex]}
                index={focusedIndex}
                total={editing.items.length}
                src={imgSrc(editing.items[focusedIndex])}
                otherCollections={otherCollections}
                onUpdate={(patch) => updateItem(focusedIndex, patch)}
                onRotate={(deg) => rotateImage(focusedIndex, deg)}
                onRemove={() => removeItem(focusedIndex)}
                onMove={(to) => moveToCollection(focusedIndex, to)}
                onNavigate={setFocusedIndex}
                onClose={() => setFocusedIndex(null)}
                busy={busy}
              />
            ) : (
              <>
                <CollectionDetails collection={editing} onUpdate={updateEditing} />

                <ImageList
                  collection={editing}
                  thumbSize={thumbSize}
                  otherCollections={otherCollections}
                  onThumbSizeChange={setThumbSize}
                  onClickImage={setFocusedIndex}
                  onUpdateItem={updateItem}
                  onRemoveItem={removeItem}
                  onMoveItem={moveItem}
                  onRotate={rotateImage}
                  onMoveToCollection={moveToCollection}
                  onAddUrl={addImageFromUrl}
                  onAddLocal={addLocalImage}
                  onSortSimilar={sortBySimilarity}
                  imgSrc={imgSrc}
                  busy={busy}
                />

                <div className="flex justify-end mt-6">
                  <button onClick={() => deleteCollection(editing.slug)}
                    className="px-4 py-2 text-sm text-red-600 hover:text-red-800 cursor-pointer">
                    Delete Collection
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

// --- Sub-components ---

function ImageDetail({ item, index, total, src, otherCollections, onUpdate, onRotate, onRemove, onMove, onNavigate, onClose, busy }: {
  item: Item; index: number; total: number; src: string;
  otherCollections: CollectionSummary[];
  onUpdate: (patch: Partial<Item>) => void;
  onRotate: (deg: 90 | 180 | 270) => void;
  onRemove: () => void;
  onMove: (to: string) => void;
  onNavigate: (i: number) => void;
  onClose: () => void;
  busy: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onClose} className="text-warmgray-500 hover:text-warmgray-700 cursor-pointer text-sm">&larr; Back to list</button>
        <span className="text-xs text-warmgray-400 ml-auto">{index + 1} / {total}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="bg-warmgray-100 rounded-lg overflow-hidden flex items-center justify-center min-h-[400px]">
          <img src={src} alt={item.title || ''} className="max-w-full max-h-[70vh] object-contain" />
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-warmgray-500 mb-1">Title</label>
            <input value={item.title || ''} onChange={(e) => onUpdate({ title: e.target.value })}
              className="w-full border border-warmgray-300 rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-warmgray-500 mb-1">Caption</label>
            <textarea value={item.caption || ''} onChange={(e) => onUpdate({ caption: e.target.value })}
              rows={4} className="w-full border border-warmgray-300 rounded px-3 py-2 text-sm resize-y" />
          </div>
          <div className="text-[11px] text-warmgray-400 font-mono break-all">
            {item.url ? item.url : item.filename}
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {item.filename && (
              <>
                <button onClick={() => onRotate(90)} disabled={busy}
                  className="px-3 py-1.5 text-xs bg-warmgray-100 rounded hover:bg-warmgray-200 disabled:opacity-50 cursor-pointer">Rotate 90°</button>
                <button onClick={() => onRotate(180)} disabled={busy}
                  className="px-3 py-1.5 text-xs bg-warmgray-100 rounded hover:bg-warmgray-200 disabled:opacity-50 cursor-pointer">Rotate 180°</button>
                <button onClick={() => onRotate(270)} disabled={busy}
                  className="px-3 py-1.5 text-xs bg-warmgray-100 rounded hover:bg-warmgray-200 disabled:opacity-50 cursor-pointer">Rotate 270°</button>
              </>
            )}
            <button onClick={onRemove}
              className="px-3 py-1.5 text-xs text-red-600 bg-red-50 rounded hover:bg-red-100 cursor-pointer">Remove</button>
          </div>

          {otherCollections.length > 0 && (
            <div className="pt-2">
              <label className="block text-xs text-warmgray-500 mb-1">Move to collection</label>
              <select onChange={(e) => { if (e.target.value) { onMove(e.target.value); e.target.value = ''; } }}
                defaultValue="" className="w-full border border-warmgray-300 rounded px-3 py-2 text-sm">
                <option value="" disabled>Select collection...</option>
                {otherCollections.map((c) => <option key={c.slug} value={c.slug}>{c.title}</option>)}
              </select>
            </div>
          )}

          <div className="flex gap-2 pt-4 border-t border-warmgray-200">
            <button onClick={() => onNavigate(index - 1)} disabled={index === 0}
              className="flex-1 py-2 text-sm bg-warmgray-100 rounded hover:bg-warmgray-200 disabled:opacity-30 cursor-pointer">&larr; Prev</button>
            <button onClick={() => onNavigate(index + 1)} disabled={index === total - 1}
              className="flex-1 py-2 text-sm bg-warmgray-100 rounded hover:bg-warmgray-200 disabled:opacity-30 cursor-pointer">Next &rarr;</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CollectionDetails({ collection, onUpdate }: {
  collection: CollectionFull;
  onUpdate: (patch: Partial<CollectionFull>) => void;
}) {
  return (
    <div className="space-y-6 mb-6">
      <section className="bg-white rounded-lg border border-warmgray-200 p-6 space-y-4">
        <h2 className="font-semibold text-warmgray-800">Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-warmgray-500 mb-1">Title</label>
            <input value={collection.title} onChange={(e) => onUpdate({ title: e.target.value })}
              className="w-full border border-warmgray-300 rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-warmgray-500 mb-1">Order</label>
            <input type="number" value={collection.order} onChange={(e) => onUpdate({ order: Number(e.target.value) })}
              className="w-full border border-warmgray-300 rounded px-3 py-2 text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-xs text-warmgray-500 mb-1">Hero Image</label>
          <input value={collection.heroImage || ''} onChange={(e) => onUpdate({ heroImage: e.target.value || undefined })}
            className="w-full border border-warmgray-300 rounded px-3 py-2 text-sm font-mono" />
        </div>
      </section>

      <section className="bg-white rounded-lg border border-warmgray-200 p-6">
        <h2 className="font-semibold text-warmgray-800 mb-3">Description</h2>
        <textarea value={collection.body} onChange={(e) => onUpdate({ body: e.target.value })}
          rows={6} className="w-full border border-warmgray-300 rounded px-3 py-2 text-sm leading-relaxed resize-y" />
      </section>
    </div>
  );
}

function ImageList({ collection, thumbSize, otherCollections, onThumbSizeChange, onClickImage, onUpdateItem, onRemoveItem, onMoveItem, onRotate, onMoveToCollection, onAddUrl, onAddLocal, onSortSimilar, imgSrc, busy }: {
  collection: CollectionFull;
  thumbSize: ThumbSize;
  otherCollections: CollectionSummary[];
  onThumbSizeChange: (s: ThumbSize) => void;
  onClickImage: (i: number) => void;
  onUpdateItem: (i: number, patch: Partial<Item>) => void;
  onRemoveItem: (i: number) => void;
  onMoveItem: (i: number, dir: -1 | 1) => void;
  onRotate: (i: number, deg?: 90 | 180 | 270) => void;
  onMoveToCollection: (i: number, to: string) => void;
  onAddUrl: () => void;
  onAddLocal: () => void;
  onSortSimilar: () => void;
  imgSrc: (item: Item) => string;
  busy: boolean;
}) {
  const px = THUMB_PX[thumbSize];

  return (
    <section className="bg-white rounded-lg border border-warmgray-200 p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="font-semibold text-warmgray-800">Images ({collection.items.length})</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex border border-warmgray-300 rounded overflow-hidden text-xs">
            {(['sm', 'md', 'lg'] as ThumbSize[]).map((s) => (
              <button key={s} onClick={() => onThumbSizeChange(s)}
                className={`px-2 py-1 cursor-pointer ${thumbSize === s ? 'bg-warmgray-800 text-white' : 'bg-white hover:bg-warmgray-100'}`}>
                {s === 'sm' ? 'S' : s === 'md' ? 'M' : 'L'}
              </button>
            ))}
          </div>
          <button onClick={onSortSimilar} disabled={busy}
            className="px-3 py-1.5 text-xs bg-warmgray-100 rounded hover:bg-warmgray-200 disabled:opacity-50 cursor-pointer">
            Sort by similarity
          </button>
          <button onClick={onAddUrl} className="px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 cursor-pointer">
            + From URL
          </button>
          <button onClick={onAddLocal} className="px-3 py-1.5 text-xs bg-warmgray-100 rounded hover:bg-warmgray-200 cursor-pointer">
            + Local File
          </button>
        </div>
      </div>

      {collection.items.length === 0 && (
        <p className="text-sm text-warmgray-400 py-4 text-center">No images yet.</p>
      )}

      <div className="space-y-2">
        {collection.items.map((item, i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded border border-warmgray-100 bg-warmgray-50/50">
            {/* Thumbnail with overlaid actions */}
            <div className="relative shrink-0 group" style={{ width: px, height: px }}>
              <button onClick={() => onClickImage(i)}
                className="w-full h-full rounded bg-warmgray-200 overflow-hidden cursor-pointer border-0 p-0 block">
                {(item.url || item.filename) && (
                  <img src={imgSrc(item)} alt="" className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                )}
              </button>
              <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {item.filename && (
                  <button onClick={() => onRotate(i)} disabled={busy} title="Rotate 90°"
                    className="w-6 h-6 text-xs bg-white/90 rounded shadow hover:bg-white cursor-pointer disabled:opacity-50 flex items-center justify-center">&#x21bb;</button>
                )}
                <button onClick={() => onRemoveItem(i)} title="Remove"
                  className="w-6 h-6 text-xs text-red-600 bg-white/90 rounded shadow hover:bg-white cursor-pointer flex items-center justify-center">&times;</button>
              </div>
              <div className="absolute bottom-1 left-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onMoveItem(i, -1)} disabled={i === 0} title="Move up"
                  className="w-6 h-6 text-xs bg-white/90 rounded shadow hover:bg-white cursor-pointer disabled:opacity-30 flex items-center justify-center">&uarr;</button>
                <button onClick={() => onMoveItem(i, 1)} disabled={i === collection.items.length - 1} title="Move down"
                  className="w-6 h-6 text-xs bg-white/90 rounded shadow hover:bg-white cursor-pointer disabled:opacity-30 flex items-center justify-center">&darr;</button>
              </div>
            </div>

            {/* Inline editing fields */}
            <div className="flex-1 min-w-0 space-y-1.5">
              <input value={item.title || ''} onChange={(e) => onUpdateItem(i, { title: e.target.value })}
                placeholder="Title" className="w-full border border-warmgray-200 rounded px-2 py-1 text-sm" />
              <textarea value={item.caption || ''} onChange={(e) => onUpdateItem(i, { caption: e.target.value })}
                placeholder="Caption" rows={2}
                className="w-full border border-warmgray-200 rounded px-2 py-1 text-xs resize-y leading-relaxed" />
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-warmgray-400 font-mono truncate flex-1">
                  {item.url ? `URL: ${item.url}` : item.filename}
                </span>
                {otherCollections.length > 0 && (
                  <select onChange={(e) => { if (e.target.value) { onMoveToCollection(i, e.target.value); e.target.value = ''; } }}
                    defaultValue="" className="border border-warmgray-200 rounded px-1.5 py-0.5 text-[10px] text-warmgray-500 max-w-[140px]">
                    <option value="" disabled>Move to...</option>
                    {otherCollections.map((c) => <option key={c.slug} value={c.slug}>{c.title}</option>)}
                  </select>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CollectionList({ collections, onEdit, onDelete, onCreate }: {
  collections: CollectionSummary[];
  onEdit: (slug: string) => void;
  onDelete: (slug: string) => void;
  onCreate: () => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif font-bold">Collections</h1>
        <button onClick={onCreate} className="px-4 py-2 bg-warmgray-800 text-white text-sm rounded hover:bg-warmgray-700 cursor-pointer">
          + New Collection
        </button>
      </div>
      <div className="space-y-3">
        {collections.map((c) => (
          <div key={c.slug} className="flex items-center justify-between bg-white rounded-lg border border-warmgray-200 px-5 py-4">
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-warmgray-800">{c.title}</div>
              <div className="text-xs text-warmgray-500 mt-1">
                {c.slug} &middot; {c.itemCount} images &middot; order {c.order}
              </div>
            </div>
            <div className="flex gap-2 ml-4 shrink-0">
              <button onClick={() => onEdit(c.slug)} className="px-3 py-1.5 text-sm bg-warmgray-100 rounded hover:bg-warmgray-200 cursor-pointer">Edit</button>
              <button onClick={() => onDelete(c.slug)} className="px-3 py-1.5 text-sm text-red-600 bg-red-50 rounded hover:bg-red-100 cursor-pointer">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function CreateForm({ slug, title, onSlugChange, onTitleChange, onCreate, onCancel }: {
  slug: string; title: string;
  onSlugChange: (v: string) => void; onTitleChange: (v: string) => void;
  onCreate: () => void; onCancel: () => void;
}) {
  return (
    <>
      <h1 className="text-2xl font-serif font-bold mb-6">New Collection</h1>
      <div className="bg-white rounded-lg border border-warmgray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-warmgray-700 mb-1">Title</label>
          <input value={title} onChange={(e) => onTitleChange(e.target.value)}
            className="w-full border border-warmgray-300 rounded px-3 py-2 text-sm" placeholder="Paintings" />
        </div>
        <div>
          <label className="block text-sm font-medium text-warmgray-700 mb-1">Slug</label>
          <input value={slug} onChange={(e) => onSlugChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
            className="w-full border border-warmgray-300 rounded px-3 py-2 text-sm font-mono" placeholder="paintings" />
        </div>
        <div className="flex gap-3">
          <button onClick={onCreate} className="px-4 py-2 bg-warmgray-800 text-white text-sm rounded hover:bg-warmgray-700 cursor-pointer">Create</button>
          <button onClick={onCancel} className="px-4 py-2 text-sm text-warmgray-600 hover:text-warmgray-800 cursor-pointer">Cancel</button>
        </div>
      </div>
    </>
  );
}
