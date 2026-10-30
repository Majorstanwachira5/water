'use client';

import React, { useEffect, useState } from 'react';
import {
  DollarSign,
  Save,
  Download,
  Upload,
  History,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Tag,
  Sparkles,
} from 'lucide-react';
import { Product, ProductPrice, PriceHistoryEntry } from '@michaforge/shared-contracts';
import { formatCurrency } from '../../packages/shared-validation/src';

// Reference prices printed on the original flyer (for quick 1-click apply if desired)
const FLYER_REFERENCE_PRICES: Record<string, number> = {
  prd_pvc_4in: 650,
  prd_pipe_fittings_ast: 120,
  prd_bib_cock_tap: 1250,
  prd_brass_ball_valve: 850,
  prd_water_tank_1000l: 12500,
  prd_hardware_accessories: 250,
};

export default function AdminPricingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [prices, setPrices] = useState<Record<string, ProductPrice>>({});
  const [newPrices, setNewPrices] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<PriceHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, priceRes, histRes] = await Promise.all([
        fetch('/api/v1/products?limit=100'),
        fetch('/api/v1/pricing/products'),
        fetch('/api/v1/pricing/history'),
      ]);

      const [prodJson, priceJson, histJson] = await Promise.all([
        prodRes.json(),
        priceRes.json(),
        histRes.json(),
      ]);

      if (prodJson.success) setProducts(prodJson.data);
      if (priceJson.success) {
        const map: Record<string, ProductPrice> = {};
        const inputs: Record<string, string> = {};
        for (const item of priceJson.data) {
          map[item.productId] = item;
          if (item.price !== null && item.price !== undefined) {
            inputs[item.productId] = String(item.price);
          }
        }
        setPrices(map);
        setNewPrices(inputs);
      }
      if (histJson.success) setHistory(histJson.data);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'Failed to load pricing data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSavePrice = async (productId: string) => {
    const rawVal = newPrices[productId];
    const parsedPrice = rawVal === '' || rawVal === undefined ? null : Number(rawVal);

    if (parsedPrice !== null && (isNaN(parsedPrice) || parsedPrice < 0)) {
      setStatusMessage({ type: 'error', text: 'Price must be a valid positive number.' });
      return;
    }

    setSavingId(productId);
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/v1/pricing/products/${productId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price: parsedPrice,
          updatedBy: 'Store Administrator',
          reason: 'Price updated via Dynamic Pricing Manager',
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setPrices((prev) => ({ ...prev, [productId]: json.data }));
        setStatusMessage({
          type: 'success',
          text: `Price for product successfully updated. It is now live on the public catalogue!`,
        });
      } else {
        setStatusMessage({ type: 'error', text: json.error?.message || 'Failed to save price.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'Network error saving price.' });
    } finally {
      setSavingId(null);
    }
  };

  const handleApplyFlyerPrices = async () => {
    if (!confirm('Apply all 6 reference prices from the printed Michaforge flyer? This will update the public website.')) return;
    setStatusMessage(null);
    setLoading(true);

    const updates = Object.entries(FLYER_REFERENCE_PRICES).map(([productId, price]) => ({
      productId,
      price,
      reason: 'Synchronized with printed Michaforge Enterprises flyer reference',
    }));

    try {
      const res = await fetch('/api/v1/pricing/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates, updatedBy: 'Flyer Sync Wizard' }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setStatusMessage({
          type: 'success',
          text: `Successfully applied ${json.data.updatedCount} prices from the flyer! Public catalogue is now fully priced.`,
        });
        loadData();
      }
    } catch (e) {
      setStatusMessage({ type: 'error', text: 'Failed to apply flyer prices.' });
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#073253]">
            Dynamic Price Management
          </h1>
          <p className="text-xs text-[#667585] mt-1">
            Independently manage selling prices in KES. Prices update the public catalogue immediately.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Apply Flyer Prices Button */}
          <button
            onClick={handleApplyFlyerPrices}
            className="inline-flex items-center space-x-1.5 bg-[#FF850D] hover:bg-[#E67300] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>Apply Flyer Reference Prices</span>
          </button>

          <a
            href="/api/v1/pricing/export"
            download="michaforge_pricing.csv"
            className="inline-flex items-center space-x-1.5 bg-white border border-[#DFE5EB] text-[#172B3A] hover:bg-gray-50 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 text-[#073253]" />
            <span>Export CSV</span>
          </a>

          <button
            onClick={() => setShowHistoryModal(true)}
            className="inline-flex items-center space-x-1.5 bg-[#073253] hover:bg-[#0B3556] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            <History className="w-4 h-4 text-[#FF850D]" />
            <span>Audit History</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl flex items-start space-x-3 text-xs font-medium ${
            statusMessage.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Pricing Table */}
      <div className="bg-white rounded-2xl border border-[#DFE5EB] shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <span className="text-xs font-bold text-[#073253]">
            Product Catalogue Pricing ({products.length} Products)
          </span>
          <span className="text-[11px] text-gray-500">
            Empty price = Displays "Contact for Price"
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading pricing records...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500 uppercase tracking-wider font-semibold bg-gray-50/50">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Current Price</th>
                  <th className="py-3 px-4">Unit of Sale</th>
                  <th className="py-3 px-4">New Price (KES)</th>
                  <th className="py-3 px-4">Last Updated</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((prod) => {
                  const prc = prices[prod.id];
                  const hasPrice = prc && prc.price !== null && prc.price !== undefined && prc.price > 0;
                  const flyerRef = FLYER_REFERENCE_PRICES[prod.id];

                  return (
                    <tr key={prod.id} className="hover:bg-gray-50/80 transition-colors">
                      {/* Product Name & thumbnail */}
                      <td className="py-3.5 px-4 font-bold text-[#073253]">
                        <div className="flex items-center space-x-2.5">
                          <img
                            src={prod.images?.[0]?.url || '/images/products/product_pvc_pipes.png'}
                            alt=""
                            className="w-8 h-8 rounded object-contain bg-gray-100 p-0.5"
                          />
                          <span>{prod.name}</span>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="py-3.5 px-4 font-mono text-gray-600 font-semibold">
                        {prod.sku}
                      </td>

                      {/* Current Displayed Price */}
                      <td className="py-3.5 px-4 font-extrabold text-[#172B3A]">
                        {hasPrice ? (
                          <span className="text-[#0BAA58]">{formatCurrency(prc.price, 'KES')}</span>
                        ) : (
                          <span className="text-[#FF850D] bg-orange-50 px-2 py-0.5 rounded text-[11px] font-bold">
                            Contact for Price
                          </span>
                        )}
                      </td>

                      {/* Unit */}
                      <td className="py-3.5 px-4 text-gray-500 font-medium">{prod.unit}</td>

                      {/* Input for New Price */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            placeholder="e.g. 650"
                            value={newPrices[prod.id] || ''}
                            onChange={(e) =>
                              setNewPrices({ ...newPrices, [prod.id]: e.target.value })
                            }
                            className="w-28 px-3 py-1.5 rounded-lg border border-[#DFE5EB] text-xs font-bold text-[#073253] focus:outline-none focus:ring-2 focus:ring-[#FF850D]"
                          />
                          {flyerRef && (
                            <button
                              type="button"
                              onClick={() => setNewPrices({ ...newPrices, [prod.id]: String(flyerRef) })}
                              className="text-[10px] text-gray-400 hover:text-[#FF850D] underline"
                              title={`Flyer says: KSh ${flyerRef}`}
                            >
                              (Ref: {flyerRef})
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Last Updated */}
                      <td className="py-3.5 px-4 text-[11px] text-gray-400">
                        {prc ? `${new Date(prc.updatedAt).toLocaleDateString()} (${prc.updatedBy})` : 'Never'}
                      </td>

                      {/* Save button */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleSavePrice(prod.id)}
                          disabled={savingId === prod.id}
                          className="inline-flex items-center space-x-1.5 bg-[#073253] hover:bg-[#FF850D] text-white px-3 py-1.5 rounded-lg font-bold text-xs transition-colors shadow-sm disabled:opacity-50"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{savingId === prod.id ? 'Saving...' : 'Save'}</span>
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

      {/* Price Audit History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-extrabold text-[#073253]">
                Price Change Audit Log
              </h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {history.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-8">No price changes recorded yet.</p>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b text-gray-400 uppercase text-[10px]">
                      <th className="py-2">Date &amp; Time</th>
                      <th className="py-2">Product ID</th>
                      <th className="py-2">Old Price</th>
                      <th className="py-2">New Price</th>
                      <th className="py-2">Changed By</th>
                      <th className="py-2">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {history.map((h) => (
                      <tr key={h.id}>
                        <td className="py-2 text-gray-400">{new Date(h.timestamp).toLocaleString()}</td>
                        <td className="py-2 font-mono">{h.productId}</td>
                        <td className="py-2 text-gray-400">{h.previousPrice ? `KSh ${h.previousPrice}` : 'None'}</td>
                        <td className="py-2 font-bold text-[#0BAA58]">{h.newPrice ? `KSh ${h.newPrice}` : 'None'}</td>
                        <td className="py-2 font-semibold text-[#073253]">{h.changedBy}</td>
                        <td className="py-2 text-gray-500">{h.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
