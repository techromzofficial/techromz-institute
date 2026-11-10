import { adminJson } from '@/features/education/administration/http';
export async function GET() { return adminJson({ message: 'Not found.' }, 404); }
