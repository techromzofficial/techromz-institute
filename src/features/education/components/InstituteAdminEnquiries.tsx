'use client';
import { useState } from 'react';

type Enquiry = { id: string; fullName: string; email: string; phone: string | null; courseName: string; subject: string; message: string; notificationStatus: string };

export default function InstituteAdminEnquiries() {
  const [items, setItems] = useState<Enquiry[]>([]), [page, setPage] = useState(0), [hasMore, setHasMore] = useState(true);
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  async function load(next: number) {
    if (busy) return;
    setBusy(true); setError('');
    try {
      const response = await fetch(`/api/institute/admin/enquiries?page=${next}`, { cache: 'no-store' });
      if (!response.ok) throw new Error('Could not load enquiries. Sign in again or retry.');
      const body = await response.json(); setItems(body.enquiries); setHasMore(body.hasMore); setPage(next);
    } catch { setError('Could not load enquiries. Sign in again or retry.'); }
    finally { setBusy(false); }
  }
  return <section><h2 className="text-2xl font-bold">Course enquiries</h2>
    <p className="mt-2 text-sm text-slate-600">Contact details are restricted to enrolment staff. Access is audited.</p>
    <button onClick={() => void load(page || 1)} disabled={busy} className="mt-3 rounded border px-4 py-2 font-semibold disabled:opacity-50">{busy ? 'Loading enquiries...' : page ? 'Refresh enquiries' : 'Load enquiries'}</button>
    {error && <p role="alert" className="mt-3 text-rose-700">{error}</p>}
    {page > 0 && !items.length && <p role="status" className="mt-3">No enquiries on this page.</p>}
    <div className="mt-4 space-y-4">{items.map(item => <article key={item.id} className="rounded-xl border p-4">
      <h3 className="font-bold">{item.courseName}: {item.subject}</h3>
      <p className="mt-2">{item.fullName} — {item.email}{item.phone ? ` — ${item.phone}` : ''}</p>
      <p className="mt-3 whitespace-pre-wrap break-words">{item.message}</p>
      <p className="mt-3 break-all text-xs text-slate-500">Reference: {item.id} · Notification: {item.notificationStatus}</p>
    </article>)}</div>
    {page > 0 && <div className="mt-4 flex gap-3"><button disabled={busy || page <= 1} onClick={() => void load(page - 1)} className="rounded border px-3 py-2 disabled:opacity-50">Previous</button><span className="py-2">Page {page}</span><button disabled={busy || !hasMore} onClick={() => void load(page + 1)} className="rounded border px-3 py-2 disabled:opacity-50">Next</button></div>}
  </section>;
}
