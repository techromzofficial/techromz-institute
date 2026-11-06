'use client';

import { FormEvent, useState } from 'react';
import { CheckCircle2, Search, ShieldAlert, ShieldCheck } from 'lucide-react';
import type { PublicCertificateRecord } from '../certificates/contracts';
import { validateCertificateId } from '../certificates/validation';
import { InstituteButton } from './InstituteButton';

type ViewState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'not_found' }
  | { kind: 'found'; certificate: PublicCertificateRecord };

export default function CertificateVerificationForm({ initialCertificateId = '' }: { initialCertificateId?: string }) {
  const [certificateId, setCertificateId] = useState(initialCertificateId);
  const [fieldError, setFieldError] = useState('');
  const [state, setState] = useState<ViewState>({ kind: 'idle' });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateCertificateId(certificateId);
    if (!validation.valid) {
      setFieldError(validation.message);
      setState({ kind: 'idle' });
      return;
    }
    setFieldError('');
    setCertificateId(validation.certificateId);
    setState({ kind: 'loading' });
    try {
      const result = await fetch('/api/institute/certificates/verify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ certificateId: validation.certificateId }), cache: 'no-store',
      });
      const data = await result.json();
      if (result.status === 429 || result.status === 503) {
        setState({ kind: 'error', message: data.message });
      } else if (!result.ok) {
        setState({ kind: 'error', message: data.message || 'Unable to verify this certificate.' });
      } else if (data.outcome === 'not_found') {
        setState({ kind: 'not_found' });
      } else if (data.outcome === 'found') {
        setState({ kind: 'found', certificate: data.certificate });
      } else {
        setState({ kind: 'error', message: 'Unable to verify this certificate.' });
      }
    } catch {
      setState({ kind: 'error', message: 'Certificate verification is temporarily unavailable. Please try again later.' });
    }
  }

  return <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-blue-950/5 sm:p-10">
      <div className="max-w-2xl"><p className="text-sm font-bold uppercase tracking-[.16em] text-blue-700">Certificate verification</p><h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Verify a Techromz Institute certificate</h1><p className="mt-4 leading-7 text-slate-600">Enter the complete certificate ID exactly as it appears on the digital certificate. Verification displays only the minimum public information needed to confirm authenticity.</p></div>
      <form onSubmit={submit} noValidate className="mt-8" aria-describedby="certificate-help">
        <label htmlFor="certificate-id" className="text-sm font-bold text-slate-900">Certificate ID</label>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row"><input id="certificate-id" name="certificateId" value={certificateId} onChange={(event) => { setCertificateId(event.target.value); setFieldError(''); }} autoComplete="off" spellCheck={false} maxLength={28} aria-invalid={Boolean(fieldError)} aria-describedby={fieldError ? 'certificate-error certificate-help' : 'certificate-help'} placeholder="TIT-XXXXXXXXXXXXXXXXXXXXXXXX" className="h-12 min-w-0 flex-1 rounded-lg border border-slate-300 px-4 font-mono uppercase tracking-wide text-slate-950 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100" /><InstituteButton type="submit" disabled={state.kind === 'loading'} className="h-12 shrink-0"><Search size={18} aria-hidden="true" />{state.kind === 'loading' ? 'Verifying…' : 'Verify Certificate'}</InstituteButton></div>
        <p id="certificate-help" className="mt-2 text-xs leading-5 text-slate-500">Certificate IDs start with TIT- and contain 24 letters or numbers. Do not enter a student name, email address or contact number.</p>
        {fieldError && <p id="certificate-error" role="alert" className="mt-2 text-sm font-semibold text-red-700">{fieldError}</p>}
      </form>

      <div className="mt-8" aria-live="polite" aria-busy={state.kind === 'loading'}>
        {state.kind === 'loading' && <div role="status" className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-blue-950">Checking the certificate record securely…</div>}
        {state.kind === 'error' && <div role="alert" className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950"><ShieldAlert className="mt-0.5 shrink-0" aria-hidden="true" /><div><h2 className="font-bold">Verification unavailable</h2><p className="mt-1 text-sm leading-6">{state.message}</p></div></div>}
        {state.kind === 'not_found' && <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><h2 className="font-bold text-slate-950">Certificate not found</h2><p className="mt-1 text-sm leading-6 text-slate-600">Check the certificate ID and try again. This result does not disclose whether a student has studied at Techromz Institute.</p></div>}
        {state.kind === 'found' && <CertificateResult certificate={state.certificate} />}
      </div>
    </div>
  </div>;
}

function CertificateResult({ certificate }: { certificate: PublicCertificateRecord }) {
  const revoked = certificate.status === 'revoked';
  return <section className={`rounded-2xl border p-6 ${revoked ? 'border-red-200 bg-red-50' : 'border-emerald-200 bg-emerald-50'}`} aria-label="Certificate verification result">
    <div className="flex items-start gap-3">{revoked ? <ShieldAlert className="mt-0.5 shrink-0 text-red-700" aria-hidden="true" /> : <ShieldCheck className="mt-0.5 shrink-0 text-emerald-700" aria-hidden="true" />}<div><p className="text-sm font-bold uppercase tracking-[.14em] text-slate-600">Verification result</p><h2 className="mt-1 text-2xl font-bold text-slate-950">{revoked ? 'Certificate revoked' : 'Valid certificate'}</h2></div></div>
    <dl className="mt-6 grid gap-4 sm:grid-cols-2">{[
      ['Student name', certificate.studentName], ['Course name', certificate.courseName], ['Certificate ID', certificate.certificateId], ['Certificate issue date', new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Colombo' }).format(new Date(certificate.issuedAt))], ['Issuing organisation', certificate.issuerName], ['Certificate status', revoked ? 'Revoked' : 'Valid'],
    ].map(([label, value]) => <div key={label} className="rounded-xl border border-white/80 bg-white/75 p-4"><dt className="text-xs font-bold uppercase tracking-[.12em] text-slate-500">{label}</dt><dd className="mt-1 break-words font-semibold text-slate-950">{value}</dd></div>)}</dl>
    {!revoked && <p className="mt-5 flex gap-2 text-sm font-semibold text-emerald-900"><CheckCircle2 className="shrink-0" size={18} aria-hidden="true" />This record confirms a Techromz Institute Certificate of Completion. It does not imply government, university or external accreditation.</p>}
  </section>;
}
