import 'server-only';

export type InstituteFeature = 'admin' | 'registration' | 'payment' | 'seatAvailability' | 'courseEnquiry';

const featureKeys: Record<InstituteFeature, string> = {
  admin: 'INSTITUTE_ADMIN_ENABLED',
  registration: 'INSTITUTE_REGISTRATION_ENABLED',
  payment: 'INSTITUTE_PAYMENT_ENABLED',
  seatAvailability: 'INSTITUTE_SEAT_AVAILABILITY_ENABLED',
  courseEnquiry: 'INSTITUTE_COURSE_ENQUIRY_ENABLED',
};

export function isInstituteFeatureEnabled(feature: InstituteFeature, environment: NodeJS.ProcessEnv = process.env): boolean {
  return environment[featureKeys[feature]] === 'true';
}

export function requireInstituteFeature(feature: InstituteFeature, environment: NodeJS.ProcessEnv = process.env): void {
  if (!isInstituteFeatureEnabled(feature, environment)) throw new Error(`Institute ${feature} operations are disabled.`);
}
