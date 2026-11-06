'use client';

import { Eye, Flag, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { ChecklistGroup } from '@/mocks/admin/caseDetail.mock';
import { ChecklistStatusPill } from './ChecklistStatusPill';

export function VerificationChecklistCard({ checklist }: { checklist: ChecklistGroup[] }) {
  const totalItems = checklist.reduce((sum, g) => sum + g.items.length, 0);
  const approvedItems = checklist.reduce(
    (sum, g) => sum + g.items.filter((i) => i.status === 'Approved').length,
    0
  );
  const progressPercent = Math.round((approvedItems / totalItems) * 100);

  return (
    <article className="card checklist-card">
      <div className="checklist-card-header">
        <div>
          <h3>Verification Checklist Summary</h3>
          <p className="muted">
            {approvedItems} of {totalItems} Requirements Completed
          </p>
        </div>
        <div className="checklist-progress-bar-wrap">
          <div className="progress-track" style={{ width: 140 }}>
            <i style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      <div className="table-wrap embedded">
        <table>
          <thead>
            <tr>
              <th scope="col">REQUIREMENT CATEGORY</th>
              <th scope="col">DOCUMENTS</th>
              <th scope="col">STATUS</th>
              <th scope="col" style={{ textAlign: 'right' }}>
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody>
            {checklist.map((group) => {
              const docNames = group.items.map((i) => i.shortLabel).join(', ');
              // Determine overall group status
              const hasRejected = group.items.some((i) => i.status === 'Rejected');
              const hasPending = group.items.some((i) => i.status === 'Pending Review');
              const hasMissing = group.items.some((i) => i.status === 'Missing');
              const groupStatus = hasRejected
                ? 'Rejected'
                : hasPending
                ? 'Pending Review'
                : hasMissing
                ? 'Missing'
                : 'Approved';

              const rejectedItem = group.items.find((i) => i.status === 'Rejected');

              return (
                <tr key={group.category}>
                  <td>
                    <strong>{group.category}</strong>
                  </td>
                  <td>{docNames}</td>
                  <td>
                    <ChecklistStatusPill
                      status={groupStatus}
                      note={rejectedItem ? rejectedItem.note : undefined}
                    />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="row-actions" style={{ justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => toast(`Viewing details for ${group.category}`)}
                        className="button text-button"
                      >
                        <Eye size={14} /> View Details
                      </button>
                      <button
                        onClick={() => toast(`Flagged ${group.category} for re-review`)}
                        className="icon-button"
                        aria-label={`Flag ${group.category}`}
                      >
                        {groupStatus === 'Rejected' ? <RefreshCw size={14} /> : <Flag size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </article>
  );
}
