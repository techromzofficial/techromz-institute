import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({ enabled: false, role: 'administrator', execute: vi.fn() }));
vi.mock('@/features/education/administration/config', () => ({ isInstituteFeatureEnabled: () => state.enabled }));
vi.mock('@/features/education/administration/auth', () => ({ requireAdminSession: async (allowed: string[]) => {
  if (!allowed.includes(state.role)) throw new Error('UNAUTHORIZED');
  return { adminUserId: 'operator-id' };
} }));
vi.mock('@/features/education/administration/crypto', () => ({ decryptPrivateValue: () => 'test contact' }));
vi.mock('@/features/education/database/pool', () => ({ getInstituteDatabasePool: () => ({ execute: state.execute }) }));
import { GET } from '@/app/api/institute/admin/enquiries/route';
const request = (query = '') => new NextRequest(`https://techromzit.com/api/institute/admin/enquiries${query}`);
beforeEach(() => { state.enabled = true; state.role = 'administrator'; state.execute.mockReset().mockResolvedValue([[], []]); });

describe('protected course enquiry management API', () => {
  it('remains unavailable when production administration is disabled', async () => {
    state.enabled = false;
    expect((await GET(request())).status).toBe(503);
    expect(state.execute).not.toHaveBeenCalled();
  });
  it.each(['viewer', 'anonymous'])('rejects %s before reading private records', async role => {
    state.role = role;
    expect((await GET(request())).status).toBe(401);
    expect(state.execute).not.toHaveBeenCalled();
  });
  it.each(['administrator', 'registrar'])('permits %s, bounds pagination and audits access', async role => {
    state.role = role;
    state.execute.mockResolvedValueOnce([[{ id: 'enquiry-id', course_name: 'Course', full_name_ciphertext: Buffer.alloc(1), email_ciphertext: Buffer.alloc(1), message_ciphertext: Buffer.alloc(1), notification_status: 'pending' }], []]);
    const response = await GET(request('?page=2'));
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(await response.json()).toMatchObject({ page: 2, enquiries: [{ id: 'enquiry-id', fullName: 'test contact' }] });
    expect(state.execute).toHaveBeenCalledWith(expect.stringContaining('LIMIT 26 OFFSET ?'), [25]);
    expect(state.execute).toHaveBeenCalledWith(expect.stringContaining("'enquiries.read'"), expect.arrayContaining(['operator-id', 2, 1]));
  });
  it('rejects invalid pagination and never exposes driver errors', async () => {
    expect((await GET(request('?page=-1'))).status).toBe(400);
    state.execute.mockRejectedValue(new Error('private connection details'));
    const response = await GET(request());
    expect(response.status).toBe(503);
    expect(JSON.stringify(await response.json())).not.toContain('private connection details');
  });
});
