import {api} from "@/lib/api";
import type{ProductAttributeDataType,ProductVariantDetail,VariantAttributeOption,VariantMutationInput}from"../contracts/catalogueContracts";

type Raw=Record<string,any>;
const adapt=(raw:Raw):ProductVariantDetail=>({id:String(raw.id),sku:raw.sku??null,slug:raw.slug??null,name:String(raw.name??""),variantName:raw.variant_name??null,description:raw.description??null,status:String(raw.status??"unknown"),isActive:Boolean(raw.is_active),barcode:raw.barcode??null,updatedAt:raw.updated_at??null,attributeValues:(raw.attribute_values??[]).map((x:Raw)=>({attributeId:String(x.attribute_id),name:String(x.name),slug:String(x.slug),dataType:x.data_type as ProductAttributeDataType,value:x.value})),product:{id:String(raw.product.id),name:String(raw.product.name),approvalStatus:String(raw.product.approval_status),updatedAt:String(raw.product.updated_at)}});
const payload=(input:VariantMutationInput)=>({sku:input.sku||null,name:input.name,variant_name:input.variantName||null,description:input.description||null,barcode:input.barcode||null,status:input.status,attribute_values:input.attributeValues.map(x=>({attribute_id:Number(x.attributeId),value:x.value})),expected_product_updated_at:input.expectedProductUpdatedAt});
const base=(productId:string)=>`/admin/catalogue/products/${encodeURIComponent(productId)}`;
export const variantApi={
 async list(productId:string):Promise<ProductVariantDetail[]>{const response:any=await api.get(`${base(productId)}/variants`);return(response.data??[]).map(adapt)},
 async detail(productId:string,id:string):Promise<ProductVariantDetail>{const response:any=await api.get(`${base(productId)}/variants/${encodeURIComponent(id)}`);return adapt(response.data??response)},
 async attributes(productId:string):Promise<VariantAttributeOption[]>{const response:any=await api.get(`${base(productId)}/variant-attributes`);return(response.data??[]).map((x:Raw)=>({id:String(x.id),name:String(x.name),slug:String(x.slug),dataType:x.data_type,group:x.group?{id:String(x.group.id),name:String(x.group.name)}:null,isRequired:Boolean(x.is_required)}))},
 async create(productId:string,input:VariantMutationInput){const response:any=await api.post(`${base(productId)}/variants`,payload(input));return adapt(response.data??response)},
 async update(productId:string,id:string,input:VariantMutationInput){const response:any=await api.put(`${base(productId)}/variants/${encodeURIComponent(id)}`,payload(input));return adapt(response.data??response)},
 async setStatus(productId:string,id:string,status:"active"|"inactive",expectedProductUpdatedAt:string){const response:any=await api.post(`${base(productId)}/variants/${encodeURIComponent(id)}/${status==="active"?"activate":"deactivate"}`,{expected_product_updated_at:expectedProductUpdatedAt});return adapt(response.data??response)}
};
