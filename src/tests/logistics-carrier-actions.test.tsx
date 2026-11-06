import React from "react";
import{fireEvent,render,screen,waitFor}from"@testing-library/react";
import{beforeEach,describe,expect,it,vi}from"vitest";
import Page from"@/app/admin/logistics/carriers/page";
const api=vi.hoisted(()=>({getRetailCarriers:vi.fn(),createRetailCarrier:vi.fn(),updateRetailCarrier:vi.fn(),setRetailCarrierStatus:vi.fn()}));
vi.mock("@/lib/api/logistics",()=>({logisticsApi:api}));
describe("Retail carrier actions",()=>{beforeEach(()=>{vi.clearAllMocks();api.getRetailCarriers.mockResolvedValue({data:[{id:4,uuid:"c",name:"Express",code:"EXP",status:"active",tracking_url_template:null}],capabilities:{read:true,manage:true,create:true,update:true,activate:true,deactivate:true}});api.updateRetailCarrier.mockResolvedValue({carrier:{}});api.setRetailCarrierStatus.mockResolvedValue({carrier:{}})});it("updates and deactivates a carrier",async()=>{render(<Page/>);fireEvent.click(await screen.findByRole("button",{name:"Edit"}));fireEvent.change(screen.getByLabelText("Carrier name"),{target:{value:"Express Plus"}});fireEvent.click(screen.getByRole("button",{name:"Update Carrier"}));await waitFor(()=>expect(api.updateRetailCarrier).toHaveBeenCalledWith(4,expect.objectContaining({name:"Express Plus"})));fireEvent.click(screen.getByRole("button",{name:"Deactivate"}));await waitFor(()=>expect(api.setRetailCarrierStatus).toHaveBeenCalledWith(4,"inactive"))})});
