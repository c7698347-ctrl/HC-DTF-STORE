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
  AlertCircle
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
  const [images, setImages] = useState([]);
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
    setImages([]);
    setEditingProduct(null);
  };

  const handleImageFileUpload = (files) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Url = e.target.result;
        setImages((prev) => [...prev, base64Url]);
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

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a product name');
      return;
    }

    const selectedCat = DEFAULT_CATEGORIES.find(c => c.id === categoryId) || DEFAULT_CATEGORIES[0];

    const payload = {
      name,
      categoryId: selectedCat.id,
      categoryName: selectedCat.name,
      tags,
      price: Number(price) || 0,
      offerPrice: Number(offerPrice) || Number(price) || 0,
      stock: Number(stock) || 0,
      description,
      status,
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800']
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, payload);
    } else {
      addProduct(payload);
    }

    setShowAddModal(false);
    resetForm();
  };

  const handleEditClick = (p) => {
    setEditingProduct(p);
    setName(p.name);
    setCategoryId(p.categoryId || DEFAULT_CATEGORIES.find(c => c.name.toLowerCase() === p.category?.toLowerCase())?.id || DEFAULT_CATEGORIES[0].id);
    setTags(Array.isArray(p.tags) ? p.tags.join(', ') : p.tags || '');
    setPrice(p.price);
    setOfferPrice(p.offerPrice);
    setStock(p.stock);
    setDescription(p.description || '');
    setStatus(p.status || 'Published');
    setImages(p.images || []);
    setShowAddModal(true);
  };

  const filteredProducts = products.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchName = p.name.toLowerCase().includes(q);
    const matchCat = p.category?.toLowerCase().includes(q);
    const matchTags = Array.isArray(p.tags) && p.tags.some(t => t.toLowerCase().includes(q));
    return matchName || matchCat || matchTags;
  });

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-white">Product Catalog Manager</h1>
          <p className="text-xs text-slate-400 mt-1">Upload products directly into default system categories with live search tags</p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-black shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition"
        >
          <Plus size={18} /> Upload New Product
        </button>
      </div>

      {/* Toolbar & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by product name, category, or search tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        </div>

        <span className="text-xs text-slate-400 font-bold">
          Total Published Products: <strong className="text-white">{products.length}</strong>
        </span>
      </div>

      {/* Products Table */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-bold text-[11px]">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">Default Category</th>
                <th className="p-4">Search Tags</th>
                <th className="p-4">Price & Discount</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500 font-bold space-y-2">
                    <Package size={36} className="mx-auto text-slate-700" />
                    <p className="text-white font-extrabold text-sm">No products found.</p>
                    <p className="text-xs text-slate-500">Upload a product to publish it immediately to the store.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-850 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images?.[0] || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200'}
                          alt=""
                          className="w-12 h-12 object-cover rounded-xl border border-slate-800"
                        />
                        <div>
                          <p className="font-extrabold text-white text-xs">{p.name}</p>
                          <p className="text-[10px] text-slate-500">ID: {p.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-emerald-950 text-emerald-400 font-extrabold text-[10px] rounded-full border border-emerald-800">
                        {p.category || 'General'}
                      </span>
                    </td>

                    <td className="p-4 max-w-xs">
                      {Array.isArray(p.tags) && p.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {p.tags.slice(0, 4).map((t, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-slate-950 text-slate-300 text-[10px] rounded font-mono">
                              #{t}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-500 italic">No tags</span>
                      )}
                    </td>

                    <td className="p-4">
                      <p className="font-extrabold text-white text-xs">₹{p.offerPrice}</p>
                      {p.price > p.offerPrice && (
                        <p className="text-[10px] text-slate-500 line-through">₹{p.price}</p>
                      )}
                    </td>

                    <td className="p-4">
                      <span className={`font-bold ${p.stock > 10 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {p.stock} units
                      </span>
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        p.status === 'Published' || p.enabled !== false ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {p.status || 'Published'}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(p)}
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
                          title="Edit Product"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => duplicateProduct(p)}
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
                          title="Duplicate Product"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          onClick={() => deleteProduct(p.id)}
                          className="p-2 bg-rose-950/80 hover:bg-rose-900 text-rose-300 rounded-xl transition"
                          title="Delete Product"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* UPLOAD / EDIT PRODUCT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md" onClick={() => setShowAddModal(false)} />

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
                  placeholder="e.g. 1 Meter Independence Freedom DTF Sheet (22×39)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-white focus:outline-none focus:border-emerald-500 font-bold text-sm"
                />
              </div>

              {/* Category Dropdown (SYSTEM DEFAULT CATEGORIES ONLY) */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Default Category (Dropdown Only) *</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-emerald-400 font-extrabold focus:outline-none focus:border-emerald-500 text-sm"
                >
                  {DEFAULT_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">Select one of the 10 immutable system categories.</p>
              </div>

              {/* Search Tags */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5 flex items-center justify-between">
                  <span>Search Tags (Comma Separated)</span>
                  <span className="text-[10px] text-emerald-400 font-normal">For Search Indexing Only</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. india, independence, tiranga, flag, aug15, freedom"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">Tags enable instant search matches. Tags will NEVER create category cards.</p>
              </div>

              {/* Price & Offer Price & Stock */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Original Price (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="499"
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
                    placeholder="399"
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
                    placeholder="100"
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

              {/* Product Images Drag & Drop Uploader */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Product Images</label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-3xl p-6 text-center transition ${
                    isDragOver ? 'border-emerald-500 bg-emerald-950/20' : 'border-slate-800 bg-slate-950'
                  }`}
                >
                  <Upload size={28} className="mx-auto text-emerald-400 mb-2" />
                  <p className="text-xs font-bold text-white">Drag & drop product images here</p>
                  <p className="text-[11px] text-slate-500 mb-3">Supports JPG, PNG, WEBP</p>

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
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer inline-block transition"
                  >
                    Browse Local Files
                  </label>
                </div>

                {images.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-3">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative w-16 h-16 group">
                        <img src={img} alt="" className="w-full h-full object-cover rounded-xl border border-slate-700" />
                        <button
                          type="button"
                          onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                          className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                        >
                          <X size={10} />
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
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black shadow-lg shadow-emerald-600/30 transition"
                >
                  {editingProduct ? 'Save Changes' : 'Publish Product Now'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
