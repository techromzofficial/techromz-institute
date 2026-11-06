"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { PermissionGuard } from "@/components/admin/common/PermissionGuard";
import { LoadingSkeleton } from "@/components/admin/common/States";
import { StatusBadge } from "@/components/admin/common/StatusBadge";
import { ProductDetailHeader } from "@/components/admin/catalogue/products/detail/ProductDetailHeader";
import { ProductDetailTabs } from "@/components/admin/catalogue/products/detail/ProductDetailTabs";
import { ProductOverview } from "@/components/admin/catalogue/products/detail/ProductOverview";

import { useAdminContext } from "@/contexts/AdminContext";

import { catalogueApi } from "@/features/admin/catalogue/api/catalogueApi";
import { ProductVariantsManager } from "@/features/admin/catalogue/components/ProductVariantsManager";
import { ProductMediaManager } from "@/features/admin/catalogue/components/ProductMediaManager";
import { ProductLifecycleActions } from "@/features/admin/catalogue/components/ProductLifecycleActions";
import {
  CatalogueError,
  formatDate,
  type LiveApiError,
} from "@/features/admin/catalogue/components/LiveCatalogueState";
import type { ProductDetail } from "@/features/admin/catalogue/contracts/catalogueContracts";
import { CATALOGUE_PERMISSIONS } from "@/features/admin/catalogue/permissions/cataloguePermissions";

export default function ProductDetailPage(props: any) {
  const routeParams = useParams<{ productId: string }>();
  const params = props?.params ?? routeParams;
  const { hasPermission } = useAdminContext();

  const canRead = hasPermission(
    CATALOGUE_PERMISSIONS.productsView
  );

  const [product, setProduct] =
    useState<ProductDetail | null>(null);

  const [error, setError] =
    useState<LiveApiError | null>(null);

  const [activeTab, setActiveTab] =
    useState("overview");

  const reload = async () => {
    setProduct(await catalogueApi.getProduct(params.productId));
  };

  useEffect(() => {
    if (!canRead) {
      return;
    }

    let active = true;

    catalogueApi
      .getProduct(params.productId)
      .then((value) => {
        if (active) {
          setProduct(value);
        }
      })
      .catch((reason) => {
        if (active) {
          setError(reason);
        }
      });

    return () => {
      active = false;
    };
  }, [canRead, params.productId]);

  return (
    <PermissionGuard
      permission={CATALOGUE_PERMISSIONS.productsView}
      fallback={
        <CatalogueError
          error={Object.assign(
            new Error("Permission required"),
            { status: 403 }
          )}
        />
      }
    >
      {!product && !error && <LoadingSkeleton />}

      {error && (
        <CatalogueError
          error={error}
          notFound="Product not found"
        />
      )}

      {product && (
        <div className="flex flex-col gap-4 p-6">
          <ProductDetailHeader
            productId={product.id}
            productName={product.name}
          />
          {hasPermission(CATALOGUE_PERMISSIONS.productsManage) && <ProductLifecycleActions product={product} onReload={reload}/>}

          <ProductDetailTabs
            activeTab={activeTab}
            onSelectTab={setActiveTab}
          />

          {activeTab === "overview" && (
            <ProductOverview
              product={product}
              onSelectTab={setActiveTab}
            />
          )}

          {activeTab === "variants" && (
            <>
              {product.updatedAt ? (
                <ProductVariantsManager
                  productId={product.id}
                  productVersion={product.updatedAt}
                  onProductVersion={(
                    updatedAt,
                    approvalStatus
                  ) =>
                    setProduct((current) =>
                      current
                        ? {
                            ...current,
                            updatedAt,
                            approvalStatus,
                          }
                        : current
                    )
                  }
                />
              ) : (
                <div className="bg-white rounded border border-gray-200 p-5 text-xs text-gray-500">
                  Product version is unavailable.
                </div>
              )}
            </>
          )}

          {activeTab === "media" && <ProductMediaManager productId={product.id} onChanged={reload}/>}

          {activeTab === "publication" && (
            <div className="bg-white rounded border border-gray-200 p-5 shadow-2xs">
              <h2 className="text-sm font-bold text-gray-900">
                Publication
              </h2>

              <div className="mt-4 space-y-3 text-xs">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">
                    Publication State
                  </span>

                  <StatusBadge
                    status={
                      product.publicationSummary.state
                    }
                  />
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">
                    Published At
                  </span>

                  <span className="font-semibold text-gray-800">
                    {formatDate(
                      product.publicationSummary
                        .publishedAt ?? null
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "audit" && (
            <div className="bg-white rounded border border-gray-200 p-5 shadow-2xs">
              <h2 className="text-sm font-bold text-gray-900">
                Catalogue Audit
              </h2>

              <div className="mt-4 space-y-3 text-xs">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">
                    Entity Type
                  </span>

                  <span className="font-semibold text-gray-800">
                    {product.auditHistory.entityType}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">
                    Entity ID
                  </span>

                  <span className="font-mono font-bold text-gray-900">
                    {product.auditHistory.entityId}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </PermissionGuard>
  );
}
