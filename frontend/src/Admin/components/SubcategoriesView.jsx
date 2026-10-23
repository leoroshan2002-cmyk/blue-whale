import { useEffect, useMemo, useState } from 'react';
import { ImagePlus, LoaderCircle, Plus, Save, Trash2 } from 'lucide-react';
import { DEFAULT_IMAGE_FALLBACK, getSafeImageUrl } from '../../utils/productImages';

const categoryId = (category) => String(category?.id || category?._id || '');
const normalizeSubcategories = (category) => {
  const names = Array.isArray(category?.subCategories)
    ? category.subCategories
    : category?.subCategory ? [category.subCategory] : [];
  const cards = Array.isArray(category?.subCategoryCards) ? category.subCategoryCards : [];

  return names.map((name) => {
    const card = cards.find((item) => item.name?.toLowerCase() === name.toLowerCase());
    return {
      name,
      subtitle: card?.subtitle || '',
      image: card?.image || '',
      imageFile: null,
    };
  });
};

function SubcategoryCardEditor({ card, index, onChange, onRemove }) {
  const [preview, setPreview] = useState('');

  useEffect(() => {
    if (!card.imageFile) {
      setPreview('');
      return undefined;
    }
    const objectUrl = URL.createObjectURL(card.imageFile);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [card.imageFile]);

  const imageSource = preview || card.image;

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="relative aspect-[16/9] bg-slate-100 dark:bg-slate-800">
        <img
          src={getSafeImageUrl(imageSource, DEFAULT_IMAGE_FALLBACK)}
          alt={card.name ? `${card.name} card preview` : 'Subcategory card preview'}
          className="h-full w-full object-cover"
          onError={(event) => { event.currentTarget.src = DEFAULT_IMAGE_FALLBACK; }}
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow">
          Card {index + 1}
        </span>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${card.name || `subcategory ${index + 1}`}`}
          className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-rose-600 shadow transition hover:bg-rose-50"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="space-y-4 p-4">
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Subcategory name</span>
          <input
            value={card.name}
            onChange={(event) => onChange({ name: event.target.value })}
            required
            placeholder="e.g. Traditional Silk Sarees"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-600/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Card subtitle</span>
          <input
            value={card.subtitle}
            onChange={(event) => onChange({ subtitle: event.target.value })}
            placeholder="A short line shown under the title"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-600/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Image URL</span>
          <input
            type="url"
            value={card.image}
            onChange={(event) => onChange({ image: event.target.value, imageFile: null })}
            placeholder="https://example.com/image.jpg"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-600/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </label>

        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm text-slate-700 transition hover:border-amber-600 hover:bg-amber-50/50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
          <ImagePlus size={18} className="shrink-0 text-amber-700" />
          <span className="min-w-0 flex-1 truncate">
            {card.imageFile?.name || 'Choose an image to upload'}
            <span className="mt-0.5 block text-xs text-slate-500">JPG, PNG, or WebP · Max 5 MB</span>
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(event) => onChange({ imageFile: event.target.files?.[0] || null })}
          />
        </label>
      </div>
    </article>
  );
}

export default function SubcategoriesView({ categories, onUpdateCategory }) {
  const managedCategories = useMemo(
    () => categories.filter((category) => ['men', 'women'].includes(category.name?.toLowerCase())),
    [categories],
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [draftCards, setDraftCards] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (managedCategories.length === 0) {
      setSelectedCategoryId('');
      setDraftCards([]);
      return;
    }
    const selected = managedCategories.find((item) => categoryId(item) === selectedCategoryId)
      || managedCategories.find((item) => item.name.toLowerCase() === 'men')
      || managedCategories[0];
    if (categoryId(selected) !== selectedCategoryId) setSelectedCategoryId(categoryId(selected));
    setDraftCards(normalizeSubcategories(selected));
    setMessage('');
  }, [managedCategories, selectedCategoryId]);

  const selectedCategory = managedCategories.find((item) => categoryId(item) === selectedCategoryId);

  const updateCard = (index, updates) => {
    setDraftCards((cards) => cards.map((card, cardIndex) => (
      cardIndex === index ? { ...card, ...updates } : card
    )));
    setMessage('');
  };

  const addCard = () => {
    setDraftCards((cards) => [...cards, { name: '', subtitle: '', image: '', imageFile: null }]);
    setMessage('');
  };

  const removeCard = (index) => {
    setDraftCards((cards) => cards.filter((_, cardIndex) => cardIndex !== index));
    setMessage('');
  };

  const saveChanges = async (event) => {
    event.preventDefault();
    if (!selectedCategory) return;

    const normalizedCards = draftCards.map((card) => ({ ...card, name: card.name.trim() }));
    const names = normalizedCards.map((card) => card.name.toLowerCase());
    if (normalizedCards.some((card) => !card.name)) {
      setMessage('Each card needs a subcategory name.');
      return;
    }
    if (new Set(names).size !== names.length) {
      setMessage('Subcategory names must be unique within this collection.');
      return;
    }

    setIsSaving(true);
    setMessage('');
    try {
      const saved = await onUpdateCategory({
        ...selectedCategory,
        subCategories: normalizedCards.map((card) => card.name),
        subCategory: normalizedCards[0]?.name || '',
        subCategoryCards: normalizedCards,
      });
      if (saved) setMessage('Changes saved. The storefront collection has been updated.');
      else setMessage('Changes could not be saved. Review the error and try again.');
    } catch (error) {
      console.error('Failed to save subcategories:', error);
      setMessage(error?.message || 'Unable to save changes. Try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (managedCategories.length === 0) {
    return (
      <section className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Subcategory manager</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">Create the Men and Women categories first. They will appear here when available.</p>
      </section>
    );
  }

  return (
    <form onSubmit={saveChanges} className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white shadow-sm sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">Storefront editor</p>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Subcategory cards</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">Edit the cards customers see in Men and Women collections. Changes appear after saving.</p>
        </div>
        <button
          type="submit"
          disabled={isSaving || !selectedCategory}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-slate-950 shadow transition hover:bg-amber-400 disabled:cursor-wait disabled:opacity-70"
        >
          {isSaving ? <LoaderCircle size={17} className="animate-spin" /> : <Save size={17} />}
          {isSaving ? 'Saving…' : 'Save changes'}
        </button>
      </header>

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-end sm:justify-between">
        <label className="block w-full max-w-sm space-y-2">
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">Choose collection</span>
          <select
            value={selectedCategoryId}
            onChange={(event) => setSelectedCategoryId(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            {managedCategories.map((category) => (
              <option key={categoryId(category)} value={categoryId(category)}>{category.name}</option>
            ))}
          </select>
        </label>
        <div className="text-sm text-slate-500 dark:text-slate-400">
          {draftCards.length} {draftCards.length === 1 ? 'subcategory card' : 'subcategory cards'}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{selectedCategory?.name} cards</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Preview each image while you edit its title and subtitle.</p>
        </div>
        <button
          type="button"
          onClick={addCard}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-amber-600 hover:text-amber-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          <Plus size={17} />
          Add subcategory
        </button>
      </div>

      {message && (
        <p role="status" className={`rounded-xl px-4 py-3 text-sm ${message.startsWith('Changes saved') ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200' : 'bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200'}`}>
          {message}
        </p>
      )}

      {draftCards.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-3">
          {draftCards.map((card, index) => (
            <SubcategoryCardEditor
              key={`${selectedCategoryId}-${index}`}
              card={card}
              index={index}
              onChange={(updates) => updateCard(index, updates)}
              onRemove={() => removeCard(index)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
          <p className="font-semibold text-slate-800 dark:text-slate-100">No subcategory cards yet</p>
          <p className="mt-2 text-sm text-slate-500">Add a card to start building this collection.</p>
        </div>
      )}
    </form>
  );
}
