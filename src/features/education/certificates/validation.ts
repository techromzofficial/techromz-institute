import type { CertificateRepository, VerificationResult } from './contracts';

const CERTIFICATE_ID_PATTERN = /^TIT-[A-HJ-NP-Z2-9]{24}$/;

export function normalizeCertificateId(value: unknown): string {
  return typeof value === 'string' ? value.trim().toUpperCase() : '';
}

export function validateCertificateId(value: unknown): { valid: true; certificateId: string } | { valid: false; message: string } {
  const certificateId = normalizeCertificateId(value);
  if (!certificateId) return { valid: false, message: 'Enter a certificate ID.' };
  if (!CERTIFICATE_ID_PATTERN.test(certificateId)) {
    return { valid: false, message: 'Enter a valid Techromz Institute certificate ID.' };
  }
  return { valid: true, certificateId };
}

export async function verifyCertificate(repository: CertificateRepository, certificateId: string): Promise<VerificationResult> {
  const certificate = await repository.findPublicByCertificateId(certificateId);
  return certificate ? { outcome: 'found', certificate } : { outcome: 'not_found' };
}

export function buildCertificateVerificationUrl(origin: string, certificateId: string): string {
  const url = new URL('/institute/verify', origin);
  url.searchParams.set('certificate', certificateId);
  return url.toString();
}

export function isCertificateEligible(input: { attendanceCount: number; finalAssessmentScore: number; eligibilityAttempt: 'initial' | 'resubmission' }): boolean {
  return input.attendanceCount >= 5 && input.attendanceCount <= 8 && input.finalAssessmentScore >= 60 && input.finalAssessmentScore <= 100 && (input.eligibilityAttempt === 'initial' || input.eligibilityAttempt === 'resubmission');
}
