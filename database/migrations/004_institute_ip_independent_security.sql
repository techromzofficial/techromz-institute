-- Phase 6: contact challenges no longer depend on a proxy-derived client IP.
ALTER TABLE institute_contact_verification_challenges
  MODIFY requested_network_hash BINARY(32) NULL;
