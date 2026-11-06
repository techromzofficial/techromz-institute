"use client";
import {ErrorState,PermissionDeniedState} from "@/components/admin/common/States";
export type LiveApiError=Error&{status?:number;category?:string;referenceId?:string|null};
export function CatalogueError({error,notFound="Product not found"}:{error:LiveApiError;notFound?:string}){if(error.status===403)return <PermissionDeniedState/>;const message=error.status===404?notFound:error.message;return <div><ErrorState message={message}/>{error.referenceId&&<p className="muted" role="note">Reference: {error.referenceId}</p>}</div>}
export const displayValue=(value:string|number|null|undefined,fallback="Unavailable")=>value===null||value===undefined||value===""?fallback:String(value);
export const formatDate=(value:string|null)=>value?new Intl.DateTimeFormat(undefined,{dateStyle:"medium",timeStyle:"short"}).format(new Date(value)):"Unavailable";
