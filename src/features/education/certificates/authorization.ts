export interface CertificateAdministratorIdentity {
  authenticated: boolean;
  roles: string[];
  subject?: string;
}

export type CertificateAdministrativeAction = 'view' | 'issue' | 'revoke' | 'history' | 'generate_pdf';

const ACTION_ROLES: Record<CertificateAdministrativeAction, string[]> = {
  view: ['certificate_admin', 'certificate_auditor'],
  history: ['certificate_admin', 'certificate_auditor'],
  issue: ['certificate_admin'],
  revoke: ['certificate_admin'],
  generate_pdf: ['certificate_admin'],
};

export function authorizeCertificateAdministration(identity: CertificateAdministratorIdentity | null, action: CertificateAdministrativeAction): boolean {
  if (!identity?.authenticated || !identity.subject) return false;
  return ACTION_ROLES[action].some((role) => identity.roles.includes(role));
}
