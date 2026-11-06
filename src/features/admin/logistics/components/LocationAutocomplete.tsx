"use client";

import { useEffect, useRef, useState } from "react";
import { logisticsApi, type LogisticsGeocodingResult } from "@/lib/api/logistics";

const cache = new Map<string, LogisticsGeocodingResult[]>();

type Props = { label: string; value: string; city: string; country: string; onTextChange: (value: string) => void; onSelect: (result: LogisticsGeocodingResult) => void };

export default function LocationAutocomplete({ label, value, city, country, onTextChange, onSelect }: Props) {
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<LogisticsGeocodingResult[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const request = useRef(0);
  const query = [value, city, country].map((part) => part.trim()).filter(Boolean).join(", ");

  useEffect(() => {
    if (!active || query.length < 3) { setResults([]); return; }
    const current = ++request.current;
    const timer = window.setTimeout(async () => {
      setLoading(true); setMessage(null);
      try {
        const key = query.toLocaleLowerCase();
        const cached = cache.get(key);
        const matches = cached ?? (await logisticsApi.searchWorldwideLocations(query)).data;
        if (!cached) cache.set(key, matches);
        if (current !== request.current) return;
        setResults(matches);
        setMessage(matches.length ? null : "Location not found. Refine the country, city or address.");
      } catch {
        if (current === request.current) { setResults([]); setMessage("Unable to resolve location. Please retry or refine the location."); }
      } finally {
        if (current === request.current) setLoading(false);
      }
    }, 600);
    return () => { window.clearTimeout(timer); request.current += 1; };
  }, [active, query]);

  return <div className="relative">
    <label className="text-sm"><span aria-hidden="true" className="font-semibold" style={{ color: "#dc2626" }}>*</span> {label}
      <input required aria-required="true" aria-label={label} value={value} autoComplete="off" onFocus={() => setActive(true)} onChange={(event) => { setActive(true); onTextChange(event.target.value); setMessage(null); }} className="mt-1 w-full rounded border p-2"/>
    </label>
    {loading ? <p role="status" className="mt-1 text-xs text-slate-500">Finding location…</p> : message ? <p role="status" className="mt-1 text-xs text-amber-700">{message}</p> : null}
    {active && results.length ? <ul role="listbox" aria-label={`${label} suggestions`} className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-xl">{results.map((result) => <li key={result.id}><button type="button" role="option" aria-selected={false} onMouseDown={(event) => event.preventDefault()} onClick={() => { onSelect(result); setResults([]); setActive(false); setMessage("Location found"); }} className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50"><span className="block font-medium text-slate-800">{result.display_name}</span><span className="text-xs text-slate-500">{[result.region, result.country].filter(Boolean).join(", ")}</span></button></li>)}</ul> : null}
  </div>;
}
