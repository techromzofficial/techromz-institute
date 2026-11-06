import { PermissionGuard } from "@/components/admin/common/PermissionGuard";
import { ProductMasterWorkspace } from "@/features/admin/catalogue/components/ProductMasterWorkspace";
import { CATALOGUE_PERMISSIONS } from "@/features/admin/catalogue/permissions/cataloguePermissions";

export default function CreateProductPage(){return <PermissionGuard permission={CATALOGUE_PERMISSIONS.productsManage}><ProductMasterWorkspace/></PermissionGuard>}
