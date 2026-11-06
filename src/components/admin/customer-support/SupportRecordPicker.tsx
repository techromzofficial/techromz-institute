'use client';
import { useEffect, useId, useState } from 'react';
import { lookupSupportRecords, supportError } from '@/services/api/customerSupportService';
import type { SupportLookup } from '@/types/supportApi';
import styles from '@/app/admin/customer-support/cases/page.module.css';

/** Search results are tenant- and permission-filtered by the existing API client. */
export function SupportRecordPicker({ kind, label, value, onChange, required = false }: {
  kind: string; label: string; value: string; onChange: (value: string) => void; required?: boolean;
}) {
  const id = useId();
  const [search, setSearch] = useState('');
  const [options, setOptions] = useState<SupportLookup[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let current = true;
    const timer = setTimeout(() => {
      setLoading(true); setError('');
      lookupSupportRecords(kind, search).then(result => { if (current) setOptions(result.data); })
        .catch(cause => { if (current) { setOptions([]); setError(supportError(cause)); } })
        .finally(() => { if (current) setLoading(false); });
    }, 250);
    return () => { current = false; clearTimeout(timer); };
  }, [kind, search, retry]);
  return <div className={styles.formGroup}>
    <label htmlFor={`${id}-search`} className={styles.formLabel}>Search {label.toLowerCase()}</label>
    <input id={`${id}-search`} className={styles.formInput} value={search} maxLength={100} onChange={e => setSearch(e.target.value)} />
    <label htmlFor={id} className={styles.formLabel}>{label}</label>
    <select id={id} className={styles.formSelect} value={value} required={required} onChange={e => onChange(e.target.value)} aria-describedby={`${id}-status`}>
      <option value="">Select {label.toLowerCase()}</option>
      {value && !options.some(option => option.id === value) && <option value={value}>Selected record ({value})</option>}
      {options.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}
    </select>
    <span id={`${id}-status`} className="text-xs text-slate-500" role="status">{loading ? 'Searching…' : error || `${options.length} matching records`}</span>
    {error && <button type="button" className={styles.btnSecondary} onClick={() => setRetry(n => n + 1)}>Retry lookup</button>}
  </div>;
}
