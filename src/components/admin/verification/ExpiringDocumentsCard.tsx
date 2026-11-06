'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { expiringDocuments } from '@/mocks/admin/supplierQueue.mock';

export function ExpiringDocumentsCard() {
  const [docs, setDocs] = useState<typeof expiringDocuments | null>(null);

  useEffect(() => {
    let active = true;
    setTimeout(() => {
      if (active) setDocs(expiringDocuments);
    }, 600);
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="card">
      <div className="card-heading">
        <p className="eyebrow">Expiring in 30 days</p>
        <span className="badge danger">{docs?.length ?? '...'}</span>
      </div>
      {!docs ? (
        <div>
          <div className="skeleton" style={{ height: 48, borderRadius: 8, marginTop: 10 }} />
          <div className="skeleton" style={{ height: 48, borderRadius: 8, marginTop: 10 }} />
        </div>
      ) : (
        <>
          {docs.map((doc) => (
            <div className="expiry-row" key={doc.supplier}>
              <strong>{doc.supplier}</strong>
              <small>
                {doc.document} · {doc.days} days remaining
              </small>
            </div>
          ))}
          <Link href="/admin/verification-compliance/supplier-verification?status=information_requested" className="text-link">
            View expiring queue →
          </Link>
        </>
      )}
    </section>
  );
}
