'use client';

import React, { useEffect, useState } from 'react';
import { Upload, Trash2, Search, CheckCircle2, Package } from 'lucide-react';
import { MediaAsset, Product } from '@michaforge/shared-contracts';

export default function AdminMediaPage() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'product' | 'brand' | 'banner'>('all');
  const [search, setSearch] = useState('');
  const [assigningAsset, setAssigningAsset] = useState<MediaAsset | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string>('');

  const loadMedia = async () => {
    setLoading(true);
    try {
      const [mediaRes, prodRes] = await Promise.all([
        fetch('/api/v1/media/library'),
        fetch('/api/v1/products?limit=200'),
      ]);
      const [mediaJson, prodJson] = await Promise.all([mediaRes.json(), prodRes.json()]);
      if (mediaJson.success) setAssets(mediaJson.data);
      if (prodJson.success) {
        setProducts(prodJson.data);
        if (prodJson.data.length > 0 && !selectedProductId) {
          setSelectedProductId(prodJson.data[0].id);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setStatusMessage(null);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', filter === 'all' ? 'product' : filter);
    formData.append('altText', file.name.replace(/\.[^.]+$/, ''));

    try {
      const res = await fetch('/api/v1/media/uploads', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setStatusMessage(`Uploaded "${file.name}" successfully! You can assign it to any product below.`);
        await loadMedia();
      } else {
        alert(json.error?.message || 'Upload failed');
      }
    } catch {
      alert('Network upload error');
    } finally {
      setUploading(false);
    }
  };

  const handleAssignToProduct = async () => {
    if (!assigningAsset || !selectedProductId) return;
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;

    try {
      const res = await fetch(`/api/v1/products/${selectedProductId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: [
            {
              id: assigningAsset.id,
              url: assigningAsset.url,
              altText: prod.name,
              displayOrder: 1,
              isPrimary: true,
            },
          ],
        }),
      });
      if (res.ok) {
        await fetch('/api/v1/gateway/invalidate-cache', { method: 'POST' }).catch(() => {});
        setStatusMessage(`Assigned "${assigningAsset.altText}" to product "${prod.name}" — now live on the client frontend!`);
        setAssigningAsset(null);
      }
    } catch {
      alert('Failed to assign image to product.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media asset?')) return;
    await fetch(`/api/v1/media/${id}`, { method: 'DELETE' });
    loadMedia();
  };

  const filtered = assets.filter((a) => {
    if (filter !== 'all' && a.category !== filter) return false;
    if (
      search &&
      !a.altText.toLowerCase().includes(search.toLowerCase()) &&
      !a.fileName.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#073253]">Media Library (PNG / JPG Upload)</h1>
          <p className="text-xs text-[#667585] mt-1">
            Upload crisp PNG or JPG product photographs and assign them directly to live catalogue items.
          </p>
        </div>

        {/* Upload Button */}
        <label className="inline-flex items-center space-x-2 bg-[#FF850D] hover:bg-[#E67300] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer">
          <Upload className="w-4 h-4" />
          <span>{uploading ? 'Uploading PNG/JPG...' : 'Upload PNG / JPG Image'}</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 flex items-center space-x-2 text-green-800 text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl border border-[#DFE5EB] p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center space-x-2">
          {(['all', 'product', 'brand', 'banner'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                filter === cat
                  ? 'bg-[#073253] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search media..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[#DFE5EB] text-xs focus:outline-none focus:ring-1 focus:ring-[#FF850D]"
          />
        </div>
      </div>

      {/* Media Grid — Crisp, Edge-to-Edge Images with Zero Excess Padding */}
      <div className="bg-white rounded-2xl border border-[#DFE5EB] p-4 shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-xs text-gray-400">Loading media assets...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-xs text-gray-400">No media assets found.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filtered.map((asset) => (
              <div
                key={asset.id}
                className="group relative border border-gray-200 rounded-xl overflow-hidden bg-white flex flex-col justify-between shadow-sm hover:border-[#FF850D] transition-all"
              >
                <div className="w-full h-36 bg-white overflow-hidden">
                  <img
                    src={asset.url}
                    alt={asset.altText}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <div className="p-2 bg-gray-50 border-t border-gray-100 text-[11px] space-y-1.5">
                  <div>
                    <p className="font-bold text-gray-800 truncate" title={asset.altText}>
                      {asset.altText || asset.fileName}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {(asset.sizeBytes / 1024).toFixed(1)} KB • {asset.category}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAssigningAsset(asset)}
                    className="w-full inline-flex items-center justify-center space-x-1 bg-[#073253] hover:bg-[#FF850D] text-white text-[10px] font-bold py-1.5 px-2 rounded-lg transition-colors"
                  >
                    <Package className="w-3 h-3" />
                    <span>Use on Product</span>
                  </button>
                </div>

                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDelete(asset.id)}
                    className="p-1.5 bg-white/95 hover:bg-red-50 text-red-500 rounded-lg shadow"
                    title="Delete asset"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assign Uploaded Image to Product Modal */}
      {assigningAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-[#073253]">
              Assign Image to Product
            </h3>
            <div className="w-full h-44 rounded-xl overflow-hidden border border-gray-200">
              <img
                src={assigningAsset.url}
                alt={assigningAsset.altText}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Select Product to Update:
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-[#073253]"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-end space-x-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setAssigningAsset(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssignToProduct}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FF850D] hover:bg-[#E67300] text-white"
              >
                Save to Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
