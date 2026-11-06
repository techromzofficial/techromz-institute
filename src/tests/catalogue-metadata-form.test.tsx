import {fireEvent,render,screen,waitFor} from "@testing-library/react";
import {beforeEach,describe,expect,it,vi} from "vitest";
import {AttributeForm} from "@/features/admin/catalogue/components/MetadataForms";

const mocks=vi.hoisted(()=>({createAttribute:vi.fn(),listGroups:vi.fn(),push:vi.fn()}));
vi.mock("next/navigation",()=>({useRouter:()=>({push:mocks.push,refresh:vi.fn()})}));
vi.mock("@/features/admin/catalogue/api/catalogueApi",()=>({metadataApi:{listGroups:mocks.listGroups,createAttribute:mocks.createAttribute}}));

describe("CAT-05 Attribute form types",()=>{
 beforeEach(()=>{mocks.createAttribute.mockReset().mockResolvedValue({id:"9"});mocks.listGroups.mockReset().mockResolvedValue([]);mocks.push.mockReset()});
 it("offers date and json and submits the selected authoritative type",async()=>{
  render(<AttributeForm/>);
  expect(screen.getByRole("option",{name:"date"})).toBeInTheDocument();
  expect(screen.getByRole("option",{name:"json"})).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText(/^Name/),{target:{value:"Payload"}});
  fireEvent.change(screen.getByLabelText(/^Slug/),{target:{value:"payload"}});
  fireEvent.change(screen.getByLabelText(/^Data Type/),{target:{value:"json"}});
  fireEvent.click(screen.getByRole("button",{name:"Save Attribute"}));
  await waitFor(()=>expect(mocks.createAttribute).toHaveBeenCalledWith(expect.objectContaining({dataType:"json"})));
 });
});
