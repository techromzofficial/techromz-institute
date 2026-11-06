'use client';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { Mail, X } from 'lucide-react';
import { InstituteButton, instituteButtonClassName } from './InstituteButton';

export default function CourseEnquiryButton({ courseName, className = '' }: { courseName: string; className?: string }) {
  const [open, setOpen] = useState(false), [submitting, setSubmitting] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null), [valid, setValid] = useState(false);
  const [verificationBusy, setVerificationBusy] = useState(false), [challengeId, setChallengeId] = useState('');
  const [verificationGrant, setVerificationGrant] = useState(''), [code, setCode] = useState(''), [idempotencyKey, setIdempotencyKey] = useState('');
  const [status, setStatus] = useState<{ kind: 'error' | 'success'; message: string } | null>(null);
  const trigger = useRef<HTMLButtonElement>(null), firstField = useRef<HTMLInputElement>(null), dialog = useRef<HTMLElement>(null), formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (!open) return;
    firstField.current?.focus();
    let active = true;
    if (available === null) fetch('/api/institute/course-enquiries', { cache: 'no-store' }).then(async (response) => {
      const result = await response.json().catch(() => ({}));
      if (active) setAvailable(response.ok && result.available === true);
    }).catch(() => { if (active) setAvailable(false); });
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !submitting) { setOpen(false); trigger.current?.focus(); }
      if (event.key !== 'Tab') return;
      const focusable = Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]):not([tabindex="-1"]), textarea:not([disabled])') ?? []);
      if (!focusable.length) return;
      const first = focusable[0]!, last = focusable.at(-1)!;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', keyboard); return () => { active = false; document.removeEventListener('keydown', keyboard); };
  }, [open, submitting, available]);

  async function requestVerification() {
    const email = new FormData(formRef.current!).get('email');
    if (typeof email !== 'string' || !formRef.current?.elements.namedItem('email') || !(formRef.current.elements.namedItem('email') as HTMLInputElement).checkValidity()) {
      setStatus({ kind: 'error', message: 'Enter a valid email address first.' }); return;
    }
    setVerificationBusy(true); setStatus(null);
    try {
      const response = await fetch('/api/institute/contact-verification/challenge', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'email', destination: email, purpose: 'course_enquiry' }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.accepted !== true) throw new Error(result.message || 'We could not send a verification code.');
      setChallengeId(result.challengeId); setCode(''); setStatus({ kind: 'success', message: 'A verification code was sent to your email address.' });
    } catch (error) { setStatus({ kind: 'error', message: error instanceof Error ? error.message : 'We could not send a verification code.' }); }
    finally { setVerificationBusy(false); }
  }

  async function verifyCode() {
    setVerificationBusy(true); setStatus(null);
    try {
      const response = await fetch('/api/institute/contact-verification/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ challengeId, token: code, purpose: 'course_enquiry' }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.verified !== true) throw new Error(result.message || 'Invalid or expired verification code.');
      setVerificationGrant(result.verificationGrant); setStatus({ kind: 'success', message: 'Email verified. You can now send your enquiry.' });
    } catch (error) { setStatus({ kind: 'error', message: error instanceof Error ? error.message : 'Invalid or expired verification code.' }); }
    finally { setVerificationBusy(false); }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSubmitting(true); setStatus(null);
    const form = event.currentTarget, data = new FormData(form);
    try {
      const response = await fetch('/api/institute/course-enquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fullName: data.get('fullName'), email: data.get('email'), phone: data.get('phone'), courseName, message: data.get('message'), website: data.get('website'), verificationGrant, idempotencyKey }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.accepted !== true) throw new Error(result.message || 'We could not send your enquiry. Please try again or use WhatsApp.');
      setStatus({ kind: 'success', message: result.duplicate ? 'This enquiry was already received.' : 'Your enquiry was recorded and accepted for delivery.' }); form.reset(); setValid(false); setVerificationGrant(''); setChallengeId(''); setCode(''); setIdempotencyKey(crypto.randomUUID());
    } catch (error) { setStatus({ kind: 'error', message: error instanceof Error ? error.message : 'We could not send your enquiry. Please try again or use WhatsApp.' }); }
    finally { setSubmitting(false); }
  }

  return <>
    <button ref={trigger} type="button" onClick={() => { setStatus(null); setAvailable(null); setValid(false); setChallengeId(''); setVerificationGrant(''); setCode(''); setIdempotencyKey(crypto.randomUUID()); setOpen(true); }} className={instituteButtonClassName('email', className)}><Mail size={18} aria-hidden="true" /> Email enquiry</button>
    {open && <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/60 p-0 sm:items-center sm:p-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !submitting) setOpen(false); }}>
      <section ref={dialog} role="dialog" aria-modal="true" aria-labelledby="course-enquiry-title" className="max-h-[95vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl sm:max-w-xl sm:rounded-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4"><div><h2 id="course-enquiry-title" className="text-2xl font-bold text-slate-950">Email course enquiry</h2><p className="mt-1 text-sm text-slate-600">Send your message directly to the Institute enrolments team.</p></div><button type="button" aria-label="Close enquiry form" disabled={submitting} onClick={() => { setOpen(false); trigger.current?.focus(); }} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"><X aria-hidden="true" /></button></div>
        <form ref={formRef} className="mt-6 space-y-4" onSubmit={submit} onInput={(event) => setValid(event.currentTarget.checkValidity())}>
          <Field label="Full name" name="fullName" required inputRef={firstField} autoComplete="name" />
          <Field label="Email address" name="email" required type="email" autoComplete="email" onChange={() => { setChallengeId(''); setVerificationGrant(''); setCode(''); }} />
          <div className="rounded-lg border border-slate-200 p-4">
            <button type="button" onClick={requestVerification} disabled={verificationBusy || available !== true || Boolean(verificationGrant)} className="rounded border border-blue-700 px-4 py-2 text-sm font-bold text-blue-700 disabled:cursor-not-allowed disabled:opacity-50">{verificationGrant ? 'Email verified' : verificationBusy ? 'Please wait…' : 'Send verification code'}</button>
            {challengeId && !verificationGrant && <div className="mt-3 flex flex-wrap items-end gap-2"><label htmlFor="course-enquiry-code" className="text-sm font-semibold text-slate-800">Verification code<input id="course-enquiry-code" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" maxLength={6} className="mt-1 block rounded border border-slate-300 px-3 py-2" /></label><button type="button" onClick={verifyCode} disabled={verificationBusy || code.length !== 6} className="rounded bg-blue-700 px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">Verify code</button></div>}
          </div>
          <Field label="Phone number (optional)" name="phone" type="tel" autoComplete="tel" />
          <div><label htmlFor="course-enquiry-course" className="block text-sm font-bold text-slate-800">Course name</label><input id="course-enquiry-course" value={courseName} readOnly className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2.5 text-slate-700" /></div>
          <div><label htmlFor="course-enquiry-message" className="block text-sm font-bold text-slate-800">Enquiry message</label><textarea id="course-enquiry-message" name="message" required minLength={10} maxLength={4000} rows={5} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200" /></div>
          <div className="absolute -left-[10000px]" aria-hidden="true"><label htmlFor="course-enquiry-website">Website</label><input id="course-enquiry-website" name="website" tabIndex={-1} autoComplete="off" /></div>
          {available === null && <p role="status" className="rounded-lg bg-slate-100 p-3 text-sm font-semibold text-slate-700">Checking email availability…</p>}
          {available === false && <p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm font-semibold text-amber-900">Direct email submission is not configured on this server. Please use WhatsApp or try again later.</p>}
          {status && <p role={status.kind === 'error' ? 'alert' : 'status'} className={`rounded-lg p-3 text-sm font-semibold ${status.kind === 'error' ? 'bg-red-50 text-red-800' : 'bg-emerald-50 text-emerald-800'}`}>{status.message}</p>}
          <InstituteButton type="submit" disabled={submitting || verificationBusy || available !== true || !valid || !verificationGrant} className="w-full">{submitting ? 'Sending enquiry…' : 'Send enquiry'}</InstituteButton>
        </form>
      </section>
    </div>}
  </>;
}

function Field({ label, name, inputRef, ...props }: { label: string; name: string; inputRef?: React.Ref<HTMLInputElement> } & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = `course-enquiry-${name}`;
  return <div><label htmlFor={id} className="block text-sm font-bold text-slate-800">{label}</label><input ref={inputRef} id={id} name={name} maxLength={name === 'fullName' ? 100 : name === 'email' ? 254 : 40} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200" {...props} /></div>;
}
