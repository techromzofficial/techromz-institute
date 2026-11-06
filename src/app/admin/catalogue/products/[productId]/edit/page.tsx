"use client";
import { useEffect,useState } from "react";
import { useParams } from "next/navigation";
import { PermissionGuard } from "@/components/admin/common/PermissionGuard";
import { LoadingSkeleton } from "@/components/admin/common/States";
import { catalogueApi } from "@/features/admin/catalogue/api/catalogueApi";
import { CatalogueError,type LiveApiError } from "@/features/admin/catalogue/components/LiveCatalogueState";
import { ProductMasterWorkspace } from "@/features/admin/catalogue/components/ProductMasterWorkspace";
import type { ProductDetail } from "@/features/admin/catalogue/contracts/catalogueContracts";
import { CATALOGUE_PERMISSIONS } from "@/features/admin/catalogue/permissions/cataloguePermissions";

export default function EditProductPage(props:any){const routeParams=useParams<{productId:string}>(),params=props?.params??routeParams;const[product,setProduct]=useState<ProductDetail|null>(null),[error,setError]=useState<LiveApiError|null>(null);useEffect(()=>{let active=true;catalogueApi.getProduct(params.productId).then(value=>active&&setProduct(value)).catch(reason=>active&&setError(reason));return()=>{active=false}},[params.productId]);return <PermissionGuard permission={CATALOGUE_PERMISSIONS.productsManage}>{!product&&!error&&<LoadingSkeleton/>}{error&&<CatalogueError error={error} notFound="Product not found"/>}{product&&<ProductMasterWorkspace product={product}/>}</PermissionGuard>}
