'use client';

import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  Edit2, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Check, 
  X, 
  Eye, 
  EyeOff, 
  FolderPlus,
  Tag,
  AlertCircle
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function CategoryManagementPage() {
  const { 
    categories, 
    addCategory, 
    updateCategory, 
    deleteCategory, 
    toggleCategoryStatus, 
    reorderCategories,
    addSubcategory,
    editSubcategory,
    deleteSubcategory
  } = useStore();

  // Category Modal State
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  // Category Form State
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [subcatInputs, setSubcatInputs] = useState(['']);

  // Subcategory Quick Add/Edit State
  const [activeCatForSub, setActiveCatForSub] = useState(null);
  const [newSubName, setNewSubName] = useState('');
  const [editingSub, setEditingSub] = useState(null); // { catId, subId, name }
  const [editSubName, setEditSubName] = useState('');

  const openAddCategoryModal = () => {
    setEditingCategory(null);
    setCatName('');
    setCatDesc('');
    setSubcatInputs(['']);
    setIsCatModalOpen(true);
  };

  const openEditCategoryModal = (cat) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatDesc(cat.description || '');
    setSubcatInputs(cat.subcategories?.map(s => s.name) || ['']);
    setIsCatModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!catName.trim()) return;

    const filteredSubcats = subcatInputs.map(s => s.trim()).filter(Boolean);

    if (editingCategory) {
      const existingSubcats = editingCategory.subcategories || [];
      const updatedSubcats = filteredSubcats.map((name, idx) => {
        const match = existingSubcats[idx];
        return {
          id: match ? match.id : `sub-${Date.now()}-${idx}`,
          name,
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          enabled: match ? match.enabled : true
        };
      });

      await updateCategory(editingCategory.id, {
        name: catName.trim(),
        description: catDesc.trim(),
        subcategories: updatedSubcats
      });
    } else {
      await addCategory(catName.trim(), catDesc.trim(), filteredSubcats);
    }

    setIsCatModalOpen(false);
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const updated = [...categories];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;

    const reordered = updated.map((c, idx) => ({ ...c, order: idx + 1 }));
    reorderCategories(reordered);
  };

  const handleMoveDown = (index) => {
    if (index === categories.length - 1) return;
    const updated = [...categories];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;

    const reordered = updated.map((c, idx) => ({ ...c, order: idx + 1 }));
    reorderCategories(reordered);
  };

  const handleAddSubcatField = () => {
    setSubcatInputs([...subcatInputs, '']);
  };

  const handleRemoveSubcatField = (index) => {
    if (subcatInputs.length <= 1) return;
    setSubcatInputs(subcatInputs.filter((_, i) => i !== index));
  };

  const handleSubcatInputChange = (index, value) => {
    const updated = [...subcatInputs];
    updated[index] = value;
    setSubcatInputs(updated);
  };

  const handleAddSubcategoryDirect = (e, catId) => {
    e.preventDefault();
    if (!newSubName.trim()) return;
    addSubcategory(catId, newSubName.trim());
    setNewSubName('');
    setActiveCatForSub(null);
  };

  const handleSaveSubcategoryEdit = (e) => {
    e.preventDefault();
    if (!editingSub || !editSubName.trim()) return;
    editSubcategory(editingSub.catId, editingSub.subId, editSubName.trim());
    setEditingSub(null);
    setEditSubName('');
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-white">Full Category & Subcategory Management</h1>
          <p className="text-xs text-slate-400 mt-1">Create unlimited categories, manage subcategories, toggle status & reorder sequence</p>
        </div>

        <button
          onClick={openAddCategoryModal}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl text-xs shadow-lg transition flex items-center gap-1.5"
        >
          <Plus size={16} /> Create New Category
        </button>
      </div>

      {/* Categories Cards List */}
      {categories.length === 0 ? (
        <div className="bg-slate-900 rounded-3xl p-12 text-center border border-slate-800 space-y-4 max-w-md mx-auto">
          <Layers size={40} className="mx-auto text-slate-600" />
          <h3 className="font-extrabold text-white text-base">No categories found.</h3>
          <p className="text-xs text-slate-400">Please create a category first to enable product catalog organization.</p>
          <button
            onClick={openAddCategoryModal}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs transition shadow-md inline-flex items-center gap-1.5"
          >
            <Plus size={16} /> Create Category Now
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((cat, index) => (
            <div key={cat.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 text-white">
              
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-slate-800 text-emerald-400 font-extrabold text-xs flex items-center justify-center border border-slate-700">
                    #{index + 1}
                  </span>

                  <div>
                    <h3 className="font-black text-lg text-white flex items-center gap-2">
                      <span>{cat.name}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        cat.enabled !== false ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}>
                        {cat.enabled !== false ? '🟢 Active' : '🔴 Disabled'}
                      </span>
                    </h3>
                    {cat.description && <p className="text-xs text-slate-400 mt-0.5">{cat.description}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  
                  {/* Reorder Buttons */}
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className={`p-2 rounded-xl border transition ${
                      index === 0 ? 'bg-slate-950 text-slate-700 border-slate-900 cursor-not-allowed' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
                    }`}
                    title="Move Up"
                  >
                    <ArrowUp size={14} />
                  </button>

                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === categories.length - 1}
                    className={`p-2 rounded-xl border transition ${
                      index === categories.length - 1 ? 'bg-slate-950 text-slate-700 border-slate-900 cursor-not-allowed' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
                    }`}
                    title="Move Down"
                  >
                    <ArrowDown size={14} />
                  </button>

                  {/* Toggle Status */}
                  <button
                    onClick={() => toggleCategoryStatus(cat.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                      cat.enabled !== false ? 'bg-amber-950 text-amber-300 hover:bg-amber-900' : 'bg-emerald-950 text-emerald-300 hover:bg-emerald-900'
                    }`}
                  >
                    {cat.enabled !== false ? 'Disable' : 'Enable'}
                  </button>

                  {/* Edit Category */}
                  <button
                    onClick={() => openEditCategoryModal(cat)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition"
                    title="Edit Category"
                  >
                    <Edit2 size={14} />
                  </button>

                  {/* Delete Category */}
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="p-2 bg-rose-950 hover:bg-rose-900 text-rose-300 rounded-xl transition"
                    title="Delete Category"
                  >
                    <Trash2 size={14} />
                  </button>

                </div>

              </div>

              {/* Subcategories Subsection */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Tag size={14} className="text-emerald-400" />
                    Subcategories ({cat.subcategories?.length || 0})
                  </h4>

                  <button
                    onClick={() => setActiveCatForSub(activeCatForSub === cat.id ? null : cat.id)}
                    className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <Plus size={14} /> Add Subcategory
                  </button>
                </div>

                {activeCatForSub === cat.id && (
                  <form onSubmit={(e) => handleAddSubcategoryDirect(e, cat.id)} className="flex gap-2 text-xs">
                    <input
                      type="text"
                      required
                      placeholder="New subcategory name..."
                      value={newSubName}
                      onChange={(e) => setNewSubName(e.target.value)}
                      className="bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white flex-1 focus:outline-none focus:border-emerald-500"
                    />
                    <button type="submit" className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl">
                      Add
                    </button>
                    <button type="button" onClick={() => setActiveCatForSub(null)} className="px-3 py-2.5 bg-slate-800 text-slate-400 rounded-xl">
                      Cancel
                    </button>
                  </form>
                )}

                {/* Subcategories Badges Grid */}
                {!cat.subcategories || cat.subcategories.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-2 bg-slate-950 rounded-xl border border-slate-800">
                    No subcategories available.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {cat.subcategories.map((sub) => (
                      <div key={sub.id} className="bg-slate-950 border border-slate-800 rounded-2xl px-3 py-1.5 flex items-center gap-2 text-xs">
                        {editingSub?.subId === sub.id ? (
                          <form onSubmit={handleSaveSubcategoryEdit} className="flex items-center gap-1">
                            <input
                              type="text"
                              required
                              value={editSubName}
                              onChange={(e) => setEditSubName(e.target.value)}
                              className="bg-slate-900 border border-slate-700 text-white text-xs px-2 py-0.5 rounded"
                            />
                            <button type="submit" className="text-emerald-400"><Check size={14} /></button>
                            <button type="button" onClick={() => setEditingSub(null)} className="text-slate-400"><X size={14} /></button>
                          </form>
                        ) : (
                          <>
                            <span className="font-bold text-slate-200">{sub.name}</span>
                            <button
                              onClick={() => {
                                setEditingSub({ catId: cat.id, subId: sub.id, name: sub.name });
                                setEditSubName(sub.name);
                              }}
                              className="text-slate-500 hover:text-white transition"
                              title="Edit Subcategory"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              onClick={() => deleteSubcategory(cat.id, sub.id)}
                              className="text-rose-500 hover:text-rose-400 transition"
                              title="Delete Subcategory"
                            >
                              <Trash2 size={12} />
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT CATEGORY MODAL */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setIsCatModalOpen(false)} />

          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-white z-10 space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-black text-lg text-white">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button onClick={() => setIsCatModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DTF Sheets"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Brief summary of category products..."
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Unlimited Subcategories Builder */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-300 font-bold">Unlimited Subcategories</label>
                  <button
                    type="button"
                    onClick={handleAddSubcatField}
                    className="text-xs text-emerald-400 font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus size={14} /> Add Subcategory Field
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {subcatInputs.map((sub, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder={`Subcategory #${idx + 1} (e.g. 1 Meter Sheet 22×39)`}
                        value={sub}
                        onChange={(e) => handleSubcatInputChange(idx, e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                      />
                      {subcatInputs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSubcatField(idx)}
                          className="p-2 text-rose-400 hover:text-rose-300 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-xs shadow-xl transition"
              >
                {editingCategory ? 'Save Category Changes' : 'Create & Save Category'}
              </button>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
