-- Extend existing storage without changing applied migrations.
ALTER TABLE institute_contact_verification_challenges
  ADD COLUMN IF NOT EXISTS enquiry_session_hash BINARY(32) NULL;
ALTER TABLE institute_contact_verification_grants
  ADD COLUMN IF NOT EXISTS enquiry_session_hash BINARY(32) NULL;
ALTER TABLE institute_course_enquiries
  ADD COLUMN IF NOT EXISTS request_hash BINARY(32) NULL,
  ADD COLUMN IF NOT EXISTS course_id VARCHAR(160) NULL,
  ADD COLUMN IF NOT EXISTS subject_ciphertext VARBINARY(1024) NULL,
  ADD COLUMN IF NOT EXISTS enquiry_session_hash BINARY(32) NULL,
  ADD COLUMN IF NOT EXISTS delivery_attempts INT UNSIGNED NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS next_delivery_at DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
  ADD COLUMN IF NOT EXISTS delivery_claim CHAR(36) CHARACTER SET ascii NULL,
  ADD COLUMN IF NOT EXISTS delivery_error_category VARCHAR(32) NULL,
  MODIFY message_ciphertext VARBINARY(16384) NOT NULL,
  MODIFY notification_status ENUM('pending','sending','notified','notification_failed') NOT NULL DEFAULT 'pending';
CREATE TABLE IF NOT EXISTS institute_enquiry_otp_locks (
  contact_hash BINARY(32) PRIMARY KEY
) ENGINE=InnoDB;

-- Old delivery outcomes need reconciliation before automatic retries are enabled.
UPDATE institute_course_enquiries SET next_delivery_at=NULL WHERE course_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_course_enquiry_due
  ON institute_course_enquiries (notification_status, next_delivery_at, submitted_at);
