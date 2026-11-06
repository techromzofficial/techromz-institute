import type { Metadata } from 'next';
import CertificateVerificationForm from '@/features/education/components/CertificateVerificationForm';

export const metadata: Metadata = {
  title: 'Verify a Certificate',
  description: 'Verify a Techromz Institute Certificate of Completion using its certificate ID.',
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

export default async function CertificateVerificationPage({ searchParams }: { searchParams: Promise<{ certificate?: string | string[] }> }) {
  const params = await searchParams;
  const certificate = typeof params.certificate === 'string' ? params.certificate : '';
  return <section className="min-h-[70vh] bg-gradient-to-br from-slate-50 via-white to-blue-50"><CertificateVerificationForm initialCertificateId={certificate} /></section>;
}
