'use client';

import React, { useEffect, useState } from 'react';
import { FolderTree, Plus, Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import { Category } from '@michaforge/shared-contracts';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    iconName: 'pipe',
    imageUrl: '',
    startingPrice: '',
  });

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/categories');
      const json = await res.json();
      if (json.success) setCategories(json.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', iconName: 'pipe', imageUrl: '', startingPrice: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      description: cat.description,
      iconName: cat.iconName,
      imageUrl: cat.imageUrl || '',
      startingPrice: cat.startingPrice !== undefined && cat.startingPrice !== null ? String(cat.startingPrice) : '',
    });
    setShowModal(true);
  };

  const handleCategoryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('michaforge_admin_token') : null;
      const fd = new FormData();
      fd.append('file', file);
      fd.append('altText', formData.name || file.name);
      const res = await fetch('/api/v1/media/uploads', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      const json = await res.json();
      if (json.success && json.data?.url) {
        setFormData((prev) => ({ ...prev, imageUrl: json.data.url }));
      }
    } catch {
      alert('Failed to upload category image');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('michaforge_admin_token') : null;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      const payload = {
        name: formData.name,
        description: formData.description,
        iconName: formData.iconName,
        imageUrl: formData.imageUrl,
        startingPrice: formData.startingPrice.trim() !== '' ? Number(formData.startingPrice) : null,
      };
      if (editingCategory) {
        await fetch(`/api/v1/categories/${editingCategory.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/v1/categories', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
      }
      setShowModal(false);
      loadCategories();
    } catch (e) {
      alert('Error saving category');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('michaforge_admin_token') : null;
    await fetch(`/api/v1/categories/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    loadCategories();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#073253]">Category Management</h1>
          <p className="text-xs text-[#667585] mt-1">
            Configure circular category cards, taglines, and public catalogue filters.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center space-x-2 bg-[#FF850D] hover:bg-[#E67300] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#DFE5EB] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading categories...</div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 uppercase tracking-wider font-semibold bg-gray-50/50">
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">Category Name</th>
                <th className="py-3 px-4">Tagline / Description</th>
                <th className="py-3 px-4">Icon Key</th>
                <th className="py-3 px-4">Starting Price ('From')</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((cat, index) => (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono font-bold text-gray-400">#{index + 1}</td>
                  <td className="py-3 px-4 font-bold text-[#073253]">{cat.name}</td>
                  <td className="py-3 px-4 text-gray-600">{cat.description}</td>
                  <td className="py-3 px-4 font-mono text-gray-500">{cat.iconName}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-[#FF850D] text-xs">
                        {cat.formattedFromPrice || (cat.effectiveFromPrice ? `From KSh ${cat.effectiveFromPrice.toLocaleString('en-KE')}` : '—')}
                      </span>
                      {cat.startingPrice && cat.startingPrice > 0 ? (
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 inline-block w-fit font-semibold">
                          Custom: KSh {cat.startingPrice.toLocaleString('en-KE')}
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-block w-fit font-medium">
                          Auto Min: {cat.computedFromPrice ? `KSh ${cat.computedFromPrice.toLocaleString('en-KE')}` : 'Live DB'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-[#073253]">
              {editingCategory ? 'Edit Category' : 'Create Category'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Drainage Pipes"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF850D]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Tagline / Description *</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Heavy Duty Waste Solutions"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF850D]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Icon Key</label>
                <select
                  value={formData.iconName}
                  onChange={(e) => setFormData({ ...formData, iconName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF850D]"
                >
                  <option value="pipe">Pipe</option>
                  <option value="fittings">Fittings</option>
                  <option value="tap">Tap / Faucet</option>
                  <option value="valve">Valve</option>
                  <option value="tank">Water Tank</option>
                  <option value="hardware">Hardware / Tool</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-gray-700">Starting Price / From (KSh)</label>
                  {editingCategory?.computedFromPrice && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, startingPrice: String(editingCategory.computedFromPrice) })}
                      className="text-[10px] text-[#073253] hover:text-[#FF850D] font-bold"
                    >
                      Use Real Min (KSh {editingCategory.computedFromPrice.toLocaleString('en-KE')})
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.startingPrice}
                    onChange={(e) => setFormData({ ...formData, startingPrice: e.target.value })}
                    placeholder={editingCategory?.computedFromPrice ? `Auto from live products (currently KSh ${editingCategory.computedFromPrice.toLocaleString('en-KE')})` : 'e.g. 850'}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF850D]"
                  />
                  {formData.startingPrice && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, startingPrice: '' })}
                      className="absolute right-2 top-2 text-[10px] text-gray-400 hover:text-red-500 font-bold px-1.5 py-0.5 bg-gray-100 rounded"
                    >
                      Clear (Auto)
                    </button>
                  )}
                </div>
                <p className="text-[10.5px] text-gray-500 mt-1">
                  Leave blank to automatically calculate and display the lowest price from your live products in this category in real time. Set a price to override with a custom starting offer.
                </p>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Category Image (Optional PNG / JPG Upload)
                </label>
                <div className="flex items-center gap-3 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                  {formData.imageUrl && (
                    <img
                      src={formData.imageUrl}
                      alt="Category preview"
                      className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                    />
                  )}
                  <label className="cursor-pointer inline-flex items-center space-x-1.5 bg-[#073253] hover:bg-[#FF850D] text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors">
                    <span>{uploadingImage ? 'Uploading...' : 'Upload PNG / JPG'}</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      className="hidden"
                      onChange={handleCategoryImageUpload}
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#073253] hover:bg-[#FF850D] text-white font-bold transition-colors"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
