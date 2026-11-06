'use client';

import React from 'react';
import {
  User,
  ShoppingBag,
  Truck,
  Building,
  Paperclip,
  CheckCircle,
  Clock,
  FileCheck,
  ExternalLink,
} from 'lucide-react';
import type { CaseDetailFullData } from '@/types/customerSupportDetail';
import styles from '@/app/admin/customer-support/cases/[caseId]/page.module.css';

// ── Tab 3: Customer Context ────────────────────────────────────────────────
export function CustomerContextTab({ data }: { data: CaseDetailFullData }) {
  const { caseInfo } = data;
  return (
    <div className="space-y-4 text-xs">
      <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
        <User size={16} className="text-[#722140]" />
        <span>Customer 360Â° Profile: {caseInfo.customerName}</span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
          <span className="font-bold text-slate-700 block text-xs uppercase">Customer Identity</span>
          <div>Customer Name: <strong>{caseInfo.customerName}</strong></div>
          <div>Customer ID: <span className="font-mono">{caseInfo.customerId}</span></div>
          <div>Tier: <strong className="text-purple-700">VIP Platinum</strong></div>
          <div>Account Status: <span className="text-emerald-700 font-bold">Active / Verified</span></div>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
          <span className="font-bold text-slate-700 block text-xs uppercase">Purchase History</span>
          <div>Total Lifetime Orders: <strong>18 Orders</strong></div>
          <div>Total Lifetime Spend: <strong>LKR 214,800.00</strong></div>
          <div>Average Order Value: <strong>LKR 11,933.00</strong></div>
          <div>Last Order Date: <strong>Jul 17, 2026</strong></div>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
          <span className="font-bold text-slate-700 block text-xs uppercase">Support Interaction Summary</span>
          <div>Total Cases Filed: <strong>3 Cases</strong></div>
          <div>Open Cases: <strong>1 Case</strong></div>
          <div>Repeat Contact Index: <span className="text-emerald-700 font-bold">Low (0.05)</span></div>
          <div>Customer Satisfaction Score: <strong className="text-emerald-700">4.8 / 5.0</strong></div>
        </div>
      </div>
    </div>
  );
}

