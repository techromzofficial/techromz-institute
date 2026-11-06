import {describe,expect,it} from "vitest";
import {adaptAttribute,adaptCategory} from "@/features/admin/catalogue/api/catalogueApi";
import {PRODUCT_ATTRIBUTE_DATA_TYPES} from "@/features/admin/catalogue/contracts/catalogueContracts";

describe("CAT-05 metadata contracts",()=>{
 it("defines the five persisted Product Attribute value types",()=>{
  expect(PRODUCT_ATTRIBUTE_DATA_TYPES).toEqual(["text","number","boolean","date","json"])
 });
 it("adapts only authoritative Category fields and backend capabilities",()=>{
  expect(adaptCategory({id:7,name:"Skin Care",slug:"skin-care",status:"active",parent:null,children_count:2,product_count:4,linked_attribute_count:3,updated_at:"2026-08-14T00:00:00Z",capabilities:{update:true,activate:false,deactivate:true},tenant_id:999,is_legacy_source:true})).toEqual({id:"7",name:"Skin Care",slug:"skin-care",description:null,status:"active",parent:null,childrenCount:2,productCount:4,linkedAttributeCount:3,updatedAt:"2026-08-14T00:00:00Z",capabilities:{update:true,activate:false,deactivate:true}})
 });
 it("adapts Attribute type, flags, Group, usage summary, and backend capabilities",()=>{
  expect(adaptAttribute({id:8,name:"SPF",slug:"spf",data_type:"number",unit:null,group:{id:4,name:"Compliance"},status:"active",is_required:true,is_filterable:true,is_variant_defining:false,linked_category_count:6,updated_at:null,capabilities:{update:false,activate:false,deactivate:false}})).toMatchObject({id:"8",dataType:"number",group:{id:"4",name:"Compliance"},isRequired:true,isFilterable:true,isVariantDefining:false,linkedCategoryCount:6,capabilities:{update:false,activate:false,deactivate:false}})
 });
});
