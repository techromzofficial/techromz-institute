import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ProductInventoryPage from "@/app/admin/catalogue/inventory/page";

const navigation=vi.hoisted(()=>({params:new URLSearchParams()}));
vi.mock("@/features/admin/catalogue/api/operationsApi",()=>({inventoryApi:{list:vi.fn().mockResolvedValue({data:[{id:"1",status:"available",product:{id:"4",name:"Radiance Serum",sku:"RAD-1",image:null},variantSku:null,batch:null,warehouse:{id:"2",name:"Main Warehouse",code:"MAIN"},location:null,onHandQuantity:20,reservedQuantity:4,incomingQuantity:0,damagedQuantity:0,quarantinedQuantity:0,availableQuantity:16,lowStockThreshold:5,updatedAt:"2026-09-09T10:00:00Z"}],summary:{totalStock:20,availableStock:16,reservedStock:4,quarantinedStock:0,lowStockProducts:0,outOfStockProducts:0,activeBatches:1,nearExpiryBatches:0,expiredBatches:0,recalledBatches:0},page:1,pageSize:20,total:1})}}));
vi.mock("@/components/admin/common/PermissionGuard",()=>({PermissionGuard:({children}:{children:React.ReactNode})=><>{children}</>}));
vi.mock("next/navigation",()=>({useRouter:()=>({replace:vi.fn()}),useSearchParams:()=>navigation.params}));

describe("Catalogue Inventory read workspace", () => {
  it("loads tenant inventory metrics and rows without mutation controls", async () => {
    render(<ProductInventoryPage />);
    expect(await screen.findByText("Radiance Serum")).toBeInTheDocument();
    expect(screen.getByText("Total stock")).toBeInTheDocument();
    expect(screen.getByText("Main Warehouse")).toBeInTheDocument();
    expect(screen.queryByText("Record Stock Adjustment")).not.toBeInTheDocument();
  });
});
