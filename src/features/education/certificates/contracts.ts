export type CertificateStatus = 'valid' | 'revoked';

export interface PublicCertificateRecord {
  studentName: string;
  courseName: string;
  certificateId: string;
  issuedAt: string;
  issuerName: 'Techromz Institute';
  status: CertificateStatus;
}

export interface PrivateCertificateRecord extends PublicCertificateRecord {
  studentReference: string;
  courseReference: string;
  intakeReference: string;
  enrolmentReference: string;
  issuerReference: string;
  attendanceCount: number;
  finalAssessmentScore: number;
  eligibilityAttempt: 'initial' | 'resubmission';
  revokedAt: string | null;
  revocationReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CertificateRepository {
  findPublicByCertificateId(certificateId: string): Promise<PublicCertificateRecord | null>;
}

export type VerificationResult =
  | { outcome: 'found'; certificate: PublicCertificateRecord }
  | { outcome: 'not_found' };

export interface CertificateDocumentPayload {
  certificateId: string;
  studentName: string;
  courseName: string;
  issuedAt: string;
  issuerName: 'Techromz Institute';
  wording: 'Certificate of Completion';
  verificationUrl: string;
}
