import { api } from '@/lib/api/client';
import type { SupportDashboard, SupportFilters, SupportList, SupportLookup, SupportRecord, SupportView } from '@/types/supportApi';

export const SUPPORT_API = '/admin/customer-support';
export function supportQuery(filters: SupportFilters = {}) {
  return new URLSearchParams(Object.entries(filters).filter(([, value]) => value !== '')).toString();
}
export const fetchSupportCases = (filters: SupportFilters = {}): Promise<SupportList> => api.get(`${SUPPORT_API}/cases?${supportQuery(filters)}`);
export const fetchSupportDashboard = (filters: SupportFilters = {}): Promise<{ data: SupportDashboard }> => api.get(`${SUPPORT_API}/dashboard?${supportQuery(filters)}`);
export const createSupportCase = (input: Record<string, unknown>): Promise<{ data: SupportRecord }> => api.post(`${SUPPORT_API}/cases`, input);
export const lookupSupportRecords = (kind: string, search = ''): Promise<{ data: SupportLookup[] }> => api.get(`${SUPPORT_API}/lookups?${supportQuery({ kind, search })}`);
export const fetchSupportViews = (): Promise<{ data: SupportView[] }> => api.get(`${SUPPORT_API}/saved-views`);
export const saveSupportView = (name: string, filters: SupportFilters): Promise<{ data: SupportView[] }> => api.post(`${SUPPORT_API}/saved-views`, { name, filters });
export const bulkSupportAction = (action: string, items: { uuid: string; expected_version: number }[], payload: Record<string, unknown>): Promise<{ data: { uuid: string; success: boolean; status?: number; message?: string }[] }> => api.post(`${SUPPORT_API}/bulk`, { action, items, payload });
export const exportSupportCases = (filters: SupportFilters): Promise<Blob> => api.download(`${SUPPORT_API}/export?${supportQuery(filters)}`);
export const exportSupportSelection = (caseUuids: string[]): Promise<Blob> => api.post(`${SUPPORT_API}/export`, { case_uuids: caseUuids }, { responseType: 'blob' });
export function supportError(error: unknown): string {
  const detail = error as { status?: number; message?: string; errors?: Record<string, string[]> };
  if (detail.status === 409) return 'This case changed or the action conflicts with its workflow. Refresh before retrying; your draft is retained.';
  if (detail.status === 403) return 'You do not have permission for this support operation.';
  if (detail.status === 404) return 'This record is unavailable in your current tenant.';
  const fields = Object.values(detail.errors ?? {}).flat().join(' ');
  return fields || detail.message || 'Unable to load Customer Support. Please retry.';
}
