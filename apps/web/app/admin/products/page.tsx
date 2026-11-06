'use client';

import React, { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Star,
  Upload,
  CheckCircle2,
  Image as ImageIcon,
} from 'lucide-react';
import { Product, Category, MediaAsset, ProductPrice } from '@michaforge/shared-contracts';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [pricesMap, setPricesMap] = useState<Record<string, number | null>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [mediaLibrary, setMediaLibrary] = useState<MediaAsset[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    categoryId: 'cat_sanitary_ware',
    unit: 'each',
    price: '',
    description: '',
    shortDescription: '',
    imageUrl: '',
    isFeatured: true,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, priceRes, mediaRes] = await Promise.all([
        fetch('/api/v1/products?limit=200'),
        fetch('/api/v1/categories'),
        fetch('/api/v1/pricing/products'),
        fetch('/api/v1/media/library'),
      ]);
      const [prodJson, catJson, priceJson, mediaJson] = await Promise.all([
        prodRes.json(),
        catRes.json(),
        priceRes.json(),
        mediaRes.json(),
      ]);
      if (prodJson.success) setProducts(prodJson.data);
      if (catJson.success) setCategories(catJson.data);
      if (priceJson.success && Array.isArray(priceJson.data)) {
        const map: Record<string, number | null> = {};
        priceJson.data.forEach((p: ProductPrice) => {
          map[p.productId] = p.price;
        });
        setPricesMap(map);
      }
      if (mediaJson.success) setMediaLibrary(mediaJson.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setUploadNotice(null);
    setFormData({
      name: '',
      sku: `MF-${Date.now().toString().slice(-4)}`,
      categoryId: categories[0]?.id || 'cat_sanitary_ware',
      unit: 'each',
      price: '',
      description: '',
      shortDescription: '',
      imageUrl: '/images/products/product_synnova_urinal.png',
      isFeatured: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setUploadNotice(null);
    const existingPrice = pricesMap[p.id];
    setFormData({
      name: p.name,
      sku: p.sku,
      categoryId: p.categoryId,
      unit: p.unit,
      price: existingPrice !== null && existingPrice !== undefined ? String(existingPrice) : '',
      description: p.description || '',
      shortDescription: p.shortDescription || '',
      imageUrl: p.images?.[0]?.url || '/images/products/product_pvc_pipes.png',
      isFeatured: p.isFeatured,
    });
    setShowModal(true);
  };

  // Direct PNG / JPG File Upload from Admin's device
  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setUploadNotice(null);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('michaforge_admin_token') : null;
      const fd = new FormData();
      fd.append('file', file);
      fd.append('category', 'product');
      fd.append('altText', formData.name || file.name.replace(/\.[^.]+$/, ''));

      const res = await fetch('/api/v1/media/uploads', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      const json = await res.json();
      if (res.ok && json.success && json.data?.url) {
        setFormData((prev) => ({ ...prev, imageUrl: json.data.url }));
        setMediaLibrary((prev) => [json.data, ...prev]);
        setUploadNotice(`Uploaded "${file.name}" (${(file.size / 1024).toFixed(1)} KB)`);
      } else {
        alert(json.error?.message || 'Failed to upload image. Please select a PNG or JPG file.');
      }
    } catch {
      alert('Network error while uploading image.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProduct(true);

    const token = typeof window !== 'undefined' ? localStorage.getItem('michaforge_admin_token') : null;
    const authHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const payload = {
      name: formData.name,
      sku: formData.sku,
      categoryId: formData.categoryId,
      unit: formData.unit,
      description: formData.description,
      shortDescription: formData.shortDescription,
      isFeatured: formData.isFeatured,
      images: formData.imageUrl
        ? [
            {
              id: `img_${Date.now()}`,
              url: formData.imageUrl,
              altText: formData.name,
              displayOrder: 1,
              isPrimary: true,
            },
          ]
        : [],
    };

    try {
      let savedProductId = editingProduct?.id || '';
      if (editingProduct) {
        const res = await fetch(`/api/v1/products/${editingProduct.id}`, {
          method: 'PATCH',
          headers: authHeaders,
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (json.success && json.data?.id) savedProductId = json.data.id;
      } else {
        const res = await fetch('/api/v1/products', {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (json.success && json.data?.id) savedProductId = json.data.id;
      }

      // If admin entered a price, update pricing in Supabase as well
      if (savedProductId && formData.price.trim() !== '') {
        const numericPrice = Number(formData.price);
        if (!isNaN(numericPrice) && numericPrice >= 0) {
          await fetch(`/api/v1/pricing/products/${savedProductId}`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
              price: numericPrice > 0 ? numericPrice : null,
              unit: formData.unit,
              updatedBy: 'Administrator',
              reason: 'Updated via Product Management',
            }),
          });
        }
      }

      await fetch('/api/v1/gateway/invalidate-cache', { method: 'POST', headers: authHeaders }).catch(() => {});
      setShowModal(false);
      await loadData();
    } catch {
      alert('Error saving product');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm('Are you sure you want to archive this product?')) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('michaforge_admin_token') : null;
    await fetch(`/api/v1/products/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    loadData();
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#073253]">Product Management</h1>
          <p className="text-xs text-[#667585] mt-1">
            Upload PNG/JPG product photos, set prices, and manage live catalogue visibility.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center space-x-2 bg-[#FF850D] hover:bg-[#E67300] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl border border-[#DFE5EB] p-4 flex items-center justify-between shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#DFE5EB] text-xs text-[#172B3A] focus:outline-none focus:ring-2 focus:ring-[#FF850D]"
          />
        </div>
        <div className="text-xs text-gray-400">Total: {filtered.length} products</div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-[#DFE5EB] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading products...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500 uppercase tracking-wider font-semibold bg-gray-50/50">
                  <th className="py-3 px-4">Item &amp; Photo</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price (KES)</th>
                  <th className="py-3 px-4">Unit</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Featured</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((prod) => {
                  const prc = pricesMap[prod.id];
                  return (
                    <tr key={prod.id} className="hover:bg-gray-50">
                      <td className="py-2.5 px-4 font-bold text-[#073253]">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 bg-white flex-shrink-0">
                            <img
                              src={prod.images?.[0]?.url || '/images/products/product_pvc_pipes.png'}
                              alt={prod.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-bold text-sm">{prod.name}</div>
                            <div className="text-[11px] text-gray-400 font-normal line-clamp-1">
                              {prod.shortDescription}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-gray-600">{prod.sku}</td>
                      <td className="py-3 px-4 text-gray-600 font-medium">{prod.category?.name || 'General'}</td>
                      <td className="py-3 px-4 font-black text-[#FF850D]">
                        {prc && prc > 0 ? `KSh ${prc.toLocaleString()}` : 'Contact for Price'}
                      </td>
                      <td className="py-3 px-4 text-gray-500">{prod.unit}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            prod.status === 'published'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {prod.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {prod.isFeatured ? (
                          <span className="flex items-center space-x-1 text-[#FF850D] font-bold">
                            <Star className="w-3.5 h-3.5 fill-[#FF850D]" />
                            <span>Yes</span>
                          </span>
                        ) : (
                          <span className="text-gray-400">No</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(prod)}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit product & upload image"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleArchive(prod.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                          title="Archive product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal with Direct PNG/JPG Upload */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto">
            <h3 className="text-lg font-black text-[#073253] mb-4">
              {editingProduct ? 'Edit Product & Image' : 'Add New Plumbing Product'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              {/* Direct PNG / JPG Upload Box */}
              <div className="p-4 rounded-2xl bg-[#F5F7FA] border border-[#DFE5EB] space-y-3">
                <label className="block font-extrabold text-[#073253] text-xs uppercase tracking-wider">
                  Product Photograph (PNG / JPG Upload) *
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Crisp Zero-Padding Preview */}
                  <div className="w-32 h-28 rounded-xl overflow-hidden border-2 border-[#073253]/20 bg-white flex-shrink-0 shadow-sm">
                    <img
                      src={formData.imageUrl || '/images/products/product_pvc_pipes.png'}
                      alt="Product preview"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-2 w-full">
                    <label className="w-full inline-flex items-center justify-center space-x-2 bg-[#FF850D] hover:bg-[#E67300] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer">
                      <Upload className="w-4 h-4" />
                      <span>
                        {uploadingImage ? 'Uploading PNG/JPG...' : 'Choose PNG or JPG Image to Upload'}
                      </span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        onChange={handleImageFileUpload}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                    </label>

                    <p className="text-[11px] text-[#667585]">
                      Supports high-clarity `.png`, `.jpg`, `.jpeg`, and `.webp` files. Immediately visible on the client catalogue.
                    </p>

                    {uploadNotice && (
                      <div className="flex items-center space-x-1.5 text-green-700 font-bold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                        <span>{uploadNotice}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick selector from existing uploaded Media Library images */}
                {mediaLibrary.length > 0 && (
                  <div className="pt-2 border-t border-gray-200/80">
                    <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      Or select from uploaded library images:
                    </span>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {mediaLibrary.slice(0, 10).map((asset) => (
                        <button
                          key={asset.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, imageUrl: asset.url })}
                          className={`w-12 h-12 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                            formData.imageUrl === asset.url
                              ? 'border-[#FF850D] ring-2 ring-[#FF850D]/30'
                              : 'border-gray-200 hover:border-gray-400'
                          }`}
                          title={asset.altText}
                        >
                          <img src={asset.url} alt={asset.altText} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. PPR Pipes 25mm"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF850D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">SKU *</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF850D]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category *</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF850D]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Selling Price (KES)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 650 (or leave blank)"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF850D]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Unit of Sale *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. per 6 m length, each, per piece"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF850D]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Short Description</label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="One sentence summary for catalog cards"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF850D]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Material specs, pressure rating, recommended applications..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF850D]"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="featuredToggle"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4 text-[#FF850D] rounded border-gray-300 focus:ring-[#FF850D]"
                />
                <label htmlFor="featuredToggle" className="font-bold text-gray-800">
                  Show in Homepage Featured Products Grid
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProduct || uploadingImage}
                  className="px-5 py-2 rounded-xl bg-[#073253] hover:bg-[#FF850D] text-white font-bold transition-colors disabled:opacity-50"
                >
                  {savingProduct
                    ? 'Saving...'
                    : editingProduct
                    ? 'Update Product'
                    : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
