import {fireEvent,render,screen,waitFor} from "@testing-library/react";
import {beforeEach,describe,expect,it,vi} from "vitest";
import AttributeDetailPage from "@/app/admin/catalogue/attributes/[attributeId]/page";

const mocks=vi.hoisted(()=>({getAttribute:vi.fn(),listCategories:vi.fn(),linkCategory:vi.fn(),unlinkCategory:vi.fn()}));
vi.mock("next/navigation",()=>({useParams:()=>({attributeId:"8"})}));
vi.mock("@/components/admin/common/PermissionGuard",()=>({PermissionGuard:({children}:{children:React.ReactNode})=><>{children}</>}));
vi.mock("@/features/admin/catalogue/api/catalogueApi",()=>({metadataApi:mocks}));

describe("CAT-05 Attribute Category link form",()=>{
 beforeEach(()=>{
  mocks.getAttribute.mockReset().mockResolvedValue({id:"8",name:"Material",slug:"material",dataType:"text",unit:null,group:null,status:"active",isRequired:false,isFilterable:false,isVariantDefining:false,sortOrder:0,linkedCategoryCount:0,updatedAt:null,capabilities:{update:true,activate:true,deactivate:true},linkedCategories:[],usageCount:0,source:{pack:null,version:null,definitionKey:null}});
  mocks.listCategories.mockReset().mockResolvedValue({data:[{id:"3",name:"Apparel",slug:"apparel",status:"active",parent:null,childrenCount:0,productCount:0,linkedAttributeCount:0,updatedAt:null,capabilities:{update:true,activate:true,deactivate:true}}],page:1,pageSize:100,total:1});
  mocks.linkCategory.mockReset().mockResolvedValue({});mocks.unlinkCategory.mockReset();
 });
 it("renders real required/filterable checkboxes and submits both values",async()=>{
  render(<AttributeDetailPage/>);
  const required=await screen.findByRole("checkbox",{name:"Required"});
  const filterable=screen.getByRole("checkbox",{name:"Filterable"});
  expect(required).toHaveAttribute("type","checkbox");expect(filterable).toHaveAttribute("type","checkbox");
  fireEvent.change(screen.getByLabelText("Category"),{target:{value:"3"}});fireEvent.click(required);fireEvent.click(filterable);fireEvent.click(screen.getByRole("button",{name:"Link Category"}));
  await waitFor(()=>expect(mocks.linkCategory).toHaveBeenCalledWith("8",{categoryId:"3",isRequired:true,isFilterable:true,sortOrder:0}));
 });
});
