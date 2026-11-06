-- Purpose-bound verification grants and encrypted, idempotent course enquiries.
ALTER TABLE institute_contact_verification_challenges
  ADD COLUMN IF NOT EXISTS purpose ENUM('registration','course_enquiry') NOT NULL DEFAULT 'registration' AFTER contact_type;

ALTER TABLE institute_contact_verification_grants
  ADD COLUMN IF NOT EXISTS purpose ENUM('registration','course_enquiry') NOT NULL DEFAULT 'registration' AFTER contact_type;

CREATE TABLE IF NOT EXISTS institute_course_enquiries (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  idempotency_hash BINARY(32) NOT NULL UNIQUE,
  email_lookup_hash BINARY(32) NOT NULL,
  full_name_ciphertext VARBINARY(512) NOT NULL,
  email_ciphertext VARBINARY(512) NOT NULL,
  phone_ciphertext VARBINARY(512) NULL,
  course_name VARCHAR(160) NOT NULL,
  message_ciphertext VARBINARY(8192) NOT NULL,
  notification_status ENUM('pending','notified','notification_failed') NOT NULL DEFAULT 'pending',
  notification_attempted_at DATETIME(6) NULL,
  notified_at DATETIME(6) NULL,
  submitted_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  INDEX idx_course_enquiry_email_time (email_lookup_hash, submitted_at),
  INDEX idx_course_enquiry_notification (notification_status, submitted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
