'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { verificationSuppliers } from '@/mocks/admin/caseDetail.mock';
import { suppliers as fixtureSuppliers } from '@/mocks/admin/fixtures';
import { StatusBadge } from '@/components/admin/common/StatusBadge';

const PAGE_SIZE = 5;

// Combined list mapping fixture suppliers + verificationSuppliers seamlessly
const mergedSuppliersList = verificationSuppliers.map((s) => {
  const matchingFixture = fixtureSuppliers.find(
    (f) => f.publicReference === s.publicReference || f.companyName === s.name
  );
  return {
    id: matchingFixture?.id || s.internalId,
    internalId: s.internalId,
    publicReference: s.publicReference,
    name: s.name,
    type: s.type,
    date: s.date,
    progress: s.progress,
    status: s.status,
    risk: s.riskLevel,
    assigned: matchingFixture?.assigned || 'team',
    country: matchingFixture?.country || 'On file',
  };
});

export function SupplierQueue() {
  const router = useRouter();
  const path = usePathname();
  const params = useSearchParams();

  const [search, setSearch] = useState(params.get('search') ?? '');

  useEffect(() => {
    const timer = setTimeout(() => updateParam('search', search, true), 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function updateParam(key: string, value: string, replace = false) {
    const next = new URLSearchParams(params.toString());
    if (value && value !== 'All') next.set(key, value);
    else next.delete(key);
    next.delete('page');
    router[replace ? 'replace' : 'push'](`${path}${next.size ? `?${next}` : ''}`, { scroll: false });
  }

  const page = Math.max(1, Number(params.get('page') ?? 1) || 1);

  const filtered = useMemo(() => {
    return mergedSuppliersList.filter((s) => {
      const q = search.trim().toLowerCase();
      if (q && !`${s.name} ${s.publicReference}`.toLowerCase().includes(q)) return false;
      if (params.get('status') && s.status !== params.get('status')) return false;
      if (params.get('risk') && s.risk !== params.get('risk')) return false;
      if (params.get('type') && s.type !== params.get('type')) return false;
      if (params.get('assigned') && s.assigned !== params.get('assigned')) return false;
      return true;
    });
  }, [search, params]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const rows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function setPage(value: number) {
    const next = new URLSearchParams(params.toString());
    next.set('page', String(value));
    router.push(`${path}?${next}`, { scroll: false });
  }

  const returnTo = `${path}${params.size ? `?${params}` : ''}`;

  return (
    <div className="space-y-6">
      <section className="card supplier-filters">
        <label className="search-control">
          <Search size={16} />
          <input
            aria-label="Filter suppliers"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by supplier name or reference..."
          />
        </label>
        <select
          aria-label="Verification status"
          value={params.get('status') ?? 'All'}
          onChange={(e) => updateParam('status', e.target.value)}
        >
          <option value="All">Status: All</option>
          <option>New</option>
          <option>Under Review</option>
          <option>Additional Info Required</option>
          <option>Approved</option>
          <option>Rejected</option>
          <option>Suspended</option>
        </select>
        <select
          aria-label="Supplier type"
          value={params.get('type') ?? 'All'}
          onChange={(e) => updateParam('type', e.target.value)}
        >
          <option value="All">Type: All</option>
          <option>Brand Owner</option>
          <option>Auth. Distributor</option>
          <option>Manufacturer</option>
          <option>Wholesaler</option>
        </select>
        <select
          aria-label="Risk level"
          value={params.get('risk') ?? 'All'}
          onChange={(e) => updateParam('risk', e.target.value)}
        >
          <option value="All">Risk: All</option>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
        <button
          className="button filter-icon"
          aria-label="More filters"
          onClick={() => toast('More filters options.')}
        >
          <SlidersHorizontal size={16} />
        </button>
        <button
          className="button"
          onClick={() => {
            setSearch('');
            router.push(path);
          }}
        >
          Clear all
        </button>
      </section>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th scope="col">Supplier</th>
              <th scope="col">Type</th>
              <th scope="col">Date</th>
              <th scope="col">Progress</th>
              <th scope="col">Status</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.internalId}>
                <td>
                  <Link
                    href="/admin/verification-compliance/supplier-verification"
                    className="text-link-strong"
                  >
                    {s.name}
                  </Link>
                  <small className="table-subtext">ID: {s.publicReference}</small>
                </td>
                <td>{s.type}</td>
                <td>{s.date}</td>
                <td>
                  <div className="progress-row">
                    <strong>{s.progress}%</strong>
                    <span className="progress-track">
                      <i style={{ width: `${s.progress}%` }} />
                    </span>
                  </div>
                </td>
                <td>
                  <StatusBadge status={s.status} />
                </td>
                <td>
                  <div className="row-actions">
                    <Link
                      className="button primary"
                      href="/admin/verification-compliance/supplier-verification"
                    >
                      Open Case
                    </Link>
                    <button
                      className="icon-button"
                      aria-label={`Actions for ${s.name}`}
                      onClick={() => toast(`Actions menu for ${s.name}`)}
                    >
                      <MoreVertical size={17} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!rows.length && (
          <div className="state">
            <h2>No suppliers match these filters</h2>
            <button
              className="button"
              onClick={() => {
                setSearch('');
                router.push(path);
              }}
            >
              Clear filters
            </button>
          </div>
        )}

        <div className="supplier-pagination">
          <span>
            Showing {rows.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0}–
            {Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div>
            <button
              className="icon-button"
              aria-label="Previous page"
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
            >
              <ChevronLeft size={16} />
            </button>
            <strong>
              {currentPage} / {totalPages}
            </strong>
            <button
              className="icon-button"
              aria-label="Next page"
              disabled={currentPage === totalPages}
              onClick={() => setPage(currentPage + 1)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
