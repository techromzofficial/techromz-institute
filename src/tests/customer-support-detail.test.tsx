import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { SupportCaseWorkspace } from '@/components/admin/customer-support/SupportCaseWorkspace';
import { mutateSupportCase } from '@/services/api/customerSupportDetailService';
import { api } from '@/lib/api/client';
import { supportRecord } from './support-api-fixtures';

const navigation = vi.hoisted(() => ({ search: new URLSearchParams(), push: vi.fn(), replace: vi.fn() }));
vi.mock('next/navigation', () => ({
  useParams: () => ({ caseId: 'bbeb6b85-95aa-4ab5-afbb-ecc9340fe25d' }),
  useSearchParams: () => navigation.search, useRouter: () => navigation,
  usePathname: () => '/admin/customer-support/cases/bbeb6b85-95aa-4ab5-afbb-ecc9340fe25d',
}));
vi.mock('@/lib/api/client', () => ({ api: { get: vi.fn(), post: vi.fn(), download: vi.fn() } }));
beforeEach(() => {
  vi.clearAllMocks(); navigation.search = new URLSearchParams();
  vi.mocked(api.get).mockResolvedValue({ data: supportRecord, capabilities: { 'support.case.view': true, 'support.case.note': true } });
});
describe('Database-backed case detail', () => {
  it('preserves all twelve existing detail tabs for authorized users', async () => {
    render(<SupportCaseWorkspace />);
    await screen.findByRole('heading', { name: 'Investigate delivery' });
    expect(screen.getAllByRole('tab')).toHaveLength(12);
    expect(screen.getByRole('tab', { name: 'Case Overview' })).toHaveAttribute('aria-selected', 'true');
  });
  it('keeps internal notes inaccessible without note permission', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: supportRecord, capabilities: { 'support.case.view': true } });
    render(<SupportCaseWorkspace />);
    await screen.findByRole('heading', { name: 'Investigate delivery' });
    expect(screen.queryByRole('tab', { name: 'Internal Notes' })).not.toBeInTheDocument();
  });
  it('uses keyboard navigation on existing tabs', async () => {
    render(<SupportCaseWorkspace />);
    const overview = await screen.findByRole('tab', { name: 'Case Overview' });
    fireEvent.keyDown(overview, { key: 'ArrowRight' });
    expect(navigation.replace).toHaveBeenCalledWith(expect.stringContaining('tab=conversation'), { scroll: false });
  });
  it('rejects stale mutations rather than pretending to save', async () => {
    vi.mocked(api.post).mockRejectedValue({ status: 409 });
    await expect(mutateSupportCase(supportRecord.uuid, 'update', 2, { priority: 'high', reason: 'Triage' })).rejects.toEqual({ status: 409 });
    expect(api.post).toHaveBeenCalledWith(expect.stringContaining('/update'), { expected_version: 2, priority: 'high', reason: 'Triage' });
  });
  it('retains reply draft after a conflict', async () => {
    navigation.search = new URLSearchParams('tab=conversation');
    vi.mocked(api.get).mockResolvedValue({ data: supportRecord, capabilities: { 'support.case.reply': true } });
    vi.mocked(api.post).mockRejectedValue({ status: 409 });
    render(<SupportCaseWorkspace />);
    const draft = await screen.findByLabelText('Reply');
    fireEvent.change(draft, { target: { value: 'Retain this draft' } });
    fireEvent.click(screen.getByRole('button', { name: 'Persist reply (delivery pending)' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('draft is retained');
    expect(draft).toHaveValue('Retain this draft');
    expect(api.post).toHaveBeenCalledWith(expect.stringContaining('/reply'), expect.objectContaining({ expected_version: 3, body: 'Retain this draft' }));
  });
  it('does not expose a fabricated record for a missing case', async () => {
    vi.mocked(api.get).mockRejectedValue({ status: 404 });
    render(<SupportCaseWorkspace />);
    expect(await screen.findByRole('alert')).toHaveTextContent('unavailable in your current tenant');
    expect(screen.queryByText('Test customer')).not.toBeInTheDocument();
  });
  it('does not copy internal-note drafts into the customer reply composer', async () => {
    navigation.search = new URLSearchParams('tab=internal-notes');
    vi.mocked(api.get).mockResolvedValue({ data: supportRecord, capabilities: { 'support.case.note': true, 'support.case.reply': true } });
    const view = render(<SupportCaseWorkspace />);
    fireEvent.change(await screen.findByLabelText('Internal note'), { target: { value: 'Private investigation draft' } });
    navigation.search = new URLSearchParams('tab=conversation');
    view.rerender(<SupportCaseWorkspace />);
    expect(await screen.findByLabelText('Reply')).toHaveValue('');
    navigation.search = new URLSearchParams('tab=internal-notes');
    view.rerender(<SupportCaseWorkspace />);
    expect(await screen.findByLabelText('Internal note')).toHaveValue('Private investigation draft');
  });
  it('sanitizes external return URLs', async () => {
    navigation.search = new URLSearchParams('returnTo=https://evil.example');
    render(<SupportCaseWorkspace />);
    await waitFor(() => expect(screen.getByRole('link', { name: 'Back to queue' })).toHaveAttribute('href', '/admin/customer-support/cases'));
  });
});
