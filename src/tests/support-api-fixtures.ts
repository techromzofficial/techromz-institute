// Isolated API fixtures. Never imported by production components or services.
import type { SupportDashboard, SupportRecord } from '@/types/supportApi';
export const supportRecord: SupportRecord = {
  uuid: 'bbeb6b85-95aa-4ab5-afbb-ecc9340fe25d', reference: 'CS-TEST', subject: 'Investigate delivery', description: 'An actual API response is required in production.',
  category: 'order_delivery', channel: 'email', priority: 'normal', status: 'open', is_complaint: false,
  severity: null, restricted: false, dependency: null, version: 3,
  created_at: '2026-09-22T06:00:00Z', updated_at: '2026-09-22T06:00:00Z', resolved_at: null, escalated_at: null, resolution: null, reopen_count: 0,
  customer: { uuid: 'ccd78f44-2c49-4d4e-bb15-29073c3cd913', name: 'Test customer' }, assignee: null,
  sla: { status: 'unavailable', reason: 'No support SLA policy is configured.' }, allowed_transitions: ['assigned'],
  context: {}, messages: [], notes: [], history: [],
};
export const supportDashboard: SupportDashboard = {
  total: 1, open: 1, unassigned: 1, new_today: 1, in_progress: 0, waiting: 0, escalated: 0, critical: 0, resolved_today: 0,
  statuses: [{ status: 'open', count: 1 }], priorities: [{ priority: 'normal', count: 1 }], categories: [{ category: 'order_delivery', count: 1 }], severity: [],
  trend: [], workload: [], timezone: 'UTC', unavailable: ['SLA'], alerts: [],
};
