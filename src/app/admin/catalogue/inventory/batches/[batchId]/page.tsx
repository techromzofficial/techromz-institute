"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Boxes, Clock3, MapPin, ShieldAlert } from "lucide-react";
import { PermissionGuard } from "@/components/admin/common/PermissionGuard";
import { StatusBadge } from "@/components/admin/common/StatusBadge";
import { LoadingSkeleton } from "@/components/admin/common/States";
import { inventoryApi, type BatchDetail } from "@/features/admin/catalogue/api/operationsApi";
import { CatalogueError, displayValue, formatDate, type LiveApiError } from "@/features/admin/catalogue/components/LiveCatalogueState";
import { CATALOGUE_PERMISSIONS } from "@/features/admin/catalogue/permissions/cataloguePermissions";

export default function CatalogueBatchPage(props:any){
 const routeParams=useParams<{batchId:string}>(),params=props?.params??routeParams;
 const[data,setData]=useState<BatchDetail|null>(null),[error,setError]=useState<LiveApiError|null>(null);
 useEffect(()=>{let active=true;inventoryApi.batch(params.batchId).then(x=>active&&setData(x)).catch(x=>active&&setError(x));return()=>{active=false}},[params.batchId]);
 return <PermissionGuard permission={CATALOGUE_PERMISSIONS.productsView}><div className="flex flex-col gap-4 p-4 md:p-6" data-testid="catalogue-batch-detail">
  <header><p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Catalogue / Inventory / Batch</p><Link href="/admin/catalogue/inventory" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#741d35]"><ArrowLeft size={13}/>Back to Inventory</Link></header>
  {!data&&!error&&<LoadingSkeleton/>}{error&&<CatalogueError error={error}/>} {data&&<>
   <section className="rounded border border-gray-200 bg-white p-5 shadow-sm"><div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"><div className="flex gap-4">{data.product?.image?<img src={data.product.image} alt="" className="h-20 w-20 rounded border object-cover"/>:<div className="grid h-20 w-20 place-items-center rounded bg-gray-100"><Boxes/></div>}<div><div className="flex items-center gap-2"><h1 className="text-xl font-bold">{data.lotNumber}</h1><StatusBadge status={data.status}/></div><p className="mt-1 text-sm font-semibold">{displayValue(data.product?.name)}</p><p className="text-xs text-gray-500">{displayValue(data.product?.sku,"No SKU")}{data.variantSku?` · ${data.variantSku}`:""}</p></div></div><div className="flex gap-2">{data.isQuarantined&&<StatusBadge status="quarantined"/>}{data.isRecalled&&<StatusBadge status="recalled"/>}</div></div>
    <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">{Object.entries(data.stock).map(([label,value])=><div key={label} className="rounded bg-gray-50 p-3"><span className="text-[10px] uppercase text-gray-500">{label}</span><strong className="mt-1 block text-lg">{value.toLocaleString()}</strong></div>)}</div>
   </section>
   <div className="grid gap-4 lg:grid-cols-3"><section className="rounded border bg-white p-4 lg:col-span-2"><h2 className="flex items-center gap-2 text-sm font-bold"><MapPin size={15}/>Warehouse locations</h2>{data.locations.length?<div className="mt-3 overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr className="border-b text-gray-500"><th className="py-2">Warehouse</th><th>Location</th><th>On hand</th><th>Available</th></tr></thead><tbody>{data.locations.map(x=><tr key={x.id} className="border-b"><td className="py-3">{displayValue(x.warehouseName)}<small className="block">{displayValue(x.warehouseCode)}</small></td><td>{displayValue(x.locationName,"No location")}<small className="block">{displayValue(x.locationCode,"")}</small></td><td>{x.onHand.toLocaleString()}</td><td>{x.available.toLocaleString()}</td></tr>)}</tbody></table></div>:<p className="mt-3 text-xs text-gray-500">No stock locations are linked to this batch.</p>}</section><aside className="rounded border bg-white p-4"><h2 className="flex items-center gap-2 text-sm font-bold"><Clock3 size={15}/>Batch dates</h2><dl className="mt-3 space-y-3 text-xs"><Fact label="Manufactured" value={data.manufacturedAt}/><Fact label="Received" value={data.receivedAt}/><Fact label="Expires" value={data.expiresAt}/></dl><div className="mt-4 rounded border border-blue-200 bg-blue-50 p-3 text-xs">Catalogue access is read-only. Adjustment, quarantine and recall actions remain unavailable here.</div></aside></div>
   <section className="rounded border bg-white p-4"><h2 className="flex items-center gap-2 text-sm font-bold"><ShieldAlert size={15}/>Inventory movement history</h2>{data.movements.length?<div className="mt-3 overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr className="border-b text-gray-500"><th className="py-2">Event</th><th>Change</th><th>Before / after</th><th>Reason</th><th>Actor</th><th>Occurred</th></tr></thead><tbody>{data.movements.map(x=><tr key={x.id} className="border-b"><td className="py-3">{x.type.replaceAll("_"," ")}</td><td className={x.quantityChange<0?"text-red-700":"text-green-700"}>{x.quantityChange>0?"+":""}{x.quantityChange}</td><td>{x.quantityBefore} / {x.quantityAfter}</td><td>{displayValue(x.reason)}</td><td>{displayValue(x.actorName,"System")}</td><td>{formatDate(x.occurredAt)}</td></tr>)}</tbody></table></div>:<p className="mt-3 text-xs text-gray-500">No movement history is recorded for this batch.</p>}</section>
  </>}
 </div></PermissionGuard>;
}
function Fact({label,value}:{label:string;value:string|null}){return <div><dt className="text-gray-500">{label}</dt><dd className="font-semibold">{value??"Unavailable"}</dd></div>}