// ── Tab 4: Related Records ─────────────────────────────────────────────────
export function RelatedRecordsTab({ data }: { data: CaseDetailFullData }) {
  const { caseInfo, orderContext, shipmentContext, supplierContext } = data;
  return (
    <div className="space-y-4 text-xs">
      <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">
        Linked Commerce & Enterprise Entities
      </h3>

      <div className="space-y-3">
        {orderContext && (
          <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingBag size={18} className="text-blue-600" />
              <div>
                <div className="font-bold text-blue-900">Order: {orderContext.orderReference}</div>
                <div className="text-slate-500">Status: {orderContext.orderStatus} • Payment: {orderContext.paymentStatus} • Total: {orderContext.orderTotal}</div>
              </div>
            </div>
            <a
              href={`/admin/marketplace/orders/${orderContext.orderReference}`}
              className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
            >
              <span>View Order (Screen 11)</span>
              <ExternalLink size={12} />
            </a>
          </div>
        )}

        {shipmentContext && (
          <div className="p-3 bg-teal-50/50 border border-teal-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Truck size={18} className="text-teal-600" />
              <div>
                <div className="font-bold text-teal-900">Shipment: {shipmentContext.shipmentReference}</div>
                <div className="text-slate-500">Status: {shipmentContext.shipmentStatus} • Carrier: {shipmentContext.carrierName} • Delivery: {shipmentContext.deliveryStatus}</div>
              </div>
            </div>
            <a
              href={`/admin/logistics/shipments/${shipmentContext.shipmentReference}`}
              className="px-3 py-1.5 text-xs font-semibold bg-teal-600 text-white rounded hover:bg-teal-700 flex items-center gap-1"
            >
              <span>View Shipment (Screen 15)</span>
              <ExternalLink size={12} />
            </a>
          </div>
        )}

        {supplierContext && (
          <div className="p-3 bg-purple-50/50 border border-purple-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building size={18} className="text-purple-600" />
              <div>
                <div className="font-bold text-purple-900">Supplier: {supplierContext.supplierName}</div>
                <div className="text-slate-500">Fulfilment Ref: {supplierContext.fulfilmentReference} • Issue: {supplierContext.operationalIssue}</div>
              </div>
            </div>
            <button
              type="button"
              className="px-3 py-1.5 text-xs font-semibold bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              View Supplier Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Tab 5: Evidence & Attachments ──────────────────────────────────────────
export function AttachmentsTab({ data }: { data: CaseDetailFullData }) {
  return (
    <div className="space-y-4 text-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <Paperclip size={16} className="text-[#722140]" />
          <span>Evidence & File Attachments</span>
        </h3>
        <button type="button" className={styles.btnSecondary}>
          <Paperclip size={14} />
          <span>Upload File / Evidence</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {data.attachments.map((att) => (
          <div key={att.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900 truncate max-w-[240px]" title={att.fileName}>
                {att.fileName}
              </div>
              <div className="text-[11px] text-slate-500">
                {att.fileType} • {att.fileSize} • Uploaded by <strong>{att.uploadedBy}</strong>
              </div>
            </div>
            <button type="button" className="px-2.5 py-1 text-xs font-bold text-[#722140] border border-[#722140] rounded hover:bg-rose-50">
              Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tab 6: Investigation ───────────────────────────────────────────────────
export function InvestigationTab({ data }: { data: CaseDetailFullData }) {
  return (
    <div className="space-y-4 text-xs">
      <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">
        Root Cause & Operational Investigation Workspace
      </h3>

      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
        <span className="font-bold text-slate-800 block text-xs uppercase">Investigation Summary</span>
        <p className="text-slate-700 leading-relaxed">
          Order ORD-2026-009021 was confirmed on Jul 17. Supplier Luxe Distribution Pvt Ltd prepared package SHP-2026-010293 on Jul 18. Carrier Koombiyo Delivery delayed vehicle assignment due to warehouse dispatch backlog. Backup driver requested for Jul 22 afternoon pickup window.
        </p>
      </div>
    </div>
  );
}

// ── Tab 7: SLA & Escalation ────────────────────────────────────────────────
export function SlaEscalationTab({ data }: { data: CaseDetailFullData }) {
  return (
    <div className="space-y-4 text-xs">
      <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">
        SLA Target Timelines & Escalation Log
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-lg space-y-2">
          <span className="font-bold text-emerald-900 block text-xs uppercase">First Response SLA</span>
          <div>Target: <strong>15 Minutes</strong></div>
          <div>Actual Response: <strong className="text-emerald-700">9 Minutes</strong></div>
          <div>SLA Outcome: <span className="px-2 py-0.5 text-[10px] bg-emerald-100 text-emerald-800 font-bold rounded">Passed / Within Target</span></div>
        </div>

        <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-lg space-y-2">
          <span className="font-bold text-amber-900 block text-xs uppercase">Resolution SLA</span>
          <div>Target: <strong>24 Hours (Jul 22, 6:00 PM)</strong></div>
          <div>Remaining: <strong className="text-amber-700">4 Hours Remaining</strong></div>
          <div>SLA Outcome: <span className="px-2 py-0.5 text-[10px] bg-amber-100 text-amber-800 font-bold rounded">4 Hours Remaining</span></div>
        </div>
      </div>
    </div>
  );
}

// ── Tab 8: Resolution Workspace ────────────────────────────────────────────
export function ResolutionWorkspaceTab({
  data,
  onResolve,
}: {
  data: CaseDetailFullData;
  onResolve: () => void;
}) {
  return (
    <div className="space-y-4 text-xs">
      <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">
        Case Resolution & Formal Closure Panel
      </h3>

      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
        <span className="font-bold text-slate-800 block text-xs uppercase">Resolution Requirements Checklist</span>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-700 font-semibold">
            <CheckCircle size={14} />
            <span>Assigned Case Owner (Amaya Perera)</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-700 font-semibold">
            <CheckCircle size={14} />
            <span>First Response Delivered to Customer</span>
          </div>
          <div className="flex items-center gap-2 text-amber-700 font-semibold">
            <Clock size={14} />
            <span>Driver Assignment Confirmation Pending</span>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={onResolve}
            className={styles.btnPrimary}
          >
            <FileCheck size={14} />
            <span>Mark Case as Resolved</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Tab 10: Communications ─────────────────────────────────────────────────
export function CommunicationsTab({ data }: { data: CaseDetailFullData }) {
  return (
    <div className="space-y-4 text-xs">
      <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">
        Multi-Channel Communication Log
      </h3>
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
        <div className="flex items-center justify-between font-bold">
          <span>In-App Chat Thread (Active)</span>
          <span className="text-emerald-700">Connected</span>
        </div>
        <div className="text-slate-600">Customer active on mobile app iOS v4.2.1</div>
      </div>
    </div>
  );
}

// ── Tab 11: Operational Issues ─────────────────────────────────────────────
export function OperationalIssuesTab({ data }: { data: CaseDetailFullData }) {
  return (
    <div className="space-y-4 text-xs">
      <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">
        Supplier & Carrier Operational Incident Log
      </h3>

      <div className="space-y-3">
        {data.blockingIssues.map((b) => (
          <div key={b.id} className="p-3 bg-red-50/50 border border-red-200 rounded-lg flex items-center justify-between">
            <div>
              <div className="font-bold text-red-900">{b.title}</div>
              <div className="text-slate-600">{b.description}</div>
            </div>
            <span className="px-2 py-0.5 text-[10px] bg-red-100 text-red-800 font-bold rounded">
              {b.severity} Severity
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

