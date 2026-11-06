-- Techromz Institute MySQL/MariaDB foundation.
-- Idempotent DDL only; production execution requires an approved change window.

CREATE TABLE IF NOT EXISTS institute_students (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  display_name VARCHAR(160) NOT NULL,
  email_ciphertext VARBINARY(512) NULL,
  phone_ciphertext VARBINARY(512) NULL,
  email_lookup_hash BINARY(32) NULL,
  phone_lookup_hash BINARY(32) NULL,
  privacy_consent_at DATETIME(6) NOT NULL,
  status ENUM('active','inactive','blocked') NOT NULL DEFAULT 'active',
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  UNIQUE INDEX uq_student_email_lookup (email_lookup_hash),
  UNIQUE INDEX uq_student_phone_lookup (phone_lookup_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS institute_courses (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  slug VARCHAR(100) CHARACTER SET ascii COLLATE ascii_bin NOT NULL UNIQUE,
  title VARCHAR(180) NOT NULL,
  status ENUM('planned','active','retired') NOT NULL DEFAULT 'planned',
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS institute_course_intakes (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  course_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  intake_code VARCHAR(80) CHARACTER SET ascii COLLATE ascii_bin NOT NULL UNIQUE,
  max_seats TINYINT UNSIGNED NOT NULL DEFAULT 30,
  fee_minor BIGINT UNSIGNED NOT NULL,
  fee_currency CHAR(3) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'LKR',
  registration_opens_at DATETIME(6) NULL,
  registration_deadline_at DATETIME(6) NOT NULL,
  starts_at DATETIME(6) NULL,
  status ENUM('draft','open','closed','cancelled','completed') NOT NULL DEFAULT 'draft',
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT chk_intake_max_seats CHECK (max_seats BETWEEN 1 AND 30),
  CONSTRAINT chk_intake_fee CHECK (fee_minor > 0),
  CONSTRAINT fk_intake_course FOREIGN KEY (course_id) REFERENCES institute_courses(id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  INDEX idx_intake_course_status (course_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS institute_registrations (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  student_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  intake_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  status ENUM('pending','awaiting_payment','confirmed','cancelled','waitlist') NOT NULL DEFAULT 'pending',
  source ENUM('website','whatsapp','administrator') NOT NULL DEFAULT 'website',
  notes_ciphertext VARBINARY(2048) NULL,
  submitted_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  reviewed_at DATETIME(6) NULL,
  reviewed_by CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT uq_registration_student_intake UNIQUE (student_id, intake_id),
  CONSTRAINT fk_registration_student FOREIGN KEY (student_id) REFERENCES institute_students(id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_registration_intake FOREIGN KEY (intake_id) REFERENCES institute_course_intakes(id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  INDEX idx_registration_intake_status (intake_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS institute_seat_reservations (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  intake_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  student_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  registration_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  status ENUM('active','converted','expired','cancelled') NOT NULL DEFAULT 'active',
  expires_at DATETIME(6) NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT uq_reservation_student_intake UNIQUE (student_id, intake_id),
  CONSTRAINT uq_reservation_registration UNIQUE (registration_id),
  CONSTRAINT fk_reservation_intake FOREIGN KEY (intake_id) REFERENCES institute_course_intakes(id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_reservation_student FOREIGN KEY (student_id) REFERENCES institute_students(id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_reservation_registration FOREIGN KEY (registration_id) REFERENCES institute_registrations(id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  INDEX idx_reservation_allocation (intake_id, status, expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS institute_payment_verifications (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  registration_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  provider_reference VARCHAR(190) CHARACTER SET ascii COLLATE ascii_bin NULL UNIQUE,
  amount_minor BIGINT UNSIGNED NOT NULL,
  currency CHAR(3) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'LKR',
  status ENUM('pending','verified','rejected','refunded') NOT NULL DEFAULT 'pending',
  verified_at DATETIME(6) NULL,
  verified_by CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT chk_payment_amount CHECK (amount_minor > 0),
  CONSTRAINT fk_payment_registration FOREIGN KEY (registration_id) REFERENCES institute_registrations(id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  INDEX idx_payment_registration_status (registration_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS institute_enrolments (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  student_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  intake_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  registration_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  payment_verification_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
  status ENUM('active','completed','withdrawn','cancelled') NOT NULL DEFAULT 'active',
  enrolled_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT uq_enrolment_student_intake UNIQUE (student_id, intake_id),
  CONSTRAINT uq_enrolment_registration UNIQUE (registration_id),
  CONSTRAINT fk_enrolment_student FOREIGN KEY (student_id) REFERENCES institute_students(id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_enrolment_intake FOREIGN KEY (intake_id) REFERENCES institute_course_intakes(id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_enrolment_registration FOREIGN KEY (registration_id) REFERENCES institute_registrations(id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_enrolment_payment FOREIGN KEY (payment_verification_id) REFERENCES institute_payment_verifications(id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  INDEX idx_enrolment_intake_status (intake_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS institute_attendance (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  enrolment_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  session_number TINYINT UNSIGNED NOT NULL,
  attended BOOLEAN NOT NULL DEFAULT FALSE,
  recorded_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  recorded_by CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT uq_attendance_enrolment_session UNIQUE (enrolment_id, session_number),
  CONSTRAINT chk_attendance_session CHECK (session_number BETWEEN 1 AND 8),
  CONSTRAINT fk_attendance_enrolment FOREIGN KEY (enrolment_id) REFERENCES institute_enrolments(id) ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS institute_practical_assessments (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  enrolment_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  attempt_number TINYINT UNSIGNED NOT NULL,
  score DECIMAL(5,2) NOT NULL,
  assessed_at DATETIME(6) NOT NULL,
  assessed_by CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT uq_assessment_enrolment_attempt UNIQUE (enrolment_id, attempt_number),
  CONSTRAINT chk_assessment_attempt CHECK (attempt_number BETWEEN 1 AND 2),
  CONSTRAINT chk_assessment_score CHECK (score BETWEEN 0 AND 100),
  CONSTRAINT fk_assessment_enrolment FOREIGN KEY (enrolment_id) REFERENCES institute_enrolments(id) ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS institute_certificates (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  certificate_id VARCHAR(28) CHARACTER SET ascii COLLATE ascii_bin NOT NULL UNIQUE,
  student_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  course_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  intake_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  enrolment_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL UNIQUE,
  qualifying_assessment_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  issuer_reference CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  attendance_count TINYINT UNSIGNED NOT NULL,
  final_assessment_score DECIMAL(5,2) NOT NULL,
  eligibility_attempt ENUM('initial','resubmission') NOT NULL,
  status ENUM('valid','revoked') NOT NULL DEFAULT 'valid',
  issued_at DATETIME(6) NOT NULL,
  revoked_at DATETIME(6) NULL,
  revocation_reason TEXT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT uq_certificate_student_course UNIQUE (student_id, course_id),
  CONSTRAINT chk_certificate_id CHECK (certificate_id REGEXP '^TIT-[A-HJ-NP-Z2-9]{24}$'),
  CONSTRAINT chk_certificate_attendance CHECK (attendance_count BETWEEN 5 AND 8),
  CONSTRAINT chk_certificate_score CHECK (final_assessment_score BETWEEN 60 AND 100),
  CONSTRAINT chk_certificate_revocation CHECK ((status = 'valid' AND revoked_at IS NULL AND revocation_reason IS NULL) OR (status = 'revoked' AND revoked_at IS NOT NULL AND revocation_reason IS NOT NULL)),
  CONSTRAINT fk_certificate_student FOREIGN KEY (student_id) REFERENCES institute_students(id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_certificate_course FOREIGN KEY (course_id) REFERENCES institute_courses(id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_certificate_intake FOREIGN KEY (intake_id) REFERENCES institute_course_intakes(id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_certificate_enrolment FOREIGN KEY (enrolment_id) REFERENCES institute_enrolments(id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_certificate_assessment FOREIGN KEY (qualifying_assessment_id) REFERENCES institute_practical_assessments(id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  INDEX idx_certificate_status_issued (status, issued_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS institute_audit_logs (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  actor_reference CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  action VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  entity_type VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  entity_reference CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  occurred_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  private_metadata JSON NOT NULL,
  INDEX idx_audit_entity_time (entity_type, entity_reference, occurred_at),
  INDEX idx_audit_actor_time (actor_reference, occurred_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
