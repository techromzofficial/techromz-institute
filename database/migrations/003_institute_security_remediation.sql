-- Phase 3 security remediation. Additive migration; existing history is not rewritten.
CREATE TABLE IF NOT EXISTS institute_rate_limits (
  scope VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  subject_hash BINARY(32) NOT NULL,
  window_started_at DATETIME(6) NOT NULL,
  attempt_count SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  expires_at DATETIME(6) NOT NULL,
  PRIMARY KEY (scope, subject_hash),
  INDEX idx_rate_limit_expiry (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS institute_contact_verification_challenges (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  contact_type ENUM('email','phone') NOT NULL,
  contact_lookup_hash BINARY(32) NOT NULL,
  token_hash BINARY(32) NOT NULL,
  requested_network_hash BINARY(32) NOT NULL,
  failed_attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
  expires_at DATETIME(6) NOT NULL,
  consumed_at DATETIME(6) NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  INDEX idx_contact_challenge_lookup (contact_type, contact_lookup_hash, expires_at),
  INDEX idx_contact_challenge_expiry (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS institute_contact_verification_grants (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  contact_type ENUM('email','phone') NOT NULL,
  contact_lookup_hash BINARY(32) NOT NULL,
  grant_hash BINARY(32) NOT NULL UNIQUE,
  expires_at DATETIME(6) NOT NULL,
  consumed_at DATETIME(6) NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  INDEX idx_contact_grant_lookup (contact_type, contact_lookup_hash, expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
