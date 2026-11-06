import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import BatchDetailPage from "./page";

vi.mock("@/features/admin/catalogue/api/operationsApi",()=>({inventoryApi:{batch:vi.fn().mockResolvedValue({id:"9",lotNumber:"BT-2024-0098",status:"active",manufacturedAt:"2026-01-01",expiresAt:"2027-01-01",receivedAt:"2026-01-05",isQuarantined:false,isRecalled:false,product:{id:"4",name:"Radiance Serum",sku:"RAD-1",image:null},variantSku:null,stock:{onHand:20,available:16,reserved:4,incoming:0,quarantined:0,damaged:0},locations:[],movements:[],capabilities:{read:true,adjust:false,quarantine:false,recall:false}})}}));
vi.mock("@/components/admin/common/PermissionGuard",()=>({PermissionGuard:({children}:{children:React.ReactNode})=><>{children}</>}));

describe("Catalogue batch read contract", () => {
  it("loads real batch detail without exposing Inventory mutations", async () => {
    render(<BatchDetailPage params={{ batchId: "9" }} />);
    expect(await screen.findByText("BT-2024-0098")).toBeInTheDocument();
    expect(screen.getByText("Radiance Serum")).toBeInTheDocument();
    expect(screen.queryByText("Record Stock Adjustment")).not.toBeInTheDocument();
    expect(screen.queryByText("Initiate Recall")).not.toBeInTheDocument();
  });
});
