"use client";

import React from "react";

export const DETAIL_TABS = [
  { id: "overview", label: "Overview" },
  { id: "variants", label: "Variants" },
  { id: "media", label: "Images & Media" },
  { id: "publication", label: "Publication" },
  { id: "audit", label: "Audit History" },
];

// export const DETAIL_TABS = [
//   { id: "overview", label: "Overview" },
//   { id: "identity", label: "Identity & Classification" },
//   { id: "brand", label: "Brand & Supplier" },
//   { id: "content", label: "Product Content" },
//   { id: "ingredients", label: "Ingredients & Safety" },
//   { id: "variants", label: "Variants & Attributes" },
//   { id: "media", label: "Images & Media" },
//   { id: "compliance", label: "Compliance & Approval" },
//   { id: "inventory", label: "Inventory & Batches" },
//   { id: "pricing", label: "Pricing & Tax" },
//   { id: "publication", label: "Publication & Channels" },
//   { id: "audit", label: "Audit History" },
// ];

interface ProductDetailTabsProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
}

export const ProductDetailTabs: React.FC<ProductDetailTabsProps> = ({
  activeTab,
  onSelectTab,
}) => {
  return (
    <div className="bg-white rounded border border-gray-200 px-3 py-1.5 flex items-center gap-1 overflow-x-auto no-scrollbar text-xs">
      {DETAIL_TABS.map((tab) => {
        const isSelected = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`px-3 py-1.5 rounded transition-all font-semibold shrink-0 relative ${
              isSelected
                ? "text-[#741d35] font-bold bg-[#f5ebed]/70 border-b-2 border-[#741d35]"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/70"
            }`}
          >
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
