'use client';
import { FormEvent, useEffect, useRef, useState } from 'react';
type Intake = { id: string; title: string; intake_code: string; registration_deadline_at: string; starts_at: string | null };

export default function InstituteRegistrationForm({ enabled }: { enabled: boolean }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [intakes, setIntakes] = useState<Intake[]>([]); const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false);
  const [challengeId, setChallengeId] = useState(''); const [verificationGrant, setVerificationGrant] = useState(''); const [code, setCode] = useState('');
  useEffect(() => { if (enabled) fetch('/api/institute/intakes', { cache: 'no-store' }).then((r) => r.ok ? r.json() : Promise.reject()).then((body) => setIntakes(body.intakes)).catch(() => setMessage('Registration is temporarily unavailable.')); }, [enabled]);
  async function requestVerification() {
    const data = new FormData(formRef.current!); const destination = String(data.get('email') || '').trim();
    if (!destination) { setMessage('Enter an email address first.'); return; }
    setBusy(true); setMessage(''); setVerificationGrant('');
    const response = await fetch('/api/institute/contact-verification/challenge', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'email', destination, purpose: 'registration' }) });
    const body = await response.json().catch(() => ({})); setBusy(false);
    if (response.ok) { setChallengeId(body.challengeId); setMessage('A verification code was sent to the selected contact.'); } else setMessage(body.message ?? 'Contact verification is not available.');
  }
  async function verifyCode() {
    setBusy(true); setMessage('');
    const response = await fetch('/api/institute/contact-verification/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ challengeId, token: code, purpose: 'registration' }) });
    const body = await response.json().catch(() => ({})); setBusy(false);
    if (response.ok) { setVerificationGrant(body.verificationGrant); setMessage('Contact verified. You can now submit the registration.'); } else setMessage(body.message ?? 'Invalid or expired verification code.');
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!verificationGrant) { setMessage('Verify your email address before submitting.'); return; }
    setBusy(true); setMessage(''); const data = new FormData(event.currentTarget);
    const response = await fetch('/api/institute/registrations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fullName: data.get('fullName'), email: data.get('email'), phone: data.get('phone'), intakeId: data.get('intakeId'), consent: data.get('consent') === 'on', verificationGrant }) });
    const body = await response.json().catch(() => ({})); setMessage(response.ok ? 'Registration received. This does not reserve a seat or confirm payment.' : body.message ?? 'Registration could not be submitted.'); setBusy(false);
    if (response.ok) { event.currentTarget.reset(); setChallengeId(''); setVerificationGrant(''); setCode(''); }
  }
  if (!enabled) return <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950"><h2 className="font-bold">Online registration is not active</h2><p className="mt-2 leading-7">Registration will open only after the production database, secure administration, backups and operational procedures have been validated.</p></div>;
  return <form ref={formRef} onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="grid gap-5 sm:grid-cols-2"><Field label="Full name" name="fullName" required/><Field label="Email address" name="email" type="email"/><Field label="Phone number" name="phone" type="tel"/><label className="text-sm font-semibold">Course intake<select name="intakeId" required className="mt-2 block w-full rounded-lg border border-slate-300 px-3 py-2"><option value="">Select an intake</option>{intakes.map((intake) => <option key={intake.id} value={intake.id}>{intake.title} — {intake.intake_code}</option>)}</select></label></div><div className="mt-5 rounded-lg border border-slate-200 p-4"><button type="button" onClick={requestVerification} disabled={busy || Boolean(verificationGrant)} className="rounded border border-blue-700 px-4 py-2 text-sm font-bold text-blue-700 disabled:opacity-50">{verificationGrant ? 'Contact verified' : 'Send verification code'}</button>{challengeId && !verificationGrant && <div className="mt-3 flex flex-wrap gap-2"><label className="text-sm font-semibold">Verification code<input value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" maxLength={6} className="ml-2 rounded border border-slate-300 px-3 py-2"/></label><button type="button" onClick={verifyCode} disabled={busy || code.length !== 6} className="rounded bg-blue-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Verify code</button></div>}</div><label className="mt-5 flex gap-3 text-sm leading-6"><input name="consent" type="checkbox" required className="mt-1"/><span>I consent to Techromz Institute using these details to process this course registration. Registration does not reserve a seat or confirm enrolment.</span></label><button disabled={busy || !intakes.length || !verificationGrant} className="mt-6 rounded-lg bg-blue-700 px-5 py-2.5 font-bold text-white disabled:opacity-50">Submit registration</button>{message && <p role="status" className="mt-4 text-sm text-slate-700">{message}</p>}</form>;
}
function Field({ label, name, type = 'text', required = false }: { label: string; name: string; type?: string; required?: boolean }) { return <label className="text-sm font-semibold">{label}<input name={name} type={type} required={required} maxLength={type === 'email' ? 254 : 160} className="mt-2 block w-full rounded-lg border border-slate-300 px-3 py-2"/></label>; }
