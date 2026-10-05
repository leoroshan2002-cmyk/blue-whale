import React, { useState, useMemo, useEffect } from 'react';
import { Trash2, Plus, Store, ToggleLeft, ToggleRight, TrendingUp } from 'lucide-react';
import { DEFAULT_IMAGE_FALLBACK, getSafeImageUrl } from '../../utils/productImages';

/* ==========================================
   1. CATEGORIES MANAGEMENT VIEW
   ========================================== */
export const CategoriesView = ({
  categories,
  products,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [image, setImage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [newSubCategory, setNewSubCategory] = useState('');
  const [expandedCategoryIds, setExpandedCategoryIds] = useState([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const generateSlug = (val) => {
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  };

  const handleOpenAdd = () => {
    setEditingCat(null);
    setName('');
    setSlug('');
    setImage('https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400');
    setImageFile(null);
    setSubCategories([]);
    setNewSubCategory('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCat(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setImage(cat.image);
    setImageFile(null);
    setSubCategories(Array.isArray(cat.subCategories)
      ? cat.subCategories
      : cat.subCategory
        ? [cat.subCategory]
        : []);
    setNewSubCategory('');
    setIsFormOpen(true);
  };

  const toggleExpanded = (id) => {
    setExpandedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const addSubCategory = () => {
    const trimmed = newSubCategory.trim();
    if (!trimmed) return;
    setSubCategories((prev) => Array.from(new Set([...prev, trimmed])));
    setNewSubCategory('');
  };

  const removeSubCategory = (value) => {
    setSubCategories((prev) => prev.filter((item) => item !== value));
  };

  const handleDeleteClick = (cat) => {
    setCategoryToDelete(cat);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      onDeleteCategory(categoryToDelete.id);
      setCategoryToDelete(null);
      setDeleteConfirmOpen(false);
    }
  };

  const handleCancelDelete = () => {
    setCategoryToDelete(null);
    setDeleteConfirmOpen(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!name || !slug || subCategories.length === 0) {
      alert('Please provide the category name, slug, and at least one subcategory.');
      return;
    }

    const normalizedSubs = Array.from(new Set(subCategories.map((item) => item.trim()).filter(Boolean)));
    const payload = {
      id: editingCat ? editingCat.id : `cat-${Date.now()}`,
      name,
      slug,
      subCategories: normalizedSubs,
      subCategory: normalizedSubs[0] || '',
      image,
      imageFile,
      description: `Boutique fashion listing for Hyra ${name} lines.`
    };

    if (editingCat) {
      onUpdateCategory(payload);
    } else {
      onAddCategory(payload);
    }
    setIsFormOpen(false);
  };

  const currentSubcategories = (cat) =>
    Array.isArray(cat.subCategories) ? cat.subCategories : cat.subCategory ? [cat.subCategory] : [];

  return (
    <div className="space-y-6 text-left animate-fade-in" id="categories-panel">
      <div className="flex justify-between items-center py-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Section Taxonomy (Categories)</h2>
          <p className="text-xs text-slate-500 mt-1">Configure retail departments, thumbnails, and products mapping logs.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 font-bold py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 shadow transition-all"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {categories.map((cat, index) => {
          const prodCount = products.filter(p => p.category.toLowerCase() === cat.name.toLowerCase()).length;

          return (
            <div id='cat-card' key={`${cat.id || 'category'}-${index}`} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between group hover:shadow-xl hover:scale-105 transition-transform duration-300 transform">
              <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
                <img
                  src={getSafeImageUrl(cat.image, DEFAULT_IMAGE_FALLBACK)}
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = DEFAULT_IMAGE_FALLBACK; }}
                  decoding="async"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-all duration-300"
                  alt={cat.name || 'Category banner'}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <span className="inline-block bg-black/60 text-white font-extrabold text-sm uppercase tracking-wide px-4 py-2 rounded-lg">
                    {cat.name}
                  </span>
                </div>
              </div>
              
              <div className="p-5 space-y-4 flex-grow flex flex-col justify-between">
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>Tally Count:</span>
                  <span className="text-slate-900 dark:text-white">{prodCount} listings</span>
                </div>
                <div className="flex gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => toggleExpanded(cat.id)}
                    className="py-1.5 px-3 border hover:bg-slate-50 text-[11px] font-bold rounded-lg text-slate-700 dark:text-slate-355 dark:text-slate-300"
                  >
                    {expandedCategoryIds.includes(cat.id) ? 'Hide subcategories' : 'Show subcategories'}
                  </button>
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="flex-grow py-1.5 border hover:bg-slate-50 text-[11px] font-bold rounded-lg text-slate-700 dark:text-slate-355 dark:text-slate-300 text-center"
                  >
                    Edit Layout
                  </button>
                  <button
                    onClick={() => handleDeleteClick(cat)}
                    className="p-1 px-2 border border-rose-100 hover:bg-rose-50 text-rose-600 rounded-lg text-xs"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {expandedCategoryIds.includes(cat.id) && (
                  <div className="mt-3 text-xs text-slate-600 dark:text-slate-300">
                    <div className="font-semibold text-slate-900 dark:text-white mb-2">Subcategories</div>
                    <div className="grid grid-cols-2 gap-2">
                      {currentSubcategories(cat).map((subcat, subIndex) => (
                        <span key={`${cat.id || 'category'}-subcat-${subcat || subIndex}-${subIndex}`} className="inline-flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] px-2.5 py-1">
                          {subcat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 w-full max-w-sm p-6 shadow-2xl relative">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">
              {editingCat ? 'Update Category' : 'Create Category Department'}
            </h3>
            
            <form onSubmit={handleSave} className="space-y-4 text-xs font-medium">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">CATEGORY NAME</span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => generateSlug(e.target.value)}
                  placeholder="e.g. Winter Overcoats"
                  className="w-full border p-2 bg-slate-50 rounded-lg dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">URL SLUG IDENTIFIER</span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="winter-overcoats"
                  className="w-full border p-2 bg-slate-50 rounded-lg font-mono dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div className="space-y-3">
                <span className="text-[10px] text-slate-400 font-bold uppercase">SUBCATEGORIES</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSubCategory}
                    onChange={(e) => setNewSubCategory(e.target.value)}
                    placeholder="Add subcategory"
                    className="w-full border p-2 bg-slate-50 rounded-lg dark:bg-slate-950 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={addSubCategory}
                    className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-bold"
                  >
                    Add
                  </button>
                </div>

                {subCategories.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {subCategories.map((subcat, subIndex) => (
                      <button
                        key={`${editingCat?.id || 'category'}-subcat-${subcat || subIndex}-${subIndex}`}
                        type="button"
                        onClick={() => removeSubCategory(subcat)}
                        className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-[11px] text-slate-700 dark:text-slate-200"
                      >
                        {subcat}
                        <span className="text-rose-500">×</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-[9px] text-slate-500">Add at least one subcategory tag for this category.</p>
                )}
                <p className="text-[9px] text-slate-500">Tap a subcategory chip to remove it, or add new subcategory values here.</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">BANNER COVER IMAGE</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full border p-2 bg-slate-50 rounded-lg dark:bg-slate-950 dark:text-white"
                />
                {imageFile ? (
                  <p className="text-[9px] text-slate-500">Selected file: {imageFile.name}</p>
                ) : image ? (
                  <img src={getSafeImageUrl(image, DEFAULT_IMAGE_FALLBACK)} alt="Current banner" className="w-full h-32 object-cover rounded-lg mt-2" onError={(e) => { e.currentTarget.src = DEFAULT_IMAGE_FALLBACK; }} />
                ) : null}
                <p className="text-[9px] text-slate-500">Upload a banner image file for this category. Existing banner remains if you do not select a new file.</p>
              </div>

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-lg hover:bg-slate-800"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 w-full max-w-sm p-6 shadow-2xl relative">
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">
              Confirm Deletion
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
              Are you sure you want to delete the category department "{categoryToDelete?.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={handleCancelDelete}
                className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


/* ==========================================
   2. CUSTOMERS DIRECTORY VIEW
   ========================================== */
export const CustomersView = ({ customers, onToggleStatus }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const filtered = useMemo(() => {
    return customers.filter(c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [customers, searchTerm]);

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
  };

  const handleCloseDetails = () => {
    setSelectedCustomer(null);
  };

  return (
    <div className="space-y-6 text-left animate-fade-in" id="customers-panel">
      <div className="py-2">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">HAIERAH & Shopify Brand Members</h2>
        <p className="text-xs text-slate-500 mt-1">Audit customer loyalty, gross spending totals, and manage active system privileges.</p>
      </div>

      <div className="relative w-full md:w-1/3">
        <input
          type="text"
          placeholder="Search members by profile name, email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs font-medium pl-3 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none dark:text-white"
        />
      </div>

      {selectedCustomer ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <img src={selectedCustomer.avatar} className="w-16 h-16 rounded-full object-cover shadow" alt="" />
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedCustomer.name}</h3>
                <p className="text-sm text-slate-500">{selectedCustomer.email}</p>
                <p className="text-xs text-slate-400 mt-1">Customer ID: {selectedCustomer.id}</p>
              </div>
            </div>
            <button
              onClick={handleCloseDetails}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              Back to list
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-4">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-2">Contact</p>
              <p className="font-semibold text-slate-900 dark:text-white">{selectedCustomer.phone || 'Not provided'}</p>
              <p className="text-sm text-slate-500 mt-2">{selectedCustomer.address || 'Address not available'}</p>
            </div>
            <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-4">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-2">Account</p>
              <p className="font-semibold text-slate-900 dark:text-white">Status: {selectedCustomer.status}</p>
              <p className="text-sm text-slate-500 mt-2">Orders: {selectedCustomer.orderCount}</p>
              <p className="text-sm text-slate-500">Total spend: ${selectedCustomer.totalSpend.toFixed(2)}</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-4">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-2">Activity</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">Last active: {new Date(selectedCustomer.lastActive).toLocaleString()}</p>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-black tracking-widest text-slate-400 bg-slate-50/50 dark:bg-slate-950/20">
                  <th className="py-4 px-4">Customer</th>
                  <th className="py-4 px-3">Contact</th>
                  <th className="py-4 px-3">Order Count</th>
                  <th className="py-4 px-3">Total Spend</th>
                  <th className="py-4 px-3">Last Active</th>
                  <th className="py-4 px-3 text-center">Status</th>
                  <th className="py-4 px-4 text-right">Suspend Trigger</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/20">
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleSelectCustomer(c)}
                        className="flex items-center gap-3 text-left"
                      >
                        <img src={c.avatar} className="w-10 h-10 rounded-full object-cover shadow" alt="" />
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">{c.name}</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">ID: {c.id}</span>
                        </div>
                      </button>
                    </td>
                    <td className="py-3 px-3">
                      <span className="block font-medium">{c.email}</span>
                      <span className="block text-[10px] text-slate-400 mt-0.5">{c.phone}</span>
                    </td>
                    <td className="py-3 px-3 font-semibold font-mono">{c.orderCount} purchases</td>
                    <td className="py-3 px-3 font-extrabold text-slate-950 dark:text-white">₹{c.totalSpend.toFixed(2)}</td>
                    <td className="py-3 px-3 text-slate-400 font-medium">
                      {new Date(c.lastActive).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10.5px] uppercase font-bold ${
                        c.status === 'Active' ? 'bg-teal-100 text-teal-850 dark:bg-teal-950/40 dark:text-teal-350' : 'bg-rose-100 text-rose-850 dark:bg-rose-950/40 dark:text-rose-355'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onToggleStatus(c.id)}
                        className={`px-2 py-1 text-[10.5px] font-bold rounded border transition-all ${
                          c.status === 'Active' ? 'text-rose-600 hover:bg-rose-50 border-rose-100' : 'text-teal-600 hover:bg-teal-50 border-teal-100'
                        }`}
                      >
                        {c.status === 'Active' ? 'Suspend Code' : 'Activate User'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};


/* ==========================================
   3. DETAIL INVENTORY SYSTEM VIEW
   ========================================== */
export const InventoryView = ({ products, onQuickRestock }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
      if (statusFilter === 'Alert') return matchesSearch && p.stock <= 5;
      if (statusFilter === 'Safe') return matchesSearch && p.stock > 5;
      return matchesSearch;
    });
  }, [products, searchTerm, statusFilter]);

  return (
    <div className="space-y-6 text-left animate-fade-in" id="inventory-panel">
      <div className="py-2">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Active Warehouse Inventory</h2>
        <p className="text-xs text-slate-500 mt-1">Review active stock levels, flag shortages, and execute quick replenishment dispatches.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl">
        <input
          type="text"
          placeholder="Search listings by name or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 text-xs pl-3 py-2 rounded-lg border bg-slate-50 dark:bg-slate-950 dark:text-white"
        />
        <div className="flex gap-2">
          {['All', 'Alert', 'Safe'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${
                statusFilter === st ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-white'
              }`}
            >
              {st === 'Alert' ? 'Low Stock Warnings' : st === 'Safe' ? 'Adequately Stocked' : 'All Listings'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(p => {
          const isCritical = p.stock <= 5;

          return (
            <div
              key={p.id}
              className={`bg-white dark:bg-slate-900 border p-5 rounded-2xl flex flex-col justify-between shadow-sm relative overflow-hidden ${
                isCritical ? 'border-amber-200/60 bg-amber-50/5' : 'border-slate-150'
              }`}
            >
              {isCritical && (
                <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 font-black text-[9px] px-2.5 py-0.5 rounded-bl">
                  REPLENISH OVERDUE
                </div>
              )}

              <div className="flex items-start gap-4">
                <img src={p.images[0]} className="w-16 h-20 object-cover rounded shadow" alt="" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs leading-tight line-clamp-2">{p.name}</h4>
                  <span className="text-[10px] text-slate-400 font-mono mt-1.5 block">SKU: {p.sku}</span>
                  
                  <div className="flex items-center gap-1.5 mt-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${p.stock === 0 ? 'bg-rose-600' : isCritical ? 'bg-amber-500' : 'bg-teal-500'}`} />
                    <span className="font-extrabold text-xs font-mono">{p.stock} units left</span>
                  </div>
                </div>
              </div>

              {/* Adjust counters quick flow */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-4 flex items-center justify-between text-xs font-bold">
                <span className="text-slate-400 uppercase tracking-widest text-[9px]">Adjust stock:</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => onQuickRestock(p.id, -1)}
                    disabled={p.stock === 0}
                    className="w-7 h-7 flex items-center justify-center border rounded-lg hover:bg-slate-50 bg-slate-50/50 disabled:opacity-40"
                  >
                    -1
                  </button>
                  <button
                    onClick={() => onQuickRestock(p.id, 1)}
                    className="w-7 h-7 flex items-center justify-center border rounded-lg hover:bg-slate-50 bg-slate-50/50"
                  >
                    +1
                  </button>
                  <button
                    onClick={() => onQuickRestock(p.id, 5)}
                    className="px-2.5 h-7 flex items-center justify-center border text-[10px] rounded-lg hover:bg-slate-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  >
                    +5 restock
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


/* ==========================================
   4. ACTIVE COUPON SYSTEM VIEW
   ========================================== */
export const CouponsView = ({
  coupons,
  onAddCoupon,
  onToggleCoupon,
  onDeleteCoupon
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [code, setCode] = useState('');
  const [type, setType] = useState('Percentage');
  const [value, setValue] = useState('');
  const [minSpend, setMinSpend] = useState('');
  const [expiry, setExpiry] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    if (!code || !value) return;

    const payload = {
      id: `cp-${Date.now()}`,
      code: code.trim().toUpperCase(),
      type,
      value: parseFloat(value) || 10,
      minSpend: parseFloat(minSpend) || 0,
      expirationDate: expiry || new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
      usesCount: 0
    };

    onAddCoupon(payload);
    setIsFormOpen(false);
    setCode('');
    setValue('');
    setMinSpend('');
    setExpiry('');
  };

  return (
    <div className="space-y-6 text-left animate-fade-in" id="coupons-panel">
      <div className="flex justify-between items-center py-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Discount Coupon System</h2>
          <p className="text-xs text-slate-500 mt-1">Implement markdown promotions, fixed basket deductions, and expiration limits.</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-1.5 px-4 font-bold py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs rounded-lg hover:bg-slate-800"
        >
          <Plus className="w-4 h-4" /> Create Promo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {coupons.map(cp => (
          <div key={cp.id} className="bg-white dark:bg-slate-900 border border-slate-150 rounded-2xl p-5 flex flex-col justify-between shadow-sm relative overflow-hidden">
            <div>
              <div className="flex justify-between items-center pb-2 border-b border-dashed">
                <span className="font-mono font-black text-slate-950 dark:text-white text-md tracking-wider">
                  {cp.code}
                </span>
                <span className={`inline-flex px-1.5 py-0.5 rounded text-[9.5px] font-bold ${
                  cp.isActive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 text-slate-400'
                }`}>
                  {cp.isActive ? 'ACTIVE' : 'DEACTIVATED'}
                </span>
              </div>

              <div className="pt-4 space-y-2 text-xs text-slate-500 font-semibold">
                <div className="flex justify-between">
                  <span>Reward:</span>
                  <span className="text-slate-900 dark:text-white">
                    {cp.type === 'Percentage' ? `${cp.value}% Off Basket` : `₹${cp.value} Flat Deduct`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Minimum Threshold:</span>
                  <span className="text-slate-900 dark:text-white">₹{cp.minSpend} min spends</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Uses:</span>
                  <span className="text-slate-900 dark:text-white font-mono">{cp.usesCount} redemptions</span>
                </div>
                <div className="flex justify-between">
                  <span>Valid Expiration:</span>
                  <span className="text-slate-900 dark:text-white text-[11px]">
                     {new Date(cp.expirationDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
              <button
                onClick={() => onToggleCoupon(cp.id)}
                className={`flex-grow py-1 border hover:bg-slate-50 text-[11px] font-bold rounded-lg ${
                  cp.isActive ? 'text-amber-600 border-amber-100' : 'text-slate-600 border-slate-200'
                }`}
              >
                {cp.isActive ? 'Suspend' : 'Reinstate'}
              </button>
              <button
                onClick={() => onDeleteCoupon(cp.id)}
                className="p-1 px-2.5 border border-rose-100 hover:bg-rose-50 text-rose-600 rounded-lg text-xs"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 w-full max-w-sm p-6 shadow-2xl relative">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Create Promo Code</h3>
            
            <form onSubmit={handleSave} className="space-y-4 text-xs font-medium">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">PROMOTIONAL CODE WORD</span>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. HYRASPRING30"
                  className="w-full border p-2 bg-slate-50 rounded-lg dark:bg-slate-950 dark:text-white font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">DEDUCTION METHOD</span>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full border p-2 bg-slate-50 rounded-lg dark:bg-slate-950"
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="FixedAmount">Fixed Cash (₹)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">REWARD VALUE</span>
                  <input
                    type="number"
                    required
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="20"
                    className="w-full border p-2 bg-slate-50 rounded-lg dark:bg-slate-950"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">MINIMUM AMOUNT SPEND (₹)</span>
                <input
                  type="number"
                  value={minSpend}
                  onChange={(e) => setMinSpend(e.target.value)}
                  placeholder="e.g. 50 (Basket threshold to unlock)"
                  className="w-full border p-2 bg-slate-50 rounded-lg dark:bg-slate-950"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">EXPIRATION CALENDAR DATE</span>
                <input
                  type="date"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="w-full border p-2 bg-slate-50 rounded-lg dark:bg-slate-950"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-lg hover:bg-slate-800"
                >
                  Deploy Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


/* ==========================================
   5. DEEP ANALYTICS DETAILS VIEWER
   ========================================== */
export const AnalyticsView = ({ products, orders, customers }) => {
  const stats = useMemo(() => {
    const gross = orders.filter(o => o.status !== 'Cancelled').reduce((sum, o) => sum + o.total, 0);
    const avgOrderValue = orders.length > 0 ? gross / orders.length : 0;
    
    const sessions = 12400;
    const cartAdds = 2480;
    const checkouts = 620;
    const paid = orders.length;

    return {
      gross,
      avgOrderValue,
      sessions,
      cartAdds,
      checkouts,
      paid,
      conversionRate: ((paid / sessions) * 100).toFixed(2)
    };
  }, [orders]);

  return (
    <div className="space-y-6 text-left animate-fade-in" id="analytics-panel">
      <div className="py-2 mb-2">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Commercial Insights Deep Analytics</h2>
        <p className="text-xs text-slate-500 mt-1">Audit conversion rates, traffic pipelines, sales metrics totals and performance metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="border bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Gross Clothing Revenue</span>
          <h3 className="text-2xl font-black text-slate-950 dark:text-white mt-2">₹{stats.gross.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
          <span className="text-[10px] text-teal-650 dark:text-teal-400 mt-2 font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +17.5% YoY margin gains
          </span>
        </div>

        <div className="border bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Unique Client Visits</span>
          <h3 className="text-2xl font-black text-slate-950 dark:text-white mt-2">{stats.sessions.toLocaleString()}</h3>
          <span className="text-[10px] text-slate-400 mt-2 font-semibold">Direct Organic & Ads Traffic</span>
        </div>

        <div className="border bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Conversion rate ratio</span>
          <h3 className="text-2xl font-black text-slate-950 dark:text-white mt-2">{stats.conversionRate}%</h3>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-2">1 in 40 guests converted</span>
        </div>

        <div className="border bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Bespoke Basket Average</span>
          <h3 className="text-2xl font-black text-slate-950 dark:text-white mt-2">₹{stats.avgOrderValue.toFixed(2)}</h3>
          <span className="text-[10px] text-slate-400 mt-2 font-semibold">Average unit order pricing density</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="border bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">E-Commerce Conversion Funnel Analytics</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Visits to Paid Orders Conversion Flow</p>
          </div>

          <div className="space-y-4 pt-2">
            {[
              { name: '1. Brand Site Visits', count: stats.sessions, percentage: '100%' },
              { name: '2. Wardrobe Add-to-Carts', count: stats.cartAdds, percentage: `${((stats.cartAdds / stats.sessions) * 100).toFixed(0)}%` },
              { name: '3. Checkout Funnel Initiated', count: stats.checkouts, percentage: `${((stats.checkouts / stats.sessions) * 100).toFixed(1)}%` },
              { name: '4. Paid Complete Shipments', count: stats.paid, percentage: `${((stats.paid / stats.sessions) * 100).toFixed(2)}%` }
            ].map((step, idx) => (
              <div key={idx} className="space-y-1.5 text-xs">
                <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                  <span>{step.name}</span>
                  <span className="font-mono">{step.count.toLocaleString()} &bull; {step.percentage}</span>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                  <div
                    style={{ width: step.percentage }}
                    className={`h-full rounded-lg ${
                      idx === 0 ? 'bg-slate-900 dark:bg-slate-100' : idx === 1 ? 'bg-slate-600' : idx === 2 ? 'bg-amber-600' : 'bg-emerald-600'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Loyalty Member Growth Curve</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Active member sign-ups versus inactive accounts</p>
          </div>

          <div className="py-4 flex justify-around items-center h-48 relative">
            <div className="text-center space-y-1">
              <span className="text-[10px] text-slate-400 font-black uppercase">Acquisition Cost</span>
              <p className="text-lg font-black text-teal-650 dark:text-teal-400">₹14.20 / user</p>
            </div>
            
            <span className="w-px h-16 bg-slate-150 dark:bg-slate-800" />

            <div className="text-center space-y-1">
              <span className="text-[10px] text-slate-400 font-black uppercase">Lifetime Yield Value</span>
              <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">₹340.50 LTV</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


/* ==========================================
   6. GLOBAL SAAS APP SETTINGS VIEW
   ========================================== */
export const SettingsView = ({ settings, onUpdateSettings }) => {
  const getCurrencyCode = (value) => {
    const normalized = String(value || 'INR').toUpperCase();
    return ['USD', 'EUR', 'GBP', 'JPY', 'INR'].includes(normalized) ? normalized : 'INR';
  };

  const getCurrencySymbol = (code) => {
    switch (code) {
       case 'INR': return '₹';
      case 'EUR': return '€';
      case 'usd': return '$';
   
      default: return '₹';
    }
  };

  const [storeName, setStoreName] = useState(settings?.storeName || '');
  const [storeEmail, setStoreEmail] = useState(settings?.storeEmail || '');
  const [storePhone, setStorePhone] = useState(settings?.storePhone || '');
  const [logoUrl, setLogoUrl] = useState(settings?.logoUrl || '');
  const [currencyCode, setCurrencyCode] = useState(getCurrencyCode(settings?.currency || settings?.currencyCode));
  const [currencySymbol, setCurrencySymbol] = useState(settings?.currencySymbol || getCurrencySymbol(getCurrencyCode(settings?.currency || settings?.currencyCode)));
  const [taxRate, setTaxRate] = useState((settings?.taxRate ?? 15).toString());
  const [freeShippingMin, setFreeShippingMin] = useState((settings?.freeShippingMinimum ?? 150).toString());
  const [stripeEnabled, setStripeEnabled] = useState(Boolean(settings?.paymentGateways?.stripe));
  const [paypalEnabled, setPaypalEnabled] = useState(Boolean(settings?.paymentGateways?.paypal));
  const [codEnabled, setCodEnabled] = useState(Boolean(settings?.paymentGateways?.cashOnDelivery));

  const [notif, setNotif] = useState(false);

  useEffect(() => {
    const nextCurrencyCode = getCurrencyCode(settings?.currency || settings?.currencyCode || 'INR');
    setStoreName(settings?.storeName || '');
    setStoreEmail(settings?.storeEmail || '');
    setStorePhone(settings?.storePhone || '');
    setLogoUrl(settings?.logoUrl || '');
    setCurrencyCode(nextCurrencyCode);
    setCurrencySymbol(settings?.currencySymbol || getCurrencySymbol(nextCurrencyCode));
    setTaxRate((settings?.taxRate ?? 15).toString());
    setFreeShippingMin((settings?.freeShippingMinimum ?? 150).toString());
    setStripeEnabled(Boolean(settings?.paymentGateways?.stripe));
    setPaypalEnabled(Boolean(settings?.paymentGateways?.paypal));
    setCodEnabled(Boolean(settings?.paymentGateways?.cashOnDelivery));
  }, [settings]);

  const handleSave = (e) => {
    e.preventDefault();
    const normalizedCurrencyCode = getCurrencyCode(currencyCode);
    const normalizedCurrencySymbol = (currencySymbol || '').trim() || getCurrencySymbol(normalizedCurrencyCode);

    onUpdateSettings({
      ...settings,
      storeName: storeName.trim(),
      storeEmail: storeEmail.trim(),
      storePhone: storePhone.trim(),
      logoUrl: logoUrl.trim(),
      currency: normalizedCurrencyCode,
      currencyCode: normalizedCurrencyCode,
      currencySymbol: normalizedCurrencySymbol,
      taxRate: parseFloat(taxRate) || 15,
      freeShippingMinimum: parseFloat(freeShippingMin) || 150,
      paymentGateways: {
        stripe: stripeEnabled,
        paypal: paypalEnabled,
        cashOnDelivery: codEnabled
      }
    });
    setNotif(true);
    setTimeout(() => setNotif(false), 3000);
  };

  return (
    <div className="space-y-6 text-left animate-fade-in" id="settings-panel">
      <div className="py-2">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Store Configurations</h2>
        <p className="text-xs text-slate-500 mt-1">Configure retail labels, VAT rules, currencies bounds and merchant APIs parameters.</p>
      </div>

      {notif && (
        <div className="bg-emerald-50 border border-emerald-200/60 p-4 rounded-xl text-emerald-800 text-xs font-bold font-sans flex items-center gap-2">
          <span>Your general retail configurations have successfully committed to primary caching logs.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <form onSubmit={handleSave} className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4 text-xs font-medium">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">STOREFRONT TITLE</span>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full border p-2 bg-slate-50 dark:bg-slate-950 dark:text-white rounded"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">SUPPORT EMAIL FOR CLIENTS</span>
              <input
                type="email"
                required
                value={storeEmail}
                onChange={(e) => setStoreEmail(e.target.value)}
                className="w-full border p-2 bg-slate-50 dark:bg-slate-950 dark:text-white rounded"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">STORE CONTACT NUMBER</span>
              <input
                type="tel"
                value={storePhone}
                onChange={(e) => setStorePhone(e.target.value)}
                placeholder="+1 (800) 555-0000"
                className="w-full border p-2 bg-slate-50 dark:bg-slate-950 dark:text-white rounded"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">STORE LOGO URL</span>
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
                className="w-full border p-2 bg-slate-50 dark:bg-slate-950 dark:text-white rounded"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">BASE TRANSACTION CURRENCY</span>
              <select
                value={currencyCode}
                onChange={(e) => {
                  const nextCode = e.target.value;
                  setCurrencyCode(nextCode);
                  setCurrencySymbol(getCurrencySymbol(nextCode));
                }}
                className="w-full border p-2 bg-slate-50 dark:bg-slate-950 dark:text-white rounded font-bold"
              >
                <option value="INR">INR (₹)</option>
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">DISPLAY SYMBOL</span>
              <input
                type="text"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                maxLength={3}
                className="w-full border p-2 bg-slate-50 dark:bg-slate-950 dark:text-white rounded"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">COUNTRY ESTIMATED TAX RATE (%)</span>
              <input
                type="number"
                step="0.1"
                required
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="w-full border p-2 bg-slate-50 dark:bg-slate-950 dark:text-white rounded"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">FREE COURIER SHIPPING SPEND LIMIT</span>
              <input
                type="number"
                required
                value={freeShippingMin}
                onChange={(e) => setFreeShippingMin(e.target.value)}
                className="w-full border p-2 bg-slate-50 dark:bg-slate-950 dark:text-white rounded"
              />
            </div>
          </div>

          <div className="border-t pt-4 space-y-3 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase block shadow-none">Secure Merchant API Gateways:</span>
            
            <div className="space-y-2.5">
              <div className="flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/40 p-2 border dark:border-slate-850 rounded-lg">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-205 dark:text-slate-200">Secure Stripe Checkout API</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Allow Apple Pay and premium digital debit lines.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setStripeEnabled(!stripeEnabled)}
                  className="rounded text-slate-705 dark:text-slate-355 hover:text-slate-900 dark:hover:text-white transition-all focus:outline-none"
                >
                  {stripeEnabled ? <ToggleRight className="w-9 h-9 text-slate-900 dark:text-white" /> : <ToggleLeft className="w-9 h-9 text-slate-300 dark:text-slate-700" />}
                </button>
              </div>

              <div className="flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/40 p-2 border dark:border-slate-850 rounded-lg">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">PayPal Express Fulfilment</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Enables worldwide quick buyer transactions logs.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPaypalEnabled(!paypalEnabled)}
                  className="rounded text-slate-705 dark:text-slate-355 hover:text-slate-900 dark:hover:text-white transition-all focus:outline-none"
                >
                  {paypalEnabled ? <ToggleRight className="w-9 h-9 text-slate-900 dark:text-white" /> : <ToggleLeft className="w-9 h-9 text-slate-300 dark:text-slate-700" />}
                </button>
              </div>

              <div className="flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/40 p-2 border dark:border-slate-850 rounded-lg">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">Cash on Delivery (COD) Options</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Standard logistics payment collection tags.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setCodEnabled(!codEnabled)}
                  className="rounded text-slate-705 dark:text-slate-355 hover:text-slate-900 dark:hover:text-white transition-all focus:outline-none"
                >
                  {codEnabled ? <ToggleRight className="w-9 h-9 text-slate-900 dark:text-white" /> : <ToggleLeft className="w-9 h-9 text-slate-300 dark:text-slate-700" />}
                </button>
              </div>
            </div>
          </div>

          <div className="border-t pt-4 flex justify-end dark:border-slate-800">
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100"
            >
              Commit Settings
            </button>
          </div>
        </form>

        <div className="bg-slate-950 text-white p-6 rounded-2xl shadow flex flex-col justify-between">
          <div className="space-y-4">
            <div className="p-2 border border-slate-800 w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
              <Store className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Hyra SaaS Architecture</span>
              <h3 className="text-md font-bold mt-1">Local Sandbox Hosting</h3>
              <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                Applet environment runs on a high-speed sandboxed container using state synchronization hooks. All alterations preserve persistently inside local sandbox storage partitions.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-900 pt-4 mt-6 text-[10px] text-slate-500 leading-normal">
            Production Build Level &bull; Rev 2026<br />
            Hyra Clothing Admin Panel API V4
          </div>
        </div>

      </div>
    </div>
  );
};
