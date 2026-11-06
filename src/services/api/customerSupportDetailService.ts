import { api } from '@/lib/api/client';
import { SUPPORT_API } from './customerSupportService';
import type { SupportCapabilities, SupportRecord } from '@/types/supportApi';

export const fetchCaseDetail = (uuid: string): Promise<{ data: SupportRecord; capabilities: SupportCapabilities }> => api.get(`${SUPPORT_API}/cases/${encodeURIComponent(uuid)}`);
export const mutateSupportCase = (uuid: string, action: string, expectedVersion: number, input: Record<string, unknown>): Promise<{ data: SupportRecord }> => api.post(`${SUPPORT_API}/cases/${encodeURIComponent(uuid)}/${encodeURIComponent(action)}`, { ...input, expected_version: expectedVersion });
