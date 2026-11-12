'use client';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { Mail, X } from 'lucide-react';
import toast from 'react-hot-toast';
import EnquirySuccessNotification from './EnquirySuccessNotification';
import { InstituteButton, instituteButtonClassName } from './InstituteButton';
import { getInstituteContactLinks } from '../config/contact';

const unavailableMessage = 'Email enquiries are temporarily unavailable. Please try again later.';

export default function CourseEnquiryButton({ courseId, courseName, className = '' }: { courseId: string; courseName: string; className?: string }) {
  const [open, setOpen] = useState(false), [submitting, setSubmitting] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null), [valid, setValid] = useState(false);
  const [messageLength, setMessageLength] = useState(0);
  const [resendAt, setResendAt] = useState(0), [countdown, setCountdown] = useState(0);
  const [completed, setCompleted] = useState(false);
  const operation = useRef(false), revision = useRef(0), lifecycle = useRef(0);
  const [verificationBusy, setVerificationBusy] = useState(false), [challengeId, setChallengeId] = useState('');
  const [verificationGrant, setVerificationGrant] = useState(''), [code, setCode] = useState(''), [idempotencyKey, setIdempotencyKey] = useState('');
  const [status, setStatus] = useState<{ kind: 'error' | 'success'; message: string } | null>(null);
  const trigger = useRef<HTMLButtonElement>(null), firstField = useRef<HTMLInputElement>(null), dialog = useRef<HTMLElement>(null), formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    setOpen(false); setCompleted(false); setStatus(null); setSubmitting(false); setVerificationBusy(false);
    return () => { revision.current++; lifecycle.current++; operation.current = false; };
  }, [courseId]);
  useEffect(() => {
    if (!open || !completed) return;
    const timer = window.setTimeout(() => { setOpen(false); trigger.current?.focus(); }, 2000);
    return () => window.clearTimeout(timer);
  }, [open, completed, courseId]);
  useEffect(() => {
    if (!open) return;
    firstField.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [open]);
  useEffect(() => {
    if (!open) return;
    let active = true;
    if (available === null) fetch('/api/institute/course-enquiries', { cache: 'no-store' }).then(async (response) => {
      const result = await response.json().catch(() => ({}));
      if (active) {
        setAvailable(response.ok && result.available === true);
      }
    }).catch(() => { if (active) setAvailable(false); });
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !submitting && !verificationBusy) { setOpen(false); trigger.current?.focus(); }
      if (event.key !== 'Tab') return;
      const focusable = Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]):not([tabindex="-1"]), textarea:not([disabled])') ?? []);
      if (!focusable.length) return;
      const first = focusable[0]!, last = focusable.at(-1)!;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', keyboard); return () => { active = false; document.removeEventListener('keydown', keyboard); };
  }, [open, submitting, verificationBusy, available]);

  useEffect(() => {
    const update = () => setCountdown(Math.max(0, Math.ceil((resendAt - Date.now()) / 1000)));
    update(); const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [resendAt]);

  function invalidateEmail() {
    revision.current++; setChallengeId(''); setVerificationGrant(''); setCode(''); setResendAt(0); setStatus(null);
  }
  async function requestVerification() {
    if (operation.current || countdown > 0) return;
    const form = formRef.current!;
    const email = new FormData(form).get('email');
    if (typeof email !== 'string' || !(form.elements.namedItem('email') as HTMLInputElement).checkValidity()) {
      setStatus({ kind: 'error', message: 'Enter a valid email address first.' }); return;
    }
    operation.current = true; const current = revision.current, generation = lifecycle.current;
    setVerificationBusy(true); setStatus(null);
    try {
      const response = await fetch('/api/institute/contact-verification/challenge', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'email', destination: email, purpose: 'course_enquiry', courseId }) });
      const result = await response.json().catch(() => ({}));
      if (current !== revision.current) return;
      if (!response.ok || result.accepted !== true) {
        if (response.status === 429) setResendAt(Date.now() + (Number(response.headers.get('Retry-After')) || 60) * 1000);
        throw new Error(result.message || 'We could not send a verification code. Please try again.');
      }
      setChallengeId(result.challengeId); setCode(''); setResendAt(Date.now() + (Number(result.resendAfterSeconds) || 60) * 1000);
      setStatus({ kind: 'success', message: `A verification code was accepted for delivery to the email address you entered. It expires in ${Number(result.expiresInMinutes) || 5} minutes.` });
    } catch (error) { if (current === revision.current) setStatus({ kind: 'error', message: error instanceof Error ? error.message : 'We could not send a verification code.' }); }
    finally { if (generation === lifecycle.current) { operation.current = false; setVerificationBusy(false); } }
  }
  async function verifyCode() {
    if (operation.current) return;
    operation.current = true; const current = revision.current, generation = lifecycle.current;
    setVerificationBusy(true); setStatus(null);
    try {
      const response = await fetch('/api/institute/contact-verification/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ challengeId, token: code, purpose: 'course_enquiry', courseId }) });
      const result = await response.json().catch(() => ({}));
      if (current !== revision.current) return;
      if (!response.ok || result.verified !== true) throw new Error(result.message || 'Invalid or expired verification code.');
      setVerificationGrant(result.verificationGrant); setCode(''); setValid(formRef.current!.checkValidity());
      setStatus({ kind: 'success', message: 'Email verified. You can now send your enquiry.' });
    } catch (error) { if (current === revision.current) setStatus({ kind: 'error', message: error instanceof Error ? error.message : 'Invalid or expired verification code.' }); }
    finally { if (generation === lifecycle.current) { operation.current = false; setVerificationBusy(false); } }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (operation.current || completed || !verificationGrant) return;
    operation.current = true; const current = revision.current;
    setSubmitting(true); setStatus(null);
    const form = event.currentTarget, data = new FormData(form);
    try {
      const response = await fetch('/api/institute/course-enquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fullName: data.get('fullName'), email: data.get('email'), phone: data.get('phone'), courseId, subject: data.get('subject'), message: data.get('message'), website: data.get('website'), verificationGrant, idempotencyKey }) });
      const result = await response.json().catch(() => ({}));
      if (current !== revision.current) return;
      if (!response.ok || result.accepted !== true) throw new Error(result.message || 'We could not save your enquiry. Retry with this form to avoid duplicates.');
      toast.custom((notification) => <EnquirySuccessNotification visible={notification.visible} />, { duration: 4000, position: 'top-center' });
      try { sessionStorage.removeItem(`institute-enquiry-key:${courseId}`); } catch { /* Storage can be restricted by browser policy. */ }
      setCompleted(true); form.reset(); setValid(false); setMessageLength(0); setVerificationGrant(''); setChallengeId(''); setCode('');
    } catch (error) { if (current === revision.current) setStatus({ kind: 'error', message: error instanceof Error ? error.message : 'We could not save your enquiry. Retry with this form to avoid duplicates.' }); }
    finally { if (current === revision.current) { operation.current = false; setSubmitting(false); } }
  }

  return <>
    <button ref={trigger} type="button" onClick={() => { setStatus(null); setAvailable(null); setValid(false); setMessageLength(0); revision.current++; setCompleted(false); setResendAt(0); setChallengeId(''); setVerificationGrant(''); setCode(''); setIdempotencyKey(pendingIdempotencyKey(courseId)); setOpen(true); }} className={instituteButtonClassName('email', className)}><Mail size={18} aria-hidden="true" /> Email enquiry</button>
    {open && <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/60 p-0 sm:items-center sm:p-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !submitting && !verificationBusy) { setOpen(false); trigger.current?.focus(); } }}>
      <section ref={dialog} role="dialog" aria-modal="true" aria-labelledby="course-enquiry-title" className="max-h-[95vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl sm:max-w-xl sm:rounded-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4"><div><h2 id="course-enquiry-title" className="text-2xl font-bold text-slate-950">Email course enquiry</h2><p className="mt-1 text-sm text-slate-600">Send your message directly to the Institute enrolments team.</p></div><button type="button" aria-label="Close enquiry form" disabled={submitting || verificationBusy} onClick={() => { setOpen(false); trigger.current?.focus(); }} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"><X aria-hidden="true" /></button></div>
        <form ref={formRef} className="mt-6 space-y-4" onSubmit={submit} onInput={(event) => { setValid(event.currentTarget.checkValidity()); const target = event.target; if (target instanceof HTMLTextAreaElement && target.name === 'message') setMessageLength(target.value.length); }}>
          <Field label="Full name" name="fullName" required inputRef={firstField} autoComplete="name" disabled={submitting || completed} />
          <Field label="Email address" name="email" required type="email" autoComplete="email" disabled={submitting || completed} onChange={invalidateEmail} />
          <div className="rounded-lg border border-slate-200 p-4">
            <button type="button" onClick={requestVerification} disabled={verificationBusy || submitting || completed || countdown > 0 || available !== true || Boolean(verificationGrant)} className={`rounded border px-4 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50 ${verificationGrant ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-blue-700 text-blue-700'}`}>{verificationGrant ? 'Email Verified' : verificationBusy ? 'Please wait...' : challengeId ? 'Resend OTP' : 'Verify Email'}</button>
            {challengeId && !verificationGrant && <div className="mt-3 flex flex-wrap items-end gap-2"><label htmlFor="course-enquiry-code" className="text-sm font-semibold text-slate-800">Verification code<input id="course-enquiry-code" autoFocus value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" maxLength={6} className="mt-1 block rounded border border-slate-300 px-3 py-2 text-slate-900" /></label><button type="button" onClick={verifyCode} disabled={verificationBusy || code.length !== 6} className="rounded bg-blue-700 px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">Verify OTP</button></div>}
            {countdown > 0 && !verificationGrant && <p role="status" className="mt-2 text-sm text-slate-600">Request another code in {countdown} seconds.</p>}
          </div>
          <Field label="Phone number (optional)" name="phone" type="tel" autoComplete="tel" pattern={'[+\\(\\)\\-\\s0-9]{7,40}'} disabled={submitting || completed} />
          <div><label htmlFor="course-enquiry-course" className="block text-sm font-bold text-slate-800">Course name</label><input id="course-enquiry-course" value={courseName} readOnly className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2.5 text-slate-700" /></div>
          <Field label="Enquiry subject" name="subject" required minLength={3} maxLength={160} disabled={submitting || completed} />
          <div><label htmlFor="course-enquiry-message" className="block text-sm font-bold text-slate-800">Enquiry message</label><textarea id="course-enquiry-message" name="message" disabled={submitting || completed} required minLength={10} maxLength={4000} rows={5} spellCheck={false} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200" /><p aria-live="polite" className={`mt-1 text-xs ${messageLength > 0 && messageLength < 10 ? 'text-amber-800' : 'text-slate-500'}`}>{messageLength < 10 ? `Enter at least 10 characters (${10 - messageLength} more required).` : `${messageLength}/4000 characters`}</p></div>
          <div className="absolute -left-[10000px]" aria-hidden="true"><label htmlFor="course-enquiry-website">Website</label><input id="course-enquiry-website" name="website" tabIndex={-1} autoComplete="off" /></div>
          {available === null && <p role="status" className="rounded-lg bg-slate-100 p-3 text-sm font-semibold text-slate-700">Checking email availability…</p>}
          {available === false && <p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm font-semibold text-amber-900">{unavailableMessage} <a className="underline" href={getInstituteContactLinks(courseName).whatsapp} target="_blank" rel="noopener noreferrer">Enquire on WhatsApp</a></p>}
          {status && <p role={status.kind === 'error' ? 'alert' : 'status'} className={`rounded-lg p-3 text-sm font-semibold ${status.kind === 'error' ? 'bg-red-50 text-red-800' : 'bg-emerald-50 text-emerald-800'}`}>{status.message}</p>}
          <InstituteButton type="submit" disabled={completed || submitting || verificationBusy || available !== true || !valid || !verificationGrant} className="w-full">{completed ? 'Enquiry saved' : submitting ? 'Saving enquiry...' : 'Send enquiry'}</InstituteButton>
        </form>
      </section>
    </div>}
  </>;
}

function Field({ label, name, inputRef, ...props }: { label: string; name: string; inputRef?: React.Ref<HTMLInputElement> } & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = `course-enquiry-${name}`;
  return <div><label htmlFor={id} className="block text-sm font-bold text-slate-800">{label}</label><input ref={inputRef} id={id} name={name} spellCheck={false} maxLength={name === 'fullName' ? 100 : name === 'email' ? 254 : name === 'subject' ? 160 : 40} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200" {...props} /></div>;
}

function createIdempotencyKey(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6]! & 0x0f) | 0x40;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function pendingIdempotencyKey(courseId: string): string {
  const key = createIdempotencyKey();
  try {
    const storageKey = `institute-enquiry-key:${courseId}`;
    const previous = sessionStorage.getItem(storageKey);
    if (previous && /^[0-9a-f-]{36}$/i.test(previous)) return previous;
    sessionStorage.setItem(storageKey, key);
  } catch { /* Retain in-memory protection when browser storage is unavailable. */ }
  return key;
}
