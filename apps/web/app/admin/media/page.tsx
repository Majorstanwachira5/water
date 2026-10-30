'use client';

import React, { useEffect, useState } from 'react';
import { Upload, Image as ImageIcon, Trash2, Edit2, Check, Search } from 'lucide-react';
import { MediaAsset } from '@michaforge/shared-contracts';

export default function AdminMediaPage() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'product' | 'brand' | 'banner'>('all');
  const [search, setSearch] = useState('');

  const loadMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/media/library');
      const json = await res.json();
      if (json.success) setAssets(json.data);
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
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', 'product');
    formData.append('altText', file.name.split('.')[0]);

    try {
      const res = await fetch('/api/v1/media/uploads', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      if (res.ok && json.success) {
        loadMedia();
      } else {
        alert(json.error?.message || 'Upload failed');
      }
    } catch (e) {
      alert('Network upload error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media asset?')) return;
    await fetch(`/api/v1/media/${id}`, { method: 'DELETE' });
    loadMedia();
  };

  const filtered = assets.filter((a) => {
    if (filter !== 'all' && a.category !== filter) return false;
    if (search && !a.altText.toLowerCase().includes(search.toLowerCase()) && !a.fileName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#073253]">Media Library</h1>
          <p className="text-xs text-[#667585] mt-1">
            Store and manage flyer photographs, catalogue item images, and brand artwork.
          </p>
        </div>

        {/* Upload Button */}
        <label className="inline-flex items-center space-x-2 bg-[#FF850D] hover:bg-[#E67300] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer">
          <Upload className="w-4 h-4" />
          <span>{uploading ? 'Uploading...' : 'Upload New Image'}</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

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

      {/* Media Grid */}
      <div className="bg-white rounded-2xl border border-[#DFE5EB] p-6 shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-xs text-gray-400">Loading media assets...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-xs text-gray-400">No media assets found.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filtered.map((asset) => (
              <div
                key={asset.id}
                className="group relative border border-gray-200 rounded-xl overflow-hidden bg-gray-50 flex flex-col justify-between"
              >
                <div className="h-32 flex items-center justify-center p-2 bg-white">
                  <img
                    src={asset.url}
                    alt={asset.altText}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="p-2.5 bg-gray-50 border-t border-gray-100 text-[11px]">
                  <p className="font-semibold text-gray-800 truncate" title={asset.altText}>
                    {asset.altText || asset.fileName}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {(asset.sizeBytes / 1024).toFixed(1)} KB • {asset.category}
                  </p>
                </div>

                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDelete(asset.id)}
                    className="p-1.5 bg-white/90 hover:bg-red-50 text-red-500 rounded-lg shadow"
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
    </div>
  );
}
