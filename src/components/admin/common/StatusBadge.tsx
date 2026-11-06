import {statusTone} from "@/lib/admin";
export function StatusBadge({status}:{status:string}){const tone=statusTone(status);return <span className={`badge ${tone}`}><span className="sr-only">Status: </span>{status}</span>}
