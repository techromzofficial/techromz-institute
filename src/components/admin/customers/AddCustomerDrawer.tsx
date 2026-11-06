"use client";

import React, { useState } from "react";
import { X, Plus, UserCheck } from "lucide-react";
import { CustomerType, CustomerVerificationStatus, CustomerLoyaltyTier } from "@/types/customer";


interface AddCustomerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (name: string) => void;
}

export function AddCustomerDrawer({
  isOpen,
  onClose,
  onSuccess,
}: AddCustomerDrawerProps) {
  const [name, setName] = useState("Kavindu Fernando");
  const [email, setEmail] = useState("kavindu.f@mail.lk");
  const [phone, setPhone] = useState("+94 77 890 1234");
  const [customerType, setCustomerType] = useState<CustomerType>("Individual");
  const [region, setRegion] = useState("Western Province, Sri Lanka");
  const [preferredChannel, setPreferredChannel] = useState<"Mobile App" | "Website" | "B2B Portal">("Mobile App");
  const [verificationStatus, setVerificationStatus] = useState<CustomerVerificationStatus>("Verified");
  const [loyaltyTier, setLoyaltyTier] = useState<CustomerLoyaltyTier>("Gold");
  const [owner, setOwner] = useState("Rachel Dias");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess(name);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg h-full shadow-2xl border-l border-line flex flex-col justify-between">
        <div className="p-4 border-b border-line flex items-center justify-between bg-slate-50">
          <div>
            <span className="text-[10px] font-bold text-[#671021] uppercase tracking-wider">
              Customer Operations Management
            </span>
            <h2 className="text-base font-extrabold text-ink">Add New Customer Record</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded text-slate-500">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex-1 overflow-y-auto space-y-4 text-[12px]">
          <div>
            <label className="block font-bold text-ink mb-1">Customer Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-9 px-3 rounded border border-line text-[12px] font-medium text-ink focus:outline-none focus:border-[#671021]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-ink mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-9 px-3 rounded border border-line text-[12px] font-mono text-ink focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-ink mb-1">Phone Number *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-9 px-3 rounded border border-line text-[12px] font-mono text-ink focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-ink mb-1">Customer Type *</label>
              <select
                value={customerType}
                onChange={(e) => setCustomerType(e.target.value as CustomerType)}
                className="w-full h-9 px-3 rounded border border-line text-[12px] font-semibold text-ink focus:outline-none"
              >
                <option value="Individual">Individual</option>
                <option value="Business">Business</option>
                <option value="VIP">VIP</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-ink mb-1">Preferred Channel *</label>
              <select
                value={preferredChannel}
                onChange={(e) => setPreferredChannel(e.target.value as any)}
                className="w-full h-9 px-3 rounded border border-line text-[12px] font-semibold text-ink focus:outline-none"
              >
                <option value="Mobile App">Mobile App</option>
                <option value="Website">Website</option>
                <option value="B2B Portal">B2B Portal</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-ink mb-1">Region</label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full h-9 px-3 rounded border border-line text-[12px] font-medium text-ink focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-ink mb-1">Verification Status *</label>
              <select
                value={verificationStatus}
                onChange={(e) => setVerificationStatus(e.target.value as CustomerVerificationStatus)}
                className="w-full h-9 px-3 rounded border border-line text-[12px] font-semibold text-ink focus:outline-none"
              >
                <option value="Verified">Verified</option>
                <option value="Verification Pending">Verification Pending</option>
                <option value="Unverified">Unverified</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-ink mb-1">Loyalty Tier *</label>
              <select
                value={loyaltyTier}
                onChange={(e) => setLoyaltyTier(e.target.value as CustomerLoyaltyTier)}
                className="w-full h-9 px-3 rounded border border-line text-[12px] font-semibold text-ink focus:outline-none"
              >
                <option value="Gold">Gold</option>
                <option value="Platinum">Platinum</option>
                <option value="Silver">Silver</option>
                <option value="Bronze">Bronze</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-ink mb-1">Assigned Owner *</label>
              <select
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                className="w-full h-9 px-3 rounded border border-line text-[12px] font-semibold text-ink focus:outline-none"
              >
                <option value="Rachel Dias">Rachel Dias</option>
                <option value="Waleed Perera">Waleed Perera</option>
                <option value="Iruro Silva">Iruro Silva</option>
              </select>
            </div>
          </div>
        </form>

        <div className="p-4 border-t border-line bg-slate-50 flex items-center justify-end gap-2">
          <button onClick={onClose} className="h-9 px-4 rounded border border-line text-[12px] font-bold text-slate-600 hover:bg-slate-100">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="h-9 px-5 rounded bg-[#671021] text-white text-[12px] font-bold hover:bg-[#520d1a] flex items-center gap-1.5 shadow-sm"
          >
            <Plus size={14} /> Add Customer
          </button>
        </div>
      </div>
    </div>
  );
}
