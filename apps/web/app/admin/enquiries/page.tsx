'use client';

import React, { useEffect, useState } from 'react';
import {
  Inbox,
  Phone,
  MessageCircle,
  Clock,
  CheckCircle,
  FileText,
  User,
  Filter,
} from 'lucide-react';
import { Enquiry, EnquiryStatus } from '@michaforge/shared-contracts';

const STATUS_COLORS: Record<EnquiryStatus, string> = {
  New: 'bg-blue-100 text-blue-800 border-blue-200',
  Contacted: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Quoted: 'bg-purple-100 text-purple-800 border-purple-200',
  'Awaiting Customer': 'bg-orange-100 text-orange-800 border-orange-200',
  Completed: 'bg-green-100 text-green-800 border-green-200',
  Closed: 'bg-gray-100 text-gray-700 border-gray-200',
};

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [activeEnquiry, setActiveEnquiry] = useState<Enquiry | null>(null);
  const [noteContent, setNoteContent] = useState('');

  const loadEnquiries = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/enquiries');
      const json = await res.json();
      if (json.success) setEnquiries(json.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnquiries();
  }, []);

  const handleUpdateStatus = async (enquiryId: string, status: EnquiryStatus) => {
    try {
      await fetch(`/api/v1/admin/enquiries/${enquiryId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      loadEnquiries();
      if (activeEnquiry?.id === enquiryId) {
        setActiveEnquiry({ ...activeEnquiry, status });
      }
    } catch (e) {
      alert('Failed to update status');
    }
  };

  const handleAddNote = async (enquiryId: string) => {
    if (!noteContent.trim()) return;
    try {
      await fetch(`/api/v1/admin/enquiries/${enquiryId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorName: 'Sales Desk', content: noteContent.trim() }),
      });
      setNoteContent('');
      loadEnquiries();
      // Reload active
      const refreshed = await fetch(`/api/v1/admin/enquiries/${enquiryId}`).then((r) => r.json());
      if (refreshed.success) setActiveEnquiry(refreshed.data);
    } catch (e) {
      alert('Failed to add note');
    }
  };

  const filtered = enquiries.filter(
    (e) => selectedStatus === 'all' || e.status === selectedStatus
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#073253]">Customer Enquiries</h1>
          <p className="text-xs text-[#667585] mt-1">
            Track inquiries, quotations, follow-ups and respond directly on WhatsApp.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-white border border-[#DFE5EB] text-xs font-bold rounded-xl px-3 py-2 text-[#073253] focus:outline-none focus:ring-2 focus:ring-[#FF850D]"
          >
            <option value="all">All Enquiries ({enquiries.length})</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Quoted">Quoted</option>
            <option value="Awaiting Customer">Awaiting Customer</option>
            <option value="Completed">Completed</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Enquiries List */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#DFE5EB] shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-gray-400">Loading inbox...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-xs text-gray-400">No enquiries in this status.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filtered.map((enq) => {
                const waNumber = enq.phoneNumber.replace(/[^0-9]/g, '');
                const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(
                  `Hello ${enq.customerName}, this is Michaforge Enterprises regarding your enquiry for ${
                    enq.productName || 'plumbing materials'
                  }. How may we assist with your quotation?`
                )}`;

                return (
                  <div
                    key={enq.id}
                    onClick={() => setActiveEnquiry(enq)}
                    className={`p-4 hover:bg-gray-50/80 cursor-pointer transition-colors ${
                      activeEnquiry?.id === enq.id ? 'bg-orange-50/40 border-l-4 border-l-[#FF850D]' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-extrabold text-sm text-[#073253]">
                        {enq.customerName}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          STATUS_COLORS[enq.status]
                        }`}
                      >
                        {enq.status}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">{enq.message}</p>

                    <div className="flex items-center justify-between text-[11px] text-gray-400">
                      <div className="flex items-center space-x-3">
                        <span className="font-semibold text-gray-700">{enq.phoneNumber}</span>
                        {enq.productName && (
                          <span className="text-[#FF850D] font-bold truncate max-w-[150px]">
                            • {enq.productName}
                          </span>
                        )}
                      </div>
                      <span>{new Date(enq.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* Quick Action buttons */}
                    <div className="flex items-center space-x-2 mt-3 pt-2 border-t border-gray-100">
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center space-x-1 text-[11px] font-bold text-[#0BAA58] bg-green-50 px-2.5 py-1 rounded-lg hover:bg-green-100"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-[#0BAA58]" />
                        <span>WhatsApp Reply</span>
                      </a>
                      <a
                        href={`tel:${enq.phoneNumber}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center space-x-1 text-[11px] font-bold text-[#073253] bg-gray-100 px-2.5 py-1 rounded-lg hover:bg-gray-200"
                      >
                        <Phone className="w-3 h-3 text-[#FF850D]" />
                        <span>Call</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Detail & Notes Sidebar */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#DFE5EB] p-5 shadow-sm space-y-5">
          {activeEnquiry ? (
            <>
              <div className="border-b border-gray-100 pb-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-[#073253]">
                    {activeEnquiry.customerName}
                  </h3>
                  <select
                    value={activeEnquiry.status}
                    onChange={(e) => handleUpdateStatus(activeEnquiry.id, e.target.value as any)}
                    className="text-xs font-bold rounded-lg border border-gray-300 px-2 py-1 bg-white focus:outline-none"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Quoted">Quoted</option>
                    <option value="Awaiting Customer">Awaiting Customer</option>
                    <option value="Completed">Completed</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                <p className="text-xs text-gray-500 mt-1">{activeEnquiry.phoneNumber}</p>
                {activeEnquiry.email && (
                  <p className="text-xs text-gray-400">{activeEnquiry.email}</p>
                )}
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Customer Message:
                </span>
                <p className="text-xs text-[#172B3A] mt-1 p-3 bg-gray-50 rounded-xl leading-relaxed">
                  {activeEnquiry.message}
                </p>
              </div>

              {/* Internal Notes */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Staff Notes ({activeEnquiry.notes?.length || 0})
                </span>
                <div className="space-y-2 mt-2 max-h-40 overflow-y-auto">
                  {activeEnquiry.notes && activeEnquiry.notes.length > 0 ? (
                    activeEnquiry.notes.map((n) => (
                      <div key={n.id} className="text-xs bg-[#F5F7FA] p-2.5 rounded-lg border border-gray-100">
                        <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                          <span className="font-bold text-[#073253]">{n.authorName}</span>
                          <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-gray-700">{n.content}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 italic">No staff notes yet.</p>
                  )}
                </div>

                <div className="flex gap-2 mt-3">
                  <input
                    type="text"
                    placeholder="Add an internal follow-up note..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#FF850D]"
                  />
                  <button
                    onClick={() => handleAddNote(activeEnquiry.id)}
                    className="bg-[#073253] hover:bg-[#FF850D] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                  >
                    Post Note
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-400 text-xs">
              Select an enquiry from the left to view customer communication and notes.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
