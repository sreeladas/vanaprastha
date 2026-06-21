import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, GripVertical, RotateCw, Trash2, Plus, Shuffle, ChevronLeft, ChevronRight, Crosshair, BookOpen } from 'lucide-react';
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
  heroFocus?: string;
  pdfPage?: number;
  items: Item[];
  body: string;
}

interface PdfDesc {
  code: string;
  title: string;
  caption: string;
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
  const [descBank, setDescBank] = useState<PdfDesc[]>([]);
  const [selectedForDesc, setSelectedForDesc] = useState<number | null>(null);

  const loadCollections = useCallback(async () => {
    const res = await fetch('/api/collections');
    if (res.ok) setCollections(await res.json());
  }, []);

  useEffect(() => { loadCollections(); }, [loadCollections]);

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
    const [res, bankRes] = await Promise.all([
      fetch(`/api/collections/${slug}`),
      fetch('/pdf-descriptions.json'),
    ]);
    if (res.ok) {
      const data = await res.json();
      setEditing(data);
      setFocusedIndex(null);
      setView('edit');
      window.location.hash = `#edit/${slug}`;

      if (bankRes.ok) {
        const allBanks = await bankRes.json();
        const entries: PdfDesc[] = allBanks[slug] || [];
        setDescBank(entries);
      }
      setShowBank(false);
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
        heroFocus: editing.heroFocus,
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

  function reorderItem(from: number, to: number) {
    if (!editing) return;
    const items = [...editing.items];
    const [moved] = items.splice(from, 1);
    items.splice(to, 0, moved);
    if (focusedIndex === from) setFocusedIndex(to);
    else if (focusedIndex !== null) {
      if (from < focusedIndex && to >= focusedIndex) setFocusedIndex(focusedIndex - 1);
      else if (from > focusedIndex && to <= focusedIndex) setFocusedIndex(focusedIndex + 1);
    }
    updateEditing({ items });
  }

  async function reorderCollections(from: number, to: number) {
    const reordered = [...collections];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    setCollections(reordered);
    await Promise.all(reordered.map((c, i) =>
      fetch(`/api/collections/${c.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: i + 1 }),
      })
    ));
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

  function assignDesc(desc: PdfDesc, index: number) {
    if (!editing) return;
    const items = [...editing.items];
    items[index] = { ...items[index], title: desc.title, caption: desc.caption };
    setEditing({ ...editing, items });
  }

  const otherCollections = collections.filter((c) => c.slug !== editing?.slug);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1 max-w-6xl mx-auto px-6 py-10 w-full font-sans">
        {status && (
          <div className="mb-4 px-4 py-2 bg-green-50 text-green-800 rounded-md text-sm border border-green-200">
            {status}
          </div>
        )}

        {view === 'list' && (
          <CollectionList
            collections={collections}
            onEdit={openEditor}
            onDelete={deleteCollection}
            onCreate={() => setView('create')}
            onReorder={reorderCollections}
          />
        )}

        {view === 'create' && (
          <CreateForm
            slug={newSlug} title={newTitle}
            onSlugChange={setNewSlug} onTitleChange={setNewTitle}
            onCreate={createCollection} onCancel={() => setView('list')}
          />
        )}

        {view === 'edit' && editing && (
          <>
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" size="sm" onClick={closeEditor}>
                <ArrowLeft className="size-4" /> Back
              </Button>
              <h1 className="text-2xl font-serif font-bold flex-1">{editing.title}</h1>
              <Button onClick={saveCollection} disabled={busy}>
                {busy ? 'Saving...' : 'Save'}
              </Button>
            </div>

            {focusedIndex !== null && editing.items[focusedIndex] ? (
              <div className="space-y-6">
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
                {descBank.length > 0 && (
                  <DescriptionBank
                    descriptions={descBank}
                    usedTitles={new Set(editing.items.map(it => it.title).filter(Boolean))}
                    onAssign={(desc) => assignDesc(desc, focusedIndex)}
                  />
                )}
              </div>
            ) : (
              <>
                <CollectionDetails collection={editing} onUpdate={updateEditing} />

                <div className={descBank.length > 0 ? 'grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6' : ''}>
                  <div>
                    <ImageList
                      collection={editing}
                      thumbSize={thumbSize}
                      otherCollections={otherCollections}
                      onThumbSizeChange={setThumbSize}
                      onClickImage={setFocusedIndex}
                      onUpdateItem={updateItem}
                      onRemoveItem={removeItem}
                      onReorder={reorderItem}
                      onRotate={rotateImage}
                      onMoveToCollection={moveToCollection}
                      onAddUrl={addImageFromUrl}
                      onAddLocal={addLocalImage}
                      onSortSimilar={sortBySimilarity}
                      imgSrc={imgSrc}
                      busy={busy}
                      selectedIndex={selectedForDesc}
                      onSelectForDesc={setSelectedForDesc}
                    />

                    <div className="flex justify-end mt-6">
                      <Button variant="destructive" size="sm" onClick={() => deleteCollection(editing.slug)}>
                        <Trash2 className="size-4" /> Delete Collection
                      </Button>
                    </div>
                  </div>

                  {descBank.length > 0 && (
                    <div className="lg:sticky lg:top-4 lg:self-start">
                      <DescriptionBank
                        descriptions={descBank}
                        usedTitles={new Set(editing.items.map(it => it.title).filter(Boolean))}
                        onAssign={(desc) => {
                          if (selectedForDesc !== null) {
                            assignDesc(desc, selectedForDesc);
                            if (selectedForDesc < editing.items.length - 1) {
                              setSelectedForDesc(selectedForDesc + 1);
                            }
                          }
                        }}
                        selectedIndex={selectedForDesc}
                      />
                    </div>
                  )}
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
        <Button variant="ghost" size="sm" onClick={onClose}>
          <ArrowLeft className="size-4" /> Back to list
        </Button>
        <Badge variant="secondary" className="ml-auto">{index + 1} / {total}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="bg-muted rounded-lg overflow-hidden flex items-center justify-center min-h-[400px]">
          <img src={src} alt={item.title || ''} className="max-w-full max-h-[70vh] object-contain" />
        </div>

        <Card>
          <CardContent className="space-y-4 pt-6">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Title</label>
              <Input value={item.title || ''} onChange={(e) => onUpdate({ title: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Caption</label>
              <Textarea value={item.caption || ''} onChange={(e) => onUpdate({ caption: e.target.value })} rows={4} />
            </div>
            <div className="text-[11px] text-muted-foreground font-mono break-all">
              {item.url ? item.url : item.filename}
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {item.filename && (
                <>
                  <Button variant="secondary" size="xs" onClick={() => onRotate(90)} disabled={busy}>
                    <RotateCw className="size-3" /> 90
                  </Button>
                  <Button variant="secondary" size="xs" onClick={() => onRotate(180)} disabled={busy}>
                    <RotateCw className="size-3" /> 180
                  </Button>
                  <Button variant="secondary" size="xs" onClick={() => onRotate(270)} disabled={busy}>
                    <RotateCw className="size-3" /> 270
                  </Button>
                </>
              )}
              <Button variant="destructive" size="xs" onClick={onRemove}>
                <Trash2 className="size-3" /> Remove
              </Button>
            </div>

            {otherCollections.length > 0 && (
              <div className="pt-2">
                <label className="block text-sm text-muted-foreground mb-1">Move to collection</label>
                <select
                  onChange={(e) => { if (e.target.value) { onMove(e.target.value); e.target.value = ''; } }}
                  defaultValue=""
                  className="w-full border border-input rounded-md px-3 py-2 text-sm bg-transparent"
                >
                  <option value="" disabled>Select collection...</option>
                  {otherCollections.map((c) => <option key={c.slug} value={c.slug}>{c.title}</option>)}
                </select>
              </div>
            )}

            <div className="flex gap-2 pt-4 border-t border-border">
              <Button variant="outline" className="flex-1" onClick={() => onNavigate(index - 1)} disabled={index === 0}>
                <ChevronLeft className="size-4" /> Prev
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => onNavigate(index + 1)} disabled={index === total - 1}>
                Next <ChevronRight className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CollectionDetails({ collection, onUpdate }: {
  collection: CollectionFull;
  onUpdate: (patch: Partial<CollectionFull>) => void;
}) {
  const heroSrc = collection.heroImage
    ? `/images/collections/${collection.slug}/${collection.heroImage}`
    : null;

  const [fx, fy] = (collection.heroFocus || '50% 50%').split(' ').map((v) => parseInt(v));

  function handleFocusClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    onUpdate({ heroFocus: `${x}% ${y}%` });
  }

  return (
    <div className="space-y-6 mb-6">
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Title</label>
              <Input value={collection.title} onChange={(e) => onUpdate({ title: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Order</label>
              <Input type="number" value={collection.order} onChange={(e) => onUpdate({ order: Number(e.target.value) })} />
            </div>
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Hero Image</label>
            <Input value={collection.heroImage || ''} onChange={(e) => onUpdate({ heroImage: e.target.value || undefined })} className="font-mono" />
          </div>
          {heroSrc && (
            <div>
              <label className="block text-sm text-muted-foreground mb-1">
                <Crosshair className="size-3 inline mr-1" />
                Focal point (click to set)
              </label>
              <div
                className="relative h-48 rounded-lg overflow-hidden cursor-crosshair border border-input"
                onClick={handleFocusClick}
              >
                <img
                  src={heroSrc}
                  alt=""
                  className="w-full h-full object-cover"
                  style={{ objectPosition: collection.heroFocus || '50% 50%' }}
                />
                <div
                  className="absolute w-6 h-6 -ml-3 -mt-3 rounded-full border-2 border-white shadow-md bg-white/30 pointer-events-none"
                  style={{ left: `${fx}%`, top: `${fy}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Current: {collection.heroFocus || '50% 50%'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea value={collection.body} onChange={(e) => onUpdate({ body: e.target.value })} rows={6} className="leading-relaxed" />
        </CardContent>
      </Card>
    </div>
  );
}

function ImageList({ collection, thumbSize, otherCollections, onThumbSizeChange, onClickImage, onUpdateItem, onRemoveItem, onReorder, onRotate, onMoveToCollection, onAddUrl, onAddLocal, onSortSimilar, imgSrc, busy, selectedIndex, onSelectForDesc }: {
  collection: CollectionFull;
  thumbSize: ThumbSize;
  otherCollections: CollectionSummary[];
  onThumbSizeChange: (s: ThumbSize) => void;
  onClickImage: (i: number) => void;
  onUpdateItem: (i: number, patch: Partial<Item>) => void;
  onRemoveItem: (i: number) => void;
  onReorder: (from: number, to: number) => void;
  onRotate: (i: number, deg?: 90 | 180 | 270) => void;
  onMoveToCollection: (i: number, to: string) => void;
  onAddUrl: () => void;
  onAddLocal: () => void;
  onSortSimilar: () => void;
  imgSrc: (item: Item) => string;
  busy: boolean;
  selectedIndex?: number | null;
  onSelectForDesc?: (i: number) => void;
}) {
  const px = THUMB_PX[thumbSize];
  const dragItem = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  function handleDragStart(i: number) {
    dragItem.current = i;
  }

  function handleDragOver(e: React.DragEvent, i: number) {
    e.preventDefault();
    setDragOver(i);
  }

  function handleDrop(i: number) {
    if (dragItem.current !== null && dragItem.current !== i) {
      onReorder(dragItem.current, i);
    }
    dragItem.current = null;
    setDragOver(null);
  }

  function handleDragEnd() {
    dragItem.current = null;
    setDragOver(null);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle>Images ({collection.items.length})</CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex border border-input rounded-md overflow-hidden text-sm">
              {(['sm', 'md', 'lg'] as ThumbSize[]).map((s) => (
                <button key={s} onClick={() => onThumbSizeChange(s)}
                  className={`px-2.5 py-1 cursor-pointer transition-colors ${thumbSize === s ? 'bg-primary text-primary-foreground' : 'bg-transparent hover:bg-accent'}`}>
                  {s === 'sm' ? 'S' : s === 'md' ? 'M' : 'L'}
                </button>
              ))}
            </div>
            <Button variant="secondary" size="sm" onClick={onSortSimilar} disabled={busy}>
              <Shuffle className="size-3.5" /> Sort similar
            </Button>
            <Button variant="outline" size="sm" onClick={onAddUrl}>
              <Plus className="size-3.5" /> URL
            </Button>
            <Button variant="outline" size="sm" onClick={onAddLocal}>
              <Plus className="size-3.5" /> File
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {collection.items.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center">No images yet.</p>
        )}

        <div className="space-y-2">
          {collection.items.map((item, i) => (
            <div
              key={i}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDrop={() => handleDrop(i)}
              onDragEnd={handleDragEnd}
              onClick={() => onSelectForDesc?.(i)}
              className={`flex items-start gap-3 p-3 rounded-md border transition-all cursor-pointer ${selectedIndex === i ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-border bg-muted/30'} ${dragOver === i ? 'border-primary/50 bg-accent/50' : ''} ${dragItem.current === i ? 'opacity-50' : ''}`}
            >
              <div className="flex items-center self-stretch cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground pr-1">
                <GripVertical className="size-4" />
              </div>

              <div className="relative shrink-0 group" style={{ width: px, height: px }}>
                <button onClick={() => onClickImage(i)}
                  className="w-full h-full rounded-md bg-muted overflow-hidden cursor-pointer border-0 p-0 block">
                  {(item.url || item.filename) && (
                    <img src={imgSrc(item)} alt="" className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  )}
                </button>
                <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.filename && (
                    <>
                      <Button variant="secondary" size="icon-xs" onClick={() => onRotate(i, 270)} disabled={busy} title="Rotate counter-clockwise">
                        <RotateCw className="size-3 -scale-x-100" />
                      </Button>
                      <Button variant="secondary" size="icon-xs" onClick={() => onRotate(i, 90)} disabled={busy} title="Rotate clockwise">
                        <RotateCw className="size-3" />
                      </Button>
                    </>
                  )}
                  <Button variant="destructive" size="icon-xs" onClick={() => onRemoveItem(i)} title="Remove">
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </div>

              <div className="flex-1 min-w-0 space-y-1.5">
                <Input value={item.title || ''} onChange={(e) => onUpdateItem(i, { title: e.target.value })} placeholder="Title" className="h-8 text-sm" />
                <Textarea value={item.caption || ''} onChange={(e) => onUpdateItem(i, { caption: e.target.value })} placeholder="Caption" rows={2} className="text-sm leading-relaxed resize-y" />
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground font-mono truncate flex-1">
                    {item.url ? `URL: ${item.url}` : item.filename}
                  </span>
                  {otherCollections.length > 0 && (
                    <select
                      onChange={(e) => { if (e.target.value) { onMoveToCollection(i, e.target.value); e.target.value = ''; } }}
                      defaultValue=""
                      className="border border-input rounded-md px-1.5 py-0.5 text-[10px] text-muted-foreground max-w-[140px] bg-transparent"
                    >
                      <option value="" disabled>Move to...</option>
                      {otherCollections.map((c) => <option key={c.slug} value={c.slug}>{c.title}</option>)}
                    </select>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CollectionList({ collections, onEdit, onDelete, onCreate, onReorder }: {
  collections: CollectionSummary[];
  onEdit: (slug: string) => void;
  onDelete: (slug: string) => void;
  onCreate: () => void;
  onReorder: (from: number, to: number) => void;
}) {
  const dragItem = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  function handleDragStart(i: number) {
    dragItem.current = i;
  }

  function handleDragOver(e: React.DragEvent, i: number) {
    e.preventDefault();
    setDragOver(i);
  }

  function handleDrop(i: number) {
    if (dragItem.current !== null && dragItem.current !== i) {
      onReorder(dragItem.current, i);
    }
    dragItem.current = null;
    setDragOver(null);
  }

  function handleDragEnd() {
    dragItem.current = null;
    setDragOver(null);
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif font-bold">Collections</h1>
        <Button onClick={onCreate}>
          <Plus className="size-4" /> New Collection
        </Button>
      </div>
      <div className="space-y-3">
        {collections.map((c, i) => (
          <Card
            key={c.slug}
            onDragOver={(e) => handleDragOver(e, i)}
            onDrop={() => handleDrop(i)}
            onDragEnd={handleDragEnd}
            className={`flex-row items-center px-5 py-4 cursor-pointer hover:bg-accent/50 transition-colors ${dragOver === i ? 'border-primary/50 bg-accent/50' : ''}`}
            onClick={() => onEdit(c.slug)}
          >
            <div
              draggable
              onDragStart={() => handleDragStart(i)}
              className="flex items-center self-stretch cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground pr-3"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold">{c.title}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {c.slug} &middot; {c.itemCount} images
              </div>
            </div>
            <div className="flex gap-2 ml-4 shrink-0">
              <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); onDelete(c.slug); }}>
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

function DescriptionBank({ descriptions, usedTitles, onAssign, selectedIndex }: {
  descriptions: PdfDesc[];
  usedTitles: Set<string>;
  onAssign: (desc: PdfDesc) => void;
  selectedIndex?: number | null;
}) {
  const [expanded, setExpanded] = useState(true);
  const [showAssigned, setShowAssigned] = useState(false);
  const unassigned = descriptions.filter(d => !usedTitles.has(d.title));
  const assigned = descriptions.filter(d => usedTitles.has(d.title));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="size-4" />
            PDF ({unassigned.length} remaining)
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
            {expanded ? 'Collapse' : 'Expand'}
          </Button>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent>
          {selectedIndex === null || selectedIndex === undefined ? (
            <p className="text-sm text-muted-foreground mb-3">
              Click an image on the left to select it, then click a description here to assign.
            </p>
          ) : (
            <p className="text-sm text-primary font-medium mb-3">
              Assigning to image #{selectedIndex + 1}. Click a description below.
            </p>
          )}
          <div className="space-y-1.5 max-h-[70vh] overflow-y-auto">
            {unassigned.map((desc) => (
              <button
                key={desc.code}
                onClick={() => onAssign(desc)}
                disabled={selectedIndex === null || selectedIndex === undefined}
                className="w-full text-left p-2 rounded-md border border-border bg-muted/30 hover:bg-accent/50 hover:border-primary/50 cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <div className="text-[10px] text-muted-foreground font-mono">{desc.code}</div>
                <div className="text-sm font-medium">{desc.title}</div>
                {desc.caption && <div className="text-[11px] text-muted-foreground">{desc.caption}</div>}
              </button>
            ))}
            {assigned.length > 0 && (
              <>
                <button
                  onClick={() => setShowAssigned(!showAssigned)}
                  className="w-full text-sm text-muted-foreground pt-2 border-t border-border mt-2 cursor-pointer hover:text-foreground"
                >
                  {showAssigned ? 'Hide' : 'Show'} {assigned.length} assigned
                </button>
                {showAssigned && assigned.map((desc) => (
                  <button
                    key={desc.code}
                    onClick={() => onAssign(desc)}
                    disabled={selectedIndex === null || selectedIndex === undefined}
                    className="w-full text-left p-2 rounded-md border border-border bg-muted/10 opacity-40 hover:opacity-100 hover:bg-accent/50 hover:border-primary/50 cursor-pointer transition-all disabled:cursor-not-allowed"
                  >
                    <div className="text-[10px] text-muted-foreground font-mono">{desc.code}</div>
                    <div className="text-sm font-medium">{desc.title}</div>
                    {desc.caption && <div className="text-[11px] text-muted-foreground">{desc.caption}</div>}
                  </button>
                ))}
              </>
            )}
          </div>
        </CardContent>
      )}
    </Card>
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
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <Input value={title} onChange={(e) => onTitleChange(e.target.value)} placeholder="Paintings" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Slug</label>
            <Input value={slug} onChange={(e) => onSlugChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} placeholder="paintings" className="font-mono" />
          </div>
          <div className="flex gap-3">
            <Button onClick={onCreate}>Create</Button>
            <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
