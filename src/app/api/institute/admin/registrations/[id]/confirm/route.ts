import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { requireAdminSession, verifyCsrf } from '@/features/education/administration/auth';
import { adminJson } from '@/features/education/administration/http';
import { convertReservationToEnrolment } from '@/features/education/database/seatAllocation';
import { getInstituteDatabasePool } from '@/features/education/database/pool';
import { isInstituteFeatureEnabled } from '@/features/education/administration/config';

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!isInstituteFeatureEnabled('payment')) return adminJson({ message: 'Payment operations are disabled.' }, 503);
  try {
    const session = await requireAdminSession(['administrator', 'registrar']);
    if (!await verifyCsrf(request)) return adminJson({ message: 'Invalid request.' }, 403);
    const { id } = await context.params; const body = await request.json() as { reservationId?: string; paymentVerificationId?: string };
    if (!body.reservationId || !body.paymentVerificationId) return adminJson({ message: 'Reservation and payment verification are required.' }, 400);
    await convertReservationToEnrolment(getInstituteDatabasePool(), { registrationId: id, reservationId: body.reservationId, paymentVerificationId: body.paymentVerificationId, enrolmentId: randomUUID(), actorId: session.adminUserId });
    return adminJson({ registrationId: id, confirmed: true });
  } catch { return adminJson({ message: 'Registration confirmation could not be completed.' }, 409); }
}
