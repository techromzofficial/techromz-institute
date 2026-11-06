import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { SupportWorkspace } from '@/components/admin/customer-support/SupportWorkspace';
import { api } from '@/lib/api/client';
import { createSupportCase, exportSupportCases, fetchSupportCases, supportError } from '@/services/api/customerSupportService';
import { supportDashboard, supportRecord } from './support-api-fixtures';

const navigation = vi.hoisted(() => ({ search: new URLSearchParams(), push: vi.fn(), replace: vi.fn() }));
vi.mock('next/navigation', () => ({
  useSearchParams: () => navigation.search,
  useRouter: () => navigation,
  usePathname: () => '/admin/customer-support/cases',
}));
vi.mock('@/lib/api/client', () => ({ api: { get: vi.fn(), post: vi.fn(), download: vi.fn() } }));
vi.mock('@/components/admin/shared/DonutDistributionChart', () => ({ DonutDistributionChart: () => <div>Distribution chart</div> }));
vi.mock('@/components/admin/shared/TrendChart', () => ({ TrendChart: () => <div>Trend chart</div> }));

beforeEach(() => {
  vi.clearAllMocks(); navigation.search = new URLSearchParams();
  vi.mocked(api.get).mockImplementation(async (url: string) => url.includes('/dashboard') ? { data: supportDashboard } : {
    data: [supportRecord], meta: { total: 1, current_page: 1, last_page: 1, per_page: 25 }, capabilities: { 'support.case.view': true },
  });
});
describe('Live support API and queue', () => {
  it('sends filters to Laravel rather than filtering an in-memory fixture', async () => {
    await fetchSupportCases({ status: 'open', search: 'refund & return', page: '2' });
    expect(api.get).toHaveBeenCalledWith('/admin/customer-support/cases?status=open&search=refund+%26+return&page=2');
  });
  it('persists intake with the supplied idempotency key', async () => {
    const input = { subject: 'Test', idempotency_key: 'stable-key' };
    vi.mocked(api.post).mockResolvedValue({ data: supportRecord });
    expect(await createSupportCase(input)).toEqual({ data: supportRecord });
    expect(api.post).toHaveBeenCalledWith('/admin/customer-support/cases', input);
  });
  it('does not fabricate a success or fallback record after API failure', async () => {
    vi.mocked(api.post).mockRejectedValue(new Error('Network unavailable'));
    await expect(createSupportCase({})).rejects.toThrow('Network unavailable');
  });
  it('downloads authorized server-side filtered CSV', async () => {
    const blob = new Blob(['Reference']); vi.mocked(api.download).mockResolvedValue(blob);
    expect(await exportSupportCases({ priority: 'high' })).toBe(blob);
    expect(api.download).toHaveBeenCalledWith('/admin/customer-support/export?priority=high');
  });
  it('renders the database response, real counts and a canonical detail link', async () => {
    render(<SupportWorkspace workspace="cases" />);
    const link = await screen.findByRole('link', { name: 'Investigate delivery' });
    expect(link.getAttribute('href')).toContain('/cases/' + supportRecord.uuid);
    expect(screen.getByText('1 matching cases')).toBeInTheDocument();
    expect(screen.getByText(/No values or percentage changes are estimated/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Create case' })).not.toBeInTheDocument();
  });
  it('reconciles KPI drilldown through a server-side metric predicate', async () => {
    render(<SupportWorkspace workspace="cases" />);
    await screen.findByText('1 matching cases');
    fireEvent.click(screen.getByRole('button', { name: /1Unassigned/ }));
    expect(navigation.push).toHaveBeenCalledWith('/admin/customer-support/cases?metric=unassigned&page=1');
  });
  it('preserves specialist scope from a dashboard deep link', async () => {
    navigation.search = new URLSearchParams('workspace=complaints&priority=high');
    render(<SupportWorkspace workspace="cases" />);
    await screen.findByText('1 matching cases');
    expect(api.get).toHaveBeenCalledWith(expect.stringContaining('workspace=complaints'));
  });
  it.each(['conversations', 'complaints', 'returns-refunds', 'order-delivery', 'product-supplier'])('uses the canonical %s workspace filter', async workspace => {
    render(<SupportWorkspace workspace={workspace} />);
    await screen.findByText('1 matching cases');
    expect(api.get).toHaveBeenCalledWith(expect.stringContaining('workspace=' + workspace));
  });
  it('shows an empty database state without fake rows', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [], meta: { total: 0, current_page: 1, last_page: 1 }, capabilities: {} });
    // Dashboard has its own contract even when empty.
    vi.mocked(api.get).mockImplementation(async (url: string) => url.includes('dashboard') ? { data: { ...supportDashboard, total: 0, statuses: [], priorities: [], categories: [] } } : { data: [], meta: { total: 0, current_page: 1, last_page: 1 }, capabilities: {} });
    render(<SupportWorkspace workspace="cases" />);
    expect(await screen.findByText('No cases match these filters.')).toBeInTheDocument();
  });
  it('shows permission failure and supports retry', async () => {
    vi.mocked(api.get).mockRejectedValue({ status: 403 });
    render(<SupportWorkspace workspace="cases" />);
    expect(await screen.findByRole('alert')).toHaveTextContent('permission');
    const before = vi.mocked(api.get).mock.calls.length;
    fireEvent.click(screen.getAllByRole('button', { name: 'Retry' })[0]);
    await waitFor(() => expect(vi.mocked(api.get).mock.calls.length).toBeGreaterThan(before));
  });
  it('provides actionable conflicts and field validation errors', () => {
    expect(supportError({ status: 409 })).toContain('draft is retained');
    expect(supportError({ errors: { customer_uuid: ['Invalid customer'] } })).toBe('Invalid customer');
  });
});

