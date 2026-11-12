import styles from './EnquirySuccessNotification.module.css';

export default function EnquirySuccessNotification({ visible }: { visible: boolean }) {
  return <div role="status" aria-live="polite" aria-atomic="true" className={`${styles.notification} ${visible ? styles.visible : styles.hidden} pointer-events-none flex w-full max-w-md items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950 shadow-lg`}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className={`${styles.checkmark} mt-0.5 h-6 w-6 shrink-0 text-emerald-700`}><circle cx="12" cy="12" r="10" /><path d="m7 12 3 3 7-7" /></svg>
    <div><p className="text-sm font-bold">Enquiry Submitted Successfully!</p><p className="mt-1 text-sm leading-5">Thank you for your interest! Your enquiry has been received and queued for our enrolments team. We will contact you soon.</p></div>
  </div>;
}
