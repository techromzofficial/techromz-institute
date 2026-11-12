import 'server-only';
import { isIP } from 'node:net';

export function isAllowedSensitiveRequest(request: Request, environment: NodeJS.ProcessEnv = process.env): boolean {
  return sensitiveRequestFailure(request, environment) === null;
}

// Return only fixed reason codes. Never log raw URLs, headers, or request bodies.
export function sensitiveRequestFailure(request: Request, environment: NodeJS.ProcessEnv = process.env): string | null {
  if (environment.NODE_ENV === 'production' && !isAllowedHostsConfigurationReady(environment)) return 'allowed_hosts_configuration';
  const url = new URL(request.url);
  const requestHost = request.headers.get('host')?.trim().toLowerCase();
  const allowed = configuredHosts(environment);

  // Validate the public Host against the server-configured allowlist.
  // The URL hostname may be rewritten by Hostinger's reverse proxy.
  const hostMatch = requestHost?.match(/^([a-z0-9.-]+)(?::[0-9]{1,5})?$/);

  if (!hostMatch || !allowed.has(hostMatch[1])) return 'hostname_not_allowed';
  if (environment.NODE_ENV === 'production' && requestHost !== hostMatch[1]) return 'hostname_not_allowed';
  if (environment.NODE_ENV !== 'production' && requestHost !== url.host.toLowerCase()) return 'host_url_mismatch';
  if (environment.NODE_ENV === 'production' && url.protocol !== 'https:') return 'https_required';
  const origin = request.headers.get('origin');
  if (!origin) return 'origin_missing';
  try {
    const parsed = new URL(origin);
    if (parsed.origin !== origin || parsed.host.toLowerCase() !== requestHost || parsed.protocol !== url.protocol) return 'origin_mismatch';
  } catch { return 'origin_invalid'; }
  const fetchSite = request.headers.get('sec-fetch-site');
  return !fetchSite || fetchSite === 'same-origin' ? null : 'cross_site_request';
}

function configuredHosts(environment: NodeJS.ProcessEnv): Set<string> {
  const hosts = new Set((environment.INSTITUTE_ALLOWED_HOSTS ?? '').split(',').map((value) => value.trim().toLowerCase()).filter((value) => /^[a-z0-9.-]+$/.test(value)));
  if (environment.NODE_ENV !== 'production') { hosts.add('localhost'); hosts.add('127.0.0.1'); }
  return hosts;
}

export function isAllowedHostsConfigurationReady(environment: NodeJS.ProcessEnv = process.env): boolean {
  const configured = (environment.INSTITUTE_ALLOWED_HOSTS ?? '').split(',').map((value) => value.trim()).filter(Boolean);
  return configured.length > 0 && configured.every((host) => /^[a-z0-9.-]+$/i.test(host) && !host.startsWith('.') && !host.endsWith('.'));
}

// Historical configuration name retained for compatibility. It is NOT proxy proof.
// Only use this caller-controlled hint for supplementary limits AFTER primary limits.
export function unverifiedClientIp(request: Request, environment: NodeJS.ProcessEnv = process.env): string | null {
  const header = environment.INSTITUTE_TRUSTED_CLIENT_IP_HEADER?.trim().toLowerCase();
  if (!header || !/^[a-z0-9-]+$/.test(header)) return null;
  const value = request.headers.get(header)?.trim();
  // No forwarded-chain splitting, fallback header selection, or identity assertion.
  if (!value || !isIP(value)) return null;
  return value.toLowerCase();
}
