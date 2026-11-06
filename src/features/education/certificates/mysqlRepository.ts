import 'server-only';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import type { CertificateRepository, PublicCertificateRecord } from './contracts';

type CertificateRow = RowDataPacket & {
  student_name: string; course_name: string; certificate_id: string; issued_at: Date; status: 'valid' | 'revoked';
};

export class MySqlCertificateRepository implements CertificateRepository {
  constructor(private readonly pool: Pick<Pool, 'execute'>) {}

  async findPublicByCertificateId(certificateId: string): Promise<PublicCertificateRecord | null> {
    const [rows] = await this.pool.execute<CertificateRow[]>(`SELECT
      s.display_name AS student_name, c.title AS course_name, cert.certificate_id, cert.issued_at, cert.status
      FROM institute_certificates cert
      INNER JOIN institute_students s ON s.id = cert.student_id
      INNER JOIN institute_courses c ON c.id = cert.course_id
      WHERE cert.certificate_id = ? LIMIT 1`, [certificateId]);
    const record = rows[0];
    if (!record) return null;
    return { studentName: record.student_name, courseName: record.course_name, certificateId: record.certificate_id, issuedAt: record.issued_at.toISOString(), issuerName: 'Techromz Institute', status: record.status };
  }
}
