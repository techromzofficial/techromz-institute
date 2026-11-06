import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import CertificateVerificationForm from '@/features/education/components/CertificateVerificationForm';
import { authorizeCertificateAdministration } from '@/features/education/certificates/authorization';
import type { CertificateRepository, PublicCertificateRecord } from '@/features/education/certificates/contracts';
import { buildCertificateVerificationUrl, isCertificateEligible, validateCertificateId, verifyCertificate } from '@/features/education/certificates/validation';

const certificateId = 'TIT-ABCDEFGHJKLMNPQRSTUVWXY2';
const validCertificate: PublicCertificateRecord = {
  studentName: 'Sample Learner', courseName: 'Mobile Kickstart', certificateId,
  issuedAt: '2026-12-20T10:00:00+05:30', issuerName: 'Techromz Institute', status: 'valid',
};

afterEach(() => vi.restoreAllMocks());

describe('certificate verification domain', () => {
  it('normalizes and validates non-guessable certificate identifiers', () => {
    expect(validateCertificateId(`  ${certificateId.toLowerCase()}  `)).toEqual({ valid: true, certificateId });
    expect(validateCertificateId('')).toMatchObject({ valid: false });
    expect(validateCertificateId('TIT-123')).toMatchObject({ valid: false });
    expect(validateCertificateId(`TIT-${'A'.repeat(23)}0`)).toMatchObject({ valid: false });
  });

  it('returns found, revoked and neutral not-found results without private fields', async () => {
    const records = new Map<string, PublicCertificateRecord>([
      [certificateId, validCertificate],
      ['TIT-222222222222222222222222', { ...validCertificate, certificateId: 'TIT-222222222222222222222222', status: 'revoked' }],
    ]);
    const repository: CertificateRepository = { findPublicByCertificateId: async (id) => records.get(id) ?? null };
    expect(await verifyCertificate(repository, certificateId)).toEqual({ outcome: 'found', certificate: validCertificate });
    expect(await verifyCertificate(repository, 'TIT-222222222222222222222222')).toMatchObject({ outcome: 'found', certificate: { status: 'revoked' } });
    expect(await verifyCertificate(repository, 'TIT-333333333333333333333333')).toEqual({ outcome: 'not_found' });
    expect(JSON.stringify(await verifyCertificate(repository, certificateId))).not.toMatch(/score|attendance|email|revocationReason/i);
  });

  it('enforces eligibility and builds a genuine verification URL', () => {
    expect(isCertificateEligible({ attendanceCount: 5, finalAssessmentScore: 60, eligibilityAttempt: 'initial' })).toBe(true);
    expect(isCertificateEligible({ attendanceCount: 4, finalAssessmentScore: 90, eligibilityAttempt: 'initial' })).toBe(false);
    expect(isCertificateEligible({ attendanceCount: 8, finalAssessmentScore: 59, eligibilityAttempt: 'resubmission' })).toBe(false);
    expect(buildCertificateVerificationUrl('https://techromzit.com', certificateId)).toBe(`https://techromzit.com/institute/verify?certificate=${certificateId}`);
  });

  it('denies administrative actions without server-verified roles', () => {
    expect(authorizeCertificateAdministration(null, 'issue')).toBe(false);
    expect(authorizeCertificateAdministration({ authenticated: true, roles: ['certificate_admin'] }, 'issue')).toBe(false);
    expect(authorizeCertificateAdministration({ authenticated: true, subject: 'admin-1', roles: ['certificate_auditor'] }, 'issue')).toBe(false);
    expect(authorizeCertificateAdministration({ authenticated: true, subject: 'admin-1', roles: ['certificate_auditor'] }, 'history')).toBe(true);
    expect(authorizeCertificateAdministration({ authenticated: true, subject: 'admin-1', roles: ['certificate_admin'] }, 'revoke')).toBe(true);
  });
});

describe('certificate verification form', () => {
  it('provides accessible client-side validation without sending a request', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    render(<CertificateVerificationForm />);
    fireEvent.click(screen.getByRole('button', { name: 'Verify Certificate' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a certificate ID.');
    expect(screen.getByLabelText('Certificate ID')).toHaveAttribute('aria-invalid', 'true');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('renders a valid public certificate without private learner information', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ outcome: 'found', certificate: validCertificate }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    render(<CertificateVerificationForm initialCertificateId={certificateId} />);
    fireEvent.click(screen.getByRole('button', { name: 'Verify Certificate' }));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Valid certificate' })).toBeInTheDocument());
    expect(screen.getByText('Sample Learner')).toBeInTheDocument();
    expect(screen.getByText('Mobile Kickstart')).toBeInTheDocument();
    const result = screen.getByRole('region', { name: 'Certificate verification result' });
    expect(within(result).queryByText(/attendance|assessment score|email|contact|revocation reason/i)).not.toBeInTheDocument();
  });

  it('renders revoked, not-found and unavailable states neutrally', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    fetchSpy.mockResolvedValueOnce(new Response(JSON.stringify({ outcome: 'found', certificate: { ...validCertificate, status: 'revoked' } }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    const { rerender } = render(<CertificateVerificationForm initialCertificateId={certificateId} />);
    fireEvent.click(screen.getByRole('button', { name: 'Verify Certificate' }));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Certificate revoked' })).toBeInTheDocument());

    fetchSpy.mockResolvedValueOnce(new Response(JSON.stringify({ outcome: 'not_found' }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    rerender(<CertificateVerificationForm initialCertificateId="TIT-333333333333333333333333" />);
    fireEvent.change(screen.getByLabelText('Certificate ID'), { target: { value: 'TIT-333333333333333333333333' } });
    fireEvent.click(screen.getByRole('button', { name: 'Verify Certificate' }));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Certificate not found' })).toBeInTheDocument());

    fetchSpy.mockResolvedValueOnce(new Response(JSON.stringify({ outcome: 'unavailable', message: 'Certificate verification is not yet available.' }), { status: 503, headers: { 'Content-Type': 'application/json' } }));
    fireEvent.click(screen.getByRole('button', { name: 'Verify Certificate' }));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Verification unavailable' })).toBeInTheDocument());
  });
});
