'use client';

import React, { useEffect, useState } from 'react';
import {
  Package,
  DollarSign,
  Inbox,
  FolderTree,
  AlertCircle,
  PlusCircle,
  Upload,
  ArrowRight,
  TrendingUp,
  Tag,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { DashboardMetrics, Enquiry } from '@michaforge/shared-contracts';

export default function AdminOverviewPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalProducts: 6,
    publishedProducts: 6,
    archivedProducts: 0,
    categoriesCount: 6,
    unpricedProductsCount: 6,
    recentPriceChangesCount: 0,
    newEnquiriesCount: 1,
    pendingEnquiriesCount: 1,
    totalEnquiries: 1,
  });

  const [recentEnquiries, setRecentEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch real metrics from reporting service
    fetch('/api/v1/admin/reports/overview')
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) setMetrics(json.data);
      })
      .catch(() => {});

    // Fetch recent enquiries
    fetch('/api/v1/admin/enquiries')
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) setRecentEnquiries(json.data.slice(0, 5));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#073253]">
            Operational Overview
          </h1>
          <p className="text-xs text-[#667585] mt-1">
            Real-time status of Michaforge Enterprises catalogue, pricing, and enquiries.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/admin/products"
            className="inline-flex items-center space-x-1.5 bg-[#FF850D] hover:bg-[#E67300] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Product</span>
          </a>
          <a
            href="/admin/pricing"
            className="inline-flex items-center space-x-1.5 bg-[#073253] hover:bg-[#0B3556] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            <DollarSign className="w-4 h-4 text-[#FF850D]" />
            <span>Update Prices</span>
          </a>
          <a
            href="/admin/media"
            className="inline-flex items-center space-x-1.5 bg-white border border-[#DFE5EB] text-[#172B3A] hover:bg-gray-50 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            <Upload className="w-4 h-4 text-[#073253]" />
            <span>Upload Images</span>
          </a>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Products */}
        <div className="bg-white p-5 rounded-2xl border border-[#DFE5EB] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#667585]">Total Products</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#073253] flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-[#073253]">{metrics.totalProducts}</h3>
            <span className="text-[11px] text-[#0BAA58] font-bold">
              {metrics.publishedProducts} Published
            </span>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white p-5 rounded-2xl border border-[#DFE5EB] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#667585]">Categories</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <FolderTree className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-[#073253]">{metrics.categoriesCount}</h3>
            <span className="text-[11px] text-gray-500">From Flyer &amp; Custom</span>
          </div>
        </div>

        {/* Unpriced Products Attention Badge */}
        <div className="bg-white p-5 rounded-2xl border border-[#DFE5EB] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#667585]">Pending Prices</span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF850D] flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-[#FF850D]">{metrics.unpricedProductsCount}</h3>
            <a href="/admin/pricing" className="text-[11px] text-[#FF850D] font-bold hover:underline">
              Enter prices now →
            </a>
          </div>
        </div>

        {/* New Enquiries */}
        <div className="bg-white p-5 rounded-2xl border border-[#DFE5EB] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#667585]">New Enquiries</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#0BAA58] flex items-center justify-center">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-[#0BAA58]">{metrics.newEnquiriesCount}</h3>
            <span className="text-[11px] text-gray-500">{metrics.totalEnquiries} total received</span>
          </div>
        </div>
      </div>

      {/* Action Banners & Price Management Alert */}
      {metrics.unpricedProductsCount > 0 && (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-[#FF850D] flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-[#073253]">
                {metrics.unpricedProductsCount} Products currently showing "Contact for Price"
              </h4>
              <p className="text-xs text-[#667585] mt-0.5">
                Per business policy, flyer prices are not hardcoded. Enter verified selling prices in the Dynamic Pricing Manager.
              </p>
            </div>
          </div>
          <a
            href="/admin/pricing"
            className="inline-flex items-center space-x-1.5 bg-[#FF850D] hover:bg-[#E67300] text-white px-4 py-2 rounded-xl text-xs font-bold flex-shrink-0 transition-colors"
          >
            <span>Open Price Manager</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Recent Enquiries Table */}
      <div className="bg-white rounded-2xl border border-[#DFE5EB] p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-[#073253]">
              Recent Customer Enquiries
            </h3>
            <p className="text-xs text-[#667585]">
              Enquiries submitted through website, WhatsApp, and call actions.
            </p>
          </div>
          <a
            href="/admin/enquiries"
            className="text-xs font-bold text-[#FF850D] hover:underline"
          >
            View All ({metrics.totalEnquiries})
          </a>
        </div>

        {recentEnquiries.length === 0 ? (
          <p className="text-xs text-gray-400 py-6 text-center">No enquiries yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500 uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Phone</th>
                  <th className="py-2.5 px-3">Product / Subject</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentEnquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-gray-50">
                    <td className="py-3 px-3 font-bold text-[#172B3A]">{enq.customerName}</td>
                    <td className="py-3 px-3 text-[#073253] font-semibold">{enq.phoneNumber}</td>
                    <td className="py-3 px-3 text-gray-600 truncate max-w-xs">{enq.productName || enq.message}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800">
                        {enq.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-400">{new Date(enq.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-3 text-right">
                      <a
                        href={`https://wa.me/${enq.phoneNumber.replace('+', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#0BAA58] hover:underline font-bold"
                      >
                        Reply on WhatsApp
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
