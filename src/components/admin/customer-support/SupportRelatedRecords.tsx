import Link from 'next/link';
import type { SupportRecord } from '@/types/supportApi';
import { supportLabel } from '@/types/supportApi';
import { supportTime } from './SupportWorkspace';
import styles from '@/app/admin/customer-support/cases/page.module.css';

export function SupportRelatedRecords({ record }: { record: SupportRecord }) {
  return <section className={styles.rightCard}>
    <h2 className={styles.rightCardTitle}>Authoritative business context</h2>
    <p className="mb-3 text-xs">Read-only source records. Refund, payment, and shipment states can only be changed by their owning workflows.</p>
    {Object.entries(record.context ?? {}).map(([kind, context]) => <article key={kind} className="mb-3 rounded border p-3">
      <h3 className="text-sm font-semibold">{supportLabel(kind)}</h3>
      {context.available ? <>
        <p className="text-sm">{context.label} · {context.status ?? 'Status unavailable'}</p>
        {context.amount && <p className="text-sm">{context.currency} {context.amount}</p>}
        {context.href && <Link className={styles.openCaseButton} href={context.href}>Open {kind} workspace</Link>}
        {context.items && <div className="mt-3"><h4 className="text-xs font-semibold">Order items (up to 100)</h4>{context.items.map((item, index) => <p className="text-xs" key={index}>{item.product_name} · Quantity {item.quantity}</p>)}</div>}
        {context.shipments && <div className="mt-3"><h4 className="text-xs font-semibold">Order shipments (up to 100)</h4>{context.shipments.length ? context.shipments.map(shipment => <p className="text-xs" key={shipment.href}><Link href={shipment.href} className="text-[#722140] underline">{shipment.reference}</Link> · {supportLabel(shipment.status)}</p>) : <p className="text-xs">No shipments recorded.</p>}</div>}
        {context.packages && <div className="mt-3"><h4 className="text-xs font-semibold">Shipment packages (up to 100)</h4>{context.packages.length ? context.packages.map(item => <p className="text-xs" key={item.uuid}>{item.package_type} · {item.weight_kg} kg · {item.tracking_number ?? 'Tracking not assigned'}</p>) : <p className="text-xs">No packages recorded.</p>}</div>}
        {context.sku && <p className="text-xs">SKU: {context.sku}</p>}
        {context.tracking && <div className="mt-3"><h4 className="text-xs font-semibold">Latest tracking events (up to 100)</h4>{context.tracking.length ? context.tracking.map((event, index) => <p className="text-xs" key={index}>{event.status} · {supportTime(event.occurred_at)}</p>) : <p className="text-xs">No tracking events recorded.</p>}</div>}
      </> : <p className="text-xs">{context.reason}</p>}
    </article>)}
    {Object.keys(record.context ?? {}).length === 0 && <p className="text-sm">No business records linked.</p>}
  </section>;
}
