'use client';

import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Copy, 
  CheckCircle2, 
  X,
  Upload,
  Layers,
  Sparkles,
  Tag,
  AlertCircle,
  Flame,
  Star,
  Image as ImageIcon,
  Check
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { DEFAULT_CATEGORIES } from '@/lib/store';

export default function AdminProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct, duplicateProduct } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Product Form Fields
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState(DEFAULT_CATEGORIES[0].id);
  const [tags, setTags] = useState('');
  const [price, setPrice] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [stock, setStock] = useState('100');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Published'); // 'Published' or 'Draft'
  const [isTrending, setIsTrending] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(true);
  const [images, setImages] = useState([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const resetForm = () => {
    setName('');
    setCategoryId(DEFAULT_CATEGORIES[0].id);
    setTags('');
    setPrice('');
    setOfferPrice('');
    setStock('100');
    setDescription('');
    setStatus('Published');
    setIsTrending(false);
    setIsNewArrival(true);
    setImages([]);
    setImageUrlInput('');
    setEditingProduct(null);
  };

  const handleAddImageUrl = () => {
    const url = imageUrlInput.trim();
    if (!url) return;
    // Prepend new image URL to index 0 so it becomes primary cover image
    setImages((prev) => [url, ...prev.filter(i => i !== url)]);
    setImageUrlInput('');
  };

  const handleImageFileUpload = (files) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Url = e.target.result;
        // Prepend newly uploaded image file to index 0 so it becomes primary cover image
        setImages((prev) => [base64Url, ...prev.filter(i => i !== base64Url)]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageFileUpload(e.dataTransfer.files);
    }
  };

  const setAsCoverImage = (index) => {
    if (index === 0) return;
    setImages((prev) => {
      const selected = prev[index];
      const remaining = prev.filter((_, i) => i !== index);
      return [selected, ...remaining];
    });
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a product name');
      return;
    }

    const selectedCat = DEFAULT_CATEGORIES.find(c => c.id === categoryId) || DEFAULT_CATEGORIES[0];

    const finalImages = images.length > 0 
      ? images 
      : ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800'];

    const payload = {
      name: name.trim(),
      categoryId: selectedCat.id,
      categoryName: selectedCat.name,
      category: selectedCat.name,
      tags: typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : tags,
      price: Number(price) || 0,
      offerPrice: Number(offerPrice) || Number(price) || 0,
      stock: Number(stock) || 0,
      description: description || '',
      status,
      isTrending,
      isNewArrival,
      images: finalImages
    };

    if (editingProduct) {
      await updateProduct(editingProduct.id, payload);
    } else {
      await addProduct(payload);
    }

    setShowAddModal(false);
    resetForm();
  };

  const handleEditClick = (p) => {
    setEditingProduct(p);
    setName(p.name || '');
    setCategoryId(p.categoryId || DEFAULT_CATEGORIES.find(c => c.name.toLowerCase() === p.category?.toLowerCase())?.id || DEFAULT_CATEGORIES[0].id);
    setTags(Array.isArray(p.tags) ? p.tags.join(', ') : p.tags || '');
    setPrice(p.price || '');
    setOfferPrice(p.offerPrice || '');
    setStock(p.stock !== undefined ? p.stock : '100');
    setDescription(p.description || '');
    setStatus(p.status || 'Published');
    setIsTrending(!!p.isTrending);
    setIsNewArrival(p.isNewArrival !== false);
    setImages(Array.isArray(p.images) ? p.images : []);
    setImageUrlInput('');
    setShowAddModal(true);
  };

  const filteredProducts = (products || []).filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchName = p.name?.toLowerCase().includes(q);
    const matchCat = p.category?.toLowerCase().includes(q);
    const matchTags = Array.isArray(p.tags) && p.tags.some(t => t.toLowerCase().includes(q));
    return matchName || matchCat || matchTags;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-3xl shadow-xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Package className="text-emerald-400" /> Admin Product Catalog
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Single Source of Truth: Total Store Products ({products?.length || 0})
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition hover:scale-105"
        >
          <Plus size={18} /> Upload New Product
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
        <Search size={18} className="text-slate-400" />
        <input
          type="text"
          placeholder="Search products by title, category, or search tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-700">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider">
              <tr>
                <th className="py-4 px-6">Product</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Price</th>
                <th className="py-4 px-6">Stock</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-bold text-slate-800">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <img
                        src={p.images?.[0] || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800'}
                        alt={p.name}
                        className="w-12 h-12 object-cover rounded-xl border border-slate-200 bg-slate-100"
                      />
                      <div>
                        <p className="font-extrabold text-slate-900 text-sm">{p.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">ID: {p.id}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          {p.isNewArrival !== false && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] rounded-md font-extrabold">
                              New Arrival
                            </span>
                          )}
                          {p.isTrending && (
                            <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] rounded-md font-extrabold">
                              Trending
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-slate-600">
                      <span className="px-3 py-1 bg-slate-100 rounded-xl text-slate-700 font-extrabold">
                        {p.category || p.categoryName || 'General'}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <span className="text-slate-900 font-black text-sm">₹{p.offerPrice || p.price}</span>
                      {p.price > p.offerPrice && (
                        <span className="text-[11px] text-slate-400 line-through ml-1.5">₹{p.price}</span>
                      )}
                    </td>

                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-xl text-xs font-black ${
                        p.stock > 10 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {p.stock} units
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-xl text-[11px] font-black ${
                        p.status === 'Published' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {p.status || 'Published'}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => handleEditClick(p)}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                        title="Edit Product"
                      >
                        <Edit3 size={15} />
                      </button>

                      <button
                        onClick={() => duplicateProduct(p)}
                        className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition"
                        title="Duplicate Product"
                      >
                        <Copy size={15} />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to permanently delete "${p.name}"?`)) {
                            deleteProduct(p.id);
                          }
                        }}
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition"
                        title="Delete Product"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-bold">
                    No products found in catalog.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT PRODUCT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setShowAddModal(false)} />

          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-white z-10 my-8 space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="font-black text-xl text-white">
                {editingProduct ? 'Edit Product' : 'Upload New Product'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-5 text-xs">
              
              {/* Product Name */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HCDFT 408 Premium DTF Sheet"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-white focus:outline-none focus:border-emerald-500 font-bold text-sm"
                />
              </div>

              {/* Category Dropdown */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Category *</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-emerald-400 font-extrabold focus:outline-none focus:border-emerald-500 text-sm"
                >
                  {DEFAULT_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Badges Toggle: New Arrival & Trending */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isNewArrival}
                    onChange={(e) => setIsNewArrival(e.target.checked)}
                    className="w-4 h-4 text-emerald-500 rounded"
                  />
                  <span className="font-extrabold text-white flex items-center gap-1">
                    <Sparkles size={14} className="text-blue-400" /> Mark as New Arrival
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTrending}
                    onChange={(e) => setIsTrending(e.target.checked)}
                    className="w-4 h-4 text-emerald-500 rounded"
                  />
                  <span className="font-extrabold text-white flex items-center gap-1">
                    <Flame size={14} className="text-rose-400" /> Mark as Trending
                  </span>
                </label>
              </div>

              {/* Search Tags */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5 flex items-center justify-between">
                  <span>Search Tags (Comma Separated)</span>
                  <span className="text-[10px] text-emerald-400 font-normal">For Search Indexing Only</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. dtf, sheet, premium, hcdft408"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              {/* Price & Offer Price & Stock */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Original Price (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="249"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-white focus:outline-none focus:border-emerald-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Offer Price (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="249"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-emerald-400 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Stock Units *</label>
                  <input
                    type="number"
                    required
                    placeholder="1000"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Publish Status *</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-white font-bold"
                >
                  <option value="Published">Published (Live in Store Immediately)</option>
                  <option value="Draft">Draft (Hidden from Store)</option>
                </select>
              </div>

              {/* PRODUCT IMAGE MANAGEMENT SECTION */}
              <div className="space-y-3">
                <label className="block text-slate-300 font-bold flex items-center justify-between">
                  <span>Product Images (First Image is Main Cover)</span>
                  <span className="text-[10px] text-emerald-400 font-extrabold">{images.length} Image(s) Attached</span>
                </label>

                {/* Direct Image URL Input */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Paste direct Image URL (e.g. https://images.unsplash.com/...)"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    disabled={!imageUrlInput.trim()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-2xl text-xs font-bold shrink-0 transition"
                  >
                    Add Image URL
                  </button>
                </div>

                {/* Drag & Drop File Upload */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-3xl p-4 text-center transition ${
                    isDragOver ? 'border-emerald-500 bg-emerald-950/20' : 'border-slate-800 bg-slate-950'
                  }`}
                >
                  <Upload size={24} className="mx-auto text-emerald-400 mb-1" />
                  <p className="text-xs font-bold text-white">Upload local image files (JPG, PNG, WEBP)</p>

                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageFileUpload(e.target.files)}
                    className="hidden"
                    id="modal-img-input"
                  />
                  <label
                    htmlFor="modal-img-input"
                    className="mt-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer inline-block transition"
                  >
                    Browse Local Files
                  </label>
                </div>

                {/* IMAGE THUMBNAILS GALLERY WITH COVER BADGE & DELETE BUTTON */}
                {images.length > 0 && (
                  <div className="grid grid-cols-4 gap-3 pt-2">
                    {images.map((img, idx) => (
                      <div key={idx} className={`relative group rounded-2xl overflow-hidden border-2 transition ${
                        idx === 0 ? 'border-emerald-500 shadow-md shadow-emerald-500/20' : 'border-slate-800'
                      }`}>
                        <img src={img} alt="" className="w-full h-24 object-cover bg-slate-950" />
                        
                        {/* Cover Image Badge */}
                        {idx === 0 ? (
                          <span className="absolute top-1 left-1 bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                            <Check size={10} /> Cover
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setAsCoverImage(idx)}
                            className="absolute top-1 left-1 bg-slate-900/90 hover:bg-emerald-600 text-slate-300 hover:text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition shadow-md"
                          >
                            Set Cover
                          </button>
                        )}

                        {/* Remove Image Button */}
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition shadow-md"
                          title="Remove image"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Description</label>
                <textarea
                  rows={3}
                  placeholder="2400 DPI HD color depth, TPU powder cured ready-to-press transfer sheet details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Submit */}
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center gap-2"
                >
                  <CheckCircle2 size={16} /> {editingProduct ? 'Save Product Changes' : 'Upload & Publish Product'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
