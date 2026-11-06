'use client';

import React from 'react';
import type { AgentWorkloadItem } from '@/types/customerSupport';
import styles from '../../../app/admin/customer-support/cases/page.module.css';

interface AgentWorkloadProps {
  agents: AgentWorkloadItem[];
}

export function AgentWorkload({ agents }: AgentWorkloadProps) {
  return (
    <div className={styles.rightCard}>
      <h3 className={styles.rightCardTitle}>Agent Workload</h3>

      <div style={{ overflowX: 'auto' }}>
        <table className={styles.workloadTable}>
          <thead>
            <tr>
              <th>Agent</th>
              <th style={{ textAlign: 'center' }}>Open Cases</th>
              <th style={{ textAlign: 'center' }}>At Risk / Critical</th>
              <th style={{ textAlign: 'right' }}>Resolved Today</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent) => (
              <tr key={agent.id}>
                <td style={{ fontWeight: 600, color: '#0f172a' }}>{agent.agentName}</td>
                <td style={{ textAlign: 'center', fontWeight: 700, color: '#0f172a' }}>{agent.openCases}</td>
                <td style={{ textAlign: 'center' }}>
                  <span
                    style={{
                      padding: '2px 6px',
                      fontSize: '10px',
                      fontWeight: 700,
                      borderRadius: '4px',
                      background: agent.atRiskOrCritical > 3 ? '#fef2f2' : '#fffbe6',
                      color: agent.atRiskOrCritical > 3 ? '#b91c1c' : '#b45309',
                    }}
                  >
                    {agent.atRiskOrCritical} {agent.atRiskOrCritical > 3 ? 'critical' : 'at risk'}
                  </span>
                </td>
                <td style={{ textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>
                  {agent.resolvedToday}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: '10px', color: '#94a3b8', marginTop: '8px', fontStyle: 'italic' }}>* Calculated operational aggregates</p>
    </div>
  );
}

