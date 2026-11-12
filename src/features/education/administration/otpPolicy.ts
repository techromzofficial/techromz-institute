import 'server-only';

export function isOtpPolicyConfigurationReady(environment: NodeJS.ProcessEnv = process.env): boolean {
  try { readOtpPolicy(environment); return true; } catch { return false; }
}

// Bounds keep accidental configuration changes from weakening verification.
export function readOtpPolicy(environment: NodeJS.ProcessEnv = process.env) {
  function integer(key: string, fallback: number, maximum: number, minimum = 1) {
    const raw = environment[key];
    if (raw === undefined) return fallback;
    if (!/^\d+$/.test(raw)) throw new Error('INVALID_OTP_POLICY');
    const value = Number(raw);
    if (!Number.isSafeInteger(value) || value < minimum || value > maximum) throw new Error('INVALID_OTP_POLICY');
    return value;
  }
  return {
    expiryMinutes: integer('OTP_EXPIRY_MINUTES', 5, 10),
    maxAttempts: integer('OTP_MAX_ATTEMPTS', 5, 5),
    resendCooldownSeconds: integer('OTP_RESEND_COOLDOWN_SECONDS', 60, 900, 60),
  };
}
