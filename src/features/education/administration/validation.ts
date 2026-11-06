export const REGISTRATION_STATUSES = ['pending', 'awaiting_payment', 'confirmed', 'cancelled', 'waitlist'] as const;
export type RegistrationStatus = typeof REGISTRATION_STATUSES[number];
export type RegistrationSource = 'website' | 'whatsapp' | 'administrator';

export interface RegistrationInput { fullName: string; email?: string; phone?: string; intakeId: string; consent: boolean; source: RegistrationSource; verificationGrant?: string; identityVerificationReference?: string; }

export function validateRegistrationInput(input: unknown): { valid: true; value: RegistrationInput } | { valid: false; message: string } {
  const value = input as Partial<RegistrationInput> | null;
  const fullName = value?.fullName?.trim() ?? '';
  const email = value?.email?.trim().toLowerCase();
  const phone = value?.phone?.trim();
  const intakeId = value?.intakeId?.trim() ?? '';
  if (fullName.length < 2 || fullName.length > 160) return { valid: false, message: 'Enter a valid full name.' };
  if (!email && !phone) return { valid: false, message: 'Enter an email address or phone number.' };
  if (value?.source === 'website' && !email) return { valid: false, message: 'A verified email address is required.' };
  if (email && (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) return { valid: false, message: 'Enter a valid email address.' };
  if (phone && !/^\+?[0-9 ()-]{7,24}$/.test(phone)) return { valid: false, message: 'Enter a valid phone number.' };
  if (!/^[0-9a-f-]{36}$/i.test(intakeId)) return { valid: false, message: 'Select a valid course intake.' };
  if (value?.consent !== true) return { valid: false, message: 'Privacy consent is required.' };
  if (!['website', 'whatsapp', 'administrator'].includes(value?.source ?? '')) return { valid: false, message: 'Invalid registration source.' };
  const verificationGrant = typeof value?.verificationGrant === 'string' ? value.verificationGrant.trim() : undefined;
  if (value?.source === 'website' && !/^[A-Za-z0-9_-]{43}$/.test(verificationGrant ?? '')) return { valid: false, message: 'Contact verification is required.' };
  const identityVerificationReference = typeof value?.identityVerificationReference === 'string' ? value.identityVerificationReference.trim() : undefined;
  if (value?.source !== 'website' && !/^[A-Za-z0-9._:/-]{3,120}$/.test(identityVerificationReference ?? '')) return { valid: false, message: 'An identity verification reference is required.' };
  return { valid: true, value: { fullName, email, phone, intakeId, consent: true, source: value!.source!, verificationGrant, identityVerificationReference } };
}

export function validateLoginInput(input: unknown): { valid: true; username: string; password: string } | { valid: false } {
  const value = input as { username?: unknown; password?: unknown } | null;
  if (typeof value?.username !== 'string' || typeof value.password !== 'string') return { valid: false };
  const username = value.username.trim().toLowerCase();
  if (!/^[a-z0-9._-]{3,120}$/.test(username) || value.password.length < 1 || value.password.length > 200) return { valid: false };
  return { valid: true, username, password: value.password };
}
