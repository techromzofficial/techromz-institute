"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { PermissionGuard } from "@/components/admin/common/PermissionGuard";
import { CATALOGUE_PERMISSIONS } from "@/features/admin/catalogue/permissions/cataloguePermissions";

interface ProductDetailHeaderProps {
  productId: string;
  productName: string;
}

export const ProductDetailHeader: React.FC<ProductDetailHeaderProps> = ({
  productId,
  productName,
}) => {
  return (
    <div className="flex flex-col gap-3 mb-4">
      <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
        Catalogue &nbsp;/&nbsp; Product Masters &nbsp;/&nbsp;
        <span className="text-gray-800">{productId}</span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
        <Link
          href="/admin/catalogue/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-[#741d35] mb-1"
        >
          <ArrowLeft size={14} />
          Back to Product Master
        </Link>

        <h1 className="text-xl font-bold text-gray-900 tracking-tight">
          {productName}
        </h1>

        <p className="text-xs text-gray-500 mt-1">
          Product Master Detail · ID {productId}
        </p>
        </div>
        <PermissionGuard permission={CATALOGUE_PERMISSIONS.productsManage}>
          <Link href={`/admin/catalogue/products/${encodeURIComponent(productId)}/edit`} className="inline-flex h-9 items-center justify-center gap-2 rounded bg-[#741d35] px-4 text-xs font-bold text-white hover:bg-[#5c172a]"><Pencil size={13}/>Edit Product</Link>
        </PermissionGuard>
      </div>
    </div>
  );
};
