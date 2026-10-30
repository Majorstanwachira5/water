'use client';

import React from 'react';
import { CheckCircle2, ShieldCheck, Truck, Headphones } from 'lucide-react';

export default function AboutSection() {
  return (
    <section id="about" className="py-16 bg-[#F5F7FA] border-t border-[#DFE5EB]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Image showcasing plumbing products */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden shadow-lg border-2 border-white">
              <img
                src="/images/flyer_upright.jpg"
                alt="Michaforge Enterprises Plumbing Catalogue"
                className="w-full h-auto object-cover max-h-[380px]"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#073253] to-transparent p-6 text-white">
                <span className="text-xs uppercase tracking-widest text-[#FF850D] font-bold">
                  Kenya's Trusted Supplier
                </span>
                <p className="text-sm font-semibold mt-1">
                  Genuine plumbing &amp; hardware materials since inception.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: About details */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <span className="text-xs font-bold text-[#FF850D] uppercase tracking-wider">
                About Our Business
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#073253] mt-1">
                Dealers in All Plumbing Materials &amp; Hardware
              </h2>
              <div className="w-16 h-1 bg-[#FF850D] mt-2 rounded-full" />
            </div>

            <p className="text-[#172B3A] text-base leading-relaxed">
              <strong>Michaforge Enterprises</strong> is your reliable plumbing partner in Kenya, supplying commercial builders, plumbing contractors, and residential owners with certified piping systems, durable fittings, brass valves, stylish faucets, and high-capacity water storage tanks.
            </p>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start space-x-3 bg-white p-4 rounded-xl border border-[#DFE5EB]">
                <ShieldCheck className="w-6 h-6 text-[#FF850D] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-[#073253]">Certified Quality</h4>
                  <p className="text-xs text-[#667585] mt-1">
                    Heavy-duty uPVC, PPR, brass valves, and high-pressure fittings built to last.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-white p-4 rounded-xl border border-[#DFE5EB]">
                <Truck className="w-6 h-6 text-[#0BAA58] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-[#073253]">Full Contractor Supply</h4>
                  <p className="text-xs text-[#667585] mt-1">
                    Complete project bills of quantities supplied promptly across Kenya.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-white p-4 rounded-xl border border-[#DFE5EB]">
                <Headphones className="w-6 h-6 text-[#073253] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-[#073253]">Direct Technical Advice</h4>
                  <p className="text-xs text-[#667585] mt-1">
                    Instant advice on pipe diameters, pressure ratings, and installation fittings.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-white p-4 rounded-xl border border-[#DFE5EB]">
                <CheckCircle2 className="w-6 h-6 text-[#FF850D] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-[#073253]">Transparent Pricing</h4>
                  <p className="text-xs text-[#667585] mt-1">
                    Direct quotations via call, SMS, or WhatsApp on 0714843208.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
