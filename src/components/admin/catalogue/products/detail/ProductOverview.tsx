"use client";

import React from "react";
import { ChevronRight } from "lucide-react";

import type { ProductDetail } from "@/features/admin/catalogue/contracts/catalogueContracts";
import {
  displayValue,
  formatDate,
} from "@/features/admin/catalogue/components/LiveCatalogueState";
import { StatusBadge } from "@/components/admin/common/StatusBadge";

interface ProductOverviewProps {
  product: ProductDetail;
  onSelectTab: (tabId: string) => void;
}

export const ProductOverview: React.FC<ProductOverviewProps> = ({
  product,
  onSelectTab,
}) => {
  const completeness = product.completeness?.percentage;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* 1. Product Identity */}
        <div className="bg-white rounded border border-gray-200 p-4 shadow-2xs">
          <h3 className="text-xs font-bold text-gray-900 border-b border-gray-100 pb-2 mb-2.5">
            1. Product Identity
          </h3>

          <div className="space-y-1.5 text-[11.5px]">
            <div className="flex justify-between gap-3">
              <span className="text-gray-500">Product ID</span>
              <span className="font-mono font-bold text-gray-900">
                {product.id}
              </span>
            </div>

            <div className="flex justify-between gap-3">
              <span className="text-gray-500">SKU</span>
              <span className="font-mono font-bold text-gray-900">
                {displayValue(product.sku)}
              </span>
            </div>

            <div className="flex justify-between gap-3">
              <span className="text-gray-500">Status</span>
              <StatusBadge status={product.status} />
            </div>

            <div className="flex justify-between gap-3">
              <span className="text-gray-500">Approval</span>
              <StatusBadge
                status={displayValue(product.approvalStatus, "unknown")}
              />
            </div>

            <div className="flex justify-between gap-3 border-t border-gray-100 pt-1.5">
              <span className="text-gray-500">Updated</span>
              <span className="text-gray-700 text-right">
                {formatDate(product.updatedAt)}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Classification */}
        <div className="bg-white rounded border border-gray-200 p-4 shadow-2xs">
          <h3 className="text-xs font-bold text-gray-900 border-b border-gray-100 pb-2 mb-2.5">
            2. Classification
          </h3>

          <div className="space-y-1.5 text-[11.5px]">
            <div className="flex justify-between gap-3">
              <span className="text-gray-500">Category</span>
              <span className="font-semibold text-gray-800 text-right">
                {displayValue(product.category?.name)}
              </span>
            </div>

            <div className="flex justify-between gap-3">
              <span className="text-gray-500">Brand</span>
              <span className="font-semibold text-gray-800 text-right">
                {displayValue(product.brand?.name)}
              </span>
            </div>

            <div className="flex justify-between gap-3">
              <span className="text-gray-500">Sector Pack</span>
              <span className="text-gray-700 text-right">
                {displayValue(product.sector?.sectorPackId)}
              </span>
            </div>

            <div className="flex justify-between gap-3">
              <span className="text-gray-500">Capabilities</span>
              <span className="font-bold text-gray-800">
                {product.sector?.capabilities.length ?? 0}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Brand & Supplier */}
        <div className="bg-white rounded border border-gray-200 p-4 shadow-2xs">
          <h3 className="text-xs font-bold text-gray-900 border-b border-gray-100 pb-2 mb-2.5">
            3. Brand & Supplier
          </h3>

          <div className="space-y-1.5 text-[11.5px]">
            <div className="flex justify-between gap-3">
              <span className="text-gray-500">Brand</span>
              <span className="font-bold text-gray-900 text-right">
                {displayValue(product.brand?.name)}
              </span>
            </div>

            <div className="flex justify-between gap-3">
              <span className="text-gray-500">Supplier</span>
              <span className="font-semibold text-gray-800 text-right">
                {displayValue(product.supplierSummary?.name)}
              </span>
            </div>

            <div className="flex justify-between gap-3">
              <span className="text-gray-500">Verification</span>
              <span className="font-semibold text-gray-700 text-right">
                {displayValue(
                  product.supplierSummary?.verificationStatus
                )}
              </span>
            </div>
          </div>
        </div>

        {/* 4. Product Content */}
        <div className="bg-white rounded border border-gray-200 p-4 shadow-2xs">
          <h3 className="text-xs font-bold text-gray-900 border-b border-gray-100 pb-2 mb-2.5">
            4. Product Content
          </h3>

          <div className="space-y-2 text-[11.5px]">
            <div>
              <span className="text-gray-400 text-[10px] uppercase font-semibold block">
                Product Name
              </span>
              <span className="font-semibold text-gray-900">
                {product.name}
              </span>
            </div>

            <div>
              <span className="text-gray-400 text-[10px] uppercase font-semibold block">
                Description
              </span>
              <span className="text-gray-600 line-clamp-4">
                {displayValue(product.description)}
              </span>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-gray-500">Completeness</span>
                <span className="font-bold text-gray-900">
                  {completeness === undefined
                    ? "Unavailable"
                    : `${completeness}%`}
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[#741d35] h-full rounded-full"
                  style={{
                    width: `${Math.max(
                      0,
                      Math.min(100, completeness ?? 0)
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* 5. Variants */}
        <div className="bg-white rounded border border-gray-200 p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-gray-900 border-b border-gray-100 pb-2 mb-2.5">
              5. Variant Summary
            </h3>

            <div className="space-y-1.5 text-[11.5px]">
              <div className="flex justify-between">
                <span className="text-gray-500">Total Variants</span>
                <span className="font-bold text-gray-900">
                  {product.variants.length}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Active</span>
                <span className="font-bold text-emerald-700">
                  {
                    product.variants.filter(
                      (variant) => variant.status === "active"
                    ).length
                  }
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Inactive</span>
                <span className="font-bold text-gray-700">
                  {
                    product.variants.filter(
                      (variant) => variant.status !== "active"
                    ).length
                  }
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelectTab("variants")}
            className="mt-3 text-[11px] font-semibold text-[#741d35] hover:underline flex items-center gap-0.5"
          >
            View variants
            <ChevronRight size={12} />
          </button>
        </div>

        {/* 6. Inventory */}
        <div className="bg-white rounded border border-gray-200 p-4 shadow-2xs">
          <h3 className="text-xs font-bold text-gray-900 border-b border-gray-100 pb-2 mb-2.5">
            6. Inventory Summary
          </h3>

          <div className="space-y-1.5 text-[11.5px]">
            <div className="flex justify-between gap-3">
              <span className="text-gray-500">Ownership</span>
              <span className="font-bold text-[#741d35]">
                Read-only
              </span>
            </div>

            <div className="flex justify-between gap-3">
              <span className="text-gray-500">Status</span>
              <span className="font-semibold text-gray-800">
                {displayValue(product.inventory?.status)}
              </span>
            </div>

            <div className="flex justify-between gap-3">
              <span className="text-gray-500">Available Quantity</span>
              <span className="font-bold text-gray-900">
                {displayValue(product.inventory?.availableQuantity)}
              </span>
            </div>
          </div>
        </div>

        {/* 7. Publication */}
        <div className="bg-white rounded border border-gray-200 p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-gray-900 border-b border-gray-100 pb-2 mb-2.5">
              7. Publication
            </h3>

            <div className="space-y-1.5 text-[11.5px]">
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">State</span>
                <StatusBadge
                  status={product.publicationSummary.state}
                />
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Published At</span>
                <span className="text-gray-700 text-right">
                  {formatDate(
                    product.publicationSummary.publishedAt ?? null
                  )}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelectTab("publication")}
            className="mt-3 text-[11px] font-semibold text-[#741d35] hover:underline flex items-center gap-0.5"
          >
            View publication
            <ChevronRight size={12} />
          </button>
        </div>

        {/* 8. Audit */}
        <div className="bg-white rounded border border-gray-200 p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-gray-900 border-b border-gray-100 pb-2 mb-2.5">
              8. Catalogue Audit
            </h3>

            <div className="space-y-1.5 text-[11.5px]">
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Entity Type</span>
                <span className="font-semibold text-gray-800">
                  {product.auditHistory.entityType}
                </span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Entity ID</span>
                <span className="font-mono font-bold text-gray-900">
                  {product.auditHistory.entityId}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelectTab("audit")}
            className="mt-3 text-[11px] font-semibold text-[#741d35] hover:underline flex items-center gap-0.5"
          >
            View audit
            <ChevronRight size={12} />
          </button>
        </div>
      </div>

      {product.completeness?.missingFields?.length ? (
        <div className="bg-white rounded border border-gray-200 p-4 shadow-2xs">
          <h3 className="text-xs font-bold text-gray-900 mb-2">
            Missing Product Data
          </h3>

          <div className="flex flex-wrap gap-2">
            {product.completeness.missingFields.map((field) => (
              <span
                key={field}
                className="px-2 py-1 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[10.5px] font-semibold"
              >
                {field}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};