import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LogisticsReturnsPage from "@/app/admin/logistics/returns/page";
import LogisticsCarriersPage from "@/app/admin/logistics/carriers/page";

const logisticsApi = vi.hoisted(() => ({ getReturns: vi.fn(), receiveReturn: vi.fn(), inspectReturn: vi.fn(), getReturnInventoryOptions: vi.fn(), disposeReturn: vi.fn(), getRetailCarriers: vi.fn(), createRetailCarrier: vi.fn(), updateRetailCarrier: vi.fn(), setRetailCarrierStatus: vi.fn() }));
vi.mock("@/lib/api/logistics", () => ({ logisticsApi }));
vi.mock("next/navigation", () => ({ useRouter:()=>({push:vi.fn()}), useSearchParams:()=>new URLSearchParams() }));

describe("Logistics reverse returns and Retail carriers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    logisticsApi.getReturns.mockResolvedValue({ summary:{total_shipments:1,return_records:1,active_collections:1,completed_returns:0}, return_records:[{id:7,uuid:"r",status:"approved",order:{id:1,order_number:"ORD-1",items:[{id:11,product_name:"Product",sku:"SKU",quantity:2,unit:"Item"}]},items:[]}], domain:{available:true,record_source:"marketplace_returns",collection_workflow_available:false,reverse_logistics_workflow_available:true,finance_refunds_are_return_records:false}, capabilities:{read:true,manage:true,create_return:false,approve_return:false,reject_return:false,schedule_collection:false,assign_carrier:false,receive_return:true,inspect_return:true,close_return:true,create_refund:false} });
    logisticsApi.getRetailCarriers.mockResolvedValue({data:[],capabilities:{read:true,manage:true,create:true,update:true,activate:true,deactivate:true}});
  });

  it("prevents receiving above the ordered quantity and submits valid receipt", async () => {
    logisticsApi.receiveReturn.mockResolvedValue({return_item:{}});
    render(<LogisticsReturnsPage/>);
    const input=await screen.findByLabelText("Receive quantity for return 7");
    fireEvent.change(input,{target:{value:"3"}});
    expect(screen.getByRole("button",{name:"Receive Return"})).toBeDisabled();
    fireEvent.change(input,{target:{value:"2"}}); fireEvent.click(screen.getByRole("button",{name:"Receive Return"}));
    await waitFor(()=>expect(logisticsApi.receiveReturn).toHaveBeenCalledWith(7,{order_item_id:11,quantity:2}));
  });

  it("hides return actions without backend capability", async () => {
    const response=await logisticsApi.getReturns(); response.capabilities.receive_return=false; logisticsApi.getReturns.mockResolvedValue(response);
    render(<LogisticsReturnsPage/>); await screen.findByText("Return 7");
    expect(screen.queryByRole("button",{name:"Receive Return"})).not.toBeInTheDocument();
  });

  it("creates a Retail carrier and reports API errors", async () => {
    logisticsApi.createRetailCarrier.mockResolvedValue({carrier:{}});
    render(<LogisticsCarriersPage/>); await screen.findByText("Configured Carriers");
    fireEvent.change(screen.getByLabelText("Carrier name"),{target:{value:"Express"}}); fireEvent.change(screen.getByLabelText("Carrier code"),{target:{value:"EXP"}});
    fireEvent.click(screen.getByRole("button",{name:/Create Carrier/}));
    await waitFor(()=>expect(logisticsApi.createRetailCarrier).toHaveBeenCalled());
    logisticsApi.createRetailCarrier.mockRejectedValue(new Error("Duplicate carrier code"));
    fireEvent.change(screen.getByLabelText("Carrier name"),{target:{value:"Express"}}); fireEvent.change(screen.getByLabelText("Carrier code"),{target:{value:"EXP"}}); fireEvent.click(screen.getByRole("button",{name:/Create Carrier/}));
    expect(await screen.findByText("Duplicate carrier code")).toBeInTheDocument();
  });
});
